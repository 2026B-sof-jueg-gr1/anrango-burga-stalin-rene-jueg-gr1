/* ÓRBITA · Arte y efectos visuales.
 * Este archivo solo dibuja y anima. Las reglas de la misión están en game.js.
 * Texturas pequeñas, creadas una sola vez; sin imágenes ni librerías adicionales.
 */
'use strict';

let portalCore, portalMarks, shipHalo, shipLabel, lastTrail = 0, visualClock = 0;
const transientEffects = new Set();

function createVisualDetails(gameScene) {
  portalCore = gameScene.add.image(MISSION.portal.x, MISSION.portal.y, 'portal-core').setAlpha(.12).setBlendMode(Phaser.BlendModes.ADD);
  portalMarks = MISSION.crystals.map((_, i) => {
    const angle = i * Math.PI / 4 - Math.PI / 2;
    return gameScene.add.image(MISSION.portal.x + Math.cos(angle) * 93,
      MISSION.portal.y + Math.sin(angle) * 93, 'portal-mark').setRotation(angle).setAlpha(.15);
  });
  shipHalo = gameScene.add.image(0, 0, 'glow').setTint(0x7fdddf).setScale(.85).setAlpha(.13).setDepth(3).setBlendMode(Phaser.BlendModes.ADD);
  shipLabel = gameScene.add.text(0, 0, 'N O M A D – 0 1', {
    fontFamily: 'monospace', fontSize: '10px', color: '#b1d0d5'
  }).setOrigin(.5).setAlpha(.75).setDepth(4);
}

function updateVisuals(time, delta) {
  const paused = mode === 'paused';
  if (!paused && !reduceMotion) visualClock += delta;
  const clock = visualClock;
  starsFar.tilePositionX = scene.cameras.main.scrollX * .09;
  starsNear.tilePositionX = scene.cameras.main.scrollX * .25;
  if (!paused && !reduceMotion) {
    portalRing.rotation += delta * .00009;
    portalCore.rotation -= delta * .00026;
  }
  const energy = collected / MISSION.crystals.length;
  portalCore.setAlpha(.10 + energy * (.38 + Math.sin(clock * .0018) * .07));
  portalGlow.setAlpha(.14 + energy * .30).setScale(3.4 + Math.sin(clock * .0014) * .15);
  portalMarks.forEach((mark, i) => mark.setAlpha(i < collected ? .95 : .15));
  const alive = mode !== 'won';
  engine.setPosition(player.x - 38, player.y + 1).setAlpha(alive ? 1 : .1).setAngle(player.angle);
  shield.setPosition(player.x, player.y).setVisible(alive);
  shipHalo.setPosition(player.x - 13, player.y).setAlpha(alive ? .15 : 0);
  shipLabel.setPosition(player.x + 5, player.y + 55).setVisible(mode === 'intro');
  if (mode === 'intro') engine.setScale(.66 + Math.sin(clock * .014) * .04, .75);
  if (mode === 'playing') {
    const protectedNow = scene.time.now < invulnerableUntil;
    shield.setTint(protectedNow ? 0xffc4ab : 0xa5f5d2).setAlpha(protectedNow ? .5 + Math.sin(clock * .017) * .15 : .09);
    player.setAlpha(protectedNow ? .85 : 1);
  }
}

function updateThrusters(time, x, y) {
  const moving = x !== 0 || y !== 0;
  player.setAngle(reduceMotion ? 0 : y * 5);
  engine.setScale((moving ? 1.2 : .55) + (reduceMotion ? 0 : Math.sin(time * .032) * .04), moving ? 1 : .65);
  if (!moving || reduceMotion || time - lastTrail < 75) return;
  lastTrail = time;
  const particle = scene.add.image(player.x - 52, player.y + Phaser.Math.Between(-3, 3), 'spark')
    .setTint(0xa5f5d2).setAlpha(.5).setScale(.8, .5).setDepth(4).setBlendMode(Phaser.BlendModes.ADD);
  animateTransient(particle, { x: particle.x - 65, alpha: 0, scaleX: .2, duration: 550 });
}

