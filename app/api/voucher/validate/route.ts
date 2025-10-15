import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Voucher from '@/models/Voucher';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { code, amount } = await request.json();

    if (!code) {
      return NextResponse.json(
        { success: false, error: 'Kode voucher harus diisi' },
        { status: 400 }
      );
    }

    const voucher = await Voucher.findOne({ 
      code: code.toUpperCase().trim() 
    });

    if (!voucher) {
      return NextResponse.json(
        { success: false, error: 'Kode voucher tidak valid' },
        { status: 404 }
      );
    }

    // Check if voucher is active
    if (!voucher.isActive) {
      return NextResponse.json(
        { success: false, error: 'Voucher tidak aktif' },
        { status: 400 }
      );
    }

    // Check validity period
    const now = new Date();
    if (now < voucher.validFrom) {
      return NextResponse.json(
        { success: false, error: 'Voucher belum dapat digunakan' },
        { status: 400 }
      );
    }

    if (now > voucher.validUntil) {
      return NextResponse.json(
        { success: false, error: 'Voucher sudah kadaluarsa' },
        { status: 400 }
      );
    }

    // Check max uses
    if (voucher.maxUses && voucher.usedCount >= voucher.maxUses) {
      return NextResponse.json(
        { success: false, error: 'Voucher sudah mencapai batas penggunaan' },
        { status: 400 }
      );
    }

    // Check minimum purchase
    if (voucher.minPurchase && amount < voucher.minPurchase) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Minimal pembelian Rp ${voucher.minPurchase.toLocaleString('id-ID')}` 
        },
        { status: 400 }
      );
    }

    // Calculate discount
    let discount = 0;
    if (voucher.discountType === 'percentage') {
      discount = Math.floor((amount * voucher.discountValue) / 100);
      if (voucher.maxDiscount && discount > voucher.maxDiscount) {
        discount = voucher.maxDiscount;
      }
    } else {
      discount = voucher.discountValue;
    }

    // Ensure discount doesn't exceed amount
    if (discount > amount) {
      discount = amount;
    }

    const finalAmount = amount - discount;

    return NextResponse.json({
      success: true,
      voucher: {
        code: voucher.code,
        discountType: voucher.discountType,
        discountValue: voucher.discountValue,
        description: voucher.description,
      },
      discount,
      finalAmount,
      message: `Voucher berhasil! Hemat Rp ${discount.toLocaleString('id-ID')}`,
    });

  } catch (error) {
    console.error('Error validating voucher:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memvalidasi voucher' },
      { status: 500 }
    );
  }
}
