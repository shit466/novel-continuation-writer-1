import "dotenv/config";
import cors from "cors";
import express from "express";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { analyzeLocally } from "./analyzer.js";
import { createContinuation } from "./model.js";

const app = express();
app.use(cors());
app.use(express.json({ limit: "15mb" }));

app.get("/api/health", (_req, res) => res.json({ ok: true, modelConfigured: Boolean(process.env.LLM_API_KEY) }));

app.post("/api/analyze", (req, res) => {
  const text = String(req.body?.text ?? "");
  if (text.trim().length < 100) return res.status(400).json({ error: "正文至少需要 100 字" });
  res.json(analyzeLocally(text));
});

app.post("/api/continue", async (req, res) => {
  try {
    if (!req.body?.analysis) return res.status(400).json({ error: "请先分析小说" });
    res.json(await createContinuation(req.body.analysis, String(req.body.instruction ?? ""), Number(req.body.length ?? 1200)));
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "生成失败" });
  }
});

const distPath = resolve(process.cwd(), "dist");
if (existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get("/{*splat}", (_req, res) => res.sendFile(resolve(distPath, "index.html")));
}

const port = Number(process.env.PORT ?? 8787);
app.listen(port, () => console.log(`Novel continuation API: http://localhost:${port}`));
