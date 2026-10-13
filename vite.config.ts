import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import webExtension from "vite-plugin-web-extension";

export default defineConfig(({ command }) => ({
  build: { outDir: "dist" },
  plugins: [
    react(),
    ...(command === "build" ? [webExtension({ manifest: "src/extension/manifest.json" })] : [])
  ]
}));
