import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Globe, AlertTriangle, ExternalLink, Play, Pause, RotateCcw, Settings, Monitor, Smartphone, Tablet, RefreshCw, Clock, Activity, Zap, Shield, Eye, MousePointer, Maximize2, Minimize2, Volume2, VolumeX, Layers, Download, Share2, Code, Terminal, Wifi, WifiOff, ChevronDown, ChevronUp } from "lucide-react";
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

export default function WebFrameAdvanced({
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
  const [scrollDirection, setScrollDirection] = useState(1);
  const [scrollSpeed, setScrollSpeed] = useState(2500);
  const [viewportMode, setViewportMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('connected');
  const [performanceMetrics, setPerformanceMetrics] = useState({
    loadTime: 0,
    refreshCount: 0,
    scrollCount: 0
  });
  
  const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const loadStartTime = useRef<number>(0);
  
  const { isConnected, sendMessage } = useWebSocket();

  const exampleUrls = [
    { url: "https://example.com", title: "Example Domain", category: "Demo" },
    { url: "https://httpbin.org", title: "HTTP Testing Service", category: "API" },
    { url: "https://jsonplaceholder.typicode.com", title: "JSON Placeholder", category: "API" },
    { url: "https://news.ycombinator.com", title: "Hacker News", category: "Tech" },
    { url: "https://github.com", title: "GitHub", category: "Code" }
  ];

  const viewportSizes = {
    desktop: { width: '100%', height: '100%' },
    tablet: { width: '768px', height: '1024px' },
    mobile: { width: '375px', height: '667px' }
  };

  // Simulate loading progress
  useEffect(() => {
    if (isLoading) {
      loadStartTime.current = Date.now();
      setLoadingProgress(0);
      const progressInterval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 20;
        });
      }, 200);

      return () => clearInterval(progressInterval);
    } else {
      setLoadingProgress(100);
      if (loadStartTime.current > 0) {
        const loadTime = Date.now() - loadStartTime.current;
        setPerformanceMetrics(prev => ({ ...prev, loadTime }));
      }
    }
  }, [isLoading]);

  // WebSocket connection status
  useEffect(() => {
    setConnectionStatus(isConnected ? 'connected' : 'disconnected');
  }, [isConnected]);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('urlViewer_autoScroll', JSON.stringify(autoScroll));
  }, [autoScroll]);

  useEffect(() => {
    localStorage.setItem('urlViewer_autoRefresh', JSON.stringify(autoRefresh));
  }, [autoRefresh]);

  useEffect(() => {
    localStorage.setItem('urlViewer_refreshInterval', JSON.stringify(refreshInterval));
  }, [refreshInterval]);

  // Enhanced auto-scroll with configurable speed
  useEffect(() => {
    if (autoScroll && currentUrl && !isLoading) {
      scrollIntervalRef.current = setInterval(() => {
        setScrollOffset(prev => {
          const maxOffset = 2000;
          const step = 150;
          
          let newOffset = prev + (step * scrollDirection);
          let newDirection = scrollDirection;
          
          if (newOffset >= maxOffset) {
            newDirection = -1;
            newOffset = maxOffset;
          } else if (newOffset <= 0) {
            newDirection = 1;
            newOffset = 0;
          }
          
          setScrollDirection(newDirection);
          setPerformanceMetrics(prev => ({ ...prev, scrollCount: prev.scrollCount + 1 }));
          
          // Send scroll event to WebSocket
          sendMessage({
            type: 'scroll_performed',
            offset: newOffset,
            direction: newDirection
          });
          
          return newOffset;
        });
      }, scrollSpeed);
    } else {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
        scrollIntervalRef.current = null;
      }
      setScrollOffset(0);
      setScrollDirection(1);
    }

    return () => {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
      }
    };
  }, [autoScroll, currentUrl, isLoading, scrollDirection, scrollSpeed, sendMessage]);

  // Enhanced auto-refresh
  useEffect(() => {
    if (autoRefresh && currentUrl && !isLoading) {
      refreshIntervalRef.current = setInterval(() => {
        if (externalIframeRef?.current) {
          externalIframeRef.current.src = externalIframeRef.current.src;
          setPerformanceMetrics(prev => ({ ...prev, refreshCount: prev.refreshCount + 1 }));
          
          // Send refresh event to WebSocket
          sendMessage({
            type: 'refresh_performed',
            url: currentUrl,
            timestamp: new Date().toISOString()
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
  }, [autoRefresh, currentUrl, isLoading, refreshInterval, sendMessage]);

  const handleFullscreenToggle = () => {
    setIsFullscreen(!isFullscreen);
    setControlsVisible(!isFullscreen);
  };

  const handleViewportChange = (mode: 'desktop' | 'tablet' | 'mobile') => {
    setViewportMode(mode);
  };

  const handleOpenExternal = () => {
    if (currentUrl) {
      window.open(currentUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const formatTime = (ms: number) => {
    return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`;
  };

  // Welcome state with advanced examples
  if (!currentUrl && !hasError) {
    return (
      <main className="flex-1 relative bg-gradient-to-br from-black via-gray-900 to-black overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-cyan-500/10 to-blue-500/10 animate-pulse"></div>
          <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
        </div>
        
        <div className="relative z-10 flex items-center justify-center min-h-full p-6">
          <div className="text-center max-w-4xl mx-auto">
            <div className="mb-8">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-green-500 to-cyan-500 rounded-full flex items-center justify-center neon-glow">
                <Globe className="w-10 h-10 text-black" />
              </div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-green-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent mb-4 neon-text">
                ADVANCED WEB VIEWER
              </h1>
              <p className="text-xl text-green-300/80 mb-2 font-mono">
                &gt; Cyberpunk Browser Interface v2.0
              </p>
              <p className="text-green-500/60 font-mono text-sm">
                $ ./initialize --target=web_viewer --mode=advanced
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Quick Launch */}
              <Card className="bg-black/80 border-green-500/30 neon-border backdrop-blur-sm">
                <CardContent className="pt-6">
                  <h3 className="font-bold text-green-400 mb-4 flex items-center gap-2 font-mono">
                    <Zap className="w-5 h-5" />
                    QUICK LAUNCH
                  </h3>
                  <div className="space-y-3">
                    {exampleUrls.map((example) => (
                      <Button
                        key={example.url}
                        variant="ghost"
                        className="w-full justify-between bg-black/50 border border-green-500/20 hover:bg-green-500/10 hover:border-green-400/50 text-green-300 font-mono text-left neon-glow"
                        onClick={() => onLoadExample(example.url)}
                      >
                        <div className="flex flex-col items-start">
                          <span className="text-green-400">{example.title}</span>
                          <span className="text-xs text-green-600">{example.url}</span>
                        </div>
                        <Badge variant="secondary" className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                          {example.category}
                        </Badge>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* System Status */}
              <Card className="bg-black/80 border-cyan-500/30 neon-border backdrop-blur-sm">
                <CardContent className="pt-6">
                  <h3 className="font-bold text-cyan-400 mb-4 flex items-center gap-2 font-mono">
                    <Activity className="w-5 h-5" />
                    SYSTEM STATUS
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-green-300 font-mono text-sm">Connection:</span>
                      <div className="flex items-center gap-2">
                        {connectionStatus === 'connected' ? (
                          <Wifi className="w-4 h-4 text-green-400" />
                        ) : (
                          <WifiOff className="w-4 h-4 text-red-400" />
                        )}
                        <span className={`font-mono text-xs ${connectionStatus === 'connected' ? 'text-green-400' : 'text-red-400'}`}>
                          {connectionStatus.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-green-300 font-mono text-sm">Auto-Features:</span>
                      <div className="flex gap-2">
                        <Badge className={`${autoScroll ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'} border-0 font-mono`}>
                          SCROLL {autoScroll ? 'ON' : 'OFF'}
                        </Badge>
                        <Badge className={`${autoRefresh ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'} border-0 font-mono`}>
                          REFRESH {autoRefresh ? 'ON' : 'OFF'}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 mt-4">
                      <h4 className="font-mono text-green-400 text-sm mb-2">CAPABILITIES:</h4>
                      <ul className="text-xs text-green-300/80 space-y-1 font-mono">
                        <li>• Multi-viewport simulation (Desktop/Tablet/Mobile)</li>
                        <li>• Intelligent auto-scroll with direction control</li>
                        <li>• Configurable refresh intervals</li>
                        <li>• Real-time performance monitoring</li>
                        <li>• Telegram bot remote control integration</li>
                        <li>• Wake lock for background persistence</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="text-center">
              <p className="text-green-500/60 font-mono text-sm">
                Enter target URL in command interface above to initiate browsing sequence
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Enhanced error state
  if (hasError) {
    return (
      <main className="flex-1 relative bg-gradient-to-br from-red-900/20 via-black to-red-900/20 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-20 h-20 mx-auto mb-6 bg-red-500/20 rounded-full flex items-center justify-center border border-red-500/30 neon-glow">
            <AlertTriangle className="w-10 h-10 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-red-400 mb-3 font-mono">SYSTEM ERROR</h2>
          <p className="text-red-300/80 mb-6 font-mono text-sm">
            {errorMessage || "TARGET UNREACHABLE: Connection failed due to security protocols or network restrictions"}
          </p>
          <div className="flex flex-col gap-3">
            <Button 
              onClick={onRetry} 
              className="bg-red-600/80 text-white hover:bg-red-500 border border-red-500/50 font-mono neon-glow"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              RETRY CONNECTION
            </Button>
            <Button 
              variant="outline" 
              onClick={handleOpenExternal}
              className="border-red-500/30 text-red-400 hover:bg-red-500/10 font-mono"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              EXTERNAL ACCESS
            </Button>
            <Button 
              variant="outline" 
              onClick={onClear}
              className="border-gray-500/30 text-gray-400 hover:bg-gray-500/10 font-mono"
            >
              CLEAR TARGET
            </Button>
          </div>
        </div>
      </main>
    );
  }

  // Advanced iframe view
  return (
    <TooltipProvider>
      <main className={`flex-1 relative overflow-hidden bg-black ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
        {/* Advanced Control Panel */}
        {controlsVisible && (
          <div className="absolute top-4 right-4 z-30 space-y-2">
            {/* Main Controls */}
            <Card className="bg-black/90 border-green-500/30 backdrop-blur-sm neon-border">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-3">
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30 font-mono text-xs">
                    ACTIVE
                  </Badge>
                  <Badge className={`${connectionStatus === 'connected' ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'} font-mono text-xs`}>
                    {connectionStatus === 'connected' ? 'ONLINE' : 'OFFLINE'}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={autoScroll ? "default" : "outline"}
                        size="sm"
                        onClick={() => setAutoScroll(!autoScroll)}
                        className={`font-mono text-xs ${autoScroll ? 'bg-green-600 hover:bg-green-700 neon-glow' : 'border-green-500/30 text-green-400 hover:bg-green-500/10'}`}
                      >
                        {autoScroll ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                        <span className="ml-1">SCROLL</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-black border-green-500/30 text-green-400">
                      Auto-scroll: {autoScroll ? 'Active' : 'Inactive'}
                    </TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={autoRefresh ? "default" : "outline"}
                        size="sm"
                        onClick={() => setAutoRefresh(!autoRefresh)}
                        className={`font-mono text-xs ${autoRefresh ? 'bg-blue-600 hover:bg-blue-700 neon-glow' : 'border-blue-500/30 text-blue-400 hover:bg-blue-500/10'}`}
                      >
                        <RotateCcw className={`h-3 w-3 ${autoRefresh ? 'animate-spin' : ''}`} />
                        <span className="ml-1">{refreshInterval}s</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-black border-blue-500/30 text-blue-400">
                      Auto-refresh: Every {refreshInterval} seconds
                    </TooltipContent>
                  </Tooltip>
                </div>
                
                {/* Viewport Controls */}
                <div className="mt-3 pt-3 border-t border-green-500/20">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-green-400 font-mono">VIEWPORT:</span>
                    <div className="flex gap-1">
                      {(['desktop', 'tablet', 'mobile'] as const).map((mode) => (
                        <Button
                          key={mode}
                          variant={viewportMode === mode ? "default" : "ghost"}
                          size="sm"
                          onClick={() => handleViewportChange(mode)}
                          className={`h-6 w-6 p-0 ${viewportMode === mode ? 'bg-cyan-600 neon-glow' : 'border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10'}`}
                        >
                          {mode === 'desktop' && <Monitor className="h-3 w-3" />}
                          {mode === 'tablet' && <Tablet className="h-3 w-3" />}
                          {mode === 'mobile' && <Smartphone className="h-3 w-3" />}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Performance Metrics */}
                <div className="mt-3 pt-3 border-t border-green-500/20">
                  <div className="space-y-1 text-xs font-mono">
                    <div className="flex justify-between text-green-400">
                      <span>Load Time:</span>
                      <span>{formatTime(performanceMetrics.loadTime)}</span>
                    </div>
                    <div className="flex justify-between text-cyan-400">
                      <span>Refreshes:</span>
                      <span>{performanceMetrics.refreshCount}</span>
                    </div>
                    <div className="flex justify-between text-blue-400">
                      <span>Scrolls:</span>
                      <span>{performanceMetrics.scrollCount}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Advanced Settings */}
            <Card className="bg-black/90 border-cyan-500/30 backdrop-blur-sm neon-border">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-cyan-400 font-mono">ADVANCED</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setControlsVisible(!controlsVisible)}
                    className="h-5 w-5 p-0 text-cyan-400 hover:bg-cyan-500/10"
                  >
                    {controlsVisible ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleFullscreenToggle}
                        className="w-full font-mono text-xs border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
                      >
                        {isFullscreen ? <Minimize2 className="h-3 w-3 mr-1" /> : <Maximize2 className="h-3 w-3 mr-1" />}
                        {isFullscreen ? 'EXIT' : 'FULLSCREEN'}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-black border-purple-500/30 text-purple-400">
                      Toggle fullscreen mode
                    </TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleOpenExternal}
                        className="w-full font-mono text-xs border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        EXTERNAL
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-black border-orange-500/30 text-orange-400">
                      Open in new tab
                    </TooltipContent>
                  </Tooltip>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Loading Overlay with Progress */}
        {isLoading && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-20">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin neon-glow"></div>
              <div className="mb-4">
                <Progress value={loadingProgress} className="w-64 h-2 bg-black border border-green-500/30" />
              </div>
              <p className="text-green-400 font-mono text-sm">ESTABLISHING CONNECTION...</p>
              <p className="text-green-600 font-mono text-xs mt-1">{Math.round(loadingProgress)}%</p>
            </div>
          </div>
        )}

        {/* Iframe Container with Viewport Simulation */}
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900">
          <div 
            className="relative border border-green-500/30 neon-border bg-white overflow-hidden"
            style={{
              width: viewportSizes[viewportMode].width,
              height: viewportSizes[viewportMode].height,
              maxWidth: '100%',
              maxHeight: '100%'
            }}
          >
            <iframe
              ref={externalIframeRef}
              src={currentUrl}
              className="w-full border-0 bg-white block transition-transform duration-1000 ease-in-out"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation"
              loading="eager"
              title="Advanced Web Content Viewer"
              style={{ 
                height: 'calc(100% + 2000px)',
                transform: `translateY(-${scrollOffset}px)`,
                display: 'block'
              }}
            />
          </div>
        </div>

        {/* Minimal Controls Toggle */}
        {!controlsVisible && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setControlsVisible(true)}
            className="absolute top-4 right-4 z-30 bg-black/80 border border-green-500/30 text-green-400 hover:bg-green-500/10 neon-glow"
          >
            <Settings className="h-4 w-4" />
          </Button>
        )}
      </main>
    </TooltipProvider>
  );
}