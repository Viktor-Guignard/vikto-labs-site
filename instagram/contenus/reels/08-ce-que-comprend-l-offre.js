/* REEL 08 — Ce que comprend l'offre
   Gabarit : question-réponse (gabarits/reels/question-reponse.js)
   ATTENTION : les prix et la liste viennent du site (index.html, section Tarifs).
   Ne rien inventer : si l'offre change sur le site, corriger ici. */
window.CONTENU = {
  gabarit: 'question-reponse',

  question: { perso: 'gerante', cote: 'droite', texte: 'Un site et un menu QR code… ça comprend quoi, exactement ?' },

  reponse: {
    mot: '54 €',
    titre: 'HT par mois.\nSite vitrine offert.',
    sousTitre: 'Mise en place de vos cartes : 150 € HT, une seule fois. Engagement 12 mois.',
    duree: 4.1,
  },

  preuves: [
    {
      surTitre: 'Ce qui est compris',
      titre: 'Site + menu synchronisé',
      visuel: { type: 'liste', pas: 0.5, items: ['Création du site vitrine', 'Toutes vos cartes', 'Modifications illimitées', 'Votre espace de gestion', 'Le QR code', 'Hébergement et mises à jour'] },
      tenue: 1.8,
    },
  ],

  fin: { titre: 'Une offre simple,\n*sans surprise.*', appel: 'Le détail des tarifs est sur le site' },
};
