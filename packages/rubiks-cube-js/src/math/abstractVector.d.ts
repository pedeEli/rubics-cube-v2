export declare abstract class Vector<V extends Vector<any>> {
  abstract scale(a: number): V
  abstract add(v: V): V
  abstract sub(v: V): V
  abstract mult(v: V): V
  abstract dot(v: V): number
  abstract toArray(): number[]
  
  get squareMag(): number
  get mag(): number
  get normalized(): V
  get negate(): V
}