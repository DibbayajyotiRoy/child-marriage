import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",           // accessible on all interfaces
    port: 8000,
    proxy: {
      // This rule handles all your main API calls
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
      // ✅ ADDED: A new rule specifically for the authentication endpoint
      "/auth": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
  plugins: [
    react(),
    // Only enable componentTagger in dev mode
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));