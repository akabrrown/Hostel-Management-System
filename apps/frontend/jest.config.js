// Jest configuration for UPSA Hostel Management System
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  
  // Test environment
  testEnvironment: 'jest-environment-jsdom',
  
  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  
  // Test file patterns
  testMatch: [
    '<rootDir>/tests/**/__tests__/**/*.{ts,tsx,js,jsx}',
    '<rootDir>/tests/**/*.{test,spec}.{ts,tsx,js,jsx}',
  ],
  
  // Ignore patterns
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/tests/e2e/',
  ],
  
  // Transform files
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  
  // Module name mapping
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  
  // Coverage configuration
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx}',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  
  // Mock files
  modulePathIgnorePatterns: ['<rootDir>/dist/'],
  
  // Test timeout
  testTimeout: 10000,
  
  // Verbose output
  verbose: true,
  
  // Clear mocks between tests
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
})

module.exports = createJestConfig
