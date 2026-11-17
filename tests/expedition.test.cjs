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
test('Solo existe Pulso con F/J; las tres dificultades comparten los ocho destinos',()=>{
 assert.deepEqual(E.MODES.map(m=>m.name),['Pulso']);const pulso=new Input.Controller('keyboard');
 assert.equal(pulso.actionFor('KeyF'),0);assert.equal(pulso.actionFor('KeyJ'),1);assert.equal(pulso.actionFor('KeyZ'),null);
 assert.deepEqual(E.DIFFICULTIES.map(d=>d.name),['Fácil','Medio','Difícil']);
 for(let i=1;i<E.DIFFICULTIES.length;i++){const a=E.DIFFICULTIES[i-1],b=E.DIFFICULTIES[i];assert.ok(b.speed>a.speed&&b.hits>a.hits&&b.returns>a.returns&&b.spawn<a.spawn);}
});
test('Un recuerdo exige completar ambos objetivos y terminar; abrirlo no concede progreso',()=>{
 const rule=E.DIFFICULTIES[0],enough={hits:rule.hits,returns:rule.returns,elapsed:rule.duration};
 assert.ok(E.evaluateRun(enough,rule));for(const stats of [{...enough,hits:0},{...enough,returns:0},{...enough,elapsed:1},{...enough,hits:NaN}])assert.equal(E.evaluateRun(stats,rule),false);
 assert.equal(E.unlockedPages([]).size,0);assert.equal(E.unlockedPages(['prologue','aurora:impossible','io']).size,0);
 assert.deepEqual([...E.unlockedPages(['aurora:easy','aurora:hard'])],['prologue','chapter-aurora']);
 assert.equal(E.unlockedPages(E.WORLDS.map(w=>w.id+':normal')).size,C.PAGES.length);
});
test('Las tres dificultades se pueden completar con entradas reales en varios tamaños de pantalla',()=>{
 const vm=require('node:vm'),context={Phaser:{Scene:class{}},app:{finishRun(){}},window:{}};
 vm.createContext(context);vm.runInContext(fs.readFileSync(path.join(__dirname,'../src/expedition-scene.js'),'utf8')+'\nthis.SceneUnderTest=ExpeditionScene;',context);
 for(const width of [900,1280,2400])for(const rule of E.DIFFICULTIES){let finished;context.app.finishRun=stats=>finished=stats;const s=new context.SceneUnderTest();s.textures={get:()=>({getSourceImage:()=>({})})};s.enter(E.WORLDS[0],rule);s.worldW=width;s.hitX=width*.25;
  s.bossActive=true;s.strike(0);assert.equal(s.stats.returns,0);assert.equal(s.stats.hits,0);
  while(!s.finished){for(const lane of [0,1])if(s.objects.some(o=>!o.done&&o.lane===lane&&Math.abs(o.x-s.hitX)<10))s.strike(lane);s.simulate(1/60);}
  assert.ok(E.evaluateRun(finished,rule),width+'/'+rule.id);
 }
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
