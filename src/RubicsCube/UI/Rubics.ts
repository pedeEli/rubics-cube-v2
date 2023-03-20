import {V3} from '../Math/Vector'
import {Quaternion} from '../Math/Quarternion'
import {lerp, mod} from '../Math/Utils'

import {Cubie} from './Cubie'
import {Program} from './Program'
import {Transform} from './Transform'

const rotationAxis = ([0, 1, 2]).map(axis => V3.getRotationAxis(axis))

export class RubicsTransform extends Transform<Cubie, null> {
  public rotationAxis!: [V3, V3, V3]

  public constructor(position: V3, rotation: Quaternion) {
    super(position, rotation, null)
    this._setTransforms()
  }

  protected _setTransforms() {
    super._setTransforms()

    this.rotationAxis = rotationAxis
      .map(axis => {
        return this.apply(axis)
      }) as [V3, V3, V3]
  }
}

export class Rubics {
  public transform: RubicsTransform
  public cubies: Cubie[]

  public constructor(
    rotation: Quaternion,
    uvs: number[][],
    hoveringColors: V3[],
    gl: WebGL2RenderingContext
  ) {
    this.transform = new RubicsTransform(V3.zero, rotation)

    this.cubies = []

    for (let i = 0; i < 27; i++) {
      const x = Math.floor(i / 1) % 3
      const y = Math.floor(i / 3) % 3
      const z = Math.floor(i / 9) % 3
      const position = new V3(x, y, z).sub(V3.one)
      const cubie = new Cubie(
        position,
        Quaternion.identity,
        i,
        uvs,
        hoveringColors,
        this,
        gl
      )
      this.cubies.push(cubie)
      this.transform.children.push(cubie)
    }
  }


  public render(program: Program, gl: WebGL2RenderingContext) {
    this.cubies.forEach(cubie => cubie.render(program, gl))
  }


  public getPlane(axis: number, index: number) {
    const deltas = [1, 3, 9]
    deltas.splice(axis, 1)
    const [d1, d2] = deltas
    const initial = Math.pow(3, axis) * index

    const cubies: Cubie[] = []
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const index = initial + i * d1 + j * d2
        const cubie = this.cubies[index]
        cubies.push(cubie)
      }
    }
    return cubies
  }

  private _turn(axis: number, index: number, angle: number) {
    if (mod(angle, 4) === 0) {
      return
    }
    const plane = this.getPlane(axis, index)
    this._swapOuterFacelets(plane, axis, angle)
    if (index !== 1) {
      this._swapInnerFacelets(plane, axis, index, angle)
    }
  }
  private _swapOuterFacelets(plane: Cubie[], axis: number, angle: number) {
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
      const n = Rubics._outerFaceletsRotations[axis][facelet.side]?.[a] ?? 0
      const offset = mod(2 * n, 8)
      facelet.uvs = [...uvs.slice(offset), ...uvs.slice(0, offset)]
    })
  }
  private _swapInnerFacelets(plane: Cubie[], axis: number, index: number, angle: number) {
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

  private static _outerFaceletsRotations: Record<number, Record<number, Record<number, number>>> = {
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
  private _rotatingCubies: Array<{
    cubie: Cubie,
    backupPosition: V3,
    backupRotation: Quaternion,
    directionFromCenter: V3
  }> = []
  private _rotationAxis = V3.zero
  private _rotationCenter = V3.zero
  private _currentAngle = 0
  
  public startRotation(cubies: Cubie[], axis: V3) {
    this._rotationAxis = axis
    this._rotationCenter = cubies[4].transform.position
    this._rotatingCubies = cubies.map(cubie => {
      return {
        cubie,
        backupPosition: cubie.transform.position,
        backupRotation: cubie.transform.rotation,
        directionFromCenter: cubie.transform.position.sub(this._rotationCenter)
      }
    })
  }
  
  public rotateManual(angle: number) {
    const rotation = Quaternion.fromAngle(this._rotationAxis, -angle)
    this._currentAngle = angle
    this._rotatingCubies.forEach(({cubie, backupRotation, directionFromCenter}) => {
      const rotatedDirectionFromCenter = rotation.rotate(directionFromCenter)
      const newPosition = this._rotationCenter.add(rotatedDirectionFromCenter)
      cubie.transform.position = newPosition
      cubie.transform.rotation = backupRotation
      cubie.transform.rotate(this._rotationAxis, angle)
    })
  }
  
  // automatic rotation
  private _initialAngle = 0
  private _rotatingAutomatic = false
  private _turnProgress = 0
  private _turnSpeed = 4
  private _targetAngle = 0
  private _rotationIndex = 0
  private _rotationAxisIndex = 0

  public finishRotation(axis: number, index: number, angle: number) {
    this._rotatingAutomatic = true
    this._turnProgress = 0
    this._targetAngle = angle
    this._initialAngle = this._currentAngle
    this._rotationIndex = index
    this._rotationAxisIndex = axis
  }

  public update(delta: number) {
    if (!this._rotatingAutomatic) {
      return
    }

    this._turnProgress += delta * this._turnSpeed
    if (this._turnProgress >= 1) {
      this._rotatingAutomatic = false
      this._rotatingCubies.forEach(({cubie, backupPosition, backupRotation}) => {
        cubie.transform.position = backupPosition
        cubie.transform.rotation = backupRotation
      })
      this._turn(this._rotationAxisIndex, this._rotationIndex, this._targetAngle)
      return
    }

    const currentAngle = lerp(this._initialAngle, this._targetAngle * 90, this._turnProgress)
    const rotation = Quaternion.fromAngle(this._rotationAxis, -currentAngle)
    this._rotatingCubies.forEach(({cubie, backupRotation, directionFromCenter}) => {
      cubie.transform.rotation = backupRotation.mult(Quaternion.fromAngle(this._rotationAxis, currentAngle))
      const rotatedDirectionFromCenter = rotation.rotate(directionFromCenter)
      const newPosition = this._rotationCenter.add(rotatedDirectionFromCenter)
      cubie.transform.position = newPosition
    })
  }

  public get isTurning() {
    return this._rotatingAutomatic
  }

}