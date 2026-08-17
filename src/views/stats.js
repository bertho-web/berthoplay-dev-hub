// ============================================================================
// 🎮 BERTHOPLAY — CLASSEMENTS TOP JOUEURS & TOP CLANS (SRC/VIEWS/STATS.JS) [INTÉGRAL]
// ============================================================================

import { API } from '../services/api.js';
import { BerthoUI } from '../ui-dialogs.js';
import { BerthoClanManager } from '../clans.js';
import { i18n } from '../i18n.js';

const COUNTRY_FLAGS = {
  'CG': 'Congo 🇨🇬', 'CD': 'RDCongo 🇨🇩', 'CM': 'Cameroun 🇨🇲', 'GA': 'Gabon 🇬🇦',
  'CI': 'Côte d\'Ivoire 🇨🇮', 'SN': 'Sénégal 🇸🇳', 'FR': 'France 🇫🇷', 'BE': 'Belgique 🇧🇪',
  'US': 'États-Unis 🇺🇸', 'CA': 'Canada 🇨🇦', 'MA': 'Maroc 🇲🇦', 'DZ': 'Algérie 🇩🇿'
};

const VERIFIED_BADGE_SVG = `
  <svg width="15" height="15" viewBox="0 0 24 24" fill="#38bdf8" style="vertical-align:middle; margin-left:3px;">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
  </svg>
`;

export class StatsView {
  constructor(container) {
    this.container = container;
    this.activeTab = 'players';
    this.render();
  }
  
  async render() {
    const view = document.createElement('div');
    view.className = 'tab-view-content';
    view.innerHTML = `
      <style>
        .st-page { padding: 15px; max-width: 500px; margin: 0 auto; color: #fff; box-sizing: border-box; font-family: -apple-system, sans-serif; }
        .st-tabs { display: flex; gap: 10px; margin-bottom: 15px; }
        .st-tab { flex: 1; padding: 12px; background: #0f172a; border: 1px solid #1e293b; color: #94a3b8; border-radius: 12px; font-weight: 900; cursor: pointer; text-align: center; font-size: 0.85rem; transition: all 0.2s; }
        .st-tab.active { background: #0284c7; color: #fff; border-color: #38bdf8; box-shadow: 0 0 15px rgba(56, 189, 248, 0.3); }
        .st-card { background: rgba(15, 23, 42, 0.85); border: 1px solid #1e293b; border-radius: 16px; padding: 15px; margin-bottom: 12px; backdrop-filter: blur(10px); }
        .st-rank-item { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #1e293b; font-size: 0.85rem; font-weight: bold; }
        .st-rank-item:last-child { border-bottom: none; }
        .btn-create-clan { width: 100%; padding: 14px; background: linear-gradient(135deg, #059669, #0d9488); border: none; border-radius: 14px; color: #fff; font-weight: 900; cursor: pointer; text-transform: uppercase; margin-bottom: 15px; box-shadow: 0 4px 15px rgba(5,150,105,0.3); letter-spacing: 0.5px; }
        
        .btn-view-profile { 
          padding: 6px 12px; background: rgba(56,189,248,0.15); border: 1px solid #38bdf8; 
          color: #38bdf8; border-radius: 10px; font-size: 0.72rem; font-weight: bold; 
          cursor: pointer; display: flex; align-items: center; gap: 4px; 
        }

        .clan-modal-overlay { 
          position: fixed; top: 0; left: 0; width: 100vw; height: 100dvh; 
          background: rgba(3, 3, 12, 0.95); backdrop-filter: blur(20px); 
          z-index: 99999; display: none; align-items: center; justify-content: center; padding: 15px; box-sizing: border-box; 
        }
        .clan-modal-box { 
          background: #0f172a; border: 1px solid #34d399; padding: 25px; 
          border-radius: 22px; width: 100%; max-width: 360px; text-align: center; 
          box-shadow: 0 15px 35px rgba(0,0,0,0.8), 0 0 20px rgba(52,211,153,0.2); box-sizing: border-box; 
        }
        .clan-input { width: 100%; padding: 12px; background: #030308; border: 1px solid #334155; border-radius: 12px; color: #fff; font-size: 0.9rem; margin-bottom: 12px; box-sizing: border-box; outline: none; }
        .clan-input:focus { border-color: #34d399; }
      </style>

      <div class="st-page">
        <div class="st-tabs">
          <div class="st-tab ${this.activeTab === 'players' ? 'active' : ''}" id="tab-st-players">🏆 TOP JOUEURS</div>
          <div class="st-tab ${this.activeTab === 'clans' ? 'active' : ''}" id="tab-st-clans">🛡️ TOP CLANS</div>
        </div>

        <div id="st-content-body">
          <p style="text-align:center; color:#94a3b8;">Chargement des classements...</p>
        </div>
      </div>

      <!-- MODALE CRÉATION CLAN -->
      <div class="clan-modal-overlay" id="modal-create-clan-overlay">
        <div class="clan-modal-box">
          <h2 style="color:#34d399; font-size:1.1rem; margin-bottom:14px; font-weight:900; text-transform:uppercase;">🛡️ FONDER UN CLAN</h2>
          <input type="text" id="clan-name-input" class="clan-input" placeholder="Nom du Clan (ex: Brazza Cybers)" />
          <input type="text" id="clan-tag-input" class="clan-input" placeholder="TAG (ex: BZZ)" maxlength="4" style="text-transform:uppercase;" />
          <button id="btn-submit-clan" style="width:100%; padding:13px; background:linear-gradient(135deg, #059669, #0d9488); border:none; border-radius:12px; color:#fff; font-weight:900; cursor:pointer; text-transform:uppercase;">VALIDER LA CRÉATION 🚀</button>
          <button id="btn-close-clan" style="width:100%; padding:10px; background:#1e293b; border:1px solid #334155; color:#cbd5e1; border-radius:12px; font-weight:bold; cursor:pointer; margin-top:8px;">ANNULER</button>
        </div>
      </div>
    `;
    
    this.container.innerHTML = '';
    this.container.appendChild(view);
    
    document.getElementById('tab-st-players')?.addEventListener('click', () => {
      this.activeTab = 'players';
      this.render();
    });
    
    document.getElementById('tab-st-clans')?.addEventListener('click', () => {
      this.activeTab = 'clans';
      this.render();
    });
    
    if (this.activeTab === 'players') {
      this.loadTopPlayers();
    } else {
      this.loadTopClans();
    }
  }
  
