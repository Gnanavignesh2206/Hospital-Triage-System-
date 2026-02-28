import type { Express } from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

export async function serveStatic(app: Express) {
  // Serve static files from the dist directory when in production
  if (process.env.NODE_ENV === "production") {
    app.use(express.static(join(__dirname, "../dist/public")));
    app.use(express.static(join(__dirname, "../dist/client")));

    // SPA fallback
    app.get("*", (req, res) => {
      res.sendFile(join(__dirname, "../dist/client/index.html"));
    });
  }
}
