# VTechOTP Developer Kit & Reseller Integration (v1)

> **Official Developer Integration Kit for VTechOTP** — Real-Time Virtual Phone Numbers & Automated SMS OTP Verification covering 200+ countries and 500+ digital platforms (WhatsApp, Telegram, Google, OpenAI/ChatGPT, TikTok, Discord, etc.).

[ English ] | [ Bahasa Indonesia ]

---

## 📦 What's Inside

```
vtechotp-developer-kit/
├── api-docs/
│   ├── index.html                  # Interactive Multilingual API Documentation (EN / ID / RU)
│   ├── README.md                   # Endpoint cheatsheet & authentication summary
│   └── images/                     # Logos & gateway assets
├── example-bot/
│   ├── bot.js                      # Production-ready Node.js bot template (Telegram / WhatsApp / Discord)
│   ├── package.json                # Dependencies (axios, express, dotenv)
│   ├── .env.example                # Configuration template
│   └── README.md                   # Bot setup & deployment guide
├── openapi.json                    # OpenAPI 3.0.3 specification (Import to Swagger / Insomnia)
├── vtechotp.postman_collection.json # Ready-to-use Postman Collection v2.1
├── WIKI.md                         # Comprehensive Buyer, Developer & Reseller Wiki
└── README.md                       # This guide
```

---

## ⚡ Quick Start for Developers & International Buyers

### 1. Base URL & Authentication
- **Production Endpoint:** `https://app.otp.vtech.biz.id/api/v1`
- **Gateway Endpoint:** `https://vtechotp.web.id/api/v1`
- Include your API Token in every HTTP request header:
  ```http
  Authorization: Bearer vtk_your_api_token_here
  Content-Type: application/json
  ```
- Generate your free token at: [https://vtechotp.web.id](https://vtechotp.web.id) (Profile > Developer API).

### 2. Currency & Coin System
- **1 Coin = 1 IDR** (Indonesian Rupiah).
- Approximate International Conversion:
  - **$1 USD ≈ 16,000 Coins**
  - Virtual numbers typically range from **800 Coins ($0.05)** to **6,000 Coins ($0.38)** depending on service & country.
- **Deposit Methods:**
  - **Domestic (Indonesia):** QRIS Instant 24/7 (BCA, Mandiri, BRI, BNI, Dana, OVO, GoPay, ShopeePay), Virtual Account, Alfamart/Indomaret.
  - **International & Crypto:** Automated / Admin crypto deposit (USDT TRC20, LTC, TON, BTC, Binance Pay).

### 3. Order Virtual Number in 3 Steps

#### Step A: Check Balance
```bash
curl -s https://app.otp.vtech.biz.id/api/v1/balance \
  -H "Authorization: Bearer vtk_your_api_token_here"
```

#### Step B: Rent a Number (WhatsApp ID: 1, Indonesia ID: 6)
```bash
curl -s -X POST https://app.otp.vtech.biz.id/api/v1/orders/create \
  -H "Authorization: Bearer vtk_your_api_token_here" \
  -H "Content-Type: application/json" \
  -d '{"country_id": 6, "platform_id": 1}'
```

#### Step C: Poll for Incoming OTP Code (or receive via Webhook)
```bash
curl -s https://app.otp.vtech.biz.id/api/v1/orders/{ORDER_ID} \
  -H "Authorization: Bearer vtk_your_api_token_here"
```

---

## 🛡️ Guarantee & Smart Line Health

1. **100% Auto-Refund Guarantee:** If no SMS verification code is received within the rental time window (15–20 minutes), the full balance is automatically refunded to your coin balance.
2. **Smart Line Health:** When fetching products (`GET /catalog/products?sort=quality`), our system automatically filters out non-performing carrier routes to guarantee the highest OTP delivery success rate.

---

## 🛠️ Tools & SDK Integration

- **Interactive Web Documentation:** Open `api-docs/index.html` in any browser. It supports English, Indonesian, and Russian language toggles, light/dark themes, and interactive code generation.
- **Postman:** Open Postman -> Click **Import** -> Select `vtechotp.postman_collection.json`. Set the `apiToken` variable to begin testing.
- **Swagger / OpenAPI:** Import `openapi.json` into [Swagger Editor](https://editor.swagger.io/) or generate client SDKs for Python, Go, C#, Java, or Rust with `openapi-generator`.

---

## 💼 For Resellers & Bot Creators (Monetize Today)

Looking to launch an SMS OTP bot in your country or on Telegram?
1. Follow `example-bot/README.md` to deploy a full-featured bot in under 5 minutes.
2. Set your custom markup margin (e.g. charge $0.30 per number that costs $0.15).
3. Read `WIKI.md` for proven growth, marketing, and acquisition strategies.
