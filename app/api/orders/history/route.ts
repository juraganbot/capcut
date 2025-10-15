import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { email, phone } = await request.json();

    if (!email && !phone) {
      return NextResponse.json(
        { success: false, error: 'Email atau nomor WhatsApp harus diisi' },
        { status: 400 }
      );
    }

    // Build query
    const query: any = { $or: [] };
    if (email) {
      query.$or.push({ customerEmail: email });
    }
    if (phone) {
      query.$or.push({ customerPhone: phone });
    }

    // Find orders
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .limit(10)
      .select('orderId status baseAmount uniqueAmount voucherCode voucherDiscount finalAmount customerEmail customerPhone createdAt paidAt expiredAt');

    return NextResponse.json({
      success: true,
      orders,
      count: orders.length,
    });
  } catch (error) {
    console.error('Error fetching order history:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil riwayat pembelian' },
      { status: 500 }
    );
  }
}
