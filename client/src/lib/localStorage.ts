// Local storage utilities for user data management
export interface UserData {
  id: string;
  username: string;
  totalEarnings: number;
  createdAt: string;
}

export interface UserStats {
  userId: string;
  currentUrl: string | null;
  refreshCount: number;
  scrollCount: number;
  autoScrollEnabled: boolean;
  autoRefreshEnabled: boolean;
  refreshInterval: number;
  lastRefresh: string | null;
  lastScroll: string | null;
  isActive: boolean;
  sessionStartTime: string;
  updatedAt: string;
}

export interface Earning {
  id: string;
  userId: string;
  amount: number;
  refreshInterval: number;
  earnedAt: string;
}

const STORAGE_KEYS = {
  USER: 'money_machine_user',
  STATS: 'money_machine_stats',
  EARNINGS: 'money_machine_earnings',
};

// User management
export const getUser = (): UserData | null => {
  try {
    const userData = localStorage.getItem(STORAGE_KEYS.USER);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error getting user from localStorage:', error);
    return null;
  }
};

export const createUser = (username: string): UserData => {
  const user: UserData = {
    id: Date.now().toString(),
    username,
    totalEarnings: 0,
    createdAt: new Date().toISOString(),
  };
  
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  return user;
};

export const updateUserEarnings = (amount: number): UserData | null => {
  const user = getUser();
  if (!user) return null;
  
  user.totalEarnings += amount;
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  return user;
};

// Stats management
export const getUserStats = (): UserStats | null => {
  try {
    const statsData = localStorage.getItem(STORAGE_KEYS.STATS);
    return statsData ? JSON.parse(statsData) : null;
  } catch (error) {
    console.error('Error getting stats from localStorage:', error);
    return null;
  }
};

export const createOrUpdateUserStats = (statsData: Partial<UserStats>): UserStats => {
  const existingStats = getUserStats();
  const user = getUser();
  
  const stats: UserStats = {
    userId: user?.id || 'demo',
    currentUrl: null,
    refreshCount: 0,
    scrollCount: 0,
    autoScrollEnabled: false,
    autoRefreshEnabled: false,
    refreshInterval: 30,
    lastRefresh: null,
    lastScroll: null,
    isActive: false,
    sessionStartTime: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...existingStats,
    ...statsData,
  };
  
  localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
  return stats;
};

// Earnings management
export const getEarnings = (): Earning[] => {
  try {
    const earningsData = localStorage.getItem(STORAGE_KEYS.EARNINGS);
    return earningsData ? JSON.parse(earningsData) : [];
  } catch (error) {
    console.error('Error getting earnings from localStorage:', error);
    return [];
  }
};

export const addEarning = (amount: number, refreshInterval: number): Earning => {
  const user = getUser();
  const earnings = getEarnings();
  
  const earning: Earning = {
    id: Date.now().toString(),
    userId: user?.id || 'demo',
    amount,
    refreshInterval,
    earnedAt: new Date().toISOString(),
  };
  
  earnings.push(earning);
  localStorage.setItem(STORAGE_KEYS.EARNINGS, JSON.stringify(earnings));
  
  // Update user total earnings
  updateUserEarnings(amount);
  
  return earning;
};

// Initialize user if doesn't exist
export const initializeUser = (): UserData => {
  let user = getUser();
  if (!user) {
    user = createUser('demo_user');
    
    // Initialize default stats
    createOrUpdateUserStats({
      refreshInterval: 30,
      autoScrollEnabled: false,
      autoRefreshEnabled: false,
    });
  }
  return user;
};

// Clear all data
export const clearAllData = (): void => {
  localStorage.removeItem(STORAGE_KEYS.USER);
  localStorage.removeItem(STORAGE_KEYS.STATS);
  localStorage.removeItem(STORAGE_KEYS.EARNINGS);
};