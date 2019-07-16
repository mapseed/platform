module.exports = {
  parser: "@typescript-eslint/parser",
  plugins: ["emotion", "react", "@typescript-eslint", "react-hooks"],
  // NOTE: eslint doesn't support .ts or .tsx files via the config
  // (yet), but it supports checking them in the commandline (via npm t).
  // Relevant GH issues:
  // https://github.com/typescript-eslint/typescript-eslint/issues/355
  // https://github.com/eslint/eslint/issues/10828
  // https://github.com/eslint/rfcs/pull/9
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:@typescript-eslint/recommended",
  ],
  settings: {
    react: {
      version: "detect",
    },
  },
  parserOptions: {
    project: "./tsconfig.json",
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
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    "@typescript-eslint/indent": 0,
    "@typescript-eslint/prefer-interface": 0,
    "react/prop-types": 0,
    "@typescript-eslint/no-non-null-assertion": 0,
    "@typescript-eslint/explicit-function-return-type": 0,
    "@typescript-eslint/camelcase": 1,
  },
};
