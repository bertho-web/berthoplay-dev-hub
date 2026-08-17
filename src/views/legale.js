// ============================================================================
// 🎮 BERTHOPLAY — VUE CGU, ANTI-TRICHE & PRIVACITE (100% SOUVERAIN)
// ============================================================================

export class LegaleView {
  constructor(onClose) {
    this.onClose = onClose;
    this.render();
  }
  
  render() {
    this.clean();
    
    const modal = document.createElement('div');
    modal.id = 'legale-modal-overlay';
    modal.innerHTML = `
      <style>
        .leg-overlay { position:fixed; top:0; left:0; width:100vw; height:100dvh; background:rgba(3,3,10,0.97); z-index:999999; display:flex; flex-direction:column; align-items:center; justify-content:flex-start; padding:max(16px, env(safe-area-inset-top)) 15px max(20px, env(safe-area-inset-bottom)); box-sizing:border-box; overflow-y:auto; color:#fff; backdrop-filter:blur(20px); }
        .leg-box { width:100%; max-width:500px; background:#0f172a; border:1px solid #334155; border-radius:24px; padding:22px; margin-top:20px; box-shadow:0 10px 30px rgba(0,0,0,0.8); }
        .leg-header { display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #1e293b; padding-bottom:10px; margin-bottom:15px; }
        .leg-title { font-size:1.1rem; font-weight:900; color:#38bdf8; text-transform:uppercase; }
        .leg-section { margin-bottom:15px; text-align:left; }
        .leg-section h4 { font-size:0.85rem; color:#fbbf24; margin-bottom:6px; text-transform:uppercase; }
        .leg-section p { font-size:0.8rem; color:#cbd5e1; line-height:1.5; margin-bottom:8px; }
        .leg-btn-close { width:100%; padding:14px; background:linear-gradient(135deg, #0284c7, #0369a1); border:none; border-radius:12px; color:#fff; font-weight:900; cursor:pointer; text-transform:uppercase; margin-top:10px; }
      </style>

      <div class="leg-overlay">
        <div class="leg-box">
          <div class="leg-header">
            <h2 class="leg-title">📖 RÈGLEMENTS & CONDITIONS</h2>
            <button id="btn-close-leg-x" style="background:none; border:none; color:#64748b; font-size:1.2rem; cursor:pointer;">✖</button>
          </div>

          <div class="leg-section">
            <h4>1. Conditions Générales d'Utilisation (CGU)</h4>
            <p>BerthoPlay est une console de jeux Web3/PWA haute performance. L'accès aux jeux est gratuit. Les pièces virtuelles (BerthoCoins 🪙) sont obtenues en jouant et servent à débloquer des niveaux ou participer à des compétitions.</p>
          </div>

          <div class="leg-section">
            <h4>2. Charte Anti-Triche & Fair-Play</h4>
            <p>Tout recours à des scripts externes, modification de paquets ou exploitation de bugs pour altérer les scores entraînera la suppression immédiate du compte joueur et la révocation des pièces.</p>
          </div>

          <div class="leg-section">
            <h4>3. Confidentialité & Protection des Données</h4>
            <p>Vos données personnelles (Numéro de téléphone, Pseudonyme, Micro, Caméra) sont chiffrées et protégées sur les serveurs Cloudflare Edge. Les flux d'appels WebRTC s'exécutent de gré à gré (P2P) de manière totalmente privée.</p>
          </div>

          <div class="leg-section">
            <h4>4. Propriété Intellectuelle</h4>
            <p>BerthoPlay Console Web &copy; 2026. Tous les moteurs de jeu 3D/2D, graphismes et composants logiciels sont la propriété exclusive de BerthoPlay.</p>
          </div>

          <button class="leg-btn-close" id="btn-close-leg">J'ACCEPTE & FERMER</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    const closeAll = () => {
      this.clean();
      if (this.onClose) this.onClose();
    };
    
    document.getElementById('btn-close-leg')?.addEventListener('click', closeAll);
    document.getElementById('btn-close-leg-x')?.addEventListener('click', closeAll);
  }
  
  clean() {
    const el = document.getElementById('legale-modal-overlay');
    if (el && el.parentNode) el.parentNode.removeChild(el);
  }
}