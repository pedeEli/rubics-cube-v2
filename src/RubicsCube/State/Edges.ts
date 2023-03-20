import {Turn} from '.'
import {V3} from '../Math/Vector'

type Edge = 'UF' | 'UL' | 'UB' | 'UR' | 'FR' | 'FL' | 'BL' | 'BR' | 'DF' | 'DL' | 'DB' | 'DR'
type Orientation = 0 | 1

const permutations: Record<Turn, Edge[]> = {
  R: ['UF', 'UL', 'UB', 'FR', 'DR', 'FL', 'BL', 'UR', 'DF', 'DL', 'DB', 'BR'],
  L: ['UF', 'BL', 'UB', 'UR', 'FR', 'UL', 'DL', 'BR', 'DF', 'FL', 'DB', 'DR'],
  U: ['UR', 'UF', 'UL', 'UB', 'FR', 'FL', 'BL', 'BR', 'DF', 'DL', 'DB', 'DR'],
  D: ['UF', 'UL', 'UB', 'UR', 'FR', 'FL', 'BL', 'BR', 'DL', 'DB', 'DR', 'DF'],
  F: ['FL', 'UL', 'UB', 'UR', 'UF', 'DF', 'BL', 'BR', 'FR', 'DL', 'DB', 'DR'],
  B: ['UF', 'UL', 'BR', 'UR', 'FR', 'FL', 'UB', 'DB', 'DF', 'DL', 'BL', 'DR']
}

const orientations: Record<Turn, Orientation[]> = {
  R: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  L: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  U: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  D: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  F: [1, 0, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0],
  B: [0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 1, 0]
}

export class Edges {
  public static order: Edge[] = ['UF', 'UL', 'UB', 'UR', 'FR', 'FL', 'BL', 'BR', 'DF', 'DL', 'DB', 'DR']

  public permutations = [...Edges.order]
  public orientations = Array<Orientation>(12).fill(0)

  public apply(turn: Turn) {
    const appliedPermutation = permutations[turn]
    const appliedOrientation = orientations[turn]

    const permutation = [...this.permutations]
    const orientation = [...this.orientations]

    for (let i = 0; i < 12; i++) {
      const newPermutation = appliedPermutation[i]
      const orderIndex = Edges.order.indexOf(newPermutation)
      this.permutations[i] = permutation[orderIndex]
      const newOrientation = (appliedOrientation[i] + orientation[orderIndex]) % 2
      this.orientations[i] = newOrientation as Orientation
    }
  }

  public static edgeToPosition(edge: Edge) {
    return [...edge].reduce((vec, char) => {
      char = char
      return vec
    }, new V3(0, 0, 0))
  }
}