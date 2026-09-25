/* ==========================================================================
   VIKTO LABS — Script principal (vanilla JS, sans dépendance)
   ========================================================================== */

/* ---------------------------------------------------------------
   CONFIGURATION DU FORMULAIRE DE CONTACT
   À REMPLACER avant mise en ligne :
   - FORM_ENDPOINT : URL Formspree (https://formspree.io/f/VOTRE_ID)
     ou endpoint Web3Forms (https://api.web3forms.com/submit)
   - FORM_PROVIDER : "formspree" ou "web3forms"
   - WEB3FORMS_ACCESS_KEY : clé publique Web3Forms (si provider = web3forms)
   - CONTACT_EMAIL : e-mail de destination affiché sur le site (contact.html)
   Ne jamais placer de clé secrète serveur ici : seules les clés
   publiques Formspree/Web3Forms, prévues pour un usage côté client,
   doivent apparaître dans ce fichier.
--------------------------------------------------------------- */
const SITE_CONFIG = {
  FORM_PROVIDER: "web3forms", // "web3forms" | "formspree"

  // Clé publique Web3Forms du formulaire « VIKTO LABS ».
  // Publique par conception (elle tourne dans le navigateur) : ce n'est pas un secret.
  // Le destinataire des mails se règle sur app.web3forms.com, pas ici.
  WEB3FORMS_ACCESS_KEY: "beb79406-6199-4a86-98af-4ef85f3d2661",

  // Utilisé seulement si FORM_PROVIDER repasse à "formspree"
  FORM_ENDPOINT: "",

  CONTACT_EMAIL: "vikto.labs@gmail.com", // destination des demandes + adresse affichée

  // Liens de paiement Stripe — compte de production VIKTO LABS, TVA 20 % ajoutée
  // par Stripe Tax. Ce sont des URLs publiques (faites pour être partagées/cliquées),
  // aucun souci à les laisser dans ce fichier.
  STRIPE_LINK_SITE: "https://buy.stripe.com/cNi3cogoX84F3c790n4ZG01", // Site vitrine — 500 € HT, paiement unique
  STRIPE_LINK_SUBSCRIPTION: "https://buy.stripe.com/9B65kw5KjacN7sn6Sf4ZG02" // Menu Synchro — 54 € HT/mois, abonnement
};

// Branche les boutons de tarifs sur les liens de paiement Stripe.
// L'attribut data-stripe-link vaut "site" (500 €) ou "subscription" (54 €/mois).
function injectStripeLinks() {
  const map = {
    site: SITE_CONFIG.STRIPE_LINK_SITE,
    subscription: SITE_CONFIG.STRIPE_LINK_SUBSCRIPTION
  };
  document.querySelectorAll("[data-stripe-link]").forEach((el) => {
    const url = map[el.getAttribute("data-stripe-link")];
    if (url) {
      el.href = url;
      el.target = "_blank";
      el.rel = "noopener";
    }
  });
}

// Le formulaire est-il configuré ? (sinon on bascule sur un envoi par mail)
function isFormConfigured() {
  if (SITE_CONFIG.FORM_PROVIDER === "web3forms") {
    return SITE_CONFIG.WEB3FORMS_ACCESS_KEY.trim().length > 10;
  }
  return /^https:\/\/formspree\.io\/f\/\w+/.test(SITE_CONFIG.FORM_ENDPOINT);
}

// Un rechargement de page doit toujours ramener en haut (le client voit
// clairement que la page s'est rechargée). On désactive la restauration
// automatique du scroll par le navigateur ; les liens d'ancre cliqués
// (#tarifs, #demonstration…) continuent de fonctionner normalement.
if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}
(function resetScrollOnReload() {
  let navType = "navigate";
  const nav = performance.getEntriesByType && performance.getEntriesByType("navigation");
  if (nav && nav.length) navType = nav[0].type;
  if (navType === "reload") {
    // on retire l'ancre éventuelle et on remonte en haut
    if (location.hash) history.replaceState(null, "", location.pathname + location.search);
    window.scrollTo(0, 0);
  }
})();

document.addEventListener("DOMContentLoaded", () => {
  initNav();
  initHeaderState();
  initFaq();
  initReveal();
  initSyncScenes();
  initDemoVideo();
  initLiveDemos();
  initContactForm();
  injectContactEmail();
  injectStripeLinks();
  initHelpCenter();
  initPremiumFX();
  initStoryScene();
  initContextVideo();
});

/* ==========================================================================
   CENTRE D'AIDE — navigation par catégories, 100% local.
   Pas de champ de saisie libre : le visiteur choisit sa question dans une
   liste, donc la réponse est toujours exacte (aucun risque de « réponse à
   côté », contrairement à un chatbot qui devine l'intention).
   ========================================================================== */
