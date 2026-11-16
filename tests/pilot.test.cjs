const {test}=require('node:test'),assert=require('node:assert/strict');
const {compose}=require('../src/pilot-score.js'),source=require('../assets/charts/source/altale-attacks.json'),published=require('../assets/charts/altale.json');
test('Aurora conserva ataques y colas del audio completo y permite regenerar el piloto',()=>{
  for(const difficulty of ['easy','medium','hard']){
    const map=compose(source,difficulty);assert.deepEqual(map,published[difficulty]);assert.equal(map.duration,source.duration);assert.deepEqual(map.boss,source.boss);assert.deepEqual(map.moving,source.moving);
    const onsets=new Set([...source.notes,...source.sustains].map(n=>n.time));assert.ok(map.notes.every(n=>onsets.has(n.time)));assert.equal(map.notes.filter(n=>n.end>n.time).length,2);
    assert.ok(map.notes.some(n=>n.action===0)&&map.notes.some(n=>n.action===1));
  }
});
test('Fácil usa frases cortas y descansos; la densidad sube sin acelerar la canción',()=>{
  const easy=compose(source,'easy'),medium=compose(source,'medium'),hard=compose(source,'hard');
  assert.ok(easy.phrases.every(p=>p.notes<=4));for(let i=1;i<easy.phrases.length;i++)assert.ok(easy.phrases[i].from-easy.phrases[i-1].to>=1.64);
  assert.ok(easy.notes.length<medium.notes.length&&medium.notes.length<hard.notes.length);
  assert.equal(easy.notes.filter(n=>n.kind==='projectile').length,6);assert.equal(hard.notes.filter(n=>n.kind==='projectile').length,10);
});
test('Recuperar un sostenido justo al pausar no vuelve a puntuar su inicio',()=>{
  const O=require('../src/core.js'),s=new O.Session(O.LEVELS[0],'easy',()=>{},{duration:5,notes:[{action:0,time:1,end:3,state:'pending'}]});
  s.press(0,1);s.release(0,1,true);s.resume(1);assert.equal(s.press(0,1),'resume');assert.equal(s.judged,1);s.update(3);assert.equal(s.counts.perfect,2);
});
