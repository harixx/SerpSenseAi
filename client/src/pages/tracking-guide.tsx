import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  Users, 
  MousePointer, 
  Target, 
  Brain,
  TrendingUp,
  Eye,
  Timer,
  Zap,
  Trophy,
  Settings,
  Link,
  Sparkles,
  Activity,
  Layers,
  Gauge,
  Radar,
  Shield,
  Cpu
} from "lucide-react";
import { Link as RouterLink } from "wouter";
import { motion } from "framer-motion";

export default function TrackingGuide() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-obsidian via-charcoal to-obsidian text-platinum relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-72 h-72 rounded-full opacity-3 blur-3xl"
            style={{
              background: `radial-gradient(circle, ${i % 4 === 0 ? '#DAA520' : i % 4 === 1 ? '#DC143C' : i % 4 === 2 ? '#C0C0C0' : '#4169E1'} 0%, transparent 70%)`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              x: [0, 30, -30, 0],
              y: [0, -20, 20, 0],
              scale: [1, 1.2, 0.8, 1],
              rotate: [0, 90, 180, 360],
            }}
            transition={{
              duration: 20 + i * 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Neural network effect */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-gold/40 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 p-8">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="mb-12"
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <div className="text-center relative">
              <motion.h1 
                className="text-7xl font-bold bg-gradient-to-r from-gold via-crimson to-platinum bg-clip-text text-transparent mb-6"
                animate={{ 
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                style={{ backgroundSize: "300% 300%" }}
              >
                Analytics Intelligence
              </motion.h1>
              
              <motion.div 
                className="flex items-center justify-center space-x-6 mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <div className="flex items-center space-x-2">
                  <motion.div 
                    className="w-3 h-3 bg-green-400 rounded-full"
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <span className="text-green-400 font-medium">Real-time Tracking</span>
                </div>
                <div className="w-px h-6 bg-platinum/20"></div>
                <div className="flex items-center space-x-2">
                  <motion.div 
                    className="w-3 h-3 bg-crimson rounded-full"
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  <span className="text-crimson font-medium">A/B Testing Active</span>
                </div>
                <div className="w-px h-6 bg-platinum/20"></div>
                <div className="flex items-center space-x-2">
                  <motion.div 
                    className="w-3 h-3 bg-gold rounded-full"
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                  />
                  <span className="text-gold font-medium">Lead Qualification</span>
                </div>
              </motion.div>
              
              <motion.p 
                className="text-xl text-platinum/70 max-w-3xl mx-auto leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                Enterprise-grade analytics system with comprehensive user behavior tracking, 
                sophisticated A/B testing framework, and advanced lead qualification algorithms
              </motion.p>
            </div>
          </motion.div>

          {/* Quick Access */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <Card className="bg-gradient-to-br from-charcoal/90 to-obsidian/90 border border-gold/30 backdrop-blur-xl mb-12 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-gold/5 to-crimson/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              
              {/* Animated border effect */}
              <motion.div
                className="absolute inset-0 rounded-lg opacity-30"
                style={{
                  background: `conic-gradient(from 0deg, transparent, #DAA520, transparent, #DC143C, transparent)`,
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              />

              <CardHeader className="relative z-10">
                <CardTitle className="text-gold flex items-center text-2xl font-bold">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                  >
                    <Radar className="w-6 h-6 mr-3" />
                  </motion.div>
                  Mission Control Center
                </CardTitle>
                <CardDescription className="text-platinum/60 text-lg">
                  Navigate to your intelligence dashboards and live monitoring systems
                </CardDescription>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <RouterLink href="/analytics">
                    <motion.div 
                      className="flex items-center p-6 bg-gradient-to-br from-crimson/10 to-obsidian/60 rounded-xl hover:from-crimson/20 hover:to-obsidian/80 cursor-pointer transition-all duration-500 border border-crimson/20 backdrop-blur-sm group relative overflow-hidden"
                      whileHover={{ scale: 1.02, y: -4 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-crimson/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <motion.div
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                      >
                        <BarChart3 className="w-8 h-8 text-crimson mr-4 drop-shadow-lg" />
                      </motion.div>
                      <div className="relative z-10">
                        <h3 className="font-bold text-xl text-platinum mb-1">Analytics Command Center</h3>
                        <p className="text-sm text-platinum/70">Enterprise intelligence dashboard</p>
                      </div>
                      
                      {/* Pulse effect */}
                      <motion.div
                        className="absolute top-2 right-2 w-2 h-2 bg-crimson rounded-full"
                        animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    </motion.div>
                  </RouterLink>
                  
                  <RouterLink href="/">
                    <motion.div 
                      className="flex items-center p-6 bg-gradient-to-br from-gold/10 to-obsidian/60 rounded-xl hover:from-gold/20 hover:to-obsidian/80 cursor-pointer transition-all duration-500 border border-gold/20 backdrop-blur-sm group relative overflow-hidden"
                      whileHover={{ scale: 1.02, y: -4 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Eye className="w-8 h-8 text-gold mr-4 drop-shadow-lg" />
                      </motion.div>
                      <div className="relative z-10">
                        <h3 className="font-bold text-xl text-platinum mb-1">Live Monitoring Station</h3>
                        <p className="text-sm text-platinum/70">Real-time behavior tracking</p>
                      </div>
                      
                      {/* Scanning line effect */}
                      <motion.div
                        className="absolute inset-0 overflow-hidden rounded-xl"
                      >
                        <motion.div
                          className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-gold to-transparent"
                          style={{ top: "50%" }}
                          animate={{ x: ["-100%", "200%"] }}
                          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        />
                      </motion.div>
                    </motion.div>
                  </RouterLink>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Intelligence Matrix */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <Card className="bg-charcoal border-blue-400/20">
            <CardHeader>
              <CardTitle className="text-blue-400 flex items-center">
                <Users className="w-5 h-5 mr-2" />
                User Behavior
              </CardTitle>
              <CardDescription>Comprehensive user interaction tracking</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-platinum/70">Page Views</span>
                <Badge className="bg-blue-600">Auto-tracked</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-platinum/70">Scroll Depth</span>
                <Badge className="bg-blue-600">50%, 75%, 90%</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-platinum/70">Time on Page</span>
                <Badge className="bg-blue-600">Real-time</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-platinum/70">Click Tracking</span>
                <Badge className="bg-blue-600">All elements</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-platinum/70">Form Interactions</span>
                <Badge className="bg-blue-600">Focus & input</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-charcoal border-green-400/20">
            <CardHeader>
              <CardTitle className="text-green-400 flex items-center">
                <Brain className="w-5 h-5 mr-2" />
                A/B Testing
              </CardTitle>
              <CardDescription>Active split tests running</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-platinum/70">Hero CTA Buttons</span>
                <Badge className="bg-green-600">3 variants</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-platinum/70">Headlines</span>
                <Badge className="bg-green-600">3 variants</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-platinum/70">Social Proof</span>
                <Badge className="bg-green-600">3 variants</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-platinum/70">Pricing Psychology</span>
                <Badge className="bg-green-600">3 variants</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-charcoal border-gold/20">
            <CardHeader>
              <CardTitle className="text-gold flex items-center">
                <Trophy className="w-5 h-5 mr-2" />
                Lead Qualification
              </CardTitle>
              <CardDescription>Automatic lead scoring system</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-platinum/70">Engagement Score</span>
                <Badge className="bg-gold text-obsidian">Time + interactions</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-platinum/70">Intent Score</span>
                <Badge className="bg-gold text-obsidian">CTA clicks + forms</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-platinum/70">Quality Score</span>
                <Badge className="bg-gold text-obsidian">Email domain + behavior</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-platinum/70">Total Score</span>
                <Badge className="bg-gold text-obsidian">0-100 points</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-charcoal border-crimson/20">
            <CardHeader>
              <CardTitle className="text-crimson flex items-center">
                <Target className="w-5 h-5 mr-2" />
                Conversion Tracking
              </CardTitle>
              <CardDescription>Revenue and signup optimization</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-platinum/70">Waitlist Signups</span>
                <Badge className="bg-crimson">Real-time</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-platinum/70">Conversion Rate</span>
                <Badge className="bg-crimson">Live calculation</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-platinum/70">Time to Convert</span>
                <Badge className="bg-crimson">Session tracking</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-platinum/70">Source Attribution</span>
                <Badge className="bg-crimson">Hero vs Final CTA</Badge>
              </div>
            </CardContent>
          </Card>
          </motion.div>

        {/* Scoring System */}
        <Card className="bg-charcoal border-platinum/20 mb-8">
          <CardHeader>
            <CardTitle className="text-platinum flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Lead Scoring System
            </CardTitle>
            <CardDescription>How leads are automatically qualified and scored</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gold mb-3">Point Values</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-platinum/70">Page view</span>
                    <span className="text-platinum">+1 point</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-platinum/70">50% scroll</span>
                    <span className="text-platinum">+3 points</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-platinum/70">75% scroll</span>
                    <span className="text-platinum">+5 points</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-platinum/70">Form focus</span>
                    <span className="text-platinum">+8 points</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-platinum/70">CTA click</span>
                    <span className="text-platinum">+12 points</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-platinum/70">Calculator use</span>
                    <span className="text-platinum">+15 points</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-platinum/70">Email provided</span>
                    <span className="text-platinum">+25 points</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-platinum/70">Business email</span>
                    <span className="text-platinum">+15 bonus</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-gold mb-3">Lead Categories</h4>
                <div className="space-y-3">
                  <div className="p-3 bg-green-600/20 border border-green-600/30 rounded">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-green-400">Hot Leads</span>
                      <Badge className="bg-green-600">80-100 points</Badge>
                    </div>
                    <p className="text-xs text-green-300/70 mt-1">High engagement, business email, multiple interactions</p>
                  </div>
                  
                  <div className="p-3 bg-gold/20 border border-gold/30 rounded">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gold">Warm Leads</span>
                      <Badge className="bg-gold text-obsidian">50-79 points</Badge>
                    </div>
                    <p className="text-xs text-gold/70 mt-1">Moderate engagement, some form interaction</p>
                  </div>
                  
                  <div className="p-3 bg-blue-600/20 border border-blue-600/30 rounded">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-blue-400">Cold Leads</span>
                      <Badge className="bg-blue-600">0-49 points</Badge>
                    </div>
                    <p className="text-xs text-blue-300/70 mt-1">Basic browsing, minimal engagement</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Real-time Features */}
        <Card className="bg-charcoal border-purple-400/20">
          <CardHeader>
            <CardTitle className="text-purple-400 flex items-center">
              <Zap className="w-5 h-5 mr-2" />
              Real-time Features
            </CardTitle>
            <CardDescription>Live updates and instant insights</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-obsidian/50 rounded-lg">
                <TrendingUp className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <h4 className="font-semibold text-platinum mb-1">Live Dashboard</h4>
                <p className="text-xs text-platinum/60">Updates every 30 seconds</p>
              </div>
              
              <div className="text-center p-4 bg-obsidian/50 rounded-lg">
                <Timer className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <h4 className="font-semibold text-platinum mb-1">Real-time Scoring</h4>
                <p className="text-xs text-platinum/60">Instant lead qualification</p>
              </div>
              
              <div className="text-center p-4 bg-obsidian/50 rounded-lg">
                <MousePointer className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <h4 className="font-semibold text-platinum mb-1">Live Tracking</h4>
                <p className="text-xs text-platinum/60">Every click and scroll</p>
              </div>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
}