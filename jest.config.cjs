module.exports = {
  testEnvironment: 'node',
  testTimeout: 30000,
  rootDir: '.',
  preset: 'ts-jest',
  moduleFileExtensions: ['ts', 'js'],
  testMatch: ['<rootDir>/server/tests/**/*.test.ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest'
  }
};
