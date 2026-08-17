import * as THREE from 'three';

export class BilliardsGame {
  constructor(canvas, onWin) {
    this.canvas = canvas;
    this.onWin = onWin;
    this.running = true;

    this.mode = 'ai'; // 'ai' ou '2p'
    this.aiLevel = 2; // 1: Facile, 2: Moyen, 3: Senior/Pro
    this.isSeniorMode = false;
    this.soundEnabled = true;

    this.turn = 'white'; // 'white' (P1) ou 'black' (P2/IA)
    this.shotBy = 'white'; // GARANTIT L'AUTEUR DU TIR
    this.aiThinking = false;
    this.aiState = 'idle'; // 'idle', 'thinking', 'aiming', 'ready', 'striking'
    this.aiTargetAngle = 0;
    this.aiTargetPower = 0.5;
    this.aiTimer = null; // GESTIONNAIRE STRICT ANTI-DOUBLE TIR

    // RÈGLES OFFICIELLES 8-BALL
    this.p1Group = null; // 'solid' ou 'stripe'
    this.p2Group = null; // 'solid' ou 'stripe'
    this.pocketedThisTurn = [];
    this.cueBallFoul = false;

    this.cueBall = null;
    this.balls = [];
    this.pockets = [];

    this.aimAngle = 0;
    this.shotPower = 0.5;
    this.isAiming = true;
    this.isStriking = false;
    this.strikeAnimProgress = 0;

    this.coinsEarned = 0;

    this.audioCtx = null;
    this.raycaster = new THREE.Raycaster();

    const globalBack = document.getElementById('btn-back-hub');
    if (globalBack) globalBack.style.display = 'none';

    this.initSettingsModal();
  }

  clearAITimers() {
    if (this.aiTimer) {
      clearTimeout(this.aiTimer);
      this.aiTimer = null;
    }
  }

