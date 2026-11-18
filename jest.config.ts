import type { Config } from "jest";
import nextJest from "next/jest.js";

// next/jest loads next.config.ts and .env files, compiles with SWC and stubs
// styles, images, next/font and server-only.
const createJestConfig = nextJest({ dir: "./" });

const config: Config = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/src/test/setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  coverageProvider: "v8",
  collectCoverageFrom: ["src/**/*.{ts,tsx}", "!src/**/*.test.{ts,tsx}"],
};

export default createJestConfig(config);
