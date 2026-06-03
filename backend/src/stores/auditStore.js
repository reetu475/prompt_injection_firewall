import { MongoClient } from "mongodb";
import pg from "pg";

const memoryLogs = [];

function memoryStore() {
  return {
    async insert(event) {
      memoryLogs.unshift(event);
      return event;
    },
    async list() {
      return memoryLogs.slice(0, 100);
    }
  };
}

function postgresStore() {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  return {
    async insert(event) {
      await pool.query(
        "insert into attack_logs(id, kind, created_at, risk_score, severity, blocked, categories, reasons, sample) values($1,$2,$3,$4,$5,$6,$7,$8,$9)",
        [event.id, event.kind, event.createdAt, event.riskScore, event.severity, event.blocked, event.categories, event.reasons, event.sample]
      );
      return event;
    },
    async list() {
      const result = await pool.query("select * from attack_logs order by created_at desc limit 100");
      return result.rows;
    }
  };
}

function mongoStore() {
  const client = new MongoClient(process.env.MONGODB_URI);
  const collection = client.db(process.env.MONGODB_DB || "prompt_firewall").collection("attack_logs");
  return {
    async insert(event) {
      await client.connect();
      await collection.insertOne(event);
      return event;
    },
    async list() {
      await client.connect();
      return collection.find({}).sort({ createdAt: -1 }).limit(100).toArray();
    }
  };
}

export function createAuditStore() {
  if (process.env.DATABASE_PROVIDER === "postgres") return postgresStore();
  if (process.env.DATABASE_PROVIDER === "mongo") return mongoStore();
  return memoryStore();
}
