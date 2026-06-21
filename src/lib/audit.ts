import prisma from './db';

export async function logAdminAction(
  adminId: string,
  action: "APPROVE_BUG_REPORT" | "REJECT_BUG_REPORT" | "PUBLISH_DRAFT" | "REJECT_DRAFT" | "CREATE_CHALLENGE" | "CREATE_COURSE",
  targetType: string,
  targetId: string,
  description: string
) {
  try {
    return await prisma.adminLog.create({
      data: {
        adminId,
        action,
        targetType,
        targetId,
        description,
      },
    });
  } catch (error) {
    console.error('Failed to log admin action:', error);
  }
}
