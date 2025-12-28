import { defineConfig } from "tsdown";
export default defineConfig({
  entry: ["src/cli.ts"],
  clean: false,
  format: "esm",
  inputOptions: {
    experimental: {
      resolveNewUrlToAsset: false,
    },
  },
});
