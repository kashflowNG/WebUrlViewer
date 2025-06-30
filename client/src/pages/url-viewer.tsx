import { useState } from "react";
import NavigationBar from "@/components/url-viewer/navigation-bar";
import WebFrame from "@/components/url-viewer/web-frame";
import StatusBar from "@/components/url-viewer/status-bar";
import StatusDashboard from "@/components/url-viewer/status-dashboard";
import { useUrlNavigation } from "@/hooks/use-url-navigation";

export default function UrlViewer() {
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
    clearError,
    retry,
    iframeRef,

  } = useUrlNavigation();

  const [urlInput, setUrlInput] = useState("");

  return (
    <div className="h-screen flex flex-col bg-gray-50 font-sans overflow-hidden">
      <NavigationBar
        currentUrl={currentUrl}
        urlInput={urlInput}
        setUrlInput={setUrlInput}
        isLoading={isLoading}
        canGoBack={canGoBack}
        canGoForward={canGoForward}
        onLoadUrl={loadUrl}
        onGoBack={goBack}
        onGoForward={goForward}
        onRefresh={refresh}
      />
      
      <WebFrame
        currentUrl={currentUrl}
        isLoading={isLoading}
        hasError={hasError}
        errorMessage={errorMessage}
        onRetry={retry}
        onClear={clearError}
        onLoadExample={loadUrl}
        iframeRef={iframeRef}
      />
      
      <StatusBar
        connectionStatus={connectionStatus}
        currentUrl={currentUrl}
      />
    </div>
  );
}
