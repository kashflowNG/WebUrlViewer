import { useState, useRef, useEffect } from "react";
import { 
  Globe, Activity, DollarSign, RefreshCw, Mouse, Settings, 
  ChevronLeft, ChevronRight, ArrowRight, X, Play, Zap 
} from "lucide-react";
import { useUrlNavigation } from "@/hooks/use-url-navigation";
import { useEarnings } from "@/hooks/use-earnings";
import { Switch } from "@/components/ui/switch";

export default function UrlViewer() {
  const [urlInput, setUrlInput] = useState("");
  const [autoScroll, setAutoScroll] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(5);
  const [performanceMetrics, setPerformanceMetrics] = useState({
    loadTime: 0,
    refreshCount: 0,
    scrollCount: 0
  });
  
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  const {
    currentUrl,
    isLoading,
    canGoBack,
    canGoForward,
    hasError,
    errorMessage,
    connectionStatus,
    loadUrl,
    goBack,
    goForward,
    refresh,
    clearError
  } = useUrlNavigation();
  
  const earningsData = useEarnings();

  const handleLoadUrl = (url: string) => {
    const startTime = Date.now();
    loadUrl(url);
    setPerformanceMetrics(prev => ({
      ...prev,
      loadTime: Date.now() - startTime
    }));
  };

  const handleRefresh = () => {
    const startTime = Date.now();
    refresh();
    setPerformanceMetrics(prev => ({
      ...prev,
      refreshCount: prev.refreshCount + 1,
      loadTime: Date.now() - startTime
    }));
  };

  const handleScroll = () => {
    setPerformanceMetrics(prev => ({
      ...prev,
      scrollCount: prev.scrollCount + 1
    }));
  };

  const handleClear = () => {
    setUrlInput("");
    clearError();
  };

  const submitUrl = () => {
    if (urlInput.trim()) {
      handleLoadUrl(urlInput.trim());
    }
  };

  // Auto refresh effect
  useEffect(() => {
    if (autoRefresh && currentUrl && refreshInterval > 0) {
      const interval = setInterval(() => {
        handleRefresh();
      }, refreshInterval * 1000);
      
      return () => clearInterval(interval);
    }
  }, [autoRefresh, currentUrl, refreshInterval]);

  // Auto scroll effect
  useEffect(() => {
    if (autoScroll && iframeRef.current) {
      const iframe = iframeRef.current;
      
      const scrollInterval = setInterval(() => {
        try {
          if (iframe.contentWindow) {
            iframe.contentWindow.scrollBy(0, 100);
            handleScroll();
          }
        } catch (error) {
          console.log("Cannot auto-scroll due to CORS restrictions");
        }
      }, 2000);
      
      return () => clearInterval(scrollInterval);
    }
  }, [autoScroll, currentUrl]);

  return (
    <div className="mobile-container">
      {/* Mobile Header */}
      <div className="mobile-header">
        {/* Mobile Status Bar */}
        <div className="mobile-status-bar">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-green-400"></div>
            <span>9:41</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="flex space-x-1">
              <div className="w-1 h-3 bg-white rounded-full opacity-60"></div>
              <div className="w-1 h-3 bg-white rounded-full opacity-80"></div>
              <div className="w-1 h-3 bg-white rounded-full"></div>
              <div className="w-1 h-3 bg-white rounded-full"></div>
            </div>
            <div className="w-6 h-3 border border-white rounded-sm relative">
              <div className="w-4 h-1 bg-white rounded-full absolute top-1 left-1"></div>
            </div>
          </div>
        </div>

        {/* App Title */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
              <Globe className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Money Machine</h1>
              <p className="text-sm opacity-80">URL Browser</p>
            </div>
          </div>
          
          {earningsData.user && (
            <div className="text-right">
              <div className="text-lg font-bold">${parseFloat(earningsData.user.totalEarnings).toFixed(6)}</div>
              <div className="text-xs opacity-80">Total Earnings</div>
            </div>
          )}
        </div>

        {/* Mobile Navigation Input */}
        <div className="mobile-navigation">
          <div className="flex items-center space-x-2">
            <button 
              onClick={goBack}
              disabled={!canGoBack}
              className="p-2 rounded-lg bg-white/20 disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button 
              onClick={goForward}
              disabled={!canGoForward}
              className="p-2 rounded-lg bg-white/20 disabled:opacity-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <div className="flex-1">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && submitUrl()}
                placeholder="Enter URL..."
                className="mobile-input text-sm"
              />
            </div>
            <button 
              onClick={submitUrl}
              disabled={!urlInput.trim()}
              className="p-2 rounded-lg bg-white/30 disabled:opacity-50"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Content */}
      <div className="mobile-content">
        {/* Status Cards */}
        <div className="mobile-stats-grid">
          <div className="mobile-stat-card">
            <div className="flex items-center justify-center mb-2">
              <Activity className={`w-5 h-5 ${connectionStatus === 'Connected' ? 'status-online' : 'status-loading'}`} />
            </div>
            <div className="text-lg font-bold">{connectionStatus}</div>
            <div className="text-xs opacity-70">Connection</div>
          </div>
          
          <div className="mobile-stat-card">
            <div className="flex items-center justify-center mb-2">
              <RefreshCw className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-lg font-bold">{performanceMetrics.refreshCount}</div>
            <div className="text-xs opacity-70">Refreshes</div>
          </div>
        </div>

        {/* Web Frame */}
        <div className="mobile-card">
          <div className="mobile-iframe-container">
            {currentUrl ? (
              <iframe
                ref={iframeRef}
                src={currentUrl}
                className="w-full h-full border-0"
                sandbox="allow-scripts allow-same-origin allow-forms allow-navigation"
                title="Website Viewer"
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-gray-50 text-gray-500">
                <div className="text-center">
                  <Globe className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Enter a URL to get started</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Controls */}
        <div className="mobile-card">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Automation
          </h3>
          
          <div className="space-y-4">
            {/* Auto Refresh */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <RefreshCw className="w-4 h-4 text-blue-500" />
                <span className="font-medium">Auto Refresh</span>
              </div>
              <Switch 
                checked={autoRefresh} 
                onCheckedChange={setAutoRefresh}
              />
            </div>
            
            {autoRefresh && (
              <div className="bg-gray-50 rounded-xl p-3">
                <label className="text-sm text-gray-600 mb-2 block">
                  Interval: {refreshInterval} seconds
                </label>
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={refreshInterval}
                  onChange={(e) => setRefreshInterval(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            )}
            
            {/* Auto Scroll */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Mouse className="w-4 h-4 text-green-500" />
                <span className="font-medium">Auto Scroll</span>
              </div>
              <Switch 
                checked={autoScroll} 
                onCheckedChange={setAutoScroll}
              />
            </div>
          </div>
        </div>

        {/* Mobile Action Buttons */}
        <div className="mobile-controls">
          <button 
            onClick={handleRefresh}
            disabled={!currentUrl}
            className="mobile-button bg-blue-500 text-white disabled:opacity-50 flex items-center justify-center"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
          <button 
            onClick={handleClear}
            className="mobile-button bg-gray-500 text-white flex items-center justify-center"
          >
            <X className="w-4 h-4 mr-2" />
            Clear
          </button>
        </div>

        {/* Earnings Stats */}
        {earningsData.earnings && earningsData.earnings.length > 0 && (
          <div className="mobile-card">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              Recent Earnings
            </h3>
            <div className="space-y-2">
              {earningsData.earnings.slice(0, 3).map((earning) => (
                <div key={earning.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                  <span className="text-sm text-gray-600">
                    {new Date(earning.earnedAt).toLocaleDateString()}
                  </span>
                  <span className="font-semibold text-green-600">
                    +${parseFloat(earning.amount).toFixed(6)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}