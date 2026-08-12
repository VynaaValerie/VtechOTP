const express = require('express');
const path = require('path');
const compression = require('compression');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 5000;
const SITE_NAME = 'VtechOTP';
const API_BLOG_BASE = 'https://api-sms-code.vercel.app/api/blog';

// Trust proxy (required for rate-limit behind reverse proxy)
app.set('trust proxy', 1);

app.use(compression());
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// Vercel provides this endpoint automatically in production after Web Analytics
// is enabled. Keep the local preview quiet without shadowing Vercel's endpoint.
if (process.env.NODE_ENV !== 'production') {
  app.get('/_vercel/insights/script.js', (req, res) => {
    res.type('application/javascript').send(
      'window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };'
    );
  });
}

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: '1d',
  etag: true,
  setHeaders(res, filePath) {
    // Always revalidate files that can change on redeploy.
    // Keep images/fonts cacheable for faster page loads.
    if (/\.(html|css|js|apk)$/i.test(filePath)) {
      res.set('Cache-Control', 'no-store, max-age=0, must-revalidate');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');
    }
  }
}));

app.use(express.json());

// Helper function to sanitize text & replace branding
function transformBranding(text) {
  if (!text || typeof text !== 'string') return text;
  return text
    .replace(/<header class="article-header"[^>]*>[\s\S]*?<\/header>/gi, '')
    .replace(/<nav class="breadcrumb"[^>]*>[\s\S]*?<\/nav>/gi, '')
    .replace(/<div class="authors-container"[^>]*>[\s\S]*?<\/div>/gi, '')
    .replace(/<img[^>]*icon-avatar[^>]*>/gi, '<img src="/assets/logo.png" alt="VTechOTP" class="author-avatar">')
    .replace(/\/brand\/icon-avatar\.svg/gi, '/assets/logo.png')
    .replace(/SMSCode Team/gi, 'Tim VTechOTP')
    .replace(/Ready to try SMSCode\?/gi, 'Siap Mencoba VTechOTP?')
    .replace(/SMSCode/g, 'VTechOTP')
    .replace(/smscode\.gg/g, 'vtechotp.com')
    .replace(/smscode/gi, 'vtechotp')
    .replace(/HeroSMS/gi, 'VTech OTP Server')
    .replace(/SMS-Activate/g, 'SMS-Activate (Layanan Lama)')
    .replace(/src="\/blog\//gi, 'src="https://smscode.gg/blog/')
    .replace(/src="\/brand\//gi, 'src="https://smscode.gg/brand/');
}

// Title and Description Translation Map for Known Slugs
const translationMap = {
  'sms-activate-shutdown-alternatives': {
    title: 'SMS-Activate Tutup Permanen — Penyebab Utama & 5 Alternatif Terbaik (2026)',
    description: 'SMS-Activate resmi ditutup permanen setelah 10 tahun beroperasi. Teknologi dialihkan ke VTech OTP Server. Simak kronologi lengkap, peringatan penipuan, dan 5 alternatif nokos terpercaya.'
  },
  'airbnb-virtual-number-verification': {
    title: 'Cara Verifikasi Akun Airbnb Menggunakan Nomor Virtual — Panduan Lengkap Host & Guest (2026)',
    description: 'Gunakan nomor virtual OTP untuk memverifikasi akun Airbnb Anda. Panduan step-by-step verifikasi SMS tanpa harus menggunakan nomor ponsel pribadi.'
  },
  'best-countries-for-virtual-numbers-2026': {
    title: 'Negara Terbaik untuk Nomor Virtual OTP di 2026 — Rekomendasi Lengkap Sesuai Kebutuhan',
    description: 'Perbandingan nomor virtual Indonesia, AS, Inggris, Rusia, dan India — tingkat keberhasilan verifikasi, harga nokos, dan rekomendasi platform.'
  },
  'binance-virtual-number-verification': {
    title: 'Cara Verifikasi Akun Binance dengan Nomor Virtual OTP — Panduan Step-by-Step (2026)',
    description: 'Verifikasi akun Binance untuk KYC dan 2FA menggunakan nomor virtual OTP instan. Lengkapi verifikasi SMS dengan aman tanpa nomor pribadi.'
  },
  'bulk-sms-verification-automation-guide': {
    title: 'Cara Otomatisasi Verifikasi SMS OTP Massal via API — Panduan Developer (2026)',
    description: 'Panduan otomatisasi verifikasi OTP massal menggunakan API REST. Kelola antrean order, rotasi negara, dan kurangi traffic hingga 95% dengan webhook.'
  },
  'coinbase-virtual-number-verification': {
    title: 'Cara Verifikasi Akun Coinbase dengan Nomor Virtual — Panduan Lengkap (2026)',
    description: 'Verifikasi akun Coinbase Anda menggunakan nomor virtual OTP. Panduan lengkap keamanan akun, 2FA, dan solusi kendala kode SMS.'
  },
  'crypto-exchange-kyc-virtual-number': {
    title: 'Nomor Virtual untuk KYC Crypto Exchange — Panduan Mana Yang Berhasil & Yang Tidak (2026)',
    description: 'Perbandingan verifikasi akun crypto Binance, Coinbase, OKX, dan Bybit menggunakan nomor virtual. Syarat verifikasi dan strategi sukses.'
  },
  'free-vs-paid-virtual-numbers-comparison': {
    title: 'Nomor Virtual Gratis vs Berbayar — Mana Yang Wajib Anda Gunakan? (2026)',
    description: 'Perbandingan lengkap nomor virtual gratis vs berbayar. Risiko kebocoran data, pemblokiran akun, dan keunggulan nokos privat VTechOTP.'
  },
  'instagram-disabled-recovery-guide': {
    title: 'Akun Instagram Dinonaktifkan? Cara Pemulihan & Buat Akun Baru dengan Nokos (2026)',
    description: 'Panduan lengkap mengajukan banding akun Instagram yang di-banned atau membuat akun baru yang aman menggunakan nomor virtual VTechOTP.'
  },
  'instagram-verification-requirements-2026': {
    title: 'Syarat Verifikasi Instagram 2026 — Perubahan Terbaru & Cara Verifikasi OTP',
    description: 'Aturan verifikasi nomor telepon Instagram terbaru di 2026. Panduan lengkap penggunaan nomor virtual untuk pendaftaran akun Instagram.'
  },
  'multiple-instagram-accounts-guide': {
    title: 'Cara Membuat Banyak Akun Instagram dengan Nomor Virtual OTP (2026)',
    description: 'Strategi mengelola banyak akun Instagram secara aman tanpa terkena suspend menggunakan nomor virtual privat VTechOTP.'
  },
  'multiple-whatsapp-accounts-guide': {
    title: 'Cara Menjalankan Banyak Akun WhatsApp dalam 1 HP dengan Nokos (2026)',
    description: 'Panduan membuat dan mengaktifkan multiple akun WhatsApp dalam satu smartphone menggunakan nomor kosong (nokos) VTechOTP.'
  },
  'non-voip-vs-voip-numbers-explained': {
    title: 'Perbedaan Nomor Non-VoIP vs VoIP — Mana yang Terbaik untuk Verifikasi OTP? (2026)',
    description: 'Penjelasan lengkap perbandingan nomor kartu SIM Non-VoIP dengan VoIP biasa. Mengapa platform ketat seperti WhatsApp memerlukan nomor Non-VoIP.'
  },
  'revolut-virtual-number-verification': {
    title: 'Cara Verifikasi Akun Revolut dengan Nomor Virtual — Panduan Step-by-Step (2026)',
    description: 'Langkah mudah verifikasi SMS dan 2FA pada aplikasi keuangan Revolut menggunakan nomor virtual VTechOTP.'
  },
  'shopee-virtual-number-verification': {
    title: 'Cara Verifikasi Akun Shopee dengan Nomor Virtual OTP — Panduan Seller & Buyer (2026)',
    description: 'Panduan verifikasi akun Shopee Pembeli & Penjual menggunakan nomor virtual OTP. Solusi gagal SMS dan pendaftaran instan.'
  },
  'sim-swap-protection-virtual-numbers': {
    title: 'Perlindungan SIM Swap — Bagaimana Nomor Virtual Menjaga Keamanan Akun Anda (2026)',
    description: 'Cegah kejahatan pengambilalihan nomor kartu SIM (SIM Swap) dengan memanfaatkan nomor virtual privat untuk verifikasi akun sensitif.'
  },
  'telegram-channel-virtual-number-guide': {
    title: 'Cara Membuat Channel & Akun Telegram Tanpa Nomor Pribadi (2026)',
    description: 'Panduan mendaftar akun Telegram dan membuat channel publik/privat secara anonim menggunakan nokos Telegram VTechOTP.'
  },
  'temporary-vs-permanent-virtual-numbers': {
    title: 'Nomor Virtual Sementara vs Permanen — Mana Yang Anda Butuhkan? (2026)',
    description: 'Memahami perbedaan nokos sekali pakai (temporary) dengan sewa nomor jangka panjang untuk verifikasi berkala.'
  },
  'tiktok-banned-recovery-guide': {
    title: 'Akun TikTok Kena Banned? Cara Pemulihan & Pendaftaran Akun Baru (2026)',
    description: 'Langkah-langkah mengajukan banding akun TikTok yang diblokir atau mendaftar akun baru dengan nomor virtual VTechOTP.'
  },
  'virtual-number-for-online-dating-privacy': {
    title: 'Nomor Virtual untuk Aplikasi Dating — Jaga Kerahasiaan Nomor Pribadi Anda (2026)',
    description: 'Gunakan nomor virtual OTP untuk mendaftar akun Tinder, Bumble, dan aplikasi kencan online demi menjaga keamanan privasi pribadi.'
  }
};

function translateContentPhrases(html) {
  if (!html || typeof html !== 'string') return html;

  return html
    .replace(/What Happened to/gi, 'Apa yang Terjadi pada')
    .replace(/Why Did/gi, 'Mengapa')
    .replace(/How to Verify/gi, 'Cara Verifikasi')
    .replace(/How to Automate/gi, 'Cara Otomatisasi')
    .replace(/How to Create/gi, 'Cara Membuat')
    .replace(/How to Run/gi, 'Cara Menjalankan')
    .replace(/How to Match/gi, 'Cara Memilih')
    .replace(/How Do I Migrate/gi, 'Bagaimana Cara Migrasi')
    .replace(/What Is/gi, 'Apa Itu')
    .replace(/Is Any Service/gi, 'Apakah Ada Layanan')
    .replace(/What Are the Best/gi, 'Apa Saja Alternatif Terbaik')
    .replace(/What Are the/gi, 'Apa Saja')
    .replace(/What Does the/gi, 'Apa Arti')
    .replace(/Quick Comparison Table/gi, 'Tabel Perbandingan Lengkap')
    .replace(/Best Countries for/gi, 'Negara Terbaik untuk')
    .replace(/Step-by-Step Guide/gi, 'Panduan Step-by-Step')
    .replace(/Complete Guide/gi, 'Panduan Lengkap')
    .replace(/Developer Guide/gi, 'Panduan Developer')
    .replace(/Host & Guest Guide/gi, 'Panduan Host & Tamu')
    .replace(/Seller & Buyer Guide/gi, 'Panduan Penjual & Pembeli')
    .replace(/Troubleshooting Common/gi, 'Solusi Kendala')
    .replace(/Troubleshooting/gi, 'Solusi & Troubleshooting Kendala')
    .replace(/Wrapping Up/gi, 'Kesimpulan')
    .replace(/TL;DR:/gi, 'Ringkasan Ringkas:')
    .replace(/Ready to try/gi, 'Siap Mencoba')
    .replace(/What to read next/gi, 'Artikel Terkait Lainnya')
    .replace(/Step 1:/gi, 'Langkah 1:')
    .replace(/Step 2:/gi, 'Langkah 2:')
    .replace(/Step 3:/gi, 'Langkah 3:')
    .replace(/Step 4:/gi, 'Langkah 4:')
    .replace(/Step 5:/gi, 'Langkah 5:')
    .replace(/Step 6:/gi, 'Langkah 6:')
    .replace(/Step 7:/gi, 'Langkah 7:')
    .replace(/Free vs Paid/gi, 'Gratis vs Berbayar')
    .replace(/January/gi, 'Januari')
    .replace(/February/gi, 'Februari')
    .replace(/March/gi, 'Maret')
    .replace(/April/gi, 'April')
    .replace(/May/gi, 'Mei')
    .replace(/June/gi, 'Juni')
    .replace(/July/gi, 'Juli')
    .replace(/August/gi, 'Agustus')
    .replace(/September/gi, 'September')
    .replace(/October/gi, 'Oktober')
    .replace(/November/gi, 'November')
    .replace(/December/gi, 'Desember')
    .replace(/(\d+)\s*min read/gi, '$1 menit baca')
    .replace(/If you’re trying to/gi, 'Jika Anda sedang mencoba untuk')
    .replace(/The service that once/gi, 'Layanan yang pernah')
    .replace(/This article covers/gi, 'Artikel ini membahas')
    .replace(/Keep reading/gi, 'Simak panduan selengkapnya di bawah ini.')
    .replace(/For more details/gi, 'Untuk informasi lebih lanjut')
    .replace(/In this guide/gi, 'Dalam panduan ini')
    .replace(/Why does/gi, 'Mengapa')
    .replace(/Can you use/gi, 'Apakah Anda bisa menggunakan')
    .replace(/Do you need/gi, 'Apakah Anda memerlukan')
    .replace(/How much does/gi, 'Berapa biaya')
    .replace(/Is using a/gi, 'Apakah menggunakan')
    .replace(/What happens if/gi, 'Apa yang terjadi jika')
    .replace(/Create an account/gi, 'Buat akun VTechOTP')
    .replace(/Get your first virtual number/gi, 'Dapatkan nomor virtual OTP pertama Anda')
    .replace(/Get started/gi, 'Mulai Sekarang');
}

// Blog Proxy API for List
app.get('/api/blog-proxy', async (req, res) => {
  try {
    const { page = 1, limit = 10, tag = '', q = '' } = req.query;
    let targetUrl = `${API_BLOG_BASE}?page=${page}&limit=${limit}`;
    if (tag) targetUrl += `&tag=${encodeURIComponent(tag)}`;
    if (q) targetUrl += `&q=${encodeURIComponent(q)}`;

    const response = await fetch(targetUrl);
    if (!response.ok) {
      throw new Error(`API response status: ${response.status}`);
    }
    const data = await response.json();

    if (data && data.posts) {
      data.posts = data.posts.map(post => {
        const mapped = translationMap[post.slug];
        let title = mapped ? mapped.title : transformBranding(post.title);
        let description = mapped ? mapped.description : transformBranding(post.description);
        title = translateContentPhrases(title);
        description = translateContentPhrases(description);

        let date = post.date || '';
        date = translateContentPhrases(date);
        let readTime = post.readTime || '';
        readTime = translateContentPhrases(readTime);

        return {
          ...post,
          author: 'Tim VTechOTP',
          title,
          description,
          date,
          readTime
        };
      });
    }

    res.json(data);
  } catch (error) {
    console.error('Blog Proxy Error:', error.message);
    res.status(500).json({ error: 'Gagal mengambil data blog', details: error.message });
  }
});

// Blog Proxy API for Detail Slug
app.get('/api/blog-proxy/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const response = await fetch(`${API_BLOG_BASE}/${slug}`);
    if (!response.ok) {
      return res.status(404).json({ error: 'Artikel tidak ditemukan' });
    }
    const data = await response.json();

    if (data && data.post) {
      const mapped = translationMap[data.post.slug];
      let title = mapped ? mapped.title : transformBranding(data.post.title);
      let description = mapped ? mapped.description : transformBranding(data.post.description);
      title = translateContentPhrases(title);
      description = translateContentPhrases(description);

      data.post.author = 'Tim VTechOTP';
      data.post.title = title;
      data.post.description = description;
      data.post.date = translateContentPhrases(data.post.date || '');
      data.post.readTime = translateContentPhrases(data.post.readTime || '');

      if (data.post.contentHtml) {
        let content = transformBranding(data.post.contentHtml);
        content = translateContentPhrases(content);
        data.post.contentHtml = content;
      }
      if (data.post.contentText) {
        let text = transformBranding(data.post.contentText);
        text = translateContentPhrases(text);
        data.post.contentText = text;
      }
      if (data.post.headings) {
        data.post.headings = data.post.headings.map(h => ({
          ...h,
          text: translateContentPhrases(transformBranding(h.text))
        }));
      }
    }

    res.json(data);
  } catch (error) {
    console.error('Blog Detail Proxy Error:', error.message);
    res.status(500).json({ error: 'Gagal mengambil detail artikel', details: error.message });
  }
});

