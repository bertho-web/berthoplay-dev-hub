// ============================================================================
// 📁 BERTHOPLAY — MODULE D'AUTHENTIFICATION (SRC/AUTH.JS) [DEV HUB SANDBOX]
// ============================================================================

import { BerthoUI } from './ui-dialogs.js';

// Mode Sandbox : Simule l'authentification localement sans exposer le Worker de production
const IS_SANDBOX = true;

// --- ICÔNES VECTORIELLES SVG PURS (0 EMOJI TEXTE DANS L'UI) ---
const SVG_EYE_OPEN = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
const SVG_EYE_OFF = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`;
const SVG_SETTINGS_GEAR = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2.5"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`;

// --- MOTS STRICTEMENT INTERDITS (RENFORCÉ : SALUTATIONS, PRONOMS, TROLLS & VULGARITÉS) ---
const BLOCKED_WORDS = [
  'bonjour', 'salut', 'hello', 'coucou', 'hi', 'hey', 'cc', 'slt', 'welcome', 'bonsoir', 'yo', 'wesh', 'kikou', 'bonnet', 'ca va', 'cava',
  'je', 'tu', 'il', 'elle', 'nous', 'vous', 'ils', 'elles', 'moi', 'toi', 'lui', 'eux', 'mon', 'ton', 'son', 'ma', 'ta', 'sa', 'mes', 'tes', 'ses', 'notre', 'votre', 'leur',
  'admin', 'administrator', 'berthoplay', 'bertho', 'test', 'test1', 'test123', 'test666', 'guest', 'user', 'system', 'null', 'undefined', 'anonymous', 'support', 'moderator', 'officiel', 'official', 'bot', 'robot', 'root', 'superadmin', 'police', 'gouvernement', 'president',
  'merde', 'con', 'connard', 'salope', 'putain', 'foutre', 'chienne', 'encule', 'bite', 'chatte', 'bitch', 'fuck', 'shit', 'asshole', 'dick', 'pussy', 'idiot', 'imbecile', 'maboule', 'fou', 'troll', 'pd', 'pede', 'salaud', 'batard', 'pute'
];

