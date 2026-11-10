#!/usr/bin/env node
/* Contrôle du mouvement : tire d'un MP4 rendu une « bande » d'images régulièrement
   espacées, pour vérifier les transitions et le rythme (pas seulement les fins de scène).

   Usage (depuis instagram/) :
     node scripts/bande.js 01-rupture-11h45              toute la vidéo, une image toutes les 0,5 s
     node scripts/bande.js 01-rupture-11h45 8 16 0.25    de 8 s à 16 s, une image toutes les 0,25 s
   Sortie : out/reels/NOM.bande.jpg */
const { spawnSync } = require('child_process');
const path = require('path');
const [nom, debut = '0', fin = '999', pas = '0.5'] = process.argv.slice(2);
if (!nom) { console.log('Usage : node scripts/bande.js NOM [début fin pas]'); process.exit(1); }
const dossier = path.join(__dirname, '..', 'out', 'reels');
const mp4 = path.join(dossier, nom + '.mp4');
const duree = parseFloat(spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', mp4]).stdout.toString());
const a = parseFloat(debut), b = Math.min(parseFloat(fin), duree - 0.04), p = parseFloat(pas);
const n = Math.floor((b - a) / p) + 1, colonnes = Math.min(n, 10);
const sortie = path.join(dossier, nom + '.bande.jpg');
const r = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-ss', String(a), '-t', String(b - a + 0.04), '-i', mp4,
  '-vf', `fps=${1 / p},scale=216:384,tile=${colonnes}x${Math.ceil(n / colonnes)}:padding=4:margin=4:color=0x333333`, '-frames:v', '1', '-q:v', '3', sortie]);
if (r.status !== 0) { console.log(r.stderr.toString()); process.exit(1); }
console.log(`${sortie} : ${n} images de ${a} s à ${b.toFixed(1)} s, toutes les ${p} s`);
