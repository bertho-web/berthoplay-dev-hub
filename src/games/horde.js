import * as THREE from 'three';

export class HordeGame {
  constructor(canvas, onGameOver) {
    this.canvas = canvas;
    this.onGameOver = onGameOver;
    this.running = false;

    this.clock = new THREE.Clock();

    // Stats Héros
    this.hp = 100;
    this.maxHp = 100;
    this.speed = 12;
    this.level = 1;
    this.xp = 0;
    this.nextLevelXp = 180; // Seuil d'XP équilibré
    this.score = 0;
    this.coinsEarned = 0;

    // Armes & Power-ups
    this.fireRate = 0.35;
    this.fireTimer = 0;
    this.bulletDamage = 25;
    this.orbitalBladesCount = 1;

    // Entités
    this.heroPos = new THREE.Vector3(0, 0, 0);
    this.moveDir = new THREE.Vector2(0, 0);
    this.enemies = [];
    this.bullets = [];
    this.xpOrbs = [];
    this.blades = [];

    this.soundEnabled = true;
    this.audioCtx = null;

    const globalBack = document.getElementById('btn-back-hub');
    if (globalBack) globalBack.style.display = 'none';

    this.initGeometriesAndMaterials();
    this.initScene();
    this.initUIAndModals();
    this.buildHero();
    this.buildOrbitalBlades();

    this.animate = this.animate.bind(this);
  }

