export const BERTHO_ECOSYSTEM_DATA = [
  // --- EN LIGNE & EN FINITION ---
  {
    id: 'web',
    name: 'Web',
    tagline: 'Site Officiel & Présence Digitale',
    desc: 'Portail central et vitrine technologique officielle du groupe Bertho.',
    url: 'https://bertho-web.pages.dev',
    status: 'online',
    langs: '5 Langues (Lingala, FR, EN...)',
    features: ['🌗 Sombre/Clair', '⚡ Web'],
    color: 'linear-gradient(135deg, #f59e0b, #d97706)',
    icon: '🌐'
  },
  {
    id: 'docs',
    name: 'Docs',
    tagline: 'Diagnostics & Analyses d\'Entreprises',
    desc: 'E-commerce spécialisé dans les audits, diagnostics et études d\'entreprises.',
    url: 'https://bertho-docs.pages.dev',
    status: 'online',
    langs: '3 Langues (Lingala, FR, EN)',
    features: ['🌗 Sombre/Clair', '📄 Audits PME'],
    color: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    icon: '📄'
  },
  {
    id: 'pay',
    name: 'Pay',
    tagline: 'Passerelle de Paiement Haute Performance',
    desc: 'Solution de paiement sécurisée PWA utilisable même sans connexion internet.',
    url: 'https://berthopay.pages.dev',
    status: 'finishing',
    langs: '🌍 14 Langues (Lingala, FR, EN...)',
    features: ['📱 PWA Hors-Ligne', '🌗 Sombre/Clair'],
    color: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
    icon: '💳'
  },
  {
    id: 'marketplace',
    name: 'Marketplace',
    tagline: 'E-Commerce Global Multi-Vendeurs',
    desc: 'Plateforme commerciale style Amazon réunissant des milliers de marchands.',
    url: 'https://bertho-markeplace.pages.dev',
    status: 'finishing',
    langs: '🌍 14 Langues (Lingala, FR, EN...)',
    features: ['🛍️ Multi-Vendeurs', '🌗 Sombre/Clair'],
    color: 'linear-gradient(135deg, #10b981, #047857)',
    icon: '🛒'
  },
  {
    id: 'play',
    name: 'Play',
    tagline: 'Console Web 3D & Gaming Hub',
    desc: 'Console Web PWA de jeux vidéo 3D haute performance et synchronisation BerthoCoins.',
    url: '#',
    status: 'current',
    langs: '🎮 Jeux 3D & IA',
    features: ['📱 PWA Hors-Ligne', '🪙 BerthoCoins Sync'],
    color: 'linear-gradient(135deg, #00f2fe, #ff0055)',
    icon: '🎮'
  },

  // --- FUTURES INFRASTRUCTURES À VENIR ---
  {
    id: 'id',
    name: 'ID',
    tagline: 'Identité Numérique Unifiée',
    desc: 'Authentification SSO unique permettant de se connecter à tous les services Bertho.',
    url: '#',
    status: 'upcoming',
    langs: '🔐 Connexion Unique',
    features: ['🛡️ SSO Sécurisé', '🆔 Pass Universel'],
    color: 'linear-gradient(135deg, #ec4899, #be185d)',
    icon: '🆔'
  },
  {
    id: 'cloud',
    name: 'Cloud',
    tagline: 'Stockage & Infrastructures Sécurisées',
    desc: 'Espace de stockage cloud haute disponibilité et hébergement de données.',
    url: '#',
    status: 'upcoming',
    langs: '☁️ Stockage Chiffré',
    features: ['⚡ High-Speed', '🛡️ Données Chiffrées'],
    color: 'linear-gradient(135deg, #06b6d4, #0891b2)',
    icon: '☁️'
  },
  {
    id: 'wallet',
    name: 'Wallet',
    tagline: 'Portefeuille d\'Actifs Numériques',
    desc: 'Gestion centralisée de vos devises, BerthoCoins et actifs numériques.',
    url: '#',
    status: 'upcoming',
    langs: '👛 Fiat & Crypto',
    features: ['🪙 BerthoCoins Hub', '🔒 Coffre-Fort'],
    color: 'linear-gradient(135deg, #eab308, #ca8a04)',
    icon: '👛'
  },
  {
    id: 'ia',
    name: 'IA',
    tagline: 'Intelligence Artificielle Générative',
    desc: 'Suite d\'outils IA avancés pour l\'automatisation, le traitement et l\'analyse de données.',
    url: '#',
    status: 'upcoming',
    langs: '🤖 IA & Machine Learning',
    features: ['⚡ Multi-Model', '🧠 Modèles Sur Mesure'],
    color: 'linear-gradient(135deg, #a855f7, #7e22ce)',
    icon: '🤖'
  }
];

export class BerthoEcosystem {
  constructor(onClose) {
    this.onClose = onClose;
    this.modal = null;
    this.isClosing = false;
  }

