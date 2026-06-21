import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { comparePassword } from '@/lib/password';

const submissionSchema = z.object({
  flag: z.string().min(1, 'Flag tidak boleh kosong.').max(100),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get('token')?.value;
    const session = token ? await verifyToken(token) : null;

    if (!session) {
      return NextResponse.json(
        { error: 'Tidak terotentikasi.' },
        { status: 401 }
      );
    }

    const { id: challengeId } = await params;
    const body = await request.json();
    const result = submissionSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { flag } = result.data;

    // Fetch challenge
    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeId },
    });

    if (!challenge) {
      return NextResponse.json(
        { error: 'Tantangan tidak ditemukan.' },
        { status: 404 }
      );
    }

    // Check if user already solved it
    const existingCorrectSubmission = await prisma.challengeSubmission.findFirst({
      where: {
        userId: session.id,
        challengeId: challenge.id,
        status: 'CORRECT',
      },
    });

    if (existingCorrectSubmission) {
      return NextResponse.json({
        message: 'Tantangan ini sudah Anda selesaikan sebelumnya.',
        status: 'CORRECT',
        alreadySolved: true,
      });
    }

    // Verify flag
    const isCorrect = await comparePassword(flag.trim(), challenge.flagHash);

    if (isCorrect) {
      // 1. Save CORRECT submission
      const submission = await prisma.challengeSubmission.create({
        data: {
          userId: session.id,
          challengeId: challenge.id,
          submittedFlag: flag.trim(),
          status: 'CORRECT',
          pointEarned: challenge.point,
        },
      });

      // 2. Award points to user
      const user = await prisma.user.update({
        where: { id: session.id },
        data: {
          totalPoint: {
            increment: challenge.point,
          },
        },
      });

      // 3. Register point transaction
      await prisma.pointTransaction.create({
        data: {
          userId: session.id,
          sourceType: 'CHALLENGE',
          sourceId: challenge.id,
          point: challenge.point,
          description: `Menyelesaikan tantangan: ${challenge.title}`,
        },
      });

      // 4. Check for badges
      let badgeAwarded = null;

      // "First Blood" badge for first solve
      const badge = await prisma.badge.findUnique({
        where: { name: 'First Blood' },
      });

      if (badge) {
        const existingBadge = await prisma.userBadge.findUnique({
          where: {
            userId_badgeId: {
              userId: session.id,
              badgeId: badge.id,
            },
          },
        });

        if (!existingBadge) {
          badgeAwarded = await prisma.userBadge.create({
            data: {
              userId: session.id,
              badgeId: badge.id,
            },
            include: {
              badge: true,
            },
          });
        }
      }

      return NextResponse.json({
        message: 'Selamat! Flag benar.',
        status: 'CORRECT',
        pointsEarned: challenge.point,
        badgeAwarded: badgeAwarded ? badgeAwarded.badge : null,
      });
    } else {
      // Save INCORRECT submission
      await prisma.challengeSubmission.create({
        data: {
          userId: session.id,
          challengeId: challenge.id,
          submittedFlag: flag.trim(),
          status: 'INCORRECT',
          pointEarned: 0,
        },
      });

      return NextResponse.json({
        message: 'Flag salah. Silakan coba lagi!',
        status: 'INCORRECT',
        pointsEarned: 0,
      });
    }
  } catch (error) {
    console.error('Error submitting flag:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server.' },
      { status: 500 }
    );
  }
}
