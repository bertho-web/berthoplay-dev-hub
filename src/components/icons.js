// ============================================================================
// BERTHOPLAY — JEU D'ICÔNES
// ----------------------------------------------------------------------------
// Une seule famille, un seul tracé : 24x24, contour, épaisseur héritée de la
// classe .icon (1.75), extrémités arrondies. Aucun emoji dans l'interface :
// les emojis changent de forme selon la plateforme et ne se colorent pas.
//
// Usage :  icon('home')                 -> <svg class="icon">…</svg>
//          icon('coin', 'icon icon--lg')
//          iconFilled('star')           -> variante pleine (états actifs)
// ============================================================================

const PATHS = {
  // --- Navigation ---------------------------------------------------------
  home: '<path d="M3 10.5 12 3l9 7.5V20a1.5 1.5 0 0 1-1.5 1.5h-4v-6h-7v6h-4A1.5 1.5 0 0 1 3 20z"/>',
  bell: '<path d="M18 8.5a6 6 0 0 0-12 0c0 6.5-2.5 8.5-2.5 8.5h17S18 15 18 8.5"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/>',
  trophy: '<path d="M6 4h12v6a6 6 0 0 1-12 0z"/><path d="M6 6H4.2A2.2 2.2 0 0 0 4.2 10.5H6"/><path d="M18 6h1.8a2.2 2.2 0 0 1 0 4.5H18"/><path d="M12 16v3"/><path d="M8.5 21h7"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M20 21v-1.5a5 5 0 0 0-5-5H9a5 5 0 0 0-5 5V21"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.1 14.5a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.2a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.2a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.2a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.2a1.6 1.6 0 0 0-1.5 1z"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',

  // --- Directions ---------------------------------------------------------
  'chevron-right': '<path d="m9 5 7 7-7 7"/>',
  'chevron-left': '<path d="m15 5-7 7 7 7"/>',
  'chevron-down': '<path d="m5 9 7 7 7-7"/>',
  'arrow-left': '<path d="M20 12H4"/><path d="m10 6-6 6 6 6"/>',
  'arrow-right': '<path d="M4 12h16"/><path d="m14 6 6 6-6 6"/>',
  'arrow-up': '<path d="M12 20V4"/><path d="m6 10 6-6 6 6"/>',
  external: '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M20 14v6a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 20V6.5A1.5 1.5 0 0 1 5.5 5H11"/>',

  // --- Actions -------------------------------------------------------------
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  check: '<path d="m4 12.5 5 5L20 6.5"/>',
  plus: '<path d="M12 5v14"/><path d="M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  edit: '<path d="M11 4H5.5A1.5 1.5 0 0 0 4 5.5v13A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V13"/><path d="M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4z"/>',
  trash: '<path d="M3 6h18"/><path d="M8 6V4.5A1.5 1.5 0 0 1 9.5 3h5A1.5 1.5 0 0 1 16 4.5V6"/><path d="M19 6v13.5A1.5 1.5 0 0 1 17.5 21h-11A1.5 1.5 0 0 1 5 19.5V6"/><path d="M10 11v6"/><path d="M14 11v6"/>',
  download: '<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M4 20h16"/>',
  share: '<path d="M12 3v13"/><path d="m8 7 4-4 4 4"/><path d="M5 13v6.5A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.5-1.5V13"/>',
  refresh: '<path d="M20 11A8 8 0 0 0 6.3 6.3L3 9.5"/><path d="M3 4v5.5h5.5"/><path d="M4 13a8 8 0 0 0 13.7 4.7L21 14.5"/><path d="M21 20v-5.5h-5.5"/>',
  logout: '<path d="M9 21H5.5A1.5 1.5 0 0 1 4 19.5v-15A1.5 1.5 0 0 1 5.5 3H9"/><path d="m15 16 4-4-4-4"/><path d="M19 12H9"/>',

  // --- Statut ---------------------------------------------------------------
  'alert-triangle': '<path d="M10.3 3.9 1.9 18a2 2 0 0 0 1.7 3h16.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  'alert-circle': '<circle cx="12" cy="12" r="9"/><path d="M12 7.5v5"/><path d="M12 16.5h.01"/>',
  'check-circle': '<circle cx="12" cy="12" r="9"/><path d="m8.5 12 2.5 2.5 4.5-5"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 16v-4.5"/><path d="M12 8h.01"/>',
  lock: '<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
  unlock: '<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 7.5-2"/>',
  eye: '<path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12"/><circle cx="12" cy="12" r="3"/>',
  'eye-off': '<path d="M10.6 6.2A8.9 8.9 0 0 1 12 6c6.4 0 10 6 10 6a17 17 0 0 1-3 3.7"/><path d="M6.3 6.4A17 17 0 0 0 2 12s3.6 6 10 6a9.4 9.4 0 0 0 4-.9"/><path d="M3 3l18 18"/>',

  // --- Jeu & récompense -----------------------------------------------------
  coin: '<circle cx="12" cy="12" r="9"/><path d="M14.5 9.2A3 3 0 0 0 12 8c-1.7 0-3 1-3 2.2 0 2.8 6 1.2 6 4 0 1.2-1.3 2.2-3 2.2a3 3 0 0 1-2.5-1.2"/><path d="M12 6v12"/>',
  star: '<path d="m12 3.5 2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L3.2 10l6.1-.9z"/>',
  crown: '<path d="M3 7.5 6.5 13 12 5l5.5 8L21 7.5V17a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17z"/>',
  flame: '<path d="M12 21c3.9 0 6.5-2.5 6.5-6 0-4.5-4.5-6-4.5-11 0 0-3 1.5-3 5.5 0 2-1 2.5-1.5 2.5S8 11 8 9c-1.5 1.5-2.5 3.5-2.5 6 0 3.5 2.6 6 6.5 6"/>',
  gamepad: '<path d="M7 11h4"/><path d="M9 9v4"/><path d="M15.5 11h.01"/><path d="M18 13.5h.01"/><rect x="2" y="6" width="20" height="12" rx="5"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none"/>',
  shield: '<path d="M12 21s7.5-3.5 7.5-9V6L12 3 4.5 6v6c0 5.5 7.5 9 7.5 9"/>',
  swords: '<path d="M14.5 14.5 21 21"/><path d="M15 3h6v6"/><path d="M9.5 14.5 3 21"/><path d="M9 3H3v6"/><path d="M21 3 3 21"/>',

  // --- Social & messagerie --------------------------------------------------
  message: '<path d="M21 11.5a8.4 8.4 0 0 1-9 8.5 9.5 9.5 0 0 1-4-.9L3 21l1.9-5a9.5 9.5 0 0 1-.9-4 8.4 8.4 0 0 1 8.5-9 8.4 8.4 0 0 1 8.5 8.5"/>',
  send: '<path d="M21 3 10.5 13.5"/><path d="M21 3 14.5 21l-4-8-8-4z"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20v-1a5 5 0 0 1 5-5h3a5 5 0 0 1 5 5v1"/><path d="M17 4.3a3.5 3.5 0 0 1 0 7.4"/><path d="M18.5 14.2a5 5 0 0 1 3 4.6V20"/>',
  'user-plus': '<circle cx="9" cy="8" r="4"/><path d="M2.5 20v-1a5 5 0 0 1 5-5h3a5 5 0 0 1 5 5v1"/><path d="M19 8v6"/><path d="M22 11h-6"/>',
  heart: '<path d="M12 20.5S3.5 15.5 3.5 9.5A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 8.5 2.5c0 6-8.5 11-8.5 11"/>',
  comment: '<path d="M20 15.5A1.5 1.5 0 0 1 18.5 17H7l-4 4V5.5A1.5 1.5 0 0 1 4.5 4h14A1.5 1.5 0 0 1 20 5.5z"/>',
  phone: '<path d="M21.5 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 1.6 4.2 2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.6 9.7a16 16 0 0 0 6 6l1.1-1.2a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2"/>',
  video: '<rect x="2" y="6" width="13" height="12" rx="2"/><path d="m15 10.5 6-3.5v10l-6-3.5z"/>',
  mic: '<rect x="9" y="2" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0"/><path d="M12 17.5V21"/>',
  image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9.5" r="1.8"/><path d="m3.5 17.5 5-5 4.5 4.5 3-3 4.5 4.5"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3.2 9h17.6"/><path d="M3.2 15h17.6"/><path d="M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18"/>',

  // --- Média ---------------------------------------------------------------
  play: '<path d="M7 4.5 19 12 7 19.5z"/>',
  pause: '<rect x="7" y="4.5" width="3.5" height="15" rx="1"/><rect x="13.5" y="4.5" width="3.5" height="15" rx="1"/>',
  volume: '<path d="M11 5 6.5 9H3v6h3.5L11 19z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/>',
  'volume-off': '<path d="M11 5 6.5 9H3v6h3.5L11 19z"/><path d="m16 9.5 5 5"/><path d="m21 9.5-5 5"/>',
  smartphone: '<rect x="6" y="2" width="12" height="20" rx="2.5"/><path d="M11 18.5h2"/>'
};

/** Renvoie le balisage SVG d'une icône. Un nom inconnu renvoie une chaîne vide. */
export function icon(name, cls = 'icon') {
  const d = PATHS[name];
  if (!d) return '';
  return `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${d}</svg>`;
}

/** Variante pleine — réservée aux états actifs (favori posé, étoile gagnée). */
export function iconFilled(name, cls = 'icon icon--fill') {
  return icon(name, cls);
}

/**
 * Icône porteuse de sens (sans libellé texte à côté) : elle a besoin d'un nom
 * accessible, sinon un lecteur d'écran ne voit rien.
 */
export function iconLabelled(name, label, cls = 'icon') {
  const d = PATHS[name];
  if (!d) return '';
  return `<svg class="${cls}" viewBox="0 0 24 24" role="img" aria-label="${label}">${d}</svg>`;
}

export const ICON_NAMES = Object.keys(PATHS);
