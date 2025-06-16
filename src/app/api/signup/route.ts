import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

// 회원가입
export async function POST(req: NextRequest) {
  try {
    const { id, pw } = await req.json();
    const exist = await prisma.user.findUnique({ where: { id } });
    if (exist) return NextResponse.json({ result: 'fail', msg: '이미 존재하는 아이디입니다.' });
    await prisma.user.create({ data: { id, pw } });
    return NextResponse.json({ result: 'success', msg: '회원가입 완료' });
  } catch (error: unknown) {
    let errorMsg = 'Unknown error';
    if (error instanceof Error) errorMsg = error.message;
    console.error('Signup error:', error);
    return NextResponse.json({ result: 'fail', msg: 'Server error', error: errorMsg }, { status: 500 });
  }
}
