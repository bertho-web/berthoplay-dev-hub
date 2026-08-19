// ============================================================================
// 🎮 BERTHOPLAY — CONTRÔLEUR CENTRAL (SRC/MAIN.JS) [AUTO-HIDE BANNER PWA]
// ============================================================================

import { i18n } from './i18n.js';
import { BerthoUI } from './ui-dialogs.js';
import { Ambience } from './services/ambience.js';
import { BerthoSoundEffects } from './services/sound-effects.js';
import { icon } from './components/icons.js';

// Mode Sandbox local pour le Dev Hub
const IS_SANDBOX = true;
const API_URL = IS_SANDBOX ? '' : 'https://berthoplay.bertho.workers.dev';

<<<<<<< HEAD
// Emblèmes des jeux — palette verrouillée sur les jetons du design system
// (obsidienne, sang, vitrail, or). Aucune couleur hors palette.
const GAME_EMBLEMS = {
=======
// Registre de métadonnées visuelles 3D / Relief Métallique AAA
const HIGH_END_GAME_ICONS = {
>>>>>>> a0239789d9828d38c0371e6dd35ea034f9487eff
  billiards: {
    title: 'Billard 3D Pro',
    tagline: 'Table de pierre, huit boules',
    infoKey: 'gameVictories',
    defaultVal: state => state.billiardsWins || 0,
    svg: `<svg viewBox="0 0 40 40" width="34" height="34" fill="none" aria-hidden="true"><circle cx="20" cy="20" r="16" fill="#0A0810" stroke="#C1121F" stroke-width="2"/><circle cx="20" cy="19" r="7.5" fill="#EDE7DC"/><text x="20" y="23" font-family="Cinzel,serif" font-size="10" font-weight="900" fill="#0A0810" text-anchor="middle">8</text><path d="M11 11a13 13 0 0 1 7-4" stroke="#EDE7DC" stroke-width="1.6" stroke-linecap="round" opacity="0.45"/></svg>`
  },
  bubble: {
    title: 'Bubble Shooter',
    tagline: '50 nefs à briser',
    infoKey: 'gameStage',
    suffix: '/50',
    defaultVal: state => state.bubbleLevel || 1,
    svg: `<svg viewBox="0 0 40 40" width="34" height="34" fill="none" aria-hidden="true"><circle cx="20" cy="23" r="11" fill="#6D28D9" stroke="#A78BFA" stroke-width="1.8"/><circle cx="12" cy="12" r="6" fill="#0A0810" stroke="#C1121F" stroke-width="1.8"/><circle cx="29" cy="13" r="5" fill="#0A0810" stroke="#C9A227" stroke-width="1.8"/><ellipse cx="16" cy="19" rx="3" ry="1.6" fill="#EDE7DC" opacity="0.4"/></svg>`
  },
  car: {
    title: 'Conduite & Course',
    tagline: 'Dix circuits nocturnes',
    infoKey: 'gameProgression',
    suffix: '/10',
    defaultVal: state => state.carLevel || 1,
    svg: `<svg viewBox="0 0 40 40" width="34" height="34" fill="none" aria-hidden="true"><path d="M5 25c0-3 4-6 7-7 2-3 4-5 8-5s6 2 8 5c3 1 7 4 7 7v2h-30z" fill="#C1121F" stroke="#F2596B" stroke-width="1.4" stroke-linejoin="round"/><path d="M14 17c1.6-2.6 3-3.6 6-3.6s4.4 1 6 3.6z" fill="#0A0810" opacity="0.75"/><circle cx="13" cy="28" r="3.6" fill="#0A0810" stroke="#EDE7DC" stroke-width="1.6"/><circle cx="27" cy="28" r="3.6" fill="#0A0810" stroke="#EDE7DC" stroke-width="1.6"/></svg>`
  },
  bike: {
    title: 'Moto Superbike',
    tagline: 'Dix étapes, plein gaz',
    infoKey: 'gameStage',
    suffix: '/10',
    defaultVal: state => state.bikeLevel || 1,
    svg: `<svg viewBox="0 0 40 40" width="34" height="34" fill="none" aria-hidden="true"><circle cx="10" cy="26" r="6" fill="#0A0810" stroke="#C9A227" stroke-width="2"/><circle cx="30" cy="26" r="6" fill="#0A0810" stroke="#C9A227" stroke-width="2"/><path d="M10 26l8-5 12 5" stroke="#EDE7DC" stroke-width="1.8" stroke-linecap="round"/><path d="M12 21l5-8 10-1 4 6-5 3z" fill="#C1121F" stroke="#F2596B" stroke-width="1.2" stroke-linejoin="round"/><path d="M23 11c2-2 5-2 6 2l-5 2z" fill="#6D28D9"/></svg>`
  },
  checkers: {
    title: 'Dames Pro',
    tagline: 'Le damier de la nef',
    infoKey: 'gameVictories',
    defaultVal: state => state.checkersWins || 0,
    svg: `<svg viewBox="0 0 40 40" width="34" height="34" fill="none" aria-hidden="true"><circle cx="20" cy="22" r="15" fill="#0A0810" opacity="0.6"/><circle cx="20" cy="20" r="15" fill="#251E32" stroke="#EDE7DC" stroke-width="1.8"/><circle cx="20" cy="20" r="10" fill="none" stroke="#8A8296" stroke-width="1.4"/><path d="M13 17l3.5 5 3.5-7 3.5 7 3.5-5v6.5h-14z" fill="#C9A227"/></svg>`
  },
  chess: {
    title: 'Échecs Danger',
    tagline: 'Le roi ne recule pas',
    infoKey: 'gameVictories',
    defaultVal: state => state.chessWins || 0,
    svg: `<svg viewBox="0 0 40 40" width="34" height="34" fill="none" aria-hidden="true"><path d="M11 32h18v3H11z" fill="#C9A227"/><path d="M13 30l1.5-9h11l1.5 9z" fill="#EDE7DC"/><path d="M9 18l4 4 7-8 7 8 4-4-4 11H13z" fill="#6D28D9" stroke="#A78BFA" stroke-width="1.4" stroke-linejoin="round"/><path d="M19 5h2v6h-2z M17 7h6v2h-6z" fill="#C1121F"/></svg>`
  },
  horde: {
    title: 'Horde Survivor 3D',
    tagline: "Tenir jusqu'à l'aube",
    infoKey: 'gameBest',
    defaultVal: state => state.hordeScore || 0,
<<<<<<< HEAD
    svg: `<svg viewBox="0 0 40 40" width="34" height="34" fill="none" aria-hidden="true"><circle cx="20" cy="20" r="16" fill="#0A0810" stroke="#C1121F" stroke-width="2"/><circle cx="20" cy="20" r="9" stroke="#8A8296" stroke-width="1.4" opacity="0.7"/><circle cx="20" cy="20" r="3.4" fill="#C1121F"/><path d="M20 2v7M20 31v7M2 20h7M31 20h7" stroke="#C9A227" stroke-width="1.8" stroke-linecap="round"/></svg>`
=======
    svg: `<svg width="42" height="42" viewBox="0 0 40 40" fill="none"><defs><radialGradient id="horde3D" cx="35%" cy="35%" r="65%"><stop offset="0%" stop-color="#4ade80"/><stop offset="50%" stop-color="#16a34a"/><stop offset="100%" stop-color="#052e16"/></radialGradient></defs><circle cx="20" cy="20" r="17" fill="url(#horde3D)" stroke="#22c55e" stroke-width="1.5"/><circle cx="20" cy="20" r="10" stroke="#000000" stroke-width="1.5" opacity="0.6"/><circle cx="20" cy="20" r="4" fill="#ef4444" stroke="#ffffff" stroke-width="1"/><line x1="20" y1="3" x2="20" y2="37" stroke="#4ade80" stroke-width="1.5" stroke-dasharray="3 2"/><line x1="3" y1="20" x2="37" y2="20" stroke="#4ade80" stroke-width="1.5" stroke-dasharray="3 2"/><ellipse cx="14" cy="13" rx="4" ry="2" fill="#ffffff" opacity="0.5"/></svg>`
  },
  word: {
    title: 'Mots Connectés',
    infoKey: 'gameStage',
    suffix: '/50',
    defaultVal: state => state.wordWheelLevel || 1,
    svg: `<svg width="42" height="42" viewBox="0 0 40 40" fill="none"><defs><radialGradient id="word3DGrad" cx="35%" cy="35%" r="65%"><stop offset="0%" stop-color="#facc15"/><stop offset="60%" stop-color="#f59e0b"/><stop offset="100%" stop-color="#78350f"/></radialGradient></defs><circle cx="20" cy="20" r="18" fill="url(#word3DGrad)" stroke="#fef08a" stroke-width="1.5"/><circle cx="20" cy="20" r="9" fill="#0f172a"/><text x="20" y="24" font-size="11" font-weight="900" fill="#38bdf8" text-anchor="middle">ABC</text></svg>`
>>>>>>> a0239789d9828d38c0371e6dd35ea034f9487eff
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
      lastPlayed: null,
      rules: 'french'
    };
  }
}

