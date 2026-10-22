# VTechOTP Developer API Cheatsheet (v1)

> Quick reference guide for the VTechOTP Developer REST API. For the interactive multilingual documentation, open **`index.html`** in your web browser.

---

## 🔑 Authentication
Include your developer API Bearer token in every request:
```http
Authorization: Bearer vtk_your_api_token_here
Content-Type: application/json
```

---

## 🌐 Endpoints Summary

### 1. User & Balance
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/balance` | Get coin balance (1 Coin = 1 IDR) and active order slots |
| `GET` | `/api/v1/profile` | Get developer profile and token permissions |

### 2. Catalog & Products
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/catalog/countries` | List 200+ countries with country ID and dial codes |
| `GET` | `/api/v1/catalog/services` | List platforms (WhatsApp, Telegram, Google, etc.) |
| `GET` | `/api/v1/catalog/operators` | List mobile operators for given country & platform |
| `GET` | `/api/v1/catalog/products` | Real-time pricing & stock. Supports `?sort=quality` |

### 3. Orders & SMS OTP
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/orders/create` | Order a new virtual number (funds deducted temporarily) |
| `GET` | `/api/v1/orders` | Paginated order history (`?page=1&limit=10&status=active`) |
| `GET` | `/api/v1/orders/active` | Get all orders currently waiting for SMS OTP |
| `GET` | `/api/v1/orders/{id}` | Get incoming SMS verification code and remaining time |
| `POST` | `/api/v1/orders/{id}/cancel` | Cancel order with 100% immediate coin refund |
| `POST` | `/api/v1/orders/{id}/finish` | Mark order complete after OTP is consumed |
| `POST` | `/api/v1/orders/{id}/resend` | Request secondary SMS verification code if supported |

### 4. Deposits & Payment Gateway
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/deposits/channels` | List payment gateways (QRIS, VA, Minimarket, Crypto) |
| `POST` | `/api/v1/deposits/create` | Create invoice (`channel_code`, `amount`) |
| `GET` | `/api/v1/deposits/{id}` | Check deposit payment verification status |
| `GET` | `/api/v1/deposits` | User deposit history |
| `GET` | `/api/v1/deposits/config` | Minimum/maximum deposit limits and flat fee |

### 5. Webhook Real-time Push
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/webhook` | Get current webhook configuration |
| `PATCH` | `/api/v1/webhook` | Register callback URL & HMAC secret |
| `POST` | `/api/v1/webhook/test` | Dispatch mock `order.otp_received` event |

---

## 💱 International Currency Conversion
- **1 Coin = 1 IDR** (Indonesian Rupiah).
- Approximate International Conversion:
  - **$1 USD ≈ 16,000 Coins**
  - **$5 USD ≈ 80,000 Coins**
  - **$10 USD ≈ 160,000 Coins**
- For Crypto deposits (USDT TRC20, LTC, TON, BTC), contact official support or use the Crypto payment gateway in dashboard.
