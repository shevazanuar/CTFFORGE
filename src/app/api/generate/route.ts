import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { generateChallengeDraft } from '@/lib/generator';
import { hashPassword } from '@/lib/password';

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
    const token = request.cookies.get('token')?.value;
    const session = token ? await verifyToken(token) : null;

    if (!session) {
      return NextResponse.json(
        { error: 'Tidak terotentikasi.' },
        { status: 401 }
      );
    }

    const { prompt, category, difficulty } = await request.json();

    if (!prompt || !category || !difficulty) {
      return NextResponse.json(
        { error: 'Prompt, kategori, dan tingkat kesulitan wajib diisi.' },
        { status: 400 }
      );
    }

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
