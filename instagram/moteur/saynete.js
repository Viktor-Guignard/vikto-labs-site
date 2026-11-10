/* ==========================================================================
   VIKTO LABS — Instagram · la saynète
   Le visuel « perso » : un personnage du film du site, dans un petit décor
   dessiné (cuisine, salle, comptoir), avec sa bulle et quelques expressions
   (il cligne des yeux, parle, lève les sourcils, penche la tête).

   Dans un fichier de contenu :
     visuel: {
       type: 'perso',
       perso: 'chef',                  // 'chef' | 'cliente' | 'gerante' | 'habitue'
       bulle: 'Plus de burrata !',
       expression: 'surpris',          // 'surpris' | 'content' (défaut) | 'interroge'
       decor: 'cuisine',               // 'cuisine' | 'salle' | 'comptoir' | 'aucun' (simple médaillon)
                                       // par défaut : chef → cuisine, gérante → comptoir, autres → salle
       cote: 'gauche',                 // 'gauche' (défaut) | 'droite' : où se tient le personnage
       ardoise: ['Plat du jour', 'Blanquette'],   // décor « comptoir » : ce qui est écrit sur l'ardoise
       tampon: '…',                    // facultatif : tampon rouge posé dans le décor
       tailleBulle: 68,                // taille du texte de la bulle, en px
     }
   Les décors sont dessinés dans le style du film (aplats, contour charbon au
   premier plan seulement). Ils se recadrent seuls si la place manque.
   ========================================================================== */
