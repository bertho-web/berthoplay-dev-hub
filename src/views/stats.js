// ============================================================================
// BERTHOPLAY — CLASSEMENTS : TOP JOUEURS & TOP CLANS
// ============================================================================

import { API } from '../services/api.js';
import { BerthoUI } from '../ui-dialogs.js';
import { BerthoClanManager } from '../clans.js';
import { i18n } from '../i18n.js';
import { icon } from '../components/icons.js';

// Le drapeau seul ne dit rien à un lecteur d'écran : on garde le nom du pays.
const COUNTRIES = {
  CG: 'Congo', CD: 'RD Congo', CM: 'Cameroun', GA: 'Gabon',
  CI: "Côte d'Ivoire", SN: 'Sénégal', FR: 'France', BE: 'Belgique',
  US: 'États-Unis', CA: 'Canada', MA: 'Maroc', DZ: 'Algérie'
};

// Rang : la couleur ne porte jamais seule l'information — le numéro reste écrit.
const MEDALS = ['var(--gold-lit)', '#C0C4CC', '#C68A4B'];

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
      <div class="section">
        <h1 class="t-screen-title">${i18n.t('navTop') || 'Classements'}</h1>
      </div>

      <div class="segmented" role="tablist" aria-label="Type de classement">
        <button class="segmented__item" type="button" role="tab" id="tab-st-players"
                aria-selected="${this.activeTab === 'players'}" aria-controls="st-content-body">
          Joueurs
        </button>
        <button class="segmented__item" type="button" role="tab" id="tab-st-clans"
                aria-selected="${this.activeTab === 'clans'}" aria-controls="st-content-body">
          Clans
        </button>
      </div>

      <div id="st-content-body" role="tabpanel" style="margin-top:var(--sp-4);" aria-busy="true">
        ${this.skeleton()}
      </div>
    `;

    this.container.innerHTML = '';
    this.container.appendChild(view);

    document.getElementById('tab-st-players')?.addEventListener('click', () => {
      if (this.activeTab === 'players') return;
      this.activeTab = 'players';
      this.render();
    });

    document.getElementById('tab-st-clans')?.addEventListener('click', () => {
      if (this.activeTab === 'clans') return;
      this.activeTab = 'clans';
      this.render();
    });

    if (this.activeTab === 'players') this.loadTopPlayers();
    else this.loadTopClans();
  }

  skeleton() {
    return `<div class="panel panel--flush">
      ${Array.from({ length: 5 }, () => `
        <div class="list-row" style="cursor:default;">
          <div class="skeleton skeleton--avatar"></div>
          <div class="grow">
            <div class="skeleton skeleton--text" style="width:60%;"></div>
            <div class="skeleton skeleton--text" style="width:35%; margin-bottom:0;"></div>
          </div>
        </div>`).join('')}
    </div>`;
  }

  /** Un état d'erreur doit toujours proposer une sortie, pas juste constater. */
  errorState(message) {
    return `
      <div class="empty">
        ${icon('alert-triangle', 'icon empty__icon')}
        <h2 class="empty__title">Classement indisponible</h2>
        <p class="empty__text">${message}</p>
        <button class="btn btn--secondary" type="button" id="btn-st-retry">Réessayer</button>
      </div>`;
  }

  // ==========================================================================
  // TOP JOUEURS
  // ==========================================================================

  async loadTopPlayers() {
    const body = document.getElementById('st-content-body');
    if (!body) return;

    let res;
    try {
      res = await API.leaderboard.getGlobal();
    } catch (e) {
      body.innerHTML = this.errorState("Le serveur n'a pas répondu. Vérifiez votre connexion.");
      body.removeAttribute('aria-busy');
      document.getElementById('btn-st-retry')?.addEventListener('click', () => this.loadTopPlayers());
      return;
    }

    body.removeAttribute('aria-busy');
    const players = (res && res.success && res.leaderboard) ? res.leaderboard : [];

    if (!players.length) {
      body.innerHTML = `
        <div class="empty">
          ${icon('trophy', 'icon empty__icon')}
          <h2 class="empty__title">Classement vierge</h2>
          <p class="empty__text">Personne n'a encore marqué. Gagnez une partie et prenez la première place.</p>
        </div>`;
      return;
    }

    body.innerHTML = `
      <ol class="panel panel--flush list" style="list-style:none;">
        ${players.map((p, i) => this.playerRow(p, i)).join('')}
      </ol>`;

    body.querySelectorAll('[data-profile]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.openProfile(btn.dataset.profile, btn.dataset.name, btn.dataset.country);
      });
    });
  }

  playerRow(item, index) {
    const rank = index + 1;
    const color = MEDALS[index] || 'var(--ink-3)';
    const country = COUNTRIES[item.country] || item.country || 'Congo';
    const verified = item.is_verified === 1 || item.is_verified === true;
    const name = this.escapeHtml(item.username);

    return `
      <li class="list-row" style="cursor:default;">
        <span class="t-num" style="color:${color}; min-width:2.2rem; font-size:var(--text-base);"
              aria-label="Rang ${rank}">${rank}</span>

        <span class="avatar avatar--sm" aria-hidden="true">${name.charAt(0)}</span>

        <span class="list-row__body">
          <span class="list-row__title">
            ${name}
            ${verified ? `<span title="Compte vérifié" style="color:var(--violet-lit); display:inline-flex; vertical-align:-3px;">
              ${icon('check-circle', 'icon icon--sm')}<span class="sr-only">Compte vérifié</span></span>` : ''}
          </span>
          <span class="list-row__sub">${country}</span>
        </span>

        <span class="list-row__end">
          <span class="badge badge--gold t-num">${(item.coins || 0).toLocaleString('fr-FR')}</span>
          <button class="btn btn--ghost btn--icon" type="button"
                  data-profile="${item.id}" data-name="${name}" data-country="${item.country || 'CG'}"
                  aria-label="Voir le profil de ${name}">
            ${icon('user')}
          </button>
        </span>
      </li>`;
  }

  async openProfile(id, username, country) {
    try {
      const accMod = await import('./account.js');
      const viewContainer = document.getElementById('main-tab-container');
      if (!viewContainer) return;

      document.querySelectorAll('#bottom-nav .nav-item').forEach(nav => {
        if (nav.getAttribute('data-tab') === 'account') nav.setAttribute('aria-current', 'page');
        else nav.removeAttribute('aria-current');
      });

      const accView = new accMod.AccountView(viewContainer);
      accView.activeSearchUser = { id, username, country };
      accView.render();
    } catch (e) {
      BerthoUI.error('Profil', "Ce profil n'a pas pu être ouvert.");
    }
  }

  // ==========================================================================
  // TOP CLANS
  // ==========================================================================

  async loadTopClans() {
    const body = document.getElementById('st-content-body');
    if (!body) return;

    let res;
    try {
      res = await API.clans.list();
    } catch (e) {
      body.innerHTML = this.errorState("Le serveur n'a pas répondu. Vérifiez votre connexion.");
      body.removeAttribute('aria-busy');
      document.getElementById('btn-st-retry')?.addEventListener('click', () => this.loadTopClans());
      return;
    }

    body.removeAttribute('aria-busy');
    const clans = (res && res.success && res.clans) ? res.clans : [];

    body.innerHTML = `
      <button class="btn btn--primary btn--cut btn--block" id="btn-open-clan-modal" type="button">
        ${icon('shield', 'icon icon--sm')} Fonder un clan
      </button>

      ${clans.length ? `
        <ol class="panel panel--flush list" style="list-style:none; margin-top:var(--sp-4);">
          ${clans.map((c, i) => this.clanRow(c, i)).join('')}
        </ol>` : `
        <div class="empty">
          ${icon('users', 'icon empty__icon')}
          <h2 class="empty__title">Aucun clan</h2>
          <p class="empty__text">Aucun clan n'existe encore. Fondez le premier et invitez vos alliés.</p>
        </div>`}
    `;

    body.querySelectorAll('[data-clan-id]').forEach(row => {
      row.addEventListener('click', () => {
        const found = clans.find(c => c.id === row.dataset.clanId);
        if (found) new BerthoClanManager(found);
      });
    });

    document.getElementById('btn-open-clan-modal')?.addEventListener('click', () => this.openClanCreation());
  }

  clanRow(c, index) {
    const rank = index + 1;
    const color = MEDALS[index] || 'var(--ink-3)';
    return `
      <li class="list-row" data-clan-id="${c.id}" role="button" tabindex="0">
        <span class="t-num" style="color:${color}; min-width:2.2rem; font-size:var(--text-base);"
              aria-label="Rang ${rank}">${rank}</span>
        <span class="avatar avatar--sm" aria-hidden="true">${icon('shield', 'icon icon--sm')}</span>
        <span class="list-row__body">
          <span class="list-row__title">${this.escapeHtml(c.name)}</span>
          <span class="list-row__sub">[${this.escapeHtml(c.tag)}]</span>
        </span>
        <span class="list-row__end">
          <span class="badge badge--gold t-num">${(c.total_coins || 500).toLocaleString('fr-FR')}</span>
          ${icon('chevron-right', 'icon tile__chevron')}
        </span>
      </li>`;
  }

  /**
   * Création de clan : deux champs, validés au ras du champ. Pas de modale
   * maison qui redéfinit ses propres boutons — le socle BerthoUI suffit.
   */
  openClanCreation() {
    const state = this.readState();

    if (!state.currentUser) {
      BerthoUI.confirm(
        'Connexion requise',
        'Fonder un clan demande un compte. Voulez-vous vous connecter maintenant ?',
        async () => {
          const module = await import('../auth.js');
          new module.BerthoAuth(() => this.render()).openAuthModal();
        },
        null,
        { confirmLabel: 'Se connecter' }
      );
      return;
    }

    const { overlay, close } = BerthoUI.mount({
      title: 'Fonder un clan',
      focusSelector: '#clan-name',
      body: `
        <div class="stack" style="gap:var(--sp-4);">
          <div class="field">
            <label class="field__label" for="clan-name">Nom du clan</label>
            <input class="input" id="clan-name" type="text" maxlength="28" placeholder="Brazza Cybers" autocomplete="off" />
          </div>
          <div class="field">
            <label class="field__label" for="clan-tag">Tag</label>
            <input class="input" id="clan-tag" type="text" maxlength="4" placeholder="BZZ"
                   style="text-transform:uppercase;" autocomplete="off" />
            <p class="field__hint">2 à 4 caractères, affichés à côté du nom des membres.</p>
          </div>
          <p class="field__error" id="clan-error" hidden>
            ${icon('alert-circle', 'icon icon--sm')}<span id="clan-error-text"></span>
          </p>
        </div>`,
      actions: `
        <button class="btn btn--secondary grow" id="clan-cancel" type="button">Annuler</button>
        <button class="btn btn--primary btn--cut grow" id="clan-submit" type="button">Fonder</button>`
    });

    const nameInput = overlay.querySelector('#clan-name');
    const tagInput = overlay.querySelector('#clan-tag');
    const error = overlay.querySelector('#clan-error');
    const errorText = overlay.querySelector('#clan-error-text');
    const submit = overlay.querySelector('#clan-submit');

    const fail = (msg, field) => {
      errorText.textContent = msg;
      error.hidden = false;
      field?.setAttribute('aria-invalid', 'true');
      field?.focus();
    };

    [nameInput, tagInput].forEach(el => el.addEventListener('input', () => {
      error.hidden = true;
      el.removeAttribute('aria-invalid');
    }));

    submit.addEventListener('click', async () => {
      const name = nameInput.value.trim();
      const tag = tagInput.value.trim().toUpperCase();

      if (name.length < 3) return fail('Le nom doit faire au moins 3 caractères.', nameInput);
      if (tag.length < 2)  return fail('Le tag doit faire 2 à 4 caractères.', tagInput);

      submit.dataset.loading = 'true';
      const user = this.readState().currentUser;

      try {
        const res = await API.clans.create(name, tag, user.id, user.username);
        delete submit.dataset.loading;

        if (res && res.success) {
          close();
          BerthoUI.toast('Clan fondé', `${name} [${tag}] est né.`, 'success');
          new BerthoClanManager(res.clan);
          this.loadTopClans();
        } else {
          fail(res?.error || "Ce nom ou ce tag est peut-être déjà pris.", nameInput);
        }
      } catch (e) {
        delete submit.dataset.loading;
        fail("Le serveur n'a pas répondu. Réessayez dans un instant.", nameInput);
      }
    });

    overlay.querySelector('#clan-cancel').addEventListener('click', close);
  }

  // ==========================================================================

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
