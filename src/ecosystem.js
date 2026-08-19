// ============================================================================
// BERTHOPLAY — INFRASTRUCTURES BERTHO
// ----------------------------------------------------------------------------
// Panneau des autres produits de l'écosystème. Les emojis d'origine sont
// remplacés par des icônes vectorielles : un emoji change de dessin selon
// la plateforme et ne peut pas prendre la couleur du thème.
// ============================================================================

import { icon } from './components/icons.js';
import { BerthoSoundEffects } from './services/sound-effects.js';

export const BERTHO_ECOSYSTEM_DATA = [
  {
    id: 'web', name: 'Web', glyph: 'globe',
    tagline: 'Site officiel & présence digitale',
    desc: 'Portail central et vitrine technologique du groupe Bertho.',
    url: 'https://bertho-web.pages.dev',
    status: 'online',
    tags: ['5 langues', 'Thème clair/sombre']
  },
  {
    id: 'docs', name: 'Docs', glyph: 'edit',
    tagline: "Diagnostics & analyses d'entreprises",
    desc: "E-commerce spécialisé dans les audits, diagnostics et études d'entreprises.",
    url: 'https://bertho-docs.pages.dev',
    status: 'online',
    tags: ['3 langues', 'Audits PME']
  },
  {
    id: 'pay', name: 'Pay', glyph: 'coin',
    tagline: 'Passerelle de paiement haute performance',
    desc: 'Solution de paiement sécurisée, utilisable même sans connexion.',
    url: 'https://berthopay.pages.dev',
    status: 'finishing',
    tags: ['14 langues', 'PWA hors-ligne']
  },
  {
    id: 'marketplace', name: 'Marketplace', glyph: 'grid',
    tagline: 'E-commerce global multi-vendeurs',
    desc: 'Place de marché multi-vendeurs à couverture internationale.',
    url: 'https://bertho-markeplace.pages.dev',
    status: 'finishing',
    tags: ['14 langues', 'Multi-vendeurs']
  },
  {
    id: 'play', name: 'Play', glyph: 'gamepad',
    tagline: 'Console web 3D & hub de jeu',
    desc: 'Vous y êtes : jeux 3D, clans, messagerie et classements.',
    url: '#',
    status: 'current',
    tags: ['Jeux 3D', 'Berthocoins']
  },
  {
    id: 'id', name: 'ID', glyph: 'shield',
    tagline: 'Identité numérique unifiée',
    desc: 'Connexion unique à tous les services de l\'écosystème.',
    url: '#',
    status: 'upcoming',
    tags: ['SSO sécurisé', 'Pass universel']
  },
  {
    id: 'cloud', name: 'Cloud', glyph: 'download',
    tagline: 'Stockage & infrastructures sécurisées',
    desc: 'Stockage chiffré et infrastructure haute disponibilité.',
    url: '#',
    status: 'upcoming',
    tags: ['Chiffré', 'Haute vitesse']
  },
  {
    id: 'wallet', name: 'Wallet', glyph: 'lock',
    tagline: "Portefeuille d'actifs numériques",
    desc: 'Coffre-fort pour vos actifs, monnaie courante et Berthocoins.',
    url: '#',
    status: 'upcoming',
    tags: ['Fiat & crypto', 'Coffre-fort']
  },
  {
    id: 'ia', name: 'IA', glyph: 'target',
    tagline: 'Intelligence artificielle générative',
    desc: "Outils d'automatisation, de traitement et d'analyse de données.",
    url: '#',
    status: 'upcoming',
    tags: ['Multi-modèles', 'Modèles sur mesure']
  }
];

// Le statut se lit au texte autant qu'à la couleur.
const STATUS = {
  online:    { label: 'En ligne',   badge: 'badge--success' },
  finishing: { label: 'En finition', badge: 'badge--warn' },
  current:   { label: 'Vous êtes ici', badge: 'badge--blood' },
  upcoming:  { label: 'À venir',    badge: 'badge--neutral' }
};

export class BerthoEcosystem {
  constructor(onClose) {
    this.onClose = onClose;
    this.modal = null;
    this.previouslyFocused = null;
  }

  open() {
    this.previouslyFocused = document.activeElement;

    this.modal = document.createElement('div');
    this.modal.id = 'eco-selector-modal';
    this.modal.className = 'overlay-view';
    this.modal.setAttribute('role', 'dialog');
    this.modal.setAttribute('aria-modal', 'true');
    this.modal.setAttribute('aria-labelledby', 'eco-title');

    this.modal.innerHTML = `
      <header class="overlay-view__head">
        <button class="btn btn--icon btn--ghost" id="eco-close" type="button"
                data-sfx="back" aria-label="Fermer les infrastructures">
          ${icon('arrow-left')}
        </button>
        <div class="grow">
          <h1 class="t-screen-title" id="eco-title" style="font-size:var(--text-lg);">Infrastructures</h1>
          <p class="t-meta">L'écosystème Bertho</p>
        </div>
      </header>

      <div class="container--wide">
        <div class="hub-grid">
          ${BERTHO_ECOSYSTEM_DATA.map(item => this.card(item)).join('')}
        </div>
      </div>
    `;

    document.body.appendChild(this.modal);

    this.modal.querySelector('#eco-close')?.addEventListener('click', () => this.close());

    this.onKey = (e) => { if (e.key === 'Escape') this.close(); };
    document.addEventListener('keydown', this.onKey);

    this.modal.querySelector('#eco-close')?.focus();
    BerthoSoundEffects.playOpen();
  }

  card(item) {
    const status = STATUS[item.status] || STATUS.upcoming;
    const isLive = item.status === 'online' || item.status === 'finishing';

    return `
      <article class="panel" style="display:flex; flex-direction:column; gap:var(--sp-3);">
        <div class="row" style="gap:var(--sp-3); align-items:flex-start;">
          <span class="tile__icon" aria-hidden="true"
                style="color:${item.status === 'current' ? 'var(--blood-lit)' : 'var(--violet-lit)'};">
            ${icon(item.glyph, 'icon icon--lg')}
          </span>

          <div class="grow">
            <h2 class="wordmark wordmark--sm" style="margin-bottom:var(--sp-1);">
              <span class="wordmark__a">Bertho</span><span class="wordmark__b">${item.name}</span>
            </h2>
            <p class="list-row__sub" style="white-space:normal;">${item.tagline}</p>
          </div>

          <span class="badge ${status.badge}">${status.label}</span>
        </div>

        <p class="t-body" style="font-size:var(--text-sm);">${item.desc}</p>

        <div class="row" style="gap:var(--sp-2); flex-wrap:wrap;">
          ${item.tags.map(t => `<span class="badge badge--neutral">${t}</span>`).join('')}
        </div>

        ${isLive
          ? `<a class="btn btn--outline btn--sm" href="${item.url}" target="_blank" rel="noopener noreferrer"
                style="align-self:flex-start;">
               ${icon('external', 'icon icon--sm')} Visiter
             </a>`
          : `<span class="btn btn--secondary btn--sm" aria-disabled="true"
                   style="align-self:flex-start; opacity:0.5; cursor:default;">
               ${item.status === 'current' ? 'Application active' : 'Bientôt disponible'}
             </span>`}
      </article>`;
  }

  close() {
    if (this.onKey) {
      document.removeEventListener('keydown', this.onKey);
      this.onKey = null;
    }
    this.modal?.remove();
    this.modal = null;

    if (this.previouslyFocused instanceof HTMLElement) this.previouslyFocused.focus();
    this.onClose?.();
  }
}
