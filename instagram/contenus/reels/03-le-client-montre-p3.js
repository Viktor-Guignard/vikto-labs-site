/* REEL 03 — Le client montre « P3 »
   Gabarit : problème → solution (gabarits/reels/probleme-solution.js)
   Les codes (lettre + numéro) s'affichent sur la carte traduite : le client
   montre le code, le serveur sait de quel plat il s'agit. */
window.CONTENU = {
  gabarit: 'probleme-solution',

  accroche: {
    surTitre: '12 h 30, une table de touristes',
    titre: 'Il vous montre\nun plat. *Lequel ?*',
    visuel: { type: 'perso', perso: 'habitue', bulle: 'Вот это, пожалуйста!', expression: 'content' },
    tenue: 1.8,
  },

  solution: {
    titre: 'Sur la carte traduite,\nchaque plat a un code.',
    visuel: { type: 'carte', langue: 'ru', plats: ['burrata', 'tartare', 'risotto', 'bavette'], actions: [{ a: 'pause', duree: 0.5 }, { a: 'pointer', plat: 'risotto' }] },
    tenue: 1.4,
  },

  resultat: {
    titre: 'Il montre *P3.*\nVous savez quoi servir.',
    visuel: { type: 'codes', plat: 'risotto', langue: 'ru' },
    tenue: 1.2,
  },

  fin: { titre: 'Il lit dans sa langue.\n*Vous servez sans hésiter.*' },
};
