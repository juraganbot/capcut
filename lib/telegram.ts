const BOT_TOKEN = process.env.BOT_TOKEN;
const NOTIFICATION_GROUP_ID = process.env.NOTIFICATION_GROUP_ID;

interface TelegramMessage {
  text: string;
  parse_mode?: 'HTML' | 'Markdown';
  disable_web_page_preview?: boolean;
}

export async function sendTelegramNotification(message: string, parseMode: 'HTML' | 'Markdown' = 'HTML') {
  if (!BOT_TOKEN || !NOTIFICATION_GROUP_ID) {
    console.warn('⚠️ Telegram credentials not configured');
    return { success: false, error: 'Credentials not configured' };
  }

  try {
    const payload: TelegramMessage = {
      text: message,
      parse_mode: parseMode,
      disable_web_page_preview: true,
    };

    const response = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?chat_id=${NOTIFICATION_GROUP_ID}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();

    if (!data.ok) {
      console.error('❌ Telegram API error:', data);
      return { success: false, error: data.description };
    }

    console.log('✅ Telegram notification sent');
    return { success: true, data };
  } catch (error) {
    console.error('❌ Telegram send error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export function formatOrderNotification(order: any, type: 'new' | 'paid' | 'expired' | 'error') {
  const emoji = {
    new: '🆕',
    paid: '✅',
    expired: '⏰',
    error: '❌'
  };

  const status = {
    new: 'ORDER BARU',
    paid: 'PEMBAYARAN BERHASIL',
    expired: 'ORDER EXPIRED',
    error: 'ERROR'
  };

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://your-domain.com';
  const finalAmount = order.finalAmount || order.uniqueAmount || order.amount || 0;
  const baseAmount = order.baseAmount || 0;
  const voucherDiscount = order.voucherDiscount || 0;
  const formattedFinal = new Intl.NumberFormat('id-ID').format(finalAmount);
  const formattedBase = new Intl.NumberFormat('id-ID').format(baseAmount);
  const formattedDiscount = new Intl.NumberFormat('id-ID').format(voucherDiscount);

  let message = `${emoji[type]} <b>${status[type]}</b>\n`;
  message += `${'═'.repeat(35)}\n\n`;
  
  // Order Info
  message += `📋 <b>ORDER DETAILS</b>\n`;
  message += `├ Order ID: <code>${order.orderId || 'N/A'}</code>\n`;
  message += `├ Status: <b>${type.toUpperCase()}</b>\n`;
  
  if (order.customerEmail) {
    message += `├ Email: ${order.customerEmail}\n`;
  }
  
  if (order.customerPhone) {
    message += `└ WhatsApp: ${order.customerPhone}\n`;
  } else {
    message += `└ No contact info\n`;
  }

  // Payment Info
  message += `\n💰 <b>PAYMENT INFO</b>\n`;
  message += `├ Harga: Rp ${formattedBase}\n`;
  
  if (voucherDiscount > 0 && order.voucherCode) {
    message += `├ Voucher: <code>${order.voucherCode}</code>\n`;
    message += `├ Diskon: -Rp ${formattedDiscount}\n`;
  }
  
  message += `└ <b>Total: Rp ${formattedFinal}</b>\n`;

  // Credential Info (for paid orders)
  if (type === 'paid' && order.credential) {
    message += `\n🔐 <b>CREDENTIAL ASSIGNED</b>\n`;
    message += `├ Email: <code>${order.credential.email}</code>\n`;
    message += `├ Password: <code>${order.credential.password}</code>\n`;
    message += `└ URL: <a href="${baseUrl}/success?orderId=${order.orderId}">Lihat Detail</a>\n`;
    
    message += `\n🌐 <b>LOGIN CAPCUT PRO</b>\n`;
    message += `├ Web: <a href="https://www.capcut.com">capcut.com</a>\n`;
    message += `├ Android: <a href="https://play.google.com/store/apps/details?id=com.lemon.lvoverseas">Google Play</a>\n`;
    message += `└ iOS: <a href="https://apps.apple.com/app/capcut-video-editor/id1500855883">App Store</a>\n`;
  }

  // Error Info
  if (order.error) {
    message += `\n⚠️ <b>ERROR</b>\n`;
    message += `└ ${order.error}\n`;
  }

  // Timestamp
  const timestamp = new Date().toLocaleString('id-ID', { 
    timeZone: 'Asia/Jakarta',
    day: '2-digit',
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
  
  message += `\n🕐 ${timestamp} WIB`;

  return message;
}

export async function notifyNewOrder(order: any) {
  const message = formatOrderNotification(order, 'new');
  return sendTelegramNotification(message);
}

export async function notifyPaymentSuccess(order: any, credential: any) {
  const message = formatOrderNotification({ ...order, credential }, 'paid');
  return sendTelegramNotification(message);
}

export async function notifyOrderExpired(order: any) {
  const message = formatOrderNotification(order, 'expired');
  return sendTelegramNotification(message);
}

export async function notifyError(order: any, error: string) {
  const message = formatOrderNotification({ ...order, error }, 'error');
  return sendTelegramNotification(message);
}
