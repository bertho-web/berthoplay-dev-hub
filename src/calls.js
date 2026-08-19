// ============================================================================
// BERTHOPLAY — INTERFACE VISUELLE D'APPELS (SRC/CALLS.JS) [DEV HUB SANDBOX]
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
      <div class="call-overlay">
        <div class="call-video-container">
          <video id="remote-video-element" class="remote-video-element" autoplay playsinline></video>
          <video id="local-video-element" class="local-video-element" autoplay muted playsinline></video>
        </div>

        <div class="call-header-info">
          <div class="call-avatar">${(this.peerUser.username || 'A')[0].toUpperCase()}</div>
          <div class="call-username">${this.peerUser.username}</div>
          <div class="call-status-lbl" id="call-status-text">
            ${this.isIncoming ? (this.isVideo ? 'Appel vidéo entrant…' : 'Appel audio entrant…') : 'Sonnerie en cours…'}
          </div>
          <div class="call-timer-lbl" id="call-timer-display" style="display:none;">00:00</div>
        </div>

        <div class="call-controls-row" id="call-controls-container">
          ${this.isIncoming ? `
            <button class="call-btn-circle btn-call-answer" id="btn-answer-call" title="Répondre" aria-label="Répondre à l'appel"><svg class="icon icon--lg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21.5 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 1.6 4.2 2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.6 9.7a16 16 0 0 0 6 6l1.1-1.2a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2"/></svg></button>
            <button class="call-btn-circle btn-call-end" id="btn-decline-call" title="Décliner" aria-label="Décliner l'appel"><svg class="icon icon--lg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>
          ` : `
            <button class="call-btn-circle btn-call-ctrl" id="btn-toggle-mic" title="Microphone" aria-label="Activer ou couper le microphone" aria-pressed="false"><svg class="icon icon--lg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="2" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0"/><path d="M12 17.5V21"/></svg></button>
            ${this.isVideo ? `<button class="call-btn-circle btn-call-ctrl" id="btn-toggle-cam" title="Caméra" aria-label="Activer ou couper la caméra" aria-pressed="false"><svg class="icon icon--lg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="6" width="13" height="12" rx="2"/><path d="m15 10.5 6-3.5v10l-6-3.5z"/></svg></button>` : ''}
            ${this.isVideo ? `<button class="call-btn-circle btn-call-ctrl" id="btn-flip-cam" title="Changer de caméra" aria-label="Basculer entre caméra avant et arrière"><svg class="icon icon--lg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 11A8 8 0 0 0 6.3 6.3L3 9.5"/><path d="M3 4v5.5h5.5"/><path d="M4 13a8 8 0 0 0 13.7 4.7L21 14.5"/><path d="M21 20v-5.5h-5.5"/></svg></button>` : ''}
            <button class="call-btn-circle btn-call-end" id="btn-hangup-call" title="Raccrocher" aria-label="Raccrocher"><svg class="icon icon--lg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21.5 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 1.6 4.2 2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.6 9.7a16 16 0 0 0 6 6l1.1-1.2a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2" transform="rotate(135 12 12)"/></svg></button>
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
    if (statusLbl) statusLbl.innerText = "Connexion établie";
    
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
        <button class="call-btn-circle btn-call-ctrl" id="btn-toggle-mic" title="Microphone" aria-label="Activer ou couper le microphone" aria-pressed="false"><svg class="icon icon--lg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="2" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0"/><path d="M12 17.5V21"/></svg></button>
        ${this.isVideo ? `<button class="call-btn-circle btn-call-ctrl" id="btn-toggle-cam" title="Caméra" aria-label="Activer ou couper la caméra" aria-pressed="false"><svg class="icon icon--lg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="6" width="13" height="12" rx="2"/><path d="m15 10.5 6-3.5v10l-6-3.5z"/></svg></button>` : ''}
        ${this.isVideo ? `<button class="call-btn-circle btn-call-ctrl" id="btn-flip-cam" title="Changer de caméra" aria-label="Basculer entre caméra avant et arrière"><svg class="icon icon--lg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 11A8 8 0 0 0 6.3 6.3L3 9.5"/><path d="M3 4v5.5h5.5"/><path d="M4 13a8 8 0 0 0 13.7 4.7L21 14.5"/><path d="M21 20v-5.5h-5.5"/></svg></button>` : ''}
        <button class="call-btn-circle btn-call-end" id="btn-hangup-call" title="Raccrocher" aria-label="Raccrocher"><svg class="icon icon--lg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21.5 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 1.6 4.2 2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.6 9.7a16 16 0 0 0 6 6l1.1-1.2a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2" transform="rotate(135 12 12)"/></svg></button>
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
    
    if (statusLbl) statusLbl.innerText = "En communication";
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