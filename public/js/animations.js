(function() {
  'use strict';

  const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function initRingCanvas(canvasId) {
    if (prefersReducedMotion) return;
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let rings = [];
    let animId2 = null;
    let W, H;
    let isVisible = false;

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
      if (!isVisible) return;
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

    const canvasObs = new IntersectionObserver(function(entries) {
      if (entries[0].isIntersecting) {
        isVisible = true;
        if (!animId2) draw();
      } else {
        isVisible = false;
        if (animId2) {
          cancelAnimationFrame(animId2);
          animId2 = null;
        }
      }
    }, { threshold: 0.05 });
    canvasObs.observe(canvas);

    window.addEventListener('resize', function() {
      resize();
      initRings();
    }, { passive: true });
  }

  function initAOS() {
    const elements = document.querySelectorAll('[data-aos]');
    if (!elements.length) return;

    if (prefersReducedMotion) {
      elements.forEach(function(el) {
        el.classList.add('aos-animate');
      });
      return;
    }

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

  function initCounters() {}

  function initScreenCycler() {
    const screens = [
      '/assets/app-home.webp',
      '/assets/app-buy.webp',
      '/assets/app-otp.webp',
      '/assets/app-deposit.webp',
      '/assets/app-countries.webp'
    ];
    const img = document.getElementById('screenImg');
    if (!img) return;

    // Preload lazily on idle
    if ('requestIdleCallback' in window) {
      requestIdleCallback(function() {
        screens.slice(1).forEach(function(src) {
          var pre = new Image();
          pre.src = src;
        });
      });
    }

    var idx = 0;
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
          }, 4000);
        }
      } else {
        clearInterval(cycleTimer);
        cycleTimer = null;
      }
    }, { threshold: 0.1 });

    var hero = document.getElementById('hero');
    if (hero) heroObserver.observe(hero);
  }

  function initPhoneTilt() {
    if (prefersReducedMotion) return;
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

  document.addEventListener('DOMContentLoaded', function() {
    initRingCanvas('dlCanvas');
    initAOS();
    initCounters();
    initScreenCycler();
    initPhoneTilt();
  });

})();
