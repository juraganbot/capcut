interface QRCodeOptions {
  size?: number;
  margin?: number;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
}

function toCRC16(str: string): string {
  let crc = 0xffff;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
    }
  }
  return (crc & 0xffff).toString(16).toUpperCase().padStart(4, '0');
}

export function createDynamicQRIS(baseQRIS: string, amount: number): string {
  const updatedQris = baseQRIS.slice(0, -4).replace('010211', '010212');
  const amountStr = amount.toString();
  const tag54 = `54${amountStr.length.toString().padStart(2, '0')}${amountStr}`;
  const i58 = updatedQris.indexOf('5802ID');
  const payload = updatedQris.slice(0, i58) + tag54 + updatedQris.slice(i58);
  const qrString = payload + toCRC16(payload);
  return qrString;
}

export async function generateQRCode(
  qrString: string,
  options: QRCodeOptions = {}
): Promise<string> {
  const {
    size = 512,
    margin = 4,
    errorCorrectionLevel = 'M'
  } = options;

  try {
    const QRCode = (await import('qrcode')).default;

    const dataUrl = await QRCode.toDataURL(qrString, {
      width: size,
      margin: margin,
      errorCorrectionLevel: errorCorrectionLevel,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });

    return dataUrl;
  } catch (error) {
    console.error('QR Code generation error:', error);
    throw new Error('Failed to generate QR code');
  }
}

export function getStaticQRIS(): string {
  const qrCodeText = process.env.QRCODE_TEXT;
  
  if (!qrCodeText) {
    throw new Error('QRCODE_TEXT not configured in environment');
  }

  return qrCodeText;
}

export async function generateStaticQRCode(options?: QRCodeOptions): Promise<string> {
  const qrString = getStaticQRIS();
  return generateQRCode(qrString, options);
}

export async function generateDynamicQRCode(amount: number, options?: QRCodeOptions): Promise<string> {
  const baseQRIS = getStaticQRIS();
  const dynamicQRIS = createDynamicQRIS(baseQRIS, amount);
  return generateQRCode(dynamicQRIS, options);
}

export function validateQRISString(qrString: string): boolean {
  if (!qrString.startsWith('0002')) {
    return false;
  }

  if (qrString.length < 100) {
    return false;
  }

  return true;
}

export function parseQRISAmount(qrString: string): number | null {
  try {
    const amountMatch = qrString.match(/5404(\d{2})(\d+)/);
    if (amountMatch) {
      const amount = parseInt(amountMatch[2]);
      return amount;
    }
    return null;
  } catch (error) {
    console.error('Error parsing QRIS amount:', error);
    return null;
  }
}

export type { QRCodeOptions };
