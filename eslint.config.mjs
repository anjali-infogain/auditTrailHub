export default [
  {
    ignores: ['node_modules/', 'dist/', 'coverage/'], // Ignore unnecessary files
  },
  {
    languageOptions: {
      ecmaVersion: 'latest', // Use the latest ECMAScript version
      sourceType: 'module', // Enable ES modules
    },
    linterOptions: {
      reportUnusedDisableDirectives: true, // Warn if eslint-disable is unused
    },
    rules: {
      'no-console': 'off', // Allow console logs (change to 'warn' or 'error' if needed)
      'indent': ['error', 2], // Enforce 2-space indentation
      'quotes': ['error', 'single'], // Enforce double quotes
      'semi': ['error', 'always'], // Require semicolons
      'eqeqeq': 'warn', // Warn when using == instead of ===
      'no-unused-vars': ['warn'], // Warn for unused variables
      'prefer-const': 'warn', // Prefer const over let if the variable is not reassigned
    },
  },
];
