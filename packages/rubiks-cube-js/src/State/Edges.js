import {V3} from '../Math/Vector'

/**
 * @typedef {import('./types').Turn} Turn
 * @typedef {import('./types').Edge} E
 * @typedef {import('./types').EdgeOrientation} EO
 * @typedef {[E, E, E, E, E, E, E, E, E, E, E, E]} Permutation
 * @typedef {[EO, EO, EO, EO, EO, EO, EO, EO, EO, EO, EO, EO]} Orientation
 */

/** @satisfies {Record<Turn, Permutation>} */
const permutations = {
  R: ['UF', 'UL', 'UB', 'FR', 'DR', 'FL', 'BL', 'UR', 'DF', 'DL', 'DB', 'BR'],
  L: ['UF', 'BL', 'UB', 'UR', 'FR', 'UL', 'DL', 'BR', 'DF', 'FL', 'DB', 'DR'],
  U: ['UR', 'UF', 'UL', 'UB', 'FR', 'FL', 'BL', 'BR', 'DF', 'DL', 'DB', 'DR'],
  D: ['UF', 'UL', 'UB', 'UR', 'FR', 'FL', 'BL', 'BR', 'DL', 'DB', 'DR', 'DF'],
  F: ['FL', 'UL', 'UB', 'UR', 'UF', 'DF', 'BL', 'BR', 'FR', 'DL', 'DB', 'DR'],
  B: ['UF', 'UL', 'BR', 'UR', 'FR', 'FL', 'UB', 'DB', 'DF', 'DL', 'BL', 'DR']
}

/** @satisfies {Record<Turn, Orientation>} */
const orientations = {
  R: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  L: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  U: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  D: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  F: [1, 0, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0],
  B: [0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 1, 0]
}

export class Edges {
  static order = /** @type {Permutation} */ (['UF', 'UL', 'UB', 'UR', 'FR', 'FL', 'BL', 'BR', 'DF', 'DL', 'DB', 'DR'])

  permutation = /** @type {Permutation} */ ([...Edges.order])
  orientation = /** @type {Orientation} */ (Array(12).fill(0))

  /** @param {Turn} turn */
  apply(turn) {
    const appliedPermutation = permutations[turn]
    const appliedOrientation = orientations[turn]

    const permutation = [...this.permutation]
    const orientation = [...this.orientation]

    for (let i = 0; i < 12; i++) {
      const newPermutation = appliedPermutation[i]
      const orderIndex = Edges.order.indexOf(newPermutation)
      this.permutation[i] = permutation[orderIndex]
      const newOrientation = (appliedOrientation[i] + orientation[orderIndex]) % 2
      this.orientation[i] = /** @type {EO} */ (newOrientation)
    }
  }

  /** @param {E} edge */
  static edgeToPosition(edge) {
    return new V3(
      edge[1] === 'R' ? 0 : edge[1] === 'L' ? 2 : 1,
      edge[0] === 'D' ? 0 : edge[0] === 'U' ? 2 : 1,
      edge[0] === 'F' || edge[1] === 'F' ? 0 : edge[0] === 'B' || edge[0] === 'B' ? 2 : 1
    )
  }

  stringify() {
    const permutation = this.permutation.join('.')
    const orientation = this.orientation.join('.')
    return `${permutation}_${orientation}`
  }

  /** @param {string} str */
  parse(str) {
    const [p, o] = str.split('_')
    const permutation = Edges.#parsePermutation(p)
    if (permutation === null) {
      return
    }
    const orientation = Edges.#parseOrientation(o)
    if (orientation === null) {
      return
    }
    this.permutation = permutation
    this.orientation = orientation
  }

  /**
   * @param {string} str
   * @returns {Permutation | null}
   */
  static #parsePermutation(str) {
    const parts = str.split('.')
    if (parts.length !== 12) {
      return null
    }
    const check = Array(12).fill(false)
    for (let i = 0; i < 12; i++) {
      const index = Edges.order.indexOf(/** @type {E} */(parts[i]))
      if (index === -1 || check[index]) {
        return null
      }
      check[index] = true
    }
    return /** @type {Permutation} */ (parts)
  }
  /**
   * @param {string} str
   * @returns {Orientation | null}
   */
  static #parseOrientation(str) {
    const parts = str.split('.').map(Number)
    if (parts.length !== 12) {
      return null
    }
    let sum = 0
    for (let i = 0; i < 12; i++) {
      const part = parts[i]
      if (part < 0 || part > 1) {
        return null
      }
      sum += part
    }
    if (sum % 2 !== 0) {
      return null
    }
    return /** @type {Orientation} */ (parts)
  }
}