// __mocks__/src/generated/prisma.js
const mockPrisma = {
  memo: {
    findUnique: jest.fn(),
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

module.exports = {
  PrismaClient: jest.fn(() => mockPrisma),
  mockPrisma,
};
