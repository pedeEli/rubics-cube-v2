import './style.css'

import {RubicsCube, defaultHovorvingColors, defaultTexture, defaultUVs, State} from 'rubiks-cube-js'


const rubicsCube = new RubicsCube(
  'data-rubics-cube',
  defaultTexture,
  defaultUVs,
  defaultHovorvingColors
)

rubicsCube.start()

const state = new State()
rubicsCube.on('turn', state.turnHandler)

state.on('change', state => {
  const url = new URL(location.toString())
  url.searchParams.set('state', state.stringify())
  history.replaceState(null, '', url)
})