// ============================================================================
// 🎮 BERTHOPLAY — INTERFACE VISUELLE D'APPELS (SRC/CALLS.JS) [DEV HUB SANDBOX]
// ============================================================================

import { BerthoWebRTCService } from './services/webrtc-service.js';
import { BerthoSoundEffects } from './services/sound-effects.js';
import { BerthoUI } from './ui-dialogs.js';

// Mode Sandbox : Appels simulés sans écouteur réseau
const IS_SANDBOX = true;

export class BerthoCallUI {
  constructor(peerUser, isVideo = true, isIncoming = false, offerSdp = null) {
    this.peerUser = peerUser;
    this.isVideo = isVideo;
    this.isIncoming = isIncoming;
    this.offerSdp = offerSdp;
    
    const state = JSON.parse(localStorage.getItem('BERTHOPLAY_V1') || '{}');
    this.currentUser = state.currentUser || { id: 'usr_guest', username: 'Joueur' };
    
    this.webrtc = null;
    this.isMuted = false;
    this.isVideoOff = false;
    this.facingMode = 'user';
    this.callTimer = null;
    this.ringTimeout = null;
    this.callDurationSec = 0;
    
    this.render();
  }
  
  static listenForIncomingCalls(userId) {
    // Désactivé en Sandbox pour éviter les requêtes inutiles
  }
  