// --- BASE DE DONNÉES PAYS EN ORDRE CROISSANT DES INDICATIFS ---
const COUNTRIES = [
  { code: 'US', name: 'États-Unis', dial: '+1', flag: '🇺🇸', lengths: [10] },
  { code: 'CA', name: 'Canada', dial: '+1', flag: '🇨🇦', lengths: [10] },
  { code: 'RU', name: 'Russie', dial: '+7', flag: '🇷🇺', lengths: [10] },
  { code: 'KZ', name: 'Kazakhstan', dial: '+7', flag: '🇰🇿', lengths: [10] },
  { code: 'EG', name: 'Égypte', dial: '+20', flag: '🇪🇬', lengths: [10, 11] },
  { code: 'ZA', name: 'Afrique du Sud', dial: '+27', flag: '🇿🇦', lengths: [9, 10] },
  { code: 'GR', name: 'Grèce', dial: '+30', flag: '🇬🇷', lengths: [10] },
  { code: 'NL', name: 'Pays-Bas', dial: '+31', flag: '🇳🇱', lengths: [9] },
  { code: 'BE', name: 'Belgique', dial: '+32', flag: '🇧🇪', lengths: [9, 10] },
  { code: 'FR', name: 'France', dial: '+33', flag: '🇫🇷', lengths: [9, 10] },
  { code: 'ES', name: 'Espagne', dial: '+34', flag: '🇪🇸', lengths: [9] },
  { code: 'HU', name: 'Hongrie', dial: '+36', flag: '🇭🇺', lengths: [9] },
  { code: 'IT', name: 'Italie', dial: '+39', flag: '🇮🇹', lengths: [9, 10] },
  { code: 'VA', name: 'Vatican', dial: '+39', flag: '🇻🇦', lengths: [9, 10] },
  { code: 'RO', name: 'Roumanie', dial: '+40', flag: '🇷🇴', lengths: [9] },
  { code: 'CH', name: 'Suisse', dial: '+41', flag: '🇨🇭', lengths: [9] },
  { code: 'AT', name: 'Autriche', dial: '+43', flag: '🇦🇹', lengths: [10, 11] },
  { code: 'GB', name: 'Royaume-Uni', dial: '+44', flag: '🇬🇧', lengths: [10, 11] },
  { code: 'DK', name: 'Danemark', dial: '+45', flag: '🇩🇰', lengths: [8] },
  { code: 'SE', name: 'Suède', dial: '+46', flag: '🇸🇪', lengths: [9] },
  { code: 'NO', name: 'Norvège', dial: '+47', flag: '🇳🇴', lengths: [8] },
  { code: 'PL', name: 'Pologne', dial: '+48', flag: '🇵🇱', lengths: [9] },
  { code: 'DE', name: 'Allemagne', dial: '+49', flag: '🇩🇪', lengths: [10, 11] },
  { code: 'PE', name: 'Pérou', dial: '+51', flag: '🇵🇪', lengths: [9] },
  { code: 'MX', name: 'Mexique', dial: '+52', flag: '🇲🇽', lengths: [10] },
  { code: 'CU', name: 'Cuba', dial: '+53', flag: '🇨🇺', lengths: [8] },
  { code: 'AR', name: 'Argentine', dial: '+54', flag: '🇦🇷', lengths: [10] },
  { code: 'BR', name: 'Brésil', dial: '+55', flag: '🇧🇷', lengths: [10, 11] },
  { code: 'CL', name: 'Chili', dial: '+56', flag: '🇨🇱', lengths: [9] },
  { code: 'CO', name: 'Colombie', dial: '+57', flag: '🇨🇴', lengths: [10] },
  { code: 'VE', name: 'Venezuela', dial: '+58', flag: '🇻🇪', lengths: [10] },
  { code: 'MY', name: 'Malaisie', dial: '+60', flag: '🇲🇾', lengths: [9, 10] },
  { code: 'AU', name: 'Australie', dial: '+61', flag: '🇦🇺', lengths: [9] },
  { code: 'ID', name: 'Indonésie', dial: '+62', flag: '🇮🇩', lengths: [9, 10, 11] },
  { code: 'PH', name: 'Philippines', dial: '+63', flag: '🇵🇭', lengths: [10] },
  { code: 'NZ', name: 'Nouvelle-Zélande', dial: '+64', flag: '🇳🇿', lengths: [8, 9, 10] },
  { code: 'SG', name: 'Singapour', dial: '+65', flag: '🇸🇬', lengths: [8] },
  { code: 'TH', name: 'Thaïlande', dial: '+66', flag: '🇹🇭', lengths: [9] },
  { code: 'JP', name: 'Japon', dial: '+81', flag: '🇯🇵', lengths: [10] },
  { code: 'KR', name: 'Corée du Sud', dial: '+82', flag: '🇰🇷', lengths: [9, 10] },
  { code: 'VN', name: 'Viêt Nam', dial: '+84', flag: '🇻🇳', lengths: [9, 10] },
  { code: 'CN', name: 'Chine', dial: '+86', flag: '🇨🇳', lengths: [11] },
  { code: 'TR', name: 'Turquie', dial: '+90', flag: '🇹🇷', lengths: [10] },
  { code: 'IN', name: 'Inde', dial: '+91', flag: '🇮🇳', lengths: [10] },
  { code: 'PK', name: 'Pakistan', dial: '+92', flag: '🇵🇰', lengths: [10] },
  { code: 'AF', name: 'Afghanistan', dial: '+93', flag: '🇦🇫', lengths: [9] },
  { code: 'LK', name: 'Sri Lanka', dial: '+94', flag: '🇱🇰', lengths: [9] },
  { code: 'MM', name: 'Birmanie', dial: '+95', flag: '🇲🇲', lengths: [8, 9, 10] },
  { code: 'IR', name: 'Iran', dial: '+98', flag: '🇮🇷', lengths: [10] },
  { code: 'MA', name: 'Maroc', dial: '+212', flag: '🇲🇦', lengths: [9] },
  { code: 'DZ', name: 'Algérie', dial: '+213', flag: '🇩🇿', lengths: [9] },
  { code: 'TN', name: 'Tunisie', dial: '+216', flag: '🇹🇳', lengths: [8] },
  { code: 'LY', name: 'Libye', dial: '+218', flag: '🇱🇾', lengths: [9] },
  { code: 'GM', name: 'Gambie', dial: '+220', flag: '🇬🇲', lengths: [7] },
  { code: 'SN', name: 'Sénégal', dial: '+221', flag: '🇸🇳', lengths: [9] },
  { code: 'MR', name: 'Mauritanie', dial: '+222', flag: '🇲🇷', lengths: [8] },
  { code: 'ML', name: 'Mali', dial: '+223', flag: '🇲🇱', lengths: [8] },
  { code: 'GN', name: 'Guinée', dial: '+224', flag: '🇬🇳', lengths: [9] },
  { code: 'CI', name: 'Côte d\'Ivoire', dial: '+225', flag: '🇨🇮', lengths: [9, 10] },
  { code: 'BF', name: 'Burkina Faso', dial: '+226', flag: '🇧🇫', lengths: [8] },
  { code: 'NE', name: 'Niger', dial: '+227', flag: '🇳🇪', lengths: [8] },
  { code: 'TG', name: 'Togo', dial: '+228', flag: '🇹🇬', lengths: [8] },
  { code: 'BJ', name: 'Bénin', dial: '+229', flag: '🇧🇯', lengths: [8, 10] },
  { code: 'MU', name: 'Maurice', dial: '+230', flag: '🇲🇺', lengths: [7, 8] },
  { code: 'LR', name: 'Libéria', dial: '+231', flag: '🇱🇷', lengths: [7, 8] },
  { code: 'SL', name: 'Sierra Leone', dial: '+232', flag: '🇸🇱', lengths: [8] },
  { code: 'GH', name: 'Ghana', dial: '+233', flag: '🇬🇭', lengths: [9, 10] },
  { code: 'NG', name: 'Nigeria', dial: '+234', flag: '🇳🇬', lengths: [10, 11] },
  { code: 'TD', name: 'Tchad', dial: '+235', flag: '🇹🇩', lengths: [8] },
  { code: 'CF', name: 'RCA', dial: '+236', flag: '🇨🇫', lengths: [8] },
  { code: 'CM', name: 'Cameroun', dial: '+237', flag: '🇨🇲', lengths: [9] },
  { code: 'CV', name: 'Cap-Vert', dial: '+238', flag: '🇨🇻', lengths: [7] },
  { code: 'ST', name: 'Sao Tomé-et-Principe', dial: '+239', flag: '🇸🇹', lengths: [7] },
  { code: 'GQ', name: 'Guinée Équatoriale', dial: '+240', flag: '🇬🇶', lengths: [9] },
  { code: 'GA', name: 'Gabon', dial: '+241', flag: '🇬🇦', lengths: [7, 8, 9] },
  { code: 'CG', name: 'Congo-Brazzaville', dial: '+242', flag: '🇨🇬', lengths: [8, 9, 10] },
  { code: 'CD', name: 'Congo-Kinshasa', dial: '+243', flag: '🇨🇩', lengths: [9, 10] },
  { code: 'AO', name: 'Angola', dial: '+244', flag: '🇦🇴', lengths: [9] },
  { code: 'GW', name: 'Guinée-Bissau', dial: '+245', flag: '🇬🇼', lengths: [7] },
  { code: 'SC', name: 'Seychelles', dial: '+248', flag: '🇸🇨', lengths: [7] },
  { code: 'SD', name: 'Soudan', dial: '+249', flag: '🇸🇩', lengths: [9] },
  { code: 'RW', name: 'Rwanda', dial: '+250', flag: '🇷🇼', lengths: [9] },
  { code: 'ET', name: 'Éthiopie', dial: '+251', flag: '🇪🇹', lengths: [9] },
  { code: 'SO', name: 'Somalie', dial: '+252', flag: '🇸🇴', lengths: [8, 9] },
  { code: 'DJ', name: 'Djibouti', dial: '+253', flag: '🇩🇯', lengths: [8] },
  { code: 'KE', name: 'Kenya', dial: '+254', flag: '🇰🇪', lengths: [9, 10] },
  { code: 'TZ', name: 'Tanzanie', dial: '+255', flag: '🇹🇿', lengths: [9] },
  { code: 'UG', name: 'Ouganda', dial: '+256', flag: '🇺🇬', lengths: [9] },
  { code: 'BI', name: 'Burundi', dial: '+257', flag: '🇧🇮', lengths: [8] },
  { code: 'MZ', name: 'Mozambique', dial: '+258', flag: '🇲🇿', lengths: [9] },
  { code: 'ZM', name: 'Zambie', dial: '+260', flag: '🇿🇲', lengths: [9] },
  { code: 'MG', name: 'Madagascar', dial: '+261', flag: '🇲🇬', lengths: [9] },
  { code: 'ZW', name: 'Zimbabwe', dial: '+263', flag: '🇿🇼', lengths: [9] },
  { code: 'NA', name: 'Namibie', dial: '+264', flag: '🇳🇦', lengths: [9] },
  { code: 'MW', name: 'Malawi', dial: '+265', flag: '🇲🇼', lengths: [9] },
  { code: 'LS', name: 'Lesotho', dial: '+266', flag: '🇱🇸', lengths: [8] },
  { code: 'BW', name: 'Botswana', dial: '+267', flag: '🇧🇼', lengths: [8] },
  { code: 'SZ', name: 'Eswatini', dial: '+268', flag: '🇸🇿', lengths: [8] },
  { code: 'KM', name: 'Comores', dial: '+269', flag: '🇰🇲', lengths: [7] },
  { code: 'ER', name: 'Érythrée', dial: '+291', flag: '🇪🇷', lengths: [7] },
  { code: 'OTHER', name: 'Autre pays', dial: '+', flag: '🌐', lengths: [7, 8, 9, 10, 11, 12, 13, 14, 15] }
];

