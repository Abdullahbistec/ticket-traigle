import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "next-env.d.ts",
      "src/generated/**",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      // NFR: zero `any` in the codebase.
      "@typescript-eslint/no-explicit-any": "error",
    },
  },
);
