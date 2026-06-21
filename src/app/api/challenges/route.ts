import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { hashPassword } from '@/lib/password'; // Using standard bcrypt hash for flags too

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    const session = token ? await verifyToken(token) : null;

    const challenges = await prisma.challenge.findMany({
      include: {
        creator: {
          select: { name: true },
        },
        submissions: session ? {
          where: { userId: session.id },
          orderBy: { submittedAt: 'desc' },
          take: 1,
        } : false,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Strip sensitive fields (flagHash and solution) for standard users
    const sanitizedChallenges = challenges.map(ch => {
      const isSolved = ch.submissions && ch.submissions.length > 0 && ch.submissions[0].status === 'CORRECT';
      
      // Admin sees everything; normal user only sees solution if they have solved it
      const showSolution = session?.role === 'ADMIN' || isSolved;

      return {
        id: ch.id,
        title: ch.title,
        description: ch.description,
        category: ch.category,
        difficulty: ch.difficulty,
        point: ch.point,
        hint: ch.hint,
        relatedLessonId: ch.relatedLessonId,
        creator: ch.creator,
        solved: isSolved,
        solution: showSolution ? ch.solution : null,
      };
    });

    return NextResponse.json({ challenges: sanitizedChallenges });
  } catch (error) {
    console.error('Error fetching challenges:', error);
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

    const { title, description, category, difficulty, point, flag, hint, solution, relatedLessonId } = await request.json();

    if (!title || !description || !category || !difficulty || !point || !flag) {
      return NextResponse.json(
        { error: 'Judul, deskripsi, kategori, kesulitan, poin, dan flag wajib diisi.' },
        { status: 400 }
      );
    }

    // Hash the flag to store securely
    const flagHash = await hashPassword(flag.trim());

    const challenge = await prisma.challenge.create({
      data: {
        title,
        description,
        category,
        difficulty,
        point: parseInt(point),
        flagHash,
        hint,
        solution,
        relatedLessonId: relatedLessonId || null,
        createdBy: session.id,
      },
    });

    return NextResponse.json({ challenge }, { status: 201 });
  } catch (error) {
    console.error('Error creating challenge:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server.' },
      { status: 500 }
    );
  }
}
