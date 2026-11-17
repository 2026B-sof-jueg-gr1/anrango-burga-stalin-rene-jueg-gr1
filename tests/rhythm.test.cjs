const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto');
const R=require('../src/rhythm.js'),A=require('../src/rhythm-audio.js'),catalog=require('../src/music-catalog.js');
const mini=(notes=[],bosses=[])=>({duration:20,notes:notes.length?notes:[{action:0,time:12,end:12}],bosses,encounters:[]});
function playPerfect(map,difficulty){
 const s=new R.Session(map,difficulty),events=[];
 for(const n of s.notes){events.push({t:n.time,action:n.action,down:true});events.push({t:n.end+(n.end>n.time?.001:.025),action:n.action,down:false});}
 for(const b of s.bosses){const step=Math.min(.12,(b.end-b.time-.15)/(b.required+8));for(let i=0,t=b.time+.05;t<b.end-.05;i++,t+=step){const action=i%2;events.push({t,action,down:true},{t:t+.02,action,down:false});}}
 events.sort((a,b)=>a.t-b.t||Number(a.down)-Number(b.down));
 for(const e of events){s.update(e.t);e.down?s.press(e.action,e.t):s.release(e.action,e.t);assert.equal(s.failed,false,'No puede fallar con todas las entradas correctas');}
 s.update(s.duration+.02);return s;
}
test('Las ocho canciones usan los archivos elegidos y sus 24 partituras conservan la duración real',()=>{
 for(const[id,meta]of Object.entries(catalog)){
  assert.equal(crypto.createHash('sha256').update(fs.readFileSync(meta.audio)).digest('hex'),meta.sha256);
  const pack=JSON.parse(fs.readFileSync(`assets/scores/${id}.json`)),source=JSON.parse(fs.readFileSync(`assets/scores/source/${id}.json`));assert.equal(pack.audio.sha256,meta.sha256);
  let previous=0;
  for(const[d,map]of Object.entries(pack.difficulties)){
   R.validate(map);assert.equal(map.duration,meta.duration);assert.ok(map.duration>150);assert.ok(map.notes.length>previous);previous=map.notes.length;
   assert.ok(map.notes.some(n=>n.end>n.time));assert.ok(map.notes.some(n=>n.pattern==='doble'));assert.ok(map.notes.some(n=>n.kind==='projectile'));assert.ok(map.bosses.length>=1);
   for(const n of map.notes){const p=source.attacks[n.attack];assert.ok(Math.abs(n.time-p.time)<.0006,`${id}/${d}: ataque desplazado`);assert.ok(n.end<=Math.max(n.time,p.sustainEnd)+.001);}
   const s=playPerfect(map,d);assert.ok(s.cleared,`${id}/${d}`);assert.equal(s.accuracy,100);assert.equal(s.counts.miss,0);assert.equal(s.bosses.filter(b=>b.won).length,map.bosses.length);assert.ok(s.result().bossBonus>0);
  }
 }
});
test('Los golpes y las dobles se juzgan por tiempo; repetir una tecla mantenida no puntúa',()=>{
 const s=new R.Session(mini([{time:2,end:2,action:0},{time:2,end:2,action:1},{time:3,end:3,action:0}]),'normal');
 assert.equal(s.press(0,2),'hit');assert.equal(s.press(0,2),'duplicate');assert.equal(s.press(1,2),'hit');assert.equal(s.counts.perfect,2);s.release(0,2.03);s.release(1,2.03);s.press(0,3.08);assert.equal(s.counts.great,1);assert.equal(s.combo,3);
});
test('Un sostenido premia cabeza y cola; soltar antes falla una sola cola',()=>{
 const map=mini([{time:2,end:4,action:1}]),early=new R.Session(map);early.press(1,2);early.release(1,2.5);early.update(5);assert.equal(early.counts.perfect,1);assert.equal(early.counts.miss,1);
 const held=new R.Session(map);held.press(1,2);held.update(4);held.release(1,4.1);assert.equal(held.counts.perfect,2);assert.equal(held.judged,2);
});
test('Recuperar una nota larga después de pausar no duplica su cabeza ni la regala sin tecla',()=>{
 const map=mini([{time:2,end:5,action:0}]),s=new R.Session(map);s.press(0,2);s.update(3);s.pauseHolds();assert.equal(s.judged,1);s.recover(0);s.resume(3);s.update(5);assert.equal(s.counts.perfect,2);
 const forgotten=new R.Session(map);forgotten.press(0,2);forgotten.pauseHolds();forgotten.resume(3);forgotten.update(3.5);assert.equal(forgotten.counts.miss,1);
});
test('El desafío exige alternancia real, respeta su plazo y sigue sumando bonus después del mínimo',()=>{
 const s=new R.Session(mini([],[{time:2,end:5,required:8}]));s.update(2);
 s.press(0,2.05);s.release(0,2.06);s.press(0,2.15);s.release(0,2.16);assert.equal(s.bosses[0].hits,1);
 for(let i=1;i<8;i++){const t=2.05+i*.15;s.press(i%2,t);s.release(i%2,t+.03);}
 const boss=s.bosses[0],atMinimum=s.score;assert.equal(boss.won,true);assert.equal(boss.done,false);assert.equal(boss.bonus,0);
 for(let i=8;i<12;i++){const t=2.05+i*.15;s.press(i%2,t);s.release(i%2,t+.03);}assert.equal(boss.bonus,400);assert.ok(s.score>atMinimum);
 s.update(5);const after=s.score;s.press(0,5.01);s.release(0,5.02);assert.equal(boss.hits,12);assert.equal(s.score,after);assert.equal(boss.done,true);
});
test('El guardián escapa al vencer el tiempo aunque falte solo una pulsación',()=>{
 const s=new R.Session(mini([],[{time:2,end:4,required:6}]));for(let i=0;i<5;i++){s.press(i%2,2.1+i*.2);s.release(i%2,2.12+i*.2);}s.update(3.99);assert.equal(s.bosses[0].done,false);s.press(1,4);assert.equal(s.bosses[0].won,false);assert.equal(s.bosses[0].done,true);assert.equal(s.counts.miss,1);assert.equal(s.health,82);
});
test('Llegar al final sin tocar no completa la canción ni concede recuerdos',()=>{
 const s=new R.Session(mini([{time:2,end:2,action:0},{time:3,end:4,action:1}]));s.update(20);assert.equal(s.cleared,false);assert.equal(s.score,0);assert.equal(s.accuracy,0);assert.equal(s.counts.miss,3);
});
test('El reloj usa la posición audible y el timestamp de entrada, con ajuste en milisegundos',()=>{
 const a=new A.Transport();a.ctx={currentTime:31,getOutputTimestamp:()=>({contextTime:30,performanceTime:5000})};a.buffer={duration:100};a.position=5;a.startedAt=28;a.playing=true;a.offsetMs=25;
 assert.ok(Math.abs(a.timeAt(5075)-7.05)<1e-9);a.playing=false;a.position=12;assert.equal(a.timeAt(6000),11.975);
 const fallback=new A.Transport();fallback.ctx={currentTime:20,outputLatency:.05};assert.equal(fallback.heardContextTime(100),19.95);
});
test('La validación rechaza colas imposibles, invasión del jefe y canciones recortadas',()=>{
 assert.throws(()=>R.validate(mini([{time:2,end:4,action:0},{time:3,end:3,action:0}])),/solapan/);
 assert.throws(()=>R.validate(mini([{time:2,end:3,action:0}],[{time:2,end:4,required:6}])),/invade/);
 assert.throws(()=>R.validate(mini([],[{time:2,end:4,required:100}])),/alternancia/);
 assert.throws(()=>R.validate(mini([{time:19,end:21,action:1}])),/fuera/);
});
