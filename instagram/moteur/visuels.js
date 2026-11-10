/* ==========================================================================
   VIKTO LABS — Instagram · les visuels
   Un « visuel » est la partie image d'une scène : un téléphone qui montre
   l'éditeur, la carte vue par le client, un QR code, un schéma…
   Les fichiers de contenu les décrivent par un objet { type: '…', … }.

   Chaque visuel est une fonction  (parent, s, o, t0) → { el, fin }
     parent : l'élément .visuel de la scène      s  : la Scene (temps locaux)
     o      : l'objet du fichier de contenu      t0 : instant d'entrée
     fin    : instant (local) où le visuel a fini de jouer
   Les recréations d'interface sont stylisées et fidèles au produit, jamais
   des captures : aucune donnée de vrai client.

   Types disponibles (détail des options au-dessus de chaque fonction) :
     editeur · carte · qr · partout · pdf · liste · perso · codes
   ========================================================================== */
(function () {
  'use strict';
  const VL = window.VL;
  const el = VL.el;

  /** Point d'entrée : construit le visuel décrit par `o` (ou rien si o est vide). */
  VL.visuel = function (parent, s, o, t0) {
    if (!o) return { el: null, fin: t0 };
    const f = VL.visuels[o.type];
    if (!f) throw new Error('Visuel inconnu : ' + o.type + ' (' + Object.keys(VL.visuels).join(', ') + ')');
    return f(parent, s, o, t0 == null ? 0.4 : t0);
  };

  /** Retrouve la carte fictive et les plats demandés (dans l'ordre demandé). */
  function lireCarte(o) {
    const carte = VL.cartes[o.carte || 'petit-bistrot'];
    if (!carte) throw new Error('Carte inconnue : ' + o.carte);
    const tous = [];
    carte.rubriques.forEach((r) => r.plats.forEach((p) => tous.push({ plat: p, rubrique: r })));
    const choisis = (o.plats || tous.map((x) => x.plat.id)).map((id) => {
      const x = tous.find((y) => y.plat.id === id);
      if (!x) throw new Error('Plat inconnu : ' + id + ' (' + tous.map((y) => y.plat.id).join(', ') + ')');
      return x;
    });
    return { carte, choisis };
  }
  const entreeTel = (s, tel, t0) => s.anim(tel, t0, 0.65, { y: [460, 0], opacity: [0, 1] }, 'sortie');
  const prixAffiche = (o, plat) => (o.prix && o.prix[plat.id]) || plat.prix;

  /* ----------------------------------------------------------------------
     editeur — l'espace de gestion sur téléphone, et les gestes du gérant
       carte      : 'petit-bistrot'
       plats      : ['burrata', 'tartare', …]   lignes affichées (3 visibles sans recherche)
       recherche  : false pour retirer le champ de recherche (gagne une ligne)
       masques    : ['burrata']                 plats déjà masqués au départ
       prix       : { risotto: '15' }           prix de départ différents de la carte
       actions    : la suite des gestes, joués l'un après l'autre :
         { a: 'chercher', texte: 'burr' }       tape dans la recherche, filtre la liste
         { a: 'masquer', plat: 'burrata' }      touche l'œil : le plat est masqué
         { a: 'afficher', plat: 'burrata' }     touche l'œil : le plat revient
         { a: 'prix', plat: 'risotto', valeur: '15' }
         { a: 'nom', plat: 'burrata', valeur: 'Tartare de saumon' }
         { a: 'enregistrer' }                   « Carte à jour · site et QR code »
         { a: 'pause', duree: 0.6 }
     ---------------------------------------------------------------------- */
  VL.visuels.editeur = function (parent, s, o, t0) {
    const { carte, choisis } = lireCarte(o);
    const tel = VL.telephone(parent, o.heure);
    const E = tel.ecran;
    const tete = el('div.ed-tete', { parent: E, html: `<div><div class="ed-marque">VIKTO LABS</div><div class="ed-resto">${carte.nom} · éditeur</div></div>` });
    const bouton = el('span.ed-bouton', { parent: tete, texte: 'Enregistrer', 'data-cle': 'large' });
    const etat = el('div.ed-etat', { parent: E, html: '● Modifications non enregistrées' });
    let recherche = null, champ = null;
    if (o.recherche !== false) {
      recherche = el('div.ed-recherche', { parent: E, html: VL.icone('loupe', 40) });
      champ = el('span', { parent: recherche, texte: 'Rechercher un plat…' });
    }
    const compte = el('small', { texte: choisis.length + ' plats' });
    el('div.ed-rubrique', { parent: E, html: `<span>${choisis[0].rubrique.titre.fr}</span>` }).append(compte);
    const lignes = {};
    for (const { plat } of choisis) {
      const l = el('div.ed-ligne', { parent: E });
      const bloc = el('div.ed-plat', { parent: l });
      const nom = el('span.ed-nom-texte', { texte: plat.nom.fr });
      el('div.ed-nom', { parent: bloc }, nom);
      el('div.ed-desc', { parent: bloc, texte: plat.desc.fr });
      el('span.ed-etiquette', { parent: bloc, texte: 'Masqué' });
      const prix = el('div.ed-prix', { parent: l, texte: prixAffiche(o, plat) });
      const oeil = el('div.ed-oeil', { parent: l, html: `<span class="ouvert">${VL.icone('oeil', 52, '#1F1B1C')}</span><span class="ferme">${VL.icone('oeil-ferme', 52, '#fff')}</span>` });
      if ((o.masques || []).includes(plat.id)) l.classList.add('masque');
      lignes[plat.id] = { l, nom, prix, oeil, plat };
    }
    const ligne = (id) => { if (!lignes[id]) throw new Error('editeur : le plat « ' + id + ' » n\'est pas dans `plats`'); return lignes[id]; };

    entreeTel(s, tel.el, t0);
    const d = VL.doigt(s, E);
    let t = t0 + 0.9, modifie = false;
    const marquerModifie = (quand) => { if (!modifie) { s.anim(etat, quand, 0.25, { height: [0, 70] }); modifie = true; } };

    for (const ac of o.actions || []) {
      if (ac.a === 'pause') t += ac.duree || 0.5;
      else if (ac.a === 'chercher') {
        t = d.aller(recherche, t, 0.5, { ox: 0.45 }); d.toucher(t);
        s.classe(recherche, t + 0.12, 'actif'); s.texte(champ, t + 0.12, '');
        const n = [...ac.texte].length;
        s.tape(champ, t + 0.3, n * 0.15, ac.texte); t += 0.3 + n * 0.15 + 0.2;
        let trouves = 0;
        for (const x of Object.values(lignes)) {
          const i = x.plat.nom.fr.toLowerCase().indexOf(ac.texte.toLowerCase());
          if (i < 0) s.anim(x.l, t, 0.35, { height: [168, 0], opacity: [1, 0] }, 'douce');
          else { trouves++; const n0 = x.plat.nom.fr; s.texte(x.nom, t, `${n0.slice(0, i)}<mark>${n0.slice(i, i + n)}</mark>${n0.slice(i + n)}`); }
        }
        s.texte(compte, t, trouves + (trouves > 1 ? ' résultats' : ' résultat'));
        t += 0.6;
      } else if (ac.a === 'masquer' || ac.a === 'afficher') {
        const x = ligne(ac.plat);
        t = d.aller(x.oeil, t, 0.5); d.toucher(t);
        s.classe(x.l, t + 0.12, 'masque', ac.a === 'masquer'); marquerModifie(t + 0.12);
        t += 0.8;
      } else if (ac.a === 'prix') {
        const x = ligne(ac.plat), ancien = prixAffiche(o, x.plat);
        t = d.aller(x.prix, t, 0.5); d.toucher(t);
        s.classe(x.prix, t + 0.12, 'edition'); t += 0.5;
        for (let i = ancien.length - 1; i >= 0; i--) { t += 0.15; s.texte(x.prix, t, ancien.slice(0, i) || '&nbsp;'); }
        t += 0.1;
        for (let i = 1; i <= ac.valeur.length; i++) { t += 0.2; s.texte(x.prix, t, ac.valeur.slice(0, i)); }
        marquerModifie(t); t += 0.5;
        s.classe(x.prix, t, 'edition', false);
      } else if (ac.a === 'nom') {
        const x = ligne(ac.plat);
        t = d.aller(x.nom, t, 0.5, { ox: 0.3 }); d.toucher(t);
        s.texte(x.nom, t + 0.12, `<mark>${x.plat.nom.fr}</mark>`); t += 0.55;
        const n = [...ac.valeur].length;
        s.tape(x.nom, t, n * 0.07, ac.valeur); t += n * 0.07;
        marquerModifie(t); t += 0.5;
      } else if (ac.a === 'enregistrer') {
        t = d.aller(bouton, t, 0.5); d.toucher(t);
        s.classe(bouton, t + 0.12, 'ok'); s.texte(bouton, t + 0.12, 'Enregistré');
        marquerModifie(t + 0.12);
        s.classe(etat, t + 0.12, 'ok'); s.texte(etat, t + 0.12, VL.icone('coche', 34, '#2E7D4F', 3.4) + ' Carte à jour · site et QR code');
        t += 0.9;
      } else throw new Error('editeur : action inconnue « ' + ac.a + ' »');
    }
    d.cacher(t);
    return { el: tel.el, fin: t };
  };

  /* ----------------------------------------------------------------------
     carte — ce que voit le client après avoir scanné le QR code
       carte, plats        : comme pour « editeur »
       langue     : 'fr' (défaut) | 'en' | 'es' | 'ru'   langue de départ
       langues    : false pour retirer le sélecteur FR · EN · ES · RU
       codes      : false pour ne jamais montrer les codes (P3…) ; par défaut
                    ils apparaissent dès que la langue n'est pas le français
       masques    : ['burrata']      plats absents (masqués par le gérant)
       prix       : { risotto: '15' }
       neufs      : ['risotto']      prix surlignés (ce qui vient de changer)
       actions :
         { a: 'langue', code: 'en' }             le client change de langue
         { a: 'pointer', plat: 'risotto' }       le client montre un plat du doigt
         { a: 'retirer', plat: 'burrata' }       le plat disparaît (carte mise à jour)
         { a: 'prix', plat: 'risotto', valeur: '15' }
         { a: 'pause', duree: 0.6 }
     ---------------------------------------------------------------------- */
  VL.visuels.carte = function (parent, s, o, t0) {
    const { carte, choisis } = lireCarte(o);
    let langue = o.langue || 'fr';
    const tel = VL.telephone(parent, o.heure || '12:30');
    const E = tel.ecran;
    const trad = [];   // éléments traduits : { e, textes: { fr, en, es, ru } }
    const T = (e, textes) => { e.textContent = textes[langue]; trad.push({ e, textes }); return e; };

    const tete = el('div.ca-tete', { parent: E });
    el('div.ca-resto', { parent: tete, texte: carte.nom });
    T(el('div.ca-sous', { parent: tete }), carte.sousTitre);
    const pastilles = {};
    if (o.langues !== false) {
      const rang = el('div.ca-langues', { parent: tete });
      for (const c of ['fr', 'en', 'es', 'ru']) pastilles[c] = el('span.ca-langue' + (c === langue ? '.actif' : ''), { parent: rang, texte: c.toUpperCase() });
    }
    const jour = el('div.ca-jour', { parent: tete, html: '<i></i>' });
    T(el('span', { parent: jour }), carte.jour);

    const lignes = {};
    let rubrique = null;
    for (const { plat, rubrique: r } of choisis) {
      if ((o.masques || []).includes(plat.id)) continue;
      if (r !== rubrique) { T(el('div.ca-rubrique', { parent: E }), r.titre); rubrique = r; }
      const l = el('div.ca-ligne', { parent: E });
      if (o.codes !== false && langue !== 'fr') l.classList.add('avec-code');
      el('span.ca-code', { parent: l, texte: plat.code });
      const bloc = el('div.ca-plat', { parent: l });
      T(el('div.ca-nom', { parent: bloc }), plat.nom);
      T(el('div.ca-desc', { parent: bloc }), plat.desc);
      const prix = el('div.ca-prix', { parent: l, texte: prixAffiche(o, plat) + ' €' });
      if ((o.neufs || []).includes(plat.id)) l.classList.add('neuf');
      lignes[plat.id] = { l, prix, plat };
    }
    const ligne = (id) => { if (!lignes[id]) throw new Error('carte : le plat « ' + id + ' » n\'est pas affiché'); return lignes[id]; };

    entreeTel(s, tel.el, t0);
    const d = VL.doigt(s, E);
    let t = t0 + 0.9;
    for (const ac of o.actions || []) {
      if (ac.a === 'pause') t += ac.duree || 0.5;
      else if (ac.a === 'langue') {
        t = d.aller(pastilles[ac.code], t, 0.45); d.toucher(t);
        s.classe(pastilles[langue], t + 0.12, 'actif', false); s.classe(pastilles[ac.code], t + 0.12, 'actif');
        for (const { e, textes } of trad) {
          s.anim(e, t + 0.12, 0.14, { opacity: [1, 0] }, 'lin');
          s.texte(e, t + 0.26, textes[ac.code]);
          s.anim(e, t + 0.26, 0.26, { opacity: [0, 1] }, 'lin');
        }
        if (o.codes !== false) for (const x of Object.values(lignes)) s.classe(x.l, t + 0.26, 'avec-code', ac.code !== 'fr');
        langue = ac.code; t += 0.9;
      } else if (ac.a === 'pointer') {
        const x = ligne(ac.plat);
        t = d.aller(x.l, t, 0.55, { ox: 0.55, oy: 0.6 }); d.toucher(t);
        s.classe(x.l, t + 0.12, 'pointe'); t += 0.9;
      } else if (ac.a === 'retirer') {
        const x = ligne(ac.plat);
        s.anim(x.l, t, 0.45, { height: [156, 0], opacity: [1, 0] }, 'douce');
        s.anim(jour, t + 0.3, 0.2, { scale: [1, 1.18] }); s.anim(jour, t + 0.5, 0.3, { scale: [1.18, 1] }, 'douce');
        t += 0.9;
      } else if (ac.a === 'prix') {
        const x = ligne(ac.plat);
        s.anim(x.prix, t, 0.15, { opacity: [1, 0] }, 'lin');
        s.texte(x.prix, t + 0.15, ac.valeur + ' €'); s.classe(x.l, t + 0.15, 'neuf');
        s.anim(x.prix, t + 0.15, 0.25, { opacity: [0, 1] }, 'lin');
        s.anim(jour, t + 0.3, 0.2, { scale: [1, 1.18] }); s.anim(jour, t + 0.5, 0.3, { scale: [1.18, 1] }, 'douce');
        t += 0.9;
      } else throw new Error('carte : action inconnue « ' + ac.a + ' »');
    }
    d.cacher(t);
    return { el: tel.el, fin: t };
  };

  /* ----------------------------------------------------------------------
     qr — le QR code qui ne change pas pendant que la carte change
       etiquette  : 'Le Petit Bistrot · la carte'
       evenements : ['Prix modifié', 'Plat masqué', …]  apparaissent un à un
       tampon     : 'Toujours le même'  (posé sur le QR à la fin ; false = aucun)
     ---------------------------------------------------------------------- */
  VL.visuels.qr = function (parent, s, o, t0) {
    const bloc = el('div', { parent, style: { display: 'flex', flexDirection: 'column', alignItems: 'center' } });
    const cadreQr = el('div', { parent: bloc, style: { position: 'relative' } });
    const qr = VL.qr(cadreQr, o.taille || 330);
    const etiquette = el('div.pastille.sombre', { parent: bloc, html: VL.riche(o.etiquette || 'Le Petit Bistrot · la carte'), style: { marginTop: '-30px', position: 'relative' } });
    s.surgit(qr, t0, { de: 0.7 }); s.entre(etiquette, t0 + 0.25, { y: 20 });
    const liste = el('div', { parent: bloc, style: { marginTop: '40px', display: 'flex', flexDirection: 'column', gap: '18px', alignItems: 'center' } });
    let t = t0 + 0.9;
    for (const ev of o.evenements || []) {
      const p = el('div.pastille', { parent: liste, html: VL.coche('vert') + '<span>' + VL.riche(ev) + '</span>', 'data-cle': 'large', style: { padding: '10px 34px 10px 12px', gap: '20px', fontSize: '42px' } });
      s.entre(p, t, { y: 40, duree: 0.4 });
      // le QR « encaisse » la modification sans bouger d'un module
      s.anim(qr, t + 0.1, 0.15, { scale: [1, 1.04] }); s.anim(qr, t + 0.25, 0.25, { scale: [1.04, 1] }, 'douce');
      t += o.pas || 0.85;
    }
    if (o.tampon !== false) {
      const tp = el('div.tampon', { parent: cadreQr, html: VL.riche(o.tampon || 'Toujours le même'), 'data-cle': 'large', style: { position: 'absolute', left: '50%', top: '50%', marginLeft: '-250px', marginTop: '-20px', width: '500px', textAlign: 'center' } });
      s.surgit(tp, t, { rotation: -7 }); t += 0.6;
    }
    return { el: bloc, fin: t };
  };

  /* ----------------------------------------------------------------------
     partout — une modification dans l'espace de gestion, répercutée sur
     le site et sur le QR code
       plat   : 'risotto'
       apres  : '15'        nouveau prix (l'ancien est celui de la carte)
     ---------------------------------------------------------------------- */
  VL.visuels.partout = function (parent, s, o, t0) {
    const { choisis } = lireCarte({ carte: o.carte, plats: [o.plat || 'risotto'] });
    const plat = choisis[0].plat, avant = plat.prix + ' €', apres = (o.apres || '15') + ' €';
    const bloc = el('div', { parent, style: { position: 'relative', width: '900px' } });
    const haut = el('div.fiche', { parent: bloc, html: `<div class="fiche-titre">${VL.icone('crayon', 36)}Votre espace de gestion</div><div class="mini-plat"><span>${plat.nom.fr}</span><b>${avant}</b></div><div class="mini-desc">${plat.desc.fr}</div>` });
    const prixHaut = haut.querySelector('b');
    const fleches = el('div', { parent: bloc, style: { position: 'relative', height: '150px' }, html:
      '<svg width="900" height="150" viewBox="0 0 900 150" fill="none" stroke="#E52824" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"><path d="M330 12C330 70 215 60 215 126M196 104l19 24 21-22"/><path d="M570 12C570 70 685 60 685 126M664 106l21 22 19-24"/></svg>' });
    const bas = el('div', { parent: bloc, style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' } });
    const fiche = (titre, extra) => el('div.fiche', { parent: bas, style: { padding: '28px 30px' }, html:
      `${extra}<div class="fiche-titre" style="margin-bottom:10px">${titre}</div><div class="mini-plat" style="font-size:36px;display:block">${plat.nom.fr}</div><div style="display:flex;align-items:center;margin-top:14px"><b class="gros-prix">${avant}</b><span class="a-jour" style="opacity:0"><i></i>À jour</span></div>` });
    const site = fiche('Votre site', '<div class="mini-nav" style="margin:-28px -30px 20px"><i></i><i></i><span>lepetitbistrot.fr/carte</span></div>');
    const qrF = fiche('Votre QR code', '');
    const qr = VL.qr(qrF, 84); Object.assign(qr.style, { position: 'absolute', right: '24px', top: '22px', padding: '12px', borderWidth: '4px', borderRadius: '18px' });
    qrF.style.position = 'relative';

    s.entre(haut, t0, { y: 40 });
    s.anim(fleches, t0 + 0.2, 0.4, { opacity: [0, 0.25] }, 'lin');
    s.entre(site, t0 + 0.25, { y: 40 }); s.entre(qrF, t0 + 0.35, { y: 40 });
    let t = t0 + 1.3;
    // 1. le prix change dans l'espace de gestion
    s.anim(prixHaut, t, 0.2, { scale: [1, 1.25] }); s.texte(prixHaut, t + 0.2, apres);
    s.anim(prixHaut, t + 0.2, 0.35, { scale: [1.25, 1] }, 'douce');
    s.classe(prixHaut, t + 0.2, 'change');
    t += 0.8;
    // 2. la modification descend
    s.anim(fleches, t, 0.35, { opacity: [0.25, 1] }, 'lin');
    t += 0.45;
    // 3. le site et le QR code sont à jour
    [site, qrF].forEach((f, i) => {
      const b = f.querySelector('.gros-prix'), badge = f.querySelector('.a-jour'), q = t + i * 0.18;
      s.anim(b, q, 0.15, { scale: [1, 1.2] }); s.texte(b, q + 0.15, apres); s.anim(b, q + 0.15, 0.3, { scale: [1.2, 1] }, 'douce');
      s.classe(b, q + 0.15, 'change');
      s.anim(badge, q + 0.3, 0.3, { opacity: [0, 1] }, 'lin');
    });
    return { el: bloc, fin: t + 1 };
  };

  /* ----------------------------------------------------------------------
     pdf — la carte en fichier PDF sur un téléphone : il faut zoomer
       fichier : 'carte.pdf'
       tampon  : 'Illisible sans zoomer'   (false = aucun)
     ---------------------------------------------------------------------- */
  VL.visuels.pdf = function (parent, s, o, t0) {
    const { carte } = lireCarte(o);
    const tel = VL.telephone(parent, o.heure || '12:30');
    const E = tel.ecran;
    el('div.pdf-barre', { parent: E, html: `<b>PDF</b><span>${o.fichier || 'carte.pdf'}</span>` });
    const fond = el('div.pdf-fond', { parent: E });
    const plats = [];
    carte.rubriques.forEach((r) => r.plats.forEach((p) => plats.push(p)));
    const rubrique = (titre, n) => `<h5>${titre}</h5>` + Array.from({ length: n }, (_, i) => { const p = plats[(i * 5 + titre.length) % plats.length]; return `<div class="pdf-l"><span>${p.nom.fr}<em>${p.desc.fr}</em></span><span>${p.prix},00</span></div>`; }).join('');
    const page = el('div.pdf-page', { parent: fond, html: `<h4>${carte.nom.toUpperCase()}</h4><p>${carte.sousTitre.fr}</p><div class="pdf-cols"><div>${rubrique('ENTRÉES', 6)}${rubrique('PLATS', 8)}${rubrique('FROMAGES', 3)}</div><div>${rubrique('DESSERTS', 6)}${rubrique('VINS AU VERRE', 7)}${rubrique('BOISSONS', 5)}</div></div>` });
    entreeTel(s, tel.el, t0);
    // deux doigts qui s'écartent pour zoomer, puis la page glisse
    const a = el('div.doigt', { parent: fond }), b = el('div.doigt', { parent: fond });
    let t = t0 + 1.1;
    for (const [d, sens] of [[a, -1], [b, 1]]) {
      s.anim(d, t, 0.2, { opacity: [0, 1] }, 'lin');
      s.anim(d, t, 0.01, { x: [380 + sens * 50, 380 + sens * 50], y: [330 - sens * 40, 330 - sens * 40] });
      s.anim(d, t + 0.3, 0.9, { x: [380 + sens * 50, 380 + sens * 220], y: [330 - sens * 40, 330 - sens * 190] }, 'douce');
      s.anim(d, t + 1.3, 0.2, { opacity: [1, 0] }, 'lin');
    }
    s.anim(page, t + 0.3, 0.9, { scale: [1, 2.3] }, 'douce');
    t += 1.6;
    s.anim(a, t, 0.2, { opacity: [0, 1] }, 'lin');
    s.anim(a, t, 0.01, { x: [520, 520], y: [420, 420] });
    s.anim(a, t + 0.25, 0.8, { x: [520, 250], y: [420, 380] }, 'douce');
    s.anim(page, t + 0.25, 0.8, { x: [0, -330], y: [0, -60] }, 'douce');
    s.anim(a, t + 1.15, 0.2, { opacity: [1, 0] }, 'lin');
    t += 1.3;
    if (o.tampon !== false) {
      const tp = el('div.tampon', { parent, html: VL.riche(o.tampon || 'Illisible sans zoomer'), 'data-cle': 'large', style: { position: 'absolute', left: '50%', top: '520px', width: '640px', marginLeft: '-320px', textAlign: 'center' } });
      s.surgit(tp, t, { rotation: -6 }); t += 0.6;
    }
    return { el: tel.el, fin: t };
  };

  /* ----------------------------------------------------------------------
     liste — des lignes à coche qui arrivent une à une
       items : ['Création du site vitrine', …]   ou { texte, non: true } pour une ligne « sans »
       pas   : 0.45   secondes entre deux lignes
       taille: 44     taille du texte en px
     ---------------------------------------------------------------------- */
  VL.visuels.liste = function (parent, s, o, t0) {
    const liste = el('div.liste', { parent });
    let t = t0;
    for (const it of o.items) {
      const non = typeof it === 'object' && it.non, texte = typeof it === 'object' ? it.texte : it;
      const li = el('div.liste-item' + (non ? '.non' : ''), { parent: liste, html: VL.coche(non ? 'gris' : o.coche || '', non ? 'croix' : 'coche') + '<span>' + VL.riche(texte) + '</span>', 'data-cle': 'large' });
      if (o.taille) li.style.fontSize = o.taille + 'px';
      s.entre(li, t, { x: -60, duree: 0.45 });
      t += o.pas || 0.45;
    }
    return { el: liste, fin: t + 0.3 };
  };

  /* ----------------------------------------------------------------------
     perso — un personnage du film et sa bulle
       perso : 'chef' | 'cliente' | 'gerante' | 'habitue'
       bulle : 'Plus de burrata !'
       cote  : 'gauche' (défaut) | 'droite'
       tampon: texte d'un tampon posé près du personnage (facultatif)
     ---------------------------------------------------------------------- */
  VL.visuels.perso = function (parent, s, o, t0) {
    const droite = o.cote === 'droite';
    const bloc = el('div', { parent, style: { display: 'flex', flexDirection: 'column', alignItems: droite ? 'flex-end' : 'flex-start', gap: '76px', paddingTop: '10px' } });
    const bulle = el('div.bulle' + (droite ? '.droite' : ''), { parent: bloc, html: VL.riche(o.bulle), 'data-cle': 'large', style: { maxWidth: '820px', transformOrigin: droite ? '85% 120%' : '15% 120%' } });
    const m = VL.medaillon(bloc, o.perso || 'chef', o.taille || 440);
    s.surgit(m, t0, { de: 0.6 });
    s.surgit(bulle, t0 + 0.45, { de: 0.3 });
    // le personnage respire : un très léger balancement
    s.fonction(0, 1, (p, t) => { m.firstChild.style.transform = `translateY(${Math.sin(t * 2.6) * 5}px) rotate(${Math.sin(t * 1.7) * 1.2}deg)`; });
    let t = t0 + 1.1;
    if (o.tampon) {
      const tp = el('div.tampon', { parent: bloc, html: VL.riche(o.tampon), 'data-cle': 'large', style: { position: 'absolute', [droite ? 'left' : 'right']: '0', bottom: '60px' } });
      bloc.style.position = 'relative';
      s.surgit(tp, t + 0.3, { rotation: droite ? 6 : -6 }); t += 0.9;
    }
    return { el: bloc, fin: t };
  };

  /* ----------------------------------------------------------------------
     codes — le client lit dans sa langue, montre un code, le serveur comprend
       plat   : 'risotto'
       langue : 'ru' (défaut) | 'en' | 'es'
       libelles : { client: 'Votre client lit', vous: 'Vous comprenez' }
     ---------------------------------------------------------------------- */
  VL.visuels.codes = function (parent, s, o, t0) {
    const { choisis } = lireCarte({ carte: o.carte, plats: [o.plat || 'risotto'] });
    const plat = choisis[0].plat, lg = o.langue || 'ru';
    const lib = Object.assign({ client: 'Votre client lit', vous: 'Vous comprenez' }, o.libelles || {});
    const bloc = el('div', { parent, style: { display: 'flex', flexDirection: 'column', alignItems: 'center' } });
    const fiche = (titre, icone, nom, desc) => el('div.fiche', { parent: bloc, style: { width: '100%' }, html:
      `<div class="fiche-titre">${VL.icone(icone, 36)}${titre}</div><div style="display:flex;align-items:center;gap:24px"><span class="ca-code" style="display:block;font-size:44px;min-width:104px;padding:14px 0">${plat.code}</span><div><div class="mini-plat" style="font-size:46px" data-cle="large">${nom}</div><div class="mini-desc" style="font-size:36px">${desc}</div></div></div>` });
    const a = fiche(lib.client, 'globe', plat.nom[lg], plat.desc[lg]);
    const milieu = el('div', { parent: bloc, style: { height: '250px', display: 'flex', alignItems: 'center', gap: '30px' } });
    const rond = el('div', { parent: milieu, texte: plat.code, 'data-cle': 'large', style: { width: '200px', height: '200px', borderRadius: '50%', background: '#E52824', color: '#fff', border: '6px solid #2A2324', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--titres)', fontWeight: 700, fontSize: '88px', boxShadow: '0 10px 0 rgba(31,27,28,.18)' } });
    const b = fiche(lib.vous, 'coche', plat.nom.fr, plat.desc.fr);
    s.entre(a, t0, { y: 40 });
    s.surgit(rond, t0 + 1.1, { de: 0.3 });
    s.anim(rond, t0 + 1.7, 0.2, { scale: [1, 1.1] }); s.anim(rond, t0 + 1.9, 0.3, { scale: [1.1, 1] }, 'douce');
    s.entre(b, t0 + 2.2, { y: -40 });
    return { el: bloc, fin: t0 + 3 };
  };
})();