  open() {
    this.modal = document.createElement('div');
    this.modal.id = 'eco-selector-modal';
    this.modal.innerHTML = `
      <style>
        .eco-overlay {
          position: fixed; top: 0; left: 0; width: 100vw; height: 100dvh;
          background: rgba(3, 3, 10, 0.96); z-index: 5000; display: flex;
          flex-direction: column; align-items: center; justify-content: flex-start;
          backdrop-filter: blur(25px); -webkit-backdrop-filter: blur(25px);
          padding: max(16px, env(safe-area-inset-top)) 15px max(20px, env(safe-area-inset-bottom));
          box-sizing: border-box; overflow-y: auto; color: #fff;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          animation: fadeInBg 0.35s ease-out forwards;
        }

        .eco-overlay.closing {
          animation: fadeOutBg 0.25s ease-in forwards;
        }

        @keyframes fadeInBg {
          from { opacity: 0; backdrop-filter: blur(0px); }
          to { opacity: 1; backdrop-filter: blur(25px); }
        }

        @keyframes fadeOutBg {
          from { opacity: 1; }
          to { opacity: 0; }
        }

        .eco-top-bar-header {
          display: flex; justify-content: space-between; align-items: center;
          width: 100%; max-width: 520px; margin-bottom: 15px;
          animation: slideDownHeader 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes slideDownHeader {
          from { opacity: 0; transform: translateY(-15px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .eco-main-title { font-size: 1.5rem; font-weight: 900; color: #fff; text-align: left; }
        .eco-main-title .bertho { color: #fff; font-weight: 900; }
        .eco-main-title .sub { font-family: "Georgia", serif; font-style: italic; color: #38bdf8; }

        .eco-close-top {
          background: rgba(244, 63, 94, 0.2); border: 1px solid #f43f5e;
          color: #fff; width: 38px; height: 38px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.1rem; font-weight: 900; cursor: pointer;
          box-shadow: 0 4px 12px rgba(244, 63, 94, 0.3); transition: transform 0.15s ease;
        }
        .eco-close-top:active { transform: scale(0.9); }

        .eco-grid { display: flex; flex-direction: column; gap: 12px; width: 100%; max-width: 520px; }
        
        .eco-card {
          background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 14px; padding: 14px 16px; display: flex; justify-content: space-between;
          align-items: center; backdrop-filter: blur(10px); gap: 12px;
          opacity: 0; transform: translateY(20px) scale(0.97);
          animation: slideUpCard 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes slideUpCard {
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .eco-card:nth-child(1) { animation-delay: 0.04s; }
        .eco-card:nth-child(2) { animation-delay: 0.08s; }
        .eco-card:nth-child(3) { animation-delay: 0.12s; }
        .eco-card:nth-child(4) { animation-delay: 0.16s; }
        .eco-card:nth-child(5) { animation-delay: 0.20s; }
        .eco-card:nth-child(6) { animation-delay: 0.24s; }
        .eco-card:nth-child(7) { animation-delay: 0.28s; }
        .eco-card:nth-child(8) { animation-delay: 0.32s; }
        .eco-card:nth-child(9) { animation-delay: 0.36s; }

        .eco-card-left { display: flex; align-items: center; gap: 12px; flex: 1; }
        .eco-icon { font-size: 1.8rem; }

        .eco-card-info h3 { font-size: 1.05rem; font-weight: 900; margin-bottom: 2px; }
        .eco-card-info h3 .b-white { color: #ffffff; font-weight: 900; }
        .eco-card-info h3 .b-sub { font-family: "Georgia", serif; font-style: italic; font-weight: 700; }
        .eco-card-info .tagline { font-size: 0.7rem; color: #38bdf8; font-weight: 700; margin-bottom: 3px; }
        .eco-card-info .desc { font-size: 0.68rem; color: #94a3b8; line-height: 1.3; margin-bottom: 6px; }

        .eco-badges-row { display: flex; gap: 6px; flex-wrap: wrap; }
        .badge-pill { font-size: 0.6rem; font-weight: 800; padding: 2px 6px; border-radius: 8px; background: rgba(255,255,255,0.08); color: #cbd5e1; border: 1px solid rgba(255,255,255,0.15); }
        .badge-pill.lang { color: #fbbf24; border-color: rgba(251, 191, 36, 0.3); background: rgba(251, 191, 36, 0.1); }

        .status-pill { font-size: 0.6rem; font-weight: 800; padding: 2px 7px; border-radius: 10px; text-transform: uppercase; margin-left: 6px; display: inline-block; }
        .status-pill.online { background: rgba(16, 185, 129, 0.2); color: #34d399; border: 1px solid #10b981; }
        .status-pill.finishing { background: rgba(245, 158, 11, 0.2); color: #fbbf24; border: 1px solid #f59e0b; }
        .status-pill.current { background: rgba(56, 189, 248, 0.2); color: #38bdf8; border: 1px solid #38bdf8; }
        .status-pill.upcoming { background: rgba(168, 85, 247, 0.2); color: #c084fc; border: 1px solid #a855f7; }

        .eco-btn {
          padding: 10px 16px; border-radius: 20px; font-size: 0.75rem; font-weight: 800;
          border: none; cursor: pointer; text-transform: uppercase; text-decoration: none;
          color: #fff; display: inline-flex; align-items: center; gap: 4px;
          white-space: nowrap; box-shadow: 0 4px 12px rgba(0,0,0,0.4);
        }

        .eco-close-btn {
          margin-top: 25px; margin-bottom: 20px; padding: 14px 36px;
          background: rgba(244,63,94,0.25); border: 1.5px solid #f43f5e;
          color: #fff; border-radius: 25px; font-weight: 900; font-size: 0.85rem;
          cursor: pointer; text-transform: uppercase; letter-spacing: 1px;
          box-shadow: 0 4px 20px rgba(244,63,94,0.3); transition: transform 0.15s ease;
        }

        .eco-close-btn:active { transform: scale(0.95); background: rgba(244,63,94,0.4); }
      </style>

      <div class="eco-overlay" id="eco-overlay-bg">
        <div class="eco-top-bar-header">
          <div class="eco-main-title"><span class="bertho">Écosystème</span> <span class="sub">Bertho</span></div>
          <button class="eco-close-top eco-close-action">✖</button>
        </div>

        <div class="eco-grid">
          ${BERTHO_ECOSYSTEM_DATA.map(item => `
            <div class="eco-card">
              <div class="eco-card-left">
                <div class="eco-icon">${item.icon}</div>
                <div class="eco-card-info">
                  <h3>
                    <span class="b-white">Bertho</span><span class="b-sub" style="background: ${item.color}; -webkit-background-clip: text; -webkit-text-fill-color: transparent;">${item.name}</span>
                    ${item.status === 'online' ? '<span class="status-pill online">En Ligne 🟢</span>' : ''}
                    ${item.status === 'finishing' ? '<span class="status-pill finishing">En Finition 🛠️</span>' : ''}
                    ${item.status === 'current' ? '<span class="status-pill current">Ici 🎮</span>' : ''}
                    ${item.status === 'upcoming' ? '<span class="status-pill upcoming">À Venir 🚀</span>' : ''}
                  </h3>
                  <div class="tagline">${item.tagline}</div>
                  <div class="desc">${item.desc}</div>
                  
                  <div class="eco-badges-row">
                    <span class="badge-pill lang">${item.langs}</span>
                    ${item.features.map(f => `<span class="badge-pill">${f}</span>`).join('')}
                  </div>
                </div>
              </div>
              <div>
                ${item.status === 'current' 
                  ? `<span style="font-size: 0.7rem; color: #38bdf8; font-weight: 800; padding: 8px 12px; border-radius: 12px; background: rgba(56,189,248,0.1); border: 1px solid #38bdf8;">ACTIF</span>`
                  : (item.status === 'upcoming'
                      ? `<span style="font-size: 0.7rem; color: #c084fc; font-weight: 800; padding: 8px 12px; border-radius: 12px; background: rgba(168,85,247,0.1); border: 1px solid #a855f7;">BIENTÔT</span>`
                      : `<a href="${item.url}" target="_blank" rel="noopener noreferrer" class="eco-btn" style="background: ${item.color};">VISITER 🔗</a>`
                    )
                }
              </div>
            </div>
          `).join('')}
        </div>

        <button class="eco-close-btn eco-close-action">FERMER ✖</button>
      </div>
    `;

    document.body.appendChild(this.modal);

    // DÉLÉGATION D'ÉVÉNEMENTS INFAILLIBLE : FERME AU CLIC SUR HAUT, BAS OU ARRIÈRE-PLAN
    const handleCloseTrigger = (e) => {
      if (e.target.closest('.eco-close-action') || e.target.id === 'eco-overlay-bg') {
        if (e.cancelable) e.preventDefault();
        this.close();
      }
    };

    this.modal.addEventListener('touchstart', handleCloseTrigger, { passive: false });
    this.modal.addEventListener('click', handleCloseTrigger);
  }

  close() {
    if (this.isClosing) return;
    this.isClosing = true;

    const overlayBg = document.getElementById('eco-overlay-bg');
    if (overlayBg) {
      overlayBg.classList.add('closing');
    }

    setTimeout(() => {
      if (this.modal && this.modal.parentNode) {
        this.modal.parentNode.removeChild(this.modal);
      }
      if (typeof this.onClose === 'function') {
        this.onClose();
      }
    }, 240);
  }
}