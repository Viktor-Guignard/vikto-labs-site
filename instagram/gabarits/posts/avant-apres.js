/* ==========================================================================
   GABARIT DE POST — « avant / après »
   Deux blocs empilés : la situation de départ (pointillés, gris), puis la
   situation avec une carte synchronisée (blanc, coches vertes).

   window.CONTENU = {
     gabarit: 'avant-apres',
     surTitre, titre,
     avant: { titre: 'Avant',  items: ['…', '…', '…'] },     // 2 à 3 lignes courtes
     apres: { titre: 'Après', items: ['…', '…', '…'] },
   };
   ========================================================================== */
VL.gabarits.posts['avant-apres'] = function (c, film) {
  const el = VL.el;
  film.scene({ nom: 'post', fond: c.fond || 'ivoire' }, (s) => {
    const cadre = VL.cadre(s, Object.assign({ tailleTitre: 'moyen' }, c), { hauteurTitre: 180 });
    cadre.visuel.remove();
    const aa = el('div.aa', { parent: cadre.zone });
    for (const [cle, variante, icone] of [['avant', 'gris', 'croix'], ['apres', 'vert', 'coche']]) {
      const b = el('div.aa-bloc.' + cle, { parent: aa });
      el('div.aa-titre', { parent: b, html: VL.riche(c[cle].titre) });
      for (const it of c[cle].items) el('div.aa-item', { parent: b, html: VL.coche(variante, icone) + '<span>' + VL.riche(it) + '</span>', 'data-cle': 'item' });
    }
    s.duree = 1;
  });
};
