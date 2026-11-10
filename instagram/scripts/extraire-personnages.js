#!/usr/bin/env node
/* Extrait les quatre bustes du carton de fin du film du site
   (assets/film/en-situation.svg) vers moteur/personnages.js.
   À relancer seulement si le film change :  node scripts/extraire-personnages.js */
const fs = require('fs');
const path = require('path');
const racine = path.join(__dirname, '..');
const svg = fs.readFileSync(path.join(racine, '..', 'assets', 'film', 'en-situation.svg'), 'utf8');

// nom → cadrage carré (viewBox) et épaisseur du contour, dans les unités du dessin d'origine
const PERSOS = [
  { nom: 'chef', v: 'v1', vue: '525 172 340 340', encre: 4.6 },
  { nom: 'cliente', v: 'v2', vue: '318 418 190 190', encre: 2.8 },
  { nom: 'gerante', v: 'v3', vue: '88 256 310 310', encre: 4.4 },
  { nom: 'habitue', v: 'v4', vue: '700 622 300 300', encre: 4.4 },
];
const SOURCILS = ['M690 330q13-11 28-4M722 326q13-7 26 2', 'M419 479q8-7 17-3M442 477q6-4 12 0', 'M266 368q16-11 34-4M304 365q10-7 22 0'];
const BOUCHES = ['M726 416q18 20 36 0z', 'M433 522q11 13 22 0z', 'M290 446q16 20 34 0z', 'M818 792q32 30 64 0z'];
const sortie = {};
for (const p of PERSOS) {
  const debut = svg.indexOf('<g class="cx-salut ' + p.v + '">');
  if (debut < 0) throw new Error('Personnage introuvable : ' + p.v);
  const ouverture = svg.indexOf('<g class="cx-ink"', debut);
  const contenuDebut = svg.indexOf('>', ouverture) + 1;
  const fin = svg.indexOf('</g></g></g></g>', contenuDebut);
  let dessin = svg.slice(contenuDebut, fin).replace(/\s*\n\s*/g, '').replace(/ style="animation-delay:[^"]*"/g, '');
  // Repères pour les expressions (saynete.js) : sourcils et bouche reçoivent une classe.
  for (const d of SOURCILS) dessin = dessin.replace('<path d="' + d + '"', '<path class="p-sourcil" d="' + d + '"');
  for (const d of BOUCHES) {
    const i = dessin.indexOf('<path d="' + d + '"');
    if (i >= 0) { const j = dessin.indexOf('>', i); dessin = dessin.slice(0, i) + dessin.slice(i, j).replace('class="cx-noink"', 'class="cx-noink p-bouche"') + dessin.slice(j); }
  }
  if (!dessin.includes('p-bouche')) throw new Error('Bouche introuvable pour ' + p.nom + ' : le film a changé, mettre à jour BOUCHES');
  sortie[p.nom] = { vue: p.vue, encre: p.encre, svg: dessin };
}
const js = '/* FICHIER GÉNÉRÉ par scripts/extraire-personnages.js — ne pas modifier à la main.\n' +
  '   Bustes des personnages du film du site (chef, cliente, gérante, habitué). */\n' +
  'window.VL = window.VL || {};\nVL.PERSONNAGES = ' + JSON.stringify(sortie, null, 1) + ';\n';
fs.writeFileSync(path.join(racine, 'moteur', 'personnages.js'), js);
console.log('moteur/personnages.js écrit :', Object.keys(sortie).join(', '));
