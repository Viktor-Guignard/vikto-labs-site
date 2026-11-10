/* REEL 14 — Pendant le service : masquer un plat, puis le réafficher
   Gabarit : problème → solution (gabarits/reels/probleme-solution.js) */
window.CONTENU = {
  gabarit: 'probleme-solution',

  accroche: {
    surTitre: '13 h 10, en plein service',
    titre: 'Plus de\n*tarte au citron.*',
    visuel: { type: 'perso', perso: 'chef', expression: 'surpris', bulle: 'La dernière vient de partir !' },
    tenue: 1.9,
  },

  solution: {
    surTitre: 'Pendant le service',
    titre: 'Vous la masquez\nen un geste.',
    visuel: { type: 'editeur', heure: '13:11', recherche: false, plats: ['tarte', 'cafe'], actions: [{ a: 'masquer', plat: 'tarte' }, { a: 'enregistrer' }] },
    tenue: 1.0,
  },

  resultat: {
    surTitre: 'Avant le service suivant',
    titre: 'Elle revient ?\n*Vous la réaffichez.*',
    visuel: { type: 'editeur', heure: '18:30', recherche: false, plats: ['tarte', 'cafe'], masques: ['tarte'], actions: [{ a: 'afficher', plat: 'tarte' }, { a: 'enregistrer' }] },
    tenue: 1.1,
  },

  fin: { titre: 'Votre carte dit toujours\n*ce que vous servez.*' },
};
