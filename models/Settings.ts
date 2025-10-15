import mongoose, { Schema, Document } from 'mongoose';

export interface ISettings extends Document {
  key: string;
  value: string;
  description?: string;
  updatedAt: Date;
  createdAt: Date;
}

const SettingsSchema: Schema = new Schema(
  {
    key: { 
      type: String, 
      required: true, 
      unique: true,
      index: true 
    },
    value: { 
      type: String, 
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

export default mongoose.models.Settings || mongoose.model<ISettings>('Settings', SettingsSchema);
