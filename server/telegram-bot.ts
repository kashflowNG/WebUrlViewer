import TelegramBot from 'node-telegram-bot-api';
import WebSocket from 'ws';

// Bot credentials
const BOT_TOKEN = '7890871059:AAHlDEkfJxsq1bKwqthUBiI1f5dqu8IFavM';
const CHAT_ID = '6360165707';

// WebSocket connections for real-time communication with web clients
let webSocketClients: Set<WebSocket> = new Set();

// Bot state with counters
interface BotState {
  autoScroll: boolean;
  autoRefresh: boolean;
  refreshInterval: number;
  currentUrl: string;
  isActive: boolean;
  refreshCount: number;
  scrollCount: number;
  lastRefresh: Date | null;
  lastScroll: Date | null;
}

let botState: BotState = {
  autoScroll: false,
  autoRefresh: false,
  refreshInterval: 30,
  currentUrl: '',
  isActive: false,
  refreshCount: 0,
  scrollCount: 0,
  lastRefresh: null,
  lastScroll: null
};

let scrollInterval: NodeJS.Timeout | null = null;
let refreshInterval: NodeJS.Timeout | null = null;

// Simple counter functions
function incrementRefreshCount() {
  botState.refreshCount++;
  botState.lastRefresh = new Date();
}

function incrementScrollCount() {
  botState.scrollCount++;
  botState.lastScroll = new Date();
}

// Initialize bot with conflict prevention
let bot: TelegramBot;

// Prevent multiple instances by using webhook mode in production-like environment
try {
  bot = new TelegramBot(BOT_TOKEN, { 
    polling: false
  });
  
  // Use manual polling to avoid conflicts
  let isPolling = false;
  
  const startPolling = () => {
    if (isPolling) return;
    isPolling = true;
    
    const poll = async () => {
      if (!isPolling) return;
      
      try {
        const updates = await bot.getUpdates({ timeout: 10, limit: 1 });
        for (const update of updates) {
          bot.processUpdate(update);
          await bot.deleteWebhook();
        }
      } catch (error) {
        // Silently handle polling errors to prevent spam
      }
      
      if (isPolling) {
        setTimeout(poll, 2000);
      }
    };
    
    poll();
  };
  
  startPolling();
  
} catch (error) {
  console.log('Bot initialization error:', error);
  bot = new TelegramBot(BOT_TOKEN, { polling: false });
}

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

📈 Live Counters:
🔃 Total Refreshes: ${botState.refreshCount}
🔄 Total Scrolls: ${botState.scrollCount}
🕐 Last Refresh: ${botState.lastRefresh ? botState.lastRefresh.toLocaleString() : 'Never'}
🕐 Last Scroll: ${botState.lastScroll ? botState.lastScroll.toLocaleString() : 'Never'}

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
  
  scrollInterval = setInterval(() => {
    if (botState.autoScroll && botState.currentUrl) {
      incrementScrollCount();
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
      incrementRefreshCount();
      console.log('🔃 Auto-refresh tick...');
      broadcastToClients({ type: 'REFRESH_TICK' });
      bot.sendMessage(CHAT_ID, `🔃 Page refreshed automatically at ${new Date().toLocaleTimeString()}\n📊 Total refreshes: ${botState.refreshCount}`);
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
  console.log('📡 Broadcasting to clients:', message);
  webSocketClients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}

// Add WebSocket client
export function addWebSocketClient(ws: WebSocket) {
  webSocketClients.add(ws);
  
  // Send current state to new client
  ws.send(JSON.stringify({
    type: 'bot_state',
    data: botState
  }));
  
  ws.on('close', () => {
    webSocketClients.delete(ws);
  });
  
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      handleWebMessage(message);
    } catch (error) {
      console.log('WebSocket message error:', error);
    }
  });
}

// Handle messages from web clients
function handleWebMessage(message: any) {
  switch (message.type) {
    case 'url_changed':
      botState.currentUrl = message.url;
      broadcastToClients({
        type: 'url_updated',
        url: message.url
      });
      break;
    case 'page_loaded':
      broadcastToClients({
        type: 'page_status',
        status: 'loaded',
        url: message.url
      });
      break;
    case 'scroll_performed':
      incrementScrollCount();
      broadcastToClients({
        type: 'scroll_update',
        count: botState.scrollCount
      });
      break;
    case 'refresh_performed':
      incrementRefreshCount();
      broadcastToClients({
        type: 'refresh_update',
        count: botState.refreshCount
      });
      break;
  }
}

// Export functions for server integration
export { botState, startAutoScroll, stopAutoScroll, startAutoRefresh, stopAutoRefresh, broadcastToClients };

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