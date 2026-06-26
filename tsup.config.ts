import { defineConfig } from "tsup";

// Two entries: the library (ESM+CJS+dts) and the CLI binary (CJS with shebang).
// We bundle @graniq/* workspace deps into dist so the published tarball is fully
// self-contained (no broken `file:` resolutions when users `npm i @graniq/mcp`).
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
    noExternal: [/^@graniq\//],
    external: [/^node:/],
  },
  {
    entry: { cli: "src/cli.ts" },
    format: ["cjs"],
    target: "es2022",
    sourcemap: false,
    splitting: false,
    treeshake: true,
    banner: { js: "#!/usr/bin/env node" },
    noExternal: [/^@graniq\//],
    external: [/^node:/],
  },
]);
