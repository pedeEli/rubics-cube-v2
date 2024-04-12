/**
 * @param {number} a
 * @param {number} b
 * @returns {number}
 */
export const mod = (a, b) => {
  return  ((a % b) + b) % b
}

/**
 * @param {number} a
 * @param {number} b
 * @param {number} t
 * @returns {number}
 */
export const lerp = (a, b, t) => {
  return a + (b - a) * t
}

/**
 * @param {number} x
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export const clamp = (x, min, max) => {
  return Math.min(Math.max(x, min), max)
}