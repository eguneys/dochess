import * as dots from './types';
import Ctrl from './ctrl';
import * as cs from 'chesst';

export type CurrentDrag = {
  epos: dots.NumberPair,
  fen: cs.Fen,
  orig: cs.Pos,
  piece: cs.Piece
};

export default class Drag {

  drag?: CurrentDrag

  set epos(epos: dots.Maybe<dots.NumberPair>) {
    if (this.drag && epos) {
      this.drag.epos = epos;
    }
  }
  
  get epos(): dots.Maybe<dots.NumberPair> {
    return this.drag?.epos;
  }

  get orig(): dots.Maybe<cs.Pos> {
    return this.drag?.orig;
  }

  ctrl: Ctrl
  
  constructor(ctrl: Ctrl) {
    this.ctrl = ctrl;
  }

  async end(epos: dots.NumberPair, dest: dots.Maybe<cs.Pos>) {
    if (this.drag) {
      let { orig, piece, fen } = this.drag;
      if (dest) {
        this.ctrl.userMove(orig, dest, piece, fen)
      } else {
        this.ctrl.board = this.ctrl.board.drop(orig, piece) || this.ctrl.board;
      }

      this.drag = undefined;
    }
  }

  move(epos: dots.NumberPair) {
    this.epos = epos;
  }

  start(epos: dots.NumberPair, orig: dots.Maybe<cs.Pos>) {
    if (orig) {
      let fen = this.ctrl.fen,
      piese = this.ctrl.pickup(orig);
      if (piese) {
        this.drag = {
          fen,
          epos,
          orig,
          piece: piese.piece
        };
      }
    }
  }
  
}
