import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import importPlugin from "eslint-plugin-import";
import tailwindcssPlugin from "eslint-plugin-tailwindcss";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript", "prettier"),
  {
    plugins: {
      import: importPlugin,
      tailwindcss: tailwindcssPlugin,
    },
    rules: {
      "import/order": [
        "error",
        { groups: ["builtin", "external", "internal"] },
      ],
      "tailwindcss/no-custom-classname": "off",
    },
  },
];

export default eslintConfig;
