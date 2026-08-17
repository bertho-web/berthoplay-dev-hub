// ============================================================================
// 🎮 BERTHOPLAY — MOTEUR DE MODALES, TOASTS & TRADUCTEUR D'ERREURS (100% PUR)
// ============================================================================

export class BerthoUI {
  
  // 🛡️ TRADUCTEUR D'ERREURS TECHNIQUES VERS LE LANGAGE HUMAIN (FILTRE BDT)
  static error(title, rawError, onClose) {
    let humanMsg = typeof rawError === 'string' ? rawError : (rawError?.message || "Une erreur est survenue.");
    
    if (humanMsg.includes('no such column') || humanMsg.includes('D1_ERROR')) {
      humanMsg = "Mise à jour de la base de données en cours. Veuillez réessayer votre connexion dans un instant.";
    } else if (humanMsg.includes('SQLITE_TOOBIG') || humanMsg.includes('too big')) {
      humanMsg = "Oups ! Le fichier sélectionné est trop volumineux. Veuillez choisir une image ou vidéo plus légère.";
    } else if (humanMsg.includes('Failed to fetch') || humanMsg.includes('NetworkError')) {
      humanMsg = "Oups ! Connexion au serveur interrompue. Vérifiez votre réseau Internet et réessayez.";
    } else if (humanMsg.includes('403') || humanMsg.includes('Accès Refusé')) {
      humanMsg = "Accès restreint : Identifiant ou clef d'administration incorrecte.";
    } else if (humanMsg.includes('401') || humanMsg.includes('incorrect')) {
      humanMsg = "Numéro de téléphone ou mot de passe incorrect. Veuillez vérifier vos saisies.";
    } else if (humanMsg.includes('UNIQUE constraint failed') || humanMsg.includes('déjà utilisé')) {
      humanMsg = "Ce numéro de téléphone ou ce pseudonyme est déjà enregistré par un autre joueur.";
    }
    
    this.alert(title || "NOTIFICATION", humanMsg, onClose);
  }
  
