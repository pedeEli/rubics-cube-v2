export type Turn = 'R' | 'L' | 'U' | 'D' | 'F' | 'B'

export type Corner = 'URF' | 'ULF' | 'ULB' | 'URB' | 'DRF' | 'DLF' | 'DLB' | 'DRB'
export type CornerOrientation = 0 | 1 | 2

export type Edge = 'UF' | 'UL' | 'UB' | 'UR' | 'FR' | 'FL' | 'BL' | 'BR' | 'DF' | 'DL' | 'DB' | 'DR'
export type EdgeOrientation = 0 | 1

export type Events = {
	change: import('.').State
}