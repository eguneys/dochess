import * as dots from './types';
import * as cs from 'chesst';

export type Config = {
  fen?: cs.Fen,
  orientation?: cs.Color,
  userMove?: dots.UserMove
}

export type State = {
  fen: cs.Fen,
  orientation: cs.Color,
  userMove: dots.UserMove
}

export function defaults(): State {
  return {
    fen: cs.initial,
    orientation: cs.Color.white,
    userMove(uciS: string, fen: cs.Fen) {
      let sit = cs.situation(fen);
      let afterFen = sit?.uciOrCastles(cs.uciOrCastles(uciS)!)?.after.fen;
      return Promise.resolve(afterFen||fen);
    }
  }
}

export function configure(config: Config) {

  let state = defaults();
  
  merge(state, config);

  return state;
  
}

function merge(base: any, extend: any): void {
  for (const key in extend) {
    if (isObject(base[key]) && isObject(extend[key])) merge(base[key], extend[key]);
    else base[key] = extend[key];
  }
}

function isObject(o: unknown): boolean {
  return typeof o === 'object';
}