const HELP_CENTER = [
  {
    id: "tarifs",
    icon: "01",
    title: "Tarifs & formules",
    teaser: "Prix, abonnement, engagement",
    questions: [
      {
        q: "Quels sont vos tarifs ?",
        a: "Deux formules&nbsp;:<br><br><strong>Site vitrine</strong> — 500&nbsp;€ HT en paiement unique (600&nbsp;€ TTC).<br><br><strong>Site + menu synchronisé</strong> — 54&nbsp;€ HT/mois soit 64,80&nbsp;€ TTC, site vitrine offert, avec un engagement initial de 12 mois. La reprise de vos cartes existantes est facturée 150&nbsp;€ HT, une seule fois."
      },
      {
        q: "Que comprend l'abonnement à 54 € HT/mois ?",
        a: "La création du site vitrine, toutes vos cartes — menu, vins, desserts, version anglaise — modifiables sans limite, l'espace de gestion, la synchronisation site&nbsp;↔&nbsp;QR code, le QR code lui-même, l'hébergement et les mises à jour techniques."
      },
      {
        q: "Y a-t-il des frais de création ?",
        a: "La création du site vitrine est offerte. Seule la reprise de vos cartes existantes est facturée&nbsp;: 150&nbsp;€ HT, une seule fois à la mise en place, jusqu'à 200 articles. Vous les modifiez ensuite vous-même, sans frais."
      },
      {
        q: "Puis-je prendre seulement le site vitrine ?",
        a: "Oui. La formule Site vitrine seul, à 500&nbsp;€ HT en paiement unique (600&nbsp;€ TTC), est disponible sans abonnement ni menu numérique."
      },
      {
        q: "Quelle est la durée d'engagement ?",
        a: "L'abonnement démarre avec un engagement initial de 12 mois. Passé ce délai, il se poursuit sans nouvel engagement. Les modalités précises de résiliation sont détaillées dans le contrat."
      },
      {
        q: "Vos prix sont-ils HT ou TTC ?",
        a: "Nos prix sont affichés <strong>hors taxes</strong>, TVA de 20&nbsp;% en sus&nbsp;:<br><br>• Site vitrine&nbsp;: 500&nbsp;€ HT → <strong>600&nbsp;€ TTC</strong><br>• Abonnement&nbsp;: 54&nbsp;€ HT → <strong>64,80&nbsp;€ TTC</strong>/mois<br>• Reprise des cartes&nbsp;: 150&nbsp;€ HT → <strong>180&nbsp;€ TTC</strong>, une fois<br><br>Une facture conforme est fournie à chaque paiement."
      },
      {
        q: "Puis-je passer du site seul à la formule complète ?",
        a: "Oui. Vous pouvez commencer par le site vitrine seul et basculer plus tard vers la formule avec menu synchronisé. Parlons-en quand vous le souhaitez."
      },
      {
        q: "Y a-t-il une période d'essai ?",
        a: 'Le premier échange et la proposition sont gratuits et sans engagement, et la démo de cette page vous montre concrètement le produit. Pour les conditions propres à votre situation, écrivez-nous via la <a href="contact.html">page contact</a>.'
      }
    ]
  },

  {
    id: "menu",
    icon: "02",
    title: "Le menu numérique",
    teaser: "Modifications, QR code, synchro",
    questions: [
      {
        q: "Puis-je modifier mon menu moi-même ?",
        a: "Oui. Vous accédez à un espace de gestion pensé pour être simple et intuitif&nbsp;: vous modifiez plats, descriptions, prix et catégories sans aucune compétence technique."
      },
      {
        q: "Le menu se met-il à jour automatiquement ?",
        a: "Oui. Chaque modification enregistrée dans votre espace de gestion est automatiquement répercutée sur votre site <em>et</em> sur le menu accessible par QR code. Une seule saisie, partout à jour."
      },
      {
        q: "Le QR code change-t-il quand je modifie la carte ?",
        a: "Non, jamais. Le QR code reste identique&nbsp;: il pointe vers votre menu numérique, dont seul le contenu évolue. Vos supports imprimés restent donc valables."
      },
      {
        q: "Mon plat du jour change quotidiennement, c'est gérable ?",
        a: "C'est le cas d'usage idéal&nbsp;: vous modifiez votre plat du jour en quelques secondes depuis votre téléphone, et c'est à jour partout, tous les jours."
      },
      {
        q: "Puis-je indiquer les allergènes et les plats végétariens ?",
        a: "Oui. Chaque plat peut porter une description et des pictogrammes (végétarien, spécialité maison, allergènes…)&nbsp;: vous les gérez vous-même depuis l'espace de gestion."
      },
      {
        q: "Puis-je masquer un plat indisponible ?",
        a: "Oui, en un clic. Un produit épuisé peut être masqué immédiatement, puis réaffiché quand il revient — plus de client qui commande un plat que vous n'avez plus."
      },
      {
        q: "Peut-on avoir la carte en plusieurs langues ?",
        a: "C'est possible, notamment pour les établissements touristiques. Précisez-nous les langues souhaitées lors de notre échange."
      },
      {
        q: "Puis-je imprimer ma carte sur papier ?",
        a: "Oui&nbsp;: le menu numérique s'exporte en PDF prêt à imprimer pour vos cartes papier. Même contenu, zéro double saisie."
      },
      {
        q: "Mes clients doivent-ils télécharger une application ?",
        a: "Non. Le menu s'ouvre instantanément dans le navigateur du téléphone via le QR code&nbsp;: rien à installer, rien à créer comme compte."
      }
    ]
  },

  {
    id: "site",
    icon: "03",
    title: "Le site vitrine",
    teaser: "Contenu, réservation, visibilité",
    questions: [
      {
        q: "Que contient le site vitrine ?",
        a: "La présentation de votre établissement, vos horaires et coordonnées, une galerie photos, votre localisation, l'intégration de votre menu et les liens utiles (réservation, livraison). Le tout adapté aux téléphones."
      },
      {
        q: "J'ai déjà un site, pouvez-vous le refaire ?",
        a: "Bien sûr. Beaucoup d'établissements ont un site vieillissant&nbsp;: nous repartons sur une base propre, moderne et adaptée au mobile, en récupérant vos contenus existants."
      },
      {
        q: "Peut-on réserver une table depuis le site ?",
        a: "Le site peut intégrer vos liens de réservation et de livraison existants (TheFork, Uber Eats, Deliveroo, votre propre système…). Vos clients y accèdent en un clic."
      },
      {
        q: "Mes horaires et fermetures sont-ils modifiables ?",
        a: "Oui. Horaires, coordonnées et fermetures exceptionnelles (congés, jours fériés) se modifient depuis votre espace, sans nous solliciter."
      },
      {
        q: "Le site apparaîtra-t-il sur Google ?",
        a: "Le site est conçu pour être correctement lu par les moteurs de recherche (structure, contenus, rapidité). Le référencement dépend ensuite de votre activité et de la concurrence locale&nbsp;; nous mettons toutes les bases techniques en place."
      },
      {
        q: "Peut-on lier mes réseaux sociaux et mes avis Google ?",
        a: "Oui. Le site peut afficher vos liens Instagram et Facebook, ainsi qu'un lien vers votre fiche Google pour encourager les avis clients."
      },
      {
        q: "Puis-je vendre en ligne depuis le site ?",
        a: 'Le site vitrine n\'est pas une boutique en ligne, mais il peut pointer vers vos solutions de commande et de livraison existantes. Pour un besoin e-commerce complet, parlons-en via la <a href="contact.html">page contact</a>.'
      },
      {
        q: "J'ai plusieurs établissements, comment ça marche ?",
        a: 'Chaque établissement a son propre site et sa propre carte. Pour plusieurs adresses, décrivez-nous votre organisation via la <a href="contact.html">page contact</a> et nous adapterons la proposition.'
      }
    ]
  },

  {
    id: "demarrage",
    icon: "04",
    title: "Mise en route",
    teaser: "Étapes, délais, contenus, contrat",
    questions: [
      {
        q: "Comment ça commence, concrètement ?",
        a: 'Vous nous décrivez votre établissement via la <a href="contact.html">page contact</a>. Nous échangeons sur vos besoins, puis nous vous proposons la formule adaptée. Ensuite&nbsp;: récupération de vos contenus, conception, validation avec vous, mise en ligne.'
      },
      {
        q: "Combien de temps pour être en ligne ?",
        a: "Le délai dépend surtout de la disponibilité de vos contenus (textes, photos, carte) et du nombre d'allers-retours de validation. Nous vous communiquons une estimation dès notre premier échange."
      },
      {
        q: "Dois-je fournir les textes et les photos ?",
        a: "Idéalement oui, pour que le site reflète fidèlement votre établissement. Mais nous vous accompagnons si certains éléments manquent."
      },
      {
        q: "Je n'ai ni photos ni textes prêts, c'est bloquant ?",
        a: "Pas du tout. Nous partons de ce que vous avez et vous guidons sur ce qui manque. Beaucoup d'établissements démarrent avec quelques photos prises au téléphone — et le résultat tient très bien la route."
      },
      {
        q: "Y a-t-il un contrat à signer ?",
        a: "Oui. La prestation est encadrée par un contrat clair reprenant le périmètre, le tarif et les conditions (dont la résiliation). Il vous est transmis avant tout démarrage&nbsp;: rien ne commence sans votre accord écrit."
      },
      {
        q: "À qui appartiennent le site et le nom de domaine ?",
        a: 'Votre contenu et votre nom de domaine vous appartiennent. Les modalités précises de reprise en fin de contrat sont détaillées dans le contrat — nous en parlons ouvertement dès le départ.'
      },
      {
        q: "Où êtes-vous situés ? Travaillez-vous à distance ?",
        a: "Nous travaillons à distance avec des établissements partout en France&nbsp;: échanges en visio ou par téléphone. Rien n'oblige à se rencontrer sur place (mais nous ne refusons jamais une invitation à goûter&nbsp;😄)."
      }
    ]
  },

  {
    id: "quotidien",
    icon: "05",
    title: "Au quotidien",
    teaser: "Prise en main, pannes, sécurité",
    questions: [
      {
        q: "Je ne suis pas à l'aise avec l'informatique…",
        a: "L'espace de gestion est pensé pour être aussi simple qu'écrire un message, et nous vous montrons tout à la livraison. Si vous bloquez un jour, nous restons joignables."
      },
      {
        q: "Que se passe-t-il en cas de panne ?",
        a: 'La maintenance et les mises à jour techniques sont incluses dans l\'abonnement. En cas de souci, écrivez-nous via la <a href="contact.html">page contact</a>&nbsp;: nous intervenons rapidement.'
      },
      {
        q: "Le site est-il sécurisé ? Et le RGPD ?",
        a: 'Le site est servi en HTTPS (connexion chiffrée) et ne collecte que le strict nécessaire, conformément au RGPD. Les détails figurent dans notre <a href="politique-confidentialite.html">politique de confidentialité</a>.'
      },
      {
        q: "Puis-je suivre le nombre de visites ?",
        a: "Nous pouvons intégrer une mesure d'audience simple et respectueuse de la vie privée pour suivre la fréquentation de votre site. À définir ensemble selon vos besoins."
      },
      {
        q: "Sous quel délai répondez-vous ?",
        a: 'Nous répondons généralement sous 24&nbsp;h ouvrées. Le plus rapide reste la <a href="contact.html">page contact</a>.'
      },
      {
        q: "Que se passe-t-il si je résilie ?",
        a: "L'abonnement s'arrête selon les modalités prévues au contrat. Nous ne pratiquons pas de rétention&nbsp;: les conditions vous sont communiquées clairement avant signature."
      }
    ]
  },

  {
    id: "pour-qui",
    icon: "06",
    title: "Est-ce fait pour moi ?",
    teaser: "Types d'établissements, démo",
    questions: [
      {
        q: "Quels types d'établissements accompagnez-vous ?",
        a: "Restaurants, bars, cafés et salons de thé, boulangeries et pâtisseries, snacks et fast-foods, food trucks, traiteurs, caves à vin… Si vous avez une carte et des clients, la solution s'adapte."
      },
      {
        q: "Puis-je voir une démonstration ?",
        a: "Oui&nbsp;! La section «&nbsp;La démo&nbsp;» de cette page contient une démonstration animée de 8&nbsp;secondes, puis notre éditeur de carte réel, que vous pouvez manipuler en direct."
      },
      {
        q: "Avez-vous des réalisations à montrer ?",
        a: 'Une démonstration interactive est visible sur cette page. Pour en voir davantage, demandez-nous via la <a href="contact.html">page contact</a> — nous vous montrons volontiers nos travaux.'
      },
      {
        q: "Et si je faisais le site moi-même ?",
        a: "Excellente idée&nbsp;! La recette&nbsp;: apprenez le HTML, le CSS, le JavaScript, le DNS, l'hébergement, le référencement et le design. Comptez ~300&nbsp;heures — le temps que votre carte change 40&nbsp;fois. 😄<br><br>Ou alors&nbsp;: vous cuisinez, nous on code. 54&nbsp;€ HT/mois et c'est réglé."
      },
      {
        q: "Une IA ne pourrait-elle pas le faire gratuitement ?",
        a: "L'IA fera sûrement un très bon brouillon… qu'il faudra ensuite héberger, brancher au nom de domaine, sécuriser, maintenir et resynchroniser à chaque changement de carte. Devinez qui fait déjà tout ça pour vous&nbsp;? 😉"
      },
      {
        q: "54 € par mois, n'est-ce pas cher ?",
        a: "C'est le prix d'un plat du jour et demi. 😄 Pour un site professionnel, un menu toujours à jour, l'hébergement et le QR code inclus, votre carte ne montrera plus jamais un prix périmé. Nous trouvons ça honnête."
      }
    ]
  }
];

