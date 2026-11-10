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
     editeur · carte · qr · partout · pdf · liste · codes   (+ perso : voir saynete.js)
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
  const entreeCadre = (s, e, t0) => s.anim(e, t0, 0.65, { y: [460, 0], opacity: [0, 1] }, 'sortie');
  const prixAffiche = (o, plat) => (o.prix && o.prix[plat.id]) || plat.prix;
  const nomFr = (o, plat) => (o.noms && o.noms[plat.id]) || plat.nom.fr;
  const descFr = (o, plat) => (o.descs && o.descs[plat.id]) || plat.desc.fr;
  /** Petit battement d'un élément (confirmation visuelle d'un changement). */
  const battre = (s, e, t, ampleur) => { s.anim(e, t, 0.16, { scale: [1, ampleur || 1.15] }); s.anim(e, t + 0.16, 0.3, { scale: [ampleur || 1.15, 1] }, 'douce'); };

  /* ----------------------------------------------------------------------
     editeur — l'espace de gestion sur téléphone, et les gestes du gérant
       carte      : 'petit-bistrot'
       plats      : ['burrata', 'tartare', …]   lignes affichées (3 visibles sans recherche)
       recherche  : false pour retirer le champ de recherche (gagne une ligne)
       masques    : ['burrata']                 plats déjà masqués au départ
       prix       : { risotto: '15' }           prix de départ différents de la carte
       noms, descs: { jour: 'Blanquette' }      nom / description de départ différents (français)
       actions    : la suite des gestes, joués l'un après l'autre :
         { a: 'chercher', texte: 'burr' }       tape dans la recherche, filtre la liste
         { a: 'masquer', plat: 'burrata' }      touche l'œil : le plat est masqué
         { a: 'afficher', plat: 'burrata' }     touche l'œil : le plat revient
         { a: 'prix', plat: 'risotto', valeur: '15' }
         { a: 'nom', plat: 'burrata', valeur: 'Tartare de saumon' }
         { a: 'desc', plat: 'jour', valeur: 'Blanquette de veau' }
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
      const nom = el('span.ed-nom-texte', { texte: nomFr(o, plat) });
      el('div.ed-nom', { parent: bloc }, nom);
      const desc = el('div.ed-desc', { parent: bloc }, el('span', { texte: descFr(o, plat) }));
      el('span.ed-etiquette', { parent: bloc, texte: 'Masqué' });
      const prix = el('div.ed-prix', { parent: l, texte: prixAffiche(o, plat) });
      const oeil = el('div.ed-oeil', { parent: l, html: `<span class="ouvert">${VL.icone('oeil', 52, '#1F1B1C')}</span><span class="ferme">${VL.icone('oeil-ferme', 52, '#fff')}</span>` });
      if ((o.masques || []).includes(plat.id)) l.classList.add('masque');
      lignes[plat.id] = { l, nom, desc: desc.firstChild, prix, oeil, plat };
    }
    const ligne = (id) => { if (!lignes[id]) throw new Error('editeur : le plat « ' + id + ' » n\'est pas dans `plats`'); return lignes[id]; };

    entreeCadre(s, tel.el, t0);
    const d = VL.doigt(s, E);
    let t = t0 + 0.9, modifie = false;
    const marquerModifie = (quand) => { if (!modifie) { s.anim(etat, quand, 0.25, { height: [0, 70] }); modifie = true; } };
    // réécriture d'un texte : il est sélectionné (surligné), puis retapé lettre à lettre
    const retaper = (cible, ancien, nouveau) => {
      t = d.aller(cible, t, 0.5, { ox: 0.3 }); d.toucher(t);
      s.texte(cible, t + 0.12, `<mark>${ancien}</mark>`); t += 0.55;
      const n = [...nouveau].length, pas = Math.min(0.075, 1.3 / n);
      s.tape(cible, t, n * pas, nouveau); t += n * pas;
      marquerModifie(t); t += 0.45;
    };

    for (const ac of o.actions || []) {
      if (ac.a === 'pause') t += ac.duree || 0.5;
      else if (ac.a === 'chercher') {
        t = d.aller(recherche, t, 0.5, { ox: 0.45 }); d.toucher(t);
        s.classe(recherche, t + 0.12, 'actif'); s.texte(champ, t + 0.12, '');
        const n = [...ac.texte].length;
        s.tape(champ, t + 0.3, n * 0.15, ac.texte); t += 0.3 + n * 0.15 + 0.2;
        let trouves = 0, rang = 0;
        for (const x of Object.values(lignes)) {
          const n0 = nomFr(o, x.plat), i = n0.toLowerCase().indexOf(ac.texte.toLowerCase());
          // les lignes écartées se referment l'une après l'autre : la liste se resserre en douceur
          if (i < 0) { s.anim(x.l, t + rang * 0.06, 0.4, { height: [168, 0], opacity: [1, 0] }, 'douce'); rang++; }
          else { trouves++; s.texte(x.nom, t, `${n0.slice(0, i)}<mark>${n0.slice(i, i + n)}</mark>${n0.slice(i + n)}`); }
        }
        s.texte(compte, t, trouves + (trouves > 1 ? ' résultats' : ' résultat'));
        t += 0.75;
      } else if (ac.a === 'masquer' || ac.a === 'afficher') {
        const x = ligne(ac.plat);
        t = d.aller(x.oeil, t, 0.5); d.toucher(t);
        s.classe(x.l, t + 0.12, 'masque', ac.a === 'masquer'); marquerModifie(t + 0.12);
        battre(s, x.oeil, t + 0.12, 1.18);
        t += 0.85;
      } else if (ac.a === 'prix') {
        const x = ligne(ac.plat), ancien = prixAffiche(o, x.plat);
        t = d.aller(x.prix, t, 0.5); d.toucher(t);
        s.classe(x.prix, t + 0.12, 'edition'); t += 0.5;
        for (let i = ancien.length - 1; i >= 0; i--) { t += 0.15; s.texte(x.prix, t, ancien.slice(0, i) || '&nbsp;'); }
        t += 0.1;
        for (let i = 1; i <= ac.valeur.length; i++) { t += 0.2; s.texte(x.prix, t, ac.valeur.slice(0, i)); }
        marquerModifie(t); t += 0.5;
        s.classe(x.prix, t, 'edition', false);
      } else if (ac.a === 'nom') { const x = ligne(ac.plat); retaper(x.nom, nomFr(o, x.plat), ac.valeur); }
      else if (ac.a === 'desc') { const x = ligne(ac.plat); retaper(x.desc, descFr(o, x.plat), ac.valeur); }
      else if (ac.a === 'enregistrer') {
        t = d.aller(bouton, t, 0.5); d.toucher(t);
        s.classe(bouton, t + 0.12, 'ok'); s.texte(bouton, t + 0.12, 'Enregistré');
        battre(s, bouton, t + 0.12, 1.08);
        marquerModifie(t + 0.12);
        s.classe(etat, t + 0.12, 'ok'); s.texte(etat, t + 0.12, VL.icone('coche', 34, '#2E7D4F', 3.4) + ' Carte à jour · site et QR code');
        t += 0.9;
      } else throw new Error('editeur : action inconnue « ' + ac.a + ' »');
    }
    d.cacher(t);
    return { el: tel.el, fin: t };
  };

  /* ----------------------------------------------------------------------
     carte — ce que voit le client : sur son téléphone après avoir scanné le
     QR code (par défaut), ou sur le site du restaurant (cadre: 'site')
       carte, plats        : comme pour « editeur »
       cadre      : 'telephone' (défaut) | 'site' (fenêtre de navigateur, pleine largeur)
       langue     : 'fr' (défaut) | 'en' | 'es' | 'ru'   langue de départ
       langues    : false pour retirer le sélecteur FR · EN · ES · RU
       codes      : false pour ne jamais montrer les codes (P3…) ; par défaut
                    ils apparaissent dès que la langue n'est pas le français
       masques    : ['burrata']      plats absents (masqués par le gérant)
       prix       : { risotto: '15' }
       noms, descs: { jour: 'Blanquette de veau' }   textes français différents de la carte
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
    const site = o.cadre === 'site';
    const trad = [];   // éléments traduits : { e, textes: { fr, en, es, ru } }
    const T = (e, textes) => { e.textContent = textes[langue]; trad.push({ e, textes }); return e; };
    const pastilles = {};
    let E, cadre, jour;

    if (site) {
      cadre = E = el('div.nav', { parent });
      el('div.nav-barre', { parent: E, html: '<i></i><i></i><i></i><span>votre-restaurant.fr/carte</span>' });
      el('div.nav-tete', { parent: E, html: `<b>${carte.nom}</b><span><u>La carte</u>Réserver</span>` });
      const titre = el('div.nav-titre', { parent: E, html: '<span>La carte du jour</span>' });
      jour = el('div.ca-jour', { parent: titre, html: '<i></i>' });
    } else {
      const tel = VL.telephone(parent, o.heure || '12:30');
      cadre = tel.el; E = tel.ecran;
      const tete = el('div.ca-tete', { parent: E });
      el('div.ca-resto', { parent: tete, texte: carte.nom });
      T(el('div.ca-sous', { parent: tete }), carte.sousTitre);
      if (o.langues !== false) {
        const rang = el('div.ca-langues', { parent: tete });
        for (const c of ['fr', 'en', 'es', 'ru']) pastilles[c] = el('span.ca-langue' + (c === langue ? '.actif' : ''), { parent: rang, texte: c.toUpperCase() });
      }
      jour = el('div.ca-jour', { parent: tete, html: '<i></i>' });
    }
    T(el('span', { parent: jour, style: { display: 'inline-block' } }), carte.jour);

    const lignes = {};
    let rubrique = null;
    for (const { plat, rubrique: r } of choisis) {
      if ((o.masques || []).includes(plat.id)) continue;
      if (r !== rubrique) { T(el('div.ca-rubrique', { parent: E }), r.titre); rubrique = r; }
      const l = el('div.ca-ligne', { parent: E });
      if (o.codes !== false && langue !== 'fr') l.classList.add('avec-code');
      el('span.ca-code', { parent: l, texte: plat.code });
      const bloc = el('div.ca-plat', { parent: l });
      T(el('div.ca-nom', { parent: bloc }), Object.assign({}, plat.nom, { fr: nomFr(o, plat) }));
      T(el('div.ca-desc', { parent: bloc }), Object.assign({}, plat.desc, { fr: descFr(o, plat) }));
      const prix = el('div.ca-prix', { parent: l, texte: prixAffiche(o, plat) + ' €' });
      if ((o.neufs || []).includes(plat.id)) l.classList.add('neuf');
      lignes[plat.id] = { l, prix, plat };
    }
    const ligne = (id) => { if (!lignes[id]) throw new Error('carte : le plat « ' + id + ' » n\'est pas affiché'); return lignes[id]; };

    entreeCadre(s, cadre, t0);
    const d = VL.doigt(s, E);
    let t = t0 + 0.9;
    for (const ac of o.actions || []) {
      if (ac.a === 'pause') t += ac.duree || 0.5;
      else if (ac.a === 'langue') {
        if (!pastilles[ac.code]) throw new Error('carte : pas de sélecteur de langue ici (cadre « site » ou langues: false)');
        t = d.aller(pastilles[ac.code], t, 0.45); d.toucher(t);
        s.classe(pastilles[langue], t + 0.12, 'actif', false); s.classe(pastilles[ac.code], t + 0.12, 'actif');
        battre(s, pastilles[ac.code], t + 0.12, 1.12);
        // la carte se traduit de haut en bas : chaque texte « roule » vers sa traduction
        trad.forEach(({ e, textes }, i) => s.roule(e, t + 0.14 + i * 0.03, textes[ac.code], { dy: 22 }));
        if (o.codes !== false) Object.values(lignes).forEach((x, i) => s.classe(x.l, t + 0.3 + i * 0.06, 'avec-code', ac.code !== 'fr'));
        langue = ac.code; t += 1.05;
      } else if (ac.a === 'pointer') {
        const x = ligne(ac.plat);
        t = d.aller(x.l, t, 0.55, { ox: 0.55, oy: 0.6 }); d.toucher(t);
        s.classe(x.l, t + 0.12, 'pointe'); t += 0.9;
      } else if (ac.a === 'retirer') {
        const x = ligne(ac.plat);
        // le plat glisse hors de la carte, puis les lignes du dessous remontent
        s.anim(x.l, t, 0.3, { opacity: [1, 0], x: [0, -70] }, 'entree');
        s.anim(x.l, t + 0.22, 0.45, { height: [156, 0] }, 'douce');
        battre(s, jour, t + 0.5, 1.16);
        t += 1.0;
      } else if (ac.a === 'prix') {
        const x = ligne(ac.plat);
        s.roule(x.prix, t, ac.valeur + ' €'); s.classe(x.l, t + 0.16, 'neuf');
        battre(s, jour, t + 0.4, 1.16);
        t += 1.0;
      } else throw new Error('carte : action inconnue « ' + ac.a + ' »');
    }
    d.cacher(t);
    return { el: cadre, fin: t };
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
    const qr = VL.qr(cadreQr, o.taille || 400);
    const etiquette = el('div.pastille.sombre', { parent: bloc, html: VL.riche(o.etiquette || 'Le Petit Bistrot · la carte'), style: { marginTop: '-30px', position: 'relative' } });
    s.surgit(qr, t0, { de: 0.7 }); s.entre(etiquette, t0 + 0.25, { y: 20 });
    const liste = el('div', { parent: bloc, style: { marginTop: '40px', display: 'flex', flexDirection: 'column', gap: '18px', alignItems: 'center' } });
    let t = t0 + 0.9;
    for (const ev of o.evenements || []) {
      const p = el('div.pastille', { parent: liste, html: VL.coche('vert') + '<span>' + VL.riche(ev) + '</span>', 'data-cle': 'large', style: { padding: '12px 38px 12px 14px', gap: '22px', fontSize: '46px' } });
      s.entre(p, t, { y: 40, duree: 0.4 });
      s.surgit(p.firstChild, t + 0.15, { de: 0.2 });
      // le QR « encaisse » la modification sans bouger d'un module
      battre(s, qr, t + 0.1, 1.04);
      t += o.pas || 0.85;
    }
    if (o.tampon !== false) {
      const tp = el('div.tampon', { parent: cadreQr, html: VL.riche(o.tampon || 'Toujours le même'), 'data-cle': 'large', style: { position: 'absolute', left: '50%', top: '50%', marginLeft: '-270px', marginTop: '-10px', width: '540px', textAlign: 'center' } });
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
      '<svg width="900" height="150" viewBox="0 0 900 150" fill="none" stroke="#E52824" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">' +
      '<path class="tige" pathLength="1" stroke-dasharray="1" d="M330 12C330 70 215 60 215 126"/><path class="pointe" d="M196 104l19 24 21-22"/>' +
      '<path class="tige" pathLength="1" stroke-dasharray="1" d="M570 12C570 70 685 60 685 126"/><path class="pointe" d="M664 106l21 22 19-24"/></svg>' });
    const bas = el('div', { parent: bloc, style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' } });
    const fiche = (titre, extra) => el('div.fiche', { parent: bas, style: { padding: '28px 30px' }, html:
      `${extra}<div class="fiche-titre" style="margin-bottom:14px;font-size:28px;white-space:nowrap">${titre}</div><div class="mini-plat" style="font-size:40px;display:block">${plat.nom.fr}</div><div style="display:flex;align-items:center;margin-top:18px"><b class="gros-prix">${avant}</b><span class="a-jour"><i></i>À jour</span></div>` });
    const site = fiche('Votre site', '<div class="mini-nav" style="margin:-28px -30px 20px"><i></i><i></i><span>votre-restaurant.fr</span></div>');
    const qrF = fiche('Votre QR code', '<div class="mini-nav" style="margin:-28px -30px 20px"><span>la carte, après le scan</span></div>');
    const qr = VL.qr(qrF.querySelector('.mini-nav'), 40); Object.assign(qr.style, { padding: '5px', borderWidth: '3px', borderRadius: '8px', order: -1, marginRight: '4px' });

    s.entre(haut, t0, { y: 40 });
    s.entre(site, t0 + 0.2, { y: 40 }); s.entre(qrF, t0 + 0.32, { y: 40 });
    for (const badge of bloc.querySelectorAll('.a-jour')) s.anim(badge, 0, 0.01, { opacity: [0, 0] });
    for (const f of fleches.querySelectorAll('.tige')) s.anim(f, 0, 0.01, { strokeDashoffset: [1, 1] });
    for (const f of fleches.querySelectorAll('.pointe')) s.anim(f, 0, 0.01, { opacity: [0, 0] });
    let t = t0 + 1.3;
    // 1. le prix change dans l'espace de gestion
    s.roule(prixHaut, t, apres); s.classe(prixHaut, t + 0.16, 'change'); battre(s, haut, t + 0.16, 1.03);
    t += 0.8;
    // 2. la modification descend : les deux flèches se tracent
    for (const f of fleches.querySelectorAll('.tige')) s.anim(f, t, 0.45, { strokeDashoffset: [1, 0] }, 'douce');
    for (const f of fleches.querySelectorAll('.pointe')) s.anim(f, t + 0.38, 0.15, { opacity: [0, 1] }, 'lin');
    t += 0.55;
    // 3. le site et le QR code sont à jour
    [site, qrF].forEach((f, i) => {
      const b = f.querySelector('.gros-prix'), badge = f.querySelector('.a-jour'), q = t + i * 0.2;
      s.roule(b, q, apres); s.classe(b, q + 0.16, 'change'); battre(s, f, q + 0.16, 1.04);
      s.anim(badge, q + 0.35, 0.3, { opacity: [0, 1] }, 'lin');
    });
    return { el: bloc, fin: t + 1.1 };
  };

  /* ----------------------------------------------------------------------
     pdf — la carte en fichier PDF sur un téléphone : minuscule, il faut
     zoomer, puis faire glisser la page de côté pour lire la fin des lignes
       fichier : 'carte.pdf'
       tampon  : 'Il faut zoomer partout'   (false = aucun)
     ---------------------------------------------------------------------- */
  const PLATS_PDF = ['Œuf mayonnaise', 'Soupe à l\'oignon', 'Terrine maison', 'Salade de chèvre chaud', 'Poireaux vinaigrette', 'Steak frites', 'Blanquette de veau', 'Poisson du marché',
    'Croque-monsieur', 'Omelette aux herbes', 'Crème brûlée', 'Mousse au chocolat', 'Île flottante', 'Tarte Tatin', 'Côtes du Rhône', 'Bourgogne aligoté', 'Sancerre', 'Chinon',
    'Café allongé', 'Thé à la menthe', 'Limonade', 'Eau minérale', 'Jus de pomme', 'Assiette de fromages', 'Saucisse purée', 'Quiche du jour', 'Gratin dauphinois'];
  const DETAILS_PDF = ['servi avec une salade verte', 'selon arrivage', 'fait maison', 'sauce au choix', 'la bouteille 75 cl', 'le verre 12 cl', 'supplément garniture', 'recette de la maison'];
  VL.visuels.pdf = function (parent, s, o, t0) {
    const { carte } = lireCarte(o);
    const tel = VL.telephone(parent, o.heure || '12:30');
    const E = tel.ecran;
    el('div.pdf-barre', { parent: E, html: `<b>PDF</b><span>${o.fichier || 'carte.pdf'}</span>` });
    const fond = el('div.pdf-fond', { parent: E });
    let n = 0;
    const rubrique = (titre, combien) => `<h5>${titre}</h5>` + Array.from({ length: combien }, () => { n++; return `<div class="pdf-l"><span>${PLATS_PDF[(n * 7) % PLATS_PDF.length]}<em>${DETAILS_PDF[(n * 3) % DETAILS_PDF.length]}</em></span><span>${6 + ((n * 5) % 17)},${n % 2 ? '50' : '00'}</span></div>`; }).join('');
    const page = el('div.pdf-page', { parent: fond, html: `<h4>${carte.nom.toUpperCase()}</h4><p>${carte.sousTitre.fr}</p><div class="pdf-cols">` +
      `<div>${rubrique('ENTRÉES', 9)}${rubrique('PLATS', 13)}${rubrique('FROMAGES', 5)}</div>` +
      `<div>${rubrique('DESSERTS', 9)}${rubrique('VINS ROUGES', 10)}${rubrique('VINS BLANCS', 8)}</div>` +
      `<div>${rubrique('BIÈRES', 8)}${rubrique('BOISSONS FRAÎCHES', 10)}${rubrique('BOISSONS CHAUDES', 9)}</div></div>` });
    entreeCadre(s, tel.el, t0);
    const a = el('div.doigt', { parent: fond }), b = el('div.doigt', { parent: fond });
    s.anim(a, 0, 0.01, { opacity: [0, 0] }); s.anim(b, 0, 0.01, { opacity: [0, 0] });
    let t = t0 + 1.5;   // d'abord la page entière : tout est là, rien n'est lisible
    // 1. deux doigts s'écartent pour zoomer
    for (const [dgt, sens] of [[a, -1], [b, 1]]) {
      s.anim(dgt, t, 0.2, { opacity: [0, 1] }, 'lin');
      s.anim(dgt, t + 0.3, 0.9, { x: [380 + sens * 46, 380 + sens * 210], y: [360 - sens * 36, 360 - sens * 180] }, 'douce');
      s.anim(dgt, t + 1.25, 0.2, { opacity: [1, 0] }, 'lin');
    }
    s.anim(page, t + 0.3, 0.9, { scale: [1, 2] }, 'douce');
    t += 1.55;
    // 2. la fin des lignes est hors de l'écran : on fait glisser la page de côté…
    s.anim(a, t, 0.2, { opacity: [0, 1] }, 'lin');
    s.anim(a, t + 0.2, 0.75, { x: [570, 210], y: [520, 505] }, 'douce');
    s.anim(page, t + 0.2, 0.75, { x: [0, -400], y: [0, 0] }, 'douce');
    s.anim(a, t + 1.0, 0.15, { opacity: [1, 0] }, 'lin');
    t += 1.2;
    // 3. …puis on revient et on descend pour trouver la suite
    s.anim(a, t, 0.15, { opacity: [0, 1] }, 'lin');
    s.anim(a, t + 0.15, 0.8, { x: [230, 560], y: [640, 330] }, 'douce');
    s.anim(page, t + 0.15, 0.8, { x: [-400, -60], y: [0, -330] }, 'douce');
    s.anim(a, t + 1.0, 0.2, { opacity: [1, 0] }, 'lin');
    t += 1.2;
    if (o.tampon !== false) {
      const tp = el('div.tampon', { parent, html: VL.riche(o.tampon || 'Il faut zoomer partout'), 'data-cle': 'large', style: { position: 'absolute', left: '50%', top: '500px', width: '660px', marginLeft: '-330px', textAlign: 'center' } });
      s.surgit(tp, t, { rotation: -6 }); t += 0.6;
    }
    return { el: tel.el, fin: t };
  };

  /* ----------------------------------------------------------------------
     liste — des lignes à coche qui arrivent une à une
       items : ['Création du site vitrine', …]   ou { texte, non: true } pour une ligne « sans »
       pas   : 0.45   secondes entre deux lignes
       taille: 50     taille du texte en px
     ---------------------------------------------------------------------- */
  VL.visuels.liste = function (parent, s, o, t0) {
    const liste = el('div.liste', { parent });
    let t = t0;
    for (const it of o.items) {
      const non = typeof it === 'object' && it.non, texte = typeof it === 'object' ? it.texte : it;
      const li = el('div.liste-item' + (non ? '.non' : ''), { parent: liste, html: VL.coche(non ? 'gris' : o.coche || '', non ? 'croix' : 'coche') + '<span>' + VL.riche(texte) + '</span>', 'data-cle': 'large' });
      if (o.taille) li.style.fontSize = o.taille + 'px';
      s.entre(li, t, { x: -60, duree: 0.45 });
      s.surgit(li.firstChild, t + 0.2, { de: 0.2 });   // la coche claque juste après la ligne
      t += o.pas || 0.45;
    }
    return { el: liste, fin: t + 0.3 };
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
      `<div class="fiche-titre">${VL.icone(icone, 36)}${titre}</div><div style="display:flex;align-items:center;gap:24px"><span class="ca-code" style="display:block;font-size:52px;min-width:124px;padding:18px 0">${plat.code}</span><div><div class="mini-plat" style="font-size:50px" data-cle="large">${nom}</div><div class="mini-desc" style="font-size:42px">${desc}</div></div></div>` });
    const a = fiche(lib.client, 'globe', plat.nom[lg], plat.desc[lg]);
    const milieu = el('div', { parent: bloc, style: { height: '300px', display: 'flex', alignItems: 'center', gap: '30px' } });
    const rond = el('div', { parent: milieu, texte: plat.code, 'data-cle': 'large', style: { width: '230px', height: '230px', borderRadius: '50%', background: '#E52824', color: '#fff', border: '6px solid #2A2324', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--titres)', fontWeight: 700, fontSize: '100px', boxShadow: '0 10px 0 rgba(31,27,28,.18)' } });
    const b = fiche(lib.vous, 'coche', plat.nom.fr, plat.desc.fr);
    const [codeA, codeB] = [a.querySelector('.ca-code'), b.querySelector('.ca-code')];
    // si la place manque, on resserre l'espace autour du rond (et le rond lui-même)
    const trop = bloc.offsetHeight - (parent.clientHeight - 40);
    if (trop > 0) { const h = Math.max(170, 300 - trop); milieu.style.height = h + 'px'; const c = Math.min(230, h - 30); Object.assign(rond.style, { width: c + 'px', height: c + 'px', fontSize: Math.round(c * 0.43) + 'px' }); }
    s.entre(a, t0, { y: 40 });
    battre(s, codeA, t0 + 0.8, 1.2);                      // le code du plat, côté client…
    s.surgit(rond, t0 + 1.1, { de: 0.3 });                // …c'est lui qu'il montre…
    battre(s, rond, t0 + 1.7, 1.1);
    s.entre(b, t0 + 2.1, { y: -40 });
    battre(s, codeB, t0 + 2.6, 1.2);                      // …et vous le retrouvez en français
    return { el: bloc, fin: t0 + 3.1 };
  };
})();
