const DEFAULT_STATE = {
  carLevel: 1,
  carLevelUnlocked: 1,
  bikeLevel: 1,
  bikeLevelUnlocked: 1,
  checkersWins: 0,
  chessWins: 0,
  hordeScore: 0,
  hordeHighScore: 0,
  rules: 'french',
  settings: {
    soundEnabled: true,
    checkersRules: 'french',
    chessShowDanger: true,
  },
};

export class GameStateManager {
  static STORAGE_KEY = 'BERTHOPLAY_V1';
  static LEGACY_KEY = 'APEX_PWA_DATA_V1';

  static load() {
    try {
      let data = localStorage.getItem(this.STORAGE_KEY);
      if (!data) {
        data = localStorage.getItem(this.LEGACY_KEY);
      }
      const parsed = data ? JSON.parse(data) : {};

      const carLvl = parsed.carLevel ?? parsed.carLevelUnlocked ?? DEFAULT_STATE.carLevel;
      const bikeLvl = parsed.bikeLevel ?? parsed.bikeLevelUnlocked ?? DEFAULT_STATE.bikeLevel;
      const hordeSc = parsed.hordeScore ?? parsed.hordeHighScore ?? DEFAULT_STATE.hordeScore;

      return {
        ...DEFAULT_STATE,
        ...parsed,
        carLevel: carLvl,
        carLevelUnlocked: carLvl,
        bikeLevel: bikeLvl,
        bikeLevelUnlocked: bikeLvl,
        hordeScore: hordeSc,
        hordeHighScore: hordeSc,
      };
    } catch {
      return DEFAULT_STATE;
    }
  }

  static save(state) {
    const current = this.load();

    if (state.carLevel !== undefined && state.carLevelUnlocked === undefined) {
      state.carLevelUnlocked = state.carLevel;
    } else if (state.carLevelUnlocked !== undefined && state.carLevel === undefined) {
      state.carLevel = state.carLevelUnlocked;
    }

    if (state.bikeLevel !== undefined && state.bikeLevelUnlocked === undefined) {
      state.bikeLevelUnlocked = state.bikeLevel;
    } else if (state.bikeLevelUnlocked !== undefined && state.bikeLevel === undefined) {
      state.bikeLevel = state.bikeLevelUnlocked;
    }

    if (state.hordeScore !== undefined && state.hordeHighScore === undefined) {
      state.hordeHighScore = state.hordeScore;
    } else if (state.hordeHighScore !== undefined && state.hordeScore === undefined) {
      state.hordeScore = state.hordeHighScore;
    }

    const updated = { ...current, ...state };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
  }

  static unlockCarLevel(levelCompleted) {
    const current = this.load();
    const currentLvl = Math.max(current.carLevel, current.carLevelUnlocked);
    if (levelCompleted >= currentLvl) {
      const next = levelCompleted + 1;
      this.save({ carLevel: next, carLevelUnlocked: next });
    }
  }

  static unlockBikeLevel(levelCompleted) {
    const current = this.load();
    const currentLvl = Math.max(current.bikeLevel, current.bikeLevelUnlocked);
    if (levelCompleted >= currentLvl) {
      const next = levelCompleted + 1;
      this.save({ bikeLevel: next, bikeLevelUnlocked: next });
    }
  }

  static updateHordeHighScore(score) {
    const current = this.load();
    const currentBest = Math.max(current.hordeScore, current.hordeHighScore);
    if (score > currentBest) {
      this.save({ hordeScore: score, hordeHighScore: score });
    }
  }
}
