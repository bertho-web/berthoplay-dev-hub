// ============================================================================
// BERTHOPLAY — VUE RÉGLAGES
// ============================================================================

import { i18n } from '../i18n.js';
import { BerthoUI } from '../ui-dialogs.js';
import { BerthoSoundEffects } from '../services/sound-effects.js';
import { BerthoVoiceRecorder } from '../services/voice-recorder.js';
import { icon } from '../components/icons.js';

const LANGUAGES = [
  ['fr', 'Français'], ['ln', 'Lingala'], ['kg', 'Kikongo'], ['sw', 'Kiswahili'],
  ['yo', 'Yorùbá'], ['ig', 'Igbo'], ['ha', 'Hausa'], ['zu', 'isiZulu'],
  ['en', 'English'], ['es', 'Español'], ['pt', 'Português'], ['de', 'Deutsch'],
  ['it', 'Italiano'], ['nl', 'Nederlands'], ['ru', 'Русский'], ['zh', '中文'],
  ['ja', '日本語'], ['ko', '한국어'], ['ar', 'العربية'], ['hi', 'हिन्दी'],
  ['tr', 'Türkçe'], ['vi', 'Tiếng Việt']
];

export class SettingsView {
  constructor(container) {
    this.container = container;
    this.render();
  }

  isStandalone() {
    return window.matchMedia('(display-mode: standalone)').matches
        || window.matchMedia('(display-mode: minimal-ui)').matches
        || window.navigator.standalone === true;
  }

