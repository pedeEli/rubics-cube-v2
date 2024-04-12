import {Vector} from './abstractVector'

/**
 * @typedef {import('../types').Uniform} Uniform
 */

/**
 * @extends {Vector<V2>}
 * @implements {Uniform}
 */
export class V2 extends Vector {
  /**
   * @param {number} x
   * @param {number} y
   */
  constructor(x, y) {
    super()
    this.x = x
    this.y = y
  }
  /** @param {number} a */
  scale(a) {
    return new V2(a * this.x, a * this.y)
  }
  /** @param {V2} v */
  add({x, y}) {
    return new V2(this.x + x, this.y + y)
  }
  /** @param {V2} v */
  sub({x, y}) {
    return new V2(this.x - x, this.y - y)
  }
  /** @param {V2} v */
  mult({x, y}) {
    return new V2(this.x * x, this.y * y)
  }
  /** @param {V2} v */
  dot({x, y}) {
    return this.x * x + this.y * y
  }
  toArray() {
    return [this.x, this.y]
  }
  
  /**
   * @param {WebGL2RenderingContext} gl
   * @param {WebGLUniformLocation} location
   */
  setUniform(gl, location) {
    gl.uniform2f(location, this.x, this.y)
  }

  static get zero() {
    return new V2(0, 0)
  }
}

/**
 * @extends {Vector<V3>}
 * @implements {Uniform}
 */
export class V3 extends Vector {
  /**
   * @param {number} x
   * @param {number} y
   * @param {number} z
   */
  constructor(x, y, z) {
    super()
    this.x = x
    this.y = y
    this.z = z
  }
  /** @param {number} a */
  scale(a) {
    return new V3(a * this.x, a * this.y, a * this.z)
  }
  /** @param {V3} v */
  add({x, y, z}) {
    return new V3(this.x + x, this.y + y, this.z + z)
  }
  /** @param {V3} v */
  sub({x, y, z}) {
    return new V3(this.x - x, this.y - y, this.z - z)
  }
  /** @param {V3} v */
  mult({x, y, z}) {
    return new V3(this.x * x, this.y * y, this.z * z)
  }
  /** @param {V3} v */
  cross({x, y, z}) {
    return new V3(this.y * z - this.z * y, this.z * x - this.x * z, this.x * y - this.y * x)
  }
  /** @param {V3} v */
  dot({x, y, z}) {
    return this.x * x + this.y * y + this.z * z
  }
  toArray() {
    return [this.x, this.y, this.z]
  }

  /**
   * @param {WebGL2RenderingContext} gl
   * @param {WebGLUniformLocation} location
   */
  setUniform(gl, location) {
    gl.uniform3f(location, this.x, this.y, this.z)
  }
  toV2() {
    return new V2(this.x, this.y)
  }
  
  static get zero() {
    return new V3(0, 0, 0)
  }
  static get one() {
    return new V3(1, 1, 1)
  }
  static get up() {
    return new V3(0, 1, 0)
  }
  static get down() {
    return new V3(0, -1, 0)
  }
  static get left() {
    return new V3(1, 0, 0)
  }
  static get right() {
    return new V3(-1, 0, 0)
  }
  static get forward() {
    return new V3(0, 0, 1)
  }
  static get back() {
    return new V3(0, 0, -1)
  }
  
  /**
   * @param {V3} v1
   * @param {V3} v2
   * @param {number} t
   */
  static lerp(v1, v2, t) {
    return v1.add(v2.sub(v1).scale(t))
  }

  /**
   * @param {V3} v1
   * @param {V3} v2
   */
  static angle(v1, v2) {
    return Math.acos(v1.dot(v2) / Math.sqrt(v1.squareMag * v2.squareMag))
  }

  /** @param {number} axis */
  static getRotationAxis(axis) {
    if (axis === 0)
      return V3.right
    if (axis === 1)
      return V3.down
    return V3.back
  }
}

/**
 * @extends {Vector<V4>}
 * @implements {Uniform}
 */
export class V4 extends Vector {
  /**
   * @param {number} x
   * @param {number} y
   * @param {number} z
   * @param {number} w
   */
  constructor(x, y, z, w) {
    super()
    this.x = x
    this.y = y
    this.z = z
    this.w = w
  }
  /** @param {number} a */
  scale(a) {
    return new V4(a * this.x, a * this.y, a * this.z, a * this.w)
  }
  /** @param {V4} v */
  add({x, y, z, w}) {
    return new V4(this.x + x, this.y + y, this.z + z, this.w + w)
  }
  /** @param {V4} v */
  sub({x, y, z, w}) {
    return new V4(this.x - x, this.y - y, this.z - z, this.w - w)
  }
  /** @param {V4} v */
  mult({x, y, z, w}) {
    return new V4(this.x * x, this.y * y, this.z * z, this.w * w)
  }
  /** @param {V4} v */
  dot({x, y, z, w}) {
    return this.x * x + this.y * y + this.z * z + this.w * w
  }
  toV3() {
    return new V3(this.x, this.y, this.z)
  }
  toArray() {
    return [this.x, this.y, this.z, this.w]
  }

  /**
   * @param {WebGL2RenderingContext} gl
   * @param {WebGLUniformLocation} location
   */
  setUniform(gl, location) {
    gl.uniform4f(location, this.x, this.y, this.z, this.w)
  }
}