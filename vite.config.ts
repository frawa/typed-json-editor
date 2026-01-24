/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  base: '',
  plugins: [react()],

  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8080/s/typed-json",
        changeOrigin: true,
      },
    },
  },

  test: {
    globals: true,
    environment: "jsdom",
    // ... Specify options here.
  },
});
