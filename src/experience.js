'use strict';
class ExperienceApp extends OrbitApp{
  constructor(){super();try{if(localStorage.getItem('orbita-onboarding-v2')!=='done')this.firstDone=false;}catch{}}
  back(){if(this.state==='retry')this.rememberOnboarding();return super.back();}
  rememberOnboarding(){try{localStorage.setItem('orbita-onboarding-v2','done');}catch{}}
  get level(){const level=super.level;const meta=this.sound?.metas?.get(level.songId);return meta?{...level,...meta}:level;}
  get recordKey(){return `${this.level.id}:${this.settings.difficulty}:music-v2`;}
  get episode(){return OrbitStory.episodes[this.level.theme];}
  action(action,target){
    if(action==='retry-no')this.rememberOnboarding();
    if(action==='intro-skip')return;
    if(action==='intro-replay'){this.introPage=0;this.introForce=false;this.go('intro');return;}
    if(action==='tutorial-resume')return this.resume();
    if(action==='intro-next'){if(!this.introComplete){this.introForce=true;this.updateIntro();return;}if(this.introChanging)return;this.introChanging=true;document.querySelector('.intro-content')?.classList.add('leaving');setTimeout(()=>{if(this.state!=='intro')return;this.introChanging=false;this.introForce=false;if(++this.introPage>=3)this.startTutorial();else this.render();},this.settings.reduced?0:350);return;}
    if(action==='practice'){this.lesson('practice');return;}if(action==='demo-again'){this.lesson('demo');return;}if(action==='overview-next'){this.training.step=0;this.lesson('demo');return;}
    if(action==='story'){this.showStory();return;}if(action==='songs'){this.showSongs();return;}
    return super.action(action,target);
  }
  keydown(e){if(this.state==='intro'&&['Enter','Space'].includes(e.code)&&el('modal').hidden){e.preventDefault();if(!e.repeat)this.action('intro-next');return;}super.keydown(e);}
  press(action,code){
    if(!['play','tutorial'].includes(this.state)||this.held.has(code))return;
    this.held.add(code);this.renderKeys();window.orbitScene?.react(action,this.clock());
    if(this.phase==='countdown'||this.state==='tutorial'&&this.training.phase!=='practice')return;
    this.session.press(action,this.clock());
  }
  clock(){if(this.training&&(this.state==='tutorial'||this.state==='pause'&&this.pauseFrom==='tutorial')){if(this.state==='pause'||['ready','success','retry'].includes(this.training.phase))return this.training.frozen||0;return Math.max(-1,this.sound.ctx.currentTime-this.training.started);}return super.clock();}
  async start(){
    const token=++this.loadToken;this.closeSettings();this.sound.stop();this.clearInput(true);this.training=null;this.pauseFrom=null;this.state='loading';const since=performance.now();this.render();
    try{await this.sceneReady;await this.sound.unlock();this.applySettings();await this.sound.prepare(this.level,p=>{if(token===this.loadToken&&el('load-fill')){el('load-fill').style.width=`${Math.round(p*100)}%`;el('load-percent').textContent=p===1?'Canción lista':`${Math.round(p*100)}%`;}});if(token!==this.loadToken)return;
      await new Promise(r=>setTimeout(r,Math.max(0,2400-(performance.now()-since))));if(token!==this.loadToken)return;await this.sound.unlock();this.session=new Orbita.Session(this.level,this.settings.difficulty,e=>this.judge(e));this.phase='countdown';this.anchor=0;this.state='play';this.failed=false;window.orbitScene.reset();this.sound.play(0,2);this.render();if(document.hidden||!document.hasFocus())this.pause();
    }catch(error){if(token===this.loadToken){this.go('detail');this.notify(error.message||'No se pudo preparar la canción.');}}
  }
  async startTutorial(){
    const token=++this.loadToken;this.closeSettings();this.sound.stop();this.selected=0;this.state='loading';const since=performance.now();this.render();
    try{await this.sceneReady;await this.sound.unlock();await this.sound.prepare(this.level,p=>{if(token===this.loadToken&&el('load-fill')){el('load-fill').style.width=`${Math.round(p*100)}%`;el('load-percent').textContent='Preparando el entrenamiento…';}});await new Promise(r=>setTimeout(r,Math.max(0,1200-(performance.now()-since))));if(token!==this.loadToken)return;
      this.training={step:0,repeats:0,phase:'overview'};this.pauseFrom='tutorial';this.state='tutorial';this.lesson('overview');
    }catch(error){if(token===this.loadToken){this.go('menu');this.notify(error.message);}}
  }
  lesson(phase='demo'){
    if(!this.training)return;this.clearInput(true);const k=this.training.step,step=60/this.level.bpm,notes=[],add=(a,beat,end=beat)=>notes.push({id:notes.length,action:a,time:beat*step,end:end*step,state:'pending',down:false,grace:0,kind:k===5?'projectile':'enemy'});let boss=null,moving=null,duration=9*step;
    if(phase==='overview'){duration=5;}
    else if(k<2){add(k,3);add(k,5);}
    else if(k===2){[0,1,0,1].forEach((a,i)=>add(a,3+i));duration=9*step;}
    else if(k===3){add(0,3,7);duration=10*step;}
    else if(k===4){add(0,4);add(1,4);}
    else if(k===5){moving={time:.2,end:9*step};[0,1,0].forEach((a,i)=>add(a,3+i*2));duration=10*step;}
    else{boss={time:2*step,end:14*step};duration=15*step;}
    this.session=new Orbita.Session(this.level,'easy',e=>this.judge(e),{notes,boss,moving,duration});if(k===6)this.session.rules={...this.session.rules,boss:8};
    this.training.phase=phase;this.training.started=this.sound.ctx.currentTime+.7;this.training.frozen=0;this.training.demoIndex=0;
    this.training.events=notes.flatMap(n=>[{t:n.time,a:n.action,p:true},...(n.end>n.time?[{t:n.end,a:n.action,p:false}]:[])]);if(boss)for(let i=0;i<8;i++)this.training.events.push({t:boss.time+.2+i*.22,a:i%2,p:true});this.training.events.sort((a,b)=>a.t-b.t);
    this.phase='running';window.orbitScene.reset();this.sound.play(Math.min(this.sound.buffer.duration-10,(this.level.firstBeat||0)+(32+k*12)*step),.7);this.render();
  }
  tutorialPause(){if(this.state!=='tutorial')return;this.training.frozen=this.clock();this.training.audioAt=Math.max(0,this.sound.time);this.sound.pause();this.clearInput(true);this.state='pause';this.pauseFrom='tutorial';this.render();}
  async resume(){if(this.pauseFrom==='tutorial'){await this.sound.unlock();this.training.started=this.sound.ctx.currentTime-this.training.frozen;this.session.resume(this.training.frozen);if(['demo','practice','overview'].includes(this.training.phase))this.sound.play(this.training.audioAt||0,0);this.state='tutorial';this.render();return;}return super.resume();}
  endTutorial(){this.sound.stop();super.endTutorial();}
  judge(event){super.judge(event);const j=el('judgement');if(j){j.dataset.action=event.note.action===1?'air':'ground';if(!this.settings.reduced){j.getAnimations().forEach(a=>a.cancel());j.animate([{opacity:1,transform:'translate(-50%,0) scale(1.08)'},{opacity:0,transform:'translate(-50%,-15px) scale(1)'}],{duration:650,fill:'forwards'});}else j.style.transform='translateX(-50%)';}}
  tick(){
    if(this.state==='intro'){this.updateIntro();this.calibrationTick();return;}
    if(this.state!=='tutorial'){super.tick();if(this.state==='play'){this.updateBossHUD(this.clock());if(el('resonance-label'))el('resonance-label').textContent=this.clock()<this.session.feverUntil?'¡SOBRECARGA!':'ENERGÍA';}return;}
    this.calibrationTick();const training=this.training,s=this.session,t=this.clock();if(!training||!s)return;
    if(training.phase==='overview'){if(t>=5){this.lesson('demo');}return;}
    if(['ready','success','retry'].includes(training.phase)){
      if(training.phase==='success'&&performance.now()>=training.nextAt){if(++training.step>=7)this.endTutorial();else{training.repeats=0;this.lesson('demo');}}
      if(training.phase==='retry'&&performance.now()>=training.nextAt)this.lesson('practice');return;
    }
    if(training.phase==='demo'){while(training.demoIndex<training.events.length&&training.events[training.demoIndex].t<=t){const e=training.events[training.demoIndex++];window.orbitScene.react(e.a,e.t);e.p?s.press(e.a,e.t):s.release(e.a,e.t);all('[data-touch]').forEach(b=>b.classList.toggle('auto-lit',Number(b.dataset.touch)===e.a));}}
    s.update(t);
    if(t>=s.duration){this.sound.pause();training.frozen=s.duration;all('[data-touch]').forEach(b=>b.classList.remove('auto-lit'));
      if(training.phase==='demo'){training.phase='ready';this.render();return;}
      const total=s.notes.reduce((a,n)=>a+1+Number(n.end>n.time),0),pass=training.step===6?s.bossWon:s.judged>=total&&s.counts.miss===0;
      training.phase=pass?'success':'retry';training.nextAt=performance.now()+(this.settings.reduced?700:1500);if(!pass)training.repeats++;if(pass)this.sound.effect('win');this.render();return;
    }
    this.updateBossHUD(t);
  }
  updateBossHUD(t){const s=this.session,bh=el('boss-hud');if(!bh)return;const mobile=s.moving&&t>=s.moving.time-2&&t<s.moving.end;const burst=s.boss&&t>=s.boss.time-3&&t<s.boss.end;bh.hidden=!(mobile||burst);if(!bh.hidden){el('boss-name').textContent=mobile?(this.training?'Centinela de práctica':this.level.boss):s.bossWon?'¡Escudo roto!':'Núcleo protegido';const shots=s.notes.filter(n=>n.kind==='projectile'),returned=shots.filter(n=>n.state==='done'&&n.grade&&n.grade!=='miss').length;bh.querySelector(':scope>span').textContent=mobile?'JEFE EN MOVIMIENTO':'ESCUDO DETECTADO';el('boss-fill').style.width=`${mobile?returned/Math.max(1,shots.length)*100:Math.min(1,s.bossHits/s.rules.boss)*100}%`;el('boss-hint').textContent=mobile?`DEVUELTOS ${returned}/${shots.length} · SIGUE EL RITMO`:s.bossWon?'¡LO CONSEGUISTE!':'ALTERNA SUELO Y AIRE';}}
  updateIntro(){const node=el('intro-typed');if(!node)return;const text=OrbitStory.intro[this.introPage],length=this.settings.reduced||this.introForce?text.length:Math.max(0,Math.floor((performance.now()-this.introStarted-350)/34));if(length!==this.introLength){this.introLength=length;node.textContent=text.slice(0,length);}this.introComplete=length>=text.length;const b=document.querySelector('[data-action="intro-next"]');if(b)b.innerHTML=`${this.introComplete?(this.introPage===2?'Empezar entrenamiento':'Continuar'):'Mostrar frase completa'} ${OrbitIcons.make('next')}`;}
  render(){
    super.render();const state=this.state,l=this.level;
    if(state==='intro'){el('chrome').hidden=true;this.introStarted=performance.now();this.introLength=-1;this.introComplete=false;this.view.innerHTML=`<section class="intro story-intro"><div class="intro-content"><h1 id="intro-typed" aria-label="${safeText(OrbitStory.intro[this.introPage])}"></h1><button class="intro-continue" data-action="intro-next">Continuar</button><div class="intro-dots" aria-label="Parte ${this.introPage+1} de 3">${[0,1,2].map(i=>`<i class="${i<=this.introPage?'active':''}"></i>`).join('')}</div></div></section>`;this.updateIntro();}
    if(state==='title'){const text=document.querySelector('.tiny-meta');if(text)text.textContent='UNA CANCIÓN. DOS VOCES. TODO UN UNIVERSO.';}
    if(state==='menu'){document.querySelector('.bottom-launch')?.insertAdjacentHTML('beforeend','<button class="text-btn" data-action="story">La historia de Aurora</button>');const badge=document.querySelector('.menu-badge small');if(badge)badge.textContent=`${Orbita.LEVELS.filter(v=>!v.bonus&&Object.keys(this.records).some(k=>k.startsWith(v.id+':')&&this.records[k].clear)).length} de 5 capítulos · 3 rutas extra`;}
    if(state==='info'){const p=document.querySelector('.panel>p');if(p)p.textContent='Elia corre automáticamente. Pulsa SUELO para golpear abajo o AIRE para golpear arriba, justo cuando el enemigo llegue al círculo. Mantén la tecla en las notas largas. Los jefes disparan proyectiles; devuélvelos con el mismo ritmo.';}
    if(state==='select'){const top=document.querySelector('.selection-heading .eyebrow');if(top)top.textContent='5 CAPÍTULOS + 3 RUTAS EXTRA';const p=document.querySelector('.select-footer p');if(p)p.textContent=l.line;}
    if(state==='detail'){
      const song=OrbitSongs.find(s=>s.id===l.songId);document.querySelector('.song-meta')?.insertAdjacentHTML('beforebegin',`<div class="song-credit"><strong>${safeText(song?.title||'Canción')}</strong><span>${safeText(song?.artist||'')} · edición de juego ≈ 3 min</span></div>`);
      const note=document.querySelector('.mission-note');if(note)note.innerHTML=`${safeText(l.bonus?l.line:this.episode.before)}<br><b>Dos encuentros:</b> proyectiles al ritmo y escudo de ráfaga.`;
      document.querySelector('.detail-content')?.insertAdjacentHTML('beforeend','<button class="text-btn" data-action="songs">Ver canciones y créditos</button>');
    }
    if(state==='results'&&!this.failed){const fragment=document.querySelector('.fragment p');if(fragment)fragment.textContent=l.bonus?l.fragment:this.episode.after;}
    if(state==='ending'){const p=document.querySelector('.ending p');if(p)p.textContent=OrbitStory.ending;}
    if(state==='play')this.updateBossHUD(this.clock());
    if(state==='play'){const h=document.querySelector('.health-block>span');if(h)h.textContent='VIDA';const score=document.querySelector('.score-block>span');if(score)score.textContent='PUNTOS';}
    this.updateIcons();
    if(state==='tutorial'&&this.training.phase==='ready')document.querySelector('[data-action=practice]')?.focus();
    if(!this.settings.reduced&&state!=='intro'&&state!=='play'&&state!=='tutorial'){const curtain=document.createElement('div');curtain.className='transition-curtain';el('shell').append(curtain);curtain.animate([{opacity:1},{opacity:0}],{duration:450,easing:'ease-out'}).onfinish=()=>curtain.remove();}
  }
  updateIcons(){
    for(const [id,icon]of[['back','back'],['settings-open','settings'],['fullscreen','fullscreen']])if(el(id))el(id).innerHTML=OrbitIcons.make(icon);
    all('.btn>span').forEach(n=>n.innerHTML=OrbitIcons.make(n.parentElement.dataset.action==='play-menu'?'play':'next'));
    all('[data-action="pause"]').forEach(n=>{n.innerHTML=OrbitIcons.make('pause')+'<span>Pausa</span>';n.classList.add('pause-button');});
  }
  playUI(){
    if(this.state!=='tutorial')return super.playUI();const tr=this.training,k=tr.step,phase=tr.phase,keys=this.settings.bindings.map(a=>a.map(label).join(' / '));
    const lessons=[['Golpea los enemigos del suelo',`Pulsa ${keys[0]} cuando el enemigo toque el círculo de abajo.`],['Golpea los enemigos del aire',`Pulsa ${keys[1]} cuando el enemigo toque el círculo de arriba.`],['Cambia entre las dos alturas','Sigue el orden de los enemigos: abajo, arriba, abajo, arriba.'],['Mantén las notas largas',`Mantén ${keys[0]} desde el comienzo de la cinta hasta que pase su final.`],['Golpea las dos alturas a la vez',`Pulsa ${keys[0]} y ${keys[1]} al mismo tiempo.`],['Devuelve los disparos del jefe','Sus proyectiles también siguen la música. Golpéalos en su altura.'],['Rompe el escudo',`Ahora alterna ${keys[0]} y ${keys[1]} varias veces para cargar el ataque.`]];
    let [title,description]=lessons[k];if(phase==='overview'){title='Los enemigos llegan por el suelo o por el aire';description=`${keys[0]} golpea abajo. ${keys[1]} golpea arriba. Primero mira cómo se hace.`;}if(phase==='success'){title='¡Lo hiciste bien!';description='Paso completado. Vamos con el siguiente.';}if(phase==='retry'){title='Casi. Inténtalo otra vez';description='Puedes repetir sin perder vidas. Mira el círculo y sigue el ritmo.';}
    const badge={overview:'CONOCE LAS DOS ALTURAS',demo:'DEMOSTRACIÓN · OBSERVA',ready:'AHORA TE TOCA',practice:'TU TURNO',success:'PASO COMPLETADO',retry:'OTRA OPORTUNIDAD'}[phase];
    return `<section class="play-ui tutorial-ui" aria-label="Entrenamiento"><button class="tutorial-skip" data-action="tutorial-skip">Saltar tutorial ${OrbitIcons.make('next')}</button><div class="demo-badge">${phase==='demo'?OrbitIcons.make('play'):''}${badge}</div><div class="judgement" id="judgement"></div><div class="boss-hud" id="boss-hud" hidden><span>JEFE DETECTADO</span><h3 id="boss-name"></h3><div class="meter"><i id="boss-fill"></i></div><p id="boss-hint"></p></div><div class="tutorial-arrows" aria-hidden="true"><i class="arrow-air">↓ AIRE</i><i class="arrow-ground">↓ SUELO</i></div><div class="touch-inputs"><button data-touch="0" aria-label="Golpear suelo">SUELO<kbd>${keys[0]}</kbd></button><button data-touch="1" aria-label="Golpear aire">AIRE<kbd>${keys[1]}</kbd></button></div><div class="lesson-console ${phase}"><div class="lesson-steps" aria-label="Paso ${k+1} de 7">${Array.from({length:7},(_,i)=>`<span class="${i<k||i===k&&phase==='success'?'done':i===k?'current':''}">${i<k||i===k&&phase==='success'?OrbitIcons.make('check'):i+1}</span>`).join('')}</div><div class="lesson-text"><h2>${title}</h2><p>${description}</p></div><div class="lesson-actions">${phase==='ready'?button('Practicar','practice','cyan')+'<button class="text-btn" data-action="demo-again">Ver otra vez</button>':phase==='overview'?'<button class="text-btn" data-action="overview-next">Ver demostración →</button>':'<span>Practica a tu ritmo.<br>Los errores no quitan vidas.</span>'}</div></div></section>`;
  }
  showStory(){el('modal').hidden=false;el('modal').innerHTML=`<section class="panel story-panel"><button class="square modal-close" data-action="close-settings" aria-label="Cerrar historia">${OrbitIcons.make('close')}</button><span class="eyebrow">HISTORIA DE AURORA</span><h2 id="modal-title">${OrbitStory.title}</h2><p>${OrbitStory.premise}</p><button class="btn cyan" data-action="intro-replay">Volver a ver la introducción ${OrbitIcons.make('play')}</button>${OrbitStory.episodes.map((e,i)=>{const l=Orbita.LEVELS[i],done=Object.keys(this.records).some(k=>k.startsWith(l.id+':')&&this.records[k].clear);return `<article><span>0${i+1} / ${l.name}</span><h3>${e.goal}</h3><p>${done?e.after:e.before}</p></article>`;}).join('')}</section>`;el('modal').querySelector('button').focus();}
  showSongs(){el('modal').hidden=false;el('modal').innerHTML=`<section class="panel story-panel"><button class="square modal-close" data-action="close-settings" aria-label="Cerrar canciones">${OrbitIcons.make('close')}</button><h2 id="modal-title">Música de las estaciones</h2><p>Los mapas usan los archivos de audio que seleccionaste. Las pistas largas tienen una edición de juego cercana a tres minutos.</p>${OrbitSongs.map((s,i)=>`<article><span>${i<5?'CAPÍTULO '+(i+1):'RUTA EXTRA '+(i+1)}</span><h3>${safeText(s.title)}</h3><p>${safeText(s.artist)}</p><a href="${s.url}" target="_blank" rel="noopener noreferrer">Escuchar la referencia en YouTube ↗</a></article>`).join('')}</section>`;el('modal').querySelector('button').focus();}
  renderSettings(){super.renderSettings();const close=el('modal').querySelector('.modal-close');if(close)close.innerHTML=OrbitIcons.make('close');this.updateIcons();}
}
try{window.app=new ExperienceApp();new Phaser.Game({type:Phaser.CANVAS,parent:'world',backgroundColor:'#201b38',scale:{mode:Phaser.Scale.RESIZE,width:innerWidth,height:innerHeight},render:{antialias:true},scene:OrbitScene});}catch(error){el('toast').hidden=false;el('toast').textContent='No se pudo iniciar el juego. Recarga la página.';console.error(error);}
