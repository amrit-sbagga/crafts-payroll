import next from "eslint-config-next";
import prettier from "eslint-config-prettier";

export default [
  ...next,
  prettier,
  {
    rules: {
      "no-console": ["error", { "allow": ["warn", "error"] }]
    }
  }
];
