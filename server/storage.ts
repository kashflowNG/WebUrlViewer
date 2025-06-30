import {
  users,
  earnings,
  userStats,
  type User,
  type InsertUser,
  type Earnings,
  type InsertEarnings,
  type UserStats,
  type InsertUserStats,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Earnings operations
  addEarnings(earnings: InsertEarnings): Promise<Earnings>;
  getUserEarnings(userId: number): Promise<Earnings[]>;
  updateUserTotalEarnings(userId: number, amount: string): Promise<void>;
  
  // User stats operations
  getUserStats(userId: number): Promise<UserStats | undefined>;
  createOrUpdateUserStats(userStats: Partial<InsertUserStats> & { userId: number }): Promise<UserStats>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        totalEarnings: "0.000000",
        createdAt: new Date(),
      })
      .returning();
    return user;
  }

  // Earnings operations
  async addEarnings(earningsData: InsertEarnings): Promise<Earnings> {
    const [earning] = await db
      .insert(earnings)
      .values(earningsData)
      .returning();
    
    // Update user's total earnings
    await this.updateUserTotalEarnings(earningsData.userId!, earningsData.amount);
    
    return earning;
  }

  async getUserEarnings(userId: number): Promise<Earnings[]> {
    return await db
      .select()
      .from(earnings)
      .where(eq(earnings.userId, userId))
      .orderBy(desc(earnings.earnedAt));
  }

  async updateUserTotalEarnings(userId: number, amount: string): Promise<void> {
    const user = await this.getUser(userId);
    if (user) {
      const currentTotal = parseFloat(user.totalEarnings || "0");
      const newAmount = parseFloat(amount);
      const newTotal = (currentTotal + newAmount).toFixed(6);
      
      await db
        .update(users)
        .set({ totalEarnings: newTotal })
        .where(eq(users.id, userId));
    }
  }

  // User stats operations
  async getUserStats(userId: number): Promise<UserStats | undefined> {
    const [stats] = await db
      .select()
      .from(userStats)
      .where(eq(userStats.userId, userId));
    return stats || undefined;
  }

  async createOrUpdateUserStats(statsData: Partial<InsertUserStats> & { userId: number }): Promise<UserStats> {
    const existingStats = await this.getUserStats(statsData.userId);
    
    if (existingStats) {
      const [updatedStats] = await db
        .update(userStats)
        .set({
          ...statsData,
          updatedAt: new Date(),
        })
        .where(eq(userStats.userId, statsData.userId))
        .returning();
      return updatedStats;
    } else {
      const [newStats] = await db
        .insert(userStats)
        .values({
          ...statsData,
          sessionStartTime: new Date(),
          updatedAt: new Date(),
        })
        .returning();
      return newStats;
    }
  }
}

export const storage = new DatabaseStorage();