/* ==========================================================================
   GABARIT DE POST — « question fréquente »
   Un personnage pose la question dans une bulle ; la réponse tient en un mot
   géant (Oui. / Non.) suivi d'une ou deux phrases.

   window.CONTENU = {
     gabarit: 'question',
     surTitre: 'Question fréquente',      // valeur par défaut
     perso: 'gerante',                    // 'chef' | 'cliente' | 'gerante' | 'habitue'
     question: 'Puis-je modifier ma carte moi-même ?',
     mot: 'Oui.',
     reponse: 'Une ou deux phrases, pas plus.',
     fond: 'creme',                       // 'creme' (défaut) | 'ivoire'
   };
   ========================================================================== */
VL.gabarits.posts['question'] = function (c, film) {
  const el = VL.el;
  film.scene({ nom: 'post', fond: c.fond || 'creme' }, (s) => {
    const cadre = VL.cadre(s, { surTitre: c.surTitre || 'Question fréquente' });
    cadre.visuel.remove();
    const q = el('div.qf-question', { parent: cadre.zone });
    const bulle = el('div.bulle', { parent: q, html: VL.riche(c.question), 'data-cle': 'question' });
    VL.ajuster(bulle, 300, 44);
    const r = el('div.qf-reponse', { parent: cadre.zone });
    const rang = el('div.qf-rang', { parent: r });
    VL.medaillon(rang, c.perso || 'gerante');
    el('div.qf-mot', { parent: rang, html: VL.riche(c.mot), 'data-cle': 'mot' });
    const texte = el('div.qf-texte', { parent: r, html: VL.riche(c.reponse), 'data-cle': 'reponse' });
    VL.ajuster(texte, 330, 36);
    s.duree = 1;
  });
};
