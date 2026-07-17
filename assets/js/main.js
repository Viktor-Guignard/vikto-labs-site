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
  FORM_PROVIDER: "formspree", // "formspree" | "web3forms"
  // Formspree du compte déjà utilisé pour le projet "livret-messe" (même compte, réutilisé ici).
  // Les envois des deux sites arrivent dans le même formulaire Formspree : le champ caché
  // "_subject" du formulaire (contact.html) permet de distinguer les demandes VIKTO LABS.
  FORM_ENDPOINT: "https://formspree.io/f/xaqrwzzy",
  WEB3FORMS_ACCESS_KEY: "VOTRE_CLE_WEB3FORMS", // non utilisé (provider = formspree)
  CONTACT_EMAIL: "contact@viktolabs.fr" // <-- À REMPLACER par l'adresse de destination réelle
};

document.addEventListener("DOMContentLoaded", () => {
  initNav();
  initHeaderState();
  initFaq();
  initReveal();
  initSyncScenes();
  initLiveDemos();
  initContactForm();
  injectContactEmail();
});

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
