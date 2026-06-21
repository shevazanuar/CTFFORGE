import prisma from './db';

export async function logAdminAction(
  adminId: string,
  action: 
    | "APPROVE_BUG_REPORT" 
    | "REJECT_BUG_REPORT" 
    | "PUBLISH_DRAFT" 
    | "REJECT_DRAFT" 
    | "CREATE_CHALLENGE" 
    | "UPDATE_CHALLENGE"
    | "DELETE_CHALLENGE"
    | "CREATE_COURSE"
    | "UPDATE_COURSE"
    | "DELETE_COURSE"
    | "CREATE_MODULE"
    | "UPDATE_MODULE"
    | "DELETE_MODULE"
    | "CREATE_LESSON"
    | "UPDATE_LESSON"
    | "DELETE_LESSON"
    | "CREATE_PROGRAM"
    | "UPDATE_PROGRAM"
    | "DELETE_PROGRAM",
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
