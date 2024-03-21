import type {Facelet} from './UI/Facelet'
import type {Cubie} from './UI/Cubie'

import type {V2, V3} from './Math/Vector'

export type AxisInfo = {
  default: V3
  inverted: V3
  axis: number
  index: number
}

export type SideInfo = {
  dir: V2
  axis: number
  rotationAxis: V3
  index: number
  angle: number
  cubies: Cubie[]
}

export type Action = {
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


export interface Uniform {
  setUniform(gl: WebGL2RenderingContext, location: WebGLUniformLocation): void
}


export type Events = {
  turn: {axis: number, index: number, angle: number}
}