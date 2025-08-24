import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/gemensam-ekonomi/",
  build: {
    outDir: "../../docs",
    emptyOutDir: true, // <— töm docs/ före varje build även om den ligger utanför projektroten
  },
});
