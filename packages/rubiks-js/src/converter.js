/**
 * @typedef {import('./types').AIA} AIA
 * @typedef {import('./state/types').TurnBase} TurnBase
 * @typedef {import('./state/types').Turn} Turn
 */

/** @type {[a: TurnBase, b: TurnBase, invert: boolean][]} */
const axisToTurn = [
	['R', 'L', false],
	['D', 'U', true],
	['F', 'B', false]
]

/**
 * @param {AIA} aia
 * @returns {Turn}
 */
export const convertAiaToTurn = (aia) => {
	if (aia.index === 1) {
		throw new Error('Cannot convert middle turns')
	}

	let [a, b, invert] = axisToTurn[aia.axis]
	
	const turn = aia.index === 0 ? a : b

	if (aia.angle === 2) {
		return `${turn}2`
	}
	
	if (aia.index === 2) {
		invert = !invert
	}

	if (aia.angle === 3 && !invert || aia.angle === 1 && invert) {
		return `${turn}'`
	}

	return turn
}

/** @type {Record<TurnBase, [axis: number, index: number, invert: boolean]>} */
const turnToAia = {
	R: [0, 0, false],
	L: [0, 2, false],
	D: [1, 0, true],
	U: [1, 2, true],
	F: [2, 0, false],
	B: [2, 2, false]
}

/**
 * @param {Turn} turn
 * @returns {AIA}
 */
export const convertTurnToAia = (turn) => {
	const base = /** @type {TurnBase} */ (turn[0])

	const [axis, index, invert] = turnToAia[base]

	if (turn.endsWith('2')) {
		return {axis, index, angle: 2}
	}

	let prime = turn.endsWith('\'')
	if (invert) {
		prime = !prime
	}

	let angle = 3
	if (index === 0 && !prime || index === 2 && prime) {
		angle = 1
	}
	return {axis, index, angle}
}


/**
 * @param {Turn} turn
 * @returns {TurnBase[]}
 */
export const convertTurnToTurnBase = turn => {
  const base = /** @type {TurnBase} */ (turn[0])
  if (turn.endsWith('2')) {
    return [base, base]
  }
  if (turn.endsWith('\'')) {
    return [base, base, base]
  }
  return [base]
}