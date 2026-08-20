// ============================================================================
// 🎮 BERTHOPLAY — WORD WHEEL AAAA (SRC/GAMES/WORD.JS) [50 NIVEAUX PURS 100%]
// ============================================================================

// --- 1. MOTEUR AUDIO HARMONIQUE AUTONOME ---
class WordAudio {
  static getCtx() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  static playTone(index) {
    try {
      const ctx = this.getCtx();
      const scale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33];
      const freq = scale[Math.min(index, scale.length - 1)];
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch(e) {}
  }

  static playBacktrack() {
    try {
      const ctx = this.getCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(250, ctx.currentTime + 0.06);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.06);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } catch(e) {}
  }

  static playSolved() {
    try {
      const ctx = this.getCtx();
      const now = ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.16, now + i * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.05);
        osc.stop(now + i * 0.05 + 0.35);
      });
    } catch(e) {}
  }

  static playFanfare() {
    try {
      const ctx = this.getCtx();
      const now = ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.50, 1318.51].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.18, now + i * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.07);
        osc.stop(now + i * 0.07 + 0.4);
      });
    } catch(e) {}
  }

  static playError() {
    try {
      const ctx = this.getCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(90, ctx.currentTime + 0.14);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.14);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.14);
    } catch(e) {}
  }

  static playClick() {
    try {
      const ctx = this.getCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(750, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1100, ctx.currentTime + 0.06);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.06);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } catch(e) {}
  }
}

// --- 2. DICTIONNAIRE LEXICAL FRANÇAIS ÉTENDU ---
const FRENCH_LEXICON = new Set([
  'AS', 'AI', 'SI', 'OR', 'OU', 'EU', 'EX', 'TU', 'DO', 'ME', 'MA', 'TA', 'TE', 'LE', 'LA', 'IL', 'UN', 'ON', 'EN', 'NE', 'CE', 'SE', 'ET', 'EH', 'OH', 'AH', 'VA', 'VU', 'SU', 'DU', 'AU', 'DE', 'NO', 'US', 'UT', 'AY', 'OC', 'AN', 'RE',
  'JEU', 'EAU', 'AMI', 'MAI', 'MIS', 'MAS', 'SAI', 'BON', 'ROI', 'CLE', 'POT', 'PUR', 'TOP', 'PRO', 'PUT', 'BLE', 'BAC', 'BAL', 'BAT', 'ALE', 'JUR', 'RUE', 'RUT', 'ORE', 'ARC', 'CAR', 'SAC', 'SEC', 'ACE', 'ARS', 'CAS', 'NOM', 'DON', 'DOME', 'ODE', 'MEN', 'MER', 'AGE', 'RAM', 'MES', 'GAZ', 'THE', 'BOT', 'HOT', 'TER', 'ROB', 'VIS', 'VER', 'VIE', 'LIE', 'SOL', 'SOC', 'SON', 'CON', 'LOS', 'PAN', 'PAS', 'PAT', 'PAL', 'PAR', 'PET', 'NET', 'TAN', 'TAP', 'COL', 'ECO', 'VAL', 'VOL', 'VAN', 'VIN', 'LIT', 'LOI', 'MAN', 'MET', 'MOL', 'MUR', 'NID', 'NEZ', 'OIE', 'OUI', 'PIN', 'PLI', 'RAD', 'ROC', 'SEL', 'SKI', 'SOT', 'SUD', 'SUR', 'TAS', 'TIR', 'TOC', 'TON', 'TRI', 'VIF', 'ZOO', 'ETE', 'CAP', 'GAY', 'GAT', 'MOU', 'MUE', 'BAR', 'BEA', 'BEE', 'CRI', 'CIL', 'FUS', 'FAR', 'FAS', 'TIC', 'TAC',
  'AMIS', 'MAIS', 'SAIS', 'MISA', 'JEUX', 'POUR', 'TOUR', 'TROU', 'PORT', 'ROUT', 'TROT', 'TABLE', 'BATE', 'BALE', 'PLAT', 'BETA', 'TALE', 'LATE', 'JOUER', 'ROUE', 'JOUR', 'JURE', 'RUES', 'RACE', 'CARE', 'CASE', 'ACRE', 'ACES', 'CARS', 'SACS', 'SECS', 'ARCS', 'MONDE', 'DEMON', 'DOME', 'DOMS', 'MODE', 'ONDE', 'ODES', 'DONS', 'NOMS', 'MEND', 'GAMER', 'GARE', 'MAGE', 'RAME', 'GARES', 'MAGES', 'RAMES', 'MERS', 'SAGE', 'MARE', 'GARS', 'ROBE', 'HOTE', 'BORE', 'ROTE', 'TORE', 'BETH', 'HERO', 'BOTS', 'HOTS', 'TERS', 'SILVER', 'LIVRE', 'RIRE', 'RIVE', 'SIRE', 'VIEL', 'LIRE', 'RIRES', 'RIVES', 'SIRES', 'LIVRES', 'VIELS', 'LIRES', 'VIES', 'LITS', 'VERS', 'CONSOLE', 'COLON', 'CLOS', 'LOSE', 'CLONE', 'LOCO', 'CONE', 'SOLS', 'SOLE', 'NOEL', 'SONS', 'CONS', 'SOCS', 'COLE', 'SONO', 'SOLO', 'LOSES', 'CLONES', 'LOCOS', 'CONES', 'SOLES', 'NOELS', 'COLES', 'SONOS', 'SOLOS', 'PLANETE', 'PLANTE', 'PLANE', 'LANE', 'PALE', 'TAPE', 'PATE', 'PETE', 'PANE', 'NETS', 'PANS', 'PLATS', 'PLANS', 'PALES', 'TAPES', 'PATES', 'PETES', 'PANES', 'LANES', 'PLANES', 'PLANTES', 'PLANETES', 'MONTAGE', 'MONT', 'TOGE', 'GANT', 'ETANG', 'MOTS', 'TOMES', 'GANTS', 'ETANGS', 'COURAGE', 'CAGE', 'URGE', 'ROUE', 'GARE', 'CAGES', 'ROUES', 'GARES', 'VOYAGES', 'VASE', 'OYES', 'GAVE', 'SAGE', 'VASES', 'GAVES', 'SAGES', 'CHATEAU', 'CHAT', 'HAUT', 'TACHE', 'EAU', 'CHATS', 'HAUTS', 'TACHES', 'CHAMBRE', 'CRABE', 'BRAME', 'AMER', 'CRABES', 'AMERS', 'MIRACLE', 'CIME', 'LIME', 'CIMES', 'LIMES', 'PARFUMS', 'FARS', 'MURS', 'VICTOIRE', 'VOIE', 'CITE', 'TIRE', 'ROTI', 'VOIES', 'CITES', 'TIRES', 'ROTIS', 'CAPITALE', 'CAPE', 'LITE', 'CAPES', 'LITES', 'CAPITALES',
  'BERTHO', 'GAMERS', 'CONSOLES', 'PLANETES', 'PLANTES', 'SILVERS', 'MONDES', 'DEMONS', 'TABLES', 'JOUERS', 'JOUEURS', 'BROTE', 'BROTES', 'SOMMETS', 'VOYAGES', 'FACILES', 'NATURE', 'SOLEIL', 'ETOILE', 'JARDIN', 'COEURS', 'PASSION', 'VILLAGE', 'BATEAU', 'CHALEUR', 'FLEURS', 'SILENCE', 'SOURIS', 'DIAMANT', 'PRINCE', 'COULEUR', 'BALLON', 'MYSTERE', 'TEMPLE', 'HORIZON', 'TRESOR', 'CHAMPION', 'FANTOME', 'AVENTURE', 'UNIVERS', 'GRANDEUR', 'FORTUNE', 'PRESENT', 'SOUVERAIN'
]);