// Live activity feed data endpoint
app.get('/api/activity', (req, res) => {
  const activities = generateActivities();
  res.json(activities);
});

// Stats endpoint
app.get('/api/stats', (req, res) => {
  res.json({
    totalUsers: 482917 + Math.floor(Math.random() * 100),
    todayOrders: 12847 + Math.floor(Math.random() * 50),
    successRate: 98.7,
    countries: 200
  });
});

// Page Routes
app.get('/playstore', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'playstore.html'));
});

app.get(['/blog', '/blog.html'], (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'blog.html'));
});

// Blog slug detail page — ensure static file requests like /blog/css/style.css or /blog/image.png don't match slug!
app.get('/blog/:slug', (req, res, next) => {
  if (/\.(css|js|png|jpg|jpeg|gif|svg|ico|json|woff2?|ttf|eot)$/i.test(req.params.slug)) {
    return next();
  }
  res.sendFile(path.join(__dirname, 'public', 'blog-detail.html'));
});

app.get(['/syarat-ketentuan', '/terms', '/terms.html'], (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'terms.html'));
});

app.get(['/pusat-bantuan', '/help', '/help.html', '/faq'], (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'help.html'));
});

app.get(['/kebijakan-privasi', '/privacy', '/privacy.html'], (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'privacy.html'));
});

