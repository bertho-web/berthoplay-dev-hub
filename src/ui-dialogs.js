// ============================================================================
// BERTHOPLAY — MODALES, TOASTS & TRADUCTION D'ERREURS
// ----------------------------------------------------------------------------
// Toutes les boîtes de dialogue de l'application passent par ici : une seule
// apparence, un seul comportement clavier, un seul jeu de sons.
//
// Accessibilité : rôle dialog, focus capturé puis restitué, Échap ferme,
// clic sur le voile ferme (sauf pour une action destructive à confirmer).
// ============================================================================

import { BerthoSoundEffects } from './services/sound-effects.js';
import { icon } from './components/icons.js';

const OVERLAY_ID = 'bertho-custom-ui-overlay';

export class BerthoUI {

  // ==========================================================================
  // TRADUCTION DES ERREURS TECHNIQUES
  // ==========================================================================

  /**
   * Une erreur affichée à un joueur doit dire quoi faire, pas ce qui a cassé.
   * Les libellés bruts (D1_ERROR, SQLITE_TOOBIG…) ne sortent jamais d'ici.
   */
  static error(title, rawError, onClose) {
    const raw = typeof rawError === 'string' ? rawError : (rawError?.message || '');
    let message = raw || "Une erreur est survenue.";

    const rules = [
      [/no such column|D1_ERROR/i,            "La base de données est en cours de mise à jour. Réessayez dans un instant."],
      [/SQLITE_TOOBIG|too big/i,              "Ce fichier est trop lourd. Choisissez une image ou une vidéo plus légère."],
      [/Failed to fetch|NetworkError|offline/i, "Connexion au serveur interrompue. Vérifiez votre réseau, puis réessayez."],
      [/\b403\b|Accès Refusé/i,               "Accès restreint : identifiant ou clef d'administration incorrecte."],
      [/\b401\b|incorrect/i,                  "Numéro de téléphone ou mot de passe incorrect. Vérifiez vos saisies."],
      [/UNIQUE constraint failed|déjà utilisé/i, "Ce numéro ou ce pseudonyme est déjà pris par un autre joueur."],
      [/\b429\b|rate limit/i,                 "Trop de tentatives d'affilée. Patientez une minute avant de réessayer."],
      [/\b5\d{2}\b|Internal Server/i,         "Le serveur ne répond pas correctement. Réessayez dans quelques minutes."]
    ];

    for (const [pattern, human] of rules) {
      if (pattern.test(raw)) { message = human; break; }
    }

    this.alert(title || 'Erreur', message, onClose, 'error');
  }

  // ==========================================================================
  // SOCLE DE MODALE
  // ==========================================================================

