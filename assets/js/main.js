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
  initChatbot();
});

/* ==========================================================================
   CHATBOT MAISON — 100% local, aucun service tiers, aucune clé à exposer.
   Base de connaissance = le contenu FAQ du site. Recherche par mots-clés ;
   si aucune correspondance suffisante, renvoie vers le formulaire de contact.
   ========================================================================== */
const CHATBOT_KB = [
  {
    keywords: ["modifier", "moi meme", "moi-même", "changer menu", "gerer", "gérer"],
    answer: "Oui. Avec la formule Site + menu synchronisé, vous accédez à un espace de gestion pensé pour être simple et intuitif, sans compétence technique particulière."
  },
  {
    keywords: ["mise a jour", "mis a jour", "automatique", "synchronise", "synchro"],
    answer: "Oui. Chaque modification enregistrée dans votre espace de gestion est automatiquement répercutée sur votre site et sur le menu accessible par QR code."
  },
  {
    keywords: ["qr code", "qr-code", "code qr"],
    answer: "Le QR code reste identique quand vous modifiez votre menu : il pointe vers votre menu numérique, dont le contenu se met à jour automatiquement."
  },
  {
    keywords: ["45", "abonnement", "mensuel", "mois", "comprend"],
    answer: "L'abonnement à 45&nbsp;€ HT/mois (54&nbsp;€ TTC) comprend la création du site vitrine, le menu numérique modifiable, l'espace de gestion, la synchronisation, le QR code, l'hébergement et les mises à jour techniques."
  },
  {
    keywords: ["frais", "creation", "création", "entree", "entrée", "cout initial"],
    answer: "Non, pour la formule Site + menu synchronisé, il n'y a pas de frais de création à l'entrée."
  },
  {
    keywords: ["engagement", "duree", "durée", "12 mois", "resilier", "résilier", "resiliation", "résiliation", "annuler"],
    answer: "L'abonnement démarre avec un engagement initial de 12 mois. Passé ce délai, il se poursuit sans nouvel engagement. Les modalités précises de résiliation sont détaillées dans le contrat."
  },
  {
    keywords: ["500", "site seul", "juste le site", "sans abonnement", "paiement unique"],
    answer: "Oui. La formule Site vitrine seul, à 500&nbsp;€ HT en paiement unique (600&nbsp;€ TTC), est disponible sans abonnement ni menu numérique."
  },
  {
    keywords: ["delai", "délai", "combien de temps", "mettre en ligne", "rapide", "duree creation"],
    answer: "Le délai dépend de la disponibilité de vos contenus et du nombre d'allers-retours de validation. Nous vous communiquons une estimation dès notre premier échange."
  },
  {
    keywords: ["textes", "photos", "images", "contenu", "fournir"],
    answer: "Idéalement oui, afin que le site reflète fidèlement votre établissement. Nous pouvons vous accompagner si certains éléments manquent."
  },
  {
    keywords: ["tarif", "prix", "combien", "coute", "coûte"],
    answer: "Deux formules : <strong>Site vitrine</strong> à 500&nbsp;€ HT en paiement unique, ou <strong>Site + menu synchronisé</strong> à 45&nbsp;€ HT/mois (sans frais de création, engagement initial de 12 mois)."
  },
  {
    keywords: ["bonjour", "salut", "hello", "coucou", "bonsoir"],
    answer: "Bonjour&nbsp;! Je peux répondre à vos questions sur nos offres, les tarifs, les délais ou le fonctionnement du menu numérique. Que voulez-vous savoir&nbsp;?"
  },
  {
    keywords: ["qui etes vous", "qui êtes-vous", "c'est quoi vikto", "vikto labs c'est quoi", "vous faites quoi"],
    answer: "VIKTO LABS est un studio indépendant qui crée des sites vitrines et des menus numériques pour les restaurants et commerces de bouche."
  }
];

const CHATBOT_SUGGESTIONS = [
  "Quels sont vos tarifs ?",
  "Puis-je modifier mon menu moi-même ?",
  "Quelle est la durée d'engagement ?"
];