// Static Asset 404 Guard — prevent HTML fallback for missing CSS/JS/images
app.use((req, res, next) => {
  if (/\.(css|js|png|jpg|jpeg|gif|svg|ico|json|woff2?|ttf|eot)$/i.test(req.path)) {
    return res.status(404).type('text/plain').send('404 File Not Found');
  }
  next();
});

// Fallback all other HTML routes to index
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

function generateActivities() {
  const platforms = [
    { name: 'WhatsApp', color: '#25D366', initial: 'W' },
    { name: 'Telegram', color: '#229ED9', initial: 'T' },
    { name: 'Instagram', color: '#E1306C', initial: 'I' },
    { name: 'TikTok', color: '#010101', initial: 'Tk' },
    { name: 'Facebook', color: '#1877F2', initial: 'F' },
    { name: 'Google', color: '#EA4335', initial: 'G' },
    { name: 'Twitter', color: '#1DA1F2', initial: 'Tw' },
    { name: 'Discord', color: '#5865F2', initial: 'D' },
    { name: 'Netflix', color: '#E50914', initial: 'N' },
    { name: 'Shopee', color: '#EE4D2D', initial: 'S' }
  ];
  const countries = ['Indonesia', 'India', 'USA', 'Malaysia', 'Thailand', 'Philippines', 'Vietnam', 'Brazil', 'Russia', 'China'];
  const usernames = [
    'andi_s91', 'budi_pw', 'sari_ww', 'dewi_mk', 'rizky_f',
    'fajar_hd', 'maya_r', 'dian_ps', 'bagus_o', 'tina_kw',
    'reza_am', 'yuni_ta', 'hendra_s', 'nisa_pk', 'bagas_r',
    'lina_sm', 'eko_wd', 'fitri_ns', 'agung_b', 'putri_an',
    'joko_ws', 'ratna_d', 'gilang_p', 'ayu_ms', 'ivan_kr',
    'citra_y', 'danu_fw', 'elsa_pm', 'fandi_rk', 'gita_sl'
  ];

  const depositUsers = [
    'user_8821', 'kang_joko', 'mbak_sari', 'bro_rendi', 'sis_mila',
    'vtech_star', 'topup_aja', 'isi_saldo', 'cepat_aktif', 'trust_user',
    'buyer_pro', 'fast_order', 'top_member', 'vip_user77', 'loyal_vtech'
  ];

  const activities = [];

  for (let i = 0; i < 12; i++) {
    const platform = platforms[Math.floor(Math.random() * platforms.length)];
    const country = countries[Math.floor(Math.random() * countries.length)];
    const username = usernames[Math.floor(Math.random() * usernames.length)];
    const price = [1950, 2050, 2150, 2250, 2350, 2450, 2550, 2650][Math.floor(Math.random() * 8)];
    const minutesAgo = Math.floor(Math.random() * 10);

    activities.push({
      type: 'order',
      username,
      platform: platform.name,
      platformColor: platform.color,
      platformInitial: platform.initial,
      country,
      price,
      time: minutesAgo === 0 ? 'Baru saja' : `${minutesAgo} menit lalu`,
      status: 'Sukses'
    });
  }

  for (let i = 0; i < 8; i++) {
    const username = depositUsers[Math.floor(Math.random() * depositUsers.length)];
    const amounts = [10000, 25000, 50000, 100000, 150000, 200000, 500000];
    const amount = amounts[Math.floor(Math.random() * amounts.length)];
    const minutesAgo = Math.floor(Math.random() * 15);

    activities.push({
      type: 'deposit',
      username,
      amount,
      time: minutesAgo === 0 ? 'Baru saja' : `${minutesAgo} menit lalu`,
      method: 'QRIS',
      status: 'Berhasil'
    });
  }

  return activities.sort(() => Math.random() - 0.5);
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`VtechOTP server running on port ${PORT}`);
});

module.exports = app;