export class BerthoAuth {
  constructor(onUpdate) {
    this.onUpdate = onUpdate;
  }

  detectUserCountry() {
    try {
      const navLangs = navigator.languages || [navigator.language || ''];
      for (const lang of navLangs) {
        if (lang && lang.includes('-')) {
          const region = lang.split('-')[1].toUpperCase();
          if (COUNTRIES.some(c => c.code === region)) return region;
        }
      }

      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
      const tzCityMap = {
        'Brazzaville': 'CG', 'Kinshasa': 'CD', 'Lubumbashi': 'CD',
        'Douala': 'CM', 'Libreville': 'GA', 'Abidjan': 'CI',
        'Dakar': 'SN', 'Paris': 'FR', 'Brussels': 'BE',
        'Casablanca': 'MA', 'Tunis': 'TN', 'Algiers': 'DZ',
        'Lome': 'TG', 'Porto-Novo': 'BJ', 'Ouagadougou': 'BF',
        'Bamako': 'ML', 'Conakry': 'GN', 'Ndjamena': 'TD',
        'Bangui': 'CF', 'Kigali': 'RW', 'New_York': 'US',
        'London': 'GB', 'Toronto': 'CA', 'Lagos': 'NG'
      };

      for (const [city, code] of Object.entries(tzCityMap)) {
        if (tz.includes(city)) return code;
      }
    } catch (e) {}

    return 'CG';
  }

