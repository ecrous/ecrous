/** @type {import('ts-jest').JestConfigWithTsJest} **/
export default {
  testEnvironment: "node",
  // testPathIgnorePatterns: ["/node_modules"],
  // testMatch: ["**.test.ts"],
  transform: {
    "^.+\.ts$": ["ts-jest", {}],
  },
};
