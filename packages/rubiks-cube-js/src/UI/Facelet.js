import {V3, V4} from '../math/vector'
import {Quaternion} from '../math/quarternion'

import {Program} from './program'
import {Transform} from './transform'
import {Cubie} from './cubie'

/**
 * @extends {Transform<any, Cubie>}
*/
export class FaceletTransform extends Transform {
  /** @type {V3} */
  left
  /** @type {V3} */
  top
  /** @type {V3} */
  normal
  /** @type {V3} */
  topLeft
  /** @type {V3} */
  bottomRight

  /**
   * @param {V3} position
   * @param {Quaternion} rotation
   * @param {Cubie} parent
   */
  constructor(position, rotation, parent) {
    super(position, rotation, parent)
    this.setTransforms()
  }

  /** @protected */
  setTransforms() {
    super.setTransforms()

    const rotationTransform = this.globalTransform.inverse.transpose
    
    this.left = rotationTransform.mult(new V4(0, 0, -1, 1)).toV3().normalized
    this.top = rotationTransform.mult(new V4(0, -1, 0, 1)).toV3().normalized
    this.normal = rotationTransform.mult(new V4(-1, 0, 0, 1)).toV3().normalized

    this.topLeft = this.globalTransform.mult(new V4(0, .5, .5, 1)).toV3()
    this.bottomRight = this.topLeft.add(this.left).add(this.top)
  }
}

export class Facelet {
  hovering = false
  /** @type {V3} */
  #hoveringMult

  /**
   * @param {FaceletTransform} transform
   * @param {number} side
   * @param {number[]} uvs
   * @param {V3} hoveringMult
   */
  constructor(transform, side, uvs, hoveringMult) {
    this.transform = transform
    this.side = side
    this.uvs = uvs
    this.#hoveringMult = hoveringMult
  }

  /**
   * @param {Program} program
   * @param {WebGL2RenderingContext} gl
   * @param {WebGLBuffer} uvsVbo
   */
  render(program, gl, uvsVbo) {
    gl.bindBuffer(gl.ARRAY_BUFFER, uvsVbo)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.uvs), gl.STATIC_DRAW)
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 8, 0)
    gl.bindBuffer(gl.ARRAY_BUFFER, null)

    program.uniform('model', this.transform.globalTransform)
    program.uniform('colorMult', this.hovering ? this.#hoveringMult : V3.one)
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 0)
  }
}

export class InsideFacelet {
  /** @param {Transform<any, Cubie>} transform */
  constructor(transform) {
    this.transform = transform
  }

  /**
   * @param {Program} program
   * @param {WebGL2RenderingContext} gl
   */
  render(program, gl) {
    program.uniform('model', this.transform.globalTransform)
    program.uniform('colorMult', V3.zero)
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 0)
  }
}