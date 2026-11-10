/* REEL 05 — Changer un prix en quelques secondes
   Gabarit : démonstration (gabarits/reels/demonstration.js) */
window.CONTENU = {
  gabarit: 'demonstration',

  titre: {
    surTitre: 'Votre carte, vos prix',
    titre: 'Changer un prix,\nen *quelques secondes.*',
    sousTitre: 'Vous le faites vous-même, depuis votre téléphone.',
  },

  etapes: [
    {
      titre: 'Touchez le prix,\ntapez, enregistrez.',
      visuel: {
        type: 'editeur', recherche: false, plats: ['tartare', 'risotto', 'bavette', 'tarte'],
        actions: [{ a: 'prix', plat: 'risotto', valeur: '15' }, { a: 'enregistrer' }],
      },
      tenue: 1.1,
    },
    {
      titre: 'Vos clients voient\ndéjà le nouveau prix.',
      visuel: { type: 'carte', plats: ['tartare', 'risotto', 'bavette'], prix: { risotto: '15' }, neufs: ['risotto'], actions: [{ a: 'pointer', plat: 'risotto' }] },
      tenue: 1.3,
    },
  ],

  fin: { titre: 'Vos prix changent.\n*Votre carte suit.*' },
};
