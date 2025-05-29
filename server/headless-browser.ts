import puppeteer, { Browser, Page } from 'puppeteer';
import TelegramBot from 'node-telegram-bot-api';

interface HeadlessBrowserState {
  isActive: boolean;
  currentUrl: string;
  autoScroll: boolean;
  autoRefresh: boolean;
  refreshInterval: number; // in seconds
  screenshotInterval: number; // in seconds
  lastScreenshot: Date | null;
  lastRefresh: Date | null;
  lastScroll: Date | null;
  totalRefreshes: number;
  totalScrolls: number;
  totalScreenshots: number;
}

let browser: Browser | null = null;
let page: Page | null = null;
let screenshotIntervalId: NodeJS.Timeout | null = null;
let refreshIntervalId: NodeJS.Timeout | null = null;
let scrollIntervalId: NodeJS.Timeout | null = null;

const state: HeadlessBrowserState = {
  isActive: false,
  currentUrl: '',
  autoScroll: false,
  autoRefresh: false,
  refreshInterval: 30,
  screenshotInterval: 60, // Take screenshot every minute
  lastScreenshot: null,
  lastRefresh: null,
  lastScroll: null,
  totalRefreshes: 0,
  totalScrolls: 0,
  totalScreenshots: 0
};

// Initialize headless browser
export async function initializeHeadlessBrowser(): Promise<void> {
  try {
    console.log('🚀 Initializing headless browser...');
    
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor'
      ]
    });

    page = await browser.newPage();
    
    // Set viewport size
    await page.setViewport({ width: 1280, height: 720 });
    
    // Set user agent to avoid detection
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    console.log('✅ Headless browser initialized successfully!');
    state.isActive = true;
    
  } catch (error) {
    console.error('❌ Failed to initialize headless browser:', error);
    throw error;
  }
}

// Navigate to URL
export async function navigateToUrl(url: string, bot?: TelegramBot, chatId?: string): Promise<void> {
  if (!page || !browser) {
    throw new Error('Headless browser not initialized');
  }

  try {
    console.log(`🌐 Navigating to: ${url}`);
    state.currentUrl = url;
    
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    console.log('✅ Navigation completed successfully');
    
    // Start auto-features if enabled
    if (state.autoScroll) {
      startAutoScroll();
    }
    if (state.autoRefresh) {
      startAutoRefresh();
    }
    
    // Start taking screenshots if bot is provided
    if (bot && chatId) {
      startScreenshots(bot, chatId);
    }
    
  } catch (error) {
    console.error('❌ Navigation failed:', error);
    throw error;
  }
}

// Take screenshot and send to Telegram
export async function takeScreenshot(bot: TelegramBot, chatId: string): Promise<void> {
  if (!page) {
    throw new Error('Headless browser page not available');
  }

  try {
    console.log('📸 Taking screenshot...');
    
    const screenshot = await page.screenshot({
      type: 'png',
      fullPage: false // Only visible area
    });
    
    state.lastScreenshot = new Date();
    state.totalScreenshots++;
    
    const caption = `📸 Screenshot #${state.totalScreenshots}
🌐 URL: ${state.currentUrl}
🕐 Time: ${new Date().toLocaleString()}
📊 Stats: ${state.totalRefreshes} refreshes, ${state.totalScrolls} scrolls`;

    await bot.sendPhoto(chatId, screenshot as Buffer, { caption });
    console.log('✅ Screenshot sent to Telegram successfully');
    
  } catch (error) {
    console.error('❌ Screenshot failed:', error);
    throw error;
  }
}

