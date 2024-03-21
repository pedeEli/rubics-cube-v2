export class Program {
  /** @type {WebGLProgram} */
  #program
  /** @type {Map<string, WebGLUniformLocation>} */
  #uniformMap
  /** @type {string} */
  #path
  /** @type {WebGL2RenderingContext} */
  #gl

  /**
   * @param {string} path
   * @param {string} vertexShaderSource
   * @param {string} fragmentShaderSource
   * @param {WebGL2RenderingContext} gl
   */
  constructor(path, vertexShaderSource, fragmentShaderSource, gl) {
    this.#path = path
    this.#gl = gl
    const vertexShader = this.#createShader(vertexShaderSource, this.#gl.VERTEX_SHADER, 'vertex')
    const fragmentShader = this.#createShader(fragmentShaderSource, this.#gl.FRAGMENT_SHADER, 'fragment')

    const p = this.#gl.createProgram()
    
    if (!p)
      throw new Error('Fatal: webgl could not create program object!')

    this.#program = p
    this.#gl.attachShader(this.#program, vertexShader)
    this.#gl.attachShader(this.#program, fragmentShader)
    this.#gl.linkProgram(this.#program)
    const success = this.#gl.getProgramParameter(this.#program, this.#gl.LINK_STATUS)
    if (!success) {            
      const info = this.#gl.getProgramInfoLog(this.#program)
      this.#gl.deleteProgram(this.#program)
      throw new Error(`Link Program: ${info}`)
    }

    const numUniforms = /** @type {number} */ (this.#gl.getProgramParameter(this.#program, this.#gl.ACTIVE_UNIFORMS))
    const uniformIndices = [...Array(numUniforms).keys()]
    const uniformNames = uniformIndices.map(index => {
      const info = this.#gl.getActiveUniform(this.#program, index)
      if (info == null) {
        throw new Error('failed to get active uniform')
      }
      const location = this.#gl.getUniformLocation(this.#program, info.name)
      if (location == null) {
        throw new Error('failed to get uniform location')
      }
      return /** @type {[string, WebGLUniformLocation]} */ ([info.name, location])
    })
    this.#uniformMap = new Map(uniformNames)
  }

  /**
   * @param {string} source
   * @param {number} type
   * @param {string} typeStr
   * @returns {WebGLShader}
   */
  #createShader(source, type, typeStr) {
    const shader = this.#gl.createShader(type)
    if (!shader)
      throw new Error('Fatal: webgl could not create shader object!')
    this.#gl.shaderSource(shader, source)
    this.#gl.compileShader(shader)
    
    const success = /** @type {boolean} */ (this.#gl.getShaderParameter(shader, this.#gl.COMPILE_STATUS))
    if (success) {
      return shader
    }
    
    const info = this.#gl.getShaderInfoLog(shader)
    this.#gl.deleteShader(shader)
    throw new Error(`Compile '${this.#path}': ${typeStr}: ${info}`)
  }

  use() {
    if (!this.#program) {
      throw new Error('Fatal: program does not exists!')
    }
    this.#gl.useProgram(this.#program)
  }

  /**
   * @param {string} name
   * @param {import('../types').Uniform} u
   */
  uniform(name, u) {
    const location = this.#uniformMap.get(name)
    if (location == undefined) {
      throw new Error(`Fatal: unkown name: ${name}`)
    }
    u.setUniform(this.#gl, location)
  }
}