export class CheckersGame {
  constructor(containerCanvas, onWin) {
    this.canvas = containerCanvas;
    this.onWin = onWin;
    this.running = true;

    this.mode = 'ai'; // 'ai' ou '2p'
    this.aiLevel = 2; // 1: Facile, 2: Moyen, 3: Expert
    this.boardSize = 10; // 10: International, 8: Classique
    this.soundEnabled = true;

    this.board = [];
    this.turn = 'white'; // 'white' (joueur bas) ou 'red' (joueur haut)
    this.selectedPiece = null;
    this.validMoves = [];
    this.chainingPiece = null;
    this.lastMove = null;

    this.fps = 60;
    this.lastFrameTime = performance.now();
    this.frameCount = 0;

    this.audioCtx = null;

    const globalBack = document.getElementById('btn-back-hub');
    if (globalBack) globalBack.style.display = 'none';

    this.initSettingsModal();
    this.startFpsCounter();
  }

  // --- AUDIO SYNTHESIS (Web Audio API) ---
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

      if (type === 'move') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(110, now + 0.08);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === 'capture') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.12);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === 'king') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(392, now);
        osc.frequency.setValueAtTime(523, now + 0.1);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === 'win') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(554, now + 0.12);
        osc.frequency.setValueAtTime(659, now + 0.25);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.45);
        osc.start(now);
        osc.stop(now + 0.45);
      }
    } catch (e) {
      console.warn("Audio non supporté", e);
    }
  }

  startFpsCounter() {
    const loop = (now) => {
      if (!this.running) return;
      this.frameCount++;
      if (now - this.lastFrameTime >= 1000) {
        this.fps = this.frameCount;
        this.frameCount = 0;
        this.lastFrameTime = now;
        const fpsEl = document.getElementById('txt-fps');
        if (fpsEl) fpsEl.innerText = this.fps;
      }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  // --- MODALE DE CONFIGURATION INITIALE ---
  initSettingsModal() {
    this.modal = document.createElement('div');
    this.modal.id = 'checkers-modal';
    this.modal.innerHTML = `
      <style>
        .chk-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100dvh; background: rgba(10, 14, 23, 0.96); z-index: 2000; display: flex; flex-direction: column; align-items: center; justify-content: center; backdrop-filter: blur(20px); padding: 20px; color: #e2e8f0; box-sizing: border-box; }
        .chk-title { font-size: 1.8rem; font-weight: 800; color: #f1f5f9; text-transform: uppercase; letter-spacing: 3px; margin-bottom: 25px; text-shadow: 0 4px 12px rgba(0,0,0,0.5); text-align: center; }
        .chk-group { width: 100%; max-width: 380px; margin-bottom: 18px; }
        .chk-group label { display: block; font-size: 0.75rem; color: #94a3b8; margin-bottom: 8px; text-transform: uppercase; font-weight: 800; letter-spacing: 1.5px; }
        .chk-opts { display: flex; gap: 10px; }
        .chk-btn { flex: 1; padding: 13px 8px; background: #1e293b; border: 1px solid #334155; border-radius: 12px; color: #94a3b8; font-size: 0.85rem; font-weight: 700; cursor: pointer; text-align: center; transition: all 0.25s ease; }
        .chk-btn.active { border-color: #38bdf8; background: #0f172a; color: #38bdf8; box-shadow: 0 4px 12px rgba(56, 189, 248, 0.25); }
        .chk-start { margin-top: 22px; width: 100%; max-width: 380px; padding: 16px; background: linear-gradient(135deg, #0284c7, #0d9488); border: none; border-radius: 25px; color: #fff; font-weight: 800; font-size: 1rem; text-transform: uppercase; cursor: pointer; letter-spacing: 2px; box-shadow: 0 8px 20px rgba(2, 132, 199, 0.3); transition: transform 0.2s; }
        .chk-start:active { transform: scale(0.98); }
      </style>

      <div class="chk-overlay">
        <h2 class="chk-title">DAMES PRO — RÈGLES OFFICIELLES</h2>
        
        <div class="chk-group">
          <label>Mode de Jeu</label>
          <div class="chk-opts">
            <div class="chk-btn active" id="opt-mode-ai">vs Robot IA</div>
            <div class="chk-btn" id="opt-mode-2p">2 Joueurs (Local)</div>
          </div>
        </div>

        <div class="chk-group" id="ai-level-group">
          <label>Niveau de l'IA</label>
          <div class="chk-opts">
            <div class="chk-btn" id="opt-lvl-1">Facile</div>
            <div class="chk-btn active" id="opt-lvl-2">Moyen</div>
            <div class="chk-btn" id="opt-lvl-3">Expert 🔥</div>
          </div>
        </div>

        <div class="chk-group">
          <label>Taille du Damier</label>
          <div class="chk-opts">
            <div class="chk-btn active" id="opt-size-10">10x10 (International)</div>
            <div class="chk-btn" id="opt-size-8">8x8 (Classique)</div>
          </div>
        </div>

        <button class="chk-start" id="btn-start-checkers">COMMENCER LA PARTIE 🎲</button>
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

    setupOpt(['opt-size-10', 'opt-size-8'], (id) => {
      this.boardSize = id === 'opt-size-10' ? 10 : 8;
    });

    document.getElementById('btn-start-checkers')?.addEventListener('click', () => {
      this.initAudio();
      document.body.removeChild(this.modal);
      this.startGame();
    });
  }

  startGame() {
    this.initBoard();
    this.initUI();
    this.render();
  }

  initBoard() {
    this.board = Array(this.boardSize).fill(null).map(() => Array(this.boardSize).fill(null));
    const rows = this.boardSize === 10 ? 4 : 3;

    for (let r = 0; r < this.boardSize; r++) {
      for (let c = 0; c < this.boardSize; c++) {
        if ((r + c) % 2 === 1) {
          if (r < rows) {
            this.board[r][c] = { color: 'red', isKing: false };
          } else if (r >= this.boardSize - rows) {
            this.board[r][c] = { color: 'white', isKing: false };
          }
        }
      }
    }
    this.chainingPiece = null;
    this.selectedPiece = null;
    this.lastMove = null;
    this.validMoves = [];
  }

  // --- INTERFACE UTILISATEUR ET DESIGN LUXUEUX PWA ---
  initUI() {
    this.ui = document.createElement('div');
    this.ui.id = 'checkers-ui-container';
    this.ui.innerHTML = `
      <style>
        .chk-game-panel {
          position: fixed; top: 0; left: 0;
          width: 100vw; height: 100dvh;
          background: #0b0f19;
          display: flex; flex-direction: column;
          align-items: center; justify-content: flex-start;
          gap: min(1.2vh, 10px);
          z-index: 1000;
          padding-top: max(10px, env(safe-area-inset-top));
          padding-bottom: max(16px, env(safe-area-inset-bottom));
          padding-left: max(10px, env(safe-area-inset-left));
          padding-right: max(10px, env(safe-area-inset-right));
          box-sizing: border-box; overflow: hidden;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }

        .top-bar { display: flex; justify-content: space-between; align-items: center; width: 100%; max-width: 460px; }
        .brand-badge { display: flex; align-items: center; gap: 8px; font-weight: 800; font-size: 1.05rem; color: #f8fafc; letter-spacing: 1px; }
        .pro-tag { background: #38bdf8; color: #0f172a; font-size: 0.65rem; padding: 2px 6px; border-radius: 4px; font-weight: 900; }
        .nav-actions { display: flex; gap: 8px; }
        .icon-btn { background: #1e293b; border: 1px solid #334155; color: #f8fafc; padding: 6px 12px; border-radius: 8px; font-size: 0.85rem; font-weight: 700; cursor: pointer; transition: background 0.2s; }

        .stats-bar { display: flex; justify-content: space-between; width: 100%; max-width: 460px; }
        .stat-card { background: #1e293b; border: 1px solid #334155; border-radius: 10px; padding: 6px 12px; width: 47%; text-align: center; }
        .stat-lbl { font-size: 0.65rem; color: #94a3b8; font-weight: 800; letter-spacing: 1px; display: block; }
        .stat-val { font-size: 0.9rem; color: #f8fafc; font-weight: 900; font-family: monospace; }

        .chk-status-group { text-align: center; }
        .chk-turn { font-size: 0.85rem; font-weight: 800; color: #38bdf8; letter-spacing: 1.5px; text-transform: uppercase; }
        .chk-alert { font-size: 0.85rem; font-weight: 800; color: #f43f5e; text-transform: uppercase; min-height: 1.1em; }

        .chk-board-wrapper {
          position: relative;
          width: min(90vw, 48dvh, 440px);
          height: min(90vw, 48dvh, 440px);
          border: 3.5px solid #334155;
          border-radius: 14px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.6), inset 0 0 2px rgba(255,255,255,0.1);
          overflow: hidden;
          background: #1e293b;
          margin-top: auto;
          margin-bottom: auto;
        }

        .chk-board { display: grid; width: 100%; height: 100%; }

        .cell { display: flex; align-items: center; justify-content: center; position: relative; touch-action: manipulation; cursor: pointer; user-select: none; }
        .cell.light { background: #2b384e; }
        .cell.dark { background: #151d2a; }
        .cell.selected { background: rgba(56, 189, 248, 0.35) !important; }
        .cell.last-move { background: rgba(168, 85, 247, 0.25) !important; }

        .cell.valid-move::after { content: ''; width: 26%; height: 26%; background: #34d399; border-radius: 50%; position: absolute; z-index: 10; opacity: 0.85; }
        .cell.valid-capture::after { content: ''; width: 82%; height: 82%; border: 3px solid #f43f5e; border-radius: 50%; position: absolute; z-index: 10; opacity: 0.85; }

        /* PIONS EN BOIS / MARBRE 3D LUXUEUX */
        .piece {
          width: 82%; height: 82%; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          position: relative; z-index: 5;
          transition: transform 0.15s ease;
        }
        .piece.white {
          background: radial-gradient(circle at 35% 35%, #ffffff 0%, #cbd5e1 60%, #94a3b8 100%);
          border: 2px solid #f8fafc;
          box-shadow: inset 0 3px 6px rgba(255,255,255,0.8), inset 0 -3px 6px rgba(0,0,0,0.4), 0 6px 12px rgba(0,0,0,0.6);
        }
        .piece.red {
          background: radial-gradient(circle at 35% 35%, #fb7185 0%, #e11d48 60%, #881337 100%);
          border: 2px solid #fda4af;
          box-shadow: inset 0 3px 6px rgba(255,255,255,0.6), inset 0 -3px 6px rgba(0,0,0,0.6), 0 6px 12px rgba(0,0,0,0.6);
        }
        
        /* ANNEAUX CONCENTRIQUES D'UN VRAI JETON DE DAMES */
        .piece::after {
          content: ''; width: 62%; height: 62%; border-radius: 50%;
          border: 1.5px solid rgba(255,255,255,0.3);
          box-shadow: inset 0 1px 3px rgba(0,0,0,0.3);
        }

        /* COURONNE VECTORIELLE DE LA DAME */
        .piece.king::before {
          content: ''; position: absolute; width: 50%; height: 50%;
          background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23f59e0b'%3E%3Cpath d='M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z'/%3E%3C/svg%3E") center/contain no-repeat;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.8)); z-index: 10;
        }

        .piece.must-capture {
          animation: pulse-capture 0.8s infinite alternate;
        }

        @keyframes pulse-capture {
          0% { box-shadow: 0 0 5px #f43f5e; }
          100% { box-shadow: 0 0 20px #f43f5e, 0 0 30px #f43f5e; }
        }

        @media (orientation: landscape) and (max-height: 550px) {
          .chk-game-panel { flex-direction: row; justify-content: space-evenly; padding: 10px; }
          .top-bar { flex-direction: column; width: 170px; gap: 8px; }
          .stats-bar { flex-direction: column; width: 170px; gap: 8px; }
          .stat-card { width: 100%; }
          .chk-board-wrapper { width: min(84vh, 380px); height: min(84vh, 380px); margin: 0; }
        }

        .end-modal { position: fixed; top: 22%; left: 50%; transform: translate(-50%, -50%); background: rgba(15, 23, 42, 0.95); border: 1px solid #38bdf8; padding: 20px 24px; border-radius: 18px; text-align: center; z-index: 3000; display: none; box-shadow: 0 10px 30px rgba(0,0,0,0.8); width: 85%; max-width: 360px; color: #f8fafc; backdrop-filter: blur(10px); }
        .end-modal h2 { font-size: 1.4rem; color: #38bdf8; margin-bottom: 6px; text-transform: uppercase; font-weight: 800; }
        .end-modal p { font-size: 0.85rem; color: #94a3b8; margin-bottom: 16px; }
        .end-btns { display: flex; gap: 10px; flex-wrap: wrap; }
        .end-btn { flex: 1; padding: 12px; border-radius: 16px; border: none; font-weight: 800; font-size: 0.8rem; cursor: pointer; text-transform: uppercase; letter-spacing: 1px; }
        .btn-replay { background: #38bdf8; color: #0f172a; }
        .btn-hub { background: #1e293b; color: #f8fafc; border: 1px solid #334155; }
        .btn-toggle-view { width: 100%; background: rgba(56, 189, 248, 0.1); border: 1px solid #38bdf8; color: #38bdf8; margin-top: 6px; }
      </style>

      <div class="chk-game-panel">
        <div class="top-bar">
          <div class="brand-badge"><span class="pro-tag">PRO</span> BERTHOPLAY</div>
          <div class="nav-actions">
            <button class="icon-btn" id="btn-sound">🔊</button>
            <button class="icon-btn" id="btn-exit">◀ Menu</button>
          </div>
        </div>

        <div class="stats-bar">
          <div class="stat-card">
            <span class="stat-lbl">PIÈCES RESTANTES</span>
            <span class="stat-val" id="txt-score">BLANCS 0 | 0 ROUGES</span>
          </div>
          <div class="stat-card">
            <span class="stat-lbl">FPS</span>
            <span class="stat-val" id="txt-fps">60</span>
          </div>
        </div>

        <div class="chk-status-group">
          <div class="chk-turn" id="txt-turn">TOUR : BLANCS</div>
          <div class="chk-alert" id="txt-alert"></div>
        </div>

        <div class="chk-board-wrapper" id="board-wrapper">
          <div class="chk-board" id="chk-grid"></div>
        </div>
      </div>

      <div class="end-modal" id="end-match-modal">
        <h2 id="end-winner-title">VICTOIRE ! 🏆</h2>
        <p id="end-winner-sub">Match terminé avec succès.</p>
        <div class="end-btns">
          <button class="end-btn btn-replay" id="btn-replay-match">REJOUER 🔄</button>
          <button class="end-btn btn-hub" id="btn-return-hub">MENU 🏠</button>
          <button class="end-btn btn-toggle-view" id="btn-inspect-board">👁️ VOIR LE PLATEAU</button>
        </div>
      </div>
    `;

    document.body.appendChild(this.ui);
    this.gridEl = document.getElementById('chk-grid');
    this.gridEl.style.gridTemplateColumns = `repeat(${this.boardSize}, 1fr)`;
    this.gridEl.style.gridTemplateRows = `repeat(${this.boardSize}, 1fr)`;

    document.getElementById('btn-sound')?.addEventListener('click', () => {
      this.soundEnabled = !this.soundEnabled;
      const soundBtn = document.getElementById('btn-sound');
      if (soundBtn) soundBtn.innerText = this.soundEnabled ? '🔊' : '🔇';
    });

    document.getElementById('btn-exit')?.addEventListener('click', () => {
      this.destroy();
      this.onWin();
    });

    document.getElementById('btn-replay-match')?.addEventListener('click', () => {
      const modal = document.getElementById('end-match-modal');
      if (modal) modal.style.display = 'none';
      this.running = true;
      this.initBoard();
      this.turn = 'white';
      this.render();
    });

    document.getElementById('btn-return-hub')?.addEventListener('click', () => {
      this.destroy();
      this.onWin();
    });

    document.getElementById('btn-inspect-board')?.addEventListener('click', () => {
      const modal = document.getElementById('end-match-modal');
      if (modal) {
        modal.style.opacity = modal.style.opacity === '0.15' ? '1' : '0.15';
      }
    });
  }

  // --- RÈGLE OFFICIELLE DE LA MAJORITÉ (PRISE LA PLUS LONGUE OBLIGATOIRE) ---
  getAllCaptures(color, customBoard = null) {
    const board = customBoard || this.board;
    let allPieceCaptures = [];
    let maxCaptureLength = 0;

    for (let r = 0; r < this.boardSize; r++) {
      for (let c = 0; c < this.boardSize; c++) {
        if (board[r][c] && board[r][c].color === color) {
          const capChains = this.getPieceCaptureChains(r, c, board);
          capChains.forEach(chain => {
            if (chain.length > maxCaptureLength) {
              maxCaptureLength = chain.length;
            }
            allPieceCaptures.push({ r, c, chain });
          });
        }
      }
    }

    // Filtrage strict : Conserver UNIQUEMENT les rafales de longueur maximale
    const forcedCaptures = [];
    allPieceCaptures.forEach(item => {
      if (item.chain.length === maxCaptureLength && maxCaptureLength > 0) {
        let existing = forcedCaptures.find(f => f.r === item.r && f.c === item.c);
        if (!existing) {
          existing = { r: item.r, c: item.c, moves: [] };
          forcedCaptures.push(existing);
        }
        existing.moves.push(item.chain[0]);
      }
    });

    return forcedCaptures;
  }

  getPieceCaptureChains(r, c, board, visitedCaps = []) {
    const piece = board[r][c];
    if (!piece) return [];

    let immediateMoves = [];

    // DAME VOLANTE (International 10x10)
    if (piece.isKing) {
      const dirs = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
      dirs.forEach(([dr, dc]) => {
        let step = 1;
        let enemy = null;

        while (true) {
          const nr = r + dr * step, nc = c + dc * step;
          if (!this.isValid(nr, nc)) break;

          const p = board[nr][nc];
          if (p) {
            if (p.color === piece.color || enemy) break;
            if (visitedCaps.some(vc => vc.r === nr && vc.c === nc)) break; // Ne pas re-sauter la même pièce
            enemy = { r: nr, c: nc };
          } else if (enemy) {
            immediateMoves.push({ toR: nr, toC: nc, isCapture: true, capR: enemy.r, capC: enemy.c });
          }
          step++;
        }
      });
    } else {
      // PIONS SIMPLES (Prise arrière autorisée en 10x10)
      const dirs = this.boardSize === 10 ? [[1, 1], [1, -1], [-1, 1], [-1, -1]] : (piece.color === 'white' ? [[-1, -1], [-1, 1]] : [[1, -1], [1, 1]]);
      dirs.forEach(([dr, dc]) => {
        const midR = r + dr, midC = c + dc;
        const endR = r + dr * 2, endC = c + dc * 2;

        if (this.isValid(endR, endC) && !board[endR][endC]) {
          const midP = board[midR][midC];
          if (midP && midP.color !== piece.color && !visitedCaps.some(vc => vc.r === midR && vc.c === midC)) {
            immediateMoves.push({ toR: endR, toC: endC, isCapture: true, capR: midR, capC: midC });
          }
        }
      });
    }

    if (immediateMoves.length === 0) return [];

    let fullChains = [];
    immediateMoves.forEach(m => {
      const simBoard = this.cloneBoard(board);
      simBoard[m.toR][m.toC] = simBoard[r][c];
      simBoard[r][c] = null;

      const nextVisited = [...visitedCaps, { r: m.capR, c: m.capC }];
      const subChains = this.getPieceCaptureChains(m.toR, m.toC, simBoard, nextVisited);

      if (subChains.length > 0) {
        subChains.forEach(sub => fullChains.push([m, ...sub]));
      } else {
        fullChains.push([m]);
      }
    });

    return fullChains;
  }

  getPieceNormalMoves(r, c, customBoard = null) {
    const board = customBoard || this.board;
    const piece = board[r][c];
    if (!piece) return [];

    const moves = [];

    if (piece.isKing) {
      const dirs = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
      dirs.forEach(([dr, dc]) => {
        let step = 1;
        while (true) {
          const nr = r + dr * step, nc = c + dc * step;
          if (!this.isValid(nr, nc) || board[nr][nc]) break;
          moves.push({ toR: nr, toC: nc, isCapture: false });
          step++;
        }
      });
    } else {
      const forwardDir = piece.color === 'white' ? -1 : 1;
      const dirs = [[forwardDir, -1], [forwardDir, 1]];

      dirs.forEach(([dr, dc]) => {
        const nr = r + dr, nc = c + dc;
        if (this.isValid(nr, nc) && !board[nr][nc]) {
          moves.push({ toR: nr, toC: nc, isCapture: false });
        }
      });
    }

    return moves;
  }

  // --- RENDU DU PLATEAU ---
  render() {
    this.gridEl.innerHTML = '';
    const allCaptures = this.getAllCaptures(this.turn);
    const hasMandatoryCapture = allCaptures.length > 0;
    const forcedCoords = allCaptures.map(cap => `${cap.r},${cap.c}`);

    // Sélection automatique si une seule pièce a la rafle obligatoire
    if (hasMandatoryCapture && !this.selectedPiece && !this.chainingPiece && allCaptures.length === 1) {
      const single = allCaptures[0];
      this.selectedPiece = { r: single.r, c: single.c };
      this.validMoves = single.moves;
    }

    const alertEl = document.getElementById('txt-alert');
    if (alertEl) {
      if (this.chainingPiece) {
        alertEl.innerText = "RAFLE EN COURS ! ⚡";
      } else if (hasMandatoryCapture) {
        alertEl.innerText = "PRISE MAJORITAIRE OBLIGATOIRE ⚠️";
      } else {
        alertEl.innerText = "";
      }
    }

    // Mise à jour du score (nombre de pions/dames restants)
    const counts = this.getPieceCounts();
    const scoreEl = document.getElementById('txt-score');
    if (scoreEl) {
      scoreEl.innerText = `BLANCS ${counts.white} | ${counts.red} ROUGES`;
    }

    for (let r = 0; r < this.boardSize; r++) {
      for (let c = 0; c < this.boardSize; c++) {
        const cell = document.createElement('div');
        const isDark = (r + c) % 2 === 1;
        cell.className = `cell ${isDark ? 'dark' : 'light'}`;

        if (this.selectedPiece && this.selectedPiece.r === r && this.selectedPiece.c === c) {
          cell.classList.add('selected');
        }

        if (this.lastMove && ((this.lastMove.from.r === r && this.lastMove.from.c === c) || (this.lastMove.to.r === r && this.lastMove.to.c === c))) {
          cell.classList.add('last-move');
        }

        const isMove = this.validMoves.find(m => m.toR === r && m.toC === c);
        if (isMove) {
          cell.classList.add(isMove.isCapture ? 'valid-capture' : 'valid-move');
        }

        const piece = this.board[r][c];
        if (piece) {
          const isForced = forcedCoords.includes(`${r},${c}`);
          const pEl = document.createElement('div');
          pEl.className = `piece ${piece.color} ${piece.isKing ? 'king' : ''} ${isForced ? 'must-capture' : ''}`;
          cell.appendChild(pEl);
        }

        cell.addEventListener('click', () => this.handleCellClick(r, c));
        this.gridEl.appendChild(cell);
      }
    }

    const txtTurn = document.getElementById('txt-turn');
    if (txtTurn) {
      txtTurn.innerText = `TOUR : ${this.turn === 'white' ? 'BLANCS (VOUS)' : (this.mode === 'ai' ? `ROBOT IA (NV.${this.aiLevel})` : 'ROUGES')}`;
    }
  }

  handleCellClick(r, c) {
    if (!this.running) return;
    if (this.mode === 'ai' && this.turn === 'red') return;

    if (this.chainingPiece) {
      const move = this.validMoves.find(m => m.toR === r && m.toC === c);
      if (move) this.executeMove(this.chainingPiece, move);
      return;
    }

    const piece = this.board[r][c];
    const allCaptures = this.getAllCaptures(this.turn);
    const hasMandatoryCapture = allCaptures.length > 0;

    if (piece && piece.color === this.turn) {
      if (hasMandatoryCapture) {
        const canCapture = allCaptures.find(cap => cap.r === r && cap.c === c);
        if (!canCapture) {
          if (navigator.vibrate) navigator.vibrate(80);
          return;
        }
        this.selectedPiece = { r, c };
        this.validMoves = canCapture.moves;
      } else {
        this.selectedPiece = { r, c };
        this.validMoves = this.getPieceNormalMoves(r, c);
      }
      this.render();
      return;
    }

    if (this.selectedPiece) {
      const move = this.validMoves.find(m => m.toR === r && m.toC === c);
      if (move) this.executeMove(this.selectedPiece, move);
    }
  }

  executeMove(from, move) {
    const piece = this.board[from.r][from.c];
    this.board[move.toR][move.toC] = piece;
    this.board[from.r][from.c] = null;

    if (move.isCapture) {
      this.board[move.capR][move.capC] = null;
      this.playSound('capture');
      if (navigator.vibrate) navigator.vibrate(50);
    } else {
      this.playSound('move');
      if (navigator.vibrate) navigator.vibrate(25);
    }

    this.lastMove = { from, to: { r: move.toR, c: move.toC } };

    // RÈGLE DE PROMOTION : La pièce devient Dame UNIQUEMENT si son tour s'arrête sur la ligne de fond
    let becameKingNow = false;
    if (!piece.isKing) {
      if ((piece.color === 'white' && move.toR === 0) || (piece.color === 'red' && move.toR === this.boardSize - 1)) {
        // En cas de rafle, ne promouvoir que si aucune capture n'est plus possible ensuite
        const nextCaps = this.getPieceCaptureChains(move.toR, move.toC, this.board);
        if (nextCaps.length === 0) {
          piece.isKing = true;
          becameKingNow = true;
          this.playSound('king');
        }
      }
    }

    // Poursuite de la Rafle si d'autres captures sont possibles
    if (move.isCapture && !becameKingNow) {
      const nextCaptures = this.getAllCaptures(this.turn).find(c => c.r === move.toR && c.c === move.toC);
      if (nextCaptures && nextCaptures.moves.length > 0) {
        this.chainingPiece = { r: move.toR, c: move.toC };
        this.selectedPiece = { r: move.toR, c: move.toC };
        this.validMoves = nextCaptures.moves;
        this.render();

        if (this.mode === 'ai' && this.turn === 'red') {
          setTimeout(() => this.makeAIChainJump(), 450);
        }
        return;
      }
    }

    this.chainingPiece = null;
    this.selectedPiece = null;
    this.validMoves = [];

    if (this.checkWin()) return;

    this.turn = this.turn === 'white' ? 'red' : 'white';
    this.render();

    if (this.mode === 'ai' && this.turn === 'red') {
      setTimeout(() => this.makeAIMove(), 450);
    }
  }

  makeAIChainJump() {
    if (!this.running || !this.chainingPiece) return;
    const allCaptures = this.getAllCaptures('red');
    const match = allCaptures.find(c => c.r === this.chainingPiece.r && c.c === this.chainingPiece.c);
    if (match && match.moves.length > 0) {
      const chosen = match.moves[0];
      this.executeMove(this.chainingPiece, chosen);
    }
  }

  // --- INTELLIGENCE ARTIFICIELLE MINIMAX DES DAMES ---
  cloneBoard(board) {
    const newB = Array(this.boardSize);
    for (let r = 0; r < this.boardSize; r++) {
      newB[r] = Array(this.boardSize);
      for (let c = 0; c < this.boardSize; c++) {
        const p = board[r][c];
        newB[r][c] = p ? { ...p } : null;
      }
    }
    return newB;
  }

  evaluateBoard(board) {
    let score = 0;
    for (let r = 0; r < this.boardSize; r++) {
      for (let c = 0; c < this.boardSize; c++) {
        const p = board[r][c];
        if (!p) continue;

        let val = p.isKing ? 300 : 100;
        if (c >= 2 && c <= this.boardSize - 3) val += 15; // Contrôle du centre

        if (p.color === 'red') {
          val += r * 8; // Avancée vers la promotion
          score += val;
        } else {
          val += (this.boardSize - 1 - r) * 8;
          score -= val;
        }
      }
    }
    return score;
  }

  minimax(board, depth, alpha, beta, isMaximizing) {
    if (depth === 0) return this.evaluateBoard(board);

    const turnColor = isMaximizing ? 'red' : 'white';
    const captures = this.getAllCaptures(turnColor, board);
    let allMoves = [];

    if (captures.length > 0) {
      captures.forEach(c => {
        c.moves.forEach(m => allMoves.push({ from: { r: c.r, c: c.c }, move: m }));
      });
    } else {
      for (let r = 0; r < this.boardSize; r++) {
        for (let c = 0; c < this.boardSize; c++) {
          if (board[r][c] && board[r][c].color === turnColor) {
            const moves = this.getPieceNormalMoves(r, c, board);
            moves.forEach(m => allMoves.push({ from: { r, c }, move: m }));
          }
        }
      }
    }

    if (allMoves.length === 0) return this.evaluateBoard(board);

    if (isMaximizing) {
      let maxEval = -Infinity;
      for (const item of allMoves) {
        const simBoard = this.cloneBoard(board);
        simBoard[item.move.toR][item.move.toC] = simBoard[item.from.r][item.from.c];
        simBoard[item.from.r][item.from.c] = null;
        if (item.move.isCapture) simBoard[item.move.capR][item.move.capC] = null;

        const evaluation = this.minimax(simBoard, depth - 1, alpha, beta, false);
        maxEval = Math.max(maxEval, evaluation);
        alpha = Math.max(alpha, evaluation);
        if (beta <= alpha) break;
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (const item of allMoves) {
        const simBoard = this.cloneBoard(board);
        simBoard[item.move.toR][item.move.toC] = simBoard[item.from.r][item.from.c];
        simBoard[item.from.r][item.from.c] = null;
        if (item.move.isCapture) simBoard[item.move.capR][item.move.capC] = null;

        const evaluation = this.minimax(simBoard, depth - 1, alpha, beta, true);
        minEval = Math.min(minEval, evaluation);
        beta = Math.min(beta, evaluation);
        if (beta <= alpha) break;
      }
      return minEval;
    }
  }

  makeAIMove() {
    if (!this.running) return;

    const allCaptures = this.getAllCaptures('red');
    let chosenFrom = null;
    let chosenMove = null;

    if (allCaptures.length > 0) {
      // Si la capture est obligatoire, choisir le meilleur coup de rafle via Minimax
      let bestScore = -Infinity;
      allCaptures.forEach(cap => {
        cap.moves.forEach(m => {
          const simBoard = this.cloneBoard(this.board);
          simBoard[m.toR][m.toC] = simBoard[cap.r][cap.c];
          simBoard[cap.r][cap.c] = null;
          simBoard[m.capR][m.capC] = null;

          const score = this.evaluateBoard(simBoard);
          if (score > bestScore) {
            bestScore = score;
            chosenFrom = { r: cap.r, c: cap.c };
            chosenMove = m;
          }
        });
      });
    } else {
      const allNormalMoves = [];
      for (let r = 0; r < this.boardSize; r++) {
        for (let c = 0; c < this.boardSize; c++) {
          if (this.board[r][c] && this.board[r][c].color === 'red') {
            const moves = this.getPieceNormalMoves(r, c);
            moves.forEach(m => allNormalMoves.push({ from: { r, c }, move: m }));
          }
        }
      }

      if (allNormalMoves.length === 0) {
        this.showEndMatchModal("VICTOIRE DES BLANCS ! 🏆", "L'IA n'a plus aucun déplacement possible.");
        return;
      }

      if (this.aiLevel === 1) {
        const pick = allNormalMoves[Math.floor(Math.random() * allNormalMoves.length)];
        chosenFrom = pick.from;
        chosenMove = pick.move;
      } else {
        const depth = this.aiLevel === 3 ? 3 : 2;
        let bestScore = -Infinity;

        allNormalMoves.forEach(item => {
          const simBoard = this.cloneBoard(this.board);
          simBoard[item.move.toR][item.move.toC] = simBoard[item.from.r][item.from.c];
          simBoard[item.from.r][item.from.c] = null;

          const score = this.minimax(simBoard, depth - 1, -Infinity, Infinity, false);
          if (score > bestScore) {
            bestScore = score;
            chosenFrom = item.from;
            chosenMove = item.move;
          }
        });

        if (!chosenFrom) {
          const pick = allNormalMoves[0];
          chosenFrom = pick.from;
          chosenMove = pick.move;
        }
      }
    }

    if (chosenFrom && chosenMove) {
      this.executeMove(chosenFrom, chosenMove);
    }
  }

  getPieceCounts() {
    let white = 0, red = 0;
    for (let r = 0; r < this.boardSize; r++) {
      for (let c = 0; c < this.boardSize; c++) {
        const p = this.board[r][c];
        if (p) {
          if (p.color === 'white') white++;
          else red++;
        }
      }
    }
    return { white, red };
  }

  checkWin() {
    const counts = this.getPieceCounts();

    if (counts.white === 0 || counts.red === 0) {
      this.playSound('win');
      const winner = counts.white > 0 ? "VICTOIRE DES BLANCS ! 🏆" : "VICTOIRE DU ROBOT IA ! 🤖";
      const sub = counts.white > 0 ? "Félicitations, tu as éliminé toutes les pièces adverses." : "L'IA a capturé toutes tes pièces.";
      
      setTimeout(() => {
        this.showEndMatchModal(winner, sub);
      }, 1200);
      return true;
    }
    return false;
  }

  showEndMatchModal(title, sub) {
    this.running = false;
    const titleEl = document.getElementById('end-winner-title');
    if (titleEl) titleEl.innerText = title;
    const subEl = document.getElementById('end-winner-sub');
    if (subEl) subEl.innerText = sub;
    const modalEl = document.getElementById('end-match-modal');
    if (modalEl) modalEl.style.display = 'block';
  }

  isValid(r, c) {
    return r >= 0 && r < this.boardSize && c >= 0 && c < this.boardSize;
  }

  destroy() {
    this.running = false;
    const globalBack = document.getElementById('btn-back-hub');
    if (globalBack) globalBack.style.display = 'block';

    if (this.modal && this.modal.parentNode) this.modal.parentNode.removeChild(this.modal);
    if (this.ui && this.ui.parentNode) this.ui.parentNode.removeChild(this.ui);
  }
}