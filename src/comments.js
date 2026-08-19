// ============================================================================
// BERTHOPLAY — AVIS & NOTES SUR UN JEU
// ============================================================================

import { API } from './services/api.js';
import { BerthoUI } from './ui-dialogs.js';
import { icon } from './components/icons.js';
import { BerthoSoundEffects } from './services/sound-effects.js';

export class BerthoComments {
  constructor(gameId, gameTitle, onClose) {
    this.gameId = gameId;
    this.gameTitle = gameTitle;
    this.onClose = onClose;
    this.selectedRating = 0;   // 0 = rien de choisi : on n'impose pas 5 étoiles
    this.previouslyFocused = document.activeElement;
    this.openModal();
  }

  async openModal() {
    this.clean(false);

    const modal = document.createElement('div');
    modal.id = 'comments-widget-overlay';
    modal.className = 'overlay-view';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'cmt-title');

    modal.innerHTML = `
      <header class="overlay-view__head">
        <button class="btn btn--icon btn--ghost" id="btn-close-cmt" type="button"
                data-sfx="back" aria-label="Fermer les avis">
          ${icon('arrow-left')}
        </button>
        <div class="grow">
          <h1 class="t-screen-title" id="cmt-title" style="font-size:var(--text-lg);">Avis</h1>
          <p class="t-meta">${this.escapeHtml(this.gameTitle || '')}</p>
        </div>
      </header>

      <div class="container" style="padding-bottom:var(--sp-10);">

        <section aria-label="Avis des joueurs" id="cmt-list-container" aria-busy="true">
          ${this.skeleton()}
        </section>

        <section class="panel" style="margin-top:var(--sp-5);" aria-labelledby="cmt-form-title">
          <h2 class="t-label" id="cmt-form-title" style="margin-bottom:var(--sp-3);">Votre avis</h2>

          <div class="field" style="margin-bottom:var(--sp-4);">
            <span class="field__label" id="cmt-rating-label">Note</span>
            <div class="row" style="gap:var(--sp-1);" role="radiogroup" aria-labelledby="cmt-rating-label" id="cmt-stars">
              ${[1, 2, 3, 4, 5].map(n => `
                <button class="btn btn--ghost btn--icon" type="button" role="radio"
                        aria-checked="false" data-star="${n}"
                        aria-label="${n} étoile${n > 1 ? 's' : ''}" data-sfx="none">
                  ${icon('star', 'icon icon--lg')}
                </button>`).join('')}
              <span class="t-meta" id="cmt-rating-out" style="margin-left:var(--sp-2);">Aucune note</span>
            </div>
          </div>

          <div class="field">
            <label class="field__label" for="cmt-text-input">Commentaire</label>
            <textarea class="textarea" id="cmt-text-input" maxlength="300"
                      placeholder="Ce qui vous a plu, ce qui pourrait être meilleur…"></textarea>
            <p class="field__hint"><output id="cmt-count">0</output>/300</p>
            <p class="field__error" id="cmt-error" hidden>
              ${icon('alert-circle', 'icon icon--sm')}<span id="cmt-error-text"></span>
            </p>
          </div>

          <button class="btn btn--primary btn--cut btn--block" id="btn-submit-cmt" type="button"
                  style="margin-top:var(--sp-4);">
            ${icon('send', 'icon icon--sm')} Publier
          </button>
        </section>
      </div>
    `;

