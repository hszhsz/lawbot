import { defineConfig } from "tsup";

export default defineConfig({
  entry: { cli: "src/index.ts" },
  format: ["esm"],
  dts: false,
  splitting: false,
  sourcemap: true,
  clean: true,
  target: "node22",
  banner: {
    js: "#!/usr/bin/env node",
  },
  outExtension({ format }) {
    return {
      js: ".js",
    };
  },
});
