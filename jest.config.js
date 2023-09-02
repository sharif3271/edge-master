const { compilerOptions } = require('./tsconfig');


module.exports = {
  roots: ['<rootDir>'],
  modulePaths: [compilerOptions.baseUrl],
  collectCoverage: true,
  collectCoverageFrom: ['./test/*.test.ts'],
  testMatch: ['<rootDir>/test/**/*.{spec,test}.{js,jsx,ts,tsx}'],
  testEnvironment: 'node',
  preset: 'ts-jest'
};