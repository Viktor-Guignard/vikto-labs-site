/* ==========================================================================
   VIKTO LABS — Instagram · composants de marque partagés
   (icônes, QR code, téléphone, médaillon, doigt, cadre d'une scène, carton de fin)
   Tous renvoient des éléments DOM ; l'apparence est dans base.css.
   ========================================================================== */
(function () {
  'use strict';
  const VL = window.VL;
  const el = VL.el;

  /* ---- Icônes au trait (viewBox 24) ---- */
  const TRACES = {
    oeil: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3.2"/>',
    'oeil-ferme': '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3.2"/><path d="M4 3l16 18"/>',
    loupe: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L21 21"/>',
    coche: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    croix: '<path d="M6 6l12 12M18 6L6 18"/>',
    fleche: '<path d="M4 12h15M13 6l6 6-6 6"/>',
    'fleche-bas': '<path d="M12 4v15M6 13l6 6 6-6"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.2 3 14.8 0 18M12 3c-3 3.2-3 14.8 0 18"/>',
    telephone: '<rect x="6.5" y="2.5" width="11" height="19" rx="2.5"/><path d="M10.5 18.5h3"/>',
    crayon: '<path d="M4 20l1-4.5L16.5 4l3.5 3.5L8.5 19z"/><path d="M14 6.5l3.5 3.5"/>',
  };
  /** Icône SVG (chaîne HTML). couleur = toute couleur CSS ; epaisseur en unités de viewBox. */
  VL.icone = function (nom, taille, couleur, epaisseur) {
    return `<svg width="${taille}" height="${taille}" viewBox="0 0 24 24" fill="none" stroke="${couleur || 'currentColor'}" stroke-width="${epaisseur || 2.2}" stroke-linecap="round" stroke-linejoin="round">${TRACES[nom]}</svg>`;
  };
  /** Pastille ronde avec une coche (ou une croix). */
  VL.coche = function (variante, icone) {
    return `<span class="coche ${variante || ''}">${VL.icone(icone || 'coche', 40, '#fff', 3.2)}</span>`;
  };

  /* ---- QR code (factice : il ne mène nulle part) ---- */
  const QR = 'M0 0h7v1h-7zM8 0h1v1h-1zM12 0h1v1h-1zM14 0h7v1h-7zM0 1h1v1h-1zM6 1h1v1h-1zM10 1h3v1h-3zM14 1h1v1h-1zM20 1h1v1h-1zM0 2h1v1h-1zM2 2h3v1h-3zM6 2h1v1h-1zM12 2h1v1h-1zM14 2h1v1h-1zM16 2h3v1h-3zM20 2h1v1h-1zM0 3h1v1h-1zM2 3h3v1h-3zM6 3h1v1h-1zM8 3h3v1h-3zM12 3h1v1h-1zM14 3h1v1h-1zM16 3h3v1h-3zM20 3h1v1h-1zM0 4h1v1h-1zM2 4h3v1h-3zM6 4h1v1h-1zM8 4h1v1h-1zM11 4h2v1h-2zM14 4h1v1h-1zM16 4h3v1h-3zM20 4h1v1h-1zM0 5h1v1h-1zM6 5h1v1h-1zM10 5h2v1h-2zM14 5h1v1h-1zM20 5h1v1h-1zM0 6h7v1h-7zM8 6h1v1h-1zM10 6h1v1h-1zM12 6h1v1h-1zM14 6h7v1h-7zM8 7h2v1h-2zM11 7h1v1h-1zM0 8h2v1h-2zM3 8h4v1h-4zM9 8h3v1h-3zM13 8h2v1h-2zM16 8h1v1h-1zM18 8h3v1h-3zM1 9h2v1h-2zM5 9h1v1h-1zM7 9h2v1h-2zM10 9h1v1h-1zM12 9h2v1h-2zM15 9h2v1h-2zM19 9h1v1h-1zM0 10h1v1h-1zM2 10h2v1h-2zM6 10h2v1h-2zM9 10h2v1h-2zM13 10h1v1h-1zM16 10h2v1h-2zM20 10h1v1h-1zM1 11h1v1h-1zM4 11h1v1h-1zM7 11h1v1h-1zM10 11h3v1h-3zM14 11h2v1h-2zM18 11h2v1h-2zM0 12h3v1h-3zM6 12h1v1h-1zM8 12h2v1h-2zM11 12h1v1h-1zM13 12h3v1h-3zM17 12h1v1h-1zM19 12h2v1h-2zM8 13h1v1h-1zM10 13h2v1h-2zM13 13h1v1h-1zM16 13h2v1h-2zM20 13h1v1h-1zM0 14h7v1h-7zM9 14h1v1h-1zM11 14h2v1h-2zM14 14h2v1h-2zM18 14h2v1h-2zM0 15h1v1h-1zM6 15h1v1h-1zM8 15h2v1h-2zM12 15h1v1h-1zM15 15h1v1h-1zM17 15h2v1h-2zM0 16h1v1h-1zM2 16h3v1h-3zM6 16h1v1h-1zM9 16h1v1h-1zM11 16h3v1h-3zM16 16h1v1h-1zM19 16h2v1h-2zM0 17h1v1h-1zM2 17h3v1h-3zM6 17h1v1h-1zM8 17h1v1h-1zM10 17h1v1h-1zM13 17h2v1h-2zM17 17h2v1h-2zM0 18h1v1h-1zM2 18h3v1h-3zM6 18h1v1h-1zM8 18h3v1h-3zM12 18h1v1h-1zM14 18h2v1h-2zM18 18h1v1h-1zM20 18h1v1h-1zM0 19h1v1h-1zM6 19h1v1h-1zM9 19h1v1h-1zM11 19h2v1h-2zM15 19h3v1h-3zM19 19h1v1h-1zM0 20h7v1h-7zM8 20h2v1h-2zM12 20h2v1h-2zM16 20h1v1h-1zM18 20h3v1h-3z';
  /** Tuile QR code. taille = côté du motif en px. */
  VL.qr = function (parent, taille) {
    return el('div.qr', { parent, html: `<svg width="${taille}" height="${taille}" viewBox="0 0 21 21" shape-rendering="crispEdges"><path fill="currentColor" d="${QR}"/></svg>` });
  };

  /* ---- Téléphone : renvoie { el, ecran } ; on remplit `ecran` ---- */
  VL.telephone = function (parent, heure) {
    const tel = el('div.tel', { parent });
    const ecran = el('div.tel-ecran', { parent: tel });
    el('div.tel-barre', { parent: ecran, html: `<span>${heure || '11:47'}</span><span class="tel-pile"></span>` });
    el('div.tel-ile', { parent: ecran });
    return { el: tel, ecran };
  };

  /* ---- Médaillon de personnage : 'chef' | 'cliente' | 'gerante' | 'habitue' ---- */
  VL.medaillon = function (parent, nom, taille) {
    const p = VL.PERSONNAGES[nom];
    if (!p) throw new Error('Personnage inconnu : ' + nom + ' (chef, cliente, gerante, habitue)');
    const m = el('div.medaillon', { parent, html: `<svg viewBox="${p.vue}"><g class="perso-ink" style="--ink:${p.encre}px">${p.svg}</g></svg>` });
    if (taille) { m.style.width = taille + 'px'; m.style.height = taille + 'px'; }
    return m;
  };

  /* ---- Signature « ● VIKTO LABS      vikto-labs.fr » ---- */
  VL.signature = function (parent) {
    return el('div.signature', { parent, html: '<i></i>VIKTO LABS<span>vikto-labs.fr</span>' });
  };

  /**
   * Doigt : un rond qui glisse d'une cible à l'autre et « touche ».
   *   const d = VL.doigt(s, conteneur);
   *   d.aller(cible, t, duree, { ox: .5, oy: .5 })   // arrive sur `cible` à t + duree
   *   d.toucher(t)                                   // petit appui + onde rouge
   *   d.cacher(t)
   * La position des cibles est mesurée à chaque image : le doigt suit donc
   * une ligne qui se déplace (liste filtrée, etc.).
   */
  VL.doigt = function (s, conteneur) {
    const rond = el('div.doigt', { parent: conteneur });
    const onde = el('div.doigt-onde', { parent: conteneur });
    const etapes = [], touches = [];
    let fin = Infinity;
    const lieu = (e, c) => {
      const r = e.cible.getBoundingClientRect();
      return [r.left - c.left + r.width * e.ox, r.top - c.top + r.height * e.oy];
    };
    s.fonction(0, 1, (p, t) => {
      if (!etapes.length || t < etapes[0].t0) { rond.style.opacity = 0; onde.style.opacity = 0; return; }
      const c = conteneur.getBoundingClientRect();
      let i = 0;
      while (i + 1 < etapes.length && etapes[i + 1].t0 <= t) i++;
      const e = etapes[i], a = lieu(e, c);
      const de = i > 0 ? lieu(etapes[i - 1], c) : [a[0] + 150, a[1] + 330];
      const k = VL.courbes.douce(Math.min(1, (t - e.t0) / (e.t1 - e.t0)));
      const x = de[0] + (a[0] - de[0]) * k, y = de[1] + (a[1] - de[1]) * k;
      let appui = 1, ondeO = 0, ondeS = 1;
      for (const tt of touches) {
        const u = (t - tt) / 0.3;
        if (u >= 0 && u <= 1) appui = 1 - 0.24 * Math.sin(Math.PI * u);
        const v = (t - tt) / 0.55;
        if (v >= 0 && v <= 1) { ondeO = 1 - v; ondeS = 1 + 1.5 * VL.courbes.sortie(v); }
      }
      const o = Math.min(1, (t - etapes[0].t0) / 0.2) * (t > fin ? Math.max(0, 1 - (t - fin) / 0.25) : 1);
      rond.style.opacity = o;
      rond.style.transform = `translate(${x}px, ${y}px) scale(${appui})`;
      onde.style.opacity = ondeO * o;
      onde.style.transform = `translate(${x}px, ${y}px) scale(${ondeS})`;
    });
    return {
      aller(cible, t, duree, o) { etapes.push({ cible, t0: t, t1: t + duree, ox: o && o.ox != null ? o.ox : 0.5, oy: o && o.oy != null ? o.oy : 0.5 }); return t + duree; },
      toucher(t) { touches.push(t); return t + 0.3; },
      cacher(t) { fin = t; },
    };
  };

  /**
   * Cadre standard d'une scène : zone sûre, signature, légende (sur-titre,
   * titre, sous-titre) et emplacement du visuel.
   *   d : { surTitre, titre, sousTitre, tailleTitre: 'geant'|'moyen'|'petit' }
   * Renvoie { zone, legende, titre, sousTitre, surTitre, visuel }.
   */
  VL.cadre = function (s, d, o) {
    o = o || {};
    const zone = el('div.zone', { parent: s.el });
    if (o.signature !== false) VL.signature(zone);
    const legende = el('div.legende', { parent: zone });
    const r = { zone, legende };
    if (d.surTitre) r.surTitre = el('div.sur-titre', { parent: legende, html: VL.riche(d.surTitre), 'data-cle': 'sur-titre' });
    if (d.titre) {
      const lignes = String(d.titre).split('\n').map((l) => `<span class="ligne">${VL.riche(l)}</span>`).join('');
      r.titre = el('h1.titre' + (d.tailleTitre ? '.' + d.tailleTitre : ''), { parent: legende, html: lignes, 'data-cle': 'titre' });
    }
    if (d.sousTitre) r.sousTitre = el('div.sous-titre', { parent: legende, html: VL.riche(d.sousTitre), 'data-cle': 'sous-titre' });
    r.visuel = el('div.visuel', { parent: zone });
    if (r.titre && o.hauteurTitre) VL.ajuster(r.titre, o.hauteurTitre, 52);
    return r;
  };

  /** Anime l'entrée d'un cadre (sur-titre, lignes du titre, sous-titre). Renvoie l'instant de fin. */
  VL.entreeCadre = function (s, c, t) {
    t = t == null ? 0.25 : t;
    if (c.surTitre) { s.entre(c.surTitre, t, { y: 30, duree: 0.4 }); t += 0.15; }
    if (c.titre) t = s.lignes(c.titre, t);
    if (c.sousTitre) { s.entre(c.sousTitre, t - 0.2, { y: 30 }); t += 0.3; }
    return t;
  };

  /** Temps de lecture confortable d'un texte (secondes). */
  VL.lecture = function (...textes) {
    const n = textes.filter(Boolean).join(' ').replace(/[*_\n]/g, '').length;
    return 1.1 + n * 0.035;
  };

  /**
   * Carton de fin, commun à tous les reels.
   *   d : { titre: 'Une modification.\n*Partout à jour.*', appel, url, persos: ['chef', …] | false, duree }
   */
  VL.cartonDeFin = function (film, d) {
    d = Object.assign({ titre: 'Une modification.\n*Partout à jour.*', appel: 'Essayez la démo sur le site', url: 'vikto-labs.fr', persos: ['chef', 'cliente', 'gerante', 'habitue'], duree: 3.6 }, d || {});
    return film.scene({ nom: 'fin', fond: 'charbon', transition: 'monte' }, (s) => {
      const fin = el('div.fin', { parent: s.el });
      const lignes = String(d.titre).split('\n').map((l) => `<span class="ligne">${VL.riche(l)}</span>`).join('');
      const titre = el('h1.titre', { parent: fin, html: lignes, 'data-cle': 'large' });
      VL.ajuster(titre, 360, 60);
      let t = s.lignes(titre, 0.45, 0.35);
      if (d.persos && d.persos.length) {
        const rang = el('div.fin-persos', { parent: fin });
        d.persos.forEach((p, i) => s.surgit(VL.medaillon(rang, p), t + i * 0.1, { de: 0.3 }));
        t += 0.3;
      }
      const marque = el('div.fin-marque', { parent: fin, texte: 'VIKTO LABS', 'data-cle': 'large' });
      const point = el('div.fin-point', { parent: fin });
      s.entre(marque, t, { y: 30 }); s.surgit(point, t + 0.25, { de: 0 });
      if (d.url) s.entre(el('div.fin-url', { parent: fin, texte: d.url, 'data-cle': 'large' }), t + 0.35, { y: 30 });
      if (d.appel) s.entre(el('div.fin-appel', { parent: fin, html: VL.riche(d.appel), 'data-cle': 'large' }), t + 0.5, { y: 30 });
      s.duree = Math.max(d.duree, t + 2.2);
    });
  };
})();
