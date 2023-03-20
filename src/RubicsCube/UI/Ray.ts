import {V3, V4} from '../Math/Vector'

import {Camera} from './Camera'
import {Rubics} from './Rubics'
import {Cubie} from './Cubie'
import {Facelet} from './Facelet'

export class Ray {
  private origin: V3
  private direction: V3

  public constructor(camera: Camera, x: number, y: number, width: number, height: number) {
    const u = (x + .5) / width * 2 - 1
    const v = (height - y + .5) / height * 2 - 1
    this.origin = camera.cameraToWorldMatrix.mult(new V4(0, 0, 0, 1)).toV3()

    const d1 = camera.projectionMatrixInverse.mult(new V4(u, v, 0, 1))
    const d2 = camera.cameraToWorldMatrix.mult(new V4(d1.x, d1.y, d1.z, 0))
    this.direction = d2.toV3().normalized
  }

  public intersectRubics(rubics: Rubics) {
    return rubics.cubies.map(cubie => this.intersectCube(cubie)).flat(1)
  }

  private intersectCube(cubie: Cubie) {
    return cubie.facelets.reduce<{facelet: Facelet, d: number}[]>((acc, facelet) => {
      const hit = this.intersectFacelet(facelet)
      if (hit.inside) {
        acc.push({facelet: hit.facelet, d: hit.d})
      }
      return acc
    }, [])
  }

  public intersectFacelet(facelet: Facelet) {
    const {normal, top, left, topLeft, bottomRight} = facelet.transform

    const denom = this.direction.dot(normal)
    if (denom === 0)
      return { inside: false } as const
    
    const d = topLeft.sub(this.origin).dot(normal) / denom
    const intersection = this.origin.add(this.direction.scale(d))
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

    if (!inside)
      return { inside: false } as const

    return {
      inside,
      facelet,
      d
    } as const
  }
}