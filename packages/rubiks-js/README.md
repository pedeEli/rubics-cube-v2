# Rubiks Cube for the web

This library can be used to embed a rubiks cube into any website. Supports mouse and touch, is pure js typed with jsdoc and does not use any libraries.

## Usage

First install
```
npm install rubiks
```

then create a rubiks cube and start it
```javascript
import {RubiksCube, defaultTexture, defaultUVs, defaultHoveringColors} from 'rubiks-js'

const rubiksCube = new RubiksCube(
  attributeName,
  defaultTexture,
  defaultUVs,
  defaultHoveringColors,
  trackCenters
)
rubiksCube.start()
```
webgl is automaticly instanciated when first calling `start()`.

### `attributeName`
Specifies the data attribute on the canvas
```html
<canvas data-rubiks-cube></canvas>
<!-- attributeName = 'data-rubiks-cube' -->
```

### `texture`
Specifies how the sides of the cube look. Can be used to have pictures instead of plane colors.

### `uvs`
Specifies which sticker (facelet) uses which part of the [texture](#texture) and is a 3 dimensional number array. The first dimension corresponds to a side. This means the indices should range from 0 to 5. Detailed description for side indices can be found [here](#side). The second dimension corresponds to one of the nine facelets on a side and should be between 0 and 8. A detailed description for facelet indices can be found [here](#facelet). The last dimenstion is the actual coordinate values and should consist of 4 consecutive x and y pairs. The order of these pairs is important and should either be clockwise or anticlockwise depending on the texture. You may have to experiment.

### `hoveringColors`
Specifies a red, green and blue channel by which the colors of a side is multiplied when hovering over it.

### `trackCenters`
This is only usefull when using images. It is a boolean and if set to `true` the rotation
of all 6 centers is included in the [state](#state).


## State
This library has a simple way of tracking the current state of the cube.
Below is an example of how to store the state inside the url.

### `rubiks.on()`
```javascript
const url = new URL(location.toString())
const state = url.searchParams.get('state')
if (state != null) {
  rubiksCube.setState(state)
}

rubiksCube.on('change', event => {
  const url = new URL(location.toString())
  url.searchParams.set('state', event.state.toString())
  history.replaceState(null, '', url)
})
rubiksCube.start()
```
`rubiksCube.setState` returns `true` if the state was parsed correctly and `false`
if there was an error.

### `rubiks.reset()`
Resets the state of the cube.


## Indices
Indices have the following order: (brackets use default values)
- First from right (blue) to left (green)
- Then from bottom (yellow) to top (white)
- Then from front (red) to back (orange)
### Side
| Side | Index |
| --- | --- |
| right | 0 |
| left | 1 |
| bottom | 2 |
| top | 3 |
| front | 4 |
| back | 5 |

### Facelet
This is a bit more complicated to explain. The indices follow the same [rule](#indices) as the [sides](#side). For example if you look at the front side without moving the cube index 0 would be the bottom right facelet and index 1 would be 1 to the left. Thats because the indices go first from left to right and the from bottom to top. This means index 0, 1 and 2 are the bottom row, 3, 4 and 5 the row above and so on. And remember always from left to right. In this example we were able to ignore the third [index rule](#indices) because these facelets where pointed at the front so it doesn't make sense to use this rule. Following the same logic we can always ignore on rule when figuring the facelet indices out.

If you want a visual way to see all indices use the following code and copy the [numbers.png](https://github.com/pedeEli/rubiks-cube-v2/blob/main/number.png) image to your source files
```javascript
import {RubiksCube, defaultHovorvingColors} from 'rubiks-js'

const image = new Image()
image.src = 'number.png' // or 'https://raw.githubusercontent.com/pedeEli/rubiks-cube-v2/main/number.png'

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

  rubiksCube.start()
})

```