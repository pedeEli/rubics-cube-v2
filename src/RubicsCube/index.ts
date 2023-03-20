import {RubicsCube} from './RubicsCube'

export default RubicsCube


export const defaultTexture = new ImageData(new Uint8ClampedArray([
  0,   0, 255, 255,
  0, 255,   0, 255,
255, 255,   0, 255,
255, 255, 255, 255,
255,   0,   0, 255,
255, 127,   0, 255
]), 1, 6)

export const defaultUVs = Array(6).fill(null).map((_, index) => {
  return Array(9).fill([
    0, (index + 0) / 6,
    1, (index + 0) / 6,
    1, (index + 1) / 6,
    0, (index + 1) / 6
  ])
})

export const defaultHovorvingColors = Array(6).fill(Array(3).fill(.7))