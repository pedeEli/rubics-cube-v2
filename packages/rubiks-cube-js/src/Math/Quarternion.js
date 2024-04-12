import {V3, V4} from './vector'
import {M44} from './matrix'

export class Quaternion {
  /**
   * @param {number} real
   * @param {V3} im
   */
  constructor(real, im) {
    this.real = real
    this.im = im
  }
  
  /**
   * @param {V3} axis
   * @param {number} angle
   * @param {boolean} [degree=true]
   */
  static fromAngle(axis, angle, degree = true) {
    if (degree) {
      angle *= Math.PI / 180
    }
    const half = angle / 2;
    const real = Math.cos(half)
    const im = axis.normalized.scale(Math.sin(half))
    return new Quaternion(real, im)
  }
  get matrix() {
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
  /** @param {Quaternion} q */
  mult({real, im}) {
    return new Quaternion(this.real * real - this.im.dot(im), this.im.cross(im).add(im.scale(this.real)).add(this.im.scale(real)))
  }
  /** @param {V3} v */
  rotate(v) {
    return new Quaternion(this.real, this.im.negate).mult(new Quaternion(0, v)).mult(this).im
  }
  
  get conjugate() {
    return new Quaternion(this.real, this.im.negate)
  }
  get mag() {
    return Math.sqrt(this.real * this.real + this.im.squareMag)
  }
  
  /** @param {number} n */
  power(n) {
    const {mag} = this
    const phi = Math.acos(this.real / mag)
    const unit = this.im.normalized
    const scalar = Math.pow(mag, n)
    return new Quaternion(scalar * Math.cos(phi * n), unit.scale(scalar * Math.sin(phi * n)))
  }
  
  static get identity() {
    return new Quaternion(1, V3.zero)
  }
  
  /**
   * @param {Quaternion} q1
   * @param {Quaternion} q2
   * @param {number} t
   */
  static slerp(q1, q2, t) {
    return q1.mult(q1.conjugate.mult(q2).power(t))
  }
}