/* =============================================
   VtechOTP — Main Application Logic
   ============================================= */

(function() {
  'use strict';

  // Navbar scroll state
  function initNavbar() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    let lastY = 0;
    window.addEventListener('scroll', function() {
      const y = window.scrollY;
      if (y > 20) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
      lastY = y;
    }, { passive: true });
  }

  // Mobile hamburger menu
  function initMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobileMenu');
    if (!hamburger || !mobileMenu) return;

    hamburger.addEventListener('click', function() {
      hamburger.classList.toggle('open');
      mobileMenu.classList.toggle('open');
    });

    mobileMenu.querySelectorAll('a').forEach(function(link) {
      link.addEventListener('click', function() {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
      });
    });

    // Close on outside click
    document.addEventListener('click', function(e) {
      if (!hamburger.contains(e.target) && !mobileMenu.contains(e.target)) {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
      }
    });
  }

  // Smooth scroll for nav links
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function(link) {
      link.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        const target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        const offset = 80;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: top, behavior: 'smooth' });
      });
    });
  }

  // APK download handler — no interception needed; browser handles the real download natively

  // Showcase horizontal scroll — scroll the OUTER overflow container, never the page
  function initShowcase() {
    const track = document.querySelector('.showcase-track');
    // scrollable container is the parent (.showcase-scroll), NOT the track itself
    const scroller = document.querySelector('.showcase-scroll');
    if (!track || !scroller) return;

    const phones = track.querySelectorAll('.showcase-phone');
    let current = 1;

    function activate(idx) {
      phones.forEach(function(p, i) {
        p.classList.toggle('active-phone', i === idx);
      });
      current = idx;

      // Scroll only within .showcase-scroll — never touches window.scrollY
      const phone = phones[idx];
      const scrollerRect = scroller.getBoundingClientRect();
      const phoneRect = phone.getBoundingClientRect();
      const targetLeft = scroller.scrollLeft + (phoneRect.left - scrollerRect.left)
                         - (scrollerRect.width / 2) + (phoneRect.width / 2);
      scroller.scrollTo({ left: targetLeft, behavior: 'smooth' });
    }

    // Auto cycle — only when section is visible
    let cycleTimer = null;

    function startCycle() {
      if (cycleTimer) return;
      cycleTimer = setInterval(function() {
        activate((current + 1) % phones.length);
      }, 3000);
    }

    function stopCycle() {
      clearInterval(cycleTimer);
      cycleTimer = null;
    }

    const observer = new IntersectionObserver(function(entries) {
      entries[0].isIntersecting ? startCycle() : stopCycle();
    }, { threshold: 0.2 });

    const section = document.getElementById('showcase');
    if (section) observer.observe(section);

    // Click to activate
    phones.forEach(function(p, i) {
      p.addEventListener('click', function() { activate(i); });
    });
  }

  // Parallax on hero section — desktop only, RAF-throttled
  function initParallax() {
    // Disable on mobile/touch — main cause of scroll jank
    if (window.matchMedia('(max-width: 900px)').matches) return;
    if ('ontouchstart' in window) return;

    const orbs = document.querySelectorAll('.hero-orb');
    if (!orbs.length) return;

    let ticking = false;
    let lastY = 0;

    window.addEventListener('scroll', function() {
      lastY = window.scrollY;
      if (!ticking) {
        requestAnimationFrame(function() {
          orbs.forEach(function(orb, i) {
            const speed = 0.06 + i * 0.03;
            orb.style.transform = 'translateY(' + (lastY * speed) + 'px)';
          });
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  // Live stats counter realtime update
  function initLiveStatsUpdate() {
    // Dummy live counters removed
  }

  // Feature card 3D hover
  function initCardTilt() {
    const cards = document.querySelectorAll('.feature-card, .step-card');
    cards.forEach(function(card) {
      card.addEventListener('mousemove', function(e) {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = 'translateY(-6px) rotateX(' + (-y * 6) + 'deg) rotateY(' + (x * 6) + 'deg)';
        card.style.transition = 'transform .1s ease, box-shadow .3s ease';
      });
      card.addEventListener('mouseleave', function() {
        card.style.transform = '';
        card.style.transition = 'transform .5s ease, box-shadow .3s ease';
      });
    });
  }

  // Platform card hover ripple
  function initPlatformRipple() {
    const cards = document.querySelectorAll('.platform-card');
    cards.forEach(function(card) {
      card.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        ripple.style.cssText = `
          position:absolute; border-radius:50%; background:rgba(59,130,246,.2);
          width:100px; height:100px; pointer-events:none;
          transform:translate(-50%,-50%) scale(0);
          animation: rippleAnim .5s ease forwards;
          left:${e.offsetX}px; top:${e.offsetY}px;
        `;
        if (!document.getElementById('rippleStyle')) {
          const style = document.createElement('style');
          style.id = 'rippleStyle';
          style.textContent = '@keyframes rippleAnim{to{transform:translate(-50%,-50%) scale(4);opacity:0}}';
          document.head.appendChild(style);
        }
        card.style.position = 'relative';
        card.style.overflow = 'hidden';
        card.appendChild(ripple);
        setTimeout(function() { if (ripple.parentNode) ripple.parentNode.removeChild(ripple); }, 600);
      });
    });
  }

  // Interactive Price & Platform Simulator
  function initSimulator() {
    const tabs = document.querySelectorAll('.sim-tab-btn');
    if (!tabs.length) return;

    const data = {
      whatsapp: { name: 'WhatsApp', price: 'Rp 2.150', stock: '12.450+ Nomor', latency: '4.2 Detik', success: '99.2%', tag: 'Paling Populer', icon: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg', color: '#25D366' },
      telegram: { name: 'Telegram', price: 'Rp 1.850', stock: '9.820+ Nomor', latency: '3.8 Detik', success: '98.9%', tag: 'Instan', icon: 'https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg', color: '#229ED9' },
      tiktok: { name: 'TikTok', price: 'Rp 1.450', stock: '7.300+ Nomor', latency: '5.1 Detik', success: '98.5%', tag: 'Hot Promo', icon: 'https://upload.wikimedia.org/wikipedia/en/a/a9/TikTok_logo.svg', color: '#010101' },
      instagram: { name: 'Instagram', price: 'Rp 1.950', stock: '8.640+ Nomor', latency: '4.7 Detik', success: '98.7%', tag: 'Rekomendasi', icon: 'https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png', color: '#E1306C' },
      google: { name: 'Google / Gmail', price: 'Rp 2.450', stock: '15.100+ Nomor', latency: '6.0 Detik', success: '97.8%', tag: 'Katalog Besar', icon: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg', color: '#EA4335' },
      openai: { name: 'OpenAI / ChatGPT', price: 'Rp 3.200', stock: '4.890+ Nomor', latency: '5.4 Detik', success: '98.1%', tag: 'AI Developer', icon: 'https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg', color: '#10A37F' },
      shopee: { name: 'Shopee', price: 'Rp 1.650', stock: '6.200+ Nomor', latency: '4.5 Detik', success: '99.0%', tag: 'Marketplace', icon: 'https://upload.wikimedia.org/wikipedia/commons/0/0e/Shopee_logo.svg', color: '#EE4D2D' }
    };

    tabs.forEach(function(tab) {
      tab.addEventListener('click', function() {
        tabs.forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        const key = this.dataset.platform;
        const item = data[key] || data.whatsapp;

        const nameEl = document.getElementById('simPlatformName');
        const priceEl = document.getElementById('simPrice');
        const stockEl = document.getElementById('simStock');
        const latencyEl = document.getElementById('simLatency');
        const successEl = document.getElementById('simSuccess');
        const tagEl = document.getElementById('simTag');
        const iconEl = document.getElementById('simIcon');

        if (nameEl) nameEl.textContent = item.name;
        if (priceEl) priceEl.textContent = item.price;
        if (stockEl) stockEl.textContent = item.stock;
        if (latencyEl) latencyEl.textContent = item.latency;
        if (successEl) successEl.textContent = item.success;
        if (tagEl) tagEl.textContent = item.tag;
        if (iconEl) iconEl.src = item.icon;
      });
    });
  }

  // FAQ Accordions
  function initFaq() {
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(function(item) {
      const q = item.querySelector('.faq-question');
      if (!q) return;
      q.addEventListener('click', function() {
        const isActive = item.classList.contains('active');
        faqItems.forEach(i => i.classList.remove('active'));
        if (!isActive) {
          item.classList.add('active');
        }
      });
    });
  }

  // Page load progress indicator
  function initPageLoad() {
    const bar = document.createElement('div');
    bar.style.cssText = 'position:fixed;top:0;left:0;height:3px;background:linear-gradient(90deg,#2563EB,#818CF8);z-index:99999;transition:width .3s ease;width:0';
    document.body.appendChild(bar);

    bar.style.width = '30%';
    setTimeout(function() { bar.style.width = '70%'; }, 200);
    setTimeout(function() { bar.style.width = '100%'; }, 500);
    setTimeout(function() {
      bar.style.opacity = '0';
      setTimeout(function() { bar.remove(); }, 300);
    }, 800);
  }

  // Initialize everything
  function init() {
    initPageLoad();
    initNavbar();
    initMobileMenu();
    initSmoothScroll();
    initShowcase();
    initParallax();
    initLiveStatsUpdate();
    initSimulator();
    initFaq();
    setTimeout(initCardTilt, 500);
    setTimeout(initPlatformRipple, 500);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
