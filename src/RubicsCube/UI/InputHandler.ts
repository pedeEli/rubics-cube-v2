import {Rubics} from './Rubics'
import {Camera} from './Camera'
import {Facelet} from './Facelet'
import {Cubie} from './Cubie'
import {Ray} from './Ray'
// import debug from './Debugger'

import {V2, V3} from '../Math/Vector'
import {clamp} from '../Math/Utils'


interface AxisInfo {
  default: V3
  inverted: V3
  axis: number
  index: number
}

interface SideInfo {
  dir: V2
  axis: number
  rotationAxis: V3
  index: number
  angle: number
  cubies: Cubie[]
}

type Action = {
  type: 'none'
} | {
  type: 'hovering',
  facelet: Facelet
} | {
  type: 'rotatingCube',
  mouse: V2
} | {
  type: 'rotatingSide',
  mouse: V2,
  right: SideInfo,
  down: SideInfo,
  side: 'right' | 'down' | null
} | {
  type: 'gesture',
  center: V2,
  distance: number
}

export class InputHandler {
  private _canvas: HTMLCanvasElement
  private _rubics: Rubics
  private _camera: Camera
  private readonly _maxZoom = 40
  private readonly _minZoom = 10

  public constructor(canvas: HTMLCanvasElement, rubics: Rubics, camera: Camera) {
    this._canvas = canvas
    this._rubics = rubics
    this._camera = camera
  }

  public addEventListeners() {
    this._canvas.addEventListener('pointermove', this._pointerMove)
    this._canvas.addEventListener('pointerdown', this._pointerDown)
    this._canvas.addEventListener('pointerup', this._pointerUp)
    this._canvas.addEventListener('pointerleave', this._pointerLeave)
    this._canvas.addEventListener('wheel', this._wheel)
  }

  public removeEventListeners() {
    this._canvas.removeEventListener('pointermove', this._pointerMove)
    this._canvas.removeEventListener('pointerdown', this._pointerDown)
    this._canvas.removeEventListener('pointerup', this._pointerUp)
    this._canvas.removeEventListener('pointerleave', this._pointerLeave)
    this._canvas.removeEventListener('wheel', this._wheel)
  }


  private _pointers = new Map<number, PointerEvent>()
  private _action: Action = {type: 'none'}

  private _setAction(action: Action) {
    if (this._action.type === 'hovering') {
      this._action.facelet.hovering = false
    }
    if (action.type === 'hovering') {
      action.facelet.hovering = true
    }
    if (this._action.type === 'rotatingSide' && this._action.side) {
      const info = this._action[this._action.side]
      const angle = Math.round(info.angle / 90)
      this._rubics.finishRotation(info.axis, info.index, angle)
    }
    this._action = action
  }

  // event handlers
  private _pointerDown = InputHandler._getPointerDown(this)
  private static _getPointerDown(inputHandler: InputHandler) {
    return (event: PointerEvent) => {
      const {offsetX, offsetY, pointerId} = event
      if (event.button === 0) {
        inputHandler._pointers.set(pointerId, event)
      } else if (event.button === 1) {
        inputHandler._pointers.set(pointerId, event)
        inputHandler._setAction({
          type: 'rotatingCube',
          mouse: new V2(offsetX, offsetY)
        })
        return
      }
  
      if (inputHandler._pointers.size === 1) {
        if (inputHandler._rubics.isTurning) {
          return
        }
        if (inputHandler._action.type === 'none') {
          inputHandler._actionHovering(offsetX, offsetY)
        }
        if (inputHandler._action.type === 'hovering') {
          inputHandler._startActionRotatingSide(offsetX, offsetY, inputHandler._action.facelet)
          return
        }
        inputHandler._startActionRotatingCube(offsetX, offsetY)
      } else if (inputHandler._pointers.size === 2) {
        inputHandler._startActionGesture()
      }
    }
  }
  private _pointerMove = InputHandler._getPointerMove(this)
  private static _getPointerMove(inputHandler: InputHandler) {
    return (event: PointerEvent) => {
      const {offsetX, offsetY} = event
  
      if (inputHandler._pointers.size === 0) {
        inputHandler._actionHovering(offsetX, offsetY)
        return
      }
      inputHandler._pointers.set(event.pointerId, event)
  
      inputHandler._actionRotatingSide(offsetX, offsetY)
      inputHandler._actionRotatingCube(offsetX, offsetY)
      inputHandler._actionGesture()
    }
  }
  private _pointerUp = InputHandler._getPointerUp(this)
  private static _getPointerUp(inputHandler: InputHandler) {
    return () => {
      inputHandler._pointers.clear()
      inputHandler._setAction({
        type: 'none'
      })
    }
  }
  private _pointerLeave = InputHandler._getPointerLeave(this)
  private static _getPointerLeave(inputHandler: InputHandler) {
    return () => {
      inputHandler._pointers.clear()
      inputHandler._setAction({
        type: 'none'
      })
    }
  }
  private _wheel = InputHandler._getWheel(this)
  private static _getWheel(inputHandler: InputHandler) {
    return ({deltaY, deltaMode}: WheelEvent) => {
      if (deltaMode !== WheelEvent.DOM_DELTA_PIXEL) {
        return
      }
      const d = clamp(deltaY / 102, -1, 1) * .1
      inputHandler._zoomCube(d)
    }
  }

