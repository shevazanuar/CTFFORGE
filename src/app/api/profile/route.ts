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

    if (!session) {
      return NextResponse.json(
        { error: 'Token tidak valid.' },
        { status: 401 }
      );
    }

    const userId = session.id;

    // Get fresh user data from db
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        totalPoint: true,
        isActive: true,
        createdAt: true,
        badges: {
          include: {
            badge: true,
          },
        },
      },
    });

    if (!user || !user.isActive) {
      return NextResponse.json(
        { error: 'User tidak aktif atau tidak ditemukan.' },
        { status: 404 }
      );
    }

    // Calculate user rank
    const rank = await prisma.user.count({
      where: {
        totalPoint: {
          gt: user.totalPoint,
        },
      },
    }) + 1;

    // Get solve history (only correct submissions)
    const solveHistory = await prisma.challengeSubmission.findMany({
      where: {
        userId,
        status: 'CORRECT',
      },
      include: {
        challenge: {
          select: {
            id: true,
            title: true,
            category: true,
            difficulty: true,
            point: true,
          },
        },
      },
      orderBy: {
        submittedAt: 'desc',
      },
    });

    // Get bug reports history
    const bugReports = await prisma.bugReport.findMany({
      where: {
        userId,
      },
      include: {
        program: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Get point transactions
    const pointTransactions = await prisma.pointTransaction.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      user,
      rank,
      solveHistory,
      bugReports,
      pointTransactions,
    });
  } catch (error) {
    console.error('Error fetching profile data:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server.' },
      { status: 500 }
    );
  }
}
