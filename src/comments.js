// ============================================================================
// 📁 BERTHOPLAY — AVIS & NOTES (SRC/COMMENTS.JS) [INTÉGRAL]
// ============================================================================

import { API } from './services/api.js';
import { BerthoUI } from './ui-dialogs.js';

export class BerthoComments {
  constructor(gameId, gameTitle, onClose) {
    this.gameId = gameId;
    this.gameTitle = gameTitle;
    this.onClose = onClose;
    this.selectedRating = 5;
    this.openModal();
  }
  
  async openModal() {
    this.clean();
    
    const state = JSON.parse(localStorage.getItem('BERTHOPLAY_V1') || '{}');
    const user = state.currentUser;
    
    const modal = document.createElement('div');
    modal.id = 'comments-widget-overlay';
    modal.innerHTML = `
      <style>
        .cmt-overlay { position:fixed; top:0; left:0; width:100vw; height:100dvh; background:rgba(3,3,10,0.96); z-index:9999; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:20px; color:#fff; backdrop-filter:blur(20px); box-sizing:border-box; }
        .cmt-box { background:rgba(15,23,42,0.95); border:1px solid #38bdf8; border-radius:20px; padding:22px; width:90%; max-width:400px; text-align:center; box-shadow:0 10px 30px rgba(0,0,0,0.8); box-sizing:border-box; }
        .cmt-title { font-size:1.1rem; font-weight:900; color:#38bdf8; margin-bottom:12px; }
        .cmt-stars-select { font-size:2rem; margin-bottom:12px; cursor:pointer; display:flex; justify-content:center; gap:6px; }
        .cmt-input { width:100%; padding:12px; background:#0f172a; border:1px solid #334155; border-radius:10px; color:#fff; font-size:0.9rem; margin-bottom:12px; outline:none; box-sizing:border-box; }
        .cmt-btn { width:100%; padding:12px; background:linear-gradient(135deg, #0284c7, #0369a1); border:none; border-radius:10px; color:#fff; font-weight:900; cursor:pointer; text-transform:uppercase; touch-action:manipulation; }
        .cmt-list { max-height:160px; overflow-y:auto; text-align:left; margin-bottom:15px; border-top:1px solid #1e293b; padding-top:10px; display:flex; flex-direction:column; gap:6px; }
        .cmt-item { background:#0f172a; padding:8px 12px; border-radius:8px; border:1px solid #1e293b; }
        .cmt-item-header { display:flex; justify-content:space-between; font-size:0.75rem; font-weight:bold; color:#38bdf8; margin-bottom:3px; }
        .cmt-item-body { font-size:0.8rem; color:#cbd5e1; word-break:break-word; }
      </style>

      <div class="cmt-overlay" id="cmt-backdrop">
        <div class="cmt-box">
          <div class="cmt-title">💬 AVIS & NOTES (${this.gameTitle})</div>

          <div class="cmt-list" id="cmt-list-container">
            <p style="font-size:0.8rem; color:#64748b; text-align:center;">Chargement des avis...</p>
          </div>

          <div class="cmt-stars-select" id="cmt-stars-selector">
            <span data-star="1">⭐</span>
            <span data-star="2">⭐</span>
            <span data-star="3">⭐</span>
            <span data-star="4">⭐</span>
            <span data-star="5">⭐</span>
          </div>

          <input type="text" id="cmt-text-input" class="cmt-input" placeholder="Laissez un avis rapide sur ce jeu..." />
          <button class="cmt-btn" id="btn-submit-cmt">PUBLIER MON AVIS 🚀</button>
          <button class="cmt-btn" id="btn-close-cmt" style="background:#1e293b; margin-top:8px;">FERMER</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('btn-close-cmt')?.addEventListener('click', () => this.clean());
    document.getElementById('cmt-backdrop')?.addEventListener('click', (e) => {
      if (e.target.id === 'cmt-backdrop') this.clean();
    });
    
    const starSpans = modal.querySelectorAll('#cmt-stars-selector span');
    starSpans.forEach(span => {
      span.addEventListener('click', () => {
        this.selectedRating = parseInt(span.getAttribute('data-star'), 10);
        starSpans.forEach((s, idx) => {
          s.style.opacity = (idx < this.selectedRating) ? '1.0' : '0.25';
        });
      });
    });
    
    const submitBtn = document.getElementById('btn-submit-cmt');
    const inputEl = document.getElementById('cmt-text-input');
    
    submitBtn?.addEventListener('click', async () => {
      const content = inputEl?.value?.trim();
      if (!content) {
        if (typeof BerthoUI !== 'undefined') {
          BerthoUI.alert("AVIS", "Veuillez écrire un commentaire avant de publier.");
        } else {
          alert("Veuillez écrire un commentaire.");
        }
        return;
      }
      
      const username = user ? user.username : 'Joueur Anonyme';
      const userId = user ? user.id : 'guest';
      
      submitBtn.innerText = "PUBLICATION...";
      submitBtn.disabled = true;
      
      const res = await API.comments.add(userId, username, this.gameId, this.selectedRating, content);
      
      if (res && res.success) {
        if (typeof BerthoUI !== 'undefined') {
          BerthoUI.toast("AVIS PUBLIÉ", "Votre note a été enregistrée avec succès ! 🌟");
        } else {
          alert("Avis publié avec succès ! 🌟");
        }
        this.clean();
      } else {
        submitBtn.innerText = "PUBLIER MON AVIS 🚀";
        submitBtn.disabled = false;
      }
    });
    
    this.loadComments();
  }
  
  async loadComments() {
    const container = document.getElementById('cmt-list-container');
    if (!container) return;
    
    const res = await API.comments.getForGame(this.gameId);
    if (res && res.success && res.comments && res.comments.length > 0) {
      container.innerHTML = res.comments.map(c => `
        <div class="cmt-item">
          <div class="cmt-item-header">
            <span>👤 ${this.escapeHtml(c.username)}</span>
            <span>${'⭐'.repeat(c.rating || 5)}</span>
          </div>
          <div class="cmt-item-body">${this.escapeHtml(c.content)}</div>
        </div>
      `).join('');
    } else {
      container.innerHTML = `<p style="font-size:0.8rem; color:#64748b; text-align:center;">Soyez le premier à donner votre avis !</p>`;
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
    const el = document.getElementById('comments-widget-overlay');
    if (el && el.parentNode) el.parentNode.removeChild(el);
    if (this.onClose) this.onClose();
  }
}