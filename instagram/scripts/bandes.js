#!/usr/bin/env node
/* Produit la bande de contrôle du mouvement (voir bande.js) de TOUS les reels rendus.
   Usage (depuis instagram/) :  node scripts/bandes.js [pas en secondes, défaut 0.5] */
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const dossier = path.join(__dirname, '..', 'out', 'reels');
const pas = process.argv[2] || '0.5';
for (const f of fs.readdirSync(dossier).filter((x) => x.endsWith('.mp4')).sort()) {
  const r = spawnSync('node', [path.join(__dirname, 'bande.js'), f.slice(0, -4), '0', '999', pas]);
  process.stdout.write(r.stdout.toString() + r.stderr.toString());
}
