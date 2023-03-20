import {V3} from '../Math/Vector'
import {Quaternion} from '../Math/Quarternion'
import {Program} from './Program'

import {Facelet} from './Facelet'
import {Transform} from './Transform'
import {Rubics} from './Rubics'
import {FaceletTransform, InsideFacelet} from './Facelet'

// const colors = [
//   new V3(1, 1, 1),
//   new V3(1, 1, 0),
//   new V3(1, 0, 0),
//   new V3(1, .5, 0),
//   new V3(0, 1, 0),
//   new V3(0, 0, 1)
// ]

// const hovovingColors = [
//   new V3(.7, .7, .7),
//   new V3(.7, .7, 0),
//   new V3(.7, 0, 0),
//   new V3(.7, .3, 0),
//   new V3(0, .7, 0),
//   new V3(0, 0, .7)
// ]

const getPositionFromSide = (side: number): V3 => {
  const axis = Math.floor(side / 2)
  const vector = V3.getRotationAxis(axis)
  const invert = side % 2
  return vector.scale(.5 - invert)
}

const rotationForSide = [
  Quaternion.fromAngle(V3.right, 180),
  Quaternion.fromAngle(V3.down.add(V3.back), 180),
  Quaternion.fromAngle(V3.up, 180).mult(Quaternion.fromAngle(V3.forward, 90)),
  Quaternion.fromAngle(V3.forward.add(V3.right), 180).mult(Quaternion.fromAngle(V3.forward, 90)),
  Quaternion.fromAngle(V3.down.add(V3.right), 180).mult(Quaternion.fromAngle(V3.up, 90)),
  Quaternion.fromAngle(V3.back, 180).mult(Quaternion.fromAngle(V3.up, 90))
]

const isInside = (side: number, index: number): boolean => {
  const axis = Math.floor(side / 2)
  const invert = side % 2
  const coordinate = Math.floor(index / Math.pow(3, axis)) % 3
  return coordinate === 1
    || coordinate === 0 && invert === 1
    || coordinate === 2 && invert === 0
}


export class Cubie {
  public facelets: Facelet[] = []
  public transform: Transform<Facelet | InsideFacelet, Rubics>

  public constructor(
    position: V3,
    rotation: Quaternion,
    public index: number,
    uvs: number[][],
    hoveringColors: V3[],
    parent: Rubics
  ) {
    this.transform = new Transform(position, rotation, parent)
    for (let side = 0; side < 6; side++) {
      const inside = isInside(side, this.index)
      const position = getPositionFromSide(side)
      const rotation = rotationForSide[side]

      if (inside) {
        const transform = new Transform(position, rotation, this)
        const facelet = new InsideFacelet(transform)
        this.transform.children.push(facelet)
        continue
      }

      const transform = new FaceletTransform(position, rotation, this)
      const facelet = new Facelet(transform, side, uvs[side], hoveringColors[side])
      this.transform.children.push(facelet)
      this.facelets.push(facelet)
    }
  }

  public getFaceletOfSide(side: number) {
    return this.facelets.find(facelet => facelet.side === side)!
  }

  public render(program: Program, gl: WebGL2RenderingContext, uvsVbo: WebGLBuffer) {
    this.transform.children.forEach(child => child.render.call(child, program, gl, uvsVbo))
  }
}