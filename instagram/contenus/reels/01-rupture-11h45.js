/* REEL 01 — Une rupture à 11 h 45, réglée en un geste
   Gabarit : problème → solution (gabarits/reels/probleme-solution.js)
   Même histoire que le film du site : plus de burrata avant le service. */
window.CONTENU = {
  gabarit: 'probleme-solution',

  accroche: {
    surTitre: '11 h 45 au Petit Bistrot',
    titre: 'Plus de\n*burrata.*',
    sousTitre: 'Le service commence dans un quart d\'heure.',
    visuel: { type: 'perso', perso: 'chef', bulle: 'Plus de burrata !' },
  },

  probleme: {
    titre: 'Elle est encore\nsur votre carte.',
    visuel: { type: 'carte', heure: '11:46', plats: ['burrata', 'tartare', 'risotto', 'bavette'], actions: [{ a: 'pointer', plat: 'burrata' }] },
    tenue: 1.1,
  },

  solution: {
    titre: 'Un geste,\ndepuis votre téléphone.',
    visuel: {
      type: 'editeur', heure: '11:47', plats: ['burrata', 'tartare', 'risotto', 'bavette'],
      actions: [{ a: 'chercher', texte: 'burr' }, { a: 'masquer', plat: 'burrata' }, { a: 'enregistrer' }],
    },
    tampon: 'Trouvée, masquée !', tamponY: 700,
  },

  resultat: {
    titre: 'Site et QR code :\n*déjà à jour.*',
    visuel: { type: 'carte', heure: '12:30', plats: ['burrata', 'tartare', 'risotto', 'bavette'], actions: [{ a: 'pause', duree: 0.3 }, { a: 'retirer', plat: 'burrata' }, { a: 'pointer', plat: 'tartare' }] },
    tenue: 1.0,
  },

  plus: [{
    fond: 'creme', surTitre: '12 h 30, en salle', titre: 'Personne\nn\'a rien vu.', tailleTitre: 'grand',
    visuel: { type: 'perso', perso: 'cliente', cote: 'droite', bulle: 'Alors… un tartare !' }, tenue: 1.2,
  }],

  fin: { titre: 'Une modification.\n*Partout à jour.*' },
};
