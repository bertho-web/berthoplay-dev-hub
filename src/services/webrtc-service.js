// ============================================================================
// 🎮 BERTHOPLAY — MOTEUR D'APPELS AUDIO & VIDÉO (SRC/SERVICES/WEBRTC-SERVICE.JS) [DEV HUB]
// ============================================================================

// Mode Sandbox : Signalisation WebRTC simulée sans solliciter le Worker
const IS_SANDBOX = true;

export class BerthoWebRTCService {
  constructor(userId, peerId, onRemoteStream, onCallEnded) {
    this.userId = userId;
    this.peerId = peerId;
    this.onRemoteStream = onRemoteStream;
    this.onCallEnded = onCallEnded;
    
    this.peerConnection = null;
    this.localStream = null;
    this.remoteStream = null;
    this.pollTimer = null;
    this.pendingCandidates = [];
    
    this.iceServers = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    };
  }
  
  async getLocalStream(enableVideo = true) {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: enableVideo ? { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } } : false
      });
      return this.localStream;
    } catch (err) {
      console.warn("Accès média local refusé ou non disponible :", err);
      return null;
    }
  }
  
  createPeerConnection() {
    try {
      this.peerConnection = new RTCPeerConnection(this.iceServers);
      
      if (this.localStream) {
        this.localStream.getTracks().forEach(track => {
          this.peerConnection.addTrack(track, this.localStream);
        });
      }
      
      this.peerConnection.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
          this.remoteStream = event.streams[0];
          if (this.onRemoteStream) this.onRemoteStream(this.remoteStream);
        }
      };
      
      this.peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          this.sendSignal('ice_candidate', JSON.stringify(event.candidate));
        }
      };
      
      this.peerConnection.oniceconnectionstatechange = () => {
        if (this.peerConnection && (
            this.peerConnection.iceConnectionState === 'disconnected' ||
            this.peerConnection.iceConnectionState === 'failed' ||
            this.peerConnection.iceConnectionState === 'closed')) {
          this.endCall(false);
        }
      };
    } catch (e) {}
  }
  
  async startCall(isVideo = true) {
    const stream = await this.getLocalStream(isVideo);
    if (!stream) {
      if (this.onCallEnded) this.onCallEnded("Impossible d'accéder au micro ou à la caméra.");
      return;
    }
    
    this.createPeerConnection();
    
    // Mode Sandbox : Auto-connexion du flux local pour tester le rendu de l'appel
    if (this.onRemoteStream) {
      setTimeout(() => {
        this.onRemoteStream(stream);
      }, 1000);
    }
  }
  
  async answerCall(offerSdp, isVideo = true) {
    const stream = await this.getLocalStream(isVideo);
    if (!stream) return;
    
    this.createPeerConnection();
    if (this.onRemoteStream) this.onRemoteStream(stream);
  }
  
  processPendingCandidates() {
    this.pendingCandidates = [];
  }
  
  sendSignal(type, payload) {
    // Mode Sandbox : Pas de transmission réseau externe
  }
  
  startSignalPolling() {
    // Mode Sandbox : Boucle réseau désactivée
  }
  
  toggleMute(isMuted) {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = !isMuted;
      });
    }
  }
  
  toggleVideo(isVideoOff) {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach(track => {
        track.enabled = !isVideoOff;
      });
    }
  }
  
  endCall(notifyPeer = true) {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
    
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }
    
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
    
    if (this.onCallEnded) {
      this.onCallEnded();
    }
  }
}