import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Globe, AlertTriangle, ExternalLink } from "lucide-react";

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
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-20">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-600">Loading page...</p>
          </div>
        </div>
      )}
      
      {/* Web content iframe */}
      <iframe
        src={currentUrl}
        className="w-full h-full border-0 bg-white block"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation"
        loading="eager"
        title="Web Content Viewer"
        style={{ minHeight: '100%', display: 'block' }}
      />
    </main>
  );
}
