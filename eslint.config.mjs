import globals from "globals";

export default [
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser, // For browser global variables
        ...globals.node, // For Node.js global variables
      },
    },
    rules: {
      "no-unused-vars": "warn", // Warn on unused variables
      "no-console": "warn", // Warn on console.log usage
      eqeqeq: "error", // Require === and !==
      semi: ["error", "always"], // Enforce semicolons at the end of statements
      //"quotes": ["error", "double"], // Use single quotes
      //"indent": ["error", 2],      // Enforce 2-space indentation
    },
  },
];
