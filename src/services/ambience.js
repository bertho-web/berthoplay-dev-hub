// ============================================================================
// BERTHOPLAY — AMBIANCE VIDÉO DE FOND
// ----------------------------------------------------------------------------
// bg.mp4 (720x1280, 4 s, 490 Ko) tourne derrière les écrans d'entrée et le hub,
// se fige en poster sur les vues denses, et se coupe pendant les jeux 3D.
//
// Trois états :
//   playing — la vidéo tourne
//   still   — image figée (poster) : lisibilité et batterie
//   off     — dégradé uni : le WebGL des jeux a toute la machine
//
// La lecture est refusée d'office si l'utilisateur a demandé moins de mouvement,
// si le réseau est en mode économie, si la batterie est basse ou si l'appareil
// est modeste. Dans tous ces cas on retombe sur le poster : jamais d'écran vide.
// ============================================================================

const VIDEO_SRC = '/bg.mp4';
const POSTER_SRC = '/bg-poster.jpg';

// Quelles scènes ont droit à la vidéo animée
const SCENES = {
  splash: 'playing',
  hub: 'playing',
  auth: 'playing',
  feed: 'still',
  stats: 'still',
  account: 'still',
  settings: 'still',
  chat: 'still',
  game: 'off'
};

export class Ambience {
  static root = null;
  static video = null;
  static scene = 'splash';
  static allowMotion = true;
  static started = false;

  // ==========================================================================
  // DÉMARRAGE
  // ==========================================================================

  static init() {
    if (this.started) return;
    this.started = true;

    this.root = document.getElementById('ambience');
    if (!this.root) return;

    this.root.style.setProperty('--ambience-poster', `url("${POSTER_SRC}")`);

    this.allowMotion = this.shouldAnimate();

    if (this.allowMotion) {
      this.mountVideo();
    } else {
      this.setState('still');
    }

    this.watchPreferences();
    this.apply();
  }

  /**
   * Décide si l'appareil et l'utilisateur veulent d'une vidéo animée.
   * Chaque refus est légitime — aucun n'est un cas d'erreur.
   */
  static shouldAnimate() {
    // 1. Préférence système de mouvement réduit — la plus importante
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;

    const conn = navigator.connection || navigator.webkitConnection;
    if (conn) {
      // 2. Économiseur de données explicite
      if (conn.saveData) return false;
      // 3. Réseau lent : 490 Ko de vidéo décorative n'ont pas la priorité
      if (/(^|-)2g$/.test(conn.effectiveType || '')) return false;
    }

    // 4. Appareil modeste : on garde le CPU pour les jeux
    if (typeof navigator.deviceMemory === 'number' && navigator.deviceMemory <= 2) return false;
    if (typeof navigator.hardwareConcurrency === 'number' && navigator.hardwareConcurrency <= 2) return false;

    return true;
  }

  static mountVideo() {
    const v = document.createElement('video');
    v.id = 'ambience-video';
    v.src = VIDEO_SRC;
    v.poster = POSTER_SRC;

    // Combinaison exacte exigée par Safari iOS pour une lecture automatique :
    // muted + playsinline + autoplay, et l'attribut muted posé AVANT la source.
    v.muted = true;
    v.defaultMuted = true;
    v.autoplay = true;
    v.loop = true;
    v.playsInline = true;
    v.setAttribute('muted', '');
    v.setAttribute('playsinline', '');
    v.setAttribute('webkit-playsinline', '');
    v.setAttribute('autoplay', '');
    v.setAttribute('loop', '');
    v.setAttribute('disablepictureinpicture', '');
    v.setAttribute('aria-hidden', 'true');
    v.preload = 'auto';
    v.tabIndex = -1;

    // Une vidéo décorative qui échoue ne doit pas laisser de trou : on bascule
    // définitivement sur le poster.
    v.addEventListener('error', () => {
      this.allowMotion = false;
      this.setState('still');
    }, { once: true });

    this.video = v;
    this.root.insertBefore(v, this.root.firstChild);

    this.tryPlay();
  }

  /**
   * iOS en mode économie d'énergie refuse la lecture automatique même quand
   * tous les attributs sont corrects. On réessaie au premier geste réel.
   */
  static tryPlay() {
    if (!this.video) return;
    const p = this.video.play();
    if (p && typeof p.catch === 'function') {
      p.catch(() => {
        const retry = () => {
          this.video.play().catch(() => {
            // Deuxième échec : l'appareil ne veut pas. Le poster prend le relais.
            this.allowMotion = false;
            this.setState('still');
          });
          document.removeEventListener('pointerdown', retry);
          document.removeEventListener('touchstart', retry);
        };
        document.addEventListener('pointerdown', retry, { once: true, passive: true });
        document.addEventListener('touchstart', retry, { once: true, passive: true });
      });
    }
  }

  // ==========================================================================
  // PRÉFÉRENCES DYNAMIQUES
  // ==========================================================================

  static watchPreferences() {
    // L'utilisateur peut activer « réduire le mouvement » pendant la session
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => {
      this.allowMotion = this.shouldAnimate();
      if (this.allowMotion && !this.video) this.mountVideo();
      this.apply();
    };
    mq.addEventListener ? mq.addEventListener('change', onChange) : mq.addListener(onChange);

    // Onglet masqué : rien ne doit décoder en arrière-plan
    document.addEventListener('visibilitychange', () => this.apply());

    // Batterie faible : on préserve l'autonomie pour jouer
    if (navigator.getBattery) {
      navigator.getBattery().then((bat) => {
        const check = () => {
          this.lowBattery = bat.level <= 0.2 && !bat.charging;
          this.apply();
        };
        bat.addEventListener('levelchange', check);
        bat.addEventListener('chargingchange', check);
        check();
      }).catch(() => {});
    }
  }

  // ==========================================================================
  // SCÈNES
  // ==========================================================================

  /** Appelée à chaque changement d'écran. Un nom inconnu retombe sur `still`. */
  static setScene(name) {
    this.scene = name;
    this.apply();
  }

  static apply() {
    if (!this.root) return;

    let target = SCENES[this.scene] || 'still';

    if (target === 'playing') {
      if (!this.allowMotion || this.lowBattery || document.hidden) target = 'still';
    }

    this.setState(target);
  }

  static setState(state) {
    if (!this.root) return;
    this.root.setAttribute('data-state', state);

    if (!this.video) return;

    if (state === 'playing') {
      if (this.video.paused) this.tryPlay();
    } else if (!this.video.paused) {
      this.video.pause();
    }
  }
}
