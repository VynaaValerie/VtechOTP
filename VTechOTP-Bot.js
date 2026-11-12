// ==============================================================================
// VTechOTP Bot - Full Feature Integration Template (Developer API v1)
// Compatible with Telegram Bot, WhatsApp Bot (Baileys / WhiskeySockets), Discord, etc.
// Dokumentasi Resmi: https://vtechotp.web.id/docs | Wiki: https://vtechotp.web.id/wiki
// Developer Kit & OpenAPI Spec: https://vtechotp.web.id/downloads/vtechotp-developer-kit.zip
// ==============================================================================

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const readline = require('readline');

// Optional dependencies (axios, dotenv, express)
let axios;
try {
    axios = require('axios');
} catch (e) {
    console.warn('[VTechOTP] Warning: module "axios" not found. Please run "npm install axios dotenv express".');
}

try {
    require('dotenv').config();
} catch (_) {}

let express;
try {
    express = require('express');
} catch (_) {}

// ── 1. Configuration ─────────────────────────────────────────────────────────
const CONFIG = {
    // URL Base API Server VTechOTP (Production)
    // Production: https://app.otp.vtech.biz.id/api/v1
    // Gateway:    https://vtechotp.web.id/api/v1
    API_BASE_URL: (process.env.VTECHOTP_API_URL || process.env.API_BASE_URL || 'https://app.otp.vtech.biz.id/api/v1').replace(/\/+$/, ''),

    // API Token Developer Anda (Dapatkan dari Menu Developer: https://vtechotp.web.id/profile)
    // Format token: vtk_... (Bearer token)
    API_TOKEN: process.env.VTECHOTP_API_TOKEN || process.env.API_TOKEN || 'YOUR_VTECHOTP_API_TOKEN',

    // Webhook Secret (HMAC-SHA256) untuk memverifikasi payload webhook otomatis
    WEBHOOK_SECRET: process.env.VTECHOTP_WEBHOOK_SECRET || process.env.WEBHOOK_SECRET || 'YOUR_WEBHOOK_SECRET',

    // Port Server Webhook Lokal
    PORT: parseInt(process.env.PORT || '3000', 10),

    // Optional Telegram Bot Token
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || process.env.BOT_TOKEN || null,

    // Folder Penyimpanan Database JSON Lokal
    DATA_DIR: path.join(__dirname, 'data'),
    USERS_FILE: path.join(__dirname, 'data', 'users.json'),
    ORDERS_FILE: path.join(__dirname, 'data', 'orders.json'),
    DEPOSITS_FILE: path.join(__dirname, 'data', 'deposits.json')
};

// Buat direktori data jika belum ada
if (!fs.existsSync(CONFIG.DATA_DIR)) {
    try {
        fs.mkdirSync(CONFIG.DATA_DIR, { recursive: true });
    } catch (_) {}
}

// Inisialisasi file JSON penyimpanan lokal
function initJSONFile(filePath, defaultData) {
    if (!fs.existsSync(filePath)) {
        try {
            fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
        } catch (_) {}
    }
}

initJSONFile(CONFIG.USERS_FILE, {});
initJSONFile(CONFIG.ORDERS_FILE, {});
initJSONFile(CONFIG.DEPOSITS_FILE, {});

// Helper utilitas JSON
function readJSONFile(filePath) {
    try {
        if (!fs.existsSync(filePath)) return {};
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data || '{}');
    } catch (error) {
        return {};
    }
}

function writeJSONFile(filePath, data) {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error(`[Storage] Gagal menulis ke ${filePath}:`, error.message);
    }
}

function generateOrderId() {
    return 'ORD' + Date.now() + Math.random().toString(36).substring(2, 8).toUpperCase();
}

function generateDepositId() {
    return 'DEP' + Date.now() + Math.random().toString(36).substring(2, 8).toUpperCase();
}

