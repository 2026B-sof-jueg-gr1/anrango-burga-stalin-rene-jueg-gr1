'use strict';
const songTime=value=>{const s=Math.max(0,Math.floor(value));return Math.floor(s/60)+':'+String(s%60).padStart(2,'0');};
class RhythmApp extends ExpeditionApp{
 constructor(){super();this.sound=new OrbitRhythmAudio.Transport();this.applyAudio();this.phase='idle';this.session=null;}
 load(){
  super.load();this.records={};this.settings.musicVolume=.7;this.settings.hitVolume=.2;this.settings.offsetMs=0;
  try{const data=JSON.parse(localStorage.getItem('orbita-rhythm-v1'))||{};
   for(const key of ['musicVolume','hitVolume'])if(Number.isFinite(data[key]))this.settings[key]=Math.max(0,Math.min(1,data[key]));
   if(Number.isFinite(data.offsetMs))this.settings.offsetMs=Math.max(-250,Math.min(250,data.offsetMs));
   if(data.records&&typeof data.records==='object')for(const[key,r]of Object.entries(data.records)){const world=OrbitExpedition.WORLDS.find(w=>key.startsWith(w.id+':'));if(OrbitExpedition.validCompletion(key)&&world&&r.hash===world.music.sha256&&Number.isFinite(r.score)&&r.score>=0&&Number.isFinite(r.accuracy)&&r.accuracy>=0&&r.accuracy<=100)this.records[key]=r;}
  }catch{}
 }
 save(){super.save();try{localStorage.setItem('orbita-rhythm-v1',JSON.stringify({records:this.records||{},musicVolume:this.settings.musicVolume,hitVolume:this.settings.hitVolume,offsetMs:this.settings.offsetMs}));}catch{this.notify('No se pudo guardar el récord en este navegador.');}}
 applyAudio(){if(this.sound){this.sound.setVolumes(this.settings.musicVolume,this.settings.hitVolume);this.sound.offsetMs=this.settings.offsetMs;}}
 bind(){
  super.bind();document.addEventListener('input',event=>{const n=event.target,keys={'music-volume':'musicVolume','hit-volume':'hitVolume','sync-offset':'offsetMs'},key=keys[n.id];if(!key)return;this.settings[key]=Number(n.value)/(key==='offsetMs'?1:100);const out=$(n.id+'-value');if(out)out.textContent=key==='offsetMs'?this.settings[key]+' ms':n.value+'%';this.applyAudio();this.save();});
  document.addEventListener('keyup',event=>{if(this.state!=='explore'||!this.session)return;const lane=this.input.actionFor(event.code);if(lane!==null)this.session.release(lane,this.inputTime(event),this.phase==='countdown');});
 }
 inputTime(event){const now=performance.now(),stamp=Number.isFinite(event.timeStamp)&&Math.abs(event.timeStamp-now)<1000?event.timeStamp:now;return this.sound.timeAt(stamp);}
 keydown(event){
  if(this.state==='explore'&&!event.ctrlKey&&!event.altKey&&!event.metaKey){const lane=this.input.actionFor(event.code);if(lane!==null){event.preventDefault();if(event.repeat)return;const hit=this.input.down(event.code,lane);if(!hit)return;const time=this.inputTime(event);this.advancePhase(time);if(this.phase==='countdown')this.session.recover(lane);else{this.session.press(lane,time);this.scene.strike(lane);}this.updateKeys();return;}}
  super.keydown(event);
 }
 go(state){if(['loading','explore','pause'].includes(this.state)&&!['explore','pause'].includes(state)){this.launchController?.abort();this.sound?.stop();this.phase='idle';}super.go(state);}
 async launch(){
  this.launchController?.abort();this.sound.stop();this.closeModal();this.input.clear();this.session=null;this.phase='loading';this.state='loading';const token=++this.token,world=this.world,difficulty=this.settings.difficulty;this.launchController=new AbortController();const signal=this.launchController.signal;this.render();
  let art=0,audio=0;const progress=()=>{if(token!==this.token||this.state!=='loading')return;const n=Math.round((art*.35+audio*.65)*100);if($('load-meter'))$('load-meter').style.width=n+'%';if($('load-number'))$('load-number').textContent=n+'%';};
  try{
   await this.sound.unlock();await this.readyPromise;
   const [,entry]=await Promise.all([this.scene.loadWorld(world,p=>{art=p;progress();}),this.sound.prepare(world,p=>{audio=p;progress();},signal)]);
   if(signal.aborted||token!==this.token||this.state!=='loading')return;
   this.session=new OrbitRhythm.Session(entry.pack.difficulties[difficulty],difficulty,event=>this.judge(event));this.scene.enter(world,this.session);this.resumeAt=0;this.phase='countdown';this.applyAudio();this.sound.start(0,3);this.state='explore';this.render();
  }catch(error){if(token===this.token&&error.name!=='AbortError'){this.go('detail');this.notify(error.message||'No se pudo preparar la canción. Reintenta.');}}
 }
 advancePhase(time){if(this.phase==='countdown'&&time>=this.resumeAt){this.phase='play';this.session.resume(time);}}
 frame(){
  if(this.state==='pause')return this.frozenTime;
  const time=this.sound.time;this.advancePhase(time);if(this.phase==='countdown')return this.resumeAt;
  const ended=this.sound.audioTimeAt()>=this.sound.buffer.duration;
  const tick=ended?this.session.duration:Math.min(time,this.session.duration-.0001);this.session.update(tick);
  if(this.session.finished)this.finishMusicalRun();return time;
 }
 pause(){
  if(this.state!=='explore'||!this.session)return;
  this.frozenTime=Math.max(0,this.sound.pause());this.session.update(this.frozenTime);this.session.pauseHolds();this.input.clear();this.state='pause';this.render();
 }
 async resume(){
  if(this.state!=='pause')return;this.closeModal();await this.sound.unlock();if(this.state!=='pause')return;
  this.resumeAt=this.frozenTime;this.sound.start(this.sound.position,1.3);this.phase='countdown';this.state='explore';this.render();
 }
 finishMusicalRun(){
  if(this.state!=='explore')return;this.sound.stop();this.input.clear();const r=this.session.result(),key=this.world.id+':'+this.settings.difficulty,old=this.records[key];
  this.result={...r,difficulty:this.settings.difficulty,world:this.world.id,newBest:r.cleared&&(!old||r.score>old.score)};
  if(r.cleared){this.completed.add(key);if(!old||r.score>old.score)this.records[key]={score:r.score,accuracy:r.accuracy,maxCombo:r.maxCombo,rank:r.rank,hash:this.world.music.sha256};this.save();}
  this.phase='idle';this.state='result';this.render();
 }
 judge(event){
  this.scene?.onEvent(event);const feedback=$('rhythm-judgement');
  if(event.type==='judge'){
   const text=event.grade==='miss'?'FALLO':event.part==='tail'?'SOSTENIDO':({perfect:'PERFECTO',great:'GENIAL',good:'BIEN'})[event.grade];
   if(feedback){feedback.textContent=text;feedback.dataset.grade=event.grade;feedback.hidden=false;this.judgementUntil=performance.now()+550;}
   this.sound.hit(event.note.action,event.grade==='miss'?'miss':'hit');
  }else if(event.type==='boss-hit'){if(event.boss.hits%2===0)this.sound.hit(event.action);}
  else if(event.type==='boss-break'){this.sound.hit(1,'break');}
  else if(event.type==='boss-end'){
   if(feedback){feedback.textContent=event.won?'¡GUARDIÁN SUPERADO!':'EL GUARDIÁN ESCAPÓ';feedback.dataset.grade=event.won?'perfect':'miss';feedback.hidden=false;this.judgementUntil=performance.now()+1300;}
   if(!event.won)this.sound.hit(0,'miss');
  }
 }
 sceneTick(time){
  if(this.state!=='explore'||!this.session)return;const s=this.session,set=(id,value)=>{const n=$(id);if(n&&n.textContent!==String(value))n.textContent=value;};
  set('rhythm-score',s.score.toLocaleString('es'));set('rhythm-combo',s.combo);set('rhythm-accuracy',s.accuracy.toFixed(1)+'%');set('music-time',songTime(time)+' / '+songTime(s.duration));
  if($('song-progress'))$('song-progress').style.width=Math.max(0,Math.min(100,time/s.duration*100))+'%';if($('health-fill')){$('health-fill').style.width=s.health+'%';$('health-fill').parentElement.setAttribute('aria-valuenow',Math.round(s.health));}
  const countdown=$('play-countdown');if(countdown){const remaining=this.resumeAt-this.sound.time;countdown.hidden=this.phase!=='countdown';if(this.phase==='countdown')countdown.innerHTML=`<strong>${Math.max(1,Math.ceil(remaining))}</strong><span>${this.resumeAt>0?'PREPÁRATE PARA CONTINUAR':'SIGUE LA MÚSICA'}</span>`;}
  if($('rhythm-judgement')&&performance.now()>this.judgementUntil)$('rhythm-judgement').hidden=true;
  const boss=s.activeBoss,box=$('boss-challenge');if(box){box.hidden=!boss;if(boss){set('boss-count',boss.hits+' / '+boss.required);set('boss-time',(Math.max(0,boss.end-time)).toFixed(1)+' s');set('boss-bonus','+'+boss.bonus.toLocaleString('es'));set('boss-instruction',boss.won?'¡Escudo roto! Sigue alternando para sumar bonus.':'Alterna F y J antes de que termine el tiempo.');box.classList.toggle('bonus-active',boss.won);$('boss-meter').style.width=Math.min(100,boss.hits/boss.required*100)+'%';}}
  const label=$('guardian-label');if(label)label.hidden=!this.scene.bossActive||!!boss;
  const radio=$('radio-line');if(radio)radio.hidden=!(time>7&&time<13);
 }
 openSettings(){
  super.openSettings();if($('modal').hidden)return;
  const controls=document.createElement('div');controls.className='audio-settings';controls.innerHTML=`<span class="small-label">SONIDO Y SINCRONIZACIÓN</span><label class="range-label" for="music-volume">Música<output id="music-volume-value">${Math.round(this.settings.musicVolume*100)}%</output></label><input id="music-volume" type="range" min="0" max="100" value="${Math.round(this.settings.musicVolume*100)}"><label class="range-label" for="hit-volume">Sonido de los golpes<output id="hit-volume-value">${Math.round(this.settings.hitVolume*100)}%</output></label><input id="hit-volume" type="range" min="0" max="100" value="${Math.round(this.settings.hitVolume*100)}"><label class="range-label" for="sync-offset">Ajuste de sincronización<output id="sync-offset-value">${this.settings.offsetMs} ms</output></label><input id="sync-offset" type="range" min="-250" max="250" step="5" value="${this.settings.offsetMs}"><p>0 ms es el punto de partida. Aumenta el valor para retrasar la llegada de las notas; redúcelo para adelantarlas.</p>`;
  $('modal').querySelector('h2').after(controls);
 }
 help(){this.modal('Cómo jugar',`<div class="help-mode"><h3>F: suelo · J: aire</h3><p>Pulsa cuando el centro del objetivo llegue a su aro.</p></div><div class="rhythm-help"><p><b>Golpe individual</b>Una pulsación de F o J.</p><p><b>Nota doble · F + J</b>Las dos teclas a la vez.</p><p><b>Estela · Mantén</b>Mantén la tecla hasta que termine la barra.</p><p><b>Guardián · F ↔ J</b>Alterna rápidamente. Cumple el mínimo dentro del plazo y sigue para ganar bonus.</p></div><p>Llega al final de la canción con energía y al menos 60% de precisión para completar el nivel y desbloquear su recuerdo.</p><small>P / Esc: pausa · Configuración: volumen y sincronización</small>`);}
 renderResult(){
  const r=this.result,d=OrbitExpedition.difficulty(r.difficulty);return `<section class="result-screen"><div class="result-illustration">${this.cover(this.world)}<span class="result-rank">${r.cleared?r.rank:'×'}</span></div><div class="result-copy"><span class="small-label">${safe(this.world.name)} · ${d.name.toUpperCase()}</span><h1>${r.cleared?'¡Nivel completado!':'Una vez más.'}</h1><p>${r.cleared?r.newBest?'¡Nuevo récord! Tu recuerdo ya está disponible.':'Has completado la canción. Tu recuerdo está disponible.':r.failed?'Te quedaste sin energía. Respira y vuelve al ritmo.':'Necesitas al menos 60% de precisión para completar el nivel.'}</p><div class="result-stats"><div><span>Puntuación</span><strong>${r.score.toLocaleString('es')}</strong></div><div><span>Precisión · combo máximo</span><strong>${r.accuracy.toFixed(2)}% · ${r.maxCombo}</strong></div><div><span>Perfectos · geniales · bien · fallos</span><strong>${r.counts.perfect} · ${r.counts.great} · ${r.counts.good} · ${r.counts.miss}</strong></div><div><span>Guardianes · bonus</span><strong>${r.bossesWon}/${r.bossesTotal} · +${r.bossBonus.toLocaleString('es')}</strong></div></div>${r.cleared?actionButton('Leer recuerdo','reward'):''}${actionButton('Reintentar','launch',r.cleared?'secondary':'primary')}${actionButton('Volver a niveles','routes','secondary')}<small>${safe(this.world.music.title)} · ${songTime(r.duration)}</small></div></section>`;
 }
 render(){
  super.render();const world=this.world,music=world.music;
  if(this.state==='detail'){
   this.view.querySelector('.level-goal').textContent='Sigue la canción con F y J. Combina golpes, dobles y sostenidos; supera los desafíos del guardián.';
   const song=this.view.querySelector('.silent-note');song.className='level-song';song.innerHTML=`<strong>${safe(music.title)}</strong><span>${safe(music.artist)} · ${songTime(music.duration)}</span>`;
   const record=this.records?.[world.id+':'+this.settings.difficulty],box=document.createElement('div');box.className='music-record';box.innerHTML=record?`MEJOR PUNTUACIÓN <strong>${record.score.toLocaleString('es')}</strong><span>${record.rank} · ${record.accuracy.toFixed(2)}%</span>`:'Todavía no hay récord en esta dificultad.';this.view.querySelector('.difficulty-picker').append(box);
  }
  if(this.state==='loading'){this.view.querySelector('.loading-screen>p').textContent=music.title+' · '+music.artist;this.view.querySelector('.loading-screen .small-label').textContent='CARGANDO CANCIÓN Y NIVEL';}
  if(this.state==='explore'){
   this.view.querySelector('.run-progress').innerHTML='<span>PUNTUACIÓN<strong id="rhythm-score">0</strong></span><span>COMBO<strong id="rhythm-combo">0</strong></span><span>PRECISIÓN<strong id="rhythm-accuracy">100.0%</strong></span>';
   this.view.querySelector('.world-heading').insertAdjacentHTML('beforeend','<div class="health-track" role="meter" aria-label="Energía" aria-valuemin="0" aria-valuemax="100"><i id="health-fill"></i></div>');
   this.view.querySelector('.visual-trial-label').outerHTML=`<div class="music-playing"><strong>${safe(music.title)}</strong><span id="music-time">0:00 / ${songTime(music.duration)}</span></div>`;
   this.view.querySelector('.explore-ui').insertAdjacentHTML('beforeend',`<div class="song-progress-track"><i id="song-progress"></i></div><div id="rhythm-judgement" class="rhythm-judgement" hidden></div><div id="play-countdown" class="play-countdown" hidden></div><div class="boss-challenge" id="boss-challenge" hidden><span class="small-label">${safe(world.boss)}</span><h2>F <span>↔</span> J</h2><p id="boss-instruction">Alterna F y J antes de que termine el tiempo.</p><div class="boss-meter"><i id="boss-meter"></i></div><div class="boss-numbers"><strong id="boss-count"></strong><span id="boss-time"></span><b id="boss-bonus">+0</b></div></div>`);
  }
  if(this.state==='menu'&&this.records){const cleared=Object.keys(this.records).length;this.view.querySelector('.menu-status small').textContent=cleared+' partituras completadas · '+this.unlocked.size+' recuerdos desbloqueados';}
 }
}
window.app=new RhythmApp();
new Phaser.Game({type:Phaser.CANVAS,parent:'world',backgroundColor:'#262438',audio:{noAudio:true},scale:{mode:Phaser.Scale.RESIZE,width:innerWidth,height:innerHeight},render:{antialias:true,desynchronized:true},fps:{target:60,smoothStep:true},scene:RhythmScene});
