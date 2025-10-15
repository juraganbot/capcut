import { NextRequest, NextResponse } from 'next/server';
import { getOrkutClient } from '@/lib/orkut';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import Credential from '@/models/Credential';
import { notifyPaymentSuccess, notifyError } from '@/lib/telegram';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { orderId, amount } = body;

    console.log('=== PAYMENT CHECK START ===');
    console.log('Order ID:', orderId);
    console.log('Amount:', amount);

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    const orderData = await Order.findOne({ orderId });
    console.log('Order Data from MongoDB:', orderData ? 'Found' : 'Not found');

    try {
      const orkut = getOrkutClient();
      console.log('Calling Orkut API...');
      
      const statusResult = await orkut.checkPaymentStatus({ orderId, amount: orderData?.uniqueAmount || amount || 0 });
      
      console.log('=== ORKUT API RESPONSE ===');
      console.log('Success:', statusResult.success);
      console.log('Status:', statusResult.status);
      console.log('Order ID:', statusResult.orderId);
      console.log('Amount:', statusResult.amount);
      console.log('Paid At:', statusResult.paidAt);
      console.log('Error:', statusResult.error);
      console.log('=== END ORKUT RESPONSE ===');

      if (statusResult.success && statusResult.status === 'paid') {
        if (orderData && orderData.status !== 'paid') {
          if (orderData.locked) {
            console.log('⚠️ Order is locked, skipping...');
            return NextResponse.json({
              success: true,
              status: 'pending',
              orderId,
              amount: orderData.uniqueAmount,
              paidAt: null,
            });
          }

          orderData.locked = true;
          orderData.lockedAt = new Date();
          orderData.lockedBy = 'payment-check';
          await orderData.save();

          const credential = await Credential.findOne({ status: 'available' }).sort({ createdAt: 1 });

          if (!credential) {
            console.error('❌ No credentials available');
            await notifyError(orderData, 'No credentials available');
            
            orderData.locked = false;
            await orderData.save();

            return NextResponse.json({
              success: false,
              error: 'No credentials available',
            });
          }

          credential.status = 'used';
          credential.usedBy = orderData.customerEmail || orderData.customerPhone || 'unknown';
          credential.usedAt = new Date();
          credential.orderId = orderId;
          await credential.save();

          orderData.status = 'paid';
          orderData.paidAt = new Date();
          orderData.credentialId = credential._id;
          orderData.locked = false;
          await orderData.save();

          console.log('✅ Payment processed successfully');
          
          await notifyPaymentSuccess(orderData, credential);

          return NextResponse.json({
            success: true,
            status: 'paid',
            orderId: orderData.orderId,
            amount: orderData.uniqueAmount,
            paidAt: orderData.paidAt.toISOString(),
          });
        }

        if (orderData && orderData.status === 'paid') {
          return NextResponse.json({
            success: true,
            status: 'paid',
            orderId: orderData.orderId,
            amount: orderData.uniqueAmount,
            paidAt: orderData.paidAt?.toISOString(),
          });
        }
      }

      if (orderData) {
        return NextResponse.json({
          success: true,
          status: orderData.status,
          orderId: orderData.orderId,
          amount: orderData.uniqueAmount,
          paidAt: orderData.paidAt?.toISOString() || null,
        });
      }

      return NextResponse.json({
        success: true,
        status: 'pending',
        orderId,
        amount: amount || 20000,
        paidAt: null,
      });

    } catch (orkutError) {
      console.error('=== ORKUT API ERROR ===');
      console.error('Error:', orkutError);
      console.error('=== END ORKUT ERROR ===');

      if (orderData) {
        return NextResponse.json({
          success: true,
          status: orderData.status,
          orderId: orderData.orderId,
          amount: orderData.uniqueAmount,
          paidAt: orderData.paidAt?.toISOString() || null,
        });
      }

      return NextResponse.json({
        success: true,
        status: 'pending',
        orderId,
        amount: amount || 20000,
        paidAt: null,
      });
    }

  } catch (error) {
    console.error('=== PAYMENT CHECK ERROR ===');
    console.error('Error:', error);
    console.error('=== END ERROR ===');
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