function initHelpCenter() {
  const launcher = document.createElement("button");
  launcher.className = "vl-chat-launcher";
  launcher.type = "button";
  launcher.setAttribute("aria-expanded", "false");
  launcher.setAttribute("aria-controls", "vl-help-panel");
  launcher.setAttribute("aria-label", "Ouvrir le centre d'aide VIKTO LABS");
  launcher.innerHTML =
    '<svg class="vl-chat-open-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>' +
    '<svg class="vl-chat-close-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';

  const panel = document.createElement("div");
  panel.className = "vl-chat-panel";
  panel.id = "vl-help-panel";
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-label", "Centre d'aide VIKTO LABS");
  panel.innerHTML =
    '<div class="vl-chat-header">' +
      '<button type="button" class="vl-help-back" aria-label="Retour">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>' +
      '</button>' +
      '<span class="vl-chat-header-text"><strong id="vl-help-title">Centre d\'aide</strong><span id="vl-help-sub">Choisissez un sujet</span></span>' +
    '</div>' +
    '<div class="vl-help-body" id="vl-help-body" tabindex="-1"></div>' +
    '<div class="vl-help-footer">' +
      '<span>Vous ne trouvez pas votre réponse&nbsp;?</span>' +
      '<a href="contact.html" class="btn btn-primary btn-block">Nous écrire</a>' +
    '</div>';

  document.body.appendChild(launcher);
  document.body.appendChild(panel);

  const body = panel.querySelector("#vl-help-body");
  const titleEl = panel.querySelector("#vl-help-title");
  const subEl = panel.querySelector("#vl-help-sub");
  const backBtn = panel.querySelector(".vl-help-back");
  let view = { level: "home", cat: null };

  function setHeader(title, sub, showBack) {
    titleEl.textContent = title;
    subEl.textContent = sub;
    backBtn.style.display = showBack ? "flex" : "none";
  }

  function renderHome() {
    view = { level: "home", cat: null };
    setHeader("Centre d'aide", "Choisissez un sujet", false);
    body.innerHTML = "";
    HELP_CENTER.forEach((cat) => {
      const item = document.createElement("button");
      item.type = "button";
      item.className = "vl-help-cat";
      item.innerHTML =
        '<span class="vl-help-cat-icon" aria-hidden="true">' + cat.icon + "</span>" +
        '<span class="vl-help-cat-text"><strong>' + cat.title + "</strong><span>" + cat.teaser + "</span></span>" +
        '<span class="vl-help-chevron" aria-hidden="true">›</span>';
      item.addEventListener("click", () => renderCategory(cat));
      body.appendChild(item);
    });
    body.scrollTop = 0;
  }

  function renderCategory(cat) {
    view = { level: "cat", cat: cat };
    setHeader(cat.title, cat.questions.length + " questions", true);
    body.innerHTML = "";
    cat.questions.forEach((item) => {
      const q = document.createElement("button");
      q.type = "button";
      q.className = "vl-help-q";
      q.innerHTML = '<span>' + item.q + '</span><span class="vl-help-chevron" aria-hidden="true">›</span>';
      q.addEventListener("click", () => renderAnswer(cat, item));
      body.appendChild(q);
    });
    body.scrollTop = 0;
  }

  function renderAnswer(cat, item) {
    view = { level: "answer", cat: cat };
    setHeader(cat.title, "Réponse", true);
    body.innerHTML =
      '<p class="vl-help-answer-q">' + item.q + "</p>" +
      '<div class="vl-help-answer">' + item.a + "</div>" +
      '<p class="vl-help-more">Autres questions de cette rubrique&nbsp;:</p>';
    cat.questions
      .filter((other) => other.q !== item.q)
      .forEach((other) => {
        const q = document.createElement("button");
        q.type = "button";
        q.className = "vl-help-q vl-help-q-small";
        q.innerHTML = '<span>' + other.q + '</span><span class="vl-help-chevron" aria-hidden="true">›</span>';
        q.addEventListener("click", () => renderAnswer(cat, other));
        body.appendChild(q);
      });
    body.scrollTop = 0;
  }

  backBtn.addEventListener("click", () => {
    if (view.level === "answer") renderCategory(view.cat);
    else renderHome();
  });

  function openPanel() {
    panel.classList.add("is-open");
    launcher.setAttribute("aria-expanded", "true");
    body.focus();
  }
  function closePanel() {
    panel.classList.remove("is-open");
    launcher.setAttribute("aria-expanded", "false");
  }

  launcher.addEventListener("click", () => {
    if (panel.classList.contains("is-open")) closePanel();
    else openPanel();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && panel.classList.contains("is-open")) {
      closePanel();
      launcher.focus();
    }
  });

  renderHome();
}

/* ---- Démo animée « vidéo » : timeline scriptée ----
   Fait avancer data-step 0→6 à intervalles ; barre de progression animée ;
   autoplay une fois à l'affichage ; état final figé si reduced-motion. */
function initDemoVideo() {
  const dv = document.querySelector(".demo-video");
  if (!dv) return;

  const bar = dv.querySelector(".dv-progress-bar");
  const poster = dv.querySelector(".dv-poster");
  const replay = dv.querySelector(".dv-replay");
  const STEPS = [500, 1900, 3300, 4600, 5900, 7600]; // ms → étapes 1..6
  const TOTAL = 8200;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let timers = [];

  const clearTimers = () => { timers.forEach(clearTimeout); timers = []; };

  function play() {
    clearTimers();
    dv.classList.remove("is-ended");
    dv.classList.add("is-playing");
    dv.setAttribute("data-step", "0");

    // barre de progression : reset puis remplissage linéaire
    if (bar) {
      bar.style.transition = "none";
      bar.style.width = "0%";
      void bar.offsetWidth; // force le reflow
      bar.style.transition = `width ${TOTAL}ms linear`;
      bar.style.width = "100%";
    }

    STEPS.forEach((t, i) => {
      timers.push(setTimeout(() => dv.setAttribute("data-step", String(i + 1)), t));
    });
    timers.push(setTimeout(() => dv.classList.add("is-ended"), TOTAL));
  }

  // Reduced motion : on montre directement l'état final, sans animation.
  if (reduce) {
    dv.classList.add("is-playing", "is-ended");
    dv.setAttribute("data-step", "6");
    if (bar) bar.style.width = "100%";
  }

  if (poster) poster.addEventListener("click", play);
  if (replay) replay.addEventListener("click", play);

  // Autoplay une seule fois quand la démo est bien visible.
  if (!reduce && "IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        play();
        io.disconnect();
      }
    }, { threshold: 0.55 });
    io.observe(dv);
  }
}

/* ---- Démos en direct : activer l'iframe au clic sur l'overlay ----
   Par défaut les iframes ont pointer-events:none (pas de piège au scroll).
   Un clic sur l'overlay rend la vraie page interactive. */
function initLiveDemos() {
  document.querySelectorAll(".live-viewport .live-overlay").forEach((overlay) => {
    overlay.addEventListener("click", () => {
      overlay.closest(".live-viewport").classList.add("is-active");
    });
  });
}

/* ---- Ombre du header dès que la page défile ---- */
function initHeaderState() {
  const header = document.querySelector(".site-header");
  if (!header) return;
  const update = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
  update();
  window.addEventListener("scroll", update, { passive: true });
}

/* ---- Scènes de synchronisation animées (hero + fonctionnement) ----
   Boucle : repos (prix 12 €) → s-edit (modification côté gestion)
   → s-synced (site mis à jour, flash + toast) → repos.
   Avec prefers-reduced-motion, on laisse l'état statique .s-synced du HTML. */
function initSyncScenes() {
  const scenes = document.querySelectorAll("[data-sync-scene]");
  if (!scenes.length) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  scenes.forEach((scene) => {
    let started = false;

    const cycle = () => {
      scene.classList.remove("s-edit", "s-synced");
      setTimeout(() => scene.classList.add("s-edit"), 900);
      setTimeout(() => {
        scene.classList.remove("s-edit");
        scene.classList.add("s-synced");
      }, 2400);
    };

    const start = () => {
      if (started) return;
      started = true;
      cycle();
      setInterval(cycle, 7000);
    };

    // La boucle ne démarre que lorsque la scène devient visible.
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver((entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          start();
          io.disconnect();
        }
      }, { threshold: 0.3 });
      io.observe(scene);
    } else {
      start();
    }
  });
}

/* ---- Navigation mobile ---- */
function initNav() {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".main-nav");
  if (!toggle || !nav) return;

  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
    document.body.style.overflow = isOpen ? "hidden" : "";
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    });
  });
}

/* ---- FAQ accordéon accessible ---- */
function initFaq() {
  const questions = document.querySelectorAll(".faq-question");
  questions.forEach((btn) => {
    btn.addEventListener("click", () => {
      const expanded = btn.getAttribute("aria-expanded") === "true";
      const answer = document.getElementById(btn.getAttribute("aria-controls"));
      btn.setAttribute("aria-expanded", String(!expanded));
      if (answer) answer.setAttribute("data-open", String(!expanded));
    });
  });
}

