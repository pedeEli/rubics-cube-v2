import './style.css'
import RubicsCube, {defaultTexture, defaultUVs, defaultHovorvingColors} from './RubicsCube'

const rubicsCube = new RubicsCube(
  'data-rubics-cube',
  defaultTexture,
  defaultUVs,
  defaultHovorvingColors
)

rubicsCube.start()
