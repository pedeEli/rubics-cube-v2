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
  public static order: Corner[] = ['URF', 'ULF', 'ULB', 'URB', 'DRF', 'DLF', 'DLB', 'DRB']

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

  public cornerToPosition(corner: Corner) {
    return [...corner].reduce((vec, char) => {
      if (char === 'U') {
        vec.y = 2
      } else if (char === 'L') {
        vec.x = 2
      } else if (char === 'B') {
        vec.z = 2
      }
      return vec
    }, new V3(0, 0, 0))
  }
}