/* ÓRBITA · Phaser 3
 * La estructura sigue el taller: configuración → preload → create → update.
 * El resto son funciones pequeñas para la misión, la interfaz y los dibujos.
 */
'use strict';

// 1. CONFIGURACIÓN: cambia estos valores para ajustar la dificultad.
const MISSION = {
  width: 3700, height: 620, seconds: 75, speed: 300, shields: 3,
  crystals: [[510, 330], [890, 200], [1260, 430], [1650, 265],
    [2040, 405], [2420, 180], [2820, 350], [3180, 240]],
  asteroids: [[710, 390, 35], [1110, 280, 43], [1450, 350, 32],
    [1780, 420, 46], [1940, 175, 30], [2230, 300, 44],
    [2620, 250, 38], [2950, 450, 44], [3130, 390, 29]],
  portal: { x: 3490, y: 310 }
};

const ui = {
  overlay: document.querySelector('#overlay'),
  kicker: document.querySelector('#overlay-kicker'),
  title: document.querySelector('#overlay-title'),
  description: document.querySelector('#overlay-description'),
  start: document.querySelector('#start-button'),
  note: document.querySelector('#launch-note'),
  count: document.querySelector('#crystal-count'),
  time: document.querySelector('#time-left'),
  shields: document.querySelector('#shield-bars'),
  pause: document.querySelector('#pause-button'),
  sound: document.querySelector('#sound-button'),
  coordinates: document.querySelector('#coordinates'),
  progress: document.querySelector('#route-progress'),
  marker: document.querySelector('#route-ship'),
  portal: document.querySelector('#portal-hint'),
  toast: document.querySelector('#toast')
};

let scene, player, cursors, wasd, crystals, asteroids, portal;
let starsFar, starsNear, planet, moon, engine, shield, portalRing, portalGlow;
let mode = 'intro'; // intro, playing, paused, won, lost
let collected = 0, shields = MISSION.shields, remaining = MISSION.seconds;
let invulnerableUntil = 0, toastTimeout;
let muted = true, audioContext;
const touch = { left: false, right: false, up: false, down: false };
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// 2. PRELOAD: los recursos se dibujan aquí, sin imágenes externas.
function preload() {
  makeTextures(this);
}

