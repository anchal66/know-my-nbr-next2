// eslint.config.mjs

import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // Extend Next.js core web vitals and TypeScript configurations
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // Override specific ESLint rules
  {
    // Specify the files these rules should apply to
    files: ["**/*.ts", "**/*.tsx"],

    // Define rule overrides
    rules: {
      // Disable the rule that disallows the use of 'any' type
      "@typescript-eslint/no-explicit-any": "off",

      // Disable the rule that flags unused variables and imports
      "@typescript-eslint/no-unused-vars": "off",

      // Disable the rule that enforces escaping of unescaped entities in JSX
      "react/no-unescaped-entities": "off",

      // Disable the rule that enforces using Next.js's Image component over <img>
      "@next/next/no-img-element": "off",
    },
  },
];

export default eslintConfig;
