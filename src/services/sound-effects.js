// ============================================================================
// 🎮 BERTHOPLAY — MOTEUR SYNTÉTISER AUDIO WEB AUDIO API (SOUVERAIN & PUR JS)
// ============================================================================

export class BerthoSoundEffects {
  static ctx = null;
  static ringtoneInterval = null;
  
  static initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }
  
  static isSoundEnabled() {
    try {
      const data = localStorage.getItem('BERTHOPLAY_V1');
      if (!data) return true;
      const parsed = JSON.parse(data);
      return parsed.soundEnabled !== false;
    } catch (e) {
      return true;
    }
  }
  
  // 🔔 SONNERIE DISCRÈTE DE NOTIFICATION & NOUVEAU MESSAGE TCHAT
  static playNotificationChime() {
    if (!this.isSoundEnabled()) return;
    this.initContext();
    if (!this.ctx) return;
    
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // Note D5
      osc.frequency.setValueAtTime(880.00, now + 0.12); // Note A5
      
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start(now);
      osc.stop(now + 0.4);
    } catch (e) {}
  }
  
  // 📞 SONNERIE D'APPEL WEBRTC ENTRANT
  static playRingtone() {
    if (!this.isSoundEnabled()) return;
    this.stopRingtone();
    this.initContext();
    if (!this.ctx) return;
    
    const playPulse = () => {
      try {
        const now = this.ctx.currentTime;
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc1.type = 'sine';
        osc2.type = 'triangle';
        
        osc1.frequency.setValueAtTime(440, now); // A4
        osc2.frequency.setValueAtTime(480, now);
        
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
        
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 1.2);
        osc2.stop(now + 1.2);
      } catch (e) {}
    };
    
    playPulse();
    this.ringtoneInterval = setInterval(playPulse, 2500);
  }
  
  static stopRingtone() {
    if (this.ringtoneInterval) {
      clearInterval(this.ringtoneInterval);
      this.ringtoneInterval = null;
    }
  }
  
  // 🏆 FANFARE DE VICTOIRE (JEUX & CLAN)
  static playGameVictory() {
    if (!this.isSoundEnabled()) return;
    this.initContext();
    if (!this.ctx) return;
    
    try {
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.1);
        
        gain.gain.setValueAtTime(0.2, now + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.3);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start(now + idx * 0.1);
        osc.stop(now + idx * 0.1 + 0.3);
      });
    } catch (e) {}
  }
  
  // 🪙 BRUITAGE DE GAIN DE BERTHOCOINS
  static playCoinEarned() {
    if (!this.isSoundEnabled()) return;
    this.initContext();
    if (!this.ctx) return;
    
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(987.77, now); // B5
      osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6
      
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start(now);
      osc.stop(now + 0.3);
    } catch (e) {}
  }
  
  // 🖱️ CLIC DISCRET DE BOUTON HAUT DE GAMME
  static playButtonClick() {
    if (!this.isSoundEnabled()) return;
    this.initContext();
    if (!this.ctx) return;
    
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(100, now + 0.05);
      
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start(now);
      osc.stop(now + 0.05);
    } catch (e) {}
  }
  
  // 🚫 BRUITAGE D'ERREUR OU ACCÈS REFUSÉ
  static playErrorSound() {
    if (!this.isSoundEnabled()) return;
    this.initContext();
    if (!this.ctx) return;
    
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.setValueAtTime(110, now + 0.15);
      
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start(now);
      osc.stop(now + 0.35);
    } catch (e) {}
  }
}