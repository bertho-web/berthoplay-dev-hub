// ============================================================================
// BERTHOPLAY — COMPOSANT PUBLICATION (SRC/COMPONENTS/POST-WIDGET.JS) [SANDBOX]
// ============================================================================

import { BerthoUI } from '../ui-dialogs.js';
import { BerthoSoundEffects } from '../services/sound-effects.js';

// Mode Sandbox : Likes, partages et commentaires gérés localement
const IS_SANDBOX = true;

function formatSmartTime(dateInput) {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '';
  
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();
  
  const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  if (isToday) return timeStr;
  if (isYesterday) return 'Hier';
  return d.toLocaleDateString([], { day: '2-digit', month: '2-digit', year: '2-digit' });
}

export class BerthoPostWidget {
  static renderPostHTML(post, currentUser) {
    const isMine = currentUser && post.user_id === currentUser.id;
    const timeStr = formatSmartTime(post.created_at);
    const likesCount = post.likes_count || 0;
    const commentsCount = post.comments_count || 0;
    const isLiked = post.is_liked_by_me === 1;
    
    return `
      <div class="bp-post-card" id="post-card-${post.id}">
        <div class="bp-post-header">
          <div class="bp-post-author">
            <div class="bp-post-avatar">${(post.username || 'J')[0].toUpperCase()}</div>
            <div>
              <div class="bp-author-name">${post.username || 'Joueur BerthoPlay'}</div>
              <div class="bp-post-time">${timeStr}</div>
            </div>
          </div>

          <button class="bp-post-menu-btn" data-post-id="${post.id}" title="Options">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>
          </button>

          <div class="post-options-dropdown" id="post-menu-${post.id}">
            <button class="post-opt-item btn-share-url" data-post-id="${post.id}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
              Partager l'URL
            </button>
            ${isMine ? `
              <button class="post-opt-item post-opt-danger btn-delete-post" data-post-id="${post.id}">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                Supprimer
              </button>
            ` : ''}
          </div>
        </div>

        <div class="bp-post-body">${this.escapeHtml(post.message)}</div>

        ${post.media_url ? `<img src="${post.media_url}" class="bp-post-media" />` : ''}

        <div class="bp-post-footer-actions">
          <button class="bp-act-btn btn-like-post ${isLiked ? 'liked' : ''}" data-post-id="${post.id}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="${isLiked ? 'var(--danger)' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            <span class="like-count-${post.id}">${likesCount}</span>
          </button>

          <button class="bp-act-btn btn-toggle-comments" data-post-id="${post.id}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            <span>${commentsCount} Commentaires</span>
          </button>

          <button class="bp-act-btn btn-share-url" data-post-id="${post.id}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
            Partager
          </button>
        </div>

        <div class="comments-section" id="comments-box-${post.id}">
          <div id="comments-list-${post.id}">
            <p style="font-size:0.75rem; color:var(--ink-4);">Chargement des commentaires...</p>
          </div>
          <div style="display:flex; gap:6px; margin-top:8px;">
            <input type="text" id="input-comm-${post.id}" class="chat-input" placeholder="Ajouter un commentaire..." style="padding:8px 10px; font-size:0.78rem; background:var(--void); border:1px solid var(--line-strong); border-radius:10px; color:#fff; flex:1; outline:none;" />
            <button class="chat-send-btn btn-add-comment" data-post-id="${post.id}" style="padding:8px 14px; background:var(--blood); border:none; border-radius:10px; color:#fff; font-weight:bold; cursor:pointer;">Poster</button>
          </div>
        </div>
      </div>
    `;
  }
  
