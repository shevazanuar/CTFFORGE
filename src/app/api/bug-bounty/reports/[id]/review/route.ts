import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { logAdminAction } from '@/lib/audit';

const reviewSchema = z.object({
  status: z.enum(['VALID', 'DUPLICATE', 'INFORMATIVE', 'REJECTED']),
  pointAwarded: z.coerce.number().nonnegative().default(0),
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

    const { id: reportId } = await params;
    const body = await request.json();
    const result = reviewSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { status, pointAwarded } = result.data;

    // Fetch bug report
    const report = await prisma.bugReport.findUnique({
      where: { id: reportId },
      include: {
        user: true,
      },
    });

    if (!report) {
      return NextResponse.json(
        { error: 'Laporan bug tidak ditemukan.' },
        { status: 404 }
      );
    }

    const prevStatus = report.status;
    const pointsToAward = pointAwarded;

    // Update report
    const updatedReport = await prisma.bugReport.update({
      where: { id: reportId },
      data: {
        status,
        pointAwarded: pointsToAward,
        reviewedBy: session.id,
      },
    });

    let badgeAwarded = null;

    // If changing to VALID and it wasn't valid before, award points
    if (status === 'VALID' && prevStatus !== 'VALID' && pointsToAward > 0) {
      // 1. Increment user points
      await prisma.user.update({
        where: { id: report.userId },
        data: {
          totalPoint: {
            increment: pointsToAward,
          },
        },
      });

      // 2. Register transaction
      await prisma.pointTransaction.create({
        data: {
          userId: report.userId,
          sourceType: 'BUG_REPORT',
          sourceId: report.id,
          point: pointsToAward,
          description: `Laporan Bug Bounty disetujui: ${report.title}`,
        },
      });

      // 3. Award "Bug Hunter" badge if they don't have it
      const badge = await prisma.badge.findUnique({
        where: { name: 'Bug Hunter' },
      });

      if (badge) {
        const existingBadge = await prisma.userBadge.findUnique({
          where: {
            userId_badgeId: {
              userId: report.userId,
              badgeId: badge.id,
            },
          },
        });

        if (!existingBadge) {
          badgeAwarded = await prisma.userBadge.create({
            data: {
              userId: report.userId,
              badgeId: badge.id,
            },
            include: {
              badge: true,
            },
          });
        }
      }
    }

    // Log the administrative action to the audit logs
    await logAdminAction(
      session.id,
      status === 'VALID' ? 'APPROVE_BUG_REPORT' : 'REJECT_BUG_REPORT',
      'BugReport',
      report.id,
      `Reviewed bug report "${report.title}" by user ID ${report.userId}. Status set to ${status}. Points awarded: ${pointsToAward}.`
    );

    return NextResponse.json({
      report: updatedReport,
      badgeAwarded: badgeAwarded ? badgeAwarded.badge : null,
    });
  } catch (error) {
    console.error('Error reviewing bug report:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server.' },
      { status: 500 }
    );
  }
}
