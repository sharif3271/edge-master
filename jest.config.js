const { compilerOptions } = require('./tsconfig');


module.exports = {
  roots: ['<rootDir>'],
  modulePaths: [compilerOptions.baseUrl],
  collectCoverage: true,
  collectCoverageFrom: ['src/*.ts', '!src/index.ts'],
  coverageThreshold: {
    global: {
      lines: 90,
      funcs: 100,
    }
  },
  testMatch: ['<rootDir>/test/**/*.test.ts'],
  testEnvironment: 'node',
  preset: 'ts-jest'
};