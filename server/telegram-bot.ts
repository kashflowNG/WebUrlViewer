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

// Activity tracking for batched reports
let activityBuffer: string[] = [];
let lastReportTime = Date.now();

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

// Add activity to buffer for batched reporting
function addActivity(message: string) {
  activityBuffer.push(`${new Date().toLocaleTimeString()} - ${message}`);
}

// Send batched activity report every 20 seconds
function sendBatchedReport() {
  console.log(`📊 Checking batched report - Activities in buffer: ${activityBuffer.length}`);
  
  if (activityBuffer.length > 0 && bot && CHAT_ID) {
    const report = `📊 Activity Report (Last 1min):

${activityBuffer.join('\n')}

📈 Total Counters:
🔄 Scrolls: ${botState.scrollCount}
🔃 Refreshes: ${botState.refreshCount}
🌐 Current URL: ${botState.currentUrl || 'None'}`;

    console.log('📤 Sending batched report to Telegram...');
    
    // Clear buffer immediately to prevent duplicate sends
    activityBuffer = [];
    
    bot.sendMessage(CHAT_ID, report).then(() => {
      console.log('✅ Batched report sent successfully!');
    }).catch(error => {
      console.log('❌ Report send error:', error.message);
    });
  } else if (activityBuffer.length === 0) {
    console.log('📭 No activities to report in this 1-minute window');
  }
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
          await bot.deleteWebHook();
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

// Automatically activate the bot (no welcome message to avoid rate limits)
botState.isActive = true;

// Command handlers
bot.onText(/\/start/, (msg: any) => {
  const chatId = msg.chat.id.toString();
  if (chatId === CHAT_ID) {
    botState.isActive = true;
    addActivity('✅ Bot started via Telegram command');
  }
});

bot.onText(/\/status/, (msg: any) => {
  const chatId = msg.chat.id.toString();
  if (chatId === CHAT_ID) {
    // Just update state, no instant message to avoid rate limits
    console.log('📊 Status requested - will be included in next 20s report');
  }
});

bot.onText(/\/scroll_on/, (msg: any) => {
  const chatId = msg.chat.id.toString();
  if (chatId === CHAT_ID) {
    botState.autoScroll = true;
    startAutoScroll();
    addActivity('✅ Auto-scroll enabled via Telegram command');
  }
});

bot.onText(/\/scroll_off/, (msg: any) => {
  const chatId = msg.chat.id.toString();
  if (chatId === CHAT_ID) {
    botState.autoScroll = false;
    stopAutoScroll();
    addActivity('❌ Auto-scroll disabled via Telegram command');
  }
});

bot.onText(/\/refresh_on/, (msg: any) => {
  const chatId = msg.chat.id.toString();
  if (chatId === CHAT_ID) {
    botState.autoRefresh = true;
    startAutoRefresh();
    addActivity(`✅ Auto-refresh enabled (${botState.refreshInterval}s interval) via Telegram command`);
  }
});

bot.onText(/\/refresh_off/, (msg: any) => {
  const chatId = msg.chat.id.toString();
  if (chatId === CHAT_ID) {
    botState.autoRefresh = false;
    stopAutoRefresh();
    addActivity('❌ Auto-refresh disabled via Telegram command');
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
  
  // Send current state to new client - only send if URL is not empty
  const stateToSend = {
    type: 'bot_state',
    data: {
      ...botState,
      // Don't override client's URL if bot's URL is empty
      currentUrl: botState.currentUrl || undefined
    }
  };
  
  ws.send(JSON.stringify(stateToSend));
  
  ws.on('close', () => {
    webSocketClients.delete(ws);
  });
  
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      console.log('🔗 Received WebSocket message:', message.type);
      handleWebMessage(message);
    } catch (error) {
      console.log('WebSocket message error:', error);
    }
  });
}

// Handle messages from web clients
function handleWebMessage(message: any) {
  console.log('📨 Processing web message:', message.type);
  switch (message.type) {
    case 'url_changed':
      botState.currentUrl = message.url;
      broadcastToClients({
        type: 'url_updated',
        url: message.url
      });
      // Add to activity buffer instead of instant notification
      addActivity(`🌐 URL changed to: ${message.url}`);
      console.log('✅ Added URL change activity to buffer');
      break;
    case 'page_loaded':
      broadcastToClients({
        type: 'page_status',
        status: 'loaded',
        url: message.url
      });
      // Add to activity buffer instead of instant notification
      addActivity(`✅ Page loaded: ${message.url}`);
      console.log('✅ Added page load activity to buffer');
      break;
    case 'scroll_performed':
      incrementScrollCount();
      broadcastToClients({
        type: 'scroll_update',
        count: botState.scrollCount
      });
      // Add to activity buffer instead of instant notification
      addActivity(`🔄 Auto-scroll performed (Total: ${botState.scrollCount})`);
      break;
    case 'refresh_performed':
      incrementRefreshCount();
      broadcastToClients({
        type: 'refresh_update',
        count: botState.refreshCount
      });
      // Add to activity buffer instead of instant notification
      addActivity(`🔃 Page refresh started (Total: ${botState.refreshCount})`);
      break;
    case 'refresh_completed':
      // Add to activity buffer instead of instant notification
      addActivity(`✅ Page refresh completed`);
      break;
  }
}

// Export functions for server integration
export { botState, startAutoScroll, stopAutoScroll, startAutoRefresh, stopAutoRefresh, broadcastToClients };

// Send batched activity reports every 1 minute
setInterval(() => {
  sendBatchedReport();
}, 60 * 1000); // Every 1 minute

console.log('✅ Telegram Bot fully configured and running!');