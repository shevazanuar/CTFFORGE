import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { logAdminAction } from '@/lib/audit';

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

    const { id: lessonId } = await params;

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
    });

    if (!lesson) {
      return NextResponse.json({ error: 'Pelajaran tidak ditemukan.' }, { status: 404 });
    }

    await prisma.lesson.delete({
      where: { id: lessonId },
    });

    await logAdminAction(
      session.id,
      'DELETE_LESSON',
      'Lesson',
      lessonId,
      `Deleted lesson "${lesson.title}"`
    );

    return NextResponse.json({ message: 'Pelajaran berhasil dihapus.' });
  } catch (error) {
    console.error('Error deleting lesson:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}
