/* Puerto Aurora: primer capítulo de la nueva dirección narrativa y visual. */
'use strict';
class PilotApp extends ExperienceApp{
  load(){
    super.load();this.settings.effects=Number.isFinite(this.settings.effects)?Math.max(0,Math.min(1,this.settings.effects)):.45;
    this.settings.ambient=typeof this.settings.ambient==='boolean'?this.settings.ambient:true;
    // OrbitApp conserva únicamente las preferencias conocidas; estas dos son nuevas.
    try{const s=JSON.parse(localStorage.getItem('orbita-runner-v1'))?.settings;if(Number.isFinite(s?.effects))this.settings.effects=Math.max(0,Math.min(1,s.effects));if(typeof s?.ambient==='boolean')this.settings.ambient=s.ambient;}catch{}
    this.trainingDone={keyboard:false,hybrid:false};this.infoSeenModes={keyboard:false,hybrid:false};this.recoveredAurora=false;this.prologueSeen=false;
    try{const data=JSON.parse(localStorage.getItem('orbita-pilot-v1'));for(const mode of OrbitInput.MODES){this.trainingDone[mode]=data?.trainingDone?.[mode]===true;this.infoSeenModes[mode]=data?.infoSeenModes?.[mode]===true;}if(!data?.infoSeenModes&&this.infoSeen)this.infoSeenModes[this.settings.inputMode]=true;this.recoveredAurora=data?.recoveredAurora===true;this.prologueSeen=data?.prologueSeen===true;}catch{}
  }
  save(){super.save();try{localStorage.setItem('orbita-pilot-v1',JSON.stringify({trainingDone:this.trainingDone,infoSeenModes:this.infoSeenModes,recoveredAurora:this.recoveredAurora,prologueSeen:this.prologueSeen}));}catch{}}
  get recordKey(){return super.recordKey+(this.level.pilot?':aurora-pilot-v1':'');}
  bind(){
    super.bind();document.addEventListener('input',e=>{if(e.target.id==='effects'){this.settings.effects=Number(e.target.value)/100;el('effects-out').textContent=`${Math.round(this.settings.effects*100)}%`;this.applySettings();this.save();}});
    document.addEventListener('change',e=>{if(e.target.id==='ambient'){this.settings.ambient=e.target.checked;this.applySettings();this.save();}});
  }
  applySettings(){super.applySettings();el('shell').classList.toggle('quiet-effects',this.settings.effects<.7||this.settings.reduced);}
  setInputMode(mode){
    if(!['control-choice','info'].includes(this.state)||!el('modal').hidden)return super.setInputMode(mode);
    if(!OrbitInput.MODES.includes(mode))return;this.clearInput(true);this.settings.inputMode=mode;this.applySettings();this.save();this.render();this.view.querySelector(`[data-input-mode="${mode}"]`)?.focus();
  }
  startTutorial(){if(!this.prologueSeen){this.selected=0;this.prologuePage=0;this.prologueNext='control-choice';this.go('prologue');return;}this.go('control-choice');}
  start(){if(this.level.pilot&&!this.prologueSeen){this.prologuePage=0;this.prologueNext='start';this.go('prologue');return;}return super.start();}
  back(){if(this.state==='prologue'&&el('modal').hidden){if(this.prologuePage>0){this.prologuePage--;return this.render();}return this.go(this.prologueNext==='start'?'detail':'intro');}if(this.state==='fragment'&&el('modal').hidden)return this.go('select');return super.back();}
  endTutorial(){
    this.tutorialCompleted=this.training?.step>=7;if(this.tutorialCompleted){this.trainingDone[this.settings.inputMode]=true;this.save();}
    super.endTutorial();
  }
  action(action,target){
    if(action==='play-menu')return this.go(this.infoSeenModes[this.settings.inputMode]?'select':'info');
    if(action==='prologue-next'){if(++this.prologuePage<3)return this.render();this.prologueSeen=true;this.save();return this.prologueNext==='start'?this.start():this.go('control-choice');}
    if(action==='training-start')return super.startTutorial();
    if(action==='continue'&&this.state==='results'&&this.level.pilot&&!this.failed){this.recoveredAurora=true;this.save();return this.go('fragment');}
    if(action==='fragment-next')return super.action('continue',target);
    if(action==='info-ok'&&el('remember-info')?.checked){this.infoSeenModes[this.settings.inputMode]=true;this.save();}
    return super.action(action,target);
  }
  keydown(e){
    if(!e.ctrlKey&&!e.altKey&&!e.metaKey&&['control-choice','fragment','prologue'].includes(this.state)&&['Enter','Space'].includes(e.code)&&el('modal').hidden&&!e.repeat){
      if(document.activeElement?.matches('button')&&this.view.contains(document.activeElement))return super.keydown(e);
      e.preventDefault();return this.action({ 'control-choice':'training-start',fragment:'fragment-next',prologue:'prologue-next'}[this.state]);
    }
    super.keydown(e);
  }
  updateIntro(){super.updateIntro();if(this.introPage===2&&this.introComplete){const button=document.querySelector('[data-action="intro-next"]');if(button)button.innerHTML='Seguir la melodía '+OrbitIcons.make('next');}}
  modeCards(){return `<div class="mode-cards" role="group" aria-label="Elige cómo jugar">${[['keyboard','Solo teclado','F','J','F: suelo · J: aire'],['hybrid','Mouse + teclado','↕','Z / X','Mouse: altura · Z o X: golpear']].map(([mode,title,left,right,description])=>`<button data-input-mode="${mode}" aria-pressed="${this.settings.inputMode===mode}" class="${this.settings.inputMode===mode?'selected':''}"><span class="mode-keys"><kbd>${left}</kbd><kbd>${right}</kbd></span><strong>${title}</strong><span>${description}</span><small>${this.trainingDone[mode]?'✓ Práctica completada':'Práctica disponible'}</small></button>`).join('')}</div>`;}
  storyFrame(index,id='comic-frame'){
    const x=index%2*1024+13,y=Math.floor(index/2)*1024+13;
    return `<svg id="${id}" viewBox="${x} ${y} 998 998" role="img" aria-label="${safeText(OrbitStory.captions[index])}"><defs><clipPath id="${id}-clip"><rect x="${x}" y="${y}" width="998" height="998"/></clipPath></defs><image href="assets/aurora-story-v1.png" width="2048" height="2048" clip-path="url(#${id}-clip)"/></svg>`;
  }
  showStory(page=0){
    const count=this.recoveredAurora?4:3;this.comicPage=Math.max(0,Math.min(count-1,page));
    this.modal(`<span class="eyebrow">LA SEÑAL QUE FALTABA</span><h2 id="modal-title">${this.comicPage===3?'Una fecha imposible.':'Una voz conocida.'}</h2>${this.storyFrame(this.comicPage)}<p class="comic-caption">${OrbitStory.captions[this.comicPage]}</p><div class="comic-nav"><button class="square" data-action="comic-prev" aria-label="Viñeta anterior" ${this.comicPage===0?'disabled':''}>${OrbitIcons.make('back')}</button><span>${this.comicPage+1} / ${count}</span><button class="square" data-action="comic-next" aria-label="Viñeta siguiente" ${this.comicPage===count-1?'disabled':''}>${OrbitIcons.make('next')}</button></div>`,'comic-panel pilot-comic');
  }
  renderSettings(){
    super.renderSettings();const node=el('modal').querySelector('#reduced')?.closest('label');if(!node)return;
    node.insertAdjacentHTML('beforebegin',`<div class="comfort-settings"><span class="eyebrow">CLARIDAD VISUAL</span><label class="setting-label" for="effects">Intensidad de efectos<output id="effects-out">${Math.round(this.settings.effects*100)}%</output></label><input id="effects" type="range" min="0" max="100" step="5" value="${this.settings.effects*100}"><p class="hint">Conserva los círculos, las notas y la respuesta de cada golpe.</p><label class="check"><input type="checkbox" id="ambient" ${this.settings.ambient?'checked':''}> Movimiento ambiental del fondo</label></div>`);
  }
  render(){
    super.render();const state=this.state;el('shell').classList.toggle('pilot',this.level.pilot===true);
    if(state==='control-choice'){
      el('chrome').hidden=false;el('settings-open').hidden=false;el('breadcrumb').textContent='ENTRENAMIENTO';
      this.view.innerHTML=`<section class="panel-screen"><div class="control-intro"><span class="eyebrow">PRIMER VUELO</span><h1>Tu forma de sentir<br>el ritmo.</h1><p>Elige un control. Practicarás solo ese modo.<br>Puedes probar el otro cuando quieras.</p>${this.modeCards()}${button('Comenzar práctica','training-start','cyan')}<small>La dificultad del mapa es independiente del control.</small></div></section>`;
    }
    if(state==='info')document.querySelector('.departure-panel .key-demo')?.insertAdjacentHTML('beforebegin',`<div class="departure-modes"><button data-input-mode="keyboard" aria-pressed="${this.settings.inputMode==='keyboard'}">Teclado · F/J</button><button data-input-mode="hybrid" aria-pressed="${this.settings.inputMode==='hybrid'}">Mouse + Z/X</button></div>`);
    if(state==='menu'){document.querySelector('.hero-content p').innerHTML='Una señal imposible.<br>Una canción que conoces.';document.querySelector('[data-action="story"]').textContent='La señal que faltaba';}
    if(state==='intro')document.querySelector('[data-action="intro-next"]')?.setAttribute('aria-label','Continuar presentación');
    if(state==='prologue'){
      el('chrome').hidden=false;el('breadcrumb').textContent='LA SEÑAL QUE FALTABA';const index=this.prologuePage||0;
      this.view.innerHTML=`<section class="recovered-scene prologue-scene"><div class="recovered-art">${this.storyFrame(index,'prologue-frame')}</div><div class="recovered-copy"><span class="eyebrow">PUERTO AURORA / 0${index+1}</span><h1>${['Una voz<br>conocida.','Una canción<br>de casa.','Algo sigue<br>despierto.'][index]}</h1><p>${OrbitStory.captions[index]}</p><div class="story-dots" aria-label="Viñeta ${index+1} de 3">${[0,1,2].map(i=>`<i class="${i===index?'active':''}"></i>`).join('')}</div>${button(index===2?(this.prologueNext==='start'?'Entrar al puerto':'Elegir controles'):'Continuar','prologue-next','cyan')}</div></section>`;
    }
    if(state==='retry'&&!this.tutorialCompleted)document.querySelector('.retry-screen .eyebrow').textContent='PRÁCTICA EN PAUSA · PUEDES VOLVER CUANDO QUIERAS';
    if(state==='fragment'){
      el('chrome').hidden=false;el('breadcrumb').textContent='ARCHIVO RECUPERADO / 01';
      this.view.innerHTML=`<section class="recovered-scene"><div class="recovered-art">${this.storyFrame(3,'recovered-frame')}</div><div class="recovered-copy"><span class="eyebrow">PUERTO AURORA / FRAGMENTO 01</span><h1>Una fecha<br>imposible.</h1><p>${OrbitStory.captions[3]}</p><blockquote>La misma melodía.<br>El mismo sol dibujado a mano.</blockquote><span class="clue-saved">${OrbitIcons.make('check')} Guardado en tu historia</span>${button('Seguir la señal','fragment-next','cyan')}</div></section>`;
    }
    if(state==='detail'&&this.level.pilot){document.querySelector('.mission-note').textContent='Sigue la melodía que ha despertado el puerto.';document.querySelector('.detail-content').classList.add('pilot-detail');}
    this.updateIcons();
  }
}
try{window.app=new PilotApp();try{app.notations=new Map(JSON.parse(localStorage.getItem('orbita-notations-v1')||'[]'));}catch{app.notations=new Map();}new Phaser.Game({type:Phaser.CANVAS,parent:'world',backgroundColor:'#252641',scale:{mode:Phaser.Scale.RESIZE,width:innerWidth,height:innerHeight},render:{antialias:true,desynchronized:true},scene:PilotScene});}catch(error){el('toast').hidden=false;el('toast').textContent='No se pudo iniciar el juego. Recarga la página.';console.error(error);}
