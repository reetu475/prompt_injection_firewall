# Prompt Injection Firewall for RAG Applications

A full-stack security layer that validates user prompts and uploaded documents before they reach a Gemini-powered LangChain/LangGraph RAG workflow.

## What It Protects

- Prompt injection and jailbreak attempts
- Malicious uploaded documents
- Direct user-to-LLM access
- Critical-risk content entering the vector database
- Exposure of system prompts or API keys
- Missing audit logs for attack attempts

## Stack

- Frontend: React + Vite
- Backend: Node.js + Express
- Database: PostgreSQL or MongoDB adapter-ready audit logs
- Vector DB: ChromaDB, Pinecone, or Weaviate adapter-ready document indexing
- LLM: Gemini
- RAG: LangChain
- Agent workflow: LangGraph-style guarded state graph
- Automation: n8n webhook integration
- Evaluation: LangSmith tracing/evaluation hooks
- Deployment: Vercel frontend + Render/Railway/VPS backend

## Quick Start

```bash
npm install
npm run dev
```

Backend: `http://localhost:8090`

Frontend: `http://localhost:5174`

## API-Key Separation

Copy `.env.example` to `backend/.env` and use a different key for each use case:

- `GEMINI_API_KEY_FIREWALL`: classification, rewriting, and safe prompt transformation
- `GEMINI_API_KEY_RAG`: final RAG answer generation only after validation
- `LANGSMITH_API_KEY`: evaluation and trace logging
- `PINECONE_API_KEY` / `CHROMA_API_KEY` / `WEAVIATE_API_KEY`: vector database storage
- `N8N_WEBHOOK_URL`: automated incident response workflows

Never expose backend environment variables to the React app.

## Security Constraints Implemented

1. `/api/rag/query` always calls the firewall before the RAG chain.
2. Known injection patterns are blocked by deterministic rules.
3. Risk score above `80` is rejected.
4. Critical-risk documents are never stored in the vector database.
5. System prompts and API keys are only referenced server-side.
6. All attacks and high-risk attempts are logged for auditing.

## Important Notes

The project includes provider adapters with safe fallbacks so it can run without external keys for demos. Add real provider keys in `backend/.env` to enable Gemini, vector DB, LangSmith, and n8n integrations.
