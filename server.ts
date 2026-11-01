import express from "express";
import path from "node:path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import apiApp from "./api/index";

dotenv.config();

async function startServer() {
  const app = express();
  const port = Number(process.env.PORT || 3000);

  // Keep the local API contract aligned with the Vercel serverless entry point.
  app.use(apiApp);

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(port, "0.0.0.0", () => {
    console.log(`Self-Modifying Software Studio listening on port ${port}`);
  });
}

startServer().catch((error) => {
  console.error("Unable to start Self-Modifying Software Studio:", error);
  process.exitCode = 1;
});
