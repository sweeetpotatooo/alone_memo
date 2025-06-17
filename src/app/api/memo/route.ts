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
// GET: 내가 작성한 글, 내가 좋아요한 글 필터 지원
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const filter = url.searchParams.get("filter");
    const page = parseInt(url.searchParams.get("page") || '1', 10);
    const pageSize = parseInt(url.searchParams.get("pageSize") || '30', 10);
    const skip = (page - 1) * pageSize;
    let memos;
    if (filter === "my") {
      const userId = getUserIdFromRequest(req);
      if (!userId) return NextResponse.json({ result: 'fail', msg: '인증 필요' }, { status: 401 });
      memos = await prisma.memo.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, skip, take: pageSize });
    } else if (filter === "liked") {
      const userId = getUserIdFromRequest(req);
      if (!userId) return NextResponse.json({ result: 'fail', msg: '인증 필요' }, { status: 401 });
      const likes = await prisma.like.findMany({ where: { userId }, select: { memo: true } });
      memos = likes.map(like => like.memo).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(skip, skip + pageSize);
    } else {
      memos = await prisma.memo.findMany({ orderBy: { createdAt: 'desc' }, skip, take: pageSize });
    }
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
    // 알림: 글 등록(본인에게만)
    await prisma.notification.create({
      data: {
        type: 'create',
        message: `새 메모가 등록되었습니다: ${memo.title}`,
        userId,
        fromUserId: userId,
        memoId: memo.id,
      },
    });
    return NextResponse.json({ result: 'success', msg: '메모가 저장되었습니다.', memo });
  } catch (error) {
    const err = error as Error;
    console.error('Memo POST error:', err);
    return NextResponse.json({ result: 'fail', msg: '메모 저장에 실패했습니다!', error: err.message }, { status: 500 });
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
  // 알림: 글 수정(본인에게만)
  await prisma.notification.create({
    data: {
      type: 'update',
      message: `메모가 수정되었습니다: ${title_give}`,
      userId,
      fromUserId: userId,
      memoId: id,
    },
  });
  return NextResponse.json({ result: 'success', msg: '수정 완료' });
}

// DELETE: 메모 삭제 (로그인 필요, 본인만)
export async function DELETE(req: NextRequest) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ result: 'fail', msg: '인증 필요' }, { status: 401 });
    const { id } = await req.json();
    const memo = await prisma.memo.findUnique({ where: { id } });
    if (!memo || memo.userId !== userId) return NextResponse.json({ result: 'fail', msg: '권한 없음' }, { status: 403 });
    // 알림: 글 삭제(본인에게만)
    await prisma.notification.create({
      data: {
        type: 'delete',
        message: `메모가 삭제되었습니다: ${memo.title}`,
        userId,
        fromUserId: userId,
        memoId: id,
      },
    });
    // 관련 댓글/좋아요 먼저 삭제
    await prisma.comment.deleteMany({ where: { memoId: id } });
    await prisma.like.deleteMany({ where: { memoId: id } });
    await prisma.memo.delete({ where: { id } });
    return NextResponse.json({ result: 'success', msg: '삭제 완료' });
  } catch (error) {
    console.error('Memo DELETE error:', error);
    return NextResponse.json({ result: 'fail', msg: '메모 삭제에 실패했습니다!', error: (error as Error).message }, { status: 500 });
  }
}
