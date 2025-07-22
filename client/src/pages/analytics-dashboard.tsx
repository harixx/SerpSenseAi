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
  PieChart,
  Activity,
  Eye,
  Layers,
  Sparkles,
  ArrowUp,
  ArrowDown,
  Gauge
} from "lucide-react";
import { motion } from "framer-motion";

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
      <div className="min-h-screen bg-gradient-to-br from-obsidian via-charcoal to-obsidian p-8">
        <div className="max-w-7xl mx-auto">
          <div className="relative">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-64 h-64 rounded-full opacity-5"
                  style={{
                    background: `linear-gradient(45deg, ${i % 2 === 0 ? '#DAA520' : '#DC143C'}, transparent)`,
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 180, 360],
                  }}
                  transition={{
                    duration: 8 + i,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
              ))}
            </div>
            
            {/* Loading skeleton */}
            <div className="relative z-10">
              <motion.div 
                className="h-12 bg-gradient-to-r from-gold/20 to-crimson/20 rounded-lg w-80 mb-8"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[...Array(4)].map((_, i) => (
                  <motion.div 
                    key={i} 
                    className="h-32 bg-gradient-to-br from-charcoal/50 to-obsidian/50 rounded-xl backdrop-blur-sm border border-gold/10"
                    animate={{ opacity: [0.3, 0.7, 0.3] }}
                    transition={{ duration: 2, delay: i * 0.2, repeat: Infinity }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const data = analytics?.data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-obsidian via-charcoal to-obsidian text-platinum relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-96 h-96 rounded-full opacity-5 blur-3xl"
            style={{
              background: `radial-gradient(circle, ${i % 3 === 0 ? '#DAA520' : i % 3 === 1 ? '#DC143C' : '#C0C0C0'} 0%, transparent 70%)`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              x: [0, 50, -50, 0],
              y: [0, -30, 30, 0],
              scale: [1, 1.1, 0.9, 1],
            }}
            transition={{
              duration: 15 + i * 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 p-8">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="mb-12"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="relative">
              <motion.h1 
                className="text-6xl font-bold bg-gradient-to-r from-gold via-platinum to-crimson bg-clip-text text-transparent mb-4"
                animate={{ 
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                style={{ backgroundSize: "200% 200%" }}
              >
                Imperius Analytics
              </motion.h1>
              <div className="flex items-center space-x-4 mb-4">
                <motion.div 
                  className="w-3 h-3 bg-green-400 rounded-full"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <p className="text-platinum/70 text-lg">Real-time intelligence • Enterprise-grade insights • Advanced lead qualification</p>
              </div>
              
              {/* Floating particles */}
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-gold rounded-full opacity-60"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    y: [0, -20, 0],
                    opacity: [0.6, 1, 0.6],
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                  }}
                />
              ))}
            </div>
          </motion.div>

          {/* Key Metrics Cards */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* Total Sessions Card */}
            <motion.div
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card className="bg-gradient-to-br from-charcoal/80 to-obsidian/80 border border-gold/30 backdrop-blur-xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                  <CardTitle className="text-sm font-medium text-platinum/70">Total Sessions</CardTitle>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  >
                    <Users className="h-5 w-5 text-gold drop-shadow-lg" />
                  </motion.div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <motion.div 
                    className="text-3xl font-bold bg-gradient-to-r from-platinum to-gold bg-clip-text text-transparent"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: "spring" }}
                  >
                    {data?.sessions?.totalSessions || 0}
                  </motion.div>
                  <div className="flex items-center mt-2">
                    <ArrowUp className="h-3 w-3 text-green-400 mr-1" />
                    <p className="text-xs text-platinum/50">Unique visitors: {data?.sessions?.uniqueUsers || 0}</p>
                  </div>
                </CardContent>
                
                {/* Animated border */}
                <div className="absolute inset-0 rounded-lg opacity-50">
                  <div className="absolute inset-0 rounded-lg border border-gold/20 animate-pulse" />
                </div>
              </Card>
            </motion.div>

            {/* Conversion Rate Card */}
            <motion.div
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card className="bg-gradient-to-br from-crimson/10 to-charcoal/80 border border-crimson/30 backdrop-blur-xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-crimson/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                  <CardTitle className="text-sm font-medium text-platinum/70">Conversion Rate</CardTitle>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Target className="h-5 w-5 text-crimson drop-shadow-lg" />
                  </motion.div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <motion.div 
                    className="text-3xl font-bold text-crimson"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.6, type: "spring" }}
                  >
                    {data?.conversions?.conversionRate || 0}%
                  </motion.div>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="h-3 w-3 text-green-400 mr-1" />
                    <p className="text-xs text-platinum/50">
                      {data?.conversions?.signups || 0} of {data?.conversions?.totalVisitors || 0} visitors
                    </p>
                  </div>
                </CardContent>
                
                {/* Progress ring */}
                <div className="absolute bottom-2 right-2">
                  <svg className="w-8 h-8" viewBox="0 0 32 32">
                    <motion.circle
                      cx="16" cy="16" r="12"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-crimson/20"
                    />
                    <motion.circle
                      cx="16" cy="16" r="12"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-crimson"
                      strokeDasharray={75.4}
                      strokeDashoffset={75.4 - (75.4 * (data?.conversions?.conversionRate || 0)) / 100}
                      initial={{ strokeDashoffset: 75.4 }}
                      animate={{ strokeDashoffset: 75.4 - (75.4 * (data?.conversions?.conversionRate || 0)) / 100 }}
                      transition={{ duration: 1.5, delay: 0.8 }}
                    />
                  </svg>
                </div>
              </Card>
            </motion.div>

            {/* Time on Site Card */}
            <motion.div
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card className="bg-gradient-to-br from-blue-500/10 to-charcoal/80 border border-blue-400/30 backdrop-blur-xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                  <CardTitle className="text-sm font-medium text-platinum/70">Avg Time on Site</CardTitle>
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  >
                    <Timer className="h-5 w-5 text-blue-400 drop-shadow-lg" />
                  </motion.div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <motion.div 
                    className="text-3xl font-bold text-blue-400"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.7, type: "spring" }}
                  >
                    {Math.round((data?.sessions?.avgTimeOnSite || 0) / 60)}m
                  </motion.div>
                  <div className="flex items-center mt-2">
                    <ArrowDown className="h-3 w-3 text-red-400 mr-1" />
                    <p className="text-xs text-platinum/50">
                      Bounce rate: {data?.sessions?.bounceRate || 0}%
                    </p>
                  </div>
                </CardContent>
                
                {/* Time indicator */}
                <div className="absolute top-2 right-2">
                  <motion.div
                    className="w-2 h-2 bg-blue-400 rounded-full"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>
              </Card>
            </motion.div>

            {/* Time to Convert Card */}
            <motion.div
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card className="bg-gradient-to-br from-green-500/10 to-charcoal/80 border border-green-400/30 backdrop-blur-xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-green-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                  <CardTitle className="text-sm font-medium text-platinum/70">Time to Convert</CardTitle>
                  <motion.div
                    animate={{ 
                      scale: [1, 1.3, 1],
                      filter: ["hue-rotate(0deg)", "hue-rotate(90deg)", "hue-rotate(0deg)"]
                    }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <Zap className="h-5 w-5 text-green-400 drop-shadow-lg" />
                  </motion.div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <motion.div 
                    className="text-3xl font-bold text-green-400"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.8, type: "spring" }}
                  >
                    {Math.round((data?.conversions?.avgTimeToConvert || 0) / 60)}m
                  </motion.div>
                  <div className="flex items-center mt-2">
                    <Sparkles className="h-3 w-3 text-gold mr-1" />
                    <p className="text-xs text-platinum/50">Average conversion time</p>
                  </div>
                </CardContent>
                
                {/* Lightning effect */}
                <div className="absolute inset-0 overflow-hidden">
                  <motion.div
                    className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-green-400 to-transparent"
                    style={{ top: "60%" }}
                    animate={{ x: ["-100%", "200%"] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  />
                </div>
              </Card>
            </motion.div>
          </motion.div>

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
                      <span className="text-platinum">{(100 - (data?.sessions?.bounceRate || 0))}%</span>
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
                          Math.round(((data.sessions.totalSessions - data.sessions.uniqueUsers) / data.sessions.totalSessions) * 100) : 0}%
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
                        <p className="font-bold text-crimson">{element.conversionRate || 0}%</p>
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
    </div>
  );
}