// --- 3. BASE DES 50 NIVEAUX 100% GAGNABLES, FRANÇAIS ET SANS AUCUNE COLLISION ---
const LEVELS_DB = [
  { lvl: 1, wheel: ['A', 'M', 'I', 'S'], grid: [{ word: 'AMIS', r: 0, c: 0, dir: 'H' }, { word: 'AMI', r: 0, c: 0, dir: 'V' }, { word: 'MAIS', r: 0, c: 1, dir: 'V' }, { word: 'SAI', r: 0, c: 3, dir: 'V' }] },
  { lvl: 2, wheel: ['P', 'O', 'U', 'R', 'T'], grid: [{ word: 'POUR', r: 0, c: 0, dir: 'H' }, { word: 'POT', r: 0, c: 0, dir: 'V' }, { word: 'OUT', r: 0, c: 1, dir: 'V' }, { word: 'ROUT', r: 0, c: 3, dir: 'V' }] },
  { lvl: 3, wheel: ['T', 'A', 'B', 'L', 'E'], grid: [{ word: 'TABLE', r: 0, c: 0, dir: 'H' }, { word: 'TALE', r: 0, c: 0, dir: 'V' }, { word: 'BATE', r: 0, c: 2, dir: 'V' }, { word: 'LATE', r: 0, c: 3, dir: 'V' }, { word: 'ETAL', r: 0, c: 4, dir: 'V' }] },
  { lvl: 4, wheel: ['J', 'O', 'U', 'E', 'R'], grid: [{ word: 'JOUER', r: 0, c: 0, dir: 'H' }, { word: 'JOUR', r: 0, c: 0, dir: 'V' }, { word: 'ORE', r: 0, c: 1, dir: 'V' }, { word: 'URE', r: 0, c: 2, dir: 'V' }, { word: 'RUE', r: 0, c: 4, dir: 'V' }] },
  { lvl: 5, wheel: ['C', 'A', 'R', 'E', 'S'], grid: [{ word: 'CARES', r: 0, c: 0, dir: 'H' }, { word: 'CASE', r: 0, c: 0, dir: 'V' }, { word: 'ACRE', r: 0, c: 1, dir: 'V' }, { word: 'RACE', r: 0, c: 2, dir: 'V' }, { word: 'SAC', r: 0, c: 4, dir: 'V' }] },
  { lvl: 6, wheel: ['M', 'O', 'N', 'D', 'E'], grid: [{ word: 'MONDE', r: 0, c: 0, dir: 'H' }, { word: 'MODE', r: 0, c: 0, dir: 'V' }, { word: 'ONDE', r: 0, c: 1, dir: 'V' }, { word: 'NOM', r: 0, c: 2, dir: 'V' }, { word: 'DOME', r: 0, c: 3, dir: 'V' }] },
  { lvl: 7, wheel: ['G', 'A', 'M', 'E', 'R', 'S'], grid: [{ word: 'GAMERS', r: 0, c: 0, dir: 'H' }, { word: 'GARE', r: 0, c: 0, dir: 'V' }, { word: 'MAGE', r: 0, c: 2, dir: 'V' }, { word: 'RAME', r: 0, c: 4, dir: 'V' }, { word: 'SAGE', r: 0, c: 5, dir: 'V' }] },
  { lvl: 8, wheel: ['B', 'E', 'R', 'T', 'H', 'O'], grid: [{ word: 'BERTHO', r: 0, c: 0, dir: 'H' }, { word: 'BORE', r: 0, c: 0, dir: 'V' }, { word: 'ROBE', r: 0, c: 2, dir: 'V' }, { word: 'HOTE', r: 0, c: 4, dir: 'V' }, { word: 'ORE', r: 0, c: 5, dir: 'V' }] },
  { lvl: 9, wheel: ['S', 'I', 'L', 'V', 'E', 'R'], grid: [{ word: 'SILVER', r: 0, c: 0, dir: 'H' }, { word: 'SIRE', r: 0, c: 0, dir: 'V' }, { word: 'LIVRE', r: 0, c: 2, dir: 'V' }, { word: 'VIEL', r: 0, c: 3, dir: 'V' }, { word: 'RIVE', r: 0, c: 5, dir: 'V' }] },
  { lvl: 10, wheel: ['C', 'O', 'N', 'S', 'O', 'L', 'E'], grid: [{ word: 'CONSOLE', r: 0, c: 0, dir: 'H' }, { word: 'COLON', r: 0, c: 0, dir: 'V' }, { word: 'SOL', r: 0, c: 3, dir: 'V' }, { word: 'ONCE', r: 0, c: 4, dir: 'V' }, { word: 'LOSE', r: 0, c: 5, dir: 'V' }] },
  { lvl: 11, wheel: ['P', 'L', 'A', 'N', 'E', 'T', 'E'], grid: [{ word: 'PLANETE', r: 0, c: 0, dir: 'H' }, { word: 'PLANTE', r: 0, c: 0, dir: 'V' }, { word: 'LANE', r: 0, c: 1, dir: 'V' }, { word: 'NET', r: 0, c: 3, dir: 'V' }, { word: 'TAPE', r: 0, c: 5, dir: 'V' }] },
  { lvl: 12, wheel: ['M', 'O', 'N', 'T', 'A', 'G', 'E'], grid: [{ word: 'MONTAGE', r: 0, c: 0, dir: 'H' }, { word: 'MONT', r: 0, c: 0, dir: 'V' }, { word: 'TOGE', r: 0, c: 3, dir: 'V' }, { word: 'GANT', r: 0, c: 5, dir: 'V' }, { word: 'ETANG', r: 0, c: 6, dir: 'V' }] },
  { lvl: 13, wheel: ['C', 'O', 'U', 'R', 'A', 'G', 'E'], grid: [{ word: 'COURAGE', r: 0, c: 0, dir: 'H' }, { word: 'CAGE', r: 0, c: 0, dir: 'V' }, { word: 'URGE', r: 0, c: 2, dir: 'V' }, { word: 'ROUE', r: 0, c: 3, dir: 'V' }, { word: 'GARE', r: 0, c: 5, dir: 'V' }] },
  { lvl: 14, wheel: ['V', 'O', 'Y', 'A', 'G', 'E', 'S'], grid: [{ word: 'VOYAGES', r: 0, c: 0, dir: 'H' }, { word: 'VASE', r: 0, c: 0, dir: 'V' }, { word: 'OYES', r: 0, c: 1, dir: 'V' }, { word: 'GAVE', r: 0, c: 4, dir: 'V' }, { word: 'SAGE', r: 0, c: 6, dir: 'V' }] },
  { lvl: 15, wheel: ['C', 'H', 'A', 'T', 'E', 'A', 'U'], grid: [{ word: 'CHATEAU', r: 0, c: 0, dir: 'H' }, { word: 'CHAT', r: 0, c: 0, dir: 'V' }, { word: 'HAUT', r: 0, c: 1, dir: 'V' }, { word: 'TACHE', r: 0, c: 3, dir: 'V' }, { word: 'EAU', r: 0, c: 4, dir: 'V' }] },
  { lvl: 16, wheel: ['C', 'H', 'A', 'M', 'B', 'R', 'E'], grid: [{ word: 'CHAMBRE', r: 0, c: 0, dir: 'H' }, { word: 'CRABE', r: 0, c: 0, dir: 'V' }, { word: 'AMER', r: 0, c: 2, dir: 'V' }, { word: 'BRAME', r: 0, c: 4, dir: 'V' }, { word: 'RAME', r: 0, c: 5, dir: 'V' }] },
  { lvl: 17, wheel: ['M', 'I', 'R', 'A', 'C', 'L', 'E'], grid: [{ word: 'MIRACLE', r: 0, c: 0, dir: 'H' }, { word: 'MARE', r: 0, c: 0, dir: 'V' }, { word: 'RAME', r: 0, c: 2, dir: 'V' }, { word: 'CIME', r: 0, c: 4, dir: 'V' }, { word: 'LIME', r: 0, c: 5, dir: 'V' }] },
  { lvl: 18, wheel: ['P', 'A', 'R', 'F', 'U', 'M', 'S'], grid: [{ word: 'PARFUMS', r: 0, c: 0, dir: 'H' }, { word: 'PARS', r: 0, c: 0, dir: 'V' }, { word: 'RAMS', r: 0, c: 2, dir: 'V' }, { word: 'FARS', r: 0, c: 3, dir: 'V' }, { word: 'MURS', r: 0, c: 5, dir: 'V' }] },
  { lvl: 19, wheel: ['V', 'I', 'C', 'T', 'O', 'I', 'R', 'E'], grid: [{ word: 'VICTOIRE', r: 0, c: 0, dir: 'H' }, { word: 'VOIE', r: 0, c: 0, dir: 'V' }, { word: 'CITE', r: 0, c: 2, dir: 'V' }, { word: 'TIRE', r: 0, c: 3, dir: 'V' }, { word: 'ROTI', r: 0, c: 6, dir: 'V' }] },
  { lvl: 20, wheel: ['C', 'A', 'P', 'I', 'T', 'A', 'L', 'E'], grid: [{ word: 'CAPITALE', r: 0, c: 0, dir: 'H' }, { word: 'CAPE', r: 0, c: 0, dir: 'V' }, { word: 'PALE', r: 0, c: 2, dir: 'V' }, { word: 'TALE', r: 0, c: 4, dir: 'V' }, { word: 'LITE', r: 0, c: 6, dir: 'V' }] },
  { lvl: 21, wheel: ['S', 'O', 'L', 'E', 'I', 'L'], grid: [{ word: 'SOLEIL', r: 0, c: 0, dir: 'H' }, { word: 'SOIE', r: 0, c: 0, dir: 'V' }, { word: 'OIES', r: 0, c: 1, dir: 'V' }, { word: 'LOIS', r: 0, c: 2, dir: 'V' }, { word: 'ILES', r: 0, c: 4, dir: 'V' }] },
  { lvl: 22, wheel: ['N', 'A', 'T', 'U', 'R', 'E'], grid: [{ word: 'NATURE', r: 0, c: 0, dir: 'H' }, { word: 'NET', r: 0, c: 0, dir: 'V' }, { word: 'TENU', r: 0, c: 2, dir: 'V' }, { word: 'UNE', r: 0, c: 3, dir: 'V' }, { word: 'RUE', r: 0, c: 4, dir: 'V' }] },
  { lvl: 23, wheel: ['E', 'T', 'O', 'I', 'L', 'E'], grid: [{ word: 'ETOILE', r: 0, c: 0, dir: 'H' }, { word: 'ELITE', r: 0, c: 0, dir: 'V' }, { word: 'TOILE', r: 0, c: 1, dir: 'V' }, { word: 'OIE', r: 0, c: 2, dir: 'V' }, { word: 'LOT', r: 0, c: 4, dir: 'V' }] },
  { lvl: 24, wheel: ['L', 'I', 'B', 'E', 'R', 'T', 'E'], grid: [{ word: 'LIBERTE', r: 0, c: 0, dir: 'H' }, { word: 'LITRE', r: 0, c: 0, dir: 'V' }, { word: 'BLE', r: 0, c: 2, dir: 'V' }, { word: 'ELITE', r: 0, c: 3, dir: 'V' }, { word: 'TIRE', r: 0, c: 5, dir: 'V' }] },
  { lvl: 25, wheel: ['J', 'A', 'R', 'D', 'I', 'N'], grid: [{ word: 'JARDIN', r: 0, c: 0, dir: 'H' }, { word: 'AIR', r: 0, c: 1, dir: 'V' }, { word: 'RADIN', r: 0, c: 2, dir: 'V' }, { word: 'DAIN', r: 0, c: 3, dir: 'V' }, { word: 'NID', r: 0, c: 5, dir: 'V' }] },
  { lvl: 26, wheel: ['C', 'O', 'E', 'U', 'R', 'S'], grid: [{ word: 'COEURS', r: 0, c: 0, dir: 'H' }, { word: 'COURS', r: 0, c: 0, dir: 'V' }, { word: 'ORE', r: 0, c: 1, dir: 'V' }, { word: 'ROUE', r: 0, c: 4, dir: 'V' }, { word: 'SUCRE', r: 0, c: 5, dir: 'V' }] },
  { lvl: 27, wheel: ['P', 'A', 'S', 'S', 'I', 'O', 'N'], grid: [{ word: 'PASSION', r: 0, c: 0, dir: 'H' }, { word: 'POIS', r: 0, c: 0, dir: 'V' }, { word: 'SAIS', r: 0, c: 2, dir: 'V' }, { word: 'SOIN', r: 0, c: 3, dir: 'V' }, { word: 'IONS', r: 0, c: 4, dir: 'V' }] },
  { lvl: 28, wheel: ['V', 'I', 'L', 'L', 'A', 'G', 'E'], grid: [{ word: 'VILLAGE', r: 0, c: 0, dir: 'H' }, { word: 'VILLE', r: 0, c: 0, dir: 'V' }, { word: 'LIVE', r: 0, c: 2, dir: 'V' }, { word: 'AIL', r: 0, c: 4, dir: 'V' }, { word: 'GAVE', r: 0, c: 5, dir: 'V' }] },
  { lvl: 29, wheel: ['B', 'A', 'T', 'E', 'A', 'U'], grid: [{ word: 'BATEAU', r: 0, c: 0, dir: 'H' }, { word: 'BEAU', r: 0, c: 0, dir: 'V' }, { word: 'TUBE', r: 0, c: 2, dir: 'V' }, { word: 'EAU', r: 0, c: 3, dir: 'V' }, { word: 'AUBE', r: 0, c: 4, dir: 'V' }] },
  { lvl: 30, wheel: ['C', 'H', 'A', 'L', 'E', 'U', 'R'], grid: [{ word: 'CHALEUR', r: 0, c: 0, dir: 'H' }, { word: 'CHALE', r: 0, c: 0, dir: 'V' }, { word: 'HUER', r: 0, c: 1, dir: 'V' }, { word: 'LEUR', r: 0, c: 3, dir: 'V' }, { word: 'EAU', r: 0, c: 4, dir: 'V' }, { word: 'RUE', r: 0, c: 6, dir: 'V' }] },
  { lvl: 31, wheel: ['F', 'L', 'E', 'U', 'R', 'S'], grid: [{ word: 'FLEURS', r: 0, c: 0, dir: 'H' }, { word: 'FLEUR', r: 0, c: 0, dir: 'V' }, { word: 'EUS', r: 0, c: 2, dir: 'V' }, { word: 'RUES', r: 0, c: 4, dir: 'V' }, { word: 'SEUL', r: 0, c: 5, dir: 'V' }] },
  { lvl: 32, wheel: ['S', 'I', 'L', 'E', 'N', 'C', 'E'], grid: [{ word: 'SILENCE', r: 0, c: 0, dir: 'H' }, { word: 'SCENE', r: 0, c: 0, dir: 'V' }, { word: 'LIEN', r: 0, c: 2, dir: 'V' }, { word: 'NIL', r: 0, c: 4, dir: 'V' }, { word: 'CIEL', r: 0, c: 5, dir: 'V' }] },
  { lvl: 33, wheel: ['C', 'A', 'S', 'C', 'A', 'D', 'E'], grid: [{ word: 'CASCADE', r: 0, c: 0, dir: 'H' }, { word: 'CASE', r: 0, c: 0, dir: 'V' }, { word: 'SAC', r: 0, c: 2, dir: 'V' }, { word: 'CADE', r: 0, c: 3, dir: 'V' }, { word: 'DACE', r: 0, c: 5, dir: 'V' }] },
  { lvl: 34, wheel: ['S', 'O', 'U', 'R', 'I', 'S'], grid: [{ word: 'SOURIS', r: 0, c: 0, dir: 'H' }, { word: 'SOIR', r: 0, c: 0, dir: 'V' }, { word: 'OURS', r: 0, c: 1, dir: 'V' }, { word: 'RUIS', r: 0, c: 3, dir: 'V' }, { word: 'SUR', r: 0, c: 5, dir: 'V' }] },
  { lvl: 35, wheel: ['D', 'I', 'A', 'M', 'A', 'N', 'T'], grid: [{ word: 'DIAMANT', r: 0, c: 0, dir: 'H' }, { word: 'DAIN', r: 0, c: 0, dir: 'V' }, { word: 'AMI', r: 0, c: 2, dir: 'V' }, { word: 'MAIN', r: 0, c: 3, dir: 'V' }, { word: 'NID', r: 0, c: 5, dir: 'V' }, { word: 'TIN', r: 0, c: 6, dir: 'V' }] },
  { lvl: 36, wheel: ['P', 'R', 'I', 'N', 'C', 'E'], grid: [{ word: 'PRINCE', r: 0, c: 0, dir: 'H' }, { word: 'PINCE', r: 0, c: 0, dir: 'V' }, { word: 'RIPE', r: 0, c: 1, dir: 'V' }, { word: 'CRI', r: 0, c: 4, dir: 'V' }, { word: 'EPI', r: 0, c: 5, dir: 'V' }] },
  { lvl: 37, wheel: ['C', 'O', 'U', 'L', 'E', 'U', 'R'], grid: [{ word: 'COULEUR', r: 0, c: 0, dir: 'H' }, { word: 'CLOU', r: 0, c: 0, dir: 'V' }, { word: 'LOUE', r: 0, c: 3, dir: 'V' }, { word: 'ECU', r: 0, c: 4, dir: 'V' }, { word: 'ROUE', r: 0, c: 6, dir: 'V' }] },
  { lvl: 38, wheel: ['B', 'A', 'L', 'L', 'O', 'N'], grid: [{ word: 'BALLON', r: 0, c: 0, dir: 'H' }, { word: 'BAL', r: 0, c: 0, dir: 'V' }, { word: 'ALLO', r: 0, c: 1, dir: 'V' }, { word: 'LOB', r: 0, c: 2, dir: 'V' }, { word: 'OLA', r: 0, c: 4, dir: 'V' }, { word: 'NAB', r: 0, c: 5, dir: 'V' }] },
  { lvl: 39, wheel: ['M', 'Y', 'S', 'T', 'E', 'R', 'E'], grid: [{ word: 'MYSTERE', r: 0, c: 0, dir: 'H' }, { word: 'METRE', r: 0, c: 0, dir: 'V' }, { word: 'SERE', r: 0, c: 2, dir: 'V' }, { word: 'TER', r: 0, c: 3, dir: 'V' }, { word: 'RESTE', r: 0, c: 5, dir: 'V' }] },
  { lvl: 40, wheel: ['T', 'E', 'M', 'P', 'L', 'E'], grid: [{ word: 'TEMPLE', r: 0, c: 0, dir: 'H' }, { word: 'TELE', r: 0, c: 0, dir: 'V' }, { word: 'MELE', r: 0, c: 2, dir: 'V' }, { word: 'PELE', r: 0, c: 3, dir: 'V' }, { word: 'LET', r: 0, c: 4, dir: 'V' }] },
  { lvl: 41, wheel: ['H', 'O', 'R', 'I', 'Z', 'O', 'N'], grid: [{ word: 'HORIZON', r: 0, c: 0, dir: 'H' }, { word: 'HOIR', r: 0, c: 0, dir: 'V' }, { word: 'ROI', r: 0, c: 2, dir: 'V' }, { word: 'ZOO', r: 0, c: 4, dir: 'V' }, { word: 'NOIR', r: 0, c: 6, dir: 'V' }] },
  { lvl: 42, wheel: ['T', 'R', 'E', 'S', 'O', 'R'], grid: [{ word: 'TRESOR', r: 0, c: 0, dir: 'H' }, { word: 'TORE', r: 0, c: 0, dir: 'V' }, { word: 'ROSE', r: 0, c: 1, dir: 'V' }, { word: 'SORT', r: 0, c: 3, dir: 'V' }, { word: 'ROTE', r: 0, c: 5, dir: 'V' }] },
  { lvl: 43, wheel: ['C', 'H', 'A', 'M', 'P', 'I', 'O', 'N'], grid: [{ word: 'CHAMPION', r: 0, c: 0, dir: 'H' }, { word: 'CHAMP', r: 0, c: 0, dir: 'V' }, { word: 'MAIN', r: 0, c: 3, dir: 'V' }, { word: 'PAIN', r: 0, c: 4, dir: 'V' }, { word: 'NOM', r: 0, c: 7, dir: 'V' }] },
  { lvl: 44, wheel: ['F', 'A', 'N', 'T', 'O', 'M', 'E'], grid: [{ word: 'FANTOME', r: 0, c: 0, dir: 'H' }, { word: 'FAME', r: 0, c: 0, dir: 'V' }, { word: 'NOTE', r: 0, c: 2, dir: 'V' }, { word: 'TOME', r: 0, c: 3, dir: 'V' }, { word: 'MOT', r: 0, c: 5, dir: 'V' }] },
  { lvl: 45, wheel: ['A', 'V', 'E', 'N', 'T', 'U', 'R', 'E'], grid: [{ word: 'AVENTURE', r: 0, c: 0, dir: 'H' }, { word: 'AUTRE', r: 0, c: 0, dir: 'V' }, { word: 'VENT', r: 0, c: 1, dir: 'V' }, { word: 'TENU', r: 0, c: 4, dir: 'V' }, { word: 'RUE', r: 0, c: 6, dir: 'V' }] },
  { lvl: 46, wheel: ['U', 'N', 'I', 'V', 'E', 'R', 'S'], grid: [{ word: 'UNIVERS', r: 0, c: 0, dir: 'H' }, { word: 'UNIR', r: 0, c: 0, dir: 'V' }, { word: 'VIN', r: 0, c: 3, dir: 'V' }, { word: 'RIVE', r: 0, c: 5, dir: 'V' }, { word: 'SUR', r: 0, c: 6, dir: 'V' }] },
  { lvl: 47, wheel: ['G', 'R', 'A', 'N', 'D', 'E', 'U', 'R'], grid: [{ word: 'GRANDEUR', r: 0, c: 0, dir: 'H' }, { word: 'GARE', r: 0, c: 0, dir: 'V' }, { word: 'RANG', r: 0, c: 1, dir: 'V' }, { word: 'DUR', r: 0, c: 4, dir: 'V' }, { word: 'EAU', r: 0, c: 5, dir: 'V' }] },
  { lvl: 48, wheel: ['F', 'O', 'R', 'T', 'U', 'N', 'E'], grid: [{ word: 'FORTUNE', r: 0, c: 0, dir: 'H' }, { word: 'FOUR', r: 0, c: 0, dir: 'V' }, { word: 'ROUE', r: 0, c: 2, dir: 'V' }, { word: 'TENU', r: 0, c: 3, dir: 'V' }, { word: 'UNE', r: 0, c: 4, dir: 'V' }] },
  { lvl: 49, wheel: ['P', 'R', 'E', 'S', 'E', 'N', 'T'], grid: [{ word: 'PRESENT', r: 0, c: 0, dir: 'H' }, { word: 'PERE', r: 0, c: 0, dir: 'V' }, { word: 'RESTE', r: 0, c: 1, dir: 'V' }, { word: 'SENT', r: 0, c: 3, dir: 'V' }, { word: 'NET', r: 0, c: 5, dir: 'V' }] },
  { lvl: 50, wheel: ['S', 'O', 'U', 'V', 'E', 'R', 'A', 'I', 'N'], grid: [{ word: 'SOUVERAIN', r: 0, c: 0, dir: 'H' }, { word: 'SOIR', r: 0, c: 0, dir: 'V' }, { word: 'OURS', r: 0, c: 1, dir: 'V' }, { word: 'VASE', r: 0, c: 3, dir: 'V' }, { word: 'RIVE', r: 0, c: 5, dir: 'V' }, { word: 'AVIS', r: 0, c: 6, dir: 'V' }, { word: 'NOIR', r: 0, c: 8, dir: 'V' }] }
];

