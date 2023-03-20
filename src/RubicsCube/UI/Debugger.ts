import {V2} from '../Math/Vector'

class Debugger {
  private _ctx?: CanvasRenderingContext2D
  private _canvas?: HTMLCanvasElement

  private _strokeColor = 'white'
  private _fillColor = 'white'

  public constructor(canvas: Element | null) {
    if (!canvas) {
      return
    }

    if (!(canvas instanceof HTMLCanvasElement)) {
      throw new Error(`rubics cube debugger is not a canvas, it is a <${canvas.tagName}>`)
    }
    this._canvas = canvas

    const ctx = canvas.getContext('2d')
    if (!ctx)
      throw new Error('cannot create 2d context for rubics cube debugger')
    this._ctx = ctx
  }

  public clear() {
    if (this._ctx && this._canvas) {
      this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height)
    }
  }

  public stroke(color: string) {
    this._strokeColor = color
  }

  public fill(color: string) {
    this._fillColor = color
  }

  public line(from: V2, to: V2) {
    if (this._ctx && this._canvas) {
      this._ctx.strokeStyle = this._strokeColor
      this._ctx.lineWidth = 3
      const fromF = Debugger._flipVector(from, this._canvas)
      const toF = Debugger._flipVector(to, this._canvas)
      this._ctx.beginPath()
      this._ctx.moveTo(fromF.x, fromF.y)
      this._ctx.lineTo(toF.x, toF.y)
      this._ctx.stroke()
    }
  }

  public vector(origin: V2, direction: V2, length: number = 1) {
    this.line(origin, origin.add(direction.scale(length)))
  }

  public setSize(width: number, height: number) {
    if (this._canvas) {
      this._canvas.width = width
      this._canvas.height = height
    }
  }

  private static _flipVector({x, y}: V2, canvas: HTMLCanvasElement) {
    return new V2(x, canvas.height - y)
  }

  public text(pos: V2, text: string) {
    if (this._ctx) {
      this._ctx.fillStyle = this._fillColor
      this._ctx.fillText(text, pos.x, pos.y)
    }
  }
}


export default new Debugger(document.querySelector('[data-rubics-cube-debug]'))