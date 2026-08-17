export class BubbleShooterGame {
  constructor(parentCanvas, currentUnlockedLevel, onLevelComplete, onFailed, onExit) {
    this.parentCanvas = parentCanvas;
    this.currentLevel = currentUnlockedLevel || 1;
    this.onLevelComplete = onLevelComplete;
    this.onFailed = onFailed;
    this.onExit = onExit;
    this.running = true;

    // Canvas 2D Overlay
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'bubble-canvas';
    this.canvas.style.cssText = 'position:fixed; top:0; left:0; width:100vw; height:100dvh; z-index:500; pointer-events:auto;';
    document.body.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');

    this.cols = 11;
    this.maxRows = 14;
    this.grid = [];
    this.ceilingShiftRow = 0; // Décalage progressif du plafond vers le bas

    // Palette Cristal 3D Pure (Match 1:1 Image Modèle)
    this.colors = [
      { id: 0, main: '#ef4444', dark: '#991b1b', light: '#fca5a5', glow: 'rgba(239, 68, 68, 0.8)' },   // Rouge
      { id: 1, main: '#06b6d4', dark: '#0e7490', light: '#a5f3fc', glow: 'rgba(6, 182, 212, 0.8)' },   // Cyan
      { id: 2, main: '#10b981', dark: '#047857', light: '#a7f3d0', glow: 'rgba(16, 185, 129, 0.8)' },  // Vert
      { id: 3, main: '#f59e0b', dark: '#b45309', light: '#fde68a', glow: 'rgba(245, 158, 11, 0.8)' },  // Jaune
      { id: 4, main: '#a855f7', dark: '#6b21a8', light: '#e9d5ff', glow: 'rgba(168, 85, 247, 0.8)' },  // Violet
      { id: 5, main: '#f97316', dark: '#c2410c', light: '#fed7aa', glow: 'rgba(249, 115, 22, 0.8)' }   // Orange
    ];

    this.score = 0;
    this.coinsEarned = 0;
    this.shotsLeft = 45;
    this.shotsFiredCount = 0;
    this.dropInterval = 6;
    this.soundEnabled = true;

    this.bullet = null;
    this.nextColorIdx = 0;
    this.currentColorIdx = 0;
    this.lastColorIdx = -1;
    this.colorStreak = 0;

    this.aimAngle = -Math.PI / 2;
    this.isAiming = true;
    this.isShooting = false;

    this.particles = [];
    this.fallingBubbles = [];
    this.floatingTexts = [];
    this.audioCtx = null;

    this.initAudio();
    this.onResize = this.onResize.bind(this);
    window.addEventListener('resize', this.onResize);

    this.initUI();
    this.startLevel(this.currentLevel);
  }

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
        osc.type = 'sine';
        osc.frequency.setValueAtTime(350, now);
        osc.frequency.exponentialRampToValueAtTime(750, now + 0.1);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
      } else if (type === 'pop') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(600 + Math.random() * 250, now);
        osc.frequency.exponentialRampToValueAtTime(180, now + 0.08);
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === 'bomb') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.3);
        gain.gain.setValueAtTime(0.5, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (type === 'swap') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.08);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === 'warning') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.setValueAtTime(180, now + 0.15);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === 'bounce') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(240, now);
        osc.frequency.setValueAtTime(300, now + 0.04);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
      } else if (type === 'drop') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(450, now);
        osc.frequency.exponentialRampToValueAtTime(120, now + 0.2);
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (type === 'win') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523, now);
        osc.frequency.setValueAtTime(659, now + 0.1);
        osc.frequency.setValueAtTime(784, now + 0.2);
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      }
    } catch (e) {
      console.warn("Audio error", e);
    }
  }

  getRemainingColorIndices() {
    const active = new Set();
    for (let r = 0; r < this.maxRows; r++) {
      const colsInRow = (r % 2 === 0) ? this.cols : this.cols - 1;
      for (let c = 0; c < colsInRow; c++) {
        const val = this.grid[r]?.[c];
        if (typeof val === 'number') {
          active.add(val);
        }
      }
    }
    return Array.from(active);
  }

  generateSmartNextColor() {
    const remaining = this.getRemainingColorIndices();
    if (remaining.length === 0) return Math.floor(Math.random() * this.activeColorsCount);
    if (remaining.length === 1) return remaining[0];

    let candidates = remaining;
    if (this.colorStreak >= 2 && remaining.length > 1) {
      candidates = remaining.filter(c => c !== this.lastColorIdx);
    }

    const chosen = candidates[Math.floor(Math.random() * candidates.length)];
    if (chosen === this.lastColorIdx) {
      this.colorStreak++;
    } else {
      this.colorStreak = 1;
      this.lastColorIdx = chosen;
    }
    return chosen;
  }

  getLevelConfig(lvl) {
    const numColors = Math.min(6, 4 + Math.floor((lvl - 1) / 10));
    const initialRows = Math.min(9, 6 + Math.floor((lvl - 1) / 6)); // Nombre de lignes au départ
    const maxShots = Math.max(30, 48 - Math.floor(lvl * 0.3));
    const dropFreq = Math.max(5, 8 - Math.floor(lvl / 10));
    
    return { numColors, initialRows, maxShots, dropFreq };
  }

  startLevel(lvl) {
    this.running = true;
    this.currentLevel = lvl;
    this.score = 0;
    this.coinsEarned = 0;
    this.shotsFiredCount = 0;
    this.ceilingShiftRow = 0; // Réinitialise la descente
    this.particles = [];
    this.fallingBubbles = [];
    this.floatingTexts = [];
    this.bullet = null;
    this.isShooting = false;
    this.isAiming = true;

    const config = this.getLevelConfig(lvl);
    this.activeColorsCount = config.numColors;
    this.shotsLeft = config.maxShots;
    this.dropInterval = config.dropFreq;

    this.resizeCanvas();
    this.initGrid(config.initialRows);
    
    this.currentColorIdx = this.generateSmartNextColor();
    this.nextColorIdx = this.generateSmartNextColor();

    this.updateHUD();

    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  resizeCanvas() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    this.bubbleRadius = Math.floor(this.width / (this.cols + 0.5) / 2);
    this.rowHeight = this.bubbleRadius * 1.732;

    this.cannonX = this.width / 2;
    this.cannonY = this.height - 90;

    // LIGNE DE DANGER : Placé exactement au-dessus du canon
    this.dangerY = this.cannonY - (this.bubbleRadius * 2.5);
  }

  initGrid(rowsCount) {
    this.grid = [];
    for (let r = 0; r < this.maxRows; r++) {
      this.grid[r] = [];
      const colsInRow = (r % 2 === 0) ? this.cols : this.cols - 1;
      
      for (let c = 0; c < colsInRow; c++) {
        if (r < rowsCount) {
          const rand = Math.random();
          if (this.currentLevel >= 6 && rand < 0.04) {
            this.grid[r][c] = 'STONE';
          } else if (this.currentLevel >= 4 && rand < 0.06) {
            this.grid[r][c] = 'BOMB';
          } else if (this.currentLevel >= 2 && rand < 0.08) {
            this.grid[r][c] = 'RAINBOW';
          } else {
            this.grid[r][c] = Math.floor(Math.random() * this.activeColorsCount);
          }
        } else {
          this.grid[r][c] = null;
        }
      }
    }
  }

  getBubblePos(row, col) {
    const isOdd = row % 2 !== 0;
    const offsetX = isOdd ? this.bubbleRadius * 2 : this.bubbleRadius;
    const x = offsetX + col * (this.bubbleRadius * 2);
    // Prise en compte de la descente du plafond (ceilingShiftRow)
    const y = 55 + this.bubbleRadius + (row + this.ceilingShiftRow) * this.rowHeight;
    return { x, y };
  }

  initUI() {
    this.ui = document.createElement('div');
    this.ui.id = 'bubble-ui';
    this.ui.innerHTML = `
      <style>
        .bub-top {
          position: fixed; top: max(10px, env(safe-area-inset-top)); left: 50%; transform: translateX(-50%);
          width: 92%; max-width: 480px; z-index: 1000; display: flex; justify-content: space-between; align-items: center;
        }
        .bub-back { background: rgba(15, 23, 42, 0.92); border: 1px solid #06b6d4; color: #fff; padding: 6px 12px; border-radius: 10px; font-weight: bold; cursor: pointer; backdrop-filter: blur(8px); }
        .bub-card { background: rgba(15, 23, 42, 0.92); border: 1px solid #06b6d4; color: #fff; padding: 6px 14px; border-radius: 10px; font-weight: bold; font-family: monospace; font-size: 0.85rem; backdrop-filter: blur(8px); display: flex; gap: 10px; align-items: center; }
        .bub-sound { background: #1e293b; border: 1px solid #334155; color: #fff; padding: 3px 6px; border-radius: 6px; cursor: pointer; }
        
        .bub-modal { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(15, 23, 42, 0.97); border: 1px solid #06b6d4; padding: 25px; border-radius: 20px; text-align: center; z-index: 3000; display: none; box-shadow: 0 10px 30px rgba(0,0,0,0.8); width: 85%; max-width: 360px; color: #fff; backdrop-filter: blur(10px); }
        .bub-modal button { margin-top: 10px; padding: 12px 20px; background: linear-gradient(135deg, #0284c7, #0369a1); color: #fff; font-weight: 800; border: none; border-radius: 20px; font-size: 0.9rem; text-transform: uppercase; cursor: pointer; width: 100%; }
        
        .stars-container { font-size: 2.5rem; margin: 10px 0; text-shadow: 0 0 15px #f59e0b; letter-spacing: 6px; }

        .btn-swap-hint { position: fixed; bottom: 25px; right: 20px; background: rgba(15, 23, 42, 0.85); border: 1px solid #06b6d4; color: #06b6d4; border-radius: 15px; padding: 8px 14px; font-size: 0.8rem; font-weight: 900; z-index: 1000; cursor: pointer; backdrop-filter: blur(8px); }
      </style>

      <div class="bub-top">
        <button class="bub-back" id="btn-back-bub">◀ Cartes</button>
        <div class="bub-card">
          <span id="txt-level" style="color:#06b6d4;">ÉTAPES 1</span>
          <span id="txt-shots" style="color:#f59e0b;">🎯 45</span>
          <span id="txt-coins" style="color:#fbbf24;">🪙 0</span>
          <button class="bub-sound" id="btn-sound-bub">🔊</button>
        </div>
      </div>

      <div class="btn-swap-hint" id="btn-swap">🔄 ÉCHANGER</div>

      <div class="bub-modal" id="modal-bub">
        <h2 id="bub-modal-title" style="color:#06b6d4; font-size:1.5rem; margin-bottom:4px;">VICTOIRE !</h2>
        <div class="stars-container" id="bub-stars">⭐ ⭐ ⭐</div>
        <p id="bub-modal-sub" style="color:#cbd5e1; font-size:0.85rem; margin-bottom:12px;">Étape validée !</p>
        <button id="btn-next-bub" style="background:#06b6d4; color:#0f172a;">ÉTAPE SUIVANTE ➔</button>
        <button id="btn-replay-bub" style="background:#1e293b; border:1px solid #334155;">REJOUER 🔄</button>
        <button id="btn-hub-bub" style="background:#0f172a; border:1px solid #1e293b;">MENU ÉTAPES 🗺️</button>
      </div>
    `;

    document.body.appendChild(this.ui);

    document.getElementById('btn-back-bub')?.addEventListener('click', () => {
      this.destroy();
      if (this.onExit) this.onExit();
    });

    document.getElementById('btn-sound-bub')?.addEventListener('click', () => {
      this.soundEnabled = !this.soundEnabled;
      const btn = document.getElementById('btn-sound-bub');
      if (btn) btn.innerText = this.soundEnabled ? '🔊' : '🔇';
    });

    document.getElementById('btn-swap')?.addEventListener('click', () => {
      this.swapBubbles();
    });

    document.getElementById('btn-next-bub')?.addEventListener('click', () => {
      document.getElementById('modal-bub').style.display = 'none';
      if (this.currentLevel < 50) {
        this.startLevel(this.currentLevel + 1);
      } else {
        this.destroy();
        if (this.onExit) this.onExit();
      }
    });

    document.getElementById('btn-replay-bub')?.addEventListener('click', () => {
      document.getElementById('modal-bub').style.display = 'none';
      this.startLevel(this.currentLevel);
    });

    document.getElementById('btn-hub-bub')?.addEventListener('click', () => {
      this.destroy();
      if (this.onExit) this.onExit();
    });

    this.handleInput = (e) => {
      if (!this.isAiming || this.isShooting || !this.running) return;
      const touch = e.touches ? e.touches[0] : e;
      const dx = touch.clientX - this.cannonX;
      const dy = touch.clientY - this.cannonY;

      if (dy < -20) {
        this.aimAngle = Math.atan2(dy, dx);
      }
    };

    this.handleShoot = (e) => {
      if (!this.isAiming || this.isShooting || !this.running) return;
      if (e.target.closest('.bub-top, .bub-modal, .btn-swap-hint')) return;

      const touch = e.changedTouches ? e.changedTouches[0] : e;
      const distToReserve = Math.hypot(touch.clientX - (this.cannonX - 60), touch.clientY - (this.cannonY + 10));
      if (distToReserve < 35) {
        this.swapBubbles();
        return;
      }

      this.shootBullet();
    };

    window.addEventListener('mousemove', this.handleInput);
    window.addEventListener('touchmove', this.handleInput, { passive: false });
    window.addEventListener('mouseup', this.handleShoot);
    window.addEventListener('touchend', this.handleShoot);
  }

  swapBubbles() {
    if (this.isShooting || !this.isAiming) return;
    const temp = this.currentColorIdx;
    this.currentColorIdx = this.nextColorIdx;
    this.nextColorIdx = temp;
    this.playSound('swap');
  }

  shootBullet() {
    if (this.shotsLeft <= 0) return;

    this.isShooting = true;
    this.shotsLeft--;
    this.shotsFiredCount++;
    this.updateHUD();
    this.playSound('shoot');

    const speed = 26;
    this.bullet = {
      x: this.cannonX,
      y: this.cannonY,
      vx: Math.cos(this.aimAngle) * speed,
      vy: Math.sin(this.aimAngle) * speed,
      colorIdx: this.currentColorIdx
    };
  }

  updatePhysics() {
    if (!this.bullet) return;

    this.bullet.x += this.bullet.vx;
    this.bullet.y += this.bullet.vy;

    if (this.bullet.x - this.bubbleRadius <= 0) {
      this.bullet.x = this.bubbleRadius;
      this.bullet.vx *= -1;
      this.playSound('bounce');
    } else if (this.bullet.x + this.bubbleRadius >= this.width) {
      this.bullet.x = this.width - this.bubbleRadius;
      this.bullet.vx *= -1;
      this.playSound('bounce');
    }

    if (this.bullet.y - this.bubbleRadius <= 55) {
      this.snapBulletToGrid();
      return;
    }

    for (let r = 0; r < this.maxRows; r++) {
      const colsInRow = (r % 2 === 0) ? this.cols : this.cols - 1;
      for (let c = 0; c < colsInRow; c++) {
        if (this.grid[r][c] !== null) {
          const pos = this.getBubblePos(r, c);
          const dist = Math.hypot(this.bullet.x - pos.x, this.bullet.y - pos.y);

          if (dist <= this.bubbleRadius * 1.8) {
            this.snapBulletToGrid();
            return;
          }
        }
      }
    }
  }

  // --- DESCENTE PROGRESSIVE DU PLAFOND (SANS POPPER DE BILLES INUTILES) ---
  checkCeilingDrop() {
    if (this.currentLevel >= 2 && this.shotsFiredCount % this.dropInterval === 0) {
      this.ceilingShiftRow += 1; // Décale physiquement l'ensemble de la grille vers le bas

      this.playSound('warning');
      this.addFloatingText("ATTENTION ! BULLES DESCENDENT ⚠️", this.width / 2, 140, '#f97316');
    }
  }

  snapBulletToGrid() {
    let closestRow = 0;
    let closestCol = 0;
    let minLinearDist = Infinity;

    for (let r = 0; r < this.maxRows; r++) {
      const colsInRow = (r % 2 === 0) ? this.cols : this.cols - 1;
      for (let c = 0; c < colsInRow; c++) {
        if (this.grid[r][c] === null) {
          const pos = this.getBubblePos(r, c);
          const dist = Math.hypot(this.bullet.x - pos.x, this.bullet.y - pos.y);
          if (dist < minLinearDist) {
            minLinearDist = dist;
            closestRow = r;
            closestCol = c;
          }
        }
      }
    }

    this.grid[closestRow][closestCol] = this.bullet.colorIdx;
    const placedColor = this.bullet.colorIdx;
    this.bullet = null;

    let explodedByBomb = false;
    const neighbors = this.getNeighbors(closestRow, closestCol);
    neighbors.forEach(n => {
      if (this.grid[n.r][n.c] === 'BOMB') {
        this.explodeBomb(n.r, n.c);
        explodedByBomb = true;
      }
    });

    if (!explodedByBomb) {
      const matches = this.findMatches(closestRow, closestCol, placedColor);

      if (matches.length >= 3) {
        this.popBubbles(matches);
        this.dropFloatingBubbles();
      }
    }

    this.checkCeilingDrop();

    this.currentColorIdx = this.nextColorIdx;
    this.nextColorIdx = this.generateSmartNextColor();
    this.isShooting = false;

    this.checkGameStatus();
  }

  explodeBomb(r, c) {
    this.playSound('bomb');
    const toExplode = [{ r, c }, ...this.getNeighbors(r, c)];

    this.shotsLeft += 2; // Bonus +2 tirs !

    toExplode.forEach(m => {
      if (this.grid[m.r][m.c] !== null) {
        const pos = this.getBubblePos(m.r, m.c);
        for (let i = 0; i < 15; i++) {
          this.particles.push({
            x: pos.x, y: pos.y,
            vx: (Math.random() - 0.5) * 16,
            vy: (Math.random() - 0.5) * 16,
            color: '#f97316',
            radius: Math.random() * 6 + 3,
            life: 1.0
          });
        }
        this.grid[m.r][m.c] = null;
      }
    });

    const posBomb = this.getBubblePos(r, c);
    this.addFloatingText("BOMBE! +2 TIRS 🎯", posBomb.x, posBomb.y, '#f97316');

    this.dropFloatingBubbles();
  }

  findMatches(startRow, startCol, colorIdx) {
    const matched = [];
    const visited = new Set();
    const queue = [{ r: startRow, c: startCol }];

    visited.add(`${startRow},${startCol}`);

    while (queue.length > 0) {
      const curr = queue.shift();
      matched.push(curr);

      const neighbors = this.getNeighbors(curr.r, curr.c);
      neighbors.forEach(n => {
        const key = `${n.r},${n.c}`;
        const neighborVal = this.grid[n.r][n.c];
        
        if (!visited.has(key) && (neighborVal === colorIdx || neighborVal === 'RAINBOW')) {
          visited.add(key);
          queue.push(n);
        }
      });
    }

    return matched;
  }

  getNeighbors(r, c) {
    const isOdd = r % 2 !== 0;
    const neighbors = [];

    const offsets = isOdd ? [
      { r: r, c: c - 1 }, { r: r, c: c + 1 },
      { r: r - 1, c: c }, { r: r - 1, c: c + 1 },
      { r: r + 1, c: c }, { r: r + 1, c: c + 1 }
    ] : [
      { r: r, c: c - 1 }, { r: r, c: c + 1 },
      { r: r - 1, c: c - 1 }, { r: r - 1, c: c },
      { r: r + 1, c: c - 1 }, { r: r + 1, c: c }
    ];

    offsets.forEach(off => {
      if (off.r >= 0 && off.r < this.maxRows) {
        const maxCols = (off.r % 2 === 0) ? this.cols : this.cols - 1;
        if (off.c >= 0 && off.c < maxCols) {
          neighbors.push(off);
        }
      }
    });

    return neighbors;
  }

  popBubbles(matches) {
    this.playSound('pop');
    const points = matches.length * 15;
    this.score += points;
    this.coinsEarned += Math.floor(matches.length * 2);

    const firstPos = this.getBubblePos(matches[0].r, matches[0].c);

    if (matches.length >= 4) {
      const extraShots = Math.floor(matches.length / 2);
      this.shotsLeft += extraShots;
      this.addFloatingText(`COMBO +${extraShots} TIRS! 🎯`, firstPos.x, firstPos.y - 20, '#06b6d4');
    } else {
      this.addFloatingText(`+${points}`, firstPos.x, firstPos.y, '#06b6d4');
    }

    matches.forEach(m => {
      const pos = this.getBubblePos(m.r, m.c);
      const val = this.grid[m.r][m.c];
      const color = typeof val === 'number' ? this.colors[val] : { main: '#ffffff' };

      for (let i = 0; i < 10; i++) {
        this.particles.push({
          x: pos.x, y: pos.y,
          vx: (Math.random() - 0.5) * 12,
          vy: (Math.random() - 0.5) * 12,
          color: color.main,
          radius: Math.random() * 5 + 2,
          life: 1.0
        });
      }

      this.grid[m.r][m.c] = null;
    });

    this.updateHUD();
  }

  dropFloatingBubbles() {
    const connected = new Set();
    const queue = [];

    for (let c = 0; c < this.cols; c++) {
      if (this.grid[0][c] !== null) {
        queue.push({ r: 0, c });
        connected.add(`0,${c}`);
      }
    }

    while (queue.length > 0) {
      const curr = queue.shift();
      const neighbors = this.getNeighbors(curr.r, curr.c);

      neighbors.forEach(n => {
        const key = `${n.r},${n.c}`;
        if (!connected.has(key) && this.grid[n.r][n.c] !== null) {
          connected.add(key);
          queue.push(n);
        }
      });
    }

    let droppedCount = 0;
    for (let r = 0; r < this.maxRows; r++) {
      const colsInRow = (r % 2 === 0) ? this.cols : this.cols - 1;
      for (let c = 0; c < colsInRow; c++) {
        if (this.grid[r][c] !== null && !connected.has(`${r},${c}`)) {
          const pos = this.getBubblePos(r, c);
          this.fallingBubbles.push({
            x: pos.x, y: pos.y,
            vy: Math.random() * 4 + 3,
            val: this.grid[r][c]
          });
          this.grid[r][c] = null;
          droppedCount++;
        }
      }
    }

    if (droppedCount > 0) {
      this.playSound('drop');
      const bonus = droppedCount * 30;
      this.score += bonus;
      this.coinsEarned += droppedCount * 4;

      const extraShots = Math.min(5, Math.floor(droppedCount / 2));
      if (extraShots > 0) {
        this.shotsLeft += extraShots;
        this.addFloatingText(`CASCADE ! +${extraShots} TIRS 🎯`, this.width / 2, this.height / 2, '#f59e0b');
      }

      this.updateHUD();
    }
  }

  addFloatingText(txt, x, y, color) {
    this.floatingTexts.push({
      text: txt,
      x: x,
      y: y,
      color: color,
      opacity: 1.0,
      vy: -2
    });
  }

  // --- VICTOIRE IMMÉDIATE DÈS QUE LE TAPIS EST VIDE ! ---
  checkGameStatus() {
    let hasBubblesLeft = false;

    for (let r = 0; r < this.maxRows; r++) {
      const colsInRow = (r % 2 === 0) ? this.cols : this.cols - 1;
      for (let c = 0; c < colsInRow; c++) {
        if (this.grid[r][c] !== null) {
          hasBubblesLeft = true;
          const pos = this.getBubblePos(r, c);

          // DÉFAITE : La bille touche physiquement la ligne rouge de danger tout en bas
          if (pos.y + this.bubbleRadius >= this.dangerY) {
            this.showEndModal("DÉFAITE ! 💥", 0, "Les bulles ont franchi la ligne de danger !", false);
            if (this.onFailed) this.onFailed(this.currentLevel);
            return;
          }
        }
      }
    }

    // VICTOIRE DÈS QUE LE TAPIS EST VIDE (100% GARANTI) !
    if (!hasBubblesLeft) {
      this.playSound('win');
      const config = this.getLevelConfig(this.currentLevel);
      const ratioLeft = this.shotsLeft / config.maxShots;
      
      let stars = 1;
      if (ratioLeft >= 0.35) stars = 3;
      else if (ratioLeft >= 0.15) stars = 2;

      this.showEndModal(`ÉTAPE ${this.currentLevel} RÉUSSIE !`, stars, `Plateau vidé ! Vous gagnez +${this.coinsEarned} BerthoCoins 🪙`, true);
      if (this.onLevelComplete) this.onLevelComplete(this.currentLevel, this.coinsEarned, stars);
      return;
    }

    if (this.shotsLeft <= 0 && !this.bullet) {
      this.showEndModal("ÉCHEC ! 🎯", 0, "Plus de coups disponibles pour cette étape !", false);
      if (this.onFailed) this.onFailed(this.currentLevel);
    }
  }

  updateHUD() {
    const lvlEl = document.getElementById('txt-level');
    const shotsEl = document.getElementById('txt-shots');
    const coinsEl = document.getElementById('txt-coins');
    
    if (lvlEl) lvlEl.innerText = `ÉTAPES ${this.currentLevel}`;
    if (shotsEl) shotsEl.innerText = `🎯 ${this.shotsLeft}`;
    if (coinsEl) coinsEl.innerText = `🪙 ${this.coinsEarned}`;
  }

  showEndModal(title, stars, sub, isWin = false) {
    this.running = false;
    const titleEl = document.getElementById('bub-modal-title');
    if (titleEl) titleEl.innerText = title;
    
    const starsEl = document.getElementById('bub-stars');
    if (starsEl) {
      if (stars > 0) {
        starsEl.style.display = 'block';
        starsEl.innerText = '⭐'.repeat(stars);
      } else {
        starsEl.style.display = 'none';
      }
    }

    const subEl = document.getElementById('bub-modal-sub');
    if (subEl) subEl.innerText = sub;

    const nextBtn = document.getElementById('btn-next-bub');
    if (nextBtn) {
      nextBtn.style.display = isWin ? 'block' : 'none';
    }
    
    const modal = document.getElementById('modal-bub');
    if (modal) modal.style.display = 'block';
  }

  drawBackground() {
    const grad = this.ctx.createLinearGradient(0, 0, 0, this.height);
    grad.addColorStop(0, '#021027');
    grad.addColorStop(0.5, '#082f49');
    grad.addColorStop(1, '#0284c7');
    this.ctx.fillStyle = grad;
    this.ctx.fillRect(0, 0, this.width, this.height);

    this.ctx.save();
    this.ctx.translate(this.cannonX, this.cannonY);
    const numRays = 24;
    const rayAngle = (Math.PI * 2) / numRays;
    for (let i = 0; i < numRays; i++) {
      if (i % 2 === 0) {
        this.ctx.beginPath();
        this.ctx.moveTo(0, 0);
        this.ctx.arc(0, 0, this.height * 1.5, i * rayAngle, (i + 1) * rayAngle);
        this.ctx.closePath();
        this.ctx.fillStyle = 'rgba(6, 182, 212, 0.04)';
        this.ctx.fill();
      }
    }
    this.ctx.restore();

    // LIGNE ROUGE DE DANGER PLACÉE STRICTEMENT EN BAS JUSTE AU-DESSUS DU CANON
    this.ctx.save();
    this.ctx.strokeStyle = 'rgba(239, 68, 68, 0.7)';
    this.ctx.lineWidth = 2;
    this.ctx.setLineDash([8, 8]);
    this.ctx.beginPath();
    this.ctx.moveTo(0, this.dangerY);
    this.ctx.lineTo(this.width, this.dangerY);
    this.ctx.stroke();

    this.ctx.fillStyle = 'rgba(239, 68, 68, 0.8)';
    this.ctx.font = 'bold 11px sans-serif';
    this.ctx.fillText('LIGNE DE DANGER ⚠️', 12, this.dangerY - 6);
    this.ctx.restore();
  }

  drawGlossyBubble(x, y, radius, val) {
    if (val === null || val === undefined) return;
    this.ctx.save();

    if (val === 'STONE') {
      this.ctx.beginPath();
      this.ctx.arc(x, y, radius - 1, 0, Math.PI * 2);
      this.ctx.fillStyle = '#334155';
      this.ctx.fill();
      this.ctx.strokeStyle = '#0f172a';
      this.ctx.lineWidth = 2;
      this.ctx.stroke();

      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = `${radius * 1.1}px sans-serif`;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText('🪨', x, y);
      this.ctx.restore();
      return;
    }

    if (val === 'BOMB') {
      this.ctx.beginPath();
      this.ctx.arc(x, y, radius - 1, 0, Math.PI * 2);
      this.ctx.fillStyle = '#0f172a';
      this.ctx.fill();
      this.ctx.strokeStyle = '#f97316';
      this.ctx.lineWidth = 2.5;
      this.ctx.stroke();

      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = `${radius * 1.1}px sans-serif`;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText('💣', x, y);
      this.ctx.restore();
      return;
    }

    if (val === 'RAINBOW') {
      const rainGrad = this.ctx.createLinearGradient(x - radius, y - radius, x + radius, y + radius);
      rainGrad.addColorStop(0, '#ef4444');
      rainGrad.addColorStop(0.5, '#06b6d4');
      rainGrad.addColorStop(1, '#f59e0b');

      this.ctx.beginPath();
      this.ctx.arc(x, y, radius - 1, 0, Math.PI * 2);
      this.ctx.fillStyle = rainGrad;
      this.ctx.fill();
      this.ctx.restore();
      return;
    }

    const color = typeof val === 'number' && this.colors[val] ? this.colors[val] : this.colors[0];

    const sphereGrad = this.ctx.createRadialGradient(
      x - radius * 0.35, y - radius * 0.35, radius * 0.05,
      x, y, radius
    );
    sphereGrad.addColorStop(0, '#ffffff');
    sphereGrad.addColorStop(0.25, color.light);
    sphereGrad.addColorStop(0.75, color.main);
    sphereGrad.addColorStop(1, color.dark);

    this.ctx.beginPath();
    this.ctx.arc(x, y, radius - 0.5, 0, Math.PI * 2);
    this.ctx.fillStyle = sphereGrad;
    this.ctx.fill();

    this.ctx.beginPath();
    this.ctx.ellipse(x - radius * 0.32, y - radius * 0.35, radius * 0.3, radius * 0.18, -Math.PI / 4, 0, Math.PI * 2);
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    this.ctx.fill();

    this.ctx.beginPath();
    this.ctx.arc(x - radius * 0.4, y - radius * 0.42, radius * 0.1, 0, Math.PI * 2);
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fill();

    this.ctx.restore();
  }

  drawAimLine() {
    let currX = this.cannonX;
    let currY = this.cannonY;
    let vx = Math.cos(this.aimAngle);
    let vy = Math.sin(this.aimAngle);

    const step = 5;
    let targetGhost = null;
    const currentColor = this.colors[this.currentColorIdx] || this.colors[0];

    this.ctx.save();

    for (let i = 0; i < 350; i++) {
      currX += vx * step;
      currY += vy * step;

      if (currX <= this.bubbleRadius) {
        currX = this.bubbleRadius;
        vx *= -1;
      } else if (currX >= this.width - this.bubbleRadius) {
        currX = this.width - this.bubbleRadius;
        vx *= -1;
      }

      if (currY <= 55 + this.bubbleRadius) {
        targetGhost = { x: currX, y: 55 + this.bubbleRadius };
        break;
      }

      let hit = false;
      for (let r = 0; r < this.maxRows; r++) {
        const colsInRow = (r % 2 === 0) ? this.cols : this.cols - 1;
        for (let c = 0; c < colsInRow; c++) {
          if (this.grid[r][c] !== null) {
            const pos = this.getBubblePos(r, c);
            if (Math.hypot(currX - pos.x, currY - pos.y) <= this.bubbleRadius * 1.8) {
              targetGhost = { x: currX, y: currY };
              hit = true;
              break;
            }
          }
        }
        if (hit) break;
      }
      if (hit) break;

      if (i % 3 === 0) {
        this.ctx.beginPath();
        this.ctx.arc(currX, currY, 3, 0, Math.PI * 2);
        this.ctx.fillStyle = currentColor.light || '#ffffff';
        this.ctx.fill();
      }
    }

    if (targetGhost) {
      this.ctx.strokeStyle = currentColor.main;
      this.ctx.lineWidth = 2;
      this.ctx.setLineDash([4, 4]);
      this.ctx.beginPath();
      this.ctx.arc(targetGhost.x, targetGhost.y, this.bubbleRadius, 0, Math.PI * 2);
      this.ctx.stroke();
    }

    this.ctx.restore();
  }

  drawCannon() {
    const currentColor = this.colors[this.currentColorIdx] || this.colors[0];

    this.ctx.save();
    this.ctx.shadowColor = currentColor.main;
    this.ctx.shadowBlur = 20;
    this.ctx.beginPath();
    this.ctx.arc(this.cannonX, this.cannonY, this.bubbleRadius * 1.3, 0, Math.PI * 2);
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    this.ctx.fill();
    this.ctx.restore();

    if (!this.isShooting && this.running) {
      this.drawGlossyBubble(this.cannonX, this.cannonY, this.bubbleRadius * 1.25, this.currentColorIdx);
    }

    if (this.running) {
      this.drawGlossyBubble(this.cannonX - 60, this.cannonY + 10, this.bubbleRadius * 0.85, this.nextColorIdx);
    }
  }

  updateParticles() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.04;

      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.globalAlpha = p.life;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color;
      this.ctx.fill();
      this.ctx.restore();
    }
  }

  updateFallingBubbles() {
    for (let i = this.fallingBubbles.length - 1; i >= 0; i--) {
      const fb = this.fallingBubbles[i];
      fb.y += fb.vy;
      fb.vy += 0.5;

      this.drawGlossyBubble(fb.x, fb.y, this.bubbleRadius, fb.val);

      if (fb.y > this.height + 50) {
        this.fallingBubbles.splice(i, 1);
      }
    }
  }

  updateFloatingTexts() {
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y += ft.vy;
      ft.opacity -= 0.025;

      if (ft.opacity <= 0) {
        this.floatingTexts.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.globalAlpha = ft.opacity;
      this.ctx.font = '900 22px sans-serif';
      this.ctx.fillStyle = ft.color;
      this.ctx.textAlign = 'center';
      this.ctx.fillText(ft.text, ft.x, ft.y);
      this.ctx.restore();
    }
  }

  render() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    this.drawBackground();

    for (let r = 0; r < this.maxRows; r++) {
      const colsInRow = (r % 2 === 0) ? this.cols : this.cols - 1;
      for (let c = 0; c < colsInRow; c++) {
        if (this.grid[r][c] !== null) {
          const pos = this.getBubblePos(r, c);
          this.drawGlossyBubble(pos.x, pos.y, this.bubbleRadius, this.grid[r][c]);
        }
      }
    }

    if (this.isAiming && !this.isShooting && this.running) {
      this.drawAimLine();
    }

    if (this.bullet && this.running) {
      this.drawGlossyBubble(this.bullet.x, this.bullet.y, this.bubbleRadius, this.bullet.colorIdx);
    }

    this.drawCannon();

    this.updateParticles();
    this.updateFallingBubbles();
    this.updateFloatingTexts();
  }

  animate() {
    if (!this.running) return;

    this.updatePhysics();
    this.render();

    requestAnimationFrame(this.animate);
  }

  onResize() {
    this.resizeCanvas();
  }

  destroy() {
    this.running = false;
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('mousemove', this.handleInput);
    window.removeEventListener('touchmove', this.handleInput);
    window.removeEventListener('mouseup', this.handleShoot);
    window.removeEventListener('touchend', this.handleShoot);
    
    if (this.audioCtx) {
      try { this.audioCtx.close(); } catch(e) {}
    }

    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }

    if (this.ui && this.ui.parentNode) {
      this.ui.parentNode.removeChild(this.ui);
    }
  }
}