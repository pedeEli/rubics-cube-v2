import {V3, V4} from '../Math/Vector'
import {Quaternion} from '../Math/Quarternion'

import {Program} from './Program'
import {Transform} from './Transform'
import {Cubie} from './Cubie'

export class FaceletTransform extends Transform<any, Cubie> {
  public left!: V3
  public top!: V3
  public normal!: V3
  public topLeft!: V3
  public bottomRight!: V3

  public constructor(position: V3, rotation: Quaternion, parent: Cubie) {
    super(position, rotation, parent)
    this._setTransforms()
  }

  protected _setTransforms() {
    super._setTransforms()

    const rotationTransform = this.globalTransform.inverse.transpose
    
    this.left = rotationTransform.mult(new V4(0, 0, -1, 1)).toV3().normalized
    this.top = rotationTransform.mult(new V4(0, -1, 0, 1)).toV3().normalized
    this.normal = rotationTransform.mult(new V4(-1, 0, 0, 1)).toV3().normalized

    this.topLeft = this.globalTransform.mult(new V4(0, .5, .5, 1)).toV3()
    this.bottomRight = this.topLeft.add(this.left).add(this.top)
  }
}

export class Facelet {
  public hovering = false

  public constructor(
    public transform: FaceletTransform,
    public side: number,
    public uvs: number[],
    private _hoveringMult: V3
  ) {}

  public render(program: Program, gl: WebGL2RenderingContext, uvsVbo: WebGLBuffer) {
    gl.bindBuffer(gl.ARRAY_BUFFER, uvsVbo)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.uvs), gl.STATIC_DRAW)
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 8, 0)
    gl.bindBuffer(gl.ARRAY_BUFFER, null)

    program.uniform('model', this.transform.globalTransform)
    program.uniform('colorMult', this.hovering ? this._hoveringMult : V3.one)
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 0)
  }
}

export class InsideFacelet {
  public constructor(
    public transform: Transform<any, Cubie>
  ) {}

  public render(program: Program, gl: WebGL2RenderingContext) {
    program.uniform('model', this.transform.globalTransform)
    program.uniform('colorMult', V3.zero)
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 0)
  }
}