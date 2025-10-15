import { NextResponse } from 'next/server';
import { getBasePrice, getNormalPrice, getDiscountAmount } from '@/lib/settings';

export async function GET() {
  try {
    const basePrice = await getBasePrice();
    const normalPrice = await getNormalPrice();
    const discountAmount = await getDiscountAmount();

    return NextResponse.json({
      success: true,
      prices: {
        basePrice,
        normalPrice,
        discountAmount,
        discountPercentage: Math.round((discountAmount / normalPrice) * 100),
      },
    });
  } catch (error) {
    console.error('Error fetching prices:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Gagal mengambil harga',
        prices: {
          basePrice: 20000,
          normalPrice: 149000,
          discountAmount: 129000,
          discountPercentage: 87,
        }
      },
      { status: 500 }
    );
  }
}
