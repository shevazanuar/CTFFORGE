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

    const { courseId, title, orderIndex } = await request.json();

    if (!courseId || !title) {
      return NextResponse.json({ error: 'Course ID dan judul modul wajib diisi.' }, { status: 400 });
    }

    const newModule = await prisma.module.create({
      data: {
        courseId,
        title,
        orderIndex: orderIndex !== undefined ? parseInt(orderIndex) : 0,
      },
    });

    await logAdminAction(
      session.id,
      'CREATE_MODULE',
      'Module',
      newModule.id,
      `Created module "${title}" for course ID ${courseId}`
    );

    return NextResponse.json({ module: newModule }, { status: 201 });
  } catch (error) {
    console.error('Error creating module:', error);
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
    
    // Case 1: Reordering multiple modules
    if (body.reorder && Array.isArray(body.reorder)) {
      const updates = body.reorder.map((item: { id: string; orderIndex: number }) =>
        prisma.module.update({
          where: { id: item.id },
          data: { orderIndex: item.orderIndex },
        })
      );
      
      await prisma.$transaction(updates);
      
      await logAdminAction(
        session.id,
        'UPDATE_MODULE',
        'Module',
        'MULTI',
        `Reordered modules`
      );
      
      return NextResponse.json({ message: 'Modul berhasil diurutkan kembali.' });
    }

    // Case 2: Standard single module edit
    const { id, title, orderIndex } = body;
    if (!id || !title) {
      return NextResponse.json({ error: 'ID dan judul modul wajib diisi.' }, { status: 400 });
    }

    const updatedModule = await prisma.module.update({
      where: { id },
      data: {
        title,
        orderIndex: orderIndex !== undefined ? parseInt(orderIndex) : undefined,
      },
    });

    await logAdminAction(
      session.id,
      'UPDATE_MODULE',
      'Module',
      id,
      `Updated module to "${title}"`
    );

    return NextResponse.json({ module: updatedModule });
  } catch (error) {
    console.error('Error updating modules:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}
