import './style.css'
import RubicsCube, {defaultHovorvingColors} from './RubicsCube'


const image = new Image()
image.src = 'number.png'

const uvs = Array(6).fill(null).map((_, side) => {
  const bottom = 0.5 + Math.floor(side / 3) * 0.5
  const left = (side % 3) / 3
  return Array(9).fill(null).map((_, sideIndex) => {
    const b = bottom - (sideIndex % 3) / 6
    const t = b - 1 / 6
    const l = left + Math.floor(sideIndex / 3) / 9
    const r = l + 1 / 9

    return [
      l, b,
      r, b,
      r, t,
      l, t
    ]
  })
})

image.addEventListener('load', () => {
  const rubicsCube = new RubicsCube(
    'data-rubics-cube',
    image,
    uvs,
    defaultHovorvingColors
  )

  rubicsCube.start()
})
