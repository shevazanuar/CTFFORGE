import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    const session = token ? await verifyToken(token) : null;
    
    // If admin, show all courses. Otherwise, only show published ones.
    const courses = await prisma.course.findMany({
      where: session?.role === 'ADMIN' ? {} : { isPublished: true },
      include: {
        modules: {
          orderBy: { orderIndex: 'asc' },
          include: {
            lessons: {
              orderBy: { orderIndex: 'asc' },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    let completedLessonIds: string[] = [];
    if (session) {
      const progress = await prisma.courseProgress.findMany({
        where: {
          userId: session.id,
          isCompleted: true,
        },
        select: {
          lessonId: true,
        },
      });
      completedLessonIds = progress.map(p => p.lessonId);
    }

    return NextResponse.json({ courses, completedLessonIds });
  } catch (error) {
    console.error('Error fetching courses:', error);
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

    const { title, description, level, isPublished } = await request.json();

    if (!title || !description || !level) {
      return NextResponse.json(
        { error: 'Judul, deskripsi, dan level wajib diisi.' },
        { status: 400 }
      );
    }

    const course = await prisma.course.create({
      data: {
        title,
        description,
        level,
        isPublished: isPublished ?? false,
        createdBy: session.id,
      },
    });

    return NextResponse.json({ course }, { status: 201 });
  } catch (error) {
    console.error('Error creating course:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server.' },
      { status: 500 }
    );
  }
}
