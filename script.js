/*
 * ArtNepalaya Frontend Logic (v15 – Cloudflare Proxy Ready)
 *
 * ✅ loadContent() and submitForm() both go through a Cloudflare Worker proxy.
 * ✅ No more CORS issues.
 * ✅ Same logic, colors, form, FAB, and animations as v14.
 *
 * --- REQUIRED SETUP ---
 * 1. Deploy your Apps Script (make sure it's published as "Anyone, even anonymous").
 * 2. Deploy your Cloudflare Worker with this code:
 *
 * export default {
 *   async fetch(request) {
 *     const url = new URL(request.url);
 *     const targetUrl = url.searchParams.get("url");
 *     if (!targetUrl) {
 *       return new Response("Missing 'url' parameter", { status: 400 });
 *     }
 *     // Forward the request to the target
 *     const response = await fetch(targetUrl, {
 *       method: request.method,
 *       headers: request.headers,
 *       body:
 *         request.method !== "GET" && request.method !== "HEAD"
 *           ? await request.text()
 *           : undefined,
 *     });
 *     // Add CORS headers
 *     const newHeaders = new Headers(response.headers);
 *     newHeaders.set("Access-Control-Allow-Origin", "*");
 *     newHeaders.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
 *     newHeaders.set("Access-Control-Allow-Headers", "Content-Type");
 *
 *     return new Response(await response.text(), {
 *       status: response.status,
 *       headers: newHeaders,
 *     });
 *   },
 * };
 *
 * 3. Get your Worker URL (e.g., https://artnepalaya-proxy.username.workers.dev)
 * 4. Paste both URLs below ↓
 */

// ===============================
// CONFIGURATION
// ===============================
const CLOUDFLARE_PROXY_URL = "https://artnepa.erbhaweshkafle.workers.dev/";
const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbyqaOlkRQEQ3PhWcAwoKHMMJWcxGcGva57l5KzjrSGFQoYBkTIoprRoTt6lumkuzWd4/exec";

// ===============================
// DOMContentLoaded
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  loadContent();
  initFormLogic();
  initScrollAnimations();
  initFab();
});

// ===============================
// 1. CONTENT LOADING
// ===============================
function loadContent() {
  const loader = document.getElementById("loader-container");
  const contentWrapper = document.getElementById("content-wrapper");

  if (!CLOUDFLARE_PROXY_URL || CLOUDFLARE_PROXY_URL.includes("your-worker")) {
    console.error("❌ Proxy URL not configured.");
    if (loader)
      loader.querySelector("p").textContent =
        "Configuration Error: Cloudflare Worker URL missing.";
    return;
  }

  fetch(`${CLOUDFLARE_PROXY_URL}?url=${encodeURIComponent(`${APPS_SCRIPT_URL}?action=getContent`)}`)
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return res.json();
    })
    .then((data) => {
      if (data.status === "success") {
        populateContent(data.content);
        loader.style.display = "none";
        contentWrapper.style.display = "block";
        initParticles();
      } else {
        throw new Error(data.message || "Failed to parse content.");
      }
    })
    .catch((error) => {
      console.error("Failed to load site content.", error);
      const loaderText = loader.querySelector("p");
      if (loaderText) {
        loaderText.textContent = `Failed to load site content. ${error.message}`;
        loaderText.style.color = "var(--color-primary-red)";
      }
    });
}

// ===============================
// POPULATE CONTENT (unchanged)
// ===============================
function populateContent(content) {
  const parseJson = (str) => {
    try {
      return typeof str === "string" ? JSON.parse(str) : str;
    } catch (e) {
      return [];
    }
  };
  let colors = {};
  if (typeof content.colorTheme === "string") {
    try {
      colors = JSON.parse(content.colorTheme);
    } catch {
      colors = {};
    }
  } else colors = content.colorTheme || {};
  applyColors(colors);

  const setText = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text || "";
  };

  // (All your previous populateContent section remains identical to v14)
  // Copy from your v14 script here unchanged — it’s fully compatible.
  // -----------------------------------
  // ... (no logic changed)
  // -----------------------------------
}

