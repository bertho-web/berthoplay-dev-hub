// ============================================================================
// 🎮 BERTHOPLAY — CONTRÔLEUR CENTRAL (SRC/MAIN.JS) [AUTO-HIDE BANNER PWA]
// ============================================================================

import { i18n } from './i18n.js';
import { BerthoUI } from './ui-dialogs.js';

// Mode Sandbox local pour le Dev Hub
const IS_SANDBOX = true;
const API_URL = IS_SANDBOX ? '' : 'https://berthoplay.bertho.workers.dev';

// Registre de métadonnées visuelles 3D / Relief Métallique AAA
const HIGH_END_GAME_ICONS = {
  billiards: {
    title: 'Billard 3D Pro',
    infoKey: 'gameVictories',
    defaultVal: state => state.billiardsWins || 0,
    svg: `<svg width="42" height="42" viewBox="0 0 40 40" fill="none"><defs><radialGradient id="billiardGrad" cx="35%" cy="35%" r="65%"><stop offset="0%" stop-color="#38bdf8"/><stop offset="60%" stop-color="#0284c7"/><stop offset="100%" stop-color="#030308"/></radialGradient></defs><circle cx="20" cy="20" r="18" fill="url(#billiardGrad)" stroke="#38bdf8" stroke-width="1.5"/><circle cx="20" cy="20" r="8" fill="#ffffff"/><text x="20" y="24" font-size="11" font-weight="900" fill="#0f172a" text-anchor="middle">8</text></svg>`
  },
  bubble: {
    title: 'Bubble Shooter AAA',
    infoKey: 'gameStage',
    suffix: '/50',
    defaultVal: state => state.bubbleLevel || 1,
    svg: `<svg width="42" height="42" viewBox="0 0 40 40" fill="none"><defs><radialGradient id="bubGrad" cx="30%" cy="30%" r="70%"><stop offset="0%" stop-color="#a855f7"/><stop offset="50%" stop-color="#06b6d4"/><stop offset="100%" stop-color="#030308"/></radialGradient></defs><circle cx="20" cy="20" r="17" fill="url(#bubGrad)" stroke="#06b6d4" stroke-width="1.5"/><ellipse cx="14" cy="14" rx="4" ry="2" fill="#ffffff" opacity="0.6"/></svg>`
  },
  car: {
    title: 'Conduite & Course',
    infoKey: 'gameProgression',
    suffix: '/10',
    defaultVal: state => state.carLevel || 1,
    svg: `<svg width="42" height="42" viewBox="0 0 40 40" fill="none"><defs><linearGradient id="carBody3D" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#ff4d4d"/><stop offset="50%" stop-color="#e60000"/><stop offset="100%" stop-color="#660000"/></linearGradient><linearGradient id="carGlass" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#38bdf8"/><stop offset="100%" stop-color="#0284c7"/></linearGradient></defs><path d="M6 24 C6 20, 10 17, 13 16 C15 13, 17 11, 20 11 C23 11, 25 13, 27 16 C30 17, 34 20, 34 24 L34 26 C34 27.5, 32.5 28.5, 31 28.5 L29 28.5 C29 27, 27.5 25.5, 26 25.5 C24.5 25.5, 23 27, 23 28.5 L17 28.5 C17 27, 15.5 25.5, 14 25.5 C12.5 25.5, 11 27, 11 28.5 L9 28.5 C7.5 28.5, 6 27.5, 6 26 Z" fill="url(#carBody3D)" stroke="#ff8080" stroke-width="0.8"/><path d="M14.5 16 C16 13.5, 17.5 12.5, 20 12.5 C22.5 12.5, 24 13.5, 25.5 16 Z" fill="url(#carGlass)" opacity="0.9"/><circle cx="14" cy="28" r="3.5" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/><circle cx="26" cy="28" r="3.5" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/><circle cx="14" cy="28" r="1.2" fill="#ffffff"/><circle cx="26" cy="28" r="1.2" fill="#ffffff"/><ellipse cx="20" cy="18" rx="8" ry="1" fill="#ffffff" opacity="0.3"/></svg>`
  },
  bike: {
    title: 'Moto Superbike',
    infoKey: 'gameStage',
    suffix: '/10',
    defaultVal: state => state.bikeLevel || 1,
    svg: `<svg width="42" height="42" viewBox="0 0 40 40" fill="none"><defs><linearGradient id="bikeBody3D" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#f59e0b"/><stop offset="50%" stop-color="#d97706"/><stop offset="100%" stop-color="#78350f"/></linearGradient><linearGradient id="bikeWheel" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#334155"/><stop offset="100%" stop-color="#0f172a"/></linearGradient><linearGradient id="bikeVisor" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#38bdf8"/><stop offset="100%" stop-color="#0284c7"/></linearGradient></defs><circle cx="9" cy="25" r="6" fill="url(#bikeWheel)" stroke="#fbbf24" stroke-width="1.8"/><circle cx="9" cy="25" r="2.5" fill="#38bdf8"/><circle cx="31" cy="25" r="6" fill="url(#bikeWheel)" stroke="#fbbf24" stroke-width="1.8"/><circle cx="31" cy="25" r="2.5" fill="#38bdf8"/><path d="M9 25 L18 20 L31 25" stroke="#94a3b8" stroke-width="2" stroke-linecap="round"/><path d="M14 20 L21 11 L27 18" stroke="#38bdf8" stroke-width="2"/><path d="M12 21 L16 13 L26 12 L30 18 L25 21 L19 22 Z" fill="url(#bikeBody3D)" stroke="#fef3c7" stroke-width="0.8"/><path d="M22 10 C24 8, 27 8, 29 12 L24 14 Z" fill="url(#bikeVisor)"/><path d="M10 26 L17 23" stroke="#f43f5e" stroke-width="2" stroke-linecap="round"/><ellipse cx="23" cy="11" rx="2" ry="0.6" fill="#ffffff" opacity="0.6"/></svg>`
  },
  checkers: {
    title: 'Dames Pro',
    infoKey: 'gameVictories',
    defaultVal: state => state.checkersWins || 0,
    svg: `<svg width="42" height="42" viewBox="0 0 40 40" fill="none"><defs><radialGradient id="checkers3D" cx="35%" cy="35%" r="65%"><stop offset="0%" stop-color="#ffffff"/><stop offset="50%" stop-color="#cbd5e1"/><stop offset="85%" stop-color="#64748b"/><stop offset="100%" stop-color="#1e293b"/></radialGradient></defs><circle cx="20" cy="22" r="16" fill="#0f172a" opacity="0.4"/><circle cx="20" cy="20" r="16" fill="url(#checkers3D)" stroke="#38bdf8" stroke-width="1.5"/><circle cx="20" cy="20" r="11" fill="none" stroke="#64748b" stroke-width="1.5"/><circle cx="20" cy="20" r="7" fill="#0284c7" stroke="#38bdf8" stroke-width="1"/><ellipse cx="15" cy="14" rx="4" ry="2" fill="#ffffff" opacity="0.6"/></svg>`
  },
  chess: {
    title: 'Échecs Danger',
    infoKey: 'gameVictories',
    defaultVal: state => state.chessWins || 0,
    svg: `<svg width="42" height="42" viewBox="0 0 40 40" fill="none"><defs><linearGradient id="chessCrown3D" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#c084fc"/><stop offset="50%" stop-color="#a855f7"/><stop offset="100%" stop-color="#581c87"/></linearGradient></defs><ellipse cx="20" cy="34" rx="11" ry="2" fill="#000000" opacity="0.4"/><path d="M11 32 h18 v2 c0 1.5 -2 2.5 -9 2.5 c-7 0 -9 -1 -9 -2.5 z" fill="#fbbf24"/><path d="M12 30 h16 l-2 -12 h-12 z" fill="url(#chessCrown3D)"/><path d="M10 18 L13 22 L20 15 L27 22 L30 18 L26 28 L14 28 Z" fill="url(#chessCrown3D)" stroke="#fbbf24" stroke-width="1"/><path d="M19 8 h2 v6 h-2 z M17 10 h6 v2 h-6 z" fill="#fbbf24"/><circle cx="20" cy="6" r="1.5" fill="#ffffff"/><ellipse cx="17" cy="20" rx="1.5" ry="3" fill="#ffffff" opacity="0.4"/></svg>`
  },
  horde: {
    title: 'Horde Survivor 3D',
    infoKey: 'gameBest',
    defaultVal: state => state.hordeScore || 0,
    svg: `<svg width="42" height="42" viewBox="0 0 40 40" fill="none"><defs><radialGradient id="horde3D" cx="35%" cy="35%" r="65%"><stop offset="0%" stop-color="#4ade80"/><stop offset="50%" stop-color="#16a34a"/><stop offset="100%" stop-color="#052e16"/></radialGradient></defs><circle cx="20" cy="20" r="17" fill="url(#horde3D)" stroke="#22c55e" stroke-width="1.5"/><circle cx="20" cy="20" r="10" stroke="#000000" stroke-width="1.5" opacity="0.6"/><circle cx="20" cy="20" r="4" fill="#ef4444" stroke="#ffffff" stroke-width="1"/><line x1="20" y1="3" x2="20" y2="37" stroke="#4ade80" stroke-width="1.5" stroke-dasharray="3 2"/><line x1="3" y1="20" x2="37" y2="20" stroke="#4ade80" stroke-width="1.5" stroke-dasharray="3 2"/><ellipse cx="14" cy="13" rx="4" ry="2" fill="#ffffff" opacity="0.5"/></svg>`
  },
  word: {
    title: 'Mots Connectés',
    infoKey: 'gameStage',
    suffix: '/50',
    defaultVal: state => state.wordWheelLevel || 1,
    svg: `<svg width="42" height="42" viewBox="0 0 40 40" fill="none"><defs><radialGradient id="word3DGrad" cx="35%" cy="35%" r="65%"><stop offset="0%" stop-color="#facc15"/><stop offset="60%" stop-color="#f59e0b"/><stop offset="100%" stop-color="#78350f"/></radialGradient></defs><circle cx="20" cy="20" r="18" fill="url(#word3DGrad)" stroke="#fef08a" stroke-width="1.5"/><circle cx="20" cy="20" r="9" fill="#0f172a"/><text x="20" y="24" font-size="11" font-weight="900" fill="#38bdf8" text-anchor="middle">ABC</text></svg>`
  }
};

