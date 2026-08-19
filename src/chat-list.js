// ============================================================================
// BERTHOPLAY — LISTE DES DISCUSSIONS (SRC/CHAT-LIST.JS) [INTÉGRAL]
// ============================================================================

import { API } from './services/api.js';
import { BerthoUI } from './ui-dialogs.js';
import { BerthoSoundEffects } from './services/sound-effects.js';

function parseSafariDate(dateInput) {
  if (!dateInput) return new Date(0);
  if (dateInput instanceof Date) return dateInput;
  const isoStr = String(dateInput).trim().replace(' ', 'T');
  const d = new Date(isoStr);
  return isNaN(d.getTime()) ? new Date(0) : d;
}

function formatSmartTime(dateInput) {
  const d = parseSafariDate(dateInput);
  if (d.getTime() === 0) return '';
  
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

export class BerthoChatList {
  constructor(onClose) {
    this.onClose = onClose;
    this.pollTimer = null;
    this.lastMsgCount = 0;
    this.init();
  }
  
  init() {
    const state = JSON.parse(localStorage.getItem('BERTHOPLAY_V1') || '{}');
    this.currentUser = state.currentUser;
    
    if (!this.currentUser) {
      BerthoUI.alert("CONNEXION REQUISE", "Connectez-vous pour consulter vos conversations.");
      if (this.onClose) this.onClose();
      return;
    }
    
    this.render();
  }
  
  render() {
    this.clean();
    
    const modal = document.createElement('div');
    modal.id = 'chat-list-modal-overlay';
    modal.innerHTML = `
      <div class="chat-list-overlay">
        <div class="chat-list-box">
          <div class="chat-list-header">
            <span class="chat-list-title">Discussions</span>
            <button id="btn-close-chat-list" style="background:none; border:none; color:var(--ink-3); font-size:1.1rem; cursor:pointer;" aria-label="Fermer"><svg class="icon icon--sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>
          </div>

          <div class="chat-list-items" id="chat-list-container">
            <p class="chat-list-empty">Chargement de vos discussions...</p>
          </div>

          <button id="btn-close-chat-list-bottom" style="width:100%; padding:12px; background:var(--surface-2); border:1px solid var(--line-strong); color:#fff; border-radius:14px; font-weight:bold; cursor:pointer; margin-top:10px;">FERMER</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    const close = () => this.clean();
    document.getElementById('btn-close-chat-list')?.addEventListener('click', close);
    document.getElementById('btn-close-chat-list-bottom')?.addEventListener('click', close);
    
    this.loadConversations();
    this.pollTimer = setInterval(() => this.loadConversations(true), 3500);
  }
  
  async loadConversations(isSilent = false) {
    const container = document.getElementById('chat-list-container');
    if (!container) return;
    
    try {
      const res = await API.chat.getConversations(this.currentUser.id);
      
      if (res && res.success && res.conversations && res.conversations.length > 0) {
        if (isSilent && res.conversations.length > this.lastMsgCount) {
          try { BerthoSoundEffects.playNotificationChime(); } catch (e) {}
          if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
        }
        this.lastMsgCount = res.conversations.length;
        
        res.conversations.sort((a, b) => {
          const timeA = parseSafariDate(a.last_time).getTime();
          const timeB = parseSafariDate(b.last_time).getTime();
          return timeB - timeA;
        });
        
        container.innerHTML = res.conversations.map(c => {
          const timeStr = formatSmartTime(c.last_time);
          
          const isVoice = c.last_message && c.last_message.startsWith('[VOICE_MSG]');
          const isImage = c.last_message && c.last_message.startsWith('[IMAGE_MSG]');
          let displayMsg = c.last_message || '';
          
          if (isVoice) displayMsg = 'Message vocal';
          else if (isImage) displayMsg = 'Photo';
          
          const unreadCount = parseInt(c.unread_count, 10) || 0;
          
          return `
            <div class="chat-item-card" data-peer-id="${c.peer_id}" data-peer-name="${c.peer_name}">
              <div class="chat-item-left">
                <div class="chat-item-avatar">${(c.peer_name || 'A')[0].toUpperCase()}</div>
                <div class="chat-item-info">
                  <h4>${this.escapeHtml(c.peer_name || 'Allié')}</h4>
                  <p>${this.escapeHtml(displayMsg)}</p>
                </div>
              </div>
              <div class="chat-item-right">
                <div class="chat-item-time">${timeStr}</div>
                ${unreadCount > 0 ? `<span class="unread-badge">${unreadCount}</span>` : ''}
              </div>
            </div>
          `;
        }).join('');
        
        container.querySelectorAll('.chat-item-card').forEach(card => {
          card.addEventListener('click', async () => {
            const peerId = card.getAttribute('data-peer-id');
            const peerName = card.getAttribute('data-peer-name');
            this.clean();
            
            const { BerthoChat } = await import('./chat.js');
            new BerthoChat({ id: peerId, username: peerName }, () => {
              new BerthoChatList(this.onClose);
            }, true);
          });
        });
      } else if (!isSilent) {
        container.innerHTML = `
          <div class="chat-list-empty">
            Aucune causerie active.<br/><br/>
            Allez dans le <strong>Top Joueurs</strong> pour démarrer une discussion avec vos alliés !
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
    const el = document.getElementById('chat-list-modal-overlay');
    if (el && el.parentNode) el.parentNode.removeChild(el);
    if (this.onClose) this.onClose();
  }
}