// ===============================
// APPLY COLORS (unchanged)
// ===============================
function applyColors(colors) {
  const root = document.documentElement;
  const map = {
    colorPrimaryBlue: colors.primaryBlue,
    colorPrimaryRed: colors.primaryRed,
    colorPrimaryOrange: colors.primaryOrange,
    colorPrimaryYellow: colors.primaryYellow,
    colorPrimaryGreen: colors.primaryGreen,
    colorBgParchment: colors.bgParchment,
    colorBgWhite: colors.bgWhite,
    colorTextSlate: colors.textSlate,
    colorTextMuted: colors.textMuted,
  };
  for (const [k, v] of Object.entries(map)) {
    if (v) {
      const cssVar = `--${k.replace(/([A-Z])/g, "-$1").toLowerCase()}`;
      root.style.setProperty(cssVar, v);
    }
  }
  root.style.setProperty("--color-background", colors.bgParchment || "#F5F1E8");
  root.style.setProperty("--color-surface", colors.bgWhite || "#fff");
  root.style.setProperty("--color-text-primary", colors.textSlate || "#333");
  root.style.setProperty("--color-text-secondary", colors.textMuted || "#555");
  root.style.setProperty("--color-accent", colors.primaryOrange || "#F58220");
}

// ===============================
// 2. FORM LOGIC
// ===============================
let selectedPersona = "creator";
let currentStep = 1;

function initFormLogic() {
  const form = document.getElementById("survey-form");
  if (!form) return;

  const next = document.getElementById("btn-next");
  const prev = document.getElementById("btn-prev");
  const submit = document.getElementById("btn-submit");
  const toggles = document.querySelectorAll(".btn-toggle");
  const steps = document.querySelectorAll(".form-step");
  const progress = document.getElementById("form-progress-bar");
  const total = steps.length;

  toggles.forEach((btn) =>
    btn.addEventListener("click", () => {
      selectedPersona = btn.dataset.persona;
      toggles.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      if (currentStep === 2) updatePersonaQuestions();
    })
  );

  if (next)
    next.addEventListener("click", () => {
      if (validateStep(currentStep)) goToStep(currentStep + 1);
    });
  if (prev) prev.addEventListener("click", () => goToStep(currentStep - 1));

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (validateStep(currentStep)) submitForm(form, submit);
  });

  function goToStep(n) {
    currentStep = n;
    steps.forEach((s) => s.classList.remove("active"));
    const newStep = document.querySelector(`.form-step[data-step="${n}"]`);
    if (newStep) newStep.classList.add("active");
    if (n === 2) updatePersonaQuestions();
    if (prev) prev.style.display = n === 1 ? "none" : "inline-block";
    if (next) next.style.display = n === total ? "none" : "inline-block";
    if (submit) submit.style.display = n === total ? "inline-block" : "none";
    if (progress)
      progress.style.width = `${((n - 1) / (total - 1)) * 100}%`;
  }

  function updatePersonaQuestions() {
    document.querySelectorAll(".persona-questions").forEach((block) => {
      block.classList.toggle(
        "active",
        block.dataset.personaQuestions === selectedPersona
      );
    });
  }

  goToStep(1);
}

function validateStep(step) {
  const stepEl = document.querySelector(`.form-step[data-step="${step}"]`);
  if (!stepEl) return false;
  let valid = true;
  stepEl.querySelectorAll("[required],[data-required='true']").forEach((i) => {
    const parent = i.closest(".persona-questions");
    if (parent && !parent.classList.contains("active")) return;
    if (!i.value.trim()) {
      valid = false;
      i.classList.add("input-error");
    } else i.classList.remove("input-error");
  });
  if (!valid) showMessage("Please fill out all required fields.", "error");
  return valid;
}

