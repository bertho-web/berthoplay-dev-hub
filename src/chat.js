// ============================================================================
// BERTHOPLAY — CAUSERIE INDIVIDUELLE (SRC/CHAT.JS) [INTÉGRAL]
// ============================================================================

import { API } from './services/api.js';
import { BerthoUI } from './ui-dialogs.js';
import { BerthoVoiceRecorder } from './services/voice-recorder.js';
import { BerthoSoundEffects } from './services/sound-effects.js';
import { BerthoCallUI } from './calls.js';
export { BerthoChatList } from './chat-list.js';

function formatSmartTime(dateInput) {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '';

  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();

  const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (isToday) return timeStr;
  if (isYesterday) return 'Hier';
  return d.toLocaleDateString([], { day: '2-digit', month: '2-digit' });
}

export class BerthoChat {
  constructor(peerUser, onClose, openedFromList = false) {
    this.peerUser = peerUser;
    this.onClose = onClose;
    this.openedFromList = openedFromList;
    this.pollTimer = null;
    this.voiceRecorder = null;
    this.isRecordingVoice = false;
    this.pendingVoiceData = null;
    this.pendingImageData = null;
    this.touchStartX = 0;
    this.init();
  }

  init() {
    const state = JSON.parse(localStorage.getItem('BERTHOPLAY_V1') || '{}');
    const user = state.currentUser;

    if (!user || !user.id) {
      BerthoUI.alert(
        "CONNEXION REQUISE",
        "Vous devez être connecté à votre compte BerthoPlay pour échanger avec un allié."
      );
      if (this.onClose) this.onClose();
      return;
    }

    this.currentUser = user;
    this.render();
  }

