import {V3} from '../Math/Vector'
import {Quaternion} from '../Math/Quarternion'

import {Facelet, FaceletTransform, InsideFacelet} from './Facelet'
import {Transform} from './Transform'


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

/**
 * @param {number} side
 * @param {number} index
 * @returns {boolean}
 */
const isInside = (side, index) => {
  const axis = Math.floor(side / 2)
  const invert = side % 2
  const coordinate = Math.floor(index / Math.pow(3, axis)) % 3
  return coordinate === 1
    || coordinate === 0 && invert === 1
    || coordinate === 2 && invert === 0
}


export class Cubie {
  /** @type {Facelet[]} */
  facelets = []
  /** @type {Transform<Facelet | InsideFacelet, import('./Rubics').Rubics>} */
  transform

  /**
   * @param {number} index
   * @param {number[][][]} uvs
   * @param {V3[]} hoveringColors
   * @param {import('./Rubics').Rubics} parent
   */
  constructor(index, uvs, hoveringColors, parent) {
    this.index = index
    const x = Math.floor(index / 1) % 3
    const y = Math.floor(index / 3) % 3
    const z = Math.floor(index / 9) % 3
    const position = new V3(x, y, z).sub(V3.one)

    this.transform = new Transform(position, Quaternion.identity, parent)
    for (let side = 0; side < 6; side++) {
      const inside = isInside(side, this.index)
      const position = positionForSide[side]
      const rotation = rotationForSide[side]

      if (inside) {
        const transform = new Transform(position, rotation, this)
        const facelet = new InsideFacelet(transform)
        this.transform.children.push(facelet)
        continue
      }

      const [u, v] = [x, y, z].filter((_, index) => index !== Math.floor(side / 2))
      const sideIndex = v * 3 + u

      const transform = new FaceletTransform(position, rotation, this)
      const facelet = new Facelet(transform, side, uvs[side][sideIndex], hoveringColors[side])
      this.transform.children.push(facelet)
      this.facelets.push(facelet)
    }
  }

  /**
   * @param {number} side
   * @returns {Facelet}
   */
  getFaceletOfSide(side) {
    return /** @type {Facelet} */ (this.facelets.find(facelet => facelet.side === side))
  }

  /**
   * @param {import('./Program').Program} program
   * @param {WebGL2RenderingContext} gl
   * @param {WebGLBuffer} uvsVbo
   */
  render(program, gl, uvsVbo) {
    this.transform.children.forEach(child => child.render.call(child, program, gl, uvsVbo))
  }
}