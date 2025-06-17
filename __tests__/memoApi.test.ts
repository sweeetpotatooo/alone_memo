jest.mock('jsonwebtoken', () => ({
  verify: jest.fn(() => ({ userId: 'testuser' })),
}));

// mockPrisma를 테스트 파일 내에서 직접 선언하고 jest.mock에서 반환
const mockPrisma = {
  memo: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  notification: {
    create: jest.fn(),
  },
  comment: {
    deleteMany: jest.fn(),
  },
  like: {
    deleteMany: jest.fn(),
  },
};

jest.mock('../src/generated/prisma', () => ({
  PrismaClient: jest.fn(() => mockPrisma),
}));

import { NextRequest } from 'next/server';
import * as memoApi from '../src/app/api/memo/route';

function createMockRequest({ headers = {}, body = {}, url = 'http://localhost:3000/api/memo' }: { headers?: Record<string, string>, body?: unknown, url?: string } = {}) {
  return {
    headers: {
      get: (key: string) => {
        if (key === 'authorization') return headers['authorization'];
        return undefined;
      },
    },
    json: async () => body ?? {},
    url,
  } as unknown as NextRequest;
}

describe('메모 API CRUD', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('POST: 인증 없으면 401', async () => {
    const req = createMockRequest();
    const res = await memoApi.POST(req);
    const data = await res.json();
    expect(res.status).toBe(401);
    expect(data.result).toBe('fail');
    expect(data.msg).toBe('인증 필요');
  });

  it('POST: 정상 생성', async () => {
    mockPrisma.memo.create.mockResolvedValue({ id: '1', title: 't', content: 'c', likes: 0, userId: 'testuser' });
    mockPrisma.notification.create.mockResolvedValue({});
    const req = createMockRequest({
      headers: { authorization: 'Bearer validtoken' },
      body: { title_give: 't', content_give: 'c' },
    });
    const res = await memoApi.POST(req);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.result).toBe('success');
    expect(data.memo.title).toBe('t');
  });

  it('PATCH: 인증 없으면 401', async () => {
    const req = createMockRequest();
    const res = await memoApi.PATCH(req);
    const data = await res.json();
    expect(res.status).toBe(401);
    expect(data.result).toBe('fail');
    expect(data.msg).toBe('인증 필요');
  });

  it('PATCH: 권한 없으면 403', async () => {
    mockPrisma.memo.findUnique.mockResolvedValue({ id: '1', userId: 'other', title: 't', content: 'c' });
    const req = createMockRequest({
      headers: { authorization: 'Bearer validtoken' },
      body: { id: '1', title_give: 't', content_give: 'c' },
    });
    const res = await memoApi.PATCH(req);
    const data = await res.json();
    expect(res.status).toBe(403);
    expect(data.result).toBe('fail');
    expect(data.msg).toBe('권한 없음');
  });

  it('PATCH: 정상 수정', async () => {
    mockPrisma.memo.findUnique.mockResolvedValue({ id: '1', userId: 'testuser', title: 't', content: 'c' });
    mockPrisma.memo.update.mockResolvedValue({});
    mockPrisma.notification.create.mockResolvedValue({});
    const req = createMockRequest({
      headers: { authorization: 'Bearer validtoken' },
      body: { id: '1', title_give: 't2', content_give: 'c2' },
    });
    const res = await memoApi.PATCH(req);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.result).toBe('success');
  });

  it('DELETE: 인증 없으면 401', async () => {
    const req = createMockRequest();
    const res = await memoApi.DELETE(req);
    const data = await res.json();
    expect(res.status).toBe(401);
    expect(data.result).toBe('fail');
    expect(data.msg).toBe('인증 필요');
  });

  it('DELETE: 권한 없으면 403', async () => {
    mockPrisma.memo.findUnique.mockResolvedValue({ id: '1', userId: 'other', title: 't' });
    const req = createMockRequest({
      headers: { authorization: 'Bearer validtoken' },
      body: { id: '1' },
    });
    const res = await memoApi.DELETE(req);
    const data = await res.json();
    expect(res.status).toBe(403);
    expect(data.result).toBe('fail');
    expect(data.msg).toBe('권한 없음');
  });

  it('DELETE: 정상 삭제', async () => {
    mockPrisma.memo.findUnique.mockResolvedValue({ id: '1', userId: 'testuser', title: 't' });
    mockPrisma.notification.create.mockResolvedValue({});
    mockPrisma.comment.deleteMany.mockResolvedValue({});
    mockPrisma.like.deleteMany.mockResolvedValue({});
    mockPrisma.memo.delete.mockResolvedValue({});
    const req = createMockRequest({
      headers: { authorization: 'Bearer validtoken' },
      body: { id: '1' },
    });
    const res = await memoApi.DELETE(req);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.result).toBe('success');
    expect(data.msg).toBe('삭제 완료');
  });
});