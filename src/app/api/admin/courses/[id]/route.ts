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

    const { id: courseId } = await params;
    const { title, description, level, isPublished } = await request.json();

    if (!title || !description || !level) {
      return NextResponse.json({ error: 'Judul, deskripsi, dan level wajib diisi.' }, { status: 400 });
    }

    const updatedCourse = await prisma.course.update({
      where: { id: courseId },
      data: {
        title,
        description,
        level,
        isPublished: !!isPublished,
      },
    });

    await logAdminAction(
      session.id,
      'UPDATE_COURSE',
      'Course',
      courseId,
      `Updated course "${title}" (Level: ${level}, Published: ${isPublished})`
    );

    return NextResponse.json({ course: updatedCourse });
  } catch (error) {
    console.error('Error updating course:', error);
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

    const { id: courseId } = await params;

    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return NextResponse.json({ error: 'Course tidak ditemukan.' }, { status: 404 });
    }

    await prisma.course.delete({
      where: { id: courseId },
    });

    await logAdminAction(
      session.id,
      'DELETE_COURSE',
      'Course',
      courseId,
      `Deleted course "${course.title}"`
    );

    return NextResponse.json({ message: 'Course berhasil dihapus.' });
  } catch (error) {
    console.error('Error deleting course:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}
