import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import Voucher from '@/models/Voucher';

export async function GET() {
  try {
    await connectDB();

    // Get all orders with vouchers (paid only)
    const ordersWithVouchers = await Order.find({
      voucherCode: { $exists: true, $ne: null },
      status: 'paid',
    }).select('voucherCode voucherDiscount customerEmail customerPhone paidAt');

    // Group by voucher code and count usage
    const voucherStats = ordersWithVouchers.reduce((acc: any, order) => {
      const code = order.voucherCode!;
      if (!acc[code]) {
        acc[code] = {
          code,
          usageCount: 0,
          totalDiscount: 0,
          customers: [],
        };
      }
      acc[code].usageCount++;
      acc[code].totalDiscount += order.voucherDiscount || 0;
      acc[code].customers.push({
        email: order.customerEmail,
        phone: order.customerPhone,
        discount: order.voucherDiscount,
        paidAt: order.paidAt,
      });
      return acc;
    }, {});

    // Convert to array and sort by usage
    const statsArray = Object.values(voucherStats).sort((a: any, b: any) => b.usageCount - a.usageCount);

    // Get voucher details
    const voucherCodes = statsArray.map((stat: any) => stat.code);
    const vouchers = await Voucher.find({ code: { $in: voucherCodes } });
    
    const voucherMap = vouchers.reduce((acc: any, v) => {
      acc[v.code] = v;
      return acc;
    }, {});

    // Merge stats with voucher details
    const enrichedStats = statsArray.map((stat: any) => ({
      ...stat,
      voucherDetails: voucherMap[stat.code] || null,
    }));

    // Overall statistics
    const totalVoucherUsage = ordersWithVouchers.length;
    const totalDiscountGiven = ordersWithVouchers.reduce((sum, order) => sum + (order.voucherDiscount || 0), 0);
    const uniqueVouchersUsed = Object.keys(voucherStats).length;

    return NextResponse.json({
      success: true,
      stats: {
        totalVoucherUsage,
        totalDiscountGiven,
        uniqueVouchersUsed,
        voucherBreakdown: enrichedStats,
      },
    });
  } catch (error) {
    console.error('Error fetching voucher stats:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil statistik voucher' },
      { status: 500 }
    );
  }
}