// 3. CREATE: escenario, jugador, cámara, teclado y colisiones.
function create() {
  scene = this;
  this.physics.world.setBounds(35, 52, MISSION.width - 70, MISSION.height - 100);
  this.cameras.main.setBounds(0, 0, MISSION.width, MISSION.height);
  this.cameras.main.setOrigin(0, 0);

  this.add.image(0, 0, 'nebula').setOrigin(0).setScrollFactor(0).setDepth(-10);
  starsFar = this.add.tileSprite(0, 0, 1600, 620, 'stars-far').setOrigin(0).setScrollFactor(0).setDepth(-9);
  starsNear = this.add.tileSprite(0, 0, 1600, 620, 'stars-near').setOrigin(0).setScrollFactor(0).setDepth(-6);
  planet = this.add.image(940, 440, 'planet').setScrollFactor(0).setDepth(-8).setAlpha(.65);
  moon = this.add.image(500, 100, 'moon').setScrollFactor(0).setDepth(-7).setAlpha(.6);
  drawRoute(this);

  crystals = this.physics.add.staticGroup();
  MISSION.crystals.forEach(([x, y], i) => {
    const halo = this.add.image(x, y, 'crystal-aura').setAlpha(.7).setDepth(-1);
    const crystal = crystals.create(x, y, 'crystal');
    crystal.body.setCircle(23, 9, 9);
    crystal.setData('number', i + 1);
    crystal.setData('halo', halo);
    crystal.setData('label', this.add.text(x, y + 40, String(i + 1).padStart(2, '0'), {
      fontFamily: 'monospace', fontSize: '11px', color: '#a3c4c8'
    }).setOrigin(.5));
    if (!reduceMotion) this.tweens.add({ targets: halo, alpha: .32, scale: .85, duration: 1500 + i * 90, yoyo: true, repeat: -1 });
  });

  asteroids = this.physics.add.staticGroup();
  MISSION.asteroids.forEach(([x, y, radius], i) => {
    const rock = asteroids.create(x, y, `rock-${i % 3}`).setDisplaySize(radius * 2.5, radius * 2.5);
    rock.refreshBody();
    // El círculo de colisión es más pequeño que el dibujo: el juego perdona los roces.
    rock.body.setCircle(radius / rock.scaleX, (60 - radius / rock.scaleX), (60 - radius / rock.scaleY));
    // La luz llega desde arriba a la izquierda en todas las rocas.
  });

  portalGlow = this.add.image(MISSION.portal.x, MISSION.portal.y, 'glow').setTint(0x9e91ff).setScale(3.5).setAlpha(.2);
  portalRing = this.add.image(MISSION.portal.x, MISSION.portal.y, 'portal').setAlpha(.55);
  createVisualDetails(this);
  portal = this.physics.add.staticImage(MISSION.portal.x, MISSION.portal.y, 'dot').setVisible(false);
  portal.body.setCircle(66, -62, -62);
  this.add.text(MISSION.portal.x, MISSION.portal.y + 116, 'P O R T A L  /  C A S A', {
    fontFamily: 'monospace', fontSize: '11px', color: '#b8b2df'
  }).setOrigin(.5);

  engine = this.add.image(0, 0, 'engine').setOrigin(1, .5).setBlendMode(Phaser.BlendModes.ADD).setDepth(4);
  player = this.physics.add.image(880, 335, 'ship').setDepth(5).setCollideWorldBounds(true);
  player.body.setSize(64, 28).setOffset(22, 23);
  shield = this.add.image(player.x, player.y, 'shield').setDepth(6).setAlpha(.15);
  cursors = this.input.keyboard.createCursorKeys();
  wasd = this.input.keyboard.addKeys('W,A,S,D');
  this.input.keyboard.addCapture([37, 38, 39, 40, 32]);
  this.input.keyboard.on('keydown-P', () => togglePause());
  this.input.keyboard.on('keydown-ESC', () => { if (mode === 'playing' || mode === 'paused') togglePause(); });
  this.input.keyboard.on('keydown-ENTER', () => { if (mode !== 'playing') primaryAction(); });

  this.physics.add.overlap(player, crystals, collectCrystal);
  this.physics.add.overlap(player, asteroids, hitAsteroid);
  this.physics.add.overlap(player, portal, enterPortal);
  this.scale.on('resize', resizeScene);
  resizeScene();
  updateHUD();
  ui.start.disabled = false;
  ui.start.innerHTML = 'Iniciar misión <span>↗</span>';
  this.physics.pause();
}

// 4. UPDATE: se ejecuta en cada fotograma. El teclado cambia la velocidad.
function update(time, delta) {
  if (!player) return;
  updateVisuals(time, delta);

  if (mode !== 'playing') {
    if (mode === 'intro' && !reduceMotion) {
      player.y = 335 + Math.sin(time * .0013) * 9;
    }
    return;
  }

  remaining = Math.max(0, remaining - delta / 1000);
  if (remaining <= 0) { finishMission(false, 'El tiempo se agotó.'); return; }

  let x = Number(cursors.right.isDown || wasd.D.isDown || touch.right) - Number(cursors.left.isDown || wasd.A.isDown || touch.left);
  let y = Number(cursors.down.isDown || wasd.S.isDown || touch.down) - Number(cursors.up.isDown || wasd.W.isDown || touch.up);
  const direction = new Phaser.Math.Vector2(x, y).normalize();
  player.setVelocity(direction.x * MISSION.speed, direction.y * MISSION.speed);
  updateThrusters(time, x, y);
  updateHUD();
}

