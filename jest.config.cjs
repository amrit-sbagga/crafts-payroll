const nextJest = require("next/jest");

const createJestConfig = nextJest({ dir: "./" });

/** @type {import("jest").Config} */
const config = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],

  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1"
  },

  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,

  testPathIgnorePatterns: ["/node_modules/", "/.next/"],

  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/.gitkeep",
    "!src/lib/prisma.ts"
  ]
};

module.exports = createJestConfig(config);