  render() {
    const isPWA = this.isStandalone();
    const lang = i18n.getLang();
    const soundOn = BerthoSoundEffects.isSoundEnabled();
    const volume = Math.round(BerthoSoundEffects.getVolume() * 100);
    const user = this.readState().currentUser;

    const view = document.createElement('div');
    view.className = 'tab-view-content';

    view.innerHTML = `
      <div class="section">
        <h1 class="t-screen-title">${i18n.t('settingsTitle')}</h1>
      </div>

      <!-- ================= APPLICATION ================= -->
      <section class="panel section" style="padding:var(--sp-4);" aria-labelledby="set-app">
        <h2 class="t-label" id="set-app" style="margin-bottom:var(--sp-2);">Application</h2>

        <div class="setting-row">
          <div class="grow">
            <p class="setting-row__label">${i18n.t('pwaStatus')}</p>
            <p class="setting-row__hint">${isPWA
              ? "Installée : BerthoPlay tourne en plein écran."
              : "Vous naviguez dans un onglet. L'installation donne le plein écran et le hors-ligne."}</p>
          </div>
          <span class="badge ${isPWA ? 'badge--success' : 'badge--warn'}">
            ${isPWA ? i18n.t('pwaInstalled') : i18n.t('pwaBrowser')}
          </span>
        </div>

        ${!isPWA ? `
          <button class="btn btn--primary btn--cut btn--block" id="btn-pwa-install" type="button" style="margin-top:var(--sp-3);">
            ${icon('download', 'icon icon--sm')} ${i18n.t('btnInstallPWA')}
          </button>` : ''}
      </section>

      <!-- ================= LANGUE ================= -->
      <section class="panel section" style="padding:var(--sp-4);" aria-labelledby="set-lang">
        <h2 class="t-label" id="set-lang" style="margin-bottom:var(--sp-3);">Langue</h2>
        <div class="field">
          <label class="field__label" for="set-lang-select">${i18n.t('langLabel')}</label>
          <select class="select" id="set-lang-select">
            ${LANGUAGES.map(([code, name]) =>
              `<option value="${code}" ${lang === code ? 'selected' : ''}>${name}</option>`
            ).join('')}
          </select>
          <p class="field__hint">22 langues disponibles. Le changement est immédiat.</p>
        </div>
      </section>

      <!-- ================= AUDIO ================= -->
      <section class="panel section" style="padding:var(--sp-4);" aria-labelledby="set-audio">
        <h2 class="t-label" id="set-audio" style="margin-bottom:var(--sp-2);">Audio</h2>

        <div class="setting-row">
          <div class="grow">
            <p class="setting-row__label">${i18n.t('soundLabel')}</p>
            <p class="setting-row__hint">Retour sonore sur les boutons, les gains et les victoires.</p>
          </div>
          <button class="switch" id="set-sound" type="button" role="switch"
                  aria-checked="${soundOn}" aria-label="${i18n.t('soundLabel')}" data-sfx="none"></button>
        </div>

        <div class="setting-row" id="volume-row" ${soundOn ? '' : 'hidden'}>
          <div class="grow">
            <label class="setting-row__label" for="set-volume">Volume</label>
            <p class="setting-row__hint"><output id="volume-out">${volume}</output> %</p>
          </div>
          <input class="grow" type="range" id="set-volume" min="0" max="100" step="5"
                 value="${volume}" style="max-width:11rem; accent-color: var(--blood);" />
        </div>
      </section>

      <!-- ================= AUTORISATIONS ================= -->
      <section class="panel section" style="padding:var(--sp-4);" aria-labelledby="set-perms">
        <h2 class="t-label" id="set-perms" style="margin-bottom:var(--sp-2);">Autorisations de l'appareil</h2>

        <div class="setting-row">
          <div class="grow">
            <p class="setting-row__label">Microphone</p>
            <p class="setting-row__hint">Nécessaire pour les messages vocaux et les appels.</p>
          </div>
          <button class="btn btn--secondary btn--sm" id="btn-perm-mic" type="button">
            ${icon('mic', 'icon icon--sm')} Tester
          </button>
        </div>

        <div class="setting-row">
          <div class="grow">
            <p class="setting-row__label">Notifications</p>
            <p class="setting-row__hint">Être prévenu d'un message ou d'un défi, application fermée.</p>
          </div>
          <button class="btn btn--secondary btn--sm" id="btn-perm-notif" type="button">
            ${icon('bell', 'icon icon--sm')} Activer
          </button>
        </div>
      </section>

      <!-- ================= ASSISTANCE ================= -->
      <section class="panel panel--flush section" aria-labelledby="set-help">
        <h2 class="t-label" id="set-help" style="padding:var(--sp-4) var(--sp-4) var(--sp-2);">Assistance</h2>

        <button class="list-row" id="btn-open-support-modal" type="button">
          ${icon('message')}
          <span class="list-row__body">
            <span class="list-row__title">Support & réclamations</span>
            <span class="list-row__sub">Signaler un problème ou proposer une idée</span>
          </span>
          ${icon('chevron-right', 'icon tile__chevron')}
        </button>

        <button class="list-row" id="btn-open-rules" type="button">
          ${icon('shield')}
          <span class="list-row__body">
            <span class="list-row__title">${i18n.t('rulesLabel')}</span>
            <span class="list-row__sub">${i18n.t('rulesRead')}</span>
          </span>
          ${icon('chevron-right', 'icon tile__chevron')}
        </button>

        <button class="list-row" id="btn-clear-cache" type="button">
          ${icon('refresh')}
          <span class="list-row__body">
            <span class="list-row__title">${i18n.t('cacheLabel')}</span>
            <span class="list-row__sub">${i18n.t('cacheAction')}</span>
          </span>
          ${icon('chevron-right', 'icon tile__chevron')}
        </button>
      </section>

      <!-- ================= COMPTE ================= -->
      ${user ? `
        <section class="section">
          <button class="btn btn--danger btn--block" id="btn-set-logout" type="button" data-sfx="none">
            ${icon('logout', 'icon icon--sm')} ${i18n.t('logout')}
          </button>
        </section>` : ''}

      <footer class="section" style="text-align:center; padding-bottom:var(--sp-10);">
        <p class="t-meta">${i18n.t('edgeLabel')} · Cloudflare Pages</p>
        <p class="t-meta" style="margin-top:var(--sp-2);">BerthoPlay Console Web &copy; 2026 — Tous droits réservés</p>
      </footer>
    `;

    this.container.innerHTML = '';
    this.container.appendChild(view);
    this.bind();
  }

  // --------------------------------------------------------------------------

  readState() {
    try { return JSON.parse(localStorage.getItem('BERTHOPLAY_V1') || '{}'); }
    catch (e) { return {}; }
  }

  writeState(patch) {
    try {
      localStorage.setItem('BERTHOPLAY_V1', JSON.stringify({ ...this.readState(), ...patch }));
    } catch (e) {}
  }

