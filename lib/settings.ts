import connectDB from './mongodb';
import Settings from '@/models/Settings';

export async function getSetting(key: string, defaultValue: string = ''): Promise<string> {
  try {
    await connectDB();
    const setting = await Settings.findOne({ key });
    return setting ? setting.value : defaultValue;
  } catch (error) {
    console.error(`Error getting setting ${key}:`, error);
    return defaultValue;
  }
}

export async function getBasePrice(): Promise<number> {
  const value = await getSetting('base_price', '20000');
  return parseInt(value) || 20000;
}

export async function getNormalPrice(): Promise<number> {
  const value = await getSetting('normal_price', '149000');
  return parseInt(value) || 149000;
}

export async function getDiscountAmount(): Promise<number> {
  const value = await getSetting('discount_amount', '129000');
  return parseInt(value) || 129000;
}
