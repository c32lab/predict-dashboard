import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 18828;

const raw = process.env.PREDICT_API_UPSTREAM || "localhost:18801";
const upstream = raw.startsWith("http") ? raw : `http://${raw}`;

const app = express();

// Proxy /api/ to predict backend
app.use(
  "/api",
  createProxyMiddleware({
    target: upstream,
    changeOrigin: true,
  }),
);

// Serve built static files
const distDir = path.join(__dirname, "dist");
app.use(express.static(distDir));

// SPA fallback — serve index.html for any non-file route
app.get("*", (_req, res) => {
  res.sendFile(path.join(distDir, "index.html"));
});

app.listen(PORT, () => {
  console.log(`predict-dashboard listening on :${PORT}`);
  console.log(`API proxy -> ${upstream}`);
});
