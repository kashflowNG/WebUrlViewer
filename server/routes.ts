import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Demo user for testing - normally would use auth
  const DEMO_USER_ID = 1;
  
  // Initialize demo user if not exists
  app.get('/api/init', async (req, res) => {
    try {
      let user = await storage.getUser(DEMO_USER_ID);
      if (!user) {
        // Try to find existing user by username first
        user = await storage.getUserByUsername('demo_user');
        if (!user) {
          // Only create if user doesn't exist at all
          user = await storage.createUser({
            username: 'demo_user',
            password: 'demo_password'
          });
        }
      }
      res.json({ success: true, user });
    } catch (error) {
      console.error('Error initializing demo user:', error);
      // If it's a duplicate key error, try to get the existing user
      if (error.code === '23505') {
        try {
          const existingUser = await storage.getUserByUsername('demo_user');
          if (existingUser) {
            res.json({ success: true, user: existingUser });
            return;
          }
        } catch (getError) {
          console.error('Error getting existing user:', getError);
        }
      }
      res.status(500).json({ error: 'Failed to initialize user' });
    }
  });

  // Get user stats and earnings
  app.get('/api/user/stats', async (req, res) => {
    try {
      const user = await storage.getUser(DEMO_USER_ID);
      const stats = await storage.getUserStats(DEMO_USER_ID);
      const earnings = await storage.getUserEarnings(DEMO_USER_ID);
      
      res.json({
        user,
        stats,
        earnings: earnings.slice(0, 10) // Latest 10 earnings
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
      res.status(500).json({ error: 'Failed to fetch stats' });
    }
  });

  // Record earnings when refresh happens
  app.post('/api/earnings/add', async (req, res) => {
    try {
      const { refreshInterval } = req.body;
      
      // Calculate earnings based on refresh interval
      const earningsMap: Record<number, string> = {
        15: "0.001000",    // $0.001 for 15s
        30: "0.003000",    // $0.003 for 30s
        60: "0.005000",    // $0.005 for 1m
        300: "0.010000"    // $0.01 for 5m
      };
      
      const amount = earningsMap[refreshInterval] || "0.000000";
      
      if (parseFloat(amount) > 0) {
        const earning = await storage.addEarnings({
          userId: DEMO_USER_ID,
          amount,
          refreshInterval
        });
        
        res.json({ success: true, earning });
      } else {
        res.status(400).json({ error: 'Invalid refresh interval' });
      }
    } catch (error) {
      console.error('Error adding earnings:', error);
      res.status(500).json({ error: 'Failed to add earnings' });
    }
  });

  // Update user stats
  app.post('/api/user/stats/update', async (req, res) => {
    try {
      const statsData = req.body;
      const updatedStats = await storage.createOrUpdateUserStats({
        userId: DEMO_USER_ID,
        ...statsData
      });
      
      res.json({ success: true, stats: updatedStats });
    } catch (error) {
      console.error('Error updating stats:', error);
      res.status(500).json({ error: 'Failed to update stats' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
