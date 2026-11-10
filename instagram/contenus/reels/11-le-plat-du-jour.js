/* REEL 11 — Le plat du jour, chaque matin
   Gabarit : problème → solution (gabarits/reels/probleme-solution.js) */
window.CONTENU = {
  gabarit: 'probleme-solution',

  accroche: {
    surTitre: 'Chaque matin',
    titre: 'Le plat du jour\n*a changé.*',
    visuel: { type: 'perso', perso: 'gerante', decor: 'comptoir', ardoise: ['Plat du jour', 'Blanquette'], bulle: 'Aujourd\'hui : blanquette !', expression: 'content' },
    tenue: 1.3,
  },

  solution: {
    surTitre: 'Sur votre téléphone',
    titre: 'Vous l\'écrivez\nune seule fois.',
    visuel: {
      type: 'editeur', heure: '09:40', recherche: false, plats: ['jour', 'tartare', 'risotto'],
      actions: [{ a: 'desc', plat: 'jour', valeur: 'Blanquette de veau' }, { a: 'enregistrer' }],
    },
    tenue: 1.0,
  },

  resultat: {
    titre: 'Il est sur votre site\net votre QR code.',
    visuel: { type: 'carte', heure: '12:10', plats: ['jour', 'tartare', 'risotto'], descs: { jour: 'Blanquette de veau' }, actions: [{ a: 'pause', duree: 0.3 }, { a: 'pointer', plat: 'jour' }] },
    tenue: 1.3,
  },

  fin: { titre: 'Le plat du jour change.\n*Votre carte aussi.*' },
};
