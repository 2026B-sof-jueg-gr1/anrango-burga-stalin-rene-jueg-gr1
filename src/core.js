/* Dos acciones. Una partitura, cualquiera que sea el número de teclas. */
(function(root){
  'use strict';
  const node=typeof module!=='undefined'&&module.exports;
  const LEVELS=node?require('./catalog.js'):root.OrbitCatalog;
  const known=node?require('./track-maps.js'):(root.OrbitTrackMaps||{});
  LEVELS.forEach(l=>{if(known[l.songId])Object.assign(l,known[l.songId]);if(l.sourceDuration){l.duration=l.sourceDuration;l.bars=Math.floor((l.duration-(l.firstBeat||0))*l.bpm/240);}if(node){try{l.charts=require('../assets/charts/'+l.songId+'.json');}catch(error){if(error.code!=='MODULE_NOT_FOUND')throw error;}}});
  const RULES={easy:{name:'Fácil',perfect:.08,great:.13,window:.18,damage:5,boss:32},medium:{name:'Medio',perfect:.06,great:.11,window:.15,damage:8,boss:48},hard:{name:'Difícil',perfect:.045,great:.09,window:.13,damage:10,boss:64}};
  const PRESETS={2:[['KeyF'],['KeyJ']],4:[['KeyD','KeyF'],['KeyJ','KeyK']],8:[['KeyA','KeyS','KeyD','KeyF'],['KeyJ','KeyK','KeyL','Semicolon']]};
  function chart(level,difficulty){
    const notation=node?require('./notation.js'):root.OrbitNotation;
    if(!level.charts?.[difficulty])throw Error('Prepara la canción antes de iniciar su partitura.');
    return notation.validate(level.charts[difficulty],level.duration);
  }
  class Session{
    constructor(level,difficulty='easy',onJudge=()=>{},custom=null){
      this.level=level;this.rules=RULES[difficulty];this.difficulty=difficulty;Object.assign(this,custom||chart(level,difficulty));this.notes=this.notes.map(n=>({...n}));
      this.lastPress=[-Infinity,-Infinity];this.onJudge=onJudge;this.health=100;this.combo=0;this.bestCombo=0;this.score=0;this.earned=0;this.judged=0;this.ghosts=0;this.resonance=0;this.feverUntil=-1;this.bossHits=0;this.bossLast=-1;this.bossLastTime=-100;this.bossDone=false;this.bossWon=false;this.counts={perfect:0,great:0,good:0,miss:0};this.errors=[];
    }
    judge(note,grade,time,error=null){
      note.grade=grade;const value={perfect:1,great:.7,good:.4,miss:0}[grade];this.earned+=value;this.judged++;this.counts[grade]++;
      if(grade==='miss'){this.combo=0;this.health=Math.max(0,this.health-this.rules.damage);this.resonance=Math.max(0,this.resonance-6);}
      else{this.combo++;this.bestCombo=Math.max(this.bestCombo,this.combo);this.score+=Math.round(1000*value*(1+Math.min(1,Math.floor(this.combo/10)*.1)));this.health=Math.min(100,this.health+.7);this.resonance+=6;if(error!==null)this.errors.push(error);if(this.resonance>=100){this.resonance=0;this.feverUntil=time+6;}}
      this.onJudge({note,grade,error,time});
    }
    press(action,time){
      if(time-this.lastPress[action]<.035)return 'duplicate';this.lastPress[action]=time;
      if(this.boss&&time>=this.boss.time&&time<this.boss.end&&!this.bossDone){
        if(action===this.bossLast||time-this.bossLastTime<.055)return 'boss-wait';
        this.bossLast=action;this.bossLastTime=time;this.bossHits++;
        if(this.bossHits>=this.rules.boss){this.bossWon=true;this.bossDone=true;this.score+=10000;this.health=Math.min(100,this.health+15);}
        this.onJudge({note:{action,kind:'boss'},grade:this.bossWon?'boss-break':'boss-hit',time,error:null});return 'boss';
      }
      if(this.boss&&time>=this.boss.time&&time<this.boss.end)return 'boss-cleared';
      const holding=this.notes.find(n=>n.action===action&&n.state==='holding');if(holding){holding.down=true;return 'resume';}
      const note=this.notes.find(n=>n.action===action&&n.state==='pending'&&Math.abs(n.time-time)<=this.rules.window);
      if(!note){if(this.notes.some(n=>n.state==='pending'&&Math.abs(n.time-time)<this.rules.window)){this.ghosts++;}return 'empty';}
      const error=time-note.time,abs=Math.abs(error);this.judge(note,abs<=this.rules.perfect?'perfect':abs<=this.rules.great?'great':'good',time,error);
      note.state=note.end>note.time?'holding':'done';note.down=true;return 'hit';
    }
    release(action,time,paused=false){
      const note=this.notes.find(n=>n.action===action&&n.state==='holding');if(!note)return;note.down=false;
      if(paused){note.grace=Infinity;return;}
      this.judge(note,time>=note.end-this.rules.great?'perfect':'miss',time);note.state='done';
    }
    resume(time){this.notes.filter(n=>n.state==='holding').forEach(n=>n.grace=time+.5);}
    update(time){
      for(const n of this.notes){if(n.state==='pending'&&time>n.time+this.rules.window){this.judge(n,'miss',time);if(n.end>n.time)this.judge(n,'miss',time);n.state='done';}else if(n.state==='holding'){if(!n.down&&time>n.grace){this.judge(n,'miss',time);n.state='done';}else if(time>=n.end){this.judge(n,n.down?'perfect':'miss',time);n.state='done';}}}
      if(this.boss&&!this.bossDone&&time>=this.boss.end){this.bossDone=true;this.health=Math.max(0,this.health-this.rules.damage*2);this.onJudge({note:{kind:'boss'},grade:'boss-escape',time,error:null});}
    }
    get accuracy(){return this.judged?Math.max(0,this.earned/(this.judged+this.ghosts*.1)*100):0;}
    get rank(){return this.accuracy>=97?'S':this.accuracy>=90?'A':this.accuracy>=78?'B':this.accuracy>=60?'C':'D';}
  }
  const api={LEVELS,RULES,PRESETS,chart,Session};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.Orbita=api;
})(globalThis);