  validateUsername(username) {
    if (!username || !username.trim()) {
      return { valid: false, message: "Veuillez choisir un pseudonyme de joueur." };
    }

    const cleanName = username.trim();

    if (cleanName.length < 3 || cleanName.length > 16) {
      return { valid: false, message: "Votre pseudonyme doit comporter entre 3 et 16 caractères." };
    }

    const validRegex = /^[a-zA-Z0-9_-]+$/;
    if (!validRegex.test(cleanName)) {
      return { valid: false, message: "Le pseudonyme ne doit contenir que des lettres, chiffres ou tirets (_). Les symboles (@, #, $...) et émojis sont interdits." };
    }

    if (/^\d+$/.test(cleanName)) {
      return { valid: false, message: "Un pseudonyme ne peut pas être composé uniquement de chiffres." };
    }

    if (BLOCKED_WORDS.includes(cleanName.toLowerCase())) {
      return { valid: false, message: "Ce pseudonyme est réservé, inapproprié ou non conforme. Veuillez en choisir un autre." };
    }

    if (/^(\w)\1+$/i.test(cleanName)) {
      return { valid: false, message: "Le pseudonyme ne peut pas être composé d'un seul caractère répété." };
    }

    return { valid: true, cleanName: cleanName };
  }

  validatePassword(password) {
    if (!password || !password.trim()) {
      return { valid: false, message: "Veuillez saisir votre mot de passe." };
    }

    const cleanPass = password.trim();
    if (cleanPass.length < 6) {
      return { valid: false, message: "Le mot de passe doit comporter au moins 6 caractères pour des raisons de sécurité." };
    }

    const weakPasswords = ['123456', 'password', 'azerty', 'qwerty', '000000', '111111', '12345678'];
    if (weakPasswords.includes(cleanPass.toLowerCase())) {
      return { valid: false, message: "Ce mot de passe est trop simple. Veuillez choisir un mot de passe plus sécurisé." };
    }

    return { valid: true, cleanPass: cleanPass };
  }

  validatePhone(rawPhone, countryCode) {
    if (!rawPhone || !rawPhone.trim()) {
      return { valid: false, message: "Veuillez saisir votre numéro de téléphone." };
    }

    const cleanDigits = rawPhone.replace(/[^\d]/g, '');

    if (!cleanDigits) {
      return { valid: false, message: "Le numéro ne doit contenir que des chiffres." };
    }

    if (/^(\d)\1+$/.test(cleanDigits)) {
      return { valid: false, message: "Numéro invalide (série de chiffres répétitive)." };
    }

    const badSequences = [
      "1234", "2345", "3456", "4567", "5678", "6789", "0123",
      "9876", "8765", "7654", "6543", "5432", "4321", "3210"
    ];
    if (badSequences.some(seq => cleanDigits.includes(seq))) {
      return { valid: false, message: "Numéro invalide (suite logique comme '12345678' non autorisée)." };
    }

    const country = COUNTRIES.find(c => c.code === countryCode) || COUNTRIES.find(c => c.code === 'OTHER');
    const dialDigits = country.dial.replace(/[^\d]/g, '');

    let nationalDigits = cleanDigits;
    if (dialDigits && nationalDigits.startsWith(dialDigits)) {
      nationalDigits = nationalDigits.slice(dialDigits.length);
    }

    if (countryCode === 'CG' || country.dial === '+242') {
      const firstDigit = nationalDigits.startsWith('0') ? nationalDigits.charAt(1) : nationalDigits.charAt(0);
      if (!['6', '5', '4'].includes(firstDigit)) {
        return { valid: false, message: "Numéro Congo invalide. Un numéro valide doit commencer par 06, 05 ou 04 (MTN / Airtel)." };
      }
    }

    const digitsWithoutZero = (nationalDigits.startsWith('0') && nationalDigits.length > 1) 
      ? nationalDigits.slice(1) 
      : nationalDigits;

    const isValidLength = country.lengths.some(len => 
      len === cleanDigits.length || 
      len === nationalDigits.length || 
      len === digitsWithoutZero.length
    );

    if (!isValidLength) {
      const expectedDesc = country.lengths.join(' ou ');
      return { 
        valid: false, 
        message: `Pour ${country.name} (${country.dial}), la longueur du numéro doit comporter ${expectedDesc} chiffres.` 
      };
    }

    const fullPhone = `${country.dial}${nationalDigits}`;
    return { valid: true, fullPhone: fullPhone };
  }

