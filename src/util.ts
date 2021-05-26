import * as dots from './types';
import { VNode, Hooks } from 'snabbdom';
import * as cs from 'chesst';

export type Memo<A> = {
  clear(): void,
  (): A
}

export function memo<A>(f: () => A): Memo<A> {
  let v: A | undefined;
  const ret = (): A => {
    if (v === undefined) v = f();
    return v;
  };
  ret.clear = () => {
    v = undefined;
  };
  return ret;
}

export const eventPosition = (e: dots.MouchEvent): dots.NumberPair | undefined => {
  if (e.clientX || e.clientX === 0) return [e.clientX, e.clientY!];
  if (e.targetTouches?.[0]) return [e.targetTouches[0].clientX, e.targetTouches[0].clientY];
  return; // touchend has no position!
};


const posToTranslateBase = (pos: cs.Pos, xFactor: number, yFactor: number): [number, number] => [
  (pos.file.index - 1) * xFactor,
  (8 - pos.rank.index) * yFactor
];

export type FPosToTranslate = (pos: cs.Pos) => [number, number];

export function ffPosToTranslateAbs(bounds: ClientRect): FPosToTranslate {
  let xFactor = bounds.width / 8,
  yFactor = bounds.height / 8;

  return (pos: cs.Pos) =>
    posToTranslateBase(pos, xFactor, yFactor);
}

export const onInsert = (f: (_: HTMLElement) => void): Hooks => ({
  insert(vnode: VNode) {
    f(vnode.elm as HTMLElement)
  }
})

export const bind = (eventName: string, f: (e: Event) => void | Promise<void>, redraw?: dots.Redraw, passive: boolean = true): Hooks =>
  onInsert(el => {
    el.addEventListener(
      eventName,
      e => {
        Promise.resolve(f(e)).then(() => {
          redraw && redraw();
        });
      }, { passive });
  });
