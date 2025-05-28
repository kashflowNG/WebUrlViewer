import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const botStats = pgTable("bot_stats", {
  id: serial("id").primaryKey(),
  currentUrl: text("current_url"),
  refreshCount: integer("refresh_count").default(0),
  scrollCount: integer("scroll_count").default(0),
  autoScrollEnabled: boolean("auto_scroll_enabled").default(false),
  autoRefreshEnabled: boolean("auto_refresh_enabled").default(false),
  refreshInterval: integer("refresh_interval").default(30),
  lastRefresh: timestamp("last_refresh"),
  lastScroll: timestamp("last_scroll"),
  isActive: boolean("is_active").default(false),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertBotStatsSchema = createInsertSchema(botStats).pick({
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
export type InsertBotStats = z.infer<typeof insertBotStatsSchema>;
export type BotStats = typeof botStats.$inferSelect;
