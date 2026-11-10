/* ==========================================================================
   GABARIT DE REEL — « problème → solution en un geste »

   Déroulé :  accroche → problème → solution → résultat → (plus…) → carton de fin
   Chaque partie est un « plan » (voir moteur/plans.js pour tous les champs).

   window.CONTENU = {
     gabarit: 'probleme-solution',
     accroche: { surTitre, titre, sousTitre, visuel },   // 2 premières secondes : ce qui arrête le pouce
     probleme: { titre, visuel },                         // sur-titre « Le problème » par défaut
     solution: { titre, visuel, tampon },                 // sur-titre « La solution » par défaut
     resultat: { titre, visuel },                         // sur-titre « Le résultat » par défaut
     plus:     [ { … }, … ],                              // plans supplémentaires, facultatifs
     fin:      { titre, appel, url },                     // facultatif : valeurs par défaut de la marque
   };
   Une partie absente est simplement sautée.
   ========================================================================== */
VL.gabarits.reels['probleme-solution'] = function (c, film) {
  if (c.accroche) VL.plan(film, c.accroche, { nom: 'accroche', fond: 'creme', tailleTitre: 'grand', tenue: 1.5 });
  if (c.probleme) VL.plan(film, c.probleme, { nom: 'probleme', surTitre: 'Le problème', fond: 'ivoire' });
  if (c.solution) VL.plan(film, c.solution, { nom: 'solution', surTitre: 'La solution', fond: 'ivoire', transition: 'monte' });
  if (c.resultat) VL.plan(film, c.resultat, { nom: 'resultat', surTitre: 'Le résultat', fond: 'creme' });
  (c.plus || []).forEach((p, i) => VL.plan(film, p, { nom: 'plus' + (i + 1), fond: 'ivoire' }));
  VL.cartonDeFin(film, c.fin);
};
