import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Voucher from '@/models/Voucher';

// GET - Fetch all vouchers
export async function GET() {
  try {
    await connectDB();

    const vouchers = await Voucher.find({}).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      vouchers,
    });
  } catch (error) {
    console.error('Error fetching vouchers:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data vouchers' },
      { status: 500 }
    );
  }
}

// POST - Create new voucher
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { 
      code, 
      discountType, 
      discountValue, 
      maxDiscount,
      minPurchase,
      maxUses,
      validFrom, 
      validUntil,
      description 
    } = body;

    if (!code || !discountType || !discountValue || !validFrom || !validUntil) {
      return NextResponse.json(
        { success: false, error: 'Data voucher tidak lengkap' },
        { status: 400 }
      );
    }

    // Validate discount value
    if (discountType === 'percentage' && (discountValue < 0 || discountValue > 100)) {
      return NextResponse.json(
        { success: false, error: 'Persentase diskon harus antara 0-100' },
        { status: 400 }
      );
    }

    if (discountValue < 0) {
      return NextResponse.json(
        { success: false, error: 'Nilai diskon tidak valid' },
        { status: 400 }
      );
    }

    // Check if code already exists
    const existingVoucher = await Voucher.findOne({ 
      code: code.toUpperCase().trim() 
    });
    
    if (existingVoucher) {
      return NextResponse.json(
        { success: false, error: 'Kode voucher sudah ada' },
        { status: 400 }
      );
    }

    const voucher = await Voucher.create({
      code: code.toUpperCase().trim(),
      discountType,
      discountValue,
      maxDiscount: maxDiscount || undefined,
      minPurchase: minPurchase || 0,
      maxUses: maxUses || undefined,
      usedCount: 0,
      isActive: true,
      validFrom: new Date(validFrom),
      validUntil: new Date(validUntil),
      description: description || '',
    });

    return NextResponse.json({
      success: true,
      voucher,
    });
  } catch (error) {
    console.error('Error creating voucher:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menambah voucher' },
      { status: 500 }
    );
  }
}

// PUT - Update voucher
export async function PUT(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { 
      id, 
      code, 
      discountType, 
      discountValue, 
      maxDiscount,
      minPurchase,
      maxUses,
      isActive,
      validFrom, 
      validUntil,
      description 
    } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID voucher harus diisi' },
        { status: 400 }
      );
    }

    const voucher = await Voucher.findById(id);
    if (!voucher) {
      return NextResponse.json(
        { success: false, error: 'Voucher tidak ditemukan' },
        { status: 404 }
      );
    }

    // Validate discount value if provided
    if (discountType === 'percentage' && discountValue && (discountValue < 0 || discountValue > 100)) {
      return NextResponse.json(
        { success: false, error: 'Persentase diskon harus antara 0-100' },
        { status: 400 }
      );
    }

    // Update fields
    if (code) voucher.code = code.toUpperCase().trim();
    if (discountType) voucher.discountType = discountType;
    if (discountValue !== undefined) voucher.discountValue = discountValue;
    if (maxDiscount !== undefined) voucher.maxDiscount = maxDiscount;
    if (minPurchase !== undefined) voucher.minPurchase = minPurchase;
    if (maxUses !== undefined) voucher.maxUses = maxUses;
    if (isActive !== undefined) voucher.isActive = isActive;
    if (validFrom) voucher.validFrom = new Date(validFrom);
    if (validUntil) voucher.validUntil = new Date(validUntil);
    if (description !== undefined) voucher.description = description;

    await voucher.save();

    return NextResponse.json({
      success: true,
      voucher,
    });
  } catch (error) {
    console.error('Error updating voucher:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal update voucher' },
      { status: 500 }
    );
  }
}

// DELETE - Delete voucher
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();

    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID harus diisi' },
        { status: 400 }
      );
    }

    const voucher = await Voucher.findByIdAndDelete(id);
    if (!voucher) {
      return NextResponse.json(
        { success: false, error: 'Voucher tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Voucher berhasil dihapus',
    });
  } catch (error) {
    console.error('Error deleting voucher:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menghapus voucher' },
      { status: 500 }
    );
  }
}
