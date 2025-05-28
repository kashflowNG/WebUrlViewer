import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, ArrowRight, RotateCcw, Globe, ArrowRight as GoArrow, Home, Settings, AlertTriangle } from "lucide-react";
import { validateUrl, normalizeUrl } from "@/lib/url-utils";

interface NavigationBarProps {
  currentUrl: string;
  urlInput: string;
  setUrlInput: (value: string) => void;
  isLoading: boolean;
  canGoBack: boolean;
  canGoForward: boolean;
  onLoadUrl: (url: string) => void;
  onGoBack: () => void;
  onGoForward: () => void;
  onRefresh: () => void;
}

export default function NavigationBar({
  currentUrl,
  urlInput,
  setUrlInput,
  isLoading,
  canGoBack,
  canGoForward,
  onLoadUrl,
  onGoBack,
  onGoForward,
  onRefresh
}: NavigationBarProps) {
  const [urlError, setUrlError] = useState("");

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLoadUrl();
  };

  const handleLoadUrl = () => {
    const trimmedUrl = urlInput.trim();
    if (!trimmedUrl) {
      setUrlError("Please enter a URL");
      return;
    }

    const normalized = normalizeUrl(trimmedUrl);
    const validation = validateUrl(normalized);
    
    if (!validation.valid) {
      setUrlError(validation.error);
      return;
    }

    setUrlError("");
    onLoadUrl(normalized);
  };

  const handleInputChange = (value: string) => {
    setUrlInput(value);
    if (urlError) {
      setUrlError("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLoadUrl();
    }
  };

  const handleHome = () => {
    setUrlInput("");
    setUrlError("");
    onLoadUrl("");
  };

  const getUrlIcon = () => {
    if (urlError) {
      return <AlertTriangle className="h-4 w-4 text-red-400" />;
    }
    if (currentUrl.startsWith('https://')) {
      return <Globe className="h-4 w-4 text-green-500" />;
    }
    return <Globe className="h-4 w-4 text-gray-400" />;
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center px-4 py-3 gap-3">
        {/* Navigation Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 rounded-full hover:bg-gray-100"
            disabled={!canGoBack}
            onClick={onGoBack}
            title="Go back"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 rounded-full hover:bg-gray-100"
            disabled={!canGoForward}
            onClick={onGoForward}
            title="Go forward"
          >
            <ArrowRight className="h-5 w-5 text-gray-600" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 rounded-full hover:bg-gray-100"
            onClick={onRefresh}
            title="Refresh page"
          >
            <RotateCcw className={`h-5 w-5 text-gray-600 transition-transform ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* URL Input */}
        <div className="flex-1 max-w-4xl mx-auto">
          <form onSubmit={handleUrlSubmit} className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {getUrlIcon()}
            </div>
            
            <Input
              type="url"
              value={urlInput}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter URL (https://example.com)"
              className="w-full pl-10 pr-12 py-3 text-sm font-mono"
              autoComplete="url"
              spellCheck={false}
            />
            
            {isLoading ? (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
              </div>
            ) : (
              <Button
                type="submit"
                variant="ghost"
                size="sm"
                className="absolute inset-y-0 right-0 pr-3 h-auto hover:bg-transparent"
              >
                <GoArrow className="h-4 w-4 text-gray-400 hover:text-primary transition-colors" />
              </Button>
            )}
          </form>
          
          {urlError && (
            <div className="mt-2 text-sm text-red-600 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span>{urlError}</span>
            </div>
          )}
        </div>

        {/* Additional Controls */}
        <div className="flex items-center gap-2 md:flex hidden">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 rounded-full hover:bg-gray-100"
            onClick={handleHome}
            title="Home"
          >
            <Home className="h-5 w-5 text-gray-600" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 rounded-full hover:bg-gray-100"
            title="Settings"
          >
            <Settings className="h-5 w-5 text-gray-600" />
          </Button>
        </div>
      </div>
    </header>
  );
}
