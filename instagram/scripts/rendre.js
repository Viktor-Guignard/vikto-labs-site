#!/usr/bin/env node
/* ==========================================================================
   VIKTO LABS — Instagram · rendu des reels (MP4) et des posts (PNG)

   Usage (depuis le dossier instagram/) :
     node scripts/rendre.js reels                    tous les reels
     node scripts/rendre.js reels 01-rupture-11h45   un seul (ou plusieurs noms)
     node scripts/rendre.js posts                    tous les posts
     node scripts/rendre.js posts 03-codes-plats     un seul
     node scripts/rendre.js tout                     reels + posts
   Options :
     --controle   ne rend pas la vidéo : vérifie les zones sûres et produit
                  seulement la planche-contact (rapide, pour mettre au point)
     --zones      dessine les zones interdites d'Instagram sur les images

   Sorties dans instagram/out/ :
     reels/NOM.mp4            1080×1920, 30 i/s, H.264 yuv420p, piste audio muette
     reels/NOM.planche.jpg    planche-contact : début, chaque scène, fin
     reels/NOM.legende.txt    copie de la légende à coller dans Instagram
     posts/NOM.png            1080×1350
     posts/NOM.legende.txt

   Le rendu est exact et répétable : pour chaque image n, la page est mise
   dans l'état de l'instant n/30 (VL.poser), puis photographiée. Aucun minuteur,
   aucune animation CSS, aucune dépendance au temps réel.
   ========================================================================== */
const { chromium } = require('playwright');
const { spawn, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const RACINE = path.join(__dirname, '..');
const SORTIE = path.join(RACINE, 'out');
const IPS = 30;
const args = process.argv.slice(2);
const options = new Set(args.filter((a) => a.startsWith('--')));
const [quoi, ...noms] = args.filter((a) => !a.startsWith('--'));

function lister(dossier) {
  return fs.readdirSync(path.join(RACINE, 'contenus', dossier)).filter((f) => f.endsWith('.js')).map((f) => f.slice(0, -3)).sort();
}
function adresse(page, nom) {
  return 'file://' + path.join(RACINE, 'moteur', page + '.html') + '?c=' + encodeURIComponent(nom) + (options.has('--zones') ? '&zones=1' : '');
}
async function ouvrir(navigateur, format, nom) {
  const page = await navigateur.newPage({ viewport: { width: 1080, height: format === 'reel' ? 1920 : 1350 }, deviceScaleFactor: 1 });
  const erreurs = [];
  page.on('pageerror', (e) => erreurs.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') erreurs.push(m.text()); });
  await page.goto(adresse(format, nom));
  await page.waitForFunction('window.VL && (VL.pret || VL.erreur)', null, { timeout: 15000 }).catch(() => {});
  const etat = await page.evaluate('({ pret: !!(window.VL && VL.pret), erreur: window.VL && VL.erreur })');
  if (!etat.pret) throw new Error(`${nom} : ${etat.erreur || erreurs.join(' | ') || 'la page ne démarre pas'}`);
  return page;
}
function copierLegende(dossier, nom) {
  const src = path.join(RACINE, 'contenus', dossier, nom + '.legende.txt');
  if (fs.existsSync(src)) fs.copyFileSync(src, path.join(SORTIE, dossier, nom + '.legende.txt'));
  else console.log(`  ! ${nom} : pas de fichier ${nom}.legende.txt à côté du contenu`);
}

/* ---- Un reel ---- */
async function rendreReel(navigateur, nom) {
  const page = await ouvrir(navigateur, 'reel', nom);
  const film = await page.evaluate('({ duree: VL.film.duree, scenes: VL.film.scenes.map(s => ({ nom: s.nom, debut: s.debut, fin: s.fin, controles: s.controles.map(c => s.debut + c) })) })');
  const total = Math.round(film.duree * IPS);
  const journal = [`${nom} : ${film.duree.toFixed(1)} s, ${total} images, ${film.scenes.length} scènes (${film.scenes.map((s) => s.nom + ' ' + (s.fin - s.debut).toFixed(1) + ' s').join(', ')})`];
  if (film.duree < 12 || film.duree > 30) journal.push(`  ! durée hors de la fourchette 12–30 s`);

  // 1. Vérification des zones sûres aux instants de contrôle de chaque scène
  const instants = [0.1];
  for (const s of film.scenes) for (const c of s.controles) instants.push(Math.min(c, film.duree - 0.04));
  for (const t of instants) {
    const soucis = await page.evaluate(`VL.poser(${t}); VL.verifier()`);
    for (const m of soucis) journal.push(`  ! à ${t.toFixed(1)} s — ${m}`);
  }

  const dossier = path.join(SORTIE, 'reels');
  const mp4 = path.join(dossier, nom + '.mp4');
  const planche = path.join(dossier, nom + '.planche.jpg');
  const cdp = await page.context().newCDPSession(page);
  const photo = async () => Buffer.from((await cdp.send('Page.captureScreenshot', { format: 'png', optimizeForSpeed: true })).data, 'base64');

  if (!options.has('--controle')) {
    // 2. Rendu image par image, envoyé à ffmpeg par un tuyau
    const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error',
      '-f', 'image2pipe', '-framerate', String(IPS), '-c:v', 'png', '-i', '-',
      '-f', 'lavfi', '-i', 'anullsrc=channel_layout=stereo:sample_rate=48000',
      '-vf', 'scale=1080:1920:out_color_matrix=bt709:out_range=tv,format=yuv420p',
      '-c:v', 'libx264', '-preset', 'slow', '-crf', '15', '-profile:v', 'high', '-level', '4.2', '-r', String(IPS),
      '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709',
      '-c:a', 'aac', '-b:a', '128k', '-shortest', '-movflags', '+faststart', mp4], { stdio: ['pipe', 'inherit', 'inherit'] });
    const fini = new Promise((ok, ko) => ff.on('close', (code) => (code === 0 ? ok() : ko(new Error('ffmpeg a échoué pour ' + nom)))));
    for (let n = 0; n < total; n++) {
      await page.evaluate(`VL.poser(${n / IPS})`);
      const png = await photo();
      if (!ff.stdin.write(png)) await new Promise((r) => ff.stdin.once('drain', r));
    }
    ff.stdin.end();
    await fini;
  }

  // 3. Planche-contact : première image, instant de contrôle de chaque scène, dernière image
  const vues = [...new Set(instants.concat([film.duree - 0.04]).map((t) => Math.round(t * IPS)))].sort((a, b) => a - b);
  const tmp = fs.mkdtempSync(path.join(SORTIE, '.planche-'));
  if (options.has('--controle')) {
    for (let i = 0; i < vues.length; i++) { await page.evaluate(`VL.poser(${vues[i] / IPS})`); fs.writeFileSync(path.join(tmp, String(i).padStart(3, '0') + '.png'), await photo()); }
  } else {
    // les images viennent du MP4 lui-même : on contrôle ce qui sera publié
    const sel = vues.map((n) => `eq(n\\,${n})`).join('+');
    spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', mp4, '-vf', `select=${sel}`, '-vsync', '0', path.join(tmp, '%03d.png')]);
  }
  const colonnes = Math.min(vues.length, 6);
  spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', '1', '-i', path.join(tmp, '%03d.png'), '-vf', `scale=360:640,tile=${colonnes}x${Math.ceil(vues.length / colonnes)}:padding=8:margin=8:color=0x333333`, '-frames:v', '1', '-q:v', '3', planche]);
  if (options.has('--images')) { fs.rmSync(path.join(dossier, nom + '.images'), { recursive: true, force: true }); fs.renameSync(tmp, path.join(dossier, nom + '.images')); }
  else fs.rmSync(tmp, { recursive: true, force: true });
  await page.close();

  // 4. Contrôle technique du fichier
  if (!options.has('--controle')) {
    const p = spawnSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=codec_name,width,height,r_frame_rate,pix_fmt:format=duration', '-of', 'default=nw=1', mp4]).stdout.toString().trim().split('\n').join(', ');
    journal.push('  ' + p);
    if (!/codec_name=h264/.test(p) || !/width=1080/.test(p) || !/height=1920/.test(p) || !/r_frame_rate=30\/1/.test(p) || !/pix_fmt=yuv420p/.test(p)) journal.push('  ! format inattendu');
  }
  copierLegende('reels', nom);
  console.log(journal.join('\n'));
  return journal.some((l) => l.startsWith('  !'));
}

