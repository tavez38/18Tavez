/* =============================================
   script.js — 18esimo Tave Party Invitation
   ============================================= */

'use strict';

// ---- Particles Background ----
(function initParticles() {
  const container = document.getElementById('particles-container');
  if (!container) return;

  const PARTICLE_COUNT = 40;

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const p = document.createElement('div');
    p.className = 'particle';

    const size = Math.random() * 3 + 1;
    const left = Math.random() * 100;
    const duration = Math.random() * 20 + 15;
    const delay = Math.random() * 20;
    const opacity = Math.random() * 0.5 + 0.1;

    p.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${left}%;
      animation-duration: ${duration}s;
      animation-delay: -${delay}s;
      opacity: ${opacity};
    `;

    container.appendChild(p);
  }
})();

// ---- Navbar Scroll Effect ----
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  function updateNavbarScroll(e) {
    const scrollTop = e ? e.target.scrollTop : 0;
    const currentSection = document.querySelector('section:not(.hidden-section)');
    const isHome = currentSection && currentSection.id === 'home';
    
    if (scrollTop > 50 || !isHome) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  // Listen for scroll events on all sections
  document.querySelectorAll('.hero-section, .details-section, .pass-section').forEach(function(section) {
    section.addEventListener('scroll', updateNavbarScroll, { passive: true });
  });

  // Expose it globally so switchSection can update the navbar scroll status
  window.updateNavbarScrollStatus = function(sectionId) {
    const section = document.getElementById(sectionId);
    const scrollTop = section ? section.scrollTop : 0;
    if (scrollTop > 50 || sectionId !== 'home') {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };
})();

// ---- Section Navigation Logic ----
function switchSection(sectionId) {
  const sections = ['home', 'dettagli', 'pass'];
  
  sections.forEach(function(id) {
    const el = document.getElementById(id);
    if (!el) return;
    
    if (id === sectionId) {
      el.classList.remove('hidden-section');
      el.scrollTop = 0; // reset scroll inside the section
    } else {
      el.classList.add('hidden-section');
    }
  });

  // Update navbar links active state
  const navLinks = {
    home: document.getElementById('nav-home'),
    dettagli: document.getElementById('nav-details'),
    pass: document.getElementById('nav-pass'),
  };

  sections.forEach(function(id) {
    const link = navLinks[id];
    if (!link) return;
    if (id === sectionId) {
      link.style.color = 'rgba(255,255,255,0.9)';
    } else {
      link.style.color = '';
    }
  });

  // Update navbar background
  if (window.updateNavbarScrollStatus) {
    window.updateNavbarScrollStatus(sectionId);
  }
}

// ---- Setup Navigation Event Listeners ----
(function initNavigation() {
  // Add click listener to all buttons/links targeting sections
  document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href').slice(1);
      
      // Make sure the target is one of our main sections
      if (['home', 'dettagli', 'pass'].indexOf(targetId) !== -1) {
        e.preventDefault();
        switchSection(targetId);
      }
    });
  });

  // Set initial state
  switchSection('home');
})();

// ---- Countdown Timer ----
(function initCountdown() {
  const daysEl = document.getElementById('cd-days');
  const hoursEl = document.getElementById('cd-hours');
  const minsEl = document.getElementById('cd-mins');
  if (!daysEl || !hoursEl || !minsEl) return;

  // Party date: 26 June 2026 at 21:00 local time
  const partyDate = new Date('2026-06-26T21:00:00');

  function updateCountdown() {
    const now = new Date();
    const diff = partyDate - now;

    if (diff <= 0) {
      daysEl.textContent = '🎉';
      hoursEl.textContent = '🎉';
      minsEl.textContent = '🎉';
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    daysEl.textContent = String(days).padStart(2, '0');
    hoursEl.textContent = String(hours).padStart(2, '0');
    minsEl.textContent = String(mins).padStart(2, '0');
  }

  updateCountdown();
  setInterval(updateCountdown, 30000); // update every 30s
})();



// ---- Secret Question / Quiz Pass Flow ----
(function initPassFlow() {
  const stepQuestion = document.getElementById('step-question');
  const stepForm = document.getElementById('step-form');
  const btnGoToForm = document.getElementById('btn-go-to-form');

  // If the "Procedi al Pass" button is present, bind the transition logic
  if (btnGoToForm && stepQuestion && stepForm) {
    btnGoToForm.addEventListener('click', function() {
      stepQuestion.classList.add('hidden');
      stepForm.classList.remove('hidden');
      // Scroll to step-form
      stepForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  // Back button: step-form → step-question
  const btnBackToQuestion = document.getElementById('btn-back-to-question');
  if (btnBackToQuestion && stepForm && stepQuestion) {
    btnBackToQuestion.addEventListener('click', function() {
      stepForm.classList.add('hidden');
      stepQuestion.classList.remove('hidden');
      stepQuestion.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  // Back button: step-qr → step-form
  const stepQr = document.getElementById('step-qr');
  const btnBackToForm = document.getElementById('btn-back-to-form');
  if (btnBackToForm && stepQr && stepForm) {
    btnBackToForm.addEventListener('click', function() {
      stepQr.classList.add('hidden');
      stepForm.classList.remove('hidden');
      stepForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  // Also support the old secret question input if it exists
  const answerInput = document.getElementById('answer-input');
  const verifyBtn = document.getElementById('btn-verify-answer');
  const feedbackEl = document.getElementById('answer-feedback');

  if (answerInput && verifyBtn && feedbackEl && stepQuestion && stepForm) {
    const CORRECT_ANSWER = 'azzurro';

    function normalizeAnswer(str) {
      return str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // remove accents
        .trim();
    }

    function showFeedback(message, type) {
      feedbackEl.textContent = message;
      feedbackEl.className = 'answer-feedback ' + type;
    }

    function verifyAnswer() {
      const userAnswer = normalizeAnswer(answerInput.value);

      if (!userAnswer) {
        showFeedback('⚠️ Inserisci una risposta!', 'error');
        answerInput.focus();
        return;
      }

      if (userAnswer === CORRECT_ANSWER) {
        showFeedback('✅ Risposta corretta! Accesso concesso...', 'success');
        verifyBtn.disabled = true;
        answerInput.disabled = true;

        setTimeout(function() {
          stepQuestion.classList.add('hidden');
          stepForm.classList.remove('hidden');
          stepForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 1000);
      } else {
        showFeedback('❌ Risposta sbagliata. Collabora con gli altri invitati!', 'error');
        answerInput.classList.add('shake');
        answerInput.addEventListener('animationend', function() {
          answerInput.classList.remove('shake');
        }, { once: true });
      }
    }

    verifyBtn.addEventListener('click', verifyAnswer);
    answerInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') verifyAnswer();
    });
  }

  // ---- Form Submit Logic ----
  const regForm = document.getElementById('registration-form');
  if (regForm) {
    regForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Basic validation
      const nomeInput = document.getElementById('input-nome');
      const cognomeInput = document.getElementById('input-cognome');
      const dataInput = document.getElementById('input-datanascita');
      const emailInput = document.getElementById('input-email');
      
      if (!nomeInput || !cognomeInput || !dataInput || !emailInput) return;
      
      if (!nomeInput.value.trim() || !cognomeInput.value.trim() || !dataInput.value || !emailInput.value.trim()) {
        alert("⚠️ Per favore, compila tutti i campi!");
        return;
      }
      
      // Communicate that the section is in development and QR codes are not ready
      alert("🚧 Questa sezione è ancora in fase di sviluppo! I QR Code per l'ingresso non sono ancora pronti. Il festeggiato li caricherà a breve!");
      
      handleFormSubmit();
    });
  }
})();

// ---- QR Code Finder Logic ----
function handleFormSubmit() {
  const nomeInput = document.getElementById('input-nome');
  const cognomeInput = document.getElementById('input-cognome');
  const stepForm = document.getElementById('step-form');
  const stepQr = document.getElementById('step-qr');

  if (!nomeInput || !cognomeInput) return;

  const nome = nomeInput.value.trim();
  const cognome = cognomeInput.value.trim();

  if (!nome || !cognome) return;

  // Build filename base: nome_cognome (lowercase, spaces replaced)
  const fileBase = (nome + '_' + cognome)
    .toLowerCase()
    .replace(/\s+/g, '_')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ''); // remove accents for filename

  // All common image extensions to try
  const extensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg', 'avif', 'tiff', 'tif', 'img'];

  tryLoadQR(fileBase, extensions, 0, nome, cognome);
}

function tryLoadQR(fileBase, extensions, index, nome, cognome) {
  const stepForm = document.getElementById('step-form');
  const stepQr = document.getElementById('step-qr');
  const qrImage = document.getElementById('qr-image');
  const qrName = document.getElementById('qr-name');
  const qrDisplay = document.getElementById('qr-display');
  const qrNotFound = document.getElementById('qr-not-found');
  const qrActions = document.getElementById('qr-actions');
  const downloadBtn = document.getElementById('btn-download-qr');
  const welcomeText = document.getElementById('qr-welcome-text');

  if (index >= extensions.length) {
    // Not found — show not found message
    stepForm.classList.add('hidden');
    stepQr.classList.remove('hidden');
    qrDisplay.classList.add('hidden');
    qrNotFound.classList.remove('hidden');
    qrActions.classList.add('hidden');
    stepQr.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return;
  }

  const ext = extensions[index];
  const src = 'img/' + fileBase + '.' + ext;

  const testImg = new Image();

  testImg.onload = function() {
    // Found! Show QR
    stepForm.classList.add('hidden');
    stepQr.classList.remove('hidden');

    qrImage.src = src;
    qrImage.alt = 'QR Code di ' + nome + ' ' + cognome;
    qrName.textContent = nome + ' ' + cognome;
    if (welcomeText) welcomeText.textContent = 'Benvenuto, ' + nome + '! Ecco il tuo QR Code personale.';

    qrDisplay.classList.remove('hidden');
    qrNotFound.classList.add('hidden');
    qrActions.classList.remove('hidden');

    // Set download link
    downloadBtn.href = src;
    downloadBtn.download = 'pass_' + fileBase + '.' + ext;

    stepQr.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  testImg.onerror = function() {
    // Try next extension
    tryLoadQR(fileBase, extensions, index + 1, nome, cognome);
  };

  testImg.src = src;
}

// ---- Shake animation (CSS injection) ----
(function injectShakeCSS() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      10%, 50%, 90% { transform: translateX(-8px); }
      30%, 70% { transform: translateX(8px); }
    }
    .shake {
      animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
    }
  `;
  document.head.appendChild(style);
})();



// ---- Card shimmer on hover ----
(function initCardShimmer() {
  document.querySelectorAll('.detail-card').forEach(function(card) {
    card.addEventListener('mousemove', function(e) {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--mouse-x', x + '%');
      card.style.setProperty('--mouse-y', y + '%');
    });
  });
})();
