// ============================================================================
// 📁 BERTHOPLAY — MODALE ABONNÉS & ABONNEMENTS (SRC/VIEWS/SOCIAL-LISTS.JS) [SANDBOX]
// ============================================================================

import { BerthoChat } from '../chat.js';
import { BerthoUI } from '../ui-dialogs.js';

// Mode Sandbox : Listes sociales simulées localement
const IS_SANDBOX = true;

export class BerthoSocialLists {
  static open(targetUser, listType = 'followers') {
    const existing = document.getElementById('social-list-modal-overlay');
    if (existing && existing.parentNode) existing.parentNode.removeChild(existing);
    
    const modal = document.createElement('div');
    modal.id = 'social-list-modal-overlay';
    modal.innerHTML = `
      <style>
        .social-overlay {
          position: fixed; top: 0; left: 0; width: 100vw; height: 100dvh;
          background: rgba(3, 3, 10, 0.96); z-index: 99998; display: flex;
          align-items: center; justify-content: center; padding: 15px; box-sizing: border-box;
          backdrop-filter: blur(20px);
        }
        .social-box {
          background: #0f172a; border: 1px solid rgba(56, 189, 248, 0.3);
          border-radius: 20px; padding: 18px; width: 100%; max-width: 420px;
          height: 75vh; display: flex; flex-direction: column; justify-content: space-between;
          box-sizing: border-box; box-shadow: 0 15px 35px rgba(0,0,0,0.8);
        }
        .social-header {
          display: flex; justify-content: space-between; align-items: center;
          border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 10px; margin-bottom: 10px;
        }
        .social-title { font-size: 1rem; font-weight: 900; color: #38bdf8; letter-spacing: 0.5px; }
        .social-items-list { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 8px; }
        .social-item-card {
          background: #1e293b; border: 1px solid #334155; border-radius: 14px;
          padding: 10px 12px; display: flex; justify-content: space-between; align-items: center;
        }
        .social-item-left { display: flex; align-items: center; gap: 10px; }
        .social-avatar {
          width: 36px; height: 36px; border-radius: 50%; background: #0284c7;
          display: flex; align-items: center; justify-content: center; font-weight: 900; color: #fff;
        }
        .social-username { font-size: 0.85rem; font-weight: 800; color: #fff; }
        .btn-social-msg {
          background: rgba(56, 189, 248, 0.15); border: 1px solid #38bdf8; color: #38bdf8;
          padding: 6px 10px; border-radius: 10px; font-size: 0.72rem; font-weight: 800; cursor: pointer;
        }
      </style>

      <div class="social-overlay" id="social-backdrop">
        <div class="social-box">
          <div class="social-header">
            <span class="social-title">${listType === 'followers' ? 'Abonnés' : 'Abonnements'} (${targetUser.username})</span>
            <button id="btn-close-social-list" style="background:none; border:none; color:#94a3b8; cursor:pointer;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <div class="social-items-list" id="social-list-content">
            <p style="text-align:center; color:#64748b; font-size:0.8rem; margin:auto;">Chargement de la liste...</p>
          </div>

          <button id="btn-close-social-bottom" style="width:100%; padding:10px; background:#1e293b; border:1px solid #334155; color:#fff; border-radius:12px; font-weight:bold; cursor:pointer; margin-top:10px;">FERMER</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    const close = () => { if (modal.parentNode) modal.parentNode.removeChild(modal); };
    document.getElementById('social-backdrop')?.addEventListener('click', (e) => {
      if (e.target.id === 'social-backdrop') close();
    });
    document.getElementById('btn-close-social-list')?.addEventListener('click', close);
    document.getElementById('btn-close-social-bottom')?.addEventListener('click', close);
    
    this.fetchSocialList(targetUser.id, listType);
  }
  
  static fetchSocialList(userId, listType) {
    const container = document.getElementById('social-list-content');
    if (!container) return;
    
    // Données de démonstration Sandbox fidèles
    const mockUsers = listType === 'followers' ?
      [
        { id: 'usr_gervis', username: 'Gervis' },
        { id: 'usr_mum', username: 'Mum' },
        { id: 'usr_benie', username: 'Bénie' },
        { id: 'usr_saint', username: 'Saint' }
      ] :
      [
        { id: 'usr_gervis', username: 'Gervis' },
        { id: 'usr_benie', username: 'Bénie' },
        { id: 'usr_boanerges', username: 'De boanerges' }
      ];
    
    container.innerHTML = mockUsers.map(u => `
      <div class="social-item-card">
        <div class="social-item-left">
          <div class="social-avatar">${(u.username || 'A')[0].toUpperCase()}</div>
          <span class="social-username">${u.username}</span>
        </div>
        <button class="btn-social-msg" data-user-id="${u.id}" data-username="${u.username}">DISCUTER</button>
      </div>
    `).join('');
    
    container.querySelectorAll('.btn-social-msg').forEach(btn => {
      btn.onclick = () => {
        const uid = btn.getAttribute('data-user-id');
        const uname = btn.getAttribute('data-username');
        const modal = document.getElementById('social-list-modal-overlay');
        if (modal && modal.parentNode) modal.parentNode.removeChild(modal);
        new BerthoChat({ id: uid, username: uname });
      };
    });
  }
}