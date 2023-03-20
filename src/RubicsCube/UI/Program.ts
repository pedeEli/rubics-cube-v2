export class Program {
  private _program: WebGLProgram
  private _uniformMap: Map<string, WebGLUniformLocation>

  public constructor(
    private _path: string,
    vertexShaderSource: string,
    fragmentShaderSource: string,
    private _gl: WebGL2RenderingContext
  ) {
    const vertexShader = this.createShader(vertexShaderSource, this._gl.VERTEX_SHADER, 'vertex')
    const fragmentShader = this.createShader(fragmentShaderSource, this._gl.FRAGMENT_SHADER, 'fragment')

    const p = this._gl.createProgram()
    
    if (!p)
      throw new Error('Fatal: webgl could not create program object!')

    this._program = p
    this._gl.attachShader(this._program, vertexShader)
    this._gl.attachShader(this._program, fragmentShader)
    this._gl.linkProgram(this._program)
    const success = this._gl.getProgramParameter(this._program, this._gl.LINK_STATUS)
    if (!success) {            
      const info = this._gl.getProgramInfoLog(this._program)
      this._gl.deleteProgram(this._program)
      throw new Error(`Link Program: ${info}`)
    }

    const numUniforms = this._gl.getProgramParameter(this._program, this._gl.ACTIVE_UNIFORMS) as number
    const uniformIndices = [...Array(numUniforms).keys()]
    const uniformNames = uniformIndices.map(index => {
      const info = this._gl.getActiveUniform(this._program, index)
      const location = this._gl.getUniformLocation(this._program, info!.name)!
      return [info!.name, location] as const
    })
    this._uniformMap = new Map(uniformNames)
  }

  private createShader(source: string, type: number, typeStr: string) {
    const shader = this._gl.createShader(type)
    if (!shader)
      throw new Error('Fatal: webgl could not create shader object!')
    this._gl.shaderSource(shader, source)
    this._gl.compileShader(shader)
    
    const success = this._gl.getShaderParameter(shader, this._gl.COMPILE_STATUS) as boolean
    if (success)
      return shader
    
    const info = this._gl.getShaderInfoLog(shader)
    this._gl.deleteShader(shader)
    throw new Error(`Compile '${this._path}': ${typeStr}: ${info}`)
  }

  public use() {
    if (!this._program)
      throw new Error('Fatal: program does not exists!')
    this._gl.useProgram(this._program)
  }

  public uniform(name: string, u: Uniform) {
    if (!this._uniformMap.has(name))
      throw new Error(`Fatal: unkown name: ${name}`)
    const location = this._uniformMap.get(name)!
    u.setUniform(this._gl, location)
  }
}

export interface Uniform {
  setUniform(gl: WebGL2RenderingContext, location: WebGLUniformLocation): void
}