import prettier from "eslint-plugin-prettier";
import reactApp from "eslint-config-react-app";

export default [
  reactApp,
  {
    plugins: {
      prettier,
    },
    rules: {
      "prettier/prettier": "error",
    },
  },
];
