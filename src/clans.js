// ============================================================================
// GROUPE / CLAN — GESTIONNAIRE DE CLAN & MUR (SRC/CLANS.JS) [DEV HUB SANDBOX]
// ============================================================================

import { BerthoUI } from './ui-dialogs.js';
import { BerthoVoiceRecorder } from './services/voice-recorder.js';
import { BerthoSoundEffects } from './services/sound-effects.js';
import { i18n } from './i18n.js';

// Mode Sandbox : Mur de clan et gestion des membres simulés localement
const IS_SANDBOX = true;

export class BerthoClanManager {
  constructor(clanData, onClose) {
    this.clanData = clanData;
    this.onClose = onClose;
    this.pollTimer = null;
    this.voiceRecorder = null;
    this.isRecordingVoice = false;
    this.pendingVoiceData = null;
    this.pendingImageData = null;
    this.activeTab = 'wall';
    this.membersList = [];
    this.isMember = false;
    this.myRole = null;
    this.leaderUser = null;
    this.init();
  }

  init() {
    const state = JSON.parse(localStorage.getItem('BERTHOPLAY_V1') || '{}');
    this.currentUser = state.currentUser;
    this.render();
    this.checkMembershipAndLoad();
  }

  formatLocalTime(dateInput) {
    if (!dateInput) return 'Récemment';
    const isoStr = String(dateInput).trim().replace(' ', 'T');
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return 'Récemment';

    return d.toLocaleDateString([], { day: '2-digit', month: '2-digit' }) + ' à ' +
           d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  checkMembershipAndLoad() {
    if (!this.currentUser) {
      this.updateCtaButtonUI();
      return;
    }

    // Liste des membres simulée pour le bac à sable
    this.membersList = [
      { id: this.clanData.owner_id || 'usr_leader', username: this.clanData.username || 'Gervis', role: 'leader', coins: 1500 },
      { id: 'usr_mum', username: 'Mum', role: 'member', coins: 950 },
      { id: 'usr_saint', username: 'Saint', role: 'member', coins: 740 }
    ];

    this.leaderUser = this.membersList.find(m => m.role === 'leader') || null;
    const isOwner = this.clanData.owner_id === this.currentUser.id;
    const localMember = localStorage.getItem(`BERTHOPLAY_CLAN_JOIN_${this.clanData.id}_${this.currentUser.id}`);

    if (isOwner) {
      this.isMember = true;
      this.myRole = 'leader';
    } else if (localMember === '1') {
      this.isMember = true;
      this.myRole = 'member';
      if (!this.membersList.some(m => m.id === this.currentUser.id)) {
        this.membersList.push({ id: this.currentUser.id, username: this.currentUser.username, role: 'member', coins: this.currentUser.coins || 500 });
      }
    } else {
      this.isMember = false;
      this.myRole = null;
    }

    this.updateCtaButtonUI();
    this.updateWallPrivacyState();

    if (this.activeTab === 'members') this.renderMembersListUI();
  }

  updateWallPrivacyState() {
    const footer = document.getElementById('clan-footer-container');
    const lockNotice = document.getElementById('clan-wall-locked-notice');

    if (this.isMember) {
      if (footer && this.activeTab === 'wall') footer.style.display = 'block';
      if (lockNotice) lockNotice.style.display = 'none';
    } else {
      if (footer) footer.style.display = 'none';
      if (lockNotice) lockNotice.style.display = 'block';
    }
  }

  updateCtaButtonUI() {
    const btnContainer = document.getElementById('clan-cta-action-box');
    if (!btnContainer) return;

    if (!this.currentUser) {
      btnContainer.innerHTML = `
        <button class="clan-cta-btn" id="btn-clan-login-req" style="background:var(--blood);">
          CONNEXION REQUISE POUR REJOINDRE LE CLAN
        </button>
      `;
      document.getElementById('btn-clan-login-req')?.addEventListener('click', async () => {
        const module = await import('./auth.js');
        const auth = new module.BerthoAuth(() => this.init());
        auth.openAuthModal();
      });
      return;
    }

    if (this.isMember) {
      if (this.myRole === 'leader') {
        btnContainer.innerHTML = `
          <div style="color:var(--success); font-size:0.75rem; font-weight:900; display:flex; align-items:center; justify-content:center; gap:6px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M2 4l3 12h14l3-12-6 7-4-5-4 7-5-7z"/></svg>
            VOUS ÊTES LE CHEF DU CLAN
          </div>
        `;
      } else {
        btnContainer.innerHTML = `
          <button class="clan-cta-btn" id="btn-leave-clan" style="background:rgba(239, 68, 68, 0.2); border:1px solid var(--danger); color:var(--danger);">
            QUITTER LE CLAN
          </button>
        `;
        document.getElementById('btn-leave-clan')?.addEventListener('click', () => this.leaveClan());
      }
    } else {
      btnContainer.innerHTML = `
        <button class="clan-cta-btn" id="btn-join-clan" style="background:linear-gradient(135deg, var(--success), var(--success));">
          Rejoindre le clan
        </button>
      `;
      document.getElementById('btn-join-clan')?.addEventListener('click', () => this.joinClan());
    }
  }

  joinClan() {
    if (!this.currentUser) return;
    localStorage.setItem(`BERTHOPLAY_CLAN_JOIN_${this.clanData.id}_${this.currentUser.id}`, '1');
    BerthoUI.toast("BIENVENUE !", `Vous avez rejoint ${this.clanData.name}.`);
    this.checkMembershipAndLoad();
  }

  leaveClan() {
    if (!this.currentUser) return;

    BerthoUI.confirm("QUITTER LE CLAN", `Voulez-vous vraiment quitter le clan ${this.clanData.name} ?`, () => {
      localStorage.removeItem(`BERTHOPLAY_CLAN_JOIN_${this.clanData.id}_${this.currentUser.id}`);
      BerthoUI.toast("CLAN", "Vous avez quitté le clan.");
      this.checkMembershipAndLoad();
    });
  }

  render() {
    this.clean();

    const modal = document.createElement('div');
    modal.id = 'clan-manager-modal-overlay';
    modal.innerHTML = `
      <div class="clan-mgr-overlay">
        <div class="clan-mgr-box">
          <div class="clan-mgr-header">
            <span class="clan-mgr-title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              ${this.escapeHtml(this.clanData.name)} [${this.escapeHtml(this.clanData.tag)}]
            </span>
            <button id="btn-close-clan-mgr" style="background:none; border:none; color:var(--ink-3); font-size:1.2rem; cursor:pointer;" aria-label="Fermer"><svg class="icon icon--sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>
          </div>

          <div class="clan-stats-banner">
            <div style="font-size:0.68rem; color:var(--ink-3); font-weight:bold; text-transform:uppercase;">CAGNOTTE DU CLAN</div>
            <div style="font-size:1.15rem; font-weight:900; color:var(--gold-lit); margin-top:2px;">${this.clanData.total_coins || 500} BERTHOCOINS</div>
          </div>

          <div id="clan-cta-action-box" style="margin-bottom:6px; text-align:center;"></div>

          <div class="clan-sub-tabs">
            <div class="clan-sub-tab ${this.activeTab === 'wall' ? 'active' : ''}" id="tab-clan-wall">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              MUR DE DISCUSSION
            </div>
            <div class="clan-sub-tab ${this.activeTab === 'members' ? 'active' : ''}" id="tab-clan-members">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
              MEMBRES
            </div>
          </div>

          <div id="clan-wall-locked-notice" class="clan-lock-notice-box">
            Mur réservé aux membres du clan. Rejoignez le clan pour discuter !
          </div>

          <div class="clan-wall-area" id="clan-wall-messages">
            <p style="text-align:center; color:var(--ink-4); font-size:0.8rem; margin:auto;">Chargement du clan...</p>
          </div>

          <div id="clan-footer-container" style="display:none;">
            <div id="clan-staged-box" class="preview-staged-box">
              <span id="clan-staged-preview-text">Vocal prêt</span>
              <button id="btn-cancel-clan-staged" style="background:none; border:none; color:var(--danger); font-weight:bold; cursor:pointer;" aria-label="Annuler la pièce jointe">Annuler</button>
            </div>

            <div class="clan-footer-input">
              <label class="clan-icon-btn" for="clan-image-input" title="Envoyer une photo">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
              </label>
              <input type="file" id="clan-image-input" accept="image/*" style="display:none;" />

              <button class="clan-icon-btn" id="btn-clan-mic" title="Enregistrer un vocal">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
              </button>

              <input type="text" id="input-clan-wall-msg" class="clan-input-text" placeholder="Écrire au clan..." />
              <button class="clan-send-btn" id="btn-send-clan-wall" type="button" aria-label="Envoyer le message au clan"><svg class="icon icon--sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 3 10.5 13.5"/><path d="M21 3 14.5 21l-4-8-8-4z"/></svg></button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('btn-close-clan-mgr')?.addEventListener('click', () => this.clean());

    document.getElementById('tab-clan-wall')?.addEventListener('click', () => {
      this.activeTab = 'wall';
      this.render();
      this.checkMembershipAndLoad();
    });

    document.getElementById('tab-clan-members')?.addEventListener('click', () => {
      this.activeTab = 'members';
      this.render();
      this.checkMembershipAndLoad();
    });

    if (this.activeTab === 'wall') {
      const sendMsg = () => {
        this.sendPendingClanContent();
      };

      document.getElementById('btn-send-clan-wall')?.addEventListener('click', sendMsg);
      document.getElementById('input-clan-wall-msg')?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') sendMsg();
      });

      document.getElementById('btn-clan-mic')?.addEventListener('click', () => {
        this.toggleClanVoiceRecording();
      });

      document.getElementById('clan-image-input')?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
              const canvas = document.createElement('canvas');
              const maxDim = 800;
              let width = img.width;
              let height = img.height;

              if (width > height) {
                if (width > maxDim) { height *= maxDim / width; width = maxDim; }
              } else {
                if (height > maxDim) { width *= maxDim / height; height = maxDim; }
              }

              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext('2d');
              ctx.drawImage(img, 0, 0, width, height);

              this.pendingImageData = canvas.toDataURL('image/jpeg', 0.75);
              this.showStagedPreview(`Image prête : ${file.name}`);
            };
            img.src = event.target.result;
          };
          reader.readAsDataURL(file);
        }
      });

      document.getElementById('btn-cancel-clan-staged')?.addEventListener('click', () => {
        this.clearStagedPreview();
      });

      this.loadWallMessages();
    } else {
      const footer = document.getElementById('clan-footer-container');
      if (footer) footer.style.display = 'none';
      this.loadMembersList();
    }
  }

  async toggleClanVoiceRecording() {
    const micBtn = document.getElementById('btn-clan-mic');
    const inputMsg = document.getElementById('input-clan-wall-msg');

    if (!this.isRecordingVoice) {
      this.voiceRecorder = new BerthoVoiceRecorder(
        (timeStr) => {
          if (inputMsg) inputMsg.placeholder = `Enregistrement… ${timeStr}`;
        },
        async (res) => {
          if (res.success && res.audioBase64) {
            this.pendingVoiceData = { audioBase64: res.audioBase64, durationFormatted: res.durationFormatted };
            this.showStagedPreview(`Vocal prêt (${res.durationFormatted}) — Cliquez sur ENVOYER`);
          } else if (res.error) {
            BerthoUI.error("MICROPHONE", res.error);
          }
          if (inputMsg) inputMsg.placeholder = "Écrire au clan...";
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
    const stagedBox = document.getElementById('clan-staged-box');
    const stagedText = document.getElementById('clan-staged-preview-text');
    if (stagedBox && stagedText) {
      stagedText.innerText = text;
      stagedBox.style.display = 'flex';
    }
  }

  clearStagedPreview() {
    this.pendingVoiceData = null;
    this.pendingImageData = null;
    const stagedBox = document.getElementById('clan-staged-box');
    if (stagedBox) stagedBox.style.display = 'none';
  }

  sendPendingClanContent() {
    const input = document.getElementById('input-clan-wall-msg');
    const sendBtn = document.getElementById('btn-send-clan-wall');
    if (!this.currentUser) return;

    if (!this.isMember) {
      BerthoUI.alert("ADHÉSION REQUISE", "Vous devez être membre du clan pour écrire sur le mur.");
      return;
    }

    const textMsg = input?.value?.trim() || '';
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

    if (!message && !mediaUrl) return;

    const key = `BERTHOPLAY_CLAN_WALL_${this.clanData.id}`;
    const wallMsgs = JSON.parse(localStorage.getItem(key) || '[]');

    const newMsg = {
      id: 'clan_msg_' + Date.now(),
      username: this.currentUser.username,
      msg_type: msgType,
      message: message,
      media_url: mediaUrl,
      created_at: new Date().toISOString()
    };

    wallMsgs.push(newMsg);
    localStorage.setItem(key, JSON.stringify(wallMsgs));

    if (typeof BerthoSoundEffects !== 'undefined') BerthoSoundEffects.playButtonClick();
    if (input) input.value = '';
    this.clearStagedPreview();
    this.loadWallMessages();
  }

  loadWallMessages(isSilent = false) {
    const wall = document.getElementById('clan-wall-messages');
    if (!wall) return;

    const key = `BERTHOPLAY_CLAN_WALL_${this.clanData.id}`;
    let messages = JSON.parse(localStorage.getItem(key) || '[]');

    if (messages.length === 0) {
      messages = [
        {
          id: 'cm1',
          username: this.clanData.username || 'Gervis',
          msg_type: 'text',
          message: `Bienvenue sur le mur du clan ${this.clanData.name}.`,
          created_at: new Date(Date.now() - 3600000).toISOString()
        }
      ];
      localStorage.setItem(key, JSON.stringify(messages));
    }

    wall.innerHTML = messages.map(m => {
      const isVoice = m.msg_type === 'voice' || (m.message && m.message.startsWith('[VOICE_MSG]'));
      const isImage = m.msg_type === 'image' || (m.message && m.message.startsWith('[IMAGE_MSG]'));
      let content = '';

      if (isVoice) {
        const duration = m.message.includes(':') ? m.message.replace('[VOICE_MSG]:', '') : '00:10';
        content = BerthoVoiceRecorder.createAudioPlayerHTML(m.media_url || m.message, duration);
      } else if (isImage) {
        content = `<img src="${m.media_url}" style="max-width:100%; max-height:180px; border-radius:12px; margin-top:4px;" />`;
      } else {
        content = `<div>${this.escapeHtml(m.message)}</div>`;
      }

      const timeStr = this.formatLocalTime(m.created_at);

      return `
        <div class="clan-msg-item">
          <div class="clan-msg-header-row">
            <span class="clan-msg-author">${this.escapeHtml(m.username)}</span>
            <span class="clan-msg-time">${timeStr}</span>
          </div>
          ${content}
        </div>
      `;
    }).join('');
    wall.scrollTop = wall.scrollHeight;
  }

  loadMembersList() {
    this.renderMembersListUI();
  }

  renderMembersListUI() {
    const wall = document.getElementById('clan-wall-messages');
    if (!wall) return;

    if (this.membersList && this.membersList.length > 0) {
      wall.innerHTML = `
        <div style="padding:4px; display:flex; flex-direction:column; gap:8px;">
          ${this.membersList.map(m => {
            const isLeader = m.role === 'leader';
            const displayUname = m.username || (isLeader ? (this.leaderUser?.username || this.clanData.username || 'Chef Fondateur') : 'Membre');

            return `
              <div style="display:flex; justify-content:space-between; align-items:center; background:var(--surface-2); padding:10px 12px; border-radius:12px;">
                <div style="display:flex; align-items:center; gap:8px; min-width:0; flex:1;">
                  <div style="width:34px; height:34px; border-radius:50%; background:var(--blood); display:flex; align-items:center; justify-content:center; font-weight:bold; overflow:hidden; flex-shrink:0;">
                    ${m.avatar_url ? `<img src="${m.avatar_url}" style="width:100%; height:100%; object-fit:cover;" />` : (displayUname || 'M')[0].toUpperCase()}
                  </div>
                  <div style="min-width:0; flex:1;">
                    <div style="font-weight:900; font-size:0.82rem; color:#fff; display:flex; align-items:center; gap:4px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                      ${isLeader ? '<span class="badge badge--gold">Chef</span>' : ''} ${this.escapeHtml(displayUname)}
                    </div>
                    <small style="color:var(--gold-lit); font-weight:bold;">${m.coins || 0}</small>
                  </div>
                </div>

                <div style="display:flex; align-items:center; gap:6px; flex-shrink:0;">
                  <button class="btn-view-member-profile" data-id="${m.id}" data-username="${this.escapeHtml(displayUname)}">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    PROFIL
                  </button>
                  <span style="font-size:0.65rem; background:${isLeader ? 'var(--success)' : 'var(--line-strong)'}; color:#fff; padding:3px 7px; border-radius:6px; font-weight:bold;">
                    ${isLeader ? 'CHEF' : 'MEMBRE'}
                  </span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;

      wall.querySelectorAll('.btn-view-member-profile').forEach(btn => {
        btn.addEventListener('click', async () => {
          const uid = btn.getAttribute('data-id');
          const uname = btn.getAttribute('data-username');
          this.clean();

          try {
            const accMod = await import('./views/account.js');
            const viewContainer = document.getElementById('main-tab-container');

            document.querySelectorAll('#bottom-nav .nav-item').forEach(nav => {
              if (nav.getAttribute('data-tab') === 'account') nav.setAttribute('aria-current', 'page');
              else nav.removeAttribute('aria-current');
            });

            if (viewContainer) {
              const accView = new accMod.AccountView(viewContainer);
              accView.activeSearchUser = { id: uid, username: uname };
              accView.render();
            }
          } catch (e) {
            BerthoUI.error("PROFIL", "Impossible d'ouvrir la fiche du membre.");
          }
        });
      });

    } else {
      const leaderName = this.leaderUser?.username || this.clanData.username || 'Chef Fondateur';
      wall.innerHTML = `
        <div style="padding:8px;">
          <div style="display:flex; justify-content:space-between; align-items:center; background:var(--surface-2); padding:12px; border-radius:12px;">
            <div>
              <strong>${this.escapeHtml(leaderName)}</strong><br/>
              <small style="color:var(--success);">Fondateur du Clan</small>
            </div>
            <span style="font-size:0.75rem; background:var(--success); color:#fff; padding:4px 8px; border-radius:8px; font-weight:bold;">CHEF</span>
          </div>
        </div>
      `;
    }
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
    const el = document.getElementById('clan-manager-modal-overlay');
    if (el && el.parentNode) el.parentNode.removeChild(el);
    if (this.onClose) this.onClose();
  }
}