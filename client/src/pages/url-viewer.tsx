import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  ArrowRight, 
  RotateCw, 
  Globe, 
  RefreshCw,
  Activity,
  TrendingUp,
  Zap,
  Timer,
  DollarSign,
  Settings,
  BarChart3,
  Sparkles,
  Monitor,
  Play,
  Pause
} from "lucide-react";
import { useUrlNavigation } from "@/hooks/use-url-navigation";
import { useEarnings } from "@/hooks/use-earnings";
import NavigationBar from "@/components/url-viewer/navigation-bar";
import WebFrame from "@/components/url-viewer/web-frame";
import StatusDashboard from "@/components/url-viewer/status-dashboard";
import StatusBar from "@/components/url-viewer/status-bar";
import EarningsDashboard from "@/components/earnings/earnings-dashboard";

export default function UrlViewer() {
  const [urlInput, setUrlInput] = useState("");
  const [autoScroll, setAutoScroll] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [performanceMetrics, setPerformanceMetrics] = useState({
    loadTime: 0,
    refreshCount: 0,
    scrollCount: 0,
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

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh || !currentUrl) return;
    
    const interval = setInterval(() => {
      handleRefresh();
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, currentUrl]);

  // Auto-scroll functionality
  useEffect(() => {
    if (!autoScroll || !iframeRef.current) return;

    const interval = setInterval(() => {
      try {
        const iframe = iframeRef.current;
        if (iframe?.contentWindow) {
          iframe.contentWindow.scrollBy(0, 100);
          handleScroll();
        }
      } catch (error) {
        console.log("Auto-scroll blocked by CORS policy");
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [autoScroll]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6 fade-in">
        {/* Modern Header */}
        <div className="glass-card rounded-2xl p-8 slide-up">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 modern-button rounded-2xl flex items-center justify-center">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gradient">WebViewer Pro</h1>
                <p className="text-muted-foreground text-lg">Professional web browsing and analytics platform</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="px-4 py-2 text-sm">
                <Activity className="w-4 h-4 mr-2 status-online" />
                {connectionStatus}
              </Badge>
              {earningsData.user && (
                <Badge variant="secondary" className="px-4 py-2 text-sm">
                  <DollarSign className="w-4 h-4 mr-2 status-earning" />
                  ${parseFloat(earningsData.user.totalEarnings).toFixed(6)}
                </Badge>
              )}
            </div>
          </div>
          
          <NavigationBar
            currentUrl={currentUrl}
            urlInput={urlInput}
            setUrlInput={setUrlInput}
            isLoading={isLoading}
            canGoBack={canGoBack}
            canGoForward={canGoForward}
            onLoadUrl={handleLoadUrl}
            onGoBack={goBack}
            onGoForward={goForward}
            onRefresh={handleRefresh}
          />
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Main Content Area */}
          <div className="col-span-8 space-y-6">
            <div className="slide-up">
              <WebFrame
                currentUrl={currentUrl}
                isLoading={isLoading}
                hasError={hasError}
                errorMessage={errorMessage}
                onRetry={handleRefresh}
                onClear={handleClear}
                onLoadExample={handleLoadUrl}
                iframeRef={iframeRef}
              />
            </div>
            
            <div className="slide-up">
              <StatusBar
                connectionStatus={connectionStatus}
                currentUrl={currentUrl}
              />
            </div>
          </div>

          {/* Sidebar Controls */}
          <div className="col-span-4 space-y-6">
            {/* Automation Panel */}
            <Card className="slide-up">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Settings className="w-4 h-4 text-primary" />
                  </div>
                  Automation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                    <div className="space-y-1">
                      <p className="font-medium">Auto Refresh</p>
                      <p className="text-sm text-muted-foreground">Automatically reload content</p>
                    </div>
                    <Switch
                      checked={autoRefresh}
                      onCheckedChange={setAutoRefresh}
                    />
                  </div>
                  
                  {autoRefresh && (
                    <div className="space-y-3 p-4 rounded-lg bg-primary/5 border border-primary/10">
                      <p className="font-medium text-sm">Refresh Interval</p>
                      <Slider
                        value={[refreshInterval]}
                        onValueChange={(value) => setRefreshInterval(value[0])}
                        max={300}
                        min={15}
                        step={15}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>15s</span>
                        <span className="font-medium text-primary">{refreshInterval}s</span>
                        <span>300s</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                    <div className="space-y-1">
                      <p className="font-medium">Auto Scroll</p>
                      <p className="text-sm text-muted-foreground">Scroll content automatically</p>
                    </div>
                    <Switch
                      checked={autoScroll}
                      onCheckedChange={setAutoScroll}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    onClick={handleRefresh}
                    disabled={isLoading}
                    className="modern-button"
                    size="sm"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                  <Button 
                    onClick={handleClear}
                    variant="outline"
                    size="sm"
                  >
                    Clear
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Analytics Panel */}
            <Card className="slide-up">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                    <BarChart3 className="w-4 h-4 text-accent" />
                  </div>
                  Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="metric-card text-center">
                    <div className="metric-value text-lg">{performanceMetrics.refreshCount}</div>
                    <div className="metric-label">Refreshes</div>
                  </div>
                  <div className="metric-card text-center">
                    <div className="metric-value text-lg">{performanceMetrics.scrollCount}</div>
                    <div className="metric-label">Scrolls</div>
                  </div>
                  <div className="metric-card text-center">
                    <div className="metric-value text-lg">{performanceMetrics.loadTime}ms</div>
                    <div className="metric-label">Load Time</div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Auto Refresh</span>
                    <Badge variant={autoRefresh ? "default" : "secondary"} className="text-xs">
                      {autoRefresh ? <Play className="w-3 h-3 mr-1" /> : <Pause className="w-3 h-3 mr-1" />}
                      {autoRefresh ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Auto Scroll</span>
                    <Badge variant={autoScroll ? "default" : "secondary"} className="text-xs">
                      {autoScroll ? <Play className="w-3 h-3 mr-1" /> : <Pause className="w-3 h-3 mr-1" />}
                      {autoScroll ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  {currentUrl && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Current URL</span>
                      <Badge variant="outline" className="text-xs">
                        <Monitor className="w-3 h-3 mr-1" />
                        Loaded
                      </Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Earnings Panel */}
            <Card className="slide-up">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-green-500" />
                  </div>
                  Earnings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <EarningsDashboard />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}