  static bindPostEvents(post, currentUser, onReload) {
    const pId = post.id;
    const menuBtn = document.querySelector(`#post-card-${pId} .bp-post-menu-btn`);
    const menuBox = document.getElementById(`post-menu-${pId}`);
    
    if (menuBtn && menuBox) {
      menuBtn.onclick = (e) => {
        e.stopPropagation();
        document.querySelectorAll('.post-options-dropdown').forEach(m => {
          if (m !== menuBox) m.style.display = 'none';
        });
        menuBox.style.display = (menuBox.style.display === 'flex') ? 'none' : 'flex';
      };
    }
    
    document.addEventListener('click', () => {
      if (menuBox) menuBox.style.display = 'none';
    });
    
    document.querySelectorAll(`#post-card-${pId} .btn-share-url`).forEach(btn => {
      btn.onclick = () => {
        const shareUrl = `${window.location.origin}/?post=${pId}`;
        if (navigator.share) {
          navigator.share({ title: 'BerthoPlay Publication', url: shareUrl });
        } else {
          navigator.clipboard.writeText(shareUrl);
          BerthoUI.toast("LIEN COPIÉ", "L'URL a été copiée !");
        }
      };
    });
    
    const delBtn = document.querySelector(`#post-card-${pId} .btn-delete-post`);
    if (delBtn) {
      delBtn.onclick = () => {
        BerthoUI.confirm("SUPPRIMER LA PUBLICATION", "Voulez-vous vraiment effacer ce post ?", () => {
          const localPosts = JSON.parse(localStorage.getItem('BERTHOPLAY_LOCAL_POSTS') || '[]');
          const filtered = localPosts.filter(p => p.id !== pId);
          localStorage.setItem('BERTHOPLAY_LOCAL_POSTS', JSON.stringify(filtered));
          if (onReload) onReload();
        });
      };
    }
    
    const likeBtn = document.querySelector(`#post-card-${pId} .btn-like-post`);
    if (likeBtn) {
      likeBtn.onclick = () => {
        if (!currentUser) return;
        BerthoSoundEffects.playButtonClick();
        const isLiked = likeBtn.classList.toggle('liked');
        const countSpan = document.querySelector(`.like-count-${pId}`);
        if (countSpan) {
          let c = parseInt(countSpan.innerText) || 0;
          countSpan.innerText = isLiked ? c + 1 : Math.max(0, c - 1);
        }
      };
    }
    
    const commBtn = document.querySelector(`#post-card-${pId} .btn-toggle-comments`);
    const commBox = document.getElementById(`comments-box-${pId}`);
    if (commBtn && commBox) {
      commBtn.onclick = () => {
        const isHidden = commBox.style.display === 'none' || commBox.style.display === '';
        commBox.style.display = isHidden ? 'flex' : 'none';
        if (isHidden) BerthoPostWidget.loadComments(pId, currentUser);
      };
    }
    
    const addCommBtn = document.querySelector(`#post-card-${pId} .btn-add-comment`);
    const inputComm = document.getElementById(`input-comm-${pId}`);
    if (addCommBtn && inputComm) {
      addCommBtn.onclick = () => {
        const text = inputComm.value.trim();
        if (!text || !currentUser) return;
        
        const key = `BERTHOPLAY_POST_COMMENTS_${pId}`;
        const comments = JSON.parse(localStorage.getItem(key) || '[]');
        comments.unshift({
          id: 'c_' + Date.now(),
          username: currentUser.username,
          content: text,
          created_at: new Date().toISOString(),
          likes_count: 0
        });
        localStorage.setItem(key, JSON.stringify(comments));
        
        inputComm.value = '';
        BerthoPostWidget.loadComments(pId, currentUser);
      };
    }
  }
  
  static loadComments(postId, currentUser) {
    const listContainer = document.getElementById(`comments-list-${postId}`);
    if (!listContainer) return;
    
    const key = `BERTHOPLAY_POST_COMMENTS_${postId}`;
    const comments = JSON.parse(localStorage.getItem(key) || '[]');
    
    if (comments.length > 0) {
      listContainer.innerHTML = comments.map(c => `
        <div class="comment-item">
          <div class="comment-header">
            <span class="comment-author">${c.username}</span>
            <span class="comment-time">${formatSmartTime(c.created_at)}</span>
          </div>
          <div class="comment-text">${this.escapeHtml(c.content)}</div>
        </div>
      `).join('');
    } else {
      listContainer.innerHTML = `<p style="font-size:0.75rem; color:var(--ink-4);">Aucun commentaire pour l'instant.</p>`;
    }
  }
  
  static escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
}