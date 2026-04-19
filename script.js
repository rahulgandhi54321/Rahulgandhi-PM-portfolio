/* ═══════════════════════════════════════════
   PARTICLE CANVAS
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
      this.vx = (Math.random() - 0.5) * 0.3;
      this.vy = (Math.random() - 0.5) * 0.3;
      this.r  = Math.random() * 1.2 + 0.3;
      this.a  = Math.random() * 0.4 + 0.06;
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
          this.x += (dx / d) * f * 1.5;
          this.y += (dy / d) * f * 1.5;
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
    const n = Math.min(Math.floor((canvas.width * canvas.height) / 10000), 140);
    for (let i = 0; i < n; i++) particles.push(new Particle());
  }

  function connect() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const d = Math.hypot(particles[i].x - particles[j].x, particles[i].y - particles[j].y);
        if (d < 90) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(255,255,255,${0.06 * (1 - d / 90)})`;
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
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting) { if (!raf) animate(); }
    else { cancelAnimationFrame(raf); raf = null; }
  }, { threshold: 0 }).observe(heroSection);

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
   PM BRAIN — ORBITAL ANIMATION SYSTEM
═══════════════════════════════════════════ */
(function () {
  const system = document.getElementById('orbitalSystem');
  if (!system) return;

  const nodes = Array.from(system.querySelectorAll('.orb-node'));
  let paused = false;
  let raf;

  // Parse node config from data attributes
  const nodeData = nodes.map(el => ({
    el,
    r: parseFloat(el.dataset.r),
    angle: parseFloat(el.dataset.a) * Math.PI / 180,
    speed: parseFloat(el.dataset.s) * Math.PI / 180 / 60, // deg/s → rad/frame @60fps
  }));

  const BASE_SIZE = 640; // design reference size in px

  function getScale() {
    return system.offsetWidth / BASE_SIZE;
  }

  function getCenter() {
    return { x: system.offsetWidth / 2, y: system.offsetHeight / 2 };
  }

  function positionNode(nd) {
    const { x: cx, y: cy } = getCenter();
    const scale = getScale();
    const x = cx + Math.cos(nd.angle) * nd.r * scale;
    const y = cy + Math.sin(nd.angle) * nd.r * scale;
    const hw = nd.el.offsetWidth  / 2;
    const hh = nd.el.offsetHeight / 2;
    nd.el.style.left = `${x - hw}px`;
    nd.el.style.top  = `${y - hh}px`;
  }

  function tick() {
    if (!paused) {
      nodeData.forEach(nd => {
        nd.angle += nd.speed;
        positionNode(nd);
      });
    }
    raf = requestAnimationFrame(tick);
  }

  // Fade in nodes staggered after portrait loads
  function revealNodes() {
    nodeData.forEach((nd, i) => {
      // Initial position before reveal
      positionNode(nd);
      setTimeout(() => nd.el.classList.add('visible'), 800 + i * 150);
    });
  }

  const portrait = document.getElementById('heroPortrait');
  if (portrait && portrait.complete) {
    revealNodes();
  } else if (portrait) {
    portrait.addEventListener('load', revealNodes);
  } else {
    revealNodes();
  }

  tick();

  // Pause orbit on hover, resume on leave
  nodes.forEach(el => {
    el.addEventListener('mouseenter', () => { paused = true; });
    el.addEventListener('mouseleave', () => { paused = false; });
  });

  // Pause when hero scrolls out
  new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) { paused = true; }
    else                   { paused = false; }
  }, { threshold: 0 }).observe(document.getElementById('hero'));

  window.addEventListener('resize', () => {
    nodeData.forEach(nd => positionNode(nd));
  });
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
  });

  links.forEach(l => l.addEventListener('click', () => {
    nav.classList.remove('open');
    toggle.classList.remove('open');
  }));

  const sections = document.querySelectorAll('.section');
  new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        links.forEach(l => l.classList.toggle('active', l.dataset.section === e.target.id));
      }
    });
  }, { threshold: 0.35 }).observe(document.getElementById('hero'));

  sections.forEach(s => {
    new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting)
          links.forEach(l => l.classList.toggle('active', l.dataset.section === e.target.id));
      });
    }, { threshold: 0.35 }).observe(s);
  });
})();

/* ═══════════════════════════════════════════
   SCROLL REVEAL
═══════════════════════════════════════════ */
(function () {
  const targets = document.querySelectorAll(
    '.reveal, .timeline-item, .project-card, .skill-category, .about-text-col, .edu-row'
  );
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.08 });

  targets.forEach(el => {
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
    item.querySelector('.timeline-header').addEventListener('click', () => {
      const wasActive = item.classList.contains('active');
      items.forEach(i => i.classList.remove('active'));
      if (!wasActive) item.classList.add('active');
    });
  });
})();

/* ═══════════════════════════════════════════
   CASE STUDY MODAL
═══════════════════════════════════════════ */
function openCaseStudy() {
  document.getElementById('caseStudyModal').classList.add('active');
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
   NUMBER COUNTER ANIMATION (Experience metrics)
═══════════════════════════════════════════ */
(function () {
  const metricEls = document.querySelectorAll('.t-metric');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('metric-pop');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 1 });
  metricEls.forEach(el => obs.observe(el));
})();
