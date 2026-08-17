// ============================================================================
// 📁 BERTHOPLAY — ESPACE COMPTE JOUEUR (SRC/VIEWS/ACCOUNT.JS) [INTÉGRAL]
// ============================================================================

import { API } from '../services/api.js';
import { BerthoAuth } from '../auth.js';
import { BerthoChatList, BerthoChat } from '../chat.js';
import { BerthoUI } from '../ui-dialogs.js';
import { i18n } from '../i18n.js';
import { BerthoPostWidget } from '../components/post-widget.js';
import { BerthoAccountSettings } from './account-settings.js';
import { BerthoSocialLists } from './social-lists.js';

const COUNTRY_MAP = {
  'CG': 'Congo 🇨🇬', 'CD': 'RDCongo 🇨🇩', 'CM': 'Cameroun 🇨🇲', 'GA': 'Gabon 🇬🇦',
  'CI': 'Côte d\'Ivoire 🇨🇮', 'SN': 'Sénégal 🇸🇳', 'FR': 'France 🇫🇷', 'BE': 'Belgique 🇧🇪',
  'US': 'États-Unis 🇺🇸', 'CA': 'Canada 🇨🇦', 'MA': 'Maroc 🇲🇦', 'DZ': 'Algérie 🇩🇿', 'OTHER': 'International 🌐'
};

const GAME_TITLE_MAP = {
  billiards: { title: 'BILLARD 3D PRO', type: 'wins' },
  bubble: { title: 'BUBBLE SHOOTER AAA', type: 'level', max: 50 },
  car: { title: 'CONDUITE & COURSE', type: 'level', max: 10 },
  bike: { title: 'MOTO SUPERBIKE', type: 'level', max: 10 },
  checkers: { title: 'DAMES PRO', type: 'wins' },
  chess: { title: 'ÉCHECS DANGER', type: 'wins' },
  horde: { title: 'HORDE SURVIVOR 3D', type: 'score' }
};

export class AccountView {
  constructor(container, onUpdate) {
    this.container = container;
    this.onUpdate = onUpdate;
    this.isVisitorView = false;
    this.activeSearchUser = null;
    this.activeTab = 'posts';
    this.userPosts = [];
    this.unreadChatCount = 0;
    this.liveStats = { 
      followersCount: 4, 
      followingCount: 3, 
      isFollowing: false, 
      coins: 1650,
      country: 'CG',
      clanName: 'Aucun Clan',
      scores: {
        bubble: 1,
        car: 1,
        bike: 1,
        billiards: 0,
        checkers: 0,
        chess: 0,
        horde: 0
      }
    };
    
    window.addEventListener('languageChanged', () => this.render());
    this.render();
  }

  getRankTitle(coins = 0) {
    if (coins >= 5000) return "LÉGENDE ULTIME BERTHOPLAY";
    if (coins >= 1500) return "GAMER ELITE BERTHOPLAY";
    if (coins >= 500) return "GAMER CONFIRMÉ";
    return "JOUEUR INITIÉ";
  }

  getCountryDisplayName(isoCode) {
    return COUNTRY_MAP[isoCode] || COUNTRY_MAP['OTHER'] || isoCode;
  }

  async fetchUnreadChatBadge() {
    if (!this.currentUser) return;
    const res = await API.chat.getConversations(this.currentUser.id);
    if (res && res.success && res.conversations) {
      let totalUnread = 0;
      res.conversations.forEach(c => totalUnread += (parseInt(c.unread_count, 10) || 0));
      this.unreadChatCount = totalUnread;
      this.updateBadgeUI();
    }
  }

  updateBadgeUI() {
    const badgeEl = document.getElementById('chat-unread-badge-pill');
    if (badgeEl) {
      if (this.unreadChatCount > 0) {
        badgeEl.style.display = 'inline-flex';
        badgeEl.textContent = this.unreadChatCount;
      } else {
        badgeEl.style.display = 'none';
      }
    }
  }

