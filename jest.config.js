module.exports = {
  "transform": {
    "^.+\\.js[x]*?$": "babel-jest"
  },
  "transformIgnorePatterns": [
    "/node_modules/(?!(@syncfusion)/)"
  ],
  "testEnvironment": "jsdom",
  "roots": [
    "<rootDir>/spec"
  ],
  "moduleFileExtensions": [
    "js"
  ],
  "setupFilesAfterEnv": [
    "<rootDir>/jest.setup.js"
  ],
  "collectCoverage": true,
  "coverageDirectory": "./coverage/chrome",
  "coverageReporters": [
    "lcov",
    "json",
    "json-summary",
    "text",
    "text-summary"
  ],
  "errorOnDeprecated": true,
  "coverageThreshold": {
    "global": {
      "branches": 90,
      "functions": 90,
      "lines": 90,
      "statements": 90
    }
  }
}