class SafeState {
  static get() {
    try {
      const data = localStorage.getItem('BERTHOPLAY_V1') || localStorage.getItem('BERTHO_TEST_STATE');
      const parsed = data ? JSON.parse(data) : {};
      const state = { ...this.defaultState(), ...parsed };

      state.carLevel = Math.max(1, parseInt(state.carLevel, 10) || 1);
      state.bikeLevel = Math.max(1, parseInt(state.bikeLevel, 10) || 1);
      state.bubbleLevel = Math.max(1, parseInt(state.bubbleLevel, 10) || 1);
      state.wordWheelLevel = Math.max(1, parseInt(state.wordWheelLevel, 10) || 1);

      if (!state.userId) {
        state.userId = 'usr_' + Math.random().toString(36).substr(2, 9);
        this.save(state);
      }
      return state;
    } catch (e) {
      return this.defaultState();
    }
  }
  
  static save(updated) {
    try {
      const current = this.get();
      const next = { ...current, ...updated };
      localStorage.setItem('BERTHOPLAY_V1', JSON.stringify(next));
      localStorage.setItem('BERTHO_TEST_STATE', JSON.stringify(next));
    } catch (e) {}
  }
  
  static defaultState() {
    return {
      userId: 'usr_' + Math.random().toString(36).substr(2, 9),
      currentUser: null,
      carLevel: 1,
      bikeLevel: 1,
      bubbleLevel: 1,
      bubbleStars: {},
      wordWheelLevel: 1,
      wordWheelStars: {},
      coins: 500,
      billiardsWins: 0,
      checkersWins: 0,
      chessWins: 0,
      hordeScore: 0,
      rules: 'french'
    };
  }
}

