import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

// 로그인
export async function POST(req: NextRequest) {
  const { id, pw } = await req.json();
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user || user.pw !== pw) {
    return NextResponse.json({ result: 'fail', msg: '아이디 또는 비밀번호가 올바르지 않습니다.' });
  }
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
  return NextResponse.json({ result: 'success', token, userId: user.id });
}