    document.body.appendChild(modal);
    this.bind(modal);
    BerthoSoundEffects.playOpen();
    this.loadComments();
  }

  skeleton() {
    return `<div class="panel panel--flush">
      ${Array.from({ length: 2 }, () => `
        <div class="list-row" style="cursor:default;">
          <div class="skeleton skeleton--avatar"></div>
          <div class="grow">
            <div class="skeleton skeleton--text" style="width:45%;"></div>
            <div class="skeleton skeleton--text" style="width:80%; margin-bottom:0;"></div>
          </div>
        </div>`).join('')}
    </div>`;
  }

  bind(modal) {
    const close = () => this.clean(true);
    modal.querySelector('#btn-close-cmt')?.addEventListener('click', close);

    this.onKey = (e) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', this.onKey);

    // --- Étoiles : un vrai radiogroup, navigable au clavier ------------------
    const stars = [...modal.querySelectorAll('[data-star]')];
    const out = modal.querySelector('#cmt-rating-out');

    const paint = (value) => {
      this.selectedRating = value;
      stars.forEach((s, i) => {
        const on = i < value;
        s.setAttribute('aria-checked', String(i + 1 === value));
        const svg = s.querySelector('svg');
        svg.classList.toggle('icon--fill', on);
        s.style.color = on ? 'var(--gold-lit)' : 'var(--ink-4)';
      });
      out.textContent = value ? `${value} / 5` : 'Aucune note';
      BerthoSoundEffects.playTap();
    };

    stars.forEach((s, i) => {
      s.style.color = 'var(--ink-4)';
      s.addEventListener('click', () => paint(i + 1));
      s.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
          e.preventDefault();
          const next = Math.min(5, (this.selectedRating || 0) + 1);
          paint(next); stars[next - 1].focus();
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
          e.preventDefault();
          const next = Math.max(1, (this.selectedRating || 1) - 1);
          paint(next); stars[next - 1].focus();
        }
      });
    });

    // --- Compteur de caractères ---------------------------------------------
    const input = modal.querySelector('#cmt-text-input');
    const count = modal.querySelector('#cmt-count');
    const error = modal.querySelector('#cmt-error');
    const errorText = modal.querySelector('#cmt-error-text');

    input?.addEventListener('input', () => {
      count.textContent = input.value.length;
      error.hidden = true;
      input.removeAttribute('aria-invalid');
    });

    // --- Publication ---------------------------------------------------------
    const submit = modal.querySelector('#btn-submit-cmt');
    submit?.addEventListener('click', async () => {
      const content = input.value.trim();

      const fail = (msg) => {
        errorText.textContent = msg;
        error.hidden = false;
        input.setAttribute('aria-invalid', 'true');
        BerthoSoundEffects.playErrorSound();
        input.focus();
      };

      if (!this.selectedRating) return fail('Choisissez une note de 1 à 5 étoiles.');
      if (content.length < 3) return fail('Écrivez au moins quelques mots.');

      submit.dataset.loading = 'true';

      const state = this.readState();
      const user = state.currentUser;

      try {
        const res = await API.comments.add(
          user?.id || 'guest',
          user?.username || 'Joueur anonyme',
          this.gameId,
          this.selectedRating,
          content
        );
        delete submit.dataset.loading;

        if (res && res.success) {
          this.clean(true);
          BerthoUI.toast('Avis publié', 'Merci pour votre retour.', 'success');
        } else {
          fail(res?.error || "L'avis n'a pas pu être enregistré. Réessayez.");
        }
      } catch (e) {
        delete submit.dataset.loading;
        fail("Le serveur n'a pas répondu. Vérifiez votre connexion.");
      }
    });

    modal.querySelector('#btn-close-cmt')?.focus();
  }

  async loadComments() {
    const container = document.getElementById('cmt-list-container');
    if (!container) return;

    let res;
    try {
      res = await API.comments.getForGame(this.gameId);
    } catch (e) {
      res = null;
    }

    container.removeAttribute('aria-busy');
    const comments = (res && res.success && res.comments) ? res.comments : [];

    if (!comments.length) {
      container.innerHTML = `
        <div class="empty" style="padding:var(--sp-6) var(--sp-4);">
          ${icon('comment', 'icon empty__icon')}
          <h2 class="empty__title">Aucun avis</h2>
          <p class="empty__text">Personne n'a encore noté ce jeu. Donnez le premier avis.</p>
        </div>`;
      return;
    }

    const average = (comments.reduce((sum, c) => sum + (c.rating || 0), 0) / comments.length).toFixed(1);

    container.innerHTML = `
      <div class="row" style="gap:var(--sp-3); margin-bottom:var(--sp-3);">
        <span class="badge badge--gold t-num" style="font-size:var(--text-sm);">
          ${icon('star', 'icon icon--sm icon--fill')} ${average}
        </span>
        <span class="t-meta">${comments.length} avis</span>
      </div>

      <ul class="panel panel--flush list" style="list-style:none;">
        ${comments.map(c => this.commentRow(c)).join('')}
      </ul>`;
  }

  commentRow(c) {
    const name = this.escapeHtml(c.username || 'Joueur');
    const rating = Math.max(0, Math.min(5, c.rating || 0));

    return `
      <li class="list-row" style="cursor:default; align-items:flex-start;">
        <span class="avatar avatar--sm" aria-hidden="true">${name.charAt(0)}</span>
        <span class="list-row__body">
          <span class="row" style="gap:var(--sp-2); justify-content:space-between;">
            <span class="list-row__title">${name}</span>
            <span style="color:var(--gold-lit); display:flex; gap:1px;" aria-label="${rating} sur 5">
              ${Array.from({ length: 5 }, (_, i) =>
                icon('star', `icon icon--sm ${i < rating ? 'icon--fill' : ''}`)).join('')}
            </span>
          </span>
          <span class="list-row__sub" style="white-space:normal; overflow-wrap:anywhere;">
            ${this.escapeHtml(c.content)}
          </span>
        </span>
      </li>`;
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

  clean(notify = true) {
    document.getElementById('comments-widget-overlay')?.remove();
    if (this.onKey) {
      document.removeEventListener('keydown', this.onKey);
      this.onKey = null;
    }
    if (notify) {
      if (this.previouslyFocused instanceof HTMLElement) this.previouslyFocused.focus();
      this.onClose?.();
    }
  }
}
