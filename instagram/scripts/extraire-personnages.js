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
const sortie = {};
for (const p of PERSOS) {
  const debut = svg.indexOf('<g class="cx-salut ' + p.v + '">');
  if (debut < 0) throw new Error('Personnage introuvable : ' + p.v);
  const ouverture = svg.indexOf('<g class="cx-ink"', debut);
  const contenuDebut = svg.indexOf('>', ouverture) + 1;
  const fin = svg.indexOf('</g></g></g></g>', contenuDebut);
  sortie[p.nom] = { vue: p.vue, encre: p.encre, svg: svg.slice(contenuDebut, fin).replace(/\s*\n\s*/g, '').replace(/ style="animation-delay:[^"]*"/g, '') };
}
const js = '/* FICHIER GÉNÉRÉ par scripts/extraire-personnages.js — ne pas modifier à la main.\n' +
  '   Bustes des personnages du film du site (chef, cliente, gérante, habitué). */\n' +
  'window.VL = window.VL || {};\nVL.PERSONNAGES = ' + JSON.stringify(sortie, null, 1) + ';\n';
fs.writeFileSync(path.join(racine, 'moteur', 'personnages.js'), js);
console.log('moteur/personnages.js écrit :', Object.keys(sortie).join(', '));
