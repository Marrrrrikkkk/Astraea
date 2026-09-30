/**
 * ASTRAEA — INTERACTIVE CLIENT SCRIPT
 * Vanilla ES6+ Modular front-end logic:
 * - Theme Switcher (Dark/Light with system preference & localStorage)
 * - Mobile Navigation Menu & Backdrop
 * - Active Navigation Spy & Smooth Scrolling
 * - Animated Metric Counters (IntersectionObserver)
 * - Interactive Feature Card Glow Tracker
 * - Contact Form Validation & Animated Toast System
 */

document.addEventListener('DOMContentLoaded', () => {
  initThemeManager();
  initMobileNavigation();
  initScrollSpy();
  initMetricCounters();
  initFeatureCardEffects();
  initContactForm();
});

/* ==========================================================================
   1. THEME MANAGER (DARK / LIGHT MODE)
   ========================================================================== */
function initThemeManager() {
  const themeToggle = document.getElementById('theme-toggle');
  const root = document.documentElement;
  const STORAGE_KEY = 'astraea_theme_preference';

  // Check saved theme or system preference
  const savedTheme = localStorage.getItem(STORAGE_KEY);
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  const currentTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
  applyTheme(currentTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const activeTheme = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(activeTheme);
      localStorage.setItem(STORAGE_KEY, activeTheme);
    });
  }

  // Listen for system theme changes if user hasn't explicitly set a preference
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      applyTheme(e.matches ? 'dark' : 'light');
    }
  });

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    if (themeToggle) {
      const isDark = theme === 'dark';
      themeToggle.setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme');
      themeToggle.setAttribute('title', isDark ? 'Switch to light theme' : 'Switch to dark theme');
    }
  }
}

/* ==========================================================================
   2. MOBILE NAVIGATION MENU
   ========================================================================== */
function initMobileNavigation() {
  const mobileToggle = document.getElementById('mobile-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navBackdrop = document.getElementById('nav-backdrop');
  const navLinks = document.querySelectorAll('.nav-link, .nav-cta-mobile a');

  if (!mobileToggle || !navMenu || !navBackdrop) return;

  function openMenu() {
    mobileToggle.classList.add('active');
    mobileToggle.setAttribute('aria-expanded', 'true');
    navMenu.classList.add('open');
    navBackdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    mobileToggle.classList.remove('active');
    mobileToggle.setAttribute('aria-expanded', 'false');
    navMenu.classList.remove('open');
    navBackdrop.classList.remove('active');
    document.body.style.overflow = '';
  }

  mobileToggle.addEventListener('click', () => {
    const isExpanded = mobileToggle.getAttribute('aria-expanded') === 'true';
    if (isExpanded) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  // Close when clicking the backdrop
  navBackdrop.addEventListener('click', closeMenu);

  // Close when clicking any nav link
  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      if (navMenu.classList.contains('open')) {
        closeMenu();
      }
    });
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navMenu.classList.contains('open')) {
      closeMenu();
      mobileToggle.focus();
    }
  });

  // Automatically reset menu if window is resized past mobile breakpoint
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && navMenu.classList.contains('open')) {
      closeMenu();
    }
  });
}

/* ==========================================================================
   3. SCROLL SPY & NAVIGATION LINK HIGHLIGHTING
   ========================================================================== */
function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  if (!sections.length || !navLinks.length) return;

  const observerOptions = {
    root: null,
    rootMargin: '-25% 0px -60% 0px',
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach((link) => {
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach((section) => observer.observe(section));
}

/* ==========================================================================
   4. ANIMATED METRICS COUNTERS
   ========================================================================== */
function initMetricCounters() {
  const counterElements = document.querySelectorAll('.metric-number');
  if (!counterElements.length) return;

  const observerOptions = {
    threshold: 0.35,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries, observerInstance) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        animateCount(el);
        observerInstance.unobserve(el);
      }
    });
  }, observerOptions);

  counterElements.forEach((el) => observer.observe(el));

  function animateCount(el) {
    const target = parseFloat(el.getAttribute('data-target')) || 0;
    const decimals = parseInt(el.getAttribute('data-decimals'), 10) || 0;
    const duration = 2000; // ms
    const startTime = performance.now();

    function update(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function: Ease-Out Quint
      const easeOut = 1 - Math.pow(1 - progress, 5);
      const currentValue = target * easeOut;

      el.textContent = decimals > 0 
        ? currentValue.toFixed(decimals) 
        : Math.floor(currentValue).toLocaleString();

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = decimals > 0 ? target.toFixed(decimals) : target.toLocaleString();
      }
    }

    requestAnimationFrame(update);
  }
}

/* ==========================================================================
   5. INTERACTIVE FEATURE CARD MOUSE TRACKING
   ========================================================================== */
function initFeatureCardEffects() {
  const featureCards = document.querySelectorAll('.feature-card');
  
  featureCards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });
}

