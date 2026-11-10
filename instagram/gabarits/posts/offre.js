/* ==========================================================================
   GABARIT DE POST — « offre »
   Le nom de la formule, son prix en très grand, ce qu'elle comprend.

   ATTENTION : n'afficher que des prix présents sur le site (index.html,
   section Tarifs) : 54 € HT/mois, mise en place 150 € HT, site vitrine 500 € HT.

   window.CONTENU = {
     gabarit: 'offre',
     surTitre: 'L\'offre',
     nom: 'Site + menu synchronisé',
     prix: '54 €', unite: 'HT / mois',
     note: 'Site vitrine offert.',
     items: ['…', '…'],                   // 4 à 6 lignes courtes
     pied: 'Mise en place de vos cartes : 150 € HT, une seule fois. Engagement 12 mois.',
   };
   ========================================================================== */
VL.gabarits.posts['offre'] = function (c, film) {
  const el = VL.el;
  film.scene({ nom: 'post', fond: c.fond || 'charbon' }, (s) => {
    const cadre = VL.cadre(s, { surTitre: c.surTitre || 'L\'offre' });
    cadre.visuel.remove();
    const z = cadre.zone;
    el('div.of-nom', { parent: z, html: VL.riche(c.nom), 'data-cle': 'nom' });
    el('div.of-prix', { parent: z, html: `<b>${VL.riche(c.prix)}</b><span>${VL.riche(c.unite || '')}</span>`, 'data-cle': 'prix' });
    if (c.note) el('div.of-note', { parent: z, html: VL.riche(c.note), 'data-cle': 'note' });
    const liste = el('div.of-liste', { parent: z });
    for (const it of c.items || []) el('div', { parent: liste, html: VL.coche() + '<span>' + VL.riche(it) + '</span>', 'data-cle': 'item' });
    if (c.pied) el('div.of-pied', { parent: z, html: VL.riche(c.pied), 'data-cle': 'pied' });
    s.duree = 1;
  });
};
