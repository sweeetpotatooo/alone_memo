import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

// 좋아요: POST /api/like { id, checkOnly? } (로그인 필요)
export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (!auth) return NextResponse.json({ result: 'fail', msg: '인증 필요' }, { status: 401 });
  const token = auth.replace('Bearer ', '');
  let userId: string;
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
    userId = payload.userId;
  } catch {
    return NextResponse.json({ result: 'fail', msg: '토큰 오류' }, { status: 401 });
  }
  const { id, checkOnly } = await req.json();
  // 이미 좋아요 했는지 확인
  const exist = await prisma.like.findUnique({ where: { userId_memoId: { userId, memoId: id } } });
  if (checkOnly) {
    return NextResponse.json({ result: 'success', liked: !!exist });
  }
  if (exist) {
    // 좋아요 취소
    await prisma.like.delete({ where: { userId_memoId: { userId, memoId: id } } });
    const memo = await prisma.memo.update({ where: { id }, data: { likes: { decrement: 1 } } });
    return NextResponse.json({ result: 'success', liked: false, new_likes: memo.likes });
  } else {
    // 좋아요 추가
    await prisma.like.create({ data: { userId, memoId: id } });
    const memo = await prisma.memo.update({ where: { id }, data: { likes: { increment: 1 } } });
    return NextResponse.json({ result: 'success', liked: true, new_likes: memo.likes });
  }
}
