import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface UserStats {
  id: number;
  userId: number;
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

interface User {
  id: number;
  username: string;
  password: string;
  totalEarnings: string;
  createdAt: string;
}

interface Earning {
  id: number;
  userId: number;
  amount: string;
  refreshInterval: number;
  earnedAt: string;
}

interface EarningsData {
  user: User;
  stats: UserStats | null;
  earnings: Earning[];
}

export function useEarnings() {
  const queryClient = useQueryClient();
  const [lastEarning, setLastEarning] = useState<Earning | null>(null);
  const [flashEarning, setFlashEarning] = useState(false);

  // Initialize user on app start
  const { data: initData } = useQuery({
    queryKey: ['/api/init'],
    staleTime: Infinity, // Only call once
  });

  // Get user stats and earnings
  const { 
    data: earningsData, 
    isLoading, 
    refetch: refetchEarnings 
  } = useQuery<EarningsData>({
    queryKey: ['/api/user/stats'],
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  // Add earnings mutation
  const addEarningsMutation = useMutation({
    mutationFn: async (refreshInterval: number) => {
      const response = await fetch('/api/earnings/add', {
        method: 'POST',
        body: JSON.stringify({ refreshInterval }),
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to add earnings');
      return await response.json();
    },
    onSuccess: (data: any) => {
      // Flash animation for new earning
      setLastEarning(data.earning);
      setFlashEarning(true);
      setTimeout(() => setFlashEarning(false), 800);
      
      // Refresh earnings data
      queryClient.invalidateQueries({ queryKey: ['/api/user/stats'] });
    },
  });

  // Update user stats mutation
  const updateStatsMutation = useMutation({
    mutationFn: async (statsData: Partial<UserStats>) => {
      const response = await fetch('/api/user/stats/update', {
        method: 'POST',
        body: JSON.stringify(statsData),
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to update stats');
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/stats'] });
    },
  });

  // Record earnings when refresh happens
  const recordEarning = useCallback((refreshInterval: number) => {
    addEarningsMutation.mutate(refreshInterval);
  }, [addEarningsMutation]);

  // Update stats
  const updateStats = useCallback((statsData: Partial<UserStats>) => {
    updateStatsMutation.mutate(statsData);
  }, [updateStatsMutation]);

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
    user: earningsData?.user,
    stats: earningsData?.stats,
    earnings: earningsData?.earnings || [],
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
    
    // Loading states
    isAddingEarning: addEarningsMutation.isPending,
    isUpdatingStats: updateStatsMutation.isPending,
  };
}