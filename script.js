/* ═══════════════════════════════════════════
   PARTICLE CANVAS — Hero Background
═══════════════════════════════════════════ */
(function () {
  const canvas = document.getElementById('particles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let particles = [];
  let raf;
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
      this.vx = (Math.random() - 0.5) * 0.35;
      this.vy = (Math.random() - 0.5) * 0.35;
      this.r  = Math.random() * 1.4 + 0.4;
      this.a  = Math.random() * 0.45 + 0.08;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > canvas.width)  this.vx *= -1;
      if (this.y < 0 || this.y > canvas.height)  this.vy *= -1;
      if (mouse.x !== null) {
        const dx = this.x - mouse.x, dy = this.y - mouse.y;
        const d  = Math.hypot(dx, dy);
        if (d < 110) {
          const f = (110 - d) / 110;
          this.x += (dx / d) * f * 1.8;
          this.y += (dy / d) * f * 1.8;
        }
      }
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${this.a})`;
      ctx.fill();
    }
  }

  function buildParticles() {
    particles = [];
    const n = Math.min(Math.floor((canvas.width * canvas.height) / 11000), 130);
    for (let i = 0; i < n; i++) particles.push(new Particle());
  }

  function connect() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d  = Math.hypot(dx, dy);
        if (d < 100) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(255,255,255,${0.07 * (1 - d / 100)})`;
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

  // Pause when section scrolls out of view (perf)
  const heroSection = document.getElementById('hero');
  const visObs = new IntersectionObserver(([e]) => {
    if (e.isIntersecting) { if (!raf) animate(); }
    else { cancelAnimationFrame(raf); raf = null; }
  }, { threshold: 0 });
  visObs.observe(heroSection);

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
   SIDE NAVIGATION
═══════════════════════════════════════════ */
(function () {
  const nav    = document.getElementById('sideNav');
  const toggle = document.getElementById('menuToggle');
  const links  = document.querySelectorAll('.nav-link');

  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', open);
  });

  links.forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      toggle.classList.remove('open');
    });
  });

  // Active link on scroll via IntersectionObserver
  const sections = document.querySelectorAll('.section');
  const navObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        links.forEach(l => l.classList.toggle('active', l.dataset.section === entry.target.id));
      }
    });
  }, { threshold: 0.35 });

  sections.forEach(s => navObs.observe(s));
})();

/* ═══════════════════════════════════════════
   SCROLL REVEAL
═══════════════════════════════════════════ */
(function () {
  const els = document.querySelectorAll('.reveal, .timeline-item, .project-card, .about-grid, .edu-row');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  els.forEach(el => {
    if (!el.classList.contains('reveal')) el.classList.add('reveal');
    obs.observe(el);
  });
})();

/* ═══════════════════════════════════════════
   TIMELINE ACCORDION
═══════════════════════════════════════════ */
(function () {
  const items = document.querySelectorAll('.timeline-item');

  items.forEach(item => {
    const header = item.querySelector('.timeline-header');
    header.addEventListener('click', () => {
      const wasActive = item.classList.contains('active');
      items.forEach(i => i.classList.remove('active'));
      if (!wasActive) item.classList.add('active');
    });
  });
})();

/* ═══════════════════════════════════════════
   CASE STUDY MODAL
═══════════════════════════════════════════ */
function openCaseStudy(id) {
  const modal = document.getElementById('caseStudyModal');
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeCaseStudy() {
  document.getElementById('caseStudyModal').classList.remove('active');
  document.body.style.overflow = '';
}

document.getElementById('caseStudyModal').addEventListener('click', function (e) {
  if (e.target === this) closeCaseStudy();
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeCaseStudy();
});

/* ═══════════════════════════════════════════
   SMOOTH METRIC COUNT-UP (Hero)
═══════════════════════════════════════════ */
(function () {
  const metrics = document.querySelectorAll('.metric-value');
  const targets = ['$42M+', '$1.8M', '4 Yrs'];
  let triggered = false;

  const hero = document.getElementById('hero');
  const obs  = new IntersectionObserver(([e]) => {
    if (e.isIntersecting && !triggered) {
      triggered = true;
      // subtle staggered fade-in for metrics
      metrics.forEach((m, i) => {
        m.style.opacity = '0';
        setTimeout(() => {
          m.style.transition = 'opacity 0.6s ease';
          m.style.opacity = '1';
        }, 1400 + i * 120);
      });
    }
  }, { threshold: 0.5 });

  obs.observe(hero);
})();
