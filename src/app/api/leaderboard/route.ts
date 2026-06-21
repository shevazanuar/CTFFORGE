import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Get top users ranked by totalPoint
    const users = await prisma.user.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        role: true,
        totalPoint: true,
        createdAt: true,
        badges: {
          include: {
            badge: true,
          },
        },
      },
      orderBy: {
        totalPoint: 'desc',
      },
    });

    return NextResponse.json({ leaderboard: users });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server.' },
      { status: 500 }
    );
  }
}
