/* ==========================================================================
   GABARIT DE POST — « citation / principe »
   Une phrase de principe, en EB Garamond italique, très grande.
   Ce n'est PAS un témoignage : ne jamais attribuer la phrase à un client.

   window.CONTENU = {
     gabarit: 'principe',
     texte: 'Une modification.\n*Partout à jour.*',    // \n = ligne suivante, *rouge*
     source: 'Le principe de VIKTO LABS : …',          // une phrase d'explication
     fond: 'ivoire',                                   // 'ivoire' (défaut) | 'creme' | 'charbon' | 'rouge'
   };
   ========================================================================== */
VL.gabarits.posts['principe'] = function (c, film) {
  const el = VL.el;
  film.scene({ nom: 'post', fond: c.fond || 'ivoire' }, (s) => {
    const zone = el('div.zone', { parent: s.el });
    VL.signature(zone);
    const pr = el('div.pr', { parent: zone });
    el('div.pr-guillemet', { parent: pr, texte: '“' });
    const texte = el('p.pr-texte', { parent: pr, html: String(c.texte).split('\n').map((l) => `<span class="ligne">${VL.riche(l)}</span>`).join(''), 'data-cle': 'texte' });
    VL.ajuster(texte, 560, 64);
    if (c.source) el('div.pr-source', { parent: pr, html: VL.riche(c.source), 'data-cle': 'source' });
    s.duree = 1;
  });
};
