import {V2} from '../math/vector'

class Debugger {
  /** @type {CanvasRenderingContext2D?} */
  #ctx
  /** @type {HTMLCanvasElement?} */
  #canvas

  #strokeColor = 'white'
  #fillColor = 'white'

  /**
   * @param {Element?} canvas
   */
  constructor(canvas) {
    if (!canvas) {
      return
    }

    if (!(canvas instanceof HTMLCanvasElement)) {
      throw new Error(`rubiks cube debugger is not a canvas, it is a <${canvas.tagName}>`)
    }
    this.#canvas = canvas

    const ctx = canvas.getContext('2d')
    if (!ctx)
      throw new Error('cannot create 2d context for rubiks cube debugger')
    this.#ctx = ctx
  }

  clear() {
    if (this.#ctx && this.#canvas) {
      this.#ctx.clearRect(0, 0, this.#canvas.width, this.#canvas.height)
    }
  }

  /** @param {string} color */
  stroke(color) {
    this.#strokeColor = color
  }
  
  /** @param {string} color */
  fill(color) {
    this.#fillColor = color
  }

  /**
   * @param {V2} from
   * @param {V2} to
   */
  line(from, to) {
    if (this.#ctx && this.#canvas) {
      this.#ctx.strokeStyle = this.#strokeColor
      this.#ctx.lineWidth = 3
      const fromF = Debugger.#flipVector(from, this.#canvas)
      const toF = Debugger.#flipVector(to, this.#canvas)
      this.#ctx.beginPath()
      this.#ctx.moveTo(fromF.x, fromF.y)
      this.#ctx.lineTo(toF.x, toF.y)
      this.#ctx.stroke()
    }
  }

  /**
   * @param {V2} origin
   * @param {V2} direction
   * @param {number} [length=1]
   */
  vector(origin, direction, length = 1) {
    this.line(origin, origin.add(direction.scale(length)))
  }

  /**
   * @param {number} width
   * @param {number} height
   */
  setSize(width, height) {
    if (this.#canvas) {
      this.#canvas.width = width
      this.#canvas.height = height
    }
  }

  /**
   * @param {V2} v
   * @param {HTMLCanvasElement} canvas
   */
  static #flipVector({x, y}, canvas) {
    return new V2(x, canvas.height - y)
  }

  /**
   * @param {V2} pos
   * @param {string} text
   */
  text(pos, text) {
    if (this.#ctx) {
      this.#ctx.fillStyle = this.#fillColor
      this.#ctx.fillText(text, pos.x, pos.y)
    }
  }
}


export default new Debugger(document.querySelector('[data-rubiks-cube-debug]'))