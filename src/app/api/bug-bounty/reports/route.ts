import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import { verifyToken } from '@/lib/auth';

const bugReportSchema = z.object({
  programId: z.string().min(1, 'ID Program wajib diisi.'),
  title: z.string().min(5, 'Judul laporan minimal harus 5 karakter.').max(100),
  vulnerabilityType: z.string().min(1, 'Tipe kerentanan wajib dipilih.'),
  severity: z.string().min(1, 'Severity level wajib dipilih.'),
  stepsToReproduce: z.string().min(20, 'Langkah reproduksi minimal harus 20 karakter.'),
  impact: z.string().min(20, 'Dampak analisis minimal harus 20 karakter.'),
  evidence: z.string().min(5, 'Bukti kode exploit minimal harus 5 karakter.'),
  evidenceUrl: z.string().url('Tautan bukti gambar harus berupa URL valid.').optional().or(z.literal('')),
});

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

    const body = await request.json();
    const result = bugReportSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
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
    } = result.data;

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
