import {Ray} from './ray'
// import debug from './debugger'

import {V2, V3} from '../math/vector'
import {clamp} from '../math/utils'


export class InputHandler {
  /** @type {HTMLCanvasElement} */
  #canvas
  /** @type {import('./Rubics').Rubics} */
  #rubics
  /** @type {import('./camera').Camera} */
  #camera
  /** @readonly */
  #maxZoom = 40
  /** @readonly */
  #minZoom = 10

  /**
   * @param {HTMLCanvasElement} canvas
   * @param {import('./Rubics').Rubics} rubics
   * @param {import('./camera').Camera} camera
   */
  constructor(canvas, rubics, camera) {
    this.#canvas = canvas
    this.#rubics = rubics
    this.#camera = camera
  }

  addEventListeners() {
    this.#canvas.addEventListener('pointermove', this.#pointerMove)
    this.#canvas.addEventListener('pointerdown', this.#pointerDown)
    this.#canvas.addEventListener('pointerup', this.#pointerUp)
    this.#canvas.addEventListener('pointerleave', this.#pointerLeave)
    this.#canvas.addEventListener('wheel', this.#wheel)
  }

  removeEventListeners() {
    this.#canvas.removeEventListener('pointermove', this.#pointerMove)
    this.#canvas.removeEventListener('pointerdown', this.#pointerDown)
    this.#canvas.removeEventListener('pointerup', this.#pointerUp)
    this.#canvas.removeEventListener('pointerleave', this.#pointerLeave)
    this.#canvas.removeEventListener('wheel', this.#wheel)
  }


  /** @type {Map<number, PointerEvent>} */
  #pointers = new Map()
  /** @type {import('../types').Action} */
  #action = {type: 'none'}

