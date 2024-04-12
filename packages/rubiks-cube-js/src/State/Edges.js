import {createSideToUvs, transformSidetoUvs, setUvs} from '.'

/**
 * @typedef {import('./types').TurnBase} TurnBase
 * @typedef {import('./types').Turn} Turn
 * @typedef {import('./types').Edge} E
 * @typedef {import('./types').EdgeOrientation} EO
 * @typedef {[E, E, E, E, E, E, E, E, E, E, E, E]} Permutation
 * @typedef {[EO, EO, EO, EO, EO, EO, EO, EO, EO, EO, EO, EO]} Orientation
 */

/** @satisfies {Record<TurnBase, Permutation>} */
const permutations = {
  R: ['UF', 'UL', 'UB', 'FR', 'DR', 'FL', 'BL', 'UR', 'DF', 'DL', 'DB', 'BR'],
  L: ['UF', 'BL', 'UB', 'UR', 'FR', 'UL', 'DL', 'BR', 'DF', 'FL', 'DB', 'DR'],
  U: ['UR', 'UF', 'UL', 'UB', 'FR', 'FL', 'BL', 'BR', 'DF', 'DL', 'DB', 'DR'],
  D: ['UF', 'UL', 'UB', 'UR', 'FR', 'FL', 'BL', 'BR', 'DL', 'DB', 'DR', 'DF'],
  F: ['FL', 'UL', 'UB', 'UR', 'UF', 'DF', 'BL', 'BR', 'FR', 'DL', 'DB', 'DR'],
  B: ['UF', 'UL', 'BR', 'UR', 'FR', 'FL', 'UB', 'DB', 'DF', 'DL', 'BL', 'DR']
}

/** @satisfies {Record<TurnBase, Orientation>} */
const orientations = {
  R: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  L: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  U: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  D: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  F: [1, 0, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0],
  B: [0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 1, 0]
}