/* ==========================================================================
   6. CONTACT FORM VALIDATION & TOAST NOTIFICATION
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById('contact-form');
  const submitBtn = document.getElementById('submit-btn');

  if (!form || !submitBtn) return;

  const fields = {
    name: {
      input: document.getElementById('contact-name'),
      group: document.getElementById('contact-name')?.closest('.form-group'),
      validate: (val) => val.trim().length >= 2
    },
    email: {
      input: document.getElementById('contact-email'),
      group: document.getElementById('contact-email')?.closest('.form-group'),
      validate: (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim())
    },
    subject: {
      input: document.getElementById('contact-subject'),
      group: document.getElementById('contact-subject')?.closest('.form-group'),
      validate: (val) => val && val.trim() !== ''
    },
    message: {
      input: document.getElementById('contact-message'),
      group: document.getElementById('contact-message')?.closest('.form-group'),
      validate: (val) => val.trim().length >= 10
    }
  };

  // Clear validation error on field typing/selection
  Object.values(fields).forEach(({ input, group }) => {
    if (!input || !group) return;
    
    const eventType = input.tagName.toLowerCase() === 'select' ? 'change' : 'input';
    input.addEventListener(eventType, () => {
      group.classList.remove('has-error');
      input.classList.remove('is-invalid');
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    let isValid = true;
    let firstInvalidInput = null;

    // Run client-side validation
    Object.values(fields).forEach(({ input, group, validate }) => {
      if (!input || !group) return;

      const valid = validate(input.value);
      if (!valid) {
        group.classList.add('has-error');
        input.classList.add('is-invalid');
        isValid = false;
        if (!firstInvalidInput) firstInvalidInput = input;
      } else {
        group.classList.remove('has-error');
        input.classList.remove('is-invalid');
      }
    });

    if (!isValid) {
      if (firstInvalidInput) firstInvalidInput.focus();
      showToast('Validation Error', 'Please complete all required fields correctly before submitting.', 'error', 4000);
      return;
    }

    // Set loading state
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    // Simulate realistic async dispatch (e.g. Serverless API or webhook)
    try {
      await simulateServerRequest();

      // Success feedback
      const userName = fields.name.input.value.trim().split(' ')[0] || 'Friend';
      showToast(
        'Inquiry Dispatched Successfully!',
        `Thank you ${userName}. An Astraea platform architect will reach out to you within 2 hours.`,
        'success',
        5000
      );

      // Reset form
      form.reset();
    } catch (err) {
      showToast('Transmission Failed', 'Could not dispatch message. Please retry in a few moments.', 'error', 4500);
    } finally {
      submitBtn.classList.remove('loading');
      submitBtn.disabled = false;
    }
  });

  function simulateServerRequest() {
    return new Promise((resolve) => setTimeout(resolve, 1200));
  }
}

/**
 * Animated Toast Notification System
 * @param {string} title - Heading of toast
 * @param {string} message - Descriptive text
 * @param {'success'|'error'|'info'} type - Type of toast
 * @param {number} duration - Milliseconds until auto-dismiss
 */
function showToast(title, message, type = 'success', duration = 4000) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.setAttribute('role', 'alert');

  const iconSvg = type === 'success'
    ? `<svg class="toast-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
         <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
         <polyline points="22 4 12 14.01 9 11.01"></polyline>
       </svg>`
    : `<svg class="toast-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
         <circle cx="12" cy="12" r="10"></circle>
         <line x1="12" y1="8" x2="12" y2="12"></line>
         <line x1="12" y1="16" x2="12.01" y2="16"></line>
       </svg>`;

  toast.innerHTML = `
    ${iconSvg}
    <div class="toast-body">
      <div class="toast-title">${escapeHtml(title)}</div>
      <div class="toast-message">${escapeHtml(message)}</div>
    </div>
    <button class="toast-close" aria-label="Dismiss notification">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </button>
    <div class="toast-progress" style="animation-duration: ${duration}ms;"></div>
  `;

  const removeToast = () => {
    if (toast.classList.contains('toast-hiding')) return;
    toast.classList.add('toast-hiding');
    toast.addEventListener('animationend', () => {
      if (toast.parentElement) {
        toast.parentElement.removeChild(toast);
      }
    });
  };

  // Close button click handler
  const closeBtn = toast.querySelector('.toast-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', removeToast);
  }

  // Auto-dismiss timer
  const dismissTimer = setTimeout(removeToast, duration);

  // Pause dismiss on hover
  toast.addEventListener('mouseenter', () => {
    clearTimeout(dismissTimer);
    const progress = toast.querySelector('.toast-progress');
    if (progress) progress.style.animationPlayState = 'paused';
  });

  toast.addEventListener('mouseleave', () => {
    const progress = toast.querySelector('.toast-progress');
    if (progress) progress.style.animationPlayState = 'running';
    setTimeout(removeToast, 1500);
  });

  container.appendChild(toast);
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
