import {V2, V3, V4} from '../math/vector'
import {M44} from '../math/matrix'

export class Camera {
  /** @type {V3} */
  #position
  /** @type {V3} */
  #lookAt
  /** @type {V3} */
  #forward
  /** @type {V3} */
  #right
  /** @type {V3} */
  #up

  /** @type {number} */
  #fov
  /** @type {number} */
  #aspect
  /** @type {number} */
  #width
  /** @type {number} */
  #height
  /** @type {number} */
  #near
  /** @type {number} */
  #far

  /** @type {M44} */
  #projectionMatrix
  /** @type {M44} */
  #worldToCameraMatrix
  /** @type {M44} */
  #projectionMatrixInverse
  /** @type {M44} */
  #cameraToWorldMatrix
  /** @type {M44} */
  #worldProjectionMatrix

  /**
   * @param {V3} position
   * @param {V3} lookAt
   * @param {V3} up
   * @param {number} fov
   * @param {number} width
   * @param {number} height
   * @param {number} near
   * @param {number} far
   */
  constructor(position, lookAt, up, fov, width, height, near, far) {
    this.#position = position
    this.#lookAt = lookAt
    this.#up = up

    this.#fov = fov
    this.#width = width
    this.#height = height
    this.#aspect = width / height
    this.#near = near
    this.#far = far

    this.calcCameraDirections()
    this.calcWorldToCameraMatrix()
    this.calcProjectionMatrix()
  }

  /** @param {V3} value */
  set position(value) {
    this.#position = value
    this.calcCameraDirections()
    this.calcWorldToCameraMatrix()
  }
  /** @param {V3} value */
  set lookAt(value) {
    this.#lookAt = value
    this.calcCameraDirections()
    this.calcWorldToCameraMatrix()
  }
  /** @param {V3} value */
  set up(value) {
    this.#up = value
    this.calcCameraDirections()
    this.calcWorldToCameraMatrix()
  }
  get position() {
    return this.#position
  }
  get lookAt() {
    return this.#lookAt
  }
  get up() {
    return this.#up
  }
  get forward() {
    return this.#forward
  }
  get right() {
    return this.#right
  }

  /** @param {number} value */
  set fov(value) {
    this.#fov = value
    this.calcProjectionMatrix()
  }
  /** @param {number} value */
  set near(value) {
    this.#near = value
    this.calcProjectionMatrix()
  }
  /** @param {number} value */
  set far(value) {
    this.#far = value
    this.calcProjectionMatrix()
  }
  get fov() {
    return this.#fov
  }
  get aspect() {
      return this.#aspect
  }
  get near() {
    return this.#near
  }
  get far() {
    return this.#far
  }
  get width() {
    return this.#width
  }
  get height() {
    return this.#height
  }
  /**
   * @param {number} width
   * @param {number} height
   */
  screenSize(width, height) {
    this.#width = width
    this.#height = height
    this.#aspect = width / height
    this.calcProjectionMatrix()
  }


  get projectionMatrix() {
    return this.#projectionMatrix
  }
  get projectionMatrixInverse() {
    return this.#projectionMatrixInverse
  }
  get worldToCameraMatrix() {
    return this.#worldToCameraMatrix
  }
  get cameraToWorldMatrix() {
    return this.#cameraToWorldMatrix
  }
  get worldProjectionMatrix() {
    return this.#worldProjectionMatrix
  }

  /** @param {V3} v */
  worldToScreen({x, y, z}) {
    const point4d = this.worldProjectionMatrix.mult(new V4(x, y, z, 1))
    const screenPoint = point4d.toV3().scale(1 / point4d.w).toV2().add(new V2(1, 1)).scale(.5).mult(new V2(this.width, this.height))
    return screenPoint
  }
  // worldDirectionToScreen({x, y, z}: V3) {
  //   // const rotationTransform = this.cameraToWorldMatrix.transpose
  //   const cameraPoint = this.worldToCameraMatrix.mult(new V4(x, y, z, 1))
  //   const projectedPoint = this.projectionMatrix.mult(cameraPoint)
  //   const viewportPoint = projectedPoint.toV3().scale(1 / projectedPoint.w).toV2()
  //   const screenPoint = viewportPoint.add(new V2(1, 1)).scale(.5).mult(new V2(this.width, this.height))
  //   // console.log(this.projectionMatrix)
  //   console.table({cameraPoint, projectedPoint, viewportPoint, screenPoint})
  //   return screenPoint
  // }


  calcProjectionMatrix() {
    this.#projectionMatrix = M44.perspective(this.#fov * Math.PI / 180, this.#aspect, this.#near, this.#far)
    this.#projectionMatrixInverse = this.#projectionMatrix.inverse
    this.#worldProjectionMatrix = this.#projectionMatrix?.mult(this.#worldToCameraMatrix)
  }
  calcWorldToCameraMatrix() {
    this.#worldToCameraMatrix = M44.lookAt(this.#position, this.#lookAt, this.#up)
    this.#cameraToWorldMatrix = this.#worldToCameraMatrix.inverse
    this.#worldProjectionMatrix = this.#projectionMatrix?.mult(this.#worldToCameraMatrix)
  }
  calcCameraDirections() {
    this.#forward = this.#lookAt.sub(this.#position).normalized
    this.#right = this.#up.cross(this.#forward).normalized
  }
}