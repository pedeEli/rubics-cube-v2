import {mod} from '../math/utils'

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
	 * @param {import('../ui/rubiks').Rubiks} rubiks
	 */
	applyState(uvs, rubiks) {
		for (let side = 0; side < 6; side++) {
			const uv = uvs[side][4]
			const offset = this.orientation[side] * 2
			const cubieIndex = orderIndexToCubieIndex[side]
			const facelet = rubiks.cubies[cubieIndex].getFaceletOfSide(side)
			facelet.uvs = []
			for (let i = 0; i < 8; i++) {
				facelet.uvs[i] = uv[mod(offset + i, 8)]
			}
		}
	}

	/** @returns {number[]} */
	encode() {
		let o = 0
		for (const orientation of this.orientation) {
			o = o << 2
			o += orientation
		}
		return [
      (o >> 0)  & 0b11111111,
      (o >> 8)  & 0b11111111
		]
	}

	/** @param {number[]} code */
	decode(code) {
		let o = code[0] + (code[1] << 8)
		for (let i = 5; i >= 0; i--) {
			this.orientation[i] = /** @type {CO} */ (o & 0b11)
			o = o >> 2
		}
	}
}