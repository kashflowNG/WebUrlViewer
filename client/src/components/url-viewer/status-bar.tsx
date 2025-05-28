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
    <footer className="bg-white border-t border-gray-200 px-4 py-2 flex items-center justify-between text-xs text-gray-500">
      <div className="flex items-center space-x-4">
        <span>{connectionStatus}</span>
        {isSecure && currentUrl && (
          <span className="flex items-center gap-1 text-green-600">
            <Lock className="w-3 h-3" />
            Secure
          </span>
        )}
      </div>
      <div className="flex items-center space-x-4">
        {hostname && <span className="truncate max-w-xs">{hostname}</span>}
        <span className="hidden sm:inline">URL Viewer v1.0</span>
      </div>
    </footer>
  );
}
