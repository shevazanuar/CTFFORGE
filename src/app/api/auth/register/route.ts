import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import { hashPassword } from '@/lib/password';
import { signToken } from '@/lib/auth';

const registerSchema = z.object({
  name: z.string().min(2, 'Nama minimal harus 2 karakter.').max(50),
  email: z.string().email('Format email tidak valid.'),
  password: z.string().min(6, 'Password minimal harus 6 karakter.'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, email, password } = result.data;

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email sudah terdaftar.' },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: 'USER', // Default role
        totalPoint: 100, // Give starting points
      },
    });

    // Sign session token
    const token = await signToken({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });

    // Create response
    const response = NextResponse.json(
      {
        message: 'Registrasi berhasil.',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          totalPoint: user.totalPoint,
        },
      },
      { status: 201 }
    );

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
    console.error('Error during registration:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server.' },
      { status: 500 }
    );
  }
}
