import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import { comparePassword } from '@/lib/password';
import { signToken } from '@/lib/auth';
import { rateLimit } from '@/lib/rateLimit';

const loginSchema = z.object({
  email: z.string().email('Format email tidak valid.'),
  password: z.string().min(1, 'Password tidak boleh kosong.'),
});

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const limitRes = rateLimit(`login_${ip}`, 5, 60000); // Max 5 login requests per minute

    if (!limitRes.allowed) {
      return NextResponse.json(
        { error: `Batas percobaan login terlampaui. Silakan coba lagi dalam ${Math.ceil(limitRes.retryAfter / 1000)} detik.` },
        { 
          status: 429, 
          headers: { 'Retry-After': String(Math.ceil(limitRes.retryAfter / 1000)) } 
        }
      );
    }

    const body = await request.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, password } = result.data;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.isActive) {
      return NextResponse.json(
        { error: 'Kredensial tidak valid atau akun tidak aktif.' },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.passwordHash);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Kredensial tidak valid.' },
        { status: 401 }
      );
    }

    // Sign session token
    const token = await signToken({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });

    const response = NextResponse.json({
      message: 'Login berhasil.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        totalPoint: user.totalPoint,
      },
    });

    // Set cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 1 day
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Error during login:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server.' },
      { status: 500 }
    );
  }
}
