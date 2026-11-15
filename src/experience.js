'use strict';
class ExperienceApp extends OrbitApp{
  constructor(){super();try{if(localStorage.getItem('orbita-onboarding-v3')!=='done')this.firstDone=false;}catch{}}
  back(){if(this.state==='retry')this.rememberOnboarding();return super.back();}
  rememberOnboarding(){try{localStorage.setItem('orbita-onboarding-v3','done');}catch{}}
  get level(){const level=super.level;const meta=this.sound?.metas?.get(level.songId);return meta?{...level,...meta}:level;}
  get recordKey(){const map=this.notations?.get(this.notationKey);return `${this.level.id}:${this.level.songId}:${this.settings.difficulty}:full-v3${this.settings.inputMode==='hybrid'?':mouse-v1':''}${map?':'+OrbitNotation.fingerprint(map):''}`;}
  get episode(){return {...OrbitStory.episodes[this.level.theme],goal:this.level.goal,after:this.level.fragment};}
  action(action,target){
    if(action==='retry-no')this.rememberOnboarding();
    if(action==='intro-skip')return;
    if(action==='intro-replay'){this.introPage=0;this.introForce=false;this.go('intro');return;}
    if(action==='tutorial-resume')return this.resume();
    if(action==='intro-next'){if(!this.introComplete){this.introForce=true;this.updateIntro();return;}if(this.introChanging)return;this.introChanging=true;document.querySelector('.intro-content')?.classList.add('leaving');setTimeout(()=>{if(this.state!=='intro')return;this.introChanging=false;this.introForce=false;if(++this.introPage>=3)this.startTutorial();else this.render();},this.settings.reduced?0:350);return;}
    if(action==='help-info')return this.showHelp();
    if(action==='controls')return this.openSettings();
    if(action==='route-prev'||action==='route-next')return this.selectRoute(action==='route-prev'?-1:1);
    if(action==='comic-prev'||action==='comic-next')return this.showStory(this.comicPage+(action==='comic-prev'?-1:1));
    if(action==='notation')return this.showNotation();
    if(action==='notation-export')return this.exportNotation();
    if(action==='notation-reset'){this.notations.delete(this.notationKey);this.saveNotations();this.closeSettings();return;}
    if(action==='story'){this.showStory();return;}if(action==='songs'){this.showSongs();return;}
    return super.action(action,target);
  }
  keydown(e){
    if(e.ctrlKey||e.altKey||e.metaKey||this.calibration)return super.keydown(e);
    if(!el('modal').hidden&&el('comic-frame')&&['ArrowLeft','ArrowRight'].includes(e.code)){e.preventDefault();if(!e.repeat)this.action(e.code==='ArrowLeft'?'comic-prev':'comic-next');return;}
    if(this.state==='select'&&el('modal').hidden&&['ArrowLeft','ArrowRight'].includes(e.code)){e.preventDefault();if(!e.repeat)this.selectRoute(e.code==='ArrowLeft'?-1:1);return;}
    if(['Enter','Space'].includes(e.code)&&!['play','tutorial','title','loading'].includes(this.state)){
      const active=document.activeElement;if(active?.matches('input,textarea,select'))return;
      e.preventDefault();if(e.repeat)return;
      if(this.state==='intro'&&el('modal').hidden)return this.action('intro-next');
      if(active?.matches('button,a')&&active.getClientRects().length){active.click();return;}
      if(!el('modal').hidden){el('modal').querySelector('.modal-close')?.click();return;}
      const primary={menu:'play-menu',info:'info-ok',select:'select-next',detail:'start',pause:this.pauseFrom==='tutorial'?'tutorial-resume':'resume',retry:'retry-no',results:'continue',ending:'select'}[this.state];if(primary)this.action(primary);return;
    }
    super.keydown(e);
  }
  selectRoute(direction){this.selected=(this.selected+direction+Orbita.LEVELS.length)%Orbita.LEVELS.length;this.save();this.render();}
  press(action,code){
    if(!['play','tutorial'].includes(this.state))return;const hit=this.input.down(code,action);if(!hit)return;
    this.renderKeys();window.orbitScene?.react(hit.action,this.clock());
    if(this.phase==='countdown'||this.state==='tutorial'&&this.training.phase!=='practice')return;
    this.session.press(hit.action,this.clock(),hit.stroke);
  }
  clock(){if(this.training&&(this.state==='tutorial'||this.state==='pause'&&this.pauseFrom==='tutorial'))return this.state==='pause'?this.training.frozen:Math.max(-1,this.sound.ctx.currentTime-this.training.started);return super.clock();}
  loadProgress(p){if(el('load-fill'))el('load-fill').style.width=`${Math.round(p*100)}%`;if(el('load-percent'))el('load-percent').textContent=`${Math.round(p*100)}%`;el('loading-status')?.setAttribute('aria-valuenow',Math.round(p*100));}
  async start(){
    const token=++this.loadToken;this.closeSettings();this.sound.stop();this.clearInput(true);this.training=null;this.pauseFrom=null;this.state='loading';const since=performance.now();this.render();
    try{await this.sceneReady;await this.sound.unlock();this.applySettings();await this.sound.prepare(this.level,p=>{if(token===this.loadToken)this.loadProgress(p);});if(token!==this.loadToken)return;
      await new Promise(r=>setTimeout(r,Math.max(0,2400-(performance.now()-since))));if(token!==this.loadToken)return;await this.sound.unlock();const custom=this.notations?.get(this.notationKey);const chart=custom?OrbitNotation.validate(custom,this.sound.buffer.duration):Orbita.chart(this.level,this.settings.difficulty);this.session=new Orbita.Session(this.level,this.settings.difficulty,e=>this.judge(e),OrbitInput.adaptChart(chart,this.settings.inputMode));this.session.inputMode=this.settings.inputMode;this.controlsChanged=false;this.phase='countdown';this.anchor=0;this.state='play';this.failed=false;window.orbitScene.reset();this.sound.play(0,2);this.render();if(document.hidden||!document.hasFocus())this.pause();
    }catch(error){if(token===this.loadToken){this.go('detail');this.notify(error.message||'No se pudo preparar la canción.');}}
  }
  async startTutorial(){
    const token=++this.loadToken;this.closeSettings();this.sound.stop();this.clearInput(true);this.selected=0;this.state='loading';const since=performance.now();this.render();
    try{await this.sceneReady;await this.sound.unlock();await this.sound.prepare(this.level,p=>{if(token===this.loadToken)this.loadProgress(p);});await new Promise(r=>setTimeout(r,Math.max(0,1000-(performance.now()-since))));if(token!==this.loadToken)return;
      this.training={step:0,repeats:0,phase:'practice',started:this.sound.ctx.currentTime+.7};this.pauseFrom='tutorial';this.state='tutorial';window.orbitScene.reset();this.sound.play(0,.7);this.sound.source.loop=true;this.lesson();
    }catch(error){if(token===this.loadToken){this.go('menu');this.notify(error.message);}}
  }
  lesson(){
    if(!this.training)return;this.clearInput(true);const k=this.training.step,beat=60/this.level.bpm,earliest=Math.max(0,this.clock())+2.5,cycle=Math.floor(earliest/this.level.duration),points=(this.level.charts?.easy.notes||[]).flatMap(n=>[cycle,cycle+1].map(k=>({time:n.time+k*this.level.duration}))).filter(n=>n.time>=earliest).sort((a,b)=>a.time-b.time),start=points[0]?.time||Math.ceil(earliest/beat)*beat,notes=[];
    const times=[start];for(let i=1;i<=7;i++)times.push(points.find(n=>n.time>times[i-1]+.3)?.time||times[i-1]+beat);const at=b=>times[b]??start+b*beat;const add=(action,b,end=b)=>notes.push({id:notes.length,action,time:at(b),end:at(end),state:'pending',down:false,grace:0,kind:k===5?'projectile':'enemy'});
    let boss=null,moving=null,end=start+7*beat;
    if(k<2){add(k,0);add(k,2);}else if(k===2){[0,1,0,1].forEach((a,i)=>add(a,i));}else if(k===3){add(0,0,4);end=start+6*beat;}else if(k===4){add(0,0);if(this.settings.inputMode==='hybrid')add(0,1);else add(1,0);}else if(k===5){moving={time:start-2,end:start+7*beat};[0,1,0].forEach((a,i)=>add(a,i*2));}else{boss={time:start,end:start+18};end=boss.end+1;}
    end=Math.max(end,...notes.map(n=>n.end+1.2));if(moving)moving.end=end;this.session=new Orbita.Session(this.level,'easy',e=>this.judge(e),{notes,boss,moving,duration:end});if(k===6)this.session.rules={...this.session.rules,boss:24};this.session.inputMode=this.settings.inputMode;this.controlsChanged=false;this.training.phase='practice';this.phase='running';this.render();
  }
  tutorialPause(){if(this.state!=='tutorial')return;this.training.frozen=this.clock();this.training.audioAt=Math.max(0,this.sound.time);this.sound.pause();this.clearInput(true);this.state='pause';this.pauseFrom='tutorial';this.render();}
  async resume(){if(this.controlsChanged){this.controlsChanged=false;return this.pauseFrom==='tutorial'?this.startTutorial():this.start();}if(this.pauseFrom==='tutorial'){await this.sound.unlock();this.training.started=this.sound.ctx.currentTime-this.training.frozen;this.session.resume(this.training.frozen);this.sound.play((this.training.audioAt||0)%this.sound.buffer.duration,0);this.sound.source.loop=true;this.state='tutorial';this.render();return;}return super.resume();}
  endTutorial(){this.sound.stop();super.endTutorial();}
  judge(event){super.judge(event);const j=el('judgement');if(j){j.dataset.action=event.note.action===1?'air':'ground';if(!this.settings.reduced){j.getAnimations().forEach(a=>a.cancel());j.animate([{opacity:1,transform:'translate(-50%,0) scale(1.08)'},{opacity:0,transform:'translate(-50%,-15px) scale(1)'}],{duration:650,fill:'forwards'});}else j.style.transform='translateX(-50%)';}}
  tick(){
    if(this.state==='intro'){this.updateIntro();this.calibrationTick();return;}
    if(this.state!=='tutorial'){super.tick();if(this.state==='play'){this.updateBossHUD(this.clock());el('shell').classList.toggle('overdrive',this.clock()<this.session.feverUntil);if(el('resonance-label'))el('resonance-label').textContent=this.clock()<this.session.feverUntil?'¡SOBRECARGA!':'ENERGÍA';}return;}
    this.calibrationTick();const tr=this.training,s=this.session,t=this.clock();if(!tr||!s)return;
    if(tr.phase==='success'){if(t>=tr.nextAt){if(++tr.step>=7)this.endTutorial();else{tr.repeats=0;this.lesson();}}return;}
    s.update(t);s.health=100;
    const total=s.notes.reduce((a,n)=>a+1+Number(n.end>n.time),0),complete=tr.step===6?s.bossWon:s.judged>=total&&s.counts.miss===0;
    if(complete){tr.phase='success';tr.nextAt=t+.8;this.sound.effect('win');this.render();return;}
    if(t>=s.duration){tr.repeats++;this.lesson();return;}this.updateBossHUD(t);
  }
  updateBossHUD(t){const s=this.session,bh=el('boss-hud');if(!bh)return;const mobile=s.moving&&t>=s.moving.time-2&&t<s.moving.end;const burst=s.boss&&t>=s.boss.time-3&&t<s.boss.end;bh.hidden=!(mobile||burst);if(!bh.hidden){el('boss-name').textContent=mobile?(this.training?'Centinela de práctica':this.level.boss):s.bossWon?'¡Escudo roto!':'Núcleo protegido';const shots=s.notes.filter(n=>n.kind==='projectile'),returned=shots.filter(n=>n.state==='done'&&n.grade&&n.grade!=='miss').length;bh.querySelector(':scope>span').textContent=mobile?'JEFE EN MOVIMIENTO':'ESCUDO DETECTADO';el('boss-fill').style.width=`${mobile?returned/Math.max(1,shots.length)*100:Math.min(1,s.bossHits/s.rules.boss)*100}%`;el('boss-hint').textContent=mobile?`DEVUELTOS ${returned}/${shots.length} · SIGUE EL RITMO`:s.bossWon?'¡LO CONSEGUISTE!':this.settings.inputMode==='hybrid'?'ALTERNA Z + X':'ALTERNA F + J';}}
  updateIntro(){const node=el('intro-typed');if(!node)return;const text=OrbitStory.intro[this.introPage],length=this.settings.reduced||this.introForce?text.length:Math.max(0,Math.floor((performance.now()-this.introStarted-350)/34));if(length!==this.introLength){this.introLength=length;node.textContent=text.slice(0,length);}this.introComplete=length>=text.length;const b=document.querySelector('[data-action="intro-next"]');if(b)b.innerHTML=`${this.introComplete?(this.introPage===2?'Empezar entrenamiento':'Continuar'):'Mostrar frase completa'} ${OrbitIcons.make('next')}`;}
  render(){
    super.render();const state=this.state,l=this.level;
    if(state==='intro'){el('chrome').hidden=true;this.introStarted=performance.now();this.introLength=-1;this.introComplete=false;this.view.innerHTML=`<section class="intro story-intro"><div class="intro-content"><h1 id="intro-typed" aria-label="${safeText(OrbitStory.intro[this.introPage])}"></h1><button class="intro-continue" data-action="intro-next">Continuar</button><div class="intro-dots" aria-label="Parte ${this.introPage+1} de 3">${[0,1,2].map(i=>`<i class="${i<=this.introPage?'active':''}"></i>`).join('')}</div></div></section>`;this.updateIntro();}
    if(state==='title'){const text=document.querySelector('.tiny-meta');if(text)text.textContent='UNA CANCIÓN. DOS VOCES. TODO UN UNIVERSO.';}
    if(state==='menu'){document.querySelector('.bottom-launch')?.insertAdjacentHTML('beforeend','<button class="text-btn" data-action="story">La historia de Aurora</button>');const badge=document.querySelector('.menu-badge small');if(badge)badge.textContent=`${Orbita.LEVELS.filter(v=>!v.bonus&&Object.keys(this.records).some(k=>k.startsWith(v.id+':')&&this.records[k].clear)).length} de 6 capítulos · 2 rutas extra`;}
    if(state==='info'){const p=document.querySelector('.panel>p');if(p)p.textContent='Elia corre automáticamente. Pulsa SUELO para golpear abajo o AIRE para golpear arriba, justo cuando el enemigo llegue al círculo. Mantén la tecla en las notas largas. Los jefes disparan proyectiles; devuélvelos con el mismo ritmo.';}
    if(state==='select'){const top=document.querySelector('.selection-heading .eyebrow');if(top)top.textContent='6 CAPÍTULOS + 2 RUTAS EXTRA';const p=document.querySelector('.select-footer p');if(p)p.textContent=l.line;}
    if(state==='detail'){
      const song=OrbitSongs.find(s=>s.id===l.songId);document.querySelector('.song-meta')?.insertAdjacentHTML('beforebegin',`<div class="song-credit"><strong>${safeText(song?.title||'Canción')}</strong><span>${safeText(song?.artist||'')} · canción completa</span></div>`);
      const note=document.querySelector('.mission-note');if(note)note.innerHTML=`${safeText(l.bonus?l.line:this.episode.before)}<br><b>Dos encuentros:</b> proyectiles al ritmo y escudo de ráfaga.`;
      document.querySelector('.detail-content')?.insertAdjacentHTML('beforeend','<button class="text-btn" data-action="songs">Ver canciones y créditos</button>');
    }
    if(state==='results'&&!this.failed){const fragment=document.querySelector('.fragment p');if(fragment)fragment.textContent=l.bonus?l.fragment:this.episode.after;}
    if(state==='ending'){const p=document.querySelector('.ending p');if(p)p.textContent=OrbitStory.ending;}
    if(state==='play')this.updateBossHUD(this.clock());
    if(state==='play'){const h=document.querySelector('.health-block>span');if(h)h.textContent='VIDA';const score=document.querySelector('.score-block>span');if(score)score.textContent='PUNTOS';}
    this.updateIcons();
    this.refineScreen();
    if(!this.settings.reduced&&state!=='intro'&&state!=='play'&&state!=='tutorial'){const curtain=document.createElement('div');curtain.className='transition-curtain';el('shell').append(curtain);curtain.animate([{opacity:1},{opacity:0}],{duration:450,easing:'ease-out'}).onfinish=()=>curtain.remove();}
  }
  updateIcons(){
    for(const [id,icon]of[['back','back'],['settings-open','settings'],['fullscreen','fullscreen']])if(el(id))el(id).innerHTML=OrbitIcons.make(icon);
    all('.btn>span').forEach(n=>n.innerHTML=OrbitIcons.make(n.parentElement.dataset.action==='play-menu'?'play':'next'));
    all('[data-action="pause"]').forEach(n=>{n.innerHTML=OrbitIcons.make('pause')+'<span>Pausa</span>';n.classList.add('pause-button');});
  }
  playUI(){
    if(this.state!=='tutorial')return super.playUI();const tr=this.training,k=tr.step,keys=this.settings.bindings.map(a=>a.map(label).join(' / '));
    const lessons=this.settings.inputMode==='hybrid'?[['Apunta abajo y golpea','Mouse abajo · Pulsa Z o X en el círculo naranja.'],['Apunta arriba y golpea','Mouse arriba · Pulsa Z o X en el círculo celeste.'],['Sigue las dos alturas','Cambia la altura con el mouse y golpea con Z / X.'],['Mantén la estela','Pulsa Z o X y mantenla hasta el final.'],['Prueba los dos dedos','Alterna Z y X: ambas golpean donde apuntas.'],['Devuelve los disparos','Apunta a su altura y pulsa Z o X.'],['Lanza tus aros','Alterna Z y X rápidamente.']]:[['Golpea abajo',`Pulsa ${keys[0]} en el círculo naranja.`],['Golpea arriba',`Pulsa ${keys[1]} en el círculo celeste.`],['Sigue las dos alturas',`${keys[0]} abajo · ${keys[1]} arriba`],['Mantén la estela',`Mantén ${keys[0]} hasta el final.`],['Las dos a la vez',`Pulsa ${keys[0]} + ${keys[1]} juntos.`],['Devuelve los disparos','Golpea cada proyectil en su círculo.'],['Lanza tus aros',`Alterna ${keys[0]} y ${keys[1]} rápidamente.`]];
    const success=tr.phase==='success',[title,description]=success?['¡Eso es!','']:lessons[k];
    return `<section class="play-ui tutorial-ui"><button class="tutorial-skip" data-action="tutorial-skip">Salir ${OrbitIcons.make('next')}</button><div class="judgement" id="judgement"></div><div class="boss-hud" id="boss-hud" hidden><span>CONTRAATAQUE</span><h3 id="boss-name"></h3><div class="meter"><i id="boss-fill"></i></div><p id="boss-hint"></p></div><div class="touch-inputs"><button data-touch="0" aria-label="Golpear suelo">SUELO<kbd>${keys[0]}</kbd></button><button data-touch="1" aria-label="Golpear aire">AIRE<kbd>${keys[1]}</kbd></button></div><div class="lesson-console continuous ${success?'success':''}" data-step="${k}"><span class="lesson-number">0${k+1}<small>/ 07</small></span><div class="lesson-text"><h2>${title}</h2>${description?`<p>${description}</p>`:''}</div><div class="lesson-steps" aria-label="Paso ${k+1} de 7">${Array.from({length:7},(_,i)=>`<i class="${i<k||i===k&&success?'done':i===k?'current':''}"></i>`).join('')}</div></div></section>`;
  }
  keyGuide(){if(this.settings.inputMode==='hybrid')return '<div class="key-demo hybrid-guide"><div><strong>↑ / ↓</strong><span>MOUSE · ALTURA</span></div><div><strong>Z / X</strong><span>CUALQUIERA · GOLPEAR</span></div></div>';return `<div class="key-demo">${this.settings.bindings.map((keys,a)=>`<div><strong>${keys.map(label).join(' / ')}</strong><span>${a?'○ AIRE':'◇ SUELO'}</span></div>`).join('')}</div>`;}
  modal(content,cls=''){el('modal').hidden=false;el('modal').innerHTML=`<section class="panel ${cls}"><button class="square modal-close" data-action="close-settings" aria-label="Cerrar">${OrbitIcons.make('close')}</button>${content}</section>`;el('modal').querySelector('button').focus();}
  showHelp(){this.modal(`<h2 id="modal-title">Cómo jugar</h2>${this.keyGuide()}<div class="help-lines"><p><b>Golpea</b> cuando lleguen al círculo.</p><p><b>Mantén</b> la tecla hasta el final de la estela.</p><p><b>Devuelve</b> los disparos del jefe.</p><p><b>Alterna</b> ${this.settings.inputMode==='hybrid'?'Z y X':'F y J'} contra el escudo.</p></div><small>P / Esc · Pausa</small>`,'help-panel');}
  showStory(page=0){
    this.comicPage=Math.max(0,Math.min(5,page));const captions=['Aurora quedó en silencio.','Una canción seguía viajando.','Elia reconoció la voz de su madre.','Seis estaciones. Una respuesta.','No era una despedida.','Estoy aquí, mamá. Te escucho.'];
    const frames=[[4,3,533,457],[550,3,531,457],[4,469,533,459],[550,469,531,459],[4,937,533,507],[550,937,531,507]],frame=frames[this.comicPage];
    this.modal(`<h2 id="modal-title">Una canción entre estrellas</h2><svg id="comic-frame" viewBox="${frame.join(' ')}" role="img" aria-label="${captions[this.comicPage]}"><defs><clipPath id="comic-clip"><rect x="${frame[0]}" y="${frame[1]}" width="${frame[2]}" height="${frame[3]}"/></clipPath></defs><image href="assets/aurora-comic.png" width="1086" height="1448" clip-path="url(#comic-clip)"/></svg><div class="comic-nav"><button class="square" data-action="comic-prev" aria-label="Viñeta anterior" ${this.comicPage===0?'disabled':''}>${OrbitIcons.make('back')}</button><span>${this.comicPage+1} / 6</span><button class="square" data-action="comic-next" aria-label="Viñeta siguiente" ${this.comicPage===5?'disabled':''}>${OrbitIcons.make('next')}</button></div>`,'comic-panel');
  }
  showSongs(){const song=OrbitSongs.find(s=>s.id===this.level.songId);this.modal(`<span class="eyebrow">${safeText(this.level.name)}</span><h2 id="modal-title">${safeText(song.title)}</h2><p>${safeText(song.artist)}</p><p>Canción completa · ${timeLabel(this.level.duration)}</p><a href="${song.url}" target="_blank" rel="noopener noreferrer">Referencia original ↗</a>`,'song-panel');}
  refineScreen(){
    const state=this.state,l=this.level;
    if(state==='menu'){document.querySelector('[data-action="tutorial"]').textContent='Entrenamiento de vuelo';document.querySelector('.hero-content p').innerHTML='Sigue el ritmo.<br>Haz llegar su voz.';}
    if(state==='info')this.view.innerHTML=`<section class="panel-screen"><div class="panel departure-panel"><span class="eyebrow">ANTES DEL DESPEGUE</span><h1>Dos alturas.<br>Un mismo latido.</h1>${this.keyGuide()}<p>Golpea en el círculo. Mantén las estelas.</p><label class="check"><input type="checkbox" id="remember-info" checked> No mostrar de nuevo</label>${button('Elegir estación','info-ok','cyan')}</div></section>`;
    if(state==='select'){
      document.querySelector('.selection-heading h1').textContent='Tu próximo destino.';
      const cards=document.querySelector('.level-cards'),wrap=document.createElement('div');wrap.className='route-carousel';cards.before(wrap);wrap.append(cards);
      wrap.insertAdjacentHTML('afterbegin',`<button class="route-arrow previous" data-action="route-prev" aria-label="Estación anterior">${OrbitIcons.make('back')}</button>`);wrap.insertAdjacentHTML('beforeend',`<button class="route-arrow next" data-action="route-next" aria-label="Estación siguiente">${OrbitIcons.make('next')}</button>`);
      requestAnimationFrame(()=>{const active=cards.querySelector('.selected');if(active)cards.scrollTo({left:active.offsetLeft-cards.offsetLeft-(cards.clientWidth-active.offsetWidth)/2,behavior:'instant'});});
    }
    if(state==='detail'){
      document.querySelector('.detail-content>.eyebrow')?.remove();
      document.querySelector('.song-credit span').textContent=OrbitSongs.find(s=>s.id===l.songId).artist+' · canción completa';
      document.querySelector('.detail-content>h2').textContent='Elige la dificultad.';const meta=document.querySelector('.song-meta');meta.children[1].textContent=timeLabel(l.duration);meta.lastElementChild.remove();meta.insertAdjacentHTML('beforeend',`<button class="pill control-choice" data-action="controls" aria-label="Cambiar modo de control">${this.settings.inputMode==='hybrid'?'MOUSE + Z/X':'TECLADO · F/J'}</button>`);
      document.querySelector('.mission-note').textContent=l.bonus?l.line:this.episode.goal+'.';document.querySelector('[data-action="songs"]').textContent='Canción y créditos';if(new URLSearchParams(location.search).get('editor')==='1')document.querySelector('[data-action="songs"]').insertAdjacentHTML('afterend','<button class="text-btn notation-link" data-action="notation">Partitura</button>');
    }
    if(state==='loading')this.view.innerHTML=`<section class="loading loading-v3" style="--loading-art:url('assets/${l.backdrop||l.id}.png')"><div class="load-center"><div class="load-orbit" aria-hidden="true"><i></i><i></i><i></i></div><span class="eyebrow">CARGANDO ESTACIÓN</span><h1>${l.name}</h1><div id="loading-status" class="load-track" role="progressbar" aria-label="Carga del audio" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><i id="load-fill"></i></div><strong id="load-percent">0%</strong></div><p class="load-tip">${['Golpea cuando el objetivo llegue al círculo.','Mantén la tecla hasta el final de la estela.',this.settings.inputMode==='hybrid'?'Mueve el mouse para elegir la altura.':'F golpea abajo; J golpea arriba.','Devuelve los proyectiles al ritmo.','Alterna las dos teclas para lanzar tus aros.'][l.theme]}</p></section>`;
    if(state==='play')document.querySelector('.play-song')?.remove();
    if(state==='pause'&&this.controlsChanged){const resume=document.querySelector('[data-action="resume"],[data-action="tutorial-resume"]');if(resume)resume.childNodes[0].textContent='Reiniciar con este modo';const p=document.querySelector('.panel>p');if(p)p.textContent='Cambiar el control reinicia la partida y su puntuación.';}
    if(['play','tutorial'].includes(state))el('breadcrumb').textContent='';this.updateIcons();this.renderInputHints();
  }
  renderInputHints(){
    if(!['play','tutorial'].includes(this.state)||this.settings.inputMode!=='hybrid')return;
    document.querySelector('.touch-inputs')?.remove();
    document.querySelector('.play-ui')?.insertAdjacentHTML('beforeend','<div class="hybrid-controls" aria-label="Controles: mouse para altura, Z o X para golpear"><span>MOUSE · ALTURA</span><strong id="pointer-height" data-lane="0">↓ SUELO</strong><div><kbd data-strike="KeyZ">Z</kbd><kbd data-strike="KeyX">X</kbd><small>GOLPEAR</small></div></div>');
    this.renderKeys();
  }
  get notationKey(){return `${this.level.songId}:${this.settings.difficulty}`;}
  saveNotations(){try{localStorage.setItem('orbita-notations-v1',JSON.stringify([...this.notations]));}catch{this.notify('No se pudo guardar la partitura local.');}}
  async showNotation(){
    this.notations??=new Map();if(!this.level.charts){const response=await fetch(`assets/charts/${this.level.songId}.json`);if(response.ok){this.sound.metas??=new Map();this.sound.metas.set(this.level.songId,{...(this.sound.metas.get(this.level.songId)||{}),charts:await response.json()});}}const map=this.notations.get(this.notationKey)||this.level.charts?.[this.settings.difficulty],title=OrbitSongs.find(s=>s.id===this.level.songId).title;
    this.modal(`<span class="eyebrow">HERRAMIENTAS DE MAPEO</span><h2 id="modal-title">${safeText(title)}</h2><p>${Orbita.RULES[this.settings.difficulty].name} · ${map?.notes?.length||0} notas</p><p class="hint">${this.notations.has(this.notationKey)?'Partitura importada · tiempos originales.':'Borrador por acentos del audio. Necesita revisión musical.'}</p><p>Importa osu!mania de 2 columnas o JSON. Izquierda: suelo. Derecha: aire.</p><label class="notation-file">Importar partitura<input id="notation-file" type="file" accept=".osu,.json"></label><p id="notation-message" role="status"></p><div class="action-row"><button class="btn cyan" data-action="notation-export">Exportar JSON</button><button class="text-btn" data-action="notation-reset">Restablecer</button></div>`,'notation-panel');
    el('notation-file').onchange=async e=>{try{const file=e.target.files[0];if(!file)return;if(file.size>4000000)throw Error('La partitura supera 4 MB.');const text=await file.text(),raw=file.name.toLowerCase().endsWith('.osu')?OrbitNotation.fromOsu(text,this.level.duration):JSON.parse(text),map=OrbitNotation.validate(raw,this.level.duration);this.notations.set(this.notationKey,map);this.saveNotations();el('notation-message').textContent=`${map.notes.length} notas listas para probar en ${Orbita.RULES[this.settings.difficulty].name}.`;}catch(error){el('notation-message').textContent=error.message;}};
  }
  exportNotation(){const map=this.notations?.get(this.notationKey)||this.level.charts?.[this.settings.difficulty];if(!map){this.notify('Carga la canción primero para obtener su partitura.');return;}const url=URL.createObjectURL(new Blob([JSON.stringify(map,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download=this.notationKey.replace(':','-')+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}

  renderSettings(){super.renderSettings();if(this.state==='pause')el('modal').querySelector('.input-modes').insertAdjacentHTML('afterend','<p class="hint input-restart-note">Cambiar el modo reinicia la partida.</p>');const close=el('modal').querySelector('.modal-close');if(close)close.innerHTML=OrbitIcons.make('close');this.updateIcons();}
}
try{window.app=new ExperienceApp();try{app.notations=new Map(JSON.parse(localStorage.getItem('orbita-notations-v1')||'[]'));}catch{app.notations=new Map();}new Phaser.Game({type:Phaser.CANVAS,parent:'world',backgroundColor:'#201b38',scale:{mode:Phaser.Scale.RESIZE,width:innerWidth,height:innerHeight},render:{antialias:true,desynchronized:true},scene:OrbitMotionScene});}catch(error){el('toast').hidden=false;el('toast').textContent='No se pudo iniciar el juego. Recarga la página.';console.error(error);}
