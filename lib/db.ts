import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { createClient, type Client } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

let client: Client | null = null;
let db: ReturnType<typeof drizzle> | null = null;
let initialized = false;
let envLoaded = false;

function loadEnvFile(fileName: string) {
  const filePath = resolve(process.cwd(), fileName);
  if (!existsSync(filePath)) {
    return;
  }

  const content = readFileSync(filePath, "utf-8");
  const lines = content.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) {
      continue;
    }

    const [rawKey, ...rawValueParts] = trimmed.split("=");
    const key = rawKey.trim();
    const value = rawValueParts.join("=").trim();

    if (!key || process.env[key]) {
      continue;
    }

    process.env[key] = value;
  }
}

function ensureEnvLoaded() {
  if (envLoaded) {
    return;
  }

  loadEnvFile(".env.local");
  envLoaded = true;
}

function getDatabaseUrl() {
  ensureEnvLoaded();
  return process.env.TURSO_DATABASE_URL || "file:local.db";
}

function getClient() {
  ensureEnvLoaded();

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
  ensureEnvLoaded();
  return Boolean(process.env.TURSO_DATABASE_URL);
}
