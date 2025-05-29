import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  Activity, 
  RotateCcw, 
  MousePointer, 
  Clock, 
  Wifi, 
  WifiOff, 
  Zap, 
  Eye, 
  Globe,
  TrendingUp,
  Server,
  Timer,
  BarChart3,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { useWebSocket } from "@/hooks/use-websocket";

interface DashboardProps {
  currentUrl: string;
  isLoading: boolean;
  autoScroll: boolean;
  autoRefresh: boolean;
  refreshInterval: number;
  performanceMetrics: {
    loadTime: number;
    refreshCount: number;
    scrollCount: number;
  };
}

export default function StatusDashboard({
  currentUrl,
  isLoading,
  autoScroll,
  autoRefresh,
  refreshInterval,
  performanceMetrics
}: DashboardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [sessionStartTime] = useState(Date.now());
  const [uptimeSeconds, setUptimeSeconds] = useState(0);
  const [avgLoadTime, setAvgLoadTime] = useState(0);
  const [totalActions, setTotalActions] = useState(0);
  
  const { isConnected, connectionStatus } = useWebSocket();

  // Update uptime every second
  useEffect(() => {
    const interval = setInterval(() => {
      setUptimeSeconds(Math.floor((Date.now() - sessionStartTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionStartTime]);

  // Calculate derived metrics
  useEffect(() => {
    const total = performanceMetrics.refreshCount + performanceMetrics.scrollCount;
    setTotalActions(total);
    
    if (performanceMetrics.refreshCount > 0) {
      setAvgLoadTime(performanceMetrics.loadTime / performanceMetrics.refreshCount);
    }
  }, [performanceMetrics]);

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const formatTime = (ms: number) => {
    return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`;
  };

  const getConnectionStatusColor = () => {
    return isConnected ? 'text-green-400' : 'text-red-400';
  };

  const getConnectionStatusBg = () => {
    return isConnected ? 'bg-green-500/20 border-green-500/30' : 'bg-red-500/20 border-red-500/30';
  };

  const getActivityRate = () => {
    if (uptimeSeconds === 0) return 0;
    return (totalActions / (uptimeSeconds / 60)).toFixed(1); // actions per minute
  };

  return (
    <div className="absolute bottom-4 left-4 z-30 w-80">
      <Card className="bg-black/95 border-green-500/30 backdrop-blur-sm neon-border">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-mono text-green-400 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              STATUS DASHBOARD
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-6 w-6 p-0 text-green-400 hover:bg-green-500/10"
            >
              {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0 space-y-3">
          {/* System Status Row */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-green-300">CONNECTION:</span>
                <div className="flex items-center gap-1">
                  {isConnected ? (
                    <Wifi className="w-3 h-3 text-green-400" />
                  ) : (
                    <WifiOff className="w-3 h-3 text-red-400" />
                  )}
                  <Badge className={`${getConnectionStatusBg()} text-xs font-mono px-1 py-0`}>
                    {isConnected ? 'ONLINE' : 'OFFLINE'}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-green-300">UPTIME:</span>
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs font-mono px-1 py-0">
                  {formatUptime(uptimeSeconds)}
                </Badge>
              </div>
            </div>
          </div>

          {/* Current URL Status */}
          {currentUrl && (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Globe className="w-3 h-3 text-cyan-400" />
                <span className="text-xs font-mono text-cyan-300">TARGET:</span>
                {isLoading && (
                  <div className="w-3 h-3 border border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                )}
              </div>
              <div className="text-xs font-mono text-cyan-400 truncate bg-cyan-500/10 border border-cyan-500/20 rounded px-2 py-1">
                {new URL(currentUrl).hostname}
              </div>
            </div>
          )}

          {/* Activity Metrics */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-green-500/10 border border-green-500/20 rounded p-2">
              <div className="flex items-center justify-center gap-1 mb-1">
                <RotateCcw className="w-3 h-3 text-green-400" />
              </div>
              <div className="text-lg font-bold font-mono text-green-400">
                {performanceMetrics.refreshCount}
              </div>
              <div className="text-xs font-mono text-green-600">REFRESH</div>
            </div>
            
            <div className="bg-blue-500/10 border border-blue-500/20 rounded p-2">
              <div className="flex items-center justify-center gap-1 mb-1">
                <MousePointer className="w-3 h-3 text-blue-400" />
              </div>
              <div className="text-lg font-bold font-mono text-blue-400">
                {performanceMetrics.scrollCount}
              </div>
              <div className="text-xs font-mono text-blue-600">SCROLL</div>
            </div>
            
            <div className="bg-purple-500/10 border border-purple-500/20 rounded p-2">
              <div className="flex items-center justify-center gap-1 mb-1">
                <TrendingUp className="w-3 h-3 text-purple-400" />
              </div>
              <div className="text-lg font-bold font-mono text-purple-400">
                {getActivityRate()}
              </div>
              <div className="text-xs font-mono text-purple-600">APM</div>
            </div>
          </div>

          {/* Auto-Features Status */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-green-300">AUTO-FEATURES:</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className={`flex items-center justify-between p-2 rounded border ${autoScroll ? 'bg-green-500/10 border-green-500/30' : 'bg-gray-500/10 border-gray-500/30'}`}>
                <span className="text-xs font-mono text-green-300">SCROLL:</span>
                <Badge className={`${autoScroll ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'} text-xs font-mono px-1 py-0`}>
                  {autoScroll ? 'ON' : 'OFF'}
                </Badge>
              </div>
              
              <div className={`flex items-center justify-between p-2 rounded border ${autoRefresh ? 'bg-blue-500/10 border-blue-500/30' : 'bg-gray-500/10 border-gray-500/30'}`}>
                <span className="text-xs font-mono text-green-300">REFRESH:</span>
                <Badge className={`${autoRefresh ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-500/20 text-gray-400'} text-xs font-mono px-1 py-0`}>
                  {autoRefresh ? `${refreshInterval}s` : 'OFF'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Expanded Metrics */}
          {isExpanded && (
            <div className="space-y-3 pt-3 border-t border-green-500/20">
              <div className="space-y-2">
                <span className="text-xs font-mono text-cyan-300">PERFORMANCE METRICS:</span>
                
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-gray-300">Last Load Time:</span>
                    <span className="text-xs font-mono text-cyan-400">
                      {formatTime(performanceMetrics.loadTime)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-gray-300">Avg Load Time:</span>
                    <span className="text-xs font-mono text-cyan-400">
                      {formatTime(avgLoadTime)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-gray-300">Total Actions:</span>
                    <span className="text-xs font-mono text-cyan-400">
                      {totalActions}
                    </span>
                  </div>
                </div>
              </div>

              {/* System Resources */}
              <div className="space-y-2">
                <span className="text-xs font-mono text-orange-300">SYSTEM STATUS:</span>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-gray-300">WebSocket:</span>
                    <Badge className={`${getConnectionStatusBg()} text-xs font-mono px-1 py-0`}>
                      {connectionStatus.toUpperCase()}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-gray-300">Session:</span>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs font-mono px-1 py-0">
                      ACTIVE
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-gray-300">Wake Lock:</span>
                    <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs font-mono px-1 py-0">
                      {(autoScroll || autoRefresh) ? 'ACTIVE' : 'IDLE'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}