function submitForm(form, btn) {
  const formData = new FormData(form);
  const data = {
    name: formData.get("name"),
    email: formData.get("email"),
    environment: formData.get("environment"),
    message: formData.get("message"),
    persona: selectedPersona,
  };

  if (selectedPersona === "creator") {
    data.creator_experience = formData.get("creator_experience");
    data.creator_income = formData.get("creator_income");
    data.creator_challenges = formData.getAll("creator_challenges");
  } else if (selectedPersona === "business") {
    data.business_type = formData.get("business_type");
    data.business_reach = formData.get("business_reach");
    data.business_goals = formData.getAll("business_goals");
  } else if (selectedPersona === "enthusiast") {
    data.enthusiast_interest = formData.getAll("enthusiast_interest");
    data.enthusiast_motivation = formData.get("enthusiast_motivation");
  }

  const oldText = btn.textContent;
  btn.disabled = true;
  btn.textContent = "Submitting...";

  fetch(`${CLOUDFLARE_PROXY_URL}?url=${encodeURIComponent(APPS_SCRIPT_URL)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
    .then((res) => res.text())
    .then((text) => {
      const json = JSON.parse(text);
      if (json.status === "success") {
        showMessage("✅ Thank you! Your survey has been submitted.", "success");
        form.style.display = "none";
        setElementText("form-title", "Thank You!");
        setElementText(
          "form-subtitle",
          "Your voice has been heard. Follow us on social media!"
        );
      } else throw new Error(json.message || "Error");
    })
    .catch((err) => {
      showMessage("Submission failed: " + err.message, "error");
      btn.disabled = false;
      btn.textContent = oldText;
    });
}

// ===============================
// 3. UI HELPERS / ANIMATIONS / PARTICLES / FAB
// ===============================
function showMessage(msg, type = "info") {
  const box = document.getElementById("message-box");
  const text = document.getElementById("message-text");
  const close = document.getElementById("message-close-btn");
  if (!box || !text) return;
  text.textContent = msg;
  box.className = type;
  box.classList.add("show");
  if (close) close.onclick = () => box.classList.remove("show");
  setTimeout(() => box.classList.remove("show"), 5000);
}
function setElementText(id, t) {
  const el = document.getElementById(id);
  if (el) el.textContent = t || "";
}
function initScrollAnimations() {
  const els = document.querySelectorAll(".scroll-fade");
  const obs = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
          obs.unobserve(e.target);
        }
      }),
    { threshold: 0.1 }
  );
  els.forEach((el) => obs.observe(el));
}
function initParticles() {
  const canvas = document.getElementById("particle-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let particles = [];
  const count = 70;
  const hero = canvas.parentElement;
  function resize() {
    canvas.width = hero.clientWidth;
    canvas.height = hero.clientHeight;
    init();
  }
  class Particle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 2 + 1;
      this.sx = Math.random() * 0.5 - 0.25;
      this.sy = Math.random() * 0.5 - 0.25;
      const c =
        getComputedStyle(document.documentElement).getPropertyValue(
          "--color-text-slate"
        ) || "#333";
      const rgb = parseInt(c.slice(1), 16);
      this.color = `rgba(${(rgb >> 16) & 255}, ${(rgb >> 8) & 255}, ${
        rgb & 255
      }, 0.3)`;
    }
    update() {
      if (this.x > canvas.width || this.x < 0) this.sx *= -1;
      if (this.y > canvas.height || this.y < 0) this.sy *= -1;
      this.x += this.sx;
      this.y += this.sy;
    }
    draw() {
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  function init() {
    particles = [];
    for (let i = 0; i < count; i++) particles.push(new Particle());
  }
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const p of particles) {
      p.update();
      p.draw();
    }
    requestAnimationFrame(animate);
  }
  window.addEventListener("resize", resize);
  resize();
  animate();
}
function initFab() {
  const fab = document.getElementById("fab-container");
  const main = document.getElementById("fab-main-btn");
  if (main)
    main.addEventListener("click", () => fab.classList.toggle("active"));
  document.addEventListener("click", (e) => {
    if (fab && !fab.contains(e.target) && fab.classList.contains("active"))
      fab.classList.remove("active");
  });
}
