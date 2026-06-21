import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { logAdminAction } from '@/lib/audit';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get('token')?.value;
    const session = token ? await verifyToken(token) : null;

    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Akses ditolak. Hanya untuk Admin.' }, { status: 403 });
    }

    const { id: programId } = await params;
    const { title, description, scope, outOfScope, labUrl, rewardPoint, isActive } = await request.json();

    if (!title || !description || !scope || !outOfScope || !labUrl || rewardPoint === undefined) {
      return NextResponse.json({ error: 'Seluruh parameter wajib diisi.' }, { status: 400 });
    }

    const updatedProgram = await prisma.bugBountyProgram.update({
      where: { id: programId },
      data: {
        title,
        description,
        scope,
        outOfScope,
        labUrl,
        rewardPoint: parseInt(rewardPoint),
        isActive: !!isActive,
      },
    });

    await logAdminAction(
      session.id,
      'UPDATE_PROGRAM',
      'BugBountyProgram',
      programId,
      `Updated program "${title}" (Active: ${isActive}, Reward Points: ${rewardPoint})`
    );

    return NextResponse.json({ program: updatedProgram });
  } catch (error) {
    console.error('Error updating program:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get('token')?.value;
    const session = token ? await verifyToken(token) : null;

    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Akses ditolak. Hanya untuk Admin.' }, { status: 403 });
    }

    const { id: programId } = await params;

    const program = await prisma.bugBountyProgram.findUnique({
      where: { id: programId },
    });

    if (!program) {
      return NextResponse.json({ error: 'Program tidak ditemukan.' }, { status: 404 });
    }

    await prisma.bugBountyProgram.delete({
      where: { id: programId },
    });

    await logAdminAction(
      session.id,
      'DELETE_PROGRAM',
      'BugBountyProgram',
      programId,
      `Deleted program "${program.title}"`
    );

    return NextResponse.json({ message: 'Program berhasil dihapus.' });
  } catch (error) {
    console.error('Error deleting program:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}
