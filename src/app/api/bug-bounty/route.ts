import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { logAdminAction } from '@/lib/audit';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    const session = token ? await verifyToken(token) : null;

    const programs = await prisma.bugBountyProgram.findMany({
      where: session?.role === 'ADMIN' ? {} : { isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ programs });
  } catch (error) {
    console.error('Error fetching programs:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    const session = token ? await verifyToken(token) : null;

    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Akses ditolak. Hanya untuk Admin.' },
        { status: 403 }
      );
    }

    const { title, description, scope, outOfScope, labUrl, rewardPoint } = await request.json();

    if (!title || !description || !scope || !outOfScope || !labUrl || !rewardPoint) {
      return NextResponse.json(
        { error: 'Semua kolom program wajib diisi.' },
        { status: 400 }
      );
    }

    const program = await prisma.bugBountyProgram.create({
      data: {
        title,
        description,
        scope,
        outOfScope,
        labUrl,
        rewardPoint: parseInt(rewardPoint),
        createdBy: session.id,
      },
    });

    await logAdminAction(
      session.id,
      'CREATE_PROGRAM',
      'BugBountyProgram',
      program.id,
      `Created bug bounty program "${title}" (Reward: ${rewardPoint} pts)`
    );

    return NextResponse.json({ program }, { status: 201 });
  } catch (error) {
    console.error('Error creating program:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server.' },
      { status: 500 }
    );
  }
}