  render() {
    this.clean();
    
    const modal = document.createElement('div');
    modal.id = 'call-ui-modal-overlay';
    modal.innerHTML = `
      <style>
        .call-overlay {
          position: fixed; top: 0; left: 0; width: 100vw; height: 100dvh;
          background: #030308; z-index: 999999; display: flex; flex-direction: column;
          align-items: center; justify-content: space-between; padding: max(20px, env(safe-area-inset-top)) 15px max(30px, env(safe-area-inset-bottom));
          color: #fff; box-sizing: border-box; font-family: -apple-system, sans-serif;
        }
        .call-video-container {
          position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 1; overflow: hidden;
        }
        .remote-video-element {
          width: 100%; height: 100%; object-fit: cover; background: #070a14;
        }
        .local-video-element {
          position: absolute; top: max(20px, env(safe-area-inset-top)); right: 20px;
          width: 100px; height: 140px; border-radius: 16px; border: 2px solid #38bdf8;
          object-fit: cover; z-index: 10; box-shadow: 0 10px 25px rgba(0,0,0,0.8); background: #000;
        }
        .call-header-info {
          position: relative; z-index: 20; text-align: center; margin-top: 20px;
          background: rgba(15, 23, 42, 0.85); padding: 15px 25px; border-radius: 20px;
          border: 1px solid rgba(56, 189, 248, 0.3); backdrop-filter: blur(15px);
        }
        .call-avatar {
          width: 60px; height: 60px; border-radius: 50%; background: #0284c7;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.8rem; font-weight: 900; margin: 0 auto 10px; border: 2px solid #38bdf8;
        }
        .call-username { font-size: 1.2rem; font-weight: 900; color: #fff; margin-bottom: 4px; }
        .call-status-lbl { font-size: 0.8rem; color: #38bdf8; font-weight: bold; }
        .call-timer-lbl { font-size: 0.8rem; color: #34d399; font-weight: bold; margin-top: 4px; }
        
        .call-controls-row {
          position: relative; z-index: 20; display: flex; gap: 14px; align-items: center;
          background: rgba(15, 23, 42, 0.9); padding: 12px 20px; border-radius: 30px;
          border: 1px solid rgba(255,255,255,0.15); backdrop-filter: blur(20px);
        }
        .call-btn-circle {
          width: 50px; height: 50px; border-radius: 50%; border: none;
          display: flex; align-items: center; justify-content: center; font-size: 1.2rem;
          cursor: pointer; color: #fff; font-weight: bold; transition: transform 0.15s;
        }
        .call-btn-circle:active { transform: scale(0.92); }
        .btn-call-end { background: #ef4444; box-shadow: 0 0 20px rgba(239, 68, 68, 0.5); }
        .btn-call-answer { background: #22c55e; box-shadow: 0 0 20px rgba(34, 197, 94, 0.5); }
        .btn-call-ctrl { background: #1e293b; border: 1px solid #334155; }
        .btn-call-ctrl.active { background: #0284c7; border-color: #38bdf8; }
      </style>

      <div class="call-overlay">
        <div class="call-video-container">
          <video id="remote-video-element" class="remote-video-element" autoplay playsinline></video>
          <video id="local-video-element" class="local-video-element" autoplay muted playsinline></video>
        </div>

        <div class="call-header-info">
          <div class="call-avatar">${(this.peerUser.username || 'A')[0].toUpperCase()}</div>
          <div class="call-username">${this.peerUser.username}</div>
          <div class="call-status-lbl" id="call-status-text">
            ${this.isIncoming ? (this.isVideo ? '📹 Appel Vidéo Entrant...' : '📞 Appel Audio Entrant...') : '📞 Sonnerie en cours...'}
          </div>
          <div class="call-timer-lbl" id="call-timer-display" style="display:none;">00:00</div>
        </div>

        <div class="call-controls-row" id="call-controls-container">
          ${this.isIncoming ? `
            <button class="call-btn-circle btn-call-answer" id="btn-answer-call" title="Répondre">📞</button>
            <button class="call-btn-circle btn-call-end" id="btn-decline-call" title="Décliner">✖</button>
          ` : `
            <button class="call-btn-circle btn-call-ctrl" id="btn-toggle-mic" title="Microphone">🎙️</button>
            ${this.isVideo ? `<button class="call-btn-circle btn-call-ctrl" id="btn-toggle-cam" title="Caméra">📹</button>` : ''}
            ${this.isVideo ? `<button class="call-btn-circle btn-call-ctrl" id="btn-flip-cam" title="Changer Caméra">🔄</button>` : ''}
            <button class="call-btn-circle btn-call-end" id="btn-hangup-call" title="Raccrocher">🛑</button>
          `}
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    if (this.isIncoming) {
      BerthoSoundEffects.playRingtone();
      
      document.getElementById('btn-answer-call')?.addEventListener('click', () => {
        BerthoSoundEffects.stopRingtone();
        this.acceptIncomingCall();
      });
      
      document.getElementById('btn-decline-call')?.addEventListener('click', () => {
        BerthoSoundEffects.stopRingtone();
        this.clean(true);
      });
    } else {
      this.initiateOutgoingCall();
    }
  }
  
  async initiateOutgoingCall() {
    BerthoSoundEffects.playNotificationChime();
    
    this.webrtc = new BerthoWebRTCService(
      this.currentUser.id,
      this.peerUser.id,
      (remoteStream) => {
        if (this.ringTimeout) clearTimeout(this.ringTimeout);
        this.attachRemoteStream(remoteStream);
      },
      () => this.clean(false)
    );
    
    const localStream = await this.webrtc.getLocalStream(this.isVideo);
    if (localStream) {
      this.attachLocalStream(localStream);
      this.webrtc.startCall(this.isVideo);
      this.bindControls();
    } else {
      BerthoUI.alert("APPEL", "Accès micro/caméra non disponible.");
      this.clean(false);
    }
  }
  
  async acceptIncomingCall() {
    const statusLbl = document.getElementById('call-status-text');
    if (statusLbl) statusLbl.innerText = "🟢 Connexion établie";
    
    this.webrtc = new BerthoWebRTCService(
      this.currentUser.id,
      this.peerUser.id,
      (remoteStream) => this.attachRemoteStream(remoteStream),
      () => this.clean(false)
    );
    
    const localStream = await this.webrtc.getLocalStream(this.isVideo);
    if (localStream) {
      this.attachLocalStream(localStream);
      await this.webrtc.answerCall(this.offerSdp, this.isVideo);
      this.renderConnectedControls();
      this.bindControls();
    }
  }
  
  renderConnectedControls() {
    const row = document.getElementById('call-controls-container');
    if (row) {
      row.innerHTML = `
        <button class="call-btn-circle btn-call-ctrl" id="btn-toggle-mic" title="Microphone">🎙️</button>
        ${this.isVideo ? `<button class="call-btn-circle btn-call-ctrl" id="btn-toggle-cam" title="Caméra">📹</button>` : ''}
        ${this.isVideo ? `<button class="call-btn-circle btn-call-ctrl" id="btn-flip-cam" title="Changer Caméra">🔄</button>` : ''}
        <button class="call-btn-circle btn-call-end" id="btn-hangup-call" title="Raccrocher">🛑</button>
      `;
      this.bindControls();
    }
  }
  
  attachLocalStream(stream) {
    const localVideo = document.getElementById('local-video-element');
    if (localVideo) {
      localVideo.srcObject = stream;
      localVideo.style.display = this.isVideo ? 'block' : 'none';
    }
  }
  
  attachRemoteStream(stream) {
    const remoteVideo = document.getElementById('remote-video-element');
    const statusLbl = document.getElementById('call-status-text');
    const timerLbl = document.getElementById('call-timer-display');
    
    if (statusLbl) statusLbl.innerText = "🟢 En communication";
    if (timerLbl) timerLbl.style.display = 'block';
    
    if (remoteVideo) {
      remoteVideo.srcObject = stream;
    }
    
    this.startCallDurationTimer();
  }
  
  startCallDurationTimer() {
    if (this.callTimer) clearInterval(this.callTimer);
    this.callDurationSec = 0;
    
    this.callTimer = setInterval(() => {
      this.callDurationSec++;
      const mins = Math.floor(this.callDurationSec / 60);
      const secs = this.callDurationSec % 60;
      const timeStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      
      const timerLbl = document.getElementById('call-timer-display');
      if (timerLbl) timerLbl.innerText = timeStr;
    }, 1000);
  }
  
  bindControls() {
    document.getElementById('btn-toggle-mic')?.addEventListener('click', () => {
      this.isMuted = !this.isMuted;
      if (this.webrtc) this.webrtc.toggleMute(this.isMuted);
      const btn = document.getElementById('btn-toggle-mic');
      if (btn) btn.classList.toggle('active', this.isMuted);
    });
    
    document.getElementById('btn-toggle-cam')?.addEventListener('click', () => {
      this.isVideoOff = !this.isVideoOff;
      if (this.webrtc) this.webrtc.toggleVideo(this.isVideoOff);
      const btn = document.getElementById('btn-toggle-cam');
      if (btn) btn.classList.toggle('active', this.isVideoOff);
    });
    
    document.getElementById('btn-flip-cam')?.addEventListener('click', async () => {
      this.facingMode = (this.facingMode === 'user') ? 'environment' : 'user';
      if (this.webrtc) {
        const stream = await this.webrtc.getLocalStream(this.isVideo);
        this.attachLocalStream(stream);
      }
    });
    
    document.getElementById('btn-hangup-call')?.addEventListener('click', () => {
      this.clean(true);
    });
  }
  
  clean(notifyPeer = true) {
    BerthoSoundEffects.stopRingtone();
    
    if (this.ringTimeout) {
      clearTimeout(this.ringTimeout);
      this.ringTimeout = null;
    }
    
    if (this.callTimer) {
      clearInterval(this.callTimer);
      this.callTimer = null;
    }
    
    if (this.webrtc) {
      this.webrtc.endCall(notifyPeer);
      this.webrtc = null;
    }
    
    const el = document.getElementById('call-ui-modal-overlay');
    if (el && el.parentNode) el.parentNode.removeChild(el);
  }
}