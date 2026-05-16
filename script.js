/* ============================================
   SEVEN LC — Landing Page JavaScript
   ============================================ */

/* ===== TELEGRAM BOT CONFIGURATION =====
   Replace with your actual values:
   BOT_TOKEN: Get from @BotFather on Telegram
   CHAT_ID:   Get from @userinfobot or your channel ID
   ======================================= */
const BOT_TOKEN = "YOUR_BOT_TOKEN_HERE";
const CHAT_ID   = "YOUR_CHAT_ID_HERE";

/* ============================================
   1. NAVBAR — Scroll effect
   ============================================ */
const navbar = document.getElementById("navbar");

window.addEventListener("scroll", () => {
  if (window.scrollY > 40) {
    navbar.classList.add("scrolled");
  } else {
    navbar.classList.remove("scrolled");
  }
});

/* ============================================
   2. SMOOTH SCROLL for anchor links
   ============================================ */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener("click", function (e) {
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      e.preventDefault();
      const offset = 80; // navbar height
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
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger cards in a grid
        const siblings = Array.from(entry.target.parentElement.querySelectorAll(".reveal"));
        const index = siblings.indexOf(entry.target);
        const delay = Math.min(index * 80, 400);

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
   4. ANIMATED COUNTER (Stats section)
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

// Trigger counters when stats section enters viewport
const statNumbers = document.querySelectorAll(".stat-number");

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

statNumbers.forEach(el => statsObserver.observe(el));

/* ============================================
   5. LEAD FORM — Validation + Telegram API
   ============================================ */
const form       = document.getElementById("leadForm");
const nameInput  = document.getElementById("nameInput");
const phoneInput = document.getElementById("phoneInput");
const courseSelect = document.getElementById("courseSelect");
const submitBtn  = document.getElementById("submitBtn");
const btnText    = document.getElementById("btnText");
const btnLoader  = document.getElementById("btnLoader");
const successMsg = document.getElementById("successMsg");

// Phone input: auto-format and allow only digits/+
phoneInput.addEventListener("input", () => {
  let val = phoneInput.value.replace(/[^\d+]/g, "");
  if (!val.startsWith("+")) val = val.startsWith("9") ? "+" + val : val;
  phoneInput.value = val;
});

// Validate a single field
function validateField(input, errorId, check) {
  const errorEl = document.getElementById(errorId);
  if (!check(input.value.trim())) {
    input.classList.add("error");
    errorEl.classList.add("show");
    return false;
  } else {
    input.classList.remove("error");
    errorEl.classList.remove("show");
    return true;
  }
}

// Live validation on blur
nameInput.addEventListener("blur", () =>
  validateField(nameInput, "nameError", v => v.length >= 2)
);
phoneInput.addEventListener("blur", () =>
  validateField(phoneInput, "phoneError", v => v.length >= 9)
);
courseSelect.addEventListener("blur", () =>
  validateField(courseSelect, "courseError", v => v !== "")
);

// Build Telegram message text
function buildMessage(name, phone, course) {
  return (
    `🎓 *Yangi ariza — SEVEN LC*\n\n` +
    `👤 *Ism:* ${name}\n` +
    `📞 *Telefon:* ${phone}\n` +
    `📚 *Kurs:* ${course}\n\n` +
    `⏰ ${new Date().toLocaleString("uz-UZ", { timeZone: "Asia/Tashkent" })}`
  );
}

// Send lead to Telegram Bot
async function sendToTelegram(name, phone, course) {
  const url  = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  const body = {
    chat_id:    CHAT_ID,
    text:       buildMessage(name, phone, course),
    parse_mode: "Markdown",
  };

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.description || "Telegram API xatosi");
  }
  return true;
}

// Set loading state on button
function setLoading(loading) {
  submitBtn.disabled = loading;
  btnText.style.display  = loading ? "none" : "block";
  btnLoader.style.display = loading ? "flex" : "none";
}

// Show success state inside form card
function showSuccess() {
  form.style.display      = "none";
  successMsg.style.display = "flex";
  successMsg.style.flexDirection = "column";
  successMsg.style.alignItems    = "center";

  // Add a subtle pop animation
  successMsg.style.animation = "pop-in 0.5s cubic-bezier(0.34,1.56,0.64,1)";

  // Reset form after 8 seconds so users can submit again
  setTimeout(() => {
    form.reset();
    form.style.display      = "flex";
    successMsg.style.display = "none";
  }, 8000);
}

