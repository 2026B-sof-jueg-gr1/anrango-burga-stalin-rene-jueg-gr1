/* Las pistas fueron proporcionadas como archivos locales por el autor del proyecto. */
'use strict';
const synthPrepare=Soundtrack.prototype.prepare;
Soundtrack.prototype.analyse=function(buffer,expectedBpm){
  const data=buffer.getChannelData(0),rate=buffer.sampleRate,hop=Math.round(rate*.01),env=[];let previous=0,low=0,high=0;
  for(let start=0;start<data.length;start+=hop){let energy=0;for(let i=start;i<Math.min(data.length,start+hop);i++){low+=.025*(data[i]-low);high+=.006*(low-high);const band=low-high;energy+=band*band;}const rms=Math.sqrt(energy/hop);env.push({rms,flux:Math.max(0,rms-previous)});previous=rms;}
  const onset=env.map((v,i)=>v.flux+(env[i-1]?.flux||0)*.4+(env[i+1]?.flux||0)*.4),end=Math.min(9000,onset.length-2),start=Math.min(800,Math.floor(end*.15));let best={score:-1,bpm:expectedBpm,phase:0};
  for(let bpm=expectedBpm*.94;bpm<=expectedBpm*1.06;bpm+=.05){const step=6000/bpm;for(let phase=0;phase<step;phase+=1){let sum=0,count=0;for(let p=phase+Math.ceil((start-phase)/step)*step;p<end;p+=step){const i=Math.floor(p),f=p-i;sum+=onset[i]*(1-f)+onset[i+1]*f;count++;}const value=sum/Math.max(1,count)*(1-Math.abs(bpm-expectedBpm)/expectedBpm*.5);if(value>best.score)best={score:value,bpm,phase:phase/100};}}
  const peak=Math.max(.001,...env.map(e=>e.rms));const seconds=[];for(let i=0;i<env.length;i+=100)seconds.push(env.slice(i,i+100).reduce((a,v)=>a+v.rms,0)/Math.min(100,env.length-i)/peak);
  const bpm=Math.round(best.bpm*20)/20,step=60/bpm,grid=[best.phase];for(let beat=1;grid[beat-1]+step<buffer.duration;beat++){const predicted=grid[beat-1]+step,from=Math.max(1,Math.floor((predicted-.04)*100)),to=Math.min(onset.length-2,Math.ceil((predicted+.04)*100));let peakAt=predicted,peakValue=0;for(let i=from;i<=to;i++){const v=onset[i]*(1-Math.abs(i/100-predicted)/.12);if(v>peakValue){peakValue=v;peakAt=i/100;}}grid.push(predicted+(peakAt-predicted)*.18);}
  return {bpm,firstBeat:best.phase,energy:seconds,grid};
};
Soundtrack.prototype.prepare=async function(level,progress=()=>{}){
  if(level.external)return synthPrepare.call(this,level,progress);
  if(!level.songId)return synthPrepare.call(this,level,progress);
  this.metas??=new Map();const key='track:'+level.songId;
  if(this.cache.has(key)){this.buffer=this.cache.get(key);progress(1);return;}
  progress(.04);const response=await fetch(`assets/audio/${level.songId}.mp3`);if(!response.ok)throw Error('No se pudo cargar la canción. Comprueba la conexión y vuelve a intentar.');
  const raw=await this.ctx.decodeAudioData(await response.arrayBuffer());progress(.35);await new Promise(r=>setTimeout(r,0));
  const analysis=window.OrbitTrackMaps?.[level.songId]||this.analyse(raw,level.bpm);const step=60/analysis.bpm,bars=Math.floor((Math.min(180,raw.duration)-analysis.firstBeat)/(step*4)),duration=analysis.firstBeat+bars*4*step;
  const rate=32000,buffer=this.ctx.createBuffer(2,Math.floor(duration*rate),rate);
  for(let ch=0;ch<2;ch++){const source=raw.getChannelData(Math.min(ch,raw.numberOfChannels-1)),out=buffer.getChannelData(ch);for(let i=0;i<out.length;i++){const p=i*raw.sampleRate/rate,j=Math.floor(p),f=p-j;const fade=Math.min(1,i/(rate*.02),(out.length-i)/(rate*2.5));out[i]=((source[j]||0)*(1-f)+(source[j+1]||0)*f)*fade;}}
  const meta={...analysis,bars,duration,sourceDuration:raw.duration};this.metas.set(level.songId,meta);this.buffer=buffer;this.cache.set(key,buffer);while(this.cache.size>2)this.cache.delete(this.cache.keys().next().value);progress(1);
};
