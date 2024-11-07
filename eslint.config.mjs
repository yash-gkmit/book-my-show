import globals from "globals";

export default [
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.node, // For Node.js global variables
      },
    },
    rules: {
      "no-unused-vars": "error", // Warn on unused variables
      eqeqeq: "error", // Require === and !==
      semi: ["error", "always"], // Enforce semicolons at the end of statements
    },
  },
];
