import { Lock } from "lucide-react";

interface StatusBarProps {
  connectionStatus: string;
  currentUrl: string;
}

export default function StatusBar({ connectionStatus, currentUrl }: StatusBarProps) {
  const getHostname = (url: string) => {
    try {
      return new URL(url).hostname;
    } catch {
      return "";
    }
  };

  const isSecure = currentUrl.startsWith('https://');
  const hostname = getHostname(currentUrl);

  return (
    <footer className="bg-black/95 border-t border-green-500/30 px-4 py-2 flex items-center justify-between text-xs text-green-400 font-mono backdrop-blur-sm neon-border">
      <div className="flex items-center space-x-4">
        <span className="text-green-300">[STATUS]: {connectionStatus}</span>
        {isSecure && currentUrl && (
          <span className="flex items-center gap-1 text-cyan-400 neon-text">
            <Lock className="w-3 h-3" />
            [ENCRYPTED]
          </span>
        )}
      </div>
      <div className="flex items-center space-x-4">
        {hostname && <span className="truncate max-w-xs text-green-500">[TARGET]: {hostname}</span>}
        <span className="hidden sm:inline text-purple-400">[HACKVIEWER] v2.0</span>
      </div>
    </footer>
  );
}
