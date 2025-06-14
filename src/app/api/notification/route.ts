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

// GET: 내 알림 목록 (최신순)
export async function GET(req: NextRequest) {
  const userId = getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ result: 'fail', msg: '인증 필요' }, { status: 401 });
  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 30,
    include: { fromUser: true, memo: true },
  });
  return NextResponse.json({ result: 'success', notifications });
}

// PATCH: 알림 읽음 처리
export async function PATCH(req: NextRequest) {
  const userId = getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ result: 'fail', msg: '인증 필요' }, { status: 401 });
  const { ids } = await req.json(); // ids: string[]
  await prisma.notification.updateMany({
    where: { userId, id: { in: ids } },
    data: { read: true },
  });
  return NextResponse.json({ result: 'success' });
}
