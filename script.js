/* ═══════════════════════════════════════════
   SCROLL PROGRESS BAR
═══════════════════════════════════════════ */
(function () {
  const bar = document.getElementById('scrollProgress');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const pct = window.scrollY / (document.body.scrollHeight - window.innerHeight);
    bar.style.width = `${Math.min(pct * 100, 100)}%`;
  }, { passive: true });
})();

/* ═══════════════════════════════════════════
   HERO SPOTLIGHT (mouse-follow amber glow)
═══════════════════════════════════════════ */
(function () {
  const hero = document.getElementById('hero');
  if (!hero) return;
  hero.addEventListener('mousemove', e => {
    const r = hero.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width  * 100).toFixed(1);
    const y = ((e.clientY - r.top)  / r.height * 100).toFixed(1);
    hero.style.setProperty('--mx', `${x}%`);
    hero.style.setProperty('--my', `${y}%`);
  });
})();

/* ═══════════════════════════════════════════
   PARTICLE CANVAS — amber
═══════════════════════════════════════════ */
(function () {
  const canvas = document.getElementById('particles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let particles = [];
  let raf = null;
  const mouse = { x: null, y: null };

  function resize() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }

  class Particle {
    constructor() { this.init(); }
    init() {
      this.x  = Math.random() * canvas.width;
      this.y  = Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * 0.28;
      this.vy = (Math.random() - 0.5) * 0.28;
      this.r  = Math.random() * 1.1 + 0.3;
      this.a  = Math.random() * 0.35 + 0.05;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > canvas.width)  this.vx *= -1;
      if (this.y < 0 || this.y > canvas.height)  this.vy *= -1;
      if (mouse.x !== null) {
        const dx = this.x - mouse.x, dy = this.y - mouse.y;
        const d = Math.hypot(dx, dy);
        if (d < 100) {
          const f = (100 - d) / 100;
          this.x += (dx / d) * f * 1.4;
          this.y += (dy / d) * f * 1.4;
        }
      }
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200,151,58,${this.a})`;
      ctx.fill();
    }
  }

  function buildParticles() {
    particles = [];
    const n = Math.min(Math.floor((canvas.width * canvas.height) / 10000), 130);
    for (let i = 0; i < n; i++) particles.push(new Particle());
  }

  function connect() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const d = Math.hypot(particles[i].x - particles[j].x, particles[i].y - particles[j].y);
        if (d < 85) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(200,151,58,${0.07 * (1 - d / 85)})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    connect();
    raf = requestAnimationFrame(animate);
  }

  const heroSection = document.getElementById('hero');
  if (heroSection) {
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { if (!raf) animate(); }
      else { cancelAnimationFrame(raf); raf = null; }
    }, { threshold: 0 }).observe(heroSection);
  }

  window.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });

  window.addEventListener('resize', () => { resize(); buildParticles(); });
  resize();
  buildParticles();
  animate();
})();

/* ═══════════════════════════════════════════
   TOP NAV — scroll visibility + section tracking
═══════════════════════════════════════════ */
(function () {
  const nav      = document.getElementById('topNav');
  const navLabel = document.getElementById('navLabel');
  const navLinks = document.querySelectorAll('.nav-links a');
  if (!nav) return;

  window.addEventListener('scroll', () => {
    nav.classList.toggle('visible', window.scrollY > 80);
  }, { passive: true });

  const sections = Array.from(document.querySelectorAll('section[id]'));

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const id    = e.target.id;
      const label = e.target.dataset.navLabel || id;
      if (navLabel) navLabel.textContent = label;
      navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === `#${id}`));
    });
  }, { threshold: 0.3 });

  sections.forEach(s => obs.observe(s));
})();

/* ═══════════════════════════════════════════
   MOBILE NAV TOGGLE
═══════════════════════════════════════════ */
(function () {
  const hamburger = document.getElementById('navHamburger');
  const mobileNav = document.getElementById('mobileNav');
  if (!hamburger || !mobileNav) return;

  hamburger.addEventListener('click', () => {
    const open = mobileNav.classList.toggle('open');
    hamburger.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });

  document.addEventListener('click', e => {
    if (mobileNav.classList.contains('open') && !mobileNav.contains(e.target) && e.target !== hamburger) {
      closeMobileNav();
    }
  });
})();

function closeMobileNav() {
  const mobileNav = document.getElementById('mobileNav');
  const hamburger = document.getElementById('navHamburger');
  if (mobileNav) mobileNav.classList.remove('open');
  if (hamburger) hamburger.classList.remove('open');
  document.body.style.overflow = '';
}

/* ═══════════════════════════════════════════
   SCROLL REVEAL + EYEBROW LINES
═══════════════════════════════════════════ */
(function () {
  const targets = document.querySelectorAll('.reveal, .reveal-eyebrow');

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.08 });

  targets.forEach(el => obs.observe(el));
})();

/* ═══════════════════════════════════════════
   COUNTER ANIMATION — north star metrics
═══════════════════════════════════════════ */
(function () {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  function animateCount(el) {
    const target   = parseFloat(el.dataset.count);
    const prefix   = el.dataset.prefix || '';
    const suffix   = el.dataset.suffix || '';
    const duration = 1800;
    const start    = performance.now();

    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 4);
      const value    = target * eased;
      el.textContent = prefix + (Number.isInteger(target) ? Math.round(value) : value.toFixed(1)) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        animateCount(e.target);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.3 });

  counters.forEach(el => obs.observe(el));
})();

/* ═══════════════════════════════════════════
   MAGNETIC 3D TILT on glass cards
═══════════════════════════════════════════ */
(function () {
  if (window.matchMedia('(hover: none)').matches) return; // skip on touch

  document.querySelectorAll('.glass-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.transition = 'transform 0.12s ease, border-color 0.3s, background 0.3s, box-shadow 0.3s';
    });
    card.addEventListener('mousemove', e => {
      const r  = card.getBoundingClientRect();
      const x  = (e.clientX - r.left) / r.width  - 0.5;
      const y  = (e.clientY - r.top)  / r.height - 0.5;
      card.style.transform = `perspective(900px) rotateX(${-y * 7}deg) rotateY(${x * 7}deg) translateZ(6px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transition = 'transform 0.6s cubic-bezier(0.16,1,0.3,1), border-color 0.3s, background 0.3s, box-shadow 0.3s';
      card.style.transform  = '';
    });
  });
})();

/* ═══════════════════════════════════════════
   MODAL
═══════════════════════════════════════════ */
function openModal() {
  const modal = document.getElementById('modal');
  if (!modal) return;
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeModal() {
  const modal = document.getElementById('modal');
  if (!modal) return;
  modal.classList.remove('active');
  document.body.style.overflow = '';
}
function handleModalClick(e) {
  if (e.target === e.currentTarget) closeModal();
}
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
