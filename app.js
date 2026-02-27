// ========== THEME TOGGLE (White / Black) ==========
const themeToggle = document.getElementById('theme-toggle');
const STORAGE_KEY = 'fisher-ceremonies-theme';

function setTheme(theme) {
  document.body.classList.remove('theme-dark', 'theme-light');
  document.body.classList.add(theme === 'light' ? 'theme-light' : 'theme-dark');
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch (e) {}
}

function initTheme() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') {
      setTheme(saved);
    }
  } catch (e) {}
}

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const isLight = document.body.classList.contains('theme-light');
    setTheme(isLight ? 'dark' : 'light');
  });
}

initTheme();

// ========== STICKY HEADER: Hide on scroll down, show on scroll up ==========
const header = document.getElementById('header');
let lastScrollY = window.scrollY;
let ticking = false;

function updateHeader() {
  const scrollY = window.scrollY;
  const scrollDelta = scrollY - lastScrollY;

  if (scrollY < 80) {
    header.classList.remove('hidden');
  } else if (scrollDelta > 5) {
    header.classList.add('hidden');
  } else if (scrollDelta < -5) {
    header.classList.remove('hidden');
  }

  lastScrollY = scrollY;
  ticking = false;
}

window.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(updateHeader);
    ticking = true;
  }
}, { passive: true });

// ========== PARALLAX EFFECTS ==========
function updateParallax() {
  const scrollY = window.scrollY;

  // Hero background - moves slower than scroll for depth
  const heroBg = document.querySelector('.hero-bg');
  if (heroBg) {
    const speed = 0.25;
    heroBg.style.transform = `translate3d(0, ${scrollY * speed}px, 0)`;
  }

  // Section backgrounds - subtle movement based on viewport position
  document.querySelectorAll('.parallax-wrap[data-speed]').forEach((wrap) => {
    const speed = parseFloat(wrap.getAttribute('data-speed')) || 0.1;
    const rect = wrap.getBoundingClientRect();
    const centerY = rect.top + rect.height / 2;
    const viewportCenter = window.innerHeight / 2;
    const offset = (centerY - viewportCenter) * speed;

    const bg = wrap.querySelector('.section-bg');
    if (bg) {
      bg.style.transform = `translate3d(0, ${offset}px, 0)`;
    }
  });
}

window.addEventListener('scroll', () => {
  requestAnimationFrame(updateParallax);
}, { passive: true });

window.addEventListener('load', updateParallax);

// ========== READ MORE / READ LESS - Celebrant cards ==========
document.querySelectorAll('.celebrant-card').forEach((card) => {
  const btn = card.querySelector('.read-more');
  const textSpan = card.querySelector('.read-more-text');

  if (!btn || !textSpan) return;

  btn.addEventListener('click', () => {
    const isExpanded = card.classList.contains('expanded');

    if (isExpanded) {
      card.classList.remove('expanded');
      textSpan.textContent = 'Read more';
    } else {
      card.classList.add('expanded');
      textSpan.textContent = 'Read less';
    }
  });
});

// ========== JESSE CARD: DUMMY CALM PIANO SAMPLE ==========
const celebrantAudioBtn = document.querySelector('.celebrant-audio-btn');
let calmAudioCtx = null;
let calmSampleStopTimer = null;

function playPianoStyleNote(ctx, frequency, startAt, duration) {
  const osc = ctx.createOscillator();
  const tone = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'triangle';
  tone.type = 'sine';
  osc.frequency.setValueAtTime(frequency, startAt);
  tone.frequency.setValueAtTime(frequency * 2, startAt);

  gain.gain.setValueAtTime(0.0001, startAt);
  gain.gain.exponentialRampToValueAtTime(0.2, startAt + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);

  osc.connect(gain);
  tone.connect(gain);
  gain.connect(ctx.destination);

  osc.start(startAt);
  tone.start(startAt);
  osc.stop(startAt + duration + 0.05);
  tone.stop(startAt + duration + 0.05);
}

function stopCalmSamplePlayback() {
  if (calmSampleStopTimer) {
    clearTimeout(calmSampleStopTimer);
    calmSampleStopTimer = null;
  }
  if (celebrantAudioBtn) {
    celebrantAudioBtn.textContent = 'Play sample piano music';
    celebrantAudioBtn.classList.remove('is-playing');
    celebrantAudioBtn.setAttribute('aria-pressed', 'false');
  }
}

function playCalmSamplePiano() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass || !celebrantAudioBtn) return;

  if (!calmAudioCtx) {
    calmAudioCtx = new AudioContextClass();
  }
  if (calmAudioCtx.state === 'suspended') {
    calmAudioCtx.resume();
  }

  const now = calmAudioCtx.currentTime + 0.03;
  const melody = [
    261.63, 329.63, 392.0, 329.63,
    293.66, 349.23, 440.0, 349.23,
    261.63, 329.63, 392.0, 349.23,
    293.66, 261.63, 246.94, 220.0
  ];
  const step = 0.42;
  const noteLength = 0.36;

  melody.forEach((freq, i) => {
    const startAt = now + i * step;
    playPianoStyleNote(calmAudioCtx, freq, startAt, noteLength);
  });

  celebrantAudioBtn.textContent = 'Stop sample piano music';
  celebrantAudioBtn.classList.add('is-playing');
  celebrantAudioBtn.setAttribute('aria-pressed', 'true');

  calmSampleStopTimer = setTimeout(() => {
    stopCalmSamplePlayback();
  }, Math.ceil((melody.length * step + 0.5) * 1000));
}