  /**
   * Monte une modale et gère tout ce qu'elle doit gérer : focus, Échap,
   * capture de tabulation, restitution du focus à la fermeture.
   */
  static mount({ title, body, actions, tone = 'neutral', dismissible = true, onDismiss, focusSelector }) {
    this.clean();

    const previouslyFocused = document.activeElement;

    const overlay = document.createElement('div');
    overlay.id = OVERLAY_ID;
    overlay.style.cssText = [
      'position:fixed', 'inset:0', 'z-index:var(--z-modal)',
      'display:flex', 'align-items:center', 'justify-content:center',
      'padding:max(var(--sp-5), var(--safe-t)) var(--sp-5) max(var(--sp-5), var(--safe-b))',
      'background-color:var(--scrim-modal)',
      'backdrop-filter:blur(10px)', '-webkit-backdrop-filter:blur(10px)'
    ].join(';');

    const accent = {
      neutral: 'var(--line-strong)',
      error:   'var(--line-blood)',
      success: 'rgba(74,222,128,0.4)',
      gold:    'var(--line-gold)'
    }[tone] || 'var(--line-strong)';

    overlay.innerHTML = `
      <div class="panel" role="dialog" aria-modal="true" aria-labelledby="bui-title"
           style="width:min(100%, 24rem); border-color:${accent}; box-shadow:var(--shadow-lg); padding:var(--sp-6);">
        <h2 class="t-screen-title" id="bui-title" style="font-size:var(--text-md); margin-bottom:var(--sp-3);">${title}</h2>
        <div style="margin-bottom:var(--sp-5);">${body}</div>
        <div style="display:flex; gap:var(--sp-2);">${actions}</div>
      </div>
    `;

    document.body.appendChild(overlay);

    const close = () => {
      overlay.remove();
      // Rendre le focus là où il était : sans ça le clavier repart de zéro.
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
    };
    overlay._close = close;

    // Le focus part sur le champ s'il y en a un, sinon sur l'action principale.
    const target = focusSelector
      ? overlay.querySelector(focusSelector)
      : overlay.querySelector('button');
    target?.focus();

    if (dismissible) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) { BerthoSoundEffects.playClose(); close(); onDismiss?.(); }
      });
    }

    overlay.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && dismissible) {
        BerthoSoundEffects.playClose();
        close();
        onDismiss?.();
        return;
      }
      // Capture de tabulation : le focus ne doit pas s'échapper derrière le voile.
      if (e.key !== 'Tab') return;
      const focusables = overlay.querySelectorAll('button, input, textarea, select, a[href], [tabindex]:not([tabindex="-1"])');
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });

    BerthoSoundEffects.playOpen();
    return { overlay, close };
  }

  // ==========================================================================
  // ALERTE
  // ==========================================================================

  static alert(title, message, onClose, tone = 'neutral') {
    const { close } = this.mount({
      title,
      tone,
      body: `<p class="t-body">${message}</p>`,
      actions: `<button class="btn btn--primary btn--cut btn--block" id="bui-ok" type="button">J'ai compris</button>`
    });

    if (tone === 'error') BerthoSoundEffects.playErrorSound();

    document.getElementById('bui-ok')?.addEventListener('click', () => {
      close();
      onClose?.();
    });
  }

  // ==========================================================================
  // CONFIRMATION
  // ==========================================================================

  /**
   * @param {object} [opts]
   * @param {boolean} [opts.destructive] rend l'action confirmante rouge et
   *        empêche la fermeture par simple clic à côté.
   * @param {string}  [opts.confirmLabel] verbe de l'action, pas « Oui » :
   *        un bouton doit dire ce qu'il fait.
   */
  static confirm(title, message, onConfirm, onCancel, opts = {}) {
    const { destructive = false, confirmLabel, cancelLabel = 'Annuler' } = opts;
    const label = confirmLabel || (destructive ? 'Supprimer' : 'Confirmer');

    const { close } = this.mount({
      title,
      tone: destructive ? 'error' : 'neutral',
      dismissible: !destructive,
      onDismiss: onCancel,
      body: `<p class="t-body">${message}</p>`,
      actions: `
        <button class="btn btn--secondary grow" id="bui-no" type="button">${cancelLabel}</button>
        <button class="btn ${destructive ? 'btn--danger' : 'btn--primary btn--cut'} grow" id="bui-yes" type="button">${label}</button>
      `
    });

    document.getElementById('bui-yes')?.addEventListener('click', () => { close(); onConfirm?.(); });
    document.getElementById('bui-no')?.addEventListener('click', () => { close(); onCancel?.(); });
  }

  // ==========================================================================
  // SAISIE
  // ==========================================================================

  static prompt(title, placeholder, onSubmit, onCancel, opts = {}) {
    const { label = title, value = '', maxLength = 120, hint } = opts;

    const { overlay, close } = this.mount({
      title,
      onDismiss: onCancel,
      focusSelector: '#bui-input',
      body: `
        <div class="field">
          <label class="field__label" for="bui-input">${label}</label>
          <input class="input" id="bui-input" type="text" value="${this.escape(value)}"
                 placeholder="${this.escape(placeholder || '')}" maxlength="${maxLength}"
                 autocomplete="off" autocapitalize="sentences" enterkeyhint="done" />
          ${hint ? `<p class="field__hint">${hint}</p>` : ''}
          <p class="field__error" id="bui-input-error" hidden>
            ${icon('alert-circle', 'icon icon--sm')}<span>Ce champ ne peut pas être vide.</span>
          </p>
        </div>`,
      actions: `
        <button class="btn btn--secondary grow" id="bui-no" type="button">Annuler</button>
        <button class="btn btn--primary btn--cut grow" id="bui-yes" type="button">Valider</button>
      `
    });

    const input = overlay.querySelector('#bui-input');
    const error = overlay.querySelector('#bui-input-error');

    const submit = () => {
      const val = input?.value?.trim();
      // Erreur au ras du champ, pas dans une seconde modale par-dessus.
      if (!val) {
        error.hidden = false;
        input.setAttribute('aria-invalid', 'true');
        BerthoSoundEffects.playErrorSound();
        input.focus();
        return;
      }
      close();
      onSubmit?.(val);
    };

    input?.addEventListener('input', () => {
      error.hidden = true;
      input.removeAttribute('aria-invalid');
    });
    input?.addEventListener('keydown', (e) => { if (e.key === 'Enter') submit(); });
    overlay.querySelector('#bui-yes')?.addEventListener('click', submit);
    overlay.querySelector('#bui-no')?.addEventListener('click', () => { close(); onCancel?.(); });
  }

  // ==========================================================================
  // TOASTS
  // ==========================================================================

  /**
   * Message court et non bloquant.
   * @param {string} title
   * @param {string} message
   * @param {'info'|'success'|'error'|'gold'} [variant]
   */
  static toast(title, message, variant = 'info') {
    const stack = document.getElementById('toast-stack');
    if (!stack) return;

    // Un ancien appel pouvait passer un emoji ici : on l'ignore proprement.
    if (!['info', 'success', 'error', 'gold'].includes(variant)) variant = 'info';

    const glyph = { info: 'info', success: 'check-circle', error: 'alert-circle', gold: 'coin' }[variant];
    const color = { info: 'var(--violet-lit)', success: 'var(--success)', error: 'var(--blood-lit)', gold: 'var(--gold-lit)' }[variant];

    const el = document.createElement('div');
    el.className = `toast toast--${variant}`;
    el.innerHTML = `
      <span style="color:${color}; display:flex;">${icon(glyph, 'icon toast__icon')}</span>
      <div class="grow">
        <strong style="display:block; font-size:var(--text-sm); font-weight:700;">${title}</strong>
        ${message ? `<span class="t-meta">${message}</span>` : ''}
      </div>`;

    stack.appendChild(el);

    if (variant === 'success') BerthoSoundEffects.playSuccess();
    else if (variant === 'error') BerthoSoundEffects.playErrorSound();
    else if (variant === 'gold') BerthoSoundEffects.playCoinEarned();
    else BerthoSoundEffects.playNotificationChime();

    // Trois toasts au maximum : au-delà, le plus ancien s'efface.
    while (stack.children.length > 3) stack.firstElementChild.remove();

    setTimeout(() => {
      el.dataset.leaving = 'true';
      setTimeout(() => el.remove(), 200);
    }, 3600);
  }

  // ==========================================================================
  // UTILITAIRES
  // ==========================================================================

  static escape(str) {
    return String(str ?? '').replace(/[&<>"']/g, c => (
      { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    ));
  }

  static clean() {
    const el = document.getElementById(OVERLAY_ID);
    if (el) {
      el._close ? el._close() : el.remove();
    }
  }
}
