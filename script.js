/* ============================================
   SEVEN LC — Landing Page JavaScript
   Multilingual Language Center
   ============================================ */

/* ===== TELEGRAM BOT CONFIGURATION =====
   Replace with your actual values:
   BOT_TOKEN: Get from @BotFather on Telegram
   CHAT_ID:   Get from @userinfobot or your channel/group ID
   ======================================= */
const BOT_TOKEN = "YOUR_BOT_TOKEN_HERE";
const CHAT_ID   = "YOUR_CHAT_ID_HERE";

/* ============================================
   1. NAVBAR — Scroll effect
   ============================================ */
const navbar = document.getElementById("navbar");

window.addEventListener("scroll", () => {
  navbar.classList.toggle("scrolled", window.scrollY > 40);
});

/* ============================================
   2. SMOOTH SCROLL for all anchor links
   ============================================ */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener("click", function (e) {
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      e.preventDefault();
      // Offset accounts for navbar (72px) + flags ribbon (48px)
      const ribbonHeight = document.querySelector(".flags-ribbon")?.offsetHeight || 48;
      const navHeight    = navbar?.offsetHeight || 72;
      const offset       = navHeight + ribbonHeight + 12;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
    }
  });
});

/* ============================================
   3. SCROLL REVEAL ANIMATION
   ============================================ */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Stagger sibling cards
        const siblings = Array.from(
          entry.target.parentElement.querySelectorAll(".reveal")
        );
        const idx   = siblings.indexOf(entry.target);
        const delay = Math.min(idx * 80, 400);

        setTimeout(() => {
          entry.target.classList.add("visible");
        }, delay);

        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
);

document.querySelectorAll(".reveal").forEach(el => revealObserver.observe(el));

/* ============================================
   4. ANIMATED COUNTERS (Stats section)
   ============================================ */
function animateCounter(el, target, duration = 1800) {
  let start = 0;
  const step = Math.ceil(target / (duration / 16));
  const timer = setInterval(() => {
    start += step;
    if (start >= target) {
      start = target;
      clearInterval(timer);
    }
    el.textContent = start;
  }, 16);
}

const statsObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = parseInt(entry.target.dataset.target, 10);
        animateCounter(entry.target, target);
        statsObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.4 }
);

document.querySelectorAll(".stat-number").forEach(el => statsObserver.observe(el));

/* ============================================
   5. LEAD FORM — Validation + Telegram API
   ============================================ */
const form        = document.getElementById("leadForm");
const nameInput   = document.getElementById("nameInput");
const phoneInput  = document.getElementById("phoneInput");
const courseSelect = document.getElementById("courseSelect");
const submitBtn   = document.getElementById("submitBtn");
const btnText     = document.getElementById("btnText");
const btnLoader   = document.getElementById("btnLoader");
const successMsg  = document.getElementById("successMsg");

// Phone: allow only digits and +
phoneInput.addEventListener("input", () => {
  let val = phoneInput.value.replace(/[^\d+]/g, "");
  if (val && !val.startsWith("+")) val = "+" + val;
  phoneInput.value = val;
});

// Auto-prefix +998 on focus
phoneInput.addEventListener("focus", () => {
  if (!phoneInput.value) phoneInput.value = "+998 ";
});

// Field validator
function validateField(input, errorId, checkFn) {
  const errorEl = document.getElementById(errorId);
  const valid   = checkFn(input.value.trim());
  input.classList.toggle("error", !valid);
  errorEl.classList.toggle("show", !valid);
  return valid;
}

// Live validation on blur
nameInput.addEventListener("blur",   () => validateField(nameInput,    "nameError",   v => v.length >= 2));
phoneInput.addEventListener("blur",  () => validateField(phoneInput,   "phoneError",  v => v.replace(/\D/g,"").length >= 9));
courseSelect.addEventListener("blur",() => validateField(courseSelect, "courseError", v => v !== ""));

// Build Telegram message
function buildMessage(name, phone, course) {
  const now = new Date().toLocaleString("uz-UZ", { timeZone: "Asia/Tashkent" });
  return (
    `🌐 *Yangi ariza — SEVEN LC*\n\n` +
    `👤 *Ism:* ${name}\n` +
    `📞 *Telefon:* ${phone}\n` +
    `📚 *Kurs:* ${course}\n\n` +
    `⏰ ${now}`
  );
}

// Send to Telegram Bot via fetch
async function sendToTelegram(name, phone, course) {
  const url  = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id:    CHAT_ID,
      text:       buildMessage(name, phone, course),
      parse_mode: "Markdown",
    }),
  });
  if (!resp.ok) {
    const data = await resp.json();
    throw new Error(data.description || "Telegram API xatosi");
  }
  return true;
}

// Toggle loading state
function setLoading(loading) {
  submitBtn.disabled      = loading;
  btnText.style.display   = loading ? "none"  : "block";
  btnLoader.style.display = loading ? "flex"  : "none";
}

// Show success card inside form
function showSuccess() {
  form.style.display         = "none";
  successMsg.style.display   = "flex";
  successMsg.style.flexDirection = "column";
  successMsg.style.alignItems    = "center";

  // Auto-reset after 8 s so visitors can resubmit
  setTimeout(() => {
    form.reset();
    form.style.display       = "flex";
    successMsg.style.display = "none";
  }, 8000);
}

