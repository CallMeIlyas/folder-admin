import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [react()],
  base: "/",
  server: {
    host: true,
  },
  assetsInclude: [
    "**/*.png",
    "**/*.jpg",
    "**/*.jpeg", 
    "**/*.gif",
    "**/*.mp4",
    "**/*.svg",
    "**/*.ttf",
    "**/*.woff",
    "**/*.woff2",
  ],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
});