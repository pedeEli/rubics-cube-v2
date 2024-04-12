import {createSideToUvs, transformSidetoUvs, setUvs} from '.'

/**
 * @typedef {import('./types').TurnBase} TurnBase
 * @typedef {import('./types').Turn} Turn
 * @typedef {import('./types').Corner} C
 * @typedef {import('./types').CornerOrientation} CO
 * @typedef {[C, C, C, C, C, C, C, C]} Permutation
 * @typedef {[CO, CO, CO, CO, CO, CO, CO, CO]} Orientation
 */

/** @satisfies {Record<TurnBase, Permutation>} */
const permutations = {
  R: ['DRF', 'ULF', 'ULB', 'URF', 'DRB', 'DLF', 'DLB', 'URB'],
  L: ['URF', 'ULB', 'DLB', 'URB', 'DRF', 'ULF', 'DLF', 'DRB'],
  U: ['URB', 'URF', 'ULF', 'ULB', 'DRF', 'DLF', 'DLB', 'DRB'],
  D: ['URF', 'ULF', 'ULB', 'URB', 'DLF', 'DLB', 'DRB', 'DRF'],
  F: ['ULF', 'DLF', 'ULB', 'URB', 'URF', 'DRF', 'DLB', 'DRB'],
  B: ['URF', 'ULF', 'URB', 'DRB', 'DRF', 'DLF', 'ULB', 'DLB']
}

/** @satisfies {Record<TurnBase, Orientation>} */
const orientations = {
  R: [2, 0, 0, 1, 1, 0, 0, 2],
  L: [0, 1, 2, 0, 0, 2, 1, 0],
  U: [0, 0, 0, 0, 0, 0, 0, 0],
  D: [0, 0, 0, 0, 0, 0, 0, 0],
  F: [1, 2, 0, 0, 2, 1, 0, 0],
  B: [0, 0, 1, 2, 0, 0, 2, 1]
}