/** @satisfies {Record<E, Record<E, Record<EO, Turn[]>>>} */
const map = {
  UF: {
    UF: {
      0: [],
      1: ['F', 'R', 'U']
    },
    UL: {
      0: ['U'],
      1: ['F\'', 'L\'']
    },
    UB: {
      0: ['U2'],
      1: ['F', 'R', 'U\'']
    },
    UR: {
      0: ['U\''],
      1: ['F', 'R']
    },
    FR: {
      0: ['U\'', 'R\''],
      1: ['F']
    },
    FL: {
      0: ['U', 'L'],
      1: ['F\'']
    },
    BL: {
      0: ['U', 'L\''],
      1: ['U2', 'B']
    },
    BR: {
      0: ['U\'', 'R'],
      1: ['U2', 'B\'']
    },
    DF: {
      0: ['F2'],
      1: ['F', 'R\'', 'D\'']
    },
    DL: {
      0: ['F2', 'D\''],
      1: ['F\'', 'L']
    },
    DB: {
      0: ['F2', 'D2'],
      1: ['F', 'R\'', 'D']
    },
    DR: {
      0: ['F2', 'D'],
      1: ['F', 'R\'']
    }
  },
  UL: {
    UF: {
      0: ['U\''],
      1: ['L', 'F']
    },
    UL: {
      0: [],
      1: ['L', 'F', 'U']
    },
    UB: {
      0: ['U'],
      1: ['L\'', 'B\'']
    },
    UR: {
      0: ['U2'],
      1: ['L', 'F', 'U\'']
    },
    FR: {
      0: ['U2', 'R\''],
      1: ['U\'', 'F']
    },
    FL: {
      0: ['L'],
      1: ['U\'', 'F\'']
    },
    BL: {
      0: ['L\''],
      1: ['U', 'B']
    },
    BR: {
      0: ['U2', 'R'],
      1: ['U', 'B\'']
    },
    DF: {
      0: ['L2', 'D'],
      1: ['L', 'F\'']
    },
    DL: {
      0: ['L2'],
      1: ['L', 'F\'', 'D\'']
    },
    DB: {
      0: ['L2', 'D\''],
      1: ['L\'', 'B']
    },
    DR: {
      0: ['L2', 'D2'],
      1: ['L', 'F\'', 'D']
    }
  },
  UB: {
    UF: {
      0: ['U2'],
      1: ['B\'', 'R\'', 'U']
    },
    UL: {
      0: ['U\''],
      1: ['B', 'L']
    },
    UB: {
      0: [],
      1: ['B\'', 'R\'', 'U\'']
    },
    UR: {
      0: ['U'],
      1: ['B\'', 'R\'']
    },
    FR: {
      0: ['U', 'R\''],
      1: ['B\'', 'R2']
    },
    FL: {
      0: ['U\'', 'L'],
      1: ['B', 'L2']
    },
    BL: {
      0: ['U\'', 'L\''],
      1: ['B']
    },
    BR: {
      0: ['U', 'R'],
      1: ['B\'']
    },
    DF: {
      0: ['B2', 'D2'],
      1: ['B\'', 'R', 'D\'']
    },
    DL: {
      0: ['B2', 'D'],
      1: ['B', 'L\'']
    },
    DB: {
      0: ['B2'],
      1: ['B\'', 'R', 'D']
    },
    DR: {
      0: ['B2', 'D\''],
      1: ['B\'', 'R']
    }
  },
  UR: {
    UF: {
      0: ['U'],
      1: ['R\'', 'F\'']
    },
    UL: {
      0: ['U2'],
      1: ['R\'', 'F\'', 'U']
    },
    UB: {
      0: ['U\''],
      1: ['R', 'B']
    },
    UR: {
      0: [],
      1: ['R\'', 'F\'', 'U\'']
    },
    FR: {
      0: ['R\''],
      1: ['U', 'F']
    },
    FL: {
      0: ['U2', 'L'],
      1: ['U', 'F\'']
    },
    BL: {
      0: ['U2', 'L\''],
      1: ['U\'', 'B']
    },
    BR: {
      0: ['R'],
      1: ['U\'', 'B\'']
    },
    DF: {
      0: ['R2', 'D\''],
      1: ['R\'', 'F']
    },
    DL: {
      0: ['R2', 'D2'],
      1: ['R\'', 'F', 'D\'']
    },
    DB: {
      0: ['R2', 'D'],
      1: ['R', 'B\'']
    },
    DR: {
      0: ['R2'],
      1: ['R\'', 'F', 'D']
    }
  },
  FR: {
    UF: {
      0: ['R', 'U'],
      1: ['F\'']
    },
    UL: {
      0: ['R', 'U2'],
      1: ['F\'', 'U']
    },
    UB: {
      0: ['R', 'U\''],
      1: ['F\'', 'U2']
    },
    UR: {
      0: ['R'],
      1: ['F\'', 'U\'']
    },
    FR: {
      0: [],
      1: ['F\'', 'U\'', 'R\'']
    },
    FL: {
      0: ['F2'],
      1: ['F\'', 'U', 'L']
    },
    BL: {
      0: ['F2', 'L2'],
      1: ['F\'', 'U', 'L\'']
    },
    BR: {
      0: ['R2'],
      1: ['F\'', 'U\'', 'R']
    },
    DF: {
      0: ['R\'', 'D\''],
      1: ['F']
    },
    DL: {
      0: ['R\'', 'D2'],
      1: ['F', 'D\'']
    },
    DB: {
      0: ['R\'', 'D'],
      1: ['F', 'D2']
    },
    DR: {
      0: ['R\''],
      1: ['F', 'D']
    }
  },
  FL: {
    UF: {
      0: ['L\'', 'U\''],
      1: ['F']
    },
    UL: {
      0: ['L\''],
      1: ['F', 'U']
    },
    UB: {
      0: ['L\'', 'U'],
      1: ['F', 'U2']
    },
    UR: {
      0: ['L\'', 'U2'],
      1: ['F', 'U\'']
    },
    FR: {
      0: ['F2'],
      1: ['F', 'U\'', 'R\'']
    },
    FL: {
      0: [],
      1: ['F', 'U', 'L']
    },
    BL: {
      0: ['L2'],
      1: ['F', 'U', 'L\'']
    },
    BR: {
      0: ['F2', 'R2'],
      1: ['F', 'U\'', 'R']
    },
    DF: {
      0: ['L', 'D'],
      1: ['F\'']
    },
    DL: {
      0: ['L'],
      1: ['F\'', 'D\'']
    },
    DB: {
      0: ['L', 'D\''],
      1: ['F\'', 'D2']
    },
    DR: {
      0: ['L', 'D2'],
      1: ['F\'', 'D']
    }
  },
  BL: {
    UF: {
      0: ['L', 'U\''],
      1: ['B\'', 'U2']
    },
    UL: {
      0: ['L'],
      1: ['B\'', 'U\'']
    },
    UB: {
      0: ['L', 'U'],
      1: ['B\'']
    },
    UR: {
      0: ['L', 'U2'],
      1: ['B\'', 'U']
    },
    FR: {
      0: ['B2', 'R2'],
      1: ['B\'', 'U', 'R\'']
    },
    FL: {
      0: ['L2'],
      1: ['B\'', 'U\'', 'L']
    },
    BL: {
      0: [],
      1: ['B\'', 'U\'', 'L\'']
    },
    BR: {
      0: ['B2'],
      1: ['B\'', 'U', 'R']
    },
    DF: {
      0: ['L\'', 'D'],
      1: ['B', 'D2']
    },
    DL: {
      0: ['L\''],
      1: ['B', 'D']
    },
    DB: {
      0: ['L\'', 'D\''],
      1: ['B']
    },
    DR: {
      0: ['L\'', 'D2'],
      1: ['B', 'D\'']
    }
  },
  BR: {
    UF: {
      0: ['R\'', 'U'],
      1: ['B', 'U2']
    },
    UL: {
      0: ['R\'', 'U2'],
      1: ['B', 'U\'']
    },
    UB: {
      0: ['R\'', 'U\''],
      1: ['B']
    },
    UR: {
      0: ['R\''],
      1: ['B', 'U']
    },
    FR: {
      0: ['R2'],
      1: ['B', 'U', 'R\'']
    },
    FL: {
      0: ['B2', 'L2'],
      1: ['B', 'U\'', 'L']
    },
    BL: {
      0: ['B2'],
      1: ['B', 'U\'', 'L\'']
    },
    BR: {
      0: [],
      1: ['B', 'U', 'R']
    },
    DF: {
      0: ['R', 'D\''],
      1: ['B\'', 'D2']
    },
    DL: {
      0: ['R', 'D2'],
      1: ['B\'', 'D']
    },
    DB: {
      0: ['R', 'D'],
      1: ['B\'']
    },
    DR: {
      0: ['R'],
      1: ['B\'', 'D\'']
    }
  },
  DF: {
    UF: {
      0: ['F2'],
      1: ['F\'', 'R', 'U']
    },
    UL: {
      0: ['F2', 'U'],
      1: ['F', 'L\'']
    },
    UB: {
      0: ['F2', 'U2'],
      1: ['F\'', 'R', 'U\'']
    },
    UR: {
      0: ['F2', 'U\''],
      1: ['F\'', 'R']
    },
    FR: {
      0: ['D', 'R'],
      1: ['F\'']
    },
    FL: {
      0: ['D\'', 'L\''],
      1: ['F']
    },
    BL: {
      0: ['D\'', 'L'],
      1: ['D2', 'B\'']
    },
    BR: {
      0: ['D', 'R\''],
      1: ['D2', 'B']
    },
    DF: {
      0: [],
      1: ['F\'', 'R\'', 'D\'']
    },
    DL: {
      0: ['D\''],
      1: ['F', 'L']
    },
    DB: {
      0: ['D2'],
      1: ['F\'', 'R\'', 'D']
    },
    DR: {
      0: ['D'],
      1: ['F\'', 'R\'']
    }
  },
  DL: {
    UF: {
      0: ['L2', 'U\''],
      1: ['L\'', 'F']
    },
    UL: {
      0: ['L2'],
      1: ['L\'', 'F', 'U']
    },
    UB: {
      0: ['L2', 'U'],
      1: ['L', 'B\'']
    },
    UR: {
      0: ['L2', 'U2'],
      1: ['L\'', 'F', 'U\'']
    },
    FR: {
      0: ['D2', 'R'],
      1: ['D', 'F\'']
    },
    FL: {
      0: ['L\''],
      1: ['D', 'F']
    },
    BL: {
      0: ['L'],
      1: ['D\'', 'B\'']
    },
    BR: {
      0: ['D2', 'R\''],
      1: ['D\'', 'B']
    },
    DF: {
      0: ['D'],
      1: ['L\'', 'F\'']
    },
    DL: {
      0: [],
      1: ['L\'', 'F\'', 'D\'']
    },
    DB: {
      0: ['D\''],
      1: ['L', 'B']
    },
    DR: {
      0: ['D2'],
      1: ['L\'', 'F\'', 'D']
    }
  },
  DB: {
    UF: {
      0: ['B2', 'U2'],
      1: ['B', 'R\'', 'U']
    },
    UL: {
      0: ['B2', 'U\''],
      1: ['B\'', 'L']
    },
    UB: {
      0: ['B2'],
      1: ['B', 'R\'', 'U\'']
    },
    UR: {
      0: ['B2', 'U'],
      1: ['B', 'R\'']
    },
    FR: {
      0: ['D\'', 'R'],
      1: ['D2', 'F\'']
    },
    FL: {
      0: ['D', 'L\''],
      1: ['D2', 'F']
    },
    BL: {
      0: ['D', 'L'],
      1: ['B\'']
    },
    BR: {
      0: ['D\'', 'R\''],
      1: ['B']
    },
    DF: {
      0: ['D2'],
      1: ['B', 'R', 'D\'']
    },
    DL: {
      0: ['D'],
      1: ['B\'', 'L\'']
    },
    DB: {
      0: [],
      1: ['B', 'R', 'D']
    },
    DR: {
      0: ['D\''],
      1: ['B', 'R']
    }
  },
  DR: {
    UF: {
      0: ['R2', 'U'],
      1: ['R', 'F\'']
    },
    UL: {
      0: ['R2', 'U2'],
      1: ['R', 'F\'', 'U']
    },
    UB: {
      0: ['R2', 'U\''],
      1: ['R\'', 'B']
    },
    UR: {
      0: ['R2'],
      1: ['R', 'F\'', 'U\'']
    },
    FR: {
      0: ['R'],
      1: ['D\'', 'F\'']
    },
    FL: {
      0: ['D2', 'L\''],
      1: ['D\'', 'F']
    },
    BL: {
      0: ['D2', 'L'],
      1: ['D', 'B\'']
    },
    BR: {
      0: ['R\''],
      1: ['D', 'B']
    },
    DF: {
      0: ['D\''],
      1: ['R', 'F']
    },
    DL: {
      0: ['D2'],
      1: ['R', 'F', 'D\'']
    },
    DB: {
      0: ['D'],
      1: ['R\'', 'B\'']
    },
    DR: {
      0: [],
      1: ['R', 'F', 'D']
    }
  }
}

