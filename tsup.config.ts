import { defineConfig } from "tsup";

// Two entries: the library (ESM+CJS+dts) and the CLI binary (CJS only with shebang).
export default defineConfig([
  {
    entry: ["src/index.ts"],
    format: ["esm", "cjs"],
    dts: true,
    sourcemap: true,
    clean: true,
    target: "es2022",
    splitting: false,
    treeshake: true,
    external: [/^@graniq\//, /^node:/],
  },
  {
    entry: { cli: "src/cli.ts" },
    format: ["cjs"],
    target: "es2022",
    sourcemap: false,
    splitting: false,
    treeshake: true,
    banner: { js: "#!/usr/bin/env node" },
    external: [/^@graniq\//, /^node:/],
  },
]);
