import {Corners} from './Corners'
import {Edges} from './Edges'
import {mod} from '../Math/Utils'

/**
 * @typedef {import('./types').Turn} Turn
 * @typedef {import('./types').Events} Events
 */

export class State {
  corners = new Corners()
  edges = new Edges()

  /** @param {import('./types').Turn} turn */
  apply(turn) {
    this.corners.apply(turn)
    this.edges.apply(turn)
  }

  stringify() {
    const corners = this.corners.stringify()
    const edges = this.edges.stringify()
    return `${corners}-${edges}`
  }

  /** @param {string} str */
  parse(str) {
    const [corners, edges] = str.split('-')
    this.corners.parse(corners)
    this.edges.parse(edges)
  }

  turnHandler = State.#getTurnHandler(this)
  /** @param {State} state */
  static #getTurnHandler(state) {
    /** @param {import('../types').Events['turn']} event */
    return (event) => {
      const angle = mod(event.angle, 4)
      if (angle === 0) {
        return
      }
      const turns = State.#convertEventToTurns(event.axis, event.index, angle)
      turns.forEach(turn => state.apply(turn))
    
      state.#changeHandler()
    }
  }

  /**
   * @param {number} axis
   * @param {number} index
   * @param {number} angle
   * @returns {Turn[]}
   */
  static #convertEventToTurns(axis, index, angle) {
    if (axis === 0) {
      return State.#convertIndexToTurns('R', 'L', index, angle)
    } else if (axis === 1) {
      return State.#convertIndexToTurns('D', 'U', index, angle, true)
    } else if (axis === 2) {
      return State.#convertIndexToTurns('F', 'B', index, angle)
    } else {
      throw new Error(`invalid axis ${axis}`)
    }
  }

  /**
   * @param {Turn} a
   * @param {Turn} b
   * @param {number} index
   * @param {number} angle
   * @param {boolean} [invert=false]
   * @returns {Turn[]}
   */
  static #convertIndexToTurns(a, b, index, angle, invert = false) {
    if (index === 0) {
      return State.#convertAngleToTurns(a, angle, invert)
    } else if (index === 1) {
      return State.#convertAngleToTurns(a, angle, !invert).concat(...State.#convertAngleToTurns(b, angle, invert))
    } else if (index === 2) {
      return State.#convertAngleToTurns(b, angle, !invert)
    } else {
      throw new Error(`invalid index ${index}`)
    }
  }

  /**
   * @param {Turn} a
   * @param {number} angle
   * @param {boolean} prime
   * @returns {Turn[]}
   */
  static #convertAngleToTurns(a, angle, prime) {
    return Array(prime ? 4 - angle : angle).fill(a)
  }

  /** @type {Map<keyof Events, Set<(event: any) => void>>} */
  #listeners = new Map()
  /**
   * @template {keyof Events} Name
   * @param {Name} name
   * @param {(event: Events[Name]) => void} callback
   */
  on(name, callback) {
    const set = this.#listeners.get(name) ?? new Set()
    set.add(callback)
    this.#listeners.set(name, set)
  }
  #changeHandler() {
    const set = this.#listeners.get('change')
    if (set) {
      set.forEach(callback => callback(this))
    }
  }
}