  requestPushPermission(userId) {
    if ('Notification' in window && 'serviceWorker' in navigator) {
      Notification.requestPermission().catch(() => {});
    }
  }

  checkNewUserPrompt(state) {
    if (!state.currentUser && !localStorage.getItem('BERTHOPLAY_PROMPT_SHOWN')) {
      localStorage.setItem('BERTHOPLAY_PROMPT_SHOWN', '1');
      setTimeout(() => {
        this.openAuthModal(true);
      }, 2000);
    }
  }

  openAuthModal(isNewPrompt = false) {
    this.cleanOverlays();
    const state = JSON.parse(localStorage.getItem('BERTHOPLAY_V1') || '{}');
    const user = state.currentUser;
    const defaultCountry = this.detectUserCountry();

    const modal = document.createElement('div');
    modal.id = 'auth-modal-overlay';

    if (user) {
      modal.innerHTML = `
        <style>
          .auth-overlay { position:fixed; top:0; left:0; width:100vw; height:100dvh; background:rgba(3,3,10,0.96); z-index:99999; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:20px; color:#fff; backdrop-filter:blur(20px); box-sizing:border-box; }
          .auth-box { background:rgba(15,23,42,0.95); border:1px solid #38bdf8; border-radius:24px; padding:25px; width:92%; max-width:380px; text-align:center; box-shadow:0 15px 35px rgba(0,0,0,0.8), 0 0 15px rgba(56,189,248,0.2); }
          .auth-title { font-size:1.1rem; font-weight:900; color:#38bdf8; margin-bottom:5px; letter-spacing:0.5px; display:flex; align-items:center; justify-content:center; gap:8px; }
          .auth-badge { font-size:0.75rem; background:rgba(56,189,248,0.15); color:#38bdf8; padding:4px 12px; border-radius:12px; display:inline-block; margin-bottom:15px; font-weight:bold; }
          .auth-group { text-align:left; margin-bottom:12px; }
          .auth-group label { display:block; font-size:0.75rem; color:#94a3b8; font-weight:bold; margin-bottom:5px; }
          .auth-toggle { display:flex; justify-content:space-between; align-items:center; background:#0f172a; padding:12px 14px; border-radius:12px; border:1px solid #334155; margin-bottom:10px; }
          .auth-toggle span { font-size:0.85rem; font-weight:bold; }
          .auth-btn { width:100%; min-height:48px; padding:12px; background:linear-gradient(135deg, #0284c7, #0369a1); border:none; border-radius:12px; color:#fff; font-weight:900; cursor:pointer; margin-top:10px; transition:opacity 0.2s; }
          .auth-btn:disabled { opacity:0.5; cursor:not-allowed; }
        </style>
        <div class="auth-overlay" id="auth-backdrop">
          <div class="auth-box">
            <div class="auth-title">
              ${SVG_SETTINGS_GEAR}
              ÉDITION PROFIL
            </div>
            <div class="auth-badge">ALLIÉ BERTHOPLAY</div>
            <p id="acc-username-display" style="font-size:1.2rem; font-weight:900; color:#34d399; margin-bottom:15px;"></p>

            <div class="auth-toggle">
              <span>Profil Privé (Amis seuls)</span>
              <input type="checkbox" id="chk-private" aria-label="Activer ou désactiver le profil privé" ${user.is_private ? 'checked' : ''} />
            </div>

            <div class="auth-toggle">
              <span>Masquer mes Abonnés</span>
              <input type="checkbox" id="chk-hide-subs" aria-label="Masquer ou afficher la liste des abonnés" ${user.hide_subscribers ? 'checked' : ''} />
            </div>

            <div class="auth-group">
              <label for="acc-bio">MA BIO / CITATION JOUEUR</label>
              <input type="text" id="acc-bio" aria-label="Votre bio ou citation de joueur" style="width:100%; min-height:48px; padding:12px; background:#0f172a; border:1px solid #334155; color:#fff; border-radius:10px; outline:none; box-sizing:border-box;" placeholder="Votre citation de gamer..." />
            </div>

            <button class="auth-btn" id="btn-save-acc" aria-label="Enregistrer mes préférences de profil">ENREGISTRER MES PRÉFÉRENCES</button>
            <button class="auth-btn" id="btn-close-acc" aria-label="Annuler l'édition de profil" style="background:#1e293b; margin-top:8px;">ANNULER</button>
          </div>
        </div>
      `;
    } else {
      const countryOptionsHTML = COUNTRIES.map(c => 
        `<option value="${c.code}" ${c.code === defaultCountry ? 'selected' : ''}>${c.flag} ${c.dial}</option>`
      ).join('');

      modal.innerHTML = `
        <style>
          .auth-overlay { position:fixed; top:0; left:0; width:100vw; height:100dvh; background:rgba(3,3,10,0.96); z-index:99999; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:20px; color:#fff; backdrop-filter:blur(20px); box-sizing:border-box; }
          .auth-box { background:rgba(15,23,42,0.95); border:1px solid #38bdf8; border-radius:24px; padding:25px; width:92%; max-width:380px; text-align:center; box-shadow:0 15px 35px rgba(0,0,0,0.8), 0 0 15px rgba(56,189,248,0.2); }
          .auth-prompt-tag { background:rgba(56,189,248,0.15); color:#38bdf8; font-size:0.78rem; padding:8px 14px; border-radius:12px; font-weight:bold; margin-bottom:14px; display:${isNewPrompt ? 'block' : 'none'}; border:1px solid rgba(56,189,248,0.3); }
          .auth-tabs { display:flex; gap:10px; margin-bottom:18px; }
          .auth-tab { flex:1; min-height:48px; padding:12px; background:#0f172a; border:1px solid #334155; color:#94a3b8; border-radius:12px; font-weight:900; cursor:pointer; font-size:0.85rem; transition:all 0.2s; display:flex; align-items:center; justify-content:center; }
          .auth-tab.active { border-color:#38bdf8; color:#38bdf8; background:#1e293b; box-shadow:0 0 10px rgba(56,189,248,0.2); }
          
          .phone-group { display:flex; gap:8px; margin-bottom:12px; width:100%; }
          .auth-select { background:#0f172a; border:1px solid #334155; border-radius:12px; color:#fff; padding:12px 10px; font-weight:bold; font-size:0.9rem; outline:none; width:115px; cursor:pointer; min-height:48px; }
          .auth-input { width:100%; min-height:48px; padding:12px; background:#0f172a; border:1px solid #334155; border-radius:12px; color:#fff; font-size:0.9rem; outline:none; box-sizing:border-box; margin-bottom:12px; }
          .phone-group .auth-input { margin-bottom:0; flex:1; }

          .input-pass-wrapper { position:relative; width:100%; margin-bottom:12px; }
          .input-pass-wrapper .auth-input { margin-bottom:0; padding-right:48px; }
          .btn-eye { position:absolute; right:4px; top:50%; transform:translateY(-50%); width:44px; height:44px; background:none; border:none; color:#38bdf8; cursor:pointer; display:flex; align-items:center; justify-content:center; }
          .auth-btn { width:100%; min-height:48px; padding:12px; background:linear-gradient(135deg, #0284c7, #0369a1); border:none; border-radius:12px; color:#fff; font-weight:900; cursor:pointer; margin-top:6px; font-size:0.9rem; letter-spacing:0.5px; transition:opacity 0.2s; }
          .auth-btn:disabled { opacity:0.5; cursor:not-allowed; }
        </style>

        <div class="auth-overlay" id="auth-backdrop">
          <div class="auth-box">
            <div class="auth-prompt-tag">Rejoignez la communauté BerthoPlay !</div>
            <div class="auth-tabs">
              <div class="auth-tab active" id="tab-login" role="button" aria-label="Onglet Connexion">CONNEXION</div>
              <div class="auth-tab" id="tab-reg" role="button" aria-label="Onglet Créer un compte">CRÉER COMPTE</div>
            </div>

            <!-- FORMULAIRE DE CONNEXION -->
            <div id="form-login">
              <div class="phone-group">
                <select id="login-country" class="auth-select" aria-label="Sélectionner le pays et l'indicatif téléphonique">
                  ${countryOptionsHTML}
                </select>
                <input type="tel" id="login-phone" class="auth-input" aria-label="Numéro de téléphone de connexion" placeholder="Numéro de Téléphone" />
              </div>
              <div class="input-pass-wrapper">
                <input type="password" id="login-pass" class="auth-input" aria-label="Mot de passe de connexion" placeholder="Mot de passe" />
                <button type="button" class="btn-eye" id="toggle-pass-login" aria-label="Afficher ou masquer le mot de passe" title="Afficher ou masquer le mot de passe">${SVG_EYE_OPEN}</button>
              </div>
              <button class="auth-btn" id="btn-do-login" aria-label="Se connecter à votre compte BerthoPlay">SE CONNECTER</button>
            </div>

            <!-- FORMULAIRE D'INSCRIPTION -->
            <div id="form-reg" style="display:none;">
              <input type="text" id="reg-name" class="auth-input" aria-label="Pseudonyme de joueur" placeholder="Pseudonyme Joueur (3 à 16 caractères)" />
              <div class="phone-group">
                <select id="reg-country" class="auth-select" aria-label="Sélectionner le pays et l'indicatif d'inscription">
                  ${countryOptionsHTML}
                </select>
                <input type="tel" id="reg-phone" class="auth-input" aria-label="Numéro de téléphone d'inscription" placeholder="Numéro de Téléphone" />
              </div>
              <div class="input-pass-wrapper">
                <input type="password" id="reg-pass" class="auth-input" aria-label="Mot de passe d'inscription" placeholder="Mot de passe (Min 6 caractères)" />
                <button type="button" class="btn-eye" id="toggle-pass-reg" aria-label="Afficher ou masquer le mot de passe d'inscription" title="Afficher ou masquer le mot de passe">${SVG_EYE_OPEN}</button>
              </div>
              <button class="auth-btn" id="btn-do-reg" aria-label="S'inscrire et créer un compte joueur">S'INSCRIRE</button>
            </div>

            <button class="auth-btn" id="btn-close-auth-modal" aria-label="Annuler et fermer la fenêtre d'authentification" style="background:#1e293b; margin-top:12px;">ANNULER</button>
          </div>
        </div>
      `;
    }

    document.body.appendChild(modal);

    if (user) {
      const userDisplay = document.getElementById('acc-username-display');
      if (userDisplay) userDisplay.textContent = user.username || '';
      const bioInput = document.getElementById('acc-bio');
      if (bioInput) bioInput.value = user.bio || '';
    }

    document.getElementById('auth-backdrop')?.addEventListener('click', (e) => {
      if (e.target.id === 'auth-backdrop') this.cleanOverlays();
    });

    document.getElementById('btn-close-acc')?.addEventListener('click', () => this.cleanOverlays());
    document.getElementById('btn-close-auth-modal')?.addEventListener('click', () => this.cleanOverlays());

    const bindEyeToggle = (inputId, eyeBtnId) => {
      const input = document.getElementById(inputId);
      const btn = document.getElementById(eyeBtnId);
      btn?.addEventListener('click', () => {
        if (input.type === 'password') {
          input.type = 'text';
          btn.innerHTML = SVG_EYE_OFF;
        } else {
          input.type = 'password';
          btn.innerHTML = SVG_EYE_OPEN;
        }
      });
    };

    bindEyeToggle('login-pass', 'toggle-pass-login');
    bindEyeToggle('reg-pass', 'toggle-pass-reg');

    const tabLogin = document.getElementById('tab-login');
    const tabReg = document.getElementById('tab-reg');
    const formLogin = document.getElementById('form-login');
    const formReg = document.getElementById('form-reg');

    tabLogin?.addEventListener('click', () => {
      tabLogin.classList.add('active'); 
      tabReg?.classList.remove('active');
      if (formLogin) formLogin.style.display = 'block';
      if (formReg) formReg.style.display = 'none';
    });

    tabReg?.addEventListener('click', () => {
      tabReg.classList.add('active'); 
      tabLogin?.classList.remove('active');
      if (formReg) formReg.style.display = 'block';
      if (formLogin) formLogin.style.display = 'none';
    });

    const setButtonLoading = (btnId, isLoading, defaultText) => {
      const btn = document.getElementById(btnId);
      if (btn) {
        btn.disabled = isLoading;
        btn.innerText = isLoading ? 'PATIENTEZ...' : defaultText;
      }
    };

    const doRegister = async () => {
      const name = document.getElementById('reg-name')?.value?.trim();
      const rawPhone = document.getElementById('reg-phone')?.value?.trim();
      const countryCode = document.getElementById('reg-country')?.value;
      const pass = document.getElementById('reg-pass')?.value;

      const usernameValidation = this.validateUsername(name);
      if (!usernameValidation.valid) {
        BerthoUI.alert("PSEUDONYME INVALIDE", usernameValidation.message);
        return;
      }

      const phoneValidation = this.validatePhone(rawPhone, countryCode);
      if (!phoneValidation.valid) {
        BerthoUI.alert("NUMÉRO INVALIDE", phoneValidation.message);
        return;
      }

      const passValidation = this.validatePassword(pass);
      if (!passValidation.valid) {
        BerthoUI.alert("MOT DE PASSE", passValidation.message);
        return;
      }

      setButtonLoading('btn-do-reg', true, "S'INSCRIRE");

      // Mode Sandbox : Création locale instantanée sans solliciter D1 SQL
      setTimeout(() => {
        const mockUser = {
          id: 'usr_' + Math.random().toString(36).substr(2, 9),
          username: usernameValidation.cleanName,
          phone: phoneValidation.fullPhone,
          coins: 500,
          is_private: 0,
          hide_subscribers: 0,
          bio: 'Joueur BerthoPlay 🎮',
          is_verified: 0
        };

        const state = JSON.parse(localStorage.getItem('BERTHOPLAY_V1') || '{}');
        state.currentUser = mockUser;
        state.userId = mockUser.id;
        state.coins = mockUser.coins;
        localStorage.setItem('BERTHOPLAY_V1', JSON.stringify(state));

        this.requestPushPermission(mockUser.id);

        setButtonLoading('btn-do-reg', false, "S'INSCRIRE");
        BerthoUI.alert("BIENVENUE !", "Votre compte joueur a été créé avec succès !");
        this.cleanOverlays();
        if (this.onUpdate) this.onUpdate();
      }, 400);
    };

    const doLogin = async () => {
      const rawPhone = document.getElementById('login-phone')?.value?.trim();
      const countryCode = document.getElementById('login-country')?.value;
      const pass = document.getElementById('login-pass')?.value;

      const phoneValidation = this.validatePhone(rawPhone, countryCode);
      if (!phoneValidation.valid) {
        BerthoUI.alert("NUMÉRO INVALIDE", phoneValidation.message);
        return;
      }

      const passValidation = this.validatePassword(pass);
      if (!passValidation.valid) {
        BerthoUI.alert("MOT DE PASSE", passValidation.message);
        return;
      }

      setButtonLoading('btn-do-login', true, "SE CONNECTER");

      // Mode Sandbox : Connexion locale instantanée sans solliciter D1 SQL
      setTimeout(() => {
        const mockUser = {
          id: 'usr_' + Math.random().toString(36).substr(2, 9),
          username: 'Joueur_' + rawPhone.slice(-4),
          phone: phoneValidation.fullPhone,
          coins: 750,
          is_private: 0,
          hide_subscribers: 0,
          bio: 'Joueur BerthoPlay 🎮',
          is_verified: 0
        };

        const state = JSON.parse(localStorage.getItem('BERTHOPLAY_V1') || '{}');
        state.currentUser = mockUser;
        state.userId = mockUser.id;
        state.coins = mockUser.coins;
        localStorage.setItem('BERTHOPLAY_V1', JSON.stringify(state));

        this.requestPushPermission(mockUser.id);

        setButtonLoading('btn-do-login', false, "SE CONNECTER");
        BerthoUI.alert("CONNEXION RÉUSSIE", `Ravi de vous revoir !`);
        this.cleanOverlays();
        if (this.onUpdate) this.onUpdate();
      }, 400);
    };

    document.getElementById('btn-do-reg')?.addEventListener('click', doRegister);
    document.getElementById('btn-do-login')?.addEventListener('click', doLogin);

    const bindEnterKey = (inputId, actionFn) => {
      document.getElementById(inputId)?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') actionFn();
      });
    };

    bindEnterKey('login-phone', doLogin);
    bindEnterKey('login-pass', doLogin);
    bindEnterKey('reg-name', doRegister);
    bindEnterKey('reg-phone', doRegister);
    bindEnterKey('reg-pass', doRegister);

    document.getElementById('btn-save-acc')?.addEventListener('click', () => {
      const isPrivate = document.getElementById('chk-private')?.checked;
      const hideSubs = document.getElementById('chk-hide-subs')?.checked;
      const bio = document.getElementById('acc-bio')?.value;

      setButtonLoading('btn-save-acc', true, "ENREGISTRER MES PRÉFÉRENCES");

      const updatedUser = { ...user, is_private: isPrivate ? 1 : 0, hide_subscribers: hideSubs ? 1 : 0, bio };
      const state = JSON.parse(localStorage.getItem('BERTHOPLAY_V1') || '{}');
      state.currentUser = updatedUser;
      localStorage.setItem('BERTHOPLAY_V1', JSON.stringify(state));

      setTimeout(() => {
        setButtonLoading('btn-save-acc', false, "ENREGISTRER MES PRÉFÉRENCES");
        BerthoUI.alert("PROFIL", "Vos préférences ont été sauvegardées !");
        this.cleanOverlays();
        if (this.onUpdate) this.onUpdate();
      }, 200);
    });
  }

  cleanOverlays() {
    const el = document.getElementById('auth-modal-overlay');
    if (el && el.parentNode) el.parentNode.removeChild(el);
  }
}