# BerthoPlay — Dev Hub

Console web PWA : jeux 3D et 2D, réseau social de gamers, messagerie,
causeries vocales, appels WebRTC et clans.

## Démarrer

```bash
npm install
npm run dev        # serveur de développement
npm run build      # build de production dans dist/
npm run preview    # sert le build de production
```

## Interface

Le système de design est documenté dans **[DESIGN.md](DESIGN.md)** : palette,
typographie, composants, ambiance vidéo, retour sonore et responsive.

Règle courte : **aucune vue ne définit ses propres couleurs**, tout vient de
`src/styles/tokens.css`.

## Structure

```
index.html               coque applicative
src/
├── main.js              routage des onglets, hub, lancement des jeux
├── styles/              design system (voir DESIGN.md)
├── components/icons.js  56 icônes SVG, trait constant
├── services/
│   ├── ambience.js      fond vidéo et ses états
│   ├── sound-effects.js moteur audio Web Audio, câblage global
│   ├── api.js           accès réseau
│   └── …
├── views/               onglets (accueil, actus, top, compte, réglages)
├── games/               7 moteurs de jeu
└── sw.js                service worker (Workbox, injectManifest)
```
