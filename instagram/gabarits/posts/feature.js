/* ==========================================================================
   GABARIT DE POST — « fonctionnalité »
   Un titre, une phrase, et le produit en dessous (n'importe quel visuel).

   window.CONTENU = {
     gabarit: 'feature',
     fond: 'ivoire',                      // 'ivoire' | 'creme' | 'charbon'
     surTitre, titre, sousTitre,          // titre : \n = ligne suivante, *rouge*, _italique_
     tailleTitre: 'moyen',                // 'geant' | 'grand' | 'moyen' (défaut) | 'petit'
     visuel: { type: 'editeur' | 'carte' | 'qr' | 'partout' | 'codes' | 'liste' | 'perso' | 'pdf', … },
     figer: 4.2,                          // facultatif : instant (s) où l'on fige le visuel ;
   };                                     // par défaut l'état final, toutes actions jouées
   Les visuels sont les mêmes que ceux des reels (moteur/visuels.js) : leurs
   `actions` sont jouées, puis l'image est prise à la fin.
   ========================================================================== */
VL.gabarits.posts['feature'] = function (c, film) {
  film.scene({ nom: 'post', fond: c.fond || 'ivoire' }, (s) => {
    const d = Object.assign({ tailleTitre: 'moyen' }, c);
    const cadre = VL.cadre(s, d, { hauteurTitre: 270 });
    if (c.visuel && !['editeur', 'carte', 'pdf'].includes(c.visuel.type)) cadre.visuel.classList.add('centre');
    VL.visuel(cadre.visuel, s, c.visuel, 0);
    s.duree = 1;
  });
};
