import './style.css'

import {RubicsCube, defaultHovorvingColors, defaultTexture, defaultUVs, State} from 'rubiks-cube-js'


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
  
  const state = new URL(location.toString()).searchParams.get('state')
  if (state != null) {
    rubicsCube.setState(state)
  }

  rubicsCube.on('state', state => {
    const url = new URL(location.toString())
    url.searchParams.set('state', state)
    history.replaceState(null, '', url)
  })

  rubicsCube.start()
})

document.querySelector('[data-reset-state]')?.addEventListener('click', () => {
  const url = new URL(location.toString())
  url.searchParams.delete('state')
  location.replace(url)
})

document.querySelector('[data-reload]')?.addEventListener('click', () => {
  location.reload()
})