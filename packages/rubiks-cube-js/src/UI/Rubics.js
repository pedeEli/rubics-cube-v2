import {V3} from '../Math/Vector'
import {Quaternion} from '../Math/Quarternion'
import {lerp, mod} from '../Math/Utils'

import {Cubie} from './Cubie'
import {Transform} from './Transform'

const rotationAxis = ([0, 1, 2]).map(axis => V3.getRotationAxis(axis))

/**
 * @extends {Transform<Cubie, null>}
 */
export class RubicsTransform extends Transform {
  /** @type {[V3, V3, V3]} */
  rotationAxis

  /**
   * @param {V3} position
   * @param {Quaternion} rotation
   */
  constructor(position, rotation) {
    super(position, rotation, null)
    this.setTransforms()
  }

  /** @property */
  setTransforms() {
    super.setTransforms()

    this.rotationAxis = /** @type {[V3, V3, V3]} */ (rotationAxis
      .map(axis => {
        return this.apply(axis)
      }))
  }
}

/** @typedef {(event: {axis: number, angle: number, index: number}) => void} TurnCallback */

export class Rubics {
  /** @type {RubicsTransform} */
  transform
  /** @type {Cubie[]} */
  cubies
  /** @type {TurnCallback} */
  #turnCallback

  /**
   * @param {Quaternion} rotation
   * @param {number[][][]} uvs
   * @param {V3[]} hoveringColors
   * @param {TurnCallback} turnCallback
   */
  constructor(rotation, uvs, hoveringColors, turnCallback) {
    this.#turnCallback = turnCallback
    this.transform = new RubicsTransform(V3.zero, rotation)

    this.cubies = []

    for (let i = 0; i < 27; i++) {
      const cubie = new Cubie(
        i,
        uvs,
        hoveringColors,
        this
      )
      this.cubies.push(cubie)
      this.transform.children.push(cubie)
    }
  }

  /**
   * @param {import('./Program').Program} program
   * @param {WebGL2RenderingContext} gl
   * @param {WebGLBuffer} uvsVbo
   */
  render(program, gl, uvsVbo) {
    this.cubies.forEach(cubie => cubie.render(program, gl, uvsVbo))
  }

