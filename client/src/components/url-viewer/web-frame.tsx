import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Globe, AlertTriangle, ExternalLink, Play, Pause, RotateCcw } from "lucide-react";

interface WebFrameProps {
  currentUrl: string;
  isLoading: boolean;
  hasError: boolean;
  errorMessage: string;
  onRetry: () => void;
  onClear: () => void;
  onLoadExample: (url: string) => void;
}

export default function WebFrame({
  currentUrl,
  isLoading,
  hasError,
  errorMessage,
  onRetry,
  onClear,
  onLoadExample
}: WebFrameProps) {
  const [autoScroll, setAutoScroll] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds
  const [scrollOffset, setScrollOffset] = useState(0);
  const [scrollDirection, setScrollDirection] = useState(1); // 1 for down, -1 for up
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

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
        if (iframeRef.current) {
          // Reload the iframe
          iframeRef.current.src = iframeRef.current.src;
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
    <main className="flex-1 relative overflow-hidden bg-white">
      {/* Auto-control buttons */}
      {currentUrl && !hasError && (
        <div className="absolute top-4 right-4 z-30 flex gap-2">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg border shadow-lg p-2 flex items-center gap-2">
            <Button
              variant={autoScroll ? "default" : "outline"}
              size="sm"
              onClick={() => setAutoScroll(!autoScroll)}
              className="h-8 px-3"
              title={autoScroll ? "Stop auto-scroll" : "Start auto-scroll"}
            >
              {autoScroll ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              <span className="ml-1 text-xs">Scroll</span>
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
          ref={iframeRef}
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
