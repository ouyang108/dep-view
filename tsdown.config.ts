import { defineConfig } from "tsdown";
export default defineConfig({
  entry: ["src/cli.ts"],
  clean: true,
  format: "esm",
  inputOptions: {
    experimental: {
      resolveNewUrlToAsset: false,
    },
  },
});
