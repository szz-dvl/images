import globals from "globals";
// import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";


export default [
  {files: [ "src/**/*.ts", "test/**/*.ts" ], languageOptions: {sourceType: "module"}},
  {languageOptions: { globals: globals.node }},
  ...tseslint.configs.recommended,
];