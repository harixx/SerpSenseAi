import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  TrendingUp, 
  MousePointer, 
  Target, 
  Brain,
  Timer,
  Trophy,
  Zap,
  BarChart3,
  PieChart
} from "lucide-react";

interface AnalyticsDashboard {
  sessions: {
    totalSessions: number;
    uniqueUsers: number;
    avgTimeOnSite: number;
    bounceRate: number;
  };
  conversions: {
    totalVisitors: number;
    signups: number;
    conversionRate: number;
    avgTimeToConvert: number;
  };
  topElements: Array<{
    elementId: string;
    elementText: string;
    clicks: number;
    conversionRate: number;
  }>;
}

export default function AnalyticsDashboard() {
  const { data: analytics, isLoading } = useQuery<{ data: AnalyticsDashboard }>({
    queryKey: ['/api/analytics/dashboard'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-obsidian p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-700 rounded w-64 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-slate-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const data = analytics?.data;

  return (
    <div className="min-h-screen bg-obsidian text-platinum p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gold mb-2">Imperius Analytics</h1>
          <p className="text-platinum/60">Real-time insights into user behavior, A/B tests, and lead qualification</p>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-charcoal border-gold/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-platinum/70">Total Sessions</CardTitle>
              <Users className="h-4 w-4 text-gold" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-platinum">{data?.sessions?.totalSessions || 0}</div>
              <p className="text-xs text-platinum/50">Unique visitors: {data?.sessions?.uniqueUsers || 0}</p>
            </CardContent>
          </Card>

          <Card className="bg-charcoal border-gold/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-platinum/70">Conversion Rate</CardTitle>
              <Target className="h-4 w-4 text-crimson" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-crimson">
                {data?.conversions?.conversionRate?.toFixed(1) || 0}%
              </div>
              <p className="text-xs text-platinum/50">
                {data?.conversions?.signups || 0} of {data?.conversions?.totalVisitors || 0} visitors
              </p>
            </CardContent>
          </Card>

          <Card className="bg-charcoal border-gold/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-platinum/70">Avg Time on Site</CardTitle>
              <Timer className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400">
                {Math.round((data?.sessions?.avgTimeOnSite || 0) / 60)}m
              </div>
              <p className="text-xs text-platinum/50">
                Bounce rate: {data?.sessions?.bounceRate?.toFixed(1) || 0}%
              </p>
            </CardContent>
          </Card>

          <Card className="bg-charcoal border-gold/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-platinum/70">Time to Convert</CardTitle>
              <Zap className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">
                {Math.round((data?.conversions?.avgTimeToConvert || 0) / 60)}m
              </div>
              <p className="text-xs text-platinum/50">Average conversion time</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="performance" className="space-y-6">
          <TabsList className="bg-charcoal border border-gold/20">
            <TabsTrigger value="performance" className="data-[state=active]:bg-gold data-[state=active]:text-obsidian">
              <BarChart3 className="w-4 h-4 mr-2" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="elements" className="data-[state=active]:bg-gold data-[state=active]:text-obsidian">
              <MousePointer className="w-4 h-4 mr-2" />
              Top Elements
            </TabsTrigger>
            <TabsTrigger value="ab-tests" className="data-[state=active]:bg-gold data-[state=active]:text-obsidian">
              <Brain className="w-4 h-4 mr-2" />
              A/B Tests
            </TabsTrigger>
            <TabsTrigger value="leads" className="data-[state=active]:bg-gold data-[state=active]:text-obsidian">
              <Trophy className="w-4 h-4 mr-2" />
              Lead Quality
            </TabsTrigger>
          </TabsList>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-charcoal border-gold/20">
                <CardHeader>
                  <CardTitle className="text-platinum">Session Analytics</CardTitle>
                  <CardDescription className="text-platinum/60">
                    User engagement and behavior patterns
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-platinum/70">Engagement Rate</span>
                      <span className="text-platinum">{(100 - (data?.sessions?.bounceRate || 0)).toFixed(1)}%</span>
                    </div>
                    <Progress 
                      value={100 - (data?.sessions?.bounceRate || 0)} 
                      className="h-2 bg-obsidian" 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-platinum/70">Return Visitor Rate</span>
                      <span className="text-platinum">
                        {data?.sessions?.totalSessions && data?.sessions?.uniqueUsers ? 
                          (((data.sessions.totalSessions - data.sessions.uniqueUsers) / data.sessions.totalSessions) * 100).toFixed(1) : 0}%
                      </span>
                    </div>
                    <Progress 
                      value={data?.sessions?.totalSessions && data?.sessions?.uniqueUsers ? 
                        ((data.sessions.totalSessions - data.sessions.uniqueUsers) / data.sessions.totalSessions) * 100 : 0} 
                      className="h-2 bg-obsidian" 
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-charcoal border-gold/20">
                <CardHeader>
                  <CardTitle className="text-platinum">Conversion Funnel</CardTitle>
                  <CardDescription className="text-platinum/60">
                    Path from visitor to qualified lead
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-obsidian/50 rounded">
                      <span className="text-platinum/70">Visitors</span>
                      <Badge variant="outline" className="border-blue-400 text-blue-400">
                        {data?.conversions?.totalVisitors || 0}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-obsidian/50 rounded">
                      <span className="text-platinum/70">Form Interactions</span>
                      <Badge variant="outline" className="border-gold text-gold">
                        ~{Math.round((data?.conversions?.totalVisitors || 0) * 0.3)}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-obsidian/50 rounded">
                      <span className="text-platinum/70">Signups</span>
                      <Badge variant="outline" className="border-crimson text-crimson">
                        {data?.conversions?.signups || 0}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="elements" className="space-y-6">
            <Card className="bg-charcoal border-gold/20">
              <CardHeader>
                <CardTitle className="text-platinum">Top Performing Elements</CardTitle>
                <CardDescription className="text-platinum/60">
                  Click-through rates and conversion performance by UI element
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data?.topElements?.map((element, index) => (
                    <div key={element.elementId} className="flex items-center justify-between p-4 bg-obsidian/30 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Badge className="bg-gold text-obsidian">#{index + 1}</Badge>
                        <div>
                          <p className="font-medium text-platinum">{element.elementText}</p>
                          <p className="text-sm text-platinum/60">{element.elementId}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-crimson">{element.conversionRate?.toFixed(1) || 0}%</p>
                        <p className="text-sm text-platinum/60">{element.clicks} clicks</p>
                      </div>
                    </div>
                  )) || (
                    <div className="text-center py-8 text-platinum/60">
                      No element data available yet
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ab-tests" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-charcoal border-gold/20">
                <CardHeader>
                  <CardTitle className="text-platinum">Hero CTA Test</CardTitle>
                  <CardDescription className="text-platinum/60">
                    Testing different call-to-action variations
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-platinum/70">Variant A (Control)</span>
                      <Badge className="bg-blue-600">33.3%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-platinum/70">Variant B (Elite)</span>
                      <Badge className="bg-gold text-obsidian">33.3%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-platinum/70">Variant C (Strategic)</span>
                      <Badge className="bg-crimson">33.3%</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-charcoal border-gold/20">
                <CardHeader>
                  <CardTitle className="text-platinum">Headline Test</CardTitle>
                  <CardDescription className="text-platinum/60">
                    Testing messaging effectiveness
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-platinum/70">Beyond Keywords</span>
                      <Badge className="bg-blue-600">33.3%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-platinum/70">Stop Guessing</span>
                      <Badge className="bg-gold text-obsidian">33.3%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-platinum/70">Intelligence Advantage</span>
                      <Badge className="bg-crimson">33.3%</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="leads" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-charcoal border-green-400/20">
                <CardHeader>
                  <CardTitle className="text-green-400">Hot Leads</CardTitle>
                  <CardDescription className="text-platinum/60">
                    High engagement, business email
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-400 mb-2">24%</div>
                  <p className="text-sm text-platinum/60">Score: 80-100</p>
                </CardContent>
              </Card>

              <Card className="bg-charcoal border-gold/20">
                <CardHeader>
                  <CardTitle className="text-gold">Warm Leads</CardTitle>
                  <CardDescription className="text-platinum/60">
                    Moderate engagement
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gold mb-2">45%</div>
                  <p className="text-sm text-platinum/60">Score: 50-79</p>
                </CardContent>
              </Card>

              <Card className="bg-charcoal border-blue-400/20">
                <CardHeader>
                  <CardTitle className="text-blue-400">Cold Leads</CardTitle>
                  <CardDescription className="text-platinum/60">
                    Low engagement
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-400 mb-2">31%</div>
                  <p className="text-sm text-platinum/60">Score: 0-49</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}