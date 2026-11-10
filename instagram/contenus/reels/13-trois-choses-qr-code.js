/* REEL 13 — 3 choses que votre QR code devrait faire
   Gabarit : démonstration, étapes numérotées (gabarits/reels/demonstration.js) */
window.CONTENU = {
  gabarit: 'demonstration',

  titre: {
    surTitre: 'À vérifier chez vous',
    titre: '3 choses que\nvotre QR code\n*devrait faire.*',
  },

  numeroter: true,
  etapes: [
    {
      titre: 'Rester le même\nquand la carte change.',
      visuel: { type: 'qr', taille: 360, pas: 0.7, evenements: ['Prix modifié', 'Plat masqué'], tampon: 'Toujours le même' },
      tenue: 1.0,
    },
    {
      titre: 'Ouvrir une carte lisible,\nsans zoomer.',
      visuel: { type: 'carte', plats: ['tartare', 'risotto', 'bavette'], actions: [{ a: 'pause', duree: 0.3 }, { a: 'pointer', plat: 'tartare' }] },
      tenue: 1.0,
    },
    {
      titre: 'Parler la langue\nde votre client.',
      visuel: { type: 'carte', plats: ['tartare', 'risotto', 'bavette'], actions: [{ a: 'langue', code: 'en' }, { a: 'pause', duree: 0.5 }, { a: 'langue', code: 'es' }] },
      tenue: 1.1,
    },
  ],

  fin: { titre: 'Votre QR code\n*peut faire tout ça.*' },
};
