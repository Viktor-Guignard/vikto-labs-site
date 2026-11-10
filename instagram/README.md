# VIKTO LABS — Reels et posts Instagram, générés par le code

Ce dossier fabrique les reels (MP4 1080×1920) et les posts (PNG 1080×1350)
du compte Instagram de VIKTO LABS. Rien n'est monté à la main : chaque
publication est **un petit fichier de contenu** (les textes, les gestes à
montrer) qui remplit **un gabarit** (la mise en scène). Le rendu est exact et
répétable : même fichier, même vidéo, à l'image près.

Ce dossier vit sur la branche `instagram-gabarits` uniquement. Il n'est pas
publié sur le site (la branche `main` est le site en ligne : ne pas y toucher).

## Rendre

Depuis le dossier `instagram/` (Node, Playwright/Chromium et ffmpeg doivent être installés) :

```bash
node scripts/rendre.js tout                      # tous les reels et tous les posts
node scripts/rendre.js reels                     # tous les reels
node scripts/rendre.js reels 01-rupture-11h45    # un seul reel (ou plusieurs noms)
node scripts/rendre.js posts                     # tous les posts
node scripts/rendre.js posts 03-codes-plats      # un seul post

node scripts/rendre.js reels 01-rupture-11h45 --controle   # contrôle rapide, sans vidéo
node scripts/rendre.js reels --controle --zones            # idem, zones interdites dessinées en bleu
node scripts/rendre.js reels 01-rupture-11h45 --controle --images   # garde les images pleine taille
```

Les sorties vont dans `out/` (non versionné) :

| Fichier | Contenu |
|---|---|
| `out/reels/NOM.mp4` | le reel : 1080×1920, 30 i/s, H.264 yuv420p, piste audio muette |
| `out/reels/NOM.planche.jpg` | planche-contact : 1re image, chaque scène, dernière image |
| `out/reels/NOM.legende.txt` | la légende à coller dans Instagram |
| `out/posts/NOM.png` | le post, 1080×1350 |
| `out/posts/NOM.legende.txt` | sa légende |

Un reel de 20 s se rend en 2 à 3 minutes. La musique s'ajoute dans Instagram :
tout le sens passe par le texte à l'écran.

Pour voir un reel bouger sans le rendre, ouvrir dans un navigateur
`moteur/reel.html?c=01-rupture-11h45&lecture=1` (ou `&t=4.2` pour se placer à 4,2 s).

## Créer un nouveau reel ou un nouveau post

1. **Copier** le fichier de contenu qui ressemble le plus à ce que vous voulez
   (dans `contenus/reels/` ou `contenus/posts/`), avec son `.legende.txt`.
   Le nommer `NN-sujet-court.js` (minuscules, tirets, sans accents).
2. **Changer les textes et le visuel** dans `window.CONTENU = { … }`.
   Ne toucher ni au moteur ni aux gabarits.
3. **Contrôler** : `node scripts/rendre.js reels NN-sujet-court --controle --images`.
   - Lire le journal : toute ligne commençant par `!` est un problème
     (texte hors zone sûre, texte coupé, visuel trop haut, durée hors 12–30 s).
   - Regarder `out/reels/NN-sujet-court.planche.jpg` : fautes, retours à la
     ligne maladroits, chevauchements.
4. **Corriger** jusqu'à zéro `!`, puis rendre pour de bon (sans `--controle`)
   et regarder la planche tirée du MP4.
5. **Écrire la légende** dans `NN-sujet-court.legende.txt` (voir les règles plus bas).

### Les trois gabarits de reels (`gabarits/reels/`)

