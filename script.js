// =====================================================
//  SEVEN LC — JavaScript fayli
//  Vazifalar: Forma validatsiyasi, muvaffaqiyat xabari,
//             navbar scroll effekti, telefon formati
// =====================================================


// ===== NAVBAR SCROLL EFFEKTI =====
// Sahifa pastga siljiganda navbar ko'rinishini o'zgartiradi

const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});


const TOKEN = "1843165785:AAFWdcKM8t-bS-E0itVylbZzcID2bu9cWLg";
const CHAT_ID = "1534900074";

const form = document.getElementById("leadForm");

form.addEventListener("submit", function(e) {
e.preventDefault();

const name = document.getElementById("name").value;
const phone = document.getElementById("phone").value;

const message = `
🔥 Yangi LID!

👤 Ism: ${name}
📞 Telefon: ${phone}
`;

fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
method: "POST",
headers: {
"Content-Type": "application/json"
},
body: JSON.stringify({
chat_id: CHAT_ID,
text: message
})
})
.then(() => {
alert("So'rovingiz yuborildi!");
form.reset();
})
.catch(() => {
alert("Xatolik yuz berdi!");
});

});


// ===== TELEFON RAQAM FORMATLASH =====
// Foydalanuvchi telefon raqam kiritayotganda avtomatik formatlaydi

const phoneInput = document.getElementById('phoneInput');

phoneInput.addEventListener('input', (e) => {
  // Faqat raqamlarni qoldirib, boshqasini o'chiradi
  let raw = e.target.value.replace(/\D/g, '');

  // +998 prefiksi bo'lmasa qo'shadi
  if (raw.startsWith('998')) {
    raw = raw;
  } else if (!raw.startsWith('998') && raw.length > 0) {
    raw = '998' + raw;
  }

  // 998 XX XXX XX XX formatiga keltiradi
  let formatted = '+';
  if (raw.length >= 3)  formatted += raw.slice(0, 3);
  if (raw.length >= 5)  formatted += ' ' + raw.slice(3, 5);
  if (raw.length >= 8)  formatted += ' ' + raw.slice(5, 8);
  if (raw.length >= 10) formatted += ' ' + raw.slice(8, 10);
  if (raw.length >= 12) formatted += ' ' + raw.slice(10, 12);
  else if (raw.length > 10) formatted += ' ' + raw.slice(10);

  e.target.value = formatted;
});


// ===== FORMA VALIDATSIYASI =====
// Barcha maydonlarni tekshiradi va xato ko'rsatadi

function validateForm() {
  const name  = document.getElementById('nameInput').value.trim();
  const phone = document.getElementById('phoneInput').value.trim();
  const age   = document.getElementById('ageInput').value.trim();
  const city  = document.getElementById('citySelect').value;

  // Xatolarni saqlash uchun massiv
  const errors = [];

  // Ism tekshiruvi
  if (!name || name.length < 2) {
    errors.push('nameInput');
    shakeField('nameInput');
  }

  // Telefon tekshiruvi (kamida 7 raqam bo'lishi kerak)
  const rawPhone = phone.replace(/\D/g, '');
  if (!rawPhone || rawPhone.length < 7) {
    errors.push('phoneInput');
    shakeField('phoneInput');
  }

  // Yosh tekshiruvi
  const ageNum = parseInt(age);
  if (!age || ageNum < 5 || ageNum > 70) {
    errors.push('ageInput');
    shakeField('ageInput');
  }

  // Shahar tekshiruvi
  if (!city) {
    errors.push('citySelect');
    shakeField('citySelect');
  }

  // Agar xato bo'lmasa — true qaytaradi
  return errors.length === 0;
}


// ===== QALTIRASH ANIMATSIYASI =====
// Noto'g'ri to'ldirilgan maydonni qaltiradi (diqqatni jalb qilish)

function shakeField(fieldId) {
  const field = document.getElementById(fieldId);
  if (!field) return;

  // Qizil chegara qo'shadi
  field.style.borderColor = '#d90000';
  field.style.boxShadow = '0 0 0 4px rgba(217,0,0,0.15)';

  // CSS animatsiyasi qo'shadi
  field.style.animation = 'none';
  setTimeout(() => {
    field.style.animation = 'shake 0.4s ease';
  }, 10);

  // 3 soniyadan so'ng normal holatga qaytaradi
  setTimeout(() => {
    field.style.borderColor = '';
    field.style.boxShadow = '';
    field.style.animation = '';
  }, 3000);
}

// Shake animatsiyasini CSS ga qo'shadi (dinamik)
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    20% { transform: translateX(-8px); }
    40% { transform: translateX(8px); }
    60% { transform: translateX(-5px); }
    80% { transform: translateX(5px); }
  }
