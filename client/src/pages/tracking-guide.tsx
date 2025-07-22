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
  Link
} from "lucide-react";
import { Link as RouterLink } from "wouter";

export default function TrackingGuide() {
  return (
    <div className="min-h-screen bg-obsidian text-platinum p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gold mb-2">Analytics Tracking Guide</h1>
          <p className="text-platinum/60">Complete overview of what's being tracked and where to find insights</p>
        </div>

        {/* Quick Access */}
        <Card className="bg-charcoal border-gold/20 mb-8">
          <CardHeader>
            <CardTitle className="text-gold flex items-center">
              <Link className="w-5 h-5 mr-2" />
              Quick Access
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <RouterLink href="/analytics">
                <div className="flex items-center p-4 bg-obsidian/50 rounded-lg hover:bg-obsidian/70 cursor-pointer transition-colors">
                  <BarChart3 className="w-6 h-6 text-crimson mr-3" />
                  <div>
                    <h3 className="font-semibold text-platinum">Analytics Dashboard</h3>
                    <p className="text-sm text-platinum/60">View comprehensive metrics</p>
                  </div>
                </div>
              </RouterLink>
              
              <RouterLink href="/">
                <div className="flex items-center p-4 bg-obsidian/50 rounded-lg hover:bg-obsidian/70 cursor-pointer transition-colors">
                  <Eye className="w-6 h-6 text-gold mr-3" />
                  <div>
                    <h3 className="font-semibold text-platinum">Live Landing Page</h3>
                    <p className="text-sm text-platinum/60">See tracking in action</p>
                  </div>
                </div>
              </RouterLink>
            </div>
          </CardContent>
        </Card>

        {/* What's Being Tracked */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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
        </div>

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
  );
}