class BerthoPlay {
  constructor() {
    this.hub = document.getElementById('app-shell');
    this.canvas = document.getElementById('canvas-webgl');
    this.backBtn = document.getElementById('btn-back-hub');
    this.currentGame = null;
    this.currentTab = 'home';
    this.chatPollTimer = null;

    // Retour tactile et sonore sur toute l'application, en un seul câblage.
    BerthoSoundEffects.bindGlobalFeedback();

    // Ambiance vidéo : elle décide seule si elle a le droit de tourner.
    Ambience.init();

    this.dismissSplash();
    this.logAnalytics('page_view', 'hub');

    window.addEventListener('appinstalled', () => {
      this.logAnalytics('pwa_install');
      BerthoSoundEffects.playSuccess();
      BerthoUI?.toast?.('Console installée', 'BerthoPlay est sur votre écran d\'accueil.');
      this.renderWebPWABanner();
    });

    this.bindBottomNavbar();
    this.initAuthModule();
    this.renderWebPWABanner();
    this.bindPWASheet();
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

    // Les réglages peuvent réclamer la marche à suivre d'installation.
    window.addEventListener('bertho:open-pwa-sheet', () => this.openPWASheet());

    this.backBtn?.addEventListener('click', () => this.showHub());
    document.getElementById('header-brand')?.addEventListener('click', (e) => {
      e.preventDefault();
      this.showTab('home');
    });

    // Échap ferme ce qui est ouvert : feuille, sinon retour au hub depuis un jeu.
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      if (document.getElementById('pwa-sheet')?.dataset.open === 'true') {
        this.closePWASheet();
      } else if (this.currentGame) {
        this.showHub();
      }
    });
  }

  /**
   * L'écran d'entrée s'efface tout seul, ou au premier geste. Il ne bloque
   * jamais : le contenu est déjà monté derrière lui.
   */
  dismissSplash() {
    const splash = document.getElementById('intro-splash');
    if (!splash) return;

    let done = false;
    const hide = () => {
      if (done) return;
      done = true;
      splash.dataset.hidden = 'true';
      clearTimeout(timer);
      setTimeout(() => splash.remove(), 600);
    };

    const timer = setTimeout(hide, 2400);
    splash.addEventListener('click', hide, { once: true });
  }

  // ------------------------------------------------------------------------
  // BASCULE JEU <-> COQUE
  // ------------------------------------------------------------------------

  /** Entre en mode jeu : la coque disparaît, le canvas et le retour arrivent. */
  enterGame() {
    document.body.dataset.gameActive = 'true';
    if (this.backBtn) this.backBtn.dataset.visible = 'true';
    // Le WebGL doit avoir la machine pour lui : on coupe la vidéo de fond.
    Ambience.setScene('game');
  }

  /** Revient à la coque applicative. */
  exitGame() {
    delete document.body.dataset.gameActive;
    if (this.backBtn) delete this.backBtn.dataset.visible;
    if (this.canvas) this.canvas.style.display = 'none';
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

    const TABS = ['home', 'feed', 'stats', 'account', 'settings'];

    try {
      if (view === 'game' && id) {
        this.showTab('home');
        this.startSelectedGame(id);
        return true;
      }
      // Chaque onglet est adressable : un lien partagé doit ouvrir le bon écran.
      if (TABS.includes(view)) {
        this.showTab(view);
        return true;
      }
    } catch (e) {}

    return false;
  }

  // ------------------------------------------------------------------------
  // INSTALLATION PWA
  // ------------------------------------------------------------------------

  bindPWASheet() {
    document.getElementById('btn-close-pwa-sheet')?.addEventListener('click', () => this.closePWASheet());
    document.getElementById('btn-confirm-pwa')?.addEventListener('click', () => this.closePWASheet());
    document.getElementById('pwa-scrim')?.addEventListener('click', () => this.closePWASheet());
  }

  /**
   * Android et desktop exposent une vraie invite d'installation. iOS non :
   * il faut expliquer le geste, et l'explication diffère selon le navigateur.
   */
  triggerPWAInstall() {
    if (window.deferredPWA_Prompt) {
      window.deferredPWA_Prompt.prompt();
<<<<<<< HEAD
      window.deferredPWA_Prompt.userChoice?.finally(() => {
        window.deferredPWA_Prompt = null;
        this.renderWebPWABanner();
=======
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
>>>>>>> a0239789d9828d38c0371e6dd35ea034f9487eff
      });
      return;
    }
    this.openPWASheet();
  }

  openPWASheet() {
    const sheet = document.getElementById('pwa-sheet');
    const scrim = document.getElementById('pwa-scrim');
    const list = document.getElementById('pwa-steps');
    if (!sheet || !list) return;

    list.innerHTML = this.pwaSteps().map((step, i) => `
      <li class="panel" style="display:flex; align-items:center; gap:var(--sp-3); padding:var(--sp-3);">
        <span class="count" style="background:var(--violet); color:var(--on-violet);">${i + 1}</span>
        <span style="font-size:var(--text-sm); line-height:var(--leading-snug);">${step}</span>
      </li>
    `).join('');

    scrim?.setAttribute('data-open', 'true');
    sheet.dataset.open = 'true';
    sheet.setAttribute('aria-hidden', 'false');
    document.getElementById('btn-confirm-pwa')?.focus();
  }

  closePWASheet() {
    const sheet = document.getElementById('pwa-sheet');
    document.getElementById('pwa-scrim')?.removeAttribute('data-open');
    if (sheet) {
      delete sheet.dataset.open;
      sheet.setAttribute('aria-hidden', 'true');
    }
  }

