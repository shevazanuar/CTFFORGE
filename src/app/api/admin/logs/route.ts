import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Tidak terotentikasi.' },
        { status: 401 }
      );
    }

    const session = await verifyToken(token);

    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Akses ditolak. Hanya untuk Admin.' },
        { status: 403 }
      );
    }

    const logs = await prisma.adminLog.findMany({
      include: {
        admin: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ logs });
  } catch (error) {
    console.error('Error fetching admin logs:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server.' },
      { status: 500 }
    );
  }
}
