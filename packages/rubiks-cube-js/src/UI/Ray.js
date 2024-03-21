import {V3, V4} from '../Math/Vector'

export class Ray {
  /** @type {V3} */
  #origin
  /** @type {V3} */
  #direction

  /**
   * @param {import('./Camera').Camera} camera
   * @param {number} x
   * @param {number} y
   * @param {number} width
   * @param {number} height
   */
  constructor(camera, x, y, width, height) {
    const u = (x + .5) / width * 2 - 1
    const v = (height - y + .5) / height * 2 - 1
    this.#origin = camera.cameraToWorldMatrix.mult(new V4(0, 0, 0, 1)).toV3()

    const d1 = camera.projectionMatrixInverse.mult(new V4(u, v, 0, 1))
    const d2 = camera.cameraToWorldMatrix.mult(new V4(d1.x, d1.y, d1.z, 0))
    this.#direction = d2.toV3().normalized
  }

  /** @param {import('./Rubics').Rubics} rubics */
  intersectRubics(rubics) {
    return rubics.cubies.map(cubie => this.#intersectCube(cubie)).flat(1)
  }

  /** @param {import('./Cubie').Cubie} cubie */
  #intersectCube(cubie) {
    return cubie.facelets.reduce((
      /** @type {{facelet: import('./Facelet').Facelet, d: number}[]} */ acc,
      /** @type {import('./Facelet').Facelet} */ facelet
    ) => {
      const hit = this.intersectFacelet(facelet)
      if (hit.inside) {
        acc.push({facelet: hit.facelet, d: hit.d})
      }
      return acc
    }, [])
  }

  /**
   * @param {import('./Facelet').Facelet} facelet
   * @returns {{
   *  inside: false
   * } | {
   *  inside: true,
   *  facelet: import('./Facelet').Facelet,
   *  d: number
   * }}
   */
  intersectFacelet(facelet) {
    const {normal, top, left, topLeft, bottomRight} = facelet.transform

    const denom = this.#direction.dot(normal)
    if (denom === 0) {
      return {inside: false}
    }
    
    const d = topLeft.sub(this.#origin).dot(normal) / denom
    const intersection = this.#origin.add(this.#direction.scale(d))
    const fromTopLeft = intersection.sub(topLeft).normalized
    const fromBottomRight = intersection.sub(bottomRight).normalized

    const dot1 = fromTopLeft.dot(left)
    const dot2 = fromTopLeft.dot(top)
    const dot3 = fromBottomRight.dot(left.negate)
    const dot4 = fromBottomRight.dot(top.negate)
    const inside = dot1 <= 1 && dot1 >= 0
                && dot2 <= 1 && dot2 >= 0
                && dot3 <= 1 && dot3 >= 0
                && dot4 <= 1 && dot4 >= 0

    if (!inside) {
      return {inside: false}
    }

    return {
      inside,
      facelet,
      d
    }
  }
}