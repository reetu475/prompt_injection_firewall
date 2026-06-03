export const toolCatalog = [
  {
    name: "Prompt Injection Firewall",
    layer: "Security",
    key: "GROQ_API_KEY",
    purpose: "Classifies prompt and document risk before anything reaches the RAG LLM.",
    status: "Implemented"
  },
  {
    name: "Groq RAG LLM",
    layer: "LLM",
    key: "GROQ_API_KEY",
    purpose: "Generates final answers using Groq only after validation, sanitization, and safe rewriting.",
    status: "Adapter implemented"
  },
  {
    name: "LangChain",
    layer: "RAG Framework",
    key: "Uses Groq and vector DB keys",
    purpose: "Retrieval-augmented generation orchestration boundary.",
    status: "Service boundary implemented"
  },
  {
    name: "LangGraph",
    layer: "Agent Framework",
    key: "Uses backend-only keys",
    purpose: "Guarded state flow: validate, retrieve, generate, log.",
    status: "Graph pattern represented in service flow"
  },
  {
    name: "PostgreSQL / MongoDB",
    layer: "Database",
    key: "DATABASE_URL or MONGODB_URI",
    purpose: "Stores attack attempts and audit events.",
    status: "Adapters implemented"
  },
  {
    name: "ChromaDB / Pinecone / Weaviate",
    layer: "Vector DB",
    key: "CHROMA_API_KEY, PINECONE_API_KEY, or WEAVIATE_API_KEY",
    purpose: "Stores only documents that pass document-level firewall checks.",
    status: "Adapter boundary implemented"
  },
  {
    name: "n8n",
    layer: "Automation",
    key: "N8N_WEBHOOK_URL",
    purpose: "Receives high-risk incident webhooks for alerts or ticket creation.",
    status: "Webhook implemented"
  },
  {
    name: "LangSmith",
    layer: "Evaluation",
    key: "LANGSMITH_API_KEY",
    purpose: "Evaluation and tracing hook for firewall quality and RAG safety.",
    status: "Trace hook implemented"
  },
  {
    name: "Risk Assessment Engine",
    layer: "Security",
    key: "GROQ_API_KEY",
    purpose: "Use Groq to classify risk score, severity, and block decisions for prompts and documents.",
    status: "LLM-based scoring implemented"
  },
  {
    name: "Vercel + Render/Railway/VPS",
    layer: "Deployment",
    key: "Platform environment variables",
    purpose: "Frontend deploys separately from backend to keep secrets server-side.",
    status: "Documented"
  }
];
