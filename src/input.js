/* Único control: F en el suelo, J en el aire. */
(function(root){
  'use strict';
  const MODES=['keyboard'];
  const KEYS={keyboard:['KeyF','KeyJ']};
  class Controller{
    constructor(mode='keyboard'){this.held=new Set();this.lanes=new Map();this.aim=0;this.mode='keyboard';this.setMode(mode);}
    setMode(){this.mode='keyboard';this.aim=0;this.clear();}
    actionFor(code){const index=KEYS.keyboard.indexOf(code);return index<0?null:index;}
    move(){return false;}
    down(code,touchLane){
      if(this.held.has(code))return null;
      const action=code.startsWith('touch')?touchLane:this.actionFor(code);
      if(action!==0&&action!==1)return null;
      this.held.add(code);this.lanes.set(code,action);
      return {action,stroke:code.startsWith('touch')?action:KEYS[this.mode].indexOf(code)};
    }
    up(code){if(!this.held.has(code))return null;const action=this.lanes.get(code);this.held.delete(code);this.lanes.delete(code);return this.isHeld(action)?null:action;}
    isHeld(action){return [...this.lanes.values()].includes(action);}
    clear(){this.held.clear();this.lanes.clear();}
  }
  const api={MODES,KEYS,Controller};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.OrbitInput=api;
})(globalThis);
