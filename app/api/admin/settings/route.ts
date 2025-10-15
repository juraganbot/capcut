import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Settings from '@/models/Settings';

// GET - Fetch settings
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (key) {
      const setting = await Settings.findOne({ key });
      return NextResponse.json({
        success: true,
        setting,
      });
    }

    const settings = await Settings.find({});
    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data settings' },
      { status: 500 }
    );
  }
}

// POST - Create or update setting
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { key, value, description } = await request.json();

    if (!key || value === undefined) {
      return NextResponse.json(
        { success: false, error: 'Key dan value harus diisi' },
        { status: 400 }
      );
    }

    // Upsert: update if exists, create if not
    const setting = await Settings.findOneAndUpdate(
      { key },
      { value, description },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      success: true,
      setting,
    });
  } catch (error) {
    console.error('Error saving setting:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menyimpan setting' },
      { status: 500 }
    );
  }
}
