import mongoose, { Schema, Document } from 'mongoose';

export interface IOrder extends Document {
  orderId: string;
  userId?: string;
  baseAmount: number;
  uniqueAmount: number;
  voucherCode?: string;
  voucherDiscount?: number;
  finalAmount: number;
  status: 'pending' | 'paid' | 'expired' | 'cancelled';
  customerEmail?: string;
  customerPhone?: string;
  customerName?: string;
  qrCodeDataUrl?: string;
  credentialId?: string;
  transactionId?: string;
  paidAt?: Date;
  expiredAt: Date;
  createdAt: Date;
  updatedAt: Date;
  locked: boolean;
  lockedAt?: Date;
  lockedBy?: string;
}

const OrderSchema: Schema = new Schema(
  {
    orderId: { type: String, required: true, unique: true, index: true },
    userId: { type: String },
    baseAmount: { type: Number, required: true },
    uniqueAmount: { type: Number, required: true, index: true },
    voucherCode: { type: String },
    voucherDiscount: { type: Number, default: 0 },
    finalAmount: { type: Number, required: true },
    status: { 
      type: String, 
      enum: ['pending', 'paid', 'expired', 'cancelled'],
      default: 'pending',
      index: true
    },
    customerEmail: { type: String },
    customerPhone: { type: String },
    customerName: { type: String },
    qrCodeDataUrl: { type: String },
    credentialId: { type: Schema.Types.ObjectId, ref: 'Credential' },
    transactionId: { type: String },
    paidAt: { type: Date },
    expiredAt: { type: Date, required: true, index: true },
    locked: { type: Boolean, default: false, index: true },
    lockedAt: { type: Date },
    lockedBy: { type: String },
  },
  {
    timestamps: true,
  }
);

OrderSchema.index({ uniqueAmount: 1, status: 1 });
OrderSchema.index({ createdAt: 1, status: 1 });

export default mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
