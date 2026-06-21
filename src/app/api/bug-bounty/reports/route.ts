import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    const session = token ? await verifyToken(token) : null;

    if (!session) {
      return NextResponse.json(
        { error: 'Tidak terotentikasi.' },
        { status: 401 }
      );
    }

    const reports = await prisma.bugReport.findMany({
      where: session.role === 'ADMIN' ? {} : { userId: session.id },
      include: {
        user: {
          select: { name: true, email: true },
        },
        program: {
          select: { title: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ reports });
  } catch (error) {
    console.error('Error fetching reports:', error);
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

    if (!session) {
      return NextResponse.json(
        { error: 'Tidak terotentikasi.' },
        { status: 401 }
      );
    }

    const {
      programId,
      title,
      vulnerabilityType,
      severity,
      stepsToReproduce,
      impact,
      evidence,
      evidenceUrl,
    } = await request.json();

    if (!programId || !title || !vulnerabilityType || !severity || !stepsToReproduce || !impact || !evidence) {
      return NextResponse.json(
        { error: 'Mohon isi semua kolom laporan yang wajib.' },
        { status: 400 }
      );
    }

    // Verify program exists
    const program = await prisma.bugBountyProgram.findUnique({
      where: { id: programId },
    });

    if (!program) {
      return NextResponse.json(
        { error: 'Program Bug Bounty tidak ditemukan.' },
        { status: 404 }
      );
    }

    const report = await prisma.bugReport.create({
      data: {
        userId: session.id,
        programId,
        title,
        vulnerabilityType,
        severity,
        stepsToReproduce,
        impact,
        evidence,
        evidenceUrl: evidenceUrl || null,
        status: 'PENDING',
      },
    });

    return NextResponse.json({ report }, { status: 201 });
  } catch (error) {
    console.error('Error submitting report:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server.' },
      { status: 500 }
    );
  }
}
