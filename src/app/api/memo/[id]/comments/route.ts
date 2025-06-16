import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

// 댓글 GET/POST
export async function GET(req: NextRequest) {
  // id 파라미터는 req.nextUrl로부터 추출
  const url = req.nextUrl;
  const id = url.pathname.split('/').slice(-2)[0];
  const comments = await prisma.comment.findMany({
    where: { memoId: id },
    orderBy: { createdAt: 'asc' },
  });
  return NextResponse.json({ result: 'success', comments });
}

export async function POST(req: NextRequest) {
  // id 파라미터는 req.nextUrl로부터 추출
  const url = req.nextUrl;
  const id = url.pathname.split('/').slice(-2)[0];
  const auth = req.headers.get('authorization');
  if (!auth) return NextResponse.json({ result: 'fail', msg: '인증 필요' }, { status: 401 });
  const token = auth.replace('Bearer ', '');
  let userId = null;
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
    userId = payload.userId;
  } catch {
    return NextResponse.json({ result: 'fail', msg: '인증 실패' }, { status: 401 });
  }
  const { content } = await req.json();
  if (!content || !content.trim()) {
    return NextResponse.json({ result: 'fail', msg: '댓글 내용을 입력하세요.' }, { status: 400 });
  }
  const comment = await prisma.comment.create({
    data: { content, userId, memoId: id },
  });
  // 알림: 댓글(글 작성자에게)
  const memo = await prisma.memo.findUnique({ where: { id } });
  if (memo && memo.userId !== userId) {
    await prisma.notification.create({
      data: {
        type: 'comment',
        message: `${userId}님이 댓글을 남겼습니다.`,
        userId: memo.userId,
        fromUserId: userId,
        memoId: id,
      },
    });
  }
  return NextResponse.json({ result: 'success', comment });
}

// PATCH: 댓글 수정, DELETE: 댓글 삭제
export async function PATCH(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (!auth) return NextResponse.json({ result: 'fail', msg: '인증 필요' }, { status: 401 });
  const token = auth.replace('Bearer ', '');
  let userId = null;
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
    userId = payload.userId;
  } catch {
    return NextResponse.json({ result: 'fail', msg: '인증 실패' }, { status: 401 });
  }
  const { commentId, content } = await req.json();
  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment || comment.userId !== userId) {
    return NextResponse.json({ result: 'fail', msg: '권한 없음' }, { status: 403 });
  }
  await prisma.comment.update({ where: { id: commentId }, data: { content } });
  return NextResponse.json({ result: 'success' });
}

export async function DELETE(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (!auth) return NextResponse.json({ result: 'fail', msg: '인증 필요' }, { status: 401 });
  const token = auth.replace('Bearer ', '');
  let userId = null;
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
    userId = payload.userId;
  } catch {
    return NextResponse.json({ result: 'fail', msg: '인증 실패' }, { status: 401 });
  }
  const { commentId } = await req.json();
  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment || comment.userId !== userId) {
    return NextResponse.json({ result: 'fail', msg: '권한 없음' }, { status: 403 });
  }
  await prisma.comment.delete({ where: { id: commentId } });
  return NextResponse.json({ result: 'success' });
}
