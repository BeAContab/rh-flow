import { createClient, type Client } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

let client: Client | null = null;
let db: ReturnType<typeof drizzle> | null = null;
let initialized = false;

function getDatabaseUrl() {
  return process.env.TURSO_DATABASE_URL || "file:local.db";
}

function getClient() {
  if (!client) {
    client = createClient({
      url: getDatabaseUrl(),
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }

  return client;
}

export function getDb() {
  if (!db) {
    db = drizzle(getClient());
  }

  return db;
}

export async function ensureDatabase() {
  if (initialized) {
    return;
  }

  const currentClient = getClient();

  await currentClient.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      status TEXT NOT NULL DEFAULT 'approved',
      created_by_user_id TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )
  `);

  await currentClient.execute(`
    CREATE TABLE IF NOT EXISTS submissions (
      id TEXT PRIMARY KEY NOT NULL,
      flow_type TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'draft',
      employer_name TEXT,
      employee_name TEXT,
      employee_document TEXT,
      created_by_user_id TEXT,
      created_by_user_name TEXT,
      created_by_user_email TEXT,
      payload TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )
  `);

  await currentClient.execute(`
    CREATE TABLE IF NOT EXISTS attachments (
      id TEXT PRIMARY KEY NOT NULL,
      submission_id TEXT NOT NULL,
      file_name TEXT NOT NULL,
      blob_url TEXT NOT NULL,
      blob_pathname TEXT NOT NULL,
      content_type TEXT NOT NULL,
      size INTEGER NOT NULL,
      uploaded_by_user_id TEXT,
      created_at INTEGER NOT NULL
    )
  `);

  await currentClient.execute(`
    CREATE TABLE IF NOT EXISTS user_audit_logs (
      id TEXT PRIMARY KEY NOT NULL,
      action TEXT NOT NULL,
      actor_user_id TEXT NOT NULL,
      actor_name TEXT NOT NULL,
      actor_email TEXT NOT NULL,
      actor_role TEXT NOT NULL,
      target_user_id TEXT NOT NULL,
      target_name TEXT NOT NULL,
      target_email TEXT NOT NULL,
      target_role TEXT NOT NULL,
      created_at INTEGER NOT NULL
    )
  `);

  await currentClient.execute(`
    CREATE TABLE IF NOT EXISTS auth_rate_limits (
      key TEXT PRIMARY KEY NOT NULL,
      failed_count INTEGER NOT NULL DEFAULT 0,
      first_failed_at INTEGER,
      last_failed_at INTEGER,
      blocked_until INTEGER,
      updated_at INTEGER NOT NULL
    )
  `);

  await currentClient.execute(`
    CREATE TABLE IF NOT EXISTS api_rate_limits (
      key TEXT PRIMARY KEY NOT NULL,
      hit_count INTEGER NOT NULL DEFAULT 0,
      window_started_at INTEGER,
      blocked_until INTEGER,
      updated_at INTEGER NOT NULL
    )
  `);

  await currentClient.execute(`
    CREATE TABLE IF NOT EXISTS security_events (
      id TEXT PRIMARY KEY NOT NULL,
      event_type TEXT NOT NULL,
      actor_user_id TEXT,
      actor_email TEXT,
      actor_role TEXT,
      ip_address TEXT,
      target_key TEXT,
      details TEXT,
      created_at INTEGER NOT NULL
    )
  `);

  await addColumnIfMissing("submissions", "created_by_user_id", "TEXT");
  await addColumnIfMissing("submissions", "created_by_user_name", "TEXT");
  await addColumnIfMissing("submissions", "created_by_user_email", "TEXT");

  initialized = true;
}

async function addColumnIfMissing(tableName: string, columnName: string, definition: string) {
  try {
    await getClient().execute(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`);
  } catch {
    // Column probably already exists.
  }
}

export function isUsingTurso() {
  return Boolean(process.env.TURSO_DATABASE_URL);
}
