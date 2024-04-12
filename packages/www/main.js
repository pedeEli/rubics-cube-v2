import './style.css'

import {RubiksCube, defaultHovorvingColors, defaultTexture, defaultUVs} from 'rubiks-cube-js'


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
  const rubiksCube = new RubiksCube(
    'data-rubiks-cube',
    image,
    uvs,
    defaultHovorvingColors,
    true
  )
  
  const state = new URL(location.toString()).searchParams.get('state')
  if (state != null) {
    rubiksCube.setState(state)
  }

  rubiksCube.on('change', event => {
    const url = new URL(location.toString())
    url.searchParams.set('state', event.state.toString())
    history.replaceState(null, '', url)
  })

  rubiksCube.start()
})

document.querySelector('[data-reset-state]')?.addEventListener('click', () => {
  const url = new URL(location.toString())
  url.searchParams.delete('state')
  location.replace(url)
})

document.querySelector('[data-reload]')?.addEventListener('click', () => {
  location.reload()
})