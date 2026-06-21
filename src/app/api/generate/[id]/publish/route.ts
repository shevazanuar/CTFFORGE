import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { logAdminAction } from '@/lib/audit';

const publishSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
});

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
    const body = await request.json();
    const result = publishSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { status } = result.data;

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

      // Log admin action
      await logAdminAction(
        session.id,
        'PUBLISH_DRAFT',
        'GeneratedChallengeDraft',
        draftId,
        `Approved and published challenge draft "${draft.generatedTitle}" (Category: ${draft.category}, Difficulty: ${draft.difficulty})`
      );

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

      // Log admin action
      await logAdminAction(
        session.id,
        'REJECT_DRAFT',
        'GeneratedChallengeDraft',
        draftId,
        `Rejected challenge draft "${draft.generatedTitle}"`
      );

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
