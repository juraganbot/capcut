const axios = require('axios');
const moment = require('moment-timezone');
const fs = require('fs').promises;
const path = require('path');
const qs = require('qs');
const qrGenerator = require('./qrcode');
require('dotenv').config();
const { HttpsProxyAgent } = require('https-proxy-agent');
const { HttpProxyAgent } = require('http-proxy-agent');

const PROXY_CONFIG = {
    host: 'gw.dataimpulse.com',
    port: 823,
    auth: '603a63846ac7e2f957a5__cr.id:8b4531dd03b1f4d7'
};

const proxyUrl = `http://${PROXY_CONFIG.auth}@${PROXY_CONFIG.host}:${PROXY_CONFIG.port}`;
const httpsAgent = new HttpsProxyAgent(proxyUrl);
const httpAgent = new HttpProxyAgent(proxyUrl);

const ordersPath = path.join(__dirname, 'database', 'orders.json');

class OrkutProvider {
    constructor() {
        this.initialized = false;
        this.retryCount = 3;
        this.retryDelay = 2000;
        this.timeout = 30000;
    }

    async init() {
        try {
            await fs.mkdir(path.join(__dirname, 'database'), { recursive: true });
            try {
                await fs.access(ordersPath);
            } catch {
                await fs.writeFile(ordersPath, '[]');
            }
            await fs.mkdir(path.join(__dirname, 'qrcodes'), { recursive: true });
            await fs.mkdir(path.join(__dirname, 'temp'), { recursive: true });

            this.initialized = true;
            console.log('[ORKUT] Provider initialized successfully');
        } catch (error) {
            console.error('[ORKUT] Initialization failed:', error);
            throw error;
        }
    }

