/* Partituras en segundos del archivo original. No se cuantiza al importar. */
(function(root){
  'use strict';
  function validate(raw,audioDuration){
    if(!raw||!Array.isArray(raw.notes)||raw.notes.length<1||raw.notes.length>50000)throw Error('La partitura debe contener entre 1 y 50 000 notas.');
    const duration=audioDuration??raw.duration;if(!Number.isFinite(duration)||duration<=0||duration>3600)throw Error('Duración de canción inválida.');
    const notes=raw.notes.map((n,i)=>{const time=n.time,end=n.end??time;if(![0,1].includes(n.action)||!Number.isFinite(time)||!Number.isFinite(end)||time<0||end<time||end>duration+.02)throw Error(`Nota ${i+1}: altura o tiempo fuera de la canción.`);return {id:i,action:n.action,time,end,kind:n.kind==='projectile'?'projectile':'enemy',state:'pending',down:false,grace:0};}).sort((a,b)=>a.time-b.time||a.action-b.action);
    const ends=[-1,-1];notes.forEach((n,i)=>{if(n.time<ends[n.action]+.034)throw Error(`Nota ${i+1}: se solapa con otra nota de su altura.`);ends[n.action]=n.end;n.id=i;});
    const window=(value,name)=>{if(!value)return null;if(!Number.isFinite(value.time)||!Number.isFinite(value.end)||value.time<0||value.end<=value.time||value.end>duration)throw Error(`${name}: intervalo inválido.`);return {time:value.time,end:value.end};};
    const boss=window(raw.boss,'Escudo'),moving=window(raw.moving,'Jefe móvil');
    if(boss&&notes.some(n=>n.time<boss.end+.2&&n.end>boss.time-.2))throw Error('El escudo no puede solaparse con notas normales.');
    return {version:1,source:typeof raw.source==='string'?raw.source:'json',title:String(raw.title||'').slice(0,200),artist:String(raw.artist||'').slice(0,200),audioFile:String(raw.audioFile||'').slice(0,200),timing:Array.isArray(raw.timing)?raw.timing.filter(t=>Number.isFinite(t.time)&&Number.isFinite(t.beatLength)&&t.beatLength>0).map(t=>({time:t.time,beatLength:t.beatLength})):[],notes,boss,moving,duration};
  }
  function fromOsu(text,duration){
    if(typeof text!=='string'||text.length>4000000||!text.replace(/^\uFEFF/,'').startsWith('osu file format'))throw Error('Selecciona un archivo .osu válido.');
    const sections={};let section='';for(const original of text.split(/\r?\n/)){const line=original.trim();if(!line||line.startsWith('//'))continue;if(/^\[.+\]$/.test(line)){section=line.slice(1,-1);sections[section]??=[];}else(sections[section]??=[]).push(line);}
    const values=name=>Object.fromEntries((sections[name]||[]).map(l=>{const at=l.indexOf(':');return [l.slice(0,at).trim(),l.slice(at+1).trim()];}));
    const general=values('General'),difficulty=values('Difficulty'),meta=values('Metadata');
    if(Number(general.Mode)!==3||Number(difficulty.CircleSize)!==2)throw Error('Usa osu!mania con exactamente 2 columnas: suelo y aire.');
    const notes=(sections.HitObjects||[]).map((line,i)=>{const a=line.split(','),x=Number(a[0]),type=Number(a[3]);if(!Number.isFinite(x)||x<0||x>512||!Number.isInteger(type)||(!(type&1)&&!(type&128)))throw Error(`Objeto ${i+1}: solo se admiten golpes y notas largas de mania.`);const time=Number(a[2])/1000,end=type&128?Number(a[5]?.split(':')[0])/1000:time;return {time,end,action:x<256?0:1};});
    const timing=(sections.TimingPoints||[]).map(line=>line.split(',')).filter(a=>Number(a[6])===1&&Number(a[1])>0).map(a=>({time:Number(a[0])/1000,beatLength:Number(a[1])/1000}));
    return validate({version:1,source:'osu',title:meta.Title,artist:meta.Artist,audioFile:general.AudioFilename,timing,notes},duration);
  }
  // Un borrador desde transitorios reales; no sustituye una revisión musical de autor.
  function fromAudio(buffer,level){
    const data=buffer.getChannelData(0),rate=buffer.sampleRate,hop=Math.round(rate*.01),stride=Math.max(1,Math.floor(rate/11025)),bands=[];let low=0,slow=0;
    for(let start=0;start<data.length;start+=hop){let bass=0,treble=0,energy=0,count=0;for(let i=start;i<Math.min(data.length,start+hop);i+=stride){const sample=data[i];low+=(sample-low)*.16;slow+=(low-slow)*.035;const lo=slow,hi=sample-low;bass+=lo*lo;treble+=hi*hi;energy+=sample*sample;count++;}bands.push([Math.sqrt(bass/count),Math.sqrt(treble/count),Math.sqrt(energy/count)]);}
    const novelty=bands.map((b,i)=>{if(!i)return [0,0,0];const previous=bands[Math.max(0,i-2)],lo=Math.max(0,Math.log(1+b[0]*70)-Math.log(1+previous[0]*70)),hi=Math.max(0,Math.log(1+b[1]*50)-Math.log(1+previous[1]*50));return [lo,hi,(lo+hi*.8)*Math.min(1,b[2]*15)];});
    const peaks=[];
    for(let i=3;i<novelty.length-3;i++){
      const value=novelty[i][2];if(value<.035||value<novelty[i-1][2]||value<=novelty[i+1][2])continue;
      let mean=0;const from=Math.max(0,i-50),to=Math.min(novelty.length,i+50);for(let j=from;j<to;j++)mean+=novelty[j][2];mean/=(to-from);
      if(value<mean*1.5)continue;
      // El salto de energía se detecta dentro de la ventana: el tiempo es el comienzo del ataque.
      const time=Math.max(0,(i*.01)-.006);if(time<2.6||time>buffer.duration-1)continue;
      peaks.push({time,strength:value,lo:novelty[i][0],hi:novelty[i][1],action:novelty[i][0]>novelty[i][1]*.85?0:1});
    }
    const duration=buffer.duration,step=60/level.bpm,movingStart=Math.floor(duration*.34/step)*step,bossStart=Math.floor(duration*.64/step)*step;
    const moving={time:movingStart,end:Math.min(movingStart+14,bossStart-4)},boss={time:bossStart,end:Math.min(duration-3,bossStart+18)},charts={};
    for(const [difficulty,minGap,threshold]of [['easy',.5,1.4],['medium',.29,1.05],['hard',.16,.7]]){
      const ordered=peaks.filter(p=>p.time<boss.time-.6||p.time>boss.end+.6).sort((a,b)=>b.strength-a.strength),chosen=[];
      const typical=peaks.reduce((a,p)=>a+p.strength,0)/Math.max(1,peaks.length),cutoff=Math.min(typical*threshold,ordered[Math.floor(ordered.length*(difficulty==='easy'?.5:difficulty==='medium'?.7:.9))]?.strength||0);
      for(const peak of ordered){if(peak.strength<cutoff||chosen.some(n=>Math.abs(n.time-peak.time)<minGap))continue;chosen.push({...peak});}
      chosen.sort((a,b)=>a.time-b.time);let streak=0,last=-1;
      const notes=chosen.map((p,i)=>{let action=p.action;streak=action===last?streak+1:1;if(streak>3){action=1-action;streak=1;}last=action;return {time:+p.time.toFixed(3),end:+p.time.toFixed(3),action,kind:p.time>=moving.time&&p.time<moving.end?'projectile':'enemy'};});
      // Estelas solo en frases sostenidas que dejan espacio al siguiente ataque.
      for(let i=0;i<notes.length-1;i++){const n=notes[i],next=notes[i+1],gap=next.time-n.time;if(n.kind==='projectile'||gap<1.25||i%3)continue;let end=n.time+.2;for(let t=end;t<Math.min(next.time-.3,n.time+2.5);t+=.01){if((bands[Math.floor(t*100)]?.[2]||0)<.05)break;end=t;}if(end-n.time>.75&&end<boss.time-.3||end-n.time>.75&&n.time>boss.end+.3)n.end=+end.toFixed(3);}
      if(difficulty!=='easy'){let lastChord=-10;for(let i=0;i<chosen.length;i++){const peak=chosen[i],n=notes[i],opposite=1-n.action;if(peak.time-lastChord<5||peak.strength<typical*2.1||peak.lo<peak.hi*.65||peak.hi<peak.lo*.65||n.kind==='projectile')continue;if(notes.some(other=>other.action===opposite&&other.time<peak.time+.16&&other.end>peak.time-.16))continue;notes.push({time:n.time,end:n.time,action:opposite,kind:'enemy'});lastChord=peak.time;}}
      charts[difficulty]=validate({version:1,source:'accent-draft',notes,moving,boss},duration);
    }
    return charts;
  }
  function fingerprint(map){let hash=2166136261;const text=JSON.stringify([map.notes.map(n=>[n.action,n.time,n.end]),map.boss,map.moving]);for(let i=0;i<text.length;i++){hash^=text.charCodeAt(i);hash=Math.imul(hash,16777619);}return (hash>>>0).toString(36);}
  const api={validate,fromOsu,fromAudio,fingerprint};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.OrbitNotation=api;
})(globalThis);
