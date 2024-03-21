import {V3} from './Math/Vector'
import {Quaternion} from './Math/Quarternion'

import {Program} from './UI/Program'
import {Camera} from './UI/Camera'
import {Rubics} from './UI/Rubics'
import {InputHandler} from './UI/InputHandler'
import debug from './UI/Debugger'

import {vertex, fragment} from './Shaders/facelet.glsl'

/** @typedef {import('./types').Events} Events */

export class RubicsCube {
  #initialized = false
  
	/** @type {WebGL2RenderingContext} */
  #gl
	/** @type {HTMLCanvasElement} */
  #canvas
	/** @type {Program} */
  #program
	/** @type {WebGLVertexArrayObject} */
  #vao
	/** @type {WebGLBuffer} */
  #uvsVbo
	/** @type {WebGLTexture} */
  #texture

	/** @type {Camera} */
  #camera
	/** @type {Rubics} */
  #rubics
	/** @type {InputHandler} */
  #inputHandler

  #frame = 0
  #resizeHandler = RubicsCube.#getResizeHandler(this)

	/** @type {string} */
	#canvasData
	/** @type {ImageData | HTMLImageElement} */
	#image
	/** @type {number[][][]} */
	#uvs
	/** @type {number[][]} */
	#hoveringColors

	/**
	 * @param {string} canvasData
	 * @param {ImageData | HTMLImageElement} image
	 * @param {number[][][]} uvs
	 * @param {number[][]} hoveringColors
	 */
  constructor(canvasData, image, uvs, hoveringColors) {
		this.#canvasData = canvasData
		this.#image = image
		this.#uvs = uvs
		this.#hoveringColors = hoveringColors
	}

  start() {
    if (!this.#initialized) {
      this.#initialize()
      this.#initialized = true
    }

    this.#inputHandler.addEventListeners()
  
    window.addEventListener('resize', this.#resizeHandler)
    this.#resizeHandler()

    this.#program.use()
    this.#gl.bindVertexArray(this.#vao)

    this.#gl.activeTexture(this.#gl.TEXTURE0)
    this.#gl.bindTexture(this.#gl.TEXTURE_2D, this.#texture)
    this.#program.uniform('tex', {
      setUniform: (gl, location) => gl.uniform1i(location, 0)
    })

    let lastTime = Date.now()
    const loop = () => {
      const currentTime = Date.now()
      const deltaTime = (currentTime - lastTime) / 1000
      lastTime = currentTime
    
      this.#gl.clear(this.#gl.COLOR_BUFFER_BIT | this.#gl.DEPTH_BUFFER_BIT)
    
      this.#program.uniform('view', this.#camera.worldToCameraMatrix)
      this.#program.uniform('projection', this.#camera.projectionMatrix)
    
      this.#rubics.render(this.#program, this.#gl, this.#uvsVbo)
      this.#rubics.update(deltaTime)
    
      this.#frame = requestAnimationFrame(loop)
    }
    this.#frame = requestAnimationFrame(loop)
  }

  stop() {
    window.removeEventListener('resize', this.#resizeHandler)
    cancelAnimationFrame(this.#frame)
    this.#inputHandler.removeEventListeners()
  }

	/**
	 * @param {RubicsCube} rubicsCube
		* @returns {() => void}
	 */
  static #getResizeHandler(rubicsCube) {
    return () => {
      const width = window.innerWidth
      const height = window.innerHeight
    
      debug.setSize(width, height)
    
      rubicsCube.#canvas.width = width
      rubicsCube.#canvas.height = height
      rubicsCube.#gl.viewport(0, 0, width, height)
    
      rubicsCube.#camera.screenSize(width, height)
    }
  }

  #initialize() {
    const canvas = document.querySelector(`[${this.#canvasData}]`)
    if (!canvas) {
      throw new Error(`<canvas ${this.#canvasData}> does not exist`)
    }
    if (!(canvas instanceof HTMLCanvasElement)) {
      throw new Error(`<canvas ${this.#canvasData}> is not a canvas, it is a <${canvas.tagName}>`)
    }
    this.#canvas = canvas

    const gl = canvas.getContext('webgl2')
    if (!gl) {
      throw new Error(`cannot create webgl2 context`)
    }
    this.#gl = gl

    gl.enable(gl.DEPTH_TEST)
    gl.depthFunc(gl.LESS)
    
    this.#program = new Program('RubicsCube/Shaders/facelet.glsl', vertex, fragment, gl)

    const vao = gl.createVertexArray()
    if (!vao) {
      throw new Error('could not create a webgl vertex array object')
    }
    this.#vao = vao
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
    this.#uvsVbo = uvsVbo

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
    this.#texture = texture
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      this.#image
    )
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
    gl.bindTexture(gl.TEXTURE_2D, null)

    const hoveringColors = this.#hoveringColors.map(([r, g, b]) => new V3(r, g, b))
    this.#camera = new Camera(new V3(0, 0, -10), V3.zero, V3.up, 45, window.innerWidth, window.innerHeight, .1, 100)
    this.#rubics = new Rubics(Quaternion.identity, this.#uvs, hoveringColors, this.#turnHandler.bind(this))
    this.#inputHandler = new InputHandler(canvas, this.#rubics, this.#camera)
  }

  get transform() {
    return this.#rubics.transform
  }

	/** @type {Map<keyof Events, Set<(event: any) => void>>} */
  #listeners = new Map()
	/**
	 * @template {keyof Events} Name
	 * @param {Name} name
	 * @param {(event: Events[Name]) => void} callback
	 */
  on(name, callback) {
    const set = this.#listeners.get(name) ?? new Set()
    set.add(callback)
    this.#listeners.set(name, set)
  }
	/**
	 * @param {Events['turn']} event
	 */
  #turnHandler(event) {
    const set = this.#listeners.get('turn')
    if (set) {
      set.forEach(callback => callback(event))
    }
  }
}