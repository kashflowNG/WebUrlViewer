import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { DollarSign, TrendingUp, Clock, Zap, Target, History } from "lucide-react";
import { useEarnings } from "@/hooks/use-earnings";

export default function EarningsDashboard() {
  const { 
    user, 
    stats, 
    earnings, 
    lastEarning, 
    flashEarning,
    getEarningsPerHour,
    getEarningsRate,
    isLoading 
  } = useEarnings();

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 6,
      maximumFractionDigits: 6,
    }).format(num);
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="money-spinner w-8 h-8"></div>
        <span className="ml-3 text-lg money-counter">Loading earnings data...</span>
      </div>
    );
  }

  const totalEarnings = parseFloat(user?.totalEarnings || "0");
  const refreshInterval = stats?.refreshInterval || 30;
  const earningsPerHour = getEarningsPerHour(refreshInterval);
  const earningsRate = getEarningsRate(refreshInterval);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold money-counter gold-gradient bg-clip-text text-transparent">
          💰 MONEY MACHINE DASHBOARD
        </h1>
        <p className="text-lg profit-counter">
          Automatic earnings through URL refreshing
        </p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Earnings */}
        <Card className={`earnings-card ${flashEarning ? 'earning-flash' : ''}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 status-earning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold money-counter">
              {formatCurrency(totalEarnings)}
            </div>
            <p className="text-xs text-muted-foreground">
              Lifetime accumulated
            </p>
          </CardContent>
        </Card>

        {/* Earnings Per Hour */}
        <Card className="earnings-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hourly Rate</CardTitle>
            <TrendingUp className="h-4 w-4 status-online" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold profit-counter">
              {formatCurrency(earningsPerHour)}/hr
            </div>
            <p className="text-xs text-muted-foreground">
              Current rate at {refreshInterval}s interval
            </p>
          </CardContent>
        </Card>

        {/* Current Rate */}
        <Card className="earnings-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Per Refresh</CardTitle>
            <Target className="h-4 w-4 status-earning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold money-counter">
              {earningsRate}
            </div>
            <p className="text-xs text-muted-foreground">
              Every {refreshInterval} seconds
            </p>
          </CardContent>
        </Card>

        {/* Refresh Count */}
        <Card className="earnings-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Refreshes</CardTitle>
            <Zap className="h-4 w-4 status-online" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold profit-counter">
              {stats?.refreshCount || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Total refreshes today
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Earnings Rate Comparison */}
      <Card className="earnings-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 status-earning" />
            Earnings Rate Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { interval: 15, rate: 0.001, hourly: 0.24 },
              { interval: 30, rate: 0.003, hourly: 0.36 },
              { interval: 60, rate: 0.005, hourly: 0.30 },
              { interval: 300, rate: 0.01, hourly: 0.12 },
            ].map(({ interval, rate, hourly }) => (
              <div
                key={interval}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  interval === refreshInterval 
                    ? 'border-yellow-500 bg-yellow-500/10 money-glow' 
                    : 'border-border'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Badge variant={interval === refreshInterval ? "default" : "secondary"}>
                    {interval}s
                  </Badge>
                  <span className="text-sm">
                    {formatCurrency(rate)} per refresh
                  </span>
                </div>
                <div className="text-right">
                  <div className="font-bold profit-counter">
                    {formatCurrency(hourly)}/hr
                  </div>
                  {interval === refreshInterval && (
                    <span className="text-xs status-earning">ACTIVE</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Earnings */}
      <Card className="earnings-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5 status-online" />
            Recent Earnings
          </CardTitle>
        </CardHeader>
        <CardContent>
          {earnings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No earnings yet. Start auto-refresh to begin earning!</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {earnings.map((earning) => (
                <div
                  key={earning.id}
                  className={`flex items-center justify-between p-3 rounded-lg border border-border ${
                    lastEarning?.id === earning.id ? 'earning-flash' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="status-earning border-yellow-500">
                      {earning.refreshInterval}s
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {formatTime(earning.earnedAt)}
                    </span>
                  </div>
                  <div className="font-bold money-counter">
                    +{formatCurrency(earning.amount)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status */}
      <Card className="earnings-card">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500 earning-pulse"></div>
              <span className="status-online font-medium">
                MONEY MACHINE ACTIVE
              </span>
            </div>
            {stats?.autoRefreshEnabled && (
              <Badge className="money-button">
                AUTO-EARNING ENABLED
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}