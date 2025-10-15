import { NextRequest, NextResponse } from 'next/server';
import { generateDynamicQRCode } from '@/lib/qrcode';
import { generateUniqueAmount } from '@/lib/payment-utils';
import { getBasePrice } from '@/lib/settings';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import Voucher from '@/models/Voucher';
import { getSession, createSession, setSessionCookie, isSessionExpired } from '@/lib/session';
import { checkRateLimit, getClientIdentifier } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const clientId = getClientIdentifier(request);
    
    const rateLimit = checkRateLimit(clientId, {
      maxRequests: 3,
      windowMs: 60000, // 3 requests per minute
    });

    if (!rateLimit.allowed) {
      const waitTime = Math.ceil((rateLimit.resetAt - Date.now()) / 1000);
      return NextResponse.json(
        { 
          error: `Terlalu banyak request. Coba lagi dalam ${waitTime} detik.`,
          resetAt: rateLimit.resetAt,
        },
        { status: 429 }
      );
    }

    const session = await getSession();

    if (session && session.orderId && !isSessionExpired(session)) {
      const existingOrder = await Order.findOne({ orderId: session.orderId });
      
      if (existingOrder && existingOrder.status === 'pending') {
        console.log('=== EXISTING SESSION ===');
        console.log('Order ID:', existingOrder.orderId);
        console.log('Unique Amount:', existingOrder.uniqueAmount);
        console.log('=== END EXISTING SESSION ===');

        return NextResponse.json({
          success: true,
          orderId: existingOrder.orderId,
          qrCodeDataUrl: existingOrder.qrCodeDataUrl,
          baseAmount: existingOrder.baseAmount,
          uniqueAmount: existingOrder.uniqueAmount,
          expiredAt: existingOrder.expiredAt.toISOString(),
          fromSession: true,
        });
      }
    }

    const body = await request.json();
    const { email, phone, voucherCode } = body;

    const baseAmount = await getBasePrice();
    let voucherDiscount = 0;
    let appliedVoucherCode = null;

    // Validate and apply voucher if provided
    if (voucherCode) {
      const voucher = await Voucher.findOne({ 
        code: voucherCode.toUpperCase().trim(),
        isActive: true,
      });

      if (voucher) {
        const now = new Date();
        const isValid = now >= voucher.validFrom && now <= voucher.validUntil;
        const hasUsesLeft = !voucher.maxUses || voucher.usedCount < voucher.maxUses;
        const meetsMinPurchase = !voucher.minPurchase || baseAmount >= voucher.minPurchase;

        if (isValid && hasUsesLeft && meetsMinPurchase) {
          if (voucher.discountType === 'percentage') {
            voucherDiscount = Math.floor((baseAmount * voucher.discountValue) / 100);
            if (voucher.maxDiscount && voucherDiscount > voucher.maxDiscount) {
              voucherDiscount = voucher.maxDiscount;
            }
          } else {
            voucherDiscount = voucher.discountValue;
          }

          if (voucherDiscount > baseAmount) {
            voucherDiscount = baseAmount;
          }

          appliedVoucherCode = voucher.code;
          
          // Increment usage count
          voucher.usedCount += 1;
          await voucher.save();
        }
      }
    }

    const finalAmount = baseAmount - voucherDiscount;
    const uniqueAmount = generateUniqueAmount(finalAmount);

    const qrCodeDataUrl = await generateDynamicQRCode(uniqueAmount, {
      size: 512,
      margin: 4,
    });

    const orderId = `ORDER-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const expiredAt = new Date(Date.now() + 10 * 60 * 1000);

    const order = await Order.create({
      orderId,
      baseAmount,
      uniqueAmount,
      voucherCode: appliedVoucherCode || undefined,
      voucherDiscount,
      finalAmount,
      status: 'pending',
      customerEmail: email || undefined,
      customerPhone: phone || undefined,
      qrCodeDataUrl,
      expiredAt,
      locked: false,
    });

    console.log('=== ORDER CREATED ===');
    console.log('Order ID:', orderId);
    console.log('Base Amount:', baseAmount);
    console.log('Voucher Code:', appliedVoucherCode);
    console.log('Voucher Discount:', voucherDiscount);
    console.log('Final Amount:', finalAmount);
    console.log('Unique Amount:', uniqueAmount);
    console.log('Saved to MongoDB:', order._id);
    console.log('=== END ORDER CREATED ===');

    const forwarded = request.headers.get('x-forwarded-for');
    const ipAddress = forwarded ? forwarded.split(',')[0] : 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    const sessionToken = await createSession({
      orderId,
      uniqueAmount,
      baseAmount,
      ipAddress,
      userAgent,
    });

    await setSessionCookie(sessionToken);

    return NextResponse.json({
      success: true,
      orderId,
      qrCodeDataUrl,
      baseAmount,
      uniqueAmount,
      voucherCode: appliedVoucherCode,
      voucherDiscount,
      finalAmount,
      expiredAt: expiredAt.toISOString(),
    });

  } catch (error) {
    console.error('Payment creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