  bind() {
    // --- Langue -------------------------------------------------------------
    document.getElementById('set-lang-select')?.addEventListener('change', (e) => {
      i18n.setLang(e.target.value);
      this.render();
    });

    // --- Son ----------------------------------------------------------------
    const soundSwitch = document.getElementById('set-sound');
    soundSwitch?.addEventListener('click', () => {
      const next = soundSwitch.getAttribute('aria-checked') !== 'true';
      soundSwitch.setAttribute('aria-checked', String(next));
      this.writeState({ soundEnabled: next });
      document.getElementById('volume-row')?.toggleAttribute('hidden', !next);
      // Le son de confirmation ne peut se jouer que si on vient de l'activer.
      if (next) BerthoSoundEffects.playToggleOn();
    });

    const volume = document.getElementById('set-volume');
    const volumeOut = document.getElementById('volume-out');
    volume?.addEventListener('input', () => {
      volumeOut.textContent = volume.value;
      BerthoSoundEffects.setVolume(volume.value / 100);
    });
    // Un aperçu au relâchement seulement : pas à chaque pixel du curseur.
    volume?.addEventListener('change', () => BerthoSoundEffects.playTap());

    // --- Autorisations ------------------------------------------------------
    document.getElementById('btn-perm-mic')?.addEventListener('click', async (e) => {
      const btn = e.currentTarget;
      btn.dataset.loading = 'true';
      const res = await BerthoVoiceRecorder.requestMicPermission();
      delete btn.dataset.loading;

      if (res.success) {
        BerthoUI.toast('Microphone autorisé', 'Vocaux et appels sont prêts.', 'success');
      } else {
        BerthoUI.error('Microphone', res.error);
      }
    });

    document.getElementById('btn-perm-notif')?.addEventListener('click', async (e) => {
      if (!('Notification' in window)) {
        BerthoUI.alert('Notifications', "Ce navigateur ne gère pas les notifications système.");
        return;
      }
      const btn = e.currentTarget;
      btn.dataset.loading = 'true';
      const perm = await Notification.requestPermission();
      delete btn.dataset.loading;

      if (perm === 'granted') {
        BerthoUI.toast('Notifications activées', 'Vous serez prévenu des nouveaux messages.', 'success');
      } else {
        BerthoUI.alert(
          'Notifications refusées',
          "Le navigateur a bloqué les notifications. Vous pouvez les réactiver dans ses réglages de site."
        );
      }
    });

    // --- Assistance ---------------------------------------------------------
    document.getElementById('btn-open-support-modal')?.addEventListener('click', () => {
      BerthoUI.prompt(
        'Support & réclamations',
        'Décrivez le problème rencontré…',
        () => BerthoUI.toast('Message transmis', "L'équipe BerthoPlay vous répondra.", 'success'),
        null,
        { label: 'Votre message', maxLength: 500, hint: 'Soyez précis : écran concerné, action tentée, ce qui est arrivé.' }
      );
    });

    document.getElementById('btn-open-rules')?.addEventListener('click', async () => {
      try {
        const module = await import('./legale.js');
        new module.LegaleView();
      } catch (e) {
        BerthoUI.error('Règlements', e);
      }
    });

    document.getElementById('btn-clear-cache')?.addEventListener('click', () => {
      BerthoUI.confirm(
        i18n.t('confirmClearCacheTitle'),
        i18n.t('confirmClearCacheMsg'),
        async () => {
          try {
            localStorage.removeItem('BERTHOPLAY_PROMPT_SHOWN');
            localStorage.removeItem('BERTHOPLAY_PWA_DISMISSED');
            // Vider aussi les caches du service worker, sinon « purger » ment.
            if ('caches' in window) {
              const keys = await caches.keys();
              await Promise.all(keys.map(k => caches.delete(k)));
            }
            BerthoUI.toast('Cache purgé', i18n.t('cacheSuccess'), 'success');
          } catch (e) {
            BerthoUI.error('Purge du cache', e);
          }
        },
        null,
        { confirmLabel: 'Purger' }
      );
    });

    // --- Déconnexion --------------------------------------------------------
    document.getElementById('btn-set-logout')?.addEventListener('click', () => {
      BerthoUI.confirm(
        i18n.t('logout'),
        'Vos parties restent enregistrées sur cet appareil. Vous pourrez vous reconnecter à tout moment.',
        () => {
          this.writeState({ currentUser: null });
          BerthoUI.toast('Déconnecté', 'À bientôt sur BerthoPlay.');
          this.render();
        },
        null,
        { confirmLabel: 'Se déconnecter' }
      );
    });

    // --- Installation -------------------------------------------------------
    document.getElementById('btn-pwa-install')?.addEventListener('click', () => {
      if (window.deferredPWA_Prompt) {
        window.deferredPWA_Prompt.prompt();
        window.deferredPWA_Prompt.userChoice?.finally(() => {
          window.deferredPWA_Prompt = null;
          this.render();
        });
      } else {
        // Sur iOS il n'y a pas d'invite : la feuille explique le geste exact.
        // C'est main.js qui la remplit, il connaît la plateforme détectée.
        window.dispatchEvent(new CustomEvent('bertho:open-pwa-sheet'));
      }
    });
  }
}
