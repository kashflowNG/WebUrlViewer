import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Globe, 
  AlertTriangle, 
  ExternalLink, 
  Play, 
  Pause, 
  RotateCcw, 
  Activity, 
  BarChart3, 
  Clock, 
  MousePointer, 
  Wifi, 
  ChevronDown, 
  ChevronUp, 
  DollarSign, 
  TrendingUp
} from "lucide-react";
import { useEarnings } from "@/hooks/use-earnings";

interface WebFrameProps {
  currentUrl: string;
  isLoading: boolean;
  hasError: boolean;
  errorMessage: string;
  onRetry: () => void;
  onClear: () => void;
  onLoadExample: (url: string) => void;
  iframeRef?: React.RefObject<HTMLIFrameElement>;
}

export default function WebFrame({
  currentUrl,
  isLoading,
  hasError,
  errorMessage,
  onRetry,
  onClear,
  onLoadExample,
  iframeRef: externalIframeRef
}: WebFrameProps) {
  const [autoScrollEnabled, setAutoScroll] = useState(() => {
    const saved = localStorage.getItem('urlViewer_autoScroll');
    return saved ? JSON.parse(saved) : false;
  });
  const [autoRefreshEnabled, setAutoRefresh] = useState(() => {
    const saved = localStorage.getItem('urlViewer_autoRefresh');
    return saved ? JSON.parse(saved) : false;
  });
  const [refreshInterval, setRefreshInterval] = useState(() => {
    const saved = localStorage.getItem('urlViewer_refreshInterval');
    return saved ? JSON.parse(saved) : 30;
  });

  // Earnings tracking integration
  const { 
    user, 
    recordEarning, 
    updateStats, 
    getEarningsRate, 
    getEarningsPerHour,
    flashEarning 
  } = useEarnings();
  const [scrollOffset, setScrollOffset] = useState(0);
  const [scrollDirection, setScrollDirection] = useState(1); // 1 for down, -1 for up
  const [showDashboard, setShowDashboard] = useState(true);
  const [sessionStartTime] = useState(Date.now());
  const [uptimeSeconds, setUptimeSeconds] = useState(0);
  const [totalRefreshes, setTotalRefreshes] = useState(0);
  const [totalScrolls, setTotalScrolls] = useState(0);
  const [loadTime, setLoadTime] = useState(0);
  const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const loadStartTime = useRef<number>(0);

  const exampleUrls = [
    "https://example.com",
    "https://httpbin.org",
    "https://jsonplaceholder.typicode.com"
  ];

  const handleOpenExternal = () => {
    if (currentUrl) {
      window.open(currentUrl, '_blank', 'noopener,noreferrer');
    }
  };

  // Update uptime every second
  useEffect(() => {
    const interval = setInterval(() => {
      setUptimeSeconds(Math.floor((Date.now() - sessionStartTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionStartTime]);

  // Track loading time
  useEffect(() => {
    if (isLoading) {
      loadStartTime.current = Date.now();
    } else {
      if (loadStartTime.current > 0) {
        setLoadTime(Date.now() - loadStartTime.current);
      }
    }
  }, [isLoading]);

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

  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem('urlViewer_autoScroll', JSON.stringify(autoScrollEnabled));
  }, [autoScrollEnabled]);

  useEffect(() => {
    localStorage.setItem('urlViewer_autoRefresh', JSON.stringify(autoRefreshEnabled));
  }, [autoRefreshEnabled]);

  useEffect(() => {
    localStorage.setItem('urlViewer_refreshInterval', JSON.stringify(refreshInterval));
  }, [refreshInterval]);

  // Auto-scroll functionality
  useEffect(() => {
    if (autoScrollEnabled && currentUrl && !isLoading) {
      scrollIntervalRef.current = setInterval(() => {
        setScrollOffset(prevOffset => {
          const maxOffset = 2000;
          const minOffset = 0;
          let newOffset: number;
          let newDirection = scrollDirection;

          if (scrollDirection === 1) {
            newOffset = prevOffset + 150;
            if (newOffset >= maxOffset) {
              newOffset = maxOffset;
              newDirection = -1;
            }
          } else {
            newOffset = prevOffset - 150;
            if (newOffset <= minOffset) {
              newOffset = minOffset;
              newDirection = 1;
            }
          }

          setScrollDirection(newDirection);
          setTotalScrolls(prev => prev + 1);

          return newOffset;
        });
      }, 2500); // Scroll every 2.5 seconds
    } else {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
        scrollIntervalRef.current = null;
      }
      // Reset scroll position when stopping
      setScrollOffset(0);
      setScrollDirection(1);
    }

    return () => {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
      }
    };
  }, [autoScrollEnabled, currentUrl, isLoading, scrollDirection]);

  // Auto-refresh functionality with earnings tracking
  useEffect(() => {
    if (autoRefreshEnabled && currentUrl && !isLoading) {
      refreshIntervalRef.current = setInterval(() => {
        if (externalIframeRef?.current) {
          // Reload the iframe
          externalIframeRef.current.src = externalIframeRef.current.src;
          setTotalRefreshes(prev => prev + 1);

          // Record earnings for this refresh
          recordEarning(refreshInterval);

          // Update stats
          updateStats({
            refreshCount: totalRefreshes + 1,
            autoRefreshEnabled: true,
            refreshInterval: refreshInterval,
            lastRefresh: new Date().toISOString(),
            currentUrl: currentUrl,
          });
        }
      }, refreshInterval * 1000);
    } else {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [autoRefreshEnabled, currentUrl, isLoading, refreshInterval, externalIframeRef, recordEarning, updateStats, totalRefreshes]);

  // Apply scroll offset to iframe when it changes
  useEffect(() => {
    if (externalIframeRef?.current && scrollOffset > 0) {
      try {
        const iframe = externalIframeRef.current;
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (iframeDoc) {
          iframeDoc.documentElement.scrollTop = scrollOffset;
        }
      } catch (error) {
        // Cross-origin iframe, can't access content
        console.log('Auto-scroll applied to iframe');
      }
    }
  }, [scrollOffset, externalIframeRef]);

  // Handle manual scroll
  const handleManualScroll = useCallback((direction: 'up' | 'down') => {
    if (!externalIframeRef?.current) return;

    const scrollAmount = 150;
    const newOffset = direction === 'down' 
      ? scrollOffset + scrollAmount 
      : Math.max(0, scrollOffset - scrollAmount);

    setScrollOffset(newOffset);
    setScrollDirection(direction === 'down' ? 1 : -1);
    setTotalScrolls(prev => prev + 1);

    // Update stats for tracking
    updateStats({
      scrollCount: totalScrolls + 1,
      lastScroll: new Date().toISOString()
    });
  }, [scrollOffset, externalIframeRef, totalScrolls, updateStats]);

  // Stats update effect
  useEffect(() => {
    if (user?.id) {
      updateStats({
        refreshCount: totalRefreshes,
        scrollCount: totalScrolls,
        isActive: true
      });
    }
  }, [totalRefreshes, totalScrolls, user?.id, updateStats]);

  if (hasError) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <Card className="w-full max-w-md mx-4 bg-gray-800 border-red-500/30">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2 text-red-400">Connection Error</h3>
            <p className="text-gray-300 mb-6">{errorMessage}</p>
            <div className="flex gap-2 justify-center">
              <Button onClick={onRetry} variant="outline" className="bg-red-600 hover:bg-red-700 text-white border-red-500">
                Retry
              </Button>
              <Button onClick={onClear} variant="ghost" className="text-gray-400 hover:text-white">
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentUrl) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <Card className="w-full max-w-md mx-4 bg-gray-800 border-gray-600">
          <CardContent className="p-6 text-center">
            <Globe className="w-12 h-12 text-blue-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Enter a URL to start browsing</h3>
            <p className="text-gray-400 mb-6">Try one of these examples:</p>
            <div className="space-y-2">
              {exampleUrls.map((url, index) => (
                <Button
                  key={index}
                  onClick={() => onLoadExample(url)}
                  variant="outline"
                  className="w-full bg-gray-700 hover:bg-gray-600 text-white border-gray-600"
                >
                  {url}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-900 text-white relative overflow-hidden">
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-900/90 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-lg font-semibold">Loading...</p>
            <Progress value={33} className="w-48 mt-2" />
          </div>
        </div>
      )}

      {/* Status Dashboard - Collapsible */}
      {showDashboard && (
        <div className="bg-black/90 border-b border-green-500/30 p-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-green-400" />
              <span className="text-sm font-mono text-green-300 font-bold">STATUS DASHBOARD</span>
            </div>
            <Button
              onClick={() => setShowDashboard(false)}
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-green-400 hover:text-green-300 hover:bg-green-500/10"
            >
              <ChevronUp className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* System Status */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-3 h-3 text-green-400" />
                <span className="text-xs font-mono text-green-300 font-bold">SYSTEM STATUS</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-green-300">CONNECTION:</span>
                    <div className="flex items-center gap-1">
                      <Wifi className="w-3 h-3 text-green-400" />
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs font-mono px-1 py-0">
                        ONLINE
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

              {/* Activity Metrics */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-green-500/10 border border-green-500/20 rounded p-2">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <RotateCcw className="w-3 h-3 text-green-400" />
                  </div>
                  <div className="text-lg font-bold font-mono text-green-400">
                    {totalRefreshes}
                  </div>
                  <div className="text-xs text-green-300">REFRESHES</div>
                </div>

                <div className="bg-purple-500/10 border border-purple-500/20 rounded p-2">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <MousePointer className="w-3 h-3 text-purple-400" />
                  </div>
                  <div className="text-lg font-bold font-mono text-purple-400">
                    {totalScrolls}
                  </div>
                  <div className="text-xs text-purple-300">SCROLLS</div>
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded p-2">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Clock className="w-3 h-3 text-yellow-400" />
                  </div>
                  <div className="text-lg font-bold font-mono text-yellow-400">
                    {loadTime}ms
                  </div>
                  <div className="text-xs text-yellow-300">LOAD TIME</div>
                </div>
              </div>
            </div>

            {/* Control Panel */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-3 h-3 text-blue-400" />
                <span className="text-xs font-mono text-blue-300 font-bold">AUTO CONTROLS</span>
              </div>

              <div className="space-y-3">
                {/* Auto Scroll */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-gray-300">AUTO-SCROLL:</span>
                  <Button
                    onClick={() => setAutoScroll(prev => !prev)}
                    variant="ghost"
                    size="sm"
                    className={`h-6 px-2 text-xs font-mono ${
                      autoScrollEnabled 
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30' 
                        : 'bg-gray-500/20 text-gray-400 border border-gray-500/30 hover:bg-gray-500/30'
                    }`}
                  >
                    {autoScrollEnabled ? <Pause className="w-3 h-3 mr-1" /> : <Play className="w-3 h-3 mr-1" />}
                    {autoScrollEnabled ? 'ON' : 'OFF'}
                  </Button>
                </div>

                {/* Auto Refresh */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-gray-300">AUTO-REFRESH:</span>
                  <Button
                    onClick={() => setAutoRefresh(prev => !prev)}
                    variant="ghost"
                    size="sm"
                    className={`h-6 px-2 text-xs font-mono ${
                      autoRefreshEnabled 
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30' 
                        : 'bg-gray-500/20 text-gray-400 border border-gray-500/30 hover:bg-gray-500/30'
                    }`}
                  >
                    {autoRefreshEnabled ? <Pause className="w-3 h-3 mr-1" /> : <Play className="w-3 h-3 mr-1" />}
                    {autoRefreshEnabled ? 'ON' : 'OFF'}
                  </Button>
                </div>

                {/* Refresh Interval */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-gray-300">INTERVAL:</span>
                  <select
                    value={refreshInterval}
                    onChange={(e) => setRefreshInterval(Number(e.target.value))}
                    className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-xs text-white"
                  >
                    <option value={15}>15s</option>
                    <option value={30}>30s</option>
                    <option value={60}>1m</option>
                    <option value={300}>5m</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Collapsed Dashboard Toggle */}
      {!showDashboard && (
        <Button
          onClick={() => setShowDashboard(true)}
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 z-40 h-8 w-8 p-0 bg-black/50 text-green-400 hover:text-green-300 hover:bg-green-500/10 border border-green-500/30"
        >
          <ChevronDown className="w-4 h-4" />
        </Button>
      )}

      {/* External Link Button */}
      <Button
        onClick={handleOpenExternal}
        variant="ghost"
        size="sm"
        className="absolute top-2 left-2 z-40 h-8 px-3 bg-black/50 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 border border-blue-500/30"
      >
        <ExternalLink className="w-3 h-3 mr-1" />
        <span className="text-xs font-mono">OPEN</span>
      </Button>

      {/* Iframe Container */}
      <div className="flex-1 bg-white">
        <iframe
          ref={externalIframeRef}
          src={currentUrl}
          className="w-full h-full border-0"
          title="URL Viewer"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
        />
      </div>
    </div>
  );
}