  initAudio() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) this.audioCtx = new AudioContext();
    }
  }

  playSound(type, velocity = 1) {
    if (!this.soundEnabled) return;
    this.initAudio();
    if (!this.audioCtx) return;

    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      const now = this.audioCtx.currentTime;

      if (type === 'hit') {
        osc.type = 'triangle';
        const freq = 360 + Math.min(velocity * 550, 850);
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.09);
        gain.gain.setValueAtTime(Math.min(velocity * 0.5, 0.5), now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.09);
        osc.start(now);
        osc.stop(now + 0.09);
      } else if (type === 'cue') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(280, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.12);
        gain.gain.setValueAtTime(0.5, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === 'pocket') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(170, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.25);
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === 'win') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523, now);
        osc.frequency.setValueAtTime(659, now + 0.1);
        osc.frequency.setValueAtTime(784, now + 0.2);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (type === 'crash') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(25, now + 0.35);
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      }
    } catch (e) {
      console.warn("Audio error", e);
    }
  }

  initSettingsModal() {
    this.modal = document.createElement('div');
    this.modal.id = 'billiards-modal';
    this.modal.innerHTML = `
      <style>
        .bil-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100dvh; background: rgba(3, 3, 10, 0.96); z-index: 2000; display: flex; flex-direction: column; align-items: center; justify-content: center; backdrop-filter: blur(20px); padding: 20px; color: #fff; box-sizing: border-box; }
        .bil-title { font-size: 1.8rem; font-weight: 900; color: #34d399; text-transform: uppercase; letter-spacing: 3px; margin-bottom: 25px; text-shadow: 0 4px 12px rgba(0,0,0,0.5); text-align: center; }
        .bil-group { width: 100%; max-width: 380px; margin-bottom: 18px; }
        .bil-group label { display: block; font-size: 0.75rem; color: #94a3b8; margin-bottom: 10px; text-transform: uppercase; font-weight: 800; letter-spacing: 1.5px; }
        .bil-opts { display: flex; gap: 10px; }
        .bil-btn { flex: 1; padding: 14px 8px; background: #1e293b; border: 1px solid #334155; border-radius: 12px; color: #94a3b8; font-size: 0.85rem; font-weight: 700; cursor: pointer; text-align: center; transition: all 0.25s ease; }
        .bil-btn.active { border-color: #34d399; background: #0f172a; color: #34d399; box-shadow: 0 4px 12px rgba(52, 211, 153, 0.25); }
        .bil-start { margin-top: 22px; width: 100%; max-width: 380px; padding: 16px; background: linear-gradient(135deg, #059669, #0d9488); border: none; border-radius: 25px; color: #fff; font-weight: 900; font-size: 1rem; text-transform: uppercase; cursor: pointer; letter-spacing: 2px; box-shadow: 0 8px 20px rgba(5, 150, 105, 0.3); transition: transform 0.2s; }
        .bil-start:active { transform: scale(0.98); }
      </style>

      <div class="bil-overlay">
        <h2 class="bil-title">BILLARD 3D PRO — 8-BALL</h2>
        
        <div class="bil-group">
          <label>MODE DE JEU</label>
          <div class="bil-opts">
            <div class="bil-btn active" id="opt-mode-ai">vs Robot IA</div>
            <div class="bil-btn" id="opt-mode-2p">2 Joueurs (Local)</div>
          </div>
        </div>

        <div class="bil-group" id="ai-level-group">
          <label>NIVEAU DE L'IA</label>
          <div class="bil-opts">
            <div class="bil-btn" id="opt-lvl-1">Facile</div>
            <div class="bil-btn active" id="opt-lvl-2">Moyen</div>
            <div class="bil-btn" id="opt-lvl-3">Senior / Pro 🔥</div>
          </div>
        </div>

        <div class="bil-group">
          <label>AIDE À LA VISÉE</label>
          <div class="bil-opts">
            <div class="bil-btn active" id="opt-guide-on">Lignes Laser 🟢</div>
            <div class="bil-btn" id="opt-guide-off">Mode Senior (Sans Ligne) 🎯</div>
          </div>
        </div>

        <button class="bil-start" id="btn-start-billiards">COMMENCER LA PARTIE 🎱</button>
      </div>
    `;

    document.body.appendChild(this.modal);

    const setupOpt = (ids, callback) => {
      ids.forEach(id => {
        document.getElementById(id)?.addEventListener('click', (e) => {
          ids.forEach(i => document.getElementById(i)?.classList.remove('active'));
          e.currentTarget.classList.add('active');
          callback(id);
        });
      });
    };

    setupOpt(['opt-mode-ai', 'opt-mode-2p'], (id) => {
      this.mode = id === 'opt-mode-ai' ? 'ai' : '2p';
      const aiGrp = document.getElementById('ai-level-group');
      if (aiGrp) aiGrp.style.display = this.mode === 'ai' ? 'block' : 'none';
    });

    setupOpt(['opt-lvl-1', 'opt-lvl-2', 'opt-lvl-3'], (id) => {
      this.aiLevel = id === 'opt-lvl-1' ? 1 : id === 'opt-lvl-2' ? 2 : 3;
    });

    setupOpt(['opt-guide-on', 'opt-guide-off'], (id) => {
      this.isSeniorMode = id === 'opt-guide-off';
    });

    document.getElementById('btn-start-billiards')?.addEventListener('click', () => {
      this.initAudio();
      document.body.removeChild(this.modal);
      this.startGame();
    });
  }

  startGame() {
    this.clearAITimers();
    this.p1Group = null;
    this.p2Group = null;
    this.pocketedThisTurn = [];
    this.cueBallFoul = false;
    this.turn = 'white';
    this.shotBy = 'white';

    this.aiThinking = false;
    this.aiState = 'idle';

    this.initScene();
    this.initUI();
    this.buildTableAndWorld();
    this.buildBalls();
    this.buildCueStickAndPredictor();

    this.onResize = this.onResize.bind(this);
    window.addEventListener('resize', this.onResize);

    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  initScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x050512);

    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(0, 24, 15);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, powerPreference: "high-performance" });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x059669, 2.2);
    const sunLight = new THREE.DirectionalLight(0xffffff, 2.5);
    sunLight.position.set(10, 30, 15);
    this.scene.add(hemiLight, sunLight);
  }

  buildTableAndWorld() {
    const tableGroup = new THREE.Group();

    const feltGeo = new THREE.BoxGeometry(10, 0.6, 20);
    const feltMat = new THREE.MeshStandardMaterial({ color: 0x059669, roughness: 0.5 });
    const felt = new THREE.Mesh(feltGeo, feltMat);
    felt.position.y = -0.3;
    tableGroup.add(felt);

    const frameMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.3, metalness: 0.2 });
    
    const railL = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 21.6), frameMat);
    railL.position.set(-5.4, 0.1, 0);
    const railR = railL.clone(); railR.position.x = 5.4;

    const railT = new THREE.Mesh(new THREE.BoxGeometry(11.6, 0.8, 0.8), frameMat);
    railT.position.set(0, 0.1, -10.4);
    const railB = railT.clone(); railB.position.z = 10.4;

    tableGroup.add(railL, railR, railT, railB);

    const pocketPositions = [
      { x: -4.8, z: -9.8 }, { x: 4.8, z: -9.8 },
      { x: -4.8, z: 0 },    { x: 4.8, z: 0 },
      { x: -4.8, z: 9.8 },  { x: 4.8, z: 9.8 }
    ];

    const pocketMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    pocketPositions.forEach(pos => {
      const pMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.65, 0.7, 16), pocketMat);
      pMesh.position.set(pos.x, 0.01, pos.z);
      tableGroup.add(pMesh);
      this.pockets.push({ x: pos.x, z: pos.z, radius: 0.75 });
    });

    this.scene.add(tableGroup);
  }

  // --- TEXTURES PRO AVEC MACARON ULTRA LISIBLE DE HAUT ---
  createBallTexture(num, colorHex, isStripe, isCue) {
    if (isCue) return null;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    const colorStr = '#' + new THREE.Color(colorHex).getHexString();

    if (isStripe) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 512, 256);

      ctx.fillStyle = colorStr;
      ctx.fillRect(0, 48, 512, 160);
    } else {
      ctx.fillStyle = colorStr;
      ctx.fillRect(0, 0, 512, 256);
    }

    const drawBadge = (cx, cy) => {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cx, cy, 52, 0, Math.PI * 2);
      ctx.fill();

      ctx.lineWidth = 5;
      ctx.strokeStyle = '#000000';
      ctx.stroke();

      ctx.fillStyle = '#000000';
      ctx.font = 'bold 56px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(num.toString(), cx, cy + 2);
    };

    drawBadge(128, 128);
    drawBadge(384, 128);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    return texture;
  }

  buildBalls() {
    this.balls = [];
    this.cueBall = this.createBall(0, 0xffffff, 0, 4.2, true);

    const startZ = -4.5;
    const radius = 0.35;
    const spacing = radius * 2.05;

    const rackPattern = [
      1,
      2, 9,
      3, 8, 10,
      11, 4, 12, 5,
      6, 13, 7, 14, 15
    ];

    const ballColors = {
      1: 0xf59e0b, 2: 0x3b82f6, 3: 0xef4444, 4: 0xa855f7, 5: 0xf97316, 6: 0x10b981, 7: 0xb91c1c,
      8: 0x0f172a,
      9: 0xf59e0b, 10: 0x3b82f6, 11: 0xef4444, 12: 0xa855f7, 13: 0xf97316, 14: 0x10b981, 15: 0xb91c1c
    };

    let idx = 0;
    for (let r = 0; r < 5; r++) {
      const rowY = startZ - (r * spacing * 0.88);
      const rowStartX = -(r * spacing) / 2;

      for (let c = 0; c <= r; c++) {
        const x = rowStartX + (c * spacing);
        const num = rackPattern[idx++];
        const color = ballColors[num] || 0xffffff;
        this.createBall(num, color, x, rowY, false);
      }
    }
  }

  createBall(num, colorHex, x, z, isCue = false) {
    const geo = new THREE.SphereGeometry(0.35, 32, 32);
    const isStripe = num >= 9 && num <= 15;
    const texture = this.createBallTexture(num, colorHex, isStripe, isCue);

    const mat = new THREE.MeshStandardMaterial({
      color: isCue ? 0xffffff : (texture ? 0xffffff : colorHex),
      map: texture || null,
      roughness: 0.15,
      metalness: 0.1
    });

    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, 0.35, z);
    mesh.rotation.x = Math.PI / 2.5; // Oriente le chiffre directement face à la caméra
    this.scene.add(mesh);

    const ballData = {
      mesh,
      num,
      isCue,
      type: isCue ? 'cue' : (num === 8 ? 'black' : (num <= 7 ? 'solid' : 'stripe')),
      vel: new THREE.Vector3(0, 0, 0),
      radius: 0.35,
      inPocket: false
    };

    this.balls.push(ballData);
    return ballData;
  }

  buildCueStickAndPredictor() {
    const stickGeo = new THREE.CylinderGeometry(0.04, 0.1, 10, 16);
    stickGeo.translate(0, -5, 0); // Origine (0,0,0) calée à la POINTE
    stickGeo.rotateX(Math.PI / 2);

    const stickMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.3 });
    this.cueStickMesh = new THREE.Mesh(stickGeo, stickMat);
    this.scene.add(this.cueStickMesh);

    const lineGeo = new THREE.BufferGeometry();
    const lineMat = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 3 });
    this.aimLine = new THREE.Line(lineGeo, lineMat);
    this.scene.add(this.aimLine);

    const ghostGeo = new THREE.RingGeometry(0.32, 0.38, 24);
    ghostGeo.rotateX(-Math.PI / 2);
    const ghostMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide });
    this.ghostCircle = new THREE.Mesh(ghostGeo, ghostMat);
    this.ghostCircle.visible = false;
    this.scene.add(this.ghostCircle);

    const targetLineGeo = new THREE.BufferGeometry();
    const targetLineMat = new THREE.LineBasicMaterial({ color: 0xf59e0b, linewidth: 3 });
    this.targetAimLine = new THREE.Line(targetLineGeo, targetLineMat);
    this.scene.add(this.targetAimLine);

    const bounceLineGeo = new THREE.BufferGeometry();
    const bounceLineMat = new THREE.LineBasicMaterial({ color: 0x34d399, linewidth: 3 });
    this.bounceLine = new THREE.Line(bounceLineGeo, bounceLineMat);
    this.scene.add(this.bounceLine);
  }

  updateCueStickPosition() {
    if (!this.cueBall || this.cueBall.inPocket || !this.isAiming || !this.running) {
      if (this.cueStickMesh) this.cueStickMesh.visible = false;
      return;
    }

    this.cueStickMesh.visible = true;
    const C = this.cueBall.mesh.position;
    const dir = new THREE.Vector3(Math.sin(this.aimAngle), 0, -Math.cos(this.aimAngle)).normalize();

    const gap = 0.4 + (this.shotPower * 1.8);
    const tipPos = C.clone().sub(dir.clone().multiplyScalar(gap));

    this.cueStickMesh.position.copy(tipPos);
    this.cueStickMesh.lookAt(C.x, C.y, C.z);
  }

  updateTrajectoryPredictor() {
    if (!this.cueBall || this.cueBall.inPocket || !this.isAiming || !this.running) return;

    if (this.isSeniorMode) {
      this.aimLine.visible = false;
      this.ghostCircle.visible = false;
      this.targetAimLine.visible = false;
      this.bounceLine.visible = false;
      return;
    }

    const origin = this.cueBall.mesh.position.clone();
    const dir = new THREE.Vector3(Math.sin(this.aimAngle), 0, -Math.cos(this.aimAngle)).normalize();

    let closestHitDist = 22.0;
    let hitBall = null;
    let hitCushion = null;

    this.balls.forEach(target => {
      if (target.isCue || target.inPocket) return;

      const toTarget = new THREE.Vector3().subVectors(target.mesh.position, origin);
      const projDist = toTarget.dot(dir);

      if (projDist > 0) {
        const perpDistSq = toTarget.lengthSq() - (projDist * projDist);
        const collisionThresholdSq = (this.cueBall.radius + target.radius) ** 2;

        if (perpDistSq < collisionThresholdSq) {
          const hitDist = projDist - Math.sqrt(collisionThresholdSq - perpDistSq);
          if (hitDist > 0 && hitDist < closestHitDist) {
            closestHitDist = hitDist;
            hitBall = target;
            hitCushion = null;
          }
        }
      }
    });

    let wallDistX = Infinity;
    if (dir.x > 0) wallDistX = (4.65 - origin.x) / dir.x;
    else if (dir.x < 0) wallDistX = (-4.65 - origin.x) / dir.x;

    let wallDistZ = Infinity;
    if (dir.z > 0) wallDistZ = (9.65 - origin.z) / dir.z;
    else if (dir.z < 0) wallDistZ = (-9.65 - origin.z) / dir.z;

    const closestWallDist = Math.min(wallDistX, wallDistZ);

    if (closestWallDist < closestHitDist) {
      closestHitDist = closestWallDist;
      hitBall = null;
      hitCushion = wallDistX < wallDistZ ? 'x' : 'z';
    }

    const hitPoint = origin.clone().addScaledVector(dir, closestHitDist);

    this.aimLine.position.set(0, 0, 0);
    this.aimLine.rotation.set(0, 0, 0);
    this.aimLine.geometry.dispose();
    this.aimLine.geometry = new THREE.BufferGeometry().setFromPoints([origin, hitPoint]);
    this.aimLine.visible = true;

    if (hitBall) {
      this.ghostCircle.position.copy(hitPoint);
      this.ghostCircle.position.y = 0.36;
      this.ghostCircle.visible = true;

      const targetDir = new THREE.Vector3().subVectors(hitBall.mesh.position, hitPoint).normalize();
      const targetEndPoint = hitBall.mesh.position.clone().addScaledVector(targetDir, 5.0);

      this.targetAimLine.position.set(0, 0, 0);
      this.targetAimLine.rotation.set(0, 0, 0);
      this.targetAimLine.geometry.dispose();
      this.targetAimLine.geometry = new THREE.BufferGeometry().setFromPoints([hitBall.mesh.position, targetEndPoint]);
      this.targetAimLine.visible = true;

      this.bounceLine.visible = false;
    } else if (hitCushion) {
      const bounceDir = dir.clone();
      if (hitCushion === 'x') bounceDir.x *= -1;
      if (hitCushion === 'z') bounceDir.z *= -1;

      const bounceEnd = hitPoint.clone().addScaledVector(bounceDir, 5.0);

      this.bounceLine.position.set(0, 0, 0);
      this.bounceLine.rotation.set(0, 0, 0);
      this.bounceLine.geometry.dispose();
      this.bounceLine.geometry = new THREE.BufferGeometry().setFromPoints([hitPoint, bounceEnd]);
      this.bounceLine.visible = true;

      this.ghostCircle.visible = false;
      this.targetAimLine.visible = false;
    }
  }

  initUI() {
    this.ui = document.createElement('div');
    this.ui.id = 'billiards-ui';
    this.ui.innerHTML = `
      <style>
        .hud-top {
          position: fixed; top: max(10px, env(safe-area-inset-top)); left: 50%; transform: translateX(-50%);
          width: 92%; max-width: 480px; z-index: 1000; display: flex; flex-direction: column; gap: 6px;
        }
        .hud-row-top { display: flex; justify-content: space-between; align-items: center; width: 100%; }
        .custom-back-btn {
          background: rgba(15, 23, 42, 0.92); border: 1px solid #34d399;
          color: #fff; border-radius: 10px; padding: 6px 12px; font-size: 0.8rem; font-weight: bold;
          cursor: pointer; backdrop-filter: blur(8px);
        }
        .hud-stats-card {
          display: flex; gap: 10px; align-items: center; color: #fff;
          font-family: monospace; font-weight: bold; font-size: 0.78rem;
          background: rgba(15, 23, 42, 0.92); padding: 6px 12px; border-radius: 10px; border: 1px solid #34d399;
          backdrop-filter: blur(8px);
        }
        .icon-btn-sound { background: #1e293b; border: 1px solid #334155; color: #fff; padding: 3px 6px; border-radius: 6px; cursor: pointer; font-size: 0.8rem; }
        .power-vertical-container {
          position: fixed; right: max(6px, env(safe-area-inset-right)); top: 50%; transform: translateY(-50%);
          width: 32px; height: 210px; background: rgba(15, 23, 42, 0.55); border: 1.5px solid rgba(52, 211, 153, 0.5);
          border-radius: 20px; display: flex; flex-direction: column; align-items: center;
          justify-content: space-between; padding: 10px 0; z-index: 1000; backdrop-filter: blur(4px);
          pointer-events: auto; touch-action: none;
        }
        .power-track { width: 6px; height: 150px; background: rgba(255,255,255,0.15); border-radius: 3px; position: relative; }
        .power-fill-v { position: absolute; bottom: 0; width: 100%; height: 50%; background: linear-gradient(0deg, #34d399, #f59e0b, #f43f5e); border-radius: 3px; }
        .power-knob-v { position: absolute; bottom: 50%; left: 50%; transform: translate(-50%, 50%); width: 18px; height: 18px; border-radius: 50%; background: #34d399; box-shadow: 0 0 10px #34d399; cursor: pointer; }
        .controls-panel {
          position: fixed; bottom: max(16px, env(safe-area-inset-bottom)); left: 50%; transform: translateX(-50%);
          width: 92%; max-width: 440px; z-index: 1000; display: flex; justify-content: space-between; align-items: center;
          pointer-events: none;
        }
        .aim-group { display: flex; gap: 10px; pointer-events: auto; }
        .aim-btn { width: 55px; height: 55px; border-radius: 50%; background: rgba(15, 23, 42, 0.92); border: 2px solid #34d399; color: #fff; font-size: 1.4rem; display: flex; align-items: center; justify-content: center; cursor: pointer; user-select: none; touch-action: none; }
        .btn-shoot { padding: 14px 24px; background: linear-gradient(135deg, #059669, #0d9488); border: none; border-radius: 25px; color: #fff; font-weight: 900; font-size: 0.9rem; cursor: pointer; text-transform: uppercase; pointer-events: auto; box-shadow: 0 4px 15px rgba(0,0,0,0.4); }
        .modal { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(15, 23, 42, 0.97); border: 1px solid #34d399; padding: 25px; border-radius: 20px; text-align: center; z-index: 3000; display: none; box-shadow: 0 10px 30px rgba(0,0,0,0.8); width: 85%; max-width: 360px; color: #fff; backdrop-filter: blur(10px); }
        .modal button { margin-top: 18px; padding: 14px 24px; background: linear-gradient(135deg, #059669, #0d9488); color: #fff; font-weight: 800; border: none; border-radius: 25px; font-size: 0.95rem; text-transform: uppercase; cursor: pointer; }
        .btn-replay { background: #34d399; color: #0f172a; border: none; }
        .btn-hub-modal { background: #1e293b; color: #fff; border: 1px solid #334155; }
        .btn-toggle-view { width: 100%; background: rgba(52, 211, 153, 0.15); border: 1px solid #34d399; color: #34d399; margin-top: 8px; }
      </style>

      <div class="hud-top">
        <div class="hud-row-top">
          <button class="custom-back-btn" id="btn-back-billiards">◀ Quitter</button>
          <div class="hud-stats-card">
            <span id="txt-turn" style="color:#34d399;">TOUR : JOUEUR 1</span>
            <span id="txt-score-hud" style="color:#fbbf24; font-size:0.75rem;">J1 [Libre]: 0/7 | 0/7 : [Libre] IA</span>
            <span><button class="icon-btn-sound" id="btn-sound">🔊</button></span>
          </div>
        </div>
      </div>

      <div class="power-vertical-container" id="power-container">
        <span style="font-size:0.5rem; color:#38bdf8; font-weight:900;">⚡</span>
        <div class="power-track">
          <div class="power-fill-v" id="power-fill" style="height: 50%;"></div>
          <div class="power-knob-v" id="power-knob" style="bottom: 50%;"></div>
        </div>
        <span style="font-size:0.5rem; color:#94a3b8; font-weight:900;">MIN</span>
      </div>

      <div class="controls-panel">
        <div class="aim-group">
          <div class="aim-btn" id="btn-aim-left">↺</div>
          <div class="aim-btn" id="btn-aim-right">↻</div>
        </div>

        <button class="btn-shoot" id="btn-shoot">FRAPPER 🎱</button>
      </div>

      <div class="modal" id="win-modal">
        <h2 style="color:#34d399; font-size:1.5rem; margin-bottom:8px;" id="win-title">VICTOIRE ! 🏆</h2>
        <p style="color:#cbd5e1; font-size:0.85rem; margin-bottom:12px;" id="win-sub">Félicitations !</p>
        <div style="display:flex; gap:10px; margin-top:12px;">
          <button class="btn-replay" id="btn-replay" style="flex:1;">REJOUER 🔄</button>
          <button class="btn-hub-modal" id="btn-hub-bill" style="flex:1;">MENU 🏠</button>
        </div>
        <button class="btn-toggle-view" id="btn-inspect-bill">👁️ VOIR LE PLATEAU</button>
      </div>
    `;

    document.body.appendChild(this.ui);

    document.getElementById('btn-back-billiards')?.addEventListener('click', () => {
      this.destroy();
      this.onWin();
    });

    document.getElementById('btn-sound')?.addEventListener('click', () => {
      this.soundEnabled = !this.soundEnabled;
      const soundBtn = document.getElementById('btn-sound');
      if (soundBtn) soundBtn.innerText = this.soundEnabled ? '🔊' : '🔇';
    });

    document.getElementById('btn-replay')?.addEventListener('click', () => {
      document.getElementById('win-modal').style.display = 'none';
      this.startGame();
    });

    document.getElementById('btn-hub-bill')?.addEventListener('click', () => {
      this.destroy();
      this.onWin();
    });

    document.getElementById('btn-inspect-bill')?.addEventListener('click', () => {
      const modal = document.getElementById('win-modal');
      if (modal) {
        modal.style.opacity = modal.style.opacity === '0.15' ? '1' : '0.15';
      }
    });

    const powerBox = document.getElementById('power-container');
    const powerFill = document.getElementById('power-fill');
    const powerKnob = document.getElementById('power-knob');

    const handlePowerDrag = (e) => {
      if (!this.isAiming || this.areBallsMoving() || this.isStriking || (this.mode === 'ai' && this.turn === 'black')) return;
      const touch = e.touches ? e.touches[0] : e;
      const rect = powerBox.getBoundingClientRect();
      const pct = Math.min(100, Math.max(10, ((rect.bottom - touch.clientY) / rect.height) * 100));
      
      this.shotPower = pct / 100;
      if (powerFill) powerFill.style.height = `${pct}%`;
      if (powerKnob) powerKnob.style.bottom = `${pct}%`;
    };

    if (powerBox) {
      powerBox.addEventListener('touchstart', (e) => { if (e.cancelable) e.preventDefault(); handlePowerDrag(e); }, { passive: false });
      powerBox.addEventListener('touchmove', (e) => { if (e.cancelable) e.preventDefault(); handlePowerDrag(e); }, { passive: false });
      powerBox.addEventListener('mousedown', handlePowerDrag);
    }

    let aimInterval = null;
    const bindAim = (id, deltaAngle) => {
      const el = document.getElementById(id);
      if (!el) return;
      const start = (e) => {
        if (e.cancelable) e.preventDefault();
        if (this.mode === 'ai' && this.turn === 'black') return;
        aimInterval = setInterval(() => { this.aimAngle += deltaAngle; }, 20);
      };
      const stop = (e) => {
        if (e.cancelable) e.preventDefault();
        clearInterval(aimInterval);
      };
      el.addEventListener('touchstart', start, { passive: false });
      el.addEventListener('touchend', stop, { passive: false });
      el.addEventListener('mousedown', start);
      el.addEventListener('mouseup', stop);
    };

    bindAim('btn-aim-left', -0.02);
    bindAim('btn-aim-right', 0.02);

    const shootBtn = document.getElementById('btn-shoot');
    if (shootBtn) {
      shootBtn.addEventListener('click', () => {
        if (this.isAiming && !this.areBallsMoving() && !this.isStriking && !(this.mode === 'ai' && this.turn === 'black')) {
          this.executeShotAnimation();
        }
      });
    }
  }

  executeShotAnimation() {
    this.isStriking = true;
    this.strikeAnimProgress = 0;
    this.aimLine.visible = false;
    this.ghostCircle.visible = false;
    this.targetAimLine.visible = false;
    this.bounceLine.visible = false;
  }

  executeShot() {
    this.clearAITimers();
    this.isAiming = false;
    this.isStriking = false;
    this.shotBy = this.turn;
    
    this.playSound('cue');

    const force = 0.85 * this.shotPower;

    this.cueBall.vel.x = Math.sin(this.aimAngle) * force;
    this.cueBall.vel.z = -Math.cos(this.aimAngle) * force;

    this.cueStickMesh.visible = false;
  }

  respawnCueBall() {
    if (!this.cueBall) return;
    
    let safeX = 0;
    let safeZ = 5.0;
    let overlap = true;
    let attempt = 0;

    while (overlap && attempt < 20) {
      overlap = false;
      const testPos = new THREE.Vector3(safeX, 0.35, safeZ);
      for (const b of this.balls) {
        if (b.isCue || b.inPocket) continue;
        if (b.mesh.position.distanceTo(testPos) < (this.cueBall.radius + b.radius + 0.1)) {
          overlap = true;
          safeX += 0.5;
          if (safeX > 4.0) safeX = -4.0;
          break;
        }
      }
      attempt++;
    }

    this.cueBall.inPocket = false;
    this.cueBall.vel.set(0, 0, 0);
    this.cueBall.mesh.position.set(safeX, 0.35, safeZ);
    this.cueBall.mesh.visible = true;
  }

  isPathBlocked(p1, p2, ignoreBalls = []) {
    const dir = new THREE.Vector3().subVectors(p2, p1);
    const len = dir.length();
    dir.normalize();

    for (const b of this.balls) {
      if (b.inPocket || ignoreBalls.includes(b)) continue;
      const toB = new THREE.Vector3().subVectors(b.mesh.position, p1);
      const proj = toB.dot(dir);

      if (proj > 0.2 && proj < len - 0.2) {
        const perpSq = toB.lengthSq() - proj * proj;
        if (perpSq < (b.radius * 2.1) ** 2) {
          return true;
        }
      }
    }
    return false;
  }

  calculateBestAIShot() {
    if (!this.cueBall) return { angle: this.aimAngle, power: 0.5 };

    const cuePos = this.cueBall.mesh.position;
    let aiGroup = this.p2Group;
    let targetBalls = [];

    if (!aiGroup) {
      targetBalls = this.balls.filter(b => !b.inPocket && !b.isCue && b.num !== 8);
    } else {
      const remainingGroupBalls = this.balls.filter(b => !b.inPocket && b.type === aiGroup);
      if (remainingGroupBalls.length > 0) {
        targetBalls = remainingGroupBalls;
      } else {
        targetBalls = this.balls.filter(b => !b.inPocket && b.num === 8);
      }
    }

    if (targetBalls.length === 0) {
      targetBalls = this.balls.filter(b => !b.inPocket && !b.isCue);
    }

    const candidateShots = [];

    targetBalls.forEach(target => {
      const tPos = target.mesh.position;

      this.pockets.forEach(pocket => {
        const pocketPos = new THREE.Vector3(pocket.x, 0, pocket.z);
        
        const dirToPocket = new THREE.Vector3().subVectors(pocketPos, tPos);
        const distToPocket = dirToPocket.length();
        dirToPocket.normalize();

        const ghostPos = tPos.clone().sub(dirToPocket.clone().multiplyScalar(target.radius * 2.0));

        const cueToGhost = new THREE.Vector3().subVectors(ghostPos, cuePos);
        const distCueToGhost = cueToGhost.length();
        const shotAngle = Math.atan2(cueToGhost.x, -cueToGhost.z);

        const dirCueToGhost = cueToGhost.clone().normalize();
        const cutAngleCos = dirCueToGhost.dot(dirToPocket);

        if (cutAngleCos < 0.12) return;

        if (this.aiLevel >= 2) {
          if (this.isPathBlocked(cuePos, ghostPos, [this.cueBall, target])) return;
          if (this.isPathBlocked(tPos, pocketPos, [target])) return;
        }

        let score = (cutAngleCos * 350) - (distToPocket * 3) - (distCueToGhost * 2);
        let reqPower = Math.min(1.0, Math.max(0.35, 0.4 + (distToPocket + distCueToGhost) * 0.04));

        if (this.aiLevel === 3) {
          score += cutAngleCos * 200;
          reqPower = Math.min(1.0, reqPower + 0.25);
        }

        candidateShots.push({ angle: shotAngle, power: reqPower, score });
      });
    });

    candidateShots.sort((a, b) => b.score - a.score);

    if (candidateShots.length > 0) {
      let best = candidateShots[0];

      if (this.aiLevel === 1) {
        best.angle += (Math.random() - 0.5) * 0.18;
        best.power = Math.min(0.8, Math.max(0.25, best.power + (Math.random() - 0.5) * 0.3));
      } else if (this.aiLevel === 2) {
        best.angle += (Math.random() - 0.5) * 0.035;
      } else if (this.aiLevel === 3) {
        best.angle += (Math.random() - 0.5) * 0.003;
      }

      return best;
    }

    const fallbackTarget = targetBalls[0];
    if (fallbackTarget) {
      const dx = fallbackTarget.mesh.position.x - cuePos.x;
      const dz = fallbackTarget.mesh.position.z - cuePos.z;
      let baseAngle = Math.atan2(dx, -dz);
      if (this.aiLevel === 1) baseAngle += (Math.random() - 0.5) * 0.08;
      return { angle: baseAngle, power: this.aiLevel === 3 ? 0.8 : 0.55 };
    }

    return { angle: this.aimAngle, power: 0.5 };
  }

  updatePhysics() {
    if (!this.running) return;

    const moving = this.areBallsMoving();

    if (this.isStriking) {
      this.strikeAnimProgress += 0.08;

      if (this.strikeAnimProgress <= 0.8) {
        const dir = new THREE.Vector3(Math.sin(this.aimAngle), 0, -Math.cos(this.aimAngle)).normalize();
        const C = this.cueBall.mesh.position;
        const gap = 0.4 + ((1.0 - (this.strikeAnimProgress / 0.8)) * (this.shotPower * 1.8));
        const tipPos = C.clone().sub(dir.clone().multiplyScalar(gap));

        this.cueStickMesh.position.copy(tipPos);
        this.cueStickMesh.lookAt(C.x, C.y, C.z);
      } else {
        this.executeShot();
      }
    }

    if (!moving && !this.isAiming && !this.isStriking) {
      this.evaluateTurnEnd();
    }

    if (this.mode === 'ai' && this.turn === 'black' && this.isAiming && !moving && !this.isStriking) {
      if (!this.aiThinking && this.aiState === 'idle') {
        this.aiThinking = true;
        this.aiState = 'thinking';
        
        const txtTurn = document.getElementById('txt-turn');
        if (txtTurn) txtTurn.innerText = `ROBOT IA RÉFLÉCHIT (Calcul)... 🤖`;

        this.clearAITimers();
        this.aiTimer = setTimeout(() => {
          if (!this.running || this.turn !== 'black') return;
          const bestShot = this.calculateBestAIShot();
          
          let angleDiff = bestShot.angle - this.aimAngle;
          while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
          while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
          
          this.aiTargetAngle = this.aimAngle + angleDiff;
          this.aiTargetPower = bestShot.power;
          
          this.aiState = 'aiming';
          if (txtTurn) txtTurn.innerText = `ROBOT IA AJUSTE LA VISÉE... 🎯`;
        }, 1000);
      }

      if (this.aiState === 'aiming') {
        this.aimAngle = THREE.MathUtils.lerp(this.aimAngle, this.aiTargetAngle, 0.06);
        this.shotPower = THREE.MathUtils.lerp(this.shotPower, this.aiTargetPower, 0.06);

        const powerFill = document.getElementById('power-fill');
        const powerKnob = document.getElementById('power-knob');
        if (powerFill) powerFill.style.height = `${this.shotPower * 100}%`;
        if (powerKnob) powerKnob.style.bottom = `${this.shotPower * 100}%`;

        if (Math.abs(this.aimAngle - this.aiTargetAngle) < 0.01 && Math.abs(this.shotPower - this.aiTargetPower) < 0.01) {
          this.aimAngle = this.aiTargetAngle;
          this.shotPower = this.aiTargetPower;
          this.aiState = 'ready';

          const txtTurn = document.getElementById('txt-turn');
          if (txtTurn) txtTurn.innerText = `ROBOT IA PRÊT À FRAPPER ! 🎱`;

          this.clearAITimers();
          this.aiTimer = setTimeout(() => {
            if (this.running && this.turn === 'black') {
              this.executeShotAnimation();
            }
          }, 500);
        }
      }
    }

    if (this.isAiming && this.cueBall && !this.cueBall.inPocket) {
      this.updateCueStickPosition();
      this.updateTrajectoryPredictor();
    }

    const friction = 0.982;

    this.balls.forEach(b1 => {
      if (b1.inPocket) return;

      b1.mesh.position.x += b1.vel.x;
      b1.mesh.position.z += b1.vel.z;

      const speed = b1.vel.length();
      if (speed > 0.0001) {
        const axis = new THREE.Vector3(-b1.vel.z, 0, b1.vel.x).normalize();
        b1.mesh.rotateOnWorldAxis(axis, speed / b1.radius);
      }

      b1.vel.x *= friction;
      b1.vel.z *= friction;

      if (b1.vel.lengthSq() < 0.00005) {
        b1.vel.set(0, 0, 0);
      }

      if (Math.abs(b1.mesh.position.x) > 4.65) {
        b1.vel.x *= -0.85;
        b1.mesh.position.x = Math.sign(b1.mesh.position.x) * 4.65;
        this.playSound('hit', b1.vel.length());
      }
      if (Math.abs(b1.mesh.position.z) > 9.65) {
        b1.vel.z *= -0.85;
        b1.mesh.position.z = Math.sign(b1.mesh.position.z) * 9.65;
        this.playSound('hit', b1.vel.length());
      }

      this.balls.forEach(b2 => {
        if (b1 === b2 || b2.inPocket) return;

        const dist = b1.mesh.position.distanceTo(b2.mesh.position);
        const minDist = b1.radius + b2.radius;

        if (dist < minDist) {
          const normal = new THREE.Vector3().subVectors(b1.mesh.position, b2.mesh.position).normalize();
          const overlap = minDist - dist;
          b1.mesh.position.addScaledVector(normal, overlap * 0.5);
          b2.mesh.position.addScaledVector(normal, -overlap * 0.5);

          const relativeVelocity = new THREE.Vector3().subVectors(b1.vel, b2.vel);
          const velAlongNormal = relativeVelocity.dot(normal);

          if (velAlongNormal < 0) {
            const impulse = normal.multiplyScalar(-velAlongNormal * 0.95);
            b1.vel.add(impulse);
            b2.vel.sub(impulse);
            this.playSound('hit', impulse.length());
          }
        }
      });

      this.pockets.forEach(p => {
        const distP = Math.hypot(b1.mesh.position.x - p.x, b1.mesh.position.z - p.z);
        if (distP < p.radius) {
          this.pocketBall(b1);
        }
      });
    });
  }

  pocketBall(ball) {
    ball.inPocket = true;
    ball.vel.set(0, 0, 0);
    ball.mesh.position.set(0, -10, 0);
    this.playSound('pocket');

    if (ball.isCue) {
      this.cueBallFoul = true;
      setTimeout(() => {
        this.respawnCueBall();
      }, 300);
    } else {
      this.pocketedThisTurn.push(ball);
    }

    this.updateScoreHUD();

    if (ball.num === 8) {
      this.running = false;
      this.clearAITimers();
      
      const shooter = this.shotBy;
      const shooterGroup = shooter === 'white' ? this.p1Group : this.p2Group;
      const remainingGroupBalls = shooterGroup ? this.balls.filter(b => b.type === shooterGroup && !b.inPocket) : [1];

      const shooterName = shooter === 'white' ? "JOUEUR 1" : (this.mode === 'ai' ? "ROBOT IA" : "JOUEUR 2");
      const opponentName = shooter === 'white' ? (this.mode === 'ai' ? "ROBOT IA GAGNE ! 🤖" : "JOUEUR 2 GAGNE ! 🏆") : "JOUEUR 1 GAGNE ! 🏆";

      if (remainingGroupBalls.length > 0 || this.cueBallFoul) {
        this.playSound('crash');
        const cause = this.cueBallFoul ? "a empoché la Blanche avec la Bille 8" : "a empoché la Bille 8 trop tôt";
        
        setTimeout(() => {
          this.showEndModal("DÉFAITE PAR FAUTE ! 💥", `${shooterName} ${cause}. ${opponentName}`);
        }, 600);
      } else {
        this.playSound('win');
        this.coinsEarned += 150;
        const winnerTitle = shooter === 'white' ? "VICTOIRE DU JOUEUR 1 ! 🏆" : (this.mode === 'ai' ? "VICTOIRE DU ROBOT IA ! 🤖" : "VICTOIRE DU JOUEUR 2 ! 🏆");
        
        setTimeout(() => {
          this.showEndModal("VICTOIRE ! 🏆", winnerTitle);
        }, 600);
      }
    }
  }

  evaluateTurnEnd() {
    let keepTurn = false;
    let turnMsg = "";
    const shooter = this.shotBy;

    if (this.cueBallFoul) {
      this.playSound('crash');
      this.respawnCueBall();
      turnMsg = "FAUTE ! BILLE BLANCHE EMPOCHÉE 💥";
      keepTurn = false;
    } else {
      const validPocketed = this.pocketedThisTurn.filter(b => !b.isCue && b.num !== 8);

      if (validPocketed.length > 0) {
        if (!this.p1Group) {
          const firstBall = validPocketed[0];
          if (shooter === 'white') {
            this.p1Group = firstBall.type;
            this.p2Group = firstBall.type === 'solid' ? 'stripe' : 'solid';
          } else {
            this.p2Group = firstBall.type;
            this.p1Group = firstBall.type === 'solid' ? 'stripe' : 'solid';
          }
        }

        const shooterGroup = shooter === 'white' ? this.p1Group : this.p2Group;
        const pocketedOwnGroup = validPocketed.some(b => b.type === shooterGroup);

        if (pocketedOwnGroup) {
          keepTurn = true;
          turnMsg = "BILLE MARQUÉE ! REJOUE 🎱";
        } else {
          turnMsg = "CHANGEMENT DE TOUR";
        }
      }
    }

    this.pocketedThisTurn = [];
    this.cueBallFoul = false;
    this.updateScoreHUD();

    if (keepTurn) {
      this.isAiming = true;
      this.cueStickMesh.visible = true;
      this.aiThinking = false;
      this.aiState = 'idle';
      const txtTurn = document.getElementById('txt-turn');
      if (txtTurn) {
        txtTurn.innerText = `TOUR : ${this.turn === 'white' ? 'JOUEUR 1' : (this.mode === 'ai' ? `ROBOT IA (NV.${this.aiLevel})` : 'JOUEUR 2')} — ${turnMsg}`;
      }
    } else {
      this.switchTurn();
    }
  }

  // --- TEXTE DE SCORE EXPLICITE ET CLAIR (SANS ÉMOJIS TROMPEURS) ---
  updateScoreHUD() {
    const scoreHud = document.getElementById('txt-score-hud');
    if (!scoreHud) return;

    const solidsOnTable = this.balls.filter(b => !b.inPocket && b.type === 'solid').length;
    const stripesOnTable = this.balls.filter(b => !b.inPocket && b.type === 'stripe').length;

    const totalSolidsPocketed = Math.max(0, Math.min(7, 7 - solidsOnTable));
    const totalStripesPocketed = Math.max(0, Math.min(7, 7 - stripesOnTable));

    const j1Name = "J1";
    const j2Name = this.mode === 'ai' ? "IA" : "J2";

    let j1Score = 0;
    let j2Score = 0;
    let j1GrpText = "Libre";
    let j2GrpText = "Libre";

    if (this.p1Group === 'solid') {
      j1GrpText = "Pleines (1-7)";
      j1Score = totalSolidsPocketed;
      j2GrpText = "Rayées (9-15)";
      j2Score = totalStripesPocketed;
    } else if (this.p1Group === 'stripe') {
      j1GrpText = "Rayées (9-15)";
      j1Score = totalStripesPocketed;
      j2GrpText = "Pleines (1-7)";
      j2Score = totalSolidsPocketed;
    }

    scoreHud.innerText = `${j1Name} [${j1GrpText}]: ${j1Score}/7 | ${j2Score}/7 : [${j2GrpText}] ${j2Name}`;
  }

  // --- FERMETURE PROPRE DU JEU (MASQUE TOUT LE BÂTON ET LIGNES AU MODAL) ---
  showEndModal(title, sub) {
    this.running = false;
    this.isAiming = false;
    this.clearAITimers();

    if (this.cueStickMesh) this.cueStickMesh.visible = false;
    if (this.aimLine) this.aimLine.visible = false;
    if (this.ghostCircle) this.ghostCircle.visible = false;
    if (this.targetAimLine) this.targetAimLine.visible = false;
    if (this.bounceLine) this.bounceLine.visible = false;

    const txtTurn = document.getElementById('txt-turn');
    if (txtTurn) txtTurn.innerText = "PARTIE TERMINÉE 🏁";

    const titleEl = document.getElementById('win-title');
    if (titleEl) titleEl.innerText = title;
    const subEl = document.getElementById('win-sub');
    if (subEl) subEl.innerText = sub;
    const modal = document.getElementById('win-modal');
    if (modal) modal.style.display = 'block';
  }

  areBallsMoving() {
    return this.balls.some(b => !b.inPocket && b.vel.lengthSq() > 0.0001);
  }

  switchTurn() {
    this.clearAITimers();
    this.turn = this.turn === 'white' ? 'black' : 'white';
    this.aiThinking = false;
    this.aiState = 'idle';
    this.isAiming = true;
    this.cueStickMesh.visible = true;

    const txtTurn = document.getElementById('txt-turn');
    if (txtTurn) {
      txtTurn.innerText = `TOUR : ${this.turn === 'white' ? 'JOUEUR 1' : (this.mode === 'ai' ? `ROBOT IA (NV.${this.aiLevel})` : 'JOUEUR 2')}`;
    }
  }

  animate() {
    if (!this.running) return;
    this.updatePhysics();
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.animate);
  }

  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  destroy() {
    this.running = false;
    this.clearAITimers();
    window.removeEventListener('resize', this.onResize);
    const globalBack = document.getElementById('btn-back-hub');
    if (globalBack) globalBack.style.display = 'block';

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