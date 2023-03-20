import {V3} from '../Math/Vector'
import {Quaternion} from '../Math/Quarternion'
import {Program} from './Program'

import {Facelet} from './Facelet'
import {Transform} from './Transform'
import {Rubics} from './Rubics'
import {FaceletTransform, InsideFacelet} from './Facelet'


const positionForSide = [
  V3.right,
  V3.left,
  V3.down,
  V3.up,
  V3.back,
  V3.forward
].map(v => v.scale(0.5))

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
      const position = positionForSide[side]//getPositionFromSide(side)
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