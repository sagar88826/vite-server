// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist/client",
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./"),
    },
  },
  root: "./",
});
