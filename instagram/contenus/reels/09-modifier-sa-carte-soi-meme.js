/* REEL 09 — Puis-je modifier ma carte moi-même ?
   Gabarit : question-réponse (gabarits/reels/question-reponse.js) */
window.CONTENU = {
  gabarit: 'question-reponse',

  question: { perso: 'habitue', surTitre: 'Question de restaurateur', texte: 'Je peux modifier ma carte moi-même ?' },

  reponse: { mot: 'Oui.', titre: 'Depuis votre téléphone,\nmême en plein service.' },

  preuves: [
    {
      titre: 'Un prix, un plat épuisé :\nvous avez la main.',
      visuel: {
        type: 'editeur', recherche: false, plats: ['tartare', 'risotto', 'bavette', 'tarte'],
        actions: [{ a: 'prix', plat: 'tartare', valeur: '15' }, { a: 'masquer', plat: 'risotto' }, { a: 'enregistrer' }],
      },
      tenue: 1.2,
    },
  ],

  fin: { titre: 'Votre carte.\n*Vos modifications.*' },
};
