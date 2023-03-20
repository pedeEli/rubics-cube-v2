export const mod = (a: number, b: number): number => {
  return  ((a % b) + b) % b
}

export const lerp = (a: number, b: number, t: number): number => {
  return a + (b - a) * t
}

export const clamp = (x: number, min: number, max: number): number => {
  return Math.min(Math.max(x, min), max)
}