import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },

  optimizeDeps: {
    include: ["react", "react-dom", "scheduler", "use-sync-external-store"],
  },

  build: {
    chunkSizeWarningLimit: 1000,

    rollupOptions: {
      output: {
        /**
         * 🎯 BEST CHUNK STRATEGY
         *
         * - React core disatukan → mencegah crash
         * - Handsontable terpisah → 1MB
         * - Framer Motion terpisah → animasi
         * - Date utils terpisah → moment & numbro
         * - Recharts terpisah → grafik besar
         * - Sisanya: vendor
         */
        manualChunks(id) {
          if (!id.includes("node_modules")) return;

          // 🧠 React Core → wajib satu chunk
          if (
            /node_modules\/(react|react-dom|scheduler|use-sync-external-store)\//.test(
              id
            )
          ) {
            return "react-core";
          }

          // 🔥 Handsontable → besar (900KB+)
          if (id.includes("handsontable")) return "handsontable";

          // 🎨 Framer Motion
          if (id.includes("framer-motion")) return "framer-motion";

          // 📅 Date libs
          if (id.includes("moment") || id.includes("numbro")) {
            return "date-utils";
          }

          // 📊 Recharts (cukup besar)
          if (id.includes("recharts")) {
            return "recharts";
          }

          // 🌐 React Router
          if (id.includes("react-router")) {
            return "router";
          }

          // 🧰 classnames, clsx & small utils
          if (id.includes("clsx") || id.includes("classnames")) {
            return "utils";
          }

          // 📦 fallback chunks → vendor
          return "vendor";
        },
      },
    },
  },
});
