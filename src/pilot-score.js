/* Puerto Aurora: frases sobre ataques existentes, con descansos deliberados. */
(function(root){
  'use strict';
  function compose(source,difficulty){
    const options={easy:{gap:.72,size:[2,3,2,4],rest:1.65},medium:{gap:.39,size:[3,4,3,5],rest:1.1},hard:{gap:.23,size:[5,6,4,7],rest:.72}}[difficulty];
    const patterns={easy:[[0,0],[1,1,0],[0,1],[0,1,0,1]],medium:[[0,0,1],[0,1,1,0],[1,0,1],[0,1,0,1,0]],hard:[[0,1,0,1,0],[0,0,1,1,0,1],[1,0,1,0],[0,1,1,0,0,1,0]]}[difficulty];
    const unique=source.notes.filter((n,i,a)=>i===0||n.time-a[i-1].time>.02),notes=[],phrases=[];
    let available=2.6,index=0,phrase=0;
    while(index<unique.length){
      while(index<unique.length&&unique[index].time<available)index++;
      if(index>=unique.length)break;
      const from=unique[index].time,limit=options.size[phrase%options.size.length];let count=0,last=-Infinity;
      while(index<unique.length&&count<limit){
        const n=unique[index++];if(n.time<available||n.time-last<options.gap)continue;
        if(n.kind==='projectile'){continue;}
        const duration=n.end-n.time,hold=duration>.8&&count===limit-1;
        notes.push({action:patterns[phrase%patterns.length][count],time:n.time,end:hold?n.end:n.time,kind:'enemy'});last=n.time;available=hold?n.end:n.time;count++;
      }
      if(count){phrases.push({from,to:available,notes:count});available+=options.rest;phrase++;}
    }
    // Seis respuestas claras en Fácil; más respuestas, nunca un muro de disparos.
    const shotCount={easy:6,medium:8,hard:10}[difficulty],shots=source.notes.filter(n=>n.kind==='projectile'),used=new Set();
    for(let i=0;i<shotCount;i++){
      const target=source.moving.time+1.7+i*(source.moving.end-source.moving.time-3.2)/(shotCount-1);
      const candidate=shots.filter(n=>!used.has(n.time)).sort((a,b)=>Math.abs(a.time-target)-Math.abs(b.time-target))[0];
      if(candidate){used.add(candidate.time);notes.push({action:i%2,time:candidate.time,end:candidate.time,kind:'projectile'});}
    }
    // Las colas proceden del borrador musical original; no inventar duraciones.
    for(const hold of source.sustains||[]){
      for(let i=notes.length-1;i>=0;i--)if(notes[i].kind!=='projectile'&&notes[i].time>=hold.time-.45&&notes[i].time<=hold.end+.55)notes.splice(i,1);
      notes.push({...hold});
    }
    notes.sort((a,b)=>a.time-b.time||a.action-b.action);
    return {version:1,source:'pilot-phrases-v1',title:source.title,artist:source.artist,audioFile:source.audioFile,timing:source.timing,notes,moving:source.moving,boss:source.boss,duration:source.duration,phrases};
  }
  const api={compose};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.OrbitPilotScore=api;
})(globalThis);
