/* REEL 10 — La carte du midi change : quelques gestes
   Gabarit : démonstration (gabarits/reels/demonstration.js) */
window.CONTENU = {
  gabarit: 'demonstration',

  titre: {
    surTitre: 'Chaque midi',
    titre: 'La carte du midi\n*change ?*',
    sousTitre: 'Quelques gestes sur votre téléphone, et c\'est en ligne.',
  },

  etapes: [
    {
      titre: 'Un plat à retirer,\nun prix à revoir.',
      visuel: {
        type: 'editeur', heure: '11:20', recherche: false, plats: ['burrata', 'tartare', 'bavette', 'risotto'],
        actions: [{ a: 'masquer', plat: 'burrata' }, { a: 'prix', plat: 'bavette', valeur: '18' }, { a: 'enregistrer' }],
      },
      tenue: 0.9,
    },
    {
      titre: 'À midi, vos clients\nlisent la carte du jour.',
      visuel: { type: 'carte', heure: '12:05', plats: ['tartare', 'bavette', 'risotto'], prix: { bavette: '18' }, neufs: ['bavette'], actions: [{ a: 'pause', duree: 0.3 }, { a: 'pointer', plat: 'bavette' }] },
      tenue: 1.2,
    },
  ],

  fin: { titre: 'Votre carte change.\n*En quelques gestes.*' },
};
