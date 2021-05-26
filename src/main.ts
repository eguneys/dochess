import { VNode,
         init,
         eventListenersModule,
         propsModule,
         classModule,
         styleModule,
         attributesModule } from 'snabbdom';
import Api from './api';
import { Config, configure } from './state';
import view from './view';
import Ctrl from './ctrl';

const patch = init([
  propsModule,
  eventListenersModule,
  classModule,
  styleModule,
  attributesModule]);

export default function app($_: Element, opts: Config = {}) {

  let vnode: VNode, ctrl: Ctrl;

  let state = configure(opts);
  
  function redraw() {
    vnode = patch(vnode, view(ctrl));
  }

  ctrl = new Ctrl(state, redraw);
  
  vnode = patch($_, view(ctrl));
  
  return new Api(ctrl);
  
}
