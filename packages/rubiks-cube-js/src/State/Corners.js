import {V3} from '../Math/Vector'

/**
 * @typedef {import('./types').Turn} Turn
 * @typedef {import('./types').Corner} C
 * @typedef {import('./types').CornerOrientation} CO
 * @typedef {[C, C, C, C, C, C, C, C]} Permutation
 * @typedef {[CO, CO, CO, CO, CO, CO, CO, CO]} Orientation
 */

/** @satisfies {Record<Turn, Permutation>} */
const permutations = {
  R: ['DRF', 'ULF', 'ULB', 'URF', 'DRB', 'DLF', 'DLB', 'URB'],
  L: ['URF', 'ULB', 'DLB', 'URB', 'DRF', 'ULF', 'DLF', 'DRB'],
  U: ['URB', 'URF', 'ULF', 'ULB', 'DRF', 'DLF', 'DLB', 'DRB'],
  D: ['URF', 'ULF', 'ULB', 'URB', 'DLF', 'DLB', 'DRB', 'DRF'],
  F: ['ULF', 'DLF', 'ULB', 'URB', 'URF', 'DRF', 'DLB', 'DRB'],
  B: ['URF', 'ULF', 'URB', 'DRB', 'DRF', 'DLF', 'ULB', 'DLB']
}

/** @satisfies {Record<Turn, Orientation>} */
const orientations = {
  R: [2, 0, 0, 1, 1, 0, 0, 2],
  L: [0, 1, 2, 0, 0, 2, 1, 0],
  U: [0, 0, 0, 0, 0, 0, 0, 0],
  D: [0, 0, 0, 0, 0, 0, 0, 0],
  F: [1, 2, 0, 0, 2, 1, 0, 0],
  B: [0, 0, 1, 2, 0, 0, 2, 1]
}

export class Corners {
  static order = /** @type {Permutation} */ (['URF', 'ULF', 'ULB', 'URB', 'DRF', 'DLF', 'DLB', 'DRB'])

  permutation = /** @type {Permutation} */ ([...Corners.order])
  orientation = /** @type {Orientation} */ (Array(8).fill(0))

  /** @param {Turn} turn */
  apply(turn) {
    const appliedPermutation = permutations[turn]
    const appliedOrientation = orientations[turn]

    const permutation = [...this.permutation]
    const orientation = [...this.orientation]
    
    for (let i = 0; i < 8; i++) {
      const newPermutation = appliedPermutation[i]
      const orderIndex = Corners.order.indexOf(newPermutation)
      this.permutation[i] = permutation[orderIndex]
      const newOrientation = (appliedOrientation[i] + orientation[orderIndex]) % 3
      this.orientation[i] = /** @type {CO} */ (newOrientation)
    }
  }

  /** @param {C} corner */
  static cornerToPosition(corner) {
    return new V3(
      corner[1] === 'R' ? 0 : 2,
      corner[0] === 'D' ? 0 : 2,
      corner[2] === 'F' ? 0 : 2
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
    const permutation = Corners.#parsePermutation(p)
    if (permutation === null) {
      return
    }
    const orientation = Corners.#parseOrientation(o)
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
    if (parts.length !== 8) {
      return null
    }
    const check = Array(8).fill(false)
    for (let i = 0; i < 8; i++) {
      const index = Corners.order.indexOf(/** @type {C} */ (parts[i]))
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
    if (parts.length !== 8) {
      return null
    }
    let sum = 0
    for (let i = 0; i < 8; i++) {
      const part = parts[i]
      if (part < 0 || part > 2) {
        return null
      }
      sum += part
    }
    if (sum % 3 !== 0) {
      return null
    }
    return /** @type {Orientation} */ (parts)
  }
}