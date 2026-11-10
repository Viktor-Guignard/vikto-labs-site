/* REEL 02 — La carte en 4 langues
   Gabarit : démonstration (gabarits/reels/demonstration.js) */
window.CONTENU = {
  gabarit: 'demonstration',

  titre: {
    surTitre: 'Clientèle étrangère',
    titre: 'Votre carte,\nen *4 langues.*',
    sousTitre: 'Français, anglais, espagnol, russe.',
  },

  etapes: [
    {
      titre: 'Votre client choisit\nsa langue.',
      visuel: {
        type: 'carte', plats: ['burrata', 'tartare', 'risotto', 'bavette'],
        actions: [{ a: 'langue', code: 'en' }, { a: 'pause', duree: 0.6 }, { a: 'langue', code: 'es' }, { a: 'pause', duree: 0.6 }, { a: 'langue', code: 'ru' }, { a: 'pause', duree: 0.4 }],
      },
    },
    {
      titre: 'Vous, vous écrivez\nen français.',
      visuel: { type: 'liste', pas: 0.7, items: ['Vous saisissez le plat une fois', 'La traduction est automatique', 'Anglais, espagnol et russe'] },
      tenue: 1.6,
    },
  ],

  fin: { titre: 'Une carte.\n*Quatre langues.*' },
};
