// ============================================================================
// BERTHOPLAY — MOTEUR AUDIO GOTHIQUE (WEB AUDIO API, 100% SYNTHÉTISÉ)
// ----------------------------------------------------------------------------
// Aucun fichier audio : tout est généré à la volée. La PWA reste légère et
// fonctionne hors-ligne.
//
// Caractère sonore : pierre, fer et voûte. Intervalles de quinte et de tierce
// mineure, attaques mates, réverbération de nef. Jamais d'arpège majeur clinquant.
//
// Chaîne : oscillateurs -> bus [sec | réverbe] -> compresseur -> volume -> sortie
// Le compresseur empêche la saturation quand plusieurs sons se superposent.
// ============================================================================

const STORAGE_KEY = 'BERTHOPLAY_V1';
const VOLUME_KEY = 'BERTHOPLAY_VOLUME';

export class BerthoSoundEffects {
  static ctx = null;
  static bus = null;          // gain maître
  static dry = null;          // signal direct
  static wet = null;          // départ réverbe
  static reverb = null;       // convolveur (nef de pierre)
  static noiseBuffer = null;  // bruit blanc réutilisable
  static ringtoneInterval = null;
  static unlocked = false;
  static _boundGlobals = false;
  static _lastHover = 0;

  // ==========================================================================
  // CONTEXTE & CHAÎNE AUDIO
  // ==========================================================================

  static initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      try {
        this.ctx = new AudioCtx();
        this.buildChain();
      } catch (e) {
        this.ctx = null;
        return;
      }
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  static buildChain() {
    const ctx = this.ctx;

    // Limiteur doux en bout de chaîne
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14;
    comp.knee.value = 22;
    comp.ratio.value = 9;
    comp.attack.value = 0.003;
    comp.release.value = 0.18;

    this.bus = ctx.createGain();
    this.bus.gain.value = this.getVolume();

    this.dry = ctx.createGain();
    this.dry.gain.value = 1;

    this.wet = ctx.createGain();
    this.wet.gain.value = 0;   // ajusté par son via sendReverb()

    this.reverb = ctx.createConvolver();
    this.reverb.buffer = this.makeStoneImpulse(1.9, 2.6);

    this.dry.connect(comp);
    this.wet.connect(this.reverb);
    this.reverb.connect(comp);
    comp.connect(this.bus);
    this.bus.connect(ctx.destination);

    this.noiseBuffer = this.makeNoiseBuffer(1.0);
  }

