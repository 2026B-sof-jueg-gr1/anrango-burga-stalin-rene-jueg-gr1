/* Dos acciones. Una partitura, cualquiera que sea el número de teclas. */
(function(root){
  'use strict';
  const LEVELS=[
    {id:'aurora',name:'Puerto Aurora',tag:'01 / EL DESPEGUE',bpm:112,bars:48,root:45,colors:['#201c48','#7264a0','#ffd4af','#ff947f','#9ef0ef'],boss:'Centinela de aduana',genre:'SPACE POP / PRIMERA SEÑAL',line:'Entre la estática, reconociste su canción.',fragment:'«Elia… si escuchas esto, sigue las luces.» — Sira',theme:0},
    {id:'io',name:'Jardines de Io',tag:'02 / ECOS VIVOS',bpm:120,bars:48,root:48,colors:['#123a42','#47837e','#f4e9ba','#ffcb7b','#99f6c4'],boss:'Jardinero orbital',genre:'ELECTRO / GUITARRA LIMPIA',line:'Una melodía crece donde parecía no quedar nada.',fragment:'«Todavía recuerdo cómo sonaba nuestro taller.» — Elia',theme:1},
    {id:'scrap',name:'Cinturón de Chatarra',tag:'03 / HECHA CON MIS MANOS',bpm:132,bars:52,root:43,colors:['#302237','#92546a','#f9c6a1','#ff9b66','#ffdb92'],boss:'Prensa Titán',genre:'INDUSTRIAL / ROCK ELECTRÓNICO',line:'Hasta las piezas rotas pueden encontrar su voz.',fragment:'«Construí mi guitarra con lo que quedó. Quiero que la escuches.» — Elia',theme:2},
    {id:'ions',name:'Mar de Iones',tag:'04 / A TRAVÉS DEL RUIDO',bpm:144,bars:56,root:47,colors:['#201939','#6954a8','#c5c8ff','#d3a1ff','#91e4ff'],boss:'Mantarraya de iones',genre:'STORMWAVE / ROCK INTENSO',line:'Sostén la canción. La otra voz está cerca.',fragment:'«Esa guitarra… Elia, ¿eres tú?» — Sira',theme:3},
    {id:'zero',name:'Faro Cero',tag:'05 / UNA SOLA CANCIÓN',bpm:150,bars:60,root:50,colors:['#292345','#8f83a6','#fff2c5','#ffc786','#e8ffed'],boss:'Custodio de Aurora',genre:'FINAL / DOS MELODÍAS',line:'Cinco estaciones. Una respuesta por entregar.',fragment:'«No vuelvas a empezar, mamá. Esta vez estoy aquí.» — Elia',theme:4}
  ];
  const RULES={easy:{name:'Fácil',perfect:.08,great:.13,window:.18,damage:5,boss:10},medium:{name:'Medio',perfect:.06,great:.11,window:.15,damage:8,boss:15},hard:{name:'Difícil',perfect:.045,great:.09,window:.13,damage:10,boss:20}};
  const PRESETS={2:[['KeyF'],['KeyJ']],4:[['KeyD','KeyF'],['KeyJ','KeyK']],8:[['KeyA','KeyS','KeyD','KeyF'],['KeyJ','KeyK','KeyL','Semicolon']]};
  const section=b=>b<32?0:b<80?1:2;
  function score(level){
    const end=level.bars*4, bossBeat=Math.floor((end*.62)/4)*4;
    const events=[],motif=[0,7,10,12,7,3,5,10];
    for(let b=8;b<end-8;b+=2){
      if(b>=bossBeat-4&&b<bossBeat+20)continue;
      const phrase=Math.floor(b/8),action=(Math.floor(b/2)+Math.floor(phrase/2)+level.theme)%2;
      const hold=b>=32&&b%16===0;
      events.push({beat:b,action,duration:hold?3:0,min:0,midi:level.root+24+motif[(b/2+level.theme)%8]});
      if(b>=32&&b%4===2)events.push({beat:b+1,action:1-action,duration:0,min:1,midi:level.root+24+motif[(b/2+3)%8]});
      if(b>=64&&b%8===4)events.push({beat:b,action:1-action,duration:0,min:1,midi:level.root+31});
      if(b>=32&&b%4===2)events.push({beat:b+.5,action,duration:0,min:2,midi:level.root+36+motif[(b/2)%8]});
    }
    return {events:events.sort((a,b)=>a.beat-b.beat||a.action-b.action),boss:{beat:bossBeat,duration:16},end};
  }
  function chart(level,difficulty){
    const data=score(level),step=60/level.bpm,ends=[-1,-1],max={easy:0,medium:1,hard:2}[difficulty];
    const notes=data.events.filter(e=>e.min<=max).filter(e=>{if(e.beat<ends[e.action]+.15)return false;ends[e.action]=e.beat+e.duration;return true;}).map((e,i)=>({...e,id:i,time:e.beat*step,end:(e.beat+e.duration)*step,state:'pending',down:false,grace:0}));
    return {notes,boss:{time:data.boss.beat*step,end:(data.boss.beat+data.boss.duration)*step},duration:data.end*step};
  }
  class Session{
    constructor(level,difficulty='easy',onJudge=()=>{},custom=null){
      this.level=level;this.rules=RULES[difficulty];this.difficulty=difficulty;Object.assign(this,custom||chart(level,difficulty));this.notes=this.notes.map(n=>({...n}));
      this.lastPress=[-Infinity,-Infinity];this.onJudge=onJudge;this.health=100;this.combo=0;this.bestCombo=0;this.score=0;this.earned=0;this.judged=0;this.ghosts=0;this.resonance=0;this.feverUntil=-1;this.bossHits=0;this.bossLast=-1;this.bossLastTime=-100;this.bossDone=false;this.bossWon=false;this.counts={perfect:0,great:0,good:0,miss:0};this.errors=[];
    }
    judge(note,grade,time,error=null){
      const value={perfect:1,great:.7,good:.4,miss:0}[grade];this.earned+=value;this.judged++;this.counts[grade]++;
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
      if(!note){this.ghosts++;if(this.ghosts%5===0){this.combo=0;this.health=Math.max(0,this.health-this.rules.damage*.5);}return 'empty';}
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
  const api={LEVELS,RULES,PRESETS,score,chart,Session,section};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.Orbita=api;
})(globalThis);
