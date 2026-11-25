import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

// Link previews (LinkedIn, WhatsApp, X…) need absolute URLs.
// The site address comes from VITE_SITE_URL, or from Vercel automatically.
function siteUrl(mode: string) {
  const env = loadEnv(mode, process.cwd(), "");
  const url =
    env.VITE_SITE_URL ||
    (env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${env.VERCEL_PROJECT_PRODUCTION_URL}` : "") ||
    "http://localhost:4321";
  return url.replace(/\/$/, "");
}

const injectSiteUrl = (url: string): Plugin => ({
  name: "inject-site-url",
  transformIndexHtml: (html) => html.replaceAll("__SITE_URL__", url),
});

export default defineConfig(({ mode }) => ({
  plugins: [react(), injectSiteUrl(siteUrl(mode))],
  server: { port: 5173 },
}));
