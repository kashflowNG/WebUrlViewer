import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DollarSign, 
  TrendingUp, 
  Clock, 
  Zap, 
  Target, 
  History, 
  BarChart3, 
  PieChart, 
  Activity,
  Settings,
  Wallet,
  Timer,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  PlayCircle,
  PauseCircle
} from "lucide-react";
import { useEarnings } from "@/hooks/use-earnings";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell, AreaChart, Area, Pie } from 'recharts';

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

  const formatShortTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  // Generate mock chart data for demonstration
  const generateChartData = () => {
    const data = [];
    const now = new Date();
    for (let i = 23; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000);
      const baseEarnings = Math.random() * 0.05 + 0.02;
      data.push({
        time: formatShortTime(time.toISOString()),
        earnings: baseEarnings,
        refreshes: Math.floor(Math.random() * 120) + 80,
        efficiency: Math.random() * 30 + 70,
      });
    }
    return data;
  };

  const chartData = generateChartData();

  const intervalData = [
    { interval: '15s', rate: 0.001, hourly: 0.24, efficiency: 95, color: '#ef4444' },
    { interval: '30s', rate: 0.003, hourly: 0.36, efficiency: 88, color: '#22c55e' },
    { interval: '60s', rate: 0.005, hourly: 0.30, efficiency: 75, color: '#3b82f6' },
    { interval: '300s', rate: 0.01, hourly: 0.12, efficiency: 45, color: '#f59e0b' },
  ];

  const pieData = intervalData.map((item, index) => ({
    name: item.interval,
    value: item.hourly,
    color: item.color,
  }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="money-spinner w-8 h-8"></div>
        <span className="ml-3 text-lg money-counter">Loading advanced analytics...</span>
      </div>
    );
  }

  const totalEarnings = user?.totalEarnings || 0;
  const refreshInterval = stats?.refreshInterval || 30;
  const earningsPerHour = getEarningsPerHour(refreshInterval);
  const earningsRate = getEarningsRate(refreshInterval);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      {/* Header Section */}
      <div className="mb-8 text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <Wallet className="h-8 w-8 text-yellow-400" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent">
            ADVANCED EARNINGS ANALYTICS
          </h1>
        </div>
        <p className="text-xl text-slate-300 max-w-2xl mx-auto">
          Real-time financial performance tracking with intelligent automation
        </p>
        
        {/* Quick Actions */}
        <div className="flex items-center justify-center gap-4 mt-6">
          <Button className="bg-green-600 hover:bg-green-700 text-white">
            <PlayCircle className="h-4 w-4 mr-2" />
            Start Earning
          </Button>
          <Button variant="outline" className="border-yellow-400 text-yellow-400 hover:bg-yellow-400/10">
            <Settings className="h-4 w-4 mr-2" />
            Optimize Settings
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 max-w-md mx-auto bg-slate-800/50">
          <TabsTrigger value="overview" className="data-[state=active]:bg-yellow-400/20">
            <BarChart3 className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-yellow-400/20">
            <Activity className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="performance" className="data-[state=active]:bg-yellow-400/20">
            <TrendingUp className="h-4 w-4 mr-2" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-yellow-400/20">
            <History className="h-4 w-4 mr-2" />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Enhanced Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Earnings */}
            <Card className={`bg-gradient-to-br from-green-900/50 to-green-800/30 border-green-500/30 ${flashEarning ? 'animate-pulse' : ''}`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-100">Total Earnings</CardTitle>
                <div className="p-2 bg-green-500/20 rounded-full">
                  <DollarSign className="h-4 w-4 text-green-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-400 mb-1">
                  {formatCurrency(totalEarnings)}
                </div>
                <p className="text-xs text-green-200/60 flex items-center">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  +12.5% from yesterday
                </p>
              </CardContent>
            </Card>

            {/* Hourly Rate */}
            <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 border-blue-500/30">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-100">Hourly Rate</CardTitle>
                <div className="p-2 bg-blue-500/20 rounded-full">
                  <TrendingUp className="h-4 w-4 text-blue-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-400 mb-1">
                  {formatCurrency(earningsPerHour)}/hr
                </div>
                <p className="text-xs text-blue-200/60">
                  At {refreshInterval}s intervals
                </p>
                <div className="mt-2">
                  <Progress value={75} className="h-2 bg-blue-900/50" />
                </div>
              </CardContent>
            </Card>

            {/* Efficiency Score */}
            <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 border-purple-500/30">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-purple-100">Efficiency</CardTitle>
                <div className="p-2 bg-purple-500/20 rounded-full">
                  <Target className="h-4 w-4 text-purple-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-400 mb-1">
                  87%
                </div>
                <p className="text-xs text-purple-200/60">
                  Optimization score
                </p>
                <div className="mt-2">
                  <Progress value={87} className="h-2 bg-purple-900/50" />
                </div>
              </CardContent>
            </Card>

            {/* Active Sessions */}
            <Card className="bg-gradient-to-br from-yellow-900/50 to-orange-800/30 border-yellow-500/30">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-yellow-100">Active Time</CardTitle>
                <div className="p-2 bg-yellow-500/20 rounded-full">
                  <Timer className="h-4 w-4 text-yellow-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-400 mb-1">
                  2h 34m
                </div>
                <p className="text-xs text-yellow-200/60">
                  {stats?.refreshCount || 0} refreshes total
                </p>
                <div className="mt-2 flex items-center text-xs text-yellow-300">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                  Currently active
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Earnings Trend Chart */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-100 flex items-center gap-2">
                <Activity className="h-5 w-5 text-yellow-400" />
                24-Hour Earnings Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="earningsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis 
                      dataKey="time" 
                      stroke="#64748b"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="#64748b"
                      fontSize={12}
                      tickFormatter={(value) => `$${value.toFixed(3)}`}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                        color: '#e2e8f0'
                      }}
                      formatter={(value: any) => [`$${value.toFixed(6)}`, 'Earnings']}
                    />
                    <Area
                      type="monotone"
                      dataKey="earnings"
                      stroke="#22c55e"
                      fillOpacity={1}
                      fill="url(#earningsGradient)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Interval Performance */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-slate-100 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-400" />
                  Interval Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={intervalData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis 
                        dataKey="interval" 
                        stroke="#64748b"
                        fontSize={12}
                      />
                      <YAxis 
                        stroke="#64748b"
                        fontSize={12}
                        tickFormatter={(value) => `$${value.toFixed(2)}`}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: '#1e293b',
                          border: '1px solid #334155',
                          borderRadius: '8px',
                          color: '#e2e8f0'
                        }}
                        formatter={(value: any) => [`$${value.toFixed(3)}`, 'Hourly Rate']}
                      />
                      <Bar 
                        dataKey="hourly" 
                        fill="#3b82f6"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Earnings Distribution */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-slate-100 flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-purple-400" />
                  Earnings Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: '#1e293b',
                          border: '1px solid #334155',
                          borderRadius: '8px',
                          color: '#e2e8f0'
                        }}
                        formatter={(value: any) => [`$${value.toFixed(3)}`, 'Hourly Rate']}
                      />
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {intervalData.map((interval, index) => (
              <Card key={index} className={`bg-slate-800/50 border-slate-700 ${
                interval.interval === `${refreshInterval}s` ? 'ring-2 ring-yellow-400' : ''
              }`}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-slate-100 flex items-center justify-between">
                    <span>{interval.interval} Interval</span>
                    {interval.interval === `${refreshInterval}s` && (
                      <Badge className="bg-yellow-400/20 text-yellow-400 border-yellow-400">
                        ACTIVE
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Efficiency</span>
                      <span className="text-slate-200">{interval.efficiency}%</span>
                    </div>
                    <Progress value={interval.efficiency} className="h-2 mt-1" />
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-400">Per Refresh</p>
                      <p className="text-slate-200 font-semibold">{formatCurrency(interval.rate)}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Per Hour</p>
                      <p className="text-slate-200 font-semibold">{formatCurrency(interval.hourly)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          {/* Recent Earnings */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-100 flex items-center gap-2">
                <History className="h-5 w-5 text-green-400" />
                Recent Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {earnings.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <DollarSign className="h-16 w-16 mx-auto mb-4 opacity-30" />
                  <p className="text-lg">No earnings yet</p>
                  <p className="text-sm">Start auto-refresh to begin earning!</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {earnings.map((earning, index) => (
                    <div
                      key={earning.id}
                      className={`flex items-center justify-between p-4 rounded-lg bg-slate-700/30 border border-slate-600 ${
                        lastEarning?.id === earning.id ? 'animate-pulse border-yellow-400' : ''
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-green-500/20 rounded-full">
                          <DollarSign className="h-4 w-4 text-green-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="border-yellow-400 text-yellow-400">
                              {earning.refreshInterval}s
                            </Badge>
                            <span className="text-sm text-slate-400">
                              {formatTime(earning.earnedAt)}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">
                            Transaction #{earning.id}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-400">
                          +{formatCurrency(earning.amount)}
                        </div>
                        <p className="text-xs text-slate-500">
                          Rank #{earnings.length - index}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Status Footer */}
      <Card className="bg-gradient-to-r from-slate-800/80 to-slate-700/80 border-slate-600 mt-8">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>
                <span className="text-green-400 font-semibold">
                  SYSTEM ACTIVE
                </span>
              </div>
              {stats?.autoRefreshEnabled && (
                <Badge className="bg-yellow-400/20 text-yellow-400 border-yellow-400">
                  AUTO-EARNING ENABLED
                </Badge>
              )}
            </div>
            <div className="text-right text-sm text-slate-400">
              <p>Next optimization in 5 minutes</p>
              <p>Performance: Excellent</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}