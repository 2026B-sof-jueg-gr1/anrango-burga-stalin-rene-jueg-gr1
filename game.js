/* Órbita: Contrapunto. Menús, historia, entrada y coordinación de audio y dibujo. */
'use strict';
const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const Core = OrbitaCore;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
class Contrapunto {
  constructor() {
    this.mode = 'menu'; this.selected = 0; this.down = new Set(); this.progress = {}; this.awaiting = null; this.audio = new OrbitaAudio();
    this.preferences = { difficulty: 'normal', volume: .65, offset: 0, reduced: matchMedia('(prefers-reduced-motion: reduce)').matches, keys: ['KeyD', 'KeyF', 'KeyJ', 'KeyK'] };
    this.load(); this.bind(); this.renderMenu(); this.renderPreferences(); this.lastUI = 0;
  }
  load() {
    try {
      const saved = JSON.parse(localStorage.getItem('orbita-contrapunto-v1'));
      if (!saved) return;
      this.progress = saved.progress && typeof saved.progress === 'object' ? saved.progress : {};
      this.selected = Math.round(clamp(Number(saved.selected) || 0, 0, 2));
      const p = saved.preferences || {};
      if (Core.DIFFICULTIES[p.difficulty]) this.preferences.difficulty = p.difficulty;
      if (Number.isFinite(p.volume)) this.preferences.volume = clamp(p.volume, 0, 1);
      if (Number.isFinite(p.offset)) this.preferences.offset = clamp(p.offset, -250, 250);
      if (typeof p.reduced === 'boolean') this.preferences.reduced = p.reduced;
      if (Array.isArray(p.keys) && p.keys.length === 4 && new Set(p.keys).size === 4 && p.keys.every(key => /^Key[A-Z]$/.test(key) && key !== 'KeyP')) this.preferences.keys = p.keys;
    } catch { /* El juego también funciona con almacenamiento deshabilitado. */ }
  }
  save() { try { localStorage.setItem('orbita-contrapunto-v1', JSON.stringify({ preferences: this.preferences, progress: this.progress, selected: this.selected })); } catch {} }
  get chapter() { return Core.CHAPTERS[this.selected]; }
  songTime() { return this.audio.ctx ? this.audio.time : 0; }
  bind() {
    $('#home').onclick = () => this.home(); $('#launch').onclick = () => this.story(false);
    $('#help').onclick = () => this.openModal('help-panel'); $('#settings').onclick = () => this.openModal('settings-panel');
    $$('[data-close]').forEach(button => { button.onclick = () => this.closeModal(button.dataset.close); });
    $('#pause').onclick = () => this.pause(); $('#resume').onclick = () => this.resume(); $('#restart').onclick = () => this.start(); $('#back-map').onclick = () => this.home();
    $('#retry').onclick = () => this.start(); $('#result-next').onclick = () => this.failed ? this.start() : this.story(true);
    $('#dialog-next').onclick = () => this.nextDialogue(); $('#dialog-skip').onclick = () => this.finishDialogue();
    $('#fullscreen').onclick = async () => { try { if (document.fullscreenElement) await document.exitFullscreen(); else await document.documentElement.requestFullscreen(); } catch { this.notice('Puedes ampliar la ventana con F11.'); } };
    $$('#difficulty button').forEach(button => { button.onclick = () => { this.preferences.difficulty = button.dataset.difficulty; this.renderPreferences(); this.renderMenu(); this.save(); }; });
    $('#volume').oninput = e => { this.preferences.volume = Number(e.target.value) / 100; this.audio.setVolume(this.preferences.volume); this.renderPreferences(); this.save(); };
    $('#offset').oninput = e => { this.preferences.offset = Number(e.target.value); this.renderPreferences(); this.save(); };
    $('#reduced').onchange = e => { this.preferences.reduced = e.target.checked; this.renderPreferences(); this.save(); };
    $$('#rebinds button').forEach(button => { button.onclick = () => { this.awaiting = Number(button.dataset.bind); this.renderPreferences(); $('#binding-status').textContent = 'Pulsa una letra. Escape cancela.'; }; });
    $('#calibrate').onclick = () => this.startCalibration(); $('#calibration-stop').onclick = () => this.stopCalibration();
    document.addEventListener('keydown', e => this.keyDown(e)); document.addEventListener('keyup', e => this.keyUp(e));
    $$('#keypads button').forEach(button => {
      const lane = Number(button.dataset.lane);
      button.onpointerdown = e => { e.preventDefault(); button.setPointerCapture(e.pointerId); this.press(lane); };
      ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(type => button.addEventListener(type, () => this.release(lane)));
    });
    document.addEventListener('visibilitychange', () => { if (document.hidden) { this.pause(); this.stopCalibration(); } });
    window.addEventListener('blur', () => { this.pause(); });
  }
  keyDown(e) {
    if (e.ctrlKey || e.altKey || e.metaKey) return;
    if (this.awaiting !== null) {
      e.preventDefault();
      if (e.code === 'Escape') { this.awaiting = null; this.renderPreferences(); return; }
      if (!/^Key[A-Z]$/.test(e.code) || e.code === 'KeyP' || this.preferences.keys.some((key, i) => i !== this.awaiting && key === e.code)) { $('#binding-status').textContent = 'Elige una letra libre; P está reservada para pausa.'; return; }
      this.preferences.keys[this.awaiting] = e.code; this.awaiting = null; this.renderPreferences(); this.save(); $('#binding-status').textContent = 'Control actualizado.'; return;
    }
    if (this.calibration && e.code === 'Space') { e.preventDefault(); if (!e.repeat) this.calibrationTap(); return; }
    if ((e.code === 'KeyP' || e.code === 'Escape') && ['playing', 'countdown', 'paused'].includes(this.mode)) { e.preventDefault(); if (!e.repeat) this.mode === 'paused' ? this.resume() : this.pause(); return; }
    if (e.code === 'Escape') { ['help-panel', 'settings-panel'].forEach(id => this.closeModal(id)); return; }
    const lane = this.preferences.keys.indexOf(e.code);
    if (lane !== -1 && ['playing', 'countdown'].includes(this.mode)) { e.preventDefault(); if (!e.repeat) this.press(lane); }
  }
  keyUp(e) { const lane = this.preferences.keys.indexOf(e.code); if (lane !== -1) this.release(lane); }
  press(lane) {
    if (!['playing', 'countdown'].includes(this.mode) || this.down.has(lane)) return;
    this.down.add(lane); this.renderKeys();
    if (this.mode === 'playing') this.session.press(lane, this.songTime() - this.preferences.offset / 1000);
  }
  release(lane) {
    if (!this.down.has(lane)) return;
    this.down.delete(lane); this.renderKeys();
    if (this.mode === 'playing') this.session.release(lane, this.songTime() - this.preferences.offset / 1000);
  }
  clearKeys(paused = false) {
    if (this.session && paused) for (const lane of this.down) this.session.release(lane, this.songTime() - this.preferences.offset / 1000, true);
    this.down.clear(); this.renderKeys();
  }
  renderKeys() { $$('#keypads button').forEach((button, i) => button.classList.toggle('down', this.down.has(i))); }
  renderPreferences() {
    document.documentElement.classList.toggle('reduced-motion', this.preferences.reduced);
    $('#volume').value = this.preferences.volume * 100; $('#volume-value').textContent = `${Math.round(this.preferences.volume * 100)}%`;
    $('#offset').value = this.preferences.offset; $('#offset-value').textContent = `${this.preferences.offset > 0 ? '+' : ''}${this.preferences.offset} ms`;
    $('#reduced').checked = this.preferences.reduced;
    $$('#difficulty button').forEach(button => { const active = button.dataset.difficulty === this.preferences.difficulty; button.classList.toggle('selected', active); button.setAttribute('aria-pressed', String(active)); });
    ['#keypads button', '#rebinds button', 'footer kbd', '.help-keys kbd'].forEach(selector => $$(selector).forEach((el, i) => { el.textContent = this.preferences.keys[i].slice(3); }));
    $$('#rebinds button').forEach((button, i) => button.classList.toggle('awaiting', i === this.awaiting));
    this.audio.setVolume(this.preferences.volume);
  }
  renderMenu() {
    $('#menu').dataset.chapter = this.chapter.id;
    const list = $('#chapter-list'); list.replaceChildren();
    Core.CHAPTERS.forEach((chapter, i) => {
      const button = document.createElement('button'); button.className = `chapter ${this.selected === i ? 'selected' : ''}`; button.setAttribute('aria-pressed', String(this.selected === i));
      button.innerHTML = `<span class="map-planet planet-${i}" aria-hidden="true"><i></i></span><span class="number">${chapter.number}</span><span><strong>${chapter.name}</strong><small>${chapter.bpm} BPM · ${i === 0 ? 'LA LLAMADA' : i === 1 ? 'LA RESPUESTA' : 'EL ENCUENTRO'}</small></span><span class="chapter-state">${this.progress[chapter.id]?.complete ? '✓' : '↗'}</span>`;
      button.onclick = () => { this.selected = i; this.save(); this.renderMenu(); }; list.append(button);
    });
    $('#transmission-place').textContent = this.chapter.place; $('#transmission-title').textContent = this.chapter.subtitle; $('#transmission-description').textContent = this.chapter.description;
    const best = this.progress[this.chapter.id]?.[this.preferences.difficulty];
    $('#chapter-best').textContent = Number.isFinite(best) ? `MEJOR ENLACE · ${best.toFixed(1)}%` : 'ENLACE POR ESTABLECER';
    const duration = this.chapter.bars * 4 * 60 / this.chapter.bpm; $('#mission-duration').textContent = this.formatTime(duration); $('#mission-bpm').textContent = `${this.chapter.bpm} BPM`;
  }
  openModal(id) { $('#' + id).hidden = false; $('#' + id).querySelector('button')?.focus(); }
  closeModal(id) { $('#' + id).hidden = true; if (id === 'settings-panel') { this.awaiting = null; this.stopCalibration(); this.renderPreferences(); } }
  home() {
    this.audio.stop(); this.mode = 'menu'; this.clearKeys();
    $$('.modal-layer').forEach(el => { el.hidden = true; }); $('#menu').hidden = false; $('#play').hidden = true; $('#app').classList.remove('game-mode');
    $('#connection-label').textContent = 'RED DE FAROS / SECTOR AURORA'; $('#footer-left').textContent = 'TU MANO IZQUIERDA LLAMA. TU MANO DERECHA RESPONDE.';
    this.renderMenu();
  }
  story(outro) {
    this.dialogueOutro = outro; this.dialogue = OrbitaNarrative[this.chapter.id][outro ? 'outro' : 'intro']; this.dialoguePage = 0;
    $('#results').hidden = true; $('#dialog').hidden = false; this.renderDialogue();
  }
  renderDialogue() {
    $('#dialog-kicker').textContent = this.dialogueOutro ? 'LA OTRA VOZ' : 'TRANSMISIÓN ENTRANTE';
    const [speaker, title, line, motif, coordinate] = this.dialogue[this.dialoguePage];
    const names = { sira: 'SIRA / OPERADORA DEL FARO', elia: 'ELIA / MÚSICA E INGENIERA', nomad: 'NOMAD / NAVE DE ENLACE', both: 'SIRA + ELIA / DOS VOCES' };
    $('#dialog').dataset.speaker = speaker; $('#dialog').dataset.motif = motif;
    $('#dialog').dataset.chapter = this.chapter.id; $('#dialog').classList.toggle('reply', this.dialogueOutro);
    $('#dialog-speaker').textContent = names[speaker];
    $('#dialog-title').textContent = title; $('#dialog-text').textContent = line;
    $('#scene-motif').innerHTML = OrbitaMotifs[motif]; $('#scene-coordinate').textContent = coordinate;
    $('#scene-steps').innerHTML = this.dialogue.map((_, i) => `<i class="${i <= this.dialoguePage ? 'seen' : ''}"></i>`).join('');
    if (!this.preferences.reduced) {
      $('.dialog-copy').getAnimations().forEach(a => a.cancel());
      $('.dialog-copy').animate([{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 320 });
    }
    $('#dialog-page').textContent = `${String(this.dialoguePage + 1).padStart(2, '0')} / ${String(this.dialogue.length).padStart(2, '0')}`;
    $('#dialog-next').innerHTML = this.dialoguePage === this.dialogue.length - 1 ? (this.dialogueOutro ? 'Seguir el viaje <span>→</span>' : 'Interpretar señal <span>↗</span>') : 'Continuar <span>→</span>';
    $('#dialog-next').focus();
  }
  nextDialogue() { this.dialoguePage++; if (this.dialoguePage >= this.dialogue.length) this.finishDialogue(); else this.renderDialogue(); }
  finishDialogue() {
    $('#dialog').hidden = true;
    if (this.dialogueOutro) { if (this.selected < Core.CHAPTERS.length - 1) this.selected++; this.save(); this.home(); }
    else this.start();
  }
  async start() {
    if (this.preparing) return;
    this.preparing = true; this.audio.stop(); this.mode = 'loading';
    $$('.modal-layer').forEach(el => { el.hidden = true; }); $('#loading').hidden = false;
    try {
      if (!window.orbitaStage) throw new Error('El escenario todavía no está listo. Espera un momento y vuelve a intentar.');
      await this.audio.unlock(); await this.audio.prepare(this.chapter, progress => { $('#loading-text').textContent = `Reconstruyendo las dos voces… ${progress}%`; }); await this.audio.unlock();
      this.session = new Core.Session(this.chapter, this.preferences.difficulty, event => this.judge(event));
    this.down.clear(); this.failed = false; this.lastSection = null; this.resumeAnchor = 0; this.audio.play(0, 2); this.mode = 'countdown';
      $('#menu').hidden = true; $('#play').hidden = false; $('#app').classList.add('game-mode'); $('#loading').hidden = true;
      $('#play-chapter').textContent = this.chapter.name.toUpperCase(); $('#connection-label').textContent = this.chapter.place;
      $('#footer-left').textContent = `${Core.DIFFICULTIES[this.preferences.difficulty].name.toUpperCase()} · P / ESC PARA PAUSAR`;
      $('#judgement').style.opacity = '0'; this.renderKeys();
      window.orbitaStage.effects = [];
      if (document.hidden || !document.hasFocus()) this.pause();
    } catch (error) { this.home(); this.notice(error.message || 'No se pudo preparar la canción. Recarga para volver a intentar.'); }
    finally { this.preparing = false; }
  }
  tick() {
    if (this.calibration) this.updateCalibration();
    if (!['playing', 'countdown'].includes(this.mode) || !this.session) return;
    const time = this.songTime();
    if (this.mode === 'countdown') {
      const left = this.resumeAnchor - time;
      $('#countdown').innerHTML = left > 0 ? `${Math.ceil(left)}<small>ENCUENTRA EL PULSO</small>` : '';
      if (left <= 0) {
        this.mode = 'playing'; this.session.resume(time - this.preferences.offset / 1000);
        this.session.notes.filter(n => n.state === 'holding' && this.down.has(n.lane)).forEach(n => { n.down = true; });
      }
    }
    if (this.mode === 'playing') {
      this.session.update(time - this.preferences.offset / 1000);
      if (this.session.health <= 0 && this.preferences.difficulty !== 'story') { this.finish(true); return; }
      if (time >= this.chapter.bars * 4 * 60 / this.chapter.bpm + .6) { this.finish(false); return; }
    }
    const beat = Math.max(0, time) * this.chapter.bpm / 60, section = Core.sectionAt(beat);
    if (section !== this.lastSection) {
      this.lastSection = section;
      $('#play-section').innerHTML = ['Pulso <small>LLAMADA Y RESPUESTA</small>', 'Deriva <small>SOSTÉN EL ENLACE</small>', 'Confluencia <small>LAS DOS VOCES</small>'][section];
    }
    if (performance.now() - this.lastUI < 60) return;
    this.lastUI = performance.now();
    $('#accuracy').innerHTML = `${this.session.accuracy.toFixed(1)}<small>%</small>`; $('#combo').textContent = String(this.session.combo).padStart(3, '0');
    $('#health').style.width = `${this.session.health}%`; $('#health').style.background = this.session.health < 30 ? '#eeb99e' : '#a5f5d2';
    $('#time').textContent = this.formatTime(Math.max(0, this.chapter.bars * 4 * 60 / this.chapter.bpm - time));
    $('#song-progress').style.width = `${clamp(time / (this.chapter.bars * 4 * 60 / this.chapter.bpm) * 100, 0, 100)}%`;
  }
  judge({ note, grade, error }) {
    window.orbitaStage?.hit(note.lane, grade);
    const crew = $(note.lane < 2 ? '.crew-sira' : '.crew-elia');
    crew.classList.toggle('interference', grade === 'miss');
    if (!this.preferences.reduced) { crew.getAnimations().forEach(a => a.cancel()); crew.animate([{ opacity: 1 }, { opacity: .55 }], { duration: 450, fill: 'forwards' }); }
    const label = { perfect: 'EN SINTONÍA', great: 'BUEN ENLACE', good: 'SEÑAL RECIBIDA', miss: 'INTERFERENCIA' }[grade];
    const timing = error === null || Math.abs(error) < .025 ? '' : error < 0 ? 'UN POCO ANTES' : 'UN POCO DESPUÉS';
    const el = $('#judgement'); el.innerHTML = `${label}<small>${timing}</small>`; el.style.color = grade === 'miss' ? '#bac9d3' : note.lane < 2 ? '#a5f5d2' : '#eeb99e';
    el.getAnimations().forEach(a => a.cancel());
    if (this.preferences.reduced) { el.style.opacity = '1'; clearTimeout(this.judgeTimeout); this.judgeTimeout = setTimeout(() => { el.style.opacity = '0'; }, 650); }
    else el.animate([{ opacity: 1, transform: 'translate(-50%,-50%)' }, { opacity: 0, transform: 'translate(-50%,-65%)' }], { duration: 800, fill: 'forwards' });
  }
  pause() {
    if (!['playing', 'countdown'].includes(this.mode)) return;
    this.clearKeys(true); const anchor = this.mode === 'countdown' ? this.resumeAnchor : Math.max(0, this.songTime());
    this.audio.pause(); this.audio.offset = anchor; this.mode = 'paused'; $('#countdown').textContent = ''; $('#pause-menu').hidden = false; $('#resume').focus();
  }
  async resume() {
    if (this.mode !== 'paused') return;
    try { await this.audio.unlock(); this.resumeAnchor = this.audio.offset; this.audio.play(this.resumeAnchor, 2); this.mode = 'countdown'; $('#pause-menu').hidden = true; this.down.clear(); this.renderKeys(); }
    catch { this.notice('Pulsa Continuar para activar el audio.'); }
  }
  finish(failed) {
    this.failed = failed; this.audio.stop(); this.mode = 'results'; this.clearKeys(); $('#countdown').textContent = '';
    $('#results').hidden = false; $('#results-kicker').textContent = failed ? 'EL ENLACE SE DEBILITÓ' : 'ENLACE RESTAURADO';
    $('#results-title').textContent = failed ? 'La señal sigue ahí.' : 'Una voz encontró la otra.';
    $('#results-subtitle').textContent = failed ? 'Vuelve a intentarlo o elige Historia para escuchar el viaje con calma.' : 'La conversación puede continuar.';
    $('#rank').textContent = failed ? '↻' : this.session.rank; $('#result-accuracy').textContent = `${this.session.accuracy.toFixed(1)}%`; $('#result-combo').textContent = this.session.bestCombo; $('#result-misses').textContent = this.session.counts.miss;
    this.session.hands.forEach((hand, i) => { $(i ? '#result-right' : '#result-left').textContent = `${i ? 'RESPUESTA' : 'LLAMADA'} · ${hand.total ? (hand.earned / hand.total * 100).toFixed(1) : '0.0'}%`; });
    const errors = this.session.errors, average = errors.length ? errors.reduce((sum, error) => sum + error, 0) / errors.length * 1000 : 0;
    $('#timing-tip').textContent = errors.length ? `Tendencia de tus golpes: ${Math.abs(average).toFixed(0)} ms ${average < 0 ? 'antes' : 'después'}. Puedes probar la sincronización en Ajustes.` : 'Escucha el pulso y prueba Historia para aprender las dos voces.';
    $('#result-next').innerHTML = failed ? 'Reintentar enlace <span>↗</span>' : 'Escuchar la respuesta <span>→</span>';
    if (!failed) { const data = this.progress[this.chapter.id] || {}; data.complete = true; data[this.preferences.difficulty] = Math.max(Number(data[this.preferences.difficulty]) || 0, this.session.accuracy); this.progress[this.chapter.id] = data; this.save(); }
    $('#result-next').focus();
  }
  formatTime(seconds) { const n = Math.ceil(seconds); return `${String(Math.floor(n / 60)).padStart(2, '0')}:${String(n % 60).padStart(2, '0')}`; }
  notice(text) { clearTimeout(this.noticeTimer); $('#notice').textContent = text; $('#notice').hidden = false; this.noticeTimer = setTimeout(() => { $('#notice').hidden = true; }, 5500); }
  async startCalibration() {
    if (this.calibration) return;
    try {
      await this.audio.unlock(); $('#calibration').hidden = false; $('#calibrate').disabled = true;
      this.calibration = { next: this.audio.ctx.currentTime + .3, clicks: [], samples: [], shown: -1 };
      $('#calibration-status').textContent = 'Escucha cuatro pulsos. Después pulsa ESPACIO con cada clic.';
      this.calibrationTimer = setInterval(() => {
        const c = this.calibration; if (!c) return;
        while (c.next < this.audio.ctx.currentTime + .12) { this.audio.click(c.clicks.length % 4 === 0, c.next); c.clicks.push(c.next); c.next += .5; }
        if (c.clicks.length >= 28) this.stopCalibration(true);
      }, 25);
    } catch { this.notice('No se pudo activar el audio. Vuelve a pulsar la prueba.'); }
  }
  updateCalibration() {
    const c = this.calibration, index = c.clicks.filter(time => time <= this.audio.ctx.currentTime).length - 1;
    if (index !== c.shown) { c.shown = index; const pulse = $('#calibration-pulse'); pulse.getAnimations().forEach(a => a.cancel()); pulse.animate([{ opacity: 1, transform: 'scale(1.4)' }, { opacity: .25, transform: 'scale(1)' }], { duration: 250 }); }
  }
  calibrationTap() {
    const c = this.calibration; if (c.clicks.length < 4) return;
    const now = this.audio.ctx.currentTime, closest = c.clicks.reduce((best, time) => Math.abs(time - now) < Math.abs(best - now) ? time : best, c.clicks[0]);
    if (Math.abs(now - closest) > .24 || c.last === closest) return;
    c.last = closest; c.samples.push((now - closest) * 1000); $('#calibration-status').textContent = `${c.samples.length} / 12 golpes medidos. Sigue el pulso con ESPACIO.`;
    if (c.samples.length >= 12) this.stopCalibration(true);
  }
  stopCalibration(apply = false) {
    if (!this.calibration) return;
    if (apply && this.calibration.samples.length >= 4) {
      const sorted = this.calibration.samples.toSorted((a, b) => a - b), n = sorted.length;
      const median = n % 2 ? sorted[(n - 1) / 2] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
      this.preferences.offset = clamp(Math.round(median / 5) * 5, -250, 250); this.save(); this.renderPreferences(); this.notice(`Sincronización ajustada: ${this.preferences.offset > 0 ? '+' : ''}${this.preferences.offset} ms.`);
    } else if (apply) this.notice('Faltaron golpes para medir. Puedes repetir la prueba.');
    clearInterval(this.calibrationTimer); this.calibration = null; $('#calibration').hidden = true; $('#calibrate').disabled = false;
  }
}
try {
  window.gameApp = new Contrapunto();
  new Phaser.Game({ type: Phaser.AUTO, parent: 'space', backgroundColor: '#080f19', scale: { mode: Phaser.Scale.RESIZE, width: window.innerWidth, height: window.innerHeight }, render: { antialias: true }, scene: OrbitaStage });
} catch (error) { $('#notice').hidden = false; $('#notice').textContent = 'No se pudo iniciar la Nomad. Recarga la página y comprueba que los archivos del proyecto estén completos.'; console.error(error); }
