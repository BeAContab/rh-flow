import { lt } from "drizzle-orm";

import { ensureDatabase, getDb } from "../lib/db";
import { apiRateLimits, authRateLimits, securityEvents } from "../lib/schema";

async function main() {
  await ensureDatabase();
  const db = getDb();

  const now = Date.now();
  const staleRateLimitThreshold = new Date(now - 2 * 24 * 60 * 60 * 1000);
  const staleSecurityEventThreshold = new Date(now - 90 * 24 * 60 * 60 * 1000);

  await db.delete(authRateLimits).where(lt(authRateLimits.updatedAt, staleRateLimitThreshold));
  await db.delete(apiRateLimits).where(lt(apiRateLimits.updatedAt, staleRateLimitThreshold));
  await db.delete(securityEvents).where(lt(securityEvents.createdAt, staleSecurityEventThreshold));

  console.log("Limpeza de seguranca concluida com sucesso.");
}

main().catch((error) => {
  console.error("Falha ao limpar dados de seguranca:", error);
  process.exit(1);
});
