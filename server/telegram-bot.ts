import TelegramBot from 'node-telegram-bot-api';
import { db } from './db';
import { botStats } from '@shared/schema';
import { eq } from 'drizzle-orm';

// Bot credentials
const BOT_TOKEN = '7890871059:AAHlDEkfJxsq1bKwqthUBiI1f5dqu8IFavM';
const CHAT_ID = '6360165707';

// Bot state
interface BotState {
  autoScroll: boolean;
  autoRefresh: boolean;
  refreshInterval: number;
  currentUrl: string;
  isActive: boolean;
}

let botState: BotState = {
  autoScroll: false,
  autoRefresh: false,
  refreshInterval: 30,
  currentUrl: '',
  isActive: false
};

let scrollInterval: NodeJS.Timeout | null = null;
let refreshInterval: NodeJS.Timeout | null = null;

// Database functions
async function getOrCreateStats() {
  const [stats] = await db.select().from(botStats).limit(1);
  if (!stats) {
    const [newStats] = await db.insert(botStats).values({
      refreshCount: 0,
      scrollCount: 0,
      autoScrollEnabled: false,
      autoRefreshEnabled: false,
      refreshInterval: 30,
      isActive: false
    }).returning();
    return newStats;
  }
  return stats;
}

async function updateStats(updates: Partial<typeof botStats.$inferInsert>) {
  const stats = await getOrCreateStats();
  const [updatedStats] = await db.update(botStats)
    .set({ ...updates, lastRefresh: updates.refreshCount ? new Date() : stats.lastRefresh })
    .where(eq(botStats.id, stats.id))
    .returning();
  return updatedStats;
}

async function incrementRefreshCount() {
  const stats = await getOrCreateStats();
  await db.update(botStats)
    .set({ 
      refreshCount: (stats.refreshCount || 0) + 1,
      lastRefresh: new Date()
    })
    .where(eq(botStats.id, stats.id));
}

async function incrementScrollCount() {
  const stats = await getOrCreateStats();
  await db.update(botStats)
    .set({ 
      scrollCount: (stats.scrollCount || 0) + 1,
      lastScroll: new Date()
    })
    .where(eq(botStats.id, stats.id));
}

// Initialize bot
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

console.log('🤖 Telegram Bot initialized with token:', BOT_TOKEN.substring(0, 10) + '...');

// Send welcome message
bot.sendMessage(CHAT_ID, `🚀 URL Viewer Bot is now running!

Available commands:
/start - Start the bot
/status - Check current status
/scroll_on - Enable auto-scroll
/scroll_off - Disable auto-scroll
/refresh_on - Enable auto-refresh
/refresh_off - Disable auto-refresh
/seturl <url> - Set URL to view
/setinterval <seconds> - Set refresh interval
/stop - Stop all automation

Your bot will keep running even when your phone is off! 📱💤`);

// Command handlers
bot.onText(/\/start/, (msg: any) => {
  const chatId = msg.chat.id.toString();
  if (chatId === CHAT_ID) {
    bot.sendMessage(CHAT_ID, '✅ Bot started! Ready to control your URL viewer.');
    botState.isActive = true;
  }
});

bot.onText(/\/status/, (msg: any) => {
  const chatId = msg.chat.id.toString();
  if (chatId === CHAT_ID) {
    const statusMessage = `📊 Current Status:

🔄 Auto-scroll: ${botState.autoScroll ? '✅ ON' : '❌ OFF'}
🔃 Auto-refresh: ${botState.autoRefresh ? '✅ ON' : '❌ OFF'}
⏱️ Refresh interval: ${botState.refreshInterval} seconds
🌐 Current URL: ${botState.currentUrl || 'None set'}
🤖 Bot active: ${botState.isActive ? '✅ YES' : '❌ NO'}

Keep this bot running for 24/7 automation! 🚀`;
    
    bot.sendMessage(CHAT_ID, statusMessage);
  }
});

bot.onText(/\/scroll_on/, (msg: any) => {
  const chatId = msg.chat.id.toString();
  if (chatId === CHAT_ID) {
    botState.autoScroll = true;
    startAutoScroll();
    bot.sendMessage(CHAT_ID, '✅ Auto-scroll enabled! Your content will scroll automatically.');
  }
});