/** @type {number[]} */
const orderIndexToCubieIndex = [
  7, 17, 25, 15, 3, 5, 23, 21, 1, 11, 19, 9
]

export class Edges {
  /** @type {Permutation} */ 
  static order = ['UF', 'UL', 'UB', 'UR', 'FR', 'FL', 'BL', 'BR', 'DF', 'DL', 'DB', 'DR']

  /** @type {Permutation} */ 
  permutation = [...Edges.order]
  /** @type {Orientation} */
  orientation = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

  /** @param {TurnBase} turn */
  applyTurn(turn) {
    const appliedPermutation = permutations[turn]
    const appliedOrientation = orientations[turn]

    const permutation = [...this.permutation]
    const orientation = [...this.orientation]

    for (let i = 0; i < 12; i++) {
      const newPermutation = appliedPermutation[i]
      const orderIndex = Edges.order.indexOf(newPermutation)
      this.permutation[i] = permutation[orderIndex]
      const newOrientation = (appliedOrientation[i] + orientation[orderIndex]) % 2
      this.orientation[i] = /** @type {EO} */ (newOrientation)
    }
  }

  /**
   * @param {number[][][]} uvs
   * @param {import('../ui/rubiks').Rubiks} rubiks
   */
  applyState(uvs, rubiks) {
    for (let i = 0; i < 12; i++) {
      const turns = this.#getTurns(i)

      const originIndex = orderIndexToCubieIndex[Edges.order.indexOf(this.permutation[i])]
      let sideToUvs = createSideToUvs(originIndex, uvs)
      sideToUvs = transformSidetoUvs(originIndex, sideToUvs, turns)

      const targetIndex = orderIndexToCubieIndex[i]
      setUvs(targetIndex, rubiks, sideToUvs)
    }
  }

