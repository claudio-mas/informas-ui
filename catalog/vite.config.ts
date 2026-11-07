import { fileURLToPath } from "node:url"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "vite"

import { themeScript } from "../registry/informas/lib/theme-mode.ts"
import { CHAVE_DO_TEMA } from "./chave.ts"

export default defineConfig({
  root: fileURLToPath(new URL(".", import.meta.url)),
  plugins: [
    tailwindcss(),
    {
      // Como num app real: o tema é aplicado por um script inline antes da primeira pintura.
      name: "tema-inicial",
      transformIndexHtml: () => [{ tag: "script", children: themeScript(CHAVE_DO_TEMA), injectTo: "head-prepend" }],
    },
  ],
  resolve: { alias: { "@/registry": fileURLToPath(new URL("../registry", import.meta.url)) } },
  server: { host: "127.0.0.1" },
})
