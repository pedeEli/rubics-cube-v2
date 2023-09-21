import {Corners} from './Corners'
import {Edges} from './Edges'

export type Turn = 'R' | 'L' | 'U' | 'D' | 'F' | 'B'

export class State {
  public corners = new Corners()
  public edges = new Edges()

  public apply(turn: Turn) {
    this.corners.apply(turn)
    this.edges.apply(turn)
  }

  public stringify() {
    const corners = this.corners.stringify()
    const edges = this.edges.stringify()
    return `${corners}-${edges}`
  }

  public parse(str: string) {
    const [corners, edges] = str.split('-')
    this.corners.parse(corners)
    this.edges.parse(edges)
  }
}