/** @satisfies {Record<C, Record<C, Record<CO, Turn[]>>>} */
const map = {
  URF: {
    URF: {
      0: [],
      1: ['R', 'U'],
      2: ['F\'', 'U\'']
    },
    ULF: {
      0: ['U'],
      1: ['R', 'U2'],
      2: ['F\'']
    },
    ULB: {
      0: ['U2'],
      1: ['R', 'U\''],
      2: ['F\'', 'U']
    },
    URB: {
      0: ['U\''],
      1: ['R'],
      2: ['F\'', 'U2']
    },
    DRF: {
      0: ['R2', 'D\''],
      1: ['R\''],
      2: ['F']
    },
    DLF: {
      0: ['F2'],
      1: ['R\'', 'D\''],
      2: ['F', 'D\'']
    },
    DLB: {
      0: ['R2', 'D'],
      1: ['R\'', 'D2'],
      2: ['F', 'D2']
    },
    DRB: {
      0: ['R2'],
      1: ['R\'', 'D'],
      2: ['F', 'D']
    }
  },
  ULF: {
    URF: {
      0: ['U\''],
      1: ['F'],
      2: ['L\'', 'U2']
    },
    ULF: {
      0: [],
      1: ['F', 'U'],
      2: ['L\'', 'U\'']
    },
    ULB: {
      0: ['U'],
      1: ['F', 'U2'],
      2: ['L\'']
    },
    URB: {
      0: ['U2'],
      1: ['F', 'U\''],
      2: ['L\'', 'U']
    },
    DRF: {
      0: ['F2'],
      1: ['F\'', 'D'],
      2: ['L', 'D']
    },
    DLF: {
      0: ['L2', 'D'],
      1: ['F\''],
      2: ['L']
    },
    DLB: {
      0: ['L2'],
      1: ['F\'', 'D\''],
      2: ['L', 'D\'']
    },
    DRB: {
      0: ['L2', 'D\''],
      1: ['F\'', 'D2'],
      2: ['L', 'D2']
    }
  },
  ULB: {
    URF: {
      0: ['U2'],
      1: ['L', 'U\''],
      2: ['B\'', 'U']
    },
    ULF: {
      0: ['U\''],
      1: ['L'],
      2: ['B\'', 'U2']
    },
    ULB: {
      0: [],
      1: ['L', 'U'],
      2: ['B\'', 'U\'']
    },
    URB: {
      0: ['U'],
      1: ['L', 'U2'],
      2: ['B\'']
    },
    DRF: {
      0: ['L2', 'D'],
      1: ['L\'', 'D2'],
      2: ['B', 'D2']
    },
    DLF: {
      0: ['L2'],
      1: ['L\'', 'D'],
      2: ['B', 'D']
    },
    DLB: {
      0: ['L2', 'D'],
      1: ['L\''],
      2: ['B']
    },
    DRB: {
      0: ['B2'],
      1: ['L\'', 'D\''],
      2: ['B', 'D\'']
    }
  },
  URB: {
    URF: {
      0: ['U'],
      1: ['B', 'U2'],
      2: ['R\'']
    },
    ULF: {
      0: ['U2'],
      1: ['B', 'U\''],
      2: ['R\'', 'U']
    },
    ULB: {
      0: ['U\''],
      1: ['B'],
      2: ['R\'', 'U2']
    },
    URB: {
      0: [],
      1: ['B', 'U'],
      2: ['R\'', 'U\'']
    },
    DRF: {
      0: ['R2'],
      1: ['B\'', 'D\''],
      2: ['R', 'D\'']
    },
    DLF: {
      0: ['R2', 'D\''],
      1: ['B\'', 'D2'],
      2: ['R', 'D2']
    },
    DLB: {
      0: ['B2'],
      1: ['B\'', 'D'],
      2: ['R', 'D']
    },
    DRB: {
      0: ['R2', 'D'],
      1: ['B\''],
      2: ['R']
    }
  },
  DRF: {
    URF: {
      0: ['R2', 'U'],
      1: ['F\''],
      2: ['R']
    },
    ULF: {
      0: ['F2'],
      1: ['F\'', 'U'],
      2: ['R', 'U']
    },
    ULB: {
      0: ['R2', 'U\''],
      1: ['F\'', 'U2'],
      2: ['R', 'U2']
    },
    URB: {
      0: ['R2'],
      1: ['F\'', 'U\''],
      2: ['R', 'U\'']
    },
    DRF: {
      0: [],
      1: ['F', 'D'],
      2: ['R\'', 'D\'']
    },
    DLF: {
      0: ['D\''],
      1: ['F'],
      2: ['R\'', 'D2']
    },
    DLB: {
      0: ['D2'],
      1: ['F', 'D\''],
      2: ['R\'', 'D']
    },
    DRB: {
      0: ['D'],
      1: ['F', 'D2'],
      2: ['R\'']
    }
  },
  DLF: {
    URF: {
      0: ['F2'],
      1: ['L\'', 'U\''],
      2: ['F', 'U\'']
    },
    ULF: {
      0: ['L2', 'U\''],
      1: ['L\''],
      2: ['F']
    },
    ULB: {
      0: ['L2'],
      1: ['L\'', 'U'],
      2: ['F', 'U']
    },
    URB: {
      0: ['L2', 'U'],
      1: ['L\'', 'U2'],
      2: ['F', 'U2']
    },
    DRF: {
      0: ['D'],
      1: ['L', 'D2'],
      2: ['F\'']
    },
    DLF: {
      0: [],
      1: ['L', 'D'],
      2: ['F\'', 'D\'']
    },
    DLB: {
      0: ['D\''],
      1: ['L'],
      2: ['F\'', 'D2']
    },
    DRB: {
      0: ['D2'],
      1: ['L', 'D\''],
      2: ['F\'', 'D']
    }
  },
  DLB: {
    URF: {
      0: ['L2', 'U\''],
      1: ['B\'', 'U2'],
      2: ['L', 'U2']
    },
    ULF: {
      0: ['L2'],
      1: ['B\'', 'U\''],
      2: ['L', 'U\'']
    },
    ULB: {
      0: ['L2', 'U'],
      1: ['B\''],
      2: ['L']
    },
    URB: {
      0: ['B2'],
      1: ['B\'', 'U'],
      2: ['L', 'U']
    },
    DRF: {
      0: ['D2'],
      1: ['B', 'D\''],
      2: ['L\'', 'D']
    },
    DLF: {
      0: ['D'],
      1: ['B', 'D2'],
      2: ['L\'']
    },
    DLB: {
      0: [],
      1: ['B', 'D'],
      2: ['L\'', 'D\'']
    },
    DRB: {
      0: ['D\''],
      1: ['B'],
      2: ['L\'', 'D2']
    }
  },
  DRB: {
    URF: {
      0: ['R2'],
      1: ['R\'', 'U'],
      2: ['B', 'U']
    },
    ULF: {
      0: ['R2', 'U'],
      1: ['R\'', 'U2'],
      2: ['B', 'U2']
    },
    ULB: {
      0: ['B2'],
      1: ['R\'', 'U\''],
      2: ['B', 'U\'']
    },
    URB: {
      0: ['R2', 'U\''],
      1: ['R\''],
      2: ['B']
    },
    DRF: {
      0: ['D\''],
      1: ['R'],
      2: ['B\'', 'D2']
    },
    DLF: {
      0: ['D2'],
      1: ['R', 'D\''],
      2: ['B\'', 'D']
    },
    DLB: {
      0: ['D'],
      1: ['R', 'D2'],
      2: ['B\'']
    },
    DRB: {
      0: [],
      1: ['R', 'D'],
      2: ['B\'', 'D\'']
    }
  }
}

