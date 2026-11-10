/* ==========================================================================
   VIKTO LABS — Instagram · moteur d'animation à horloge virtuelle

   Principe : rien ne dépend du temps réel. Un gabarit DÉCLARE des animations
   (« cet élément passe de l'opacité 0 à 1 entre 0,4 s et 0,9 s »), puis le
   script de rendu appelle  VL.poser(t)  pour chaque image (t = n / 30).
   poser(t) recalcule tout l'état à partir de zéro : on peut donc demander
   n'importe quel instant, dans n'importe quel ordre, et obtenir la même image.

   Vocabulaire :
     - film    : un reel entier (ou un post : un film d'une seule image)
     - scène   : un plan plein cadre ; les temps y sont LOCAUX (0 = début du plan)
     - piste   : la suite des valeurs d'une propriété d'un élément dans le temps

   Ce fichier ne connaît rien de la marque : voir composants.js et visuels.js.
   ========================================================================== */
(function () {
  'use strict';

  const VL = (window.VL = window.VL || {});
  VL.gabarits = { reels: {}, posts: {} };   // remplis par gabarits/**.js
  VL.visuels = {};                          // remplis par visuels.js
  VL.cartes = {};                           // remplis par contenus/commun/*.js

  /** Zones sûres (px). Le vérificateur de rendre.js s'en sert. */
  VL.ZONES = {
    reel: { x0: 90, x1: 990, y0: 250, y1: 1500, boutons: { x0: 930, y0: 1150 } },
    post: { x0: 60, x1: 1020, y0: 60, y1: 1290 },
  };

  /* ----------------------------------------------------------------------
     Petits outils
     ---------------------------------------------------------------------- */

  /**
   * Crée un élément.  VL.el('div.fiche.grand', { parent, html, texte, style: {…}, attrs… }, ...enfants)
   */
  VL.el = function (sel, opts, ...enfants) {
    const [tag, ...classes] = sel.split('.');
    const e = document.createElement(tag || 'div');
    if (classes.length) e.className = classes.join(' ');
    opts = opts || {};
    for (const [k, v] of Object.entries(opts)) {
      if (k === 'parent' || v == null) continue;
      if (k === 'html') e.innerHTML = v;
      else if (k === 'texte') e.textContent = v;
      else if (k === 'style') Object.assign(e.style, v);
      else e.setAttribute(k, v);
    }
    for (const c of enfants) if (c) e.append(c);
    if (opts.parent) opts.parent.append(e);
    return e;
  };

  /**
   * Texte « riche » des fichiers de contenu → HTML sûr.
   *   *mot*   → en rouge            _mot_ → en EB Garamond italique
   *   \n      → retour à la ligne
   * Pose aussi les espaces insécables de la typographie française
   * (avant ? ! : ; » et €, après «, dans « 11 h 45 », « 54 € HT »).
   */
  VL.riche = function (s) {
    if (s == null) return '';
    s = String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    s = s.replace(/ ([?!:;»€])/g, ' $1').replace(/« /g, '« ');
    s = s.replace(/(\d) h (\d)/g, '$1 h $2').replace(/(\d) h\b/g, '$1 h');
    s = s.replace(/€ (HT|TTC)/g, '€ $1').replace(/(HT|TTC) ?\/ ?mois/g, '$1/mois').replace(/€ ?\/ ?mois/g, '€/mois');
    s = s.replace(/\*([^*]+)\*/g, '<span class="rouge">$1</span>');
    s = s.replace(/(^|[\s(«'’>])_([^_]+)_/g, '$1<span class="plume">$2</span>');
    return s.replace(/\n/g, '<br>');
  };

  /**
   * Réduit la taille de police d'un élément jusqu'à ce qu'il tienne dans
   * hauteurMax px (jamais sous tailleMin). Filet de sécurité contre les titres
   * trop longs : mieux vaut un titre un peu plus petit qu'un titre coupé.
   */
  VL.ajuster = function (e, hauteurMax, tailleMin) {
    let taille = parseFloat(getComputedStyle(e).fontSize);
    tailleMin = tailleMin || 48;
    while (e.scrollHeight > hauteurMax && taille > tailleMin) {
      taille -= 2;
      e.style.fontSize = taille + 'px';
    }
    return taille;
  };

  const borne = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
  /** Courbes d'accélération. « rebond » dépasse un peu la cible (apparition vive). */
  VL.courbes = {
    lin: (p) => p,
    entree: (p) => p * p * p,
    sortie: (p) => 1 - Math.pow(1 - p, 3),
    douce: (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2),
    rebond: (p) => 1 + 2.4 * Math.pow(p - 1, 3) + 1.4 * Math.pow(p - 1, 2),
  };

  /* ----------------------------------------------------------------------
     Chrono : l'ensemble des pistes d'un film
     ---------------------------------------------------------------------- */
  const TRANSFORMS = ['x', 'y', 'scale', 'rotate', 'scaleX', 'scaleY'];

  class Chrono {
    constructor() {
      this.elements = new Map();   // élément → { props, classes, textes }
      this.fonctions = [];         // { t0, t1, f }
    }
    _fiche(e) {
      let f = this.elements.get(e);
      if (!f) { f = { props: {}, classes: {}, textes: null }; this.elements.set(e, f); }
      return f;
    }
    /**
     * Anime des propriétés de e entre t0 et t0 + duree.
     * props : { opacity: [0, 1], y: [40, 0], width: ['0%', '100%'] }
     *   x, y (px), scale, scaleX, scaleY, rotate (degrés) → regroupés en transform ;
     *   toute autre clé est une propriété CSS (nombre, ou nombre + unité).
     * Avant sa première animation, une propriété vaut sa valeur de départ.
     */
    anim(e, t0, duree, props, courbe) {
      const f = this._fiche(e);
      for (const [nom, [de, a]] of Object.entries(props)) {
        (f.props[nom] = f.props[nom] || []).push({ t0, duree: Math.max(duree, 1e-6), de, a, courbe: VL.courbes[courbe || 'sortie'] });
        f.props[nom].sort((u, v) => u.t0 - v.t0);
      }
    }
    /** À partir de t, la classe `nom` est posée (actif = true) ou retirée (false). */
    classe(e, t, nom, actif) {
      const f = this._fiche(e);
      (f.classes[nom] = f.classes[nom] || { depart: e.classList.contains(nom), pas: [] }).pas.push({ t, actif: actif !== false });
      f.classes[nom].pas.sort((u, v) => u.t - v.t);
    }
    /** À partir de t, le contenu de e devient `html`. */
    texte(e, t, html) {
      const f = this._fiche(e);
      if (!f.textes) f.textes = { depart: e.innerHTML, pas: [], courant: e.innerHTML };
      f.textes.pas.push({ t, html });
      f.textes.pas.sort((u, v) => u.t - v.t);
    }
    /** Appelle f(p, t) à chaque image ; p va de 0 (avant t0) à 1 (après t1). Pour le sur-mesure. */
    fonction(t0, t1, f) { this.fonctions.push({ t0, t1, f }); }

    poser(t) {
      for (const [e, f] of this.elements) {
        let transform = '';
        const tr = {};
        for (const [nom, segs] of Object.entries(f.props)) {
          let seg = segs[0];
          for (const s of segs) if (s.t0 <= t) seg = s;
          const p = seg.courbe(borne((t - seg.t0) / seg.duree));
          let v;
          if (typeof seg.de === 'number') v = seg.de + (seg.a - seg.de) * p;
          else {
            const a = parseFloat(seg.de), b = parseFloat(seg.a);
            v = a + (b - a) * p + String(seg.a).replace(/^[-\d.]+/, '');
          }
          if (TRANSFORMS.includes(nom)) tr[nom] = v;
          else if (nom === 'opacity') {
            e.style.opacity = v;
            e.style.visibility = v <= 0.001 ? 'hidden' : '';
          } else e.style[nom] = typeof v === 'number' ? v + 'px' : v;
        }
        if (tr.x != null || tr.y != null) transform += `translate(${tr.x || 0}px, ${tr.y || 0}px) `;
        if (tr.rotate != null) transform += `rotate(${tr.rotate}deg) `;
        if (tr.scale != null) transform += `scale(${tr.scale}) `;
        if (tr.scaleX != null || tr.scaleY != null) transform += `scale(${tr.scaleX == null ? 1 : tr.scaleX}, ${tr.scaleY == null ? 1 : tr.scaleY}) `;
        if (transform) e.style.transform = transform;
        for (const [nom, c] of Object.entries(f.classes)) {
          let actif = c.depart;
          for (const pas of c.pas) if (pas.t <= t) actif = pas.actif;
          e.classList.toggle(nom, actif);
        }
        if (f.textes) {
          let html = f.textes.depart;
          for (const pas of f.textes.pas) if (pas.t <= t) html = pas.html;
          if (html !== f.textes.courant) { e.innerHTML = html; f.textes.courant = html; }
        }
      }
      // Les fonctions passent après : elles peuvent mesurer la mise en page du jour.
      for (const { t0, t1, f } of this.fonctions) f(borne((t - t0) / Math.max(t1 - t0, 1e-6)), t);
    }
  }

  /* ----------------------------------------------------------------------
     Scène : une façade du chrono où les temps sont locaux au plan
     ---------------------------------------------------------------------- */
  class Scene {
    constructor(film, el, debut, nom) {
      this.film = film; this.el = el; this.debut = debut; this.nom = nom;
      this.duree = 3;          // le gabarit la fixe (s.duree = …)
      this.controles = [];     // instants (locaux) où le vérificateur regarde la scène
    }
    anim(e, t, duree, props, courbe) { this.film.chrono.anim(e, this.debut + t, duree, props, courbe); return this; }
    classe(e, t, nom, actif) { this.film.chrono.classe(e, this.debut + t, nom, actif); return this; }
    texte(e, t, html) { this.film.chrono.texte(e, this.debut + t, html); return this; }
    fonction(t0, t1, f) { this.film.chrono.fonction(this.debut + t0, this.debut + t1, (p, T) => f(p, T - this.debut)); return this; }

    /** Apparition : fondu + glissement (dy px vers le haut par défaut). */
    entre(e, t, o) {
      o = o || {};
      const d = o.duree || 0.5;
      const props = { opacity: [0, 1] };
      if (o.x) props.x = [o.x, 0]; else props.y = [o.y == null ? 50 : o.y, 0];
      return this.anim(e, t, d, props, o.courbe || 'sortie');
    }
    /** Apparition vive, avec un léger rebond (tampons, pastilles, bulles). */
    surgit(e, t, o) {
      o = o || {};
      this.anim(e, t, 0.12, { opacity: [0, 1] }, 'lin');
      return this.anim(e, t, o.duree || 0.45, { scale: [o.de || 0.5, 1], rotate: [(o.rotation || 0) - 8, o.rotation || 0] }, 'rebond');
    }
    /** Disparition en fondu. */
    sort(e, t, o) {
      o = o || {};
      return this.anim(e, t, o.duree || 0.3, { opacity: [1, 0] }, 'lin');
    }
    /** Frappe au clavier : le texte s'écrit caractère par caractère entre t et t + duree. */
    tape(e, t, duree, txt, prefixe) {
      const n = [...txt].length;
      for (let i = 1; i <= n; i++) this.texte(e, t + (duree * i) / n, (prefixe || '') + [...txt].slice(0, i).join(''));
      return this;
    }
    /** Fait apparaître les enfants .ligne d'un titre l'un après l'autre. Renvoie l'instant de fin. */
    lignes(e, t, pas) {
      const ls = [...e.querySelectorAll('.ligne')];
      if (!ls.length) { this.entre(e, t); return t + 0.5; }
      ls.forEach((l, i) => this.entre(l, t + i * (pas || 0.22), { y: 60, duree: 0.55 }));
      return t + (ls.length - 1) * (pas || 0.22) + 0.55;
    }
  }

  /* ----------------------------------------------------------------------
     Film : la suite des scènes
     ---------------------------------------------------------------------- */
  class Film {
    constructor(canevas, format) {
      this.canevas = canevas; this.format = format;   // 'reel' | 'post'
      this.chrono = new Chrono();
      this.scenes = [];
      this.duree = 0;
    }
    /**
     * Ajoute une scène à la suite.
     *   opts.nom         : nom court (sert aux images de contrôle)
     *   opts.fond        : 'ivoire' (défaut) | 'creme' | 'charbon' | 'rouge'
     *   opts.transition  : 'fondu' (défaut) | 'monte' | 'coupe'
     *   construire(s)    : reçoit la Scene ; y crée le DOM dans s.el, déclare
     *                      les animations et fixe s.duree (secondes).
     */
    scene(opts, construire) {
      const el = VL.el('div.scene.fond-' + (opts.fond || 'ivoire'), { parent: this.canevas });
      el.style.zIndex = this.scenes.length + 1;
      const s = new Scene(this, el, this.duree, opts.nom || 'scene' + (this.scenes.length + 1));
      construire(s);
      const tr = this.scenes.length ? opts.transition || 'fondu' : 'coupe';
      const D = 0.4;   // durée d'une transition
      if (tr === 'fondu') this.chrono.anim(el, s.debut, D, { opacity: [0, 1] }, 'lin');
      else if (tr === 'monte') this.chrono.anim(el, s.debut, 0.55, { y: [this.canevas.offsetHeight, 0] }, 'douce');
      s.fin = s.debut + s.duree;
      if (!s.controles.length) s.controles.push(s.duree * 0.5);
      s.controles.push(s.duree - 0.05);
      this.scenes.push(s);
      this.duree = s.fin;
      return s;
    }
    /** À appeler une fois toutes les scènes déclarées. */
    terminer() {
      const n = this.scenes.length;
      // Une scène n'est affichée que pendant son plan (+ le temps que la suivante la recouvre).
      this.chrono.fonction(0, this.duree, (p, t) => {
        this.scenes.forEach((s, i) => {
          const visible = t >= s.debut && (i === n - 1 || t < this.scenes[i + 1].debut + 0.6);
          s.el.style.display = visible ? '' : 'none';
        });
      });
    }
  }
  VL.Film = Film;

  /* ----------------------------------------------------------------------
     Démarrage : appelé par reel.html / post.html
     ---------------------------------------------------------------------- */

  /** Charge un script (les contenus et gabarits sont de simples fichiers .js). */
  VL.charger = (src) => new Promise((ok, ko) => {
    const s = document.createElement('script');
    s.src = src; s.onload = ok; s.onerror = () => ko(new Error('Fichier introuvable : ' + src));
    document.head.append(s);
  });

  /**
   * Construit le reel ou le post décrit par window.CONTENU, puis expose :
   *   VL.film            (durée, scènes)
   *   VL.poser(t)        (met le canevas dans l'état de l'instant t)
   *   VL.pret            (true quand tout est construit)
   */
  VL.demarrer = async function (format) {
    const q = new URLSearchParams(location.search);
    const nom = q.get('c');
    const dossier = format === 'reel' ? 'reels' : 'posts';
    await VL.charger(`../contenus/${dossier}/${nom}.js`);
    const contenu = window.CONTENU;
    if (!contenu || !contenu.gabarit) throw new Error(`contenus/${dossier}/${nom}.js doit définir window.CONTENU = { gabarit: '…', … }`);
    await VL.charger(`../gabarits/${dossier}/${contenu.gabarit}.js`);
    const gabarit = VL.gabarits[dossier][contenu.gabarit];
    if (!gabarit) throw new Error('Gabarit inconnu : ' + contenu.gabarit);

    // Les polices doivent être chargées AVANT de construire : les gabarits mesurent le texte.
    await Promise.all(['700 40px "Space Grotesk"', '500 40px "Space Grotesk"', '400 40px Inter', '700 40px Inter', 'italic 400 40px "EB Garamond"'].map((f) => document.fonts.load(f)));
    await document.fonts.ready;

    const canevas = document.getElementById('canevas');
    canevas.classList.add(format);
    const film = new Film(canevas, format);
    gabarit(contenu, film);
    film.terminer();

    if (q.get('zones')) VL.reperes(canevas, format);
    VL.film = film;
    VL.poser = (t) => film.chrono.poser(t);
    // Un post est figé sur l'état final de sa scène (ou sur contenu.figer, en secondes).
    VL.poser(format === 'post' ? (contenu.figer != null ? contenu.figer : 999) : (q.get('t') ? parseFloat(q.get('t')) : 0));
    VL.pret = true;
  };

  /** Dessine les zones interdites (contrôle visuel : ajouter ?zones=1 à l'adresse). */
  VL.reperes = function (canevas, format) {
    const z = VL.ZONES[format], W = canevas.offsetWidth, H = canevas.offsetHeight;
    const r = VL.el('div.reperes', { parent: canevas });
    const bloc = (x, y, w, h) => VL.el('div', { parent: r, style: { left: x + 'px', top: y + 'px', width: w + 'px', height: h + 'px' } });
    bloc(0, 0, W, z.y0); bloc(0, z.y1, W, H - z.y1);
    if (z.boutons) bloc(z.boutons.x0, z.boutons.y0, W - z.boutons.x0, z.y1 - z.boutons.y0);
  };

  /**
   * Vérificateur : liste les éléments marqués data-cle (contenu important)
   * qui sortent de la zone sûre ou dont le texte déborde, à l'instant courant.
   * Renvoie un tableau de messages (vide = tout va bien).
   */
  VL.verifier = function () {
    const z = VL.ZONES[VL.film.format], c = VL.film.canevas.getBoundingClientRect(), soucis = [];
    for (const e of VL.film.canevas.querySelectorAll('[data-cle]')) {
      const st = getComputedStyle(e);
      if (!e.offsetParent || st.visibility === 'hidden' || parseFloat(st.opacity) < 0.5) continue;
      let cache = false;
      for (let p = e; p && p !== VL.film.canevas; p = p.parentElement) {
        const s = getComputedStyle(p);
        if (s.display === 'none' || s.visibility === 'hidden' || parseFloat(s.opacity) < 0.5) cache = true;
      }
      if (cache) continue;
      const r = e.getBoundingClientRect();
      const x0 = r.left - c.left, x1 = r.right - c.left, y0 = r.top - c.top, y1 = r.bottom - c.top;
      const quoi = (e.dataset.cle || e.className) + ' « ' + e.textContent.trim().slice(0, 30) + ' »';
      if (x0 < z.x0 - 1 || x1 > z.x1 + 1 || y0 < z.y0 - 1 || y1 > z.y1 + 1)
        soucis.push(`hors zone sûre : ${quoi} [x ${Math.round(x0)}→${Math.round(x1)}, y ${Math.round(y0)}→${Math.round(y1)}]`);
      else if (z.boutons && x1 > z.boutons.x0 + 1 && y1 > z.boutons.y0 + 1 && e.dataset.cle !== 'large')
        soucis.push(`sous les boutons d'Instagram : ${quoi} [x→${Math.round(x1)}, y→${Math.round(y1)}]`);
      if (e.scrollWidth > e.clientWidth + 2 && st.overflow !== 'visible') soucis.push(`texte coupé : ${quoi}`);
    }
    return soucis;
  };
})();
