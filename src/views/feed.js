// ============================================================================
// BERTHOPLAY — FIL D'ACTUALITÉS & ANNONCES
// ============================================================================

import { BerthoUI } from '../ui-dialogs.js';
import { BerthoClanManager } from '../clans.js';
import { i18n } from '../i18n.js';
import { icon } from '../components/icons.js';

// Mode Sandbox : fil simulé localement
const IS_SANDBOX = true;

// Chaque type d'événement a son glyphe et son accent. Le glyphe porte le sens
// autant que la couleur : lu en niveaux de gris, la carte reste identifiable.
const EVENT_KINDS = {
  ANNOUNCE:    { glyph: 'flame',  accent: 'var(--line-blood)',  color: 'var(--blood-lit)',  label: 'Annonce' },
  CLAN_CREATE: { glyph: 'shield', accent: 'var(--line-gold)',   color: 'var(--gold-lit)',   label: 'Clan' },
  USER_JOIN:   { glyph: 'user-plus', accent: 'var(--line-violet)', color: 'var(--violet-lit)', label: 'Communauté' }
};

export class FeedView {
  constructor(container) {
    this.container = container;
    this.following = new Set();
    this.render();
  }

  async render() {
    const view = document.createElement('div');
    view.className = 'tab-view-content';

    view.innerHTML = `
      <div class="section">
        <h1 class="t-screen-title">${i18n.t('navActus') || 'Actualités'}</h1>
        <p class="t-meta" style="margin-top:var(--sp-1);">Ce qui bouge sur la console</p>
      </div>

      <div id="ad-banner-container"></div>

      <div id="feed-items-container" aria-busy="true" aria-live="polite">
        ${this.skeleton()}
      </div>
    `;

    this.container.innerHTML = '';
    this.container.appendChild(view);

    this.loadAds();
    this.loadLiveFeed();
  }

  skeleton() {
    return Array.from({ length: 3 }, () => `
      <div class="panel" style="margin-bottom:var(--sp-3);">
        <div class="skeleton skeleton--title"></div>
        <div class="skeleton skeleton--text"></div>
        <div class="skeleton skeleton--text" style="width:70%;"></div>
      </div>`).join('');
  }

  // ==========================================================================
  // ENCART SPONSORISÉ
  // ==========================================================================