// Auto-scroll functionality
export function startAutoScroll(): void {
  if (!page) return;
  
  if (scrollIntervalId) {
    clearInterval(scrollIntervalId);
  }
  
  state.autoScroll = true;
  console.log('🔄 Starting auto-scroll...');
  
  scrollIntervalId = setInterval(async () => {
    if (!page || !state.autoScroll) return;
    
    try {
      // Scroll down by viewport height
      await page.evaluate(() => {
        window.scrollBy(0, window.innerHeight);
      });
      
      state.lastScroll = new Date();
      state.totalScrolls++;
      console.log(`🔄 Auto-scroll performed (Total: ${state.totalScrolls})`);
      
    } catch (error) {
      console.error('❌ Auto-scroll error:', error);
    }
  }, 3000); // Scroll every 3 seconds
}

export function stopAutoScroll(): void {
  if (scrollIntervalId) {
    clearInterval(scrollIntervalId);
    scrollIntervalId = null;
  }
  state.autoScroll = false;
  console.log('⏹️ Auto-scroll stopped');
}

// Auto-refresh functionality
export function startAutoRefresh(): void {
  if (!page) return;
  
  if (refreshIntervalId) {
    clearInterval(refreshIntervalId);
  }
  
  state.autoRefresh = true;
  console.log(`🔃 Starting auto-refresh (every ${state.refreshInterval}s)...`);
  
  refreshIntervalId = setInterval(async () => {
    if (!page || !state.autoRefresh) return;
    
    try {
      await page.reload({ waitUntil: 'networkidle2' });
      state.lastRefresh = new Date();
      state.totalRefreshes++;
      console.log(`🔃 Auto-refresh performed (Total: ${state.totalRefreshes})`);
      
    } catch (error) {
      console.error('❌ Auto-refresh error:', error);
    }
  }, state.refreshInterval * 1000);
}

export function stopAutoRefresh(): void {
  if (refreshIntervalId) {
    clearInterval(refreshIntervalId);
    refreshIntervalId = null;
  }
  state.autoRefresh = false;
  console.log('⏹️ Auto-refresh stopped');
}

// Screenshot automation
export function startScreenshots(bot: TelegramBot, chatId: string): void {
  if (screenshotIntervalId) {
    clearInterval(screenshotIntervalId);
  }
  
  console.log(`📸 Starting screenshot automation (every ${state.screenshotInterval}s)`);
  
  screenshotIntervalId = setInterval(async () => {
    if (!state.isActive || !state.currentUrl) return;
    
    try {
      await takeScreenshot(bot, chatId);
    } catch (error) {
      console.error('❌ Scheduled screenshot error:', error);
    }
  }, state.screenshotInterval * 1000);
}

export function stopScreenshots(): void {
  if (screenshotIntervalId) {
    clearInterval(screenshotIntervalId);
    screenshotIntervalId = null;
  }
  console.log('📸 Screenshot automation stopped');
}

// Update intervals
export function setRefreshInterval(seconds: number): void {
  if (seconds >= 5) {
    state.refreshInterval = seconds;
    if (state.autoRefresh) {
      stopAutoRefresh();
      startAutoRefresh();
    }
    console.log(`⏱️ Refresh interval updated to ${seconds}s`);
  }
}

export function setScreenshotInterval(seconds: number): void {
  if (seconds >= 10) {
    state.screenshotInterval = seconds;
    console.log(`📸 Screenshot interval updated to ${seconds}s`);
  }
}

// Get current state
export function getHeadlessBrowserState(): HeadlessBrowserState {
  return { ...state };
}

// Cleanup
export async function cleanupHeadlessBrowser(): Promise<void> {
  try {
    console.log('🧹 Cleaning up headless browser...');
    
    stopAutoScroll();
    stopAutoRefresh();
    
    if (screenshotIntervalId) {
      clearInterval(screenshotIntervalId);
    }
    
    if (page) {
      await page.close();
      page = null;
    }
    
    if (browser) {
      await browser.close();
      browser = null;
    }
    
    state.isActive = false;
    console.log('✅ Headless browser cleanup completed');
    
  } catch (error) {
    console.error('❌ Cleanup error:', error);
  }
}

// Handle process termination
process.on('SIGINT', cleanupHeadlessBrowser);
process.on('SIGTERM', cleanupHeadlessBrowser);