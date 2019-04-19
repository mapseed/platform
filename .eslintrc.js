module.exports = {
  parser: "@typescript-eslint/parser",
  plugins: ["emotion", "react", "@typescript-eslint"],
  extends: ["eslint:recommended", "plugin:react/recommended"],
  settings: {
    react: {
      version: "detect",
    },
  },
  parserOptions: {
    project: "../tsconfig.json",
    ecmaVersion: 2018,
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    },
  },
  globals: {
    module: false,
    moment: false,
    EXIF: false,
    BinaryFile: false,
    loadImage: false,
    prefix: false,
    Mapseed: false,
    MAP_PROVIDER_TOKEN: false,
    MIXPANEL_TOKEN: false,
    GIT_SHA: false,
    L: false,
    ga: false,
    workbox: false,
  },
  env: {
    browser: true,
    es6: true,
    jest: true,
    serviceworker: true,
    node: true,
  },
  rules: {
    "no-console": "error",
    "no-unused-vars": 1,
    "react/no-find-dom-node": 0,
    "emotion/jsx-import": 2,
    "emotion/no-vanilla": 2,
    "emotion/import-from-emotion": 2,
    "emotion/styled-import": 2,
  },
};
