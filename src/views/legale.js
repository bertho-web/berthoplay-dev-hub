// ============================================================================
// BERTHOPLAY — RÈGLEMENTS, ANTI-TRICHE & CONFIDENTIALITÉ
// ============================================================================

import { icon } from '../components/icons.js';
import { BerthoSoundEffects } from '../services/sound-effects.js';

const SECTIONS = [
  {
    heading: "Conditions générales d'utilisation",
    body: `BerthoPlay est une console de jeux web progressive. L'accès aux jeux est gratuit.
           Les Berthocoins sont une monnaie virtuelle obtenue en jouant ; ils servent à débloquer
           des niveaux et à participer aux compétitions. Ils n'ont aucune valeur monétaire réelle
           et ne peuvent être ni achetés ni échangés contre de l'argent.`
  },
  {
    heading: 'Charte anti-triche',
    body: `Le recours à un script externe, la modification des paquets réseau ou l'exploitation
           d'une faille pour altérer un score entraîne la suppression du compte et la révocation
           des Berthocoins acquis. En cas de doute sur une sanction, écrivez au support depuis
           les réglages : chaque signalement est réexaminé.`
  },
  {
    heading: 'Confidentialité et données personnelles',
    body: `Numéro de téléphone, pseudonyme, accès au micro et à la caméra : ces données sont
           chiffrées en transit et stockées sur l'infrastructure Cloudflare. Les appels audio et
           vidéo transitent en pair-à-pair (WebRTC) et ne passent donc pas par nos serveurs.
           Vous pouvez demander la suppression de votre compte et de vos données à tout moment.`
  },
  {
    heading: 'Propriété intellectuelle',
    body: `BerthoPlay Console Web © 2026. Les moteurs de jeu 2D et 3D, les graphismes et les
           composants logiciels sont la propriété exclusive de BerthoPlay.`
  }
];

export class LegaleView {
  constructor(onClose) {
    this.onClose = onClose;
    this.previouslyFocused = document.activeElement;
    this.render();
  }

  render() {
    this.clean(false);

    const modal = document.createElement('div');
    modal.id = 'legale-modal-overlay';
    modal.className = 'overlay-view';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'leg-title');

    modal.innerHTML = `
      <header class="overlay-view__head">
        <button class="btn btn--icon btn--ghost" id="btn-close-leg-x" type="button"
                data-sfx="back" aria-label="Fermer les règlements">
          ${icon('arrow-left')}
        </button>
        <h1 class="t-screen-title grow" id="leg-title">Règlements</h1>
      </header>

      <div class="container prose" style="padding-bottom:var(--sp-10);">
        ${SECTIONS.map((s, i) => `
          <section class="panel" style="margin-bottom:var(--sp-4);">
            <h2 class="t-section" style="font-size:var(--text-md); color:var(--gold-lit); margin-bottom:var(--sp-2);">
              ${i + 1}. ${s.heading}
            </h2>
            <p class="t-body" style="font-size:var(--text-sm);">${s.body}</p>
          </section>`).join('')}

        <button class="btn btn--primary btn--cut btn--block" id="btn-close-leg" type="button">
          J'ai lu et j'accepte
        </button>
      </div>
    `;

    document.body.appendChild(modal);

    const close = () => this.clean(true);
    document.getElementById('btn-close-leg')?.addEventListener('click', close);
    document.getElementById('btn-close-leg-x')?.addEventListener('click', close);

    // Échap ferme, comme partout ailleurs dans l'application.
    this.onKey = (e) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', this.onKey);

    document.getElementById('btn-close-leg-x')?.focus();
    BerthoSoundEffects.playOpen();
  }

  clean(notify = true) {
    document.getElementById('legale-modal-overlay')?.remove();
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
