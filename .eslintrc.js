module.exports = {
    env: {
      browser: true,
      es2021: true,
    },
    extends: ["plugin:react/recommended", "plugin:tailwindcss/recommended", "prettier"],
    parser: "@typescript-eslint/parser",
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
      ecmaVersion:"latest",
      sourceType: "module",
    },
    plugins: ["react", "@typescript-eslint","prettier"],
    rules: {},
    settings: {
      react: {
        version: "latest",
      },
    },
  }; 