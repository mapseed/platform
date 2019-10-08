module.exports = {
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
};
