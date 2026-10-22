(function() {
  'use strict';

  const platforms = [
    {
      name: 'WhatsApp',
      appLabel: 'WHATSAPP',
      color: '#25D366',
      icon: 'fa-brands fa-whatsapp',
      gradient: 'linear-gradient(135deg, #25D366, #128C7E)'
    },
    {
      name: 'Telegram',
      appLabel: 'TELEGRAM',
      color: '#229ED9',
      icon: 'fa-brands fa-telegram',
      gradient: 'linear-gradient(135deg, #2AABEE, #229ED9)'
    },
    {
      name: 'Google',
      appLabel: 'GOOGLE',
      color: '#EA4335',
      icon: 'fa-brands fa-google',
      gradient: 'linear-gradient(135deg, #EA4335, #D93025)'
    },
    {
      name: 'TikTok',
      appLabel: 'TIKTOK',
      color: '#111827',
      icon: 'fa-brands fa-tiktok',
      gradient: 'linear-gradient(135deg, #1F2937, #030712)'
    },
    {
      name: 'Instagram',
      appLabel: 'INSTAGRAM',
      color: '#E1306C',
      icon: 'fa-brands fa-instagram',
      gradient: 'linear-gradient(135deg, #833AB4, #FD1D1D, #FCB045)'
    },
    {
      name: 'Discord',
      appLabel: 'DISCORD',
      color: '#5865F2',
      icon: 'fa-brands fa-discord',
      gradient: 'linear-gradient(135deg, #5865F2, #4752C4)'
    },
    {
      name: 'Shopee',
      appLabel: 'SHOPEE',
      color: '#EE4D2D',
      icon: 'fa-solid fa-bag-shopping',
      gradient: 'linear-gradient(135deg, #EE4D2D, #FF6433)'
    },
    {
      name: 'Facebook',
      appLabel: 'FACEBOOK',
      color: '#1877F2',
      icon: 'fa-brands fa-facebook-f',
      gradient: 'linear-gradient(135deg, #1877F2, #0D65D9)'
    },
    {
      name: 'OpenAI',
      appLabel: 'OPENAI',
      color: '#10A37F',
      icon: 'fa-solid fa-robot',
      gradient: 'linear-gradient(135deg, #10A37F, #0E8266)'
    },
    {
      name: 'X (Twitter)',
      appLabel: 'X',
      color: '#0F1419',
      icon: 'fa-brands fa-x-twitter',
      gradient: 'linear-gradient(135deg, #1E293B, #0F172A)'
    }
  ];

  const countries = [
    'Indonesia', 'India', 'USA', 'Malaysia', 'Thailand',
    'Philippines', 'Vietnam', 'Brazil', 'Singapore', 'United Kingdom'
  ];

  const orderUsernames = [
    'andi_s91', 'budi_pw23', 'sari_ww', 'dewi_mk', 'rizky_f',
    'fajar_hd', 'maya_r12', 'dian_ps', 'bagus_o', 'tina_kw',
    'reza_am', 'yuni_ta', 'hendra_s', 'nisa_pk', 'bagas_r9',
    'lina_sm', 'eko_wd', 'fitri_ns', 'agung_b', 'putri_an',
    'joko_ws', 'ratna_d', 'gilang_p', 'ayu_ms', 'ivan_kr',
    'citra_y', 'danu_fw', 'elsa_pm', 'fandi_rk', 'gita_sl',
    'hafiz_r', 'irma_bs', 'jerry_ow', 'keyla_dw', 'leon_ms',
    'mira_nt', 'nanda_wr', 'oscar_pl', 'prita_sw', 'qori_am'
  ];

  const depositUsernames = [
    'user_8821', 'kang_joko', 'mbak_sari', 'bro_rendi', 'sis_mila',
    'vtech_star', 'topup_aja', 'isi_saldo', 'cepat_aktif', 'trust_user',
    'buyer_pro', 'fast_order', 'top_member', 'vip_user77', 'loyal_vtech',
    'deposit_ok', 'saldo_full', 'aktif_now', 'member_vip', 'user_beta',
    'pro_gamer9', 'kece_bgt', 'sultan_id', 'otpking_id', 'nomor_pro'
  ];

  const prices = [1950, 2050, 2150, 2250, 2350, 2450, 2550, 2650, 2750, 2850];
  const depositAmounts = [10000, 25000, 50000, 100000, 150000, 200000, 500000];

  let orderItems = [];
  let depositItems = [];
  let orderCount = 0;
  let depositCount = 0;
  let initialized = false;

  function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  function randInt(min, max) {
    return Math.floor(min + Math.random() * (max - min + 1));
  }

  function formatRp(n) {
    return 'Rp ' + n.toLocaleString('id-ID');
  }

  function timeAgo(seconds) {
    const lang = window.VTechI18n ? window.VTechI18n.getLanguage() : 'id';
    if (seconds < 30) {
      if (lang === 'en') return 'Just now';
      if (lang === 'ru') return 'Только что';
      return 'Baru saja';
    }
    if (seconds < 60) {
      if (lang === 'en') return seconds + 's ago';
      if (lang === 'ru') return seconds + ' сек назад';
      return seconds + ' detik lalu';
    }
    const m = Math.floor(seconds / 60);
    if (lang === 'en') return m === 1 ? '1m ago' : m + 'm ago';
    if (lang === 'ru') return m + ' мин назад';
    if (m === 1) return '1 menit lalu';
    return m + ' menit lalu';
  }

  function generateOrderItem() {
    const platform = rand(platforms);
    const country = rand(countries);
    const username = rand(orderUsernames);
    const price = rand(prices);
    const prefix = country === 'Indonesia' ? '+62 882' : '+1 202';
    const suffix = randInt(1000, 9999) + ' ' + randInt(100, 999);
    const number = prefix + ' ' + suffix;
    const secondsAgo = Math.floor(Math.random() * 600);
    return { platform, country, username, price, number, secondsAgo, ts: Date.now() };
  }

  function generateDepositItem() {
    const username = rand(depositUsernames);
    const amount = rand(depositAmounts);
    const secondsAgo = Math.floor(Math.random() * 900);
    return { username, amount, secondsAgo, ts: Date.now() };
  }

  function renderOrderItem(item) {
    const div = document.createElement('div');
    div.className = 'act-item';
    const bg = item.platform.gradient || item.platform.color;
    const coinsLabel = window.VTechI18n ? window.VTechI18n.t('activity.coins', 'koin') : 'koin';
    const statusLabel = window.VTechI18n ? window.VTechI18n.t('activity.status_ok', 'Sukses') : 'Sukses';

    div.innerHTML = `
      <div class="act-avatar" style="background:${bg}">
        <i class="${item.platform.icon}"></i>
      </div>
      <div class="act-info">
        <div class="act-user">${item.username}</div>
        <div class="act-detail">${item.platform.name} &bull; ${item.country}</div>
      </div>
      <div class="act-right">
        <div class="act-amount">${item.price.toLocaleString('id-ID')} ${coinsLabel}</div>
        <div class="act-status-ok">${statusLabel}</div>
      </div>
    `;
    return div;
  }

  function renderDepositItem(item) {
    const div = document.createElement('div');
    div.className = 'act-item';
    const statusDepLabel = window.VTechI18n ? window.VTechI18n.t('activity.status_dep_ok', 'Berhasil') : 'Berhasil';

    div.innerHTML = `
      <div class="act-avatar" style="background:linear-gradient(135deg, #2563EB, #4F46E5)">
        <i class="fa-solid fa-qrcode"></i>
      </div>
      <div class="act-info">
        <div class="act-user">${item.username}</div>
        <div class="act-detail">QRIS &bull; ${timeAgo(item.secondsAgo)}</div>
      </div>
      <div class="act-right">
        <div class="act-amount">${formatRp(item.amount)}</div>
        <div class="act-status-ok">${statusDepLabel}</div>
      </div>
    `;
    return div;
  }

  function initFeed() {
    const orderList = document.getElementById('orderList');
    const depositList = document.getElementById('depositList');
    if (!orderList || !depositList) return;

    orderItems = [];
    depositItems = [];

    for (let i = 0; i < 12; i++) {
      const item = generateOrderItem();
      item.secondsAgo = Math.floor(i * 45 + Math.random() * 40);
      orderItems.push(item);
    }
    for (let i = 0; i < 8; i++) {
      const item = generateDepositItem();
      item.secondsAgo = Math.floor(i * 70 + Math.random() * 60);
      depositItems.push(item);
    }

    renderAll(orderList, depositList);
    initialized = true;
    orderCount = 12;
    depositCount = 8;
    updateCounts();
  }

  function renderAll(orderList, depositList) {
    orderList.innerHTML = '';
    depositList.innerHTML = '';
    orderItems.forEach(function(item) {
      orderList.appendChild(renderOrderItem(item));
    });
    depositItems.forEach(function(item) {
      depositList.appendChild(renderDepositItem(item));
    });
  }

  function safeInsertTop(list, el) {
    const col = list.closest('.activity-col');
    if (col) col.style.overflowAnchor = 'none';

    list.insertBefore(el, list.firstChild);

    requestAnimationFrame(function() {
      if (col) col.style.overflowAnchor = '';
    });
  }

  function prependOrder(orderList) {
    const item = generateOrderItem();
    item.secondsAgo = 0;
    orderItems.unshift(item);
    if (orderItems.length > 20) orderItems.pop();

    const el = renderOrderItem(item);
    el.style.background = 'rgba(59, 130, 246, 0.04)';
    safeInsertTop(orderList, el);

    if (orderList.children.length > 20) {
      orderList.removeChild(orderList.lastChild);
    }

    orderCount++;
    updateCounts();
    setTimeout(function() { el.style.background = ''; }, 2000);
  }

  function prependDeposit(depositList) {
    const item = generateDepositItem();
    item.secondsAgo = 0;
    depositItems.unshift(item);
    if (depositItems.length > 16) depositItems.pop();

    const el = renderDepositItem(item);
    el.style.background = 'rgba(37, 99, 235, 0.05)';
    safeInsertTop(depositList, el);

    if (depositList.children.length > 16) {
      depositList.removeChild(depositList.lastChild);
    }

    depositCount++;
    updateCounts();
    setTimeout(function() { el.style.background = ''; }, 2000);
  }

  function updateCounts() {
    const oc = document.getElementById('orderCount');
    const dc = document.getElementById('depositCount');
    const orderUnit = window.VTechI18n ? window.VTechI18n.t('activity.order_unit', 'order') : 'order';
    const depUnit = window.VTechI18n ? window.VTechI18n.t('activity.deposit_unit', 'deposit') : 'deposit';
    if (oc) oc.textContent = orderCount.toLocaleString('id-ID') + ' ' + orderUnit;
    if (dc) dc.textContent = depositCount.toLocaleString('id-ID') + ' ' + depUnit;
  }

  // Generate realistic OTP codes by platform
  function generateRandomOtp(platformName) {
    if (platformName === 'Google') {
      return 'G-' + randInt(100000, 999999);
    }
    if (platformName === 'Telegram') {
      return '' + randInt(10000, 99999);
    }
    const part1 = randInt(100, 999);
    const part2 = randInt(100, 999);
    return part1 + '-' + part2;
  }

  function generateOtpNotificationData() {
    const platform = rand(platforms);
    const otp = generateRandomOtp(platform.name);
    const prefix = Math.random() > 0.3 ? '+62 882' : '+62 895';
    const maskedPhone = prefix + '-****-' + randInt(1000, 9999);
    const i18n = window.VTechI18n;

    let title = '';
    let msg = '';

    if (platform.name === 'WhatsApp') {
      title = (i18n ? i18n.t('notif.wa_title') : 'Kode WhatsApp:') + ` <span class="ios-otp-pill">${otp}</span>`;
      msg = (i18n ? i18n.t('notif.wa_msg') : 'Gunakan kode untuk verifikasi nomor {phone}. Jangan berikan kepada siapa pun.').replace('{phone}', maskedPhone);
    } else if (platform.name === 'Telegram') {
      title = (i18n ? i18n.t('notif.tg_title') : 'Kode Telegram:') + ` <span class="ios-otp-pill">${otp}</span>`;
      msg = (i18n ? i18n.t('notif.tg_msg') : 'Kode konfirmasi nomor virtual {phone}. Berlaku selama 5 menit.').replace('{phone}', maskedPhone);
    } else if (platform.name === 'Google') {
      title = (i18n ? i18n.t('notif.google_title') : 'Kode Verifikasi:') + ` <span class="ios-otp-pill">${otp}</span>`;
      msg = (i18n ? i18n.t('notif.google_msg') : '{otp} adalah kode verifikasi akun Google Anda. Lindungi akses keamanan.').replace('{otp}', otp);
    } else if (platform.name === 'TikTok') {
      title = (i18n ? i18n.t('notif.tt_title') : 'Kode OTP:') + ` <span class="ios-otp-pill">${otp}</span>`;
      msg = (i18n ? i18n.t('notif.tt_msg') : 'Verifikasi pendaftaran nomor TikTok {phone} berhasil diterima otomatis.').replace('{phone}', maskedPhone);
    } else if (platform.name === 'Instagram') {
      title = (i18n ? i18n.t('notif.ig_title') : 'Security Code:') + ` <span class="ios-otp-pill">${otp}</span>`;
      msg = (i18n ? i18n.t('notif.ig_msg') : 'Gunakan kode {otp} untuk mengamankan akses akun Instagram Anda.').replace('{otp}', otp);
    } else if (platform.name === 'Shopee') {
      title = (i18n ? i18n.t('notif.shopee_title') : 'Kode Shopee:') + ` <span class="ios-otp-pill">${otp}</span>`;
      msg = (i18n ? i18n.t('notif.shopee_msg') : 'Kode verifikasi rahasia Anda: {otp}. Jangan bagikan kode ini kepada pihak mana pun.').replace('{otp}', otp);
    } else if (platform.name === 'OpenAI') {
      title = (i18n ? i18n.t('notif.openai_title') : 'OpenAI Code:') + ` <span class="ios-otp-pill">${otp}</span>`;
      msg = (i18n ? i18n.t('notif.openai_msg') : 'Your ChatGPT and OpenAI verification code is {otp}. Valid for 5 minutes.').replace('{otp}', otp);
    } else {
      title = (i18n ? i18n.t('notif.default_title') : 'Kode OTP:') + ` <span class="ios-otp-pill">${otp}</span>`;
      msg = (i18n ? i18n.t('notif.default_msg') : 'SMS verifikasi {platform} untuk nomor {phone} siap digunakan.').replace('{platform}', platform.name).replace('{phone}', maskedPhone);
    }

    return {
      type: 'otp',
      appLabel: platform.appLabel,
      icon: platform.icon,
      gradient: platform.gradient,
      title: title,
      msg: msg,
      otp: otp,
      actionText: i18n ? i18n.t('notif.copy_action') : 'Salin Kode OTP',
      actionIcon: 'fa-regular fa-copy',
      ts: i18n ? i18n.t('hero.card1_time') : 'Baru saja'
    };
  }

  function generateDepositNotificationData(depositItem) {
    const item = depositItem || generateDepositItem();
    const i18n = window.VTechI18n;
    const depTitle = (i18n ? i18n.t('notif.deposit_title') : 'Deposit Berhasil:') + ` <span class="ios-otp-pill" style="color:#16A34A;background:rgba(22,163,74,0.08);border-color:rgba(22,163,74,0.25)">${formatRp(item.amount)}</span>`;
    const depMsg = (i18n ? i18n.t('notif.deposit_msg') : 'Saldo akun @{user} otomatis bertambah via QRIS Real-Time 24 Jam.').replace('{user}', item.username);

    return {
      type: 'deposit',
      appLabel: 'QRIS INSTANT',
      icon: 'fa-solid fa-qrcode',
      gradient: 'linear-gradient(135deg, #2563EB, #4F46E5)',
      title: depTitle,
      msg: depMsg,
      actionText: i18n ? i18n.t('notif.deposit_action') : 'Saldo Otomatis Masuk',
      actionIcon: 'fa-solid fa-circle-check',
      ts: i18n ? i18n.t('hero.card1_time') : 'Baru saja'
    };
  }

  function generateRentalNotificationData(orderItem) {
    const item = orderItem || generateOrderItem();
    const i18n = window.VTechI18n;
    const rentTitle = (i18n ? i18n.t('notif.rental_title') : 'Nomor Virtual Aktif:') + ` <span class="ios-otp-pill">${item.country}</span>`;
    const rentMsg = (i18n ? i18n.t('notif.rental_msg') : '@{user} berhasil menyewa nomor {platform}. Menunggu SMS masuk.').replace('{user}', item.username).replace('{platform}', item.platform.name);

    return {
      type: 'rental',
      appLabel: item.platform.appLabel,
      icon: item.platform.icon,
      gradient: item.platform.gradient,
      title: rentTitle,
      msg: rentMsg,
      actionText: i18n ? i18n.t('notif.rental_action') : 'Garansi Auto-Refund 100%',
      actionIcon: 'fa-solid fa-shield-halved',
      ts: i18n ? i18n.t('hero.card1_time') : 'Baru saja'
    };
  }

  // Display authentic Apple iOS Frosted Glass Notification
  function showIosToast(data) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const maxVisible = window.innerWidth <= 640 ? 1 : 2;
    const existing = container.querySelectorAll('.toast');
    if (existing.length >= maxVisible) {
      for (let i = 0; i <= existing.length - maxVisible; i++) {
        removeToast(existing[i]);
      }
    }

    const toast = document.createElement('div');
    toast.className = 'toast ios-notif-card';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');

    const i18n = window.VTechI18n;
    const closeAria = i18n ? i18n.t('notif.close_aria', 'Tutup notifikasi') : 'Tutup notifikasi';
    const copyHint = i18n ? i18n.t('notif.copy_hint', 'Ketuk untuk salin') : 'Ketuk untuk salin';

    toast.innerHTML = `
      <div class="ios-notif-header">
        <div class="ios-notif-app-info">
          <div class="ios-notif-icon" style="background:${data.gradient}">
            <i class="${data.icon}"></i>
          </div>
          <span class="ios-notif-app-name">${data.appLabel}</span>
        </div>
        <div class="ios-notif-header-right">
          <span class="ios-notif-time">${data.ts}</span>
          <button type="button" class="ios-notif-close" aria-label="${closeAria}">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
      </div>
      <div class="ios-notif-body">
        <div class="ios-notif-title">${data.title}</div>
        <div class="ios-notif-msg">${data.msg}</div>
      </div>
      <div class="ios-notif-footer">
        <div class="ios-notif-action">
          <i class="${data.actionIcon}"></i>
          <span>${data.actionText}</span>
        </div>
        <span class="ios-notif-hint">${copyHint}</span>
      </div>
    `;

    let dismissTimer = null;

    function startTimer() {
      const duration = window.innerWidth <= 640 ? 4200 : 5500;
      dismissTimer = setTimeout(function() {
        removeToast(toast);
      }, duration);
    }

    function clearTimer() {
      if (dismissTimer) clearTimeout(dismissTimer);
    }

    toast.addEventListener('mouseenter', clearTimer);
    toast.addEventListener('mouseleave', startTimer);

    const closeBtn = toast.querySelector('.ios-notif-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        clearTimer();
        removeToast(toast);
      });
    }

    toast.addEventListener('click', function() {
      if (data.otp && navigator.clipboard) {
        navigator.clipboard.writeText(data.otp).then(function() {
          const actionText = toast.querySelector('.ios-notif-action span');
          if (actionText) actionText.textContent = i18n ? i18n.t('notif.copied_action', 'Kode Berhasil Disalin') : 'Kode Berhasil Disalin';
          const actionIcon = toast.querySelector('.ios-notif-action i');
          if (actionIcon) actionIcon.className = 'fa-solid fa-circle-check';
          toast.classList.add('ios-toast-copied');
          setTimeout(function() { removeToast(toast); }, 1300);
        }).catch(function() {
          removeToast(toast);
        });
      } else {
        removeToast(toast);
      }
    });

    container.appendChild(toast);
    startTimer();
  }

  function removeToast(toast) {
    if (!toast || !toast.parentNode) return;
    toast.classList.add('removing');
    setTimeout(function() {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 320);
  }

  // Backward compatibility alias for showToast
  function showToast(item) {
    if (item && item.amount) {
      showIosToast(generateDepositNotificationData(item));
    } else if (item && item.platform) {
      showIosToast(generateRentalNotificationData(item));
    } else {
      showIosToast(generateOtpNotificationData());
    }
  }

  function startLiveUpdates() {
    const orderList = document.getElementById('orderList');
    const depositList = document.getElementById('depositList');
    if (!orderList || !depositList) return;

    function scheduleOrder() {
      const delay = 8000 + Math.random() * 8000;
      setTimeout(function() {
        prependOrder(orderList);
        scheduleOrder();
      }, delay);
    }

    function scheduleDeposit() {
      const delay = 16000 + Math.random() * 12000;
      setTimeout(function() {
        prependDeposit(depositList);
        scheduleDeposit();
      }, delay);
    }

    function scheduleIosToast() {
      const delay = 22000 + Math.random() * 15000;
      setTimeout(function() {
        const randType = Math.random();
        if (randType < 0.65) {
          showIosToast(generateOtpNotificationData());
        } else if (randType < 0.85) {
          showIosToast(generateDepositNotificationData());
        } else {
          showIosToast(generateRentalNotificationData());
        }
        scheduleIosToast();
      }, delay);
    }

    setTimeout(scheduleOrder, 8000);
    setTimeout(scheduleDeposit, 15000);
    setTimeout(scheduleIosToast, 18000);
  }

  document.addEventListener('DOMContentLoaded', function() {
    initFeed();
    startLiveUpdates();
  });

  window.addEventListener('vtech:langchange', function() {
    updateCounts();
    const orderList = document.getElementById('orderList');
    const depositList = document.getElementById('depositList');
    if (orderList && depositList && initialized) {
      renderAll(orderList, depositList);
    }
  });

})();
