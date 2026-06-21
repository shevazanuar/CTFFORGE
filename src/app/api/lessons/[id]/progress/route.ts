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

    if (!session) {
      return NextResponse.json(
        { error: 'Tidak terotentikasi.' },
        { status: 401 }
      );
    }

    const { id: lessonId } = await params;
    const { isCompleted } = await request.json();

    // Check if lesson exists
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        module: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!lesson) {
      return NextResponse.json(
        { error: 'Pelajaran tidak ditemukan.' },
        { status: 404 }
      );
    }

    const courseId = lesson.module.courseId;

    // Create or update progress
    const progress = await prisma.courseProgress.upsert({
      where: {
        userId_lessonId: {
          userId: session.id,
          lessonId,
        },
      },
      update: {
        isCompleted,
        completedAt: isCompleted ? new Date() : null,
      },
      create: {
        userId: session.id,
        lessonId,
        isCompleted,
        completedAt: isCompleted ? new Date() : null,
      },
    });

    let badgeAwarded = null;

    // Check if the whole course is completed to award badge
    if (isCompleted) {
      // Get all lessons in this course
      const allLessons = await prisma.lesson.findMany({
        where: {
          module: {
            courseId,
          },
        },
      });

      // Get completed lessons by this user in this course
      const completedProgress = await prisma.courseProgress.findMany({
        where: {
          userId: session.id,
          isCompleted: true,
          lesson: {
            module: {
              courseId,
            },
          },
        },
      });

      if (allLessons.length > 0 && allLessons.length === completedProgress.length) {
        // User has completed all lessons in this course!
        // Find matching badge
        let badgeName = '';
        if (lesson.module.course.title === 'Web Security Basic') {
          badgeName = 'Web Security Apprentice';
        }

        if (badgeName) {
          const badge = await prisma.badge.findUnique({
            where: { name: badgeName },
          });

          if (badge) {
            // Check if user already has it
            const existingUserBadge = await prisma.userBadge.findUnique({
              where: {
                userId_badgeId: {
                  userId: session.id,
                  badgeId: badge.id,
                },
              },
            });

            if (!existingUserBadge) {
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
        }
      }
    }

    return NextResponse.json({
      progress,
      badgeAwarded: badgeAwarded ? badgeAwarded.badge : null,
    });
  } catch (error) {
    console.error('Error updating lesson progress:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server.' },
      { status: 500 }
    );
  }
}