  async render() {
    const state = JSON.parse(localStorage.getItem('BERTHOPLAY_V1') || '{}');
    const user = state.currentUser;
    this.currentUser = user;
    this.targetUser = this.activeSearchUser || user;

    const view = document.createElement('div');
    view.className = 'tab-view-content';

    if (user) {
      const isSelf = this.targetUser.id === user.id;
      const canEditPhoto = isSelf && !this.isVisitorView;
      const themeColor = this.targetUser.theme_color || '#38bdf8';
      const rankTitle = this.getRankTitle(this.liveStats.coins || this.targetUser.coins || 0);

      view.innerHTML = `
        <style>
          .acc-page { padding: 10px; max-width: 480px; margin: 0 auto; color: #fff; box-sizing: border-box; font-family: -apple-system, sans-serif; }
          
          .acc-search-box {
            display: flex; gap: 8px; margin-bottom: 12px; background: rgba(15, 23, 42, 0.9);
            border: 1px solid rgba(255,255,255,0.1); padding: 6px 8px; border-radius: 16px; backdrop-filter: blur(10px);
          }
          .acc-search-input { flex: 1; background: transparent; border: none; outline: none; color: #fff; padding: 6px 8px; font-size: 0.82rem; }
          .acc-search-btn { background: #0284c7; border: none; color: #fff; padding: 6px 12px; border-radius: 10px; font-weight: 900; cursor: pointer; font-size: 0.78rem; }

          .acc-card {
            background: #0f172a; border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 22px; padding: 18px 14px; text-align: center; backdrop-filter: blur(15px);
            margin-bottom: 12px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6); position: relative; box-sizing: border-box;
          }
          .visitor-badge {
            position: absolute; top: 12px; left: 12px; background: rgba(251, 191, 36, 0.15);
            border: 1px solid #fbbf24; color: #fbbf24; font-size: 0.62rem; font-weight: 900;
            padding: 3px 8px; border-radius: 8px; text-transform: uppercase; display: flex; align-items: center; gap: 4px;
          }
          
          .acc-avatar-container { position: relative; width: 80px; height: 80px; margin: 0 auto 10px; cursor: ${canEditPhoto ? 'pointer' : 'default'}; }
          .acc-avatar {
            width: 100%; height: 100%; border-radius: 50%;
            background: linear-gradient(135deg, #0284c7, ${themeColor});
            display: flex; align-items: center; justify-content: center;
            font-size: 2.2rem; font-weight: 900; color: #fff; border: 3px solid ${themeColor};
            box-shadow: 0 0 20px ${themeColor}40; overflow: hidden; margin: 0 auto; object-fit: cover;
          }
          .camera-badge-btn {
            position: absolute; bottom: 0; right: 2px; width: 24px; height: 24px;
            background: #0284c7; border: 2px solid #0f172a; border-radius: 50%;
            display: flex; align-items: center; justify-content: center; color: #fff;
            box-shadow: 0 2px 8px rgba(0,0,0,0.5);
          }
          .online-dot {
            position: absolute; bottom: 2px; left: 2px; width: 12px; height: 12px;
            background: #22c55e; border: 2px solid #0f172a; border-radius: 50%;
            box-shadow: 0 0 8px #22c55e;
          }

          .acc-username { font-size: 1.25rem; font-weight: 900; color: #fff; margin-bottom: 2px; display: flex; align-items: center; justify-content: center; gap: 6px; }
          .verified-check { color: #38bdf8; display: inline-flex; }
          .acc-rank { font-size: 0.7rem; color: ${themeColor}; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
          .acc-bio-box {
            background: rgba(3, 3, 12, 0.6); border: 1px solid #1e293b; border-radius: 12px;
            padding: 8px 10px; font-size: 0.78rem; color: #cbd5e1; font-style: italic; margin: 8px 0 12px;
            line-height: 1.4; word-break: break-word;
          }
          .acc-social-counters {
            display: flex; justify-content: space-around; background: #030308;
            padding: 10px 6px; border-radius: 14px; border: 1px solid #1e293b; margin-bottom: 14px;
          }
          .social-counter-item { text-align: center; cursor: pointer; flex: 1; }
          .social-counter-item h5 { font-size: 0.62rem; color: #94a3b8; text-transform: uppercase; margin: 0 0 3px 0; font-weight: 800; }
          .social-counter-item p { font-size: 1rem; font-weight: 900; color: #fff; margin: 0; }

          .acc-actions-grid {
            display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin-bottom: 6px; width: 100%; box-sizing: border-box;
          }
          .acc-btn-action {
            width: 100%; padding: 10px 6px; border-radius: 12px; font-weight: 900; font-size: 0.72rem;
            cursor: pointer; text-transform: uppercase; display: flex; align-items: center; justify-content: center;
            gap: 6px; transition: transform 0.15s ease; border: none; box-sizing: border-box; white-space: nowrap;
          }
          .btn-blue { background: linear-gradient(135deg, #0284c7, #0369a1); color: #fff; }
          .btn-green { background: linear-gradient(135deg, #059669, #0d9488); color: #fff; }
          .btn-dark { background: #1e293b; border: 1px solid #334155; color: #cbd5e1; }
          .btn-full-grid { grid-column: span 2; }

          .unread-pill-badge {
            background: #ef4444; color: #fff; font-size: 0.68rem; font-weight: 900;
            padding: 2px 7px; border-radius: 10px; display: none;
            box-shadow: 0 0 8px rgba(239, 68, 68, 0.6); margin-left: 4px;
          }

          .btn-publish-post {
            width: 100%; padding: 12px; background: linear-gradient(135deg, #0284c7, #0369a1);
            border: none; border-radius: 14px; color: #fff; font-weight: 900; font-size: 0.82rem;
            cursor: pointer; margin-bottom: 14px; display: flex; align-items: center; justify-content: center;
            gap: 8px; text-transform: uppercase; letter-spacing: 0.5px;
          }

          .profile-nav-tabs {
            display: flex; gap: 4px; border-bottom: 1px solid rgba(255,255,255,0.1); margin-bottom: 12px;
          }
          .nav-tab-btn {
            flex: 1; padding: 10px 4px; background: none; border: none; color: #64748b;
            font-weight: 800; font-size: 0.75rem; cursor: pointer; border-bottom: 2px solid transparent;
            display: flex; align-items: center; justify-content: center; gap: 4px;
          }
          .nav-tab-btn.active { color: ${themeColor}; border-bottom-color: ${themeColor}; }
        </style>

        <div class="acc-page">
          <div class="acc-search-box">
            <input type="text" id="input-search-username" class="acc-search-input" placeholder="${i18n.t('searchPlaceholder')}" />
            <button id="btn-do-search-user" class="acc-search-btn">CHERCHER</button>
          </div>

          <div class="acc-card">
            ${(!isSelf || this.isVisitorView) ? `
              <div class="visitor-badge">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                PROFIL PUBLIC
              </div>` : ''
            }

            <div class="acc-avatar-container" id="btn-open-avatar-studio">
              ${this.targetUser.avatar_url 
                ? `<img src="${this.targetUser.avatar_url}" class="acc-avatar" />`
                : `<div class="acc-avatar">${(this.targetUser.username || 'A')[0].toUpperCase()}</div>`
              }
              ${canEditPhoto ? `
                <div class="camera-badge-btn">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                </div>` : ''
              }
              <div class="online-dot" title="En Direct"></div>
            </div>

            <div class="acc-username">
              ${this.targetUser.username}
              <span class="verified-check" title="Profil Vérifié">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              </span>
            </div>
            <div class="acc-rank">${rankTitle}</div>

            <div class="acc-bio-box">"${this.targetUser.bio || 'Joueur BerthoPlay 🎮'}"</div>

            <div class="acc-social-counters">
              <div class="social-counter-item" id="click-stat-followers">
                <h5>${i18n.t('followers')}</h5>
                <p id="lbl-followers-count">${this.liveStats.followersCount}</p>
              </div>
              <div class="social-counter-item" id="click-stat-following">
                <h5>${i18n.t('following')}</h5>
                <p id="lbl-following-count">${this.liveStats.followingCount}</p>
              </div>
              <div class="social-counter-item">
                <h5>${i18n.t('coins')}</h5>
                <p style="color:#fbbf24;" id="lbl-coins-count">${this.liveStats.coins || this.targetUser.coins || 0}</p>
              </div>
            </div>

            ${isSelf && !this.isVisitorView ? `
              <div class="acc-actions-grid">
                <button class="acc-btn-action btn-blue" id="btn-open-my-chats">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  Discussions
                  <span class="unread-pill-badge" id="chat-unread-badge-pill">0</span>
                </button>
                <button class="acc-btn-action btn-green" id="btn-toggle-visitor">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  VUE VISITEUR
                </button>
                <button class="acc-btn-action btn-dark btn-full-grid" id="btn-open-edit-settings">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                  PARAMÈTRES PROFIL
                </button>
              </div>
            ` : `
              <div class="acc-actions-grid">
                <button class="acc-btn-action btn-blue" id="btn-visitor-subscribe">${this.liveStats.isFollowing ? '✔ ABONNÉ' : '➕ S\'ABONNER'}</button>
                <button class="acc-btn-action btn-green" id="btn-visitor-chat">DISCUTER</button>
                ${!isSelf ? `<button class="acc-btn-action btn-dark btn-full-grid" id="btn-reset-to-my-profile">MON PROFIL</button>` : `<button class="acc-btn-action btn-dark btn-full-grid" id="btn-toggle-visitor">QUITTER VUE</button>`}
              </div>
            `}
          </div>

          <button class="btn-publish-post" id="btn-publish-user-post">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
            PUBLIER UN MESSAGE / POST
          </button>

          <div class="profile-nav-tabs">
            <button class="nav-tab-btn active" id="tab-btn-posts">PUBLICATIONS</button>
            <button class="nav-tab-btn" id="tab-btn-stats">CARRIÈRE</button>
            <button class="nav-tab-btn" id="tab-btn-trophies">TROPHÉES</button>
          </div>

          <div id="profile-tab-content">
            <p style="text-align:center; color:#64748b; font-size:0.8rem; padding:20px;">Chargement...</p>
          </div>
        </div>
      `;
    } else {
      view.innerHTML = `
        <style>
          .acc-login-page { padding: 20px 15px; max-width: 400px; margin: 20px auto; text-align: center; color: #fff; box-sizing: border-box; }
          .acc-card-guest { background: rgba(15, 23, 42, 0.95); border: 1px solid #38bdf8; border-radius: 24px; padding: 30px 20px; backdrop-filter: blur(15px); box-shadow: 0 15px 35px rgba(0,0,0,0.8), 0 0 15px rgba(56,189,248,0.2); box-sizing: border-box; text-align: center; }
          .acc-guest-title { font-size: 1.4rem; font-weight: 900; color: #38bdf8; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
          .acc-guest-desc { color: #cbd5e1; font-size: 0.88rem; line-height: 1.5; margin-bottom: 22px; font-weight: 500; }
          .acc-btn-login { width: 100%; padding: 14px; background: linear-gradient(135deg, #0284c7, #0369a1); border: none; border-radius: 14px; color: #fff; font-weight: 900; cursor: pointer; text-transform: uppercase; font-size: 0.85rem; letter-spacing: 0.5px; }
        </style>

        <div class="acc-login-page">
          <div class="acc-card-guest">
            <div style="margin-bottom: 14px; display:flex; justify-content:center;">
              <svg width="54" height="54" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><rect x="2" y="6" width="20" height="12" rx="2"/><line x1="6" y1="12" x2="10" y2="12"/><line x1="8" y1="10" x2="8" y2="14"/><circle cx="15" cy="13" r="1"/><circle cx="18" cy="11" r="1"/></svg>
            </div>
            <div class="acc-guest-title">Compte</div>
            <p class="acc-guest-desc">
              Connectez-vous pour débloquer votre profil joueur, échanger des messages avec vos alliés et faire briller vos victoires en temps réel !
            </p>
            <button class="acc-btn-login" id="page-btn-open-auth">SE CONNECTER / S'INSCRIRE</button>
          </div>
        </div>
      `;
    }

    this.container.innerHTML = '';
    this.container.appendChild(view);

    if (user) {
      const isSelf = this.targetUser.id === user.id;

      this.fetchRealTimeSocialStats();
      this.fetchUnreadChatBadge();

      document.getElementById('btn-publish-user-post')?.addEventListener('click', () => {
        this.openPostComposerModal(user);
      });

      document.getElementById('btn-do-search-user')?.addEventListener('click', () => this.searchUserByUsername());

      document.getElementById('btn-open-my-chats')?.addEventListener('click', () => {
        new BerthoChatList(() => this.fetchUnreadChatBadge());
      });

      document.getElementById('btn-toggle-visitor')?.addEventListener('click', () => {
        this.isVisitorView = !this.isVisitorView;
        this.render();
      });

      document.getElementById('btn-reset-to-my-profile')?.addEventListener('click', () => {
        this.activeSearchUser = null;
        this.isVisitorView = false;
        this.render();
      });

      document.getElementById('btn-open-edit-settings')?.addEventListener('click', () => {
        BerthoAccountSettings.open(user, (updatedUser) => {
          this.currentUser = updatedUser;
          this.targetUser = updatedUser;
          this.render();
        });
      });

      document.getElementById('click-stat-followers')?.addEventListener('click', () => {
        BerthoSocialLists.open(this.targetUser, 'followers');
      });

      document.getElementById('click-stat-following')?.addEventListener('click', () => {
        BerthoSocialLists.open(this.targetUser, 'following');
      });

      document.getElementById('btn-visitor-subscribe')?.addEventListener('click', () => {
        this.liveStats.isFollowing = !this.liveStats.isFollowing;
        this.liveStats.followersCount += this.liveStats.isFollowing ? 1 : -1;
        this.render();
      });

      document.getElementById('btn-visitor-chat')?.addEventListener('click', () => {
        if (this.targetUser.id === user.id) return;
        new BerthoChat({ id: this.targetUser.id, username: this.targetUser.username });
      });

      document.getElementById('tab-btn-posts')?.addEventListener('click', () => this.switchTab('posts'));
      document.getElementById('tab-btn-stats')?.addEventListener('click', () => this.switchTab('stats'));
      document.getElementById('tab-btn-trophies')?.addEventListener('click', () => this.switchTab('trophies'));

      this.loadUserPosts();
    } else {
      document.getElementById('page-btn-open-auth')?.addEventListener('click', async () => {
        try {
          const authMod = await import('../auth.js');
          const auth = new authMod.BerthoAuth(() => this.render());
          auth.openAuthModal();
        } catch(e) {}
      });
    }
  }

