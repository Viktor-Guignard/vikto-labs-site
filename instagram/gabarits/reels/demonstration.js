/* ==========================================================================
   GABARIT DE REEL — « démonstration d'une fonctionnalité »

   Déroulé :  titre (fond charbon) → étape 1 → étape 2 → … → carton de fin
   Chaque étape est un « plan » (voir moteur/plans.js) : une phrase courte en
   haut, le produit qui joue en dessous.

   window.CONTENU = {
     gabarit: 'demonstration',
     titre:  { surTitre, titre, sousTitre },     // sur-titre « Démonstration » par défaut
     numeroter: true,                            // sur-titres automatiques « 1 / 3 », « 2 / 3 »… (défaut : false)
     etapes: [ { titre, visuel, tampon }, … ],   // 2 à 4 étapes
     fin:    { titre, appel, url },              // facultatif
   };
   ========================================================================== */
VL.gabarits.reels['demonstration'] = function (c, film) {
  if (c.titre) VL.plan(film, c.titre, { nom: 'titre', surTitre: 'Démonstration', fond: 'charbon', tenue: 0.7, lecture: 0.85 });
  const n = (c.etapes || []).length;
  (c.etapes || []).forEach((e, i) => {
    const defauts = { nom: 'etape' + (i + 1), fond: i % 2 ? 'creme' : 'ivoire', transition: i === 0 ? 'monte' : 'fondu' };
    if (c.numeroter) defauts.surTitre = (i + 1) + ' / ' + n;
    VL.plan(film, e, defauts);
  });
  VL.cartonDeFin(film, c.fin);
};
