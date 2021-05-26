import * as dots from './types';
import { VNode, h } from 'snabbdom';
import Ctrl from './ctrl';
import * as util from './util';
import { CurrentDrag } from './drag';
import * as cs from 'chesst';

function translate(pos: [number, number]) {
  return `translate(${pos[0]}px,${pos[1]}px)`;
}

export function vPiese(fPosToTranslate: util.FPosToTranslate, pos: cs.Pos, piece: cs.Piece) {
  return vPiece(piece, fPosToTranslate(pos))
}

export const vDragging = (ctrl: Ctrl) => {
  if (ctrl.bounds && ctrl.drag.drag) {
    let { piece, epos } = ctrl.drag.drag;
    let bs = ctrl.bounds();
    epos = [epos[0] - bs.left - bs.width / 16,
            epos[1] - bs.top - bs.height / 16];    
    return vPiece(piece, epos);
  }
}

export function vPiece(piece: cs.Piece, epos: dots.NumberPair) {
  let color = piece.color.long,
  role = piece.role.long;
  return h(`piece.${color}.${role}`, {
    style: {
      transform: translate(epos)
    }
  });
}

export function vPromotionChoice(fPosToTranslate: util.FPosToTranslate,
                                 ctrl: Ctrl) {
  if (ctrl.promoteAsk) {
    let { orig, dest, piece } = ctrl.promoteAsk;
    let color = piece.color.long;
    
    return h('div.promote-ask', {
      hook: util.bind('click', e => {
        ctrl.promoteCancel();
        ctrl.redraw();
      })
    }, cs.Role.promotables.map((role, i) => {
      let dir = orig.rank.index - dest.rank.index;
      return h('square', {
        hook: util.bind('click', e => {
          ctrl.promoteChoose(role);
          ctrl.redraw();
        }),
        style: {
          transform: translate(fPosToTranslate(dest.file.rank(
            cs.Rank.allByIndex.get(dest.rank.index + dir * i)!)))
        }
      }, h(`piece.${color}.${role.long}`));
    }));
  }  
}

export default function view(ctrl: Ctrl) {

  let orientation = ctrl.orientation.long;

  let vPieces: Array<VNode> = [],
  _vPromotionChoice = null,
  vReckon = null;
  

  if (ctrl.bounds) {
    let fPosToTranslate = util.ffPosToTranslateAbs(ctrl.bounds());

    _vPromotionChoice = vPromotionChoice(fPosToTranslate, ctrl);
    
    vPieces =
      ctrl.board.values
        .map(({pos, piece}: cs.Piese) =>
          vPiese(fPosToTranslate, pos, piece))

    if (ctrl.reckon) {
      vReckon = vPiese(fPosToTranslate, ctrl.reckon.pos, ctrl.reckon.piece);
    }
  }

  let vSituation = h('md-board', {
    hook: util.onInsert((el: Element) => {

      ctrl.bounds = util.memo(() => el.getBoundingClientRect());
      
      const observer = new (window as any)['ResizeObserver'](() => {
        ctrl.bounds?.clear();
        ctrl.redraw();
      });

      observer.observe(el);

      let onStart = (e: dots.MouchEvent) => {
        let pos = util.eventPosition(e);

        if (pos) {
          let orig = ctrl.getKeyAtDomPos(pos);
          ctrl.drag.start(pos, orig);
        }
      };
      
      el.addEventListener('touchstart', onStart, {
        passive: false
      });
      el.addEventListener('mousedown', onStart, {
        passive: false
      });

      el.addEventListener('contextmenu', e => e.preventDefault());
    })
  },[
    ...vPieces,
    vReckon,
    vDragging(ctrl)
  ]);

  let vCoRanks = h(`coords.ranks.${orientation}`,
                   cs.Rank.all.map(_ => h('coord', _.key)));

  let vCoFiles = h(`coords.files.${orientation}`,
                   cs.File.all.map(_ => h('coord', _.key)));

  return h('md-wrap', {
    hook: util.onInsert(el => {

      const onMove = (e: dots.MouchEvent) => {
        let pos = util.eventPosition(e);
        if (pos) {
          ctrl.drag.move(pos);
          ctrl.redraw();
        }
      },
      onEnd = (e: dots.MouchEvent) => {
        let pos = util.eventPosition(e) || ctrl.drag.epos,
        orig = ctrl.getKeyAtDomPos(pos!);

        ctrl.drag.end(pos!, orig);
        ctrl.redraw();
      }

      for (const ev of ['touchmove', 'mousemove']) {
        document.addEventListener(ev, onMove);
      }
      for (const ev of ['touchend', 'mouseup']) {
        document.addEventListener(ev, onEnd);
      }

      const onScroll = () => {
        ctrl.bounds?.clear();
        ctrl.redraw();
      };

      document.addEventListener('scroll', onScroll, {capture: true, passive: true});
      document.addEventListener('resize', onScroll, {passive: true});
      
    })
  }, [vSituation,
      _vPromotionChoice,
      vCoRanks,
      vCoFiles]);
}
