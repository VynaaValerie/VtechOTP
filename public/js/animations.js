/* =============================================
   VtechOTP — Canvas & 3D Particle Animations
   ============================================= */

(function() {
  'use strict';

  // Particle system for hero canvas
  function initParticleCanvas(canvasId, color) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particles = [];
    let animId;
    let W, H;

    function resize() {
      W = canvas.width = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    }

    function Particle() {
      this.reset();
    }
    Particle.prototype.reset = function() {
      this.x = Math.random() * W;
      this.y = Math.random() * H;
      this.r = Math.random() * 3 + 1;
      this.vx = (Math.random() - 0.5) * 0.5;
      this.vy = (Math.random() - 0.5) * 0.5;
      this.alpha = Math.random() * 0.5 + 0.1;
      this.decay = Math.random() * 0.003 + 0.001;
    };
    Particle.prototype.update = function() {
      this.x += this.vx;
      this.y += this.vy;
      this.alpha -= this.decay;
      if (this.alpha <= 0 || this.x < 0 || this.x > W || this.y < 0 || this.y > H) {
        this.reset();
        this.alpha = 0;
      }
    };

    function init() {
      particles = [];
      const count = Math.min(80, Math.floor(W * H / 12000));
      for (let i = 0; i < count; i++) {
        const p = new Particle();
        p.alpha = Math.random() * 0.4 + 0.1;
        particles.push(p);
      }
    }

    function drawConnections() {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.strokeStyle = color || 'rgba(59,130,246,' + (0.15 * (1 - dist / 120)) + ')';
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      drawConnections();
      particles.forEach(function(p) {
        p.update();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(59,130,246,' + p.alpha + ')';
        ctx.fill();
      });
      animId = requestAnimationFrame(draw);
    }

    resize();
    init();
    draw();

    window.addEventListener('resize', function() {
      cancelAnimationFrame(animId);
      resize();
      init();
      draw();
    });
  }

  // Floating rings for download canvas
  function initRingCanvas(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let rings = [];
    let animId2;
    let W, H;

    function resize() {
      W = canvas.width = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    }

    function Ring() {
      this.x = Math.random() * W;
      this.y = Math.random() * H;
      this.r = Math.random() * 80 + 20;
      this.speed = Math.random() * 0.5 + 0.2;
      this.alpha = 0;
      this.maxAlpha = Math.random() * 0.3 + 0.05;
      this.growing = true;
      this.lineWidth = Math.random() * 1.5 + 0.5;
    }
    Ring.prototype.update = function() {
      if (this.growing) {
        this.alpha += 0.005;
        if (this.alpha >= this.maxAlpha) this.growing = false;
      } else {
        this.alpha -= 0.003;
      }
      this.r += this.speed;
      if (this.alpha <= 0 || this.r > 200) {
        Object.assign(this, new Ring());
        this.r = 10;
        this.alpha = 0;
      }
    };

    function initRings() {
      rings = [];
      for (let i = 0; i < 12; i++) {
        rings.push(new Ring());
        rings[i].r = Math.random() * 80 + 10;
        rings[i].alpha = Math.random() * rings[i].maxAlpha;
      }
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      rings.forEach(function(ring) {
        ring.update();
        ctx.beginPath();
        ctx.arc(ring.x, ring.y, ring.r, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255,255,255,' + ring.alpha + ')';
        ctx.lineWidth = ring.lineWidth;
        ctx.stroke();
      });
      animId2 = requestAnimationFrame(draw);
    }

    resize();
    initRings();
    draw();

    window.addEventListener('resize', function() {
      cancelAnimationFrame(animId2);
      resize();
      initRings();
      draw();
    });
  }

  // AOS — Scroll reveal
  function initAOS() {
    const elements = document.querySelectorAll('[data-aos]');
    if (!elements.length) return;

    const observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('aos-animate');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    elements.forEach(function(el) {
      observer.observe(el);
    });
  }

  // Counter animation
  function animateCounter(el, target, duration) {
    if (!el) return;
    const start = 0;
    const startTime = performance.now();
    const isFloat = String(target).includes('.');

    function update(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = start + (target - start) * eased;

      if (isFloat) {
        el.textContent = current.toFixed(1) + '%';
      } else {
        el.textContent = Math.floor(current).toLocaleString('id-ID');
      }

      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  function initCounters() {
    // Dummy counters removed
  }

  // Screen cycler on hero phone — uses preloaded images, no layout reflow
  function initScreenCycler() {
    const screens = [
      '/assets/app-home.png',
      '/assets/app-buy.png',
      '/assets/app-otp.png',
      '/assets/app-deposit.png',
      '/assets/app-countries.png'
    ];
    const img = document.getElementById('screenImg');
    if (!img) return;

    // Preload all screens to avoid network-triggered reflows
    screens.forEach(function(src) {
      var pre = new Image();
      pre.src = src;
    });

    var idx = 0;
    // Only cycle when hero is in viewport — stops when user scrolls away
    var cycleTimer = null;

    var heroObserver = new IntersectionObserver(function(entries) {
      if (entries[0].isIntersecting) {
        if (!cycleTimer) {
          cycleTimer = setInterval(function() {
            idx = (idx + 1) % screens.length;
            img.style.opacity = '0';
            setTimeout(function() {
              img.src = screens[idx];
              img.style.opacity = '1';
            }, 300);
          }, 3500);
        }
      } else {
        clearInterval(cycleTimer);
        cycleTimer = null;
      }
    }, { threshold: 0.1 });

    var hero = document.getElementById('hero');
    if (hero) heroObserver.observe(hero);
  }

  // 3D tilt effect on phone
  function initPhoneTilt() {
    const wrapper = document.getElementById('phoneWrapper');
    if (!wrapper) return;

    const hero = document.querySelector('.hero-visual');
    if (!hero) return;

    hero.addEventListener('mousemove', function(e) {
      const rect = hero.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      wrapper.style.transform = `perspective(800px) rotateY(${x * 15}deg) rotateX(${-y * 10}deg) translateY(-8px)`;
      wrapper.style.transition = 'transform 0.1s ease';
    });

    hero.addEventListener('mouseleave', function() {
      wrapper.style.transform = '';
      wrapper.style.transition = 'transform 0.6s ease';
    });
  }

  // Initialize when DOM ready
  document.addEventListener('DOMContentLoaded', function() {
    initParticleCanvas('heroCanvas', null);
    initRingCanvas('dlCanvas');
    initAOS();
    initCounters();
    initScreenCycler();
    initPhoneTilt();
  });

})();
