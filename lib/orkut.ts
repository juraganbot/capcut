interface OrkutConfig {
  username: string;
  token: string;
  proxy?: string;
}

interface CheckPaymentParams {
  orderId: string;
  amount: number;
}

interface OrkutPaymentStatus {
  success: boolean;
  status?: 'pending' | 'paid' | 'expired' | 'cancelled';
  orderId?: string;
  amount?: number;
  paidAt?: string;
  error?: string;
}

interface QRISTransaction {
  id: string;
  tanggal: string;
  kredit: string;
  status: string;
  keterangan?: string;
  brand?: { name: string };
  saldo_akhir?: string;
}

class OrkutClient {
  private username: string;
  private token: string;
  private proxy?: string;
  private baseUrl: string = 'https://app.orderkuota.com/api/v2';
  private appRegId: string = 'dCkcjSj0RSmAIGe8RAjTpO:APA91bG0EMa_tJqp6eKj4gEPfLOOrAVADU3F6Oz4Mps51knjTFyEavU6Lp9qaZMaAs6UEov0HkYhYwq4wotqUi8ASww2MRLqS88Ebz-ypEF17A_JgK02q44';

  constructor(config: OrkutConfig) {
    this.username = config.username;
    this.token = config.token;
    this.proxy = config.proxy;
  }

  private getProxyAgent() {
    if (!this.proxy) return undefined;
    
    try {
      const { HttpsProxyAgent } = require('https-proxy-agent');
      const agent = new HttpsProxyAgent(this.proxy);
      
      // Log proxy configuration (sanitized)
      const proxyHost = this.proxy.split('@')[1] || 'unknown';
      console.log('[ORKUT] Proxy configured:', proxyHost);
      
      return agent;
    } catch (error) {
      console.error('[ORKUT] Proxy configuration error:', error);
      return undefined;
    }
  }

  private getId(): string {
    return this.token.split(':')[0] || '';
  }

  async triggerAccountAndMenu(): Promise<any> {
    const id = this.getId();
    const params = new URLSearchParams({
      request_time: new Date().toISOString(),
      app_reg_id: this.appRegId,
      phone_android_version: '9',
      app_version_code: '250811',
      phone_uuid: this.appRegId.split(':')[0] || 'uuid',
      auth_username: this.username,
      auth_token: this.token,
      app_version_name: '25.08.11',
      ui_mode: 'light',
      'requests[0]': 'account',
      'requests[1]': 'qris_menu',
      phone_model: 'Nokia G10'
    });

    const fetchOptions: any = {
      method: 'POST',
      headers: {
        'Host': 'app.orderkuota.com',
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'okhttp/4.12.0',
      },
      body: params.toString(),
    };

    const proxyAgent = this.getProxyAgent();
    if (proxyAgent) {
      fetchOptions.agent = proxyAgent;
      console.log('[ORKUT] Using proxy for triggerAccountAndMenu');
    } else {
      console.log('[ORKUT] No proxy configured, using direct connection');
    }

    try {
      const response = await fetch(`${this.baseUrl}/qris/menu/${id}`, fetchOptions);
      console.log('[ORKUT] triggerAccountAndMenu response status:', response.status);
      
      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error('[ORKUT] triggerAccountAndMenu error:', error.message);
      throw error;
    }
  }

  async getMutasiQris(): Promise<any> {
    console.log('[ORKUT] Using 3rd party API for mutations');
    
    try {
      const response = await fetch('https://bot.waroengkubusiness.workers.dev/', {
        method: 'GET',
        headers: {
          'User-Agent': 'CapCut-Pro/1.0',
        },
      });
      
      const data = await response.json();
      
      // Debug logging
      console.log('[ORKUT] 3rd party API response status:', response.status);
      console.log('[ORKUT] 3rd party API response:', JSON.stringify(data, null, 2));

      return data;
    } catch (error: any) {
      console.error('[ORKUT] 3rd party API error:', error.message);
      throw error;
    }
  }

  async checkPaymentStatus(params: CheckPaymentParams): Promise<OrkutPaymentStatus> {
    try {
      console.log('[ORKUT] Getting QRIS mutations from 3rd party API...');
      const qrisData = await this.getMutasiQris();

      if (!qrisData || !qrisData.qris_history || !Array.isArray(qrisData.qris_history.results)) {
        console.log('[ORKUT] No mutation data available');
        return {
          success: false,
          error: 'No mutation data available',
        };
      }

      const transactions: QRISTransaction[] = qrisData.qris_history.results;
      console.log(`[ORKUT] Found ${transactions.length} transactions`);

      const matchedTx = transactions.find((tx: QRISTransaction) => {
        const txAmount = parseInt((tx.kredit || '0').replace(/\./g, ''));
        const orderAmount = params.amount;
        const isAmountMatch = txAmount === orderAmount;
        const isStatusMatch = tx.status === 'IN';

        console.log(`[ORKUT] Checking tx: amount=${txAmount}, orderAmount=${orderAmount}, match=${isAmountMatch}, status=${tx.status}`);

        return isAmountMatch && isStatusMatch;
      });

      if (matchedTx) {
        console.log('[ORKUT] Payment matched!', matchedTx);
        return {
          success: true,
          status: 'paid',
          orderId: params.orderId,
          amount: params.amount,
          paidAt: new Date().toISOString(),
        };
      }

      console.log('[ORKUT] No matching payment found');
      return {
        success: true,
        status: 'pending',
        orderId: params.orderId,
        amount: params.amount,
      };

    } catch (error) {
      console.error('[ORKUT] Check payment error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

let orkutClient: OrkutClient | null = null;

export function getOrkutClient(): OrkutClient {
  if (!orkutClient) {
    const username = process.env.USERNAMEORKUT;
    const token = process.env.TOKEN;
    const proxy = process.env.PROXY_URL;

    if (!username || !token) {
      throw new Error('Orkut credentials not configured');
    }

    const config: OrkutConfig = { username, token };
    if (proxy) {
      config.proxy = proxy;
      console.log('[ORKUT] Proxy configured:', proxy.split('@')[1] || 'hidden');
    }

    orkutClient = new OrkutClient(config);
  }

  return orkutClient;
}

export type { CheckPaymentParams, OrkutPaymentStatus };
