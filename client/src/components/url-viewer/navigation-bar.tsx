import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, ArrowRight, RotateCw, Globe, Search, Home, Bookmark } from "lucide-react";
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

  const exampleSites = [
    { name: "Google", url: "https://google.com" },
    { name: "Wikipedia", url: "https://wikipedia.org" },
    { name: "GitHub", url: "https://github.com" },
    { name: "Stack Overflow", url: "https://stackoverflow.com" }
  ];

  const handleExampleLoad = (url: string) => {
    setUrlInput(url);
    onLoadUrl(url);
  };

  return (
    <div className="space-y-4">
      {/* Navigation Controls */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onGoBack}
            disabled={!canGoBack}
            className="w-10 h-10 p-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onGoForward}
            disabled={!canGoForward}
            className="w-10 h-10 p-0"
          >
            <ArrowRight className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
            className="w-10 h-10 p-0"
          >
            <RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* URL Input */}
        <form onSubmit={handleUrlSubmit} className="flex-1 flex gap-2">
          <div className="flex-1 relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <Globe className="w-4 h-4 text-muted-foreground" />
            </div>
            <Input
              type="text"
              placeholder="Enter URL or search..."
              value={urlInput}
              onChange={(e) => {
                setUrlInput(e.target.value);
                setUrlError("");
              }}
              className="pl-10 url-input h-12"
              disabled={isLoading}
            />
          </div>
          <Button 
            type="submit" 
            disabled={isLoading}
            className="modern-button h-12 px-6"
          >
            {isLoading ? (
              <div className="modern-spinner w-4 h-4" />
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Go
              </>
            )}
          </Button>
        </form>
      </div>

      {/* Error Message */}
      {urlError && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-sm text-destructive">{urlError}</p>
        </div>
      )}

      {/* Current URL Display */}
      {currentUrl && (
        <div className="p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm text-muted-foreground">Currently viewing:</span>
            <span className="text-sm font-mono text-foreground truncate">{currentUrl}</span>
          </div>
        </div>
      )}

      {/* Quick Access */}
      {!currentUrl && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">Quick Access</p>
          <div className="grid grid-cols-2 gap-2">
            {exampleSites.map((site) => (
              <Button
                key={site.name}
                variant="outline"
                size="sm"
                onClick={() => handleExampleLoad(site.url)}
                className="justify-start h-10"
              >
                <Bookmark className="w-3 h-3 mr-2" />
                {site.name}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}