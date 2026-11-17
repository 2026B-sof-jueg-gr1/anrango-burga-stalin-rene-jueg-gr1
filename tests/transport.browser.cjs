/* Fixtures del último medio segundo para comprobar EOF con calibración y cancelación. */
const{chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_EXECUTABLE||'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--mute-audio']});try{
 const p=await browser.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto(process.env.ORBITA_TEST_URL||'http://127.0.0.1:4175');await p.waitForFunction(()=>window.expeditionScene);await p.evaluate(()=>app.go('detail'));await p.locator('[data-action=launch]').click();await p.waitForFunction(()=>app.state==='explore',null,{timeout:60000});
 for(const offset of [-150,150]){
  await p.evaluate(offset=>{
   app.sound.stop();app.settings.offsetMs=offset;app.applyAudio();const s=new OrbitRhythm.Session(app.sound.pack.difficulties.easy,'easy');for(const n of s.notes)n.state='done';for(const b of s.bosses){b.won=true;b.done=true;}s.judged=s.notes.length;s.earned=s.judged;s.counts.perfect=s.judged;s.time=s.duration-1;app.session=s;app.scene.enter(app.world,s);app.resumeAt=s.duration-.4-offset/1000;app.phase='countdown';app.sound.start(s.duration-.4,.1);app.state='explore';app.render();
  },offset);
  if(offset<0){await p.waitForFunction(()=>app.sound.audioTimeAt()>=app.session.duration-.1);assert.equal(await p.evaluate(()=>app.state),'explore','El ajuste negativo no debe recortar el audio');}
  await p.waitForFunction(()=>app.state==='result',null,{timeout:3000});assert.equal(await p.evaluate(()=>app.result.cleared),true);assert.ok(await p.evaluate(()=>app.result.elapsed>=app.sound.buffer.duration));
 }
 await p.route('**/music/aurora.mp3',async route=>{await new Promise(r=>setTimeout(r,700));try{await route.continue()}catch{}});await p.evaluate(()=>{app.sound.cache.clear();app.go('detail')});await p.locator('[data-action=launch]').click();await p.waitForFunction(()=>app.state==='loading');await p.keyboard.press('Escape');await p.waitForTimeout(1000);assert.equal(await p.evaluate(()=>app.state),'detail');assert.equal(await p.evaluate(()=>app.sound.playing),false);assert.equal(await p.evaluate(()=>app.sound.source),null);assert.deepEqual(errors,[]);console.log('PASS: el ajuste positivo/negativo conserva el final real del audio y cancelar la carga no reproduce una fuente tardía.');
 }finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