`;
document.head.appendChild(shakeStyle);


// ===== FORMA YUBORISH =====
// Asosiy funksiya — validatsiya, loading, va muvaffaqiyat holati

function submitForm() {
  // Validatsiyadan o'tmasa — to'xtaydi
  if (!validateForm()) return;

  const btn = document.getElementById('submitBtn');

  // Tugmani yuklash holatiga o'tkazadi
  btn.disabled = true;
  btn.style.opacity = '0.8';
  btn.querySelector('.btn-text').textContent = '⏳ Yuborilmoqda...';

  // 1.5 soniya kutish (real API so'rovi simulatsiyasi)
  setTimeout(() => {
    showSuccess();
  }, 1500);
}


// ===== MUVAFFAQIYAT XABARI KO'RSATISH =====
// Formani yashirib, chiroyli muvaffaqiyat xabarini ko'rsatadi

function showSuccess() {
  const form    = document.getElementById('leadForm');
  const success = document.getElementById('successMessage');
  const header  = document.querySelector('.form-header');

  // Forma va sarlavhani yashiradi — yumshoq o'tish
  form.style.transition   = 'opacity 0.4s ease, transform 0.4s ease';
  header.style.transition = 'opacity 0.4s ease';

  form.style.opacity   = '0';
  form.style.transform = 'translateY(10px)';
  header.style.opacity = '0';

  // 0.4 soniyadan so'ng formani to'liq yashiradi va xabarni ko'rsatadi
  setTimeout(() => {
    form.style.display   = 'none';
    header.style.display = 'none';

    success.classList.add('visible');

    // Konfetti effekti yaratadi
    createConfetti();
  }, 400);
}


// ===== KONFETTI EFFEKTI =====
// Muvaffaqiyatli yuborilganda rangli konfettilar uchiradi

function createConfetti() {
  const colors = ['#d90000', '#ff1a1a', '#ffffff', '#ff6666', '#ffcccc', '#cc0000'];
  const count  = 60; // konfetti soni

  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      const el = document.createElement('div');

      // Konfetti uslubi
      el.style.cssText = `
        position: fixed;
        top: -10px;
        left: ${Math.random() * 100}vw;
        width: ${Math.random() * 8 + 4}px;
        height: ${Math.random() * 8 + 4}px;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
        z-index: 9999;
        pointer-events: none;
        opacity: 1;
      `;

      document.body.appendChild(el);

      // Tushish animatsiyasi
      const duration = Math.random() * 2000 + 1500;
      const xDrift   = (Math.random() - 0.5) * 200;
      const rotate   = Math.random() * 720;

      el.animate([
        {
          transform: `translateY(0) translateX(0) rotate(0deg)`,
          opacity: 1
        },
        {
          transform: `translateY(100vh) translateX(${xDrift}px) rotate(${rotate}deg)`,
          opacity: 0
        }
      ], {
        duration:   duration,
        easing:     'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        fill:       'forwards'
      }).onfinish = () => {
        el.remove(); // DOM ni tozalaydi
      };

    }, i * 30); // Har bir konfettini biroz kech chiqaradi
  }
}


// ===== INPUT FOCUS EFFEKTI =====
// Inputlarga focus bo'lganda label rangini o'zgartiradi

document.querySelectorAll('.field-input').forEach(input => {
  input.addEventListener('focus', () => {
    const label = input.closest('.field-group')?.querySelector('.field-label');
    if (label) {
      label.style.color = '#d90000';
      label.style.transition = 'color 0.3s ease';
    }
  });

  input.addEventListener('blur', () => {
    const label = input.closest('.field-group')?.querySelector('.field-label');
    if (label) {
      label.style.color = '';
    }
  });
});


// ===== SMOOTH ANCHOR SCROLL =====
// Navbar havolalarini bosqanda silliq o'tkazadi

document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const targetId = link.getAttribute('href');
    const target   = document.querySelector(targetId);

    if (target) {
      e.preventDefault();
      const offset = 80; // Navbar balandligi
      const top    = target.getBoundingClientRect().top + window.scrollY - offset;

      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});


// ===== STATISTIKA ANIMATSIYASI =====
// Raqamlarni 0 dan boshlagan holda hisoblaydi (count-up effekti)

function animateCountUp(el, target, duration = 1500) {
  const isPercent = target.includes('%');
  const isPlus    = target.includes('+');
  const num       = parseInt(target.replace(/\D/g, ''));

  let start   = 0;
  const step  = num / (duration / 16); // 60fps

  const timer = setInterval(() => {
    start += step;
    if (start >= num) {
      start = num;
      clearInterval(timer);
    }

    const suffix = isPlus ? '+' : isPercent ? '%' : '';
    el.querySelector('.stat-number').innerHTML =
      `${Math.floor(start)}<span class="stat-plus">${suffix}</span>`;
  }, 16);
}

// Intersection Observer — element ko'ringa kirganida animatsiya boshlaydi
const statCards = document.querySelectorAll('.stat-card');
const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const card   = entry.target;
      const numEl  = card.querySelector('.stat-number');
      const label  = card.querySelector('.stat-label').textContent;

      // Har bir statistika uchun maqsad qiymat
      let target = '0';
      if (label.includes("o'quvchi")) target = '500+';
      if (label.includes('natija'))   target = '90%';
      if (label.includes('tajriba'))  target = '7+';

      animateCountUp(card, target, 1800);
      statsObserver.unobserve(card); // Faqat bir marta ishlaydi
    }
  });
}, { threshold: 0.5 });

statCards.forEach(card => statsObserver.observe(card));


// ===== SAHIFA TAYYOR =====
console.log('🚀 SEVEN LC sahifasi muvaffaqiyatli yuklandi!');