// ── 2. VTechOTP API Client Class ──────────────────────────────────────────────
// Sesuai OpenAPI 3.0.3 Specification (openapi.json) & API Docs Cheatsheet (21 Endpoints)
class VTechOTPAPI {
    constructor(token = CONFIG.API_TOKEN, baseURL = CONFIG.API_BASE_URL) {
        this.token = token;
        this.baseURL = baseURL;
        if (axios) {
            this.client = axios.create({
                baseURL: this.baseURL,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'User-Agent': 'VTechOTP-Bot-Client/1.0'
                },
                timeout: 30000
            });
        }
    }

    // ── Module 1: User & Balance ──────────────────────────────────────────────
    // GET /balance → BalanceData { balance, active_orders, max_active_orders, currency }
    async getBalance() {
        try {
            const response = await this.client.get('/balance');
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // GET /profile → Developer profile, verification status, API access privileges
    async getProfile() {
        try {
            const response = await this.client.get('/profile');
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // ── Module 2: Catalog & Products ──────────────────────────────────────────
    // GET /catalog/countries → List 200+ countries with dial code, ISO code
    async getCountries() {
        try {
            const response = await this.client.get('/catalog/countries');
            const data = response.data;
            return {
                status: data.status ?? data.success ?? true,
                success: data.status ?? data.success ?? true,
                data: Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : (data.data?.data || []))
            };
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // GET /catalog/services?country_id= → List platforms (WhatsApp, Telegram, Google, etc.)
    async getServices(countryId = null) {
        try {
            let url = '/catalog/services';
            if (countryId) url += `?country_id=${encodeURIComponent(countryId)}`;
            const response = await this.client.get(url);
            const data = response.data;
            return {
                status: data.status ?? data.success ?? true,
                success: data.status ?? data.success ?? true,
                data: Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : (data.data?.data || []))
            };
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // GET /catalog/operators?country_id=&platform_id= → List mobile operators
    async getOperators(countryId, platformId) {
        try {
            const response = await this.client.get(`/catalog/operators?country_id=${encodeURIComponent(countryId)}&platform_id=${encodeURIComponent(platformId)}`);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // GET /catalog/products?country_id=&platform_id=&operator_id=&sort=quality|cheapest
    // sort: 'quality' = Smart Line Health (prioritas rute terbaik & lolos evaluasi delivery)
    //       'cheapest' = harga termurah
    async getProducts(countryId = null, platformId = null, operatorIdOrSort = 'quality', maybeSort = 'quality') {
        try {
            let url = '/catalog/products';
            const params = new URLSearchParams();

            let operatorId = null;
            let sort = 'quality';

            // Mendukung parameter fleksibel (baik object maupun positional)
            if (typeof countryId === 'object' && countryId !== null) {
                const opt = countryId;
                if (opt.country_id || opt.countryId) params.append('country_id', opt.country_id || opt.countryId);
                if (opt.platform_id || opt.service_id || opt.platformId) params.append('platform_id', opt.platform_id || opt.service_id || opt.platformId);
                if (opt.operator_id || opt.operatorId) params.append('operator_id', opt.operator_id || opt.operatorId);
                if (opt.sort) params.append('sort', opt.sort);
            } else {
                if (countryId) params.append('country_id', countryId);
                if (platformId) params.append('platform_id', platformId);

                if (typeof operatorIdOrSort === 'number' || (typeof operatorIdOrSort === 'string' && /^\d+$/.test(operatorIdOrSort))) {
                    operatorId = operatorIdOrSort;
                    sort = maybeSort || 'quality';
                    params.append('operator_id', operatorId);
                } else if (typeof operatorIdOrSort === 'string') {
                    sort = operatorIdOrSort;
                }
                if (sort) params.append('sort', sort);
            }

            if (params.toString()) url += '?' + params.toString();

            const response = await this.client.get(url);
            const data = response.data;
            return {
                status: data.status ?? data.success ?? true,
                success: data.status ?? data.success ?? true,
                data: Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : [])
            };
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // ── Module 3: Orders & SMS OTP ────────────────────────────────────────────
    // POST /orders/create
    // Body (OpenAPI OrderCreateRequest):
    //   { country_id (required), platform_id (required), operator_id?, catalog_product_id?, max_price? }
    // Response: OrderData { order_id, phone_number, country_id, country_name, platform_id, platform_name,
    //   operator_id, operator_name, price, status, sms_code, full_sms, expires_at, seconds_remaining }
    async createOrder(params) {
        try {
            const payload = {
                country_id: Number(params.country_id || params.countryId),
                platform_id: Number(params.platform_id || params.service_id || params.platformId)
            };

            const prodId = params.catalog_product_id || params.product_id || params.productId;
            if (prodId) payload.catalog_product_id = Number(prodId);

            if (params.max_price || params.maxPrice) {
                payload.max_price = Number(params.max_price || params.maxPrice);
            }
            if (params.operator_id || params.operatorId) {
                payload.operator_id = Number(params.operator_id || params.operatorId);
            }
            if (params.quantity && Number(params.quantity) > 1) {
                payload.quantity = Number(params.quantity);
            }

            const response = await this.client.post('/orders/create', payload);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // GET /orders/{id} → Get incoming SMS verification code and remaining time
    async getOrder(orderId) {
        try {
            const response = await this.client.get(`/orders/${encodeURIComponent(orderId)}`);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // POST /orders/{id}/cancel → Cancel order with 100% immediate coin refund
    async cancelOrder(orderId) {
        try {
            const response = await this.client.post(`/orders/${encodeURIComponent(orderId)}/cancel`);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // POST /orders/{id}/finish → Mark order complete after OTP is consumed
    async finishOrder(orderId) {
        try {
            const response = await this.client.post(`/orders/${encodeURIComponent(orderId)}/finish`);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // POST /orders/{id}/resend → Request secondary SMS verification code if supported
    async resendOrder(orderId) {
        try {
            const response = await this.client.post(`/orders/${encodeURIComponent(orderId)}/resend`);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // GET /orders/active → Get all orders currently waiting for SMS OTP
    async getActiveOrders() {
        try {
            const response = await this.client.get('/orders/active');
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // GET /orders?page=1&limit=10&status=active|completed|canceled|expired
    async getAllOrders(page = 1, limit = 10, status = null) {
        try {
            let url = `/orders?page=${page}&limit=${limit}`;
            if (status) url += `&status=${encodeURIComponent(status)}`;
            const response = await this.client.get(url);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // ── Module 4: Deposits & Payment Gateway ──────────────────────────────────
    // GET /deposits/config → Minimum/maximum deposit limits and flat fee
    async getDepositConfig() {
        try {
            const response = await this.client.get('/deposits/config');
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // GET /deposits/channels → List payment gateways (QRIS, VA, Minimarket, Crypto)
    async getDepositChannels() {
        try {
            const response = await this.client.get('/deposits/channels');
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // POST /deposits/create
    // Body (OpenAPI DepositCreateRequest): { channel_code (required), amount (required, min 10000) }
    async createDeposit(amount, channelCode = '11', phone = null) {
        try {
            const payload = {
                amount: parseInt(amount, 10),
                channel_code: String(channelCode || '11'),
                service_id: String(channelCode || '11') // Backward compatibility
            };
            if (phone) payload.phone = String(phone);

            const response = await this.client.post('/deposits/create', payload);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // GET /deposits/{id} → Check deposit payment verification status
    async getDeposit(depositId) {
        try {
            const response = await this.client.get(`/deposits/${encodeURIComponent(depositId)}`);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // GET /deposits?page=1&limit=10&status= → User deposit history
    async getDepositHistory(page = 1, limit = 10, status = null) {
        try {
            let url = `/deposits?page=${page}&limit=${limit}`;
            if (status) url += `&status=${encodeURIComponent(status)}`;
            const response = await this.client.get(url);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // ── Module 5: Webhook Real-time Push ──────────────────────────────────────
    // GET /webhook → Get current webhook configuration
    async getWebhook() {
        try {
            const response = await this.client.get('/webhook');
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // PATCH /webhook → Register/update callback URL & HMAC secret
    // Body (WebhookUpdateRequest): { url (required), secret? }
    async updateWebhook(url, secret = null) {
        try {
            const payload = { url };
            if (secret) payload.secret = secret;
            const response = await this.client.patch('/webhook', payload);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // POST /webhook/test → Dispatch mock order.otp_received event
    async testWebhook() {
        try {
            const response = await this.client.post('/webhook/test');
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Format Pesan Error (sesuai OpenAPI ErrorResponse schema)
    handleError(error) {
        if (error.response) {
            const { status, data } = error.response;
            const code = data?.error || data?.code || `HTTP_${status}`;
            const msg = data?.message || data?.msg || (typeof data === 'string' ? data : JSON.stringify(data));
            return new Error(`[${code}] ${msg}`);
        }
        return new Error(`Network Error: ${error.message}`);
    }
}

// ── 3. User Management (Penyimpanan Lokal Pengguna Bot) ────────────────────────
class UserManager {
    constructor() {
        this.usersFile = CONFIG.USERS_FILE;
    }

    getUser(userId) {
        const users = readJSONFile(this.usersFile);
        return users[userId] || null;
    }

    createUser(userId, userData = {}) {
        const users = readJSONFile(this.usersFile);
        if (!users[userId]) {
            users[userId] = {
                id: userId,
                balance: 0,
                totalOrders: 0,
                activeOrders: 0,
                createdAt: new Date().toISOString(),
                lastActivity: new Date().toISOString(),
                ...userData
            };
            writeJSONFile(this.usersFile, users);
        }
        return users[userId];
    }

    updateUser(userId, updates) {
        const users = readJSONFile(this.usersFile);
        if (users[userId]) {
            users[userId] = { ...users[userId], ...updates, lastActivity: new Date().toISOString() };
            writeJSONFile(this.usersFile, users);
        }
        return users[userId];
    }

    async updateBalance(userId, amount, operation = 'add') {
        const user = this.getUser(userId);
        if (!user) return null;

        const newBalance = operation === 'add'
            ? (user.balance || 0) + Number(amount)
            : (user.balance || 0) - Number(amount);

        return this.updateUser(userId, { balance: Math.max(0, newBalance) });
    }

    getAllUsers() {
        return readJSONFile(this.usersFile);
    }
}

// ── 4. Order Management (Penyimpanan Pesanan Bot) ──────────────────────────────
class OrderManager {
    constructor() {
        this.ordersFile = CONFIG.ORDERS_FILE;
    }

    getOrder(orderId) {
        const orders = readJSONFile(this.ordersFile);
        return orders[orderId] || null;
    }

    saveOrder(orderData) {
        const orders = readJSONFile(this.ordersFile);
        const orderId = orderData.order_id || orderData.id || generateOrderId();
        orders[orderId] = {
            ...orderData,
            id: orderId,
            order_id: orderId,
            status: orderData.status || 'active',
            createdAt: orderData.created_at || new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        writeJSONFile(this.ordersFile, orders);
        return orders[orderId];
    }

    updateOrderStatus(orderId, status, additionalData = {}) {
        const orders = readJSONFile(this.ordersFile);
        if (orders[orderId]) {
            orders[orderId] = {
                ...orders[orderId],
                status: status,
                ...additionalData,
                updatedAt: new Date().toISOString()
            };
            writeJSONFile(this.ordersFile, orders);
            return orders[orderId];
        }
        return null;
    }

    updateOrder(orderId, updates) {
        const orders = readJSONFile(this.ordersFile);
        if (orders[orderId]) {
            orders[orderId] = { ...orders[orderId], ...updates, updatedAt: new Date().toISOString() };
            writeJSONFile(this.ordersFile, orders);
        }
        return orders[orderId];
    }

    getUserOrders(userId, limit = 10) {
        const orders = readJSONFile(this.ordersFile);
        return Object.values(orders)
            .filter(order => order.userId === userId)
            .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
            .slice(0, limit);
    }

    getActiveOrders(userId = null) {
        const orders = readJSONFile(this.ordersFile);
        return Object.values(orders).filter(order => {
            const isActive = ['active', 'received', 'ACTIVE', 'PENDING', 'WAITING_OTP', 'OTP_RECEIVED'].includes(order.status);
            return userId ? (isActive && order.userId === userId) : isActive;
        });
    }

    getActiveUserOrders(userId) {
        return this.getActiveOrders(userId);
    }
}

// ── 5. Deposit Management (Penyimpanan Deposit Tagihan Bot) ────────────────────
class DepositManager {
    constructor() {
        this.depositsFile = CONFIG.DEPOSITS_FILE;
    }

    getDeposit(depositId) {
        const deposits = readJSONFile(this.depositsFile);
        return deposits[depositId] || null;
    }

    saveDeposit(depositData) {
        const deposits = readJSONFile(this.depositsFile);
        const depositId = depositData.internal_ref || depositData.deposit_id || depositData.id || depositData.reference || generateDepositId();
        deposits[depositId] = {
            ...depositData,
            id: depositId,
            internal_ref: depositId,
            status: depositData.status || 'pending',
            createdAt: depositData.created_at || new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        writeJSONFile(this.depositsFile, deposits);
        return deposits[depositId];
    }

    updateDepositStatus(depositId, status, additionalData = {}) {
        const deposits = readJSONFile(this.depositsFile);
        if (deposits[depositId]) {
            deposits[depositId] = {
                ...deposits[depositId],
                status: status,
                ...additionalData,
                updatedAt: new Date().toISOString()
            };
            writeJSONFile(this.depositsFile, deposits);
            return deposits[depositId];
        }
        return null;
    }

    updateDeposit(depositId, updates) {
        const deposits = readJSONFile(this.depositsFile);
        if (deposits[depositId]) {
            deposits[depositId] = { ...deposits[depositId], ...updates, updatedAt: new Date().toISOString() };
            writeJSONFile(this.depositsFile, deposits);
        }
        return deposits[depositId];
    }

    getUserDeposits(userId, limit = 10) {
        const deposits = readJSONFile(this.depositsFile);
        return Object.values(deposits)
            .filter(deposit => deposit.userId === userId)
            .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
            .slice(0, limit);
    }
}

// ── 6. Bot Logic Handler & Command Router ─────────────────────────────────────
class OTPBot {
    constructor(botContext) {
        this.bot = botContext; // Adapter pesan chat (Telegram, WhatsApp, Discord, Terminal)
        this.api = new VTechOTPAPI(CONFIG.API_TOKEN, CONFIG.API_BASE_URL);
        this.userManager = new UserManager();
        this.orderManager = new OrderManager();
        this.depositManager = new DepositManager();

        // Support kedua gaya context: flat ({ userId, command, args }) atau nested ({ msg: { from, chat, command, arg } })
        if (botContext.msg) {
            this.userId = String(botContext.msg.from?.id || botContext.msg.chat?.id || botContext.userId || 'console_user');
            this.userName = botContext.msg.from?.first_name || botContext.userName || 'User';
        } else {
            this.userId = String(botContext.userId || 'console_user');
            this.userName = botContext.userName || 'User';
        }

        // Register user lokal
        this.user = this.userManager.createUser(this.userId, {
            name: this.userName,
            username: botContext.msg?.from?.username || '',
            platform: botContext.platform || 'chat'
        });
    }

    // Router Perintah
    async handleCommand() {
        let command, args;

        if (this.bot.msg) {
            command = (this.bot.msg.command || '').toLowerCase();
            args = (this.bot.msg.arg || '').trim().split(/\s+/).filter(Boolean);
        } else {
            command = (this.bot.command || '').toLowerCase();
            args = this.bot.args || [];
        }

        // Normalisasi prefix titik jika masih ada
        if (command.startsWith('.')) {
            command = command.substring(1);
        }

        switch (command) {
            case 'buy':
            case 'beli':
            case 'order':
                return await this.cmdBuy(args);

            case 'status':
            case 'otp':
            case 'cek':
                return await this.cmdStatus(args);

            case 'cancel':
            case 'batal':
                return await this.cmdCancel(args);

            case 'finish':
            case 'selesai':
                return await this.cmdFinish(args);

            case 'resend':
            case 'kirimulang':
                return await this.cmdResend(args);

            case 'active':
            case 'aktif':
                return await this.cmdActive();

            case 'orders':
            case 'pesanan':
            case 'history':
            case 'riwayat':
                return await this.cmdOrders(args);

            case 'balance':
            case 'saldo':
                return await this.cmdBalance();

            case 'profile':
            case 'profil':
                return await this.cmdProfile();

            case 'deposit':
            case 'topup':
            case 'isi':
                return await this.cmdDeposit(args);

            case 'channels':
            case 'saluran':
            case 'metode':
                return await this.cmdChannels();

            case 'cekdeposit':
            case 'deposit_status':
                return await this.cmdCheckDeposit(args);

            case 'riwayatdeposit':
            case 'deposit_history':
                return await this.cmdDepositHistory(args);

            case 'countries':
            case 'negara':
                return await this.cmdCountries();

            case 'services':
            case 'layanan':
                return await this.cmdServices(args);

            case 'products':
            case 'produk':
            case 'harga':
                return await this.cmdProducts(args);

            case 'webhook':
                return await this.cmdWebhook(args);

            case 'help':
            case 'menu':
            case 'bantuan':
            case 'start':
                return await this.cmdHelp();

            default:
                return this.bot.reply("❌ Perintah tidak dikenal. Ketik `.help` atau `.menu` untuk melihat panduan.");
        }
    }

    // ── Command: Buy / Sewa Nomor Virtual ─────────────────────────────────────
    // POST /orders/create → { country_id, platform_id, catalog_product_id?, max_price? }
    async cmdBuy(args) {
        if (args.length < 2) {
            return this.bot.reply(
                `📱 *CARA ORDER NOMOR OTP*\n\n` +
                `Format: \`.buy [negara_id] [layanan_id] [harga_maks] [jumlah]\`\n\n` +
                `📌 *Contoh Perintah*:\n` +
                `• \`.buy 6 1 3000\` → WhatsApp Indonesia max Rp 3.000\n` +
                `• \`.buy 6 2 2500\` → Telegram Indonesia max Rp 2.500\n` +
                `• \`.buy 1 1 5000\` → WhatsApp USA max Rp 5.000\n\n` +
                `🔍 *Pencarian ID & Layanan*:\n` +
                `• Cek daftar negara: \`.countries\`\n` +
                `• Cek daftar layanan: \`.services [negara_id]\`\n` +
                `• Cek produk & harga: \`.products [negara_id]\``
            );
        }

        const countryId = parseInt(args[0], 10);
        let platformId = parseInt(args[1], 10);
        const maxPrice = args[2] ? parseInt(args[2], 10) : null;
        const quantity = args[3] ? parseInt(args[3], 10) : 1;

        if (isNaN(countryId)) {
            return this.bot.reply("❌ ID negara harus berupa angka! Cek: `.countries`");
        }

        // Resolusi nama layanan jika bukan angka (misal user ketik: .buy 6 wa atau .buy 6 telegram)
        if (isNaN(platformId)) {
            const rawService = String(args[1]).toLowerCase();
            try {
                const srvRes = await this.api.getServices(countryId);
                const srvList = srvRes.data || [];
                const matched = srvList.find(s =>
                    (s.code && s.code.toLowerCase() === rawService) ||
                    (s.name && s.name.toLowerCase().includes(rawService))
                );
                if (matched) {
                    platformId = matched.id;
                } else {
                    return this.bot.reply(`❌ Layanan "${args[1]}" tidak ditemukan. Cek: \`.services ${countryId}\``);
                }
            } catch (e) {
                return this.bot.reply("❌ ID layanan harus berupa angka! Cek: `.services`");
            }
        }

        if (quantity < 1 || quantity > 5) {
            return this.bot.reply("❌ Jumlah order minimal 1 dan maksimal 5 secara bersamaan.");
        }

        try {
            // Cek batasan order aktif maksimal (Maks 5)
            const activeCheck = await this.api.getActiveOrders();
            const activeOrders = activeCheck.data?.orders || activeCheck.data || [];
            const currentActive = Array.isArray(activeOrders) ? activeOrders.length : 0;
            if (currentActive >= 5) {
                return this.bot.reply(
                    `⚠️ *Batas Order Aktif Tercapai!*\n\n` +
                    `Anda memiliki *${currentActive} order aktif*. Maksimal order bersamaan adalah 5.\n` +
                    `Selesaikan atau batalkan order sebelumnya dengan \`.active\` sebelum membuat order baru.`
                );
            }

            this.bot.reply("🔄 *Mencari stok nomor terbaik (Smart Line Health)...*");

            // Ambil daftar produk dengan kualitas terbaik via Smart Line Health
            const prodRes = await this.api.getProducts(countryId, platformId, 'quality');
            const products = (prodRes.data || []).filter(p => p.active !== false);

            if (!products.length) {
                return this.bot.reply(
                    `❌ *Nomor Tidak Tersedia*\n\n` +
                    `Tidak ada stok untuk Negara ID ${countryId} & Layanan ID ${platformId}.\n` +
                    `Cek ketersediaan di \`.products ${countryId}\`.`
                );
            }

            // Cari produk terbaik yang memenuhi batas harga
            let selectedProduct = null;
            let bestPrice = maxPrice || Infinity;

            for (const prod of products) {
                const stock = prod.available !== undefined ? prod.available : (prod.stock || 0);
                const price = Number(prod.price) || 0;
                if (stock > 0 && price <= bestPrice) {
                    bestPrice = price;
                    selectedProduct = prod;
                }
            }

            if (!selectedProduct) {
                const cheapest = products[0]?.price ? Number(products[0].price).toLocaleString('id-ID') : '-';
                return this.bot.reply(
                    `❌ *Harga Melebihi Batas Maksimum*\n\n` +
                    `Harga termurah saat ini: Rp ${cheapest}\n` +
                    `Batas harga Anda: Rp ${maxPrice?.toLocaleString('id-ID')}\n` +
                    `Silakan naikkan batas harga atau cek layanan lain.`
                );
            }

            this.bot.reply(`🔄 *Memproses pemesanan nomor (Rp ${selectedProduct.price?.toLocaleString('id-ID')})...*`);

            // Panggil API VTechOTP - menggunakan catalog_product_id sesuai OpenAPI spec
            const orderResult = await this.api.createOrder({
                country_id: countryId,
                platform_id: platformId,
                catalog_product_id: selectedProduct.id,
                max_price: maxPrice,
                quantity: quantity
            });

            if (!orderResult.status && !orderResult.success) {
                return this.bot.reply(`❌ Gagal membuat order: ${orderResult.error || orderResult.message || 'Unknown error'}`);
            }

            const rawOrder = orderResult.data?.orders ? orderResult.data.orders[0] : (orderResult.data?.order || orderResult.data);
            const displayId = rawOrder.order_id || rawOrder.id;
            const phoneNum = rawOrder.phone_number || rawOrder.phoneNumber || rawOrder.number || 'Menunggu nomor...';

            // Simpan order di database lokal bot
            this.orderManager.saveOrder({
                ...rawOrder,
                userId: this.userId,
                countryId,
                platformId,
                productId: selectedProduct.id,
                price: rawOrder.price || selectedProduct.price,
                phone_number: phoneNum
            });

            const message =
                `✅ *ORDER NOMOR BERHASIL*\n\n` +
                `📱 Nomor: \`+${phoneNum.replace(/^\+/, '')}\` _(Ketuk untuk salin)_\n` +
                `🆔 Order ID: \`${displayId}\`\n` +
                `📋 Layanan: *${rawOrder.platform_name || rawOrder.service || selectedProduct.service_name || 'N/A'}*\n` +
                `🌍 Negara: ${rawOrder.country_name || rawOrder.country || selectedProduct.country_name || 'N/A'}\n` +
                `📡 Operator: ${rawOrder.operator_name || rawOrder.operator || 'Auto Route'}\n` +
                `💰 Harga: Rp ${(rawOrder.price || selectedProduct.price)?.toLocaleString('id-ID')}\n` +
                `⏳ Kadaluarsa: ${rawOrder.expires_at ? new Date(rawOrder.expires_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '20 menit'} (${rawOrder.seconds_remaining || '~1200'}s)\n` +
                `📊 Status: *${rawOrder.status || 'active'}*\n\n` +
                `💡 *Menu Aksi Order*:\n` +
                `• Cek SMS OTP: \`.otp ${displayId}\`\n` +
                `• Kirim ulang SMS: \`.resend ${displayId}\`\n` +
                `• Batalkan Order: \`.cancel ${displayId}\` (Refund 100%)\n` +
                `• Selesaikan: \`.finish ${displayId}\``;

            return this.bot.reply(message);

        } catch (error) {
            return this.bot.reply(`❌ *Gagal membuat order*: ${error.message}`);
        }
    }

    // ── Command: Status / Cek OTP ─────────────────────────────────────────────
    // GET /orders/{id} → OrderData { sms_code, full_sms, status, ... }
    async cmdStatus(args) {
        if (!args.length) {
            // Jika tanpa argumen, tampilkan semua order aktif
            try {
                const activeRes = await this.api.getActiveOrders();
                const activeOrders = activeRes.data?.orders || activeRes.data || [];

                if (!Array.isArray(activeOrders) || activeOrders.length === 0) {
                    return this.bot.reply("📭 *Tidak ada order aktif saat ini.*\n\nGunakan `.buy` untuk memesan nomor OTP.");
                }

                let message = `📱 *DAFTAR ORDER AKTIF (${activeOrders.length}/5)*\n\n`;
                for (const order of activeOrders) {
                    const displayId = order.order_id || order.id;
                    const code = order.sms_code || order.otp_code;
                    message +=
                        `🆔 \`${displayId}\` - *${order.platform_name || order.service || 'OTP'}*\n` +
                        `📱 \`+${String(order.phone_number || 'N/A').replace(/^\+/, '')}\`\n` +
                        `💰 Rp ${(order.price || 0).toLocaleString('id-ID')} | Status: *${order.status}*\n` +
                        `${code ? `🔐 *OTP: \`${code}\`* ✅\n` : '⏳ Menunggu SMS masuk...\n'}\n`;
                }
                message += `💡 *Cek detail*: \`.otp [order_id]\``;
                return this.bot.reply(message);
            } catch (error) {
                return this.bot.reply(`❌ Gagal memuat order aktif: ${error.message}`);
            }
        }

        const orderId = args[0].replace('#', '').trim();

        try {
            this.bot.reply("🔄 *Mengecek status order & SMS ke server...*");

            const result = await this.api.getOrder(orderId);
            if (!result.status && !result.success) {
                return this.bot.reply(`❌ Order tidak ditemukan: ${orderId}`);
            }

            const data = result.data?.order || result.data;
            const displayId = data.order_id || data.id || orderId;
            const phoneNum = data.phone_number || data.phoneNumber || 'N/A';
            const smsCode = data.sms_code || data.otp_code;
            const fullSms = data.full_sms || data.otp_message;

            let message =
                `📱 *DETAIL PESANAN OTP*\n\n` +
                `🆔 Order ID: \`${displayId}\`\n` +
                `📱 Nomor: \`+${String(phoneNum).replace(/^\+/, '')}\` _(Ketuk untuk salin)_\n` +
                `📋 Layanan: ${data.platform_name || data.service || 'N/A'}\n` +
                `🌍 Negara: ${data.country_name || data.country || 'N/A'}\n` +
                `📡 Operator: ${data.operator_name || data.operator || 'N/A'}\n` +
                `💰 Harga: Rp ${(data.price || 0).toLocaleString('id-ID')}\n` +
                `📊 Status: *${data.status || 'N/A'}*\n` +
                `⏳ Kadaluarsa: ${data.expires_at ? new Date(data.expires_at).toLocaleString('id-ID') : 'N/A'}\n` +
                `⏱️ Sisa waktu: ${data.seconds_remaining !== undefined ? `${data.seconds_remaining}s` : 'N/A'}\n`;

            if (smsCode) {
                message +=
                    `\n🎉 *KODE OTP DITERIMA!* ✅\n` +
                    `🔑 *KODE:* \`${smsCode}\` 👈 _(Ketuk untuk salin)_\n`;
                if (fullSms) {
                    message += `💬 *Isi SMS:* _${fullSms}_\n`;
                }
                message += `\n⚡ Selesaikan order: \`.finish ${displayId}\``;
            } else if (data.status === 'active') {
                message +=
                    `\n⏳ *Sedang menunggu SMS OTP masuk dari provider...*\n\n` +
                    `💡 Cek ulang: \`.otp ${displayId}\`\n` +
                    `💡 Minta SMS ulang: \`.resend ${displayId}\`\n` +
                    `💡 Batalkan (Refund 100%): \`.cancel ${displayId}\``;
            }

            // Update cache lokal
            this.orderManager.updateOrder(orderId, data);

            return this.bot.reply(message);

        } catch (error) {
            return this.bot.reply(`❌ Gagal cek status: ${error.message}`);
        }
    }

    // ── Command: Cancel Order ─────────────────────────────────────────────────
    // POST /orders/{id}/cancel → 100% coin refund
    async cmdCancel(args) {
        if (!args[0]) {
            return this.bot.reply("❌ Format salah!\n\nGunakan: `.cancel [order_id]`\nContoh: `.cancel 12345678`");
        }

        const orderId = args[0].replace('#', '').trim();

        try {
            this.bot.reply("🔄 *Membatalkan pesanan & memproses refund saldo...*");

            const res = await this.api.cancelOrder(orderId);
            if (!res.status && !res.success) {
                return this.bot.reply(`❌ Gagal membatalkan order: ${res.error || res.message || 'Unknown error'}`);
            }

            const refund = res.data?.refund_amount || res.data?.price || 0;
            this.orderManager.updateOrderStatus(orderId, 'canceled');

            const message =
                `✅ *ORDER BERHASIL DIBATALKAN*\n\n` +
                `🆔 Order ID: \`${orderId}\`\n` +
                `💰 Saldo Dikembalikan: *Rp ${Number(refund).toLocaleString('id-ID')}*\n` +
                `📊 Status: *CANCELLED*\n\n` +
                `💡 Saldo telah dikreditkan kembali ke akun Anda. Cek: \`.balance\``;

            return this.bot.reply(message);

        } catch (error) {
            return this.bot.reply(`❌ Pembatalan gagal: ${error.message}`);
        }
    }

    // ── Command: Finish Order ─────────────────────────────────────────────────
    // POST /orders/{id}/finish → Mark as completed
    async cmdFinish(args) {
        if (!args[0]) {
            return this.bot.reply("❌ Format salah!\n\nGunakan: `.finish [order_id]`\nContoh: `.finish 12345678`");
        }

        const orderId = args[0].replace('#', '').trim();

        try {
            this.bot.reply("🔄 *Menyelesaikan pesanan...*");

            const res = await this.api.finishOrder(orderId);
            if (!res.status && !res.success) {
                return this.bot.reply(`❌ Gagal menyelesaikan order: ${res.error || res.message || 'Unknown error'}`);
            }

            this.orderManager.updateOrderStatus(orderId, 'completed');

            const message =
                `✅ *ORDER TELAH DISELESAIKAN*\n\n` +
                `🆔 Order ID: \`${orderId}\`\n` +
                `📊 Status: *COMPLETED*\n\n` +
                `Terima kasih telah menggunakan layanan VTechOTP!`;

            return this.bot.reply(message);
        } catch (error) {
            return this.bot.reply(`❌ Gagal menyelesaikan order: ${error.message}`);
        }
    }

    // ── Command: Resend SMS (Secondary SMS) ──────────────────────────────────
    // POST /orders/{id}/resend → Request additional SMS verification code
    async cmdResend(args) {
        if (!args[0]) {
            return this.bot.reply("❌ Format salah!\n\nGunakan: `.resend [order_id]`\nContoh: `.resend 12345678`");
        }

        const orderId = args[0].replace('#', '').trim();

        try {
            this.bot.reply("🔄 *Meminta pengiriman ulang SMS verifikasi...*");

            const res = await this.api.resendOrder(orderId);
            if (!res.status && !res.success) {
                return this.bot.reply(`❌ Gagal kirim ulang SMS: ${res.error || res.message || 'Provider tidak mendukung secondary SMS'}`);
            }

            return this.bot.reply(
                `✅ *Permintaan SMS Ulang Berhasil*\n\n` +
                `🆔 Order ID: \`${orderId}\`\n` +
                `📨 SMS verifikasi kedua sedang dikirim...\n\n` +
                `💡 Cek OTP masuk: \`.otp ${orderId}\``
            );
        } catch (error) {
            return this.bot.reply(`❌ Gagal kirim ulang: ${error.message}`);
        }
    }

    // ── Command: Active Orders ────────────────────────────────────────────────
    // GET /orders/active
    async cmdActive() {
        try {
            this.bot.reply("🔄 *Memuat daftar pesanan aktif...*");

            const res = await this.api.getActiveOrders();
            const activeOrders = res.data?.orders || res.data || [];

            if (!Array.isArray(activeOrders) || activeOrders.length === 0) {
                return this.bot.reply("📭 Anda tidak memiliki pesanan yang sedang aktif.");
            }

            let message = `📱 *DAFTAR PESANAN AKTIF (${activeOrders.length}/5)*\n\n`;
            for (const o of activeOrders) {
                const displayId = o.order_id || o.id;
                const code = o.sms_code || o.otp_code;
                message +=
                    `• ID: \`#${displayId}\` | Layanan: *${o.platform_name || o.service || 'Virtual OTP'}*\n` +
                    `  Nomor: \`+${String(o.phone_number || o.phone || '').replace(/^\+/, '')}\`\n` +
                    `  Operator: ${o.operator_name || 'Auto Route'}\n` +
                    `  OTP: ${code ? `\`${code}\` ✅` : '_Menunggu SMS..._'}\n` +
                    `  Aksi: \`.otp ${displayId}\` | \`.cancel ${displayId}\`\n\n`;
            }

            return this.bot.reply(message);
        } catch (error) {
            return this.bot.reply(`❌ Gagal memuat pesanan aktif: ${error.message}`);
        }
    }

    // ── Command: Order History ────────────────────────────────────────────────
    // GET /orders?page=1&limit=10&status=active|completed|canceled|expired
    async cmdOrders(args) {
        const page = args[0] && /^\d+$/.test(args[0]) ? parseInt(args[0], 10) : 1;
        const status = args[1] || (args[0] && !/^\d+$/.test(args[0]) ? args[0] : null);

        try {
            this.bot.reply("🔄 *Memuat riwayat pesanan...*");

            const res = await this.api.getAllOrders(page, 10, status);
            const orders = res.data?.orders || res.data || [];

            if (!Array.isArray(orders) || orders.length === 0) {
                return this.bot.reply("📭 *Riwayat pesanan kosong.*");
            }

            let message = `📋 *RIWAYAT PESANAN (Halaman ${page})*\n\n`;
            for (const o of orders) {
                const displayId = o.order_id || o.id;
                const statusIcon = {
                    'active': '🟢', 'received': '📩',
                    'completed': '✅', 'canceled': '❌', 'expired': '⏰'
                }[o.status] || '❓';
                const code = o.sms_code || o.otp_code;

                message +=
                    `${statusIcon} \`${displayId}\` - *${o.platform_name || o.service || 'OTP'}*\n` +
                    `   📱 \`+${String(o.phone_number || 'N/A').replace(/^\+/, '')}\` | 💰 Rp ${(o.price || 0).toLocaleString('id-ID')}\n` +
                    `   Status: *${o.status}*${code ? ` | OTP: \`${code}\`` : ''}\n\n`;
            }

            message += `💡 Halaman selanjutnya: \`.orders ${page + 1}\`\n`;
            message += `💡 Filter status: \`.orders 1 completed\` atau \`.orders 1 canceled\``;

            return this.bot.reply(message);
        } catch (error) {
            return this.bot.reply(`❌ Gagal memuat riwayat: ${error.message}`);
        }
    }

    // ── Command: Balance / Saldo ──────────────────────────────────────────────
    // GET /balance → BalanceData { balance, active_orders, max_active_orders, currency }
    async cmdBalance() {
        try {
            this.bot.reply("🔄 *Mengecek saldo akun VTechOTP...*");

            const res = await this.api.getBalance();
            if (res.status || res.success) {
                const d = res.data || {};
                const bal = Number(d.balance || 0);

                this.userManager.updateUser(this.userId, {
                    balance: bal,
                    activeOrders: d.active_orders
                });

                const message =
                    `💰 *INFORMASI SALDO AKUN*\n\n` +
                    `💵 Saldo: *Rp ${bal.toLocaleString('id-ID')}* (${bal.toLocaleString('id-ID')} Koin)\n` +
                    `📱 Order Aktif: ${d.active_orders || 0} / ${d.max_active_orders || 5} (Batas Maksimal)\n` +
                    `💱 Mata Uang: ${d.currency || 'IDR'}\n\n` +
                    `💳 *Top Up Saldo*: \`.deposit 10000\`\n` +
                    `⚡ 1 Koin = Rp 1 IDR (~$1 USD ≈ 16,000 Koin)`;

                return this.bot.reply(message);
            }

            const bal = Number(res.data?.balance !== undefined ? res.data.balance : res.data || 0);
            return this.bot.reply(
                `💰 *SALDO AKUN*\n\n` +
                `• Sisa Saldo: *Rp ${bal.toLocaleString('id-ID')}*\n` +
                `💡 Top up: \`.deposit [nominal]\``
            );
        } catch (error) {
            const user = this.userManager.getUser(this.userId);
            if (user) {
                return this.bot.reply(
                    `💰 *SALDO LOKAL*\n\n` +
                    `💵 Saldo: *Rp ${(user.balance || 0).toLocaleString('id-ID')}*\n` +
                    `⚠️ *Gagal sinkron server*: ${error.message}`
                );
            }
            return this.bot.reply(`❌ Gagal mengambil saldo: ${error.message}`);
        }
    }

    // ── Command: Profile / Profil Developer ───────────────────────────────────
    // GET /profile → Developer profile & API access
    async cmdProfile() {
        try {
            this.bot.reply("🔄 *Memuat profil developer...*");

            const res = await this.api.getProfile();
            const d = res.data || res;

            const message =
                `👤 *PROFIL DEVELOPER VTECHOTP*\n\n` +
                `📛 Nama: *${d.display_name || d.name || 'Developer'}*\n` +
                `📧 Email: ${d.email || '-'}\n` +
                `📱 Nomor: ${d.phone || '-'}\n` +
                `🔑 API Access: ${d.api_enabled !== false ? '✅ Aktif' : '❌ Nonaktif'}\n` +
                `🔗 Webhook URL: ${d.webhook_url || '_Belum dikonfigurasi_'}\n\n` +
                `💡 Kelola webhook: \`.webhook [url]\``;

            return this.bot.reply(message);
        } catch (error) {
            return this.bot.reply(`❌ Gagal memuat profil: ${error.message}`);
        }
    }

    // ── Command: Deposit / Topup ──────────────────────────────────────────────
    // POST /deposits/create → { channel_code, amount }
    async cmdDeposit(args) {
        if (args.length < 1) {
            try {
                const config = await this.api.getDepositConfig();
                const minDeposit = config.data?.min_deposit || 10000;
                const flatFee = config.data?.flat_fee || 100;

                return this.bot.reply(
                    `💳 *CARA TOP UP SALDO / DEPOSIT*\n\n` +
                    `Format: \`.deposit [nominal] [channel_code]\`\n\n` +
                    `📌 *Contoh Perintah*:\n` +
                    `• \`.deposit 10000\` → QRIS Instant (Min Rp ${minDeposit.toLocaleString('id-ID')})\n` +
                    `• \`.deposit 10000 1\` → BCA Virtual Account\n` +
                    `• \`.deposit 10000 2\` → BRI Virtual Account\n` +
                    `• \`.deposit 10000 18\` → Alfamart\n` +
                    `• \`.deposit 10000 19\` → Indomaret\n\n` +
                    `• Fee Admin: Flat Rp ${flatFee.toLocaleString('id-ID')}\n` +
                    `📋 Cek semua kode saluran: \`.channels\`\n` +
                    `🔍 Cek status tagihan: \`.cekdeposit [ref_id]\``
                );
            } catch (e) {
                return this.bot.reply(
                    `💳 *CARA DEPOSIT*\n\n` +
                    `\`.deposit [nominal] [kode_saluran]\` (min Rp 10.000)\n` +
                    `Contoh: \`.deposit 10000\``
                );
            }
        }

        const amount = parseInt(args[0], 10);
        const channelCode = args[1] || '11'; // Default: QRIS Realtime (11)

        if (isNaN(amount) || amount < 10000) {
            return this.bot.reply(
                `❌ *Nominal tidak valid!*\n\n` +
                `• Minimal deposit: *Rp 10.000*\n` +
                `• Biaya admin flat: Rp 100\n\n` +
                `Contoh: \`.deposit 10000\``
            );
        }

        try {
            this.bot.reply(`🔄 *Membuat invoice deposit Rp ${amount.toLocaleString('id-ID')}...*`);

            // OpenAPI: POST /deposits/create { channel_code, amount }
            const result = await this.api.createDeposit(amount, channelCode);
            if (!result.status && !result.success) {
                return this.bot.reply(`❌ Gagal membuat deposit: ${result.error || result.message || 'Unknown error'}`);
            }

            const data = result.data;
            const refId = data.internal_ref || data.deposit_id || data.id || data.reference;
            const fee = data.fee !== undefined ? data.fee : 100;
            const totalPayment = data.total_payment || data.total_amount || (amount + fee);

            // Simpan deposit secara lokal
            this.depositManager.saveDeposit({
                ...data,
                userId: this.userId,
                amount: amount,
                fee: fee,
                total_payment: totalPayment
            });

            let message =
                `💳 *TAGIHAN PEMBAYARAN DEPOSIT*\n\n` +
                `🆔 Kode Ref: \`${refId}\`\n` +
                `💰 Nominal: Rp ${amount.toLocaleString('id-ID')}\n` +
                `💲 Fee Admin: Rp ${fee.toLocaleString('id-ID')}\n` +
                `💵 *TOTAL BAYAR*: *Rp ${Number(totalPayment).toLocaleString('id-ID')}*\n` +
                `📋 Saluran: *${data.channel_name || (channelCode === '11' ? 'QRIS Realtime' : 'Virtual Account')}*\n` +
                `⏳ Berlaku Hingga: ${data.expires_at ? new Date(data.expires_at).toLocaleString('id-ID') : '30 Menit'}\n\n`;

            if (data.virtual_account) {
                message += `🏦 *Nomor Virtual Account*: \`${data.virtual_account}\`\n\n`;
            }
            if (data.payment_code) {
                message += `🏪 *Kode Pembayaran Kasir*: \`${data.payment_code}\`\n\n`;
            }

            const qrUrl = data.qr_image_url || data.qr_url || data.qrcode_url;
            if (qrUrl) {
                message += `📷 *Link QRIS*: ${qrUrl}\n\n`;
                if (typeof this.bot.sendPhoto === 'function') {
                    return await this.bot.sendPhoto(qrUrl, message);
                }
            }

            if (data.checkout_url || data.payment_url) {
                message += `🔗 *Link Pembayaran*: ${data.checkout_url || data.payment_url}\n\n`;
            }

            message +=
                `💡 Saldo otomatis masuk setelah pembayaran terverifikasi.\n` +
                `🔍 Cek status manual: \`.cekdeposit ${refId}\``;

            return this.bot.reply(message);

        } catch (error) {
            return this.bot.reply(`❌ Gagal membuat deposit: ${error.message}`);
        }
    }

    // ── Command: Check Deposit Status ─────────────────────────────────────────
    // GET /deposits/{id} → { status: pending|credited|expired }
    async cmdCheckDeposit(args) {
        if (!args[0]) {
            return this.bot.reply("❌ Masukkan ID Ref tagihan deposit!\n\nContoh: `.cekdeposit VTO1788110...`");
        }

        const depId = args[0].trim();

        try {
            this.bot.reply("🔄 *Mengecek status tagihan pembayaran...*");

            const res = await this.api.getDeposit(depId);
            if (!res.status && !res.success) {
                return this.bot.reply(`❌ Tagihan deposit tidak ditemukan: ${depId}`);
            }

            const data = res.data;
            const statusMap = {
                'pending': '⏳ MENUNGGU PEMBAYARAN',
                'credited': '✅ SUKSES (SALDO DITAMBAHKAN)',
                'paid': '✅ SUKSES DIBAYAR',
                'expired': '❌ KADALUARSA',
                'cancelled': '❌ DIBATALKAN'
            };

            const statusText = statusMap[data.status] || (data.status || 'UNKNOWN').toUpperCase();
            const message =
                `💳 *STATUS TAGIHAN DEPOSIT*\n\n` +
                `🆔 Ref: \`${data.internal_ref || data.id || depId}\`\n` +
                `💰 Nominal: Rp ${(data.amount || 0).toLocaleString('id-ID')}\n` +
                `💲 Fee Admin: Rp ${(data.fee || 0).toLocaleString('id-ID')}\n` +
                `💵 Total: Rp ${(data.total_payment || data.total_amount || 0).toLocaleString('id-ID')}\n` +
                `📋 Saluran: ${data.channel_name || 'QRIS'}\n` +
                `📊 Status: *${statusText}*\n` +
                `⏰ Dibuat: ${data.created_at ? new Date(data.created_at).toLocaleString('id-ID') : '-'}\n` +
                `${data.credited_at ? `🎉 Masuk Saldo: ${new Date(data.credited_at).toLocaleString('id-ID')}\n` : ''}`;

            return this.bot.reply(message);

        } catch (error) {
            return this.bot.reply(`❌ Gagal cek deposit: ${error.message}`);
        }
    }

    // ── Command: Deposit History ──────────────────────────────────────────────
    // GET /deposits?page=1&limit=10&status=
    async cmdDepositHistory(args) {
        const page = args[0] && /^\d+$/.test(args[0]) ? parseInt(args[0], 10) : 1;

        try {
            this.bot.reply("🔄 *Memuat riwayat deposit...*");

            const res = await this.api.getDepositHistory(page, 10);
            const deposits = res.data?.deposits || res.data || [];

            if (!Array.isArray(deposits) || deposits.length === 0) {
                return this.bot.reply("📭 *Riwayat deposit kosong.*");
            }

            let message = `💳 *RIWAYAT DEPOSIT (Halaman ${page})*\n\n`;
            for (const d of deposits) {
                const statusIcon = { 'credited': '✅', 'paid': '✅', 'pending': '⏳', 'expired': '❌' }[d.status] || '❓';
                message +=
                    `${statusIcon} \`${d.internal_ref || d.id}\`\n` +
                    `   💰 Rp ${(d.amount || 0).toLocaleString('id-ID')} | ${d.channel_name || 'QRIS'} | *${d.status}*\n\n`;
            }

            message += `💡 Halaman selanjutnya: \`.riwayatdeposit ${page + 1}\``;
            return this.bot.reply(message);
        } catch (error) {
            return this.bot.reply(`❌ Gagal memuat riwayat deposit: ${error.message}`);
        }
    }

    // ── Command: Saluran Pembayaran (Channels) ─────────────────────────────────
    // GET /deposits/channels → List payment gateways (QRIS, VA, Minimarket, Crypto)
    async cmdChannels() {
        try {
            this.bot.reply("🔄 *Mengambil status saluran pembayaran...*");

            const res = await this.api.getDepositChannels();
            if (!res.status && !res.success || !res.data) {
                return this.bot.reply("❌ Gagal memuat daftar saluran pembayaran.");
            }

            const channels = res.data.channels || res.data || [];
            if (!channels.length) {
                return this.bot.reply("❌ Saluran deposit belum dikonfigurasi.");
            }

            let message = `💳 *SALURAN PEMBAYARAN AKTIF*\n\n`;
            for (const ch of channels) {
                const statusBadge = (ch.status === 'ON' || ch.active) ? '🟢 ON' : '🔴 OFF';
                const feeText = typeof ch.fee === 'number' ? `Rp ${ch.fee.toLocaleString('id-ID')}` : `${ch.fee || 'Flat Rp 100'}`;
                message +=
                    `📌 *${ch.name}* [Kode: \`${ch.service_id || ch.channel_code || ch.id}\`]\n` +
                    `• Status: ${statusBadge}\n` +
                    `• Min: Rp ${(ch.minimum || ch.min_amount || 10000).toLocaleString('id-ID')} | Fee: ${feeText}\n\n`;
            }

            message +=
                `💡 *Cara Deposit Sesuai Saluran*:\n` +
                `• QRIS: \`.deposit 10000\` *(Default)*\n` +
                `• BCA VA: \`.deposit 10000 1\`\n` +
                `• BRI VA: \`.deposit 10000 2\`\n` +
                `• Alfamart: \`.deposit 10000 18\`\n` +
                `• Indomaret: \`.deposit 10000 19\``;

            return this.bot.reply(message);

        } catch (error) {
            return this.bot.reply(`❌ Gagal mengambil saluran: ${error.message}`);
        }
    }

    // ── Command: Countries / Daftar Negara ────────────────────────────────────
    // GET /catalog/countries → 200+ countries
    async cmdCountries() {
        try {
            this.bot.reply("🔄 *Memuat daftar negara dari server...*");

            const res = await this.api.getCountries();
            const countries = res.data || [];

            if (!countries.length) {
                return this.bot.reply("❌ Daftar negara kosong.");
            }

            let message = `🌍 *DAFTAR NEGARA POPULER (${countries.length})*\n\n`;
            for (const c of countries.slice(0, 25)) {
                const dial = c.dial_code || (c.phone_code ? `+${c.phone_code}` : '');
                message += `• ID: \`${c.id}\` - ${c.emoji || '🌐'} *${c.name}* (\`${c.code || ''}\`) ${dial}\n`;
            }

            message +=
                `\n💡 *Order*: \`.buy [negara_id] [layanan_id]\`\n` +
                `💡 *Cek Layanan*: \`.services [negara_id]\` (Contoh: \`.services 6\`)\n` +
                `💡 *Cek Produk*: \`.products [negara_id]\` (Contoh: \`.products 6\`)`;

            return this.bot.reply(message);
        } catch (error) {
            return this.bot.reply(`❌ Gagal memuat negara: ${error.message}`);
        }
    }

    // ── Command: Services / Daftar Layanan Aplikasi ───────────────────────────
    // GET /catalog/services?country_id= → List platforms
    async cmdServices(args) {
        try {
            const countryId = args[0] ? parseInt(args[0], 10) : 6; // Default: 6 (Indonesia)
            this.bot.reply(`🔄 *Memuat daftar layanan OTP (Negara ID: ${countryId})...*`);

            const res = await this.api.getServices(countryId);
            const services = res.data || [];

            if (services.length === 0) {
                return this.bot.reply("❌ Daftar layanan kosong.");
            }

            let message = `📋 *DAFTAR LAYANAN APLIKASI OTP (${services.length})*\n\n`;
            for (const s of services.slice(0, 30)) {
                message += `• ID: \`${s.id}\` - *${s.name}* (\`${s.code || ''}\`)\n`;
            }

            message +=
                `\n💡 *Order*: \`.buy ${countryId} [layanan_id]\`\n` +
                `💡 *Cek Harga*: \`.products ${countryId} [layanan_id]\``;

            return this.bot.reply(message);
        } catch (error) {
            return this.bot.reply(`❌ Gagal memuat layanan: ${error.message}`);
        }
    }

    // ── Command: Products / Daftar Harga Realtime ─────────────────────────────
    // GET /catalog/products?country_id=&platform_id=&sort=quality
    async cmdProducts(args) {
        const countryId = args[0] ? parseInt(args[0], 10) : 6; // Default: 6 (Indonesia)
        const platformId = args[1] ? parseInt(args[1], 10) : null;

        try {
            this.bot.reply(`🔄 *Memuat harga & stok realtime via Smart Line Health (Negara ID: ${countryId})...*`);

            const res = await this.api.getProducts(countryId, platformId, 'quality');
            const products = res.data || [];

            if (products.length === 0) {
                return this.bot.reply(`📭 *Tidak ada produk ditemukan untuk filter ini.*`);
            }

            let message = `📦 *DAFTAR HARGA & STOK PRODUK (Negara ID: ${countryId})*\n\n`;
            let count = 0;
            for (const p of products) {
                const stock = p.available !== undefined ? p.available : (p.stock || 0);
                if (stock <= 0) continue;

                const srvId = p.platform_id || p.service_id || p.id;
                message +=
                    `📱 *${p.name || p.service_name || 'Virtual Number'}* (ID Layanan: \`${srvId}\`)\n` +
                    `• Harga: *Rp ${Number(p.price || 0).toLocaleString('id-ID')}*\n` +
                    `• Stok: *${Number(stock).toLocaleString('id-ID')} nomor*\n` +
                    `• Beli: \`.buy ${countryId} ${srvId} ${p.price}\`\n\n`;

                count++;
                if (count >= 15) break;
            }

            message += `💡 Tampilkan produk negara lain: \`.products [negara_id]\``;
            return this.bot.reply(message);

        } catch (error) {
            return this.bot.reply(`❌ Gagal memuat produk: ${error.message}`);
        }
    }

    // ── Command: Webhook Management ──────────────────────────────────────────
    // GET /webhook | PATCH /webhook { url, secret } | POST /webhook/test
    async cmdWebhook(args) {
        try {
            if (!args.length) {
                this.bot.reply("🔄 *Memuat konfigurasi webhook...*");
                const res = await this.api.getWebhook();
                const d = res.data || res;

                return this.bot.reply(
                    `🔗 *KONFIGURASI WEBHOOK REALTIME*\n\n` +
                    `📌 URL Callback: ${d.url || d.webhook_url || '_Belum dikonfigurasi_'}\n` +
                    `🔒 Secret HMAC: ${d.secret ? '✅ Terpasang' : '❌ Belum diset'}\n` +
                    `📡 Status: ${d.active ? '🟢 Aktif' : '🔴 Nonaktif'}\n\n` +
                    `💡 Daftarkan URL: \`.webhook https://domain-anda.com/webhook\`\n` +
                    `💡 Tes kirim event: \`.webhook test\``
                );
            }

            if (args[0].toLowerCase() === 'test') {
                this.bot.reply("🔄 *Mengirim simulasi webhook order.otp_received...*");
                const res = await this.api.testWebhook();
                return this.bot.reply(
                    `✅ *Test Event Webhook Terkirim!*\n\n` +
                    `Server telah mendispatch event \`order.otp_received\` ke endpoint Anda.`
                );
            }

            const url = args[0];
            const secret = args[1] || CONFIG.WEBHOOK_SECRET;

            this.bot.reply("🔄 *Memperbarui webhook URL & secret...*");
            await this.api.updateWebhook(url, secret);

            return this.bot.reply(
                `✅ *Webhook Berhasil Diperbarui!*\n\n` +
                `📌 URL: \`${url}\`\n` +
                `🔒 Secret: ${secret ? '✅ Terpasang' : '❌'}\n\n` +
                `💡 Uji sekarang: \`.webhook test\``
            );
        } catch (error) {
            return this.bot.reply(`❌ Gagal mengelola webhook: ${error.message}`);
        }
    }

    // ── Command: Help / Menu Bantuan ──────────────────────────────────────────
    async cmdHelp() {
        const message =
            `🤖 *VTechOTP BOT - MENU BANTUAN & PANDUAN LENGKAP*\n\n` +
            `📱 *Pemesanan Nomor OTP*\n` +
            `• \`.buy [negara] [layanan] [maks_harga]\` → Beli nomor OTP baru\n` +
            `• \`.otp [order_id]\` → Cek SMS & kode OTP masuk\n` +
            `• \`.resend [order_id]\` → Kirim ulang kode SMS kedua\n` +
            `• \`.cancel [order_id]\` → Batalkan order (Refund 100% Saldo)\n` +
            `• \`.finish [order_id]\` → Tandai pesanan telah selesai\n\n` +
            `📊 *Informasi Akun & Katalog*\n` +
            `• \`.balance\` / \`.saldo\` → Cek sisa saldo & batas pesanan\n` +
            `• \`.profile\` → Lihat profil developer & token\n` +
            `• \`.active\` → Daftar seluruh pesanan aktif (Maks 5)\n` +
            `• \`.orders\` → Riwayat transaksi pesanan nomor\n` +
            `• \`.countries\` → Daftar ID 200+ negara (6 = Indonesia, dll)\n` +
            `• \`.services [negara_id]\` → Daftar ID aplikasi/layanan\n` +
            `• \`.products [negara_id]\` → Cek harga & stok realtime\n\n` +
            `💳 *Deposit Saldo (QRIS & Multi Channel)*\n` +
            `• \`.channels\` → Cek status live gateway (QRIS, VA, Minimarket, Crypto)\n` +
            `• \`.deposit [nominal]\` → Buat tagihan QRIS instan (Min Rp 10.000)\n` +
            `• \`.deposit [nominal] [kode_saluran]\` → Deposit via VA / Retail\n` +
            `• \`.cekdeposit [ref_id]\` → Cek status pembayaran deposit\n` +
            `• \`.riwayatdeposit\` → Riwayat tagihan deposit\n\n` +
            `🔗 *Webhook Real-Time*\n` +
            `• \`.webhook\` → Lihat status URL webhook\n` +
            `• \`.webhook [url]\` → Set callback URL baru\n` +
            `• \`.webhook test\` → Kirim tes event OTP\n\n` +
            `⚡ *1 Koin = Rp 1 IDR (~$1 USD ≈ 16,000 Koin)*\n` +
            `🌐 *Portal Resmi: https://vtechotp.web.id*`;

        return this.bot.reply(message);
    }
}

// ── 7. Webhook Signature Verification Helper ──────────────────────────────────
// Verifikasi HMAC-SHA256 signature dari header x-webhook-signature atau x-vtech-signature
function verifyWebhookSignature(req, secret = CONFIG.WEBHOOK_SECRET) {
    const signature = req.headers?.['x-webhook-signature'] || req.headers?.['x-vtech-signature'];
    if (!signature) return false;

    const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    const expected = crypto
        .createHmac('sha256', secret)
        .update(rawBody)
        .digest('hex');

    try {
        return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
    } catch (e) {
        return false;
    }
}

// ── 8. Webhook Event Handler ──────────────────────────────────────────────────
// Menangani event: order.otp_received, order.completed, order.expired, order.canceled, deposit.credited
function handleWebhookEvent(event, orderManager = new OrderManager(), depositManager = new DepositManager()) {
    const eventType = event.event || event.type;
    const data = event.data || event;

    switch (eventType) {
        case 'order.otp_received': {
            const orderId = data.order_id || data.id;
            orderManager.updateOrderStatus(orderId, 'received', {
                sms_code: data.sms_code,
                full_sms: data.full_sms,
                otp_code: data.sms_code,
                otp_message: data.full_sms
            });
            console.log(`[WEBHOOK] ✅ OTP received for Order #${orderId}: ${data.sms_code}`);
            return { handled: true, event: eventType, orderId, sms_code: data.sms_code, full_sms: data.full_sms };
        }

        case 'order.completed': {
            const orderId = data.order_id || data.id;
            orderManager.updateOrderStatus(orderId, 'completed');
            console.log(`[WEBHOOK] ✅ Order #${orderId} marked COMPLETED`);
            return { handled: true, event: eventType, orderId };
        }

        case 'order.expired': {
            const orderId = data.order_id || data.id;
            orderManager.updateOrderStatus(orderId, 'expired');
            console.log(`[WEBHOOK] ⏰ Order #${orderId} EXPIRED (Balance auto-refunded)`);
            return { handled: true, event: eventType, orderId };
        }

        case 'order.canceled': {
            const orderId = data.order_id || data.id;
            orderManager.updateOrderStatus(orderId, 'canceled');
            console.log(`[WEBHOOK] ❌ Order #${orderId} CANCELED (Refunded)`);
            return { handled: true, event: eventType, orderId };
        }

        case 'deposit.credited': {
            const depositId = data.internal_ref || data.deposit_id || data.id;
            depositManager.updateDepositStatus(depositId, 'credited', {
                credited_at: data.credited_at || new Date().toISOString()
            });
            console.log(`[WEBHOOK] 💰 Deposit #${depositId} CREDITED: Rp ${data.amount}`);
            return { handled: true, event: eventType, depositId };
        }

        default:
            console.log(`[WEBHOOK] Unhandled event: ${eventType}`);
            return { handled: false, event: eventType };
    }
}

// ── 9. Standalone Server & Terminal Interactive CLI ───────────────────────────
// Jika file ini dijalankan langsung via "node VTechOTP-Bot.js"
if (require.main === module) {
    console.log('='.repeat(70));
    console.log('🚀 VTechOTP Bot Integration Server (Developer API v1)');
    console.log(`📡 API Base URL: ${CONFIG.API_BASE_URL}`);
    console.log(`🔑 API Token:    ${CONFIG.API_TOKEN === 'YOUR_VTECHOTP_API_TOKEN' ? '⚠️ Belum diset (gunakan .env)' : CONFIG.API_TOKEN.substring(0, 10) + '...'}`);
    console.log('='.repeat(70));

    // Jalankan Express Webhook Server jika express terinstall
    if (express) {
        const app = express();
        app.use(express.json());

        // Health Check
        app.get('/', (req, res) => {
            res.json({
                status: 'online',
                service: 'VTechOTP Bot Integration Server',
                version: '1.0.0',
                api_base: CONFIG.API_BASE_URL,
                webhook_path: '/webhook'
            });
        });

        // Webhook Receiver
        app.post('/webhook', (req, res) => {
            if (CONFIG.WEBHOOK_SECRET !== 'YOUR_WEBHOOK_SECRET') {
                if (!verifyWebhookSignature(req)) {
                    console.warn('[WEBHOOK] ⚠️ Permintaan webhook ditolak: Invalid signature.');
                    return res.status(401).json({ status: false, error: 'INVALID_SIGNATURE' });
                }
            }
            const result = handleWebhookEvent(req.body);
            return res.json({ status: true, ...result });
        });

        app.listen(CONFIG.PORT, () => {
            console.log(`\n🔗 Webhook server aktif mendengarkan di: http://localhost:${CONFIG.PORT}/webhook`);
        }).on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                console.warn(`[Server] Port ${CONFIG.PORT} sedang digunakan, server webhook dilewati.`);
            } else {
                console.error('[Server Error]', err.message);
            }
        });
    }

    // Terminal Interactive CLI
    console.log('\n💬 Mode Interaktif Terminal Aktif.');
    console.log('💡 Ketik perintah langsung di terminal (contoh: .menu, .saldo, .negara, .harga, .buy 6 1)\n');

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: 'VTechOTP-Bot > '
    });

    rl.prompt();

    rl.on('line', async (line) => {
        const trimmed = line.trim();
        if (!trimmed) {
            rl.prompt();
            return;
        }

        if (trimmed.toLowerCase() === 'exit' || trimmed.toLowerCase() === 'quit') {
            console.log('Sampai jumpa!');
            process.exit(0);
        }

        const cleanLine = trimmed.startsWith('.') ? trimmed.substring(1) : trimmed;
        const parts = cleanLine.split(/\s+/);
        const command = parts[0];
        const args = parts.slice(1);

        const terminalContext = {
            userId: 'terminal_admin',
            userName: 'Admin',
            platform: 'terminal',
            command: command,
            args: args,
            reply: (msg) => {
                console.log('\n' + msg.replace(/\*/g, '').replace(/_/g, '').replace(/`/g, '') + '\n');
            },
            sendPhoto: (url, caption) => {
                console.log(`\n[PHOTO: ${url}]\n${caption.replace(/\*/g, '').replace(/_/g, '').replace(/`/g, '')}\n`);
            }
        };

        const botHandler = new OTPBot(terminalContext);
        try {
            await botHandler.handleCommand();
        } catch (err) {
            console.error('\n❌ Terjadi kesalahan:', err.message, '\n');
        }

        rl.prompt();
    });
}

// ── 10. Module Exports ────────────────────────────────────────────────────────
module.exports = {
    handleOTPCommand: async (botContext) => {
        const bot = new OTPBot(botContext);
        return await bot.handleCommand();
    },
    VTechOTPAPI,
    UserManager,
    OrderManager,
    DepositManager,
    OTPBot,
    verifyWebhookSignature,
    handleWebhookEvent,
    CONFIG
};
