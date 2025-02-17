import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript", "prettier"),
  {
    plugins: {
      import: require("eslint-plugin-import"),
      tailwindcss: require("eslint-plugin-tailwindcss"),
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
