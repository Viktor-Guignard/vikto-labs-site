# VIKTO LABS — Site vitrine

Site vitrine statique (HTML / CSS / JavaScript vanilla) pour VIKTO LABS,
studio de création de sites vitrines et de menus numériques synchronisés
pour restaurants et commerces de bouche.

## Arborescence

```
vikto-labs-site/
├── index.html
├── contact.html
├── mentions-legales.html
├── politique-confidentialite.html
├── assets/
│   ├── css/style.css
│   ├── js/main.js
│   └── images/        (à compléter : logo, photos, favicon définitif)
└── README.md
```

## Prévisualiser le site localement

Aucune installation n'est nécessaire.

- **Option simple** : ouvrez directement `index.html` dans votre navigateur.
- **Option recommandée** (pour un rendu identique à la production) :
  lancez un petit serveur local depuis le dossier du projet, par exemple :

  ```bash
  cd vikto-labs-site
  python3 -m http.server 8000
  ```

  Puis ouvrez `http://localhost:8000` dans votre navigateur.

## Créer le dépôt GitHub

1. Créez un nouveau dépôt sur GitHub (public, pour un usage gratuit de GitHub Pages).
2. Depuis le dossier `vikto-labs-site/` :

   ```bash
   git init
   git add .
   git commit -m "Site vitrine VIKTO LABS"
   git branch -M main
   git remote add origin https://github.com/VOTRE_COMPTE/VOTRE_DEPOT.git
   git push -u origin main
   ```

## Activer GitHub Pages

1. Sur GitHub, ouvrez le dépôt puis **Settings → Pages**.
2. Dans **Source**, sélectionnez la branche `main` et le dossier `/ (root)`.
3. Enregistrez. Le site sera publié à l'adresse indiquée par GitHub
   (généralement `https://VOTRE_COMPTE.github.io/VOTRE_DEPOT/`).
4. Si vous utilisez un nom de domaine personnalisé, configurez-le dans
   cette même page et ajoutez un fichier `CNAME` à la racine du dépôt.

## Configurer le formulaire de contact

GitHub Pages ne dispose pas de back-end : le formulaire de `contact.html`
s'appuie donc sur un service tiers compatible avec les sites statiques.

Toute la configuration se trouve en haut du fichier
[`assets/js/main.js`](assets/js/main.js), dans l'objet `SITE_CONFIG` :

```js
const SITE_CONFIG = {
  FORM_PROVIDER: "web3forms",
  WEB3FORMS_ACCESS_KEY: "",            // <-- coller la clé ici
  FORM_ENDPOINT: "",
  CONTACT_EMAIL: "vikto.labs@gmail.com"
};
```

Le formulaire envoie les demandes **directement à `vikto.labs@gmail.com`**
via Web3Forms (aucun compte partagé avec un autre projet).

### Obtenir la clé Web3Forms (30 secondes)

1. Aller sur [web3forms.com](https://web3forms.com)
2. Saisir `vikto.labs@gmail.com` → la clé d'accès arrive par mail
3. Coller cette clé dans `WEB3FORMS_ACCESS_KEY` (fichier `assets/js/main.js`)

Cette clé est **publique par conception** (prévue pour tourner dans le
navigateur) : ce n'est pas un secret, elle peut rester dans le dépôt.

**Filet de sécurité :** tant que la clé n'est pas renseignée, le formulaire
n'échoue pas silencieusement — il ouvre le logiciel de messagerie du
visiteur avec sa demande déjà rédigée, adressée à `CONTACT_EMAIL`.
Aucune demande n'est perdue.

### Avec Formspree

1. Créez un compte sur [formspree.io](https://formspree.io).
2. Créez un formulaire et récupérez son identifiant (URL du type
   `https://formspree.io/f/xxxxxxx`).
3. Renseignez `FORM_ENDPOINT` avec cette URL et laissez
   `FORM_PROVIDER: "formspree"`.

### Avec Web3Forms

1. Créez un compte sur [web3forms.com](https://web3forms.com) et
   récupérez votre clé d'accès publique.
2. Renseignez `WEB3FORMS_ACCESS_KEY` avec cette clé et passez
   `FORM_PROVIDER` à `"web3forms"`.

Aucune clé secrète serveur n'est utilisée : seules les clés publiques
prévues pour un usage côté client apparaissent dans ce fichier.

## Éléments à remplacer avant publication

- **Logo** : remplacer le bloc `.logo-mark` (lettre « V ») par le logo
  définitif dans chaque en-tête et pied de page (`<img src="assets/images/logo.svg" alt="VIKTO LABS">`).
- **E-mail** : mettre à jour `CONTACT_EMAIL` dans `assets/js/main.js`.
- **Liens sociaux** : à ajouter dans le pied de page si nécessaire (aucun lien social n'est présent par défaut).
- **Identifiant du formulaire** : `FORM_ENDPOINT` ou `WEB3FORMS_ACCESS_KEY` dans `assets/js/main.js`.
- **Mentions légales** : compléter les champs marqués `<!-- TODO -->` dans `mentions-legales.html` (statut juridique, adresse, SIRET, directeur de publication).
- **Nom de domaine** : mettre à jour les balises `canonical` et `og:url` dans chaque page HTML.
- **Images** : ajouter les visuels réels (photos d'établissements, favicon définitif, image Open Graph) dans `assets/images/`.

## Qualité technique

- HTML sémantique, navigation au clavier, focus visibles, labels associés aux champs.
- Respect de `prefers-reduced-motion` pour les animations.
- Aucune dépendance externe hormis les polices Google Fonts (Space Grotesk, Inter).
- Compatible navigateurs modernes, responsive mobile-first.
