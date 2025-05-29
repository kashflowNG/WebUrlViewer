import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Globe, AlertTriangle, ExternalLink, Play, Pause, RotateCcw, Activity, BarChart3, Clock, MousePointer, Wifi, WifiOff, ChevronDown, ChevronUp } from "lucide-react";
import { useWebSocket } from "@/hooks/use-websocket";

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
  const [autoScroll, setAutoScroll] = useState(() => {
    const saved = localStorage.getItem('urlViewer_autoScroll');
    return saved ? JSON.parse(saved) : false;
  });
  const [autoRefresh, setAutoRefresh] = useState(() => {
    const saved = localStorage.getItem('urlViewer_autoRefresh');
    return saved ? JSON.parse(saved) : false;
  });
  const [refreshInterval, setRefreshInterval] = useState(() => {
    const saved = localStorage.getItem('urlViewer_refreshInterval');
    return saved ? JSON.parse(saved) : 30;
  });
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
  
  const { isConnected, connectionStatus, sendMessage } = useWebSocket();

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

  const formatTime = (ms: number) => {
    return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`;
  };

  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem('urlViewer_autoScroll', JSON.stringify(autoScroll));
  }, [autoScroll]);

  useEffect(() => {
    localStorage.setItem('urlViewer_autoRefresh', JSON.stringify(autoRefresh));
  }, [autoRefresh]);

  useEffect(() => {
    localStorage.setItem('urlViewer_refreshInterval', JSON.stringify(refreshInterval));
  }, [refreshInterval]);

  // Keep app active in background using wake lock and visibility API
  useEffect(() => {
    let wakeLock: any = null;

    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLock = await (navigator as any).wakeLock.request('screen');
          console.log('Screen wake lock activated');
        }
      } catch (err) {
        console.log('Wake lock not supported or failed');
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is hidden, but keep timers running
        console.log('Page hidden but keeping auto-features active');
      } else {
        // Page is visible again, reactivate wake lock
        requestWakeLock();
      }
    };

    // Request wake lock initially
    if (autoScroll || autoRefresh) {
      requestWakeLock();
    }

    // Listen for visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (wakeLock) {
        wakeLock.release();
      }
    };
  }, [autoScroll, autoRefresh]);

  // Auto-scroll functionality - simulates scrolling by moving the viewport
  useEffect(() => {
    if (autoScroll && currentUrl && !isLoading) {
      scrollIntervalRef.current = setInterval(() => {
        setScrollOffset(prev => {
          const maxOffset = 2000; // Maximum scroll down in pixels
          const step = 150; // Pixels to scroll each time
          
          let newOffset = prev + (step * scrollDirection);
          let newDirection = scrollDirection;
          
          // Change direction when reaching limits
          if (newOffset >= maxOffset) {
            newDirection = -1;
            newOffset = maxOffset;
          } else if (newOffset <= 0) {
            newDirection = 1;
            newOffset = 0;
          }
          
          setScrollDirection(newDirection);
          setTotalScrolls(prev => prev + 1);
          
          // Send scroll event to WebSocket
          if (sendMessage) {
            sendMessage({
              type: 'scroll_performed',
              offset: newOffset,
              direction: newDirection
            });
          }
          
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
  }, [autoScroll, currentUrl, isLoading, scrollDirection]);

  // Auto-refresh functionality
  useEffect(() => {
    if (autoRefresh && currentUrl && !isLoading) {
      refreshIntervalRef.current = setInterval(() => {
        if (externalIframeRef?.current) {
          // Reload the iframe
          externalIframeRef.current.src = externalIframeRef.current.src;
          setTotalRefreshes(prev => prev + 1);
          
          // Send refresh event to WebSocket
          if (sendMessage) {
            sendMessage({
              type: 'refresh_performed',
              url: currentUrl,
              timestamp: new Date().toISOString()
            });
          }
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
  }, [autoRefresh, currentUrl, isLoading, refreshInterval]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scrollIntervalRef.current) clearInterval(scrollIntervalRef.current);
      if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current);
    };
  }, []);

  // Show welcome state
  if (!currentUrl && !hasError) {
    return (
      <main className="flex-1 relative bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center max-w-lg mx-auto px-6">
          <div className="w-16 h-16 mx-auto mb-6 bg-primary/10 rounded-full flex items-center justify-center">
            <Globe className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Welcome to URL Viewer</h1>
          <p className="text-gray-600 mb-8 text-lg">
            Enter a URL in the address bar above to start browsing websites in this embedded viewer.
          </p>
          
          <Card className="bg-white shadow-lg">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Examples:</h3>
              <div className="space-y-2">
                {exampleUrls.map((url) => (
                  <Button
                    key={url}
                    variant="ghost"
                    className="w-full justify-start text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    onClick={() => onLoadExample(url)}
                  >
                    {url}
                  </Button>
                ))}
              </div>
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-left">
                <h4 className="font-medium text-blue-900 mb-2">Quick Start:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Enter any HTTP or HTTPS URL</li>
                  <li>• Use navigation buttons to go back/forward</li>
                  <li>• Click refresh to reload the current page</li>
                  <li>• Works on mobile and desktop devices</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  // Show error state
  if (hasError) {
    return (
      <main className="flex-1 relative bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-16 h-16 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Unable to Load Page</h2>
          <p className="text-gray-600 mb-6">
            {errorMessage || "The website could not be displayed. This might be due to security restrictions, network issues, or the site blocking iframe embedding."}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={onRetry} className="bg-primary text-white hover:bg-primary/90">
              Try Again
            </Button>
            <Button variant="outline" onClick={handleOpenExternal}>
              <ExternalLink className="w-4 h-4 mr-2" />
              Open in New Tab
            </Button>
            <Button variant="outline" onClick={onClear}>
              Clear URL
            </Button>
          </div>
        </div>
      </main>
    );
  }

  // Show iframe with loading overlay
  return (
    <main className="flex-1 relative overflow-hidden bg-black">
      {/* Status Dashboard */}
      {currentUrl && !hasError && showDashboard && (
        <div className="absolute bottom-4 left-4 z-30 w-80">
          <Card className="bg-black/95 border-green-500/30 backdrop-blur-sm neon-border">
            <CardContent className="p-3 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-green-400" />
                  <span className="text-sm font-mono text-green-400">STATUS DASHBOARD</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDashboard(!showDashboard)}
                  className="h-6 w-6 p-0 text-green-400 hover:bg-green-500/10"
                >
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </div>
              
              {/* Connection Status */}
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
                      <Badge className={`${isConnected ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'} text-xs font-mono px-1 py-0`}>
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

              {/* Activity Metrics */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-green-500/10 border border-green-500/20 rounded p-2">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <RotateCcw className="w-3 h-3 text-green-400" />
                  </div>
                  <div className="text-lg font-bold font-mono text-green-400">
                    {totalRefreshes}
                  </div>
                  <div className="text-xs font-mono text-green-600">REFRESH</div>
                </div>
                
                <div className="bg-blue-500/10 border border-blue-500/20 rounded p-2">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <MousePointer className="w-3 h-3 text-blue-400" />
                  </div>
                  <div className="text-lg font-bold font-mono text-blue-400">
                    {totalScrolls}
                  </div>
                  <div className="text-xs font-mono text-blue-600">SCROLL</div>
                </div>
                
                <div className="bg-purple-500/10 border border-purple-500/20 rounded p-2">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Clock className="w-3 h-3 text-purple-400" />
                  </div>
                  <div className="text-lg font-bold font-mono text-purple-400">
                    {formatTime(loadTime)}
                  </div>
                  <div className="text-xs font-mono text-purple-600">LOAD</div>
                </div>
              </div>

              {/* Auto-Features Status */}
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

              {/* Current Target */}
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
            </CardContent>
          </Card>
        </div>
      )}

      {/* Auto-control buttons */}
      {currentUrl && !hasError && (
        <div className="absolute top-4 right-4 z-30 flex gap-2">
          <div className="bg-black/90 backdrop-blur-sm rounded-lg border border-green-500/30 shadow-lg p-2 flex items-center gap-2 neon-border">
            <Button
              variant={autoScroll ? "default" : "outline"}
              size="sm"
              onClick={() => setAutoScroll(!autoScroll)}
              className="h-8 px-3"
              title={autoScroll ? "Stop auto-scroll" : "Start auto-scroll"}
            >
              {autoScroll ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              <span className="ml-1 text-xs">Scroll</span>
              {autoScroll && <span className="ml-1 text-[10px] bg-green-500 text-white px-1 rounded">ON</span>}
            </Button>
            
            <Button
              variant={autoRefresh ? "default" : "outline"}
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className="h-8 px-3"
              title={autoRefresh ? "Stop auto-refresh" : "Start auto-refresh"}
            >
              <RotateCcw className={`h-4 w-4 ${autoRefresh ? 'animate-spin' : ''}`} />
              <span className="ml-1 text-xs">{refreshInterval}s</span>
              {autoRefresh && <span className="ml-1 text-[10px] bg-green-500 text-white px-1 rounded">ON</span>}
            </Button>
            
            {autoRefresh && (
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                className="text-xs border rounded px-1 py-1 bg-white"
                title="Refresh interval"
              >
                <option value={10}>10s</option>
                <option value={30}>30s</option>
                <option value={60}>1m</option>
                <option value={300}>5m</option>
              </select>
            )}
          </div>
        </div>
      )}

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-20">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-600">Loading page...</p>
          </div>
        </div>
      )}
      
      {/* Web content iframe with scroll simulation */}
      <div className="w-full h-full overflow-hidden">
        <iframe
          ref={externalIframeRef}
          src={currentUrl}
          className="w-full border-0 bg-white block transition-transform duration-1000 ease-in-out"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation"
          loading="eager"
          title="Web Content Viewer"
          style={{ 
            height: 'calc(100% + 2000px)', // Make iframe taller to simulate content
            transform: `translateY(-${scrollOffset}px)`,
            display: 'block'
          }}
        />
      </div>
    </main>
  );
}
