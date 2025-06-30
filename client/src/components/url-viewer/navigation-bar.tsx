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
      return <Globe className="h-4 w-4 text-cyan-500" />;
    }
    return <Globe className="h-4 w-4 text-gray-400" />;
  };

  return (
    <header className="bg-black/95 border-b border-purple-500/30 shadow-lg backdrop-blur-sm neon-border">
      <div className="flex items-center px-4 py-3 gap-3">
        {/* Navigation Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 bg-black/50 border border-purple-500/30 hover:bg-purple-500/20 hover:border-purple-400 neon-glow disabled:opacity-30"
            disabled={!canGoBack}
            onClick={onGoBack}
            title="Go back"
          >
            <ArrowLeft className="h-5 w-5 text-purple-400" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 bg-black/50 border border-purple-500/30 hover:bg-purple-500/20 hover:border-purple-400 neon-glow disabled:opacity-30"
            disabled={!canGoForward}
            onClick={onGoForward}
            title="Go forward"
          >
            <ArrowRight className="h-5 w-5 text-purple-400" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 bg-black/50 border border-purple-500/30 hover:bg-purple-500/20 hover:border-purple-400 neon-glow"
            onClick={onRefresh}
            title="Refresh page"
          >
            <RotateCcw className={`h-5 w-5 text-purple-400 transition-transform ${isLoading ? 'animate-spin' : ''}`} />
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
              placeholder="$ ./target_url --access https://example.com"
              className="w-full pl-10 pr-12 py-3 text-sm font-mono bg-black/60 border-cyan-500/50 text-cyan-300 placeholder:text-cyan-600/60 focus:border-cyan-400 focus:ring-cyan-400/30 neon-border"
              autoComplete="url"
              spellCheck={false}
            />

            {isLoading ? (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <div className="animate-spin h-4 w-4 border-2 border-cyan-400 border-t-transparent rounded-full" />
              </div>
            ) : (
              <Button
                type="submit"
                variant="ghost"
                size="sm"
                className="absolute inset-y-0 right-0 pr-3 h-auto hover:bg-purple-500/20 text-purple-400 hover:text-purple-300"
              >
                <GoArrow className="h-4 w-4 transition-colors" />
              </Button>
            )}
          </form>

          {urlError && (
            <div className="mt-2 text-sm text-red-400 flex items-center gap-2 neon-text">
              <AlertTriangle className="w-4 h-4" />
              <span className="font-mono">ERROR: {urlError}</span>
            </div>
          )}
        </div>

        {/* Additional Controls */}
        <div className="flex items-center gap-2 md:flex hidden">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 bg-black/50 border border-purple-500/30 hover:bg-purple-500/20 hover:border-purple-400 neon-glow"
            onClick={handleHome}
            title="Home"
          >
            <Home className="h-5 w-5 text-purple-400" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 bg-black/50 border border-cyan-500/30 hover:bg-cyan-500/20 hover:border-cyan-400 neon-glow"
            title="Settings"
          >
            <Settings className="h-5 w-5 text-cyan-400" />
          </Button>
        </div>
      </div>
    </header>
  );
}