import {V3, V4} from './Vector'
import {M44} from './Matrix'

export class Quaternion {
  public constructor(public real: number, public im: V3) {}
  
  public static fromAngle(axis: V3, angle: number, degree = true) {
    if (degree)
      angle *= Math.PI / 180
    const half = angle / 2;
    const real = Math.cos(half)
    const im = axis.normalized.scale(Math.sin(half))
    return new Quaternion(real, im)
  }
  public get matrix() {
    const {x, y, z} = this.im
    const w = this.real
    const xx = x * x
    const yy = y * y
    const zz = z * z
    const xy = x * y
    const xz = x * z
    const xw = x * w
    const yz = y * z
    const yw = y * w
    const zw = z * w
    return new M44(
      new V4(1 - 2 * (yy + zz), 2 * (xy - zw), 2 * (xz + yw), 0),
      new V4(2 * (xy + zw), 1 - 2 * (xx + zz), 2 * (yz - xw), 0),
      new V4(2 * (xz - yw), 2 * (yz + xw), 1 - 2 * (xx + yy), 0),
      new V4(            0,             0,                 0, 1)
    )
  }
  public mult({real, im}: Quaternion) {
    return new Quaternion(this.real * real - this.im.dot(im), this.im.cross(im).add(im.scale(this.real)).add(this.im.scale(real)))
  }
  public rotate(v: V3) {
    return new Quaternion(this.real, this.im.negate).mult(new Quaternion(0, v)).mult(this).im
  }
  
  public get conjugate() {
    return new Quaternion(this.real, this.im.negate)
  }
  public get mag() {
    return Math.sqrt(this.real * this.real + this.im.squareMag)
  }
  
  public power(n: number) {
    const {mag} = this
    const phi = Math.acos(this.real / mag)
    const unit = this.im.normalized
    const scalar = Math.pow(mag, n)
    return new Quaternion(scalar * Math.cos(phi * n), unit.scale(scalar * Math.sin(phi * n)))
  }
  
  public static get identity() {
    return new Quaternion(1, V3.zero)
  }
  
  public static slerp(q1: Quaternion, q2: Quaternion, t: number) {
    return q1.mult(q1.conjugate.mult(q2).power(t))
  }
}