function animateTransient(object, properties) {
  transientEffects.add(object);
  scene.tweens.add({ targets: object, ...properties,
    onComplete: () => { transientEffects.delete(object); object.destroy(); } });
}

function pulseRing(x, y, color, size = 1) {
  if (reduceMotion) return;
  const ring = scene.add.image(x, y, 'pulse-ring').setTint(color).setScale(.18).setAlpha(.75).setDepth(7).setBlendMode(Phaser.BlendModes.ADD);
  animateTransient(ring, { scale: size, alpha: 0, duration: 650, ease: 'Cubic.Out' });
}

function crystalFeedback(x, y) {
  if (reduceMotion) return;
  pulseRing(x, y, 0xa5f5d2, .9);
  const light = scene.add.image(x, y, 'glow').setTint(0xa5f5d2).setAlpha(.75).setScale(.7).setDepth(7).setBlendMode(Phaser.BlendModes.ADD);
  animateTransient(light, { scale: 1.25, alpha: 0, duration: 450 });
  const label = scene.add.text(x, y - 24, '+ ENERGÍA', {
    fontFamily: 'monospace', fontSize: '11px', color: '#d9fff0', stroke: '#0b1a28', strokeThickness: 3
  }).setOrigin(.5).setDepth(9);
  animateTransient(label, { y: y - 62, alpha: 0, duration: 1000, ease: 'Cubic.Out' });
  ui.count.animate([{ color: '#ffffff', textShadow: '0 0 20px #a5f5d2', transform: 'translateY(-2px)' },
    { color: '#edf2f8', textShadow: '0 0 0px transparent', transform: 'translateY(0)' }], { duration: 550 });
}

function impactFeedback() {
  if (reduceMotion) return;
  pulseRing(player.x, player.y, 0xffbda3, 1.4);
  screenFeedback('impact');
  ui.shields.animate([{ filter: 'brightness(2)', transform: 'translateX(-3px)' },
    { filter: 'brightness(1)', transform: 'translateX(0)' }], { duration: 350 });
}

function activatePortal() {
  if (reduceMotion) return;
  pulseRing(MISSION.portal.x, MISSION.portal.y, 0xa5f5d2, 3);
  scene.tweens.add({ targets: portalCore, scale: 1.16, duration: 650, yoyo: true });
}

function victoryFeedback() {
  if (reduceMotion) return;
  pulseRing(MISSION.portal.x, MISSION.portal.y, 0xa5f5d2, 3.2);
  scene.tweens.add({ targets: player, x: MISSION.portal.x, y: MISSION.portal.y,
    scale: .08, alpha: 0, duration: 650, ease: 'Cubic.In' });
}

function screenFeedback(kind) {
  if (reduceMotion) return;
  const screen = document.querySelector('#screen-effect');
  screen.className = `screen-effect ${kind}`;
  screen.getAnimations().forEach(animation => animation.cancel());
  screen.animate([{ opacity: 0 }, { opacity: 1, offset: .12 }, { opacity: 0 }], { duration: kind === 'impact' ? 500 : 850 });
}

function resetVisuals() {
  scene.tweens.killTweensOf(player);
  scene.tweens.killTweensOf(portalGlow);
  scene.tweens.killTweensOf(portalCore);
  portalCore.setScale(1);
  transientEffects.forEach(object => { scene.tweens.killTweensOf(object); object.destroy(); });
  transientEffects.clear();
  shield.setTint(0xa5f5d2).setAlpha(.09);
  if (!reduceMotion) screenFeedback('launch');
}

