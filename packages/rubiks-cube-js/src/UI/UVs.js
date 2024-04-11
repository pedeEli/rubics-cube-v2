/** @satisfies {Record<string, (uvs: number[]) => number[]>} */
const uvsTransformers = {
  identity: uvs => [...uvs],
  flipH: uvs => [uvs[6], uvs[7], uvs[4], uvs[5], uvs[2], uvs[3], uvs[0], uvs[1]],
  flipV: uvs => [uvs[2], uvs[3], uvs[0], uvs[1], uvs[6], uvs[7], uvs[4], uvs[5]],
  rotateCC: uvs => [uvs[6], uvs[7], uvs[0], uvs[1], uvs[2], uvs[3], uvs[4], uvs[5]],
  rotateC: uvs => [uvs[2], uvs[3], uvs[4], uvs[5], uvs[6], uvs[7], uvs[0], uvs[1]],
  rotate2: uvs => [uvs[4], uvs[5], uvs[6], uvs[7], uvs[0], uvs[1], uvs[2], uvs[3]],
  rotateCFlipH: uvs => [uvs[0], uvs[1], uvs[6], uvs[7], uvs[4], uvs[5], uvs[2], uvs[3]]
}
/** @satisfies {Record<string, Record<number, (uvs: number[]) => number[]>>} */
export const uvsTransformerPresets = {
  flipV12: {
    1: uvsTransformers.flipV,
    2: uvsTransformers.flipV,
    3: uvsTransformers.identity
  },
  flipV23: {
    1: uvsTransformers.identity,
    2: uvsTransformers.flipV,
    3: uvsTransformers.flipV
  },
  flipH12: {
    1: uvsTransformers.flipH,
    2: uvsTransformers.flipH,
    3: uvsTransformers.identity
  },
  flipH23: {
    1: uvsTransformers.identity,
    2: uvsTransformers.flipH,
    3: uvsTransformers.flipH
  },
  rcfhFvRcc: {
    1: uvsTransformers.rotateCFlipH,
    2: uvsTransformers.flipV,
    3: uvsTransformers.rotateCC
  },
  rcFvRcfh: {
    1: uvsTransformers.rotateC,
    2: uvsTransformers.flipV,
    3: uvsTransformers.rotateCFlipH
  },
  rcFhRcfh: {
    1: uvsTransformers.rotateC,
    2: uvsTransformers.flipH,
    3: uvsTransformers.rotateCFlipH
  },
  rcfhFhRcc: {
    1: uvsTransformers.rotateCFlipH,
    2: uvsTransformers.flipH,
    3: uvsTransformers.rotateCC
  },
  rcR2Rcc: {
    1: uvsTransformers.rotateC,
    2: uvsTransformers.rotate2,
    3: uvsTransformers.rotateCC,
  },
  rccR2Rc: {
    1: uvsTransformers.rotateCC,
    2: uvsTransformers.rotate2,
    3: uvsTransformers.rotateC,
  }
}



/**
 * `cubiesShiftMapper[axis][index]`
 * @type {Record<number, Record<number, number[]>>}
 */
export const cubiesShiftMapper = {
  0: {
    0: [0, 3, 6, 15, 24, 21, 18, 9],
    2: [2, 5, 8, 17, 26, 23, 20, 11]
  },
  1: {
    0: [0, 1, 2, 11, 20, 19, 18, 9],
    2: [6, 7, 8, 17, 26, 25, 24, 15]
  },
  2: {
    0: [0, 1, 2, 5, 8, 7, 6, 3],
    2: [18, 19, 20, 23, 26, 25, 24, 21]
  }
}

/**
 * `sidesShiftMapper[axis]`
 * @type {[number, number, number, number][]}
 */
export const sidesShiftMapper = [
  [2, 5, 3, 4],
  [0, 5, 1, 4],
  [0, 3, 1, 2]
]