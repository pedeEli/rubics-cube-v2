import type {Facelet} from './ui/facelet'
import type {Cubie} from './ui/cubie'

import type {V2, V3} from './math/vector'

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
  side: 'right' | 'down' | null,
  facelet: Facelet
} | {
  type: 'gesture',
  center: V2,
  distance: number
}


export interface Uniform {
  setUniform(gl: WebGL2RenderingContext, location: WebGLUniformLocation): void
}


export type Events = {
  turn: {axis: number, index: number, angle: number},
  state: string
}