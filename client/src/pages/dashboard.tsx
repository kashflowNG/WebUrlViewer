import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  Play, 
  Pause, 
  RefreshCw, 
  MousePointer, 
  Globe, 
  Settings, 
  Activity,
  Clock,
  Zap,
  Smartphone
} from 'lucide-react';

export default function Dashboard() {
  const [botState, setBotState] = useState({
    autoScroll: false,
    autoRefresh: false,
    refreshInterval: 30,
    currentUrl: '',
    isActive: false
  });
  
  const [urlInput, setUrlInput] = useState('');
  const [intervalInput, setIntervalInput] = useState('30');

  const handleToggleAutoScroll = () => {
    setBotState(prev => ({ ...prev, autoScroll: !prev.autoScroll }));
  };

  const handleToggleAutoRefresh = () => {
    setBotState(prev => ({ ...prev, autoRefresh: !prev.autoRefresh }));
  };

  const handleSetUrl = () => {
    if (urlInput.trim()) {
      setBotState(prev => ({ ...prev, currentUrl: urlInput.trim() }));
      setUrlInput('');
    }
  };

  const handleSetInterval = () => {
    const interval = parseInt(intervalInput);
    if (interval >= 5) {
      setBotState(prev => ({ ...prev, refreshInterval: interval }));
    }
  };

  const handleStartBot = () => {
    setBotState(prev => ({ ...prev, isActive: true }));
  };

  const handleStopBot = () => {
    setBotState(prev => ({ 
      ...prev, 
      isActive: false, 
      autoScroll: false, 
      autoRefresh: false 
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Smartphone className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              URL Viewer Dashboard
            </h1>
          </div>
          <p className="text-slate-300 text-lg">Control your automated browsing experience</p>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-slate-100 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-green-400" />
                  Bot Status
                </CardTitle>
                <Badge variant={botState.isActive ? "default" : "secondary"} 
                       className={botState.isActive ? "bg-green-500 text-white" : "bg-slate-600 text-slate-300"}>
                  {botState.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Auto-scroll:</span>
                  <span className={botState.autoScroll ? "text-green-400" : "text-slate-400"}>
                    {botState.autoScroll ? 'ON' : 'OFF'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Auto-refresh:</span>
                  <span className={botState.autoRefresh ? "text-green-400" : "text-slate-400"}>
                    {botState.autoRefresh ? 'ON' : 'OFF'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Interval:</span>
                  <span className="text-slate-300">{botState.refreshInterval}s</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-slate-100 flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-400" />
                Current URL
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                {botState.currentUrl ? (
                  <div className="bg-slate-700/50 p-3 rounded-lg">
                    <p className="text-slate-300 break-all">{botState.currentUrl}</p>
                  </div>
                ) : (
                  <p className="text-slate-500 italic">No URL set</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-slate-100 flex items-center gap-2">
                <Clock className="w-5 h-5 text-yellow-400" />
                Uptime
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-2xl font-mono text-slate-200">24/7</div>
                <p className="text-xs text-slate-400 mt-1">Always running</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Control Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Main Controls */}
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-slate-100 flex items-center gap-2">
                <Settings className="w-5 h-5 text-purple-400" />
                Main Controls
              </CardTitle>
              <CardDescription className="text-slate-400">
                Start, stop, and manage your automation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Bot Control */}
              <div className="space-y-4">
                <div className="flex gap-3">
                  <Button 
                    onClick={handleStartBot}
                    disabled={botState.isActive}
                    className="flex-1 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white border-0"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start Bot
                  </Button>
                  <Button 
                    onClick={handleStopBot}
                    disabled={!botState.isActive}
                    variant="destructive"
                    className="flex-1"
                  >
                    <Pause className="w-4 h-4 mr-2" />
                    Stop Bot
                  </Button>
                </div>
              </div>

              <Separator className="bg-slate-600" />

              {/* Feature Toggles */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MousePointer className="w-4 h-4 text-blue-400" />
                    <Label className="text-slate-200">Auto-scroll</Label>
                  </div>
                  <Switch 
                    checked={botState.autoScroll}
                    onCheckedChange={handleToggleAutoScroll}
                    disabled={!botState.isActive}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-green-400" />
                    <Label className="text-slate-200">Auto-refresh</Label>
                  </div>
                  <Switch 
                    checked={botState.autoRefresh}
                    onCheckedChange={handleToggleAutoRefresh}
                    disabled={!botState.isActive}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Configuration */}
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-slate-100 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                Configuration
              </CardTitle>
              <CardDescription className="text-slate-400">
                Set URL and refresh intervals
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* URL Setting */}
              <div className="space-y-2">
                <Label className="text-slate-200">Website URL</Label>
                <div className="flex gap-2">
                  <Input 
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://example.com"
                    className="bg-slate-700/50 border-slate-600 text-slate-200 placeholder-slate-400"
                  />
                  <Button 
                    onClick={handleSetUrl}
                    disabled={!urlInput.trim()}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Set
                  </Button>
                </div>
              </div>

              <Separator className="bg-slate-600" />

              {/* Interval Setting */}
              <div className="space-y-2">
                <Label className="text-slate-200">Refresh Interval (seconds)</Label>
                <div className="flex gap-2">
                  <Input 
                    type="number"
                    min="5"
                    value={intervalInput}
                    onChange={(e) => setIntervalInput(e.target.value)}
                    className="bg-slate-700/50 border-slate-600 text-slate-200"
                  />
                  <Button 
                    onClick={handleSetInterval}
                    disabled={parseInt(intervalInput) < 5}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Set
                  </Button>
                </div>
                <p className="text-xs text-slate-400">Minimum 5 seconds</p>
              </div>

              {/* Quick Presets */}
              <div className="space-y-2">
                <Label className="text-slate-200">Quick Presets</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setIntervalInput('10')}
                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    10s
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setIntervalInput('30')}
                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    30s
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setIntervalInput('60')}
                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    60s
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mt-8 bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-slate-100">Quick Actions</CardTitle>
            <CardDescription className="text-slate-400">
              Popular website examples to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { name: 'News', url: 'https://news.ycombinator.com' },
                { name: 'Weather', url: 'https://weather.com' },
                { name: 'Reddit', url: 'https://reddit.com' },
                { name: 'GitHub', url: 'https://github.com' }
              ].map((site) => (
                <Button
                  key={site.name}
                  variant="outline"
                  onClick={() => {
                    setUrlInput(site.url);
                    setBotState(prev => ({ ...prev, currentUrl: site.url }));
                  }}
                  className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                >
                  {site.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}