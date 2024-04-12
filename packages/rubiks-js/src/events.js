export class ChangeEvent {
	/**
	 * Axis that was turned around
	 * 
	 * 0 => x-axis (from right to left)
	 * 
	 * 1 => y-axis (from bottom to top)
	 * 
	 * 2 => z-axis (from front to back)
	 * @type {0 | 1 | 2}
	 */
	axis
	/**
	 * The slice on the axis. Example using axis = 0:
	 * 
	 * 0 => Left slice
	 * 
	 * 2 => Right slice
	 * 
	 * The middle layer is never turned. Instead both outer layers are turn
	 * in the opposite direction. This has the same effect.
	 * That way the centers always stay in the same position.
	 * @type {0 | 2}
	 */
	index
	/**
	 * Important: The angle is always clockwise around the axis and not
	 * clockwise around the turning side. This means that R and L' both
	 * have an angle of 1
	 * @type {1 | 2 | 3}
	 */
	angle
	/**
	 * @type {import('./state/types').Turn}
	 */
	turn
	/**
	 * @type {import('./state').StateInfo}
	 */
	state

	/**
	 * @param {number} axis
	 * @param {number} index
	 * @param {number} angle
	 * @param {import('./state/types').Turn} turn
	 * @param {import('./state').StateInfo} state
	 */
	constructor(axis, index, angle, turn, state) {
		this.axis = /** @type {0 | 1 | 2} */ (axis)
		this.index = /** @type {0 | 2} */ (index)
		this.angle = /** @type {1 | 2 | 3} */ (angle)
		this.turn = turn
		this.state = state
	}
}