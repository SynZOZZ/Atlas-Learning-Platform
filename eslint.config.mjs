import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // Course imagery may come from client-managed providers that cannot be
    // enumerated in next.config before handover.
    rules: { "@next/next/no-img-element": "off" },
  },
  globalIgnores([".next/**", "dist/**", "data/**", "uploads/**"]),
]);
