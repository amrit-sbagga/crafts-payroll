import next from "eslint-config-next";
import prettier from "eslint-config-prettier";

const config = [
  ...next,
  prettier,
  {
    ignores: ["coverage/**", ".next/**"]
  },
  {
    rules: {
      "no-console": ["error", { "allow": ["warn", "error", "log", "info"] }],
      "react-hooks/set-state-in-effect": "off",
      "import/no-anonymous-default-export": "off"
    }
  }
];

export default config;
