import './style.css'
import RubicsCube from './RubicsCube'

const image = new ImageData(new Uint8ClampedArray([
    0,   0, 155, 255,     0,   0, 255, 255,
    0,   0, 255, 255,     0,   0, 255, 255,
    0, 155,   0, 255,     0, 255,   0, 255,
    0, 255,   0, 255,     0, 255,   0, 255,
  155, 155,   0, 255,   255, 255,   0, 255,
  255, 255,   0, 255,   255, 255,   0, 255,
  155, 155, 155, 255,   255, 255, 255, 255,
  255, 255, 255, 255,   255, 255, 255, 255,
  155,   0,   0, 255,   255,   0,   0, 255,
  255,   0,   0, 255,   255,   0,   0, 255,
  155,  77,   0, 255,   255, 127,   0, 255,
  255, 127,   0, 255,   255, 127,   0, 255,
]), 2, 12)

const uvs = Array(6).fill(null).map((_, index) => {
  return [
    0, (index + 0) / 6,
    1, (index + 0) / 6,
    1, (index + 1) / 6,
    0, (index + 1) / 6
  ]
})

const hovovingColors = Array(6).fill(Array(3).fill(.7))

const rubicsCube = new RubicsCube(
  'data-rubics-cube',
  image,
  uvs,
  hovovingColors
)

rubicsCube.start()