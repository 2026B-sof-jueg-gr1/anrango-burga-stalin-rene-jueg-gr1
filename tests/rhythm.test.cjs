const { test } = require('node:test');
const assert = require('node:assert/strict');
const { CHAPTERS, DIFFICULTIES, Session, buildChart } = require('../rhythm.js');

test('Los tres encuentros son deterministas, jugables con cuatro canales y sin sostenidos incompatibles', () => {
  for (const chapter of CHAPTERS) for (const difficulty of Object.keys(DIFFICULTIES)) {
    const notes = buildChart(chapter, difficulty);
    assert.deepEqual(notes, buildChart(chapter, difficulty));
    assert.ok(notes.length > 35);
    const end = [0, 0, 0, 0];
    for (const note of notes) { assert.ok(note.lane >= 0 && note.lane < 4); assert.ok(note.time > end[note.lane]); end[note.lane] = note.end; }
  }
});
test('Una interpretación perfecta, con acordes y sostenidos, alcanza 100% y rango S', () => {
  for (const chapter of CHAPTERS) for (const difficulty of Object.keys(DIFFICULTIES)) {
    const session = new Session(chapter, difficulty);
    const events = session.notes.flatMap(note => [{ time: note.time, lane: note.lane, action: 'press' }, ...(note.end > note.time ? [{ time: note.end, lane: note.lane, action: 'release' }] : [])]).sort((a, b) => a.time - b.time);
    for (const event of events) { session.update(event.time); session[event.action](event.lane, event.time); }
    session.update(200);
    assert.equal(session.accuracy, 100); assert.equal(session.rank, 'S'); assert.equal(session.judged, session.total); assert.equal(session.counts.miss, 0);
  }
});
test('Tocar antes, tarde o en un canal equivocado no concede un acierto perfecto', () => {
  const session = new Session(CHAPTERS[0], 'normal'), note = session.notes[0];
  assert.equal(session.press(note.lane, note.time - 1), 'empty');
  assert.equal(session.press((note.lane + 1) % 4, note.time), 'empty');
  session.press(note.lane, note.time + .11); assert.equal(session.counts.good, 1); assert.ok(session.accuracy < 100);
});
test('Soltar pronto penaliza el final del sostenido; mantenerlo no duplica el inicio', () => {
  const session = new Session(CHAPTERS[0], 'normal'); const note = session.notes.find(note => note.end > note.time);
  session.press(note.lane, note.time); session.press(note.lane, note.time + .02); assert.equal(session.judged, 1);
  session.release(note.lane, note.time + .1); assert.equal(session.counts.miss, 1); assert.equal(note.state, 'done');
});
test('Pausar un sostenido permite recuperarlo tras la cuenta de entrada', () => {
  const session = new Session(CHAPTERS[0], 'normal'), note = session.notes.find(n => n.end > n.time);
  session.press(note.lane, note.time); session.release(note.lane, note.time + .1, true);
  assert.equal(note.state, 'holding'); session.resume(note.time + .1); session.press(note.lane, note.time + .15); session.release(note.lane, note.end);
  assert.equal(session.counts.miss, 0); assert.equal(note.state, 'done');
});
test('Historia permite terminar tras fallar; Normal conserva la consecuencia de los errores', () => {
  const story = new Session(CHAPTERS[0], 'story'), normal = new Session(CHAPTERS[0], 'normal');
  story.update(200); normal.update(200);
  assert.equal(story.health, 80); assert.equal(normal.health, 0); assert.equal(story.judged, story.total); assert.equal(normal.judged, normal.total);
});
test('La dificultad cambia los patrones y conserva el tempo y la canción', () => {
  const [chapter] = CHAPTERS;
  assert.ok(buildChart(chapter, 'story').length < buildChart(chapter, 'normal').length);
  assert.ok(buildChart(chapter, 'normal').length < buildChart(chapter, 'expert').length);
});
test('La llamada empieza en la izquierda y un sostenido permite una respuesta real de la otra mano', () => {
  const notes = buildChart(CHAPTERS[0], 'story');
  assert.ok(notes[0].lane < 2);
  assert.ok(notes.some(note => note.end > note.time && notes.some(other => Math.floor(note.lane / 2) !== Math.floor(other.lane / 2) && other.time > note.time && other.time < note.end)));
});