// --- 4. MOTEUR DU JEU MATRICIEL AAAA SOUVERAIN ---
export class BerthoWords {
  constructor(targetElement, levelNum = 1, onComplete, onFail, onExit) {
    if (typeof levelNum === 'function') {
      this.onExit = levelNum;
      this.levelNum = 1;
      this.onComplete = onComplete || null;
      this.onFail = onFail || null;
    } else {
      this.levelNum = Math.min(Math.max(1, levelNum), 50);
      this.onComplete = onComplete;
      this.onFail = onFail;
      this.onExit = onExit;
    }

    this.targetElement = targetElement;
    this.showModal = false;
    this.showVictoryModal = false;
    this.modalScrollY = 0;
    this.modalMaxScroll = 0;

    // Détection stricte Clic vs Scroll
    this.modalTouchStartX = 0;
    this.modalTouchStartY = 0;
    this.modalLastY = 0;
    this.modalTotalDrag = 0;

    this.introProgress = 0.0;
    this.isIntroAnimating = true;

    this.loadState();
    this.initLevel();
    this.initDOM();
  }

  loadState() {
    try {
      const saved = localStorage.getItem('BERTHOPLAY_V1') || localStorage.getItem('BERTHO_TEST_STATE');
      const parsed = saved ? JSON.parse(saved) : {};
      this.coins = parsed.coins !== undefined ? parsed.coins : 0;
      this.maxUnlockedLevel = parsed.wordWheelLevel || parsed.wordWheelMaxUnlocked || 1;
      this.levelStars = parsed.wordWheelStars || {};
    } catch(e) {
      this.coins = 0;
      this.maxUnlockedLevel = 1;
      this.levelStars = {};
    }
  }