  // 📢 MODALE D'ALERTE HAUT DE GAMME
  static alert(title, message, onClose) {
    this.clean();
    
    const modal = document.createElement('div');
    modal.id = 'bertho-custom-ui-overlay';
    modal.innerHTML = `
      <style>
        .bui-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100dvh; background: rgba(3, 3, 10, 0.96); z-index: 999999; display: flex; align-items: center; justify-content: center; padding: 20px; backdrop-filter: blur(20px); box-sizing: border-box; }
        .bui-box { background: rgba(15, 23, 42, 0.95); border: 1px solid #38bdf8; border-radius: 24px; padding: 25px; width: 92%; max-width: 380px; text-align: center; color: #fff; box-shadow: 0 15px 35px rgba(0,0,0,0.8), 0 0 15px rgba(56,189,248,0.2); }
        .bui-title { font-size: 1.1rem; font-weight: 900; color: #38bdf8; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 10px; }
        .bui-msg { font-size: 0.85rem; color: #cbd5e1; line-height: 1.5; margin-bottom: 20px; }
        .bui-btn { width: 100%; padding: 14px; background: linear-gradient(135deg, #0284c7, #0369a1); border: none; border-radius: 12px; color: #fff; font-weight: 900; cursor: pointer; text-transform: uppercase; letter-spacing: 1px; }
      </style>

      <div class="bui-overlay">
        <div class="bui-box">
          <div class="bui-title">${title}</div>
          <div class="bui-msg">${message}</div>
          <button class="bui-btn" id="bui-btn-ok">CONFIRMER</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('bui-btn-ok')?.addEventListener('click', () => {
      this.clean();
      if (onClose) onClose();
    });
  }
  
  // ❓ MODALE DE CONFIRMATION OUI / ANNULER
  static confirm(title, message, onConfirm, onCancel) {
    this.clean();
    
    const modal = document.createElement('div');
    modal.id = 'bertho-custom-ui-overlay';
    modal.innerHTML = `
      <style>
        .bui-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100dvh; background: rgba(3, 3, 10, 0.96); z-index: 999999; display: flex; align-items: center; justify-content: center; padding: 20px; backdrop-filter: blur(20px); box-sizing: border-box; }
        .bui-box { background: rgba(15, 23, 42, 0.95); border: 1px solid #38bdf8; border-radius: 24px; padding: 25px; width: 92%; max-width: 380px; text-align: center; color: #fff; box-shadow: 0 15px 35px rgba(0,0,0,0.8), 0 0 15px rgba(56,189,248,0.2); }
        .bui-title { font-size: 1.1rem; font-weight: 900; color: #38bdf8; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 10px; }
        .bui-msg { font-size: 0.85rem; color: #cbd5e1; line-height: 1.5; margin-bottom: 20px; }
        .bui-actions { display: flex; gap: 10px; }
        .bui-btn-yes { flex: 1; padding: 14px; background: linear-gradient(135deg, #0284c7, #0369a1); border: none; border-radius: 12px; color: #fff; font-weight: 900; cursor: pointer; text-transform: uppercase; }
        .bui-btn-no { flex: 1; padding: 14px; background: #1e293b; border: 1px solid #334155; border-radius: 12px; color: #94a3b8; font-weight: 900; cursor: pointer; text-transform: uppercase; }
      </style>

      <div class="bui-overlay">
        <div class="bui-box">
          <div class="bui-title">${title}</div>
          <div class="bui-msg">${message}</div>
          <div class="bui-actions">
            <button class="bui-btn-yes" id="bui-btn-yes">OUI</button>
            <button class="bui-btn-no" id="bui-btn-no">ANNULER</button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('bui-btn-yes')?.addEventListener('click', () => {
      this.clean();
      if (onConfirm) onConfirm();
    });
    
    document.getElementById('bui-btn-no')?.addEventListener('click', () => {
      this.clean();
      if (onCancel) onCancel();
    });
  }
  
  // ✍️ MODALE DE SAISIE DE TEXTE (PROMPT)
  static prompt(title, placeholder, onSubmit, onCancel) {
    this.clean();
    
    const modal = document.createElement('div');
    modal.id = 'bertho-custom-ui-overlay';
    modal.innerHTML = `
      <style>
        .bui-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100dvh; background: rgba(3, 3, 10, 0.96); z-index: 999999; display: flex; align-items: center; justify-content: center; padding: 20px; backdrop-filter: blur(20px); box-sizing: border-box; }
        .bui-box { background: rgba(15, 23, 42, 0.95); border: 1px solid #38bdf8; border-radius: 24px; padding: 25px; width: 92%; max-width: 380px; text-align: center; color: #fff; box-shadow: 0 15px 35px rgba(0,0,0,0.8), 0 0 15px rgba(56,189,248,0.2); }
        .bui-title { font-size: 1.1rem; font-weight: 900; color: #38bdf8; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 15px; }
        .bui-input { width: 100%; padding: 12px; background: #0f172a; border: 1px solid #334155; border-radius: 12px; color: #fff; font-size: 0.9rem; outline: none; margin-bottom: 15px; box-sizing: border-box; }
        .bui-actions { display: flex; gap: 10px; }
        .bui-btn-yes { flex: 1; padding: 14px; background: linear-gradient(135deg, #0284c7, #0369a1); border: none; border-radius: 12px; color: #fff; font-weight: 900; cursor: pointer; text-transform: uppercase; }
        .bui-btn-no { flex: 1; padding: 14px; background: #1e293b; border: 1px solid #334155; border-radius: 12px; color: #94a3b8; font-weight: 900; cursor: pointer; text-transform: uppercase; }
      </style>

      <div class="bui-overlay">
        <div class="bui-box">
          <div class="bui-title">${title}</div>
          <input type="text" id="bui-prompt-input" class="bui-input" placeholder="${placeholder || ''}" autocomplete="off" />
          <div class="bui-actions">
            <button class="bui-btn-yes" id="bui-btn-yes">VALIDER</button>
            <button class="bui-btn-no" id="bui-btn-no">ANNULER</button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    const input = document.getElementById('bui-prompt-input');
    if (input) input.focus();
    
    const submit = () => {
      const val = input?.value?.trim();
      this.clean();
      if (onSubmit) onSubmit(val);
    };
    
    document.getElementById('bui-btn-yes')?.addEventListener('click', submit);
    input?.addEventListener('keydown', (e) => { if (e.key === 'Enter') submit(); });
    
    document.getElementById('bui-btn-no')?.addEventListener('click', () => {
      this.clean();
      if (onCancel) onCancel();
    });
  }
  
  // 🔔 BANNIÈRE TOAST DISCRÈTE EN HAUT DE L'ÉCRAN
  static toast(title, message, icon = '📢') {
    const existing = document.getElementById('bertho-toast-banner');
    if (existing && existing.parentNode) existing.parentNode.removeChild(existing);
    
    const toast = document.createElement('div');
    toast.id = 'bertho-toast-banner';
    toast.style.cssText = 'position:fixed; top:20px; left:50%; transform:translateX(-50%); width:90%; max-width:420px; background:rgba(15,23,42,0.96); border:1px solid #38bdf8; border-radius:18px; padding:12px 16px; color:#fff; z-index:999999; box-shadow:0 10px 30px rgba(56,189,248,0.3); backdrop-filter:blur(15px); display:flex; align-items:center; gap:12px; box-sizing:border-box; animation:slideDown 0.4s ease;';
    
    toast.innerHTML = `
      <div style="font-size:1.4rem;">${icon}</div>
      <div style="flex:1;">
        <strong style="color:#38bdf8; font-size:0.85rem; display:block;">${title}</strong>
        <span style="font-size:0.78rem; color:#cbd5e1;">${message}</span>
      </div>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 3500);
  }
  
  static clean() {
    const el = document.getElementById('bertho-custom-ui-overlay');
    if (el && el.parentNode) el.parentNode.removeChild(el);
  }
}