/* ---- Apparition progressive au défilement ---- */
function initReveal() {
  const items = document.querySelectorAll("[data-reveal]");
  if (!items.length) return;

  if (!("IntersectionObserver" in window) ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    items.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  // Cascade : les éléments d'un même parent apparaissent avec un léger décalage.
  const siblingCount = new Map();
  items.forEach((el) => {
    const parent = el.parentElement;
    const index = siblingCount.get(parent) || 0;
    siblingCount.set(parent, index + 1);
    el.style.transitionDelay = `${Math.min(index * 70, 350)}ms`;
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
          // Une fois révélé, on retire le délai pour ne pas retarder
          // les transitions de survol de l'élément.
          setTimeout(() => { entry.target.style.transitionDelay = ""; }, 1100);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );

  items.forEach((el) => observer.observe(el));
}

/* ---- Injection de l'e-mail de contact configuré ---- */
function injectContactEmail() {
  document.querySelectorAll("[data-contact-email]").forEach((el) => {
    el.textContent = SITE_CONFIG.CONTACT_EMAIL;
    if (el.tagName === "A") el.href = `mailto:${SITE_CONFIG.CONTACT_EMAIL}`;
  });
}

/* ---- Secours : si aucun service d'envoi n'est configuré, on ouvre le
   logiciel de mail du visiteur avec sa demande déjà rédigée. Aucune
   demande n'est ainsi perdue avant le branchement de Web3Forms. ---- */
function sendByMailFallback(form) {
  const val = (n) => {
    const f = form.elements[n];
    if (!f) return "";
    if (f.tagName === "SELECT") return f.options[f.selectedIndex]?.text || f.value;
    return f.value;
  };
  const lignes = [
    `Nom : ${val("full-name")}`,
    `Établissement : ${val("establishment-name")} (${val("establishment-type")})`,
    `Ville : ${val("city")}`,
    `E-mail : ${val("email")}`,
    `Téléphone : ${val("phone") || "—"}`,
    `Site actuel : ${val("current-site") || "—"}`,
    `Prestation souhaitée : ${val("service")}`,
    `Mise en ligne souhaitée : ${val("launch-date") || "—"}`,
    "",
    "Message :",
    val("message")
  ].join("\n");

  const href =
    `mailto:${SITE_CONFIG.CONTACT_EMAIL}` +
    `?subject=${encodeURIComponent("Demande via le site VIKTO LABS")}` +
    `&body=${encodeURIComponent(lignes)}`;

  window.location.href = href;

  const statusBox = document.getElementById("form-status");
  if (statusBox) {
    statusBox.textContent =
      `Votre logiciel de messagerie s'ouvre avec votre demande pré-remplie. ` +
      `Si rien ne s'ouvre, écrivez-nous directement à ${SITE_CONFIG.CONTACT_EMAIL}.`;
    statusBox.setAttribute("data-state", "success");
    statusBox.setAttribute("role", "status");
  }
}

/* ---- Formulaire de contact : validation + envoi ---- */
function initContactForm() {
  const form = document.getElementById("contact-form");
  if (!form) return;

  const statusBox = document.getElementById("form-status");

  const validators = {
    "full-name": (v) => v.trim().length >= 2 || "Merci d'indiquer votre nom et prénom.",
    "establishment-name": (v) => v.trim().length >= 2 || "Merci d'indiquer le nom de l'établissement.",
    "establishment-type": (v) => v !== "" || "Merci de choisir un type d'établissement.",
    "city": (v) => v.trim().length >= 2 || "Merci d'indiquer votre ville.",
    "email": (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || "Merci de saisir une adresse e-mail valide.",
    "service": (v) => v !== "" || "Merci de choisir une prestation.",
    "message": (v) => v.trim().length >= 10 || "Merci de décrire votre besoin en quelques mots (10 caractères minimum).",
    "consent": (v, field) => field.checked || "Merci d'accepter la politique de confidentialité pour continuer."
  };

  function showError(name, message) {
    const field = form.elements[name];
    const errorEl = document.getElementById(`error-${name}`);
    if (field) field.setAttribute("aria-invalid", message ? "true" : "false");
    if (errorEl) errorEl.textContent = message || "";
  }

  function validateField(name) {
    const field = form.elements[name];
    if (!field) return true;
    const validator = validators[name];
    if (!validator) return true;
    const value = field.type === "checkbox" ? field.checked : field.value;
    const result = validator(value, field);
    if (result === true) {
      showError(name, "");
      return true;
    }
    showError(name, result);
    return false;
  }

  Object.keys(validators).forEach((name) => {
    const field = form.elements[name];
    if (!field) return;
    const evt = field.type === "checkbox" || field.tagName === "SELECT" ? "change" : "blur";
    field.addEventListener(evt, () => validateField(name));
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Honeypot anti-spam : si rempli, on abandonne silencieusement.
    const honeypot = form.elements["company-website"];
    if (honeypot && honeypot.value.trim() !== "") {
      return;
    }

    const allValid = Object.keys(validators)
      .map(validateField)
      .every(Boolean);

    if (!allValid) {
      setStatus("Merci de corriger les champs signalés ci-dessus.", "error");
      const firstInvalid = form.querySelector('[aria-invalid="true"]');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    // Tant que le service d'envoi n'est pas configuré, on ne perd aucune
    // demande : on ouvre le logiciel de mail du visiteur avec tout le
    // contenu déjà rempli, à destination de CONTACT_EMAIL.
    if (!isFormConfigured()) {
      sendByMailFallback(form);
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Envoi en cours…";
    }

    try {
      const formData = new FormData(form);
      let endpoint = SITE_CONFIG.FORM_ENDPOINT;

      if (SITE_CONFIG.FORM_PROVIDER === "web3forms") {
        formData.append("access_key", SITE_CONFIG.WEB3FORMS_ACCESS_KEY);
        formData.append("subject", "VIKTO LABS — Nouvelle demande de contact");
        formData.append("from_name", "Site VIKTO LABS");
        endpoint = "https://api.web3forms.com/submit";
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: formData
      });

      if (response.ok) {
        form.reset();
        setStatus(
          "Merci, votre demande a bien été envoyée. Nous revenons vers vous rapidement.",
          "success"
        );
      } else {
        setStatus(
          "Une erreur est survenue lors de l'envoi. Merci de réessayer ou de nous écrire directement par e-mail.",
          "error"
        );
      }
    } catch (err) {
      setStatus(
        "Une erreur est survenue lors de l'envoi. Merci de réessayer ou de nous écrire directement par e-mail.",
        "error"
      );
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Envoyer ma demande";
      }
    }
  });

  function setStatus(message, state) {
    if (!statusBox) return;
    statusBox.textContent = message;
    statusBox.setAttribute("data-state", state);
    statusBox.setAttribute("role", state === "error" ? "alert" : "status");
    statusBox.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

/* ==========================================================================
   FINITION « GRANDE AGENCE » — intro, chorégraphie hero, curseur, boutons
   magnétiques, parallax, compteurs de prix, barre de progression.
   Chaque effet vérifie ses prérequis (reduced motion, pointer fine).
   ========================================================================== */
function initPremiumFX() {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;

  /* --- Barre de progression de lecture --- */
  const bar = document.createElement("div");
  bar.className = "vl-progress";
  bar.setAttribute("aria-hidden", "true");
  document.body.appendChild(bar);
  const updateBar = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = "scaleX(" + (max > 0 ? window.scrollY / max : 0) + ")";
  };
  window.addEventListener("scroll", updateBar, { passive: true });
  updateBar();

  /* --- Chorégraphie du hero (accueil uniquement) --- */
  const heroH1 = document.querySelector(".hero h1");
  if (heroH1 && !reduce) {
    document.body.classList.add("vl-choreo");
    // Découpe le H1 en mots masqués, en préservant le <em> rouge.
    const splitWords = (node) => {
      const frag = document.createDocumentFragment();
      node.childNodes.forEach((child) => {
        if (child.nodeType === Node.TEXT_NODE) {
          child.textContent.split(/(\s+)/).forEach((part) => {
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(" ")); }
            else if (part) {
              const w = document.createElement("span");
              w.className = "w";
              const inner = document.createElement("span");
              inner.textContent = part;
              w.appendChild(inner);
              frag.appendChild(w);
            }
          });
        } else if (child.nodeType === Node.ELEMENT_NODE) {
          const clone = child.cloneNode(false);
          clone.appendChild(splitWords(child));
          frag.appendChild(clone);
        }
      });
      return frag;
    };
    const words = splitWords(heroH1);   // construit la copie découpée
    heroH1.replaceChildren(words);       // puis remplace le contenu d'origine
    // décalage progressif des mots
    heroH1.querySelectorAll(".w > span").forEach((sp, i) => {
      sp.style.transitionDelay = (0.05 + i * 0.055) + "s";
    });
  }

  /* --- Intro rideau : accueil, 1× par session --- */
  // L'intro rejoue à CHAQUE chargement de l'accueil (choix de Viktor).
  const wantsLoader = document.body.classList.contains("home") && !reduce;
  // Révèle le hero. On passe par rAF pour que les transitions démarrent
  // proprement, MAIS avec un filet en setTimeout : dans un onglet en
  // arrière-plan, rAF est gelé et la page resterait vide sans ce garde-fou.
  const reveal = () => {
    requestAnimationFrame(() => document.body.classList.add("vl-ready"));
    setTimeout(() => document.body.classList.add("vl-ready"), 80);
  };
  if (wantsLoader) {
    const loader = document.createElement("div");
    loader.className = "vl-loader";
    loader.setAttribute("aria-hidden", "true");
    // Séquence : DESIGN. → BUILD. → LAUNCH. → wordmark VIK TO + barre rouge
    loader.innerHTML =
      '<div class="vl-intro">' +
        '<span class="vl-intro-word w1">DESIGN.</span>' +
        '<span class="vl-intro-word w2">BUILD.</span>' +
        '<span class="vl-intro-word w3">LAUNCH.</span>' +
        '<div class="vl-intro-logo">' +
          '<img src="assets/images/vikto-labs.svg" alt="">' +
        '</div>' +
      '</div>';
    document.body.appendChild(loader);
    document.body.classList.add("vl-locked");

    // Fin de l'intro : automatique après la séquence, ou immédiate si le
    // visiteur agit (clic, touche, molette, toucher). Idempotent.
    let closed = false;
    const finish = () => {
      if (closed) return;
      closed = true;
      clearTimeout(timer);
      loader.classList.add("is-done");
      document.body.classList.remove("vl-locked");
      reveal();
      setTimeout(() => loader.remove(), 950);
    };
    const timer = setTimeout(finish, 2900);
    loader.addEventListener("click", finish);
    document.addEventListener("keydown", finish, { once: true });
    window.addEventListener("wheel", finish, { once: true, passive: true });
    window.addEventListener("touchstart", finish, { once: true, passive: true });
  } else {
    reveal();
  }

  /* --- Curseur custom avec inertie (desktop) --- */
  if (finePointer && !reduce) {
    const cur = document.createElement("div");
    cur.className = "vl-cursor";
    cur.setAttribute("aria-hidden", "true");
    document.body.appendChild(cur);
    let mx = -100, my = -100, cx = -100, cy = -100, shown = false;
    document.addEventListener("mousemove", (e) => {
      mx = e.clientX; my = e.clientY;
      if (!shown) { shown = true; cur.classList.add("is-visible"); }
    });
    document.addEventListener("mouseleave", () => {
      shown = false; cur.classList.remove("is-visible");
    });
    const INTERACTIVE = "a, button, [role='button'], input, select, textarea, .faq-question";
    document.addEventListener("mouseover", (e) => {
      if (e.target.closest(INTERACTIVE)) cur.classList.add("is-active");
    });
    document.addEventListener("mouseout", (e) => {
      if (e.target.closest(INTERACTIVE)) cur.classList.remove("is-active");
    });
    (function loop() {
      cx += (mx - cx) * 0.18;
      cy += (my - cy) * 0.18;
      cur.style.left = cx + "px";
      cur.style.top = cy + "px";
      requestAnimationFrame(loop);
    })();
  }

  /* --- Boutons magnétiques (desktop) --- */
  if (finePointer && !reduce) {
    document.querySelectorAll(".btn-primary, .btn-dark").forEach((btn) => {
      btn.addEventListener("mousemove", (e) => {
        const r = btn.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
        const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
        btn.style.transform = "translate(" + (dx * 5) + "px," + (dy * 4 - 2) + "px)";
      });
      btn.addEventListener("mouseleave", () => { btn.style.transform = ""; });
    });
  }

  /* --- Parallax léger sur le visuel du hero --- */
  const stage = document.querySelector(".hero .demo-stage");
  if (stage && !reduce) {
    window.addEventListener("scroll", () => {
      const y = Math.min(window.scrollY, 900);
      stage.style.transform = "translateY(" + (y * -0.07) + "px)";
    }, { passive: true });
  }

  /* --- Compteurs de prix (0 → 500 / 0 → 45 au premier affichage) --- */
  if (!reduce && "IntersectionObserver" in window) {
    document.querySelectorAll(".price-value").forEach((el) => {
      const textNode = el.firstChild;
      if (!textNode || textNode.nodeType !== Node.TEXT_NODE) return;
      const m = textNode.textContent.match(/^(\d+)([\s\S]*)$/);
      if (!m) return;
      const target = parseInt(m[1], 10);
      const suffix = m[2];
      const io = new IntersectionObserver((entries) => {
        if (!entries.some((en) => en.isIntersecting)) return;
        io.disconnect();
        const t0 = performance.now();
        const DUR = 900;
        const tick = (t) => {
          const p = Math.min((t - t0) / DUR, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          textNode.textContent = Math.round(target * eased) + suffix;
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }, { threshold: 0.6 });
      io.observe(el);
    });
  }
}

/* ==========================================================================
   SCÈNE CINÉMATIQUE — la séquence se joue d'elle-même.
   Elle était auparavant pilotée par le scroll sur 340vh : il fallait
   dérouler trois écrans et demi pour la voir en entier. Elle démarre
   désormais seule dès que la section entre dans l'écran, sur une durée
   fixe, et se rejoue si l'on revient dessus. Les seuils de phases p1→p4
   sont inchangés, donc le CSS n'a pas bougé.
   Reduced motion : état final statique (géré en CSS).
   ========================================================================== */
const STORY_DUREE = 7000; // ms pour dérouler la séquence entière

function initStoryScene() {
  const story = document.getElementById("story");
  if (!story) return;
  const stage = story.querySelector(".story-stage");
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  let debut = null;
  let image = null;

  const poser = (p) => {
    stage.style.setProperty("--p", p.toFixed(4));
    stage.classList.toggle("p1", p > 0.16);
    stage.classList.toggle("p2", p > 0.44);
    stage.classList.toggle("p3", p > 0.60);
    stage.classList.toggle("p4", p > 0.82);
  };

  const jouer = (horodatage) => {
    if (debut === null) debut = horodatage;
    const p = Math.min((horodatage - debut) / STORY_DUREE, 1);
    poser(p);
    image = p < 1 ? requestAnimationFrame(jouer) : null;
  };

  const demarrer = () => {
    if (image !== null || debut !== null) return;
    image = requestAnimationFrame(jouer);
  };

  const reinitialiser = () => {
    if (image !== null) cancelAnimationFrame(image);
    image = null;
    debut = null;
    poser(0);
  };

  poser(0);

  const observateur = new IntersectionObserver(
    (entrees) => {
      for (const e of entrees) {
        if (e.isIntersecting) demarrer();
        else reinitialiser();   // on rejoue la scène si l'on y revient
      }
    },
    { threshold: 0.5 }
  );
  observateur.observe(story);

  // exposé pour le débogage / les tests
  window.__storyPlay = demarrer;
  window.__storyReset = reinitialiser;
  window.__storySeek = poser;
}

/* ==========================================================================
   EN SITUATION — bande-son.
   Tout est synthétisé à la volée (Web Audio) : aucun fichier à charger.
   Musique façon dessin animé (basse pincée, accords « oom-pah », carillon)
   et bruitages calés sur les temps forts du film. Chaque son est rangé à
   son instant du film ; le lecteur appelle planifier(t) à chaque image et
   seuls les sons des 0,3 s à venir sont programmés. Un saut, une pause :
   recaler() coupe en fondu ce qui était programmé et on repart de t.
   ========================================================================== */
function creerBandeSon() {
  const Contexte = window.AudioContext || window.webkitAudioContext;
  if (!Contexte) return null;

  const AVANCE = 0.3;
  let ctx = null;
  let sortie = null;
  let bus = null;
  let reverbe = null;
  let bruit = null;
  let actif = false;
  let evenements = [];
  let indice = 0;
  let dernierT = null;

  const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);

  // ---- briques de synthèse -------------------------------------------------
  const enveloppe = (quand, attaque, duree, volume) => {
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, quand);
    g.gain.exponentialRampToValueAtTime(volume, quand + attaque);
    g.gain.exponentialRampToValueAtTime(0.0001, quand + duree);
    g.connect(bus);
    return g;
  };
  const filtre = (type, frequence, q, vers) => {
    const f = ctx.createBiquadFilter();
    f.type = type; f.frequency.value = frequence; f.Q.value = q;
    f.connect(vers);
    return f;
  };
  const oscillo = (quand, duree, type, f0, f1, volume, attaque = 0.005, vers = null) => {
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(f0, quand);
    if (f1 && f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, quand + duree * 0.8);
    o.connect(vers || enveloppe(quand, attaque, duree, volume));
    o.start(quand);
    o.stop(quand + duree + 0.05);
    return o;
  };
  const souffle = (quand, duree, volume, type, f0, f1, q = 1, attaque = 0.01) => {
    const s = ctx.createBufferSource();
    s.buffer = bruit; s.loop = true;
    const f = ctx.createBiquadFilter();
    f.type = type; f.Q.value = q;
    f.frequency.setValueAtTime(f0, quand);
    if (f1 !== f0) f.frequency.exponentialRampToValueAtTime(f1, quand + duree);
    s.connect(f);
    f.connect(enveloppe(quand, attaque, duree, volume));
    s.start(quand, Math.random() * 0.8);
    s.stop(quand + duree + 0.05);
  };

  // ---- instruments -----------------------------------------------------------
  const pince = (q, m, v) => oscillo(q, 0.34, "triangle", hz(m), 0, v);
  const maillet = (q, m, v, d = 0.45) => {
    oscillo(q, d, "sine", hz(m), 0, v, 0.003);
    oscillo(q, d * 0.3, "sine", hz(m) * 4, 0, v * 0.22, 0.002);
  };
  const accord = (q, notes, v, d = 0.16) => {
    const f = filtre("lowpass", 1500, 0.7, enveloppe(q, 0.004, d, v));
    notes.forEach((m) => oscillo(q, d, "square", hz(m), 0, 0, 0, f));
  };
  const cuivres = (q, notes, v, d) => {
    const f = ctx.createBiquadFilter();
    f.type = "lowpass"; f.Q.value = 2;
    f.frequency.setValueAtTime(500, q);
    f.frequency.exponentialRampToValueAtTime(2600, q + 0.06);
    f.frequency.exponentialRampToValueAtTime(700, q + d);
    f.connect(enveloppe(q, 0.02, d, v));
    notes.forEach((m) => [-7, 7].forEach((c) => {
      const o = oscillo(q, d, "sawtooth", hz(m), 0, 0, 0, f);
      o.detune.value = c;
    }));
  };
  const charleston = (q, v) => souffle(q, 0.03, v, "highpass", 7000, 7000, 0.7, 0.001);
  const pas = (q, v) => souffle(q, 0.07, v, "lowpass", 520, 240, 0.8, 0.003);
  const clic = (q) => {
    souffle(q, 0.02, 0.3, "highpass", 2600, 2600, 0.7, 0.001);
    souffle(q + 0.075, 0.016, 0.14, "highpass", 3400, 3400, 0.7, 0.001);
  };
  const pop = (q, v = 0.2, f = 1) => oscillo(q, 0.09, "sine", 380 * f, 1100 * f, v, 0.003);
  const plouf = (q, v) => oscillo(q, 0.18, "sine", 820, 320, v, 0.004);
  const bloc = (q, v) => {
    oscillo(q, 0.08, "sine", 1150, 900, v, 0.001);
    souffle(q, 0.02, v * 0.4, "bandpass", 2500, 2500, 2, 0.001);
  };
  const sourd = (q, v) => oscillo(q, 0.2, "sine", 115, 52, v, 0.004);
  const bulle = (q, v) => oscillo(q, 0.05, "sine", 210, 540, v, 0.004);
  const cliquetis = (q, v) => souffle(q, 0.025, v, "bandpass", 3200, 3200, 3, 0.001);
  const vent = (q, v = 0.16) => souffle(q, 0.45, v, "bandpass", 320, 2600, 1.1, 0.22);
  const bip = (q, v) => oscillo(q, 0.07, "square", 1760, 1760, v, 0.002);
  const vibre = (q, d, f, v, vitesse, profondeur) => {
    const o = ctx.createOscillator();
    o.frequency.setValueAtTime(f, q);
    const lfo = ctx.createOscillator();
    lfo.frequency.value = vitesse;
    const p = ctx.createGain();
    p.gain.value = profondeur;
    lfo.connect(p); p.connect(o.frequency);
    o.connect(enveloppe(q, 0.04, d, v));
    o.start(q); lfo.start(q); o.stop(q + d + 0.05); lfo.stop(q + d + 0.05);
    return o;
  };
  const boing = (q, v) => {
    const o = vibre(q, 0.55, 140, v, 14, 35);
    o.frequency.exponentialRampToValueAtTime(520, q + 0.16);
    o.frequency.exponentialRampToValueAtTime(300, q + 0.5);
  };
  const gloups = (q, v) => { oscillo(q, 0.12, "sine", 420, 150, v); oscillo(q + 0.13, 0.1, "sine", 300, 120, v * 0.7); };
  const bourdon = (q, d, v) => {
    const g = ctx.createGain();
    [[0, v], [0.12, v * 0.3], [0.22, v], [0.34, v * 0.5], [0.45, v]].forEach(([dt, n]) => g.gain.setValueAtTime(n, q + dt));
    g.gain.setValueAtTime(v, q + d - 0.2);
    g.gain.exponentialRampToValueAtTime(0.0001, q + d);
    g.connect(bus);
    oscillo(q, d, "sawtooth", 118, 0, 0, 0, filtre("lowpass", 520, 0.7, g));
  };
  const voix = (q, syllabes, base, v, fin = 1) => {
    for (let i = 0; i < syllabes; i++) {
      const t = q + i * 0.11;
      const f = base * (1 + 0.22 * Math.sin(i * 2.3)) * (i === syllabes - 1 ? fin : 1);
      const bp = ctx.createBiquadFilter();
      bp.type = "bandpass"; bp.Q.value = 3;
      bp.frequency.setValueAtTime(650 + 450 * (i % 3), t);
      bp.frequency.linearRampToValueAtTime(1150 + 300 * (i % 2), t + 0.08);
      bp.connect(enveloppe(t, 0.012, 0.095, v));
      oscillo(t, 0.09, "sawtooth", f, f * 1.15, 0, 0, bp);
    }
  };
  const klaxon = (q, v) => {
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, q);
    g.gain.exponentialRampToValueAtTime(v, q + 0.03);
    g.gain.setValueAtTime(v, q + 0.6);
    g.gain.exponentialRampToValueAtTime(0.0001, q + 0.75);
    g.connect(bus);
    const f = filtre("bandpass", 900, 1.4, g);
    [0, 9].forEach((c) => {
      const o = oscillo(q, 0.75, "sawtooth", 170, 0, 0, 0, f);
      o.detune.value = c;
      o.frequency.exponentialRampToValueAtTime(330, q + 0.28);
      o.frequency.setValueAtTime(330, q + 0.4);
      o.frequency.exponentialRampToValueAtTime(200, q + 0.7);
    });
  };
  const trombone = (q, v) => {       // « wah wah wah waaah »
    const d = [0.24, 0.24, 0.24, 0.9];
    let t = q;
    [55, 54, 53, 52].forEach((m, i) => {
      const f = ctx.createBiquadFilter();
      f.type = "bandpass"; f.Q.value = 2.2;
      f.frequency.setValueAtTime(420, t);
      f.frequency.linearRampToValueAtTime(1300, t + d[i] * 0.45);
      f.frequency.linearRampToValueAtTime(520, t + d[i]);
      f.connect(enveloppe(t, 0.03, d[i], v));
      const o = oscillo(t, d[i], "sawtooth", hz(m), 0, 0, 0, f);
      if (i === 3) {
        const lfo = ctx.createOscillator();
        lfo.frequency.value = 6;
        const p = ctx.createGain();
        p.gain.value = 5;
        lfo.connect(p); p.connect(o.frequency);
        lfo.start(t); lfo.stop(t + d[i] + 0.05);
      }
      t += d[i] + 0.02;
    });
  };
  const rayure = (q, v) => {          // le disque qui déraille
    souffle(q, 0.09, v, "bandpass", 700, 2600, 2.5, 0.005);
    souffle(q + 0.1, 0.14, v * 0.9, "bandpass", 2400, 500, 2.5, 0.005);
    oscillo(q, 0.22, "sawtooth", 300, 90, v * 0.35, 0.005);
  };
  const rembobinage = (q, d, v) => {
    const f = filtre("lowpass", 2200, 0.8, enveloppe(q, 0.08, d, v));
    const o = oscillo(q, d, "sawtooth", 160, 0, 0, 0, f);
    o.frequency.exponentialRampToValueAtTime(900, q + d * 0.8);
    for (let t = 0; t < d - 0.1; t += 0.07) oscillo(q + t, 0.05, "square", 900 + 380 * Math.sin(t * 37), 1400, v * 0.3, 0.004);
  };
  const nappe = (q, d, v) => {        // le brouhaha d'une salle
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, q);
    g.gain.exponentialRampToValueAtTime(v, q + 0.3);
    g.gain.setValueAtTime(v, q + d - 0.3);
    g.gain.exponentialRampToValueAtTime(0.0001, q + d);
    g.connect(bus);
    const s = ctx.createBufferSource();
    s.buffer = bruit; s.loop = true;
    s.connect(filtre("bandpass", 500, 0.6, g));
    s.start(q); s.stop(q + d + 0.05);
  };
  const tension = (q, d, notes, v) => {
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, q);
    g.gain.exponentialRampToValueAtTime(v, q + 0.6);
    g.gain.setValueAtTime(v, q + d - 0.7);
    g.gain.exponentialRampToValueAtTime(0.0001, q + d);
    g.connect(bus);
    const trem = ctx.createGain();
    trem.gain.value = 0.5;
    trem.connect(g);
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 7;
    const p = ctx.createGain();
    p.gain.value = 0.5;
    lfo.connect(p); p.connect(trem.gain);
    lfo.start(q); lfo.stop(q + d + 0.05);
    const f = filtre("lowpass", 650, 0.8, trem);
    notes.forEach((m) => oscillo(q, d, "sawtooth", hz(m), 0, 0, 0, f));
  };

  // ---- la partition, en temps du film ---------------------------------------
  const composer = () => {
    const ev = [];
    const a = (t, jouer) => ev.push({ t, jouer });
    let graine = 20260924;
    const hasard = () => ((graine = (graine * 1103515245 + 12345) % 2147483648) / 2147483648);

    const BATTUE = 0.5;   // 120 à la noire
    const GRILLE = ["C", "Am", "F", "G"];
    const ACCORDS = { C: [60, 64, 67], Am: [57, 60, 64], F: [53, 57, 60], G: [55, 59, 62] };
    const BASSES = { C: [36, 43], Am: [45, 40], F: [41, 36], G: [43, 38] };
    const MELODIE = [
      [76, 79, 84, 79, 76, 0, 79, 0], [81, 84, 88, 84, 81, 0, 76, 0],
      [77, 81, 84, 81, 77, 0, 81, 84], [86, 83, 79, 83, 86, 0, 0, 0],
    ];
    const musique = (debut, fin, { melodie = false, groove = false, volume = 1 }) => {
      for (let k = Math.ceil(debut / BATTUE - 1e-6); k * BATTUE < fin - 1e-6; k++) {
        const t = k * BATTUE;
        const mesure = Math.floor(k / 4);
        const temps = k % 4;
        const nom = GRILLE[mesure % 4];
        if (temps % 2 === 0) a(t, (q) => pince(q, BASSES[nom][temps / 2], 0.22 * volume));
        else a(t, (q) => accord(q, ACCORDS[nom], 0.07 * volume));
        if (groove) { a(t, (q) => charleston(q, 0.03)); a(t + BATTUE / 2, (q) => charleston(q, 0.018)); }
        if (melodie) [0, 1].forEach((demi) => {
          const m = MELODIE[mesure % 4][temps * 2 + demi];
          const tm = t + demi * BATTUE / 2;
          if (m && tm < fin) a(tm, (q) => maillet(q, m, 0.06 * volume, 0.35));
        });
      }
    };

    // 1 · 12 h 30, sans VIKTO LABS
    musique(0, 3, { melodie: true });
    a(0, (q) => nappe(q, 4.2, 0.025));
    [0.3, 1.2, 2.3].forEach((t, i) => a(t, (q) => voix(q, 4, 240 + 60 * i, 0.04, 1.1)));
    a(0.2, (q) => { pop(q, 0.16); maillet(q + 0.05, 84, 0.05, 0.3); });
    a(0.5, (q) => souffle(q, 0.2, 0.05, "highpass", 2400, 4200, 0.8, 0.02));   // elle lève la carte
    a(0.55, (q) => voix(q, 7, 310, 0.3, 1.35));          // « Une burrata, s'il vous plaît ! »
    a(1.95, (q) => voix(q, 2, 175, 0.3, 0.9));           // « Euh… »
    a(2.2, (q) => gloups(q, 0.1));
    for (let t = 1.95; t < 2.9; t += 0.14) a(t, (q) => souffle(q, 0.05, 0.035, "bandpass", 3800, 3000, 2, 0.005));   // il se gratte la tête
    a(2.45, (q) => voix(q, 4, 165, 0.3, 0.75));          // « … il n'y en a plus. »
    a(3, (q) => trombone(q, 0.26));
    a(4.2, (q) => { rayure(q, 0.3); souffle(q, 0.25, 0.1, "highpass", 3000, 6000, 0.7, 0.003); });
    a(4.28, (q) => sourd(q, 0.3));                       // le tampon
    a(5, (q) => rembobinage(q, 1.1, 0.15));
    a(6.1, (q) => { pop(q, 0.14); maillet(q, 84, 0.1, 0.5); maillet(q + 0.08, 91, 0.1, 0.7); });
    musique(6.5, 7.5, { melodie: true });
    // 2 · la cuisine
    a(7.5, (q) => vent(q));
    musique(7.5, 9.35, { volume: 0.8 });
    for (let t = 7.7; t < 12.2; t += 0.12 + hasard() * 0.18) a(t, (q) => bulle(q, 0.03));
    for (let t = 7.7; t < 12.2; t += 0.2) a(t, (q) => cliquetis(q, 0.018));
    a(8.6, (q) => { sourd(q, 0.22); souffle(q + 0.05, 0.5, 0.08, "lowpass", 900, 300, 0.7, 0.08); });
    a(8.75, (q) => bourdon(q, 0.8, 0.05));
    a(9.4, (q) => { boing(q, 0.24); oscillo(q, 0.16, "sine", 400, 1600, 0.07, 0.01); });   // zoom éclair
    a(9.5, (q) => klaxon(q, 0.09));
    a(9.52, (q) => souffle(q, 0.45, 0.28, "lowpass", 160, 90, 0.8, 0.01));
    a(9.55, (q) => pop(q, 0.14, 1.3));
    a(9.8, (q) => gloups(q, 0.16));
    a(10, (q) => tension(q, 2.2, [33, 39], 0.04));
    a(10.4, (q) => souffle(q, 0.25, 0.08, "bandpass", 600, 2400, 1.2, 0.08));  // les bras au ciel
    a(10.5, (q) => voix(q, 6, 190, 0.34, 1.3));          // « Plus de burrata ! »
    // 3 · au comptoir
    a(12.3, (q) => vent(q));
    musique(12.5, 20, { groove: true, volume: 0.8 });
    a(12.65, (q) => voix(q, 5, 330, 0.28, 1.2));         // « Je m'en occupe ! »
    a(12.9, (q) => { pop(q, 0.1, 1.4); maillet(q + 0.03, 91, 0.07, 0.4); });   // pouce levé
    a(13.8, (q) => vent(q, 0.07));                       // la caméra s'approche…
    a(13.9, (q) => souffle(q, 0.55, 0.06, "highpass", 900, 4200, 0.8, 0.06));   // …et l'écran se partage
    // à droite, l'iPhone : on touche le champ, on tape « burr », la liste se filtre
    const tic = (q, v = 0.07) => oscillo(q, 0.045, "sine", 1900, 1300, v, 0.002);
    const touche = (q) => { oscillo(q, 0.03, "triangle", 2600, 2100, 0.035, 0.001); cliquetis(q, 0.02); };
    a(14.72, (q) => tic(q));
    [15.5, 15.91, 16.16, 16.33].forEach((t) => a(t, (q) => touche(q)));
    a(15.62, (q) => souffle(q, 0.2, 0.04, "bandpass", 1800, 3600, 1.2, 0.02));   // la liste se resserre
    a(15.98, (q) => maillet(q, 91, 0.04, 0.3));                                    // « 1 résultat »
    a(15.7, (q) => oscillo(q, 0.07, "sine", 700, 1050, 0.12, 0.003));
    a(16.9, (q) => { clic(q); vent(q, 0.06); });                                       // le clic, et la caméra s'approche
    a(16.95, (q) => { plouf(q, 0.16); souffle(q, 0.3, 0.05, "highpass", 2000, 5000, 0.7, 0.02); });
    a(17.05, (q) => { pop(q, 0.16, 1.2); [84, 88, 91, 96].forEach((m, i) => maillet(q + 0.04 + i * 0.05, m, 0.07, 0.4)); });   // « 1 clic ! »
    a(17.6, (q) => { tic(q, 0.09); pop(q + 0.02, 0.14, 1.35); [88, 91, 96, 100].forEach((m, i) => maillet(q + 0.06 + i * 0.05, m, 0.06, 0.4)); });   // « Trouvée, masquée ! »
    a(18.4, (q) => vent(q, 0.06));
    a(19.2, (q) => clic(q));
    a(19.45, (q) => { maillet(q, 88, 0.12, 0.6); maillet(q + 0.11, 91, 0.12, 0.8); });
    a(19.55, (q) => { tic(q); maillet(q + 0.22, 93, 0.08, 0.5); maillet(q + 0.33, 96, 0.08, 0.7); });   // l'iPhone enregistre aussi
    a(20.2, (q) => { vent(q, 0.06); pop(q, 0.18); [72, 76, 79, 84].forEach((m, i) => maillet(q + i * 0.06, m, 0.06, 0.3)); });
    a(20.45, (q) => pop(q, 0.18, 1.2));
    a(20.6, (q) => { maillet(q, 100, 0.05, 0.3); maillet(q + 0.06, 103, 0.04, 0.4); });   // clin d'œil
    musique(20, 21.6, { melodie: true, groove: true, volume: 0.9 });
    // 4 · 12 h 30, à table
    a(21.6, (q) => vent(q));
    musique(22, 31, { melodie: true });
    a(22.1, (q) => souffle(q, 0.35, 0.12, "bandpass", 500, 3000, 1.4, 0.12));
    a(22.95, (q) => vibre(q, 1, 950, 0.035, 9, 60));
    a(23.9, (q) => { bip(q, 0.05); bip(q + 0.1, 0.05); });
    [96, 91, 100, 93, 98].forEach((m, i) => a(23.95 + i * 0.08, (q) => maillet(q, m, 0.04, 0.4)));
    a(24.9, (q) => voix(q, 6, 320, 0.26, 1.3));          // « Alors… un risotto ! »
    a(25.45, (q) => { maillet(q, 96, 0.04, 0.4); maillet(q + 0.09, 100, 0.035, 0.5); });
    // 5 · le site, au bureau
    a(26.6, (q) => vent(q));
    a(28, (q) => clic(q));
    for (let t = 28.15; t < 29.1; t += 0.06) a(t, (q) => cliquetis(q, 0.02));
    a(29.1, (q) => { pop(q, 0.18); maillet(q + 0.05, 84, 0.1, 0.5); maillet(q + 0.15, 88, 0.1, 0.7); });
    a(29.35, (q) => { pop(q, 0.12, 0.8); maillet(q + 0.05, 91, 0.05, 0.5); });   // le cœur
    a(29.6, (q) => souffle(q, 0.2, 0.07, "bandpass", 900, 2600, 1.3, 0.05));        // il se retourne
    a(29.85, (q) => pop(q, 0.12, 1.3));                                              // pouce levé
    a(30.2, (q) => { maillet(q, 100, 0.05, 0.3); maillet(q + 0.06, 103, 0.04, 0.4); });   // clin d'œil
    // 6 · en bref
    a(31, (q) => oscillo(q, 0.5, "sine", 1100, 160, 0.16, 0.02));      // l'iris se ferme…
    a(31.6, (q) => oscillo(q, 0.35, "sine", 200, 900, 0.14, 0.02));    // …et se rouvre
    a(31.72, (q) => cuivres(q, [55, 59, 62, 67], 0.05, 0.14));
    a(31.9, (q) => {
      cuivres(q, [60, 64, 67, 72], 0.055, 1.9);
      pince(q, 36, 0.25);
      souffle(q, 0.25, 0.12, "highpass", 1500, 4000, 0.7, 0.003);      // les confettis
      [72, 76, 79, 84, 88].forEach((m, i) => maillet(q + 0.05 + i * 0.05, m, 0.05, 0.6));
    });
    a(32.2, (q) => pop(q, 0.14));
    a(32.85, (q) => pop(q, 0.14, 0.9));
    a(32.95, (q) => pop(q, 0.14, 1.15));
    a(33.5, (q) => { maillet(q, 84, 0.07, 1.4); maillet(q, 91, 0.05, 1.4); });
    [33.8, 33.95, 34.1, 34.25].forEach((t, i) => a(t, (q) => pop(q, 0.1, 0.8 + i * 0.15)));   // le salut des personnages

    return ev.sort((x, y) => x.t - y.t);
  };

  // ---- pilotage -------------------------------------------------------------
  const nouveauBus = () => {
    const g = ctx.createGain();
    g.connect(sortie);
    g.connect(reverbe);   // un peu de salle, pour que la musique ne sonne pas sèche
    return g;
  };
  const demarrer = (contexteImpose) => {
    ctx = contexteImpose || new Contexte();
    const compresseur = ctx.createDynamicsCompressor();
    compresseur.threshold.value = -12;
    compresseur.knee.value = 10;
    compresseur.ratio.value = 4;
    compresseur.connect(ctx.destination);
    sortie = ctx.createGain();
    sortie.gain.value = 1.1;
    sortie.connect(compresseur);
    const salle = ctx.createBuffer(2, ctx.sampleRate * 1.4, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = salle.getChannelData(c);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 3);
    }
    reverbe = ctx.createConvolver();
    reverbe.buffer = salle;
    const retour = ctx.createGain();
    retour.gain.value = 0.22;
    reverbe.connect(retour);
    retour.connect(sortie);
    bus = nouveauBus();
    bruit = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = bruit.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    evenements = composer();
  };

  const recaler = () => {
    dernierT = null;
    if (!ctx) return;
    const ancien = bus;
    ancien.gain.setTargetAtTime(0, ctx.currentTime, 0.02);
    setTimeout(() => ancien.disconnect(), 400);
    bus = nouveauBus();
  };

  const planifier = (t, avance = AVANCE) => {
    if (!actif) return;
    if (dernierT === null || t < dernierT - 0.05 || t > dernierT + 0.5) {
      indice = evenements.findIndex((e) => e.t >= t - 0.02);
      if (indice === -1) indice = evenements.length;
    }
    dernierT = t;
    while (indice < evenements.length && evenements[indice].t < t + avance) {
      const e = evenements[indice++];
      e.jouer(ctx.currentTime + Math.max(0, e.t - t));
    }
  };

  return {
    actif: () => actif,
    // à appeler dans un geste du visiteur (clic) : c'est la condition des navigateurs
    activer: (contexteImpose) => {
      if (!ctx) demarrer(contexteImpose);
      if (ctx.state === "suspended" && !contexteImpose) ctx.resume();
      actif = true;
      dernierT = null;
    },
    couper: () => { recaler(); actif = false; },
    recaler,
    planifier,
  };
}