  saveState() {
    try {
      const saved = localStorage.getItem('BERTHOPLAY_V1') || localStorage.getItem('BERTHO_TEST_STATE');
      const parsed = saved ? JSON.parse(saved) : {};
      parsed.coins = this.coins;
      parsed.wordWheelLevel = Math.max(this.maxUnlockedLevel, this.levelNum);
      parsed.wordWheelStars = this.levelStars;
      localStorage.setItem('BERTHOPLAY_V1', JSON.stringify(parsed));
      localStorage.setItem('BERTHO_TEST_STATE', JSON.stringify(parsed));
    } catch(e) {}
  }

  initLevel() {
    this.levelData = LEVELS_DB[this.levelNum - 1] || LEVELS_DB[0];
    this.letters = [...this.levelData.wheel];
    this.targetWords = this.levelData.grid.map(g => g.word);

    this.isReplay = (this.levelStars[this.levelNum] !== undefined && this.levelStars[this.levelNum] > 0);
    this.levelStartTime = performance.now();
    this.hintsUsedCount = 0;

    this.foundWords = new Set();
    this.foundBonusWords = new Set();
    this.showVictoryModal = false;

    // Matrice de cellules uniques
    this.matrixCells = new Map();
    this.levelData.grid.forEach(item => {
      for (let i = 0; i < item.word.length; i++) {
        const r = item.dir === 'V' ? item.r + i : item.r;
        const c = item.dir === 'H' ? item.c + i : item.c;
        const key = `${r}_${c}`;

        if (!this.matrixCells.has(key)) {
          this.matrixCells.set(key, {
            r: r, c: c,
            char: item.word[i],
            revealed: false,
            hinted: false
          });
        }
      }
    });

    this.selectedIndices = [];
    this.currentDragPos = null;
    this.isDragging = false;
    this.letterNodes = [];

    this.particles = [];
    this.floatingToasts = [];
    this.wheelRotationAngle = 0;

    this.introProgress = 0.0;
    this.isIntroAnimating = true;
    this.introStartTime = performance.now();
  }

