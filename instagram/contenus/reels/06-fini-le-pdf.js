/* REEL 06 — Fini le PDF illisible sur téléphone
   Gabarit : problème → solution (gabarits/reels/probleme-solution.js) */
window.CONTENU = {
  gabarit: 'probleme-solution',

  accroche: {
    surTitre: 'Vos clients scannent, et…',
    titre: 'Une carte en PDF,\n*sur un téléphone ?*',
    tailleTitre: 'moyen', fond: 'ivoire',
    visuel: { type: 'pdf', tampon: 'Il faut zoomer partout' },
    tenue: 1.2,
  },

  solution: {
    titre: 'Une vraie carte,\n*lisible tout de suite.*',
    visuel: { type: 'carte', plats: ['tartare', 'risotto', 'bavette', 'tarte'], actions: [{ a: 'pause', duree: 0.4 }, { a: 'pointer', plat: 'risotto' }] },
    tenue: 1.2,
  },

  resultat: {
    surTitre: 'En plus',
    titre: 'Et vous la modifiez\nvous-même.',
    visuel: { type: 'editeur', recherche: false, plats: ['tartare', 'risotto', 'bavette', 'tarte'], actions: [{ a: 'prix', plat: 'bavette', valeur: '20' }, { a: 'enregistrer' }] },
    tenue: 1.1,
  },

  fin: { titre: 'Votre carte se lit.\n*Et elle reste à jour.*' },
};