if (celebrantAudioBtn) {
  celebrantAudioBtn.setAttribute('aria-pressed', 'false');
  celebrantAudioBtn.addEventListener('click', () => {
    const isPlaying = celebrantAudioBtn.classList.contains('is-playing');
    if (isPlaying) {
      stopCalmSamplePlayback();
    } else {
      playCalmSamplePiano();
    }
  });
}

// ========== RESOURCES ACCORDION ==========
document.querySelectorAll('.accordion-trigger').forEach((trigger) => {
  trigger.addEventListener('click', () => {
    const item = trigger.closest('.accordion-item');
    const panel = item ? item.querySelector('.accordion-panel') : null;
    const isExpanded = item.classList.contains('expanded');

    // Close other accordion items
    document.querySelectorAll('.accordion-item').forEach((other) => {
      if (other !== item) {
        other.classList.remove('expanded');
        const otherTrigger = other.querySelector('.accordion-trigger');
        const otherPanel = other.querySelector('.accordion-panel');
        if (otherTrigger) otherTrigger.setAttribute('aria-expanded', 'false');
        if (otherPanel) otherPanel.style.maxHeight = '0px';
      }
    });

    if (isExpanded) {
      item.classList.remove('expanded');
      trigger.setAttribute('aria-expanded', 'false');
      if (panel) panel.style.maxHeight = '0px';
    } else {
      item.classList.add('expanded');
      trigger.setAttribute('aria-expanded', 'true');
      if (panel) panel.style.maxHeight = `${panel.scrollHeight}px`;
    }
  });
});

window.addEventListener('resize', () => {
  document.querySelectorAll('.accordion-item.expanded .accordion-panel').forEach((panel) => {
    panel.style.maxHeight = `${panel.scrollHeight}px`;
  });
});

// ========== SMOOTH SCROLL FOR NAV LINKS ==========
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (href === '#') return;
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ========== TESTIMONIALS AUTO-SCROLL CAROUSEL ==========
const testimonialsTrack = document.querySelector('.testimonials-track');
const testimonialCards = document.querySelectorAll('.testimonial-card');
const testimonialsDots = document.querySelector('.testimonials-dots');
let testimonialIndex = 0;
let testimonialInterval;
let cardsPerView = 3;

function updateCardsPerView() {
  if (window.innerWidth <= 600) {
    cardsPerView = 1;
  } else if (window.innerWidth <= 900) {
    cardsPerView = 2;
  } else {
    cardsPerView = 3;
  }
}

function getCardWidth() {
  if (!testimonialCards[0]) return 0;
  const card = testimonialCards[0];
  const style = window.getComputedStyle(card);
  const width = card.offsetWidth;
  const marginRight = parseFloat(style.marginRight) || 0;
  return width + marginRight;
}

function scrollToIndex(index, instant = false) {
  if (!testimonialsTrack || testimonialCards.length === 0) return;
  
  const cardWidth = getCardWidth();
  const offset = -index * cardWidth;
  
  if (instant) {
    testimonialsTrack.style.transition = 'none';
  } else {
    testimonialsTrack.style.transition = 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
  }
  
  testimonialsTrack.style.transform = `translateX(${offset}px)`;
  testimonialIndex = index;

  if (testimonialsDots) {
    testimonialsDots.querySelectorAll('.testimonials-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });
  }
}

function nextTestimonial() {
  if (testimonialCards.length === 0) return;
  
  const next = (testimonialIndex + 1) % testimonialCards.length;
  scrollToIndex(next);
}

if (testimonialCards.length > 0 && testimonialsTrack) {
  updateCardsPerView();
  window.addEventListener('resize', () => {
    updateCardsPerView();
    scrollToIndex(testimonialIndex);
  });

  if (testimonialsDots) {
    testimonialCards.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'testimonials-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', `View testimonial ${i + 1}`);
      dot.addEventListener('click', () => {
        scrollToIndex(i);
        clearInterval(testimonialInterval);
        testimonialInterval = setInterval(nextTestimonial, 4000);
      });
      testimonialsDots.appendChild(dot);
    });
  }

  testimonialInterval = setInterval(nextTestimonial, 4000);
}

// ========== MODERN CALENDAR (FLATPICKR) ==========
const dateInput = document.getElementById('date');
if (dateInput && typeof flatpickr !== 'undefined') {
  const calendar = flatpickr(dateInput, {
    dateFormat: 'd M Y',
    minDate: 'today',
    allowInput: true,
    clickOpens: true,
    animate: true,
    monthSelectorType: 'static'
  });
}

// ========== CONTACT FORM SUBMIT ==========
// Form submits to FormSubmit.co which sends to brijeshnegi.86@gmail.com
// No preventDefault - form submits normally

// ========== MOBILE NAV TOGGLE ==========
const navToggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.nav');

if (navToggle && nav) {
  navToggle.addEventListener('click', () => {
    nav.classList.toggle('open');
    navToggle.classList.toggle('active');
  });
}
