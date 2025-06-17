module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testPathIgnorePatterns: ["/node_modules/", "/.next/", "/dist/", "/out/"],
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
    },
  },
};
