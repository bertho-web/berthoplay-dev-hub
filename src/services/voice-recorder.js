// ============================================================================
// 🎮 BERTHOPLAY — ENREGISTREUR VOCAL & LECTEUR AUDIO STYLE WAVEFORM
// ============================================================================

export class BerthoVoiceRecorder {
  constructor(onTimeUpdate, onFinish) {
    this.onTimeUpdate = onTimeUpdate;
    this.onFinish = onFinish;
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.recordingTimer = null;
    this.durationSeconds = 0;
    this.stream = null;
    this.isRecording = false;
  }
  
  static async requestMicPermission() {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        return { success: false, error: "Microphone non supporté sur ce navigateur." };
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      return { success: true, stream: stream };
    } catch (err) {
      return { success: false, error: "Permission microphone refusée." };
    }
  }
  
  async start() {
    this.audioChunks = [];
    this.durationSeconds = 0;
    
    const micRes = await BerthoVoiceRecorder.requestMicPermission();
    if (!micRes.success) {
      if (this.onFinish) this.onFinish({ success: false, error: micRes.error });
      return;
    }
    
    this.stream = micRes.stream;
    let options = {};
    if (typeof MediaRecorder.isTypeSupported === 'function') {
      if (MediaRecorder.isTypeSupported('audio/mp4')) {
        options = { mimeType: 'audio/mp4' };
      } else if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        options = { mimeType: 'audio/webm;codecs=opus' };
      } else if (MediaRecorder.isTypeSupported('audio/webm')) {
        options = { mimeType: 'audio/webm' };
      }
    }
    
    try {
      this.mediaRecorder = new MediaRecorder(this.stream, options);
    } catch (e) {
      this.mediaRecorder = new MediaRecorder(this.stream);
    }
    
    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        this.audioChunks.push(event.data);
      }
    };
    
    this.mediaRecorder.onstop = async () => {
      this.stopMicTracks();
      const mimeType = this.mediaRecorder.mimeType || 'audio/webm';
      const audioBlob = new Blob(this.audioChunks, { type: mimeType });
      const base64Audio = await this.blobToBase64(audioBlob);
      
      if (this.onFinish) {
        this.onFinish({
          success: true,
          audioBlob: audioBlob,
          audioBase64: base64Audio,
          duration: this.durationSeconds,
          durationFormatted: this.formatTime(this.durationSeconds)
        });
      }
    };
    
    this.mediaRecorder.start(200);
    this.isRecording = true;
    
    this.recordingTimer = setInterval(() => {
      this.durationSeconds++;
      if (this.onTimeUpdate) {
        this.onTimeUpdate(this.formatTime(this.durationSeconds));
      }
      if (this.durationSeconds >= 120) {
        this.stop();
      }
    }, 1000);
  }
  
  stop() {
    if (this.recordingTimer) {
      clearInterval(this.recordingTimer);
      this.recordingTimer = null;
    }
    if (this.mediaRecorder && this.isRecording) {
      this.isRecording = false;
      try {
        this.mediaRecorder.stop();
      } catch (e) {
        this.stopMicTracks();
      }
    } else {
      this.stopMicTracks();
    }
  }
  
  stopMicTracks() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
  }
  
  blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
  
  formatTime(totalSec) {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
  
  // 🎙️ LECTEUR AUDIO HAUT DE GAMME À ONDE SONORE (WAVEFORM STYLE WHATSAPP)
  static createAudioPlayerHTML(audioSrc, durationStr = '0:00') {
    const uniqueId = 'voice_play_' + Math.random().toString(36).substr(2, 9);
    
    setTimeout(() => {
      const btn = document.getElementById(`btn-${uniqueId}`);
      const audio = document.getElementById(`audio-${uniqueId}`);
      const waveform = document.getElementById(`wave-${uniqueId}`);
      const timeLbl = document.getElementById(`time-${uniqueId}`);
      
      if (btn && audio) {
        btn.onclick = (e) => {
          e.stopPropagation();
          if (audio.paused) {
            document.querySelectorAll('audio').forEach(a => { if (a !== audio) a.pause(); });
            audio.play().catch(() => {});
            btn.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`;
          } else {
            audio.pause();
            btn.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>`;
          }
        };
        
        audio.ontimeupdate = () => {
          if (audio.duration && !isNaN(audio.duration) && waveform) {
            const pct = (audio.currentTime / audio.duration) * 100;
            const bars = waveform.querySelectorAll('.wave-bar');
            const activeCount = Math.floor((pct / 100) * bars.length);
            
            bars.forEach((bar, idx) => {
              bar.style.background = idx <= activeCount ? '#38bdf8' : 'rgba(255,255,255,0.25)';
            });
            
            const mins = Math.floor(audio.currentTime / 60);
            const secs = Math.floor(audio.currentTime % 60);
            if (timeLbl) timeLbl.innerText = `${mins}:${secs.toString().padStart(2, '0')}`;
          }
        };
        
        audio.onended = () => {
          btn.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>`;
          if (waveform) {
            waveform.querySelectorAll('.wave-bar').forEach(b => b.style.background = 'rgba(255,255,255,0.25)');
          }
        };
      }
    }, 150);
    
    // Motif de barres d'onde sonore dynamique
    const barHeights = [30, 60, 45, 90, 40, 75, 55, 100, 65, 35, 80, 50, 95, 60, 40, 85, 45, 70, 30, 90, 50, 30];
    const barsHTML = barHeights.map(h =>
      `<div class="wave-bar" style="height:${h}%; width:2.5px; background:rgba(255,255,255,0.25); border-radius:2px; transition:background 0.1s;"></div>`
    ).join('');
    
    return `
      <div class="voice-player-card" style="display:flex; align-items:center; gap:10px; padding:4px 0; width:100%; min-width:180px; max-width:240px; box-sizing:border-box;">
        <button id="btn-${uniqueId}" style="background:#0284c7; border:none; color:#fff; width:34px; height:34px; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; flex-shrink:0; box-shadow:0 2px 8px rgba(0,0,0,0.3);">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>
        </button>
        <div style="flex:1; display:flex; flex-direction:column; gap:4px; min-width:0;">
          <div id="wave-${uniqueId}" style="display:flex; align-items:center; gap:2px; height:20px; width:100%;">
            ${barsHTML}
          </div>
          <div style="display:flex; justify-content:space-between; font-size:0.65rem; color:#94a3b8; font-weight:600;">
            <span id="time-${uniqueId}">${durationStr}</span>
          </div>
        </div>
        <audio id="audio-${uniqueId}" src="${audioSrc}" preload="auto" style="display:none;"></audio>
      </div>
    `;
  }
}