import {M44} from '../Math/Matrix'
import {Quaternion} from '../Math/Quarternion'
import {V3, V4} from '../Math/Vector'

interface WithTransform {
  transform: Transform<any, any>
}

export class Transform<TChild extends WithTransform, TParent extends WithTransform | null> {
  public localTransform!: M44
  public globalTransform!: M44
  
  public children: TChild[] = []
  
  public constructor(protected _position: V3, protected _rotation: Quaternion, public parent: TParent) {
    this._setTransforms()
  }
  
  protected _setTransforms() {
    const localTransform = Transform.getLocalTransform(this._position, this._rotation)
    this.localTransform = localTransform
    
    if (!this.parent) {
      this.globalTransform = localTransform
    } else {
      const parentTransform = this.parent.transform.globalTransform
      this.globalTransform = parentTransform.mult(localTransform)
    }
    
    this.children.forEach(child => child.transform._setTransforms())
  }
  
  public apply({x, y, z}: V3) {
    return this.globalTransform.mult(new V4(x, y, z, 1)).toV3()
  }
  
  
  public rotate(axis: V3, angle: number) {
    this.rotation = this._rotation.mult(Quaternion.fromAngle(this._rotation.rotate(axis), angle))
  }
  
  public set position(value: V3) {
    this._position = value
    this._setTransforms()
  }
  public set rotation(value: Quaternion) {
    this._rotation = value
    this._setTransforms()
  }
  
  public get position() {
    return this._position
  }
  public get rotation() {
    return this._rotation
  }

  public static getLocalTransform({x, y, z}: V3, rotation: Quaternion): M44 {
    const transform = rotation.matrix
    transform.r1.w = x
    transform.r2.w = y
    transform.r3.w = z
    return transform
  }
}