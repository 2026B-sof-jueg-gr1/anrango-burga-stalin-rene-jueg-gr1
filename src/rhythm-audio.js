/* Un reloj de audio para la música, la posición de las notas y las entradas. */
(function(root){
 'use strict';
 class Transport{
  constructor(createContext=null){this.createContext=createContext;this.ctx=null;this.cache=new Map();this.position=0;this.playing=false;this.musicVolume=.7;this.effectsVolume=.2;this.offsetMs=0;}
  async unlock(){
   if(!this.ctx){const Context=root.AudioContext||root.webkitAudioContext;if(!this.createContext&&!Context)throw Error('Este navegador no permite reproducir el audio del juego.');this.ctx=this.createContext?this.createContext():new Context({latencyHint:'interactive'});this.musicGain=this.ctx.createGain();this.effectsGain=this.ctx.createGain();this.musicGain.connect(this.ctx.destination);this.effectsGain.connect(this.ctx.destination);}
   this.setVolumes(this.musicVolume,this.effectsVolume);await this.ctx.resume();
  }
  setVolumes(music,effects){this.musicVolume=Math.max(0,Math.min(1,music));this.effectsVolume=Math.max(0,Math.min(1,effects));if(this.ctx){this.musicGain.gain.setTargetAtTime(this.musicVolume,this.ctx.currentTime,.02);this.effectsGain.gain.setTargetAtTime(this.effectsVolume,this.ctx.currentTime,.02);}}
  async prepare(world,progress=()=>{},signal){
   const meta=world.music,key=meta.sha256;
   if(this.cache.has(key)){const cached=this.cache.get(key);this.buffer=cached.buffer;this.pack=cached.pack;progress(1);return cached;}
   const audio=async()=>{
    const response=await fetch(meta.audio,{signal});if(!response.ok)throw Error('No se pudo cargar la canción. Revisa la conexión y reintenta.');
    const length=Number(response.headers.get('content-length'))||0;
    if(!response.body)return response.arrayBuffer();
    const reader=response.body.getReader(),chunks=[];let total=0;
    while(true){const {done,value}=await reader.read();if(done)break;chunks.push(value);total+=value.length;progress(length?Math.min(.65,total/length*.65):.25);}
    const bytes=new Uint8Array(total);let at=0;for(const chunk of chunks){bytes.set(chunk,at);at+=chunk.length;}return bytes.buffer;
   };
   const score=async()=>{const response=await fetch(`assets/scores/${world.id}.json`,{signal});if(!response.ok)throw Error('No se pudo cargar la partitura de esta canción.');return response.json();};
   const [bytes,pack]=await Promise.all([audio(),score()]);if(signal?.aborted)throw new DOMException('Carga cancelada','AbortError');
   if(pack.audio.sha256!==meta.sha256)throw Error('La canción y su partitura pertenecen a versiones distintas. Actualiza la página.');
   if(root.crypto?.subtle){const digest=await root.crypto.subtle.digest('SHA-256',bytes),actual=[...new Uint8Array(digest)].map(n=>n.toString(16).padStart(2,'0')).join('');if(actual!==meta.sha256)throw Error('El archivo de audio está incompleto o ha cambiado. Reintenta la descarga.');}
   progress(.72);const buffer=await this.ctx.decodeAudioData(bytes);if(Math.abs(buffer.duration-meta.duration)>.15)throw Error('La duración de la canción no coincide con su partitura.');
   for(const difficulty of ['easy','normal','hard'])pack.difficulties[difficulty]=root.OrbitRhythm.validate(pack.difficulties[difficulty],buffer.duration);
   if(signal?.aborted)throw new DOMException('Carga cancelada','AbortError');
   const entry={buffer,pack};this.buffer=buffer;this.pack=pack;this.cache.set(key,entry);while(this.cache.size>2)this.cache.delete(this.cache.keys().next().value);progress(1);return entry;
  }
  heardContextTime(perf=performance.now()){
   const stamp=this.ctx.getOutputTimestamp?.();
   if(stamp?.contextTime>0&&stamp.performanceTime>0)return Math.min(this.ctx.currentTime,stamp.contextTime+(perf-stamp.performanceTime)/1000);
   return this.ctx.currentTime-(this.ctx.outputLatency||this.ctx.baseLatency||0);
  }
  audioTimeAt(perf=performance.now()){return this.playing?Math.min(this.buffer.duration,this.position+this.heardContextTime(perf)-this.startedAt):this.position;}
  timeAt(perf=performance.now()){return this.audioTimeAt(perf)-this.offsetMs/1000;}
  get time(){return this.timeAt();}
  start(position=0,lead=2){
   this.stop();this.position=Math.max(0,Math.min(this.buffer.duration,position));this.startedAt=this.ctx.currentTime+lead;
   const source=this.ctx.createBufferSource();source.buffer=this.buffer;source.connect(this.musicGain);source.start(this.startedAt,this.position);this.source=source;this.playing=true;
   source.onended=()=>{source.disconnect();};
  }
  pause(){const position=Math.max(0,this.audioTimeAt());this.stop();this.position=position;return this.time;}
  stop(){if(this.source){this.source.onended=null;try{this.source.stop();}catch{}this.source.disconnect();this.source=null;}this.playing=false;}
  hit(action,kind='hit'){
   if(!this.ctx||this.ctx.state!=='running'||this.effectsVolume===0)return;
   const oscillator=this.ctx.createOscillator(),gain=this.ctx.createGain(),at=this.ctx.currentTime;
   oscillator.type=kind==='miss'?'triangle':'sine';oscillator.frequency.setValueAtTime(kind==='miss'?100:kind==='break'?940:action?650:430,at);oscillator.frequency.exponentialRampToValueAtTime(kind==='miss'?55:action?440:290,at+.04);
   gain.gain.setValueAtTime(.0001,at);gain.gain.exponentialRampToValueAtTime(kind==='miss'?.06:.13,at+.003);gain.gain.exponentialRampToValueAtTime(.0001,at+.065);oscillator.connect(gain);gain.connect(this.effectsGain);oscillator.start(at);oscillator.stop(at+.07);oscillator.onended=()=>{oscillator.disconnect();gain.disconnect();};
  }
 }
 if(typeof module!=='undefined'&&module.exports)module.exports={Transport};else root.OrbitRhythmAudio={Transport};
})(globalThis);