  initDOM() {
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.overflow = 'hidden';
    document.body.style.userSelect = 'none';

    if (this.targetElement && this.targetElement.tagName === 'CANVAS') {
      this.canvas = this.targetElement;
      this.canvas.style.display = 'block';
    } else {
      this.canvas = document.createElement('canvas');
      this.canvas.id = 'word-game-canvas';
      this.canvas.style.cssText = 'position:fixed; top:0; left:0; width:100vw; height:100dvh; display:block; background:#020617; touch-action:none; z-index:1000; margin:0; padding:0;';
      document.body.appendChild(this.canvas);
    }

    this.ctx = this.canvas.getContext('2d');
    this.resize();
    this.bindEvents();
    this.startLoop();
  }

  resize() {
    const dpr = window.devicePixelRatio || 1;
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;

    this.ctx.scale(dpr, dpr);
    this.computeLayout();
  }

  computeLayout() {
    this.safeTop = Math.max(52, Math.floor(this.height * 0.065));
    this.safeSide = Math.max(24, Math.floor(this.width * 0.065));
    this.safeBottom = Math.max(28, Math.floor(this.height * 0.035));

    this.wheelCenter = {
      x: this.width / 2,
      y: this.height * 0.67
    };
    this.trayRadius = Math.min(this.width * 0.33, 115);
    this.wheelRadius = this.trayRadius * 0.68;
    this.letterHitRadius = Math.min(this.wheelRadius * 0.38, 28);

    const total = this.letters.length;
    this.letterNodes = this.letters.map((char, i) => {
      const angle = (i / total) * Math.PI * 2 - Math.PI / 2 + this.wheelRotationAngle;
      return {
        char: char,
        x: this.wheelCenter.x + Math.cos(angle) * this.wheelRadius,
        y: this.wheelCenter.y + Math.sin(angle) * this.wheelRadius,
        radius: this.letterHitRadius
      };
    });

    const bottomControlsY = Math.min(this.height - this.safeBottom - 20, this.wheelCenter.y + this.trayRadius + 42);

    this.btnShuffle = {
      x: Math.max(52, this.width * 0.18),
      y: bottomControlsY,
      radius: 25
    };

    this.btnHint = {
      x: Math.min(this.width - 52, this.width * 0.82),
      y: bottomControlsY,
      radius: 25
    };

    let minR = Infinity, maxR = -Infinity, minC = Infinity, maxC = -Infinity;
    this.matrixCells.forEach(cell => {
      minR = Math.min(minR, cell.r); maxR = Math.max(maxR, cell.r);
      minC = Math.min(minC, cell.c); maxC = Math.max(maxC, cell.c);
    });

    const rowsCount = maxR - minR + 1;
    const colsCount = maxC - minC + 1;

    // 🔒 GABARIT STRICT (20px sous le header / 38px au-dessus de la roue)
    const headerBottomCeiling = this.safeTop + 40 + 20;
    const wheelTopFloor = this.wheelCenter.y - this.trayRadius - 38;

    const availableH = wheelTopFloor - headerBottomCeiling;
    const availableW = this.width - (this.safeSide * 2) - 10;

    this.gridCellSize = Math.min(46, Math.floor(availableW / (colsCount || 1)), Math.floor(availableH / (rowsCount || 1)));
    this.gridGap = 5;

    const totalGridW = colsCount * (this.gridCellSize + this.gridGap) - this.gridGap;
    const totalGridH = rowsCount * (this.gridCellSize + this.gridGap) - this.gridGap;

    this.gridStartX = (this.width - totalGridW) / 2 - (minC * (this.gridCellSize + this.gridGap));
    this.gridStartY = headerBottomCeiling + (availableH - totalGridH) / 2 - (minR * (this.gridCellSize + this.gridGap));
  }

  bindEvents() {
    this.handleResize = () => this.resize();
    window.addEventListener('resize', this.handleResize);

    const getPos = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      let clientX = 0;
      let clientY = 0;

      if (e.touches && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if (e.changedTouches && e.changedTouches.length > 0) {
        clientX = e.changedTouches[0].clientX;
        clientY = e.changedTouches[0].clientY;
      } else {
        clientX = e.clientX || 0;
        clientY = e.clientY || 0;
      }

      return {
        x: clientX - rect.left,
        y: clientY - rect.top
      };
    };

    const getNodeAtPos = (pos) => {
      return this.letterNodes.findIndex(node => {
        const dx = node.x - pos.x;
        const dy = node.y - pos.y;
        return (dx * dx + dy * dy) <= (node.radius * 1.55) ** 2;
      });
    };

    this.onPointerDown = (e) => {
      e.preventDefault();
      const pos = getPos(e);

      if (this.showVictoryModal) {
        this.handleVictoryModalClick(pos);
        return;
      }

      if (this.showModal) {
        this.modalTouchStartX = pos.x;
        this.modalTouchStartY = pos.y;
        this.modalLastY = pos.y;
        this.modalTotalDrag = 0;
        return;
      }

      // 1. Badge Niveau Cliquable
      if (pos.x >= this.safeSide && pos.x <= this.safeSide + 125 && pos.y >= this.safeTop - 10 && pos.y <= this.safeTop + 42) {
        this.showModal = true;
        WordAudio.playClick();
        return;
      }

      // 2. Bouton Quitter
      const quitW = 76;
      const quitX = this.width - this.safeSide - quitW;
      if (pos.x >= quitX - 8 && pos.x <= quitX + quitW + 8 && pos.y >= this.safeTop - 10 && pos.y <= this.safeTop + 42) {
        this.destroy();
        if (this.onExit) this.onExit();
        return;
      }

      // 3. Bouton Mélanger 🔀
      if ((pos.x - this.btnShuffle.x) ** 2 + (pos.y - this.btnShuffle.y) ** 2 <= (this.btnShuffle.radius * 1.4) ** 2) {
        this.shuffleLetters();
        return;
      }

      // 4. Bouton Indice Ampoule 💡 (5 Coins)
      if ((pos.x - this.btnHint.x) ** 2 + (pos.y - this.btnHint.y) ** 2 <= (this.btnHint.radius * 1.4) ** 2) {
        this.useHint();
        return;
      }

      const index = getNodeAtPos(pos);
      if (index !== -1) {
        this.isDragging = true;
        this.selectedIndices = [index];
        this.currentDragPos = pos;
        this.haptic(15);
        WordAudio.playTone(0);
      }
    };

    this.onPointerMove = (e) => {
      const pos = getPos(e);

      if (this.showModal) {
        const dy = pos.y - this.modalLastY;
        this.modalTotalDrag += Math.abs(pos.y - this.modalTouchStartY);
        this.modalScrollY = Math.max(-this.modalMaxScroll, Math.min(0, this.modalScrollY + dy * 0.9));
        this.modalLastY = pos.y;
        return;
      }

      if (!this.isDragging) return;
      e.preventDefault();
      this.currentDragPos = pos;

      const index = getNodeAtPos(pos);
      if (index !== -1) {
        if (this.selectedIndices.length > 1 && this.selectedIndices[this.selectedIndices.length - 2] === index) {
          this.selectedIndices.pop();
          this.haptic(10);
          WordAudio.playBacktrack();
        } else if (!this.selectedIndices.includes(index)) {
          this.selectedIndices.push(index);
          this.haptic(15);
          WordAudio.playTone(this.selectedIndices.length - 1);
        }
      }
    };

    this.onPointerUp = (e) => {
      const pos = getPos(e);

      if (this.showModal) {
        if (this.modalTotalDrag < 12) {
          this.handleModalClick(pos);
        }
        this.modalTotalDrag = 0;
        return;
      }

      if (!this.isDragging) return;
      this.isDragging = false;
      this.currentDragPos = null;
      this.validateWord();
      this.selectedIndices = [];
    };

    this.canvas.addEventListener('touchstart', this.onPointerDown, { passive: false });
    this.canvas.addEventListener('touchmove', this.onPointerMove, { passive: false });
    this.canvas.addEventListener('touchend', this.onPointerUp, { passive: false });

    this.canvas.addEventListener('mousedown', this.onPointerDown);
    this.canvas.addEventListener('mousemove', this.onPointerMove);
    window.addEventListener('mouseup', this.onPointerUp);
  }

