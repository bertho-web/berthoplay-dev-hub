// ============================================================================
// 🎮 BERTHOPLAY — VUE RÉGLAGES (SRC/VIEWS/SETTINGS.JS) [DEV HUB SANDBOX]
// ============================================================================

import { i18n } from '../i18n.js';
import { BerthoUI } from '../ui-dialogs.js';
import { BerthoSoundEffects } from '../services/sound-effects.js';
import { BerthoVoiceRecorder } from '../services/voice-recorder.js';

// Mode Sandbox : Pas d'appels externes
const IS_SANDBOX = true;

export class SettingsView {
  constructor(container) {
    this.container = container;
    this.render();
  }

  render() {
    const isPWA = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    const currentLang = i18n.getLang();
    const isSoundOn = BerthoSoundEffects.isSoundEnabled();

    const view = document.createElement('div');
    view.className = 'tab-view-content';
    view.innerHTML = `
      <style>
        .set-page { padding: 15px; max-width: 500px; margin: 0 auto; color: #fff; box-sizing: border-box; }
        .set-card { background: rgba(15, 23, 42, 0.85); border: 1px solid #334155; border-radius: 18px; padding: 16px; margin-bottom: 14px; backdrop-filter: blur(10px); }
        .set-row { display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; font-weight: bold; }
        .set-title { font-size: 1.1rem; font-weight: 900; color: #38bdf8; margin-bottom: 15px; text-transform: uppercase; text-align: center; letter-spacing: 1px; }
        .btn-install-pwa { width: 100%; padding: 12px; background: linear-gradient(135deg, #0284c7, #0369a1); border: 1px solid #38bdf8; color: #fff; border-radius: 12px; font-weight: 900; cursor: pointer; text-transform: uppercase; margin-top: 8px; box-shadow: 0 0 15px rgba(56,189,248,0.3); letter-spacing: 1px; }
        .set-select { padding: 8px 12px; background: #0f172a; border: 1px solid #38bdf8; color: #fff; border-radius: 10px; font-weight: bold; outline:none; font-size:0.85rem; max-width:180px; }
        .btn-set-action { width: 100%; padding: 12px; background: rgba(239, 68, 68, 0.15); border: 1px solid #ef4444; color: #ef4444; border-radius: 12px; font-weight: bold; cursor: pointer; margin-top: 10px; text-transform: uppercase; }
        .perm-btn { padding: 6px 12px; background: rgba(56,189,248,0.15); border: 1px solid #38bdf8; color: #38bdf8; border-radius: 10px; font-weight: bold; cursor: pointer; font-size: 0.72rem; }
      </style>

      <div class="set-page">
        <div class="set-title">${i18n.t('settingsTitle')}</div>

        <!-- INSTALLATION PWA -->
        <div class="set-card">
          <div class="set-row">
            <span>${i18n.t('pwaStatus')}</span>
            <span style="color:${isPWA ? '#34d399' : '#fbbf24'};">${isPWA ? i18n.t('pwaInstalled') : i18n.t('pwaBrowser')}</span>
          </div>
          ${!isPWA ? `<button class="btn-install-pwa" id="btn-pwa-install">${i18n.t('btnInstallPWA')}</button>` : `<p style="font-size:0.7rem; color:#94a3b8; margin-top:6px;">L'application est installée en mode natif plein écran.</p>`}
        </div>

        <!-- SÉLECTEUR MULTILINGUE 22 LANGUES -->
        <div class="set-card">
          <div class="set-row">
            <span>${i18n.t('langLabel')}</span>
            <select class="set-select" id="set-lang-select">
              <option value="fr" ${currentLang === 'fr' ? 'selected' : ''}>🇫🇷 Français</option>
              <option value="ln" ${currentLang === 'ln' ? 'selected' : ''}>🇨🇬 Lingala</option>
              <option value="kg" ${currentLang === 'kg' ? 'selected' : ''}>🇨🇬 Kikongo</option>
              <option value="sw" ${currentLang === 'sw' ? 'selected' : ''}>🇨🇩 Swahili</option>
              <option value="yo" ${currentLang === 'yo' ? 'selected' : ''}>🇳🇬 Yoruba</option>
              <option value="ig" ${currentLang === 'ig' ? 'selected' : ''}>🇳🇬 Igbo</option>
              <option value="ha" ${currentLang === 'ha' ? 'selected' : ''}>🇳🇬 Hausa</option>
              <option value="zu" ${currentLang === 'zu' ? 'selected' : ''}>🇿🇦 Zulu</option>
              <option value="en" ${currentLang === 'en' ? 'selected' : ''}>🇬🇧 English</option>
              <option value="es" ${currentLang === 'es' ? 'selected' : ''}>🇪🇸 Español</option>
              <option value="pt" ${currentLang === 'pt' ? 'selected' : ''}>🇵🇹 Português</option>
              <option value="de" ${currentLang === 'de' ? 'selected' : ''}>🇩🇪 Deutsch</option>
              <option value="it" ${currentLang === 'it' ? 'selected' : ''}>🇮🇹 Italiano</option>
              <option value="nl" ${currentLang === 'nl' ? 'selected' : ''}>🇳🇱 Nederlands</option>
              <option value="ru" ${currentLang === 'ru' ? 'selected' : ''}>🇷🇺 Русский</option>
              <option value="zh" ${currentLang === 'zh' ? 'selected' : ''}>🇨🇳 中文</option>
              <option value="ja" ${currentLang === 'ja' ? 'selected' : ''}>🇯🇵 日本語</option>
              <option value="ko" ${currentLang === 'ko' ? 'selected' : ''}>🇰🇷 한국어</option>
              <option value="ar" ${currentLang === 'ar' ? 'selected' : ''}>🇸🇦 العربية</option>
              <option value="hi" ${currentLang === 'hi' ? 'selected' : ''}>🇮🇳 हिन्दी</option>
              <option value="tr" ${currentLang === 'tr' ? 'selected' : ''}>🇹🇷 Türkçe</option>
              <option value="vi" ${currentLang === 'vi' ? 'selected' : ''}>🇻🇳 Tiếng Việt</option>
            </select>
          </div>
        </div>

        <!-- SON & EFFETS AUDIOS -->
        <div class="set-card">
          <div class="set-row">
            <span>${i18n.t('soundLabel')}</span>
            <input type="checkbox" id="set-sound" ${isSoundOn ? 'checked' : ''} />
          </div>
        </div>

        <!-- AUTORISATIONS APPAREIL -->
        <div class="set-card">
          <div style="font-size:0.85rem; font-weight:bold; color:#38bdf8; margin-bottom:10px;">🛡️ AUTORISATIONS APPAREIL</div>
          
          <div class="set-row" style="margin-bottom:8px;">
            <span>🎙️ Microphone (Vocaux & Appels)</span>
            <button class="perm-btn" id="btn-perm-mic">TESTER ➔</button>
          </div>

          <div class="set-row">
            <span>📢 Notifications Push (Sango)</span>
            <button class="perm-btn" id="btn-perm-notif">ACTIVER ➔</button>
          </div>
        </div>

        <!-- SUPPORT CLIENT & PLAINTES -->
        <div class="set-card" id="btn-open-support-modal" style="cursor:pointer;">
          <div class="set-row">
            <span>💬 Support Client & Plaintes</span>
            <span style="color:#34d399;">NOUS CONTACTER ➔</span>
          </div>
        </div>

        <!-- RÈGLEMENTS & CONFIDENTIALITÉ -->
        <div class="set-card" id="btn-open-rules" style="cursor:pointer;">
          <div class="set-row">
            <span>${i18n.t('rulesLabel')}</span>
            <span style="color:#38bdf8;">${i18n.t('rulesRead')} ➔</span>
          </div>
        </div>

        <!-- PURGE CACHE LOCAL -->
        <div class="set-card" id="btn-clear-cache" style="cursor:pointer;">
          <div class="set-row">
            <span>${i18n.t('cacheLabel')}</span>
            <span style="color:#f59e0b;">${i18n.t('cacheAction')} ➔</span>
          </div>
        </div>

        <!-- INFRASTRUCTURE CLOUDFLARE -->
        <div class="set-card">
          <div class="set-row">
            <span>${i18n.t('edgeLabel')}</span>
            <span style="color:#38bdf8;">Cloudflare Pages Sandbox</span>
          </div>
        </div>

        ${JSON.parse(localStorage.getItem('BERTHOPLAY_V1') || '{}').currentUser ? `<button class="btn-set-action" id="btn-set-logout">${i18n.t('logout')}</button>` : ''}

        <div class="set-card" style="text-align:center; margin-top:15px;">
          <p style="font-size:0.75rem; color:#94a3b8;">BerthoPlay Console Web &copy; 2026<br/>Tous droits réservés</p>
        </div>
      </div>
    `;

    this.container.innerHTML = '';
    this.container.appendChild(view);

    document.getElementById('set-lang-select')?.addEventListener('change', (e) => {
      i18n.setLang(e.target.value);
      this.render();
    });

    document.getElementById('set-sound')?.addEventListener('change', (e) => {
      const isChecked = e.target.checked;
      try {
        const data = JSON.parse(localStorage.getItem('BERTHOPLAY_V1') || '{}');
        data.soundEnabled = isChecked;
        localStorage.setItem('BERTHOPLAY_V1', JSON.stringify(data));
      } catch(e) {}
      if (isChecked) BerthoSoundEffects.playNotificationChime();
    });

    document.getElementById('btn-perm-mic')?.addEventListener('click', async () => {
      const res = await BerthoVoiceRecorder.requestMicPermission();
      if (res.success) {
        BerthoUI.alert("MICROPHONE", "Permission du microphone accordée avec succès ! 🎙️");
      } else {
        BerthoUI.error("MICROPHONE", res.error);
      }
    });

    document.getElementById('btn-perm-notif')?.addEventListener('click', async () => {
      if ('Notification' in window) {
        const perm = await Notification.requestPermission();
        if (perm === 'granted') {
          BerthoUI.alert("NOTIFICATIONS", "Notifications Push système activées avec succès ! 📢");
        } else {
          BerthoUI.alert("NOTIFICATIONS", "Les notifications push ont été refusées par le navigateur.");
        }
      } else {
        BerthoUI.alert("NOTIFICATIONS", "Votre navigateur ne supporte pas les notifications système.");
      }
    });

    document.getElementById('btn-open-support-modal')?.addEventListener('click', () => {
      BerthoUI.prompt(
        "💬 SUPPORT & PLAINTES BERTHOPLAY",
        "Décrivez votre problème ou suggestion...",
        (msgText) => {
          if (!msgText) return;
          BerthoUI.alert("SUPPORT TRANSMIS", "Votre message a été enregistré en Sandbox ! 🙏");
        }
      );
    });

    document.getElementById('btn-open-rules')?.addEventListener('click', async () => {
      try {
        const module = await import('./legale.js');
        new module.LegaleView();
      } catch(e) { console.error(e); }
    });

    document.getElementById('btn-clear-cache')?.addEventListener('click', () => {
      BerthoUI.confirm(
        i18n.t('confirmClearCacheTitle'),
        i18n.t('confirmClearCacheMsg'),
        () => {
          localStorage.removeItem('BERTHOPLAY_PROMPT_SHOWN');
          BerthoUI.alert(i18n.t('confirmClearCacheTitle'), i18n.t('cacheSuccess'));
        }
      );
    });

    document.getElementById('btn-set-logout')?.addEventListener('click', () => {
      const state = JSON.parse(localStorage.getItem('BERTHOPLAY_V1') || '{}');
      state.currentUser = null;
      localStorage.setItem('BERTHOPLAY_V1', JSON.stringify(state));
      BerthoUI.alert(i18n.t('settingsTitle'), "Vous êtes déconnecté.");
      this.render();
    });

    document.getElementById('btn-pwa-install')?.addEventListener('click', () => {
      if (window.deferredPWA_Prompt) {
        window.deferredPWA_Prompt.prompt();
      } else {
        BerthoUI.alert("INSTALLATION PWA", "Pour installer : Appuyez sur 'Partager' dans votre navigateur, puis 'Sur l'écran d'accueil'.");
      }
    });
  }
}