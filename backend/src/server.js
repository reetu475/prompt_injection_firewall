import "./loadEnv.js";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { randomUUID } from "crypto";
import { createAuditStore } from "./stores/auditStore.js";
import { createVectorStore } from "./stores/vectorStore.js";
import { sanitizeInput, safeRewrite } from "./security/firewall.js";
import { evaluateRisk } from "./services/riskService.js";
import { runGuardedRag } from "./services/ragService.js";
import { notifyAutomation } from "./services/automationService.js";
import { traceEvaluation } from "./services/langsmithService.js";
import { toolCatalog } from "./toolCatalog.js";

const app = express();
const port = Number(process.env.PORT || 8080);
const auditStore = createAuditStore();
const vectorStore = createVectorStore();
const allowedOrigins = (process.env.FRONTEND_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim());
const isAllowedLocalDevOrigin = (origin) => {
  if (process.env.NODE_ENV === "production" || !origin) return false;

  try {
    const url = new URL(origin);
    return ["localhost", "127.0.0.1"].includes(url.hostname);
  } catch {
    return false;
  }
};

app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || isAllowedLocalDevOrigin(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Origin is not allowed by CORS"));
  }
}));
app.use(express.json({ limit: "2mb" }));

function publicDecision(decision) {
  const { matchedPatterns, ...safeDecision } = decision;
  return {
    ...safeDecision,
    patternCount: matchedPatterns.length
  };
}

async function logIfRisky(kind, payload, decision) {
  if (decision.riskScore < 40 && !decision.blocked) return null;

  const event = {
    id: randomUUID(),
    kind,
    createdAt: new Date().toISOString(),
    riskScore: decision.riskScore,
    severity: decision.severity,
    blocked: decision.blocked,
    categories: decision.categories,
    reasons: decision.reasons,
    sample: sanitizeInput(payload).slice(0, 300)
  };

  await auditStore.insert(event);
  await notifyAutomation(event);
  return event;
}

app.get("/api/health", (req, res) => {
  res.json({ ok: true, service: "prompt-injection-firewall", timestamp: new Date().toISOString() });
});

app.get("/api/tools", (req, res) => {
  res.json({ tools: toolCatalog });
});

app.post("/api/firewall/analyze", async (req, res) => {
  const { input = "", mode = "prompt" } = req.body;
  const decision = await evaluateRisk(input, mode);
  const sanitized = sanitizeInput(input);
  const rewritten = decision.blocked ? "" : safeRewrite(sanitized, decision);

  await logIfRisky(mode, input, decision);
  await traceEvaluation({ mode, decision });

  res.json({
    decision: publicDecision(decision),
    sanitized,
    rewritten
  });
});

app.post("/api/rag/query", async (req, res) => {
  const { question = "", collection = "default" } = req.body;
  const decision = await evaluateRisk(question, "prompt");
  const sanitized = sanitizeInput(question);

  await logIfRisky("rag-query", question, decision);
  await traceEvaluation({ mode: "rag-query", decision });

  if (decision.blocked || decision.riskScore > 80) {
    return res.status(403).json({
      blocked: true,
      decision: publicDecision(decision),
      answer: "Request rejected by the Prompt Injection Firewall."
    });
  }

  const rewritten = safeRewrite(sanitized, decision);
  const answer = await runGuardedRag({ question: rewritten, collection, vectorStore });

  res.json({
    blocked: false,
    decision: publicDecision(decision),
    sanitized,
    rewritten,
    answer
  });
});

app.post("/api/documents/ingest", async (req, res) => {
  const { title = "Untitled document", content = "", collection = "default" } = req.body;
  const decision = await evaluateRisk(content, "document");

  await logIfRisky("document", `${title}\n${content}`, decision);
  await traceEvaluation({ mode: "document", decision });

  if (decision.blocked || decision.severity === "critical" || decision.riskScore > 80) {
    return res.status(403).json({
      stored: false,
      decision: publicDecision(decision),
      message: "Unsafe document rejected before vector storage."
    });
  }

  const sanitized = sanitizeInput(content);
  const document = await vectorStore.upsert({
    id: randomUUID(),
    collection,
    title: sanitizeInput(title).slice(0, 120),
    content: sanitized,
    metadata: {
      riskScore: decision.riskScore,
      severity: decision.severity,
      ingestedAt: new Date().toISOString()
    }
  });

  res.json({
    stored: true,
    document,
    decision: publicDecision(decision)
  });
});

app.get("/api/logs", async (req, res) => {
  const logs = await auditStore.list();
  res.json({ logs });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(port, () => {
  console.log(`Prompt Injection Firewall API running on http://localhost:${port}`);
});
