import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("react") || id.includes("react-dom")) {
              return "react-vendor";
            }
            if (id.includes("handsontable")) {
              return "handsontable";
            }
            if (id.includes("framer-motion")) {
              return "framer-motion";
            }
            if (id.includes("moment") || id.includes("numbro")) {
              return "date-utils";
            }
            // default: split setiap package
            return id
              .toString()
              .split("node_modules/")[1]
              .split("/")[0]
              .toString();
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000, // kB, supaya warning tidak muncul untuk chunk besar tapi masih wajar
  },
});
