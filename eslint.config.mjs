import { defineConfig } from "eslint/config";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

export default defineConfig([
  { extends: [...nextCoreWebVitals] },
  {
    // Regras do React Compiler (eslint-config-next 16) acusam padrões antigos
    // do dashboard. O compilador não está ligado; ficam como aviso até a
    // refatoração dessas telas.
    rules: {
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/purity": "warn",
      "react-hooks/immutability": "warn",
    },
  },
]);
