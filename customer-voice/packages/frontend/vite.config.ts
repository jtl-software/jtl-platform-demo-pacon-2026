import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

// https://vite.dev/config/
export default defineConfig({
  server: {
    port: 3004,
    // Vite delegates to the OS opener (`open`/`start`/`xdg-open`), which
    // reuses an existing tab on the dev URL when the browser supports it
    // (Chrome, Safari, Edge) instead of opening a new one.
    open: true,
    proxy: {
      "/api": {
        target: "http://localhost:3005",
        changeOrigin: true,
      },
    },
  },
  plugins: [tailwindcss(), react()],
  resolve: {
    alias: {
      "/assets": path.join(
        path.dirname(require.resolve("@jtl-software/platform-ui-react")),
        "assets",
      ),
    },
  },
});
