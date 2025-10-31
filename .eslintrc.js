/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  extends: ["next/core-web-vitals"],
  parserOptions: {
    project: "./tsconfig.json"
  },
  rules: {
    "react-hooks/exhaustive-deps": "warn"
  }
};
