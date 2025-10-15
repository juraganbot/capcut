export function generateUniqueAmount(baseAmount: number): number {
  const uniqueCode = Math.floor(Math.random() * 91) + 10; // 10-100
  return baseAmount + uniqueCode;
}

export function getBasePaymentAmount(): number {
  const amount = process.env.PAYMENT_AMOUNT;
  return amount ? parseInt(amount) : 20000;
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export interface PaymentSession {
  orderId: string;
  amount: number;
  uniqueAmount: number;
  createdAt: string;
  expiresAt: string;
}

export function storePaymentSession(data: PaymentSession): void {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('paymentSession', JSON.stringify(data));
  }
}

export function getPaymentSession(): PaymentSession | null {
  if (typeof window !== 'undefined') {
    const data = sessionStorage.getItem('paymentSession');
    return data ? JSON.parse(data) : null;
  }
  return null;
}

export function clearPaymentSession(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('paymentSession');
  }
}
