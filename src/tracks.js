/* Archivos originales completos y partituras con tiempos absolutos. */
'use strict';
const externalPrepare=Soundtrack.prototype.prepare;
Soundtrack.prototype.prepare=async function(level,progress=()=>{}){
  if(level.external)return externalPrepare.call(this,level,progress);
  if(!level.songId)throw Error('Esta estación no tiene una canción configurada.');
  this.metas??=new Map();const key='track:'+level.songId;
  if(this.cache.has(key)){this.buffer=this.cache.get(key);progress(1);return;}
  progress(.04);const response=await fetch(`assets/audio/${level.songId}.mp3`);if(!response.ok)throw Error('No se pudo cargar la canción. Revisa la conexión.');
  const raw=await this.ctx.decodeAudioData(await response.arrayBuffer());progress(.55);await new Promise(r=>setTimeout(r,0));
  let charts;const mapResponse=await fetch(`assets/charts/${level.songId}.json`);
  if(mapResponse.ok)charts=await mapResponse.json();else charts=OrbitNotation.fromAudio(raw,level);
  for(const difficulty of ['easy','medium','hard'])charts[difficulty]=OrbitNotation.validate(charts[difficulty],raw.duration);
  const meta={charts,duration:raw.duration,sourceDuration:raw.duration,bars:Math.floor(raw.duration*level.bpm/240)};
  this.metas.set(level.songId,meta);
  // Se conserva el audio decodificado: no hay recorte, fundido ni cambio de frecuencia.
  this.buffer=raw;this.cache.set(key,raw);while(this.cache.size>2)this.cache.delete(this.cache.keys().next().value);progress(1);
};