class BerthoPlay {
  constructor() {
    this.hub = document.getElementById('hub-menu');
    this.canvas = document.getElementById('canvas-webgl');
    this.backBtn = document.getElementById('btn-back-hub');
    this.currentGame = null;
    this.currentTab = 'home';
    this.chatPollTimer = null;
    
    this.logAnalytics('page_view', 'hub');

    window.addEventListener('appinstalled', () => {
      this.logAnalytics('pwa_install');
      if (typeof BerthoUI !== 'undefined') {
        BerthoUI.toast("PWA INSTALLÉE", "Merci d'avoir installé BerthoPlay ! 🎮");
      }
    });

    this.bindBottomNavbar();
    this.initAuthModule();
    this.renderWebPWABanner();
    this.bindPWAModalEvents();
    this.initAppSequence();

    window.addEventListener('languageChanged', () => {
      this.bindBottomNavbar();
      this.showTab(this.currentTab);
    });

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      window.deferredPWA_Prompt = e;
      this.renderWebPWABanner();
    });

    if (this.backBtn) {
      this.backBtn.style.display = 'none';
      this.backBtn.addEventListener('click', () => this.showHub());
    }
  }

  async initAppSequence() {
    const hasDeepLink = await this.handleIncomingDeepLink();
    if (!hasDeepLink) {
      this.showTab('home');
    }
  }

  async handleIncomingDeepLink() {
    const urlParams = new URLSearchParams(window.location.search);
    const view = urlParams.get('view');
    const id = urlParams.get('id');

    if (!view) return false;
    window.history.replaceState({}, document.title, window.location.pathname);

    try {
      if (view === 'game' && id) {
        this.showTab('home');
        this.startSelectedGame(id);
        return true;
      } else if (view === 'feed') {
        this.showTab('feed');
        return true;
      }
    } catch (e) {}

    return false;
  }

  bindPWAModalEvents() {
    document.getElementById('btn-close-pwa-modal')?.addEventListener('click', () => this.closePWAModal());
    document.getElementById('btn-confirm-pwa')?.addEventListener('click', () => this.closePWAModal());
    document.getElementById('pwa-modal-overlay')?.addEventListener('click', (e) => {
      if (e.target.id === 'pwa-modal-overlay') this.closePWAModal();
    });
  }

  triggerPWAInstall() {
    if (window.deferredPWA_Prompt) {
      window.deferredPWA_Prompt.prompt();
    } else {
      const modal = document.getElementById('pwa-modal-overlay');
      if (modal) modal.classList.add('active');
    }
  }

  closePWAModal() {
    const modal = document.getElementById('pwa-modal-overlay');
    if (modal) modal.classList.remove('active');
  }

  // --- GESTION DE LA BANNIÈRE BLEUE D'INSTALLATION PWA ---
  renderWebPWABanner() {
    const isPWA = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    let banner = document.getElementById('web-pwa-banner');

    if (!isPWA) {
      if (!banner) {
        banner = document.createElement('div');
        banner.id = 'web-pwa-banner';
        banner.style.cssText = 'position:fixed; top:0; left:0; width:100vw; background:linear-gradient(135deg, #0284c7, #0369a1); color:#fff; z-index:9990; padding:8px 15px; display:flex; justify-content:space-between; align-items:center; box-sizing:border-box; font-size:0.75rem; font-weight:bold; border-bottom:1px solid #38bdf8;';
        document.body.appendChild(banner);
      }

      banner.innerHTML = `
        <span>${i18n.t('pwaBannerText') || "Installez l'application BerthoPlay pour une expérience 100% plein écran"}</span>
        <button id="btn-banner-pwa" style="background:#fff; color:#0f172a; border:none; padding:5px 12px; border-radius:12px; font-weight:900; cursor:pointer; font-size:0.7rem; text-transform:uppercase;">${i18n.t('btnInstallPWA') || 'INSTALLER'}</button>
      `;

      document.getElementById('btn-banner-pwa')?.addEventListener('click', () => {
        this.triggerPWAInstall();
      });
    } else if (banner) {
      banner.style.display = 'none';
    }
  }

  // 🔒 MASQUE LA BANNIÈRE DÈS QU'UN JEU SE LANCE
  hidePWABanner() {
    const banner = document.getElementById('web-pwa-banner');
    if (banner) banner.style.display = 'none';
  }

  // 🔓 RÉAFFICHE LA BANNIÈRE QUAND ON REVIENT AU MENU PRINCIPAL
  showPWABanner() {
    const isPWA = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    const banner = document.getElementById('web-pwa-banner');
    if (banner && !isPWA) {
      banner.style.display = 'flex';
    }
  }

  hideBottomNav() {
    const nav = document.getElementById('bottom-nav-bar');
    if (nav) nav.style.display = 'none';
  }

  showBottomNav() {
    const nav = document.getElementById('bottom-nav-bar');
    if (nav) nav.style.display = 'flex';
  }

  bindBottomNavbar() {
    const nav = document.getElementById('bottom-nav-bar');
    if (!nav) return;

    nav.querySelector('[data-tab="home"] span').innerText = i18n.t('navHome') || 'Accueil';
    nav.querySelector('[data-tab="feed"] span').innerText = i18n.t('navActus') || 'Actus';
    nav.querySelector('[data-tab="stats"] span').innerText = i18n.t('navTop') || 'Top';
    nav.querySelector('[data-tab="account"] span').innerText = i18n.t('navAccount') || 'Compte';
    nav.querySelector('[data-tab="settings"] span').innerText = i18n.t('navSettings') || 'Réglages';

    nav.querySelectorAll('.nav-item').forEach(item => {
      item.onclick = () => {
        const tab = item.getAttribute('data-tab');
        this.showTab(tab);
      };
    });
  }

  updateCoinsDisplay(coins) {
    const badge = document.getElementById('hub-coins-badge');
    if (badge) {
      badge.innerText = `${coins || 0} ${i18n.t('coins') || 'COINS'}`;
    }
  }

  renderGlobalTopHeader() {
    const state = SafeState.get();
    let topBarHub = document.getElementById('hub-top-bar');
    
    if (!topBarHub && this.hub) {
      topBarHub = document.createElement('div');
      topBarHub.id = 'hub-top-bar';
      topBarHub.style.cssText = 'width: 100%; max-width: 600px; display: flex; justify-content: space-between; align-items: center; padding: max(10px, env(safe-area-inset-top)) 15px 5px; box-sizing: border-box; z-index: 100;';
      this.hub.insertBefore(topBarHub, this.hub.firstChild);
    }

    if (topBarHub) {
      const initialCoins = state.currentUser?.coins ?? state.coins ?? 0;

      topBarHub.innerHTML = `
        <button id="btn-user-account" style="background: rgba(15,23,42,0.9); border: 1px solid #38bdf8; color: #38bdf8; padding: 6px 14px; border-radius: 20px; font-weight: 900; font-size: 0.85rem; cursor: pointer; backdrop-filter: blur(8px);"></button>
        <div id="hub-coins-badge" style="background: rgba(15,23,42,0.9); border: 1px solid #fbbf24; color: #fbbf24; padding: 6px 14px; border-radius: 20px; font-weight: 900; font-size: 0.85rem; backdrop-filter: blur(8px);">${initialCoins} ${i18n.t('coins') || 'COINS'}</div>
      `;

      const btnUser = document.getElementById('btn-user-account');
      if (btnUser) {
        btnUser.textContent = state.currentUser ? state.currentUser.username : (i18n.t('btnConnexion') || "Connexion");
        btnUser.addEventListener('click', () => {
          if (this.auth) this.auth.openAuthModal();
        });
      }
    }
  }

  async showTab(tabName) {
    this.showBottomNav();
    this.showPWABanner();
    this.renderGlobalTopHeader();
    this.currentTab = tabName;
    const nav = document.getElementById('bottom-nav-bar');
    if (nav) {
      nav.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.getAttribute('data-tab') === tabName);
      });
    }

    const viewContainer = document.getElementById('main-tab-container');
    if (!viewContainer) return;

    try {
      if (tabName === 'home') {
        this.renderCardsView(viewContainer);
      } else if (tabName === 'account') {
        const module = await import('./views/account.js');
        new module.AccountView(viewContainer, () => this.renderCards());
      } else if (tabName === 'settings') {
        const module = await import('./views/settings.js');
        new module.SettingsView(viewContainer);
      } else if (tabName === 'feed') {
        const module = await import('./views/feed.js');
        new module.FeedView(viewContainer);
      } else if (tabName === 'stats') {
        const module = await import('./views/stats.js');
        new module.StatsView(viewContainer);
      }
    } catch (err) {
      console.error("Erreur de chargement de l'onglet :", err);
      viewContainer.innerHTML = `<p style="text-align:center; color:#ef4444; padding:20px; font-weight:bold;">Erreur de chargement. Veuillez rafraîchir.</p>`;
    }
  }

  async initAuthModule() {
    try {
      const module = await import('./auth.js');
      this.auth = new module.BerthoAuth(() => this.renderCards());
    } catch(e) {}
  }

  async openCommentsForGame(gameId, gameTitle) {
    try {
      const module = await import('./comments.js');
      new module.BerthoComments(gameId, gameTitle);
    } catch(e) {}
  }

  bindEcosystemButton() {
    const btn = document.getElementById('btn-open-eco');
    if (!btn) return;
    btn.innerText = i18n.t('btnEco') || 'Infrastructures Bertho';

    btn.onclick = async () => {
      try {
        const module = await import('./ecosystem.js');
        const eco = new module.BerthoEcosystem(() => this.showHub());
        eco.open();
      } catch (err) {}
    };
  }

  async logAnalytics(eventType, gameId = 'hub') {
    if (IS_SANDBOX) return;
    try {
      const state = SafeState.get();
      await fetch(`${API_URL}/api/analytics/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: state.userId,
          eventType: eventType,
          gameId: gameId
        })
      });
    } catch (e) {}
  }

  async submitScoreToAPI(gameId, score, stars = 1, level = 1, coinsEarned = 0) {
    if (IS_SANDBOX) return;
    try {
      const state = SafeState.get();
      await fetch(`${API_URL}/api/scores/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: state.userId,
          gameId: gameId,
          score: score,
          stars: stars,
          level: level,
          coinsEarned: coinsEarned
        })
      });
    } catch (e) {}
  }

  cleanAllOverlays() {
    const idsToRemove = [
      'comments-widget-overlay',
      'account-modal-overlay',
      'level-selector-modal',
      'bike-selector-modal',
      'bubble-selector-modal',
      'eco-selector-modal',
      'billiards-modal',
      'car-ui',
      'bike-ui',
      'horde-ui',
      'chess-ui-container',
      'checkers-ui-container',
      'billiards-ui',
      'bubble-ui',
      'modal-bub',
      'bubble-canvas',
      'chess-modal',
      'checkers-modal',
      'legale-modal-overlay',
      'bertho-custom-ui-overlay',
      'pwa-modal-overlay',
      'chat-list-modal-overlay',
      'chat-widget-overlay'
    ];

    idsToRemove.forEach(id => {
      const el = document.getElementById(id);
      if (el && el.parentNode) {
        el.parentNode.removeChild(el);
      }
    });
  }

  async renderCardsView(container) {
    const state = SafeState.get();
    this.renderGlobalTopHeader();
    this.bindEcosystemButton();

    const CORE_GAMES = ['billiards', 'bubble', 'car', 'bike', 'checkers', 'chess', 'horde', 'word'];
    let activeGamesList = [...CORE_GAMES];

    const gamesCardsHTML = activeGamesList.map(gameId => {
      const meta = HIGH_END_GAME_ICONS[gameId] || {
        title: gameId.charAt(0).toUpperCase() + gameId.slice(1),
        infoKey: 'gameProgression',
        defaultVal: () => 1,
        svg: `<svg width="42" height="42" viewBox="0 0 40 40" fill="none"><circle cx="20" cy="20" r="16" stroke="#38bdf8" stroke-width="2.5"/><polygon points="16,12 28,20 16,28" fill="#38bdf8"/></svg>`
      };

      const val = meta.defaultVal(state);
      
      let labelText = i18n.t(meta.infoKey) || 'Progression';
      labelText = labelText.replace(/:\s*$/, '').trim();
      const infoText = `${labelText} : ${val}${meta.suffix || ''}`;

      const rawPlay = i18n.t('btnPlay');
      const playBtnText = (rawPlay && !rawPlay.startsWith('BTN') && !rawPlay.startsWith('btn')) ? rawPlay : 'JOUER';
      
      const rawRev = i18n.t('btnReviews');
      const reviewBtnText = (rawRev && !rawRev.startsWith('btn')) ? rawRev : 'Avis & Notes';

      return `
        <div class="card" data-game="${gameId}">
          <div class="card-icon" style="display:flex; justify-content:center; align-items:center; margin-bottom:6px;">
            ${meta.svg}
          </div>
          <h3>${meta.title}</h3>
          
          <div style="margin:2px 0 6px; color:#f59e0b; font-size:0.75rem; letter-spacing:1px; display:flex; justify-content:center; gap:2px;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="#f59e0b"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="#f59e0b"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="#f59e0b"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="#f59e0b"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="#f59e0b"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          </div>

          <p>${infoText}</p>

          <div style="display:flex; gap:6px; margin-top:10px; width:100%; box-sizing:border-box;">
            <button class="btn-play-action" data-id="${gameId}" style="flex:1; background:linear-gradient(135deg, #0284c7, #0369a1); border:none; color:#fff; padding:8px 6px; border-radius:12px; font-size:0.75rem; font-weight:900; cursor:pointer; text-transform:uppercase;">
              ${playBtnText}
            </button>
            <button class="btn-cmt-card" data-id="${gameId}" data-title="${meta.title}" style="flex:1; background:rgba(56,189,248,0.12); border:1px solid #38bdf8; color:#38bdf8; padding:8px 6px; border-radius:12px; font-size:0.72rem; font-weight:bold; cursor:pointer;">
              ${reviewBtnText}
            </button>
          </div>
        </div>
      `;
    }).join('');
    
    container.innerHTML = `<div class="hub-grid" id="hub-grid">${gamesCardsHTML}</div>`;
    
    container.querySelectorAll('.card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-cmt-card')) return;
        const id = card.getAttribute('data-game');
        if (id) this.startSelectedGame(id);
      });
    });

    container.querySelectorAll('.btn-cmt-card').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const gId = btn.getAttribute('data-id');
        const gTitle = btn.getAttribute('data-title');
        this.openCommentsForGame(gId, gTitle);
      });
    });
  }

  renderCards() {
    let viewContainer = document.getElementById('main-tab-container');
    if (viewContainer) {
      this.renderCardsView(viewContainer);
    }
  }

  // --- LANCEMENT CENTRALISÉ DES JEUX AVEC DÉSACTIVATION DE LA BANNIÈRE ---
  async startSelectedGame(id) {
    this.logAnalytics('game_start', id);
    this.hidePWABanner(); // 🛑 Masque la bannière bleue pour TOUS les jeux

    if (id === 'billiards') {
      this.launchBilliardsGame();
    } else if (id === 'bubble') {
      this.showBubbleLevelSelector();
    } else if (id === 'car') {
      this.showCarLevelSelector();
    } else if (id === 'bike') {
      this.showBikeStepSelector();
    } else if (id === 'checkers') {
      this.launchCheckersGame();
    } else if (id === 'chess') {
      this.launchChessGame();
    } else if (id === 'horde') {
      this.launchHordeGame();
    } else if (id === 'word') {
      this.launchWordGame();
    }
  }

  async launchWordGame() {
    this.cleanAllOverlays();
    this.hideBottomNav();
    this.hidePWABanner();
    if (this.currentGame && typeof this.currentGame.destroy === 'function') this.currentGame.destroy();
    if (this.hub) this.hub.style.display = 'none';

    try {
      const state = SafeState.get();
      const currentLvl = state.wordWheelLevel || 1;
      const module = await import('./games/word.js');
      const GameClass = module.BerthoWords || module.WordWheelGame || module.default;

      this.currentGame = new GameClass(
        document.body,
        currentLvl,
        (completedLvl, coinsEarned) => {
          const nextLvl = Math.min(50, completedLvl + 1);
          const currentCoins = SafeState.get().coins || 0;
          
          SafeState.save({
            coins: currentCoins + coinsEarned,
            wordWheelLevel: nextLvl
          });

          this.submitScoreToAPI('word', coinsEarned * 10, 3, completedLvl, coinsEarned);
        },
        () => {},
        () => this.showHub()
      );
    } catch (err) {
      alert("Erreur word.js: " + err.message);
      this.showHub();
    }
  }

  showBubbleLevelSelector() {
    this.cleanAllOverlays();
    this.hideBottomNav();
    this.hidePWABanner();
    const state = SafeState.get();
    const maxUnlocked = Math.max(1, parseInt(state.bubbleLevel, 10) || 1);
    const starsMap = state.bubbleStars || {};

    let totalStars = 0;
    Object.values(starsMap).forEach(s => totalStars += (s || 0));

    const selector = document.createElement('div');
    selector.id = 'bubble-selector-modal';
    
    let gridHTML = '';
    for (let i = 1; i <= 50; i++) {
      const isUnlocked = i <= maxUnlocked;
      const starsEarned = starsMap[i] || 0;
      const starDisplay = isUnlocked ? (starsEarned > 0 ? '⭐'.repeat(starsEarned) : '⭐') : '🔒';

      gridHTML += `
        <div class="bub-card-step ${isUnlocked ? 'unlocked' : 'locked'}" data-lvl="${i}">
          <span>${i}</span>
          <small>${starDisplay}</small>
        </div>
      `;
    }

    selector.innerHTML = `
      <style>
        .bub-sel-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100dvh; background: rgba(3, 3, 12, 0.96); z-index: 2000; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; backdrop-filter: blur(20px); padding: max(16px, env(safe-area-inset-top)) 15px max(20px, env(safe-area-inset-bottom)); box-sizing: border-box; overflow-y: auto; color: #fff; }
        .bub-sel-top { display: flex; justify-content: space-between; align-items: center; width: 100%; max-width: 520px; margin-bottom: 12px; }
        .bub-sel-title { font-size: 1.3rem; font-weight: 900; color: #06b6d4; text-transform: uppercase; }
        .btn-hub-back { background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.3); color: #fff; padding: 6px 12px; border-radius: 10px; font-weight: bold; cursor: pointer; }
        .bub-stars-progress { color: #f59e0b; font-weight: 900; font-size: 0.9rem; margin-bottom: 15px; }
        .bub-sel-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; width: 100%; max-width: 520px; }
        .bub-card-step { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.15); border-radius: 14px; padding: 10px 0; text-align: center; cursor: pointer; display: flex; flex-direction: column; align-items: center; justify-content: center; }
        .bub-card-step.unlocked { border-color: #06b6d4; background: rgba(6, 182, 212, 0.15); }
        .bub-card-step.locked { opacity: 0.3; cursor: not-allowed; border-color: #334155; }
        .bub-card-step span { font-size: 1rem; font-weight: 900; color: #fff; }
        .bub-card-step small { font-size: 0.7rem; margin-top: 2px; color: #f59e0b; }
      </style>
      <div class="bub-sel-overlay">
        <div class="bub-sel-top">
          <button class="btn-hub-back" id="btn-hub-from-bub">← BerthoPlay</button>
          <h2 class="bub-sel-title">50 ÉTAPES BUBBLE</h2>
        </div>
        <div class="bub-stars-progress">⭐ ${totalStars} / 150 ÉTOILES</div>
        <div class="bub-sel-grid">${gridHTML}</div>
      </div>
    `;

    document.body.appendChild(selector);

    const handleSelectLvl = (card) => {
      const lvl = parseInt(card.getAttribute('data-lvl'), 10);
      this.cleanAllOverlays();
      this.launchBubbleGame(lvl);
    };

    selector.querySelectorAll('.bub-card-step.unlocked').forEach(card => {
      card.addEventListener('click', () => handleSelectLvl(card));
    });

    document.getElementById('btn-hub-from-bub')?.addEventListener('click', () => {
      this.cleanAllOverlays();
      this.showHub();
    });
  }

  async launchBubbleGame(lvlToPlay) {
    this.cleanAllOverlays();
    this.hideBottomNav();
    this.hidePWABanner();
    if (this.currentGame && typeof this.currentGame.destroy === 'function') this.currentGame.destroy();
    if (this.hub) this.hub.style.display = 'none';

    try {
      const module = await import('./games/bubble.js');
      this.currentGame = new module.BubbleShooterGame(
        this.canvas,
        lvlToPlay,
        (completedLvl, coinsEarned, starsEarned) => {
          const state = SafeState.get();
          const currentCoins = state.coins || 0;
          const currentLvl = state.bubbleLevel || 1;
          const starsMap = state.bubbleStars || {};

          starsMap[completedLvl] = Math.max(starsMap[completedLvl] || 0, starsEarned);

          SafeState.save({
            coins: currentCoins + coinsEarned,
            bubbleLevel: Math.max(currentLvl, Math.min(50, completedLvl + 1)),
            bubbleStars: starsMap
          });

          this.submitScoreToAPI('bubble', coinsEarned * 10, starsEarned, completedLvl, coinsEarned);
        },
        () => {},
        () => this.showBubbleLevelSelector()
      );
    } catch (err) {
      alert("Erreur bubble.js: " + err.message);
      this.showHub();
    }
  }

  async launchBilliardsGame() {
    this.cleanAllOverlays();
    this.hideBottomNav();
    this.hidePWABanner();
    if (this.currentGame && typeof this.currentGame.destroy === 'function') this.currentGame.destroy();
    if (this.hub) this.hub.style.display = 'none';
    if (this.canvas) this.canvas.style.display = 'block';

    try {
      const module = await import('./games/billiards.js');
      this.currentGame = new module.BilliardsGame(this.canvas, () => {
        const currentWins = SafeState.get().billiardsWins || 0;
        const currentCoins = SafeState.get().coins || 0;
        SafeState.save({ billiardsWins: currentWins + 1, coins: currentCoins + 150 });
        this.submitScoreToAPI('billiards', 150, 3, 1, 150);
        this.showHub();
      });
    } catch (err) {
      alert("Erreur billiards.js: " + err.message);
      this.showHub();
    }
  }

  showCarLevelSelector() {
    this.cleanAllOverlays();
    this.hideBottomNav();
    this.hidePWABanner();
    const state = SafeState.get();
    const maxUnlocked = Math.max(1, parseInt(state.carLevel, 10) || 1);

    const carLevelsList = [
      { lvl: 1, title: 'NIVEAU 1', desc: 'Permis GT (2 min)' },
      { lvl: 2, title: 'NIVEAU 2', desc: 'Checkpoints (2m30)' },
      { lvl: 3, title: 'NIVEAU 3', desc: 'Slalom Trafic (3 min)' },
      { lvl: 4, title: 'NIVEAU 4', desc: 'Speed Nitro (2m30)' },
      { lvl: 5, title: 'NIVEAU 5', desc: 'Duel Rivaux (3m30)' },
      { lvl: 6, title: 'NIVEAU 6', desc: 'Désert Highway (3 min)' },
      { lvl: 7, title: 'NIVEAU 7', desc: 'Nuit Extrême (4 min)' },
      { lvl: 8, title: 'NIVEAU 8', desc: 'Chrono Sprint (3m30)' },
      { lvl: 9, title: 'NIVEAU 9', desc: 'Boss Hypercar (4m30)' },
      { lvl: 10, title: 'NIVEAU 10 🔥', desc: 'Grand Prix (5 min)' }
    ];
    
    const selector = document.createElement('div');
    selector.id = 'level-selector-modal';
    selector.innerHTML = `
      <style>
        .sel-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100dvh; background: rgba(3,3,10,0.95); z-index: 2000; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; backdrop-filter: blur(15px); padding: max(16px, env(safe-area-inset-top)) 15px max(20px, env(safe-area-inset-bottom)); box-sizing: border-box; overflow-y: auto; color: #fff; }
        .sel-top-bar { display: flex; justify-content: space-between; align-items: center; width: 100%; max-width: 550px; margin-bottom: 15px; }
        .sel-title { font-size: 1.5rem; font-weight: 900; color: #00ffff; text-transform: uppercase; }
        .btn-hub-back { background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.3); color: #fff; padding: 6px 12px; border-radius: 10px; font-weight: bold; cursor: pointer; }
        .sel-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 10px; width: 100%; max-width: 550px; }
        .sel-card { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.15); border-radius: 12px; padding: 12px 8px; text-align: center; cursor: pointer; }
        .sel-card.unlocked { border-color: #00ffff; background: rgba(0,255,255,0.12); }
        .sel-card.locked { opacity: 0.35; cursor: not-allowed; border-color: #334155; }
        .sel-card h4 { font-size: 0.9rem; color: #fff; margin-bottom: 4px; font-weight: 800; }
        .sel-card p { font-size: 0.7rem; color: #94a3b8; font-weight: 600; }
        .sel-close { margin-top: 20px; padding: 12px 30px; background: rgba(255,0,85,0.2); border: 1px solid #ff0055; color: #fff; border-radius: 20px; font-size: 0.85rem; font-weight: 800; cursor: pointer; }
      </style>
      <div class="sel-overlay">
        <div class="sel-top-bar">
          <button class="btn-hub-back" id="btn-hub-from-car">← BerthoPlay</button>
          <h2 class="sel-title">NIVEAUX VOITURE</h2>
        </div>
        <div class="sel-grid">
          ${carLevelsList.map(item => `
            <div class="sel-card ${maxUnlocked >= item.lvl ? 'unlocked' : 'locked'}" data-lvl="${item.lvl}">
              <h4>${item.title}</h4>
              <p>${item.desc}</p>
            </div>
          `).join('')}
        </div>
        <button class="sel-close" id="btn-close-sel">ANNULER</button>
      </div>
    `;
    
    document.body.appendChild(selector);
    
    const handleSelectCarLvl = (card) => {
      const lvl = parseInt(card.getAttribute('data-lvl'), 10);
      this.cleanAllOverlays();
      this.launchCarGame(lvl);
    };

    selector.querySelectorAll('.sel-card.unlocked').forEach(card => {
      card.addEventListener('click', () => handleSelectCarLvl(card));
    });
    
    const closeAll = () => {
      this.cleanAllOverlays();
      this.showHub();
    };

    document.getElementById('btn-close-sel')?.addEventListener('click', closeAll);
    document.getElementById('btn-hub-from-car')?.addEventListener('click', closeAll);
  }

  showBikeStepSelector() {
    this.cleanAllOverlays();
    this.hideBottomNav();
    this.hidePWABanner();
    const state = SafeState.get();
    const maxUnlocked = Math.max(1, parseInt(state.bikeLevel, 10) || 1);

    const bikeStepsList = [
      { step: 1, title: 'ÉTAPE 1', desc: 'Initiation (2 min)' },
      { step: 2, title: 'ÉTAPE 2', desc: 'Checkpoints (2m30)' },
      { step: 3, title: 'ÉTAPE 3', desc: 'Rues de Ville (3 min)' },
      { step: 4, title: 'ÉTAPE 4', desc: 'Speed Tunnel (2m30)' },
      { step: 5, title: 'ÉTAPE 5', desc: 'Moto GP Duel (3m30)' },
      { step: 6, title: 'ÉTAPE 6', desc: 'Col Montagne (3 min)' },
      { step: 7, title: 'ÉTAPE 7', desc: 'Nuit Urbaine (4 min)' },
      { step: 8, title: 'ÉTAPE 8', desc: 'Chrono Sprint (3m30)' },
      { step: 9, title: 'ÉTAPE 9', desc: 'Boss Rider (4m30)' },
      { step: 10, title: 'ÉTAPE 10 🔥', desc: 'Grand Prix (5 min)' }
    ];
    
    const selector = document.createElement('div');
    selector.id = 'bike-selector-modal';
    selector.innerHTML = `
      <style>
        .sel-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100dvh; background: rgba(3,3,10,0.95); z-index: 2000; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; backdrop-filter: blur(15px); padding: max(16px, env(safe-area-inset-top)) 15px max(20px, env(safe-area-inset-bottom)); box-sizing: border-box; overflow-y: auto; color: #fff; }
        .sel-top-bar { display: flex; justify-content: space-between; align-items: center; width: 100%; max-width: 550px; margin-bottom: 15px; }
        .sel-title { font-size: 1.5rem; font-weight: 900; color: #00ffff; text-transform: uppercase; }
        .btn-hub-back { background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.3); color: #fff; padding: 6px 12px; border-radius: 10px; font-weight: bold; cursor: pointer; }
        .sel-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 10px; width: 100%; max-width: 550px; }
        .sel-card { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.15); border-radius: 12px; padding: 12px 8px; text-align: center; cursor: pointer; }
        .sel-card.unlocked { border-color: #00ffff; background: rgba(0,255,255,0.12); }
        .sel-card.locked { opacity: 0.35; cursor: not-allowed; border-color: #334155; }
        .sel-card h4 { font-size: 0.9rem; color: #fff; margin-bottom: 4px; font-weight: 800; }
        .sel-card p { font-size: 0.7rem; color: #94a3b8; font-weight: 600; }
        .sel-close { margin-top: 20px; padding: 12px 30px; background: rgba(255,0,85,0.2); border: 1px solid #ff0055; color: #fff; border-radius: 20px; font-size: 0.85rem; font-weight: 800; cursor: pointer; }
      </style>
      <div class="sel-overlay">
        <div class="sel-top-bar">
          <button class="btn-hub-back" id="btn-hub-from-bike">← BerthoPlay</button>
          <h2 class="sel-title">ÉTAPES MOTO GP</h2>
        </div>
        <div class="sel-grid">
          ${bikeStepsList.map(item => `
            <div class="sel-card ${maxUnlocked >= item.step ? 'unlocked' : 'locked'}" data-step="${item.step}">
              <h4>${item.title}</h4>
              <p>${item.desc}</p>
            </div>
          `).join('')}
        </div>
        <button class="sel-close" id="btn-close-bike-sel">ANNULER</button>
      </div>
    `;
    
    document.body.appendChild(selector);
    
    const handleSelectBikeStep = (card) => {
      const step = parseInt(card.getAttribute('data-step'), 10);
      this.cleanAllOverlays();
      this.launchBikeGame(step);
    };

    selector.querySelectorAll('.sel-card.unlocked').forEach(card => {
      card.addEventListener('click', () => handleSelectBikeStep(card));
    });

    const closeAll = () => {
      this.cleanAllOverlays();
      this.showHub();
    };

    document.getElementById('btn-close-bike-sel')?.addEventListener('click', closeAll);
    document.getElementById('btn-hub-from-bike')?.addEventListener('click', closeAll);
  }
  
  async launchCarGame(levelToPlay) {
    this.cleanAllOverlays();
    this.hideBottomNav();
    this.hidePWABanner();
    if (this.currentGame && typeof this.currentGame.destroy === 'function') this.currentGame.destroy();
    if (this.hub) this.hub.style.display = 'none';
    
    if (this.canvas) {
      this.canvas.style.display = 'block';
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
      this.canvas.style.touchAction = 'none';
    }
    
    try {
      const module = await import('./games/car.js');
      this.currentGame = new module.CarGame(this.canvas, levelToPlay,
        (completedLevel, coinsEarned = 100) => {
          const earned = coinsEarned || (completedLevel * 50);
          const nextLvl = completedLevel + 1;
          const currentCoins = SafeState.get().coins || 0;
          SafeState.save({ coins: currentCoins + earned });

          if (nextLvl > (SafeState.get().carLevel || 1) && nextLvl <= 10) {
            SafeState.save({ carLevel: nextLvl });
          }

          this.submitScoreToAPI('car', earned * 10, 3, completedLevel, earned);

          if (completedLevel < 10) this.launchCarGame(nextLvl);
          else this.showCarLevelSelector();
        },
        () => {},
        () => this.showCarLevelSelector()
      );
    } catch (err) {
      alert("Erreur car.js: " + err.message);
      this.showHub();
    }
  }
  
  async launchBikeGame(stepToPlay) {
    this.cleanAllOverlays();
    this.hideBottomNav();
    this.hidePWABanner();
    if (this.currentGame && typeof this.currentGame.destroy === 'function') this.currentGame.destroy();
    if (this.hub) this.hub.style.display = 'none';
    
    if (this.canvas) {
      this.canvas.style.display = 'block';
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
      this.canvas.style.touchAction = 'none';
    }
    
    try {
      const module = await import('./games/bike.js');
      this.currentGame = new module.BikeGame(this.canvas, stepToPlay,
        (completedStep, coinsEarned = 100) => {
          const earned = coinsEarned || (completedStep * 50);
          const nextStep = completedStep + 1;
          const currentCoins = SafeState.get().coins || 0;
          SafeState.save({ coins: currentCoins + earned });

          if (nextStep > (SafeState.get().bikeLevel || 1) && nextStep <= 10) {
            SafeState.save({ bikeLevel: nextStep });
          }

          this.submitScoreToAPI('bike', earned * 10, 3, completedStep, earned);

          if (completedStep < 10) this.launchBikeGame(nextStep);
          else this.showBikeStepSelector();
        },
        () => {},
        () => this.showBikeStepSelector()
      );
    } catch (err) {
      alert("Erreur bike.js: " + err.message);
      this.showHub();
    }
  }
  
  async launchCheckersGame() {
    this.cleanAllOverlays();
    this.hideBottomNav();
    this.hidePWABanner();
    if (this.currentGame && typeof this.currentGame.destroy === 'function') this.currentGame.destroy();
    if (this.hub) this.hub.style.display = 'none';
    
    try {
      const module = await import('./games/checkers.js');
      this.currentGame = new module.CheckersGame(this.canvas, () => {
        SafeState.save({ checkersWins: (SafeState.get().checkersWins || 0) + 1 });
        this.submitScoreToAPI('checkers', 100, 3, 1, 100);
        this.showHub();
      });
    } catch (err) {
      alert("Erreur checkers.js: " + err.message);
      this.showHub();
    }
  }
  
  async launchChessGame() {
    this.cleanAllOverlays();
    this.hideBottomNav();
    this.hidePWABanner();
    if (this.currentGame && typeof this.currentGame.destroy === 'function') this.currentGame.destroy();
    if (this.hub) this.hub.style.display = 'none';
    
    try {
      const module = await import('./games/chess.js');
      this.currentGame = new module.ChessGame(this.canvas, () => {
        SafeState.save({ chessWins: (SafeState.get().chessWins || 0) + 1 });
        this.submitScoreToAPI('chess', 200, 3, 1, 200);
        this.showHub();
      });
    } catch (err) {
      alert("Erreur chess.js: " + err.message);
      this.showHub();
    }
  }
  
  async launchHordeGame() {
    this.cleanAllOverlays();
    this.hideBottomNav();
    this.hidePWABanner();
    if (this.currentGame && typeof this.currentGame.destroy === 'function') this.currentGame.destroy();
    if (this.hub) this.hub.style.display = 'none';
    if (this.canvas) this.canvas.style.display = 'block';
    
    try {
      const module = await import('./games/horde.js');
      this.currentGame = new module.HordeGame(this.canvas, (finalScore, coinsEarned = 0) => {
        const currentBest = SafeState.get().hordeScore || 0;
        const currentCoins = SafeState.get().coins || 0;
        SafeState.save({ coins: currentCoins + coinsEarned });

        if (finalScore > currentBest) {
          SafeState.save({ hordeScore: finalScore });
        }
        this.submitScoreToAPI('horde', finalScore, 3, 1, coinsEarned);
        this.showHub();
      });
    } catch (err) {
      alert("Erreur horde.js: " + err.message);
      this.showHub();
    }
  }
  
  showHub() {
    this.cleanAllOverlays();

    if (this.currentGame && typeof this.currentGame.destroy === 'function') {
      this.currentGame.destroy();
      this.currentGame = null;
    }
    
    if (this.canvas) this.canvas.style.display = 'none';
    if (this.backBtn) this.backBtn.style.display = 'none';
    if (this.hub) this.hub.style.display = 'flex';
    this.showPWABanner(); // 🔓 Réaffiche la bannière bleue PWA sur le Hub
    this.showTab('home');
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new BerthoPlay());
} else {
  new BerthoPlay();
}