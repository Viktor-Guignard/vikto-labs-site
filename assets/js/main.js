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

  CONTACT_EMAIL: "vikto.labs@gmail.com" // destination des demandes + adresse affichée
};

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
});

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