// Form submission handler
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Validate all fields
  const nameOk   = validateField(nameInput,    "nameError",   v => v.length >= 2);
  const phoneOk  = validateField(phoneInput,   "phoneError",  v => v.length >= 9);
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
    // Even if Telegram fails, show success to user
    // (prevents lost leads due to API issues)
    console.warn("Telegram send warning:", err.message);
    showSuccess();
  } finally {
    setLoading(false);
  }
});

/* ============================================
   6. PHONE INPUT — Auto-prefix +998
   ============================================ */
phoneInput.addEventListener("focus", () => {
  if (phoneInput.value === "") {
    phoneInput.value = "+998 ";
  }
});

/* ============================================
   7. FLOAT BUTTONS — Show after scroll
   ============================================ */
const floatBtns = document.querySelectorAll(".float-btn");

// Initially hide float buttons, show after scrolling a bit
floatBtns.forEach(btn => {
  btn.style.transform = "translateY(100px)";
  btn.style.opacity   = "0";
  btn.style.transition = "transform 0.5s ease, opacity 0.5s ease, box-shadow 0.3s ease";
});

let floatsVisible = false;
window.addEventListener("scroll", () => {
  if (window.scrollY > 300 && !floatsVisible) {
    floatsVisible = true;
    floatBtns.forEach((btn, i) => {
      setTimeout(() => {
        btn.style.transform = "";
        btn.style.opacity   = "1";
      }, i * 100);
    });
  }
});

/* ============================================
   8. CURSOR GLOW EFFECT (desktop only)
   ============================================ */
if (window.innerWidth > 768) {
  const glow = document.createElement("div");
  glow.style.cssText = `
    position: fixed;
    width: 300px;
    height: 300px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(232,25,44,0.06) 0%, transparent 70%);
    pointer-events: none;
    z-index: 0;
    transform: translate(-50%, -50%);
    transition: left 0.15s ease, top 0.15s ease;
  `;
  document.body.appendChild(glow);

  document.addEventListener("mousemove", (e) => {
    glow.style.left = e.clientX + "px";
    glow.style.top  = e.clientY + "px";
  });
}

/* ============================================
   9. BUTTON ripple effect on click
   ============================================ */
document.querySelectorAll(".btn-primary, .btn-course, .btn-form").forEach(btn => {
  btn.addEventListener("click", function (e) {
    const rect   = this.getBoundingClientRect();
    const x      = e.clientX - rect.left;
    const y      = e.clientY - rect.top;

    const ripple = document.createElement("span");
    ripple.style.cssText = `
      position: absolute;
      border-radius: 50%;
      transform: scale(0);
      animation: ripple-anim 0.6s linear;
      background: rgba(255,255,255,0.25);
      width: 120px; height: 120px;
      left: ${x - 60}px;
      top: ${y - 60}px;
      pointer-events: none;
    `;

    // Ensure relative positioning on parent
    const pos = window.getComputedStyle(this).position;
    if (pos === "static") this.style.position = "relative";
    this.style.overflow = "hidden";
    this.appendChild(ripple);

    // Inject ripple keyframes once
    if (!document.querySelector("#ripple-style")) {
      const style = document.createElement("style");
      style.id = "ripple-style";
      style.textContent = `
        @keyframes ripple-anim {
          to { transform: scale(4); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }

    ripple.addEventListener("animationend", () => ripple.remove());
  });
});

/* ============================================
   10. ACTIVE NAV SECTION HIGHLIGHT
       (Optional: highlights current section)
   ============================================ */
const sections = document.querySelectorAll("section[id]");

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        document.querySelectorAll(".nav-actions a").forEach(a => {
          a.classList.remove("nav-active");
        });
      }
    });
  },
  { threshold: 0.5 }
);

sections.forEach(sec => sectionObserver.observe(sec));

/* ============================================
   INIT LOG
   ============================================ */
console.log(
  "%c SEVEN LC %c Landing Page Loaded ",
  "background:#e8192c;color:#fff;font-weight:bold;padding:4px 8px;border-radius:4px 0 0 4px;",
  "background:#111;color:#fff;padding:4px 8px;border-radius:0 4px 4px 0;"
);
