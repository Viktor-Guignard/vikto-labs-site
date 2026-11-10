/* REEL 15 — Faut-il une application ?
   Gabarit : question-réponse (gabarits/reels/question-reponse.js)
   Fait produit : le client n'installe rien, la carte s'ouvre dans le
   navigateur de son téléphone après le scan du QR code. */
window.CONTENU = {
  gabarit: 'question-reponse',

  question: { perso: 'gerante', texte: 'Mes clients doivent installer une application ?' },

  reponse: { mot: 'Non.', titre: 'La carte s\'ouvre\ndans le navigateur.' },

  preuves: [
    {
      titre: 'Ils scannent,\nla carte s\'affiche.',
      visuel: { type: 'liste', pas: 0.6, items: ['Ils scannent votre QR code', 'La carte s\'ouvre toute seule', 'Rien à installer'] },
      tenue: 1.3,
    },
    {
      titre: 'Lisible tout de suite,\ndans leur langue.',
      visuel: { type: 'carte', plats: ['tartare', 'risotto', 'bavette'], actions: [{ a: 'pause', duree: 0.3 }, { a: 'langue', code: 'en' }] },
      tenue: 1.2,
    },
  ],

  fin: { titre: 'Un scan.\n*La carte est là.*' },
};
