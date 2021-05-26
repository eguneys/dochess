import * as dots from './types';
import { State }  from './state';
import { Memo } from './util';
import Drag from './drag';
import * as cs from 'chesst';

export type PromoteAsk = {
  orig: cs.Pos,
  dest: cs.Pos,
  piece: cs.Piece,
  beforeFen: cs.Fen
};

export default class Ctrl {

  redraw: dots.Redraw
  private redrawNow: dots.Redraw
  state: State
  situation: cs.Situation

  drag: Drag
  promoteAsk?: PromoteAsk

  bounds?: Memo<ClientRect>;

  reckon?: cs.Piese;
  
  get orientation(): cs.Color {
    return this.state.orientation;
  }

  get board(): cs.Board {
    return this.situation.board;
  }

  set board(board: cs.Board) {
    this.situation = this.situation.withBoard(board);
  }

  get turn(): cs.Color {
    return this.situation.turn;
  }

  get fen(): cs.Fen {
    return this.situation.fen;
  }

  set fen(fen: cs.Fen) {
    this.situation = cs.situation(fen)!;
    this.reckon = undefined;
  }
  
  constructor(state: State, redraw: dots.Redraw) {

    this.state = state;
    this.redrawNow = redraw;

    this.situation = cs.situation(state.fen)!;

    this.redraw = debounceRedraw(this.redrawNow.bind(this))

    this.drag = new Drag(this);
  }

  promoteCancel() {
    if (this.promoteAsk) {
      this.fen = this.promoteAsk.beforeFen;
      this.promoteAsk = undefined;
    }
  }
  
  async promoteChoose(role: cs.Role) {
    if (this.promoteAsk) {
      let { orig, dest, piece, beforeFen } = this.promoteAsk;
      this.promoteAsk = undefined;
      await this.userMove(orig, dest, piece, beforeFen, role);
    }
  }

  async userMove(orig: cs.Pos, dest: cs.Pos, piece: cs.Piece, beforeFen: cs.Fen, promotion?: cs.Role) {
    if (piece.promotes(dest)) {
      if (Math.abs(orig.distance(dest).drank.index) !== 1 ||
        Math.abs(orig.distance(dest).dfile.index) > 1) {
        this.fen = beforeFen;
        return;
      }
      if (!promotion) {
        this.promoteAsk = {
          orig,
          dest,
          piece,
          beforeFen
        };
        return;
      }
    }

    this.reckon = piece.on(dest);
    let { uci } = cs.Uci.make(orig, dest, promotion);
    let afterFen = await this.state.userMove(uci, beforeFen);
    this.fen = afterFen;
  }


  pickup(orig: cs.Pos) {

    let piese = this.board.get(orig);

    if (piese && piese.color.equals(this.turn)) {
      this.board = this.board.pickup(orig) || this.board;
      return piese;
    }
  }
  
  getKeyAtDomPos(pos: dots.NumberPair): dots.Maybe<cs.Pos> {
    if (!this.bounds) {
      return;
    }
    let { left, width, top, height } = this.bounds();
    let file = cs.File.allByIndex.get(Math.ceil((8 * (pos[0] - left))/ width)),
    rank = cs.Rank.allByIndex.get(8 - Math.floor((8 * (pos[1] - top)) / height));

    if (this.orientation.black) {
      // file = 8 - file;
      // rank = 8 - rank;
    }

    if (file && rank) {
      return file.rank(rank);
    }

  }
}

function debounceRedraw(redrawNow: dots.Redraw) {
  let redrawing = false;
  return () => {
    if (redrawing) return;
    redrawing = true;
    requestAnimationFrame(() => {
      redrawNow();
      redrawing = false;
    });
  };
}
