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
}