| Gabarit | Déroulé | Exemples |
|---|---|---|
| `probleme-solution` | accroche → problème → solution → résultat → (plus) → fin | 01, 03, 06 |
| `demonstration` | titre → étape 1 → étape 2… → fin | 02, 05, 07 |
| `question-reponse` | question (bulle d'un personnage) → réponse en un mot géant → preuves → fin | 04, 08, 09 |

Chaque partie est un **plan**, toujours décrit de la même façon
(détail complet en tête de `moteur/plans.js`) :

```js
{
  surTitre: 'La solution',                 // petite ligne rouge en capitales
  titre: 'Un geste,\ndepuis votre téléphone.',   // \n = nouvelle ligne ; *rouge* ; _italique_
  sousTitre: 'Une phrase de précision.',   // facultatif
  visuel: { type: 'editeur', … },          // facultatif : voir la liste ci-dessous
  tampon: 'Trouvée, masquée !',            // facultatif : tampon rouge posé à la fin
  tenue: 1.2,                              // secondes de pause après la dernière animation
}
```

La durée de chaque plan est calculée toute seule (fin des animations + `tenue`,
jamais moins que le temps de lecture du texte). Pour raccourcir un reel :
baisser `tenue`, retirer une action ou un plan.

### Les six gabarits de posts (`gabarits/posts/`)

| Gabarit | Usage | Exemples |
|---|---|---|
| `feature` | une fonctionnalité : titre + visuel du produit | 01, 02, 03 |
| `avant-apres` | deux blocs comparés | 04 |
| `le-saviez-vous` | une affirmation en très grand (avec ou sans visuel) | 05, 06 |
| `question` | question fréquente : bulle, Oui/Non géant, deux phrases | 07, 08 |
| `offre` | nom de la formule, prix, ce qu'elle comprend | 09 |
| `principe` | une phrase de principe en EB Garamond italique | 10 |

Les champs attendus sont écrits en tête de chaque fichier de gabarit.

### Les visuels (`moteur/visuels.js`)

Un visuel est la partie « image » d'un plan. Mêmes visuels pour les reels
(animés) et les posts (figés sur leur état final, ou sur `figer: 3.2`).

| `type` | Ce qu'on voit | Options principales |
|---|---|---|
| `editeur` | l'espace de gestion sur téléphone | `plats`, `recherche: false`, `actions` : `chercher`, `masquer`, `afficher`, `prix`, `nom`, `enregistrer`, `pause` |
| `carte` | la carte vue par le client | `plats`, `langue`, `masques`, `prix`, `neufs`, `actions` : `langue`, `pointer`, `retirer`, `prix`, `pause` |
| `qr` | le QR code qui ne bouge pas pendant que la carte change | `evenements`, `tampon` |
| `partout` | une modification → le site et le QR code | `plat`, `apres` |
| `pdf` | une carte en PDF, illisible sans zoomer | `tampon` |
| `codes` | le client lit dans sa langue, montre un code, vous comprenez | `plat`, `langue` |
| `liste` | des lignes à coche | `items`, `pas` |
| `perso` | un personnage du film du site et sa bulle | `perso` (`chef`, `cliente`, `gerante`, `habitue`), `bulle`, `cote` |

Toutes les options sont décrites au-dessus de chaque fonction dans `moteur/visuels.js`.
Les plats viennent de la carte fictive `contenus/commun/petit-bistrot.js`
(identifiants : `burrata`, `tartare`, `risotto`, `bavette`, `tarte`, `cafe`).
Un téléphone ne montre que **3 lignes** dans la zone sûre (1 de moins avec la
recherche) : mettre en premier les plats qui comptent.

## Règles de contenu (à respecter à chaque publication)

- Français, vouvoiement, adressé à des restaurateurs. Court, concret, sans emphase.
- **Rien d'inventé** : pas de chiffres, pas de témoignages, pas de noms de clients.
  Seul établissement montré : le fictif « Le Petit Bistrot ».
- **Aucun vrai client**, ni nommé ni montré. Les écrans sont des recréations
  stylisées, jamais des captures de données réelles.
- Ne pas parler d'impression ni de supports imprimés.
- **Prix** : uniquement ceux du site, et seulement quand c'est naturel —
  54 € HT/mois (site vitrine offert, engagement 12 mois), mise en place des
  cartes 150 € HT une fois, site vitrine seul 500 € HT. Vérifier `index.html`
  avant de publier un prix.
- Ce que le produit fait vraiment (et qu'on peut montrer) : une carte modifiée
  une fois, à jour partout (site + QR code) ; le QR code ne change jamais ;
  modification depuis le téléphone pendant le service (œil = masquer un plat
  épuisé) ; carte affichée en français, anglais, espagnol, russe, traduite
  automatiquement ; codes de plats (lettre + numéro, ex. P3) affichés dans les
  langues étrangères pour que le serveur comprenne ; le gérant modifie lui-même
  plats et prix.
- Légende : 2 à 4 phrases, un renvoi vers vikto-labs.fr, 8 à 10 mots-dièse.

## Règles de mise en page

- **Zone sûre d'un reel** : x de 90 à 990, y de 250 à 1500. Au-dessus, le bandeau
  d'Instagram ; en dessous, la légende ; à droite sous y = 1150, les boutons.
  Le bas des téléphones dépasse exprès : rien d'important n'y figure.
- **Lisibilité** : 1080 px de canevas ≈ la largeur d'un téléphone. Pas de texte
  porteur de sens sous 40 px ; titres de 84 à 136 px.
- Un titre trop long rétrécit tout seul, mais mieux vaut le raccourcir :
  2 lignes, 25 caractères par ligne au plus.
- Couleurs : ivoire `#F8F9F4`, charbon `#1F1B1C`, rouge `#E52824`. Polices
  locales du site (`assets/fonts`) : Space Grotesk (titres), Inter (texte),
  EB Garamond italique (accents). Aucune police ni ressource réseau.
- **Jamais de transition ou d'animation CSS** : tout mouvement se déclare dans
  le chrono (`s.anim`, `s.entre`, `s.surgit`…), sinon le rendu n'est plus exact.

## Organisation des fichiers

```
instagram/
├── README.md
├── contenus/                  ← CE QU'ON MODIFIE : un fichier par publication
│   ├── commun/petit-bistrot.js    la carte fictive (plats, prix, 4 langues, codes)
│   ├── reels/NN-nom.js            le contenu d'un reel
│   ├── reels/NN-nom.legende.txt   sa légende Instagram
│   ├── posts/NN-nom.js
│   └── posts/NN-nom.legende.txt
├── gabarits/                  ← les mises en scène (une par type de publication)
│   ├── reels/   probleme-solution.js · demonstration.js · question-reponse.js
│   └── posts/   feature.js · avant-apres.js · le-saviez-vous.js · question.js · offre.js · principe.js
├── moteur/                    ← le socle commun (à ne modifier qu'en connaissance de cause)
│   ├── moteur.js          horloge virtuelle, scènes, vérificateur de zones
│   ├── composants.js      icônes, QR code, téléphone, médaillons, doigt, carton de fin
│   ├── visuels.js         les 8 visuels (editeur, carte, qr, partout, pdf, codes, liste, perso)
│   ├── plans.js           le plan standard des reels (légende + visuel + tampon)
│   ├── personnages.js     GÉNÉRÉ : bustes des personnages du film du site
│   ├── base.css           couleurs, polices, tous les composants
│   ├── posts.css          styles propres aux posts
│   ├── reel.html          page hôte 1080×1920  (?c=nom)
│   └── post.html          page hôte 1080×1350  (?c=nom)
├── scripts/
│   ├── rendre.js                  rendu + contrôles + planches
│   └── extraire-personnages.js    régénère moteur/personnages.js depuis assets/film/en-situation.svg
└── out/                       ← rendus (ignorés par git)
```

## Comment ça marche (pour qui modifie le moteur)

- Un gabarit **déclare** des animations sur un chrono : « cet élément passe de
  l'opacité 0 à 1 entre 0,4 s et 0,9 s ». Rien ne s'exécute dans le temps réel.
- Pour chaque image n, `rendre.js` appelle `VL.poser(n / 30)` : toute la page
  est recalculée pour cet instant, puis photographiée et envoyée à ffmpeg.
- Dans une scène, les temps sont locaux (0 = début du plan). Outils d'une scène `s` :
  `s.anim(el, t, durée, { opacity: [0, 1], y: [40, 0] })`, `s.entre`, `s.surgit`,
  `s.sort`, `s.classe(el, t, 'nom')`, `s.texte(el, t, html)`, `s.tape` (frappe
  au clavier), `s.fonction` (sur-mesure). Voir `moteur/moteur.js`.
- La première scène d'un reel démarre 1,1 s « avant zéro » : la première image
  (la couverture par défaut) n'est jamais vide.
- Tout élément important porte l'attribut `data-cle` : le vérificateur signale
  ceux qui sortent de la zone sûre.
