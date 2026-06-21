import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { logAdminAction } from '@/lib/audit';
import { hashPassword } from '@/lib/password';

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

    const { id: challengeId } = await params;
    const { title, description, category, difficulty, point, flag, hint, solution, relatedLessonId } = await request.json();

    if (!title || !description || !category || !difficulty || !point) {
      return NextResponse.json({ error: 'Judul, deskripsi, kategori, kesulitan, dan poin wajib diisi.' }, { status: 400 });
    }

    const updateData: any = {
      title,
      description,
      category,
      difficulty,
      point: parseInt(point),
      hint: hint || null,
      solution: solution || null,
      relatedLessonId: relatedLessonId || null,
    };

    if (flag && flag.trim() !== '') {
      updateData.flagHash = await hashPassword(flag.trim());
    }

    const updatedChallenge = await prisma.challenge.update({
      where: { id: challengeId },
      data: updateData,
    });

    await logAdminAction(
      session.id,
      'UPDATE_CHALLENGE',
      'Challenge',
      challengeId,
      `Updated challenge "${title}" (Category: ${category}, Difficulty: ${difficulty}, Points: ${point})`
    );

    return NextResponse.json({ challenge: updatedChallenge });
  } catch (error) {
    console.error('Error updating challenge:', error);
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

    const { id: challengeId } = await params;

    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeId },
    });

    if (!challenge) {
      return NextResponse.json({ error: 'Tantangan tidak ditemukan.' }, { status: 404 });
    }

    await prisma.challenge.delete({
      where: { id: challengeId },
    });

    await logAdminAction(
      session.id,
      'DELETE_CHALLENGE',
      'Challenge',
      challengeId,
      `Deleted challenge "${challenge.title}"`
    );

    return NextResponse.json({ message: 'Tantangan berhasil dihapus.' });
  } catch (error) {
    console.error('Error deleting challenge:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}
