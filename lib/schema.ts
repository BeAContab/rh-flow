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

export type UserRecord = typeof users.$inferSelect;
export type SubmissionRecord = typeof submissions.$inferSelect;
export type AttachmentRecord = typeof attachments.$inferSelect;
