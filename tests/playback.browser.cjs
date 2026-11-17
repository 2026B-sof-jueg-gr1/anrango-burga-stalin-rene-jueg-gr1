/* Reproduce Altale entera con el reloj real. No adelanta el audio ni la sesión. */
const{chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{fs.mkdirSync('tmp',{recursive:true});const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_EXECUTABLE||'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--mute-audio']});try{
 const p=await browser.newPage({viewport:{width:1366,height:768}}),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto(process.env.ORBITA_TEST_URL||'http://127.0.0.1:4175');await p.waitForFunction(()=>window.app&&window.expeditionScene);await p.evaluate(()=>{app.settings.difficulty='hard';app.go('detail')});await p.locator('[data-action=launch]').click();await p.waitForFunction(()=>app.state==='explore',null,{timeout:60000});
 await p.evaluate(()=>{
  window.autoHeld=new Map();window.pauseTested=false;window.headJudgements=new Map();const original=app.judge.bind(app);app.judge=event=>{if(event.type==='judge'&&event.part==='head')headJudgements.set(event.note.id,(headJudgements.get(event.note.id)||0)+1);original(event)};
  const key=(type,lane)=>document.dispatchEvent(new KeyboardEvent(type,{code:lane?'KeyJ':'KeyF',bubbles:true}));
  window.autoLoop=setInterval(()=>{
   if(app.state!=='explore')return;const s=app.session,t=app.sound.time;
   if(app.phase==='countdown'){for(const n of s.holds)if(n&&!n.down&&!app.input.held.has(n.action?'KeyJ':'KeyF'))key('keydown',n.action);return;}
   for(const[lane,end]of autoHeld)if(t>=end){key('keyup',lane);autoHeld.delete(lane);}
   if(!pauseTested&&s.holds.some(n=>n&&t>n.time+.2)){pauseTested=true;app.pause();setTimeout(()=>app.resume(),350);return;}
   const boss=s.activeBoss;
   if(boss){if(t-boss.lastAt>.09){const lane=1-Math.max(0,boss.lastAction);key('keydown',lane);key('keyup',lane);}return;}
   for(const n of s.notes)if(n.state==='pending'&&t>=n.time-.005&&t<n.time+.04&&!autoHeld.has(n.action)){key('keydown',n.action);autoHeld.set(n.action,n.end>n.time?n.end-.004:t+.025);}
  },3);
 });
 console.log('Reproduciendo la canción completa y probando una pausa durante un sostenido...');await p.waitForFunction(()=>app.state==='result',null,{timeout:205000});
 const result=await p.evaluate(()=>({result:app.result,pauseTested,heads:[...headJudgements.values()],duration:app.sound.buffer.duration,errors:app.session.errors,records:Object.keys(app.records),unlocked:[...app.unlocked]}));
 assert.equal(result.pauseTested,true);assert.equal(result.result.cleared,true);assert.equal(result.result.bossesWon,result.result.bossesTotal);assert.ok(result.result.bossBonus>0);assert.ok(result.result.accuracy>=97,JSON.stringify(result.result));assert.ok(result.heads.every(n=>n===1));assert.ok(Math.abs(result.duration-152.230023)<.1);assert.deepEqual(result.unlocked,['prologue','chapter-aurora']);assert.deepEqual(errors,[]);
 await p.screenshot({path:'tmp/playback-full-result.png'});await p.locator('[data-action=reward]').click();assert.equal(await p.evaluate(()=>app.comic.id),'prologue');assert.equal(await p.locator('.comic-panel').count(),4);
 fs.writeFileSync('tmp/playback-report.json',JSON.stringify(result,null,2));console.log('PASS reproducción completa:',JSON.stringify(result.result));
 }finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
