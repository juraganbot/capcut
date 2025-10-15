import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import Credential from '@/models/Credential';

export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    await connectDB();

    const { orderId } = params;

    const order = await Order.findOne({ orderId }).populate('credentialId');

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    if (order.status !== 'paid' || !order.credentialId) {
      return NextResponse.json({
        success: false,
        error: 'Credential not available yet',
      });
    }

    const credential = order.credentialId as any;

    return NextResponse.json({
      success: true,
      credential: {
        email: credential.email,
        password: credential.password,
      },
      order: {
        orderId: order.orderId,
        status: order.status,
        paidAt: order.paidAt,
      },
    });

  } catch (error) {
    console.error('Get order error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