function chatbotNormalize(str) {
  return str
    .toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "") // enlève les accents
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function chatbotFindAnswer(userText) {
  const normalized = chatbotNormalize(userText);
  let best = null;
  let bestScore = 0;
  CHATBOT_KB.forEach((entry) => {
    let score = 0;
    entry.keywords.forEach((kw) => {
      if (normalized.includes(chatbotNormalize(kw))) score += kw.split(" ").length;
    });
    if (score > bestScore) {
      bestScore = score;
      best = entry;
    }
  });
  if (best && bestScore > 0) return best.answer;
  return (
    "Je n'ai pas de réponse toute faite pour cette question. " +
    `Le plus simple : <a href="contact.html">contactez-nous directement</a>, ` +
    "nous vous répondrons rapidement."
  );
}

function initChatbot() {
  const launcher = document.createElement("button");
  launcher.className = "vl-chat-launcher";
  launcher.type = "button";
  launcher.setAttribute("aria-expanded", "false");
  launcher.setAttribute("aria-controls", "vl-chat-panel");
  launcher.setAttribute("aria-label", "Ouvrir l'assistant VIKTO LABS");
  launcher.innerHTML =
    '<svg class="vl-chat-open-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>' +
    '<svg class="vl-chat-close-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';

  const panel = document.createElement("div");
  panel.className = "vl-chat-panel";
  panel.id = "vl-chat-panel";
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-label", "Assistant VIKTO LABS");
  panel.innerHTML = `
    <div class="vl-chat-header">
      <span class="vl-chat-avatar" aria-hidden="true">V</span>
      <span class="vl-chat-header-text"><strong>Assistant VIKTO LABS</strong><span>Répond en quelques secondes</span></span>
    </div>
    <div class="vl-chat-messages" id="vl-chat-messages" role="log" aria-live="polite"></div>
    <div class="vl-chat-suggestions" id="vl-chat-suggestions"></div>
    <form class="vl-chat-form" id="vl-chat-form">
      <label for="vl-chat-input" class="skip-link">Votre question</label>
      <input type="text" id="vl-chat-input" placeholder="Posez votre question…" autocomplete="off">
      <button type="submit" aria-label="Envoyer">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
      </button>
    </form>
  `;

  document.body.appendChild(launcher);
  document.body.appendChild(panel);

  const messagesBox = panel.querySelector("#vl-chat-messages");
  const suggestionsBox = panel.querySelector("#vl-chat-suggestions");
  const form = panel.querySelector("#vl-chat-form");
  const input = panel.querySelector("#vl-chat-input");
  let started = false;

  function addMessage(text, who) {
    const el = document.createElement("div");
    el.className = "vl-msg " + (who === "user" ? "vl-msg-user" : "vl-msg-bot");
    el.innerHTML = text;
    messagesBox.appendChild(el);
    messagesBox.scrollTop = messagesBox.scrollHeight;
  }

  function renderSuggestions() {
    suggestionsBox.innerHTML = "";
    CHATBOT_SUGGESTIONS.forEach((s) => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "vl-chat-chip";
      chip.textContent = s;
      chip.addEventListener("click", () => {
        addMessage(s, "user");
        addMessage(chatbotFindAnswer(s), "bot");
      });
      suggestionsBox.appendChild(chip);
    });
  }

  function openPanel() {
    panel.classList.add("is-open");
    launcher.setAttribute("aria-expanded", "true");
    if (!started) {
      started = true;
      addMessage(
        "Bonjour&nbsp;! Je suis l'assistant VIKTO LABS. Posez-moi une question sur nos offres, les tarifs ou le fonctionnement du menu numérique.",
        "bot"
      );
      renderSuggestions();
    }
    input.focus();
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

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    addMessage(text.replace(/</g, "&lt;"), "user");
    input.value = "";
    setTimeout(() => addMessage(chatbotFindAnswer(text), "bot"), 300);
  });
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