  /**
   * @param {number} axis
   * @param {number} index
   * @returns {Cubie[]}
   */
  getPlane(axis, index) {
    const deltas = [1, 3, 9]
    deltas.splice(axis, 1)
    const [d1, d2] = deltas
    const initial = Math.pow(3, axis) * index

    /** @type {Cubie[]} */
    const cubies = []
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const index = initial + i * d1 + j * d2
        const cubie = this.cubies[index]
        cubies.push(cubie)
      }
    }
    return cubies
  }

  /**
   * @param {number} axis
   * @param {number} index
   * @param {number} angle
   */
  #turn(axis, index, angle) {
    if (mod(angle, 4) === 0) {
      return
    }
    const plane = this.getPlane(axis, index)
    this.#swapOuterFacelets(plane, axis, angle)
    if (index !== 1) {
      this.#swapInnerFacelets(plane, axis, index, angle)
    }
  }
  /**
   * @param {Cubie[]} plane
   * @param {number} axis
   * @param {number} angle
   */
  #swapOuterFacelets(plane, axis, angle) {
    const [s0, s1, s2, s3] = [0, 1, 2, 3, 4, 5].filter(s => {
      return Math.floor(s / 2) !== axis
    })
    
    const facelets = [
      plane[0].getFaceletOfSide(s0),
      plane[1].getFaceletOfSide(s0),
      plane[2].getFaceletOfSide(s0),
      plane[2].getFaceletOfSide(s3),
      plane[5].getFaceletOfSide(s3),
      plane[8].getFaceletOfSide(s3),
      plane[8].getFaceletOfSide(s1),
      plane[7].getFaceletOfSide(s1),
      plane[6].getFaceletOfSide(s1),
      plane[6].getFaceletOfSide(s2),
      plane[3].getFaceletOfSide(s2),
      plane[0].getFaceletOfSide(s2)
    ]


    const uvs = facelets.map(({uvs}) => ({uvs}))
    const offset = mod(3 * angle, 12)
    const shiftedUVs = [...uvs.slice(offset), ...uvs.slice(0, offset)]

    facelets.forEach((facelet, index) => {
      let {uvs} = shiftedUVs[index]
      const a = mod(angle, 4)
      const n = Rubics.#outerFaceletsRotations[axis][facelet.side]?.[a] ?? 0
      const offset = mod(2 * n, 8)
      facelet.uvs = [...uvs.slice(offset), ...uvs.slice(0, offset)]
    })
  }
  /**
   * @param {Cubie[]} plane
   * @param {number} axis
   * @param {number} index
   * @param {number} angle
   */
  #swapInnerFacelets(plane, axis, index, angle) {
    const side = axis * 2 + Math.sign(index)

    const facelets = [
      plane[0].getFaceletOfSide(side),
      plane[1].getFaceletOfSide(side),
      plane[2].getFaceletOfSide(side),
      plane[5].getFaceletOfSide(side),
      plane[8].getFaceletOfSide(side),
      plane[7].getFaceletOfSide(side),
      plane[6].getFaceletOfSide(side),
      plane[3].getFaceletOfSide(side)
    ]

    const uvOffset = mod(2 * angle, 8)
    const uvRotation = mod(2 * ((axis % 2) * 2 === index ? angle : 4 - angle), 8)
    const uvs = facelets.map(({uvs}) => ({uvs}))
    const shiftedUVs = [...uvs.slice(uvOffset), ...uvs.slice(0, uvOffset)]

    facelets.forEach((facelet, index) => {
      const {uvs} = shiftedUVs[index]
      facelet.uvs = [...uvs.slice(uvRotation), ...uvs.slice(0, uvRotation)]
    })
    
    const center = plane[4].getFaceletOfSide(side)
    const centerUVs = center.uvs
    center.uvs = [...centerUVs.slice(uvRotation), ...centerUVs.slice(0, uvRotation)]
  }

  /** @type {Record<number, Record<number, Record<number, number>>>} */
  static #outerFaceletsRotations = {
    0: {
      2: {1:  1, 2:  1},
      3: {1: -1, 2: -1},
      4: {2:  1, 3:  1},
      5: {2: -1, 3: -1}
    },
    1: {
      0: {2:  1, 3:  1},
      1: {2: -1, 3: -1},
      4: {1: -1, 2: -1},
      5: {1:  1, 2:  1}
    },
    2: {
      0: {1: -1, 2: -1},
      1: {1:  1, 2:  1},
      2: {2: -1, 3: -1},
      3: {2:  1, 3:  1}
    }
  }


  // manual rotation

  /** @type {Array<{cubie: Cubie, backupPosition: V3, backupRotation: Quaternion, directionFromCenter: V3}>} */
  #rotatingCubies = []
  #rotationAxis = V3.zero
  #rotationCenter = V3.zero
  #currentAngle = 0
  
  /**
   * @param {Cubie[]} cubies
   * @param {V3} axis
   */
  startRotation(cubies, axis) {
    this.#rotationAxis = axis
    this.#rotationCenter = cubies[4].transform.position
    this.#rotatingCubies = cubies.map(cubie => {
      return {
        cubie,
        backupPosition: cubie.transform.position,
        backupRotation: cubie.transform.rotation,
        directionFromCenter: cubie.transform.position.sub(this.#rotationCenter)
      }
    })
  }
  
  /** @param {number} angle */
  rotateManual(angle) {
    const rotation = Quaternion.fromAngle(this.#rotationAxis, -angle)
    this.#currentAngle = angle
    this.#rotatingCubies.forEach(({cubie, backupRotation, directionFromCenter}) => {
      const rotatedDirectionFromCenter = rotation.rotate(directionFromCenter)
      const newPosition = this.#rotationCenter.add(rotatedDirectionFromCenter)
      cubie.transform.position = newPosition
      cubie.transform.rotation = backupRotation
      cubie.transform.rotate(this.#rotationAxis, angle)
    })
  }
  
  // automatic rotation
  #initialAngle = 0
  #rotatingAutomatic = false
  #turnProgress = 0
  #turnSpeed = 4
  #targetAngle = 0
  #rotationIndex = 0
  #rotationAxisIndex = 0

  /**
   * @param {number} axis
   * @param {number} index
   * @param {number} angle
   */
  finishRotation(axis, index, angle) {
    this.#rotatingAutomatic = true
    this.#turnProgress = 0
    this.#targetAngle = angle
    this.#initialAngle = this.#currentAngle
    this.#rotationIndex = index
    this.#rotationAxisIndex = axis
    this.#turnCallback({axis, index, angle})
  }

  /** @param {number} delta */
  update(delta) {
    if (!this.#rotatingAutomatic) {
      return
    }

    this.#turnProgress += delta * this.#turnSpeed
    if (this.#turnProgress >= 1) {
      this.#rotatingAutomatic = false
      this.#rotatingCubies.forEach(({cubie, backupPosition, backupRotation}) => {
        cubie.transform.position = backupPosition
        cubie.transform.rotation = backupRotation
      })
      this.#turn(this.#rotationAxisIndex, this.#rotationIndex, this.#targetAngle)
      return
    }

    const currentAngle = lerp(this.#initialAngle, this.#targetAngle * 90, this.#turnProgress)
    const rotation = Quaternion.fromAngle(this.#rotationAxis, -currentAngle)
    this.#rotatingCubies.forEach(({cubie, backupRotation, directionFromCenter}) => {
      cubie.transform.rotation = backupRotation.mult(Quaternion.fromAngle(this.#rotationAxis, currentAngle))
      const rotatedDirectionFromCenter = rotation.rotate(directionFromCenter)
      const newPosition = this.#rotationCenter.add(rotatedDirectionFromCenter)
      cubie.transform.position = newPosition
    })
  }

  get isTurning() {
    return this.#rotatingAutomatic
  }

}