// ============================================================================
// 📁 BERTHOPLAY — MODALE PARAMÈTRES (SRC/VIEWS/ACCOUNT-SETTINGS.JS) [SANDBOX]
// ============================================================================

import { BerthoUI } from '../ui-dialogs.js';

// Mode Sandbox : Mise à jour immédiate dans localStorage sans appel Worker
const IS_SANDBOX = true;

export class BerthoAccountSettings {
  static open(currentUser, onSaved) {
    const existing = document.getElementById('edit-profile-modal-overlay');
    if (existing && existing.parentNode) existing.parentNode.removeChild(existing);
    
    const themeColor = currentUser.theme_color || '#38bdf8';
    
    const modal = document.createElement('div');
    modal.id = 'edit-profile-modal-overlay';
    modal.innerHTML = `
      <style>
        .edit-modal-overlay {
          position: fixed; top: 0; left: 0; width: 100vw; height: 100dvh;
          background: rgba(3, 3, 10, 0.96); z-index: 99999; display: flex;
          align-items: center; justify-content: center; padding: 20px; box-sizing: border-box;
          backdrop-filter: blur(20px);
        }
        .edit-modal-box {
          background: #0f172a; border: 1px solid rgba(255,255,255,0.12); border-radius: 20px;
          padding: 22px; width: 100%; max-width: 400px; color: #fff;
          box-shadow: 0 15px 35px rgba(0,0,0,0.8);
        }
        .edit-modal-header {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 16px; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 10px;
        }
        .edit-modal-title { font-size: 1.05rem; font-weight: 900; color: #fff; display: flex; align-items: center; gap: 8px; }
        .edit-group { margin-bottom: 12px; text-align: left; }
        .edit-group label { display: block; font-size: 0.72rem; color: #94a3b8; font-weight: 800; margin-bottom: 4px; text-transform: uppercase; }
        .edit-input {
          width: 100%; padding: 10px 12px; background: #030308; border: 1px solid #334155;
          border-radius: 10px; color: #fff; font-size: 0.85rem; box-sizing: border-box; outline: none;
        }
        .edit-input:focus { border-color: #38bdf8; }
        .color-options { display: flex; gap: 10px; margin-top: 6px; }
        .color-circle { width: 30px; height: 30px; border-radius: 50%; cursor: pointer; border: 2px solid transparent; transition: transform 0.15s; }
        .color-circle.selected { border-color: #fff; transform: scale(1.15); box-shadow: 0 0 10px rgba(255,255,255,0.3); }
        .toggle-row { display: flex; justify-content: space-between; align-items: center; background: #030308; padding: 10px 12px; border-radius: 10px; border: 1px solid #334155; margin-bottom: 10px; font-size: 0.82rem; font-weight: 700; }
      </style>

      <div class="edit-modal-overlay" id="edit-backdrop">
        <div class="edit-modal-box">
          <div class="edit-modal-header">
            <span class="edit-modal-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2.5"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
              PARAMÈTRES PROFIL
            </span>
            <button id="btn-close-edit-modal" style="background:none; border:none; color:#94a3b8; cursor:pointer;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          
          <div class="edit-group">
            <label>PSEUDONYME JOUEUR</label>
            <input type="text" id="edit-username" class="edit-input" value="${currentUser.username || ''}" />
          </div>

          <div class="edit-group">
            <label>NOUVEAU MOT DE PASSE (Optionnel)</label>
            <input type="password" id="edit-password" class="edit-input" placeholder="Inchangé si vide" />
          </div>

          <div class="edit-group">
            <label>CITATION / STATUT</label>
            <input type="text" id="edit-bio" class="edit-input" value="${currentUser.bio || ''}" />
          </div>

          <div class="edit-group">
            <label>COULEUR D'ACCENT DU THÈME</label>
            <div class="color-options">
              <div class="color-circle ${themeColor === '#38bdf8' ? 'selected' : ''}" data-color="#38bdf8" style="background:#38bdf8;"></div>
              <div class="color-circle ${themeColor === '#34d399' ? 'selected' : ''}" data-color="#34d399" style="background:#34d399;"></div>
              <div class="color-circle ${themeColor === '#a855f7' ? 'selected' : ''}" data-color="#a855f7" style="background:#a855f7;"></div>
              <div class="color-circle ${themeColor === '#ef4444' ? 'selected' : ''}" data-color="#ef4444" style="background:#ef4444;"></div>
            </div>
          </div>

          <div class="toggle-row">
            <span>Profil Privé</span>
            <input type="checkbox" id="chk-private" ${currentUser.is_private ? 'checked' : ''} />
          </div>

          <div class="toggle-row">
            <span>Masquer les abonnés</span>
            <input type="checkbox" id="chk-hide-subs" ${currentUser.hide_subscribers ? 'checked' : ''} />
          </div>

          <button id="btn-save-profile-settings" style="width:100%; padding:12px; background:linear-gradient(135deg, #0284c7, #0369a1); border:none; border-radius:12px; color:#fff; font-weight:900; cursor:pointer; margin-top:10px;">ENREGISTRER</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    let selectedColor = themeColor;
    modal.querySelectorAll('.color-circle').forEach(circle => {
      circle.onclick = () => {
        modal.querySelectorAll('.color-circle').forEach(c => c.classList.remove('selected'));
        circle.classList.add('selected');
        selectedColor = circle.getAttribute('data-color');
      };
    });
    
    const close = () => { if (modal.parentNode) modal.parentNode.removeChild(modal); };
    
    document.getElementById('edit-backdrop')?.addEventListener('click', (e) => {
      if (e.target.id === 'edit-backdrop') close();
    });
    document.getElementById('btn-close-edit-modal')?.addEventListener('click', close);
    
    document.getElementById('btn-save-profile-settings')?.addEventListener('click', () => {
      const newName = document.getElementById('edit-username')?.value?.trim();
      const newBio = document.getElementById('edit-bio')?.value?.trim();
      const isPrivate = document.getElementById('chk-private')?.checked;
      const hideSubs = document.getElementById('chk-hide-subs')?.checked;
      
      if (!newName) {
        BerthoUI.alert("CHAMP INCOMPLET", "Le pseudonyme ne peut pas être vide.");
        return;
      }
      
      const state = JSON.parse(localStorage.getItem('BERTHOPLAY_V1') || '{}');
      state.currentUser = {
        ...state.currentUser,
        username: newName,
        bio: newBio,
        theme_color: selectedColor,
        is_private: isPrivate ? 1 : 0,
        hide_subscribers: hideSubs ? 1 : 0
      };
      localStorage.setItem('BERTHOPLAY_V1', JSON.stringify(state));
      
      close();
      if (onSaved) onSaved(state.currentUser);
      BerthoUI.toast("PROFIL MIS À JOUR", "Préférences sauvegardées !");
    });
  }
}