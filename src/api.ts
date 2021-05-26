import Ctrl from './ctrl';

export default class Api {

  ctrl: Ctrl
  
  constructor(ctrl: Ctrl) {
    this.ctrl = ctrl;
  }


  fen(fen: string, lastMove?: string) {
    this.ctrl.fen = fen;
    this.ctrl.redraw();
  }
  
}