/* ---- Un post ---- */
async function rendrePost(navigateur, nom) {
  const page = await ouvrir(navigateur, 'post', nom);
  const soucis = await page.evaluate('VL.verifier()');
  await page.screenshot({ path: path.join(SORTIE, 'posts', nom + '.png'), type: 'png' });
  await page.close();
  copierLegende('posts', nom);
  console.log(`${nom} : post rendu` + soucis.map((m) => '\n  ! ' + m).join(''));
  return soucis.length > 0;
}

/* ---- Lancement, avec quelques rendus en parallèle ---- */
(async () => {
  if (!['reels', 'posts', 'tout'].includes(quoi)) { console.log('Usage : node scripts/rendre.js reels|posts|tout [noms…] [--controle] [--zones]'); process.exit(1); }
  fs.mkdirSync(path.join(SORTIE, 'reels'), { recursive: true });
  fs.mkdirSync(path.join(SORTIE, 'posts'), { recursive: true });
  const taches = [];
  if (quoi !== 'posts') for (const n of noms.length && quoi === 'reels' ? noms : lister('reels')) taches.push(['reel', n]);
  if (quoi !== 'reels') for (const n of noms.length && quoi === 'posts' ? noms : lister('posts')) taches.push(['post', n]);
  const navigateur = await chromium.launch();
  let alertes = 0, echecs = 0, i = 0;
  const ouvrier = async () => {
    while (i < taches.length) {
      const [format, nom] = taches[i++];
      try { if (await (format === 'reel' ? rendreReel : rendrePost)(navigateur, nom)) alertes++; }
      catch (e) { echecs++; console.log(`ÉCHEC ${nom} : ${e.message}`); }
    }
  };
  await Promise.all(Array.from({ length: options.has('--controle') ? 4 : 3 }, ouvrier));
  await navigateur.close();
  console.log(`\nTerminé : ${taches.length} rendu(s), ${alertes} avec alerte(s) « ! », ${echecs} échec(s). Sorties : ${SORTIE}`);
  process.exit(echecs ? 1 : 0);
})();