  reset() {
    this.permutation = [...Edges.order]
    this.orientation = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  }

  /** @returns {number[]} */
  encode() {
    /** @type {number[]} */
    let p = []
    for (let i = 0; i < 6; i++) {
      const p1 = Edges.order.indexOf(this.permutation[i * 2])
      const p2 = Edges.order.indexOf(this.permutation[i * 2 + 1])
      p.push(
        (p2 << 4) + p1
      )
    }
    let o = 0
    for (const orientation of this.orientation) {
      o = o << 1
      o += orientation
    }
    return [
      ...p,
      (o >> 0) & 0b11111111,
      (o >> 8) & 0b11111111
    ]
  }

  /**
   * @param {number[]} code
   * @returns {boolean}
   */
  decode(code) {
    for (let i = 0; i < 6; i++) {
      const p1 = code[i] & 0b1111
      const p2 = (code[i] >> 4) & 0b1111
      if (p1 >= 12 || p2 >= 12) {
        return false
      }
      this.permutation[i * 2] = Edges.order[p1]
      this.permutation[i * 2 + 1] = Edges.order[p2]
    }

    let o = code[6] + (code[7] << 8)
    for (let i = 11; i >= 0; i--) {
      this.orientation[i] = /** @type {EO} */ (o & 0b1)
      o = o >> 1
    }
    return true
  }

  /**
   * @param {number} index
   * @returns {Turn[]}
   */
  #getTurns(index) {
    const start = Edges.order[index]
    const permutation = this.permutation[index]
    const orientation = this.orientation[index]
    return map[permutation][start][orientation]
  }
}