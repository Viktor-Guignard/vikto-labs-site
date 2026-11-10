/* ==========================================================================
   GABARIT DE REEL — « le saviez-vous / question-réponse »

   Déroulé :  question (un personnage la pose) → réponse (un mot, en géant,
              sur fond rouge) → preuves (1 à 3 plans) → carton de fin

   window.CONTENU = {
     gabarit: 'question-reponse',
     question: { surTitre, texte, perso, cote },   // perso : 'gerante' (défaut) | 'chef' | 'cliente' | 'habitue'
     reponse:  { mot: 'Non.', titre: 'Votre QR code reste le même.', sousTitre },
     preuves:  [ { surTitre, titre, visuel, tampon }, … ],   // des « plans » (voir moteur/plans.js)
     fin:      { titre, appel, url },                         // facultatif
   };
   ========================================================================== */
VL.gabarits.reels['question-reponse'] = function (c, film) {
  const el = VL.el;

  // 1. La question, dans la bulle d'un personnage
  const q = Object.assign({ surTitre: 'On nous demande souvent', perso: 'gerante' }, c.question);
  film.scene({ nom: 'question', fond: 'charbon' }, (s) => {
    const cadre = VL.cadre(s, { surTitre: q.surTitre });
    s.entre(cadre.surTitre, 0.2, { y: 30, duree: 0.4 });
    cadre.visuel.style.marginTop = '30px';
    const v = VL.visuel(cadre.visuel, s, { type: 'perso', perso: q.perso, cote: q.cote, bulle: q.texte, taille: 400 }, 0.35);
    const bulle = cadre.visuel.querySelector('.bulle');
    bulle.style.fontSize = '64px';
    VL.ajuster(bulle, 560, 44);
    s.duree = q.duree || Math.max(v.fin + 1.2, VL.lecture(q.texte) + 0.6);
  });

  // 2. La réponse : un mot en géant
  const r = c.reponse;
  film.scene({ nom: 'reponse', fond: 'rouge', transition: 'monte' }, (s) => {
    const zone = el('div.zone', { parent: s.el });
    VL.signature(zone);
    const bloc = el('div', { parent: zone, style: { flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingBottom: '120px' } });
    const mot = el('div.titre', { parent: bloc, html: VL.riche(r.mot), 'data-cle': 'mot', style: { fontSize: '300px', lineHeight: '1', letterSpacing: '-.04em', transformOrigin: '20% 70%' } });
    while (mot.scrollWidth > 900) mot.style.fontSize = parseFloat(mot.style.fontSize) - 10 + 'px';
    s.surgit(mot, 0.45, { de: 0.4, duree: 0.55 });
    let t = 1.0;
    if (r.titre) {
      const titre = el('h1.titre.moyen', { parent: bloc, html: String(r.titre).split('\n').map((l) => `<span class="ligne">${VL.riche(l)}</span>`).join(''), 'data-cle': 'titre', style: { marginTop: '40px' } });
      VL.ajuster(titre, 330, 52);
      t = s.lignes(titre, t);
    }
    if (r.sousTitre) { s.entre(el('div.sous-titre', { parent: bloc, html: VL.riche(r.sousTitre), 'data-cle': 'sous-titre' }), t - 0.15, { y: 30 }); t += 0.3; }
    s.duree = r.duree || Math.max(t + 1.3, VL.lecture(r.mot, r.titre, r.sousTitre));
  });

  // 3. Les preuves
  (c.preuves || []).forEach((p, i) => VL.plan(film, p, { nom: 'preuve' + (i + 1), fond: i % 2 ? 'creme' : 'ivoire', transition: i === 0 ? 'monte' : 'fondu' }));

  VL.cartonDeFin(film, c.fin);
};
