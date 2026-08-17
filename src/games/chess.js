export class ChessGame {
  constructor(containerCanvas, onWin) {
    this.canvas = containerCanvas;
    this.onWin = onWin;
    this.running = true;

    this.mode = 'ai'; // 'ai' ou '2p'
    this.aiLevel = 2; // 1: Facile, 2: Moyen, 3: Expert
    this.soundEnabled = true;

    this.board = [];
    this.turn = 'w';
    this.selectedSquare = null;
    this.validMoves = [];
    this.lastMove = null;
    this.enPassantTarget = null;
    this.burningKingPos = null;

    this.positionHistory = [];

    this.scoreWhite = 0;
    this.scoreBlack = 0;

    this.fps = 60;
    this.lastFrameTime = performance.now();
    this.frameCount = 0;

    this.audioCtx = null;

    const globalBack = document.getElementById('btn-back-hub');
    if (globalBack) globalBack.style.display = 'none';

    this.initSettingsModal();
    this.startFpsCounter();
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

      if (type === 'move') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(280, now);
        osc.frequency.exponentialRampToValueAtTime(140, now + 0.08);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === 'capture') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.12);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === 'check') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(480, now);
        osc.frequency.setValueAtTime(600, now + 0.1);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
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
      console.warn("Audio indisponible", e);
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

  initSettingsModal() {
    this.modal = document.createElement('div');
    this.modal.id = 'chess-modal';
    this.modal.innerHTML = `
      <style>
        .chs-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100dvh; background: rgba(10, 14, 23, 0.96); z-index: 2000; display: flex; flex-direction: column; align-items: center; justify-content: center; backdrop-filter: blur(20px); padding: 20px; color: #e2e8f0; box-sizing: border-box; }
        .chs-title { font-size: 1.8rem; font-weight: 800; color: #f1f5f9; text-transform: uppercase; letter-spacing: 3px; margin-bottom: 25px; text-shadow: 0 4px 12px rgba(0,0,0,0.5); text-align: center; }
        .chs-group { width: 100%; max-width: 380px; margin-bottom: 20px; }
        .chs-group label { display: block; font-size: 0.75rem; color: #94a3b8; margin-bottom: 10px; text-transform: uppercase; font-weight: 800; letter-spacing: 1.5px; }
        .chs-opts { display: flex; gap: 10px; }
        .chs-btn { flex: 1; padding: 14px 8px; background: #1e293b; border: 1px solid #334155; border-radius: 12px; color: #94a3b8; font-size: 0.85rem; font-weight: 700; cursor: pointer; text-align: center; transition: all 0.25s ease; }
        .chs-btn.active { border-color: #38bdf8; background: #0f172a; color: #38bdf8; box-shadow: 0 4px 12px rgba(56, 189, 248, 0.25); }
        .chs-start { margin-top: 25px; width: 100%; max-width: 380px; padding: 16px; background: linear-gradient(135deg, #0284c7, #0d9488); border: none; border-radius: 25px; color: #fff; font-weight: 800; font-size: 1rem; text-transform: uppercase; cursor: pointer; letter-spacing: 2px; box-shadow: 0 8px 20px rgba(2, 132, 199, 0.3); transition: transform 0.2s; }
        .chs-start:active { transform: scale(0.98); }
      </style>

      <div class="chs-overlay">
        <h2 class="chs-title">ÉCHECS PRO — BERTHOPLAY</h2>
        
        <div class="chs-group">
          <label>MODE DE JEU</label>
          <div class="chs-opts">
            <div class="chs-btn active" id="opt-mode-ai">vs Robot IA</div>
            <div class="chs-btn" id="opt-mode-2p">2 Joueurs (Local)</div>
          </div>
        </div>

        <div class="chs-group" id="ai-level-group">
          <label>NIVEAU DE L'IA</label>
          <div class="chs-opts">
            <div class="chs-btn" id="opt-lvl-1">Facile</div>
            <div class="chs-btn active" id="opt-lvl-2">Moyen</div>
            <div class="chs-btn" id="opt-lvl-3">Expert 🔥</div>
          </div>
        </div>

        <button class="chs-start" id="btn-start-chess">COMMENCER LA PARTIE ♟️</button>
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

    document.getElementById('btn-start-chess')?.addEventListener('click', () => {
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
    const layout = ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'];
    this.board = Array(8).fill(null).map(() => Array(8).fill(null));

    for (let c = 0; c < 8; c++) {
      this.board[0][c] = { type: layout[c], color: 'b', moved: false };
      this.board[1][c] = { type: 'p', color: 'b', moved: false };
      this.board[6][c] = { type: 'p', color: 'w', moved: false };
      this.board[7][c] = { type: layout[c], color: 'w', moved: false };
    }
    this.enPassantTarget = null;
    this.lastMove = null;
    this.burningKingPos = null;
    this.positionHistory = [];
    this.scoreWhite = 0;
    this.scoreBlack = 0;

    this.recordBoardPosition();
  }

  getBoardHash(board = this.board) {
    let hash = '';
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = board[r][c];
        hash += p ? `${p.color}${p.type}` : '.';
      }
    }
    return hash;
  }

  recordBoardPosition() {
    this.positionHistory.push(this.getBoardHash());
    if (this.positionHistory.length > 20) this.positionHistory.shift();
  }

  initUI() {
    this.ui = document.createElement('div');
    this.ui.id = 'chess-ui-container';
    this.ui.innerHTML = `
      <style>
        /* CSS CORRIGÉ POUR OPTIMISATION SUR PWA MOBILE */
        .chs-game-panel {
          position: fixed; top: 0; left: 0;
          width: 100vw; height: 100dvh; /* dvh dynamique spécial PWA */
          background: #0b0f19;
          display: flex; flex-direction: column;
          align-items: center; justify-content: flex-start;
          gap: min(1.2vh, 10px); /* Espacement régulier sans grand trou noir */
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
        .stat-val { font-size: 0.95rem; color: #f8fafc; font-weight: 900; font-family: monospace; }

        .chs-status-group { text-align: center; }
        .chs-turn { font-size: 0.85rem; font-weight: 800; color: #38bdf8; letter-spacing: 1.5px; text-transform: uppercase; }
        .chs-alert { font-size: 0.85rem; font-weight: 800; color: #f43f5e; text-transform: uppercase; min-height: 1.1em; }

        /* BOÎTE DU PLATEAU CENTRÉE AVEC ESPACE DE SÉCURITÉ EN BAS (PWA) */
        .chs-board-wrapper {
          position: relative;
          width: min(90vw, 48dvh, 440px);
          height: min(90vw, 48dvh, 440px);
          border: 3.5px solid #334155;
          border-radius: 14px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.6), inset 0 0 2px rgba(255,255,255,0.1);
          overflow: hidden;
          background: #1e293b;
          margin-top: auto;
          margin-bottom: auto; /* Centrage vertical parfait */
        }

        .chs-board { display: grid; grid-template-columns: repeat(8, 1fr); grid-template-rows: repeat(8, 1fr); width: 100%; height: 100%; }

        .cell { display: flex; align-items: center; justify-content: center; position: relative; touch-action: manipulation; cursor: pointer; user-select: none; }
        .cell.light { background: #2b384e; }
        .cell.dark { background: #151d2a; }
        .cell.selected { background: rgba(56, 189, 248, 0.35) !important; }
        .cell.last-move { background: rgba(168, 85, 247, 0.25) !important; }

        .cell.valid-move::after { content: ''; width: 26%; height: 26%; background: #34d399; border-radius: 50%; position: absolute; z-index: 10; opacity: 0.85; }
        .cell.valid-capture::after { content: ''; width: 82%; height: 82%; border: 3px solid #f43f5e; border-radius: 50%; position: absolute; z-index: 10; opacity: 0.85; }
        .cell.king-check { background: rgba(244, 63, 94, 0.5) !important; }

        @keyframes king-collapse-burn {
          0% { transform: scale(1) rotate(0deg); filter: drop-shadow(0 0 5px #ff3300) brightness(1); }
          35% { transform: scale(1.15) rotate(-18deg) translateY(-5px); filter: drop-shadow(0 0 20px #ff6600) brightness(2); }
          75% { transform: scale(0.6) rotate(65deg) translateY(10px); filter: drop-shadow(0 0 30px #dc2626) opacity(0.6); }
          100% { transform: scale(0.1) rotate(90deg) translateY(20px); filter: drop-shadow(0 0 40px #000) opacity(0); }
        }
        .svg-piece.king-burning {
          animation: king-collapse-burn 1.8s forwards cubic-bezier(0.25, 1, 0.5, 1);
          z-index: 100 !important;
        }

        .svg-piece { width: 86%; height: 86%; z-index: 5; pointer-events: none; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.5)); transition: transform 0.15s ease; }

        @media (orientation: landscape) and (max-height: 550px) {
          .chs-game-panel { flex-direction: row; justify-content: space-evenly; padding: 10px; }
          .top-bar { flex-direction: column; width: 170px; gap: 8px; }
          .stats-bar { flex-direction: column; width: 170px; gap: 8px; }
          .stat-card { width: 100%; }
          .chs-board-wrapper { width: min(84vh, 380px); height: min(84vh, 380px); margin: 0; }
        }

        .promo-modal { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.95); display: flex; align-items: center; justify-content: center; gap: 15px; z-index: 500; backdrop-filter: blur(8px); }
        .promo-opt { width: 62px; height: 62px; background: #1e293b; border: 1px solid #38bdf8; border-radius: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center; }

        .end-modal { position: fixed; top: 22%; left: 50%; transform: translate(-50%, -50%); background: rgba(15, 23, 42, 0.95); border: 1px solid #38bdf8; padding: 20px 24px; border-radius: 18px; text-align: center; z-index: 3000; display: none; box-shadow: 0 10px 30px rgba(0,0,0,0.8); width: 85%; max-width: 360px; color: #f8fafc; backdrop-filter: blur(10px); }
        .end-modal h2 { font-size: 1.4rem; color: #38bdf8; margin-bottom: 6px; text-transform: uppercase; font-weight: 800; }
        .end-modal p { font-size: 0.85rem; color: #94a3b8; margin-bottom: 16px; }
        .end-btns { display: flex; gap: 10px; flex-wrap: wrap; }
        .end-btn { flex: 1; padding: 12px; border-radius: 16px; border: none; font-weight: 800; font-size: 0.8rem; cursor: pointer; text-transform: uppercase; letter-spacing: 1px; }
        .btn-replay { background: #38bdf8; color: #0f172a; }
        .btn-hub { background: #1e293b; color: #f8fafc; border: 1px solid #334155; }
        .btn-toggle-view { width: 100%; background: rgba(56, 189, 248, 0.1); border: 1px solid #38bdf8; color: #38bdf8; margin-top: 6px; }
      </style>

      <div class="chs-game-panel">
        <div class="top-bar">
          <div class="brand-badge"><span class="pro-tag">PRO</span> BERTHOPLAY</div>
          <div class="nav-actions">
            <button class="icon-btn" id="btn-sound">🔊</button>
            <button class="icon-btn" id="btn-exit">◀ Menu</button>
          </div>
        </div>

        <div class="stats-bar">
          <div class="stat-card">
            <span class="stat-lbl">SCORES (PTS)</span>
            <span class="stat-val" id="txt-score">VOUS 0 | 0 IA</span>
          </div>
          <div class="stat-card">
            <span class="stat-lbl">FPS</span>
            <span class="stat-val" id="txt-fps">60</span>
          </div>
        </div>

        <div class="chs-status-group">
          <div class="chs-turn" id="txt-turn">TOUR DES BLANCS</div>
          <div class="chs-alert" id="txt-alert"></div>
        </div>

        <div class="chs-board-wrapper" id="board-wrapper">
          <div class="chs-board" id="chs-grid"></div>
        </div>
      </div>

      <div class="end-modal" id="end-match-modal">
        <h2 id="end-winner-title">ÉCHEC ET MAT ! 🏆</h2>
        <p id="end-winner-sub">Match terminé avec succès.</p>
        <div class="end-btns">
          <button class="end-btn btn-replay" id="btn-replay-match">REJOUER 🔄</button>
          <button class="end-btn btn-hub" id="btn-return-hub">MENU 🏠</button>
          <button class="end-btn btn-toggle-view" id="btn-inspect-board">👁️ VOIR LE PLATEAU</button>
        </div>
      </div>
    `;

    document.body.appendChild(this.ui);
    this.gridEl = document.getElementById('chs-grid');

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
      this.turn = 'w';
      this.selectedSquare = null;
      this.validMoves = [];
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

  getPieceSVG(type, color, isBurning = false) {
    const isW = color === 'w';
    const gradId = isW ? `grad-real-w-${type}` : `grad-real-b-${type}`;
    const strokeColor = isW ? '#d1d5db' : '#475569';

    const paths = {
      p: 'M 25,9 C 22,9 20,11 20,14 C 20,16 21.5,17.5 23,18 C 21,21 19,25 19,30 L 17,33 L 17,37 L 33,37 L 33,33 L 31,30 C 31,25 29,21 27,18 C 28.5,17.5 30,16 30,14 C 30,11 28,9 25,9 Z M 15,39 L 35,39 L 35,42 L 15,42 Z',
      r: 'M 12,10 L 12,18 L 15,18 L 15,13 L 21,13 L 21,18 L 29,18 L 29,13 L 35,13 L 35,18 L 38,18 L 38,10 Z M 16,20 L 34,20 L 32,32 L 36,34 L 36,38 L 14,38 L 14,34 L 18,32 Z M 13,40 L 37,40 L 37,43 L 13,43 Z',
      n: 'M 15,38 L 35,38 L 35,34 C 35,34 31,31 31,26 C 31,19 36,16 36,11 C 36,5 28,4 23,4 C 18,4 14,8 14,13 C 14,16 16.5,17.5 18,17.5 C 19.5,17.5 21,16 20,14 C 19,12 21,9 24,9 C 27,9 29,11 29,14 C 29,18 25,21 23,24 L 17,25 C 15,25 14,28 14,32 Z M 13,40 L 37,40 L 37,43 L 13,43 Z',
      b: 'M 25,5 C 23,5 21,7 21,9.5 C 21,11 22,12 23,12.5 C 18,15 16,20 16,26 L 14,28 L 14,33 L 36,33 L 36,28 L 34,26 C 34,20 32,15 27,12.5 C 28,12 29,11 29,9.5 C 29,7 27,5 25,5 Z M 25,16 C 26.5,16 27.5,17.5 27.5,19 C 27.5,20.5 26.5,22 25,22 C 23.5,22 22.5,20.5 22.5,19 C 22.5,17.5 23.5,16 25,16 Z M 13,35 L 37,35 L 37,38 L 13,38 Z M 11,40 L 39,40 L 39,43 L 11,43 Z',
      q: 'M 8,24 L 11,31 L 39,31 L 42,24 L 37,14 L 30,22 L 25,9 L 20,22 L 13,14 Z M 8,7 C 6.5,7 5.5,8 5.5,9.5 C 5.5,11 6.5,12 8,12 C 9.5,12 10.5,11 10.5,9.5 C 10.5,8 9.5,7 8,7 Z M 25,2 C 23.5,2 22.5,3 22.5,4.5 C 22.5,6 23.5,7 25,7 C 26.5,7 27.5,6 27.5,4.5 C 27.5,3 26.5,2 25,2 Z M 42,7 C 40.5,7 39.5,8 39.5,9.5 C 39.5,11 40.5,12 42,12 C 43.5,12 44.5,11 44.5,9.5 C 44.5,8 43.5,7 42,7 Z M 11,33 L 39,33 L 39,37 L 11,37 Z M 10,39 L 40,39 L 40,42 L 10,42 Z',
      k: 'M 23,8 L 27,8 L 27,6 L 29,6 L 29,4 L 27,4 L 27,1 L 23,1 L 23,4 L 21,4 L 21,6 L 23,6 Z M 12,33 L 38,33 L 38,37 L 12,37 Z M 12,31 L 38,31 L 35,26 L 33,16 L 29,21 L 25,11 L 21,21 L 17,16 L 15,26 Z M 10,39 L 40,39 L 40,42 L 10,42 Z'
    };

    return `
      <svg class="svg-piece ${isBurning ? 'king-burning' : ''}" viewBox="0 0 50 50">
        <defs>
          <linearGradient id="${gradId}" x1="0%" y1="0%" x2="100%" y2="100%">
            ${isW 
              ? '<stop offset="0%" stop-color="#ffffff" /><stop offset="70%" stop-color="#e2e8f0" /><stop offset="100%" stop-color="#cbd5e1" />'
              : '<stop offset="0%" stop-color="#f43f5e" /><stop offset="70%" stop-color="#9f1239" /><stop offset="100%" stop-color="#4c0519" />'}
          </linearGradient>
        </defs>
        <path d="${paths[type]}" fill="url(#${gradId})" stroke="${strokeColor}" stroke-width="1.5" stroke-linejoin="round" fill-opacity="0.95" />
      </svg>
    `;
  }

  render() {
    this.gridEl.innerHTML = '';
    const inCheck = this.isKingInCheck(this.turn);

    const alertEl = document.getElementById('txt-alert');
    if (alertEl) alertEl.innerText = inCheck ? "⚠️ ÉCHEC AU ROI !" : "";

    const scoreEl = document.getElementById('txt-score');
    if (scoreEl) {
      scoreEl.innerText = `VOUS ${this.scoreWhite} | ${this.scoreBlack} IA`;
    }

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const cell = document.createElement('div');
        const isDark = (r + c) % 2 === 1;
        cell.className = `cell ${isDark ? 'dark' : 'light'}`;

        if (this.selectedSquare && this.selectedSquare.r === r && this.selectedSquare.c === c) {
          cell.classList.add('selected');
        }

        if (this.lastMove && ((this.lastMove.from.r === r && this.lastMove.from.c === c) || (this.lastMove.to.r === r && this.lastMove.to.c === c))) {
          cell.classList.add('last-move');
        }

        const piece = this.board[r][c];
        if (inCheck && piece && piece.type === 'k' && piece.color === this.turn) {
          cell.classList.add('king-check');
        }

        const isMove = this.validMoves.find(m => m.r === r && m.c === c);
        if (isMove) {
          cell.classList.add((this.board[r][c] || isMove.isEnPassant) ? 'valid-capture' : 'valid-move');
        }

        if (piece) {
          const isBurning = this.burningKingPos && this.burningKingPos.r === r && this.burningKingPos.c === c;
          cell.innerHTML += this.getPieceSVG(piece.type, piece.color, isBurning);
        }

        cell.addEventListener('click', () => this.handleSquareClick(r, c));
        this.gridEl.appendChild(cell);
      }
    }

    const txtTurn = document.getElementById('txt-turn');
    if (txtTurn) {
      txtTurn.innerText = `TOUR : ${this.turn === 'w' ? 'BLANCS (VOUS)' : (this.mode === 'ai' ? `ROBOT IA (NV.${this.aiLevel})` : 'NOIRS')}`;
    }
  }

  handleSquareClick(r, c) {
    if (!this.running) return;
    if (this.mode === 'ai' && this.turn === 'b') return;

    const piece = this.board[r][c];

    if (piece && piece.color === this.turn) {
      this.selectedSquare = { r, c };
      this.validMoves = this.getLegalMoves(r, c);
      this.render();
      return;
    }

    if (this.selectedSquare) {
      const move = this.validMoves.find(m => m.r === r && m.c === c);
      if (move) {
        this.executeMove(this.selectedSquare, move);
      }
    }
  }

  executeMove(from, to) {
    const piece = this.board[from.r][from.c];
    const target = this.board[to.r][to.c];
    let isCapture = !!target || to.isEnPassant;

    if (isCapture) {
      const values = { p: 100, n: 300, b: 300, r: 500, q: 900, k: 0 };
      const capturedType = target ? target.type : 'p';
      const pts = values[capturedType] || 100;
      if (piece.color === 'w') this.scoreWhite += pts;
      else this.scoreBlack += pts;
    }

    if (piece.type === 'p' && to.isEnPassant) {
      const dir = piece.color === 'w' ? 1 : -1;
      this.board[to.r + dir][to.c] = null;
    }

    if (piece.type === 'k' && Math.abs(to.c - from.c) === 2) {
      if (to.c === 6) {
        const rook = this.board[from.r][7];
        this.board[from.r][5] = rook;
        this.board[from.r][7] = null;
        if (rook) rook.moved = true;
      } else if (to.c === 2) {
        const rook = this.board[from.r][0];
        this.board[from.r][3] = rook;
        this.board[from.r][0] = null;
        if (rook) rook.moved = true;
      }
    }

    if (piece.type === 'p' && Math.abs(to.r - from.r) === 2) {
      this.enPassantTarget = { r: (from.r + to.r) / 2, c: from.c };
    } else {
      this.enPassantTarget = null;
    }

    this.board[to.r][to.c] = piece;
    this.board[from.r][from.c] = null;
    piece.moved = true;

    this.lastMove = { from, to };
    this.selectedSquare = null;
    this.validMoves = [];

    this.recordBoardPosition();

    this.playSound(isCapture ? 'capture' : 'move');
    if (navigator.vibrate) navigator.vibrate(isCapture ? 60 : 30);

    if (piece.type === 'p' && (to.r === 0 || to.r === 7)) {
      if (this.mode === 'ai' && this.turn === 'b') {
        piece.type = 'q';
        this.finalizeTurn();
      } else {
        this.promptPromotion(piece, () => this.finalizeTurn());
      }
      return;
    }

    this.finalizeTurn();
  }

  promptPromotion(piece, callback) {
    const wrapper = document.getElementById('board-wrapper');
    const modal = document.createElement('div');
    modal.className = 'promo-modal';
    const opts = ['q', 'r', 'b', 'n'];

    opts.forEach(t => {
      const btn = document.createElement('div');
      btn.className = 'promo-opt';
      btn.innerHTML = this.getPieceSVG(t, piece.color);
      btn.onclick = () => {
        piece.type = t;
        wrapper.removeChild(modal);
        callback();
      };
      modal.appendChild(btn);
    });

    wrapper.appendChild(modal);
  }

  finalizeTurn() {
    this.turn = this.turn === 'w' ? 'b' : 'w';

    if (this.isKingInCheck(this.turn)) {
      this.playSound('check');
    }

    if (this.checkGameEnd()) return;

    this.render();

    if (this.mode === 'ai' && this.turn === 'b') {
      setTimeout(() => this.makeAIMove(), 400);
    }
  }

  getLegalMoves(r, c, customBoard = null) {
    const rawMoves = this.getPseudoMoves(r, c, customBoard || this.board, true);
    const board = customBoard || this.board;
    const piece = board[r][c];
    if (!piece) return [];

    return rawMoves.filter(m => {
      const simBoard = this.cloneBoard(board);
      simBoard[m.r][m.c] = simBoard[r][c];
      simBoard[r][c] = null;
      if (m.isEnPassant) {
        const dir = piece.color === 'w' ? 1 : -1;
        simBoard[m.r + dir][m.c] = null;
      }
      return !this.isKingInCheck(piece.color, simBoard);
    });
  }

  getPseudoMoves(r, c, board, allowCastling = true) {
    const piece = board[r][c];
    if (!piece) return [];

    const moves = [];
    const dir = piece.color === 'w' ? -1 : 1;

    if (piece.type === 'p') {
      if (this.isValid(r + dir, c) && !board[r + dir][c]) {
        moves.push({ r: r + dir, c });
        if (!piece.moved && this.isValid(r + dir * 2, c) && !board[r + dir * 2][c]) {
          moves.push({ r: r + dir * 2, c });
        }
      }
      [-1, 1].forEach(dc => {
        const nr = r + dir, nc = c + dc;
        if (this.isValid(nr, nc)) {
          const target = board[nr][nc];
          if (target && target.color !== piece.color) {
            moves.push({ r: nr, c: nc });
          } else if (this.enPassantTarget && this.enPassantTarget.r === nr && this.enPassantTarget.c === nc) {
            moves.push({ r: nr, c: nc, isEnPassant: true });
          }
        }
      });
    }

    if (piece.type === 'n') {
      [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]].forEach(([dr, dc]) => {
        const nr = r + dr, nc = c + dc;
        if (this.isValid(nr, nc)) {
          const target = board[nr][nc];
          if (!target || target.color !== piece.color) moves.push({ r: nr, c: nc });
        }
      });
    }

    if (['r', 'q'].includes(piece.type)) {
      [[-1,0],[1,0],[0,-1],[0,1]].forEach(([dr, dc]) => this.addRayMoves(r, c, dr, dc, piece.color, moves, board));
    }

    if (['b', 'q'].includes(piece.type)) {
      [[-1,-1],[-1,1],[1,-1],[1,1]].forEach(([dr, dc]) => this.addRayMoves(r, c, dr, dc, piece.color, moves, board));
    }

    if (piece.type === 'k') {
      [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]].forEach(([dr, dc]) => {
        const nr = r + dr, nc = c + dc;
        if (this.isValid(nr, nc)) {
          const target = board[nr][nc];
          if (!target || target.color !== piece.color) moves.push({ r: nr, c: nc });
        }
      });

      if (allowCastling && !piece.moved && !this.isKingInCheck(piece.color, board)) {
        const r1 = board[r][7];
        if (r1 && r1.type === 'r' && !r1.moved && !board[r][5] && !board[r][6]) {
          if (!this.isSquareAttacked(r, 5, piece.color, board) && !this.isSquareAttacked(r, 6, piece.color, board)) {
            moves.push({ r, c: 6 });
          }
        }
        const r2 = board[r][0];
        if (r2 && r2.type === 'r' && !r2.moved && !board[r][1] && !board[r][2] && !board[r][3]) {
          if (!this.isSquareAttacked(r, 2, piece.color, board) && !this.isSquareAttacked(r, 3, piece.color, board)) {
            moves.push({ r, c: 2 });
          }
        }
      }
    }

    return moves;
  }

  addRayMoves(r, c, dr, dc, color, moves, board) {
    let step = 1;
    while (true) {
      const nr = r + dr * step, nc = c + dc * step;
      if (!this.isValid(nr, nc)) break;
      const target = board[nr][nc];
      if (!target) {
        moves.push({ r: nr, c: nc });
      } else {
        if (target.color !== color) moves.push({ r: nr, c: nc });
        break;
      }
      step++;
    }
  }

  isSquareAttacked(r, c, defenderColor, board) {
    const enemyColor = defenderColor === 'w' ? 'b' : 'w';
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const p = board[row][col];
        if (p && p.color === enemyColor) {
          const moves = this.getPseudoMoves(row, col, board, false);
          if (moves.some(m => m.r === r && m.c === c)) return true;
        }
      }
    }
    return false;
  }

  isKingInCheck(color, customBoard = null) {
    const board = customBoard || this.board;
    let kingPos = null;

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (board[r][c] && board[r][c].type === 'k' && board[r][c].color === color) {
          kingPos = { r, c };
          break;
        }
      }
    }
    if (!kingPos) return false;
    return this.isSquareAttacked(kingPos.r, kingPos.c, color, board);
  }

  hasLegalMoves(color) {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (this.board[r][c] && this.board[r][c].color === color) {
          if (this.getLegalMoves(r, c).length > 0) return true;
        }
      }
    }
    return false;
  }

  checkGameEnd() {
    if (!this.hasLegalMoves(this.turn)) {
      if (this.isKingInCheck(this.turn)) {
        for (let r = 0; r < 8; r++) {
          for (let c = 0; c < 8; c++) {
            if (this.board[r][c] && this.board[r][c].type === 'k' && this.board[r][c].color === this.turn) {
              this.burningKingPos = { r, c };
              break;
            }
          }
        }

        this.playSound('win');
        this.render();

        const winner = this.turn === 'w' ? "NOIRS (IA) GAGNENT !" : "BLANCS GAGNENT ! 🏆";

        setTimeout(() => {
          this.showEndModal("ÉCHEC ET MAT ! 🏆", winner);
        }, 1800);
      } else {
        this.showEndModal("PAT ! 🤝", "Égalité : Aucun coup légal possible.");
      }
      return true;
    }
    return false;
  }

  cloneBoard(board) {
    const newB = Array(8);
    for (let r = 0; r < 8; r++) {
      newB[r] = Array(8);
      for (let c = 0; c < 8; c++) {
        const p = board[r][c];
        newB[r][c] = p ? { ...p } : null;
      }
    }
    return newB;
  }

  evaluateBoard(board) {
    const weights = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000 };
    const pst = [
      [0,  0,  0,  0,  0,  0,  0,  0],
      [50, 50, 50, 50, 50, 50, 50, 50],
      [10, 10, 20, 30, 30, 20, 10, 10],
      [ 5,  5, 10, 27, 27, 10,  5,  5],
      [ 0,  0,  0, 25, 25,  0,  0,  0],
      [ 5, -5,-10,  0,  0,-10, -5,  5],
      [ 5, 10, 10,-20,-20, 10, 10,  5],
      [ 0,  0,  0,  0,  0,  0,  0,  0]
    ];

    let score = 0;
    let wKingPos = null;

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (board[r][c] && board[r][c].type === 'k' && board[r][c].color === 'w') {
          wKingPos = { r, c };
          break;
        }
      }
    }

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = board[r][c];
        if (!p) continue;
        let val = weights[p.type] + (p.type === 'p' ? pst[r][c] : 0);

        if (p.color === 'b') {
          if (wKingPos && ['q', 'r', 'b', 'n'].includes(p.type)) {
            const dist = Math.abs(r - wKingPos.r) + Math.abs(c - wKingPos.c);
            val += (14 - dist) * 20;
          }
          if (p.type === 'k') val -= 60;
          score += val;
        } else {
          score -= val;
        }
      }
    }

    const simHash = this.getBoardHash(board);
    if (this.positionHistory.includes(simHash)) {
      score -= 1000;
    }

    if (this.isKingInCheck('w', board)) {
      score += 250;
    }

    return score;
  }

  minimax(board, depth, alpha, beta, isMaximizing) {
    if (depth === 0) return this.evaluateBoard(board);

    const turnColor = isMaximizing ? 'b' : 'w';
    let allMoves = [];

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (board[r][c] && board[r][c].color === turnColor) {
          const moves = this.getLegalMoves(r, c, board);
          moves.forEach(m => allMoves.push({ from: { r, c }, to: m }));
        }
      }
    }

    if (allMoves.length === 0) return this.evaluateBoard(board);

    allMoves.sort((a, b) => {
      const pA = board[a.from.r][a.from.c];
      const pB = board[b.from.r][b.from.c];
      const targetA = board[a.to.r][a.to.c];
      const targetB = board[b.to.r][b.to.c];

      if (targetA && !targetB) return -1;
      if (!targetA && targetB) return 1;
      if (pA.type !== 'k' && pB.type === 'k') return -1;
      if (pA.type === 'k' && pB.type !== 'k') return 1;
      return 0;
    });

    if (isMaximizing) {
      let maxEval = -Infinity;
      for (const item of allMoves) {
        const simBoard = this.cloneBoard(board);
        simBoard[item.to.r][item.to.c] = simBoard[item.from.r][item.from.c];
        simBoard[item.from.r][item.from.c] = null;

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
        simBoard[item.to.r][item.to.c] = simBoard[item.from.r][item.from.c];
        simBoard[item.from.r][item.from.c] = null;

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

    let allMoves = [];
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (this.board[r][c] && this.board[r][c].color === 'b') {
          const moves = this.getLegalMoves(r, c);
          moves.forEach(m => allMoves.push({ from: { r, c }, to: m }));
        }
      }
    }

    if (allMoves.length === 0) return;

    let chosen = null;

    if (this.aiLevel === 1) {
      if (Math.random() < 0.15 && allMoves.length > 1) {
        chosen = allMoves[Math.floor(Math.random() * allMoves.length)];
      } else {
        let bestScore = -Infinity;
        allMoves.forEach(item => {
          const simBoard = this.cloneBoard(this.board);
          simBoard[item.to.r][item.to.c] = simBoard[item.from.r][item.from.c];
          simBoard[item.from.r][item.from.c] = null;
          const score = this.evaluateBoard(simBoard);
          if (score > bestScore) {
            bestScore = score;
            chosen = item;
          }
        });
      }
    } 
    else {
      const depth = this.aiLevel === 3 ? 3 : 2;
      let bestScore = -Infinity;

      allMoves.sort((a, b) => {
        const pA = this.board[a.from.r][a.from.c];
        const pB = this.board[b.from.r][b.from.c];
        if (pA.type !== 'k' && pB.type === 'k') return -1;
        if (pA.type === 'k' && pB.type !== 'k') return 1;
        return 0;
      });

      allMoves.forEach(item => {
        const simBoard = this.cloneBoard(this.board);
        simBoard[item.to.r][item.to.c] = simBoard[item.from.r][item.from.c];
        simBoard[item.from.r][item.from.c] = null;

        const score = this.minimax(simBoard, depth - 1, -Infinity, Infinity, false);
        if (score > bestScore) {
          bestScore = score;
          chosen = item;
        }
      });

      if (!chosen) chosen = allMoves[0];
    }

    if (chosen) {
      this.executeMove(chosen.from, chosen.to);
    }
  }

  showEndModal(title, sub) {
    this.running = false;
    const titleEl = document.getElementById('end-winner-title');
    if (titleEl) titleEl.innerText = title;
    const subEl = document.getElementById('end-winner-sub');
    if (subEl) subEl.innerText = sub;
    const modalEl = document.getElementById('end-match-modal');
    if (modalEl) modalEl.style.display = 'block';
  }

  isValid(r, c) {
    return r >= 0 && r < 8 && c >= 0 && c < 8;
  }

  destroy() {
    this.running = false;
    const globalBack = document.getElementById('btn-back-hub');
    if (globalBack) globalBack.style.display = 'block';

    if (this.modal && this.modal.parentNode) this.modal.parentNode.removeChild(this.modal);
    if (this.ui && this.ui.parentNode) this.ui.parentNode.removeChild(this.ui);
  }
}