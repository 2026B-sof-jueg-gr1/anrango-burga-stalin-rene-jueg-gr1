const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 fs.mkdirSync('tmp',{recursive:true});
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_EXECUTABLE||'C:/Program Files/Google/Chrome/Application/chrome.exe'});
 try{
  const p=await browser.newPage({viewport:{width:1600,height:900}}),errors=[],bad=[],audio=[];
  p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.status()>=400)bad.push(r.status()+' '+r.url())});p.on('request',r=>{if(/\.(mp3|ogg|wav)(?:\?|$)/.test(r.url()))audio.push(r.url())});
  await p.addInitScript(()=>{window.audioAttempts=0;window.AudioContext=window.webkitAudioContext=window.Audio=function(){window.audioAttempts++;throw Error('Debe permanecer silencioso')}});
  await p.goto(process.env.ORBITA_TEST_URL||'http://127.0.0.1:4175');await p.waitForFunction(()=>window.app&&window.expeditionScene);
  async function intro(){
   await p.keyboard.press('Enter');assert.equal(await p.evaluate(()=>app.state),'intro');assert.equal(await p.locator('.comic-panel').count(),0);
   await p.waitForTimeout(650);const lengths=await p.evaluate(()=>[$('intro-typed').textContent.length,OrbitExpedition.INTRO[0].length]);assert.ok(lengths[0]>0&&lengths[0]<lengths[1]);await p.screenshot({path:'tmp/fix-intro.png'});
   for(let i=0;i<3;i++){await p.locator('[data-action=intro-next]').click();await p.waitForFunction(()=>app.introComplete);await p.locator('[data-action=intro-next]').click();}
   assert.equal(await p.evaluate(()=>app.state),'menu');
  }
  await intro();assert.equal(await p.evaluate(()=>app.unlocked.size),0);await p.getByRole('button',{name:'Cómo jugar',exact:true}).click();assert.equal(await p.locator('#modal-title').textContent(),'Cómo jugar');await p.keyboard.press('Escape');
  await p.locator('[data-action=archive]').click();assert.equal(await p.locator('[data-page]').count(),0);assert.equal(await p.locator('.archive-card').count(),3);await p.locator('[data-action=archive-next]').click();assert.equal(await p.locator('.archive-pagination>span').textContent(),'4–6 de 9');await p.locator('[data-action=archive-next]').click();assert.equal(await p.locator('.archive-pagination>span').textContent(),'7–9 de 9');await p.screenshot({path:'tmp/fix-archive-locked.png'});
  await p.evaluate(()=>app.openComic('prologue','archive'));assert.equal(await p.evaluate(()=>app.state),'archive');await p.keyboard.press('Escape');await p.locator('[data-action=routes]').click();assert.equal(await p.locator('[data-mode]').count(),0);assert.equal(await p.locator('.route-card').count(),8);
  await p.locator('[data-action=detail]').click();assert.equal(await p.locator('[data-difficulty]').count(),3);await p.locator('[data-action=launch]').click();await p.waitForFunction(()=>app.state==='explore',null,{timeout:60000});assert.equal(await p.locator('[data-action=recover]').count(),0);
  await p.evaluate(()=>expeditionScene.t=44);await p.waitForFunction(()=>app.state==='result');assert.equal(await p.locator('[data-action=reward]').count(),0);assert.equal(await p.evaluate(()=>app.completed.size),0);assert.equal(await p.evaluate(()=>app.unlocked.size),0);await p.screenshot({path:'tmp/fix-result-failed.png'});await p.locator('[data-action=routes]').click();
  for(let index=0;index<8;index++){
   await p.evaluate(i=>{app.selected=i;app.go('detail')},index);assert.equal(await p.locator('[data-difficulty]').count(),3);const difficulty=['easy','normal','hard'][index%3];await p.locator(`[data-difficulty=${difficulty}]`).click();await p.screenshot({path:`tmp/fix-detail-${index}.png`});
   await p.locator('[data-action=bestiary]').click();assert.equal(await p.locator('.creature-book>div').count(),2);assert.equal(await p.locator('.guardian-book').count(),1);await p.keyboard.press('Escape');await p.locator('[data-action=launch]').click();await p.waitForFunction(()=>app.state==='explore',null,{timeout:60000});
   await p.keyboard.press('j');await p.waitForFunction(()=>expeditionScene.foot<expeditionScene.world.floor-80);await p.waitForFunction(()=>expeditionScene.foot>expeditionScene.world.floor-6);await p.mouse.move(900,100);await p.keyboard.press('z');await p.keyboard.press('x');assert.equal(await p.evaluate(()=>expeditionScene.lane),0);
   await p.evaluate(()=>{expeditionScene.t=19;expeditionScene.objects=[]});await p.waitForFunction(()=>expeditionScene.bossActive);await p.keyboard.press('f');assert.equal(await p.evaluate(()=>expeditionScene.stats.returns),0);
   await p.evaluate(()=>{expeditionScene.objects=[{x:expeditionScene.worldW*.65,y:expeditionScene.groundY,lane:0,frameSeed:0},{x:expeditionScene.worldW*.7,y:expeditionScene.airY,lane:1,frameSeed:1}]});await p.waitForTimeout(100);await p.screenshot({path:`tmp/fix-rings-${index}.png`});
   await p.keyboard.press('p');const frozen=await p.evaluate(()=>expeditionScene.t);await p.waitForTimeout(100);assert.equal(await p.evaluate(()=>expeditionScene.t),frozen);await p.locator('[data-action=resume]').click();
   const goals=await p.evaluate(()=>({hits:app.difficulty.hits,returns:app.difficulty.returns}));
   for(const[kind,count]of[['target',goals.hits],['projectile',goals.returns]])for(let n=0;n<count;n++){
    const lane=n%2;await p.evaluate(({lane,kind})=>{const s=expeditionScene;s.objects=[{x:s.hitX,y:lane?s.airY:s.groundY,lane,projectile:kind==='projectile',done:false}]},{lane,kind});await p.keyboard.press(lane?'j':'f');
   }
   assert.equal(await p.evaluate(()=>app.state),'explore');assert.equal(await p.locator('[data-action=reward]').count(),0);
   await p.evaluate(()=>expeditionScene.t=44);await p.waitForFunction(()=>app.state==='result');assert.equal(await p.locator('[data-action=reward]').count(),1);assert.equal(await p.evaluate(()=>app.result.cleared),true);await p.screenshot({path:`tmp/fix-result-${index}.png`});await p.locator('[data-action=reward]').click();
   assert.equal(await p.evaluate(()=>app.comic.id),index===0?'prologue':await p.evaluate(()=>app.world.chapterId));
   while(await p.evaluate(()=>app.state==='comic'))await p.locator('[data-action=comic-next]').click();assert.equal(await p.evaluate(()=>app.state),'result');await p.locator('[data-action=routes]').click();
  }
  assert.equal(await p.evaluate(()=>app.completed.size),8);assert.equal(await p.evaluate(()=>app.read.size),9);await p.evaluate(()=>app.go('archive'));await p.screenshot({path:'tmp/fix-archive-unlocked.png'});
  await p.locator('#settings-open').click();await p.locator('#effects').evaluate(n=>{n.value='0';n.dispatchEvent(new Event('input',{bubbles:true}))});await p.locator('#ambient').uncheck();await p.keyboard.press('Escape');await p.reload();await p.waitForFunction(()=>window.expeditionScene);assert.equal(await p.evaluate(()=>app.completed.size),8);assert.equal(await p.evaluate(()=>app.settings.effects),0);await intro();
  for(const[width,height]of[[1600,900],[1366,768],[1024,600],[844,390],[390,844],[320,640]]){
   await p.setViewportSize({width,height});for(const state of ['menu','routes','detail','archive','comic','result']){
    await p.evaluate(state=>{if(state==='comic'){app.openComic('prologue','archive');return}if(state==='result')app.result={cleared:true,hits:12,returns:4,elapsed:44,difficulty:'hard',world:app.world.id};app.go(state)},state);await p.waitForTimeout(100);
    assert.deepEqual(await p.evaluate(()=>[document.documentElement.scrollWidth<=innerWidth,document.documentElement.scrollHeight<=innerHeight]),[true,true]);
    if(state==='archive')assert.ok(await p.locator('.archive-screen').evaluate(n=>n.scrollHeight<=n.clientHeight+1));
    const button=state==='detail'?'[data-action=launch]':state==='result'?'[data-action=routes]':null;if(button){const box=await p.locator(button).boundingBox();assert.ok(box.x>=0&&box.x+box.width<=width&&box.y+box.height<=height,`${state} ${width}x${height}`)}
    await p.screenshot({path:`tmp/fix-${state}-${width}.png`});
   }
  }
  await p.evaluate(()=>{localStorage.removeItem('orbita-expedition-v2');localStorage.setItem('orbita-expedition-v1',JSON.stringify({settings:{mode:'hybrid'},read:OrbitComic.PAGES.map(p=>p.id),visited:OrbitExpedition.WORLDS.map(w=>w.id)}))});await p.reload();await p.waitForFunction(()=>window.expeditionScene);assert.equal(await p.evaluate(()=>app.read.size),0);assert.equal(await p.evaluate(()=>app.unlocked.size),0);assert.equal(await p.evaluate(()=>app.input.mode),'keyboard');
  assert.equal(await p.evaluate(()=>audioAttempts),0);assert.deepEqual(audio,[]);assert.deepEqual(errors,[]);assert.deepEqual(bad,[]);console.log('PASS: introducción restaurada, F/J, tres dificultades, objetivos reales, recuerdos por victoria, archivo paginado, contraste en ocho mapas, persistencia, migración y seis resoluciones.');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
