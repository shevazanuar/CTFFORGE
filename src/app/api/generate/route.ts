import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { generateChallengeDraft } from '@/lib/generator';
import { hashPassword } from '@/lib/password';
import { rateLimit } from '@/lib/rateLimit';

const generateSchema = z.object({
  prompt: z.string().min(5, 'Prompt minimal harus 5 karakter.').max(500),
  category: z.string().min(1, 'Kategori wajib dipilih.'),
  difficulty: z.string().min(1, 'Tingkat kesulitan wajib dipilih.'),
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

    // Admin sees all drafts; standard user only sees their own
    const drafts = await prisma.generatedChallengeDraft.findMany({
      where: session.role === 'ADMIN' ? {} : { generatedBy: session.id },
      include: {
        creator: {
          select: { name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ drafts });
  } catch (error) {
    console.error('Error fetching drafts:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const limitRes = rateLimit(`generate_${ip}`, 5, 60000); // Max 5 per minute

    if (!limitRes.allowed) {
      return NextResponse.json(
        { error: `Batas percobaan pembuatan soal terlampaui. Silakan coba lagi dalam ${Math.ceil(limitRes.retryAfter / 1000)} detik.` },
        { 
          status: 429, 
          headers: { 'Retry-After': String(Math.ceil(limitRes.retryAfter / 1000)) } 
        }
      );
    }

    const token = request.cookies.get('token')?.value;
    const session = token ? await verifyToken(token) : null;

    if (!session) {
      return NextResponse.json(
        { error: 'Tidak terotentikasi.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const result = generateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { prompt, category, difficulty } = result.data;

    // Generate the challenge details using our rich templates
    const generated = await generateChallengeDraft(prompt, category, difficulty);

    // Hash the flag to store it securely in the database
    const flagHash = await hashPassword(generated.flag);

    // Create the draft in the database
    const draft = await prisma.generatedChallengeDraft.create({
      data: {
        generatedBy: session.id,
        promptInput: prompt,
        category,
        difficulty,
        generatedTitle: generated.title,
        generatedDescription: generated.description,
        generatedHint: generated.hint,
        generatedSolution: generated.solution,
        generatedFlagHash: flagHash,
        generatedPoint: generated.point,
        status: 'PENDING',
      },
    });

    return NextResponse.json({
      message: 'Draft tantangan berhasil digenerate!',
      draft: {
        ...draft,
        plainFlag: generated.flag, // Return plaintext flag once for confirmation
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Error generating challenge draft:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server.' },
      { status: 500 }
    );
  }
}
