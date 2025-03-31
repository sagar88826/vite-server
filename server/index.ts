import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";

const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === "production";

const startServer = async () => {
  const app = express();

  if (isProd) {
    // Production: Serve static files from the dist/client directory
    const distPath = path.resolve(process.cwd(), "dist/client");
    app.use(express.static(distPath));

    // API Routes - Must be defined BEFORE the catch-all route
    app.use("/api", (_req, res) => {
      res.json({ message: "Hello from Express API!" });
    });

    // Serve index.html for client-side routing as a catch-all
    app.use("*", (_req, res) => {
      const indexHtml = path.resolve(distPath, "index.html");
      const content = fs.readFileSync(indexHtml, "utf-8");
      res.status(200).set({ "Content-Type": "text/html" }).send(content);
    });
  } else {
    // Development: Use Vite middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });

    // API Routes - Define BEFORE Vite middleware to ensure they take precedence
    app.use("/api", (_req, res) => {
      res.json({ message: "Hello from Express API!" });
    });

    // Use Vite's middleware to serve frontend in development
    app.use(vite.middlewares);

    // Serve index.html for non-API routes as a catch-all
    app.use("*", async (req, res, next) => {
      try {
        const url = req.originalUrl;
        const indexPath = path.resolve(process.cwd(), "index.html");
        let template = fs.readFileSync(indexPath, "utf-8");
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ "Content-Type": "text/html" }).send(template);
      } catch (err) {
        next(err);
      }
    });
  }

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT} in ${isProd ? "production" : "development"} mode`);
  });
};

startServer();
