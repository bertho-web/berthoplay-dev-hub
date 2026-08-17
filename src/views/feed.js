// ============================================================================
// 🎮 BERTHOPLAY — VUE FIL D'ACTUALITÉS (SRC/VIEWS/FEED.JS) [DEV HUB SANDBOX]
// ============================================================================

import { BerthoUI } from '../ui-dialogs.js';
import { BerthoClanManager } from '../clans.js';
import { i18n } from '../i18n.js';

// Mode Sandbox : Fil d'actu et annonces simulés localement
const IS_SANDBOX = true;

export class FeedView {
  constructor(container) {
    this.container = container;
    this.render();
  }
  
  async render() {
    const view = document.createElement('div');
    view.className = 'tab-view-content';
    view.innerHTML = `
      <style>
        .feed-page { padding: 15px; max-width: 500px; margin: 0 auto; color: #fff; box-sizing: border-box; font-family: -apple-system, sans-serif; }
        .feed-title { font-size: 1.1rem; font-weight: 900; color: #38bdf8; margin-bottom: 15px; text-transform: uppercase; text-align: center; letter-spacing: 1px; display: flex; align-items: center; justify-content: center; gap: 8px; }
        .feed-card { background: rgba(15, 23, 42, 0.85); border: 1px solid #1e293b; border-radius: 18px; padding: 16px; margin-bottom: 14px; backdrop-filter: blur(10px); box-shadow: 0 4px 15px rgba(0,0,0,0.4); }
        .feed-card-header { display: flex; justify-content: space-between; font-size: 0.78rem; font-weight: bold; color: #38bdf8; margin-bottom: 8px; align-items: center; }
        .feed-card-body { font-size: 0.85rem; color: #cbd5e1; line-height: 1.5; margin-bottom: 12px; }
        .feed-actions-row { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
        .feed-cta-btn { padding: 8px 14px; background: rgba(56, 189, 248, 0.15); border: 1px solid #38bdf8; color: #38bdf8; border-radius: 12px; font-size: 0.75rem; font-weight: 900; cursor: pointer; transition: background 0.2s; display: inline-flex; align-items: center; gap: 6px; text-decoration: none; }
        .feed-cta-btn:active { background: rgba(56, 189, 248, 0.3); }
        .feed-follow-btn { padding: 8px 14px; background: linear-gradient(135deg, #0284c7, #0369a1); border: none; color: #fff; border-radius: 12px; font-size: 0.75rem; font-weight: 900; cursor: pointer; }
        
        .ad-banner-box { background: linear-gradient(135deg, rgba(2,132,199,0.2), rgba(15,23,42,0.9)); border: 1px solid #38bdf8; border-radius: 20px; padding: 14px; margin-bottom: 18px; text-align: center; box-shadow: 0 0 20px rgba(56,189,248,0.2); cursor: pointer; }
        .ad-banner-media { width: 100%; max-height: 180px; object-fit: cover; border-radius: 14px; margin-bottom: 10px; border: 1px solid rgba(56,189,248,0.3); display: block; }
      </style>

      <div class="feed-page">
        <div class="feed-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2.5"><path d="M19 20H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v1m2 13a2 2 0 0 1-2-2V7m2 13a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2m-4-3H9M7 16h6M7 12h10"/></svg>
          FIL D'ACTUALITÉS & ANNONCES
        </div>

        <!-- ESPACE BANNIÈRE PUBLICITAIRE DYNAMIQUE -->
        <div id="ad-banner-container"></div>

        <div id="feed-items-container">
          <p style="text-align:center; color:#94a3b8;">Chargement du fil d'actualités...</p>
        </div>
      </div>
    `;
    
    this.container.innerHTML = '';
    this.container.appendChild(view);
    
    this.loadAds();
    this.loadLiveFeed();
  }
  
  loadAds() {
    const box = document.getElementById('ad-banner-container');
    if (!box) return;
    
    // Démonstration d'annonce sponsorisée Sandbox
    const ad = {
      id: 'ad_demo_1',
      title: 'DÉCOUVREZ LE NOUVEAU MOTEUR 3D',
      image_url: 'logo.png',
      target_url: 'app://game_billiards'
    };

    box.innerHTML = `
      <div class="ad-banner-box" id="btn-ad-click-wrapper" data-id="${ad.id}">
        <span style="font-size:0.6rem; color:#38bdf8; font-weight:900; letter-spacing:1px; display:block; margin-bottom:6px;">SPONSORISÉ</span>
        <div style="display:flex; justify-content:center; padding:10px;">
          <img src="${ad.image_url}" style="width:60px; height:60px; border-radius:12px;" alt="${this.escapeHtml(ad.title)}" />
        </div>
        <button class="feed-cta-btn" style="background:#0284c7; color:#fff; border:none; padding:8px 16px;">
          ${this.escapeHtml(ad.title)} ➔
        </button>
      </div>
    `;
    
    document.getElementById('btn-ad-click-wrapper')?.addEventListener('click', () => {
      this.handleDeeplinkNavigation(ad.target_url);
    });
  }
  
