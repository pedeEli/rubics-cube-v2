import {V3} from '../math/vector'
import {Quaternion} from '../math/quarternion'

import {Facelet, FaceletTransform, InsideFacelet} from './facelet'
import {Transform} from './transform'


const positionForSide = [
  V3.right,
  V3.left,
  V3.down,
  V3.up,
  V3.back,
  V3.forward
].map(v => v.scale(0.5))

const rotationForSide = [
  Quaternion.identity,
  Quaternion.identity,
  Quaternion.fromAngle(V3.back, 90),
  Quaternion.fromAngle(V3.back, 90),
  Quaternion.fromAngle(V3.back, 90).mult(Quaternion.fromAngle(V3.down, 90)),
  Quaternion.fromAngle(V3.back, 90).mult(Quaternion.fromAngle(V3.down, 90))
]

/**
 * @param {number} side
 * @param {number} index
 * @returns {boolean}
 */
export const isInside = (side, index) => {
  const axis = Math.floor(side / 2)
  const invert = side % 2
  const coordinate = Math.floor(index / Math.pow(3, axis)) % 3
  return coordinate === 1
    || coordinate === 0 && invert === 1
    || coordinate === 2 && invert === 0
}

/**
 * @param {number} index
 * @returns {[x: number, y: number, z: number]}
 */
export const indexToPosition = index => {
  const x = Math.floor(index / 1) % 3
  const y = Math.floor(index / 3) % 3
  const z = Math.floor(index / 9) % 3
  return [x, y, z]
}

/**
 * @param {[x: number, y: number, z: number]} pos
 * @param {number} side
 * @param {number[][][]} uvs
 * @returns {number[]}
 */
export const positionToUvs = (pos, side, uvs) => {
  const axis = Math.floor(side / 2)
  /** @type {number[]} */
  const uvCoords = []
  for (let i = 0; i < 3; i++) {
    if (i !== axis) {
      uvCoords.push(pos[i])
    }
  }
  const sideIndex = uvCoords[0] + uvCoords[1] * 3
  return uvs[side][sideIndex]
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
    const pos = indexToPosition(index)
    const position = new V3(pos[0], pos[1], pos[2]).sub(V3.one)

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

      const uv = positionToUvs(pos, side, uvs)
      const transform = new FaceletTransform(position, rotation, this)
      const facelet = new Facelet(transform, side, uv, hoveringColors[side])
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
   * @param {import('./program').Program} program
   * @param {WebGL2RenderingContext} gl
   * @param {WebGLBuffer} uvsVbo
   */
  render(program, gl, uvsVbo) {
    this.transform.children.forEach(child => child.render.call(child, program, gl, uvsVbo))
  }
}