function makeTextures(gameScene) {
  function canvas(key, width, height, draw) {
    const texture = gameScene.textures.createCanvas(key, width, height);
    draw(texture.context, width, height); texture.refresh();
  }
  let seed = 1977;
  const random = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const circle = (ctx, x, y, radius) => { ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); };
  const polygon = (ctx, points) => { ctx.beginPath(); points.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath(); };

  canvas('nebula', 1600, 620, (ctx, w, h) => {
    const base = ctx.createLinearGradient(0, 0, w, h);
    base.addColorStop(0, '#07111f'); base.addColorStop(.5, '#0d1c30'); base.addColorStop(1, '#142336');
    ctx.fillStyle = base; ctx.fillRect(0, 0, w, h);
    [[1000, 180, 660, '66,87,134', .25], [860, 540, 510, '41,117,123', .26],
      [1410, 140, 480, '117,82,128', .18]].forEach(([x, y, r, color, alpha]) => {
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, r);
      gradient.addColorStop(0, `rgba(${color},${alpha})`); gradient.addColorStop(1, `rgba(${color},0)`);
      ctx.fillStyle = gradient; ctx.fillRect(0, 0, w, h);
    });
    for (let i = 0; i < 28; i++) {
      const x = 650 + random() * 800, y = 400 + Math.sin(x * .004) * 90 + random() * 100;
      const cloud = ctx.createRadialGradient(x, y, 0, x, y, 140);
      cloud.addColorStop(0, `rgba(79,132,151,${.015 + random() * .025})`); cloud.addColorStop(1, 'rgba(79,132,151,0)');
      ctx.fillStyle = cloud; ctx.fillRect(x - 140, y - 140, 280, 280);
    }
    for (let i = 0; i < 4200; i++) {
      ctx.fillStyle = `rgba(172,199,216,${random() * .045})`; ctx.fillRect(random() * w, random() * h, 1, 1);
    }
  });

  ['stars-far', 'stars-near'].forEach((key, layer) => canvas(key, 1600, 620, (ctx, w, h) => {
    for (let i = 0; i < (layer ? 72 : 280); i++) {
      const x = random() * w, y = random() * h, radius = layer ? .7 + random() * .7 : .3 + random() * .55;
      ctx.fillStyle = `rgba(198,224,244,${.15 + random() * (layer ? .65 : .35)})`;
      circle(ctx, x, y, radius); ctx.fill();
      if (layer && i % 15 === 0) {
        const halo = ctx.createRadialGradient(x, y, 0, x, y, 9);
        halo.addColorStop(0, '#c0e9ff44'); halo.addColorStop(1, '#c0e9ff00'); ctx.fillStyle = halo; ctx.fillRect(x - 9, y - 9, 18, 18);
        ctx.strokeStyle = '#b6d8ee66'; ctx.lineWidth = .6; ctx.beginPath();
        ctx.moveTo(x - 4, y); ctx.lineTo(x + 4, y); ctx.moveTo(x, y - 4); ctx.lineTo(x, y + 4); ctx.stroke();
      }
    }
  }));

  canvas('planet', 740, 590, (ctx) => {
    ctx.save(); ctx.translate(370, 295); ctx.rotate(-.30);
    ctx.strokeStyle = '#93a9bf21'; ctx.lineWidth = 19; ctx.beginPath(); ctx.ellipse(0, 0, 333, 80, 0, Math.PI, Math.PI * 2); ctx.stroke();
    // Sombreado esférico y bandas turbulentas, calculados una sola vez.
    const surface = document.createElement('canvas'); surface.width = surface.height = 400;
    const surfaceContext = surface.getContext('2d');
    const pixels = surfaceContext.createImageData(400, 400);
    for (let py = 0; py < 400; py++) for (let px = 0; px < 400; px++) {
      const nx = (px - 200) / 196, ny = (py - 200) / 196, r2 = nx * nx + ny * ny;
      if (r2 > 1) continue;
      const z = Math.sqrt(1 - r2);
      const warp = Math.sin(nx * 5 + ny * 9) * 1.4 + Math.sin(nx * 12 - ny * 19) * .18;
      const band = Math.sin(ny * 57 + warp) * .55 + Math.sin(ny * 137 + warp * 2) * .18;
      const warm = Math.max(0, Math.sin(ny * 13 + warp * .2));
      const light = Math.max(0, -nx * .48 - ny * .48 + z * .63);
      const brightness = .12 + light * .82;
      const rim = Math.pow(1 - z, 6) * Math.max(0, -nx - ny) * 18;
      const grain = random() * 3;
      const offset = (py * 400 + px) * 4;
      pixels.data[offset] = (120 + band * 21 + warm * 17) * brightness + rim + grain;
      pixels.data[offset + 1] = (144 + band * 17 + warm * 3) * brightness + rim * 1.4 + grain;
      pixels.data[offset + 2] = (166 + band * 13 - warm * 9) * brightness + rim * 1.8 + grain;
      pixels.data[offset + 3] = Math.min(255, (1 - Math.sqrt(r2)) * 7000);
    }
    surfaceContext.putImageData(pixels, 0, 0);
    ctx.shadowBlur = 15; ctx.shadowColor = '#8cc9ed55'; ctx.drawImage(surface, -200, -200); ctx.shadowBlur = 0;
    for (let i = 0; i < 17; i++) {
      ctx.strokeStyle = i % 5 === 0 ? '#c4cfda60' : `rgba(147,168,189,${.1 + random() * .14})`;
      ctx.lineWidth = i % 5 === 0 ? 1.1 : 1.5;
      ctx.beginPath(); ctx.ellipse(0, 0, 310 + i * 2.8, 72 + i * .7, 0, 0, Math.PI); ctx.stroke();
    }
    ctx.restore();
  });

  canvas('moon', 100, 100, (ctx) => {
    const g = ctx.createRadialGradient(33, 28, 1, 56, 57, 45);
    g.addColorStop(0, '#83b0c0'); g.addColorStop(.45, '#365568'); g.addColorStop(1, '#0a1727');
    ctx.fillStyle = g; circle(ctx, 50, 50, 33); ctx.fill();
    ctx.fillStyle = '#142b3b55'; [[35, 43, 3], [60, 30, 6], [48, 63, 7]].forEach(([x, y, r]) => { circle(ctx, x, y, r); ctx.fill(); });
  });

  canvas('ship', 110, 74, (ctx) => {
    ctx.lineJoin = 'round';
    const plate = (points, fill, stroke = '#7f9fae') => {
      polygon(ctx, points); ctx.fillStyle = fill; ctx.fill(); ctx.strokeStyle = stroke; ctx.lineWidth = .8; ctx.stroke();
    };
    ctx.shadowColor = '#0a1426'; ctx.shadowBlur = 5; ctx.shadowOffsetY = 3;
    plate([[25, 30], [13, 6], [31, 9], [76, 32]], '#456376');
    plate([[25, 44], [13, 68], [31, 65], [76, 42]], '#2b475d');
    ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
    plate([[14, 6], [32, 12], [58, 28], [27, 23]], '#89a6b6', '#b1cbd3');
    plate([[14, 68], [32, 62], [58, 46], [27, 51]], '#658595');
    plate([[10, 27], [30, 25], [30, 48], [10, 47]], '#254458');
    plate([[14, 29], [29, 29], [29, 44], [14, 44]], '#456d7e');
    const hull = ctx.createLinearGradient(40, 22, 60, 51);
    hull.addColorStop(0, '#eef2ea'); hull.addColorStop(.45, '#b9d0d4'); hull.addColorStop(.5, '#7195a5'); hull.addColorStop(1, '#496e83');
    plate([[23, 27], [49, 23], [82, 29], [105, 37], [79, 44], [49, 51], [23, 47], [32, 37]], hull, '#c3d9df');
    plate([[49, 25], [81, 30], [96, 36], [63, 36], [43, 32]], '#dce9e5', '#dce9e5');
    const glass = ctx.createLinearGradient(45, 29, 65, 40); glass.addColorStop(0, '#b3fff0'); glass.addColorStop(.3, '#2e9caa'); glass.addColorStop(1, '#102b43');
    plate([[47, 28], [66, 29], [83, 35], [62, 40], [43, 37]], glass, '#70d5d0');
    ctx.strokeStyle = '#d5fff566'; ctx.lineWidth = .7; ctx.beginPath(); ctx.moveTo(48, 30); ctx.lineTo(63, 31); ctx.lineTo(72, 34); ctx.stroke();
    plate([[34, 40], [55, 43], [78, 41], [51, 47], [32, 45]], '#64899a', '#93b2bf');
    ctx.strokeStyle = '#1f435b'; ctx.lineWidth = .7;
    [[25, 16, 37, 22], [25, 58, 37, 52], [61, 43, 79, 39]].forEach(([a, b, c, d]) => { ctx.beginPath(); ctx.moveTo(a, b); ctx.lineTo(c, d); ctx.stroke(); });
    ctx.fillStyle = '#eeb99e'; polygon(ctx, [[19, 10], [25, 12], [30, 22], [25, 20]]); ctx.fill();
    polygon(ctx, [[19, 64], [25, 62], [30, 52], [25, 54]]); ctx.fill();
    ctx.fillStyle = '#c9e4e2'; ctx.fillRect(32, 29, 5, 1); ctx.fillRect(32, 44, 5, 1);
    ctx.fillStyle = '#183249'; for (let i = 0; i < 3; i++) ctx.fillRect(35 + i * 3, 40, 1.5, 3);
    ctx.shadowColor = '#a5ffe3'; ctx.shadowBlur = 7; ctx.fillStyle = '#defff2'; ctx.fillRect(10, 32, 3, 9);
    ctx.fillStyle = '#b4ffe1'; circle(ctx, 24, 13, 1.2); ctx.fill(); circle(ctx, 24, 61, 1.2); ctx.fill();
  });

  canvas('engine', 100, 45, (ctx) => {
    const outer = ctx.createLinearGradient(0, 0, 100, 0);
    outer.addColorStop(0, '#67bfe000'); outer.addColorStop(.55, '#66dce055'); outer.addColorStop(1, '#b3ffe7cc');
    ctx.fillStyle = outer; ctx.beginPath(); ctx.moveTo(0, 22); ctx.quadraticCurveTo(64, 15, 100, 10); ctx.lineTo(100, 35); ctx.quadraticCurveTo(64, 29, 0, 22); ctx.fill();
    const core = ctx.createLinearGradient(30, 0, 100, 0); core.addColorStop(0, '#a5f5d200'); core.addColorStop(.65, '#a5f5d299'); core.addColorStop(1, '#f0fff4');
    ctx.fillStyle = core; ctx.beginPath(); ctx.moveTo(25, 22); ctx.lineTo(100, 17); ctx.lineTo(100, 28); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#effff3'; ctx.fillRect(95, 18, 5, 9);
  });

  canvas('crystal', 64, 64, (ctx) => {
    ctx.shadowColor = '#99f8d7'; ctx.shadowBlur = 12;
    const g = ctx.createLinearGradient(21, 13, 42, 50); g.addColorStop(0, '#edfff6'); g.addColorStop(.5, '#79e8c7'); g.addColorStop(1, '#2d8294');
    polygon(ctx, [[32, 10], [46, 31], [32, 54], [18, 31]]); ctx.fillStyle = g; ctx.fill();
    ctx.shadowBlur = 0;
    polygon(ctx, [[32, 10], [32, 31], [18, 31]]); ctx.fillStyle = '#d7fff0'; ctx.fill();
    polygon(ctx, [[32, 31], [46, 31], [32, 54]]); ctx.fillStyle = '#3ca7a0'; ctx.fill();
    ctx.strokeStyle = '#caffed'; ctx.lineWidth = .8; polygon(ctx, [[32, 10], [46, 31], [32, 54], [18, 31]]); ctx.stroke();
    ctx.strokeStyle = '#edfff5cc'; ctx.beginPath(); ctx.moveTo(19, 31); ctx.lineTo(32, 33); ctx.lineTo(45, 31); ctx.stroke();
    ctx.fillStyle = '#f4fff7'; ctx.fillRect(30, 17, 2, 5);
  });

  canvas('crystal-aura', 110, 110, (ctx) => {
    const g = ctx.createRadialGradient(55, 55, 8, 55, 55, 55); g.addColorStop(0, '#a5f5d23d'); g.addColorStop(.45, '#a5f5d214'); g.addColorStop(1, '#a5f5d200');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 110, 110);
    ctx.strokeStyle = '#a5f5d236'; ctx.lineWidth = .8; ctx.setLineDash([3, 9]); circle(ctx, 55, 55, 36); ctx.stroke(); ctx.setLineDash([]);
    ctx.strokeStyle = '#a5f5d299'; ctx.beginPath(); ctx.moveTo(55, 7); ctx.lineTo(55, 13); ctx.moveTo(55, 97); ctx.lineTo(55, 103); ctx.stroke();
  });

  for (let variant = 0; variant < 3; variant++) canvas(`rock-${variant}`, 120, 120, (ctx) => {
    const points = Array.from({ length: 11 }, (_, i) => {
      const angle = i * Math.PI * 2 / 11, radius = 39 + random() * 12;
      return [60 + Math.cos(angle) * radius, 60 + Math.sin(angle) * radius];
    });
    polygon(ctx, points);
    const g = ctx.createLinearGradient(20, 12, 90, 105);
    g.addColorStop(0, '#aab6bd'); g.addColorStop(.3, '#728390'); g.addColorStop(.65, '#3c5065'); g.addColorStop(1, '#16283c');
    ctx.fillStyle = g; ctx.fill(); ctx.save(); ctx.clip();
    for (let i = 0; i < points.length; i++) {
      const center = [53 + random() * 18, 48 + random() * 25];
      polygon(ctx, [points[i], points[(i + 1) % points.length], center]);
      ctx.fillStyle = i < 5 ? `rgba(8,26,43,${.05 + random() * .18})` : `rgba(222,218,207,${.03 + random() * .10})`; ctx.fill();
    }
    for (let i = 0; i < 5; i++) {
      const x = 30 + random() * 60, y = 28 + random() * 61, radius = 3 + random() * 7;
      const pit = ctx.createRadialGradient(x - 1, y - 2, 1, x, y, radius);
      pit.addColorStop(0, '#102437a8'); pit.addColorStop(.75, '#263d4f66'); pit.addColorStop(1, '#81929a22');
      ctx.fillStyle = pit; circle(ctx, x, y, radius); ctx.fill();
      ctx.strokeStyle = '#d7d3c43d'; ctx.lineWidth = .6; ctx.beginPath(); ctx.arc(x, y, radius, .3, 2.4); ctx.stroke();
    }
    for (let i = 0; i < 250; i++) {
      ctx.fillStyle = random() > .5 ? '#d8d4c914' : '#0b192b22'; ctx.fillRect(15 + random() * 90, 15 + random() * 90, 1, 1);
    }
    ctx.restore(); polygon(ctx, points); ctx.strokeStyle = '#afc0c455'; ctx.lineWidth = .8; ctx.stroke();
    ctx.beginPath(); points.slice(5, 10).forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.strokeStyle = '#d0d9d999'; ctx.lineWidth = 1.1; ctx.stroke();
  });

  canvas('glow', 160, 160, (ctx) => {
    const g = ctx.createRadialGradient(80, 80, 0, 80, 80, 80); g.addColorStop(0, '#ffffffbb'); g.addColorStop(.2, '#ffffff55'); g.addColorStop(1, '#ffffff00');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 160, 160);
  });
  canvas('shield', 136, 136, (ctx) => {
    const g = ctx.createRadialGradient(68, 68, 28, 68, 68, 53); g.addColorStop(0, '#ffffff00'); g.addColorStop(.9, '#ffffff1a'); g.addColorStop(1, '#ffffff66');
    ctx.fillStyle = g; circle(ctx, 68, 68, 53); ctx.fill();
    ctx.strokeStyle = '#ffffffdd'; ctx.lineWidth = 1; circle(ctx, 68, 68, 53); ctx.stroke();
    ctx.save(); circle(ctx, 68, 68, 51); ctx.clip(); ctx.strokeStyle = '#ffffff55'; ctx.lineWidth = .6;
    for (let row = 0; row < 8; row++) for (let col = 0; col < 8; col++) {
      const x = col * 16 + (row % 2) * 8, y = row * 14;
      polygon(ctx, Array.from({ length: 6 }, (_, i) => [x + Math.cos(i * Math.PI / 3 + Math.PI / 6) * 9, y + Math.sin(i * Math.PI / 3 + Math.PI / 6) * 9])); ctx.stroke();
    }
    ctx.restore();
  });

  canvas('portal', 220, 220, (ctx) => {
    ctx.strokeStyle = '#75899955'; ctx.lineWidth = 6; circle(ctx, 110, 110, 83); ctx.stroke();
    ctx.lineWidth = 1; ctx.strokeStyle = '#bacdd666'; circle(ctx, 110, 110, 86); ctx.stroke();
    for (let i = 0; i < 8; i++) {
      const angle = i * Math.PI / 4;
      ctx.strokeStyle = '#acc9cb'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(110, 110, 80, angle + .09, angle + .58); ctx.stroke();
      ctx.strokeStyle = '#b3eedc88'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(110, 110, 68, angle, angle + .35); ctx.stroke();
    }
    ctx.shadowColor = '#a5f5d2'; ctx.shadowBlur = 8; ctx.strokeStyle = '#b7ffe5'; ctx.lineWidth = 2; circle(ctx, 110, 110, 65); ctx.stroke();
  });
  canvas('portal-core', 200, 200, (ctx) => {
    const g = ctx.createRadialGradient(100, 100, 3, 100, 100, 65);
    g.addColorStop(0, '#102e4822'); g.addColorStop(.5, '#5b76c133'); g.addColorStop(.86, '#a6d2e077'); g.addColorStop(.96, '#bdffe8bb'); g.addColorStop(1, '#bdffe800');
    ctx.fillStyle = g; circle(ctx, 100, 100, 65); ctx.fill();
    ctx.save(); ctx.translate(100, 100);
    for (let i = 0; i < 12; i++) {
      ctx.rotate(Math.PI / 6); ctx.strokeStyle = i % 2 ? '#99c7ed55' : '#b2ffe488'; ctx.lineWidth = .8;
      ctx.beginPath(); ctx.moveTo(5, 0); ctx.bezierCurveTo(25, -32, 49, -24, 63, 0); ctx.stroke();
    }
    ctx.restore();
  });
  canvas('portal-mark', 16, 16, (ctx) => { ctx.fillStyle = '#b7ffe2'; polygon(ctx, [[8, 2], [12, 8], [8, 14], [4, 8]]); ctx.fill(); });
  canvas('pulse-ring', 160, 160, (ctx) => { ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.6; circle(ctx, 80, 80, 65); ctx.stroke(); });
  canvas('spark', 18, 6, (ctx) => {
    const g = ctx.createLinearGradient(0, 0, 18, 0); g.addColorStop(0, '#ffffff00'); g.addColorStop(1, '#fff'); ctx.fillStyle = g;
    polygon(ctx, [[0, 3], [16, 2], [18, 3], [16, 4]]); ctx.fill();
  });
  canvas('dot', 8, 8, (ctx) => { ctx.fillStyle = '#fff'; circle(ctx, 4, 4, 2); ctx.fill(); });
}

function drawRoute(gameScene) {
  const graphics = gameScene.add.graphics().setDepth(-5);
  graphics.lineStyle(1, 0x8eafc1, .16);
  const points = [[180, 330], ...MISSION.crystals, [MISSION.portal.x, MISSION.portal.y]];
  for (let i = 0; i < points.length - 1; i++) {
    const [x1, y1] = points[i], [x2, y2] = points[i + 1];
    for (let step = 0; step < 1; step += .06) graphics.lineBetween(
      x1 + (x2 - x1) * step, y1 + (y2 - y1) * step,
      x1 + (x2 - x1) * (step + .015), y1 + (y2 - y1) * (step + .015));
  }
}
