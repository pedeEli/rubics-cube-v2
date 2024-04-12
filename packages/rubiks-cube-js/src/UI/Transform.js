import {Quaternion} from '../math/quarternion'
import {V4} from '../math/vector'

/**
 * @typedef {{transform: Transform<any, any>}} WithTransform
 * @typedef {import('../math/matrix').M44} M44
 * @typedef {import('../math/vector').V3} V3
 */

/**
 * @template {WithTransform} TChild
 * @template {WithTransform | null} TParent
 */
export class Transform {
  /** @type {M44} */
  localTransform
  /** @type {M44} */
  globalTransform
  
  /** @type {TChild[]} */
  children = []
  
  /**
   * @param {V3} position
   * @param {Quaternion} rotation
   * @param {TParent} parent
   */
  constructor(position, rotation, parent) {
    /** @protected */
    this._position = position
    /** @protected */
    this._rotation = rotation
    this.parent = parent
    this.setTransforms()
  }
  
  /** @protected */
  setTransforms() {
    const localTransform = Transform.getLocalTransform(this._position, this._rotation)
    this.localTransform = localTransform
    
    if (!this.parent) {
      this.globalTransform = localTransform
    } else {
      const parentTransform = this.parent.transform.globalTransform
      this.globalTransform = parentTransform.mult(localTransform)
    }
    
    this.children.forEach(child => child.transform.setTransforms())
  }
  
  /** @param {V3} v */
  apply({x, y, z}) {
    return this.globalTransform.mult(new V4(x, y, z, 1)).toV3()
  }
  
  /**
   * @param {V3} axis
   * @param {number} angle
   */
  rotate(axis, angle) {
    this.rotation = this._rotation.mult(Quaternion.fromAngle(this._rotation.rotate(axis), angle))
  }
  
  /** @param {V3} value */
  set position(value) {
    this._position = value
    this.setTransforms()
  }
  /** @param {Quaternion} value */
  set rotation(value) {
    this._rotation = value
    this.setTransforms()
  }
  
  get position() {
    return this._position
  }
  get rotation() {
    return this._rotation
  }

  /**
   * @param {V3} position
   * @param {Quaternion} rotation 
   * @returns {M44} 
   */
  static getLocalTransform({x, y, z}, rotation) {
    const transform = rotation.matrix
    transform.r1.w = x
    transform.r2.w = y
    transform.r3.w = z
    return transform
  }
}