import {Turn} from '.'
import {V3} from '../Math/Vector'

type Corner = 'URF' | 'ULF' | 'ULB' | 'URB' | 'DRF' | 'DLF' | 'DLB' | 'DRB'
type Orientation = 0 | 1 | 2

const permutations: Record<Turn, Corner[]> = {
  R: ['DRF', 'ULF', 'ULB', 'URF', 'DRB', 'DLF', 'DLB', 'URB'],
  L: ['URF', 'ULB', 'DLB', 'URB', 'DRF', 'ULF', 'DLF', 'DRB'],
  U: ['URB', 'URF', 'ULF', 'ULB', 'DRF', 'DLF', 'DLB', 'DRB'],
  D: ['URF', 'ULF', 'ULB', 'URB', 'DLF', 'DLB', 'DRB', 'DRF'],
  F: ['ULF', 'DLF', 'ULB', 'URB', 'URF', 'DRF', 'DLB', 'DRB'],
  B: ['URF', 'ULF', 'URB', 'DRB', 'DRF', 'DLF', 'ULB', 'DLB']
}

const orientations: Record<Turn, Orientation[]> = {
  R: [2, 0, 0, 1, 1, 0, 0, 2],
  L: [0, 1, 2, 0, 0, 2, 1, 0],
  U: [0, 0, 0, 0, 0, 0, 0, 0],
  D: [0, 0, 0, 0, 0, 0, 0, 0],
  F: [1, 2, 0, 0, 2, 1, 0, 0],
  B: [0, 0, 1, 2, 0, 0, 2, 1]
}

export class Corners {
  public static order = ['URF', 'ULF', 'ULB', 'URB', 'DRF', 'DLF', 'DLB', 'DRB'] as const

  public permutation = [...Corners.order]
  public orientation = Array<Orientation>(8).fill(0)

  public apply(turn: Turn) {
    const appliedPermutation = permutations[turn]
    const appliedOrientation = orientations[turn]

    const permutation = [...this.permutation]
    const orientation = [...this.orientation]
    
    for (let i = 0; i < 8; i++) {
      const newPermutation = appliedPermutation[i]
      const orderIndex = Corners.order.indexOf(newPermutation)
      this.permutation[i] = permutation[orderIndex]
      const newOrientation = (appliedOrientation[i] + orientation[orderIndex]) % 3
      this.orientation[i] = newOrientation as Orientation
    }
  }

  public static cornerToPosition(corner: Corner) {
    return new V3(
      corner[1] === 'R' ? 0 : 2,
      corner[0] === 'D' ? 0 : 2,
      corner[2] === 'F' ? 0 : 2
    )
  }

  public stringify() {
    const permutation = this.permutation.join('.')
    const orientation = this.orientation.join('.')
    return `${permutation}_${orientation}`
  }

  public parse(str: string) {
    const [p, o] = str.split('_')
    const permutation = Corners._parsePermutation(p)
    if (permutation === null) {
      return
    }
    const orientation = Corners._parseOrientation(o)
    if (orientation === null) {
      return
    }
    this.permutation = permutation
    this.orientation = orientation
  }

  private static _parsePermutation(str: string): Corner[] | null {
    const parts = str.split('.')
    if (parts.length !== 8) {
      return null
    }
    const check = Array(8).fill(false)
    for (let i = 0; i < 8; i++) {
      const index = Corners.order.indexOf(parts[i] as Corner)
      if (index === -1 || check[index]) {
        return null
      }
      check[index] = true
    }
    return parts as Corner[]
  }
  private static _parseOrientation(str: string): Orientation[] | null {
    const parts = str.split('.').map(Number)
    if (parts.length !== 8) {
      return null
    }
    let sum = 0
    for (let i = 0; i < 8; i++) {
      const part = parts[i]
      if (part < 0 || part > 2) {
        return null
      }
      sum += part
    }
    if (sum % 3 !== 0) {
      return null
    }
    return parts as Orientation[]
  }
}