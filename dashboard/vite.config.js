import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/login": "http://localhost:8000",
      "/users": "http://localhost:8000",
      "/alerts": "http://localhost:8000",
      "/mapping": "http://localhost:8000",
      // Add other API endpoints as needed
    }
  }
});
