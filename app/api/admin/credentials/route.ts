import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Credential from '@/models/Credential';

export async function GET() {
  try {
    await connectDB();

    const credentials = await Credential.find({}).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      credentials,
    });
  } catch (error) {
    console.error('Error fetching credentials:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data credentials' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    
    // Support bulk import
    if (body.bulkText) {
      const lines = body.bulkText
        .split('\n')
        .map((line: string) => line.trim())
        .filter((line: string) => line.length > 0);
      
      const results = {
        success: 0,
        failed: 0,
        errors: [] as string[],
      };
      
      for (const line of lines) {
        // Parse format: email | password
        const parts = line.split('|').map((p: string) => p.trim());
        
        if (parts.length !== 2) {
          results.failed++;
          results.errors.push(`Format salah: ${line}`);
          continue;
        }
        
        const [email, password] = parts;
        
        if (!email || !password) {
          results.failed++;
          results.errors.push(`Email atau password kosong: ${line}`);
          continue;
        }
        
        // Check if email already exists
        const existingCredential = await Credential.findOne({ email });
        if (existingCredential) {
          results.failed++;
          results.errors.push(`Email sudah ada: ${email}`);
          continue;
        }
        
        try {
          await Credential.create({
            email,
            password,
            status: 'available',
          });
          results.success++;
        } catch (err) {
          results.failed++;
          results.errors.push(`Gagal menambah ${email}: ${err}`);
        }
      }
      
      return NextResponse.json({
        success: true,
        message: `Berhasil: ${results.success}, Gagal: ${results.failed}`,
        results,
      });
    }
    
    // Single credential add
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email dan password harus diisi' },
        { status: 400 }
      );
    }

    const existingCredential = await Credential.findOne({ email });
    if (existingCredential) {
      return NextResponse.json(
        { success: false, error: 'Email sudah ada' },
        { status: 400 }
      );
    }

    const credential = await Credential.create({
      email,
      password,
      status: 'available',
    });

    return NextResponse.json({
      success: true,
      credential,
    });
  } catch (error) {
    console.error('Error creating credential:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menambah credential' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB();

    const { id, email, password, toggleStatus } = await request.json();

    const credential = await Credential.findById(id);
    if (!credential) {
      return NextResponse.json(
        { success: false, error: 'Credential tidak ditemukan' },
        { status: 404 }
      );
    }

    // Toggle status between available and used
    if (toggleStatus) {
      if (credential.status === 'available') {
        credential.status = 'used';
        credential.usedAt = new Date();
      } else if (credential.status === 'used') {
        credential.status = 'available';
        credential.usedBy = undefined;
        credential.usedAt = undefined;
        credential.orderId = undefined;
      }
      await credential.save();
      
      return NextResponse.json({
        success: true,
        credential,
        message: `Status diubah ke ${credential.status}`,
      });
    }

    // Regular update
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email dan password harus diisi' },
        { status: 400 }
      );
    }

    if (credential.status === 'used') {
      return NextResponse.json(
        { success: false, error: 'Tidak bisa edit credential yang sudah digunakan' },
        { status: 400 }
      );
    }

    credential.email = email;
    credential.password = password;
    await credential.save();

    return NextResponse.json({
      success: true,
      credential,
    });
  } catch (error) {
    console.error('Error updating credential:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal update credential' },
      { status: 500 }
    );
  }
}

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

    const credential = await Credential.findByIdAndDelete(id);
    if (!credential) {
      return NextResponse.json(
        { success: false, error: 'Credential tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Credential berhasil dihapus',
    });
  } catch (error) {
    console.error('Error deleting credential:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menghapus credential' },
      { status: 500 }
    );
  }
}
