import { pgTable, text, serial, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  totalEarnings: decimal("total_earnings", { precision: 10, scale: 6 }).default("0.000000"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const earnings = pgTable("earnings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  amount: decimal("amount", { precision: 10, scale: 6 }).notNull(),
  refreshInterval: integer("refresh_interval").notNull(), // 15, 30, 60, 300 seconds
  earnedAt: timestamp("earned_at").defaultNow(),
});

export const userStats = pgTable("user_stats", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).unique(),
  currentUrl: text("current_url"),
  refreshCount: integer("refresh_count").default(0),
  scrollCount: integer("scroll_count").default(0),
  autoScrollEnabled: boolean("auto_scroll_enabled").default(false),
  autoRefreshEnabled: boolean("auto_refresh_enabled").default(false),
  refreshInterval: integer("refresh_interval").default(30),
  lastRefresh: timestamp("last_refresh"),
  lastScroll: timestamp("last_scroll"),
  isActive: boolean("is_active").default(false),
  sessionStartTime: timestamp("session_start_time").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertEarningsSchema = createInsertSchema(earnings).pick({
  userId: true,
  amount: true,
  refreshInterval: true,
});

export const insertUserStatsSchema = createInsertSchema(userStats).pick({
  userId: true,
  currentUrl: true,
  refreshCount: true,
  scrollCount: true,
  autoScrollEnabled: true,
  autoRefreshEnabled: true,
  refreshInterval: true,
  lastRefresh: true,
  lastScroll: true,
  isActive: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertEarnings = z.infer<typeof insertEarningsSchema>;
export type Earnings = typeof earnings.$inferSelect;
export type InsertUserStats = z.infer<typeof insertUserStatsSchema>;
export type UserStats = typeof userStats.$inferSelect;
