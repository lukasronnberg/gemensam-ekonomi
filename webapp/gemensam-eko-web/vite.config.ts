import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Byt "/gemensam-ekonomi/" till exakt ditt repo-namn om det skiljer sig.
export default defineConfig({
  plugins: [react()],
  base: "/gemensam-ekonomi/",
  build: { outDir: "../../docs" }, // skriv bygget till repo-rotens docs/
});
