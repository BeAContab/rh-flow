import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { ensureDatabase } from "../lib/db";
import { adminExists, createUser, findUserByEmail, noUsersExist } from "../lib/users";

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

async function main() {
  // Carrega o .env.local explicitamente para o seed funcionar de forma previsível.
  loadEnvFile(".env.local");

  await ensureDatabase();

  const adminName = process.env.ADMIN_NAME;
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminName || !adminEmail || !adminPassword) {
    throw new Error("Preencha ADMIN_NAME, ADMIN_EMAIL e ADMIN_PASSWORD no .env.local.");
  }

  const emailInUse = await findUserByEmail(adminEmail);
  if (emailInUse) {
    throw new Error("Já existe um usuário com esse e-mail.");
  }

  const usersEmpty = await noUsersExist();
  const hasAdmin = await adminExists();

  if (!usersEmpty || hasAdmin) {
    throw new Error("O seed inicial só pode ser executado quando ainda não existir nenhum admin.");
  }

  await createUser({
    name: adminName,
    email: adminEmail,
    password: adminPassword,
    role: "admin",
  });

  console.log("Admin inicial criado com sucesso.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
