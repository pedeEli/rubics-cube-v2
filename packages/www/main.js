import './style.css'

import {RubiksCube, defaultHovorvingColors, defaultTexture, defaultUVs} from 'rubiks-cube-js'


const rubiksCube = new RubiksCube(
  'data-rubiks-cube',
  defaultTexture,
  defaultUVs,
  defaultHovorvingColors,
  false
)

const url = new URL(location.toString())
const state = url.searchParams.get('state')
if (state != null && !rubiksCube.setState(state)) {
  rubiksCube.reset()
  url.searchParams.delete('state')
  history.replaceState(null, '', url)
}

rubiksCube.on('change', event => {
  const url = new URL(location.toString())
  url.searchParams.set('state', event.state.toString())
  history.replaceState(null, '', url)
})

rubiksCube.start()

document.querySelector('[data-reset-state]')?.addEventListener('click', () => {
  rubiksCube.reset()
  const url = new URL(location.toString())
  url.searchParams.delete('state')
  history.replaceState(null, '', url)
})