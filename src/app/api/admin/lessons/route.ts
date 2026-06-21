import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { logAdminAction } from '@/lib/audit';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    const session = token ? await verifyToken(token) : null;

    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Akses ditolak. Hanya untuk Admin.' }, { status: 403 });
    }

    const { moduleId, title, content, videoUrl, orderIndex } = await request.json();

    if (!moduleId || !title || !content) {
      return NextResponse.json({ error: 'Module ID, judul, dan konten pelajaran wajib diisi.' }, { status: 400 });
    }

    const newLesson = await prisma.lesson.create({
      data: {
        moduleId,
        title,
        content,
        videoUrl: videoUrl || null,
        orderIndex: orderIndex !== undefined ? parseInt(orderIndex) : 0,
      },
    });

    await logAdminAction(
      session.id,
      'CREATE_LESSON',
      'Lesson',
      newLesson.id,
      `Created lesson "${title}" for module ID ${moduleId}`
    );

    return NextResponse.json({ lesson: newLesson }, { status: 201 });
  } catch (error) {
    console.error('Error creating lesson:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    const session = token ? await verifyToken(token) : null;

    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Akses ditolak. Hanya untuk Admin.' }, { status: 403 });
    }

    const body = await request.json();
    
    // Case 1: Reordering multiple lessons
    if (body.reorder && Array.isArray(body.reorder)) {
      const updates = body.reorder.map((item: { id: string; orderIndex: number }) =>
        prisma.lesson.update({
          where: { id: item.id },
          data: { orderIndex: item.orderIndex },
        })
      );
      
      await prisma.$transaction(updates);
      
      await logAdminAction(
        session.id,
        'UPDATE_LESSON',
        'Lesson',
        'MULTI',
        `Reordered lessons`
      );
      
      return NextResponse.json({ message: 'Pelajaran berhasil diurutkan kembali.' });
    }

    // Case 2: Standard single lesson edit
    const { id, title, content, videoUrl, orderIndex } = body;
    if (!id || !title || !content) {
      return NextResponse.json({ error: 'ID, judul, dan konten pelajaran wajib diisi.' }, { status: 400 });
    }

    const updatedLesson = await prisma.lesson.update({
      where: { id },
      data: {
        title,
        content,
        videoUrl: videoUrl || null,
        orderIndex: orderIndex !== undefined ? parseInt(orderIndex) : undefined,
      },
    });

    await logAdminAction(
      session.id,
      'UPDATE_LESSON',
      'Lesson',
      id,
      `Updated lesson to "${title}"`
    );

    return NextResponse.json({ lesson: updatedLesson });
  } catch (error) {
    console.error('Error updating lessons:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}
