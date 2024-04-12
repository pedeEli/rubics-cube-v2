/**
 * @template {Vector<any>} V
 * @abstract
 */
export class Vector {
  /**
   * @abstract
   * @param {number} _a
   */
  scale(_a) {
    throw new Error('must be implemented in subclass')
  }
  /**
   * @abstract
   * @param {V} _v
   * @returns {V}
   */
  add(_v) {
    throw new Error('must be implemented in subclass')
  }
  /**
   * @abstract
   * @param {V} _v
   * @return {V}
   */
  sub(_v) {
    throw new Error('must be implemented in subclass')
  }
  /**
   * @abstract
   * @param {V} _v
   * @return {V}
   */
  mult(_v) {
    throw new Error('must be implemented in subclass')
  }
  /**
   * @abstract
   * @param {V} _v
   * @return {number}
   */
  dot(_v) {
    throw new Error('must be implemented in subclass')
  }
  /**
   * @abstract
   * @return {number[]}
   */
  toArray() {
    throw new Error('must be implemented in subclass')
  }
  
  get squareMag() {
    /** @type {any} */
    const t = this
    return this.dot(t)
  }
  get mag() {
    return Math.sqrt(this.squareMag)
  }
  get normalized() {
    return this.scale(1 / this.mag)
  }
  get negate() {
    return this.scale(-1)
  }
}