bot.onText(/\/scroll_off/, (msg: any) => {
  const chatId = msg.chat.id.toString();
  if (chatId === CHAT_ID) {
    botState.autoScroll = false;
    stopAutoScroll();
    bot.sendMessage(CHAT_ID, '❌ Auto-scroll disabled.');
  }
});

bot.onText(/\/refresh_on/, (msg: any) => {
  const chatId = msg.chat.id.toString();
  if (chatId === CHAT_ID) {
    botState.autoRefresh = true;
    startAutoRefresh();
    bot.sendMessage(CHAT_ID, `✅ Auto-refresh enabled! Page will refresh every ${botState.refreshInterval} seconds.`);
  }
});

bot.onText(/\/refresh_off/, (msg: any) => {
  const chatId = msg.chat.id.toString();
  if (chatId === CHAT_ID) {
    botState.autoRefresh = false;
    stopAutoRefresh();
    bot.sendMessage(CHAT_ID, '❌ Auto-refresh disabled.');
  }
});

bot.onText(/\/seturl (.+)/, (msg: any, match: any) => {
  const chatId = msg.chat.id.toString();
  if (chatId === CHAT_ID && match) {
    const url = match[1];
    botState.currentUrl = url;
    bot.sendMessage(CHAT_ID, `🌐 URL set to: ${url}\n\nNow you can enable auto-scroll and auto-refresh!`);
  }
});

bot.onText(/\/setinterval (\d+)/, (msg: any, match: any) => {
  const chatId = msg.chat.id.toString();
  if (chatId === CHAT_ID && match) {
    const interval = parseInt(match[1]);
    if (interval >= 5) {
      botState.refreshInterval = interval;
      if (botState.autoRefresh) {
        stopAutoRefresh();
        startAutoRefresh();
      }
      bot.sendMessage(CHAT_ID, `⏱️ Refresh interval set to ${interval} seconds.`);
    } else {
      bot.sendMessage(CHAT_ID, '❌ Interval must be at least 5 seconds.');
    }
  }
});

bot.onText(/\/stop/, (msg: any) => {
  const chatId = msg.chat.id.toString();
  if (chatId === CHAT_ID) {
    botState.autoScroll = false;
    botState.autoRefresh = false;
    stopAutoScroll();
    stopAutoRefresh();
    bot.sendMessage(CHAT_ID, '⏹️ All automation stopped.');
  }
});

// Auto-scroll functions
function startAutoScroll() {
  if (scrollInterval) clearInterval(scrollInterval);
  
  scrollInterval = setInterval(async () => {
    if (botState.autoScroll && botState.currentUrl) {
      await incrementScrollCount();
      console.log('🔄 Auto-scroll tick...');
      // This would trigger the scroll in the UI
      broadcastToClients({ type: 'SCROLL_TICK' });
    }
  }, 2500);
}

function stopAutoScroll() {
  if (scrollInterval) {
    clearInterval(scrollInterval);
    scrollInterval = null;
  }
}

// Auto-refresh functions
function startAutoRefresh() {
  if (refreshInterval) clearInterval(refreshInterval);
  
  refreshInterval = setInterval(() => {
    if (botState.autoRefresh && botState.currentUrl) {
      console.log('🔃 Auto-refresh tick...');
      broadcastToClients({ type: 'REFRESH_TICK' });
      bot.sendMessage(CHAT_ID, `🔃 Page refreshed automatically at ${new Date().toLocaleTimeString()}`);
    }
  }, botState.refreshInterval * 1000);
}

function stopAutoRefresh() {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
}

// Broadcast to connected clients
function broadcastToClients(message: any) {
  // This will be implemented to communicate with the frontend
  console.log('📡 Broadcasting to clients:', message);
}

// Export functions for server integration
export { botState, startAutoScroll, stopAutoScroll, startAutoRefresh, stopAutoRefresh };

// Status update every 5 minutes when active
setInterval(() => {
  if (botState.isActive && (botState.autoScroll || botState.autoRefresh)) {
    const uptimeMessage = `🔥 Still running! 
🔄 Scroll: ${botState.autoScroll ? 'ON' : 'OFF'}
🔃 Refresh: ${botState.autoRefresh ? 'ON' : 'OFF'}
⏰ ${new Date().toLocaleTimeString()}`;
    
    bot.sendMessage(CHAT_ID, uptimeMessage);
  }
}, 5 * 60 * 1000); // Every 5 minutes

console.log('✅ Telegram Bot fully configured and running!');