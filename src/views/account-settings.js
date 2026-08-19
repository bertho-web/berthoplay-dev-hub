// ============================================================================
// BERTHOPLAY — PARAMÈTRES DU PROFIL
// ============================================================================

import { BerthoUI } from '../ui-dialogs.js';
import { icon } from '../components/icons.js';

// Mode Sandbox : écriture directe dans localStorage, sans appel Worker
const IS_SANDBOX = true;

// Accents de profil pris dans la palette de la console — pas de couleur
// arbitraire qui jurerait avec le reste de l'interface.
const ACCENTS = [
  { value: '#C1121F', name: 'Sang' },
  { value: '#6D28D9', name: 'Vitrail' },
  { value: '#C9A227', name: 'Or' },
  { value: '#4ADE80', name: 'Émeraude' }
];

export class BerthoAccountSettings {
  static open(currentUser, onSaved) {
    let selectedColor = ACCENTS.some(a => a.value === currentUser.theme_color)
      ? currentUser.theme_color
      : ACCENTS[0].value;

    const { overlay, close } = BerthoUI.mount({
      title: 'Paramètres du profil',
      focusSelector: '#edit-username',
      body: `
        <div class="stack" style="gap:var(--sp-4);">

          <div class="field">
            <label class="field__label" for="edit-username">Pseudonyme</label>
            <input class="input" id="edit-username" type="text" maxlength="24"
                   value="${BerthoUI.escape(currentUser.username || '')}" autocomplete="nickname" />
          </div>

          <div class="field">
            <label class="field__label" for="edit-password">Nouveau mot de passe</label>
            <input class="input" id="edit-password" type="password" autocomplete="new-password"
                   placeholder="Laissez vide pour ne pas le changer" />
            <p class="field__hint">8 caractères minimum si vous le modifiez.</p>
          </div>

          <div class="field">
            <label class="field__label" for="edit-bio">Citation</label>
            <input class="input" id="edit-bio" type="text" maxlength="80"
                   value="${BerthoUI.escape(currentUser.bio || '')}"
                   placeholder="Une phrase qui vous représente" />
          </div>

          <div class="field">
            <span class="field__label" id="accent-label">Couleur d'accent</span>
            <div class="row" style="gap:var(--sp-2);" role="radiogroup" aria-labelledby="accent-label">
              ${ACCENTS.map(a => `
                <button type="button" role="radio" data-color="${a.value}" data-sfx="none"
                        aria-checked="${selectedColor === a.value}" aria-label="${a.name}"
                        class="accent-dot"
                        style="width:var(--tap-min); height:var(--tap-min); border-radius:50%;
                               display:grid; place-items:center; background:transparent; border:none;">
                  <span aria-hidden="true" style="width:28px; height:28px; border-radius:50%;
                        background:${a.value}; display:block;
                        box-shadow:0 0 0 ${selectedColor === a.value ? '3px var(--ink)' : '1px var(--line-strong)'};
                        transition:box-shadow var(--dur-fast) var(--ease-out);"></span>
                </button>`).join('')}
            </div>
          </div>

          <div class="setting-row">
            <div class="grow">
              <p class="setting-row__label">Profil privé</p>
              <p class="setting-row__hint">Seuls vos abonnés voient vos publications.</p>
            </div>
            <button class="switch" id="chk-private" type="button" role="switch"
                    aria-checked="${currentUser.is_private ? 'true' : 'false'}"
                    aria-label="Profil privé" data-sfx="none"></button>
          </div>

          <div class="setting-row">
            <div class="grow">
              <p class="setting-row__label">Masquer les abonnés</p>
              <p class="setting-row__hint">Votre liste d'abonnés reste invisible.</p>
            </div>
            <button class="switch" id="chk-hide-subs" type="button" role="switch"
                    aria-checked="${currentUser.hide_subscribers ? 'true' : 'false'}"
                    aria-label="Masquer les abonnés" data-sfx="none"></button>
          </div>

          <p class="field__error" id="edit-error" hidden>
            ${icon('alert-circle', 'icon icon--sm')}<span id="edit-error-text"></span>
          </p>
        </div>`,
      actions: `
        <button class="btn btn--secondary grow" id="btn-cancel-profile" type="button">Annuler</button>
        <button class="btn btn--primary btn--cut grow" id="btn-save-profile-settings" type="button">Enregistrer</button>`
    });

    // --- Accent ---------------------------------------------------------------
    const dots = [...overlay.querySelectorAll('.accent-dot')];
    dots.forEach(dot => {
      dot.addEventListener('click', () => {
        selectedColor = dot.dataset.color;
        dots.forEach(d => {
          const on = d.dataset.color === selectedColor;
          d.setAttribute('aria-checked', String(on));
          d.firstElementChild.style.boxShadow = on ? '0 0 0 3px var(--ink)' : '0 0 0 1px var(--line-strong)';
        });
      });
    });

    // --- Interrupteurs --------------------------------------------------------
    overlay.querySelectorAll('[role="switch"]').forEach(sw => {
      sw.addEventListener('click', () => {
        sw.setAttribute('aria-checked', String(sw.getAttribute('aria-checked') !== 'true'));
      });
    });

    // --- Enregistrement -------------------------------------------------------
    const error = overlay.querySelector('#edit-error');
    const errorText = overlay.querySelector('#edit-error-text');

    const fail = (msg, field) => {
      errorText.textContent = msg;
      error.hidden = false;
      field?.setAttribute('aria-invalid', 'true');
      field?.focus();
    };

    overlay.querySelectorAll('.input').forEach(el => el.addEventListener('input', () => {
      error.hidden = true;
      el.removeAttribute('aria-invalid');
    }));

    overlay.querySelector('#btn-cancel-profile')?.addEventListener('click', close);

    overlay.querySelector('#btn-save-profile-settings')?.addEventListener('click', () => {
      const nameInput = overlay.querySelector('#edit-username');
      const passInput = overlay.querySelector('#edit-password');
      const newName = nameInput.value.trim();
      const newPass = passInput.value;

      if (newName.length < 3) return fail('Le pseudonyme doit faire au moins 3 caractères.', nameInput);
      if (newPass && newPass.length < 8) return fail('Le mot de passe doit faire au moins 8 caractères.', passInput);

      const state = this.readState();
      state.currentUser = {
        ...state.currentUser,
        username: newName,
        bio: overlay.querySelector('#edit-bio').value.trim(),
        theme_color: selectedColor,
        is_private: overlay.querySelector('#chk-private').getAttribute('aria-checked') === 'true' ? 1 : 0,
        hide_subscribers: overlay.querySelector('#chk-hide-subs').getAttribute('aria-checked') === 'true' ? 1 : 0
      };

      try {
        localStorage.setItem('BERTHOPLAY_V1', JSON.stringify(state));
      } catch (e) {
        return fail("Impossible d'enregistrer sur cet appareil (stockage plein ?).", nameInput);
      }

      close();
      onSaved?.(state.currentUser);
      BerthoUI.toast('Profil mis à jour', 'Vos préférences sont enregistrées.', 'success');
    });
  }

  static readState() {
    try { return JSON.parse(localStorage.getItem('BERTHOPLAY_V1') || '{}'); }
    catch (e) { return {}; }
  }
}
