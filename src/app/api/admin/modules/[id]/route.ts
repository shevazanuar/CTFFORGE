import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { logAdminAction } from '@/lib/audit';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get('token')?.value;
    const session = token ? await verifyToken(token) : null;

    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Akses ditolak. Hanya untuk Admin.' }, { status: 403 });
    }

    const { id: moduleId } = await params;

    const mod = await prisma.module.findUnique({
      where: { id: moduleId },
    });

    if (!mod) {
      return NextResponse.json({ error: 'Modul tidak ditemukan.' }, { status: 404 });
    }

    await prisma.module.delete({
      where: { id: moduleId },
    });

    await logAdminAction(
      session.id,
      'DELETE_MODULE',
      'Module',
      moduleId,
      `Deleted module "${mod.title}"`
    );

    return NextResponse.json({ message: 'Modul berhasil dihapus.' });
  } catch (error) {
    console.error('Error deleting module:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}
