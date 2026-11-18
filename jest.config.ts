import type { Config } from "jest";
import nextJest from "next/jest.js";

// next/jest loads next.config.ts and .env files, compiles with SWC and stubs
// styles, images, next/font and server-only.
const createJestConfig = nextJest({ dir: "./" });

const config: Config = {
  testEnvironment: "jsdom",
  // Tests live beside the code they cover; tests/ holds only their support.
  roots: ["<rootDir>/src"],
  testMatch: ["**/__tests__/**/*.test.{ts,tsx}"],
  setupFilesAfterEnv: ["<rootDir>/tests/unit/setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@test/(.*)$": "<rootDir>/tests/$1",
  },
  coverageProvider: "v8",
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/__tests__/**",
    "!src/**/*.d.ts",
    "!src/types/**",
  ],
};

export default createJestConfig(config);
