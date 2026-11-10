/* REEL 04 — Le QR code ne change jamais
   Gabarit : question-réponse (gabarits/reels/question-reponse.js) */
window.CONTENU = {
  gabarit: 'question-reponse',

  question: { perso: 'gerante', texte: 'Si je change ma carte, je dois refaire mon QR code ?' },

  reponse: { mot: 'Non.', titre: 'Votre QR code\nreste le même.' },

  preuves: [
    {
      titre: 'La carte change.\nLe QR code, *jamais.*',
      visuel: { type: 'qr', evenements: ['Prix modifié', 'Plat masqué', 'Carte des vins ajoutée'], tampon: 'Toujours le même' },
      tenue: 1.3,
    },
    {
      titre: 'Il mène à votre carte,\ntelle qu\'elle est aujourd\'hui.',
      visuel: { type: 'carte', plats: ['tartare', 'risotto', 'bavette'], actions: [{ a: 'pause', duree: 0.3 }, { a: 'prix', plat: 'risotto', valeur: '15' }] },
      tenue: 1.3,
    },
  ],

  fin: { titre: 'Un QR code.\n*Une carte toujours à jour.*' },
};
