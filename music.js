/* Música original, sintetizada a un búfer estéreo antes de jugar.
 * Las notas del mapa y las voces de la canción comparten la misma partitura.
 * El reloj de AudioContext gobierna la reproducción y los juicios.
 */
'use strict';
class OrbitaAudio {
  constructor() { this.cache = new Map(); this.ctx = null; this.source = null; this.offset = 0; this.started = 0; this.running = false; this.volume = .65; }
  async unlock() {
    this.ctx ??= new (window.AudioContext || window.webkitAudioContext)({ latencyHint: 'interactive' });
    this.master ??= this.ctx.createGain(); this.master.gain.value = this.volume;
    if (!this.connected) { this.master.connect(this.ctx.destination); this.connected = true; }
    await this.ctx.resume();
  }
  setVolume(value) { this.volume = value; if (this.master) this.master.gain.setTargetAtTime(value, this.ctx.currentTime, .03); }
  async prepare(chapter, onProgress = () => {}) {
    if (this.cache.has(chapter.id)) { this.buffer = this.cache.get(chapter.id); return; }
    const rate = 22050, duration = chapter.bars * 4 * 60 / chapter.bpm + 3;
    const buffer = this.ctx.createBuffer(2, Math.ceil(rate * duration), rate), left = buffer.getChannelData(0), right = buffer.getChannelData(1);
    let seed = 1337; const rand = () => { seed = seed * 16807 % 2147483647; return seed / 2147483647; };
    const step = 60 / chapter.bpm, hz = midi => 440 * 2 ** ((midi - 69) / 12), waves = new Map();
    const mix = (time, wave, volume, pan = 0) => {
      const start = Math.round(time * rate), gl = volume * Math.sqrt((1 - pan) / 2), gr = volume * Math.sqrt((1 + pan) / 2);
      const end = Math.min(wave.length, left.length - start);
      for (let i = 0; i < end; i++) { left[start + i] += wave[i] * gl; right[start + i] += wave[i] * gr; }
    };
    function wave(type, midi, length) {
      const key = `${type}:${midi}:${length.toFixed(3)}`;
      if (waves.has(key)) return waves.get(key);
      const data = new Float32Array(Math.ceil(rate * length)), frequency = hz(midi);
      if (type === 'guitar' || type === 'drive') {
        // Cuerda pulsada Karplus–Strong: excitación breve y pérdida de energía.
        const period = Math.max(2, Math.round(rate / frequency)), line = Float32Array.from({ length: period }, () => rand() * 2 - 1);
        for (let i = 0; i < data.length; i++) { const pos = i % period; const v = (line[pos] + line[(pos + 1) % period]) * .4985; line[pos] = v; const env = Math.min(1, i / 40) * Math.min(1, (data.length - i) / 300) * Math.exp(-i / (rate * .9)); data[i] = (type === 'drive' ? Math.tanh(v * 5) * .65 : v) * env; }
      } else {
        let phase = 0, previousNoise = 0;
        for (let i = 0; i < data.length; i++) {
          const t = i / rate, tail = Math.min(1, (data.length - i) / 250);
          if (type === 'kick') { phase += 2 * Math.PI * (42 + 110 * Math.exp(-t * 32)) / rate; data[i] = Math.sin(phase) * Math.exp(-t * 18) * tail; }
          else if (type === 'snare' || type === 'hat') { const noise = rand() * 2 - 1; data[i] = ((noise - previousNoise * .8) * (type === 'snare' ? .7 : .5) + (type === 'snare' ? Math.sin(t * Math.PI * 370) * .3 : 0)) * Math.exp(-t * (type === 'snare' ? 25 : 90)) * tail; previousNoise = noise; }
          else {
            phase = t * 2 * Math.PI * frequency;
            const env = type === 'pad' ? Math.min(1, t / .2) * Math.min(1, (length - t) / .9) : Math.min(1, t / .008) * Math.exp(-t * 5) * tail;
            data[i] = (Math.sin(phase) + Math.sin(phase * 2.003) * .18 + Math.sin(phase * 3) * (type === 'bass' ? .28 : .09)) * env * .7;
          }
        }
      }
      waves.set(key, data); return data;
    }
    const roots = [chapter.root, chapter.root - 5, chapter.root - 2, chapter.root - 7];
    for (let bar = 0; bar < chapter.bars; bar++) {
      const beat = bar * 4, time = beat * step, root = roots[Math.floor(bar / 2) % 4], section = OrbitaCore.sectionAt(beat);
      [0, 7, 12, 15].forEach((interval, i) => mix(time, wave('pad', root + 12 + interval, step * 5), .055, i % 2 ? .65 : -.65));
      if (beat >= 8 && beat < chapter.bars * 4 - 8) for (let n = 0; n < 4; n++) {
        const t = (beat + n) * step;
        mix(t, wave('bass', root + (n % 2 ? 12 : 0), step * .8), .27);
        if (section >= 1 || n % 2 === 0) mix(t, wave(n % 2 ? 'snare' : 'kick', 0, n % 2 ? .22 : .35), section === 2 ? .55 : .38);
        if (section >= 1) { mix(t, wave('hat', 0, .08), .13, -.2); mix(t + step / 2, wave('hat', 0, .08), .085, .2); }
        if (section === 2) { mix(t, wave('drive', root + 12, step * .9), .45, -.45); mix(t + .012, wave('drive', root + 19, step * .9), .30, .45); }
      }
      if (bar % 6 === 0) { onProgress(Math.round(bar / chapter.bars * 65)); await new Promise(resolve => setTimeout(resolve, 0)); }
    }
    for (const event of OrbitaCore.compose(chapter)) {
      const time = event.beat * step, length = Math.max(.5, event.duration * step + .15), rightHand = event.lane >= 2;
      const type = rightHand ? CoreSection(event.beat) === 2 ? 'drive' : 'guitar' : 'bell';
      mix(time, wave(type, event.midi, length), rightHand ? .85 : .27, rightHand ? .3 : -.3);
      mix(time + step * .75, wave('bell', event.midi + 12, .4), .04, rightHand ? -.5 : .5);
    }
    let peak = 0;
    for (let i = 0; i < left.length; i++) peak = Math.max(peak, Math.abs(left[i]), Math.abs(right[i]));
    const gain = .85 / Math.max(1, peak);
    for (let i = 0; i < left.length; i++) { left[i] *= gain; right[i] *= gain; }
    onProgress(100); this.buffer = buffer; this.cache.set(chapter.id, buffer);
    function CoreSection(beat) { return OrbitaCore.sectionAt(beat); }
  }
  play(offset = 0, countdown = 2) {
    this.stop(); this.offset = offset; this.started = this.ctx.currentTime + countdown;
    this.source = this.ctx.createBufferSource(); this.source.buffer = this.buffer; this.source.connect(this.master); this.source.start(this.started, Math.max(0, offset)); this.running = true;
  }
  get time() { return this.running ? this.offset + this.ctx.currentTime - this.started : this.offset; }
  pause() { const time = Math.max(0, this.time); this.stop(); this.offset = time; return time; }
  stop() { if (this.source) { try { this.source.stop(); } catch {} this.source.disconnect(); this.source = null; } this.running = false; }
  click(accent = false, when = null) {
    if (!this.ctx || this.ctx.state !== 'running') return;
    const o = this.ctx.createOscillator(), g = this.ctx.createGain(), t = when ?? this.ctx.currentTime;
    o.frequency.value = accent ? 1000 : 700; g.gain.setValueAtTime(.09, t); g.gain.exponentialRampToValueAtTime(.0001, t + .055); o.connect(g); g.connect(this.master); o.start(t); o.stop(t + .06);
  }
}