  async loadTopPlayers() {
    const body = document.getElementById('st-content-body');
    if (!body) return;
    
    const res = await API.leaderboard.getGlobal();
    
    if (res && res.success && res.leaderboard && res.leaderboard.length > 0) {
      body.innerHTML = `
        <div class="st-card">
          ${res.leaderboard.map((item, idx) => {
            const rankMedal = idx === 0 ? '🥇' : (idx === 1 ? '🥈' : (idx === 2 ? '🥉' : `#${idx + 1}`));
            const countryText = COUNTRY_FLAGS[item.country] || item.country || 'Congo 🇨🇬';
            const isVerified = item.is_verified === 1 || item.is_verified === true;

            return `
              <div class="st-rank-item">
                <span style="display:flex; align-items:center; gap:4px;">
                  <strong style="color:#fbbf24; margin-right:4px;">${rankMedal}</strong> 
                  ${this.escapeHtml(item.username)}
                  ${isVerified ? VERIFIED_BADGE_SVG : ''}
                  <small style="color:#94a3b8; font-weight:normal; margin-left:4px;">(${countryText})</small>
                </span>
                <div style="display:flex; gap:8px; align-items:center;">
                  <span style="color:#fbbf24;">${item.coins || 0} 🪙</span>
                  <button class="btn-view-profile" data-id="${item.id}" data-name="${this.escapeHtml(item.username)}" data-country="${item.country || 'CG'}">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    PROFIL
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
      
      body.querySelectorAll('.btn-view-profile').forEach(btn => {
        btn.addEventListener('click', async () => {
          const peerId = btn.getAttribute('data-id');
          const peerName = btn.getAttribute('data-name');
          const peerCountry = btn.getAttribute('data-country');

          try {
            const accMod = await import('./account.js');
            const viewContainer = document.getElementById('main-tab-container');

            document.querySelectorAll('#bottom-nav-bar .nav-item').forEach(nav => {
              nav.classList.toggle('active', nav.getAttribute('data-tab') === 'account');
            });

            if (viewContainer) {
              const accView = new accMod.AccountView(viewContainer);
              accView.activeSearchUser = { id: peerId, username: peerName, country: peerCountry };
              accView.render();
            }
          } catch(e) {
            BerthoUI.error("PROFIL", "Impossible de charger le profil.");
          }
        });
      });
      
    } else {
      body.innerHTML = `<div class="st-card" style="text-align:center; color:#94a3b8;">Soyez le premier joueur dans le classement !</div>`;
    }
  }
  
  async loadTopClans() {
    const body = document.getElementById('st-content-body');
    if (!body) return;
    
    const res = await API.clans.list();
    const clans = (res && res.success && res.clans) ? res.clans : [];
    
    let clansHTML = '';
    if (clans.length > 0) {
      clansHTML = clans.map((c, idx) => `
        <div class="st-rank-item clan-click-card" style="cursor:pointer;" data-clan-id="${c.id}">
          <span>${idx === 0 ? '🥇' : (idx === 1 ? '🥈' : (idx === 2 ? '🥉' : `#${idx + 1}`))} ${c.logo || '🛡️'} <strong>${this.escapeHtml(c.name)}</strong> [${this.escapeHtml(c.tag)}]</span>
          <span style="color:#fbbf24;">${c.total_coins || 500} 🪙 ➔</span>
        </div>
      `).join('');
    } else {
      clansHTML = `<div style="text-align:center; color:#94a3b8; padding:10px;">Soyez le premier groupe fondé sur BerthoPlay !</div>`;
    }
    
    body.innerHTML = `
      <button class="btn-create-clan" id="btn-open-clan-modal">🛡️ FONDER UN GROUPE / CLAN</button>
      <div class="st-card">${clansHTML}</div>
    `;
    
    body.querySelectorAll('.clan-click-card').forEach(card => {
      card.addEventListener('click', () => {
        const clanId = card.getAttribute('data-clan-id');
        const found = clans.find(c => c.id === clanId);
        if (found) new BerthoClanManager(found);
      });
    });
    
    const modalOverlay = document.getElementById('modal-create-clan-overlay');

    document.getElementById('btn-open-clan-modal')?.addEventListener('click', async () => {
      const state = JSON.parse(localStorage.getItem('BERTHOPLAY_V1') || '{}');
      if (!state.currentUser) {
        BerthoUI.confirm(
          "CONNEXION REQUISE",
          "Vous devez être connecté pour fonder un Clan. Se connecter maintenant ?",
          async () => {
            const module = await import('../auth.js');
            const auth = new module.BerthoAuth(() => this.render());
            auth.openAuthModal();
          }
        );
        return;
      }
      if (modalOverlay) modalOverlay.style.display = 'flex';
    });
    
    document.getElementById('btn-close-clan')?.addEventListener('click', () => {
      if (modalOverlay) modalOverlay.style.display = 'none';
    });
    
    document.getElementById('btn-submit-clan')?.addEventListener('click', async () => {
      const state = JSON.parse(localStorage.getItem('BERTHOPLAY_V1') || '{}');
      const user = state.currentUser;
      const name = document.getElementById('clan-name-input')?.value?.trim();
      const tag = document.getElementById('clan-tag-input')?.value?.trim();
      
      if (!name || !tag) {
        BerthoUI.alert("CHAMPS INCOMPLETS", "Saisissez un nom et un TAG pour votre clan.");
        return;
      }
      
      const createRes = await API.clans.create(name, tag, user.id, user.username);
      if (createRes && createRes.success) {
        BerthoUI.toast("CLAN CRÉÉ !", "Félicitations, votre clan est fondé ! 🎉");
        if (modalOverlay) modalOverlay.style.display = 'none';
        new BerthoClanManager(createRes.clan);
        this.loadTopClans();
      } else {
        BerthoUI.alert("ERREUR", createRes?.error || "Impossible de créer le clan.");
      }
    });
  }

  escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
}