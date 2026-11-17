/* Motor determinista: tiempos absolutos de la canción, dos teclas y jefes con plazo. */
(function(root){
 'use strict';
 const RULES={
  easy:{name:'Fácil',approach:2.7,perfect:.065,great:.115,good:.17,damage:3,recovery:1.8},
  normal:{name:'Medio',approach:2.35,perfect:.055,great:.105,good:.155,damage:4,recovery:1.6},
  hard:{name:'Difícil',approach:2.05,perfect:.05,great:.095,good:.145,damage:5,recovery:1.6}
 };
 const VALUES={perfect:1,great:.75,good:.5,miss:0};
 function validate(raw,duration=raw?.duration){
  if(!raw||!Number.isFinite(duration)||duration<=0||duration>3600)throw Error('Duración de canción inválida.');
  if(!Array.isArray(raw.notes)||!raw.notes.length||raw.notes.length>50000)throw Error('La canción no tiene una partitura válida.');
  const notes=raw.notes.map(n=>{
   const end=n.end??n.time;
   if(![0,1].includes(n.action)||!Number.isFinite(n.time)||!Number.isFinite(end)||n.time<0||end<n.time||end>duration+.025)throw Error('Hay una nota fuera de la canción.');
   return {...n,end,kind:n.kind==='projectile'?'projectile':'enemy'};
  }).sort((a,b)=>a.time-b.time||a.action-b.action);
  const ends=[-1,-1];for(const n of notes){if(n.time<ends[n.action]+.035)throw Error('Se solapan notas de la misma altura.');ends[n.action]=n.end;}
  const intervals=(list,challenge=false)=>(list||[]).map(b=>{
   if(!Number.isFinite(b.time)||!Number.isFinite(b.end)||b.time<0||b.end<=b.time||b.end>duration)throw Error('Intervalo de guardián inválido.');
   if(challenge&&(!Number.isInteger(b.required)||b.required<2||b.required>(b.end-b.time)*12))throw Error('Objetivo de alternancia inválido.');
   return {...b};
  }).sort((a,b)=>a.time-b.time);
  const bosses=intervals(raw.bosses,true),encounters=intervals(raw.encounters);
  bosses.forEach((b,i)=>{if(i&&b.time<bosses[i-1].end)throw Error('Se solapan dos desafíos.');if(notes.some(n=>n.time<b.end+.15&&n.end>b.time-.15))throw Error('Una nota invade el desafío de alternancia.');});
  return {...raw,duration,notes,bosses,encounters};
 }
 class Session{
  constructor(map,difficulty='easy',onEvent=()=>{}){
   const valid=validate(map);this.rules=RULES[difficulty]||RULES.easy;this.difficulty=difficulty;this.duration=valid.duration;this.onEvent=onEvent;
   this.notes=valid.notes.map((n,id)=>({...n,id,state:'pending',down:false,grace:0}));
   this.bosses=valid.bosses.map((b,id)=>({...b,id,hits:0,lastAction:-1,lastAt:-Infinity,won:false,done:false,bonus:0}));this.encounters=valid.encounters;
   this.time=-2;this.health=100;this.combo=0;this.maxCombo=0;this.score=0;this.earned=0;this.judged=0;this.ghosts=0;this.held=[false,false];this.holds=[null,null];this.counts={perfect:0,great:0,good:0,miss:0};this.finished=false;this.failed=false;this.errors=[];
  }
  emit(event){this.onEvent({...event,score:this.score,combo:this.combo});}
  grade(error){const e=Math.abs(error);return e<=this.rules.perfect?'perfect':e<=this.rules.great?'great':'good';}
  judge(note,grade,time,part='head',error=null){
   this.judged++;this.counts[grade]++;this.earned+=VALUES[grade];
   if(grade==='miss'){this.combo=0;this.health=Math.max(0,this.health-this.rules.damage);}
   else{this.combo++;this.maxCombo=Math.max(this.maxCombo,this.combo);this.health=Math.min(100,this.health+this.rules.recovery);this.score+=Math.round((part==='tail'?500:1000)*VALUES[grade]*(1+Math.min(1,Math.floor(this.combo/20)*.1)));if(error!==null)this.errors.push(error);}
   this.emit({type:'judge',note,grade,time,part,error});
  }
  get activeBoss(){return this.bosses.find(b=>this.time>=b.time&&this.time<b.end&&!b.done)||null;}
  press(action,time){
   if(this.finished||![0,1].includes(action)||!Number.isFinite(time)||time<0)return 'ignored';
   this.update(time);if(this.finished)return 'ignored';
   if(this.held[action])return 'duplicate';this.held[action]=true;
   const holding=this.holds[action];if(holding){holding.down=true;return 'resume-hold';}
   const boss=this.bosses.find(b=>time>=b.time&&time<b.end&&!b.done);
   if(boss){
    if(boss.lastAction===action||time-boss.lastAt<.035)return 'boss-repeat';
    boss.lastAction=action;boss.lastAt=time;boss.hits++;this.score+=25;
    if(boss.hits>boss.required){boss.bonus+=100;this.score+=100;}
    if(!boss.won&&boss.hits>=boss.required){boss.won=true;this.score+=3000;this.emit({type:'boss-break',boss,time,action});}
    this.emit({type:'boss-hit',boss,time,action});return 'boss';
   }
   const candidates=this.notes.filter(n=>n.state==='pending'&&n.action===action&&Math.abs(n.time-time)<=this.rules.good);
   const note=candidates.sort((a,b)=>Math.abs(a.time-time)-Math.abs(b.time-time))[0];
   if(!note){
    if(this.notes.some(n=>n.state==='pending'&&Math.abs(n.time-time)<.2)){this.ghosts++;this.combo=0;this.health=Math.max(0,this.health-1);this.emit({type:'empty',action,time});}
    return 'empty';
   }
   const error=time-note.time;this.judge(note,this.grade(error),time,'head',error);
   if(note.end>note.time){note.state='holding';note.down=true;this.holds[action]=note;}else note.state='done';
   return 'hit';
  }
  release(action,time,paused=false){
   if(![0,1].includes(action))return;this.held[action]=false;const note=this.holds[action];if(!note)return;
   note.down=false;if(paused)return;
   const early=note.end-time;
   this.judge(note,early>this.rules.great?'miss':early>this.rules.perfect?'great':'perfect',time,'tail');note.state='done';this.holds[action]=null;
  }
  pauseHolds(){this.held=[false,false];for(const n of this.holds)if(n){n.down=false;n.grace=Infinity;}}
  recover(action){const note=this.holds[action];if(note){this.held[action]=true;note.down=true;return true;}return false;}
  resume(time){for(const n of this.holds)if(n)n.grace=time+.4;}
  update(time){
   if(this.finished||!Number.isFinite(time)||time<0)return;this.time=Math.max(this.time,time);
   for(const n of this.notes){
    if(n.state==='pending'&&time>n.time+this.rules.good){this.judge(n,'miss',time);if(n.end>n.time)this.judge(n,'miss',time,'tail');n.state='done';}
    else if(n.state==='holding'){
     if(!n.down&&time>n.grace){this.judge(n,'miss',time,'tail');n.state='done';this.holds[n.action]=null;}
     else if(time>=n.end){this.judge(n,n.down?'perfect':'miss',time,'tail');n.state='done';this.holds[n.action]=null;}
    }
   }
   for(const b of this.bosses)if(!b.done&&time>=b.end){
    b.done=true;this.judged++;this.counts[b.won?'perfect':'miss']++;this.earned+=b.won?1:0;
    if(b.won){this.combo++;this.maxCombo=Math.max(this.maxCombo,this.combo);this.health=Math.min(100,this.health+8);}else{this.combo=0;this.health=Math.max(0,this.health-18);}
    this.emit({type:'boss-end',boss:b,time,won:b.won});
   }
   if(this.health<=0){this.finished=true;this.failed=true;}else if(time>=this.duration)this.finished=true;
  }
  visible(from,to){return this.notes.filter(n=>n.state!=='done'&&n.end>=from&&n.time<=to);}
  get accuracy(){return this.judged?this.earned/(this.judged+this.ghosts*.2)*100:100;}
  get rank(){return this.accuracy>=97?'S':this.accuracy>=90?'A':this.accuracy>=80?'B':this.accuracy>=65?'C':'D';}
  get cleared(){return this.finished&&!this.failed&&this.time>=this.duration&&this.accuracy>=60;}
  result(){return {cleared:this.cleared,failed:this.failed,elapsed:Math.max(0,this.time),duration:this.duration,score:this.score,accuracy:+this.accuracy.toFixed(2),rank:this.rank,maxCombo:this.maxCombo,counts:{...this.counts},bossesWon:this.bosses.filter(b=>b.won).length,bossesTotal:this.bosses.length,bossBonus:this.bosses.reduce((sum,b)=>sum+b.bonus,0),ghosts:this.ghosts};}
 }
 const api={RULES,validate,Session};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.OrbitRhythm=api;
})(globalThis);