  loadLiveFeed() {
    const container = document.getElementById('feed-items-container');
    if (!container) return;
    
    const state = JSON.parse(localStorage.getItem('BERTHOPLAY_V1') || '{}');
    const currentUser = state.currentUser;
    
    // Événements réalistes du fil d'actualité pour les tests
    const demoEvents = [
      {
        id: 'ev_1',
        event_type: 'ANNOUNCE',
        title: 'OFFRE DE BIENVENUE',
        message: 'Bienvenue sur la console BerthoPlay ! Jouez à nos 7 jeux instantanés et gagnez des BerthoCoins.',
        target_url: 'app://game_bubble',
        created_at: new Date().toISOString()
      },
      {
        id: 'ev_2',
        event_type: 'CLAN_CREATE',
        title: 'NOUVEAU CLAN CRÉÉ',
        message: 'Le clan "WARRIORS 242" a été fondé ! Rejoignez-les pour partager la cagnotte.',
        user_id: 'usr_gervis',
        username: 'Gervis',
        created_at: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: 'ev_3',
        event_type: 'USER_JOIN',
        title: 'NOUVEL ALLIÉ',
        message: 'Bénie vient de rejoindre la communauté BerthoPlay !',
        user_id: 'usr_benie',
        username: 'Bénie',
        created_at: new Date(Date.now() - 7200000).toISOString()
      }
    ];

    container.innerHTML = demoEvents.map(ev => {
      let cardStyle = "border-color:#1e293b;";
      let headerColor = "#38bdf8;";
      
      if (ev.event_type === 'ANNOUNCE') {
        cardStyle = "border-color:#38bdf8; background:rgba(2,132,201,0.15);";
      } else if (ev.event_type === 'CLAN_CREATE') {
        cardStyle = "border-color:#fbbf24; background:rgba(251,191,36,0.08);";
        headerColor = "#fbbf24;";
      } else if (ev.event_type === 'USER_JOIN') {
        cardStyle = "border-color:#34d399;";
        headerColor = "#34d399;";
      }
      
      const isSelf = currentUser && ev.user_id === currentUser.id;
      const hasLink = ev.target_url && ev.target_url !== 'null';
      
      return `
        <div class="feed-card" style="${cardStyle}">
          <div class="feed-card-header">
            <span style="color:${headerColor}">📢 ${this.escapeHtml(ev.title)}</span>
            <span style="color:#94a3b8;">En direct</span>
          </div>
          <div class="feed-card-body">${this.escapeHtml(ev.message)}</div>

          <div class="feed-actions-row">
            ${ev.user_id && !isSelf && ev.user_id !== 'admin' ? `
              <button class="feed-follow-btn" data-user-id="${ev.user_id}" data-username="${this.escapeHtml(ev.username || 'Joueur')}">➕ S'ABONNER</button>
            ` : ''}

            ${ev.event_type === 'CLAN_CREATE' ? `
              <button class="feed-cta-btn btn-view-clan" data-user-id="${ev.user_id}">
                VOIR LE CLAN 🛡️
              </button>
            ` : ''}

            ${(ev.event_type === 'ANNOUNCE' && hasLink) ? `
              <button class="feed-cta-btn btn-announce-cta" data-url="${this.escapeHtml(ev.target_url)}">
                JOUER MAINTENANT ➔
              </button>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');
    
    // Écouteurs Sandbox
    container.querySelectorAll('.feed-follow-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetName = btn.getAttribute('data-username');
        const isFollowed = btn.innerText.includes('ABONNÉ');
        btn.innerText = isFollowed ? "➕ S'ABONNER" : "✔ ABONNÉ";
        BerthoUI.toast("ABONNEMENT", !isFollowed ? `Vous êtes abonné à ${targetName} ! 🚀` : `Abonnement retiré.`);
      });
    });

    container.querySelectorAll('.btn-view-clan').forEach(btn => {
      btn.addEventListener('click', () => {
        new BerthoClanManager({
          id: 'clan_demo',
          name: 'WARRIORS 242',
          tag: 'W242',
          logo: '🛡️',
          owner_id: 'usr_gervis',
          total_coins: 1500,
          description: 'Clan officiel de démonstration Sandbox 🎮'
        });
      });
    });

    container.querySelectorAll('.btn-announce-cta').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetUrl = btn.getAttribute('data-url');
        if (targetUrl) this.handleDeeplinkNavigation(targetUrl);
      });
    });
  }

  handleDeeplinkNavigation(targetUrl) {
    if (!targetUrl) return;

    if (targetUrl.startsWith('app://')) {
      const route = targetUrl.replace('app://', '');

      if (route.startsWith('profile/')) {
        const userId = route.replace('profile/', '');
        this.openUserProfile(userId);
      } else if (route === 'clan_hub' || route === 'clans') {
        this.switchToTab('stats');
      } else if (route === 'feed') {
        this.switchToTab('feed');
      } else if (route.startsWith('game_')) {
        this.switchToTab('home');
      }
    } else {
      window.open(targetUrl, '_blank');
    }
  }

  async openUserProfile(userId) {
    try {
      const accMod = await import('./account.js');
      const viewContainer = document.getElementById('main-tab-container');

      document.querySelectorAll('#bottom-nav-bar .nav-item').forEach(nav => {
        nav.classList.toggle('active', nav.getAttribute('data-tab') === 'account');
      });

      if (viewContainer) {
        const accView = new accMod.AccountView(viewContainer);
        accView.activeSearchUser = { id: userId, username: 'Joueur' };
        accView.render();
      }
    } catch(e) {}
  }

  switchToTab(tabName) {
    const navItem = document.querySelector(`#bottom-nav-bar [data-tab="${tabName}"]`);
    if (navItem) navItem.click();
  }

  escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
}