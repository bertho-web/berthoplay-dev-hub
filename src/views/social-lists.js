// ============================================================================
// BERTHOPLAY — ABONNÉS & ABONNEMENTS
// ============================================================================

import { BerthoChat } from '../chat.js';
import { BerthoUI } from '../ui-dialogs.js';
import { icon } from '../components/icons.js';

// Mode Sandbox : listes simulées localement
const IS_SANDBOX = true;

const MOCK = {
  followers: [
    { id: 'usr_gervis', username: 'Gervis' },
    { id: 'usr_mum', username: 'Mum' },
    { id: 'usr_benie', username: 'Bénie' },
    { id: 'usr_saint', username: 'Saint' }
  ],
  following: [
    { id: 'usr_gervis', username: 'Gervis' },
    { id: 'usr_benie', username: 'Bénie' },
    { id: 'usr_boanerges', username: 'De Boanerges' }
  ]
};

export class BerthoSocialLists {
  /**
   * @param {{id:string, username:string}} targetUser
   * @param {'followers'|'following'} listType
   */
  static open(targetUser, listType = 'followers') {
    const isFollowers = listType === 'followers';
    const title = isFollowers ? 'Abonnés' : 'Abonnements';

    const { overlay, close } = BerthoUI.mount({
      title: `${title} — ${BerthoUI.escape(targetUser.username)}`,
      body: `<div id="social-list-content" style="max-height:52vh; overflow-y:auto; overscroll-behavior:contain;"
                  aria-busy="true">${this.skeleton()}</div>`,
      actions: `<button class="btn btn--secondary btn--block" id="btn-close-social" type="button">Fermer</button>`
    });

    overlay.querySelector('#btn-close-social')?.addEventListener('click', close);

    this.fetchSocialList(targetUser.id, listType, close);
  }

  static skeleton() {
    return `<div class="list">
      ${Array.from({ length: 3 }, () => `
        <div class="list-row" style="cursor:default;">
          <div class="skeleton skeleton--avatar"></div>
          <div class="grow"><div class="skeleton skeleton--text" style="width:50%; margin-bottom:0;"></div></div>
        </div>`).join('')}
    </div>`;
  }

  static fetchSocialList(userId, listType, close) {
    const container = document.getElementById('social-list-content');
    if (!container) return;

    const users = MOCK[listType] || [];
    container.removeAttribute('aria-busy');

    if (!users.length) {
      container.innerHTML = `
        <div class="empty" style="padding:var(--sp-6) var(--sp-2);">
          ${icon('users', 'icon empty__icon')}
          <h2 class="empty__title">${listType === 'followers' ? 'Aucun abonné' : 'Aucun abonnement'}</h2>
          <p class="empty__text">${listType === 'followers'
            ? 'Publiez et gagnez des parties : les alliés viendront.'
            : 'Suivez des joueurs depuis le classement pour les retrouver ici.'}</p>
        </div>`;
      return;
    }

    container.innerHTML = `
      <ul class="list" style="list-style:none;">
        ${users.map(u => {
          const name = BerthoUI.escape(u.username);
          return `
            <li class="list-row" style="cursor:default;">
              <span class="avatar avatar--sm" aria-hidden="true">${name.charAt(0).toUpperCase()}</span>
              <span class="list-row__body"><span class="list-row__title">${name}</span></span>
              <button class="btn btn--outline btn--sm" data-chat="${u.id}" data-username="${name}" type="button">
                ${icon('message', 'icon icon--sm')} Discuter
              </button>
            </li>`;
        }).join('')}
      </ul>`;

    container.querySelectorAll('[data-chat]').forEach(btn => {
      btn.addEventListener('click', () => {
        const peer = { id: btn.dataset.chat, username: btn.dataset.username };
        close();
        new BerthoChat(peer);
      });
    });
  }
}
