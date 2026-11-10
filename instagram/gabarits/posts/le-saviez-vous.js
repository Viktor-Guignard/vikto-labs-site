/* ==========================================================================
   GABARIT DE POST — « le saviez-vous ? »
   Fond charbon, une affirmation en très grand, une phrase d'explication,
   et (facultatif) un petit visuel en dessous.

   window.CONTENU = {
     gabarit: 'le-saviez-vous',
     surTitre: 'Le saviez-vous ?',        // valeur par défaut
     titre: 'Votre QR code\n*ne change jamais.*',
     sousTitre: 'Une phrase qui explique.',
     visuel: { type: 'qr', … },           // facultatif ; sans visuel, le texte est centré en hauteur
     fond: 'charbon',                     // 'charbon' (défaut) | 'rouge' | 'ivoire' | 'creme'
   };
   ========================================================================== */
VL.gabarits.posts['le-saviez-vous'] = function (c, film) {
  film.scene({ nom: 'post', fond: c.fond || 'charbon' }, (s) => {
    const d = Object.assign({ surTitre: 'Le saviez-vous ?', tailleTitre: c.visuel ? 'grand' : 'geant' }, c);
    const cadre = VL.cadre(s, d, { hauteurTitre: c.visuel ? 320 : 560, sansVisuel: !c.visuel });
    if (c.visuel) { cadre.visuel.classList.add('centre'); VL.visuel(cadre.visuel, s, c.visuel, 0); }
    s.duree = 1;
  });
};
