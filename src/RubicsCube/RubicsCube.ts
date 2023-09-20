import {V3} from './Math/Vector'
import {Quaternion} from './Math/Quarternion'

import {Program} from './UI/Program'
import {Camera} from './UI/Camera'
import {Rubics} from './UI/Rubics'
import {InputHandler} from './UI/InputHandler'
import debug from './UI/Debugger'

import {vertex, fragment} from './Shaders/facelet.glsl'

export class RubicsCube {
  private _initialized = false
  
  private _gl!: WebGL2RenderingContext
  private _canvas!: HTMLCanvasElement
  private _program!: Program
  private _vao!: WebGLVertexArrayObject
  private _uvsVbo!: WebGLBuffer
  private _texture!: WebGLTexture

  private _camera!: Camera
  private _rubics!: Rubics
  private _inputHandler!: InputHandler

  private _frame!: number
  private _resizeHandler = RubicsCube._getResizeHandler(this)

  constructor(
    private _canvasData: string,
    private _image: ImageData | HTMLImageElement,
    private _uvs: number[][][],
    private _hoveringColors: number[][]
  ) {}

  public start() {
    if (!this._initialized) {
      this._initialize()
      this._initialized = true
    }

    this._inputHandler.addEventListeners()
  
    window.addEventListener('resize', this._resizeHandler)
    this._resizeHandler()

    this._program.use()
    this._gl.bindVertexArray(this._vao)

    this._gl.activeTexture(this._gl.TEXTURE0)
    this._gl.bindTexture(this._gl.TEXTURE_2D, this._texture)
    this._program.uniform('tex', {
      setUniform: (gl, location) => gl.uniform1i(location, 0)
    })

    let lastTime = Date.now()
    const loop = () => {
      const currentTime = Date.now()
      const deltaTime = (currentTime - lastTime) / 1000
      lastTime = currentTime
    
      this._gl.clear(this._gl.COLOR_BUFFER_BIT | this._gl.DEPTH_BUFFER_BIT)
    
      this._program.uniform('view', this._camera.worldToCameraMatrix)
      this._program.uniform('projection', this._camera.projectionMatrix)
    
      this._rubics.render(this._program, this._gl, this._uvsVbo)
      this._rubics.update(deltaTime)
    
      this._frame = requestAnimationFrame(loop)
    }
    this._frame = requestAnimationFrame(loop)
  }

  public stop() {
    window.removeEventListener('resize', this._resizeHandler)
    cancelAnimationFrame(this._frame)
    this._inputHandler.removeEventListeners()
  }

  private static _getResizeHandler(rubicsCube: RubicsCube) {
    return () => {
      const width = window.innerWidth
      const height = window.innerHeight
    
      debug.setSize(width, height)
    
      rubicsCube._canvas.width = width
      rubicsCube._canvas.height = height
      rubicsCube._gl.viewport(0, 0, width, height)
    
      rubicsCube._camera.screenSize(width, height)
    }
  }

  private _initialize() {
    const canvas = document.querySelector(`[${this._canvasData}]`)
    if (!canvas) {
      throw new Error(`<canvas ${this._canvasData}> does not exist`)
    }
    if (!(canvas instanceof HTMLCanvasElement)) {
      throw new Error(`<canvas ${this._canvasData}> is not a canvas, it is a <${canvas.tagName}>`)
    }
    this._canvas = canvas

    const gl = canvas.getContext('webgl2')
    if (!gl) {
      throw new Error(`cannot create webgl2 context`)
    }
    this._gl = gl

    gl.enable(gl.DEPTH_TEST)
    gl.depthFunc(gl.LESS)
    
    this._program = new Program('RubicsCube/Shaders/facelet.glsl', vertex, fragment, gl)

    const vao = gl.createVertexArray()
    if (!vao) {
      throw new Error('could not create a webgl vertex array object')
    }
    this._vao = vao
    gl.bindVertexArray(vao)

    const vertices = [
      0,  .5,  .5,
      0,  .5, -.5,
      0, -.5, -.5,
      0, -.5,  .5
    ]
    const verticesBuffer = new Float32Array(vertices)
    const verticesVbo = gl.createBuffer()

    const indices = [
      0, 1, 3,
      1, 3, 2
    ]
    const indicesBuffer = new Int8Array(indices)
    const ebo = gl.createBuffer()

    const uvsVbo = gl.createBuffer()

    if (!verticesVbo || !ebo || !uvsVbo) {
      throw new Error('could not create a vertex buffer objects')
    }
    this._uvsVbo = uvsVbo

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ebo)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer, gl.STATIC_DRAW)
    
    gl.bindBuffer(gl.ARRAY_BUFFER, verticesVbo)
    gl.bufferData(gl.ARRAY_BUFFER, verticesBuffer, gl.STATIC_DRAW)
    
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 12, 0)
    gl.enableVertexAttribArray(0)
    gl.enableVertexAttribArray(1)

    gl.bindVertexArray(null)

    const texture = gl.createTexture()
    if (!texture) {
      throw new Error('could not create a texture')
    }
    this._texture = texture
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      this._image
    )
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
    gl.bindTexture(gl.TEXTURE_2D, null)

    const hoveringColors = this._hoveringColors.map(([r, g, b]) => new V3(r, g, b))
    this._camera = new Camera(new V3(0, 0, -10), V3.zero, V3.up, 45, window.innerWidth, window.innerHeight, .1, 100)
    this._rubics = new Rubics(Quaternion.identity, this._uvs, hoveringColors, this._turnHandler.bind(this))
    this._inputHandler = new InputHandler(canvas, this._rubics, this._camera)
  }

  public get transform() {
    return this._rubics.transform
  }

  private _listeners = new Map<string, Set<(event: any) => void>>()
  public on<Name extends keyof Events>(name: Name, callback: (event: Events[Name]) => void) {
    const set = this._listeners.get(name) ?? new Set()
    set.add(callback)
    this._listeners.set(name, set)
  }
  private _turnHandler(event: Events['turn']) {
    const set = this._listeners.get('turn')
    if (set) {
      set.forEach(callback => callback(event))
    }
  }
}

type Events = {
  turn: {axis: number, index: number, angle: number}
}