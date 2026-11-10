/* REEL 07 — Une modification, partout à jour
   Gabarit : démonstration (gabarits/reels/demonstration.js) */
window.CONTENU = {
  gabarit: 'demonstration',

  titre: {
    surTitre: 'Le principe',
    titre: 'Un seul menu\nà gérer.',
    sousTitre: 'Votre site et votre QR code affichent la même carte.',
  },

  numeroter: true,
  etapes: [
    {
      titre: 'Vous modifiez\nune fois.',
      visuel: { type: 'editeur', recherche: false, plats: ['tartare', 'risotto', 'bavette', 'tarte'], actions: [{ a: 'prix', plat: 'bavette', valeur: '21' }, { a: 'enregistrer' }] },
      tenue: 0.9,
    },
    {
      titre: 'Votre site et votre\nQR code suivent.',
      visuel: { type: 'partout', plat: 'bavette', apres: '21' },
      tenue: 1.6,
    },
  ],

  fin: { titre: 'Une modification.\n*Partout à jour.*' },
};