// Form submit handler
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nameOk   = validateField(nameInput,    "nameError",   v => v.length >= 2);
  const phoneOk  = validateField(phoneInput,   "phoneError",  v => v.replace(/\D/g,"").length >= 9);
  const courseOk = validateField(courseSelect, "courseError", v => v !== "");

  if (!nameOk || !phoneOk || !courseOk) return;

  const name   = nameInput.value.trim();
  const phone  = phoneInput.value.trim();
  const course = courseSelect.value;

  setLoading(true);

  try {
    await sendToTelegram(name, phone, course);
    showSuccess();
  } catch (err) {
    // Show success anyway to avoid losing the lead
    console.warn("Telegram send error:", err.message);
    showSuccess();
  } finally {
    setLoading(false);
  }
});

/* ============================================
   6. FLOATING BUTTONS — appear after scroll
   ============================================ */
const floatBtns = document.querySelectorAll(".float-btn");

// Start hidden
floatBtns.forEach(btn => {
  btn.style.transform  = "translateY(120px)";
  btn.style.opacity    = "0";
  btn.style.transition = "transform 0.5s cubic-bezier(0.34,1.56,0.64,1), opacity 0.5s ease, box-shadow 0.3s ease";
});

let floatsVisible = false;
window.addEventListener("scroll", () => {
  if (window.scrollY > 300 && !floatsVisible) {
    floatsVisible = true;
    floatBtns.forEach((btn, i) => {
      setTimeout(() => {
        btn.style.transform = "";
        btn.style.opacity   = "1";
      }, i * 120);
    });
  }
});

/* ============================================
   7. FLAGS RIBBON — pause on hover (CSS handles it)
      Dynamic resize: recalculate animation for very
      small screens by adjusting speed.
   ============================================ */
function adjustRibbonSpeed() {
  const track = document.querySelector(".flags-track");
  if (!track) return;
  // Narrower = shorter visual track = faster feeling; slow it down
  const speed = window.innerWidth < 480 ? "20s" : "28s";
  track.style.animationDuration = speed;
}
adjustRibbonSpeed();
window.addEventListener("resize", adjustRibbonSpeed);

/* ============================================
   8. RIPPLE EFFECT on primary buttons
   ============================================ */
// Inject keyframes once
(function injectRippleStyle() {
  const s = document.createElement("style");
  s.id = "ripple-style";
  s.textContent = `
    @keyframes ripple-anim {
      to { transform: scale(4); opacity: 0; }
    }
  `;
  document.head.appendChild(s);
})();

document.querySelectorAll(".btn-primary, .btn-course, .btn-form").forEach(btn => {
  btn.addEventListener("click", function (e) {
    const rect   = this.getBoundingClientRect();
    const ripple = document.createElement("span");
    ripple.style.cssText = `
      position:absolute;
      border-radius:50%;
      transform:scale(0);
      animation:ripple-anim 0.6s linear;
      background:rgba(255,255,255,0.22);
      width:110px;height:110px;
      left:${e.clientX - rect.left - 55}px;
      top:${e.clientY - rect.top - 55}px;
      pointer-events:none;
    `;
    if (getComputedStyle(this).position === "static") this.style.position = "relative";
    this.style.overflow = "hidden";
    this.appendChild(ripple);
    ripple.addEventListener("animationend", () => ripple.remove());
  });
});

/* ============================================
   9. SUBTLE CURSOR GLOW (desktop only)
   ============================================ */
if (window.innerWidth > 900) {
  const glow = document.createElement("div");
  glow.style.cssText = `
    position:fixed;
    width:280px;height:280px;
    border-radius:50%;
    background:radial-gradient(circle,rgba(255,43,43,0.055) 0%,transparent 70%);
    pointer-events:none;
    z-index:0;
    transform:translate(-50%,-50%);
    transition:left .12s ease,top .12s ease;
    will-change:left,top;
  `;
  document.body.appendChild(glow);
  document.addEventListener("mousemove", e => {
    glow.style.left = e.clientX + "px";
    glow.style.top  = e.clientY + "px";
  });
}

/* ============================================
   10. LOGO FALLBACK — ensure text shows when
       logo.png is not found (belt-and-suspenders)
   ============================================ */
document.querySelectorAll(".logo-img").forEach(img => {
  img.addEventListener("error", function () {
    this.style.display = "none";
    const fallbackId = this.closest(".nav-logo, .footer-logo-link")
      ?.querySelector(".logo-text-fallback")?.id;
    if (fallbackId) {
      const fb = document.getElementById(fallbackId);
      if (fb) fb.style.display = "flex";
    }
  });
});

/* ============================================
   INIT LOG
   ============================================ */
console.log(
  "%c SEVEN LC %c Language Center — Loaded ",
  "background:#ff2b2b;color:#fff;font-weight:bold;padding:4px 8px;border-radius:4px 0 0 4px;",
  "background:#111;color:#fff;padding:4px 8px;border-radius:0 4px 4px 0;"
);
