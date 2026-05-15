import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("user"),
  status: text("status").notNull().default("approved"),
  createdByUserId: text("created_by_user_id"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
});

export const submissions = sqliteTable("submissions", {
  id: text("id").primaryKey(),
  flowType: text("flow_type").notNull(),
  status: text("status").notNull().default("draft"),
  employerName: text("employer_name"),
  employeeName: text("employee_name"),
  employeeDocument: text("employee_document"),
  createdByUserId: text("created_by_user_id"),
  createdByUserName: text("created_by_user_name"),
  createdByUserEmail: text("created_by_user_email"),
  payload: text("payload", { mode: "json" }).$type<Record<string, unknown>>().notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
});

export const attachments = sqliteTable("attachments", {
  id: text("id").primaryKey(),
  submissionId: text("submission_id").notNull(),
  fileName: text("file_name").notNull(),
  blobUrl: text("blob_url").notNull(),
  blobPathname: text("blob_pathname").notNull(),
  contentType: text("content_type").notNull(),
  size: integer("size").notNull(),
  uploadedByUserId: text("uploaded_by_user_id"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
});

export const userAuditLogs = sqliteTable("user_audit_logs", {
  id: text("id").primaryKey(),
  action: text("action").notNull(),
  actorUserId: text("actor_user_id").notNull(),
  actorName: text("actor_name").notNull(),
  actorEmail: text("actor_email").notNull(),
  actorRole: text("actor_role").notNull(),
  targetUserId: text("target_user_id").notNull(),
  targetName: text("target_name").notNull(),
  targetEmail: text("target_email").notNull(),
  targetRole: text("target_role").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
});

export const authRateLimits = sqliteTable("auth_rate_limits", {
  key: text("key").primaryKey(),
  failedCount: integer("failed_count").notNull().default(0),
  firstFailedAt: integer("first_failed_at", { mode: "timestamp_ms" }),
  lastFailedAt: integer("last_failed_at", { mode: "timestamp_ms" }),
  blockedUntil: integer("blocked_until", { mode: "timestamp_ms" }),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
});

export const apiRateLimits = sqliteTable("api_rate_limits", {
  key: text("key").primaryKey(),
  hitCount: integer("hit_count").notNull().default(0),
  windowStartedAt: integer("window_started_at", { mode: "timestamp_ms" }),
  blockedUntil: integer("blocked_until", { mode: "timestamp_ms" }),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
});

export const securityEvents = sqliteTable("security_events", {
  id: text("id").primaryKey(),
  eventType: text("event_type").notNull(),
  actorUserId: text("actor_user_id"),
  actorEmail: text("actor_email"),
  actorRole: text("actor_role"),
  ipAddress: text("ip_address"),
  targetKey: text("target_key"),
  details: text("details", { mode: "json" }).$type<Record<string, unknown> | null>(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
});

export type UserRecord = typeof users.$inferSelect;
export type SubmissionRecord = typeof submissions.$inferSelect;
export type AttachmentRecord = typeof attachments.$inferSelect;
export type UserAuditLogRecord = typeof userAuditLogs.$inferSelect;
export type AuthRateLimitRecord = typeof authRateLimits.$inferSelect;
export type ApiRateLimitRecord = typeof apiRateLimits.$inferSelect;
export type SecurityEventRecord = typeof securityEvents.$inferSelect;
