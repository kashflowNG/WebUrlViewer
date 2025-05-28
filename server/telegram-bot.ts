import TelegramBot from 'node-telegram-bot-api';

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

// Initialize bot
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

console.log('🤖 Telegram Bot initialized with token:', BOT_TOKEN.substring(0, 10) + '...');

// Send welcome message with inline buttons
const welcomeKeyboard = {
  inline_keyboard: [
    [
      { text: '🚀 Start Bot', callback_data: 'start_bot' },
      { text: '⏹️ Stop Bot', callback_data: 'stop_bot' }
    ],
    [
      { text: '📊 Status', callback_data: 'status' },
      { text: '🌐 Set URL', callback_data: 'set_url' }
    ],
    [
      { text: '🔄 Scroll ON', callback_data: 'scroll_on' },
      { text: '⏸️ Scroll OFF', callback_data: 'scroll_off' }
    ],
    [
      { text: '🔃 Refresh ON', callback_data: 'refresh_on' },
      { text: '⏹️ Refresh OFF', callback_data: 'refresh_off' }
    ],
    [
      { text: '⏱️ Set Interval', callback_data: 'set_interval' },
      { text: '🔧 Dashboard', callback_data: 'dashboard' }
    ]
  ]
};

bot.sendMessage(CHAT_ID, `🚀 URL Viewer Bot is now running!

✨ Your smart automation dashboard is ready!

🎯 Use the buttons below to control your bot:
• Start/Stop automation
• Enable auto-scroll and auto-refresh  
• Set any website URL
• Adjust refresh intervals
• View real-time status

Your bot will keep running 24/7 even when your phone is off! 📱💤`, {
  reply_markup: welcomeKeyboard
});

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
  
  scrollInterval = setInterval(() => {
    if (botState.autoScroll && botState.currentUrl) {
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