    async makeRequest(url, data, options = {}) {
        const maxRetries = options.retries || this.retryCount;
        let lastError;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const config = {
                    timeout: this.timeout,
                    httpsAgent,
                    httpAgent,
                    proxy: false,
                    headers: {
                        'User-Agent': 'okhttp/4.12.0',
                        'Accept-Encoding': 'gzip',
                        'Connection': 'Keep-Alive',
                        ...options.headers
                    },
                    ...options.axiosConfig
                };

                let response;
                if (data) {
                    response = await axios.post(url, data, config);
                } else {
                    response = await axios.get(url, config);
                }

                return response;
            } catch (error) {
                lastError = error;
                console.warn(`[ORKUT] Request attempt ${attempt}/${maxRetries} failed:`, error.message);

                if (attempt < maxRetries) {
                    const delay = this.retryDelay * attempt;
                    console.log(`[ORKUT] Retrying in ${delay}ms...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                } else {
                    console.error(`[ORKUT] All ${maxRetries} attempts failed`);
                }
            }
        }

        throw lastError;
    }

    generateKodeTransaksi() {
        const prefix = 'TRX';
        const random = Math.random().toString(36).substr(2, 8).toUpperCase();
        const time = Date.now().toString().slice(-6);
        return `${prefix}${time}${random}`;
    }

    formatDate(date) {
        if (!date) return '';
        const [tgl, jam = '00:00'] = date.split(' ');
        const [d, m, y] = (tgl || '').split('/');
        return y && m && d ? `${y}-${m}-${d} ${jam}:00` : date;
    }

    async createQRIS(nominal, orderId, customerInfo) {
        return await qrGenerator.createQRISImage(nominal, orderId, customerInfo, process.env.QRCODE_TEXT);
    }

    async createOrder(amount, description, customerInfo) {
        if (!this.initialized) {
            throw new Error('Orkut provider not initialized');
        }

        try {
            const orderId = `QR-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
            const nominalStr = Math.floor(amount).toString();
            const qrPath = await this.createQRIS(nominalStr, orderId, customerInfo);

            const orders = JSON.parse(await fs.readFile(ordersPath, 'utf8'));
            const order = {
                orderId,
                userId: customerInfo.userId,
                amount,
                message: description,
                customerName: customerInfo.first_name + (customerInfo.last_name ? ` ${customerInfo.last_name}` : ''),
                customerEmail: customerInfo.email || '',
                status: 'PENDING',
                createdAt: new Date().toISOString(),
                processed: false,
                nominal: nominalStr,
                kodeTransaksi: this.generateKodeTransaksi()
            };
            orders.push(order);
            await fs.writeFile(ordersPath, JSON.stringify(orders, null, 2));

            const qrCodePath = qrPath;

            return {
                success: true,
                orderId: order.orderId,
                qrImage: qrCodePath,
                amount: amount,
                expiresAt: moment().add(30, 'minutes').toISOString()
            };


            // --- AKHIR BAGIAN YANG DIPERBAIKI ---

        } catch (error) {
            console.error('[ORKUT] Create order error:', error);
            throw error;
        }
    }

    async triggerAccountAndMenu() {
        const akun = {
            username: process.env.USERNAMEORKUT,
            auth_token: process.env.TOKEN,
            app_reg_id: 'dCkcjSj0RSmAIGe8RAjTpO:APA91bG0EMa_tJqp6eKj4gEPfLOOrAVADU3F6Oz4Mps51knjTFyEavU6Lp9qaZMaAs6UEov0HkYhYwq4wotqUi8ASww2MRLqS88Ebz-ypEF17A_JgK02q44'
        };

        const id = (akun.auth_token || '').split(':')[0] || '';
        const payload = qs.stringify({
            request_time: new Date().toISOString(),
            app_reg_id: akun.app_reg_id,
            phone_android_version: '9',
            app_version_code: '250811',
            phone_uuid: akun.app_reg_id.split(':')[0] || 'uuid',
            auth_username: akun.username,
            auth_token: akun.auth_token,
            app_version_name: '25.08.11',
            ui_mode: 'light',
            'requests[0]': 'account',
            'requests[1]': 'qris_menu',
            phone_model: 'Nokia G10'
        });

        const response = await this.makeRequest(
            `https://app.orderkuota.com/api/v2/qris/menu/${id}`,
            payload,
            {
                headers: {
                    'Host': 'app.orderkuota.com',
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                retries: 2
            }
        );

        return response.data;
    }

    async getMutasiQris({ username, authToken }) {
        const id = (authToken || '').split(':')[0] || '';
        const timestamp = Date.now().toString();
        const payload = {
            app_reg_id: 'dCkcjSj0RSmAIGe8RAjTpO:APA91bG0EMa_tJqp6eKj4gEPfLOOrAVADU3F6Oz4Mps51knjTFyEavU6Lp9qaZMaAs6UEov0HkYhYwq4wotqUi8ASww2MRLqS88Ebz-ypEF17A_JgK02q44',
            phone_uuid: 'dCkcjSj0RSmAIGe8RAjTpO',
            phone_model: 'KM6',
            'requests[qris_history][keterangan]': '',
            'requests[qris_history][jumlah]': '',
            request_time: timestamp,
            phone_android_version: '9',
            app_version_code: '250911',
            auth_username: username,
            'requests[qris_history][page]': '1',
            auth_token: authToken,
            app_version_name: '25.09.11',
            ui_mode: 'light',
            'requests[qris_history][dari_tanggal]': '',
            'requests[0]': 'account',
            'requests[qris_history][ke_tanggal]': ''
        };

        const headers = {
            signature: '2f2d096a8605ada7e7ec7bc482631de52af9089c1893469fa6040b76843a2f43df77994bd0ed58ef6a3f1fe4235f26d191095127613fcb87d9772ad77759e8ee',
            timestamp: timestamp,
            'content-type': 'application/x-www-form-urlencoded',
            'host': 'app.orderkuota.com'
        };

        const response = await this.makeRequest(
            `https://app.orderkuota.com/api/v2/qris/mutasi/${id}`,
            qs.stringify(payload),
            {
                headers,
                retries: 2
            }
        );

        return response.data;
    }

    async checkQRIS() {
        const akun = {
            username: process.env.USERNAMEORKUT,
            auth_token: process.env.TOKEN
        };
        return await this.getMutasiQris({ username: akun.username, authToken: akun.auth_token });
    }

    async checkOrder(orderId) {
        if (!this.initialized) {
            throw new Error('Orkut provider not initialized');
        }

        const time = moment().format('HH:mm:ss');
        try {
            const orders = JSON.parse(await fs.readFile(ordersPath, 'utf8'));
            const idx = orders.findIndex(o => o.orderId === orderId);

            if (idx === -1) {
                console.log(`[QR | ${time}] Order ID ${orderId} tidak ditemukan.`);
                return { success: false, data: null };
            }

            const orderInfo = orders[idx];
            const logPrefix = `[QR | ${time}] ${orderInfo.customerName} - ${orderInfo.message} (Rp ${orderInfo.amount.toLocaleString('id-ID')})`;

            if (orderInfo.processed) {
                return { success: true, data: orderInfo };
            }

            try {
                await this.triggerAccountAndMenu();
                const qrisData = await this.checkQRIS();

                if (!qrisData || !qrisData.qris_history || !Array.isArray(qrisData.qris_history.results)) {
                    console.log(`${logPrefix} -> GAGAL AMBIL MUTASI`);
                    return { success: false, data: orderInfo };
                }

                const parseOrderKuotaDate = s => moment(s, 'YYYY-MM-DD HH:mm:ss', true).isValid() ? moment(s, 'YYYY-MM-DD HH:mm:ss') : moment(s);
                const mtx = qrisData.qris_history.results.find(tx => {
                    const txAmount = parseInt((tx.kredit || '0').replace(/\./g, ''));
                    const orderAmountInt = parseInt(orderInfo.nominal);
                    const isAmountMatch = txAmount === orderAmountInt;
                    const isStatusMatch = tx.status === 'IN';
                    const txDate = parseOrderKuotaDate(this.formatDate(tx.tanggal));
                    const orderDate = moment(orderInfo.createdAt);
                    const isTimeMatch = txDate.isAfter(orderDate.subtract(5, 'minutes'));
                    return isAmountMatch && isStatusMatch && isTimeMatch;
                });

                if (mtx) {
                    orders[idx].status = 'PAID';
                    orders[idx].paidAt = new Date().toISOString();
                    orders[idx].processed = true;
                    orders[idx].transactionDetails = {
                        date: this.formatDate(mtx.tanggal),
                        amount: (mtx.kredit || '0').replace(/\./g, ''),
                        brandName: mtx.brand?.name || '',
                        issuerRef: String(mtx.id || ''),
                        keterangan: (mtx.keterangan || '').trim(),
                        balance: mtx.saldo_akhir ? mtx.saldo_akhir.replace(/\./g, '') : ''
                    };
                    await fs.writeFile(ordersPath, JSON.stringify(orders, null, 2));
                    console.log(`${logPrefix} -> TERKONFIRMASI`);
                    return { success: true, data: orders[idx], transaction: mtx };
                }

                console.log(`${logPrefix} -> PENDING`);
                return { success: false, data: orderInfo };
            } catch (proxyError) {
                console.warn(`${logPrefix} -> PROXY ERROR`);
                return { success: false, data: orderInfo, error: 'Proxy connection failed' };
            }
        } catch (error) {
            console.error(`[QR | ${time}] Error pada checkOrder (ID: ${orderId}):`, error.message);
            return { success: false, error: error.message };
        }
    }

    async cancelOrder(orderId) {
        if (!this.initialized) {
            throw new Error('Orkut provider not initialized');
        }

        try {
            const orders = JSON.parse(await fs.readFile(ordersPath, 'utf8'));
            const orderIndex = orders.findIndex(o => o.orderId === orderId);

            if (orderIndex !== -1 && !orders[orderIndex].processed) {
                const orderInfo = orders[orderIndex];
                orders[orderIndex].status = 'CANCELLED';
                orders[orderIndex].cancelledAt = new Date().toISOString();
                await fs.writeFile(ordersPath, JSON.stringify(orders, null, 2));

                const time = moment().format('HH:mm:ss');
                const logPrefix = `[QR | ${time}] ${orderInfo.customerName} - ${orderInfo.message} (Rp ${orderInfo.amount.toLocaleString('id-ID')})`;
                console.log(`${logPrefix} -> DIBATALKAN`);
            }

            return { success: true, message: 'Order cancelled successfully' };
        } catch (error) {
            console.error('[ORKUT] Cancel order error:', error);
            return { success: false, error: error.message };
        }
    }
}

module.exports = new OrkutProvider();
