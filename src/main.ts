import './style.css'
import RubicsCube, {defaultHovovingColors, defaultTexture, defaultUVs} from './RubicsCube'



const rubicsCube = new RubicsCube(
  'data-rubics-cube',
  defaultTexture,
  defaultUVs,
  defaultHovovingColors
)

rubicsCube.start()