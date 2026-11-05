/* Núcleo de ritmo independiente del dibujo y del navegador. */
(function (root) {
  'use strict';
  const CHAPTERS = [
    { id: 'faro', name: 'Faro dormido', number: '01', place: 'FARO 07 · AURORA', bpm: 120, root: 45, bars: 36, color: 0xa5f5d2,
      subtitle: 'Alguien sigue escuchando.', description: 'Una señal lleva años repitiéndose. Dale una respuesta.',
      speaker: 'SIRA · OPERADORA DEL FARO', intro: ['Aquí Faro 07. Si alguien recibe esto… la luz sigue encendida.', 'Guardé una melodía para mi hija. La enviaba cada noche, antes de que la red cayera.', 'Nomad, tú llevas la llamada. Quizá al otro lado todavía quede alguien que pueda responder.'],
      outro: ['He oído las primeras notas. Son las que mi madre tocaba en el taller.', 'Mi nombre es Elia. Ya no vivo donde ella recuerda. Pero sigo aquí.', 'Dile que tengo una respuesta. Y que esta vez la voy a tocar yo.'] },
    { id: 'sira', name: 'La respuesta pendiente', number: '02', place: 'TALLER DE ELIA · DOS ORILLAS', bpm: 128, root: 48, bars: 36, color: 0xeeb99e,
      subtitle: 'La misma canción. Otra vida.', description: 'Una guitarra responde al viejo pulso de un taller.',
      speaker: 'ELIA · COLONIA DEL UMBRAL', intro: ['Han pasado diecisiete años. Mi madre quizá sigue esperando una voz de niña.', 'Aprendí a tocar con una guitarra que construí aquí. La melodía es la suya… pero ahora también es mía.', 'Lleva las dos partes juntas, Nomad. Quiero que escuche en quién me convertí.'],
      outro: ['Esa guitarra… Elia, ¿la construiste tú?', 'Y el taller, mamá. Construí mi propio taller.', 'Entonces cuéntamelo todo. Tenemos mucho que escuchar.'] },
    { id: 'storm', name: 'Mar de estática', number: '03', place: 'CORREDOR CERO · LA INTERFERENCIA', bpm: 140, root: 45, bars: 40, color: 0xb6b3f4,
      subtitle: 'Dos voces pueden abrir un camino.', description: 'Cruza la tormenta y devuelve la conversación a la red.',
      speaker: 'NOMAD · ÚLTIMO ENLACE', intro: ['El corredor está cerrándose. Solo queda un faro antes del otro lado.', 'Sira envía su pulso. Elia, su respuesta. Ninguna de las dos puede cruzarlo sola.', 'Mantén las dos voces. Cuando la estática suba, recuerda dónde comenzó la canción.'],
      outro: ['Aquí Faro 07. Enlace restaurado.', 'Mamá, no hace falta que vuelvas a empezar la canción.', 'Lo sé. Ahora te estoy escuchando.', 'NOMAD · Una señal nueva acaba de llegar. Hay más conversaciones esperando.'] }
  ];
  const DIFFICULTIES = { story: { name: 'Historia', window: .19, perfect: .075, great: .13, damage: 0 }, normal: { name: 'Normal', window: .145, perfect: .045, great: .09, damage: 5 }, expert: { name: 'Experto', window: .115, perfect: .035, great: .07, damage: 7 } };
  function sectionAt(beat) { return beat < 40 ? 0 : beat < 88 ? 1 : 2; }
  function compose(chapter) {
    const events = [], motif = [0, 7, 12, 10, 7, 3, 5, 7];
    const total = chapter.bars * 4;
    for (let b = 8; b < total - 8; b += 2) {
      const section = sectionAt(b), phrase = Math.floor(b / 8), hand = (phrase - 1) % 2;
      const lane = hand * 2 + ((b / 2 + phrase) % 2);
      const interval = motif[(b / 2) % 8];
      const duration = section === 1 && b % 8 === 0 ? 3.5 : .55;
      events.push({ beat: b, lane, midi: chapter.root + (hand ? 24 : 12) + interval, duration, level: 0 });
      if (duration > 1) events.push({ beat: b + 1, lane: (1 - hand) * 2 + (phrase % 2), midi: chapter.root + (hand ? 12 : 24) + 7, duration: .6, level: 0 });
      if (section >= 1 && b % 4 === 2) events.push({ beat: b + 1, lane: (1 - hand) * 2 + (phrase % 2), midi: chapter.root + (hand ? 12 : 24) + motif[(b / 2 + 2) % 8], duration: .5, level: 1 });
      if (section === 2 && b % 4 === 0) events.push({ beat: b, lane: (1 - hand) * 2 + ((phrase + 1) % 2), midi: chapter.root + (hand ? 12 : 24) + 7, duration: .65, level: 1 });
      if (section === 2 && b % 4 === 2) events.push({ beat: b + .5, lane: hand * 2 + (1 - lane % 2), midi: chapter.root + (hand ? 24 : 12) + motif[(b / 2 + 3) % 8], duration: .35, level: 2 });
    }
    return events.sort((a, b) => a.beat - b.beat || a.lane - b.lane);
  }
  function buildChart(chapter, difficulty = 'normal', fromBeat = 0) {
    const step = 60 / chapter.bpm, level = difficulty === 'story' ? 0 : difficulty === 'expert' ? 2 : 1;
    const notes = compose(chapter).filter(e => e.level <= level && e.beat >= fromBeat).map((e, i) => ({ id: i, lane: e.lane, time: e.beat * step, end: (e.beat + (e.duration > 1 ? e.duration : 0)) * step, state: 'pending', down: false, grace: 0, beat: e.beat }));
    // Evitar exigir otra nota del mismo canal mientras se mantiene un sostenido.
    const ends = [0, 0, 0, 0];
    return notes.filter(note => { if (note.time < ends[note.lane] + .08) return false; ends[note.lane] = note.end; return true; });
  }
  class Session {
    constructor(chapter, difficulty, onJudge = () => {}, fromBeat = 0) {
      this.chapter = chapter; this.difficulty = difficulty; this.rules = DIFFICULTIES[difficulty]; this.notes = buildChart(chapter, difficulty, fromBeat);
      this.onJudge = onJudge; this.combo = 0; this.bestCombo = 0; this.health = 80; this.earned = 0; this.judged = 0; this.ghosts = 0;
      this.counts = { perfect: 0, great: 0, good: 0, miss: 0 }; this.errors = []; this.hands = [{ earned: 0, total: 0 }, { earned: 0, total: 0 }];
      this.total = this.notes.reduce((sum, n) => sum + 1 + Number(n.end > n.time), 0);
    }
    judge(note, grade, error = null) {
      const value = { perfect: 1, great: .75, good: .4, miss: 0 }[grade];
      this.earned += value; this.judged++; this.counts[grade]++;
      this.hands[Math.floor(note.lane / 2)].earned += value; this.hands[Math.floor(note.lane / 2)].total++;
      if (grade === 'miss') { this.combo = 0; this.health = Math.max(0, this.health - this.rules.damage); }
      else { this.combo++; this.bestCombo = Math.max(this.bestCombo, this.combo); this.health = Math.min(100, this.health + .8); if (error !== null) this.errors.push(error); }
      this.onJudge({ note, grade, error, combo: this.combo });
    }
    press(lane, time) {
      const holding = this.notes.find(n => n.lane === lane && n.state === 'holding');
      if (holding) { holding.down = true; return 'resume'; }
      const note = this.notes.find(n => n.lane === lane && n.state === 'pending' && Math.abs(n.time - time) <= this.rules.window);
      if (!note) { this.ghosts++; this.health = Math.max(0, this.health - this.rules.damage * .18); return 'empty'; }
      const error = time - note.time, abs = Math.abs(error);
      this.judge(note, abs <= this.rules.perfect ? 'perfect' : abs <= this.rules.great ? 'great' : 'good', error);
      note.state = note.end > note.time ? 'holding' : 'done'; note.down = true; return 'hit';
    }
    release(lane, time, paused = false) {
      const note = this.notes.find(n => n.lane === lane && n.state === 'holding');
      if (!note) return;
      note.down = false;
      if (paused) { note.grace = Infinity; return; }
      this.judge(note, time >= note.end - this.rules.great ? 'perfect' : 'miss'); note.state = 'done';
    }
    resume(time) { this.notes.filter(n => n.state === 'holding').forEach(n => { n.grace = time + .4; }); }
    update(time) {
      for (const note of this.notes) {
        if (note.state === 'pending' && time > note.time + this.rules.window) {
          this.judge(note, 'miss'); if (note.end > note.time) this.judge(note, 'miss'); note.state = 'done';
        } else if (note.state === 'holding') {
          if (!note.down && time > note.grace) { this.judge(note, 'miss'); note.state = 'done'; }
          else if (time >= note.end) { this.judge(note, note.down ? 'perfect' : 'miss'); note.state = 'done'; }
        }
      }
    }
    get accuracy() { return this.judged ? this.earned / (this.judged + this.ghosts * .2) * 100 : 100; }
    get rank() { return this.accuracy >= 97 ? 'S' : this.accuracy >= 90 ? 'A' : this.accuracy >= 78 ? 'B' : this.accuracy >= 60 ? 'C' : 'D'; }
  }
  const api = { CHAPTERS, DIFFICULTIES, compose, buildChart, sectionAt, Session };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.OrbitaCore = api;
})(globalThis);
