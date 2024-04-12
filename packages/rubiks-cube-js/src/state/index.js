import {Corners} from './corners'
import {Edges} from './edges'
import {Centers} from './centers'
import {convertTurnToTurnBase, convertTurnToAia} from '../converter'
import {uvsTransformerPresets, cubiesShiftMapper, sidesShiftMapper} from '../ui/uvs'
import {isInside, indexToPosition, positionToUvs} from '../ui/cubie'
import {mod} from '../math/utils'

/**
 * @typedef {import('./types').Turn} Turn
 * @typedef {import('./types').TurnBase} TurnBase
 * @typedef {import('./types').Corner} Corner
 */

export class State {
  #corners = new Corners()
  #edges = new Edges()
  #centers = new Centers()
  /** @type {boolean} */
  #trackCenters
  
  stateInfo = new StateInfo(this)

  /** @param {boolean} trackCenters */
  constructor(trackCenters) {
    this.#trackCenters = trackCenters
  }

  /** @param {Turn} turn */
  applyTurn(turn) {
    const baseTurns = convertTurnToTurnBase(turn)
    for (const base of baseTurns) {
      this.#corners.applyTurn(base)
      this.#edges.applyTurn(base)
      if (this.#trackCenters) {
        this.#centers.applyTurn(base)
      }
    }
  }

  /**
   * @param {number[][][]} uvs
   * @param {import('../ui/rubiks').Rubiks} rubiks
   */
  applyState(uvs, rubiks) {
    this.#corners.applyState(uvs, rubiks)
    this.#edges.applyState(uvs, rubiks)
    if (this.#trackCenters) {
      this.#centers.applyState(uvs, rubiks)
    }
  }

  /** @returns {string} */
  encode() {
    /** @type {number[]} */
    const code = []
    code.push(...this.#corners.encode())
    code.push(...this.#edges.encode())
    if (this.#trackCenters) {
      code.push(...this.#centers.encode())
    }
    const array = new Uint8Array(code)
    return btoa(String.fromCharCode(...array))
  }

  /**
   * @param {string} str
   * @returns {boolean}
   */
  decode(str) {
    const data = atob(str)
    if (data.length !== (this.#trackCenters ? 15 : 13)) {
      return false
    }
    
    /** @type {number[]} */
    const code = []
    for (let i = 0; i < data.length; i++) {
      code.push(data.charCodeAt(i))
    }

    const corners = this.#corners
    /** @type {typeof corners['permutation']} */
    const cp = [...corners.permutation]
    /** @type {typeof corners['orientation']} */
    const co = [...corners.orientation]

    if (!corners.decode(code.slice(0, 5))) {
      corners.permutation = cp
      corners.orientation = co
      return false
    }

    const edges = this.#edges
    /** @type {typeof edges['permutation']} */
    const ep = [...edges.permutation]
    /** @type {typeof edges['orientation']} */
    const eo = [...edges.orientation]

    if (!edges.decode(code.slice(5, 13))) {
      corners.permutation = cp
      corners.orientation = co
      edges.permutation = ep
      edges.orientation = eo
      return false
    }

    if (this.#trackCenters) {
      this.#centers.decode(code.slice(13))
    }

    return true
  }

  reset() {
    this.#corners.reset()
    this.#edges.reset()
    this.#centers.reset()
  }
}

export class StateInfo {
  /** @type {State} */
  #state

  /** @param {State} state */
  constructor(state) {
    this.#state = state
  }

  /** @returns {string} */
  toString() {
    return this.#state.encode()
  }
}

/**
 * `uvsTransformers[axis][side][angle]`
 * @type {Record<number, Record<number, Record<number, (uvs: number[]) => number[]>>>}
 */
const uvsTransformers = {
  0: {
    0: uvsTransformerPresets.rcR2Rcc,
    1: uvsTransformerPresets.rcR2Rcc,
    2: uvsTransformerPresets.flipV12,
    3: uvsTransformerPresets.flipV12,
    4: uvsTransformerPresets.flipV23,
    5: uvsTransformerPresets.flipV23
  },
  1: {
    0: uvsTransformerPresets.rcFvRcfh,
    1: uvsTransformerPresets.rcFvRcfh,
    2: uvsTransformerPresets.rcR2Rcc,
    3: uvsTransformerPresets.rcR2Rcc,
    4: uvsTransformerPresets.rcfhFhRcc,
    5: uvsTransformerPresets.rcfhFhRcc
  },
  2: {
    0: uvsTransformerPresets.flipH12,
    1: uvsTransformerPresets.flipH12,
    2: uvsTransformerPresets.flipH23,
    3: uvsTransformerPresets.flipH23,
    4: uvsTransformerPresets.rcR2Rcc,
    5: uvsTransformerPresets.rcR2Rcc
  }
}

/**
 * @param {number} originIndex
 * @param {number[][][]} uvs
 * @returns {Record<number, number[]>}
 */
export const createSideToUvs = (originIndex, uvs) => {
  const pos = indexToPosition(originIndex)

  /** @type {Record<number, number[]>} */
  const sideToUvs = {}

  // populate sideToUvs
  for (let side = 0; side < 6; side++) {
    const inside = isInside(side, originIndex)
    if (inside) {
      continue
    }
    sideToUvs[side] = positionToUvs(pos, side, uvs)
  }

  return sideToUvs
}

/**
 * @param {Turn[]} turns
 * @param {number} originIndex
 * @param {Record<number, number[]>} sideToUvs
 * @returns {Record<number, number[]>}
 */
export const transformSidetoUvs = (originIndex, sideToUvs, turns) => {
  for (const turn of turns) {
    let {axis, index, angle} = convertTurnToAia(turn)
    const innerSide = axis * 2 + Math.sign(index)

    /** @type {Record<number, number[]>} */
    const newSideToUvs = {}
    for (const [sideStr, uvs] of Object.entries(sideToUvs)) {
      const side = parseInt(sideStr)
      const transformer = uvsTransformers[axis][side][angle]

      if (side === innerSide) {
        newSideToUvs[innerSide] = transformer(uvs)
        continue
      }

      const sideIndex = sidesShiftMapper[axis].indexOf(side)
      const newSide = sidesShiftMapper[axis][mod(sideIndex - angle, 4)]
      newSideToUvs[newSide] = transformer(uvs)
    }

    const mapperIndex = cubiesShiftMapper[axis][index].indexOf(originIndex)
    originIndex = cubiesShiftMapper[axis][index][mod(mapperIndex + angle * 2, 8)]
    sideToUvs = newSideToUvs
  }

  return sideToUvs
}

/**
 * @param {number} targetIndex
 * @param {import('../ui/rubiks').Rubiks} rubiks
 * @param {Record<number, number[]>} sideToUvs
 */
export const setUvs = (targetIndex, rubiks, sideToUvs) => {
  const cubie = rubiks.cubies[targetIndex]
  for (const facelet of cubie.facelets) {
    facelet.uvs = sideToUvs[facelet.side]
  }
}