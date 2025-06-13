import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

// 인증 미들웨어
function getUserIdFromRequest(req: NextRequest): string | null {
  const auth = req.headers.get('authorization');
  if (!auth) return null;
  const token = auth.replace('Bearer ', '');
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
    return payload.userId;
  } catch {
    return null;
  }
}

// GET: 전체 메모 조회 (인증 불필요)
export async function GET(req: NextRequest) {
  try {
    const memos = await prisma.memo.findMany({ orderBy: { likes: 'desc' } });
    return NextResponse.json({ result: 'success', memos });
  } catch (error) {
    console.error('Memo GET error:', error);
    return NextResponse.json({ result: 'fail', msg: '메모 불러오기 실패', error: (error as Error).message }, { status: 500 });
  }
}

// POST: 메모 생성 (로그인 필요)
export async function POST(req: NextRequest) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ result: 'fail', msg: '인증 필요' }, { status: 401 });
    const { title_give, content_give } = await req.json();
    const memo = await prisma.memo.create({
      data: { title: title_give, content: content_give, likes: 0, userId },
    });
    return NextResponse.json({ result: 'success', msg: '메모가 저장되었습니다.', memo });
  } catch (error: any) {
    console.error('Memo POST error:', error);
    return NextResponse.json({ result: 'fail', msg: '메모 저장에 실패했습니다!', error: error.message }, { status: 500 });
  }
}

// PATCH: 메모 수정 (로그인 필요, 본인만)
export async function PATCH(req: NextRequest) {
  const userId = getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ result: 'fail', msg: '인증 필요' }, { status: 401 });
  const { id, title_give, content_give } = await req.json();
  const memo = await prisma.memo.findUnique({ where: { id } });
  if (!memo || memo.userId !== userId) return NextResponse.json({ result: 'fail', msg: '권한 없음' }, { status: 403 });
  await prisma.memo.update({ where: { id }, data: { title: title_give, content: content_give } });
  return NextResponse.json({ result: 'success', msg: '수정 완료' });
}

// DELETE: 메모 삭제 (로그인 필요, 본인만)
export async function DELETE(req: NextRequest) {
  const userId = getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ result: 'fail', msg: '인증 필요' }, { status: 401 });
  const { id } = await req.json();
  const memo = await prisma.memo.findUnique({ where: { id } });
  if (!memo || memo.userId !== userId) return NextResponse.json({ result: 'fail', msg: '권한 없음' }, { status: 403 });
  await prisma.memo.delete({ where: { id } });
  return NextResponse.json({ result: 'success', msg: '삭제 완료' });
}
