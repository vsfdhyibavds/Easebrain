/* eslint-env node */
/* global process */
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

import path from "path";
import { fileURLToPath } from 'url';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env and allow VITE_BASE_URL to override proxy target
  const env = loadEnv(mode, process.cwd(), "");
  // VITE_BASE_URL may include a trailing `/api` — strip it for proxy target
  const rawBase = env.VITE_BASE_URL || "http://www.easebrain.live/api";
  const apiTarget = rawBase.replace(/\/api\/?$/, "");
  // Provide __dirname equivalent for ESM
  const __dirname = path.dirname(fileURLToPath(import.meta.url));

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      hmr: {
        host: "127.0.0.1",
        port: 5173,
        protocol: "ws",
      },
      proxy: {
        // Proxy all /api requests to the backend
        "/api": {
          target: "http://www.easebrain.live",
          changeOrigin: true,
          secure: false,
        },
        // Proxy all /community requests to the backend
        "^/community": {
          target: "http://www.easebrain.live",
          changeOrigin: true,
          rewrite: (path) => path,
        },
      },
      historyApiFallback: true,
    },
  };
});
