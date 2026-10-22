# VTechOTP Bot Integration Template (Node.js)

Template kode integrasi bot lengkap siap pakai menggunakan **VTechOTP Developer API v1**.
Dapat digunakan untuk:
* Bot Telegram (Node-Telegram-Bot-API / Telegraf)
* Bot WhatsApp (Baileys / WhiskeySockets / WPPConnect)
* Bot Discord (Discord.js)
* Webhook Automation / Backend E-Commerce

---

## Fitur Template

1. **VTechOTP API Client:**
   * Cek Saldo & Profil Developer
   * Pencarian Katalog Negara, Layanan, Operator & Produk Pricelist
   * Smart Quality Filter: otomatis memprioritaskan jalur carrier pool besar & stabil (`sort=quality`)
   * Pemesanan Nomor Virtual (`createOrder`) & Pembatalan Otomatis Garansi Saldo Kembali (`cancelOrder`)
   * Penerimaan Kode SMS OTP Real-Time

2. **Deposit & Pembayaran Otomatis:**
   * Generator invoice deposit multi-channel (QRIS Realtime, Bank Virtual Account BCA/BRI/BNI/Mandiri, Kasir Alfamart/Indomaret)
   * Minimal deposit Rp 10.000 dengan biaya admin flat Rp 100
   * Cek status pembayaran real-time

3. **Server Webhook Express:**
   * Endpoint `POST /webhook` dengan verifikasi signature keamanan HMAC-SHA256 (`x-vtech-signature`).
   * Menangani event `order.otp_received`, `order.completed`, `order.expired`, `order.canceled`, dan `deposit.credited`.

4. **Sistem Saldo & Database Pengguna Mandiri:**
   * Menggunakan penyimpanan JSON lokal terstruktur (`data/users.json`, `data/orders.json`, `data/deposits.json`) untuk bot Anda sendiri.

---

## Cara Instalasi & Menjalankan

### 1. Ekstrak & Masuk ke Folder
```bash
cd example-bot
```

### 2. Pasang Dependencies
```bash
npm install
```

### 3. Konfigurasi Token API
Salin `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```
Buka file `.env` dan masukkan token API Developer Anda:
```env
API_BASE_URL=https://app.otp.vtech.biz.id/api/v1
API_TOKEN=vtk_your_api_token_here
WEBHOOK_SECRET=sec_your_webhook_secret_here
PORT=3000
```

### 4. Jalankan Bot
```bash
npm start
```
Bot akan aktif di terminal, memuat database lokal, dan mendengarkan webhook di `http://localhost:3000/webhook`.

---

## Daftar Perintah Bot

| Perintah | Deskripsi |
| :--- | :--- |
| `.menu` | Menampilkan dashboard menu utama bot |
| `.saldo` | Mengecek saldo bot Anda |
| `.deposit [nominal] [service_id]` | Membuat invoice deposit (QRIS / VA / Retail, min Rp 10.000) |
| `.channels` | Melihat daftar saluran pembayaran aktif |
| `.cekdeposit [ref_id]` | Mengecek status pembayaran deposit |
| `.countries` | Menampilkan daftar negara dan ID negara |
| `.services` | Menampilkan daftar layanan (WhatsApp, Telegram, dll) |
| `.products [country_id]` | Menampilkan pricelist produk dan kuota stok |
| `.buy [country_id] [platform_id] [max_price]` | Memesan nomor virtual OTP baru |
| `.status [order_id]` | Mengecek kode SMS OTP yang masuk |
| `.active` | Melihat seluruh pesanan yang sedang aktif |
| `.cancel [order_id]` | Membatalkan pesanan (saldo kembali 100%) |
| `.finish [order_id]` | Menyelesaikan pesanan setelah OTP diterima |
| `.history` | Melihat riwayat transaksi & pesanan |
