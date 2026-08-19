import * as THREE from 'three';

export class CarGame {
  constructor(canvas, level, onLevelComplete, onRetry, onExitToSelector) {
    this.canvas = canvas;
    this.level = parseInt(level) || 1;
    this.onLevelComplete = onLevelComplete;
    this.onRetry = onRetry;
    this.onExitToSelector = onExitToSelector;
    this.running = true;
    this.isCountingDown = true;
    this.countdownStarted = false;

    this.clock = new THREE.Clock();

    // SÉCURITÉ NUMÉRIQUE ANTI-NaN
    this.speed = 0;
    const speedLevels = [0, 1.6, 1.8, 2.0, 2.2, 2.3, 2.4, 2.5, 2.6, 2.8, 3.1];
    this.maxSpeed = speedLevels[this.level] || 2.0;
    this.turnSpeed = 0.055;
    this.gear = 1;
    this.nitro = 100;

    this.carRot = 0;

    // BASCULE DE VUE CAMÉRA (0: Chasseuse, 1: Cockpit/Capot, 2: Aérienne)
    this.cameraMode = 0;

    // SCORE & BERTHOCOINS
    this.coinsEarned = 0;
    this.nearMissCombo = 0;
    this.nearMissNotifyTimer = 0;

    // RESPAWN UNIVERSEL
    this.isRespawning = false;
    this.respawnTimer = 0;

    const trackLengths = [0, 1800, 2400, 3000, 2800, 3600, 3200, 4200, 3800, 4800, 6000];
    this.totalTrackLength = trackLengths[this.level] || 2000;

    // Décollage au centre de l'asphalte (x = 0, z = 0)
    this.carPos = new THREE.Vector3(0, 0, 0);

    const timesList = [0, 120, 150, 180, 150, 210, 180, 240, 210, 270, 300];
    this.timeLeft = timesList[this.level] || 120;
    this.inputs = { gas: false, brake: false, left: false, right: false, nitro: false };

    this.checkpoints = [];
    this.currentCheckpoint = 0;
    this.trafficCars = [];
    this.rivalCars = [];
    this.wheels = [];
    this.speedParticles = [];

    this.audioCtx = null;
    this.engineOsc1 = null;
    this.engineOsc2 = null;
    this.engineFilter = null;
    this.engineGain = null;

    const globalBack = document.getElementById('btn-back-hub');
    if (globalBack) globalBack.style.display = 'none';

    this.requestLandscape();
    this.initScene();
    this.initTouchAndKeyboardUI();
    this.buildRoadNetwork();
    this.buildRealisticSupercar();
    this.buildSpeedLines();
    this.buildLevelScenario();

    this.onResize = this.onResize.bind(this);
    window.addEventListener('resize', this.onResize);

    if (this.isLandscape()) {
      this.startCountdown();
    }

    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  isLandscape() {
    return window.innerWidth > window.innerHeight;
  }

  requestLandscape() {
    try {
      if (screen.orientation && screen.orientation.lock) {
        screen.orientation.lock('landscape').catch(() => {});
      }
    } catch (e) {}
  }

  getRoadCurveX(z) {
    return Math.sin(z * 0.006) * 18 + (1 - Math.cos(z * 0.003)) * 12;
  }

  // --- AUDIO SYNTHESIS V8 PASSE-BAS ---
  initAudio() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();

        this.engineFilter = this.audioCtx.createBiquadFilter();
        this.engineFilter.type = 'lowpass';
        this.engineFilter.frequency.setValueAtTime(300, this.audioCtx.currentTime);

        this.engineOsc1 = this.audioCtx.createOscillator();
        this.engineOsc2 = this.audioCtx.createOscillator();
        this.engineGain = this.audioCtx.createGain();

        this.engineOsc1.type = 'sawtooth';
        this.engineOsc2.type = 'triangle';

        this.engineOsc1.frequency.setValueAtTime(50, this.audioCtx.currentTime);
        this.engineOsc2.frequency.setValueAtTime(25, this.audioCtx.currentTime);

        this.engineGain.gain.setValueAtTime(0, this.audioCtx.currentTime);

        this.engineOsc1.connect(this.engineFilter);
        this.engineOsc2.connect(this.engineFilter);
        this.engineFilter.connect(this.engineGain);
        this.engineGain.connect(this.audioCtx.destination);

        this.engineOsc1.start();
        this.engineOsc2.start();
      }
    }
  }

  updateEngineSound() {
    if (!this.audioCtx || !this.engineOsc1 || !this.running || !this.soundEnabled || this.isCountingDown) return;
    const safeSpeed = Number.isFinite(this.speed) ? Math.abs(this.speed) : 0;
    const speedRatio = safeSpeed / this.maxSpeed;
    const baseFreq = 45 + speedRatio * 180 + (this.gear * 15);
    const filterCutoff = 250 + speedRatio * 1400;

    this.engineOsc1.frequency.setTargetAtTime(baseFreq, this.audioCtx.currentTime, 0.05);
    this.engineOsc2.frequency.setTargetAtTime(baseFreq * 0.5, this.audioCtx.currentTime, 0.05);
    this.engineFilter.frequency.setTargetAtTime(filterCutoff, this.audioCtx.currentTime, 0.05);
  }

  stopEngineSound() {
    if (this.engineGain && this.audioCtx) {
      try {
        this.engineGain.gain.setTargetAtTime(0, this.audioCtx.currentTime, 0.05);
      } catch (e) {}
    }
  }

  resumeEngineSound() {
    if (this.engineGain && this.audioCtx && this.soundEnabled && !this.isCountingDown) {
      try {
        this.engineGain.gain.setTargetAtTime(0.08, this.audioCtx.currentTime, 0.05);
      } catch (e) {}
    }
  }

  playSound(type) {
    if (!this.audioCtx || !this.soundEnabled) return;
    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      const now = this.audioCtx.currentTime;

      if (type === 'turbo') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(2400, now + 0.3);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (type === 'beep') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(320, now);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (type === 'go') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(640, now);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (type === 'nearmiss') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(1760, now + 0.2);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (type === 'crash') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(20, now + 0.35);
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (type === 'checkpoint') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523, now);
        osc.frequency.setValueAtTime(659, now + 0.1);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      }
    } catch (e) {
      console.warn("Audio error", e);
    }
  }

  startCountdown() {
    if (this.countdownStarted) return;
    this.countdownStarted = true;

    let count = 3;
    const overlayEl = document.getElementById('hud-countdown');
    if (overlayEl) {
      overlayEl.innerText = `${count}`;
      overlayEl.style.display = 'flex';
    }

    const timer = setInterval(() => {
      count--;
      if (count > 0) {
        if (overlayEl) overlayEl.innerText = `${count}`;
        this.playSound('beep');
      } else if (count === 0) {
        if (overlayEl) overlayEl.innerText = "GO ! 🏁";
        this.playSound('go');
        this.resumeEngineSound();
      } else {
        clearInterval(timer);
        if (overlayEl) overlayEl.style.display = 'none';
        this.isCountingDown = false;
        this.startTimer();
      }
    }, 1000);
  }

  initScene() {
    this.scene = new THREE.Scene();
    
    let skyColor = 0x38bdf8;
    let fogColor = 0x93c5fd;

    if (this.level === 2) { skyColor = 0xf97316; fogColor = 0xd97706; }
    else if (this.level === 4) { skyColor = 0x030712; fogColor = 0x0f172a; }
    else if (this.level === 6) { skyColor = 0xfbe3b5; fogColor = 0xfcd34d; }
    else if (this.level === 7) { skyColor = 0x020617; fogColor = 0x020617; }
    else if (this.level === 9) { skyColor = 0x450a0a; fogColor = 0x991b1b; }

    this.scene.background = new THREE.Color(skyColor);
    this.scene.fog = new THREE.FogExp2(fogColor, 0.0016);

    this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(0, 1.5, 3.8);

    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, powerPreference: "high-performance" });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x15803d, 1.8);
    const sunLight = new THREE.DirectionalLight(0xfffbeb, 2.8);
    sunLight.position.set(60, 120, 40);
    this.scene.add(hemiLight, sunLight);
  }

  buildRoadNetwork() {
    const roadLength = this.totalTrackLength + 400;
    const roadSegments = Math.floor(roadLength / 10);

    const roadMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.4, metalness: 0.1 });
    const grassMat = new THREE.MeshStandardMaterial({ color: this.level === 6 ? 0xd97706 : 0x16a34a, roughness: 0.8 });

    for (let i = 0; i < roadSegments; i++) {
      const z1 = -i * (roadLength / roadSegments);
      const z2 = -(i + 1) * (roadLength / roadSegments);
      const x1 = this.getRoadCurveX(z1);
      const x2 = this.getRoadCurveX(z2);

      const segmentGeo = new THREE.PlaneGeometry(24, (roadLength / roadSegments) + 0.5);
      const segment = new THREE.Mesh(segmentGeo, roadMat);
      segment.rotation.x = -Math.PI / 2;
      segment.position.set((x1 + x2) / 2, 0, (z1 + z2) / 2);

      const angle = Math.atan2(x2 - x1, z2 - z1);
      segment.rotation.z = -angle;

      this.scene.add(segment);

      const grassL = new THREE.Mesh(new THREE.PlaneGeometry(120, (roadLength / roadSegments) + 0.5), grassMat);
      grassL.rotation.x = -Math.PI / 2;
      grassL.position.set(x1 - 72, -0.02, z1);
      const grassR = grassL.clone();
      grassR.position.x = x1 + 72;
      this.scene.add(grassL, grassR);

      if (i > 3 && i % 3 === 0) {
        const treeGroup = new THREE.Group();
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.5, 6), new THREE.MeshStandardMaterial({ color: 0x78350f }));
        trunk.position.y = 3;
        const leaves = new THREE.Mesh(new THREE.ConeGeometry(3, 7, 6), new THREE.MeshStandardMaterial({ color: 0x15803d }));
        leaves.position.y = 7;
        treeGroup.add(trunk, leaves);

        const side = i % 2 === 0 ? -16 : 16;
        treeGroup.position.set(x1 + side, 0, z1);
        this.scene.add(treeGroup);
      }

      if (i % 2 === 0) {
        const railMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.8, roughness: 0.2 });
        const leftRail = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.8, 8), railMat);
        leftRail.position.set(x1 - 12.2, 0.4, z1);
        const rightRail = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.8, 8), railMat);
        rightRail.position.set(x1 + 12.2, 0.4, z1);
        this.scene.add(leftRail, rightRail);
      }
    }
  }

  buildSpeedLines() {
    const geo = new THREE.BoxGeometry(0.04, 0.04, 3.5);
    const mat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.6 });
    for (let i = 0; i < 40; i++) {
      const line = new THREE.Mesh(geo, mat);
      line.position.set((Math.random() - 0.5) * 16, Math.random() * 3 + 0.5, -Math.random() * 60);
      this.scene.add(line);
      this.speedParticles.push(line);
    }
  }

  createRealisticTrafficCar() {
    const carGroup = new THREE.Group();
    const colors = [0x0284c7, 0xef4444, 0xf59e0b, 0x10b981, 0x6366f1];
    const carColor = colors[Math.floor(Math.random() * colors.length)];

    const bodyMat = new THREE.MeshStandardMaterial({ color: carColor, metalness: 0.7, roughness: 0.2 });
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.1, opacity: 0.85, transparent: true });
    const darkMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9 });

    const body = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.52, 4.2), bodyMat);
    body.position.y = 0.45;
    carGroup.add(body);

    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.48, 2.0), glassMat);
    cabin.position.set(0, 0.88, -0.2);
    carGroup.add(cabin);

    [-1.0, 1.0].forEach(x => {
      [-1.2, 1.2].forEach(z => {
        const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.2, 16), darkMat);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(x, 0.32, z);
        carGroup.add(wheel);
      });
    });

    const tailLight = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.08, 0.08), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
    tailLight.position.set(0, 0.6, 2.11);
    carGroup.add(tailLight);

    return carGroup;
  }

  buildRealisticSupercar() {
    this.car = new THREE.Group();
    this.scene.add(this.car);

    const paintMat = new THREE.MeshStandardMaterial({ color: 0xe11d48, metalness: 0.85, roughness: 0.15 });
    const carbonMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.2 });
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.95, roughness: 0.05, opacity: 0.75, transparent: true });
    const chromeMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, metalness: 0.98, roughness: 0.05 });
    const brakeMat = new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.5 });

    const bodyBase = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.38, 4.4), paintMat);
    bodyBase.position.y = 0.4;
    this.car.add(bodyBase);

    const hoodGeo = new THREE.CylinderGeometry(1.0, 1.05, 1.8, 16);
    hoodGeo.rotateZ(Math.PI / 2);
    const hood = new THREE.Mesh(hoodGeo, paintMat);
    hood.position.set(0, 0.55, -1.0);
    hood.scale.set(1, 0.4, 1);
    this.car.add(hood);

    const splitter = new THREE.Mesh(new THREE.BoxGeometry(2.25, 0.08, 0.7), carbonMat);
    splitter.position.set(0, 0.22, -2.25);
    this.car.add(splitter);

    [-1.05, 1.05].forEach(x => {
      const fenderF = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.45, 1.2), paintMat);
      fenderF.position.set(x, 0.5, -1.4);
      const fenderR = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.5, 1.3), paintMat);
      fenderR.position.set(x, 0.52, 1.4);
      this.car.add(fenderF, fenderR);
    });

    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.48, 1.9), glassMat);
    cabin.position.set(0, 0.88, 0.0);
    this.car.add(cabin);

    const wing = new THREE.Mesh(new THREE.BoxGeometry(2.35, 0.08, 0.55), carbonMat);
    wing.position.set(0, 1.25, 2.0);
    const strutL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.38, 0.25), carbonMat);
    strutL.position.set(-0.75, 1.02, 2.0);
    const strutR = strutL.clone(); strutR.position.x = 0.75;
    this.car.add(wing, strutL, strutR);

    for (let i = -0.4; i <= 0.4; i += 0.26) {
      const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.3, 12), chromeMat);
      pipe.rotation.x = Math.PI / 2;
      pipe.position.set(i, 0.38, 2.22);
      this.car.add(pipe);
    }

    const tailLight = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.08, 0.08), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
    tailLight.position.set(0, 0.62, 2.21);
    this.car.add(tailLight);

    const wheelPos = [
      { x: -1.15, y: 0.42, z: -1.4 },
      { x: 1.15, y: 0.42, z: -1.4 },
      { x: -1.15, y: 0.42, z: 1.4 },
      { x: 1.15, y: 0.42, z: 1.4 }
    ];

    wheelPos.forEach(pos => {
      const wGroup = new THREE.Group();
      wGroup.position.set(pos.x, pos.y, pos.z);

      const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.44, 0.44, 0.36, 24), new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9 }));
      tire.rotation.z = Math.PI / 2;
      wGroup.add(tire);

      const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.37, 12), chromeMat);
      rim.rotation.z = Math.PI / 2;
      wGroup.add(rim);

      const caliper = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.18, 0.1), brakeMat);
      caliper.position.set(0, 0.18, 0);
      wGroup.add(caliper);

      this.car.add(wGroup);
      this.wheels.push(wGroup);
    });
  }

  buildLevelScenario() {
    if ([1, 2, 6, 8, 10].includes(this.level)) {
      const step = Math.floor(this.totalTrackLength / 5);
      for (let i = 1; i <= 5; i++) {
        const z = -i * step;
        const x = this.getRoadCurveX(z);
        const gate = new THREE.Group();
        gate.position.set(x, 0, z);

        const mat = new THREE.MeshBasicMaterial({ color: i === 1 ? 0x0284c7 : 0xef4444 });
        const p1 = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 7), mat); p1.position.set(-6, 3.5, 0);
        const p2 = p1.clone(); p2.position.x = 6;
        const bar = new THREE.Mesh(new THREE.BoxGeometry(12.6, 0.4, 0.4), mat); bar.position.set(0, 7, 0);

        gate.add(p1, p2, bar);
        this.scene.add(gate);
        this.checkpoints.push(gate);
      }
    }

    if ([3, 4, 7, 8, 10].includes(this.level)) {
      const count = this.level === 3 ? 18 : (this.level === 7 ? 28 : 35);
      const step = Math.floor(this.totalTrackLength / count);
      for (let i = 1; i < count; i++) {
        const z = -i * step;
        const roadX = this.getRoadCurveX(z);
        
        const carMesh = this.createRealisticTrafficCar();
        carMesh.position.set(roadX + (Math.random() - 0.5) * 12, 0, z);
        carMesh.hasBeenNearMissed = false;
        this.scene.add(carMesh);
        this.trafficCars.push(carMesh);
      }
    }

    this.buildFinishGate(-this.totalTrackLength);
  }

  buildFinishGate(zPos) {
    const x = this.getRoadCurveX(zPos);
    const gate = new THREE.Group();
    gate.position.set(x, 0, zPos);
    const mat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
    const p1 = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 9), mat); p1.position.set(-11, 4.5, 0);
    const p2 = p1.clone(); p2.position.x = 11;
    const bar = new THREE.Mesh(new THREE.BoxGeometry(22.5, 0.6, 0.6), mat); bar.position.set(0, 9, 0);
    gate.add(p1, p2, bar);
    this.scene.add(gate);
    this.finishGate = gate;
  }

  startTimer() {
    this.timerInterval = setInterval(() => {
      if (!this.running || this.isCountingDown) return;
      this.timeLeft--;
      const timerEl = document.getElementById('hud-timer');
      if (timerEl) timerEl.innerText = `${this.timeLeft}S`;
      if (this.timeLeft <= 0) this.triggerFail("TEMPS ÉCOULÉ !");
    }, 1000);
  }

  triggerCrash() {
    this.playSound('crash');
    this.timeLeft = Math.max(1, this.timeLeft - 5);
    this.speed = 0;
    this.carPos.x = this.getRoadCurveX(this.carPos.z);
    this.isRespawning = true;
    this.respawnTimer = 2.0;
    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
  }

  triggerFail(reason) {
    this.running = false;
    clearInterval(this.timerInterval);
    this.stopEngineSound();
    this.playSound('crash');
    const reasonEl = document.getElementById('fail-reason');
    if (reasonEl) reasonEl.innerText = reason;
    const modalEl = document.getElementById('fail-modal');
    if (modalEl) modalEl.style.display = 'block';
  }

  triggerWin() {
    this.running = false;
    clearInterval(this.timerInterval);
    this.stopEngineSound();
    this.playSound('checkpoint');
    this.coinsEarned += 250;
    const winModal = document.getElementById('win-modal');
    if (winModal) winModal.style.display = 'block';
  }

  initTouchAndKeyboardUI() {
    this.ui = document.createElement('div');
    this.ui.id = 'car-ui';

    this.ui.innerHTML = `
      <style>
        .rotate-prompt {
          position: fixed; top: 0; left: 0; width: 100vw; height: 100dvh;
          background: rgba(10, 14, 23, 0.96); z-index: 5000; display: none;
          flex-direction: column; align-items: center; justify-content: center;
          color: var(--violet-lit); font-size: 1.2rem; font-weight: 800; text-align: center; padding: 20px;
        }
        @media (orientation: portrait) {
          .rotate-prompt { display: flex !important; }
        }

        .hud-countdown {
          position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
          font-size: 5rem; font-weight: 900; color: var(--violet-lit);
          text-shadow: 0 0 30px rgba(56, 189, 248, 0.8); z-index: 2500;
          display: flex; align-items: center; justify-content: center; pointer-events: none;
        }

        .hud-notify-badge {
          position: fixed; top: 30%; left: 50%; transform: translate(-50%, -50%);
          background: rgba(245, 158, 11, 0.95); border: 2px solid var(--gold-lit);
          padding: 8px 18px; border-radius: 20px; color: var(--surface-1); font-size: 1rem;
          font-weight: 900; z-index: 2000; display: none; box-shadow: 0 0 25px rgba(245, 158, 11, 0.8);
          animation: pop-notify 0.3s ease-out; pointer-events: none;
        }

        .hud-top-left-group {
          position: fixed; top: max(12px, env(safe-area-inset-top)); left: max(12px, env(safe-area-inset-left));
          display: flex; align-items: center; gap: 10px; z-index: 1000;
        }

        .hud-back-btn {
          background: rgba(15, 23, 42, 0.9); padding: 8px 14px; border-radius: 10px;
          border: 1px solid var(--violet-lit); color: #fff; font-size: 0.8rem; font-weight: bold;
          cursor: pointer; backdrop-filter: blur(8px);
        }

        .hud-step-badge {
          background: rgba(15, 23, 42, 0.9); padding: 8px 12px; border-radius: 10px;
          border: 1px solid var(--violet-lit); color: var(--violet-lit); font-size: 0.8rem; font-weight: 900;
          backdrop-filter: blur(8px);
        }

        .hud-minimap-bar {
          position: fixed; top: max(12px, env(safe-area-inset-top)); left: 50%; transform: translateX(-50%);
          width: min(38vw, 220px); height: 16px; background: rgba(15, 23, 42, 0.95);
          border: 1.5px solid var(--violet-lit); border-radius: 10px; z-index: 1000;
          overflow: hidden; backdrop-filter: blur(8px); display: flex; align-items: center;
        }
        .minimap-progress { height: 100%; background: linear-gradient(90deg, var(--blood), var(--success)); width: 0%; transition: width 0.1s linear; }
        .minimap-icon-player { position: absolute; font-size: 10px; transform: translateX(-50%); transition: left 0.1s linear; }

        .hud-panel {
          position: fixed; top: max(12px, env(safe-area-inset-top)); right: max(12px, env(safe-area-inset-right));
          background: rgba(15, 23, 42, 0.9); padding: 10px 16px; border-radius: 14px;
          border: 1px solid var(--violet-lit); color: #fff; font-family: monospace; z-index: 1000;
          box-shadow: 0 8px 25px rgba(0,0,0,0.5); backdrop-filter: blur(10px); text-align: right;
        }
        .hud-speed { font-size: 1.4rem; font-weight: 900; color: var(--violet-lit); }
        .hud-gear { font-size: 0.8rem; color: var(--blood-lit); font-weight: bold; }
        .hud-nitro { font-size: 0.75rem; color: var(--success); font-weight: bold; margin-top: 1px; }
        .hud-coins { font-size: 0.75rem; font-weight: 800; color: var(--gold-lit); margin-top: 1px; }

        .hud-actions-row { display: flex; gap: 6px; justify-content: flex-end; margin-bottom: 4px; }
        .icon-btn-hud { background: var(--surface-2); border: 1px solid var(--line-strong); color: #fff; padding: 4px 8px; border-radius: 6px; cursor: pointer; font-size: 0.85rem; }

        .touch-container {
          position: fixed; bottom: max(18px, env(safe-area-inset-bottom)); left: 0;
          width: 100vw; display: flex; justify-content: space-between;
          padding: 0 max(24px, env(safe-area-inset-right)); box-sizing: border-box; z-index: 1000; pointer-events: none;
        }
        .touch-group { display: flex; gap: 14px; pointer-events: auto; }
        .t-btn {
          width: 68px; height: 68px; border-radius: 50%;
          background: rgba(255,255,255,0.18); border: 2.5px solid rgba(255,255,255,0.5);
          color: #fff; font-size: 1.6rem; display: flex; align-items: center; justify-content: center;
          backdrop-filter: blur(10px); user-select: none; touch-action: none;
        }
        .t-btn:active { transform: scale(0.90); }
        .t-btn-gas { background: rgba(52, 211, 153, 0.35); border-color: var(--success); }
        .t-btn-brake { background: rgba(244, 63, 94, 0.35); border-color: var(--blood-lit); }
        .t-btn-nitro { background: rgba(56, 189, 248, 0.35); border-color: var(--violet-lit); box-shadow: 0 0 15px rgba(56, 189, 248, 0.4); }

        .modal {
          position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
          background: var(--surface-1); border: 1px solid var(--violet-lit); padding: 25px;
          border-radius: 20px; text-align: center; z-index: 3000; display: none;
          box-shadow: 0 10px 30px rgba(0,0,0,0.8); width: 85%; max-width: 360px; color: #fff;
        }
        .modal button {
          margin-top: 18px; padding: 14px 24px; background: linear-gradient(135deg, var(--blood), var(--success));
          color: #fff; font-weight: 800; border: none; border-radius: 25px; font-size: 0.95rem;
          text-transform: uppercase; cursor: pointer; letter-spacing: 1px;
        }
      </style>

      <div class="rotate-prompt">
        📱 VEUILLEZ PIVOTER VOTRE TÉLÉPHONE EN MODE PAYSAGE (COUCHÉ)
      </div>

      <div class="hud-countdown" id="hud-countdown">3</div>
      <div class="hud-notify-badge" id="hud-notify">+25 COINS ! NEAR MISS ⚡</div>

      <div class="hud-top-left-group">
        <button class="hud-back-btn" id="btn-back-game">◀ Quitter</button>
        <div class="hud-step-badge">NIVEAU ${this.level}/10</div>
      </div>

      <div class="hud-minimap-bar">
        <div class="minimap-progress" id="minimap-fill"></div>
        <span class="minimap-icon-player" id="minimap-icon" style="left: 0%;">🏎️</span>
      </div>

      <div class="hud-panel">
        <div class="hud-actions-row">
          <button class="icon-btn-hud" id="btn-camera">🎥</button>
          <button class="icon-btn-hud" id="btn-sound">🔊</button>
        </div>
        <div class="hud-speed" id="hud-speed">0 KM/H</div>
        <div class="hud-gear" id="hud-gear">RAPPORT : D1</div>
        <div class="hud-nitro" id="hud-nitro">NITRO : 100%</div>
        <div class="hud-coins" id="hud-coins">🪙 0 COINS</div>
        <div style="color:var(--success); font-size:0.9rem; margin-top:3px;" id="hud-timer">${this.timeLeft}S</div>
      </div>

      <div class="touch-container">
        <div class="touch-group">
          <div class="t-btn" id="btn-left">◀</div>
          <div class="t-btn" id="btn-right">▶</div>
        </div>
        <div class="touch-group">
          <div class="t-btn t-btn-nitro" id="btn-nitro">⚡</div>
          <div class="t-btn t-btn-brake" id="btn-brake">⛔</div>
          <div class="t-btn t-btn-gas" id="btn-gas">🚀</div>
        </div>
      </div>

      <div class="modal" id="win-modal">
        <h2 style="color:var(--violet-lit); font-size:1.5rem; margin-bottom:10px;">VICTOIRE ! 🏆</h2>
        <p style="color:#eee;">Niveau ${this.level} validé avec succès !</p>
        <button id="btn-next-level">${this.level < 10 ? 'NIVEAU SUIVANT ▶' : 'TERMINER LE JEU 🏁'}</button>
      </div>

      <div class="modal" id="fail-modal" style="border-color:var(--blood-lit);">
        <h2 style="color:var(--blood-lit); font-size:1.5rem; margin-bottom:10px;">ÉCHEC ! 💥</h2>
        <p style="color:#eee;" id="fail-reason">Temps écoulé !</p>
        <button id="btn-retry" style="background:var(--blood-lit);">RÉESSAYER 🔄</button>
      </div>
    `;
    document.body.appendChild(this.ui);

    document.getElementById('btn-back-game')?.addEventListener('click', () => {
      this.destroy();
      if (typeof this.onExitToSelector === 'function') {
        this.onExitToSelector();
      }
    });

    document.getElementById('btn-camera')?.addEventListener('click', () => {
      this.cameraMode = (this.cameraMode + 1) % 3;
      const cameraNames = ["VUE : CHASSEUSE 🏁", "VUE : COCKPIT / CAPOT 🏎️", "VUE : AÉRIENNE 🚁"];
      this.showNotification(cameraNames[this.cameraMode]);
    });

    document.getElementById('btn-sound')?.addEventListener('click', () => {
      this.soundEnabled = !this.soundEnabled;
      const soundBtn = document.getElementById('btn-sound');
      if (soundBtn) soundBtn.innerText = this.soundEnabled ? '🔊' : '🔇';
      if (!this.soundEnabled) {
        this.stopEngineSound();
      } else {
        this.resumeEngineSound();
      }
    });

    const bindTouch = (id, key) => {
      const el = document.getElementById(id);
      if (!el) return;

      const start = (e) => {
        e.preventDefault();
        this.initAudio();
        this.inputs[key] = true;
        if (key === 'nitro') this.playSound('turbo');
      };
      const stop = (e) => {
        e.preventDefault();
        this.inputs[key] = false;
      };

      el.addEventListener('touchstart', start, { passive: false });
      el.addEventListener('touchend', stop, { passive: false });
      el.addEventListener('touchcancel', stop, { passive: false });

      el.addEventListener('mousedown', start);
      el.addEventListener('mouseup', stop);
      el.addEventListener('mouseleave', stop);
    };

    bindTouch('btn-left', 'left');
    bindTouch('btn-right', 'right');
    bindTouch('btn-gas', 'gas');
    bindTouch('btn-brake', 'brake');
    bindTouch('btn-nitro', 'nitro');

    this.handleKeyDown = (e) => {
      this.initAudio();
      if (['ArrowUp', 'KeyW'].includes(e.code)) this.inputs.gas = true;
      if (['ArrowDown', 'KeyS'].includes(e.code)) this.inputs.brake = true;
      if (['ArrowLeft', 'KeyA'].includes(e.code)) this.inputs.left = true;
      if (['ArrowRight', 'KeyD'].includes(e.code)) this.inputs.right = true;
      if (['ShiftLeft', 'KeyN', 'Space'].includes(e.code)) {
        this.inputs.nitro = true;
        this.playSound('turbo');
      }
      if (['KeyC'].includes(e.code)) {
        this.cameraMode = (this.cameraMode + 1) % 3;
        const cameraNames = ["VUE : CHASSEUSE 🏁", "VUE : COCKPIT / CAPOT 🏎️", "VUE : AÉRIENNE 🚁"];
        this.showNotification(cameraNames[this.cameraMode]);
      }
    };

    this.handleKeyUp = (e) => {
      if (['ArrowUp', 'KeyW'].includes(e.code)) this.inputs.gas = false;
      if (['ArrowDown', 'KeyS'].includes(e.code)) this.inputs.brake = false;
      if (['ArrowLeft', 'KeyA'].includes(e.code)) this.inputs.left = false;
      if (['ArrowRight', 'KeyD'].includes(e.code)) this.inputs.right = false;
      if (['ShiftLeft', 'KeyN', 'Space'].includes(e.code)) this.inputs.nitro = false;
    };

    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);

    document.getElementById('btn-next-level')?.addEventListener('click', () => {
      this.destroy();
      this.onLevelComplete(this.level, this.coinsEarned);
    });
    document.getElementById('btn-retry')?.addEventListener('click', () => {
      this.destroy();
      this.onRetry(this.level);
    });
  }

  showNotification(text) {
    const notifyEl = document.getElementById('hud-notify');
    if (notifyEl) {
      notifyEl.innerText = text;
      notifyEl.style.display = 'block';
      this.nearMissNotifyTimer = 1.2;
    }
  }

  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    if (this.isLandscape() && !this.countdownStarted && this.running) {
      this.startCountdown();
    }
  }

  // --- PHYSIQUE DYNAMIQUE ET CAMÉRA ANCRÉE EN VUE COCKPIT ---
  updatePhysics() {
    if (!this.running) return;

    const delta = Math.min(Math.max(this.clock.getDelta(), 0.001), 0.05);

    if (this.isCountingDown || !this.isLandscape()) {
      this.renderer.render(this.scene, this.camera);
      return;
    }

    if (this.nearMissNotifyTimer > 0) {
      this.nearMissNotifyTimer -= delta;
      if (this.nearMissNotifyTimer <= 0) {
        const notifyEl = document.getElementById('hud-notify');
        if (notifyEl) notifyEl.style.display = 'none';
      }
    }

    if (this.isRespawning) {
      this.respawnTimer -= delta;
      this.car.visible = Math.floor(this.respawnTimer * 10) % 2 === 0;
      if (this.respawnTimer <= 0) {
        this.isRespawning = false;
        this.car.visible = true;
      }
    }

    // ACCÉLÉRATION ET NITRO
    let currentMaxSpeed = this.maxSpeed;
    if (this.inputs.nitro && this.nitro > 0) {
      currentMaxSpeed *= 1.45;
      this.speed = THREE.MathUtils.lerp(this.speed, currentMaxSpeed, delta * 3.5);
      this.nitro = Math.max(0, this.nitro - 1.2 * (delta * 60));
      this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, 74, delta * 6.0);
    } else {
      this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, 60, delta * 6.0);
      if (this.nitro < 100) this.nitro = Math.min(100, this.nitro + 0.15);

      if (this.inputs.gas) {
        this.speed = Math.min(currentMaxSpeed, this.speed + 0.38 * delta);
      } else if (this.inputs.brake) {
        this.speed = Math.max(-0.4, this.speed - 1.2 * delta);
      } else {
        this.speed = Math.max(0, this.speed - 0.22 * delta);
      }
    }

    this.speed = Number.isFinite(this.speed) ? this.speed : 0;
    this.updateEngineSound();

    const speedRatio = Math.abs(this.speed) / this.maxSpeed;
    this.gear = Math.min(6, Math.floor(speedRatio * 5) + 1);
    const hudGear = document.getElementById('hud-gear');
    if (hudGear) hudGear.innerText = `RAPPORT : D${this.gear}`;

    const currentRoadX = this.getRoadCurveX(this.carPos.z);

    if (Math.abs(this.speed) > 0.01) {
      const dir = this.speed > 0 ? 1 : -1;
      if (this.inputs.left) {
        this.carPos.x -= this.turnSpeed * 4.8 * dir * delta * 60;
        this.carRot = Math.min(this.carRot + 0.06, 0.28);
      } else if (this.inputs.right) {
        this.carPos.x += this.turnSpeed * 4.8 * dir * delta * 60;
        this.carRot = Math.max(this.carRot - 0.06, -0.28);
      } else {
        this.carRot *= 0.82;
      }
    }

    if (Math.abs(this.carPos.x - currentRoadX) > 11.5) {
      this.speed *= 0.94;
    }

    this.carPos.z -= this.speed * 55 * delta;

    this.car.position.set(this.carPos.x, 0, this.carPos.z);
    this.car.rotation.y = this.carRot;
    this.car.rotation.z = -this.carRot * 0.35;
    this.wheels.forEach(w => w.rotation.x -= this.speed * 2.0);

    // MINIMAP PROGRESS
    const progressPercent = Math.min(100, Math.max(0, (Math.abs(this.carPos.z) / this.totalTrackLength) * 100));
    const mapFill = document.getElementById('minimap-fill');
    const mapIcon = document.getElementById('minimap-icon');
    if (mapFill) mapFill.style.width = `${progressPercent}%`;
    if (mapIcon) mapIcon.style.left = `${progressPercent}%`;

    // FIXATION DE LA CAMÉRA (VUE 1: COCKPIT EN AVANT DU PARE-BRISE À z = -1.8)
    if (this.cameraMode === 1) {
      // VUE COCKPIT / CAPOT (VUE NETTE DU CHAUFFEUR DEVANT LE CAPOT)
      const cockpitX = this.carPos.x - Math.sin(this.carRot) * 1.8;
      const cockpitZ = this.carPos.z - Math.cos(this.carRot) * 1.8;
      const cockpitY = 0.85;

      this.camera.position.set(cockpitX, cockpitY, cockpitZ);

      const lookAtX = this.carPos.x - Math.sin(this.carRot) * 15;
      const lookAtZ = this.carPos.z - Math.cos(this.carRot) * 15;
      this.camera.lookAt(lookAtX, 0.75, lookAtZ);
      this.camera.rotation.z = -this.carRot * 0.2;
    } else {
      // VUE CHASSEUSE (0) OU AÉRIENNE (2) (AVEC AMORTISSEMENT FLUIDE)
      let camDistance = this.cameraMode === 2 ? 5.5 : 3.8;
      let camHeight = this.cameraMode === 2 ? 3.8 : 1.5;
      let lookAtHeight = this.cameraMode === 2 ? 0.5 : 0.7;
      let lookAtOffset = this.cameraMode === 2 ? 8 : 6;

      const targetCamX = this.carPos.x + Math.sin(this.carRot) * camDistance;
      const targetCamZ = this.carPos.z + Math.cos(this.carRot) * camDistance;

      this.camera.position.x += (targetCamX - this.camera.position.x) * 0.25;
      this.camera.position.z += (targetCamZ - this.camera.position.z) * 0.25;
      this.camera.position.y = THREE.MathUtils.lerp(this.camera.position.y, camHeight, 0.25);

      const lookAtX = this.carPos.x - Math.sin(this.carRot) * lookAtOffset;
      const lookAtZ = this.carPos.z - Math.cos(this.carRot) * lookAtOffset;
      this.camera.lookAt(lookAtX, lookAtHeight, lookAtZ);
    }

    const safeKm = Number.isFinite(this.speed) ? Math.round(Math.abs(this.speed) * 195) : 0;
    const speedEl = document.getElementById('hud-speed');
    if (speedEl) speedEl.innerText = `${safeKm} KM/H`;

    const coinsEl = document.getElementById('hud-coins');
    if (coinsEl) coinsEl.innerText = `🪙 ${this.coinsEarned} COINS`;

    // COLLISIONS TRAFIC ET NEAR MISS
    this.trafficCars.forEach(obs => {
      const distZ = Math.abs(this.carPos.z - obs.position.z);
      const distX = Math.abs(this.carPos.x - obs.position.x);

      if (distZ < 3.0 && distX < 2.0 && !this.isRespawning) {
        this.triggerCrash();
      } else if (distZ < 3.2 && distX >= 2.0 && distX < 3.2 && safeKm > 160 && !obs.hasBeenNearMissed) {
        obs.hasBeenNearMissed = true;
        this.nearMissCombo++;
        this.coinsEarned += 25;
        this.nitro = Math.min(100, this.nitro + 40);
        this.playSound('nearmiss');
        this.showNotification(`+25 COINS ! NEAR MISS x${this.nearMissCombo} ⚡`);
      }
    });

    // CHECKPOINTS
    if (this.checkpoints.length > 0 && this.currentCheckpoint < this.checkpoints.length) {
      const gate = this.checkpoints[this.currentCheckpoint];
      if (Math.abs(this.carPos.z - gate.position.z) < 3.0 && Math.abs(this.carPos.x - gate.position.x) < 5.8) {
        gate.children.forEach(m => { if (m.material) m.material.color.setHex(0x10b981); });
        this.currentCheckpoint++;
        this.coinsEarned += 50;
        this.playSound('checkpoint');
        if (this.currentCheckpoint >= this.checkpoints.length) {
          this.triggerWin();
        }
      }
    }

    if (this.finishGate && this.carPos.z <= this.finishGate.position.z) {
      this.triggerWin();
    }
  }

  animate() {
    if (!this.running) return;
    this.updatePhysics();
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.animate);
  }

  destroy() {
    this.running = false;
    clearInterval(this.timerInterval);
    this.stopEngineSound();

    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);

    if (this.engineOsc1) {
      try { this.engineOsc1.stop(); } catch (e) {}
    }
    if (this.engineOsc2) {
      try { this.engineOsc2.stop(); } catch (e) {}
    }
    if (this.audioCtx) {
      try { this.audioCtx.close(); } catch (e) {}
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