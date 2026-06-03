export async function traceEvaluation(payload) {
  if (!process.env.LANGSMITH_API_KEY) return { traced: false };

  // Placeholder for LangSmith SDK tracing. Kept isolated so real tracing can be enabled
  // without letting user content bypass the firewall path.
  return {
    traced: true,
    project: process.env.LANGSMITH_PROJECT || "prompt-injection-firewall",
    riskScore: payload.decision?.riskScore
  };
}