  render() {
    this.clean();

    const modal = document.createElement('div');
    modal.id = 'chat-widget-overlay';
    modal.innerHTML = `
      <div class="chat-overlay" id="chat-overlay-container">
        <div class="chat-box" id="chat-box-el">
          <div class="chat-header">
            <div class="chat-title-container">
              <button id="btn-back-chat" style="background:none; border:none; color:var(--violet-lit); font-size:1.2rem; cursor:pointer; padding:0 4px;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
              </button>
              <div class="chat-avatar">${(this.peerUser.username || 'A')[0].toUpperCase()}</div>
              <div>
                <div class="chat-title">${this.peerUser.username}</div>
                <div style="font-size: 0.65rem; color: var(--success); font-weight: 600;">En Direct</div>
              </div>
            </div>

            <div class="chat-header-actions">
              <button class="chat-action-btn" id="btn-chat-audio-call" title="Appel Audio">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.79 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              </button>
              <button class="chat-action-btn" id="btn-chat-video-call" title="Appel Vidéo">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
              </button>
              <button class="chat-action-btn" id="btn-chat-view-profile" title="Voir le Profil">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </button>
              <button id="btn-close-chat" style="background:none; border:none; color:var(--ink-3); font-size:1.1rem; cursor:pointer; padding:2px;" aria-label="Fermer"><svg class="icon icon--sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>
            </div>
          </div>

          <div class="chat-messages-area" id="chat-msgs-list">
            <p style="text-align:center; color:var(--ink-4); font-size:0.8rem; margin: auto;">Chargement de la causerie...</p>
          </div>

          <div class="chat-footer">
            <div id="chat-staged-box" class="preview-staged-box">
              <span id="staged-preview-text">Vocal prêt</span>
              <button id="btn-cancel-staged" style="background:none; border:none; color:var(--danger); font-weight:bold; cursor:pointer;" aria-label="Annuler la pièce jointe">Annuler</button>
            </div>

            <div class="chat-input-row">
              <label class="chat-icon-btn" for="chat-image-input" title="Envoyer une photo">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              </label>
              <input type="file" id="chat-image-input" accept="image/*" style="display:none;" />

              <button class="chat-icon-btn" id="btn-chat-mic" title="Enregistrer un vocal">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
              </button>

              <input type="text" id="chat-input-msg" class="chat-input" placeholder="Message..." />
              <button class="chat-send-btn" id="btn-send-chat-msg">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const chatBox = document.getElementById('chat-box-el');
    if (chatBox) {
      chatBox.addEventListener('touchstart', (e) => {
        this.touchStartX = e.touches[0].clientX;
      }, { passive: true });

      chatBox.addEventListener('touchend', (e) => {
        const deltaX = e.changedTouches[0].clientX - this.touchStartX;
        if (deltaX > 90) {
          this.closeAndReturn();
        }
      }, { passive: true });
    }

    document.getElementById('btn-back-chat')?.addEventListener('click', () => this.closeAndReturn());
    document.getElementById('btn-close-chat')?.addEventListener('click', () => this.closeAndReturn());

    document.getElementById('btn-chat-audio-call')?.addEventListener('click', () => {
      new BerthoCallUI(this.peerUser, false, false);
    });

    document.getElementById('btn-chat-video-call')?.addEventListener('click', () => {
      new BerthoCallUI(this.peerUser, true, false);
    });

    document.getElementById('btn-chat-view-profile')?.addEventListener('click', async () => {
      this.clean();
      try {
        const accMod = await import('./views/account.js');
        const viewContainer = document.getElementById('main-tab-container');
        if (viewContainer) {
          const accView = new accMod.AccountView(viewContainer);
          accView.activeSearchUser = this.peerUser;
          accView.render();
        }
      } catch(e) {}
    });

    const inputMsg = document.getElementById('chat-input-msg');
    const sendBtn = document.getElementById('btn-send-chat-msg');

    if (sendBtn) sendBtn.onclick = () => this.sendPendingContent();

    if (inputMsg) {
      inputMsg.onkeydown = (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.sendPendingContent();
        }
      };
    }

    document.getElementById('btn-chat-mic')?.addEventListener('click', () => {
      this.toggleVoiceRecording();
    });

    document.getElementById('chat-image-input')?.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        this.compressImage(file, (compressedBase64) => {
          this.pendingImageData = compressedBase64;
          this.showStagedPreview(`Image prête à l'envoi`);
        });
      }
    });

    document.getElementById('btn-cancel-staged')?.addEventListener('click', () => {
      this.clearStagedPreview();
    });

    this.loadHistory();
    this.pollTimer = setInterval(() => this.loadHistory(true), 3500);
  }

  closeAndReturn() {
    this.clean();
    if (this.openedFromList) {
      import('./chat-list.js').then(m => new m.BerthoChatList(this.onClose));
    }
  }

  compressImage(file, callback) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 900;

        if (width > height && width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else if (height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.72);
        callback(compressedBase64);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  async toggleVoiceRecording() {
    const micBtn = document.getElementById('btn-chat-mic');
    const inputMsg = document.getElementById('chat-input-msg');

    if (!this.isRecordingVoice) {
      this.voiceRecorder = new BerthoVoiceRecorder(
        (timeStr) => {
          if (inputMsg) inputMsg.placeholder = `Enregistrement… ${timeStr}`;
        },
        async (res) => {
          if (res.success && res.audioBase64) {
            this.pendingVoiceData = { audioBase64: res.audioBase64, durationFormatted: res.durationFormatted };
            this.showStagedPreview(`Vocal (${res.durationFormatted}) — Cliquez sur ENVOYER`);
          } else if (res.error) {
            BerthoUI.error("MICROPHONE", res.error);
          }
          if (inputMsg) inputMsg.placeholder = "Message...";
          if (micBtn) micBtn.classList.remove('recording');
          this.isRecordingVoice = false;
        }
      );

      this.isRecordingVoice = true;
      if (micBtn) micBtn.classList.add('recording');
      await this.voiceRecorder.start();
    } else {
      if (this.voiceRecorder) {
        this.voiceRecorder.stop();
      }
    }
  }

  showStagedPreview(text) {
    const stagedBox = document.getElementById('chat-staged-box');
    const stagedText = document.getElementById('staged-preview-text');
    if (stagedBox && stagedText) {
      stagedText.innerText = text;
      stagedBox.style.display = 'flex';
    }
  }

  clearStagedPreview() {
    this.pendingVoiceData = null;
    this.pendingImageData = null;
    const stagedBox = document.getElementById('chat-staged-box');
    if (stagedBox) stagedBox.style.display = 'none';
  }

  async sendPendingContent() {
    const inputMsg = document.getElementById('chat-input-msg');
    const sendBtn = document.getElementById('btn-send-chat-msg');

    if (sendBtn) sendBtn.disabled = true;

    try {
      const textMsg = inputMsg?.value?.trim() || '';
      let msgType = 'text';
      let message = textMsg;
      let mediaUrl = null;

      if (this.pendingVoiceData) {
        msgType = 'voice';
        message = `[VOICE_MSG]:${this.pendingVoiceData.durationFormatted}`;
        mediaUrl = this.pendingVoiceData.audioBase64;
      } else if (this.pendingImageData) {
        msgType = 'image';
        message = `[IMAGE_MSG]`;
        mediaUrl = this.pendingImageData;
      }

      if (!message && !mediaUrl) {
        if (sendBtn) sendBtn.disabled = false;
        return;
      }

      const res = await API.chat.sendMessage(
        this.currentUser.id,
        this.peerUser.id,
        this.currentUser.username,
        message,
        msgType,
        mediaUrl
      );

      if (res && res.success) {
        BerthoSoundEffects.playButtonClick();
        if (inputMsg) inputMsg.value = '';
        this.clearStagedPreview();
        await this.loadHistory();
      }
    } catch (e) {
      BerthoUI.error("ERREUR", "Impossible d'envoyer le message.");
    } finally {
      if (sendBtn) sendBtn.disabled = false;
    }
  }

  async deleteMessage(msgId) {
    await API.chat.deleteMessage(msgId);
    this.loadHistory();
  }

  openImageLightbox(src) {
    const lightbox = document.createElement('div');
    lightbox.className = 'image-lightbox';
    lightbox.innerHTML = `<img src="${src}" /><span style="position:absolute; top:20px; right:20px; color:#fff; font-size:1.8rem; cursor:pointer;" aria-label="Fermer l'image"><svg class="icon icon--lg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></span>`;
    lightbox.onclick = () => document.body.removeChild(lightbox);
    document.body.appendChild(lightbox);
  }

  async loadHistory(isSilent = false) {
    const list = document.getElementById('chat-msgs-list');
    if (!list) return;

    try {
      const res = await API.chat.getHistory(this.currentUser.id, this.peerUser.id);

      if (res && res.success && res.messages && res.messages.length > 0) {
        const html = res.messages.map(m => {
          const isMine = m.sender_id === this.currentUser.id;
          const timeStr = formatSmartTime(m.created_at);

          const isVoice = m.msg_type === 'voice' || (m.message && m.message.startsWith('[VOICE_MSG]'));
          const isImage = m.msg_type === 'image' || (m.message && m.message.startsWith('[IMAGE_MSG]'));
          let contentHTML = '';

          if (isVoice) {
            const duration = (m.message && m.message.includes(':')) ? m.message.split(':')[1] : '0:10';
            contentHTML = BerthoVoiceRecorder.createAudioPlayerHTML(m.media_url || m.message, duration);
          } else if (isImage) {
            contentHTML = `<img src="${m.media_url}" class="chat-img-clickable" style="max-width:100%; max-height:180px; border-radius:12px; cursor:pointer;" />`;
          } else {
            contentHTML = `<div>${this.escapeHtml(m.message)}</div>`;
          }

          return `
            <div class="chat-msg-row ${isMine ? 'mine' : 'peer'}">
              ${isMine ? `<button class="btn-delete-msg" data-msg-id="${m.id}" title="Supprimer" aria-label="Supprimer le message"><svg class="icon icon--sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>` : ''}
              <div class="chat-msg ${isMine ? 'mine' : 'peer'}">
                ${contentHTML}
                <div class="chat-time-wrapper">
                  <span class="chat-time">${timeStr}</span>
                  ${isMine ? `<span class="check-marks" aria-label="Message lu"><svg class="icon icon--sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m2 13 4 4L15 8"/><path d="m9 13 4 4L22 8"/></svg></span>` : ''}
                </div>
              </div>
            </div>
          `;
        }).join('');

        const shouldScroll = (list.scrollTop + list.clientHeight >= list.scrollHeight - 50) || !isSilent;
        list.innerHTML = html;

        list.querySelectorAll('.chat-img-clickable').forEach(img => {
          img.onclick = () => this.openImageLightbox(img.src);
        });

        list.querySelectorAll('.btn-delete-msg').forEach(btn => {
          btn.onclick = () => {
            const id = btn.getAttribute('data-msg-id');
            if (id) this.deleteMessage(id);
          };
        });

        if (shouldScroll) {
          list.scrollTop = list.scrollHeight;
        }
      } else if (!isSilent) {
        list.innerHTML = `
          <div style="text-align:center; color:var(--ink-4); font-size:0.8rem; margin:auto;">
            Démarrer la causerie avec <strong>${this.escapeHtml(this.peerUser.username)}</strong> !
          </div>
        `;
      }
    } catch (e) {}
  }

  escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  clean() {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
    if (this.voiceRecorder) {
      this.voiceRecorder.stop();
      this.voiceRecorder = null;
    }
    const el = document.getElementById('chat-widget-overlay');
    if (el && el.parentNode) el.parentNode.removeChild(el);
    if (this.onClose) this.onClose();
  }
}