// 5. MISIÓN: recoger, recibir daño, ganar, perder y reiniciar.
function startMission() {
  mode = 'playing';
  collected = 0; shields = MISSION.shields; remaining = MISSION.seconds;
  invulnerableUntil = 0;
  resetVisuals();
  Object.keys(touch).forEach(key => { touch[key] = false; });
  scene.input.keyboard.resetKeys();
  crystals.getChildren().forEach(crystal => {
    crystal.enableBody(false, crystal.x, crystal.y, true, true);
    crystal.getData('label').setVisible(true);
    crystal.getData('halo').setVisible(true);
  });
  player.enableBody(true, 180, 330, true, true);
  player.setVelocity(0).setAngle(0).setAlpha(1).setScale(1);
  scene.cameras.main.startFollow(player, true, .085, .085);
  scene.cameras.main.setScroll(0, 0);
  portalRing.setTint(0xffffff).setAlpha(.42);
  ui.portal.hidden = true;
  ui.overlay.hidden = true;
  ui.pause.disabled = false;
  ui.pause.setAttribute('aria-label', 'Pausar misión');
  scene.physics.resume();
  ui.start.blur();
  document.querySelector('#game').focus({ preventScroll: true });
  updateHUD();
  showToast('Recoge los 8 cristales. Las flechas o WASD guían tu nave.');
  playTone(320, .14); playTone(480, .18, .13);
}

function collectCrystal(_player, crystal) {
  if (mode !== 'playing' || !crystal.active) return;
  const { x, y } = crystal;
  crystal.disableBody(true, true);
  crystal.getData('label').setVisible(false);
  crystal.getData('halo').setVisible(false);
  collected++;
  burst(x, y, 0xa5f5d2, 13);
  crystalFeedback(x, y);
  playTone(520 + collected * 65, .13);
  updateHUD();
  if (collected === MISSION.crystals.length) {
    portalRing.setTint(0xa5f5d2).setAlpha(1);
    ui.portal.hidden = false;
    showToast('¡Energía completa! El portal te espera al final del sector.');
    playTone(880, .3, .12);
    activatePortal();
  } else showToast(`Cristal ${String(collected).padStart(2, '0')} / 08 · Energía recuperada`);
}

function hitAsteroid() {
  if (mode !== 'playing' || scene.time.now < invulnerableUntil) return;
  shields--;
  invulnerableUntil = scene.time.now + 1700;
  burst(player.x, player.y, 0xffb69f, 11);
  impactFeedback();
  if (!reduceMotion) scene.cameras.main.shake(180, .004);
  playTone(100, .24);
  updateHUD();
  if (shields <= 0) finishMission(false, 'La nave se quedó sin escudo.');
  else showToast(`Impacto recibido · ${shields} ${shields === 1 ? 'punto' : 'puntos'} de escudo. ¡Sigue adelante!`);
}

function enterPortal() {
  if (mode !== 'playing') return;
  if (collected === MISSION.crystals.length) finishMission(true);
  else if (!ui.toast.classList.contains('visible')) showToast(`Al portal le falta energía. Busca ${8 - collected} cristales más hacia la izquierda.`);
}

