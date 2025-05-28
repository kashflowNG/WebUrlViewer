import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from "ws";
import { storage } from "./storage";
import { addWebSocketClient } from "./telegram-bot";

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  const httpServer = createServer(app);
  
  // Set up WebSocket server for real-time communication between Telegram bot and web view
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws) => {
    console.log('📱 Web client connected to WebSocket');
    addWebSocketClient(ws);
  });
  
  console.log('🔗 WebSocket server ready for Telegram bot communication');

  return httpServer;
}
