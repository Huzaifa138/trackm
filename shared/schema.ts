import { pgTable, text, serial, integer, timestamp, boolean, jsonb, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  department: text("department"),
  role: text("role").default("user"),
  avatarColor: text("avatar_color"),
  status: text("status").default("offline"),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  status: true,
});

// Activity records
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  duration: integer("duration").notNull(), // in seconds
  application: text("application").notNull(),
  website: text("website"),
  title: text("title"),
  category: text("category"), // productive, neutral, unproductive
  isActive: boolean("is_active").default(true),
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
});

// Applications tracking
export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  category: text("category").notNull(), // productive, neutral, unproductive
});

export const insertApplicationSchema = createInsertSchema(applications).omit({
  id: true,
});

// Websites tracking
export const websites = pgTable("websites", {
  id: serial("id").primaryKey(),
  url: text("url").notNull().unique(),
  category: text("category").notNull(), // productive, neutral, unproductive
});

export const insertWebsiteSchema = createInsertSchema(websites).omit({
  id: true,
});

// Daily summaries
export const dailySummaries = pgTable("daily_summaries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  date: timestamp("date").notNull(),
  activeTime: integer("active_time").notNull(), // in seconds
  productiveTime: integer("productive_time").notNull(), // in seconds
  neutralTime: integer("neutral_time").notNull(), // in seconds
  unproductiveTime: integer("unproductive_time").notNull(), // in seconds
  productivityScore: real("productivity_score").notNull(), // percentage
  topApplications: jsonb("top_applications"), // array of {name, time, category}
  topWebsites: jsonb("top_websites"), // array of {url, time, category}
});

export const insertDailySummarySchema = createInsertSchema(dailySummaries).omit({
  id: true,
});

// Team projects
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
});

// Type definitions
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;

export type Application = typeof applications.$inferSelect;
export type InsertApplication = z.infer<typeof insertApplicationSchema>;

export type Website = typeof websites.$inferSelect;
export type InsertWebsite = z.infer<typeof insertWebsiteSchema>;

export type DailySummary = typeof dailySummaries.$inferSelect;
export type InsertDailySummary = z.infer<typeof insertDailySummarySchema>;

export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
