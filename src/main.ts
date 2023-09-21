import './style.css'
import RubicsCube, {defaultTexture, defaultUVs, defaultHovorvingColors} from './RubicsCube'
import {State, type Turn} from './RubicsCube/State'
import {mod} from './RubicsCube/Math/Utils'

const rubicsCube = new RubicsCube(
  'data-rubics-cube',
  defaultTexture,
  defaultUVs,
  defaultHovorvingColors
)

rubicsCube.start()


const state = new State()

const convertEventToTurns = (axis: number, index: number, angle: number): Turn[] => {
  if (axis === 0) {
    return convertIndexToTurns('R', 'L', index, angle)
  } else if (axis === 1) {
    return convertIndexToTurns('D', 'U', index, angle, true)
  } else if (axis === 2) {
    return convertIndexToTurns('F', 'B', index, angle)
  } else {
    throw new Error(`invalid axis ${axis}`)
  }
}
const convertIndexToTurns = (a: Turn , b: Turn, index: number, angle: number, invert = false): Turn[] => {
  if (index === 0) {
    return convertAngleToTurns(a, angle, invert)
  } else if (index === 1) {
    return convertAngleToTurns(a, angle, !invert).concat(...convertAngleToTurns(b, angle, invert))
  } else if (index === 2) {
    return convertAngleToTurns(b, angle, !invert)
  } else {
    throw new Error(`invalid index ${index}`)
  }
}
const convertAngleToTurns = (a: Turn, angle: number, prime: boolean): Turn[] => {
  return Array(prime ? 4 - angle : angle).fill(a)
}

rubicsCube.on('turn', event => {
  const angle = mod(event.angle, 4)
  if (angle === 0) {
    return
  }
  const turns = convertEventToTurns(event.axis, event.index, angle)
  turns.forEach(turn => state.apply(turn))

  const url = new URL(location.toString())
  url.searchParams.set('state', state.stringify())
  history.replaceState(null, '', url)
})