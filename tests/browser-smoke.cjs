/* QA local, navegador aislado: no utiliza el perfil ni las pestañas personales. */
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
(async () => {
  fs.mkdirSync('tmp', { recursive: true });
  const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_EXECUTABLE || (process.platform === 'win32' ? 'C:/Program Files/Google/Chrome/Application/chrome.exe' : undefined), args: ['--autoplay-policy=no-user-gesture-required'] });
  try {
    const page = await browser.newPage({ viewport: { width: 1366, height: 768 } });
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    await page.goto(process.env.ORBITA_TEST_URL || 'http://127.0.0.1:4174'); await page.waitForFunction(() => window.orbitaStage?.ship && window.gameApp);
    await page.screenshot({ path: 'tmp/contrapunto-menu.png' });
    for (const [width, height] of [[1366, 768], [1024, 600], [390, 844], [320, 640]]) {
      await page.setViewportSize({ width, height });
      assert.deepEqual(await page.evaluate(() => [document.documentElement.scrollWidth <= innerWidth, document.documentElement.scrollHeight <= innerHeight]), [true, true], `Sin scroll de página a ${width}x${height}`);
      const launch = await page.locator('#launch').boundingBox(); assert.ok(launch.y >= 60 && launch.y + launch.height <= height - 30, `Inicio visible a ${width}x${height}`);
    }
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.getByRole('button', { name: 'Cómo jugar', exact: true }).click(); await page.locator('[data-close="help-panel"]').last().click();
    await page.locator('#settings').click(); await page.locator('[data-bind="0"]').click(); await page.keyboard.press('A'); assert.equal(await page.locator('[data-lane="0"]').textContent(), 'A');
    await page.locator('[data-bind="0"]').click(); await page.keyboard.press('D'); await page.locator('[data-close="settings-panel"]').last().click();
    await page.locator('[data-difficulty="story"]').click(); await page.locator('#launch').click(); await page.locator('#dialog-skip').click();
    await page.waitForFunction(() => ['playing', 'countdown', 'paused', 'menu'].includes(window.gameApp.mode), null, { timeout: 15000 }).catch(async error => { console.log('DIAGNÓSTICO', await page.evaluate(() => ({mode: gameApp.mode, ctx: gameApp.audio.ctx?.state, hasBuffer: Boolean(gameApp.audio.buffer), notice: document.querySelector('#notice').textContent})), errors); await page.screenshot({path:'tmp/contrapunto-diagnostic.png'}); throw error; });
    console.log('Estado al preparar audio:', await page.evaluate(() => ({ mode: gameApp.mode, notice: document.querySelector('#notice').textContent, errors: window.gameApp.audio.ctx?.state })));
    if (await page.evaluate(() => gameApp.mode === 'paused')) await page.locator('#resume').click();
    assert.notEqual(await page.evaluate(() => gameApp.mode), 'menu');
    const rendered = await page.evaluate(() => {
      const buffer = gameApp.audio.buffer, data = buffer.getChannelData(0); let energy = 0;
      for (let i = 0; i < data.length; i += 400) { if (!Number.isFinite(data[i])) throw new Error('Audio no finito'); energy += data[i] * data[i]; }
      return { duration: buffer.duration, energy };
    });
    assert.ok(rendered.duration > 70 && rendered.energy > .01);
    await page.waitForFunction(() => gameApp.mode === 'playing'); await page.keyboard.press('p');
    const time = await page.evaluate(() => gameApp.songTime()); await page.waitForTimeout(300); assert.equal(await page.evaluate(() => gameApp.songTime()), time);
    await page.locator('#resume').click(); await page.waitForFunction(() => gameApp.mode === 'playing');
    await page.evaluate(() => { const a = gameApp; const n = a.session.notes.find(note => note.state === 'pending'); a.audio.started = a.audio.ctx.currentTime - n.time; });
    await page.keyboard.press('d');
    assert.ok((await page.locator('footer').boundingBox()).y >= 718, 'El pie permanece al fondo durante la partida');
    await page.screenshot({ path: 'tmp/contrapunto-playing.png' });
    // Integra una interpretación perfecta ya cubierta nota a nota por las pruebas del núcleo.
    await page.evaluate(() => {
      const a = gameApp; a.session = new OrbitaCore.Session(a.chapter, 'story', event => a.judge(event));
      const events = a.session.notes.flatMap(n => [{ t: n.time, l: n.lane, press: true }, ...(n.end > n.time ? [{ t: n.end, l: n.lane, press: false }] : [])]).sort((x, y) => x.t - y.t);
      for (const e of events) { a.session.update(e.t); e.press ? a.session.press(e.l, e.t) : a.session.release(e.l, e.t); }
      a.audio.started = a.audio.ctx.currentTime - (a.chapter.bars * 4 * 60 / a.chapter.bpm + 1);
    });
    await page.waitForFunction(() => gameApp.mode === 'results'); assert.equal(await page.locator('#rank').textContent(), 'S');
    await page.locator('#result-next').click(); assert.ok(await page.locator('#dialog-text').isVisible()); await page.locator('#dialog-skip').click();
    assert.equal(await page.evaluate(() => gameApp.selected), 1); assert.equal(await page.evaluate(() => gameApp.progress.faro.complete), true);
    await page.reload(); await page.waitForFunction(() => window.orbitaStage?.ship); assert.equal(await page.evaluate(() => gameApp.progress.faro.complete), true);
    await page.evaluate(async () => {
      await gameApp.audio.unlock();
      for (const chapter of OrbitaCore.CHAPTERS.slice(1)) {
        await gameApp.audio.prepare(chapter);
        const data = gameApp.audio.buffer.getChannelData(0); let energy = 0;
        for (let i = 0; i < data.length; i += 400) { if (!Number.isFinite(data[i])) throw new Error('Muestra de audio inválida'); energy += data[i] ** 2; }
        if (energy < .01) throw new Error('Pieza silenciosa');
      }
    });
    await page.locator('#settings').click(); await page.locator('#calibrate').click(); await page.waitForFunction(() => gameApp.calibration?.clicks.length > 0);
    assert.equal(await page.locator('#calibration').isVisible(), true); await page.locator('#calibration-stop').click(); assert.equal(await page.evaluate(() => gameApp.calibration), null);
    await page.locator('[data-close="settings-panel"]').last().click();
    assert.deepEqual(errors, []); console.log('PASS navegador: tres piezas de audio real, cuatro resoluciones, controles, pausa, reanudación, victoria, historia, persistencia y metrónomo.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