  openPostComposerModal(user) {
    const modal = document.createElement('div');
    modal.id = 'post-composer-modal';
    modal.innerHTML = `
      <style>
        .composer-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100dvh; background: rgba(3,3,10,0.96); z-index: 99999; display: flex; align-items: center; justify-content: center; padding: 15px; box-sizing: border-box; backdrop-filter: blur(20px); }
        .composer-box { background: #0f172a; border: 1px solid rgba(56, 189, 248, 0.4); border-radius: 20px; padding: 18px; width: 100%; max-width: 420px; color: #fff; box-shadow: 0 15px 35px rgba(0,0,0,0.8); }
        .composer-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 8px; }
        .composer-title { font-size: 0.95rem; font-weight: 900; color: #38bdf8; }
        .composer-textarea { width: 100%; height: 110px; background: #030308; border: 1px solid #334155; border-radius: 12px; color: #fff; font-size: 0.85rem; padding: 10px; box-sizing: border-box; outline: none; resize: none; font-family: -apple-system, sans-serif; margin-bottom: 12px; }
        .composer-actions { display: flex; gap: 8px; }
      </style>

      <div class="composer-overlay" id="composer-backdrop">
        <div class="composer-box">
          <div class="composer-header">
            <span class="composer-title">PUBLIER SUR VOTRE PROFIL</span>
            <button id="btn-close-composer" style="background:none; border:none; color:#94a3b8; cursor:pointer;">✕</button>
          </div>
          <textarea id="composer-text-input" class="composer-textarea" placeholder="Que souhaitez-vous partager avec vos alliés ?"></textarea>
          <div class="composer-actions">
            <button id="btn-submit-composed-post" style="flex:1; padding:12px; background:linear-gradient(135deg, #0284c7, #0369a1); border:none; border-radius:12px; color:#fff; font-weight:900; cursor:pointer;">PUBLIER</button>
            <button id="btn-cancel-composer" style="padding:12px 16px; background:#1e293b; border:1px solid #334155; border-radius:12px; color:#94a3b8; font-weight:bold; cursor:pointer;">ANNULER</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const close = () => { if (modal.parentNode) modal.parentNode.removeChild(modal); };
    document.getElementById('btn-close-composer')?.addEventListener('click', close);
    document.getElementById('btn-cancel-composer')?.addEventListener('click', close);

    document.getElementById('btn-submit-composed-post')?.addEventListener('click', async () => {
      const text = document.getElementById('composer-text-input')?.value?.trim();
      if (!text) return;

      const res = await API.posts.create(user.id, user.username, `POST DE ${user.username.toUpperCase()}`, text);
      if (res && res.success) {
        close();
        BerthoUI.toast("PUBLICATION PUBLIÉE", "Votre message est affiché !");
        this.loadUserPosts();
      }
    });
  }

  switchTab(tab) {
    this.activeTab = tab;
    ['posts', 'stats', 'trophies'].forEach(t => {
      document.getElementById(`tab-btn-${t}`)?.classList.toggle('active', t === tab);
    });

    const content = document.getElementById('profile-tab-content');
    if (!content) return;

    if (tab === 'posts') {
      this.renderPostsTab(content);
    } else if (tab === 'stats') {
      this.renderStatsTab(content);
    } else if (tab === 'trophies') {
      this.renderTrophiesTab(content);
    }
  }

  renderPostsTab(container) {
    if (this.userPosts.length > 0) {
      container.innerHTML = this.userPosts.map(p => BerthoPostWidget.renderPostHTML(p, this.currentUser)).join('');
      this.userPosts.forEach(p => {
        BerthoPostWidget.bindPostEvents(p, this.currentUser, () => this.loadUserPosts());
      });
    } else {
      container.innerHTML = `<div style="text-align:center; color:#64748b; font-size:0.8rem; padding:30px;">Aucune publication pour le moment.</div>`;
    }
  }

  renderStatsTab(container) {
    const scores = this.liveStats.scores || {};
    const country = this.liveStats.country || 'Congo 🇨🇬';
    const clanName = this.liveStats.clanName || 'Aucun Clan';

    const scoreKeys = Object.keys(scores);
    let gamesRowsHTML = scoreKeys.map(gameId => {
      const val = scores[gameId];
      const meta = GAME_TITLE_MAP[gameId] || {
        title: gameId.replace(/_/g, ' ').toUpperCase(),
        type: (typeof val === 'number' ? 'wins' : 'score')
      };

      let valText = '';
      if (meta.type === 'wins') {
        valText = `${val || 0} Victoires`;
      } else if (meta.type === 'level') {
        valText = `Niveau ${val || 1} ${meta.max ? '/ ' + meta.max : ''}`;
      } else {
        valText = `Score Max : ${val || 0}`;
      }

      return `
        <div class="career-row">
          <span class="game-title-badge">${meta.title}</span>
          <span class="game-stat-val">${valText}</span>
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <style>
        .career-box { background:#0f172a; border:1px solid rgba(255,255,255,0.08); border-radius:16px; padding:16px; font-size:0.82rem; line-height:1.6; }
        .career-row { display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px solid rgba(255,255,255,0.05); }
        .career-row:last-child { border-bottom:none; }
        .game-title-badge { font-weight:800; color:#cbd5e1; }
        .game-stat-val { font-weight:900; color:#38bdf8; }
      </style>

      <div class="career-box">
        <div class="career-row">
          <span style="color:#94a3b8;">Secteur / Région :</span>
          <span style="font-weight:bold; color:#fff;">${country}</span>
        </div>
        <div class="career-row">
          <span style="color:#94a3b8;">Clan Actuel :</span>
          <span style="font-weight:bold; color:#38bdf8;">${clanName}</span>
        </div>

        <div style="margin-top:12px; font-size:0.72rem; color:#94a3b8; font-weight:900; text-transform:uppercase; letter-spacing:0.5px;">
          STATISTIQUES DE JEUX EN DIRECT
        </div>

        ${gamesRowsHTML}
      </div>
    `;
  }

  renderTrophiesTab(container) {
    let trophies = [
      { title: 'Gamer Elite', desc: '1 500+ Coins' },
      { title: 'Pionnier PWA', desc: 'Membre Fondateur' }
    ];

    let trophiesHTML = trophies.map(t => `
      <div style="background:#0f172a; border:1px solid rgba(255,255,255,0.08); border-radius:14px; padding:14px; text-align:center;">
        <div style="display:flex; justify-content:center; margin-bottom:6px;">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2"><path d="M8 21h8m-4-4v4m-5-9a5 5 0 0 0 10 0V3H7v5z"/></svg>
        </div>
        <div style="font-size:0.8rem; font-weight:bold; color:#fff;">${t.title}</div>
        <div style="font-size:0.65rem; color:#64748b;">${t.desc}</div>
      </div>
    `).join('');

    container.innerHTML = `<div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:10px;">${trophiesHTML}</div>`;
  }

  async searchUserByUsername() {
    const input = document.getElementById('input-search-username');
    const query = input?.value?.trim();
    if (!query) return;

    const res = await API.auth.search(query);
    if (res && res.success && res.users && res.users.length > 0) {
      this.activeSearchUser = res.users[0];
      this.render();
    } else {
      BerthoUI.alert("RECHERCHE", i18n.t('searchNoResult') || "Joueur introuvable.");
    }
  }

  fetchRealTimeSocialStats() {
    const followersLbl = document.getElementById('lbl-followers-count');
    const followingLbl = document.getElementById('lbl-following-count');
    const coinsLbl = document.getElementById('lbl-coins-count');

    if (followersLbl) followersLbl.innerText = this.liveStats.followersCount;
    if (followingLbl) followingLbl.innerText = this.liveStats.followingCount;
    if (coinsLbl) coinsLbl.innerText = this.liveStats.coins;

    if (this.activeTab === 'stats') {
      const content = document.getElementById('profile-tab-content');
      if (content) this.renderStatsTab(content);
    } else if (this.activeTab === 'trophies') {
      const content = document.getElementById('profile-tab-content');
      if (content) this.renderTrophiesTab(content);
    }
  }

  async loadUserPosts() {
    const res = await API.posts.list(this.targetUser.id);
    if (res && res.success && res.posts) {
      this.userPosts = res.posts;
      if (this.activeTab === 'posts') {
        const content = document.getElementById('profile-tab-content');
        if (content) this.renderPostsTab(content);
      }
    }
  }

  escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
}