  // Réponse impulsionnelle synthétique : bruit à décroissance exponentielle.
  // Approche une nef de pierre sans charger de fichier .wav.
  static makeStoneImpulse(seconds, decay) {
    const ctx = this.ctx;
    const rate = ctx.sampleRate;
    const len = Math.max(1, Math.floor(rate * seconds));
    const buf = ctx.createBuffer(2, len, rate);
    for (let ch = 0; ch < 2; ch++) {
      const data = buf.getChannelData(ch);
      for (let i = 0; i < len; i++) {
        const t = i / len;
        // Pré-délai court + queue longue : la voûte répond, elle ne claque pas.
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, decay) * (t < 0.008 ? t / 0.008 : 1);
      }
    }
    return buf;
  }

  static makeNoiseBuffer(seconds) {
    const ctx = this.ctx;
    const len = Math.max(1, Math.floor(ctx.sampleRate * seconds));
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    return buf;
  }

  // ==========================================================================
  // PRÉFÉRENCES
  // ==========================================================================

  static isSoundEnabled() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return true;
      return JSON.parse(data).soundEnabled !== false;
    } catch (e) {
      return true;
    }
  }

  static getVolume() {
    try {
      const v = parseFloat(localStorage.getItem(VOLUME_KEY));
      return Number.isFinite(v) ? Math.min(1, Math.max(0, v)) : 0.7;
    } catch (e) {
      return 0.7;
    }
  }

  static setVolume(v) {
    const vol = Math.min(1, Math.max(0, Number(v) || 0));
    try { localStorage.setItem(VOLUME_KEY, String(vol)); } catch (e) {}
    if (this.bus) {
      this.bus.gain.setTargetAtTime(vol, this.ctx.currentTime, 0.02);
    }
  }

  // ==========================================================================
  // PRIMITIVES DE SYNTHÈSE
  // ==========================================================================

  // Un son ne doit jamais lever d'exception : l'audio est un agrément,
  // il ne casse pas une action utilisateur.
  static ready() {
    if (!this.isSoundEnabled()) return false;
    this.initContext();
    return !!(this.ctx && this.bus);
  }

  static route(node, reverbAmount = 0) {
    node.connect(this.dry);
    if (reverbAmount > 0) {
      const send = this.ctx.createGain();
      send.gain.value = reverbAmount;
      node.connect(send);
      send.connect(this.wet);
      this.wet.gain.value = 1;
    }
  }

  /**
   * Note enveloppée. Toutes les fréquences sont en Hz, les durées en secondes.
   * @param {object} o
   * @param {number} o.freq      fréquence de départ
   * @param {number} [o.to]      fréquence d'arrivée (glissando exponentiel)
   * @param {string} [o.type]    forme d'onde
   * @param {number} [o.at]      décalage de départ depuis maintenant
   * @param {number} [o.dur]     durée totale
   * @param {number} [o.gain]    amplitude crête
   * @param {number} [o.attack]  temps de montée
   * @param {number} [o.reverb]  0..1 départ vers la nef
   * @param {number} [o.lp]      fréquence de coupe passe-bas
   */
  static tone({ freq, to, type = 'sine', at = 0, dur = 0.3, gain = 0.2, attack = 0.005, reverb = 0, lp = 0 }) {
    try {
      const ctx = this.ctx;
      const t0 = ctx.currentTime + at;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, t0);
      if (to && to !== freq) {
        osc.frequency.exponentialRampToValueAtTime(Math.max(1, to), t0 + dur * 0.9);
      }

      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain), t0 + attack);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

      let tail = g;
      if (lp > 0) {
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(lp, t0);
        g.connect(filter);
        tail = filter;
      }

      osc.connect(g);
      this.route(tail, reverb);

      osc.start(t0);
      osc.stop(t0 + dur + 0.02);
    } catch (e) {}
  }

  /** Salve de bruit filtré : impacts, fer, pierre, souffle. */
  static noise({ at = 0, dur = 0.2, gain = 0.15, type = 'lowpass', freq = 900, q = 1, reverb = 0 }) {
    try {
      const ctx = this.ctx;
      const t0 = ctx.currentTime + at;
      const src = ctx.createBufferSource();
      src.buffer = this.noiseBuffer;

      const filter = ctx.createBiquadFilter();
      filter.type = type;
      filter.frequency.setValueAtTime(freq, t0);
      filter.Q.value = q;

      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain), t0 + 0.006);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

      src.connect(filter);
      filter.connect(g);
      this.route(g, reverb);

      src.start(t0);
      src.stop(t0 + dur + 0.02);
    } catch (e) {}
  }

  /** Vibration courte — Android l'honore, iOS l'ignore silencieusement. */
  static haptic(pattern = 8) {
    try {
      if (this.isSoundEnabled() && navigator.vibrate) navigator.vibrate(pattern);
    } catch (e) {}
  }

  // ==========================================================================
  // PALETTE — INTERFACE
  // ==========================================================================

  /** Pression d'un bouton : bois mat, très court. Le son le plus fréquent. */
  static playTap() {
    if (!this.ready()) return;
    this.tone({ freq: 240, to: 96, type: 'triangle', dur: 0.055, gain: 0.13, attack: 0.002, lp: 1600 });
    this.noise({ dur: 0.03, gain: 0.05, freq: 2400, type: 'highpass' });
  }

  /** Survol souris uniquement (desktop). Quasi subliminal, limité en cadence. */
  static playHover() {
    const now = Date.now();
    if (now - this._lastHover < 60) return;
    this._lastHover = now;
    if (!this.ready()) return;
    this.tone({ freq: 1320, type: 'sine', dur: 0.035, gain: 0.022, attack: 0.004 });
  }

  /** Changement d'onglet : quinte descendante, filtrée. */
  static playNavigate() {
    if (!this.ready()) return;
    this.tone({ freq: 392, type: 'triangle', dur: 0.12, gain: 0.1, lp: 2200, reverb: 0.15 });
    this.tone({ freq: 261.63, at: 0.055, type: 'triangle', dur: 0.18, gain: 0.09, lp: 1800, reverb: 0.2 });
  }

  /** Retour arrière : la même quinte, à l'envers et plus discrète. */
  static playBack() {
    if (!this.ready()) return;
    this.tone({ freq: 261.63, type: 'triangle', dur: 0.1, gain: 0.08, lp: 1800 });
    this.tone({ freq: 392, at: 0.05, type: 'triangle', dur: 0.14, gain: 0.07, lp: 2200, reverb: 0.15 });
  }

  /** Ouverture d'une feuille ou d'une modale : pierre qui coulisse. */
  static playOpen() {
    if (!this.ready()) return;
    this.noise({ dur: 0.34, gain: 0.09, freq: 620, type: 'lowpass', reverb: 0.3 });
    this.tone({ freq: 110, to: 165, type: 'sine', dur: 0.3, gain: 0.11, attack: 0.05, reverb: 0.25 });
  }

  /** Fermeture : impact sourd. */
  static playClose() {
    if (!this.ready()) return;
    this.tone({ freq: 165, to: 82, type: 'sine', dur: 0.18, gain: 0.11, attack: 0.004, reverb: 0.15 });
    this.noise({ dur: 0.1, gain: 0.05, freq: 400, type: 'lowpass' });
  }

  static playToggleOn() {
    if (!this.ready()) return;
    this.tone({ freq: 330, to: 494, type: 'triangle', dur: 0.1, gain: 0.11, lp: 3000 });
  }

  static playToggleOff() {
    if (!this.ready()) return;
    this.tone({ freq: 494, to: 294, type: 'triangle', dur: 0.1, gain: 0.09, lp: 2400 });
  }

  // ==========================================================================
  // PALETTE — JEU & RÉCOMPENSE
  // ==========================================================================

  /** Réussite d'une action : tierce mineure montante, cuivrée. */
  static playSuccess() {
    if (!this.ready()) return;
    this.tone({ freq: 293.66, type: 'triangle', dur: 0.28, gain: 0.12, reverb: 0.35 });   // D4
    this.tone({ freq: 349.23, at: 0.09, type: 'triangle', dur: 0.34, gain: 0.11, reverb: 0.4 }); // F4
    this.tone({ freq: 440.00, at: 0.18, type: 'sine',     dur: 0.5,  gain: 0.1,  reverb: 0.5 }); // A4
  }

  /** Victoire : accord de nef, cloche et souffle. Le moment le plus ample. */
  static playGameVictory() {
    if (!this.ready()) return;
    // Socle en quinte
    this.tone({ freq: 146.83, type: 'sine', dur: 1.5, gain: 0.13, attack: 0.02, reverb: 0.6 });   // D3
    this.tone({ freq: 220.00, at: 0.04, type: 'sine', dur: 1.4, gain: 0.1, attack: 0.02, reverb: 0.6 }); // A3
    // Montée en tierce mineure — grave, pas triomphaliste
    [293.66, 349.23, 440.00, 587.33].forEach((f, i) => {
      this.tone({ freq: f, at: 0.12 + i * 0.13, type: 'triangle', dur: 0.75, gain: 0.11, reverb: 0.55 });
    });
    // Cloche de couronnement
    this.tone({ freq: 1174.66, at: 0.62, type: 'sine', dur: 1.6, gain: 0.075, attack: 0.004, reverb: 0.7 });
    this.noise({ at: 0.6, dur: 0.9, gain: 0.03, freq: 3200, type: 'highpass', reverb: 0.6 });
    this.haptic([14, 60, 22]);
  }

  /** Gain de Berthocoins : métal précieux, deux partiels serrés. */
  static playCoinEarned() {
    if (!this.ready()) return;
    this.tone({ freq: 1046.5, type: 'sine',     dur: 0.22, gain: 0.1,  attack: 0.002, reverb: 0.25 });
    this.tone({ freq: 1567.98, at: 0.045, type: 'sine',   dur: 0.3,  gain: 0.07, attack: 0.002, reverb: 0.35 });
    this.tone({ freq: 2093,   at: 0.045, type: 'triangle', dur: 0.16, gain: 0.03, attack: 0.002 });
  }

  /** Déverrouillage (niveau, succès) : loquet de fer. */
  static playUnlock() {
    if (!this.ready()) return;
    this.noise({ dur: 0.09, gain: 0.13, freq: 1800, type: 'bandpass', q: 2.5 });
    this.tone({ freq: 98, to: 65, type: 'sine', dur: 0.3, gain: 0.13, attack: 0.003, reverb: 0.3 });
    this.tone({ freq: 392, at: 0.1, type: 'triangle', dur: 0.4, gain: 0.08, reverb: 0.45 });
    this.haptic([10, 40, 16]);
  }

  /** Refus, échec, action impossible : triton, dissonant par construction. */
  static playErrorSound() {
    if (!this.ready()) return;
    this.tone({ freq: 155.56, type: 'sawtooth', dur: 0.3, gain: 0.09, lp: 900 });   // Réb3
    this.tone({ freq: 220,    type: 'sawtooth', dur: 0.32, gain: 0.07, lp: 900 });  // La3 — triton
    this.haptic([28, 50, 28]);
  }

  // ==========================================================================
  // PALETTE — NOTIFICATIONS & APPELS
  // ==========================================================================

  /** Nouveau message : cloche brève dans la nef. */
  static playNotificationChime() {
    if (!this.ready()) return;
    this.tone({ freq: 587.33, type: 'sine', dur: 0.3, gain: 0.11, attack: 0.003, reverb: 0.4 });
    this.tone({ freq: 880.00, at: 0.1, type: 'sine', dur: 0.5, gain: 0.09, attack: 0.003, reverb: 0.5 });
  }

  /** Appel WebRTC entrant : motif répété jusqu'à stopRingtone(). */
  static playRingtone() {
    this.stopRingtone();
    if (!this.ready()) return;

    const pulse = () => {
      if (!this.isSoundEnabled()) { this.stopRingtone(); return; }
      this.tone({ freq: 293.66, type: 'triangle', dur: 0.5, gain: 0.14, attack: 0.02, reverb: 0.35 });
      this.tone({ freq: 440.00, type: 'triangle', dur: 0.5, gain: 0.11, attack: 0.02, reverb: 0.35 });
      this.tone({ freq: 293.66, at: 0.62, type: 'triangle', dur: 0.5, gain: 0.14, attack: 0.02, reverb: 0.35 });
      this.tone({ freq: 440.00, at: 0.62, type: 'triangle', dur: 0.5, gain: 0.11, attack: 0.02, reverb: 0.35 });
    };

    pulse();
    this.ringtoneInterval = setInterval(pulse, 2600);
  }

  static stopRingtone() {
    if (this.ringtoneInterval) {
      clearInterval(this.ringtoneInterval);
      this.ringtoneInterval = null;
    }
  }

  // ==========================================================================
  // COMPATIBILITÉ — anciens noms conservés
  // ==========================================================================

  static playButtonClick() { this.playTap(); }

  // ==========================================================================
  // DÉVERROUILLAGE iOS & CÂBLAGE GLOBAL
  // ==========================================================================

  /**
   * Safari iOS n'autorise la création/reprise d'un AudioContext que dans un
   * gestionnaire d'événement issu d'un geste réel. On s'accroche au premier
   * geste venu, puis on se retire.
   */
  static unlock() {
    if (this.unlocked) return;
    const doUnlock = () => {
      this.unlocked = true;
      this.initContext();
      // Un buffer muet force l'ouverture matérielle du canal sur iOS.
      try {
        const src = this.ctx.createBufferSource();
        src.buffer = this.ctx.createBuffer(1, 1, 22050);
        src.connect(this.ctx.destination);
        src.start(0);
      } catch (e) {}
      events.forEach(ev => document.removeEventListener(ev, doUnlock));
    };
    const events = ['pointerdown', 'touchstart', 'keydown'];
    events.forEach(ev => document.addEventListener(ev, doUnlock, { passive: true }));
  }

  /**
   * Câblage unique et délégué : tout élément interactif de l'application
   * sonne sans qu'aucune vue n'ait à s'en occuper.
   *
   * Priorité : un attribut `data-sfx="nom"` explicite l'emporte toujours.
   * Sinon le son est déduit du rôle de l'élément.
   * `data-sfx="none"` coupe le son sur une branche entière.
   */
  static bindGlobalFeedback() {
    if (this._boundGlobals) return;
    this._boundGlobals = true;

    this.unlock();

    const SFX = {
      tap: () => this.playTap(),
      nav: () => this.playNavigate(),
      back: () => this.playBack(),
      open: () => this.playOpen(),
      close: () => this.playClose(),
      'toggle-on': () => this.playToggleOn(),
      'toggle-off': () => this.playToggleOff(),
      success: () => this.playSuccess(),
      error: () => this.playErrorSound(),
      coin: () => this.playCoinEarned(),
      unlock: () => this.playUnlock(),
      victory: () => this.playGameVictory(),
      notify: () => this.playNotificationChime(),
      none: () => {}
    };

    const resolve = (el) => {
      // Un ancêtre peut réduire au silence toute une zone
      const silenced = el.closest('[data-sfx="none"]');
      if (silenced) return null;

      const explicit = el.closest('[data-sfx]');
      if (explicit) {
        const key = explicit.getAttribute('data-sfx');
        return SFX[key] || null;
      }

      if (el.closest('.nav-item')) return SFX.nav;
      if (el.closest('[data-dismiss], .sheet__close, #btn-back-hub')) return SFX.back;
      if (el.closest('.switch, [role="switch"]')) {
        const sw = el.closest('.switch, [role="switch"]');
        // L'état lu est celui d'AVANT bascule : on annonce la cible.
        return sw.getAttribute('aria-checked') === 'true' ? SFX['toggle-off'] : SFX['toggle-on'];
      }
      if (el.closest('.btn--danger')) return SFX.error;
      if (el.closest('.tile--locked, [aria-disabled="true"], :disabled')) return SFX.error;
      if (el.closest('.btn, .tile, .list-row, .segmented__item, .panel--action, button, [role="button"]')) return SFX.tap;
      return null;
    };

    // pointerdown plutôt que click : le son arrive avec le doigt, pas après.
    document.addEventListener('pointerdown', (e) => {
      const el = e.target instanceof Element ? e.target : null;
      if (!el) return;
      const play = resolve(el);
      if (play) {
        play();
        if (play !== SFX.error) this.haptic(6);
      }
    }, { passive: true, capture: true });

    // Le clavier doit produire le même retour que le doigt.
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const el = document.activeElement;
      if (!(el instanceof Element)) return;
      if (el.matches('input, textarea, select')) return;
      const play = resolve(el);
      if (play) play();
    });

    // Survol : desktop uniquement, jamais sur un appareil tactile.
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      document.addEventListener('pointerover', (e) => {
        const el = e.target instanceof Element ? e.target : null;
        if (!el) return;
        if (el.closest('[data-sfx="none"]')) return;
        if (el.closest('.btn, .tile, .nav-item, .list-row, .segmented__item')) this.playHover();
      }, { passive: true });
    }

    // Onglet masqué : on coupe la sonnerie et on suspend le contexte.
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.stopRingtone();
        if (this.ctx && this.ctx.state === 'running') this.ctx.suspend().catch(() => {});
      } else if (this.ctx && this.ctx.state === 'suspended' && this.unlocked) {
        this.ctx.resume().catch(() => {});
      }
    });
  }
}