function finishMission(won, reason = '') {
  mode = won ? 'won' : 'lost';
  scene.physics.pause();
  player.setVelocity(0);
  ui.pause.disabled = true;
  ui.portal.hidden = true;
  ui.toast.classList.remove('visible');
  clearTimeout(toastTimeout);
  ui.overlay.className = `overlay result ${won ? 'victory' : 'defeat'}`;
  ui.overlay.hidden = false;
  ui.kicker.textContent = won ? 'MISIÓN 001 / COMPLETADA' : 'MISIÓN 001 / NUEVO INTENTO';
  ui.title.innerHTML = won ? 'Todas las estrellas<br><em>te trajeron a casa.</em>' : 'El espacio puede esperar.<br><em>Tu aventura continúa.</em>';
  ui.description.textContent = won
    ? `Recuperaste los 8 cristales y regresaste con ${Math.ceil(remaining)} segundos de reserva y ${shields} ${shields === 1 ? 'punto' : 'puntos'} de escudo. Buen viaje, comandante.`
    : `${reason} Recuperaste ${collected} de 8 cristales. Respira, encuentra tu ruta y vuelve a despegar.`;
  ui.start.innerHTML = won ? 'Explorar de nuevo <span>↗</span>' : 'Volver a intentar <span>↗</span>';
  ui.note.innerHTML = '<span class="key">↵</span> para una nueva misión';
  ui.start.focus({ preventScroll: true });
  if (won) {
    burst(player.x, player.y, 0xa5f5d2, 32);
    victoryFeedback();
    [523, 659, 784, 1046].forEach((note, i) => playTone(note, .3, i * .14));
  }
}

function togglePause() {
  if (mode === 'playing') {
    mode = 'paused'; scene.physics.pause(); player.setVelocity(0);
    scene.tweens.pauseAll();
    clearTimeout(toastTimeout);
    ui.toast.classList.remove('visible');
    Object.keys(touch).forEach(key => { touch[key] = false; });
    ui.overlay.className = 'overlay paused'; ui.overlay.hidden = false;
    ui.kicker.textContent = 'SISTEMAS EN ESPERA';
    ui.title.innerHTML = 'Incluso las estrellas<br><em>necesitan una pausa.</em>';
    ui.description.textContent = 'Tu misión está a salvo. El tiempo y la nave continuarán cuando tú estés listo.';
    ui.start.innerHTML = 'Continuar misión <span>→</span>';
    ui.note.innerHTML = '<span class="key">P</span> o <span class="key">↵</span> para continuar';
    ui.pause.setAttribute('aria-label', 'Continuar misión');
    ui.start.focus({ preventScroll: true });
  } else if (mode === 'paused') {
    mode = 'playing'; scene.input.keyboard.resetKeys(); scene.physics.resume();
    scene.tweens.resumeAll();
    ui.overlay.hidden = true; ui.pause.setAttribute('aria-label', 'Pausar misión');
    document.querySelector('#game').focus({ preventScroll: true });
  }
}

function primaryAction() {
  if (!scene) return;
  if (mode === 'paused') togglePause();
  else if (mode !== 'playing') startMission();
}

// 6. INTERFAZ Y SONIDO. Los sonidos son tonos sencillos, sin archivos de audio.
function updateHUD() {
  ui.count.textContent = String(collected).padStart(2, '0');
  const seconds = Math.ceil(remaining);
  ui.time.textContent = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  ui.time.classList.toggle('danger', remaining <= 15);
  ui.shields.setAttribute('aria-label', `${shields} de 3 puntos de escudo`);
  [...ui.shields.children].forEach((bar, i) => bar.classList.toggle('lost', i >= shields));
  document.querySelectorAll('.crystal-slots i').forEach((slot, i) => slot.classList.toggle('collected', i < collected));
  const progress = mode === 'intro' ? 0 : Phaser.Math.Clamp((player.x - 180) / (MISSION.portal.x - 180), 0, 1) * 100;
  ui.progress.style.width = `${progress}%`; ui.marker.style.left = `${progress}%`;
  ui.coordinates.innerHTML = `X ${String(Math.round(player.x)).padStart(4, '0')} <span>Y ${String(Math.round(player.y)).padStart(4, '0')}</span>`;
}

function showToast(message) {
  clearTimeout(toastTimeout);
  ui.toast.textContent = message; ui.toast.classList.add('visible');
  toastTimeout = setTimeout(() => ui.toast.classList.remove('visible'), 3000);
}

