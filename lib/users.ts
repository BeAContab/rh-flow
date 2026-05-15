import { compare, hash } from "bcryptjs";
import { desc, eq, inArray } from "drizzle-orm";

import { ensureDatabase, getDb } from "@/lib/db";
import type { AppRole } from "@/lib/roles";
import { users } from "@/lib/schema";

export type CreateUserInput = {
  name: string;
  email: string;
  password: string;
  role?: AppRole;
  createdByUserId?: string;
};

export async function hashPassword(password: string) {
  return hash(password, 10);
}

export async function createUser(input: CreateUserInput) {
  await ensureDatabase();
  const db = getDb();

  const normalizedEmail = input.email.trim().toLowerCase();
  const existing = await findUserByEmail(normalizedEmail);
  if (existing) {
    throw new Error("Ja existe um usuario com esse e-mail.");
  }

  const now = new Date();
  const passwordHash = await hashPassword(input.password);

  const createdUser = {
    id: crypto.randomUUID(),
    name: input.name.trim(),
    email: normalizedEmail,
    passwordHash,
    role: input.role || "user",
    status: "approved",
    createdByUserId: input.createdByUserId,
    createdAt: now,
    updatedAt: now,
  };

  await db.insert(users).values(createdUser);

  return createdUser;
}

export async function findUserByEmail(email: string) {
  await ensureDatabase();
  const db = getDb();

  const result = await db
    .select()
    .from(users)
    .where(eq(users.email, email.trim().toLowerCase()))
    .limit(1);

  return result[0] ?? null;
}

export async function validateUserCredentials(email: string, password: string) {
  const user = await findUserByEmail(email);
  if (!user) {
    return null;
  }

  const valid = await compare(password, user.passwordHash);
  if (!valid) {
    return null;
  }

  if (user.status !== "approved") {
    throw new Error("Seu acesso ainda nao esta liberado.");
  }

  return user;
}

export async function listUsers() {
  await ensureDatabase();
  const db = getDb();

  return db.select().from(users).orderBy(desc(users.createdAt));
}

export async function listNotifiableUsers() {
  await ensureDatabase();
  const db = getDb();

  return db
    .select()
    .from(users)
    .where(inArray(users.role, ["admin", "super_user"]));
}

export async function findUserById(id: string) {
  await ensureDatabase();
  const db = getDb();

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0] ?? null;
}

export async function deleteUser(id: string) {
  await ensureDatabase();
  const db = getDb();

  const targetUser = await findUserById(id);
  if (!targetUser) {
    return null;
  }

  await db.delete(users).where(eq(users.id, id));
  return targetUser;
}

export async function adminExists() {
  await ensureDatabase();
  const db = getDb();

  const result = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.role, "admin"))
    .limit(1);

  return result.length > 0;
}

export async function noUsersExist() {
  await ensureDatabase();
  const db = getDb();

  const result = await db.select({ id: users.id }).from(users).limit(1);
  return result.length === 0;
}
