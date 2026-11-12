/* Síntesis original local: cinco piezas, sin servicios externos ni archivos comerciales. */
'use strict';
class Soundtrack{
  constructor(){this.ctx=null;this.cache=new Map();this.volume=.65;this.offset=0;this.running=false;}
  async unlock(){this.ctx??=new(window.AudioContext||window.webkitAudioContext)({latencyHint:'interactive'});if(!this.master){this.master=this.ctx.createGain();this.master.connect(this.ctx.destination);}this.master.gain.value=this.volume;await this.ctx.resume();}
  setVolume(v){this.volume=v;if(this.master)this.master.gain.setTargetAtTime(v,this.ctx.currentTime,.03);}
  async prepare(level,progress=()=>{}){
    if(this.cache.has(level.id)){this.buffer=this.cache.get(level.id);progress(1);return;}
    const rate=22050,step=60/level.bpm,buffer=this.ctx.createBuffer(2,Math.ceil((level.bars*4*step+2)*rate),rate),L=buffer.getChannelData(0),R=buffer.getChannelData(1),waves=new Map();let seed=721+level.theme;
    const random=()=>{seed=seed*16807%2147483647;return seed/2147483647;};
    function wave(type,midi,length){const key=`${type}/${midi}/${length.toFixed(2)}`;if(waves.has(key))return waves.get(key);const a=new Float32Array(Math.ceil(length*rate)),hz=440*2**((midi-69)/12);let phase=0,prev=0;
      if(type==='guitar'||type==='drive'){const period=Math.max(2,Math.round(rate/hz)),line=Float32Array.from({length:period},()=>random()*2-1);for(let i=0;i<a.length;i++){const j=i%period,v=(line[j]+line[(j+1)%period])*.4987;line[j]=v;a[i]=(type==='drive'?Math.tanh(v*7)*.8:v)*Math.min(1,i/60)*Math.min(1,(a.length-i)/300)*Math.exp(-i/(rate*1.2));}}
      else for(let i=0;i<a.length;i++){const t=i/rate,tail=Math.min(1,(a.length-i)/180);if(type==='kick'){phase+=2*Math.PI*(43+130*Math.exp(-t*35))/rate;a[i]=Math.sin(phase)*Math.exp(-t*15)*tail;}else if(type==='snare'||type==='hat'){const n=random()*2-1;a[i]=((n-prev*.65)*.65+(type==='snare'?Math.sin(t*1150)*.3:0))*Math.exp(-t*(type==='snare'?24:95))*tail;prev=n;}else{phase=t*2*Math.PI*hz;const env=type==='pad'?Math.min(1,t/.35)*Math.min(1,(length-t)/.7):Math.min(1,t/.008)*Math.exp(-t*(type==='bass'?6:4))*tail;a[i]=(Math.sin(phase)+.22*Math.sin(phase*2.003)+.1*Math.sin(phase*3))*env*.6;}}
      waves.set(key,a);return a;
    }
    const mix=(t,a,g,pan=0)=>{const start=Math.round(t*rate),gl=g*Math.sqrt((1-pan)/2),gr=g*Math.sqrt((1+pan)/2);for(let i=0;i<a.length&&start+i<L.length;i++){L[start+i]+=a[i]*gl;R[start+i]+=a[i]*gr;}};
    const roots=[0,-5,-2,-7],motif=[0,7,10,12,7,3,5,10];
    for(let bar=0;bar<level.bars;bar++){const beat=bar*4,root=level.root+roots[(Math.floor(bar/2)+level.theme)%4],phase=Math.floor(bar/8)%3;
      [0,7,12,15].forEach((n,i)=>mix(beat*step,wave('pad',root+12+n,step*5),.06,i%2?.6:-.6));
      for(let k=0;k<4;k++){const t=(beat+k)*step;mix(t,wave('kick',0,.4),k%2===0?.62:.2);if(k%2)mix(t,wave('snare',0,.22),.43);mix(t,wave('bass',root+(k%2?12:0),step*.85),.36);mix(t,wave('hat',0,.08),.09,-.3);if(beat>=32)mix(t+step*.5,wave('hat',0,.06),.065,.3);
        if(level.theme>=2||phase===2){mix(t,wave('drive',root+12,step*.9),.5,-.5);mix(t+.01,wave('drive',root+19,step*.9),.3,.5);}
        if(bar%8>=6)mix(t+step*.5,wave('bell',root+24+motif[(k+bar)%8],.4),.07,.4);
      }
      if(bar%6===0){progress(bar/level.bars*.75);await new Promise(r=>setTimeout(r,0));}
    }
    for(const e of Orbita.score(level).events){const type=e.action===0?'bell':level.theme>=2?'drive':'guitar',t=e.beat*step;mix(t,wave(type,e.midi,Math.max(.5,e.duration*step+.2)),e.min===0?.44:.15,e.action===0?-.28:.28);mix(t+step*.75,wave('bell',e.midi+12,.3),.025,e.action===0?.5:-.5);}
    let peak=1;for(let i=0;i<L.length;i++)peak=Math.max(peak,Math.abs(L[i]),Math.abs(R[i]));const gain=.88/peak;for(let i=0;i<L.length;i++){L[i]*=gain;R[i]*=gain;}
    this.buffer=buffer;this.cache.set(level.id,buffer);progress(1);
  }
  play(offset=0,lead=1.5){this.stop();this.offset=offset;this.started=this.ctx.currentTime+lead;this.source=this.ctx.createBufferSource();this.source.buffer=this.buffer;this.source.connect(this.master);this.source.start(this.started,Math.max(0,offset));this.running=true;}
  get time(){return this.running?this.offset+this.ctx.currentTime-this.started:this.offset;}
  pause(){const t=Math.max(0,this.time);this.stop();this.offset=t;return t;}
  stop(){if(this.source){try{this.source.stop();}catch{}this.source.disconnect();this.source=null;}this.running=false;}
  effect(kind,action=0){if(!this.ctx||this.ctx.state!=='running')return;const notes=kind==='win'?[523,659,784]:kind==='miss'?[90]:[action?660:440];notes.forEach((hz,i)=>{const o=this.ctx.createOscillator(),g=this.ctx.createGain(),t=this.ctx.currentTime+i*.09;o.type=kind==='miss'?'triangle':'sine';o.frequency.setValueAtTime(hz,t);o.frequency.exponentialRampToValueAtTime(hz*.6,t+.14);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(kind==='win'?.12:.05,t+.006);g.gain.exponentialRampToValueAtTime(.0001,t+.25);o.connect(g);g.connect(this.master);o.start(t);o.stop(t+.3);o.onended=()=>{o.disconnect();g.disconnect();};});}
  click(at){if(!this.ctx)return;const o=this.ctx.createOscillator(),g=this.ctx.createGain();o.frequency.value=880;g.gain.setValueAtTime(.1,at);g.gain.exponentialRampToValueAtTime(.0001,at+.05);o.connect(g);g.connect(this.master);o.start(at);o.stop(at+.06);o.onended=()=>{o.disconnect();g.disconnect();};}
}