/* ==========================================================================
   EN SITUATION — petit film vectoriel.
   Une frise de temps pose des classes cumulatives sur le SVG : s1…s6 pour
   les plans, c1a… pour les temps forts. Tout le mouvement est décrit en CSS
   dans le <style> du SVG ; ici on ne fait qu'avancer l'horloge. Lecture
   automatique quand le film entre dans l'écran, pause quand il en sort.
   Reduced motion : pas de lecture automatique, et le CSS supprime fondus et
   déplacements — les plans s'enchaînent alors sèchement.
   ========================================================================== */
function initContextVideo() {
  const fig = document.querySelector(".ctx-video");
  if (!fig) return;
  const cadre = fig.querySelector(".ctx-frame");
  const boutonSon = fig.querySelector(".ctx-sound");
  const son = boutonSon ? creerBandeSon() : null;
  if (fig.querySelector(".ctx-svg")) { lancerFilm(fig, son, false); return; }

  // Le dessin vit dans son propre fichier : on le charge à l'approche de la section,
  // pour que l'accueil reste léger.
  let chargement = null;
  let demande = false;
  const charger = () => {
    if (chargement) return;
    chargement = fetch(cadre.dataset.film)
      .then((r) => { if (!r.ok) throw new Error(r.status); return r.text(); })
      .then((texte) => {
        cadre.insertAdjacentHTML("afterbegin", texte);
        lancerFilm(fig, son, demande);
      })
      .catch(() => { chargement = null; fig.classList.add("is-broken"); });
  };
  // Un clic sur l'affiche avant l'arrivée du dessin : on active le son dans le geste,
  // et la lecture partira dès que le film sera là.
  const affiche = fig.querySelector(".ctx-poster");
  if (affiche) affiche.addEventListener("click", () => {
    if (fig.dataset.pret) return;
    if (son && !son.actif()) son.activer();
    demande = true;
    charger();
  });
  if ("IntersectionObserver" in window) {
    const guet = new IntersectionObserver((entrees) => {
      if (entrees.some((e) => e.isIntersecting)) { guet.disconnect(); charger(); }
    }, { rootMargin: "900px 0px" });
    guet.observe(fig);
  } else charger();
}

