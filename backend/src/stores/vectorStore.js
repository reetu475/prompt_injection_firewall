import { ChromaClient, CloudClient } from "chromadb";

const memoryDocuments = [];

function scoreText(query, content) {
  const terms = new Set(String(query).toLowerCase().split(/\W+/).filter(Boolean));
  return String(content)
    .toLowerCase()
    .split(/\W+/)
    .filter((term) => terms.has(term)).length;
}

function memoryVectorStore() {
  return {
    async upsert(document) {
      memoryDocuments.push(document);
      return { id: document.id, title: document.title, collection: document.collection };
    },
    async search({ collection, query, limit = 4 }) {
      return memoryDocuments
        .filter((doc) => doc.collection === collection)
        .map((doc) => ({ ...doc, score: scoreText(query, doc.content) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
    }
  };
}

function chromaVectorStore() {
  const isCloud = (process.env.CHROMA_HOST || "").includes("trychroma.com") || process.env.CHROMA_API_KEY;
  const client = isCloud
    ? new CloudClient({
        cloud_host: process.env.CHROMA_HOST || "api.trychroma.com",
        api_key: process.env.CHROMA_API_KEY,
        tenant: process.env.CHROMA_TENANT || "default_tenant",
        database: process.env.CHROMA_DATABASE || "default_database"
      })
    : new ChromaClient({
        path: process.env.CHROMA_HOST || "http://localhost:8000"
      });

  return {
    async upsert(document) {
      const collection = await client.getOrCreateCollection({
        name: document.collection || "default"
      });
      await collection.upsert({
        ids: [document.id],
        documents: [document.content],
        metadatas: [{
          title: document.title || "Untitled",
          ...(document.metadata || {})
        }]
      });
      return { id: document.id, title: document.title, collection: document.collection };
    },
    async search({ collection: collectionName, query, limit = 4 }) {
      try {
        const collection = await client.getOrCreateCollection({
          name: collectionName || "default"
        });
        const response = await collection.query({
          queryTexts: [query],
          nResults: limit
        });

        const results = [];
        if (response.ids && response.ids[0]) {
          for (let i = 0; i < response.ids[0].length; i++) {
            results.push({
              id: response.ids[0][i],
              title: response.metadatas[0]?.[i]?.title || "Untitled",
              content: response.documents[0]?.[i] || "",
              metadata: response.metadatas[0]?.[i] || {},
              score: response.distances ? response.distances[0][i] : 0
            });
          }
        }
        return results;
      } catch (err) {
        console.error("Chroma search failed:", err);
        return [];
      }
    }
  };
}

export function createVectorStore() {
  const provider = process.env.VECTOR_PROVIDER || "memory";
  if (provider === "chroma") {
    return chromaVectorStore();
  }
  return memoryVectorStore();
}