  /** @param {import('../types').Action} action */
  #setAction(action) {
    if (this.#action.type === 'hovering') {
      this.#action.facelet.hovering = false
    }
    if (action.type === 'hovering') {
      action.facelet.hovering = true
    }
    if (this.#action.type === 'rotatingSide' && this.#action.side) {
      const info = this.#action[this.#action.side]
      const angle = Math.round(info.angle / 90)
      this.#rubics.finishRotation(info.axis, info.index, angle, this.#action.facelet.side)
    }
    this.#action = action
  }

  // event handlers
  #pointerDown = InputHandler.#getPointerDown(this)
  /** @param {InputHandler} inputHandler */
  static #getPointerDown(inputHandler) {
    return (/** @type {PointerEvent}*/ event) => {
      const {offsetX, offsetY, pointerId} = event
      if (event.button === 0) {
        inputHandler.#pointers.set(pointerId, event)
      } else if (event.button === 1) {
        inputHandler.#pointers.set(pointerId, event)
        inputHandler.#setAction({
          type: 'rotatingCube',
          mouse: new V2(offsetX, offsetY)
        })
        return
      }
  
      if (inputHandler.#pointers.size === 1) {
        if (inputHandler.#rubics.isTurning) {
          return
        }
        if (inputHandler.#action.type === 'none') {
          inputHandler.#actionHovering(offsetX, offsetY)
        }
        if (inputHandler.#action.type === 'hovering') {
          inputHandler.#startActionRotatingSide(offsetX, offsetY, inputHandler.#action.facelet)
          return
        }
        inputHandler.#startActionRotatingCube(offsetX, offsetY)
      } else if (inputHandler.#pointers.size === 2) {
        inputHandler.#startActionGesture()
      }
    }
  }
  #pointerMove = InputHandler.#getPointerMove(this)
  /** @param {InputHandler} inputHandler */
  static #getPointerMove(inputHandler) {
    return (/** @type {PointerEvent} */ event) => {
      const {offsetX, offsetY} = event
  
      if (inputHandler.#pointers.size === 0) {
        inputHandler.#actionHovering(offsetX, offsetY)
        return
      }
      inputHandler.#pointers.set(event.pointerId, event)
  
      inputHandler.#actionRotatingSide(offsetX, offsetY)
      inputHandler.#actionRotatingCube(offsetX, offsetY)
      inputHandler.#actionGesture()
    }
  }
  #pointerUp = InputHandler.#getPointerUp(this)
  /** @param {InputHandler} inputHandler */
  static #getPointerUp(inputHandler) {
    return () => {
      inputHandler.#pointers.clear()
      inputHandler.#setAction({
        type: 'none'
      })
    }
  }
  #pointerLeave = InputHandler.#getPointerLeave(this)
  /** @param {InputHandler} inputHandler */
  static #getPointerLeave(inputHandler) {
    return () => {
      inputHandler.#pointers.clear()
      inputHandler.#setAction({
        type: 'none'
      })
    }
  }
  #wheel = InputHandler.#getWheel(this)
  /** @param {InputHandler} inputHandler */
  static #getWheel(inputHandler) {
    return (/** @type {WheelEvent} */ {deltaY, deltaMode}) => {
      if (deltaMode !== WheelEvent.DOM_DELTA_PIXEL) {
        return
      }
      const d = clamp(deltaY / 102, -1, 1) * .1
      inputHandler.#zoomCube(d)
    }
  }

  // actions
  // rotating side
  /**
   * @param {number} offsetX
   * @param {number} offsetY
   * @param {import('./facelet').Facelet} hovering
   */
  #startActionRotatingSide(offsetX, offsetY, hovering) {
    const {left, top, topLeft} = hovering.transform

    const screenTopLeft = this.#camera.worldToScreen(topLeft)
    const screenBottomLeft = this.#camera.worldToScreen(topLeft.add(left))
    const screenTopRight = this.#camera.worldToScreen(topLeft.add(top))
    const rightDir = screenTopRight.sub(screenTopLeft).normalized
    const downDir = screenBottomLeft.sub(screenTopLeft).normalized

    const rubicsRotation = this.#rubics.transform

    const side = hovering.side
    const currentAxis = Math.floor(side / 2)
    const cubie = hovering.transform.parent
    const [axis1, axis2] = [0, 1, 2]
      .filter(axis => axis !== currentAxis)
      .map(axis => {
        const rotationAxis = V3.getRotationAxis(axis)
        const rubicsRotationAxis = rubicsRotation.apply(rotationAxis)
        const index = Math.floor(cubie.index / Math.pow(3, axis)) % 3
        /** @type {import('../types').AxisInfo} */ 
        const info = {
          default: rubicsRotationAxis,
          inverted: rubicsRotationAxis.negate,
          axis,
          index
        }
        return info
      })

    const sideInvertMap = [
      false, true,
      true, false,
      false, true
    ]
    const invert = sideInvertMap[hovering.side]
    
    const mouse = new V2(offsetX, this.#canvas.height - offsetY)
    if (Math.abs(axis1.default.dot(top)) > .99) {
      this.#setAction({
        type: 'rotatingSide',
        mouse,
        down: this.#getTurnDirection(axis1, top, downDir, true !== invert),
        right: this.#getTurnDirection(axis2, left, rightDir, false !== invert),
        side: null,
        facelet: hovering
      })
    } else {
      this.#setAction({
        type: 'rotatingSide',
        mouse,
        down: this.#getTurnDirection(axis2, top, downDir, true !== invert),
        right: this.#getTurnDirection(axis1, left, rightDir, false !== invert),
        side: null,
        facelet: hovering
      })
    }
  }
  /**
   * @param {number} offsetX
   * @param {number} offsetY
   */
  #actionRotatingSide(offsetX, offsetY) {
    if (this.#action.type !== 'rotatingSide') {
      return
    }

    const mouse = new V2(offsetX, this.#canvas.height - offsetY)
    if (this.#action.mouse.sub(mouse).mag < 10) {
      return
    }

    const initialMouse = this.#action.mouse
    if (this.#action.side) {
      this.#rotateSide(mouse, this.#action[this.#action.side], initialMouse)
      return
    }

    const {right, down} = this.#action
    const mouseDir = mouse.sub(initialMouse).normalized
    const rightDot = right.dir.dot(mouseDir)
    const downDot = down.dir.dot(mouseDir)
    if (Math.abs(rightDot) > Math.abs(downDot)) {
      this.#action.side = 'right'
      this.#rubics.startRotation(right.cubies, right.rotationAxis)
      this.#rotateSide(mouse, right, initialMouse)
    } else {
      this.#action.side = 'down'
      this.#rubics.startRotation(down.cubies, down.rotationAxis)
      this.#rotateSide(mouse, down, initialMouse)
    }
  }
  // rotating cube
  /**
   * @param {number} offsetX
   * @param {number} offsetY
   */
  #startActionRotatingCube(offsetX, offsetY) {
    this.#setAction({
      type: 'rotatingCube',
      mouse: new V2(offsetX, offsetY)
    })
  }
  /**
   * @param {number} offsetX
   * @param {number} offsetY
   */
  #actionRotatingCube(offsetX, offsetY) {
    if (this.#action.type !== 'rotatingCube') {
      return
    }

    const mouse = new V2(offsetX, offsetY)
    const delta = mouse.sub(this.#action.mouse)
    this.#action.mouse = mouse
    this.#rotateCube(delta)
  }
  // two pointer gesture
  #startActionGesture() {
    const [e1, e2] = this.#pointers.values()
    const dx = e1.screenX - e2.screenX
    const dy = e1.screenY - e2.screenY
    this.#setAction({
      type: 'gesture',
      distance: dx * dx + dy * dy,
      center: new V2(e1.screenX + e2.screenX, e1.screenY + e2.screenY).scale(.5)
    })
  }
  #actionGesture() {
    if (this.#action.type !== 'gesture') {
      return
    }

    const [e1, e2] = this.#pointers.values()

    const dx = e1.screenX - e2.screenX
    const dy = e1.screenY - e2.screenY
    const distance = dx * dx + dy * dy
    const deltaDistance = distance - this.#action.distance
    this.#action.distance = distance
    const d = clamp(deltaDistance / 1000, -1, 1) * -.02
    this.#zoomCube(d)

    const center = new V2(e1.screenX + e2.screenX, e1.screenY + e2.screenY).scale(.5)
    const deltaCenter = center.sub(this.#action.center)
    this.#action.center = center
    this.#rotateCube(deltaCenter)
  }
  // hovering
  /**
   * @param {number} offsetX
   * @param {number} offsetY
   */
  #actionHovering(offsetX, offsetY) {
    const ray = new Ray(this.#camera, offsetX, offsetY, window.innerWidth, window.innerHeight)
    const facelets = ray.intersectRubics(this.#rubics)
    if (facelets.length) {
      facelets.sort((a, b) => a.d - b.d)
      this.#setAction({
        type: 'hovering',
        facelet: facelets[0].facelet
      })
    } else {
      this.#setAction({
        type: 'none'
      })
    }
  }

  // action helpers
  // rotating side
  /**
   * @param {import('../types').AxisInfo} axisInfo
   * @param {V3} vector
   * @param {V2} dir
   * @param {boolean} invert
   * @returns {import('../types').SideInfo}
   */
  #getTurnDirection(axisInfo, vector, dir, invert) {
    if (axisInfo.default.dot(vector) > .99)
      return {
        dir,
        angle: 0,
        axis: axisInfo.axis,
        rotationAxis: V3.getRotationAxis(axisInfo.axis).scale(invert ? -1 : 1),
        index: axisInfo.index,
        cubies: this.#rubics.getPlane(axisInfo.axis, axisInfo.index)
      }

    return {
      dir,
      angle: 0,
      axis: axisInfo.axis,
      rotationAxis: V3.getRotationAxis(axisInfo.axis).scale(invert ? 1 : -1),
      index: axisInfo.index,
      cubies: this.#rubics.getPlane(axisInfo.axis, axisInfo.index)
    }
  }
  /**
   * @param {V2} mouse
   * @param {import('../types').SideInfo} info
   * @param {V2} initialMouse
   */
  #rotateSide(mouse, info, initialMouse) {
    const length = info.dir.dot(initialMouse.sub(mouse))
    const zoom = this.#getZoom()
    info.angle = length / (3 - zoom * 2)
    this.#rubics.rotateManual(info.angle)
  }
  // rotating cube
  /** @param {V2} delta */
  #rotateCube(delta) {
    if (delta.x === 0 && delta.y === 0) {
      return
    }

    const n = this.#camera.up.scale(delta.y).add(this.#camera.right.scale(delta.x))
    const axis = this.#camera.forward.cross(n)
    const zoom = this.#getZoom()
    const angle = Math.sqrt(delta.x * delta.x + delta.y * delta.y) * .3 + 2 * zoom
    this.#rubics.transform.rotate(axis, angle)
  }
  // zooming camera
  /** @param {number} d */
  #zoomCube(d) {
    const {position} = this.#camera
    this.#camera.position = new V3(0, 0, clamp(position.z * (1 + d), -this.#maxZoom, -this.#minZoom))
  }
  #getZoom() {
    const zoom = -this.#camera.position.z
    const minZoom = this.#minZoom
    const maxZoom = this.#maxZoom
    return (zoom - minZoom) / (maxZoom - minZoom)
  }
}