function lancerFilm(fig, son, lectureDemandee) {
  const svg = fig.querySelector(".ctx-svg");
  const legende = fig.querySelector(".ctx-caption");
  const bouton = fig.querySelector(".ctx-toggle");
  const icone = bouton.querySelector("span");
  const affichageTemps = fig.querySelector(".ctx-time");
  const barres = [...fig.querySelectorAll(".ctx-chap")];
  const reduit = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const boutonSon = fig.querySelector(".ctx-sound");
  if (boutonSon && !son) boutonSon.hidden = true;

  const DUREE = 34.9;
  const TEMPS = [
    ["s1", 0], ["c1a", 0.2], ["c1b", 0.5], ["c1c", 1.9], ["c1d", 3], ["c1e", 4.2], ["c1f", 5], ["c1g", 6.1],
    ["s2", 7.5], ["c2a", 8.3], ["c2b", 9.4], ["c2c", 10.4],
    ["s3", 12.3], ["c3r", 12.6], ["c3a", 13.8], ["c3b", 14.6], ["c3c", 14.9], ["c3d", 15.7], ["c3e", 16.1],
    ["c3f", 16.9], ["c3g", 18.4], ["c3h", 18.6], ["c3i", 19.2], ["c3j", 20.2],
    // l'écran partagé : à droite, l'iPhone (champ, b-u-r-r, filtre, œil, enregistrer)
    ["p3a", 14.3], ["p3b", 15.2], ["p3c", 15.75], ["p3d", 16], ["p3e", 16.3],
    ["p3f", 16.6], ["p3g", 17.6], ["p3h", 18.8], ["p3i", 19.55],
    ["s4", 21.6], ["c4a", 22.1], ["c4b", 22.9], ["c4c", 23.9], ["c4d", 24.9],
    ["s5", 26.6], ["c5a", 27.1], ["c5b", 28], ["c5c", 29.1], ["c5d", 29.6],
    ["s6", 31], ["c6a", 31.9],
  ];
  const CHAPITRES = [
    { debut: 0,    fin: 6.1,  texte: "12 h 30, sans VIKTO LABS : la burrata est finie… mais toujours sur la carte." },
    { debut: 6.1,  fin: 12.3, texte: "11 h 45, un peu plus tôt. En cuisine, plus de burrata : le chef donne l'alerte !" },
    { debut: 12.3, fin: 21.6, texte: "Au comptoir, la gérante la masque : en un clic sur l'iPad, ou en la cherchant sur son iPhone." },
    { debut: 21.6, fin: 26.6, texte: "12 h 30, la cliente scanne le QR code : la burrata n'y figure déjà plus." },
    { debut: 26.6, fin: 31,   texte: "Sur le site du restaurant non plus. Rien d'autre à faire." },
    { debut: 31,   fin: DUREE, texte: "Une modification. Partout à jour." },
  ];

  let t = 0;
  let lecture = false;
  let fini = false;
  let pauseVoulue = false;   // une pause demandée n'est pas levée par le défilement
  let image = null;
  let precedent = null;

  const minutes = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

  const poser = () => {
    for (const [classe, debut] of TEMPS) svg.classList.toggle(classe, t >= debut);
    let courant = CHAPITRES.findIndex((ch) => t < ch.fin);
    if (courant === -1) courant = CHAPITRES.length - 1;
    if (legende.dataset.chapitre !== String(courant)) {
      legende.textContent = CHAPITRES[courant].texte;
      legende.dataset.chapitre = courant;
    }
    barres.forEach((barre, k) => {
      const ch = CHAPITRES[k];
      const p = Math.min(Math.max((t - ch.debut) / (ch.fin - ch.debut), 0), 1);
      barre.style.setProperty("--p", p.toFixed(3));
      if (k === courant) barre.setAttribute("aria-current", "step");
      else barre.removeAttribute("aria-current");
    });
    affichageTemps.textContent = `${minutes(t)} / ${minutes(DUREE)}`;
  };

  const majBouton = () => {
    icone.textContent = lecture ? "❚❚" : fini ? "↻" : "▶";
    bouton.setAttribute("aria-label", lecture ? "Mettre en pause" : fini ? "Revoir la vidéo" : "Lire la vidéo");
    fig.classList.toggle("is-ended", fini);
    fig.classList.toggle("is-playing", lecture);
    svg.classList.toggle("is-paused", !lecture);
  };

  // Une seule logique de fin, que le temps y arrive en lecture ou par un saut.
  const terminerSiBesoin = () => {
    if (t < DUREE) return false;
    lecture = false;
    fini = true;
    if (image !== null) cancelAnimationFrame(image);
    image = null;
    majBouton();
    return true;
  };

  const avancer = (horodatage) => {
    if (!lecture) return;
    if (precedent !== null) t = Math.min(t + (horodatage - precedent) / 1000, DUREE);
    precedent = horodatage;
    poser();
    if (son) son.planifier(t);
    if (terminerSiBesoin()) return;
    image = requestAnimationFrame(avancer);
  };

  const lire = () => {
    if (lecture) return;
    if (fini) { t = 0; fini = false; poser(); if (son) son.recaler(); }
    lecture = true;
    precedent = null;
    fig.classList.add("is-started");
    majBouton();
    image = requestAnimationFrame(avancer);
  };

  const suspendre = () => {
    lecture = false;
    if (son) son.recaler();
    if (image !== null) cancelAnimationFrame(image);
    image = null;
    majBouton();
  };

  bouton.addEventListener("click", () => {
    if (lecture) { pauseVoulue = true; suspendre(); }
    else { pauseVoulue = false; lire(); }
  });

  barres.forEach((barre, k) => {
    barre.addEventListener("click", () => {
      t = CHAPITRES[k].debut + 0.01;
      fini = false;
      poser();
      if (son) son.recaler();
      pauseVoulue = false;
      if (!lecture) lire(); else majBouton();
    });
  });

  // Le son part muet (les navigateurs l'exigent) : le visiteur l'active d'un clic.
  const majSon = () => {
    if (!son) return;
    boutonSon.classList.toggle("is-on", son.actif());
    boutonSon.setAttribute("aria-label", son.actif() ? "Couper le son" : "Activer le son");
  };
  if (son) {
    boutonSon.addEventListener("click", () => {
      if (son.actif()) son.couper();
      else {
        son.activer();
        if (!lecture) { pauseVoulue = false; lire(); }
      }
      majSon();
    });
    majSon();
  }

  // L'affiche : un clic lance le film, avec le son d'emblée (ce clic vaut autorisation).
  const affiche = fig.querySelector(".ctx-poster");
  if (affiche) {
    if (!son) {
      affiche.querySelector(".ctx-poster-sub").textContent = "Regarder le film";
      affiche.setAttribute("aria-label", "Regarder le film");
    }
    affiche.addEventListener("click", () => {
      if (son && !son.actif()) son.activer();
      majSon();
      pauseVoulue = false;
      lire();
    });
  }

  poser();
  majBouton();

  if (!reduit && "IntersectionObserver" in window) {
    new IntersectionObserver((entrees) => {
      for (const e of entrees) {
        if (e.isIntersecting) { if (!pauseVoulue && !fini) lire(); }
        else if (lecture) suspendre();
      }
    }, { threshold: 0.5 }).observe(fig);
  }

  // exposé pour le débogage / les tests
  window.__ctxAller = (s) => { t = Math.min(Math.max(s, 0), DUREE); poser(); if (son) son.recaler(); terminerSiBesoin(); };
  window.__ctxEtat = () => ({ t, lecture, fini, pauseVoulue });

  fig.dataset.pret = "1";
  if (lectureDemandee) { majSon(); pauseVoulue = false; lire(); }
}

