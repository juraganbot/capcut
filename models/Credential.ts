import mongoose, { Schema, Document } from 'mongoose';

export interface ICredential extends Document {
  email: string;
  password: string;
  accountType: string;
  status: 'available' | 'used' | 'expired' | 'invalid';
  usedBy?: string;
  usedAt?: Date;
  orderId?: string;
  expiryDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CredentialSchema: Schema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    accountType: { type: String, default: 'CapCut Pro' },
    status: { 
      type: String, 
      enum: ['available', 'used', 'expired', 'invalid'],
      default: 'available',
      index: true
    },
    usedBy: { type: String },
    usedAt: { type: Date },
    orderId: { type: String },
    expiryDate: { type: Date },
    notes: { type: String },
  },
  {
    timestamps: true,
  }
);

CredentialSchema.index({ status: 1, createdAt: 1 });

export default mongoose.models.Credential || mongoose.model<ICredential>('Credential', CredentialSchema);