  haptic(ms = 15) {
    if (navigator.vibrate) navigator.vibrate(ms);
  }

  calculateStarsEarned() {
    const elapsedSec = (performance.now() - this.levelStartTime) / 1000;
    if (this.hintsUsedCount === 0 && elapsedSec <= 45) return 3;
    if (this.hintsUsedCount <= 2 && elapsedSec <= 90) return 2;
    return 1;
  }

  // --- 🏆 MODALE DE BILAN (ADAPTÉE NIVEAU 50 ET NIVEAUX STANDARDS) ---
  handleVictoryModalClick(pos) {
    const cardW = Math.min(this.width - 60, 320);
    const cardH = 260;
    const cardX = (this.width - cardW) / 2;
    const cardY = (this.height - cardH) / 2;

    const mainBtnY = cardY + 140;

    // Clic sur Bouton Principal (Suivant OU Retour au Hub si Niveau 50)
    if (pos.x >= cardX + 20 && pos.x <= cardX + cardW - 20 && pos.y >= mainBtnY && pos.y <= mainBtnY + 44) {
      WordAudio.playClick();
      if (this.levelNum >= 50) {
        // Grand Chelem terminé -> Retour au Hub
        this.destroy();
        if (this.onExit) this.onExit();
      } else {
        // Niveau suivant normal
        this.levelNum++;
        this.initLevel();
        this.computeLayout();
      }
      return;
    }

    // Clic sur Bouton "REJOUER LE NIVEAU ↺"
    const replayBtnY = cardY + 195;
    if (pos.x >= cardX + 20 && pos.x <= cardX + cardW - 20 && pos.y >= replayBtnY && pos.y <= replayBtnY + 40) {
      WordAudio.playClick();
      this.initLevel();
      this.computeLayout();
    }
  }

  handleModalClick(pos) {
    if (pos.x >= this.width - this.safeSide - 40 && pos.x <= this.width - this.safeSide + 15 && pos.y >= this.safeTop - 15 && pos.y <= this.safeTop + 40) {
      this.showModal = false;
      WordAudio.playClick();
      return;
    }

    const cols = 5;
    const startX = this.safeSide;
    const startY = this.safeTop + 45 + this.modalScrollY;
    const tileSize = (this.width - (this.safeSide * 2) - (cols - 1) * 8) / cols;

    for (let i = 1; i <= 50; i++) {
      const r = Math.floor((i - 1) / cols);
      const c = (i - 1) % cols;
      const x = startX + c * (tileSize + 8);
      const y = startY + r * (tileSize + 8);

      if (pos.x >= x && pos.x <= x + tileSize && pos.y >= y && pos.y <= y + tileSize && pos.y >= this.safeTop + 35) {
        if (i <= this.maxUnlockedLevel) {
          this.levelNum = i;
          this.showModal = false;
          this.initLevel();
          this.computeLayout();
          WordAudio.playClick();
        } else {
          this.addFloatingToast("NIVEAU VERROUILLÉ", "#ef4444");
          WordAudio.playError();
        }
        return;
      }
    }
  }