function playTone(frequency, duration, delay = 0) {
  if (muted) return;
  try {
    audioContext ??= new (window.AudioContext || window.webkitAudioContext)();
    if (audioContext.state === 'suspended') audioContext.resume().catch(() => {});
    const oscillator = audioContext.createOscillator(), gain = audioContext.createGain();
    const start = audioContext.currentTime + delay;
    oscillator.type = 'sine'; oscillator.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(.07, start + .015);
    gain.gain.exponentialRampToValueAtTime(.001, start + duration);
    oscillator.connect(gain); gain.connect(audioContext.destination);
    oscillator.start(start); oscillator.stop(start + duration + .01);
  } catch { /* El sonido es opcional si el navegador no admite Web Audio. */ }
}

ui.start.addEventListener('click', primaryAction);
ui.pause.addEventListener('click', () => togglePause());
ui.sound.addEventListener('click', () => {
  muted = !muted;
  if (muted && audioContext) audioContext.suspend().catch(() => {});
  ui.sound.setAttribute('aria-pressed', String(!muted));
  ui.sound.setAttribute('aria-label', muted ? 'Activar sonido' : 'Silenciar sonido');
  ui.sound.title = muted ? 'Activar sonido' : 'Silenciar sonido';
  document.querySelector('#sound-waves').setAttribute('d', muted ? 'm16 9 6 6m0-6-6 6' : 'M15 8c2 2 2 6 0 8m3-11c4 4 4 10 0 14');
  playTone(640, .12);
});
document.querySelectorAll('[data-direction]').forEach(button => {
  const direction = button.dataset.direction;
  button.addEventListener('pointerdown', event => { event.preventDefault(); button.setPointerCapture(event.pointerId); touch[direction] = true; });
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(type => button.addEventListener(type, () => { touch[direction] = false; }));
});
document.addEventListener('visibilitychange', () => { if (document.hidden && mode === 'playing') togglePause(); });
window.addEventListener('blur', () => { if (mode === 'playing') togglePause(); });

function resizeScene() {
  const camera = scene.cameras.main;
  const zoom = scene.scale.height / MISSION.height;
  camera.setZoom(zoom);
  const viewWidth = scene.scale.width / zoom;
  starsFar.setSize(viewWidth, 620); starsNear.setSize(viewWidth, 620);
  planet.setPosition(viewWidth * .84, 440).setScale(Math.min(.82, viewWidth / 1250));
  moon.setPosition(viewWidth * .48, 105);
  if (mode === 'intro') {
    player.setPosition(viewWidth * .72, 335);
    camera.setScroll(0, 0);
  }
  updateHUD();
}

function burst(x, y, color, count) {
  if (reduceMotion) return;
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count;
    const distance = Phaser.Math.Between(25, 80);
    const particle = scene.add.image(x, y, i % 3 ? 'spark' : 'dot').setTint(color).setScale(Phaser.Math.FloatBetween(.4, 1)).setRotation(angle).setDepth(8).setBlendMode(Phaser.BlendModes.ADD);
    scene.tweens.add({ targets: particle, x: x + Math.cos(angle) * distance, y: y + Math.sin(angle) * distance,
      alpha: 0, scale: 0, duration: 650, onComplete: () => particle.destroy() });
  }
}

// Mensaje legible si no se pudo cargar Phaser ni desde CDN ni desde la copia local.
if (typeof Phaser === 'undefined') {
  ui.title.textContent = 'No se pudo preparar la nave.';
  ui.description.textContent = 'Recarga la página. Si el problema continúa, comprueba que la carpeta vendor esté junto a index.html.';
} else {
  new Phaser.Game({
    type: Phaser.AUTO,
    parent: 'game',
    backgroundColor: '#081323',
    scale: { mode: Phaser.Scale.RESIZE, width: 1280, height: 620 },
    physics: { default: 'arcade', arcade: { gravity: { x: 0, y: 0 }, debug: false } },
    render: { antialias: true },
    scene: { preload, create, update }
  });
}

