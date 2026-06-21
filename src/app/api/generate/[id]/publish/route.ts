import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get('token')?.value;
    const session = token ? await verifyToken(token) : null;

    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Akses ditolak. Hanya untuk Admin.' },
        { status: 403 }
      );
    }

    const { id: draftId } = await params;
    const { status } = await request.json(); // "APPROVED" or "REJECTED"

    if (!status || (status !== 'APPROVED' && status !== 'REJECTED')) {
      return NextResponse.json(
        { error: 'Status review tidak valid (harus APPROVED atau REJECTED).' },
        { status: 400 }
      );
    }

    // Fetch draft
    const draft = await prisma.generatedChallengeDraft.findUnique({
      where: { id: draftId },
    });

    if (!draft) {
      return NextResponse.json(
        { error: 'Draft tidak ditemukan.' },
        { status: 404 }
      );
    }

    if (draft.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Draft sudah di-review sebelumnya.' },
        { status: 400 }
      );
    }

    if (status === 'APPROVED') {
      // 1. Create the active Challenge
      const challenge = await prisma.challenge.create({
        data: {
          title: draft.generatedTitle,
          description: draft.generatedDescription,
          category: draft.category,
          difficulty: draft.difficulty,
          point: draft.generatedPoint,
          flagHash: draft.generatedFlagHash,
          hint: draft.generatedHint,
          solution: draft.generatedSolution,
          createdBy: draft.generatedBy, // Credit the user who generated it
        },
      });

      // 2. Update the Draft status and associate the published challenge ID
      const updatedDraft = await prisma.generatedChallengeDraft.update({
        where: { id: draftId },
        data: {
          status: 'APPROVED',
          reviewedBy: session.id,
          publishedChallengeId: challenge.id,
        },
      });

      return NextResponse.json({
        message: 'Draft disetujui dan berhasil dipublikasikan!',
        draft: updatedDraft,
        challenge,
      });
    } else {
      // Reject the draft
      const updatedDraft = await prisma.generatedChallengeDraft.update({
        where: { id: draftId },
        data: {
          status: 'REJECTED',
          reviewedBy: session.id,
        },
      });

      return NextResponse.json({
        message: 'Draft ditolak.',
        draft: updatedDraft,
      });
    }
  } catch (error) {
    console.error('Error publishing challenge draft:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server.' },
      { status: 500 }
    );
  }
}
