import { useState, useCallback, useRef } from "react";
import { validateUrl, normalizeUrl } from "@/lib/url-utils";

interface NavigationState {
  currentUrl: string;
  isLoading: boolean;
  canGoBack: boolean;
  canGoForward: boolean;
  hasError: boolean;
  errorMessage: string;
  connectionStatus: string;
  history: string[];
  currentIndex: number;
}

export function useUrlNavigation() {
  const [state, setState] = useState<NavigationState>(() => {
    // Restore URL from localStorage on initialization
    const savedUrl = localStorage.getItem('urlViewer_currentUrl') || "";
    const savedHistory = JSON.parse(localStorage.getItem('urlViewer_history') || '[]');
    const savedIndex = parseInt(localStorage.getItem('urlViewer_currentIndex') || '-1');

    return {
      currentUrl: savedUrl,
      isLoading: false,
      canGoBack: savedIndex > 0,
      canGoForward: savedIndex < savedHistory.length - 1,
      hasError: false,
      errorMessage: "",
      connectionStatus: "Ready",
      history: savedHistory,
      currentIndex: savedIndex
    };
  });

  const iframeRef = useRef<HTMLIFrameElement>(null);

  const updateNavigationButtons = useCallback((history: string[], index: number) => {
    return {
      canGoBack: index > 0,
      canGoForward: index < history.length - 1
    };
  }, []);

  const addToHistory = useCallback((url: string, history: string[], currentIndex: number) => {
    const newHistory = history.slice(0, currentIndex + 1);
    if (newHistory[newHistory.length - 1] !== url) {
      newHistory.push(url);
    }
    return {
      history: newHistory,
      currentIndex: newHistory.length - 1
    };
  }, []);

  const loadUrl = useCallback((url: string) => {
    // Handle empty URL (home state)
    if (!url.trim()) {
      localStorage.setItem('urlViewer_currentUrl', "");
      setState(prev => ({
        ...prev,
        currentUrl: "",
        isLoading: false,
        hasError: false,
        errorMessage: "",
        connectionStatus: "Ready"
      }));
      return;
    }

    const normalizedUrl = normalizeUrl(url);
    const validation = validateUrl(normalizedUrl);

    if (!validation.valid) {
      setState(prev => ({
        ...prev,
        hasError: true,
        errorMessage: validation.error,
        isLoading: false,
        connectionStatus: "Error"
      }));
      return;
    }

    setState(prev => {
      const { history: newHistory, currentIndex: newIndex } = addToHistory(
        normalizedUrl, 
        prev.history, 
        prev.currentIndex
      );
      const navButtons = updateNavigationButtons(newHistory, newIndex);

      // Save to localStorage for persistence
      localStorage.setItem('urlViewer_currentUrl', normalizedUrl);
      localStorage.setItem('urlViewer_history', JSON.stringify(newHistory));
      localStorage.setItem('urlViewer_currentIndex', newIndex.toString());

      return {
        ...prev,
        currentUrl: normalizedUrl,
        isLoading: true,
        hasError: false,
        errorMessage: "",
        connectionStatus: "Loading...",
        history: newHistory,
        currentIndex: newIndex,
        ...navButtons
      };
    });

    // Simulate loading delay and then mark as loaded
    setTimeout(() => {
      setState(prev => ({
        ...prev,
        isLoading: false,
        connectionStatus: "Ready"
      }));
    }, 1000);

  }, [addToHistory, updateNavigationButtons]);

  const goBack = useCallback(() => {
    setState(prev => {
      if (prev.currentIndex > 0) {
        const newIndex = prev.currentIndex - 1;
        const url = prev.history[newIndex];
        const navButtons = updateNavigationButtons(prev.history, newIndex);

        // Save to localStorage
        localStorage.setItem('urlViewer_currentUrl', url);
        localStorage.setItem('urlViewer_currentIndex', newIndex.toString());

        return {
          ...prev,
          currentUrl: url,
          currentIndex: newIndex,
          isLoading: true,
          hasError: false,
          connectionStatus: "Loading...",
          ...navButtons
        };
      }
      return prev;
    });

    // Simulate loading
    setTimeout(() => {
      setState(prev => ({
        ...prev,
        isLoading: false,
        connectionStatus: "Ready"
      }));
    }, 500);
  }, [updateNavigationButtons]);

  const goForward = useCallback(() => {
    setState(prev => {
      if (prev.currentIndex < prev.history.length - 1) {
        const newIndex = prev.currentIndex + 1;
        const url = prev.history[newIndex];
        const navButtons = updateNavigationButtons(prev.history, newIndex);

        // Save to localStorage
        localStorage.setItem('urlViewer_currentUrl', url);
        localStorage.setItem('urlViewer_currentIndex', newIndex.toString());

        return {
          ...prev,
          currentUrl: url,
          currentIndex: newIndex,
          isLoading: true,
          hasError: false,
          connectionStatus: "Loading...",
          ...navButtons
        };
      }
      return prev;
    });

    // Simulate loading
    setTimeout(() => {
      setState(prev => ({
        ...prev,
        isLoading: false,
        connectionStatus: "Ready"
      }));
    }, 500);
  }, [updateNavigationButtons]);

  const refresh = useCallback(() => {
    if (state.currentUrl) {
      setState(prev => ({
        ...prev,
        isLoading: true,
        hasError: false,
        connectionStatus: "Loading..."
      }));

      // Simulate refresh
      setTimeout(() => {
        setState(prev => ({
          ...prev,
          isLoading: false,
          connectionStatus: "Ready"
        }));
      }, 1000);
    }
  }, [state.currentUrl]);

  const clearError = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentUrl: "",
      hasError: false,
      errorMessage: "",
      connectionStatus: "Ready"
    }));
  }, []);

  const retry = useCallback(() => {
    if (state.currentUrl) {
      loadUrl(state.currentUrl);
    }
  }, [state.currentUrl, loadUrl]);

  return {
    currentUrl: state.currentUrl,
    isLoading: state.isLoading,
    canGoBack: state.canGoBack,
    canGoForward: state.canGoForward,
    hasError: state.hasError,
    errorMessage: state.errorMessage,
    connectionStatus: state.connectionStatus,
    loadUrl,
    goBack,
    goForward,
    refresh,
    clearError,
    retry,
    iframeRef
  };
}