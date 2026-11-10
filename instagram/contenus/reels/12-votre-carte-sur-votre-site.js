/* REEL 12 — Votre carte à jour sur votre site aussi
   Gabarit : démonstration (gabarits/reels/demonstration.js)
   La deuxième étape montre la carte dans une fenêtre de navigateur (cadre: 'site'). */
window.CONTENU = {
  gabarit: 'demonstration',

  titre: {
    surTitre: 'Votre site',
    titre: 'Votre carte, à jour\n*sur votre site aussi.*',
    sousTitre: 'Pas seulement derrière le QR code.',
  },

  etapes: [
    {
      titre: 'Vous masquez un plat\ndepuis votre téléphone.',
      visuel: { type: 'editeur', heure: '11:47', recherche: false, plats: ['tartare', 'risotto', 'bavette'], actions: [{ a: 'masquer', plat: 'risotto' }, { a: 'enregistrer' }] },
      tenue: 0.9,
    },
    {
      titre: 'Sur votre site,\n*il a disparu aussi.*',
      visuel: { type: 'carte', cadre: 'site', plats: ['tartare', 'risotto', 'bavette'], actions: [{ a: 'pause', duree: 0.5 }, { a: 'retirer', plat: 'risotto' }] },
      tenue: 1.5,
    },
  ],

  fin: { titre: 'Un seul menu à gérer.\n*Partout à afficher.*' },
};
