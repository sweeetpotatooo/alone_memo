import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

export function getUserIdFromRequest(req: NextRequest): string | null {
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
