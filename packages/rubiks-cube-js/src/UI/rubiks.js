import {V3} from '../math/vector'
import {Quaternion} from '../math/quarternion'
import {lerp, mod} from '../math/utils'

import {Cubie} from './cubie'
import {Transform} from './transform'
import {uvsTransformerPresets, sidesShiftMapper} from './uvs'

// magic values
const rotationAxis = [
  V3.getRotationAxis(0),
  V3.getRotationAxis(1),
  V3.getRotationAxis(2)
]

/**
 * `cubeRotationOnMiddle[axis][side]`
 * @type {Record<number, Record<number, number>>}
 */
const cubeRotationOnMiddle = {
  0: {
    2: 90, 3: -90,
    4: -90, 5: 90
  },
  1: {
    0: -90, 1: 90,
    4: 90, 5: -90
  },
  2: {
    0: 90, 1: -90,
    2: -90, 3: 90
  }
}

/**
 * `uvsTransformers[axis][side][angle]`
 * @type {Record<number, Record<number, Record<number, (uvs: number[]) => number[]>>>}
 */
const uvsTransformers = {
  0: {
    0: uvsTransformerPresets.rcR2Rcc,
    1: uvsTransformerPresets.rcR2Rcc,
    2: uvsTransformerPresets.flipV23,
    3: uvsTransformerPresets.flipV23,
    4: uvsTransformerPresets.flipV12,
    5: uvsTransformerPresets.flipV12
  },
  1: {
    0: uvsTransformerPresets.rcfhFvRcc,
    1: uvsTransformerPresets.rcfhFvRcc,
    2: uvsTransformerPresets.rcR2Rcc,
    3: uvsTransformerPresets.rcR2Rcc,
    4: uvsTransformerPresets.rcFhRcfh,
    5: uvsTransformerPresets.rcFhRcfh
  },
  2: {
    0: uvsTransformerPresets.flipH23,
    1: uvsTransformerPresets.flipH23,
    2: uvsTransformerPresets.flipH12,
    3: uvsTransformerPresets.flipH12,
    4: uvsTransformerPresets.rcR2Rcc,
    5: uvsTransformerPresets.rcR2Rcc
  }
}


/**
 * @param {number} axis
 * @param {number} side
 * @returns {boolean}
 */
const shouldInvertAngle = (axis, side) => {
  return (
    side === 0 ||
    side === 2 && axis === 0 ||
    side === 3 && axis === 2 ||
    side === 5
  )
}


/**
 * @extends {Transform<Cubie, null>}
 */
export class RubiksTransform extends Transform {
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

/** @typedef {(event: import('../types').AIA) => void} TurnCallback */

export class Rubiks {
  /** @type {RubiksTransform} */
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
    this.transform = new RubiksTransform(V3.zero, rotation)

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
   * @param {import('./program').Program} program
   * @param {WebGL2RenderingContext} gl
   * @param {WebGLBuffer} uvsVbo
   */
  render(program, gl, uvsVbo) {
    this.cubies.forEach(cubie => cubie.render(program, gl, uvsVbo))
  }

  /** @type {[number, number][]} */
  static #axisDeltasMap = [
    [3, 9],
    [1, 9],
    [1, 3]
  ]
  /**
   * @param {number} axis
   * @param {number} index
   * @returns {Cubie[]}
   */
  getPlane(axis, index) {
    const [d1, d2] = Rubiks.#axisDeltasMap[axis]
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
 * @param {number} side
 * @param {Cubie[]} plane
 */
  #turn(axis, index, angle, side, plane) {
    angle = mod(angle, 4)
    if (angle === 0) {
      return
    }

    if (index === 1) {
      this.#turn(axis, 0, -angle, side, this.getPlane(axis, 0))
      this.#turn(axis, 2, -angle, side, this.getPlane(axis, 2))
      this.transform.rotate(this.transform.rotationAxis[axis], angle * cubeRotationOnMiddle[axis][side])
      return
    }

    if (shouldInvertAngle(axis, side)) {
      angle = mod(-angle, 4)
    }

    this.#swapOuterFacelets(plane, axis, angle)
    this.#swapInnerFacelets(plane, axis, index, angle)
    
    this.#turnCallback({axis, index, angle})
  }
  /**
   * @param {Cubie[]} plane
   * @param {number} axis
   * @param {number} angle
   */
  #swapOuterFacelets(plane, axis, angle) {
    const [s0, s1, s2, s3] = sidesShiftMapper[axis]
    
    const facelets = [
      plane[0].getFaceletOfSide(s0),
      plane[1].getFaceletOfSide(s0),
      plane[2].getFaceletOfSide(s0),
      plane[2].getFaceletOfSide(s1),
      plane[5].getFaceletOfSide(s1),
      plane[8].getFaceletOfSide(s1),
      plane[8].getFaceletOfSide(s2),
      plane[7].getFaceletOfSide(s2),
      plane[6].getFaceletOfSide(s2),
      plane[6].getFaceletOfSide(s3),
      plane[3].getFaceletOfSide(s3),
      plane[0].getFaceletOfSide(s3)
    ]

    /** @type {number[][]} */
    const shiftedUvs = []

    for (let index = 0; index < 12; index++) {
      const shiftedIndex = mod(index + 3 * angle, 12)
      const {uvs} = facelets[shiftedIndex]

      const facelet = facelets[index]
      const transformer = uvsTransformers[axis][facelet.side][angle]
      shiftedUvs[index] = transformer(uvs)
    }

    for (let index = 0; index < 12; index++) {
      facelets[index].uvs = shiftedUvs[index]
    }
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

    /** @type {number[][]} */
    const shiftedUvs = []
    const transformer = uvsTransformers[axis][side][angle]

    for (let index = 0; index < 8; index++) {
      const shiftedIndex = mod(index + 2 * angle, 8)
      const {uvs} = facelets[shiftedIndex]
      shiftedUvs[index] = transformer(uvs)
    }

    for (let index = 0; index < 8; index++) {
      facelets[index].uvs = shiftedUvs[index]
    }
    
    const center = plane[4].getFaceletOfSide(side)
    center.uvs = transformer(center.uvs)
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
  #side = 0

  /**
   * @param {number} axis
   * @param {number} index
   * @param {number} angle
   * @param {number} side
   */
  finishRotation(axis, index, angle, side) {
    this.#rotatingAutomatic = true
    this.#turnProgress = 0
    this.#targetAngle = angle
    this.#initialAngle = this.#currentAngle
    this.#rotationIndex = index
    this.#rotationAxisIndex = axis
    this.#side = side
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
      this.#turn(
        this.#rotationAxisIndex,
        this.#rotationIndex,
        this.#targetAngle,
        this.#side,
        this.#rotatingCubies.map(({cubie}) => cubie)
      )
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