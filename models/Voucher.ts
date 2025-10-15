import mongoose, { Schema, Document } from 'mongoose';

export interface IVoucher extends Document {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  maxDiscount?: number;
  minPurchase?: number;
  maxUses?: number;
  usedCount: number;
  isActive: boolean;
  validFrom: Date;
  validUntil: Date;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const VoucherSchema: Schema = new Schema(
  {
    code: { 
      type: String, 
      required: true, 
      unique: true, 
      uppercase: true,
      trim: true,
      index: true 
    },
    discountType: { 
      type: String, 
      enum: ['percentage', 'fixed'],
      required: true 
    },
    discountValue: { 
      type: Number, 
      required: true,
      min: 0
    },
    maxDiscount: { 
      type: Number,
      min: 0
    },
    minPurchase: { 
      type: Number,
      default: 0,
      min: 0
    },
    maxUses: { 
      type: Number,
      min: 1
    },
    usedCount: { 
      type: Number, 
      default: 0,
      min: 0
    },
    isActive: { 
      type: Boolean, 
      default: true,
      index: true
    },
    validFrom: { 
      type: Date, 
      required: true 
    },
    validUntil: { 
      type: Date, 
      required: true 
    },
    description: { 
      type: String 
    },
  },
  {
    timestamps: true,
  }
);

VoucherSchema.index({ code: 1, isActive: 1 });
VoucherSchema.index({ validFrom: 1, validUntil: 1 });

export default mongoose.models.Voucher || mongoose.model<IVoucher>('Voucher', VoucherSchema);