  loadAds() {
    const box = document.getElementById('ad-banner-container');
    if (!box) return;

    const ad = {
      id: 'ad_demo_1',
      title: 'Le nouveau moteur 3D',
      body: 'Testez le rendu temps réel du Billard 3D Pro.',
      image_url: '/pwa-192x192.png',
      target_url: 'app://game_billiards'
    };

    box.innerHTML = `
      <article class="panel panel--action" id="btn-ad-click-wrapper" data-id="${ad.id}"
               role="button" tabindex="0" style="display:flex; gap:var(--sp-3); align-items:center; margin-bottom:var(--sp-4);">
        <img src="${ad.image_url}" alt="" width="54" height="54"
             style="border-radius:var(--r-sm); flex:0 0 auto;" loading="lazy" />
        <div class="grow">
          <span class="badge badge--neutral">Sponsorisé</span>
          <p class="list-row__title" style="margin-top:var(--sp-1);">${this.escapeHtml(ad.title)}</p>
          <p class="list-row__sub">${this.escapeHtml(ad.body)}</p>
        </div>
        ${icon('chevron-right', 'icon tile__chevron')}
      </article>
    `;

    const wrapper = document.getElementById('btn-ad-click-wrapper');
    const go = () => this.handleDeeplinkNavigation(ad.target_url);
    wrapper?.addEventListener('click', go);
    wrapper?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); }
    });
  }

  // ==========================================================================
  // FIL
  // ==========================================================================

  loadLiveFeed() {
    const container = document.getElementById('feed-items-container');
    if (!container) return;

    const state = this.readState();
    const currentUser = state.currentUser;

    const events = [
      {
        id: 'ev_1', event_type: 'ANNOUNCE',
        title: 'Offre de bienvenue',
        message: 'Sept jeux instantanés vous attendent. Chaque victoire rapporte des Berthocoins.',
        target_url: 'app://game_bubble',
        created_at: new Date().toISOString()
      },
      {
        id: 'ev_2', event_type: 'CLAN_CREATE',
        title: 'Nouveau clan fondé',
        message: 'Le clan WARRIORS 242 vient d\'être créé. Rejoignez-le pour partager la cagnotte.',
        user_id: 'usr_gervis', username: 'Gervis',
        created_at: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: 'ev_3', event_type: 'USER_JOIN',
        title: 'Nouvelle alliée',
        message: 'Bénie vient de rejoindre la communauté BerthoPlay.',
        user_id: 'usr_benie', username: 'Bénie',
        created_at: new Date(Date.now() - 7200000).toISOString()
      }
    ];

    container.removeAttribute('aria-busy');

    if (!events.length) {
      container.innerHTML = `
        <div class="empty">
          ${icon('bell', 'icon empty__icon')}
          <h2 class="empty__title">Fil silencieux</h2>
          <p class="empty__text">Aucune activité pour l'instant. Lancez une partie : votre première victoire apparaîtra ici.</p>
        </div>`;
      return;
    }

    container.innerHTML = events.map(ev => this.eventCard(ev, currentUser)).join('');
    this.bindFeedEvents(container);
  }

  eventCard(ev, currentUser) {
    const kind = EVENT_KINDS[ev.event_type] || EVENT_KINDS.ANNOUNCE;
    const isSelf = currentUser && ev.user_id === currentUser.id;
    const hasLink = ev.target_url && ev.target_url !== 'null';
    const canFollow = ev.user_id && !isSelf && ev.user_id !== 'admin';

    return `
      <article class="panel" style="margin-bottom:var(--sp-3); border-color:${kind.accent};">
        <header class="panel__head" style="margin-bottom:var(--sp-2);">
          <span class="row" style="gap:var(--sp-2); color:${kind.color};">
            ${icon(kind.glyph, 'icon icon--sm')}
            <span class="t-label" style="color:${kind.color};">${kind.label}</span>
          </span>
          <time class="t-meta" datetime="${ev.created_at}">${this.relativeTime(ev.created_at)}</time>
        </header>

        <h2 class="list-row__title" style="white-space:normal; margin-bottom:var(--sp-1);">${this.escapeHtml(ev.title)}</h2>
        <p class="t-body" style="font-size:var(--text-sm);">${this.escapeHtml(ev.message)}</p>

        ${(canFollow || ev.event_type === 'CLAN_CREATE' || (ev.event_type === 'ANNOUNCE' && hasLink)) ? `
          <div class="row" style="gap:var(--sp-2); margin-top:var(--sp-4); flex-wrap:wrap;">
            ${canFollow ? `
              <button class="btn btn--secondary btn--sm" type="button"
                      data-follow="${ev.user_id}" data-username="${this.escapeHtml(ev.username || 'Joueur')}"
                      aria-pressed="false">
                ${icon('user-plus', 'icon icon--sm')} <span>S'abonner</span>
              </button>` : ''}

            ${ev.event_type === 'CLAN_CREATE' ? `
              <button class="btn btn--outline btn--sm btn-view-clan" type="button">
                ${icon('shield', 'icon icon--sm')} Voir le clan
              </button>` : ''}

            ${(ev.event_type === 'ANNOUNCE' && hasLink) ? `
              <button class="btn btn--primary btn--cut btn--sm btn-announce-cta" type="button"
                      data-url="${this.escapeHtml(ev.target_url)}">
                ${icon('play', 'icon icon--sm icon--fill')} Jouer
              </button>` : ''}
          </div>` : ''}
      </article>`;
  }

  bindFeedEvents(container) {
    // Abonnement : l'état est porté par aria-pressed, pas par le texte du bouton.
    container.querySelectorAll('[data-follow]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.follow;
        const name = btn.dataset.username;
        const wasFollowing = this.following.has(id);

        if (wasFollowing) this.following.delete(id);
        else this.following.add(id);

        const now = !wasFollowing;
        btn.setAttribute('aria-pressed', String(now));
        btn.classList.toggle('btn--secondary', !now);
        btn.classList.toggle('btn--outline', now);
        btn.querySelector('span').textContent = now ? 'Abonné' : "S'abonner";

        BerthoUI.toast(
          now ? 'Abonnement' : 'Désabonnement',
          now ? `Vous suivez ${name}.` : `Vous ne suivez plus ${name}.`,
          now ? 'success' : 'info'
        );
      });
    });

    container.querySelectorAll('.btn-view-clan').forEach(btn => {
      btn.addEventListener('click', () => {
        new BerthoClanManager({
          id: 'clan_demo',
          name: 'WARRIORS 242',
          tag: 'W242',
          owner_id: 'usr_gervis',
          total_coins: 1500,
          description: 'Clan officiel de démonstration.'
        });
      });
    });

    container.querySelectorAll('.btn-announce-cta').forEach(btn => {
      btn.addEventListener('click', () => this.handleDeeplinkNavigation(btn.dataset.url));
    });
  }

  // ==========================================================================
  // NAVIGATION
  // ==========================================================================

  handleDeeplinkNavigation(targetUrl) {
    if (!targetUrl) return;

    if (!targetUrl.startsWith('app://')) {
      // noopener : une page ouverte ne doit jamais garder la main sur la nôtre.
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    const route = targetUrl.replace('app://', '');

    if (route.startsWith('profile/')) this.openUserProfile(route.replace('profile/', ''));
    else if (route === 'clan_hub' || route === 'clans') this.switchToTab('stats');
    else if (route === 'feed') this.switchToTab('feed');
    else if (route.startsWith('game_')) this.switchToTab('home');
  }

  async openUserProfile(userId) {
    try {
      const accMod = await import('./account.js');
      const viewContainer = document.getElementById('main-tab-container');
      if (!viewContainer) return;

      document.querySelectorAll('#bottom-nav .nav-item').forEach(nav => {
        if (nav.getAttribute('data-tab') === 'account') nav.setAttribute('aria-current', 'page');
        else nav.removeAttribute('aria-current');
      });

      const accView = new accMod.AccountView(viewContainer);
      accView.activeSearchUser = { id: userId, username: 'Joueur' };
      accView.render();
    } catch (e) {
      BerthoUI.error('Profil', "Ce profil n'a pas pu être ouvert.");
    }
  }

  switchToTab(tabName) {
    document.querySelector(`#bottom-nav [data-tab="${tabName}"]`)?.click();
  }

  // ==========================================================================

  /** « il y a 2 h » plutôt qu'une date brute : plus lisible dans un fil. */
  relativeTime(iso) {
    const diff = Date.now() - new Date(iso).getTime();
    const min = Math.floor(diff / 60000);
    if (min < 1) return "à l'instant";
    if (min < 60) return `il y a ${min} min`;
    const h = Math.floor(min / 60);
    if (h < 24) return `il y a ${h} h`;
    const d = Math.floor(h / 24);
    return d === 1 ? 'hier' : `il y a ${d} j`;
  }

  readState() {
    try { return JSON.parse(localStorage.getItem('BERTHOPLAY_V1') || '{}'); }
    catch (e) { return {}; }
  }

  escapeHtml(str) {
    return String(str ?? '').replace(/[&<>"']/g, c => (
      { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    ));
  }
}
