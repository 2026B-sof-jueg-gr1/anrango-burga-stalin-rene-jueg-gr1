/* Reproducción de pistas locales y efectos originales de interfaz. */
'use strict';
class Soundtrack{
  constructor(){this.ctx=null;this.cache=new Map();this.volume=.65;this.offset=0;this.running=false;}
  async unlock(){this.ctx??=new(window.AudioContext||window.webkitAudioContext)({latencyHint:'interactive'});if(!this.master){this.master=this.ctx.createGain();this.master.connect(this.ctx.destination);}this.master.gain.value=this.volume;await this.ctx.resume();}
  setVolume(v){this.volume=v;if(this.master)this.master.gain.setTargetAtTime(v,this.ctx.currentTime,.03);}
  async prepare(level,progress=()=>{}){
    if(!level.external)throw new Error('Esta estación necesita una canción configurada.');
    this.buffer=await this.ctx.decodeAudioData(await level.external.blob.arrayBuffer());progress(1);
  }
  play(offset=0,lead=1.5){this.stop();this.offset=offset;this.started=this.ctx.currentTime+lead;this.source=this.ctx.createBufferSource();this.source.buffer=this.buffer;this.source.connect(this.master);this.source.start(this.started,Math.max(0,offset));this.running=true;}
  get time(){return this.running?this.offset+this.ctx.currentTime-this.started:this.offset;}
  pause(){const t=Math.max(0,this.time);this.stop();this.offset=t;return t;}
  stop(){if(this.source){try{this.source.stop();}catch{}this.source.disconnect();this.source=null;}this.running=false;}
  effect(kind,action=0){if(!this.ctx||this.ctx.state!=='running')return;const notes=kind==='win'?[523,659,784]:kind==='miss'?[90]:[action?660:440];notes.forEach((hz,i)=>{const o=this.ctx.createOscillator(),g=this.ctx.createGain(),t=this.ctx.currentTime+i*.09;o.type=kind==='miss'?'triangle':'sine';o.frequency.setValueAtTime(hz,t);o.frequency.exponentialRampToValueAtTime(hz*.6,t+.14);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(kind==='win'?.12:.05,t+.006);g.gain.exponentialRampToValueAtTime(.0001,t+.25);o.connect(g);g.connect(this.master);o.start(t);o.stop(t+.3);o.onended=()=>{o.disconnect();g.disconnect();};});}
  click(at){if(!this.ctx)return;const o=this.ctx.createOscillator(),g=this.ctx.createGain();o.frequency.value=880;g.gain.setValueAtTime(.1,at);g.gain.exponentialRampToValueAtTime(.0001,at+.05);o.connect(g);g.connect(this.master);o.start(at);o.stop(at+.06);o.onended=()=>{o.disconnect();g.disconnect();};}
}
