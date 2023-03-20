# Rubics Cube for the web

This library can be used to embed a rubics cube into any website.
It is pure js and does not use any libraries.

## Usage

First install
```
npm install rubics-cube
```

then create a rubics cube and start it
```typescript
import RubicsCube, {defaultTexture, defaultUVs, defaultHoveringColors} from 'rubics-cube'

const rubicsCube = new RubicsCube(
  attributeName,
  defaultTexture,
  defaultUVs,
  defaultHoveringColors
)
rubicsCube.start()
```
webgl is automaticly instanciated when first calling ```start()```.

### `attributeName`
Specifies the data attribute on the canvas
```html
<canvas data-rubics-cube></canvas>
<!-- attributeName = 'data-rubics-cube' -->
```

### `texture`
Specifies how the cube faces look. Can be used to have pictures instead of plane color

### `uvs`
Specifies which face uses which part of the texture. 

### `hoveringColors`
Specifies a red, green and blue channel by which the colors of a face is multiplied when hovering over it