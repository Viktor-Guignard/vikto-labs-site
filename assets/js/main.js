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

  // ⚠️ LIENS DE PAIEMENT STRIPE EN MODE TEST — à remplacer par les liens de
  // PRODUCTION avant tout vrai client (dashboard Stripe → basculer sur le
  // compte de production → recréer les 2 liens → coller les URLs ci-dessous).
  // Ce sont des URLs publiques (faites pour être partagées/cliquées),
  // aucun souci à les laisser dans ce fichier.
  STRIPE_LINK_SITE: "https://buy.stripe.com/test_4gMeV60ne5Zy3J19aWefC01", // 500 € — paiement unique
  STRIPE_LINK_SUBSCRIPTION: "https://buy.stripe.com/test_00weV6da0ew4a7p4UGefC00" // 45 €/mois — abonnement
};

// Branche les boutons de tarifs sur les liens de paiement Stripe.
// L'attribut data-stripe-link vaut "site" (500 €) ou "subscription" (45 €/mois).
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
        a: "Deux formules&nbsp;:<br><br><strong>Site vitrine</strong> — 500&nbsp;€ HT en paiement unique (600&nbsp;€ TTC).<br><br><strong>Site + menu synchronisé</strong> — 45&nbsp;€ HT/mois soit 54&nbsp;€ TTC, sans frais de création, avec un engagement initial de 12 mois."
      },
      {
        q: "Que comprend l'abonnement à 45 € HT/mois ?",
        a: "La création du site vitrine, le menu numérique modifiable, l'espace de gestion, la synchronisation site&nbsp;↔&nbsp;QR code, le QR code lui-même, l'hébergement et les mises à jour techniques."
      },
      {
        q: "Y a-t-il des frais de création ?",
        a: "Non. Pour la formule Site + menu synchronisé, il n'y a aucun frais de création à l'entrée&nbsp;: vous payez uniquement l'abonnement mensuel."
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
        a: "Nos prix sont affichés <strong>hors taxes</strong>, TVA de 20&nbsp;% en sus&nbsp;:<br><br>• Site vitrine&nbsp;: 500&nbsp;€ HT → <strong>600&nbsp;€ TTC</strong><br>• Abonnement&nbsp;: 45&nbsp;€ HT → <strong>54&nbsp;€ TTC</strong>/mois<br><br>Une facture conforme est fournie à chaque paiement."
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
        a: "Excellente idée&nbsp;! La recette&nbsp;: apprenez le HTML, le CSS, le JavaScript, le DNS, l'hébergement, le référencement et le design. Comptez ~300&nbsp;heures — le temps que votre carte change 40&nbsp;fois. 😄<br><br>Ou alors&nbsp;: vous cuisinez, nous on code. 45&nbsp;€ HT/mois et c'est réglé."
      },
      {
        q: "Une IA ne pourrait-elle pas le faire gratuitement ?",
        a: "L'IA fera sûrement un très bon brouillon… qu'il faudra ensuite héberger, brancher au nom de domaine, sécuriser, maintenir et resynchroniser à chaque changement de carte. Devinez qui fait déjà tout ça pour vous&nbsp;? 😉"
      },
      {
        q: "45 € par mois, n'est-ce pas cher ?",
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
  const wantsLoader = document.body.classList.contains("home") && !reduce &&
    (!sessionStorage.getItem("vl-intro") || location.search.includes("intro"));
  const reveal = () => {
    requestAnimationFrame(() => document.body.classList.add("vl-ready"));
  };
  if (wantsLoader) {
    sessionStorage.setItem("vl-intro", "1");
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
          '<span class="vik">VIK</span><span class="to">TO</span>' +
          '<span class="bar"></span>' +
        '</div>' +
      '</div>';
    document.body.appendChild(loader);
    document.body.classList.add("vl-locked");
    setTimeout(() => {
      loader.classList.add("is-done");
      document.body.classList.remove("vl-locked");
      reveal();
      setTimeout(() => loader.remove(), 950);
    }, 2900);
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
   SCÈNE CINÉMATIQUE — le scroll pilote le temps.
   La progression dans la section .story (340vh) est convertie en phases
   cumulatives p1→p4 ; les transitions CSS rendent le tout réversible
   quand on remonte. Reduced motion : état final statique (géré en CSS).
   ========================================================================== */
function initStoryScene() {
  const story = document.getElementById("story");
  if (!story) return;
  const stage = story.querySelector(".story-stage");
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  let ticking = false;
  const update = () => {
    ticking = false;
    const rect = story.getBoundingClientRect();
    const total = story.offsetHeight - window.innerHeight;
    const p = Math.min(Math.max(total > 0 ? -rect.top / total : 0, 0), 1);
    stage.style.setProperty("--p", p.toFixed(4));
    stage.classList.toggle("p1", p > 0.16);
    stage.classList.toggle("p2", p > 0.44);
    stage.classList.toggle("p3", p > 0.60);
    stage.classList.toggle("p4", p > 0.82);
  };
  const onScroll = () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  update();
  window.__storyUpdate = update; // exposé pour le débogage / les tests
}
