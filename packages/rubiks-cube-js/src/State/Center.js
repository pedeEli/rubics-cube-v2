import {mod} from '../Math/Utils'

/**
 * @typedef {import('./types').TurnBase} TurnBase
 * @typedef {import('./types').Turn} Turn
 * @typedef {import('./types').Center} C
 * @typedef {import('./types').CenterOrientation} CO
 * @typedef {[C, C, C, C, C, C]} Permutation
 * @typedef {[CO, CO, CO, CO, CO, CO]} Orientation
 */

/** @type {number[]} */
const orderIndexToCubieIndex = [
	12, 14, 10, 16, 4, 22
]

export class Centers {
	/** @type {Permutation} */
	static order = ['R', 'L', 'D', 'U', 'F', 'B']

	/** @type {Orientation} */
	orientation = [0, 0, 0, 0, 0, 0]

	/** @param {TurnBase} turn */
	applyTurn(turn) {
		const index = Centers.order.indexOf(turn)
		this.orientation[index] = /** @type {CO} */ (mod(this.orientation[index] + 1, 4))
	}

	/**
	 * @param {number[][][]} uvs
	 * @param {import('../UI/Rubics').Rubics} rubics
	 */
	applyState(uvs, rubics) {
		for (let side = 0; side < 6; side++) {
			const uv = uvs[side][4]
			const offset = this.orientation[side] * 2
			const cubieIndex = orderIndexToCubieIndex[side]
			const facelet = rubics.cubies[cubieIndex].getFaceletOfSide(side)
			facelet.uvs = []
			for (let i = 0; i < 8; i++) {
				facelet.uvs[i] = uv[mod(offset + i, 8)]
			}
		}
	}

	/** @returns {string} */
	stringify() {
		return this.orientation.join('.')
	}

	/**
	 * @param {string} str
	 * @returns {boolean}
	 */
	parse(str) {
		const parts = str.split('.').map(Number)
		if (parts.length !== 6) {
			return false
		}
		for (const part of parts) {
			if (part < 0 || part > 3) {
				return false
			}
		}
		this.orientation = /** @type {Orientation} */ (parts)
		return true
	}
}