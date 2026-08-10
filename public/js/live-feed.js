/* =============================================
   VtechOTP — Live Activity Feed (Fake Realtime)
   ============================================= */

(function() {
  'use strict';

  const platforms = [
    { name: 'WhatsApp', color: '#25D366', initial: 'WA' },
    { name: 'Telegram', color: '#229ED9', initial: 'TG' },
    { name: 'Instagram', color: '#E1306C', initial: 'IG' },
    { name: 'TikTok', color: '#222222', initial: 'TK' },
    { name: 'Facebook', color: '#1877F2', initial: 'FB' },
    { name: 'Google', color: '#EA4335', initial: 'GG' },
    { name: 'Twitter', color: '#1DA1F2', initial: 'TW' },
    { name: 'Discord', color: '#5865F2', initial: 'DC' },
    { name: 'Netflix', color: '#E50914', initial: 'NF' },
    { name: 'Shopee', color: '#EE4D2D', initial: 'SP' }
  ];

  const countries = [
    'Indonesia', 'India', 'USA', 'Malaysia', 'Thailand',
    'Philippines', 'Vietnam', 'Brazil', 'Singapore', 'Russia'
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

  function formatRp(n) {
    return 'Rp ' + n.toLocaleString('id-ID');
  }

  function timeAgo(seconds) {
    if (seconds < 30) return 'Baru saja';
    if (seconds < 60) return seconds + ' detik lalu';
    const m = Math.floor(seconds / 60);
    if (m === 1) return '1 menit lalu';
    return m + ' menit lalu';
  }

  function generateOrderItem() {
    const platform = rand(platforms);
    const country = rand(countries);
    const username = rand(orderUsernames);
    const price = rand(prices);
    const prefix = country === 'Indonesia' ? '+628' : '+1';
    const suffix = Math.floor(10000000 + Math.random() * 89999999);
    const number = prefix + suffix;
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
    div.innerHTML = `
      <div class="act-avatar" style="background:${item.platform.color}">${item.platform.initial}</div>
      <div class="act-info">
        <div class="act-user">${item.username}</div>
        <div class="act-detail">${item.platform.name} &bull; ${item.country}</div>
      </div>
      <div class="act-right">
        <div class="act-amount">${item.price.toLocaleString('id-ID')} koin</div>
        <div class="act-status-ok">Sukses</div>
      </div>
    `;
    return div;
  }

  function renderDepositItem(item) {
    const div = document.createElement('div');
    div.className = 'act-item';
    div.innerHTML = `
      <div class="act-avatar" style="background:linear-gradient(135deg,#2563EB,#4F46E5)">Rp</div>
      <div class="act-info">
        <div class="act-user">${item.username}</div>
        <div class="act-detail">QRIS &bull; ${timeAgo(item.secondsAgo)}</div>
      </div>
      <div class="act-right">
        <div class="act-amount">${formatRp(item.amount)}</div>
        <div class="act-status-ok">Berhasil</div>
      </div>
    `;
    return div;
  }

  function initFeed() {
    const orderList = document.getElementById('orderList');
    const depositList = document.getElementById('depositList');
    if (!orderList || !depositList) return;

    // Pre-fill with 12 orders and 8 deposits
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

  // Safely prepend to a list without triggering page scroll anchoring.
  // Technique: use a DocumentFragment so the DOM mutation is one atomic step,
  // and temporarily set overflow-anchor:none on the list's scroll container.
  function safeInsertTop(list, el) {
    // Freeze the outer page scroll anchor for this frame
    var col = list.closest('.activity-col');
    if (col) col.style.overflowAnchor = 'none';

    list.insertBefore(el, list.firstChild);

    // Restore next frame — after browser has painted
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
    el.style.background = 'rgba(59,130,246,0.04)';
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
    el.style.background = 'rgba(37,99,235,0.05)';
    safeInsertTop(depositList, el);

    if (depositList.children.length > 16) {
      depositList.removeChild(depositList.lastChild);
    }

    depositCount++;
    updateCounts();
    showToast(item);
    setTimeout(function() { el.style.background = ''; }, 2000);
  }

  function updateCounts() {
    const oc = document.getElementById('orderCount');
    const dc = document.getElementById('depositCount');
    if (oc) oc.textContent = orderCount.toLocaleString('id-ID') + ' order';
    if (dc) dc.textContent = depositCount.toLocaleString('id-ID') + ' deposit';
  }

  function showToast(item) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    // Limit active toasts
    const existing = container.querySelectorAll('.toast');
    if (existing.length >= 3) {
      removeToast(existing[0]);
    }

    const toast = document.createElement('div');
    toast.className = 'toast';

    const isDeposit = !!item.amount;
    const bgColor = isDeposit ? '#2563EB' : item.platform && item.platform.color || '#2563EB';

    if (isDeposit) {
      toast.innerHTML = `
        <div class="toast-icon" style="background:${bgColor}">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/></svg>
        </div>
        <div class="toast-body">
          <div class="toast-title">Deposit Berhasil</div>
          <div class="toast-msg">${item.username} &mdash; ${formatRp(item.amount)}</div>
        </div>
      `;
    } else {
      const platform = item.platform || { color: '#25D366', initial: 'WA', name: 'WhatsApp' };
      toast.innerHTML = `
        <div class="toast-icon" style="background:${platform.color}">
          <span style="color:white;font-size:.65rem;font-weight:800">${platform.initial}</span>
        </div>
        <div class="toast-body">
          <div class="toast-title">Order Sukses</div>
          <div class="toast-msg">${item.username} &mdash; ${platform.name} &bull; ${item.price} koin</div>
        </div>
      `;
    }

    container.appendChild(toast);

    setTimeout(function() { removeToast(toast); }, 5000);
  }

  function removeToast(toast) {
    if (!toast || !toast.parentNode) return;
    toast.classList.add('removing');
    setTimeout(function() {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 300);
  }

  // Start live updates with staggered intervals
  function startLiveUpdates() {
    const orderList = document.getElementById('orderList');
    const depositList = document.getElementById('depositList');
    if (!orderList || !depositList) return;

    // New order every 3-7 seconds
    function scheduleOrder() {
      const delay = 3000 + Math.random() * 4000;
      setTimeout(function() {
        prependOrder(orderList);
        scheduleOrder();
      }, delay);
    }

    // New deposit every 8-18 seconds
    function scheduleDeposit() {
      const delay = 8000 + Math.random() * 10000;
      setTimeout(function() {
        prependDeposit(depositList);
        scheduleDeposit();
      }, delay);
    }

    // Initial delays
    setTimeout(scheduleOrder, 2500);
    setTimeout(scheduleDeposit, 6000);

    // Toast for first order after 4s
    setTimeout(function() {
      const item = generateOrderItem();
      showToast(item);
    }, 4000);
  }

  document.addEventListener('DOMContentLoaded', function() {
    initFeed();
    startLiveUpdates();
  });

})();
