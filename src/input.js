/* Dos formas de controlar las mismas alturas. Sin teclas configurables. */
(function(root){
  'use strict';
  const MODES=['keyboard','hybrid'];
  const KEYS={keyboard:['KeyF','KeyJ'],hybrid:['KeyZ','KeyX']};
  class Controller{
    constructor(mode='keyboard'){this.held=new Set();this.lanes=new Map();this.aim=0;this.mode='keyboard';this.setMode(mode);}
    setMode(mode){const next=MODES.includes(mode)?mode:'keyboard';if(next!==this.mode){this.clear();this.aim=0;}this.mode=next;}
    actionFor(code){const index=KEYS[this.mode].indexOf(code);return index<0?null:this.mode==='hybrid'?this.aim:index;}
    move(y,height){
      if(this.mode!=='hybrid'||!Number.isFinite(y)||!Number.isFinite(height)||height<=0)return false;
      const worldY=y/height*720,previous=this.aim;
      // Banda de tolerancia alrededor del punto medio de los dos receptores.
      if(worldY<445)this.aim=1;else if(worldY>465)this.aim=0;
      return previous!==this.aim;
    }
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
  function adaptChart(chart,mode){
    if(mode!=='hybrid')return chart;
    const ordered=chart.notes.map(n=>({...n})).sort((a,b)=>a.time-b.time||a.action-b.action),notes=[];
    for(let i=0;i<ordered.length;){const group=[ordered[i++]];while(i<ordered.length&&Math.abs(ordered[i].time-group[0].time)<.001)group.push(ordered[i++]);
      // Conserva el sostenido; en parejas de golpes, alterna la altura de la frase.
      const hold=group.find(n=>n.end>n.time),previous=notes.at(-1)?.action;
      notes.push(hold||group.find(n=>n.action!==previous)||group[0]);
    }
    notes.forEach((n,i)=>n.id=i);return {...chart,notes};
  }
  const api={MODES,KEYS,Controller,adaptChart};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.OrbitInput=api;
})(globalThis);