  // actions
  // rotating side
  private _startActionRotatingSide(offsetX: number, offsetY: number, hovering: Facelet) {
    const {left, top, topLeft} = hovering.transform

    const screenTopLeft = this._camera.worldToScreen(topLeft)
    const screenBottomLeft = this._camera.worldToScreen(topLeft.add(left))
    const screenTopRight = this._camera.worldToScreen(topLeft.add(top))
    const rightDir = screenTopRight.sub(screenTopLeft).normalized
    const downDir = screenBottomLeft.sub(screenTopLeft).normalized

    const rubicsRotation = this._rubics.transform

    const side = hovering.side
    const currentAxis = Math.floor(side / 2)
    const cubie = hovering.transform.parent
    const [axis1, axis2] = [0, 1, 2]
      .filter(axis => axis !== currentAxis)
      .map<AxisInfo>(axis => {
        const rotationAxis = V3.getRotationAxis(axis)
        const rubicsRotationAxis = rubicsRotation.apply(rotationAxis)
        const index = Math.floor(cubie.index / Math.pow(3, axis)) % 3
        return {
          default: rubicsRotationAxis,
          inverted: rubicsRotationAxis.negate,
          axis,
          index
        }
      })
    
    const mouse = new V2(offsetX, this._canvas.height - offsetY)
    if (Math.abs(axis1.default.dot(top)) > .99) {
      this._setAction({
        type: 'rotatingSide',
        mouse,
        down: this._getTurnDirection(axis1, top, downDir, true),
        right: this._getTurnDirection(axis2, left, rightDir, false),
        side: null
      })
    } else {
      this._setAction({
        type: 'rotatingSide',
        mouse,
        down: this._getTurnDirection(axis2, top, downDir, true),
        right: this._getTurnDirection(axis1, left, rightDir, false),
        side: null
      })
    }
  }
  private _actionRotatingSide(offsetX: number, offsetY: number) {
    if (this._action.type !== 'rotatingSide') {
      return
    }

    const mouse = new V2(offsetX, this._canvas.height - offsetY)
    if (this._action.mouse.sub(mouse).mag < 10) {
      return
    }

    const initialMouse = this._action.mouse
    if (this._action.side) {
      this._rotateSide(mouse, this._action[this._action.side], initialMouse)
      return
    }

    const {right, down} = this._action
    const mouseDir = mouse.sub(initialMouse).normalized
    const rightDot = right.dir.dot(mouseDir)
    const downDot = down.dir.dot(mouseDir)
    if (Math.abs(rightDot) > Math.abs(downDot)) {
      this._action.side = 'right'
      this._rubics.startRotation(right.cubies, right.rotationAxis)
      this._rotateSide(mouse, right, initialMouse)
    } else {
      this._action.side = 'down'
      this._rubics.startRotation(down.cubies, down.rotationAxis)
      this._rotateSide(mouse, down, initialMouse)
    }
  }
  // rotating cube
  private _startActionRotatingCube(offsetX: number, offsetY: number) {
    this._setAction({
      type: 'rotatingCube',
      mouse: new V2(offsetX, offsetY)
    })
  }
  private _actionRotatingCube(offsetX: number, offsetY: number) {
    if (this._action.type !== 'rotatingCube') {
      return
    }

    const mouse = new V2(offsetX, offsetY)
    const delta = mouse.sub(this._action.mouse)
    this._action.mouse = mouse
    this._rotateCube(delta)
  }
  // two pointer gesture
  private _startActionGesture() {
    const [e1, e2] = this._pointers.values()
    const dx = e1.screenX - e2.screenX
    const dy = e1.screenY - e2.screenY
    this._setAction({
      type: 'gesture',
      distance: dx * dx + dy * dy,
      center: new V2(e1.screenX + e2.screenX, e1.screenY + e2.screenY).scale(.5)
    })
  }
  private _actionGesture() {
    if (this._action.type !== 'gesture') {
      return
    }

    const [e1, e2] = this._pointers.values()

    const dx = e1.screenX - e2.screenX
    const dy = e1.screenY - e2.screenY
    const distance = dx * dx + dy * dy
    const deltaDistance = distance - this._action.distance
    this._action.distance = distance
    const d = clamp(deltaDistance / 1000, -1, 1) * -.02
    this._zoomCube(d)

    const center = new V2(e1.screenX + e2.screenX, e1.screenY + e2.screenY).scale(.5)
    const deltaCenter = center.sub(this._action.center)
    this._action.center = center
    this._rotateCube(deltaCenter)
  }
  // hovering
  private _actionHovering(offsetX: number, offsetY: number) {
    const ray = new Ray(this._camera, offsetX, offsetY, window.innerWidth, window.innerHeight)
    const facelets = ray.intersectRubics(this._rubics)
    if (facelets.length) {
      facelets.sort((a, b) => a.d - b.d)
      this._setAction({
        type: 'hovering',
        facelet: facelets[0].facelet
      })
    } else {
      this._setAction({
        type: 'none'
      })
    }
  }