<<<<<<< HEAD
  /** Marche à suivre, adaptée à la plateforme réellement détectée. */
  pwaSteps() {
    const ua = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isFirefox = /Firefox/.test(ua);

    if (isIOS) {
      return [
        'Ouvrez le menu <strong>Partager</strong> en bas de Safari.',
        'Faites défiler jusqu\'à <strong>« Sur l\'écran d\'accueil »</strong>.',
        'Appuyez sur <strong>Ajouter</strong> en haut à droite.'
      ];
    }
    if (isFirefox) {
      return [
        'Ouvrez le menu <strong>⋮</strong> de Firefox.',
        'Choisissez <strong>Installer</strong> ou <strong>Ajouter à l\'écran d\'accueil</strong>.',
        'Confirmez pour épingler BerthoPlay.'
      ];
    }
    return [
      'Ouvrez le menu <strong>⋮</strong> de votre navigateur.',
      'Choisissez <strong>Installer l\'application</strong>.',
      'Confirmez : BerthoPlay s\'ouvrira en plein écran.'
    ];
=======
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
>>>>>>> a0239789d9828d38c0371e6dd35ea034f9487eff
  }

  isStandalone() {
    return window.matchMedia('(display-mode: standalone)').matches
        || window.matchMedia('(display-mode: minimal-ui)').matches
        || window.navigator.standalone === true;
  }

  /**
   * Invitation à installer : discrète, refusable, et qui ne revient pas
   * pendant une semaine une fois écartée.
   */
  renderWebPWABanner() {
    const existing = document.getElementById('web-pwa-banner');

<<<<<<< HEAD
    let dismissedAt = 0;
    try { dismissedAt = parseInt(localStorage.getItem('BERTHOPLAY_PWA_DISMISSED') || '0', 10); } catch (e) {}
    const recentlyDismissed = Date.now() - dismissedAt < 7 * 24 * 60 * 60 * 1000;
=======
    nav.querySelector('[data-tab="home"] span').innerText = i18n.t('navHome') || 'Accueil';
    nav.querySelector('[data-tab="feed"] span').innerText = i18n.t('navActus') || 'Actus';
    nav.querySelector('[data-tab="stats"] span').innerText = i18n.t('navTop') || 'Top';
    nav.querySelector('[data-tab="account"] span').innerText = i18n.t('navAccount') || 'Compte';
    nav.querySelector('[data-tab="settings"] span').innerText = i18n.t('navSettings') || 'Réglages';
>>>>>>> a0239789d9828d38c0371e6dd35ea034f9487eff

    if (this.isStandalone() || recentlyDismissed) {
      existing?.remove();
      return;
    }
    if (existing) return;

    const banner = document.createElement('div');
    banner.id = 'web-pwa-banner';
    banner.className = 'panel';
    // Le texte traduit peut être long : il occupe sa propre ligne, les actions
    // la suivante. Une seule rangée finirait en colonne d'un mot par ligne.
    banner.innerHTML = `
      <div class="row" style="gap:var(--sp-3);">
        <img src="/pwa-192x192.png" alt="" width="34" height="34"
             style="border-radius:var(--r-sm); flex:0 0 auto;" />
        <p class="grow" style="font-size:var(--text-sm); line-height:var(--leading-snug);">
          ${i18n.t('pwaBannerText')}
        </p>
        <button class="btn btn--icon btn--ghost" id="btn-banner-pwa-close" type="button"
                data-sfx="close" aria-label="Masquer la proposition d'installation">
          ${icon('x', 'icon icon--sm')}
        </button>
      </div>
      <button class="btn btn--primary btn--cut btn--sm btn--block" id="btn-banner-pwa" type="button">
        ${icon('download', 'icon icon--sm')} ${i18n.t('btnInstallPWA')}
      </button>
    `;

    document.body.appendChild(banner);

    document.getElementById('btn-banner-pwa')?.addEventListener('click', () => this.triggerPWAInstall());
    document.getElementById('btn-banner-pwa-close')?.addEventListener('click', () => {
      try { localStorage.setItem('BERTHOPLAY_PWA_DISMISSED', String(Date.now())); } catch (e) {}
      banner.remove();
    });
  }

  // ------------------------------------------------------------------------
  // NAVIGATION
  // ------------------------------------------------------------------------

  // Conservées : les lanceurs de jeu les appellent déjà.
  hideBottomNav() { this.enterGame(); }
  showBottomNav() { this.exitGame(); }

  bindBottomNavbar() {
    const nav = document.getElementById('bottom-nav');
    if (!nav) return;

    const labels = {
      home: i18n.t('navHome'),
      feed: i18n.t('navActus'),
      stats: i18n.t('navTop'),
      account: i18n.t('navAccount'),
      settings: i18n.t('navSettings')
    };

    nav.querySelectorAll('.nav-item').forEach(item => {
      const tab = item.getAttribute('data-tab');
      const label = labels[tab];
      const span = item.querySelector('span');
      if (span && label) span.textContent = label;
      // Le libellé est masqué en paysage : l'icône a besoin d'un nom propre.
      if (label) item.setAttribute('aria-label', label);
      item.onclick = () => this.showTab(tab);
    });
  }

  /** Met à jour la bourse dans l'en-tête, avec une pulsation au gain. */
  updateCoinsDisplay(coins) {
<<<<<<< HEAD
    const purse = document.getElementById('purse');
    const value = document.getElementById('purse-value');
    if (!value) return;

    const next = Number(coins) || 0;
    const prev = parseInt(value.textContent.replace(/\s/g, ''), 10) || 0;

    value.textContent = next.toLocaleString('fr-FR');

    if (purse && next > prev) {
      purse.dataset.bump = 'true';
      setTimeout(() => delete purse.dataset.bump, 400);
=======
    const badge = document.getElementById('hub-coins-badge');
    if (badge) {
      badge.innerText = `${coins || 0} ${i18n.t('coins') || 'COINS'}`;
>>>>>>> a0239789d9828d38c0371e6dd35ea034f9487eff
    }
  }

  /** L'en-tête est statique dans le HTML : on n'y rafraîchit que la bourse. */
  renderGlobalTopHeader() {
    const state = SafeState.get();
<<<<<<< HEAD
    this.updateCoinsDisplay(state.currentUser?.coins ?? state.coins ?? 0);
=======
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
>>>>>>> a0239789d9828d38c0371e6dd35ea034f9487eff
  }

  async showTab(tabName) {
    this.showBottomNav();
    this.showPWABanner();
    this.renderGlobalTopHeader();
    this.currentTab = tabName;

    // aria-current plutôt qu'une classe : l'état est lu par les lecteurs d'écran.
    document.querySelectorAll('#bottom-nav .nav-item').forEach(item => {
      if (item.getAttribute('data-tab') === tabName) {
        item.setAttribute('aria-current', 'page');
      } else {
        item.removeAttribute('aria-current');
      }
    });

    // La vidéo ne tourne que sur le hub ; ailleurs elle se fige.
    Ambience.setScene(tabName === 'home' ? 'hub' : tabName);

    const viewContainer = document.getElementById('main-tab-container');
    if (!viewContainer) return;

    // Le hub s'étale en grille sur grand écran ; les vues denses (réglages,
    // tchat, classements) restent dans une colonne lisible.
    viewContainer.className = tabName === 'home' ? 'container container--wide' : 'container';

    // Le contenu remonte en haut à chaque changement d'onglet.
    document.getElementById('app-main')?.scrollTo({ top: 0, behavior: 'auto' });

    try {
      if (tabName === 'home') {
        await this.renderCardsView(viewContainer);
      } else {
        // Squelette pendant l'import du module : jamais d'écran blanc.
        viewContainer.innerHTML = `
          <div class="tab-view-content section" aria-busy="true">
            <div class="skeleton skeleton--title"></div>
            <div class="skeleton skeleton--tile"></div>
            <div class="skeleton skeleton--tile"></div>
            <div class="skeleton skeleton--tile"></div>
          </div>`;

        if (tabName === 'account') {
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
      }
    } catch (err) {
      console.error("Erreur de chargement de l'onglet :", err);
      BerthoSoundEffects.playErrorSound();
      viewContainer.innerHTML = `
        <div class="empty tab-view-content">
          ${icon('alert-triangle', 'icon empty__icon')}
          <h2 class="empty__title">Onglet indisponible</h2>
          <p class="empty__text">Ce module n'a pas pu être chargé. Vérifiez votre connexion, puis réessayez.</p>
          <button class="btn btn--secondary" type="button" id="btn-retry-tab">Réessayer</button>
        </div>`;
      document.getElementById('btn-retry-tab')?.addEventListener('click', () => this.showTab(tabName));
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
<<<<<<< HEAD
    // Bouton-icône : le nom accessible passe par aria-label, pas par le contenu.
    btn.setAttribute('aria-label', i18n.t('btnEco') || 'Infrastructures Bertho');
    btn.setAttribute('title', i18n.t('btnEco') || 'Infrastructures Bertho');
=======
    btn.innerText = i18n.t('btnEco') || 'Infrastructures Bertho';
>>>>>>> a0239789d9828d38c0371e6dd35ea034f9487eff

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

  // ------------------------------------------------------------------------
  // HUB — l'écran d'accueil
  // ------------------------------------------------------------------------

  async renderCardsView(container) {
    const state = SafeState.get();
    this.renderGlobalTopHeader();
    this.bindEcosystemButton();

<<<<<<< HEAD
    const CORE_GAMES = ['billiards', 'bubble', 'car', 'bike', 'checkers', 'chess', 'horde'];
=======
    const CORE_GAMES = ['billiards', 'bubble', 'car', 'bike', 'checkers', 'chess', 'horde', 'word'];
    let activeGamesList = [...CORE_GAMES];
>>>>>>> a0239789d9828d38c0371e6dd35ea034f9487eff

    // Une vraie hiérarchie : le jeu repris en grand, les autres en liste.
    // Sans historique, on met en avant le premier du catalogue.
    const featuredId = CORE_GAMES.includes(state.lastPlayed) ? state.lastPlayed : CORE_GAMES[0];
    const others = CORE_GAMES.filter(id => id !== featuredId);

    const user = state.currentUser;

    container.innerHTML = `
      <div class="tab-view-content">

        ${this.renderGreeting(user)}

        <section class="section" aria-labelledby="hub-resume">
          <div class="section__head">
            <h2 class="t-section" id="hub-resume">${state.lastPlayed ? 'Reprendre' : 'Commencer'}</h2>
          </div>
          <div class="hub-grid">
            ${this.renderTile(featuredId, state, true)}
          </div>
        </section>

        <section class="section" aria-labelledby="hub-catalog">
          <div class="section__head">
            <h2 class="t-section" id="hub-catalog">Catalogue</h2>
            <span class="t-meta">${others.length + 1} jeux</span>
          </div>
          <div class="hub-grid">
            ${others.map(id => this.renderTile(id, state, false)).join('')}
          </div>
        </section>

      </div>
    `;

    this.bindHubEvents(container);
  }

  /** Bandeau d'identité : salutation si connecté, invitation sinon. */
  renderGreeting(user) {
    if (user) {
      const initial = (user.username || '?').charAt(0);
      return `
        <div class="panel" style="display:flex; align-items:center; gap:var(--sp-3); margin-top:var(--sp-4);">
          <span class="avatar" aria-hidden="true">${initial}</span>
          <div class="grow">
            <p class="t-meta">Bon retour</p>
            <p class="list-row__title">${this.escape(user.username)}</p>
          </div>
          <button class="btn btn--ghost btn--sm" type="button" data-goto="account">Profil</button>
        </div>`;
    }
    return `
      <div class="panel" style="display:flex; align-items:center; gap:var(--sp-3); margin-top:var(--sp-4);">
        <span class="avatar" aria-hidden="true">${icon('user')}</span>
        <div class="grow">
          <p class="list-row__title">Jouez en invité</p>
          <p class="t-meta">Connectez-vous pour garder vos scores et vos Berthocoins.</p>
        </div>
        <button class="btn btn--primary btn--sm btn--cut" type="button" id="btn-hub-login">${i18n.t('btnConnexion') || 'Connexion'}</button>
      </div>`;
  }

  /** Une tuile de jeu. `feature` la rend pleine largeur et plus haute. */
  renderTile(gameId, state, feature) {
    const meta = GAME_EMBLEMS[gameId];
    if (!meta) return '';

    const value = meta.defaultVal(state);
    const label = (i18n.t(meta.infoKey) || 'Progression').replace(/:\s*$/, '').trim();

    return `
      <article class="tile ${feature ? 'tile--feature' : ''}" data-game="${gameId}" role="button" tabindex="0"
               aria-label="Jouer à ${meta.title}">
        <span class="tile__icon" aria-hidden="true">${meta.svg}</span>

        <div class="tile__body">
          <h3 class="tile__title">${meta.title}</h3>
          <p class="tile__meta">
            <span>${meta.tagline}</span>
          </p>
          <p class="tile__meta">
            <span class="badge badge--gold">${icon('star', 'icon icon--sm')} ${label} ${value}${meta.suffix || ''}</span>
          </p>
        </div>

        ${feature
          ? `<div class="row" style="gap:var(--sp-2); margin-top:var(--sp-4); width:100%;">
               <button class="btn btn--primary btn--cut grow" type="button" data-play="${gameId}">
                 ${icon('play', 'icon icon--sm icon--fill')} ${i18n.t('btnPlay') || 'Jouer'}
               </button>
               <button class="btn btn--secondary btn--icon" type="button"
                       data-reviews="${gameId}" data-title="${meta.title}"
                       aria-label="Avis et notes sur ${meta.title}">
                 ${icon('comment')}
               </button>
             </div>`
          : `<button class="btn btn--ghost btn--icon" type="button"
                     data-reviews="${gameId}" data-title="${meta.title}"
                     aria-label="Avis et notes sur ${meta.title}">
               ${icon('comment')}
             </button>
             ${icon('chevron-right', 'icon tile__chevron')}`}
      </article>`;
  }

  bindHubEvents(container) {
    // La tuile entière lance le jeu — sauf si on a visé un bouton dedans.
    container.querySelectorAll('.tile[data-game]').forEach(tile => {
      const launch = (e) => {
        if (e.target.closest('[data-reviews]')) return;
        this.startSelectedGame(tile.getAttribute('data-game'));
      };
      tile.addEventListener('click', launch);
      // Une tuile est un bouton : elle doit répondre au clavier comme tel.
      tile.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); launch(e); }
      });
    });

    container.querySelectorAll('[data-play]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.startSelectedGame(btn.getAttribute('data-play'));
      });
    });

    container.querySelectorAll('[data-reviews]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.openCommentsForGame(btn.getAttribute('data-reviews'), btn.getAttribute('data-title'));
      });
    });

    container.querySelector('#btn-hub-login')?.addEventListener('click', () => {
      this.auth?.openAuthModal();
    });

    container.querySelectorAll('[data-goto]').forEach(btn => {
      btn.addEventListener('click', () => this.showTab(btn.getAttribute('data-goto')));
    });
  }

  /** Toute donnée venue de l'utilisateur passe par ici avant d'entrer en HTML. */
  escape(str) {
    return String(str ?? '').replace(/[&<>"']/g, c => (
      { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    ));
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
<<<<<<< HEAD
    SafeState.save({ lastPlayed: id });
=======
    this.hidePWABanner(); // 🛑 Masque la bannière bleue pour TOUS les jeux
>>>>>>> a0239789d9828d38c0371e6dd35ea034f9487eff

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
      // L'état verrouillé se lit à l'icône autant qu'à l'opacité : la couleur
      // et la transparence seules ne suffisent pas à porter l'information.
      const marks = isUnlocked
        ? Array.from({ length: 3 }, (_, k) =>
            icon('star', `icon icon--sm ${k < starsEarned ? 'icon--fill' : ''}`)).join('')
        : icon('lock', 'icon icon--sm');

      gridHTML += `
        <button class="bub-card-step ${isUnlocked ? 'unlocked' : 'locked'}" type="button"
                data-lvl="${i}" ${isUnlocked ? '' : 'disabled aria-disabled="true"'}
                aria-label="${isUnlocked ? `Niveau ${i}, ${starsEarned} étoile(s) sur 3` : `Niveau ${i} verrouillé`}">
          <span>${i}</span>
          <small style="display:flex; gap:1px; color:${isUnlocked ? 'var(--gold-lit)' : 'var(--ink-4)'};">${marks}</small>
        </button>
      `;
    }

    selector.innerHTML = `
<<<<<<< HEAD
=======
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
>>>>>>> a0239789d9828d38c0371e6dd35ea034f9487eff
      <div class="bub-sel-overlay">
        <div class="bub-sel-top">
          <button class="btn-hub-back" id="btn-hub-from-bub" type="button" data-sfx="back">
            ${icon('arrow-left', 'icon icon--sm')} Hub
          </button>
          <h2 class="bub-sel-title grow">Bubble — 50 étapes</h2>
        </div>
<<<<<<< HEAD
        <p class="bub-stars-progress">
          ${icon('star', 'icon icon--sm icon--fill')} ${totalStars} / 150 étoiles
        </p>
        <div class="bub-sel-grid">
          ${gridHTML}
        </div>
=======
        <div class="bub-stars-progress">⭐ ${totalStars} / 150 ÉTOILES</div>
        <div class="bub-sel-grid">${gridHTML}</div>
>>>>>>> a0239789d9828d38c0371e6dd35ea034f9487eff
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
      { lvl: 10, title: 'Niveau 10', desc: 'Grand Prix (5 min)' }
    ];
    
    const selector = document.createElement('div');
    selector.id = 'level-selector-modal';
    selector.innerHTML = `
<<<<<<< HEAD
=======
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
>>>>>>> a0239789d9828d38c0371e6dd35ea034f9487eff
      <div class="sel-overlay">
        <div class="sel-top-bar">
          <button class="btn-hub-back" id="btn-hub-from-car" type="button" data-sfx="back">
          ${icon('arrow-left', 'icon icon--sm')} Hub
        </button>
          <h2 class="sel-title grow">Circuits</h2>
        </div>
        <div class="sel-grid">
          ${carLevelsList.map(item => `
            <button class="sel-card ${maxUnlocked >= item.lvl ? 'unlocked' : 'locked'}" type="button"
                    data-lvl="${item.lvl}" ${maxUnlocked >= item.lvl ? '' : 'disabled aria-disabled="true"'}>
              <h4>${item.title}</h4>
              <p>${item.desc}</p>
              ${maxUnlocked >= item.lvl ? '' : `<span style="color:var(--ink-4);">${icon('lock', 'icon icon--sm')}</span>`}
            </button>
          `).join('')}
        </div>
        <button class="sel-close" id="btn-close-sel" type="button" data-sfx="back">Annuler</button>
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
      { step: 10, title: 'Étape 10', desc: 'Grand Prix (5 min)' }
    ];
    
    const selector = document.createElement('div');
    selector.id = 'bike-selector-modal';
    selector.innerHTML = `
<<<<<<< HEAD
=======
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
>>>>>>> a0239789d9828d38c0371e6dd35ea034f9487eff
      <div class="sel-overlay">
        <div class="sel-top-bar">
          <button class="btn-hub-back" id="btn-hub-from-bike" type="button" data-sfx="back">
          ${icon('arrow-left', 'icon icon--sm')} Hub
        </button>
          <h2 class="sel-title grow">Étapes Moto GP</h2>
        </div>
        <div class="sel-grid">
          ${bikeStepsList.map(item => `
            <button class="sel-card ${maxUnlocked >= item.step ? 'unlocked' : 'locked'}" type="button"
                    data-step="${item.step}" ${maxUnlocked >= item.step ? '' : 'disabled aria-disabled="true"'}>
              <h4>${item.title}</h4>
              <p>${item.desc}</p>
              ${maxUnlocked >= item.step ? '' : `<span style="color:var(--ink-4);">${icon('lock', 'icon icon--sm')}</span>`}
            </button>
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
<<<<<<< HEAD

    this.exitGame();
    if (this.hub) this.hub.style.display = '';
=======
    
    if (this.canvas) this.canvas.style.display = 'none';
    if (this.backBtn) this.backBtn.style.display = 'none';
    if (this.hub) this.hub.style.display = 'flex';
    this.showPWABanner(); // 🔓 Réaffiche la bannière bleue PWA sur le Hub
>>>>>>> a0239789d9828d38c0371e6dd35ea034f9487eff
    this.showTab('home');
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new BerthoPlay());
} else {
  new BerthoPlay();
}