(function () {
  'use strict';
  const VL = window.VL;
  const el = VL.el;
  const E = '#2A2324';   // encre
  let compteur = 0;

  // Où poser chaque buste : cx/base = point du dessin d'origine placé au bord du comptoir ; k = échelle.
  const CADRAGES = {
    chef: { cx: 690, base: 560, k: 1.16 },
    cliente: { cx: 412, base: 628, k: 2.25 },
    gerante: { cx: 250, base: 600, k: 1.3 },
    habitue: { cx: 850, base: 884, k: 1.62 },
  };
  const DECOR_PAR_DEFAUT = { chef: 'cuisine', cliente: 'salle', gerante: 'comptoir', habitue: 'salle' };
  const trait = (w) => `stroke="${E}" stroke-width="${w || 5}" stroke-linejoin="round" stroke-linecap="round"`;

  /* ---- Les décors : chacun renvoie { fond, devant } (SVG, repère 900×620, personnage à gauche) ---- */
  const DECORS = {
    cuisine(id) {
      const bon = (x, rouge, cls) => `<g class="sy-balance" data-phase="${x}" style="transform-origin:${x + 42}px 74px"><rect x="${x}" y="74" width="84" height="118" fill="#FFFFFF" ${trait(4)}/><path d="M${x + 14} 102h56M${x + 14} 124h56M${x + 14} 146h34" stroke="${rouge ? '#E52824' : '#98938F'}" stroke-width="7" stroke-linecap="round"/></g>`;
      return {
        fond: `<defs><pattern id="${id}c" width="90" height="50" patternUnits="userSpaceOnUse"><rect width="90" height="50" fill="#EEF0EC"/><path d="M0 1H90M1 0V25M46 25V50M0 26H90" stroke="#DCE0DB" stroke-width="2.5"/></pattern></defs>
          <rect width="900" height="620" fill="url(#${id}c)"/>
          <rect x="470" y="60" width="390" height="16" rx="8" fill="#AEB3B1" ${trait(4)}/>
          ${bon(500)}${bon(612, true)}${bon(724)}
          <rect x="494" y="336" width="372" height="16" fill="#B98A5E" ${trait(4)}/>
          <rect x="524" y="268" width="64" height="68" rx="8" fill="#F2D47A" ${trait(4)}/><rect x="518" y="254" width="76" height="18" rx="5" fill="#5C5854" ${trait(4)}/>
          <path d="M628 336v-58q0-10 9-14v-26h18v26q9 4 9 14v58z" fill="#DDE5DC" ${trait(4)}/>
          <circle cx="734" cy="304" r="27" fill="#E0523C" ${trait(4)}/><circle cx="786" cy="304" r="27" fill="#D8472F" ${trait(4)}/>
          <rect x="700" y="306" width="140" height="30" fill="#C68A62" ${trait(4)}/>`,
        devant: `<rect x="-10" y="505" width="920" height="130" fill="#C5CAC8"/><rect x="-10" y="505" width="920" height="22" fill="#E4E7E5"/><path d="M-10 505H910" ${trait(5)}/>
          <path class="sy-vapeur" data-phase="0" d="M664 392q-16-20 0-40t0-40" fill="none" stroke="#FFFFFF" stroke-width="9" stroke-linecap="round"/>
          <path class="sy-vapeur" data-phase="1.3" d="M722 396q-16-20 0-40t0-40" fill="none" stroke="#FFFFFF" stroke-width="9" stroke-linecap="round"/>
          <path d="M600 448h22M768 448h22" ${trait(9)}/>
          <rect x="620" y="424" width="150" height="88" rx="10" fill="#5C5854" ${trait(5)}/><rect x="606" y="410" width="178" height="20" rx="10" fill="#6F6A66" ${trait(5)}/><rect x="682" y="396" width="26" height="14" rx="5" fill="#2A2324"/>`,
      };
    },
    salle() {
      return {
        fond: `<rect width="900" height="620" fill="#F1EADF"/><rect y="400" width="900" height="220" fill="#E8DDCB"/><path d="M0 400H900" stroke="#D9CBB4" stroke-width="6"/>
          <rect x="530" y="66" width="310" height="262" rx="12" fill="#DDE5DC" stroke="#CBD3CA" stroke-width="12"/><circle cx="626" cy="226" r="68" fill="#C9DAC3"/><path d="M685 66V328M530 197H840" stroke="#CBD3CA" stroke-width="12"/>
          <g class="sy-lampe" style="transform-origin:462px 0px"><ellipse cx="462" cy="150" rx="110" ry="60" fill="#F2D47A" opacity=".32"/><path d="M462 0V66" ${trait(5)}/><path d="M416 128L434 66h56l18 62z" fill="#E52824" ${trait(5)}/></g>`,
        devant: `<rect x="-10" y="505" width="920" height="130" fill="#B98A5E"/><rect x="-10" y="505" width="920" height="20" fill="#CF9A74"/><path d="M-10 505H910" ${trait(5)}/>
          <path class="sy-vapeur" data-phase="0.4" d="M664 470q-12-16 0-32t0-32" fill="none" stroke="#FFFFFF" stroke-width="8" stroke-linecap="round"/>
          <ellipse cx="672" cy="524" rx="118" ry="24" fill="#FFFFFF" ${trait(5)}/><ellipse cx="672" cy="519" rx="72" ry="13" fill="#F1EADF"/><circle cx="650" cy="517" r="6" fill="#7C9A74"/><circle cx="688" cy="520" r="6" fill="#B98A5E"/>
          <path d="M816 424h54l-7 86h-40z" fill="#E9F0EC" ${trait(4)}/><path d="M820 462h46" stroke="#C9DAC3" stroke-width="5"/>`,
      };
    },
    comptoir(id, o, miroir) {
      const lignes = o.ardoise || ['Plat du jour'];
      const redresse = miroir ? ' transform="translate(1350 0) scale(-1 1)"' : '';   // le texte ne doit pas être inversé
      const bouteille = (x, c) => `<rect x="${x + 7}" y="372" width="12" height="20" fill="${c}" ${trait(3.5)}/><rect x="${x}" y="388" width="26" height="50" rx="6" fill="${c}" ${trait(3.5)}/>`;
      return {
        fond: `<rect width="900" height="620" fill="#3E5444"/><rect y="440" width="900" height="180" fill="#354A3C"/>
          <rect x="500" y="56" width="350" height="262" rx="10" fill="#2A2324" stroke="#B98A5E" stroke-width="14"/>
          <g${redresse} fill="#F8F9F4" text-anchor="middle" font-family="'EB Garamond', serif" font-style="italic">
            <text x="675" y="${lignes.length > 1 ? 136 : 170}" font-size="52">${lignes[0]}</text>
            ${lignes[1] ? `<text x="675" y="214" font-size="${lignes[1].length > 14 ? 42 : 56}">${lignes[1]}</text>` : ''}
          </g>
          <path d="M${lignes.length > 1 ? '580 258h190' : '560 216h230M600 256h150'}" stroke="#F8F9F4" stroke-width="6" stroke-linecap="round" opacity=".45"/>
          <rect x="520" y="438" width="340" height="14" fill="#B98A5E" ${trait(4)}/>
          ${bouteille(560, '#7C9A74')}${bouteille(612, '#C9A24D')}${bouteille(664, '#A4452C')}${bouteille(716, '#7C9A74')}${bouteille(768, '#DDE5DC')}`,
        devant: `<rect x="-10" y="505" width="920" height="130" fill="#D3D7D5"/><rect x="-10" y="505" width="920" height="22" fill="#EEF0EE"/><path d="M-10 505H910" ${trait(5)}/>
          <path class="sy-vapeur" data-phase="0.8" d="M474 452q-11-14 0-28t0-28" fill="none" stroke="#FFFFFF" stroke-width="7" stroke-linecap="round"/>
          <ellipse cx="474" cy="518" rx="62" ry="11" fill="#FFFFFF" ${trait(4)}/><path d="M512 482q24 0 24 14t-26 12" fill="none" ${trait(5)}/><path d="M436 472h76v18q0 24-24 24h-28q-24 0-24-24z" fill="#FFFFFF" ${trait(5)}/>`,
      };
    },
  };

  /**
   * Anime un personnage (yeux, sourcils, bouche, balancement) à partir du chrono.
   *   racine : l'élément qui contient le dessin      o.parle : instant où il prend la parole
   *   o.expression : 'surpris' | 'content' | 'interroge' | null (cligne seulement)
   *   o.k : échelle du dessin (pour que les amplitudes restent les mêmes à l'écran)
   */
  VL.animerPerso = function (s, racine, o) {
    o = o || {};
    const k = o.k || 1, expr = o.expression || null, parle = o.parle == null ? 1e9 : o.parle, sens = o.cote === 'droite' ? -1 : 1;
    const yeux = [...racine.querySelectorAll('.cx-eyes')], pupilles = [...racine.querySelectorAll('.cx-pup')];
    const sourcils = [...racine.querySelectorAll('.p-sourcil')], bouches = [...racine.querySelectorAll('.p-bouche')];
    const corps = racine.querySelector('.sy-corps');
    const phase = o.phase == null ? 0.9 : o.phase, mots = Math.min(1.5, 0.5 + (o.longueur || 12) * 0.035);
    s.fonction(0, 1, (p, t) => {
      const u = t - parle;                                   // temps écoulé depuis qu'il parle
      const cligne = ((t + phase + 10) % 2.7) < 0.12;
      const grand = expr === 'surpris' && u > 0 ? 1.14 : 1;
      for (const e of yeux) e.style.transform = `scaleY(${cligne ? 0.1 : grand})`;
      let ouverture = 1, largeur = 1;
      if (u > 0 && u < mots) ouverture = 1 + 0.6 * Math.abs(Math.sin(u * 13));
      else if (expr === 'surpris' && u >= mots) { ouverture = 1.3; largeur = 0.86; }
      for (const b of bouches) b.style.transform = `scale(${largeur}, ${ouverture})`;
      let leve = u > 0 ? VL.courbes.rebond(Math.min(1, u / 0.3)) : 0;
      if (expr === 'content' && u > 0.7) leve *= Math.max(0, 1 - (u - 0.7) / 0.3);
      const amplitude = { surpris: -6.5, interroge: -5, content: -3.5 }[expr] || 0;
      for (const b of sourcils) b.style.transform = `translateY(${(amplitude * leve / k * 1.4).toFixed(2)}px)`;
      const regard = u > 0 && u < 1.3 ? Math.min(1, u / 0.15) * (u > 1.1 ? (1.3 - u) / 0.2 : 1) : 0;   // un coup d'œil vers la bulle
      for (const e of pupilles) e.style.transform = `translate(${(sens * 1.6 * regard / k * 1.4).toFixed(2)}px, ${(-1.8 * regard / k * 1.4).toFixed(2)}px)`;
      if (corps) {
        const saut = u > 0 && u < 0.4 && expr !== 'interroge' ? -Math.sin(Math.PI * u / 0.4) * (expr === 'surpris' ? 16 : 9) : 0;
        const penche = expr === 'interroge' && u > 0 ? -sens * 3.5 * VL.courbes.sortie(Math.min(1, u / 0.4)) : 0;
        corps.style.transform = `translateY(${((Math.sin(t * 2.4) * 2 + saut) / k).toFixed(2)}px) rotate(${(Math.sin(t * 1.5) * 0.8 + penche).toFixed(2)}deg)`;
      }
    });
  };

  VL.visuels.perso = function (parent, s, o, t0) {
    const nom = o.perso || 'chef', p = VL.PERSONNAGES[nom];
    if (!p) throw new Error('Personnage inconnu : ' + nom + ' (chef, cliente, gerante, habitue)');
    const droite = o.cote === 'droite', decor = o.decor || DECOR_PAR_DEFAUT[nom];
    const bloc = el('div.saynete-bloc' + (droite ? '.droite' : ''), { parent });
    const bulle = el('div.bulle' + (droite ? '.droite' : ''), { parent: bloc, html: VL.riche(o.bulle), 'data-cle': 'large', style: { transformOrigin: droite ? '80% 130%' : '20% 130%' } });
    if (o.tailleBulle) bulle.style.fontSize = o.tailleBulle + 'px';
    VL.ajuster(bulle, o.hauteurBulle || 330, 46);
    let scene, k = 1;

    if (decor === 'aucun' || !DECORS[decor]) {
      // sans décor : le médaillon rond (comme sur le carton de fin)
      bulle.style.marginBottom = '70px';
      scene = VL.medaillon(bloc, nom, o.taille || 520);
      scene.style.alignSelf = droite ? 'flex-end' : 'flex-start';
      scene.firstChild.firstChild.classList.add('sy-corps');
      const trop = bloc.offsetHeight - (parent.clientHeight - 30);
      if (trop > 0) { const c = Math.max(260, scene.offsetWidth - trop); scene.style.width = c + 'px'; scene.style.height = c + 'px'; }
    } else {
      const id = 'sy' + (++compteur), c = CADRAGES[nom];
      k = c.k;
      const d = DECORS[decor](id, o, droite);
      const X = 250, Y = 512;
      const miroir = droite ? ' transform="translate(900 0) scale(-1 1)"' : '';
      // à droite, tout est retourné (décor et personnage) : il regarde alors vers l'intérieur de l'image
      const pose = droite
        ? `translate(${(900 - X + c.cx * k).toFixed(1)} ${(Y - c.base * k).toFixed(1)}) scale(${-k} ${k})`
        : `translate(${(X - c.cx * k).toFixed(1)} ${(Y - c.base * k).toFixed(1)}) scale(${k})`;
      scene = el('div.saynete', { parent: bloc, html:
        `<svg viewBox="0 0 900 620" preserveAspectRatio="xMidYMax slice"><g${miroir}>${d.fond}</g>` +
        `<g class="sy-perso" style="--ink:${(5.6 / k).toFixed(2)}px" transform="${pose}"><g class="sy-corps">${p.svg}</g></g>` +
        `<g${miroir}>${d.devant}</g></svg>` });
      // si la place manque (légende longue), le décor se recadre par le haut
      const trop = bloc.offsetHeight - (parent.clientHeight - 50);
      if (trop > 0) scene.style.height = Math.max(380, 600 - trop) + 'px';
      // la vie du décor : vapeur, lampe et bons de commande qui bougent doucement
      const vapeurs = [...scene.querySelectorAll('.sy-vapeur')], lampes = [...scene.querySelectorAll('.sy-lampe')], bons = [...scene.querySelectorAll('.sy-balance')];
      s.fonction(0, 1, (q, t) => {
        for (const v of vapeurs) { const f = ((t * 0.55 + parseFloat(v.dataset.phase)) % 1.6) / 1.6; v.style.transform = `translateY(${(-34 * f).toFixed(1)}px)`; v.style.opacity = (0.85 * Math.sin(Math.PI * f)).toFixed(3); }
        for (const l of lampes) l.style.transform = `rotate(${(Math.sin(t * 1.3) * 2.2).toFixed(2)}deg)`;
        for (const b of bons) b.style.transform = `rotate(${(Math.sin(t * 2 + parseFloat(b.dataset.phase)) * 2.5).toFixed(2)}deg)`;
      });
    }

    const parle = t0 + 0.5;
    s.anim(scene, t0, 0.55, { opacity: [0, 1], y: [70, 0] }, 'sortie');
    s.surgit(bulle, parle, { de: 0.3 });
    VL.animerPerso(s, scene, { parle, expression: o.expression || 'content', k, longueur: String(o.bulle || '').length });
    let t = t0 + 1.2;
    if (o.tampon) {
      const tp = el('div.tampon', { parent: scene, html: VL.riche(o.tampon), 'data-cle': 'large', style: { position: 'absolute', [droite ? 'left' : 'right']: '34px', bottom: '150px', zIndex: 5 } });
      s.surgit(tp, t + 0.3, { rotation: droite ? 6 : -6 }); t += 0.9;
    }
    return { el: bloc, fin: t };
  };
})();