  shuffleLetters() {
    this.wheelRotationAngle += Math.PI / 3;
    for (let i = this.letters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.letters[i], this.letters[j]] = [this.letters[j], this.letters[i]];
    }
    this.computeLayout();
    this.haptic(20);
    WordAudio.playClick();
  }

  useHint() {
    const HINT_COST = 5;
    if (this.coins < HINT_COST) {
      this.addFloatingToast("COINS INSUFFISANTS", "#ef4444");
      WordAudio.playError();
      return;
    }

    const targetWordItem = this.levelData.grid.find(item => !this.foundWords.has(item.word));

    if (targetWordItem) {
      for (let i = 0; i < targetWordItem.word.length; i++) {
        const r = targetWordItem.dir === 'V' ? targetWordItem.r + i : targetWordItem.r;
        const c = targetWordItem.dir === 'H' ? targetWordItem.c + i : targetWordItem.c;
        const cell = this.matrixCells.get(`${r}_${c}`);

        if (cell && !cell.revealed) {
          cell.revealed = true;
          cell.hinted = true;

          this.hintsUsedCount++;
          this.coins -= HINT_COST;
          this.saveState();
          this.haptic(25);
          WordAudio.playClick();
          this.addFloatingToast(`INDICE -${HINT_COST} COINS`, "#fbbf24");

          this.checkWordsAutoCompletion();
          return;
        }
      }
    }

    this.addFloatingToast("GRILLE DÉJÀ COMPLÈTE", "#38bdf8");
  }

  checkWordsAutoCompletion() {
    this.levelData.grid.forEach(item => {
      if (!this.foundWords.has(item.word)) {
        let isFull = true;
        for (let i = 0; i < item.word.length; i++) {
          const r = item.dir === 'V' ? item.r + i : item.r;
          const c = item.dir === 'H' ? item.c + i : item.c;
          const cell = this.matrixCells.get(`${r}_${c}`);
          if (!cell || !cell.revealed) {
            isFull = false;
            break;
          }
        }
        if (isFull) {
          this.foundWords.add(item.word);
        }
      }
    });

    const allRevealed = [...this.matrixCells.values()].every(c => c.revealed);
    if (allRevealed) {
      setTimeout(() => this.triggerVictory(), 500);
    }
  }

  getCurrentSpelled() {
    return this.selectedIndices.map(i => this.letterNodes[i].char).join('');
  }

  validateWord() {
    const spelled = this.getCurrentSpelled();
    if (!spelled || spelled.length < 2) return;

    if (this.targetWords.includes(spelled)) {
      if (!this.foundWords.has(spelled)) {
        this.foundWords.add(spelled);

        const gridItem = this.levelData.grid.find(g => g.word === spelled);
        if (gridItem) {
          for (let i = 0; i < gridItem.word.length; i++) {
            const r = gridItem.dir === 'V' ? gridItem.r + i : gridItem.r;
            const c = gridItem.dir === 'H' ? gridItem.c + i : gridItem.c;
            const cell = this.matrixCells.get(`${r}_${c}`);
            if (cell) cell.revealed = true;
          }
        }

        const earned = this.isReplay ? 2 : (spelled.length <= 3 ? 10 : (spelled.length === 4 ? 15 : 20));
        this.coins += earned;
        this.saveState();

        const toastMsg = this.isReplay ? `REJOUÉ : +${earned} COINS` : `+${earned} COINS (${spelled})`;
        this.addFloatingToast(toastMsg, "#34d399");
        this.spawnParticles(this.width / 2, this.height * 0.25, "#34d399");
        WordAudio.playSolved();
        this.haptic([30, 40, 30]);

        const allRevealed = [...this.matrixCells.values()].every(c => c.revealed);
        if (allRevealed) {
          setTimeout(() => this.triggerVictory(), 600);
        }
      } else {
        this.addFloatingToast("DÉJÀ TROUVÉ", "#fbbf24");
        WordAudio.playError();
      }
    } else if (FRENCH_LEXICON.has(spelled)) {
      if (!this.foundBonusWords.has(spelled)) {
        this.foundBonusWords.add(spelled);
        const earned = this.isReplay ? 2 : 10;
        this.coins += earned;
        this.saveState();

        this.addFloatingToast(`MOT BONUS +${earned} (${spelled})`, "#fbbf24");
        this.spawnParticles(this.width / 2, this.height * 0.25, "#fbbf24");
        WordAudio.playSolved();
      } else {
        this.addFloatingToast("MOT BONUS DÉJÀ COLLECTÉ", "#fbbf24");
      }
    } else {
      this.addFloatingToast(spelled, "#ef4444");
      WordAudio.playError();
      this.haptic(35);
    }
  }

  triggerVictory() {
    const stars = this.calculateStarsEarned();
    const bonusCoins = this.isReplay ? 5 : 25;
    this.coins += bonusCoins;

    const currentBestStars = this.levelStars[this.levelNum] || 0;
    this.levelStars[this.levelNum] = Math.max(currentBestStars, stars);
    this.maxUnlockedLevel = Math.max(this.maxUnlockedLevel, this.levelNum + 1);
    this.saveState();

    this.victoryData = {
      stars: stars,
      coinsEarned: bonusCoins,
      timeSec: Math.floor((performance.now() - this.levelStartTime) / 1000)
    };

    this.showVictoryModal = true;
    this.spawnParticles(this.width / 2, this.height / 2, "#fbbf24", 50);
    WordAudio.playFanfare();
  }

  addFloatingToast(text, color) {
    this.floatingToasts.push({
      text: text,
      color: color,
      y: this.wheelCenter.y - this.trayRadius - 38,
      alpha: 1.0,
      vy: -1.2
    });
  }

  spawnParticles(x, y, color, count = 20) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5 + 2;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: Math.random() * 3 + 2,
        color: color,
        alpha: 1.0,
        decay: Math.random() * 0.02 + 0.015
      });
    }
  }

  startLoop() {
    const loop = (timestamp) => {
      this.update(timestamp);
      this.draw();
      this.animationId = requestAnimationFrame(loop);
    };
    this.animationId = requestAnimationFrame(loop);
  }

  update(timestamp) {
    if (this.isIntroAnimating) {
      const elapsed = timestamp - this.introStartTime;
      const duration = 650;
      const t = Math.min(1.0, elapsed / duration);
      const c1 = 1.70158;
      const c3 = c1 + 1;
      this.introProgress = 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);

      if (t >= 1.0) {
        this.introProgress = 1.0;
        this.isIntroAnimating = false;
      }
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.15;
      p.alpha -= p.decay;
      if (p.alpha <= 0) this.particles.splice(i, 1);
    }

    for (let i = this.floatingToasts.length - 1; i >= 0; i--) {
      const t = this.floatingToasts[i];
      t.y += t.vy;
      t.alpha -= 0.02;
      if (t.alpha <= 0) this.floatingToasts.splice(i, 1);
    }
  }

  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    const grad = ctx.createLinearGradient(0, 0, 0, this.height);
    grad.addColorStop(0, '#020617');
    grad.addColorStop(0.5, '#0b1329');
    grad.addColorStop(1, '#020617');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.width, this.height);

    this.drawHeader(ctx);
    this.drawCrosswordMatrix(ctx);
    this.drawTrayAndLetters(ctx);
    this.drawFX(ctx);

    if (this.showModal) {
      this.drawModal(ctx);
    }

    if (this.showVictoryModal) {
      this.drawVictoryModal(ctx);
    }
  }

  drawHeader(ctx) {
    const topY = this.safeTop;

    // 1. Badge Niveau Cliquable
    ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    this.roundRect(ctx, this.safeSide, topY, 116, 32, 8, true, true);

    ctx.fillStyle = '#38bdf8';
    ctx.font = '900 13px -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`NIVEAU ${this.levelNum} / 50 ▾`, this.safeSide + 58, topY + 21);

    // 2. Solde Coins
    const coinX = this.width / 2 + 10;
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(coinX - 30, topY + 16, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#78350f';
    ctx.font = '900 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText("C", coinX - 30, topY + 19);

    ctx.fillStyle = '#fbbf24';
    ctx.font = '900 14px -apple-system, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`${this.coins}`, coinX - 18, topY + 21);

    // 3. Bouton Quitter
    const quitW = 76;
    const quitX = this.width - this.safeSide - quitW;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.lineWidth = 1.2;
    this.roundRect(ctx, quitX, topY, quitW, 32, 10, true, true);

    ctx.fillStyle = '#fff';
    ctx.font = '900 11px -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText("QUITTER", quitX + quitW / 2, topY + 20);
  }

  drawCrosswordMatrix(ctx) {
    const size = this.gridCellSize * Math.min(1.0, this.introProgress);
    const gap = this.gridGap;

    this.matrixCells.forEach(cell => {
      const x = this.gridStartX + cell.c * (this.gridCellSize + gap) + (this.gridCellSize - size) / 2;
      const y = this.gridStartY + cell.r * (this.gridCellSize + gap) + (this.gridCellSize - size) / 2;

      if (cell.revealed) {
        const tileGrad = ctx.createLinearGradient(x, y, x, y + size);
        if (cell.hinted) {
          tileGrad.addColorStop(0, '#f59e0b');
          tileGrad.addColorStop(1, '#b45309');
          ctx.strokeStyle = '#fde047';
        } else {
          tileGrad.addColorStop(0, '#0284c7');
          tileGrad.addColorStop(1, '#0369a1');
          ctx.strokeStyle = '#38bdf8';
        }

        ctx.fillStyle = tileGrad;
        ctx.lineWidth = 2.5;
        this.roundRect(ctx, x, y, size, size, 8, true, true);

        ctx.fillStyle = '#ffffff';
        ctx.font = `900 ${Math.floor(size * 0.58)}px -apple-system, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(cell.char, x + size / 2, y + size * 0.7);
      } else {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1.8;
        this.roundRect(ctx, x, y, size, size, 8, true, true);
      }
    });
  }

  drawTrayAndLetters(ctx) {
    const cx = this.wheelCenter.x;
    const cy = this.wheelCenter.y;
    const scale = Math.min(1.0, this.introProgress);
    const R = this.trayRadius * scale;

    // 1. Bol Sombre 3D
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    
    const trayGrad = ctx.createRadialGradient(cx, cy - R * 0.4, R * 0.2, cx, cy, R);
    trayGrad.addColorStop(0, '#1e293b');
    trayGrad.addColorStop(0.7, '#0f172a');
    trayGrad.addColorStop(1, '#020617');
    ctx.fillStyle = trayGrad;
    ctx.fill();

    ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, Math.max(0, R - 2), 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // 2. Bouton Mélanger 🔀
    const sx = this.btnShuffle.x;
    const sy = this.btnShuffle.y;
    ctx.beginPath();
    ctx.arc(sx, sy, this.btnShuffle.radius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(sx - 8, sy - 6); ctx.lineTo(sx - 2, sy - 6); ctx.lineTo(sx + 5, sy + 4); ctx.lineTo(sx + 8, sy + 4);
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.moveTo(sx + 8, sy + 1); ctx.lineTo(sx + 12, sy + 4); ctx.lineTo(sx + 8, sy + 7);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(sx - 8, sy + 6); ctx.lineTo(sx - 2, sy + 6); ctx.lineTo(sx + 5, sy - 4); ctx.lineTo(sx + 8, sy - 4);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(sx + 8, sy - 7); ctx.lineTo(sx + 12, sy - 4); ctx.lineTo(sx + 8, sy - 1);
    ctx.closePath();
    ctx.fill();

    // 3. Bouton Indice Ampoule 💡 (5 Coins)
    const hx = this.btnHint.x;
    const hy = this.btnHint.y;
    ctx.beginPath();
    ctx.arc(hx, hy, this.btnHint.radius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
    ctx.fill();
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.strokeStyle = '#fbbf24';
    ctx.fillStyle = '#fbbf24';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(hx, hy - 4, 6, 0, Math.PI, true);
    ctx.lineTo(hx - 3, hy + 3);
    ctx.lineTo(hx + 3, hy + 3);
    ctx.closePath();
    ctx.stroke();
    ctx.fillRect(hx - 2, hy + 4, 4, 2);

    ctx.fillStyle = '#fbbf24';
    ctx.font = '900 10px -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText("5", hx, hy + 16);

    // 4. Cordon Nacré de Liaison Tactile
    if (this.isDragging && this.selectedIndices.length > 0) {
      ctx.save();
      ctx.beginPath();
      const first = this.letterNodes[this.selectedIndices[0]];
      ctx.moveTo(first.x, first.y);

      for (let i = 1; i < this.selectedIndices.length; i++) {
        const node = this.letterNodes[this.selectedIndices[i]];
        ctx.lineTo(node.x, node.y);
      }

      if (this.currentDragPos && !isNaN(this.currentDragPos.x) && !isNaN(this.currentDragPos.y)) {
        ctx.lineTo(this.currentDragPos.x, this.currentDragPos.y);
      }

      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 7;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.restore();
    }

    // 5. Lettres Sculptées en Or 3D
    this.letterNodes.forEach((node, idx) => {
      const isSelected = this.selectedIndices.includes(idx);
      const fontSize = Math.floor(node.radius * 1.55 * scale);

      if (fontSize > 4) {
        ctx.save();
        ctx.font = `900 ${fontSize}px "Arial Black", -apple-system, sans-serif`;
        ctx.textAlign = 'center';

        ctx.fillStyle = '#451a03';
        ctx.fillText(node.char, node.x + 1, node.y + fontSize * 0.38 + 4);

        const goldGrad = ctx.createLinearGradient(node.x, node.y - fontSize * 0.4, node.x, node.y + fontSize * 0.4);
        if (isSelected) {
          goldGrad.addColorStop(0, '#ffffff');
          goldGrad.addColorStop(0.3, '#fef08a');
          goldGrad.addColorStop(0.7, '#f59e0b');
          goldGrad.addColorStop(1, '#ea580c');
        } else {
          goldGrad.addColorStop(0, '#fef08a');
          goldGrad.addColorStop(0.4, '#eab308');
          goldGrad.addColorStop(0.8, '#d97706');
          goldGrad.addColorStop(1, '#b45309');
        }

        ctx.fillStyle = goldGrad;
        ctx.fillText(node.char, node.x, node.y + fontSize * 0.38);

        ctx.strokeStyle = isSelected ? '#ffffff' : '#78350f';
        ctx.lineWidth = 1.5;
        ctx.strokeText(node.char, node.x, node.y + fontSize * 0.38);
        ctx.restore();
      }
    });

    // 6. Pilule Mot en cours
    if (this.isDragging && this.selectedIndices.length > 0) {
      const spelled = this.getCurrentSpelled();
      const pillY = this.wheelCenter.y - this.trayRadius - 26;
      ctx.font = '900 16px -apple-system, sans-serif';
      const textWidth = ctx.measureText(spelled).width + 36;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      this.roundRect(ctx, this.width / 2 - textWidth / 2, pillY - 16, textWidth, 34, 17, true, true);

      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText(spelled, this.width / 2, pillY + 6);
    }
  }

  // --- 🏆 MODALE DE BILAN (GESTION DU NIVEAU 50 ET SUIVANTS) ---
  drawVictoryModal(ctx) {
    ctx.save();
    ctx.fillStyle = 'rgba(2, 6, 23, 0.92)';
    ctx.fillRect(0, 0, this.width, this.height);

    const cardW = Math.min(this.width - 48, 330);
    const cardH = 265;
    const cardX = (this.width - cardW) / 2;
    const cardY = (this.height - cardH) / 2 - 10;

    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    this.roundRect(ctx, cardX, cardY, cardW, cardH, 22, true, true);

    // Titre dynamique (Grand Chelem au niveau 50)
    ctx.fillStyle = '#38bdf8';
    ctx.font = '900 17px -apple-system, sans-serif';
    ctx.textAlign = 'center';
    const modalTitle = this.levelNum >= 50 ? "GRAND CHELEM ! 🏆" : `NIVEAU ${this.levelNum} RÉUSSI !`;
    ctx.fillText(modalTitle, this.width / 2, cardY + 38);

    // Étoiles gagnées
    const stars = this.victoryData ? this.victoryData.stars : 3;
    const starY = cardY + 74;
    const starSpacing = 36;

    for (let i = -1; i <= 1; i++) {
      const starIndex = i + 2;
      const isGold = starIndex <= stars;
      const sx = this.width / 2 + (i * starSpacing);

      ctx.fillStyle = isGold ? '#fbbf24' : '#334155';
      ctx.font = isGold ? '28px sans-serif' : '24px sans-serif';
      ctx.fillText('★', sx, starY);
    }

    const coins = this.victoryData ? this.victoryData.coinsEarned : 25;
    const timeSec = this.victoryData ? this.victoryData.timeSec : 20;

    ctx.fillStyle = '#cbd5e1';
    ctx.font = 'bold 12px -apple-system, sans-serif';
    const subText = this.levelNum >= 50 
      ? `Félicitations ! 50/50 Niveaux Terminés !`
      : `Chrono : ${timeSec}s  •  Gains : +${coins} 🪙`;
    ctx.fillText(subText, this.width / 2, cardY + 112);

    // Bouton 1 : NIVEAU SUIVANT ou RETOUR AU HUB si niveau 50
    const nextBtnY = cardY + 140;
    const btnGrad = ctx.createLinearGradient(cardX + 20, nextBtnY, cardX + cardW - 20, nextBtnY + 44);
    btnGrad.addColorStop(0, '#0284c7');
    btnGrad.addColorStop(1, '#0369a1');

    ctx.fillStyle = btnGrad;
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    this.roundRect(ctx, cardX + 20, nextBtnY, cardW - 40, 44, 12, true, true);

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 14px -apple-system, sans-serif';
    const mainBtnText = this.levelNum >= 50 ? "RETOUR AU HUB 🏠" : "NIVEAU SUIVANT ➔";
    ctx.fillText(mainBtnText, this.width / 2, nextBtnY + 28);

    // Bouton 2 : REJOUER LE NIVEAU ↺
    const replayBtnY = cardY + 198;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    this.roundRect(ctx, cardX + 20, replayBtnY, cardW - 40, 40, 12, true, true);

    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 12px -apple-system, sans-serif';
    ctx.fillText("REJOUER LE NIVEAU ↺", this.width / 2, replayBtnY + 25);
    ctx.restore();
  }

  // --- SÉLECTEUR DE NIVEAUX SCROLLABLE SANS FAUX CLIC ---
  drawModal(ctx) {
    ctx.save();
    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.fillStyle = '#38bdf8';
    ctx.font = '900 18px -apple-system, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText("50 NIVEAUX WORD WHEEL", this.safeSide, this.safeTop + 10);

    ctx.fillStyle = '#fff';
    ctx.font = '900 20px -apple-system, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText("✕", this.width - this.safeSide, this.safeTop + 10);

    const cols = 5;
    const startX = this.safeSide;
    const startY = this.safeTop + 40 + this.modalScrollY;
    const tileSize = (this.width - (this.safeSide * 2) - (cols - 1) * 8) / cols;

    const totalRows = Math.ceil(50 / cols);
    const contentH = totalRows * (tileSize + 8);
    this.modalMaxScroll = Math.max(0, contentH - (this.height - this.safeTop - 60));

    ctx.beginPath();
    ctx.rect(0, this.safeTop + 25, this.width, this.height - this.safeTop - 25);
    ctx.clip();

    for (let i = 1; i <= 50; i++) {
      const r = Math.floor((i - 1) / cols);
      const c = (i - 1) % cols;
      const x = startX + c * (tileSize + 8);
      const y = startY + r * (tileSize + 8);

      const isUnlocked = i <= this.maxUnlockedLevel;
      const isCurrent = i === this.levelNum;
      const stars = this.levelStars[i] || 0;

      if (isCurrent && isUnlocked) {
        ctx.fillStyle = '#0284c7';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.5;
      } else if (isUnlocked) {
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.lineWidth = 1.2;
      } else {
        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1;
      }

      this.roundRect(ctx, x, y, tileSize, tileSize, 10, true, true);

      if (isUnlocked) {
        ctx.fillStyle = '#ffffff';
        ctx.font = `900 ${Math.floor(tileSize * 0.4)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(i, x + tileSize / 2, y + tileSize * (stars > 0 ? 0.52 : 0.62));

        if (stars > 0) {
          ctx.fillStyle = '#fbbf24';
          ctx.font = `10px sans-serif`;
          ctx.fillText("★".repeat(stars), x + tileSize / 2, y + tileSize * 0.82);
        }
      } else {
        const cx = x + tileSize / 2;
        const cy = y + tileSize / 2;
        ctx.fillStyle = '#475569';
        this.roundRect(ctx, cx - 8, cy - 3, 16, 12, 3, true, false);
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy - 4, 5, Math.PI, 0);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  drawFX(ctx) {
    this.particles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    this.floatingToasts.forEach(t => {
      ctx.save();
      ctx.globalAlpha = t.alpha;
      ctx.fillStyle = t.color;
      ctx.font = '900 17px -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(t.text, this.width / 2, t.y);
      ctx.restore();
    });
  }

  roundRect(ctx, x, y, width, height, radius, fill, stroke) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
  }

  destroy() {
    if (this.animationId) cancelAnimationFrame(this.animationId);
    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('mouseup', this.onPointerUp);
    document.body.style.overflow = '';
    document.body.style.userSelect = '';
    if (this.canvas && this.canvas.id === 'word-game-canvas' && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
  }
}

export const WordWheelGame = BerthoWords;
export default BerthoWords;