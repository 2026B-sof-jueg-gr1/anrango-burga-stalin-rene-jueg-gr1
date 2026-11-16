const{test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const E=require('../src/worlds.js'),C=require('../src/comic.js'),Input=require('../src/input.js');
test('Cada destino tiene fondo, portada, dos criaturas, guardián y capítulo propios',()=>{
 assert.equal(new Set(E.WORLDS.map(w=>w.id)).size,E.WORLDS.length);assert.ok(E.WORLDS.length>=8);
 const backgrounds=new Set(),covers=new Set(),creatures=new Set(),guardians=new Set();
 for(const w of E.WORLDS){for(const field of ['name','subtitle','discovery','ground','air','boss','effect','ambience','token'])assert.ok(w[field]?.length>2);assert.equal(w.palette.length,5);assert.ok(C.PAGES.some(p=>p.id===w.chapterId&&p.world===w.id));
  backgrounds.add(w.background);covers.add(w.coverSheet+':'+w.coverIndex);creatures.add(w.creatureSheet+':'+w.creatureRow);guardians.add(w.bossSheet+':'+w.bossRow);
  for(const resource of [w.background,w.coverSheet,w.creatureSheet,w.bossSheet,C.page(w.chapterId).art]){const file=path.join(__dirname,'..',resource);assert.ok(fs.existsSync(file),resource);assert.ok(fs.statSync(file).size>10000,resource);}
 }
 for(const set of [backgrounds,covers,creatures,guardians])assert.equal(set.size,E.WORLDS.length);
});
test('La expedición comparte destinos entre Pulso y Vector y conserva sus controles',()=>{
 assert.deepEqual(E.MODES.map(m=>m.name),['Pulso','Vector']);const pulso=new Input.Controller(E.MODES[0].id),vector=new Input.Controller(E.MODES[1].id);
 assert.equal(pulso.actionFor('KeyF'),0);assert.equal(pulso.actionFor('KeyJ'),1);vector.move(10,720);assert.equal(vector.actionFor('KeyZ'),1);assert.equal(vector.actionFor('KeyX'),1);assert.equal(pulso.actionFor('KeyZ'),null);
});
test('La historia completa tiene diálogos legibles y capítulos extensibles',()=>{
 assert.equal(C.PAGES[0].id,'prologue');assert.equal(C.PAGES.length,E.WORLDS.length+1);assert.equal(new Set(C.PAGES.map(p=>p.id)).size,C.PAGES.length);
 for(const p of C.PAGES){assert.equal(p.panels.length,4);for(const panel of p.panels){assert.ok(panel.text.length>10&&panel.text.length<120);assert.ok(panel.speaker);assert.ok(['left','right'].includes(panel.side));}}
 const last=C.PAGES.at(-1);assert.ok(last.panels.some(p=>p.text.includes('muchas voces')));
});
test('La entrada de producción es silenciosa y no carga el reproductor anterior',()=>{
 const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');assert.ok(html.includes('src/expedition.js'));assert.ok(!html.includes('src/audio.js'));assert.ok(!html.includes('src/tracks.js'));assert.ok(!html.includes('src/pilot.js'));
 for(const file of ['src/expedition.js','src/expedition-scene.js'])assert.ok(!/new\s+(?:window\.)?(?:Audio|AudioContext)|\.mp3|createOscillator/.test(fs.readFileSync(path.join(__dirname,'..',file),'utf8')));
});
test('Los recortes usan las dimensiones reales de los PNG, incluso con celdas rectangulares',()=>{
 const sizes=require('../src/art-sizes.js');assert.equal(Object.keys(sizes).length,28);
 for(const [file,size]of Object.entries(sizes)){const bytes=fs.readFileSync(path.join(__dirname,'..',file));assert.equal(size.width,bytes.readUInt32BE(16));assert.equal(size.height,bytes.readUInt32BE(20));assert.ok(size.width>600&&size.height>600);}
});
