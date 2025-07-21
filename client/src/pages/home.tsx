import { useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertWaitlistEntrySchema, type InsertWaitlistEntry } from "@shared/schema";
import { 
  Brain, 
  Target, 
  Crown, 
  Rocket, 
  Building, 
  Users, 
  PenTool, 
  Star, 
  Shield, 
  CheckCircle, 
  Timer, 
  UserPlus,
  Zap,
  BarChart3,
  Globe,
  Lock,
  Award,
  ChevronRight
} from "lucide-react";

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function Home() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 300], [0, 50]);
  const y2 = useTransform(scrollY, [0, 300], [0, -50]);

  const { data: waitlistCount } = useQuery<{ count: number }>({
    queryKey: ["/api/waitlist/count"],
    refetchInterval: 30000,
  });

  const waitlistMutation = useMutation({
    mutationFn: async (data: InsertWaitlistEntry) => {
      const response = await apiRequest("POST", "/api/waitlist", data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Welcome to the Elite Waitlist!",
        description: "You'll receive priority access and strategic onboarding when we launch.",
        duration: 5000,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/waitlist/count"] });
    },
    onError: (error: any) => {
      const message = error.message.includes("409") 
        ? "You're already on our exclusive waitlist!"
        : "Please check your email format and try again.";
      toast({
        title: "Unable to join waitlist",
        description: message,
        variant: "destructive",
      });
    },
  });

  const heroForm = useForm<InsertWaitlistEntry>({
    resolver: zodResolver(insertWaitlistEntrySchema),
    defaultValues: { email: "", source: "hero" },
  });

  const finalForm = useForm<InsertWaitlistEntry>({
    resolver: zodResolver(insertWaitlistEntrySchema),
    defaultValues: { email: "", source: "final_cta" },
  });

  const onSubmit = (data: InsertWaitlistEntry) => {
    waitlistMutation.mutate(data);
  };

  const spotsRemaining = Math.max(0, 100 - (waitlistCount?.count || 0));

  return (
    <div className="min-h-screen bg-charcoal text-platinum overflow-x-hidden">
      {/* Sticky Navigation */}
      <nav className="fixed top-0 w-full z-50 glassmorphism border-b border-crimson/20">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="font-playfair text-2xl font-bold text-crimson">
            SERP Intelligence
          </div>
          <Button 
            variant="default" 
            className="bg-crimson hover:bg-ruby text-white px-6 py-2 cta-hover"
            onClick={() => document.getElementById('hero-form')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Request Access
          </Button>
        </div>
      </nav>
      {/* Hero Section */}
      <section className="min-h-screen hero-gradient flex items-center justify-center relative overflow-hidden">
        {/* Animated background elements */}
        <motion.div
          style={{ y: y1 }}
          className="absolute top-20 left-20 w-72 h-72 bg-crimson rounded-full blur-3xl opacity-10"
        />
        <motion.div
          style={{ y: y2 }}
          className="absolute bottom-20 right-20 w-96 h-96 bg-ruby rounded-full blur-3xl opacity-10"
        />
        
        <div className="container mx-auto px-6 text-center relative z-10">
          <motion.div
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className="max-w-6xl mx-auto"
          >
            <motion.h1 
              variants={fadeInUp}
              className="font-playfair text-6xl lg:text-7xl font-bold mb-6 leading-tight"
            >
              <span className="text-white">Beyond</span>{" "}
              <span className="text-crimson text-shadow-glow">Keywords.</span><br />
              <span className="text-white">Beyond</span>{" "}
              <span className="text-crimson text-shadow-glow">Rankings.</span>
            </motion.h1>
            
            <motion.p 
              variants={fadeInUp}
              className="text-xl lg:text-2xl text-platinum/80 mb-8 max-w-4xl mx-auto font-light leading-relaxed"
            >
              The first AI-powered SERP intelligence platform that reveals{" "}
              <em className="text-crimson font-medium">why</em> pages rank—not just who ranks.
              Uncover the hidden signals: tone, sentiment, UX patterns, and content depth.
            </motion.p>
            
            <motion.div variants={fadeInUp} className="glassmorphism p-8 rounded-2xl max-w-lg mx-auto mb-8">
              <h3 className="font-playfair text-2xl font-semibold mb-4 text-white">Join the Elite Waitlist</h3>
              <p className="text-platinum/70 mb-6">Limited access. Strategic advantage.</p>
              
              <Form {...heroForm}>
                <form onSubmit={heroForm.handleSubmit(onSubmit)} className="space-y-4" id="hero-form">
                  <FormField
                    control={heroForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            {...field}
                            type="email"
                            placeholder="Enter your professional email"
                            className="w-full px-4 py-3 bg-obsidian/50 border border-crimson/30 rounded-lg text-white placeholder-platinum/50 focus:border-crimson focus:ring-2 focus:ring-crimson/20"
                          />
                        </FormControl>
                        <FormMessage className="text-crimson" />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    disabled={waitlistMutation.isPending}
                    className="w-full bg-crimson hover:bg-ruby text-white py-3 px-6 rounded-lg font-semibold cta-hover animate-glow-pulse"
                  >
                    {waitlistMutation.isPending ? "Processing..." : "Request Exclusive Access"}
                  </Button>
                </form>
              </Form>
              
              <p className="text-xs text-platinum/50 mt-4 flex items-center justify-center">
                <Shield className="w-3 h-3 text-gold mr-1" />
                No spam. Unsubscribe anytime. GDPR compliant.
              </p>
            </motion.div>
            
            <motion.div 
              variants={fadeInUp}
              className="flex items-center justify-center space-x-8 text-sm text-platinum/60"
            >
              <div className="flex items-center">
                <Users className="w-4 h-4 text-gold mr-2" />
                <span>{waitlistCount?.count || 0}+ Strategic Partners</span>
              </div>
              <div className="flex items-center">
                <Star className="w-4 h-4 text-gold mr-2" />
                <span>Invitation Only</span>
              </div>
              <div className="flex items-center">
                <Timer className="w-4 h-4 text-gold mr-2" />
                <span>30-Day Risk Free</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
      {/* Feature Explainer */}
      <section className="py-20 bg-obsidian/50 relative">
        <div className="container mx-auto px-6">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeInUp} className="font-playfair text-4xl lg:text-5xl font-bold text-white mb-6">
              The AI Brain Behind{" "}
              <span className="text-crimson">SERP Domination</span>
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-xl text-platinum/70 max-w-3xl mx-auto">
              While others count keywords, we decode the strategic intelligence that drives rankings.
              Every page tells a story—we reveal the plot.
            </motion.p>
          </motion.div>
          
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* 3D SERP Visualization */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <Card className="glassmorphism p-8 rounded-2xl relative overflow-hidden feature-card">
                <div className="absolute top-0 right-0 w-32 h-32 bg-crimson/20 rounded-full blur-2xl" />
                
                <CardContent className="p-0 space-y-4">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="font-playfair text-xl font-semibold text-white">Live SERP Analysis</h4>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <span className="text-xs text-platinum/60">AI Processing</span>
                    </div>
                  </div>
                  
                  <Card className="glassmorphism p-4 rounded-lg border border-crimson/20 feature-card">
                    <CardContent className="p-0">
                      <div className="flex justify-between items-start mb-2">
                        <h5 className="text-white font-medium">Advanced SEO Strategies Guide</h5>
                        <span className="text-xs bg-crimson/20 text-crimson px-2 py-1 rounded">92% Match</span>
                      </div>
                      <p className="text-sm mb-3 text-[#e7b008]">Comprehensive guide covering technical and content optimization...</p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center">
                          <Brain className="w-3 h-3 text-gold mr-1" />
                          <span className="text-[#e5e7eb]">Authoritative Tone</span>
                        </div>
                        <div className="flex items-center">
                          <Globe className="w-3 h-3 text-gold mr-1" />
                          <span className="text-[#e5e7eb]">Mobile Optimized</span>
                        </div>
                        <div className="flex items-center">
                          <BarChart3 className="w-3 h-3 text-gold mr-1" />
                          <span className="text-[#e5e7eb]">High Depth Score</span>
                        </div>
                        <div className="flex items-center">
                          <Zap className="w-3 h-3 text-gold mr-1" />
                          <span className="text-[#e5e7eb]">Positive Sentiment</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="glassmorphism p-4 rounded-lg border border-crimson/20 feature-card">
                    <CardContent className="p-0">
                      <div className="flex justify-between items-start mb-2">
                        <h5 className="text-white font-medium">SEO Best Practices 2024</h5>
                        <span className="text-xs bg-crimson/20 text-crimson px-2 py-1 rounded">87% Match</span>
                      </div>
                      <p className="text-sm mb-3 text-[#e7b008]">Updated strategies for modern search engine optimization...</p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center">
                          <Brain className="w-3 h-3 text-gold mr-1" />
                          <span className="text-[#e5e7eb]">Educational Tone</span>
                        </div>
                        <div className="flex items-center">
                          <Globe className="w-3 h-3 text-gold mr-1" />
                          <span className="text-[#e5e7eb]">Desktop Focused</span>
                        </div>
                        <div className="flex items-center">
                          <BarChart3 className="w-3 h-3 text-gold mr-1" />
                          <span className="text-[#e5e7eb]">Medium Depth</span>
                        </div>
                        <div className="flex items-center">
                          <Zap className="w-3 h-3 text-gold mr-1" />
                          <span className="text-[#e5e7eb]">Neutral Sentiment</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </motion.div>
            
            {/* Feature Bullets */}
            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="space-y-8"
            >
              <motion.div variants={fadeInUp}>
                <Card className="glassmorphism p-6 rounded-xl feature-card">
                  <CardContent className="p-0">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-crimson/20 rounded-lg flex items-center justify-center">
                        <Brain className="text-crimson text-xl" />
                      </div>
                      <div>
                        <h4 className="font-playfair text-xl font-semibold text-white mb-2">Multi-Dimensional Intelligence</h4>
                        <p className="text-[#e7b008]">Analyzes tone, sentiment, UX patterns, content structure, and topical depth—not just keywords and backlinks.</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
              
              <motion.div variants={fadeInUp}>
                <Card className="glassmorphism p-6 rounded-xl feature-card">
                  <CardContent className="p-0">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-crimson/20 rounded-lg flex items-center justify-center">
                        <Target className="text-crimson text-xl" />
                      </div>
                      <div>
                        <h4 className="font-playfair text-xl font-semibold text-white mb-2">Precision Targeting</h4>
                        <p className="text-[#e7b008]">Cross-reference rankings by keyword, location, device type, and search intent for surgical precision.</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
              
              <motion.div variants={fadeInUp}>
                <Card className="glassmorphism p-6 rounded-xl feature-card">
                  <CardContent className="p-0">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-crimson/20 rounded-lg flex items-center justify-center">
                        <Crown className="text-crimson text-xl" />
                      </div>
                      <div>
                        <h4 className="font-playfair text-xl font-semibold text-white mb-2">Strategic Recommendations</h4>
                        <p className="text-[#e7b008]">Receive actionable, intelligence-driven tactics that help you outperform—not just optimize.</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
              
              <motion.div variants={fadeInUp}>
                <Card className="glassmorphism p-6 rounded-xl feature-card">
                  <CardContent className="p-0">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-crimson/20 rounded-lg flex items-center justify-center">
                        <Rocket className="text-crimson text-xl" />
                      </div>
                      <div>
                        <h4 className="font-playfair text-xl font-semibold text-white mb-2">Performance Acceleration</h4>
                        <p className="text-[#e7b008]">Transform competitor analysis from guesswork into scientific advantage with LLM-powered insights.</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>
      {/* Use Case Block */}
      <section className="py-20 bg-charcoal relative">
        <div className="container mx-auto px-6">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeInUp} className="font-playfair text-4xl lg:text-5xl font-bold text-white mb-6">
              Built for <span className="text-crimson">Power Players</span>
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-xl text-platinum/70 max-w-3xl mx-auto">
              Strategic SEO teams demand more than surface-level data.
              Here's how elite professionals leverage SERP Intelligence.
            </motion.p>
          </motion.div>
          
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-8"
          >
            <motion.div variants={fadeInUp}>
              <Card className="glassmorphism p-8 rounded-2xl feature-card h-full">
                <CardContent className="p-0">
                  <div className="w-16 h-16 bg-crimson/20 rounded-lg flex items-center justify-center mb-6">
                    <Building className="text-crimson text-2xl" />
                  </div>
                  <h3 className="font-playfair text-2xl font-semibold mb-4 text-[#e7b008]">Enterprise SEO Leads</h3>
                  <p className="mb-6 text-[#e5e7eb]">
                    "Instead of guessing why competitors rank, I can reverse-engineer their exact content strategy—tone, depth, UX patterns—and build superior alternatives."
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-crimson font-medium">Strategic Advantage</span>
                    <ChevronRight className="w-4 h-4 text-gold" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div variants={fadeInUp}>
              <Card className="glassmorphism p-8 rounded-2xl feature-card h-full">
                <CardContent className="p-0">
                  <div className="w-16 h-16 bg-crimson/20 rounded-lg flex items-center justify-center mb-6">
                    <Users className="text-crimson text-2xl" />
                  </div>
                  <h3 className="font-playfair text-2xl font-semibold text-white mb-4">Digital Agencies</h3>
                  <p className="mb-6 text-[#e5e7eb]">
                    "Client presentations transformed overnight. We now deliver concrete intelligence about why their competitors dominate specific niches—and how to beat them."
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-crimson font-medium">Client Impact</span>
                    <Crown className="w-4 h-4 text-gold" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div variants={fadeInUp}>
              <Card className="glassmorphism p-8 rounded-2xl feature-card h-full">
                <CardContent className="p-0">
                  <div className="w-16 h-16 bg-crimson/20 rounded-lg flex items-center justify-center mb-6">
                    <PenTool className="text-crimson text-2xl" />
                  </div>
                  <h3 className="font-playfair text-2xl font-semibold text-white mb-4">Content Strategists</h3>
                  <p className="mb-6 text-[#e5e7eb]">
                    "Finally, data-driven content direction. I can identify the exact sentiment, tone, and depth that drives rankings in any niche—then optimize accordingly."
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-crimson font-medium">Content Precision</span>
                    <Target className="w-4 h-4 text-gold" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>
      {/* Testimonial Block */}
      <section className="py-20 bg-obsidian/30 relative">
        <div className="container mx-auto px-6">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeInUp} className="font-playfair text-4xl lg:text-5xl font-bold text-white mb-6">
              Trusted by <span className="text-crimson">Elite Teams</span>
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-xl text-platinum/70">
              Early access partners are already reshaping their SEO strategies
            </motion.p>
          </motion.div>
          
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto"
          >
            <motion.div variants={fadeInUp}>
              <Card className="glassmorphism p-8 rounded-2xl feature-card h-full">
                <CardContent className="p-0">
                  <div className="flex items-center mb-6">
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150"
                      alt="Sarah Chen, SEO Director"
                      className="w-16 h-16 rounded-full object-cover mr-4"
                    />
                    <div>
                      <h4 className="text-white font-semibold">Sarah Chen</h4>
                      <p className="text-sm text-[#e7b008]">SEO Director, TechCorp</p>
                    </div>
                  </div>
                  <blockquote className="italic mb-4 text-[#e5e7eb]">
                    "This completely changed how we approach competitive analysis. We're not just tracking rankings—we're understanding the strategic thinking behind them."
                  </blockquote>
                  <div className="flex items-center text-gold text-sm">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current mr-1" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div variants={fadeInUp}>
              <Card className="glassmorphism p-8 rounded-2xl feature-card h-full">
                <CardContent className="p-0">
                  <div className="flex items-center mb-6">
                    <img
                      src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150"
                      alt="Marcus Rodriguez, Agency Founder"
                      className="w-16 h-16 rounded-full object-cover mr-4"
                    />
                    <div>
                      <h4 className="text-white font-semibold">Marcus Rodriguez</h4>
                      <p className="text-sm text-[#e7b008]">Founder, Growth Labs</p>
                    </div>
                  </div>
                  <blockquote className="italic mb-4 text-[#e5e7eb]">
                    "Our client retention increased 40% after implementing insights from SERP Intelligence. The strategic depth is unmatched."
                  </blockquote>
                  <div className="flex items-center text-gold text-sm">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current mr-1" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div variants={fadeInUp}>
              <Card className="glassmorphism p-8 rounded-2xl feature-card h-full">
                <CardContent className="p-0">
                  <div className="flex items-center mb-6">
                    <img
                      src="https://images.unsplash.com/photo-1494790108755-2616b612b47c?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150"
                      alt="Elena Vasquez, Content Strategy Lead"
                      className="w-16 h-16 rounded-full object-cover mr-4"
                    />
                    <div>
                      <h4 className="text-white font-semibold">Elena Vasquez</h4>
                      <p className="text-sm text-[#e7b008]">Content Strategy Lead</p>
                    </div>
                  </div>
                  <blockquote className="italic mb-4 text-[#e5e7eb]">
                    "Finally, a tool that explains the 'why' behind rankings. Our content team now creates with surgical precision instead of educated guesses."
                  </blockquote>
                  <div className="flex items-center text-gold text-sm">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current mr-1" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
          
          {/* Trust Signals */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-16 flex items-center justify-center space-x-12 opacity-60"
          >
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-gold" />
              <span className="text-sm">Enterprise Security</span>
            </div>
            <div className="flex items-center space-x-2">
              <Award className="w-4 h-4 text-gold" />
              <span className="text-sm">SOC 2 Compliant</span>
            </div>
            <div className="flex items-center space-x-2">
              <Globe className="w-4 h-4 text-gold" />
              <span className="text-sm">GDPR Ready</span>
            </div>
            <div className="flex items-center space-x-2">
              <Timer className="w-4 h-4 text-gold" />
              <span className="text-sm">99.9% Uptime</span>
            </div>
          </motion.div>
        </div>
      </section>
      {/* Final CTA */}
      <section className="py-20 bg-charcoal relative overflow-hidden">
        {/* Animated background elements */}
        <motion.div
          style={{ y: y1 }}
          className="absolute top-0 left-1/4 w-96 h-96 bg-crimson rounded-full blur-3xl opacity-5"
        />
        <motion.div
          style={{ y: y2 }}
          className="absolute bottom-0 right-1/4 w-72 h-72 bg-ruby rounded-full blur-3xl opacity-5"
        />
        
        <div className="container mx-auto px-6 text-center relative z-10">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="max-w-4xl mx-auto"
          >
            <motion.h2 variants={fadeInUp} className="font-playfair text-5xl lg:text-6xl font-bold text-white mb-6">
              Stop Guessing.{" "}
              <span className="text-crimson text-shadow-glow">Start Dominating.</span>
            </motion.h2>
            
            <motion.p variants={fadeInUp} className="text-xl text-platinum/80 mb-8 max-w-3xl mx-auto">
              Join an exclusive cohort of strategic SEO professionals who've moved beyond keyword tracking
              to true competitive intelligence.
            </motion.p>
            
            <motion.div variants={fadeInUp} className="glassmorphism p-8 rounded-2xl max-w-lg mx-auto mb-8">
              <div className="mb-6">
                <div className="flex items-center justify-center space-x-4 mb-4">
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                    <span className="text-sm">30-Day Risk-Free Trial</span>
                  </div>
                  <div className="flex items-center">
                    <UserPlus className="w-4 h-4 text-gold mr-2" />
                    <span className="text-sm">Limited Cohort</span>
                  </div>
                </div>
                <p className="text-platinum/60 text-sm">
                  Early access includes 1:1 strategic onboarding and priority support.
                </p>
              </div>
              
              <Form {...finalForm}>
                <form onSubmit={finalForm.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={finalForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            {...field}
                            type="email"
                            placeholder="Your professional email"
                            className="w-full px-4 py-3 bg-obsidian/50 border border-crimson/30 rounded-lg text-white placeholder-platinum/50 focus:border-crimson focus:ring-2 focus:ring-crimson/20"
                          />
                        </FormControl>
                        <FormMessage className="text-crimson" />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    disabled={waitlistMutation.isPending}
                    className="w-full bg-crimson hover:bg-ruby text-white py-4 px-8 rounded-lg font-bold text-lg cta-hover animate-glow-pulse"
                  >
                    {waitlistMutation.isPending ? "Processing..." : "Secure Your Strategic Advantage"}
                  </Button>
                </form>
              </Form>
              
              <div className="flex items-center justify-center mt-4 text-xs text-platinum/50">
                <Lock className="w-3 h-3 mr-1" />
                <span>Your data is protected and never shared</span>
              </div>
            </motion.div>
            
            <motion.div 
              variants={fadeInUp}
              className="flex items-center justify-center space-x-8 text-sm text-platinum/60"
            >
              <div className="flex items-center">
                <Timer className="w-4 h-4 text-gold mr-2" />
                <span>Applications close in 72 hours</span>
              </div>
              <div className="flex items-center">
                <UserPlus className="w-4 h-4 text-gold mr-2" />
                <span>{spotsRemaining} spots remaining</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
      {/* Footer */}
      <footer className="bg-obsidian py-12 border-t border-crimson/20">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="font-playfair text-2xl font-bold text-crimson mb-4 md:mb-0">
              SERP Intelligence
            </div>
            <div className="flex space-x-6 text-platinum/60 text-sm">
              <a href="#" className="hover:text-crimson transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-crimson transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-crimson transition-colors">Contact</a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-crimson/10 text-center text-platinum/40 text-sm">
            <p>&copy; 2024 SERP Intelligence. Built for strategic advantage.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
