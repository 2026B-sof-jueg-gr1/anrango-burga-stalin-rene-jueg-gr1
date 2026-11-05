/* La presentación sigue al reloj musical, sin gobernar el juicio de las notas. */
'use strict';
class OrbitaStage extends Phaser.Scene {
  constructor() { super('space'); this.effects = []; this.impulses = [0, 0, 0, 0]; }
  preload() { makeTextures(this); }
  create() {
    this.sky = this.add.image(0, 0, 'nebula').setOrigin(0);
    this.far = this.add.tileSprite(0, 0, 100, 100, 'stars-far').setOrigin(0);
    this.planet = this.add.image(0, 0, 'planet').setAlpha(.65);
    this.moon = this.add.image(0, 0, 'moon').setAlpha(.5);
    this.near = this.add.tileSprite(0, 0, 100, 100, 'stars-near').setOrigin(0);
    this.portalGlow = this.add.image(0, 0, 'glow').setTint(0xa5f5d2).setAlpha(.2).setBlendMode(Phaser.BlendModes.ADD);
    this.portal = this.add.image(0, 0, 'portal').setAlpha(.45);
    this.core = this.add.image(0, 0, 'portal-core').setBlendMode(Phaser.BlendModes.ADD).setAlpha(.3);
    this.trail = this.add.image(0, 0, 'engine').setOrigin(1, .5).setBlendMode(Phaser.BlendModes.ADD);
    this.ship = this.add.image(0, 0, 'ship');
    this.shield = this.add.image(0, 0, 'shield').setAlpha(.08);
    this.g = this.add.graphics(); this.light = this.add.graphics().setBlendMode(Phaser.BlendModes.ADD);
    this.scale.on('resize', this.resizeStage, this); this.resizeStage();
    window.orbitaStage = this;
  }
  resizeStage() {
    const { width: w, height: h } = this.scale;
    this.sky.setDisplaySize(w, h); this.far.setSize(w, h); this.near.setSize(w, h);
    this.planet.setPosition(w * .83, h * .49).setScale(Math.max(w / 1650, h / 1350));
    this.moon.setPosition(w * .56, h * .25).setScale(.6);
    this.portal.setPosition(w * .79, h * .35); this.core.setPosition(w * .79, h * .35); this.portalGlow.setPosition(w * .79, h * .35).setScale(3.8);
  }
  anchors() {
    const w = this.scale.width;
    return w <= 480 ? [-92, -37, 37, 92] : w <= 800 ? [-108.5, -44.5, 44.5, 108.5] : [-127.5, -53.5, 53.5, 127.5];
  }
  position(lane, progress) {
    const w = this.scale.width, h = this.scale.height, p = Phaser.Math.Clamp(progress, 0, 1);
    return { x: w / 2 + this.anchors()[lane] * (.24 + .76 * p), y: Math.max(180, h * .24) + (h - 150 - Math.max(180, h * .24)) * p * p };
  }
  hit(lane, grade) {
    this.impulses[lane] = grade === 'miss' ? .28 : 1;
    if (window.gameApp?.preferences.reduced) return;
    const point = this.position(lane, 1);
    this.effects.push({ x: point.x, y: point.y, time: performance.now(), color: grade === 'miss' ? 0xb6bfcc : lane < 2 ? 0xa5f5d2 : 0xeeb99e });
    if (this.effects.length > 30) this.effects.shift();
  }
  diamond(x, y, r, color, alpha = 1) {
    this.g.fillStyle(color, alpha); this.g.fillPoints([{ x, y: y - r }, { x: x + r * .65, y }, { x, y: y + r }, { x: x - r * .65, y }], true);
    this.g.lineStyle(1, 0xffffff, alpha * .6); this.g.lineBetween(x, y - r + 2, x - r * .4, y);
  }
  update(time, delta) {
    const app = window.gameApp, reduced = app?.preferences.reduced, playing = app && ['playing', 'paused', 'countdown'].includes(app.mode);
    const w = this.scale.width, h = this.scale.height;
    app?.tick();
    const paused = app?.mode === 'paused';
    const travel = reduced ? 0 : playing ? Math.max(0, app.songTime()) * 5 : time * .003;
    this.far.tilePositionX = travel * .15; this.near.tilePositionX = travel * .6;
    const sx = playing ? w * (w < 700 ? .15 : .19) : w * .75;
    const sy = playing ? h * .52 : h * .38;
    const bob = reduced || paused ? 0 : Math.sin(time * .0012) * 6;
    const shipScale = playing ? (w < 700 ? .75 : 1.2) : Math.min(2.05, w / 650);
    this.ship.setPosition(sx, sy + bob).setScale(shipScale).setAlpha(playing && w < 480 ? .5 : 1);
    this.trail.setPosition(sx - 38 * shipScale, sy + bob).setScale(shipScale * (playing ? .9 : .7), shipScale * .8);
    this.shield.setPosition(sx, sy + bob).setScale(shipScale);
    this.planet.setAlpha(playing ? .24 : .60); this.portal.setAlpha(playing ? .14 : .45); this.core.setAlpha(playing ? .09 : .25);
    if (!reduced && !paused) { this.portal.rotation += delta * .00004; this.core.rotation -= delta * .00008; }
    this.g.clear(); this.light.clear();
    if (!playing || !app.session) return;
    const t = app.songTime(), chartTime = t - app.preferences.offset / 1000, approach = app.preferences.difficulty === 'story' ? 2.5 : 2.05;
    // Pasillo con cuatro receptores estables y convergencia hacia el horizonte.
    for (let lane = 0; lane < 4; lane++) {
      const top = this.position(lane, 0), end = this.position(lane, 1), color = lane < 2 ? 0xa5f5d2 : 0xeeb99e;
      this.g.lineStyle(1, color, .13); this.g.lineBetween(top.x, top.y, end.x, end.y);
      this.impulses[lane] = Math.max(0, this.impulses[lane] - delta / 300);
      this.g.lineStyle(1.5, color, .4 + this.impulses[lane] * .6); this.g.strokeCircle(end.x, end.y, 17);
      if (app.down.has(lane)) { this.light.fillStyle(color, .14); this.light.fillCircle(end.x, end.y, 24); }
      if (this.impulses[lane] > 0) { this.light.lineStyle(1, color, this.impulses[lane] * .3); this.light.lineBetween(sx + 25, sy, end.x, end.y); }
    }
    const left = this.position(0, 1), right = this.position(3, 1);
    this.g.lineStyle(1, 0xd6e7e8, .3); this.g.lineBetween(left.x - 28, left.y, right.x + 28, right.y);
    for (const note of app.session.notes) {
      if (note.state === 'done' || note.time - chartTime > approach || chartTime - note.end > .25) continue;
      const p = 1 - (note.time - chartTime) / approach, point = this.position(note.lane, p), color = note.lane < 2 ? 0xa5f5d2 : 0xeeb99e;
      if (note.end > note.time) {
        const tail = this.position(note.lane, 1 - (note.end - chartTime) / approach);
        this.g.lineStyle(12 * (.45 + .55 * Math.min(1, p)), color, note.state === 'holding' ? .5 : .22); this.g.lineBetween(point.x, point.y, tail.x, tail.y);
        this.g.lineStyle(1, color, .7); this.g.lineBetween(point.x, point.y, tail.x, tail.y);
        this.diamond(tail.x, tail.y, 5, color, .65);
      }
      this.diamond(point.x, point.y, 7 + Math.min(1, p) * 7, color, .45 + .55 * Math.max(0, p));
      if (!reduced) { this.light.fillStyle(color, .055); this.light.fillCircle(point.x, point.y, 22); }
    }
    const now = performance.now();
    this.effects = this.effects.filter(effect => now - effect.time < 500);
    for (const effect of this.effects) {
      const p = (now - effect.time) / 500;
      this.light.lineStyle(1.5, effect.color, (1 - p) * .7); this.light.strokeCircle(effect.x, effect.y, 15 + p * 35);
      for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3; this.light.fillStyle(effect.color, (1 - p) * .7); this.light.fillCircle(effect.x + Math.cos(a) * p * 45, effect.y + Math.sin(a) * p * 45, 1.5); }
    }
  }
}
