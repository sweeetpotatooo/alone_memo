import { NextRequest } from 'next/server';
import { getUserIdFromRequest } from '../src/app/api/memo/getUserIdFromRequest';

describe('getUserIdFromRequest', () => {
  const userId = 'testuser';
  const jwt = require('jsonwebtoken');
  const JWT_SECRET = 'dev_secret';
  
  it('returns userId if valid token', () => {
    const token = jwt.sign({ userId }, JWT_SECRET);
    const req = { headers: { get: (key: string) => key === 'authorization' ? `Bearer ${token}` : null } } as unknown as NextRequest;
    expect(getUserIdFromRequest(req)).toBe(userId);
  });

  it('returns null if no authorization header', () => {
    const req = { headers: { get: () => null } } as unknown as NextRequest;
    expect(getUserIdFromRequest(req)).toBeNull();
  });

  it('returns null if invalid token', () => {
    const req = { headers: { get: () => 'Bearer invalidtoken' } } as unknown as NextRequest;
    expect(getUserIdFromRequest(req)).toBeNull();
  });
});
