export type TurnBase = UD | RL | FB
export type Turn = TurnBase | `${TurnBase}2` | `${TurnBase}'`

export type UD = 'U' | 'D'
export type RL = 'R' | 'L'
export type FB = 'F' | 'B'

export type Corner = `${UD}${RL}${FB}`
export type CornerOrientation = 0 | 1 | 2

export type Edge = `${UD}${FB | RL}` | `${FB}${RL}`
export type EdgeOrientation = 0 | 1

export type Events = {
	change: import('.').State
}