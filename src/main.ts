import './style.css'
import RubicsCube, {defaultHovovingColors, defaultTexture, defaultUVs} from './RubicsCube'


defaultUVs[0][4] = [0, 0, 0, 1, 1, 1, 1, 0]

const rubicsCube = new RubicsCube(
  'data-rubics-cube',
  defaultTexture,
  defaultUVs,
  defaultHovovingColors
)

rubicsCube.start()