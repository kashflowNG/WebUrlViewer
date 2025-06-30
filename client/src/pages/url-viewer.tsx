import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NavigationBar from "@/components/url-viewer/navigation-bar";
import WebFrame from "@/components/url-viewer/web-frame";
import StatusBar from "@/components/url-viewer/status-bar";
import EarningsDashboard from "@/components/earnings/earnings-dashboard";
import { useUrlNavigation } from "@/hooks/use-url-navigation";
import { DollarSign, Globe } from "lucide-react";

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
    <div className="h-screen flex flex-col money-gradient overflow-hidden">
      {/* Money Machine Header */}
      <div className="bg-black/80 border-b border-yellow-500/30 p-2">
        <div className="flex items-center justify-center gap-3">
          <DollarSign className="h-6 w-6 status-earning" />
          <h1 className="text-xl font-bold money-counter">
            MONEY MACHINE URL VIEWER
          </h1>
          <DollarSign className="h-6 w-6 status-earning" />
        </div>
      </div>

      <Tabs defaultValue="viewer" className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-2 money-gradient border-b border-yellow-500/30">
          <TabsTrigger 
            value="viewer" 
            className="flex items-center gap-2 money-button data-[state=active]:gold-gradient"
          >
            <Globe className="h-4 w-4" />
            URL VIEWER
          </TabsTrigger>
          <TabsTrigger 
            value="earnings" 
            className="flex items-center gap-2 profit-button data-[state=active]:bg-green-600"
          >
            <DollarSign className="h-4 w-4" />
            EARNINGS DASHBOARD
          </TabsTrigger>
        </TabsList>

        <TabsContent value="viewer" className="flex-1 flex flex-col m-0">
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
        </TabsContent>

        <TabsContent value="earnings" className="flex-1 m-0 overflow-auto">
          <EarningsDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
}