/** @type {number[]} */
const orderIndexToCubieIndex = [
  6, 8, 26, 24, 0, 2, 20, 18
]


export class Corners {
  /** @type {Permutation} */
  static order = ['URF', 'ULF', 'ULB', 'URB', 'DRF', 'DLF', 'DLB', 'DRB']

  /** @type {Permutation} */
  permutation = [...Corners.order]
  /** @type {Orientation} */
  orientation = [0, 0, 0, 0, 0, 0, 0, 0]

  /** @param {TurnBase} turn */
  applyTurn(turn) {
    const appliedPermutation = permutations[turn]
    const appliedOrientation = orientations[turn]

    const permutation = [...this.permutation]
    const orientation = [...this.orientation]
    
    for (let i = 0; i < 8; i++) {
      const newPermutation = appliedPermutation[i]
      const orderIndex = Corners.order.indexOf(newPermutation)
      this.permutation[i] = permutation[orderIndex]
      const newOrientation = (appliedOrientation[i] + orientation[orderIndex]) % 3
      this.orientation[i] = /** @type {CO} */ (newOrientation)
    }
  }

  /**
   * @param {number[][][]} uvs
   * @param {import('../ui/rubiks').Rubiks} rubiks
   */
  applyState(uvs, rubiks) {
    for (let i = 0; i < 8; i++) {
      const turns = this.#getTurns(i)

      const originIndex = orderIndexToCubieIndex[Corners.order.indexOf(this.permutation[i])]
      let sideToUvs = createSideToUvs(originIndex, uvs)
      sideToUvs = transformSidetoUvs(originIndex, sideToUvs, turns)

      const targetIndex = orderIndexToCubieIndex[i]
      setUvs(targetIndex, rubiks, sideToUvs)
    }
  }

  reset() {
    this.permutation = [...Corners.order]
    this.orientation = [0, 0, 0, 0, 0, 0, 0, 0]
  }

  /** @returns {number[]} */
  encode() {
    let p = 0
    for (const permutation of this.permutation) {
      p = p << 3
      p += Corners.order.indexOf(permutation)
    }
    let o = 0
    for (const orientation of this.orientation) {
      o = o << 2
      o += orientation
    }
    return [
      (p >> 0)  & 0b11111111,
      (p >> 8)  & 0b11111111,
      (p >> 16) & 0b11111111,
      (o >> 0)  & 0b11111111,
      (o >> 8)  & 0b11111111
    ]
  }

  /**
   * @param {number[]} code
   * @returns {boolean}
   */
  decode(code) {
    let p = code[0] + (code[1] << 8) + (code[2] << 16)
    let o = code[3] + (code[4] << 8)
    for (let i = 7; i >= 0; i--) {
      const p1 = p & 0b111
      if (p1 >= 8) {
        return false
      }
      this.permutation[i] = Corners.order[p1]
      p = p >> 3
      const o1 = o & 0b11
      if (o1 > 2) {
        return false
      }
      this.orientation[i] = /** @type {CO} */ (o1)
      o = o >> 2
    }
    return true
  }

  /**
   * @param {number} index
   * @returns {Turn[]}
   */
  #getTurns(index) {
    const start = Corners.order[index]
    const permutation = this.permutation[index]
    const orientation = this.orientation[index]
    return map[permutation][start][orientation]
  }
}