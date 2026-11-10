/* ==========================================================================
   VIKTO LABS — Instagram · le « plan » standard
   Presque toutes les scènes des reels ont la même charpente :
     signature · sur-titre · titre · sous-titre · visuel (· tampon)
   VL.plan(film, d, defauts) construit cette scène à partir d'un objet de
   contenu `d`. Les gabarits de reels ne font qu'enchaîner des plans.

   Champs d'un plan (tous facultatifs sauf `titre`) :
     surTitre    : petite ligne rouge en capitales au-dessus du titre
     titre       : le texte principal ; \n = ligne suivante ; *rouge* ; _italique Garamond_
     sousTitre   : une phrase de précision
     tailleTitre : 'geant' | 'grand' | 'moyen' | 'petit'  (défaut : 'geant' sans visuel, 'moyen' avec)
     visuel      : { type: 'editeur' | 'carte' | 'qr' | 'partout' | 'pdf' | 'liste' | 'perso' | 'codes', … }
     tampon      : texte d'un tampon rouge posé sur le visuel quand il a fini de jouer
     tamponY     : position verticale du tampon dans le visuel, en px (défaut 330)
     tamponVert  : true pour un tampon vert (bonne nouvelle)
     fond        : 'ivoire' | 'creme' | 'charbon' | 'rouge'
     transition  : 'fondu' | 'monte' | 'coupe'
     duree       : durée imposée en secondes (sinon calculée : fin du visuel + `tenue`)
     tenue       : temps de pause après la dernière animation (défaut 1,3 s)
   ========================================================================== */
(function () {
  'use strict';
  const VL = window.VL;

  VL.plan = function (film, d, defauts) {
    d = Object.assign({}, defauts || {}, d);
    return film.scene({ nom: d.nom, fond: d.fond, transition: d.transition }, (s) => {
      if (!d.tailleTitre) d.tailleTitre = d.visuel ? 'moyen' : 'geant';
      const c = VL.cadre(s, d, { hauteurTitre: d.visuel ? (d.tailleTitre === 'grand' ? 330 : 270) : 640, sansVisuel: !d.visuel });
      if (d.visuel && !['editeur', 'carte', 'pdf'].includes(d.visuel.type)) c.visuel.classList.add('centre');
      const t = VL.entreeCadre(s, c, 0.25);
      const v = VL.visuel(c.visuel, s, d.visuel, Math.max(0.5, t - 0.25));
      let fin = Math.max(t, v.fin);
      if (d.tampon) {
        const tp = VL.el('div.tampon' + (d.tamponVert ? '.vert' : ''), { parent: c.visuel, html: VL.riche(d.tampon), 'data-cle': 'large',
          style: { position: 'absolute', left: '50%', top: (d.tamponY == null ? 330 : d.tamponY) + 'px', zIndex: 50 } });
        tp.style.marginLeft = -tp.offsetWidth / 2 + 'px';
        s.surgit(tp, fin, { rotation: -6 });
        fin += 0.6;
      }
      s.duree = d.duree || Math.max(fin + (d.tenue == null ? 1.3 : d.tenue), VL.lecture(d.surTitre, d.titre, d.sousTitre));
      s.controles = [Math.min(fin + 0.4, s.duree - 0.1)];
    });
  };
})();