  // --- AUDIO SYNTHESIS ADDICTIF (Web Audio API) ---
  initAudio() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) this.audioCtx = new AudioContext();
    }
  }

  playSound(type) {
    if (!this.soundEnabled) return;
    this.initAudio();
    if (!this.audioCtx) return;

    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      const now = this.audioCtx.currentTime;

      if (type === 'shoot') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.08);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === 'xp') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.setValueAtTime(1320, now + 0.06);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === 'hit') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(120, now);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.06);
        osc.start(now);
        osc.stop(now + 0.06);
      } else if (type === 'levelup') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523, now);
        osc.frequency.setValueAtTime(659, now + 0.1);
        osc.frequency.setValueAtTime(784, now + 0.2);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (type === 'hurt') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.15);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
      }
    } catch (e) {
      console.warn("Audio non supporté", e);
    }
  }

  initGeometriesAndMaterials() {
    this.geos = {
      bullet: new THREE.SphereGeometry(0.35, 8, 8),
      enemySmall: new THREE.SphereGeometry(0.7, 12, 12),
      enemyBoss: new THREE.SphereGeometry(1.6, 16, 16),
      xpOrb: new THREE.OctahedronGeometry(0.35),
      blade: new THREE.BoxGeometry(0.35, 0.12, 1.4)
    };

    this.mats = {
      bullet: new THREE.MeshBasicMaterial({ color: 0x38bdf8 }),
      enemySmall: new THREE.MeshStandardMaterial({ color: 0xa855f7, emissive: 0x7e22ce, emissiveIntensity: 0.5 }),
      enemyBoss: new THREE.MeshStandardMaterial({ color: 0xf43f5e, emissive: 0xbe123c, emissiveIntensity: 0.7 }),
      xpOrb: new THREE.MeshBasicMaterial({ color: 0x34d399 }),
      blade: new THREE.MeshBasicMaterial({ color: 0x10b981 }),
      heroBody: new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.9, roughness: 0.1 }),
      heroVisor: new THREE.MeshBasicMaterial({ color: 0xf43f5e })
    };
  }

  initScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x050512);
    this.scene.fog = new THREE.FogExp2(0x050512, 0.015);

    this.camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(0, 22, 14);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, powerPreference: "high-performance" });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x0284c7, 2.5);
    const mainLight = new THREE.DirectionalLight(0xf43f5e, 2.0);
    mainLight.position.set(20, 40, 20);
    this.scene.add(hemiLight, mainLight);

    const arenaGeo = new THREE.PlaneGeometry(250, 250);
    const arenaMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3, metalness: 0.5 });
    const arena = new THREE.Mesh(arenaGeo, arenaMat);
    arena.rotation.x = -Math.PI / 2;
    this.scene.add(arena);

    const grid = new THREE.GridHelper(250, 50, 0x38bdf8, 0x1e293b);
    grid.position.y = 0.01;
    this.scene.add(grid);

    const starGeo = new THREE.BufferGeometry();
    const count = 100;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i += 3) {
      pos[i] = (Math.random() - 0.5) * 160;
      pos[i + 1] = Math.random() * 20 + 2;
      pos[i + 2] = (Math.random() - 0.5) * 160;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const starMat = new THREE.PointsMaterial({ color: 0x38bdf8, size: 0.4, transparent: true, opacity: 0.6 });
    this.stars = new THREE.Points(starGeo, starMat);
    this.scene.add(this.stars);
  }

  buildHero() {
    this.heroGroup = new THREE.Group();

    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.4, 1.6, 12), this.mats.heroBody);
    body.position.y = 0.8;
    this.heroGroup.add(body);

    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.2, 0.3), this.mats.heroVisor);
    visor.position.set(0, 1.2, -0.3);
    this.heroGroup.add(visor);

    const auraMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.3 });
    const aura = new THREE.Mesh(new THREE.RingGeometry(0.8, 1.2, 24), auraMat);
    aura.rotation.x = -Math.PI / 2;
    aura.position.y = 0.05;
    this.heroGroup.add(aura);

    this.scene.add(this.heroGroup);
  }

  buildOrbitalBlades() {
    this.blades.forEach(b => this.scene.remove(b.mesh));
    this.blades = [];

    for (let i = 0; i < this.orbitalBladesCount; i++) {
      const mesh = new THREE.Mesh(this.geos.blade, this.mats.blade);
      this.scene.add(mesh);
      this.blades.push({ mesh, angle: (i * (Math.PI * 2 / this.orbitalBladesCount)) });
    }
  }

  initUIAndModals() {
    this.ui = document.createElement('div');
    this.ui.id = 'horde-ui';
    this.ui.innerHTML = `
      <style>
        #horde-ui {
          position: fixed; top: 0; left: 0; width: 100vw; height: 100dvh;
          pointer-events: none; z-index: 2000;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }

        .custom-back-btn, .hud-top, .joystick-zone, .modal {
          pointer-events: auto;
        }

        .hud-top {
          position: fixed; top: max(10px, env(safe-area-inset-top)); left: 50%; transform: translateX(-50%);
          width: 92%; max-width: 440px; z-index: 2000; display: flex; flex-direction: column; gap: 6px;
        }

        .hud-row-top {
          display: flex; justify-content: space-between; align-items: center; width: 100%;
        }

        .custom-back-btn {
          background: rgba(15, 23, 42, 0.92); border: 1px solid #38bdf8;
          color: #fff; border-radius: 10px; padding: 6px 12px; font-size: 0.8rem; font-weight: bold;
          cursor: pointer; backdrop-filter: blur(8px);
        }

        .hud-stats-card {
          display: flex; gap: 12px; align-items: center; color: #fff;
          font-family: monospace; font-weight: bold; font-size: 0.8rem;
          background: rgba(15, 23, 42, 0.92); padding: 6px 12px; border-radius: 10px; border: 1px solid #38bdf8;
          backdrop-filter: blur(8px);
        }
        
        .bars-container { display: flex; flex-direction: column; gap: 4px; width: 100%; }
        .bar-wrapper { width: 100%; height: 8px; background: rgba(255,255,255,0.1); border-radius: 4px; overflow: hidden; border: 1px solid rgba(255,255,255,0.2); }
        .hp-fill { height: 100%; background: linear-gradient(90deg, #f43f5e, #fb7185); width: 100%; transition: width 0.15s; }
        .xp-fill { height: 100%; background: linear-gradient(90deg, #38bdf8, #34d399); width: 0%; transition: width 0.15s; }

        .joystick-zone {
          position: fixed; bottom: max(20px, env(safe-area-inset-bottom)); left: 50%; transform: translateX(-50%);
          width: 125px; height: 125px; background: rgba(255,255,255,0.06); border: 2px solid rgba(56, 189, 248, 0.4);
          border-radius: 50%; z-index: 2000; touch-action: none; backdrop-filter: blur(8px);
          display: flex; align-items: center; justify-content: center; user-select: none;
        }
        .joystick-knob { width: 48px; height: 48px; background: radial-gradient(circle, #38bdf8, #0284c7); border-radius: 50%; box-shadow: 0 0 15px #38bdf8; pointer-events: none; }

        .icon-btn-sound { background: #1e293b; border: 1px solid #334155; color: #fff; padding: 3px 6px; border-radius: 6px; cursor: pointer; font-size: 0.8rem; }

        .modal {
          position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
          background: rgba(15, 23, 42, 0.97); border: 1px solid #38bdf8; padding: 24px;
          border-radius: 20px; z-index: 4000; width: 85%; max-width: 380px; text-align: center;
          color: #fff; backdrop-filter: blur(20px); box-shadow: 0 10px 40px rgba(0,0,0,0.9);
        }
        .upgrade-card { background: rgba(255,255,255,0.05); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 12px; padding: 12px; margin-bottom: 10px; cursor: pointer; text-align: left; display: flex; align-items: center; gap: 12px; }
        .upgrade-card:active { background: rgba(56, 189, 248, 0.25); border-color: #38bdf8; }
        .up-icon { font-size: 1.8rem; }
        .up-title { font-weight: 800; color: #38bdf8; font-size: 0.9rem; }
        .up-desc { font-size: 0.72rem; color: #94a3b8; }

        .btn-action { margin-top: 15px; width: 100%; padding: 14px; background: linear-gradient(135deg, #0284c7, #0d9488); border: none; border-radius: 25px; color: #fff; font-weight: 900; font-size: 0.95rem; text-transform: uppercase; cursor: pointer; }
      </style>

      <div class="hud-top">
        <div class="hud-row-top">
          <button class="custom-back-btn" id="horde-custom-back">◀ Quitter</button>
          <div class="hud-stats-card">
            <span>SCORE: <b id="txt-score" style="color:#38bdf8;">0</b></span>
            <span>🪙 <b id="txt-coins" style="color:#fbbf24;">0</b></span>
            <span><button class="icon-btn-sound" id="btn-sound">🔊</button></span>
            <span>NV.<b id="txt-lvl" style="color:#34d399;">1</b></span>
          </div>
        </div>
        <div class="bars-container">
          <div class="bar-wrapper"><div class="hp-fill" id="bar-hp"></div></div>
          <div class="bar-wrapper"><div class="xp-fill" id="bar-xp"></div></div>
        </div>
      </div>

      <div class="joystick-zone" id="joy-zone">
        <div class="joystick-knob" id="joy-knob"></div>
      </div>

      <!-- TUTORIEL INITIAL 100% CLIQUABLE -->
      <div class="modal" id="tut-modal" style="display:block;">
        <h2 style="color:#38bdf8; font-size:1.4rem; margin-bottom:12px;">COMMENT JOUER ? 👾</h2>
        <div style="text-align:left; font-size:0.8rem; color:#cbd5e1; display:flex; flex-direction:column; gap:10px; margin-bottom:18px;">
          <div>🕹️ <b>Déplacement :</b> Glisse ton doigt sur le Joystick pour déplacer ton Héros.</div>
          <div>⚡ <b>Tir Automatique :</b> Tes armes tirent automatiquement sur les monstres.</div>
          <div>💎 <b>Orbes d'XP & Coins :</b> Ramasse les gemmes vertes pour monter de niveau et gagner des BerthoCoins !</div>
          <div>⚔️ <b>Level Up :</b> Améliore tes canons, roquettes et boucliers spectraux !</div>
        </div>
        <button class="btn-action" id="btn-start-horde">C'EST PARTI ! 🚀</button>
      </div>

      <!-- MODALE LEVEL UP -->
      <div class="modal" id="up-modal" style="display:none;">
        <h2 style="color:#38bdf8; margin-bottom:12px; font-size:1.3rem;">NIVEAU SUPÉRIEUR ! ⚡</h2>
        <div id="up-list"></div>
      </div>

      <!-- MODALE GAME OVER -->
      <div class="modal" id="go-modal" style="display:none; border-color:#f43f5e;">
        <h2 style="color:#f43f5e; font-size:1.5rem; margin-bottom:10px;">GAME OVER ! 💥</h2>
        <p style="color:#eee; font-size:0.85rem;" id="go-stats">Score : 0 | Niveau : 1</p>
        <div style="display:flex; gap:10px; margin-top:18px;">
          <button id="btn-replay-horde" style="flex:1; padding:12px; background:#38bdf8; color:#0f172a; border:none; border-radius:20px; font-weight:900; cursor:pointer;">REJOUER 🔄</button>
          <button id="btn-hub-horde" style="flex:1; padding:12px; background:#1e293b; color:#fff; border:1px solid #334155; border-radius:20px; font-weight:bold; cursor:pointer;">MENU 🏠</button>
        </div>
      </div>
    `;

    document.body.appendChild(this.ui);

    const bindClick = (id, fn) => {
      const el = document.getElementById(id);
      if (!el) return;
      const handler = (e) => {
        if (e.cancelable) e.preventDefault();
        fn(e);
      };
      el.addEventListener('touchstart', handler, { passive: false });
      el.addEventListener('click', handler);
    };

    bindClick('horde-custom-back', () => {
      this.destroy();
      this.onGameOver(this.score, this.coinsEarned);
    });

    bindClick('btn-sound', () => {
      this.soundEnabled = !this.soundEnabled;
      const soundBtn = document.getElementById('btn-sound');
      if (soundBtn) soundBtn.innerText = this.soundEnabled ? '🔊' : '🔇';
    });

    bindClick('btn-start-horde', () => {
      this.initAudio();
      const tutModal = document.getElementById('tut-modal');
      if (tutModal) tutModal.style.display = 'none';
      this.running = true;
      this.clock.start();
      requestAnimationFrame(this.animate);
    });

    bindClick('btn-replay-horde', () => {
      this.restartGame();
    });

    bindClick('btn-hub-horde', () => {
      this.destroy();
      this.onGameOver(this.score, this.coinsEarned);
    });

    // BIND JOYSTICK OPTIMISÉ AVEC RÉFÉRENCES STOCKEES POUR LE CLEANUP EN DESTRUY
    const joyZone = document.getElementById('joy-zone');
    const joyKnob = document.getElementById('joy-knob');
    this.joyActive = false;
    this.joyCenter = { x: 0, y: 0 };

    this.handleStart = (e) => {
      if (e.cancelable) e.preventDefault();
      this.initAudio();
      this.joyActive = true;
      const touch = e.touches ? e.touches[0] : e;
      const rect = joyZone.getBoundingClientRect();
      this.joyCenter = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
      this.handleMove(e);
    };

    this.handleMove = (e) => {
      if (!this.joyActive) return; // N'intercepte PAS le toucher si le joystick est inactif
      if (e.cancelable) e.preventDefault();
      const touch = e.touches ? e.touches[0] : e;
      const dx = touch.clientX - this.joyCenter.x;
      const dy = touch.clientY - this.joyCenter.y;
      const dist = Math.min(Math.hypot(dx, dy), 40);
      const angle = Math.atan2(dy, dx);

      const knobX = Math.cos(angle) * dist;
      const knobY = Math.sin(angle) * dist;

      joyKnob.style.transform = `translate(${knobX}px, ${knobY}px)`;

      this.moveDir.x = knobX / 40;
      this.moveDir.y = knobY / 40;
    };

    this.handleEnd = (e) => {
      if (!this.joyActive) return;
      if (e.cancelable) e.preventDefault();
      this.joyActive = false;
      joyKnob.style.transform = `translate(0px, 0px)`;
      this.moveDir.set(0, 0);
    };

    joyZone.addEventListener('touchstart', this.handleStart, { passive: false });
    window.addEventListener('touchmove', this.handleMove, { passive: false });
    window.addEventListener('touchend', this.handleEnd, { passive: false });
    window.addEventListener('touchcancel', this.handleEnd, { passive: false });

    joyZone.addEventListener('mousedown', this.handleStart);
    window.addEventListener('mousemove', this.handleMove);
    window.addEventListener('mouseup', this.handleEnd);
  }

  restartGame() {
    this.enemies.forEach(e => this.scene.remove(e.mesh));
    this.bullets.forEach(b => this.scene.remove(b.mesh));
    this.xpOrbs.forEach(o => this.scene.remove(o.mesh));
    this.enemies = [];
    this.bullets = [];
    this.xpOrbs = [];

    this.hp = 100;
    this.maxHp = 100;
    this.score = 0;
    this.coinsEarned = 0;
    this.level = 1;
    this.xp = 0;
    this.nextLevelXp = 180;
    this.fireRate = 0.35;
    this.bulletDamage = 25;
    this.orbitalBladesCount = 1;

    this.heroPos.set(0, 0, 0);
    this.heroGroup.position.set(0, 0, 0);

    this.buildOrbitalBlades();

    document.getElementById('go-modal').style.display = 'none';
    this.running = true;
    this.clock.start();
    requestAnimationFrame(this.animate);
  }

  spawnEnemy() {
    const angle = Math.random() * Math.PI * 2;
    const spawnDist = 28 + Math.random() * 12;
    const ex = this.heroPos.x + Math.cos(angle) * spawnDist;
    const ez = this.heroPos.z + Math.sin(angle) * spawnDist;

    const isBoss = Math.random() > 0.88;
    const size = isBoss ? 1.4 : 0.7;
    const hp = isBoss ? 160 : 35;
    const speed = isBoss ? 4.2 : 6.5;

    const mesh = new THREE.Mesh(
      isBoss ? this.geos.enemyBoss : this.geos.enemySmall,
      isBoss ? this.mats.enemyBoss : this.mats.enemySmall
    );
    mesh.position.set(ex, size, ez);
    this.scene.add(mesh);

    this.enemies.push({ mesh, hp, maxHp: hp, speed, isBoss, size });
  }

  shootPlasma() {
    if (this.enemies.length === 0) return;

    let closestEnemy = null;
    let closestDist = Infinity;

    this.enemies.forEach(e => {
      const d = this.heroPos.distanceTo(e.mesh.position);
      if (d < closestDist) {
        closestDist = d;
        closestEnemy = e;
      }
    });

    if (!closestEnemy || closestDist > 25) return;

    const dir = new THREE.Vector3().subVectors(closestEnemy.mesh.position, this.heroPos).normalize();

    const bullet = new THREE.Mesh(this.geos.bullet, this.mats.bullet);
    bullet.position.copy(this.heroPos).add(new THREE.Vector3(0, 0.8, 0));

    this.playSound('shoot');
    this.scene.add(bullet);
    this.bullets.push({ mesh: bullet, dir, life: 1.8 });
  }

  spawnXPOrb(pos, isBoss = false) {
    const orb = new THREE.Mesh(this.geos.xpOrb, this.mats.xpOrb);
    orb.position.set(pos.x, 0.4, pos.z);

    this.scene.add(orb);
    this.xpOrbs.push({ mesh: orb, val: isBoss ? 60 : 8, coins: isBoss ? 50 : 5 });
  }

  // LEVEL UP RÉINITIALISÉ SANS BOUCLE CASCADANTE
  triggerLevelUp() {
    this.running = false;
    this.level++;
    this.xp = 0; // Réinitialisation stricte
    this.nextLevelXp = Math.round(180 * Math.pow(1.55, this.level - 1));
    this.coinsEarned += 100;
    this.playSound('levelup');

    const upModal = document.getElementById('up-modal');
    const upList = document.getElementById('up-list');

    const options = [
      { id: 'rate', icon: '⚡', title: 'Tir Accéléré', desc: 'Augmente la vitesse de tir de 25%' },
      { id: 'dmg', icon: '💥', title: 'Canon Plasma +', desc: 'Augmente les dégâts de tir' },
      { id: 'blade', icon: '⚔️', title: '+1 Lame d\'Énergie', desc: 'Ajoute une lame d\'attaque orbitale' },
      { id: 'heal', icon: '💖', title: 'Soin d\'Urgence', desc: 'Restaure 50 PV immédiatement' },
    ];

    const choices = options.sort(() => 0.5 - Math.random()).slice(0, 3);

    upList.innerHTML = choices.map(c => `
      <div class="upgrade-card" data-up="${c.id}">
        <div class="up-icon">${c.icon}</div>
        <div>
          <div class="up-title">${c.title}</div>
          <div class="up-desc">${c.desc}</div>
        </div>
      </div>
    `).join('');

    upModal.style.display = 'block';

    const cards = upList.querySelectorAll('.upgrade-card');
    cards.forEach(card => {
      const handler = (e) => {
        if (e.cancelable) e.preventDefault();
        const upId = card.getAttribute('data-up');
        if (upId === 'rate') this.fireRate = Math.max(0.12, this.fireRate * 0.8);
        if (upId === 'dmg') this.bulletDamage += 15;
        if (upId === 'blade') { this.orbitalBladesCount++; this.buildOrbitalBlades(); }
        if (upId === 'heal') { this.hp = Math.min(this.maxHp, this.hp + 50); }

        upModal.style.display = 'none';
        this.running = true;
        this.clock.start();
        requestAnimationFrame(this.animate);
      };
      card.addEventListener('touchstart', handler, { passive: false });
      card.addEventListener('click', handler);
    });
  }

  triggerGameOver() {
    this.running = false;
    this.playSound('hurt');
    document.getElementById('go-stats').innerText = `Score Final : ${this.score} PTS | 🪙 +${this.coinsEarned} Coins | Niveau ${this.level}`;
    document.getElementById('go-modal').style.display = 'block';
  }

  updateGame(dt) {
    if (this.moveDir.lengthSq() > 0) {
      this.heroPos.x += this.moveDir.x * this.speed * dt;
      this.heroPos.z += this.moveDir.y * this.speed * dt;
      this.heroGroup.position.copy(this.heroPos);

      const angle = Math.atan2(-this.moveDir.x, -this.moveDir.y);
      this.heroGroup.rotation.y = angle;
    }

    this.camera.position.x = this.heroPos.x;
    this.camera.position.z = this.heroPos.z + 14;
    this.camera.lookAt(this.heroPos.x, 0, this.heroPos.z);

    this.blades.forEach(b => {
      b.angle += dt * 3.5;
      const bx = this.heroPos.x + Math.cos(b.angle) * 3.2;
      const bz = this.heroPos.z + Math.sin(b.angle) * 3.2;
      b.mesh.position.set(bx, 0.8, bz);
      b.mesh.rotation.y = -b.angle;

      this.enemies.forEach(e => {
        if (e.mesh.position.distanceTo(b.mesh.position) < 1.4) {
          e.hp -= 2;
          this.playSound('hit');
        }
      });
    });

    this.fireTimer += dt;
    if (this.fireTimer >= this.fireRate) {
      this.shootPlasma();
      this.fireTimer = 0;
    }

    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      b.mesh.position.addScaledVector(b.dir, dt * 35);
      b.life -= dt;

      let hit = false;
      for (let j = this.enemies.length - 1; j >= 0; j--) {
        const e = this.enemies[j];
        if (b.mesh.position.distanceTo(e.mesh.position) < e.size + 0.3) {
          e.hp -= this.bulletDamage;
          hit = true;
          this.playSound('hit');
          break;
        }
      }

      if (hit || b.life <= 0) {
        this.scene.remove(b.mesh);
        this.bullets.splice(i, 1);
      }
    }

    if (this.enemies.length < 120 && Math.random() < 0.2) {
      this.spawnEnemy();
    }

    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];
      const dir = new THREE.Vector3().subVectors(this.heroPos, e.mesh.position).normalize();
      e.mesh.position.addScaledVector(dir, dt * e.speed);

      if (e.mesh.position.distanceTo(this.heroPos) < 1.2) {
        this.hp -= dt * 25;
        this.playSound('hurt');
        if (navigator.vibrate) navigator.vibrate(15);
      }

      if (e.hp <= 0) {
        this.spawnXPOrb(e.mesh.position, e.isBoss);
        this.score += e.isBoss ? 100 : 10;
        this.scene.remove(e.mesh);
        this.enemies.splice(i, 1);
      }
    }

    for (let i = this.xpOrbs.length - 1; i >= 0; i--) {
      const orb = this.xpOrbs[i];
      const dist = orb.mesh.position.distanceTo(this.heroPos);

      if (dist < 6) {
        const dir = new THREE.Vector3().subVectors(this.heroPos, orb.mesh.position).normalize();
        orb.mesh.position.addScaledVector(dir, dt * 15);
      }

      if (dist < 1.2) {
        this.xp += orb.val;
        this.coinsEarned += orb.coins;
        this.playSound('xp');
        this.scene.remove(orb.mesh);
        this.xpOrbs.splice(i, 1);
      }
    }

    if (this.xp >= this.nextLevelXp) {
      this.triggerLevelUp();
    }

    const txtScore = document.getElementById('txt-score');
    if (txtScore) txtScore.innerText = this.score;
    const txtCoins = document.getElementById('txt-coins');
    if (txtCoins) txtCoins.innerText = this.coinsEarned;
    const txtLvl = document.getElementById('txt-lvl');
    if (txtLvl) txtLvl.innerText = this.level;

    const barHp = document.getElementById('bar-hp');
    if (barHp) barHp.style.width = `${Math.max(0, (this.hp / this.maxHp) * 100)}%`;
    const barXp = document.getElementById('bar-xp');
    if (barXp) barXp.style.width = `${Math.min(100, (this.xp / this.nextLevelXp) * 100)}%`;

    if (this.hp <= 0) {
      this.triggerGameOver();
    }
  }

  animate() {
    if (!this.running) return;
    const dt = Math.min(this.clock.getDelta(), 0.05);
    this.updateGame(dt);
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.animate);
  }

  // NETTOYAGE STRICT DE TOUS LES ÉCOUTEURS DE FENÊTRE POUR RESSORTIR AU HUB SANS BLOQUER LES CLICS
  destroy() {
    this.running = false;

    window.removeEventListener('touchmove', this.handleMove);
    window.removeEventListener('touchend', this.handleEnd);
    window.removeEventListener('touchcancel', this.handleEnd);
    window.removeEventListener('mousemove', this.handleMove);
    window.removeEventListener('mouseup', this.handleEnd);

    if (this.audioCtx) {
      try { this.audioCtx.close(); } catch(e) {}
    }

    if (this.scene) {
      this.scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(mat => mat.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
    }

    if (this.ui && this.ui.parentNode) this.ui.parentNode.removeChild(this.ui);
    this.renderer.dispose();
  }
}