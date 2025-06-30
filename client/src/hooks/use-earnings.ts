import { useState, useEffect, useCallback } from "react";
import { 
  getUser, 
  getUserStats, 
  getEarnings, 
  addEarning, 
  createOrUpdateUserStats, 
  initializeUser,
  UserData,
  UserStats,
  Earning
} from "@/lib/localStorage";

export function useEarnings() {
  const [user, setUser] = useState<UserData | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [lastEarning, setLastEarning] = useState<Earning | null>(null);
  const [flashEarning, setFlashEarning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize data on mount
  useEffect(() => {
    const initializeData = () => {
      try {
        setIsLoading(true);
        
        // Initialize user
        const userData = initializeUser();
        setUser(userData);
        
        // Load stats
        const statsData = getUserStats();
        setStats(statsData);
        
        // Load earnings
        const earningsData = getEarnings();
        setEarnings(earningsData);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error initializing data:', error);
        setIsLoading(false);
      }
    };

    initializeData();
  }, []);

  // Record earnings when refresh happens
  const recordEarning = useCallback((refreshInterval: number) => {
    try {
      const earningsMap: Record<number, number> = {
        15: 0.001,
        30: 0.003,
        60: 0.005,
        300: 0.01,
      };
      
      const amount = earningsMap[refreshInterval] || 0;
      const earning = addEarning(amount, refreshInterval);
      
      // Update state
      setEarnings(getEarnings());
      setUser(getUser());
      setLastEarning(earning);
      
      // Flash animation
      setFlashEarning(true);
      setTimeout(() => setFlashEarning(false), 800);
      
    } catch (error) {
      console.error('Error recording earning:', error);
    }
  }, []);

  // Update stats
  const updateStats = useCallback((statsData: Partial<UserStats>) => {
    try {
      const updatedStats = createOrUpdateUserStats(statsData);
      setStats(updatedStats);
    } catch (error) {
      console.error('Error updating stats:', error);
    }
  }, []);

  // Refresh data from localStorage
  const refetchEarnings = useCallback(() => {
    try {
      setUser(getUser());
      setStats(getUserStats());
      setEarnings(getEarnings());
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  }, []);

  // Calculate earnings per hour based on refresh interval
  const getEarningsPerHour = useCallback((refreshInterval: number) => {
    const earningsMap: Record<number, number> = {
      15: 0.001,   // $0.001 for 15s = $0.24/hour
      30: 0.003,   // $0.003 for 30s = $0.36/hour  
      60: 0.005,   // $0.005 for 1m = $0.30/hour
      300: 0.01,   // $0.01 for 5m = $0.12/hour
    };
    
    const earningPerRefresh = earningsMap[refreshInterval] || 0;
    const refreshesPerHour = 3600 / refreshInterval;
    return earningPerRefresh * refreshesPerHour;
  }, []);

  // Get earnings rate display
  const getEarningsRate = useCallback((refreshInterval: number) => {
    const earningsMap: Record<number, string> = {
      15: "$0.001",
      30: "$0.003", 
      60: "$0.005",
      300: "$0.010",
    };
    return earningsMap[refreshInterval] || "$0.000";
  }, []);

  return {
    // Data
    user,
    stats,
    earnings,
    isLoading,
    
    // Latest earning info
    lastEarning,
    flashEarning,
    
    // Actions
    recordEarning,
    updateStats,
    refetchEarnings,
    
    // Utilities
    getEarningsPerHour,
    getEarningsRate,
    
    // Loading states (no longer needed but kept for compatibility)
    isAddingEarning: false,
    isUpdatingStats: false,
  };
}