  // action helpers
  // rotating side
  private _getTurnDirection(axisInfo: AxisInfo, vector: V3, dir: V2, invert: boolean): SideInfo {
    if (axisInfo.default.dot(vector) > .99)
      return {
        dir,
        angle: 0,
        axis: axisInfo.axis,
        rotationAxis: V3.getRotationAxis(axisInfo.axis).scale(invert ? -1 : 1),
        index: axisInfo.index,
        cubies: this._rubics.getPlane(axisInfo.axis, axisInfo.index)
      }

    return {
      dir,
      angle: 0,
      axis: axisInfo.axis,
      rotationAxis: V3.getRotationAxis(axisInfo.axis).scale(invert ? 1 : -1),
      index: axisInfo.index,
      cubies: this._rubics.getPlane(axisInfo.axis, axisInfo.index)
    }
  }
  private _rotateSide(mouse: V2, info: SideInfo, initialMouse: V2) {
    const length = info.dir.dot(initialMouse.sub(mouse))
    const zoom = this._getZoom()
    info.angle = length / (3 - zoom * 2)
    this._rubics.rotateManual(info.angle)
  }
  // rotating cube
  private _rotateCube(delta: V2) {
    if (delta.x === 0 && delta.y === 0) {
      return
    }

    const n = this._camera.up.scale(delta.y).add(this._camera.right.scale(delta.x))
    const axis = this._camera.forward.cross(n)
    const zoom = this._getZoom()
    const angle = Math.sqrt(delta.x * delta.x + delta.y * delta.y) * .3 + 2 * zoom
    this._rubics.transform.rotate(axis, angle)
  }
  // zooming camera
  private _zoomCube(d: number) {
    const {position} = this._camera
    this._camera.position = new V3(0, 0, clamp(position.z * (1 + d), -this._maxZoom, -this._minZoom))
  }
  private _getZoom() {
    const zoom = -this._camera.position.z
    const minZoom = this._minZoom
    const maxZoom = this._maxZoom
    return (zoom - minZoom) / (maxZoom - minZoom)
  }
}