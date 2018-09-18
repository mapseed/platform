module.exports = {
  projects: [
    {
      displayName: "jest-prettier",
      runner: "jest-runner-prettier",
      moduleFileExtensions: ["js"],
      testMatch: ["<rootDir>/src/**/*.js", "<rootDir>/scripts/**/*.js"],
      testPathIgnorePatterns: [
        "<rootDir>/src/base/static/legacy-libs/",
        "<rootDir>/node_modules/",
      ],
    },
    {
      displayName: "jest-eslint",
      runner: "jest-runner-eslint",
      testMatch: [
        "<rootDir>/src/base/static/components/**/*.js",
        "<rootDir>/src/base/static/utils/**/*.js",
        "<rootDir>/scripts/**/*.js",
      ],
      testPathIgnorePatterns: [
        "<rootDir>/src/base/static/libs/",
        "<rootDir>/node_modules/",
      ],
    },
    {
      displayName: "mapseed-platform-test",
      testURL: "http://localhost/",
      moduleNameMapper: {
        "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$":
          "<rootDir>/__mocks__/file-mock.js",
        "\\.(css|less|scss)$": "<rootDir>/__mocks__/style-mock.js",
        "^config$": "<rootDir>/__mocks__/config-mock.js",
      },
      setupFiles: ["<rootDir>/jest-setup.js"],
      snapshotSerializers: ["enzyme-to-json/serializer"],
      testMatch: ["**/*.test.js"],
    },
  ],
};
