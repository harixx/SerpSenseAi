import { useState, useEffect, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import { F1AudioEngine } from "@/utils/f1Audio";
import { useOptimizedScroll, useIntersectionObserver } from "@/hooks/use-optimized-scroll";
import { logger } from "@/utils/logger";
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
import { useWebSocket } from "@/hooks/use-websocket";
import { useAnalytics } from "@/hooks/use-analytics";
import { useHeroCTATest, useHeroHeadlineTest, useSocialProofTest } from "@/hooks/use-ab-test";
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
  ChevronRight,
  Code,
  Database
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
  const { scrollY, getTransform } = useOptimizedScroll();
  const audioRef = useRef<HTMLAudioElement>(null);
  const f1AudioEngine = useRef<F1AudioEngine | null>(null);

  const heroFormRef = useRef<HTMLFormElement>(null); // 👈 ref ban gaya
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        window.gtag?.("event", "form_view", {
          form_id: "hero-form",
        });
        observer.disconnect(); // sirf ek baar fire hoga
      }
    }, { threshold: 0.5 }); // half screen pe aaye to count

    if (heroFormRef.current) {
      observer.observe(heroFormRef.current);
    }

    return () => observer.disconnect();
  }, []);

  
  // ROI Calculator State
  const [seoSpend, setSeoSpend] = useState(5000);
  const [monthlyTraffic, setMonthlyTraffic] = useState(10000);
  
  // ROI Calculation Function
  const calculateROI = (traffic: number, spend: number) => {
    const imperiusCost = 697; // Monthly cost
    const trafficImprovementRate = 0.42; // 42% average improvement
    const conversionRate = 0.021; // 2.1% industry average conversion rate
    const avgOrderValue = 285; // Realistic B2B average order value
    
    const additionalTraffic = traffic * trafficImprovementRate;
    const additionalRevenue = additionalTraffic * conversionRate * avgOrderValue;
    const monthlyROI = ((additionalRevenue - imperiusCost) / imperiusCost) * 100;
    
    return {
      additionalTraffic: Math.round(additionalTraffic),
      additionalRevenue: Math.round(additionalRevenue),
      monthlyROI: Math.round(monthlyROI)
    };
  };
  
  const roiResults = calculateROI(monthlyTraffic, seoSpend);
  const [audioEnabled, setAudioEnabled] = useState(true); // Start with audio ON by default
  const [usingSyntheticAudio, setUsingSyntheticAudio] = useState(false);
  const [userMuted, setUserMuted] = useState(false); // Track if user manually muted
  
  // Performance-optimized parallax transforms with memoization
  const parallaxTransforms = useMemo(() => ({
    y1: getTransform([0, 1000], [0, 200]),
    y2: getTransform([0, 1000], [0, -150]),
    y3: getTransform([0, 1000], [0, 100]),
    y4: getTransform([0, 1000], [0, -250]),
    rotate1: getTransform([0, 1000], [0, 360], 'rotate'),
    rotate2: getTransform([0, 1000], [0, -180], 'rotate'),
    scale1: getTransform([0, 500], [1, 1.2], 'scale'),
    opacity1: getTransform([0, 300], [0.1, 0.3], 'opacity'),
    opacity2: getTransform([200, 800], [0.1, 0.4], 'opacity'),
  }), [getTransform]);

  // Real-time WebSocket connection for instant updates
  const { isConnected, lastMessage, connectionError } = useWebSocket();
  const [realtimeCount, setRealtimeCount] = useState<number>(0);
  
  // Optimized query with longer intervals to reduce server load
  const { data: waitlistCount } = useQuery<{ count: number }>({
    queryKey: ["/api/waitlist/count"],
    refetchInterval: isConnected ? false : 60000, // Increased to 60s when WebSocket is disconnected
    enabled: !isConnected, // Only fetch when WebSocket is not connected
    staleTime: 30000, // Consider data fresh for 30s
    gcTime: 300000, // Keep in cache for 5 minutes
  });

  // Handle real-time WebSocket messages
  useEffect(() => {
    if (lastMessage) {
      switch (lastMessage.type) {
        case 'initial_count':
          if (typeof lastMessage.count === 'number') {
            setRealtimeCount(lastMessage.count);
          }
          break;
        case 'waitlist_update':
          if (typeof lastMessage.count === 'number') {
            setRealtimeCount(lastMessage.count);
            // Show real-time notification for new signups
            toast({
              title: "🚀 New Member Joined!",
              description: `Elite waitlist growing strong: ${lastMessage.count} strategic minds`,
              duration: 3000,
            });
          }
          break;
      }
    }
  }, [lastMessage, toast]);

  // Use real-time count when available, fallback to API count
  const currentCount = isConnected ? realtimeCount : (waitlistCount?.count || 0);

  const waitlistMutation = useMutation({
    mutationFn: async (data: InsertWaitlistEntry) => {
      const response = await apiRequest("POST", "/api/waitlist", data);
      return response.json();
    },
    onSuccess: (data) => {
      // Update real-time count immediately if returned from server
      if (data.count && isConnected) {
        setRealtimeCount(data.count);
      }
      
      toast({
        title: "🎯 Welcome to the Elite Waitlist!",
        description: "You'll receive priority access and strategic onboarding when we launch.",
        duration: 5000,
      });
      
      // Only invalidate queries if WebSocket is not connected (fallback mode)
      if (!isConnected) {
        queryClient.invalidateQueries({ queryKey: ["/api/waitlist/count"] });
      }
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
    // Track lead action for conversion
    trackLeadAction('form_submit', data.source);
    
    // Track A/B test conversion
    heroCTA.trackConversion();
    
    waitlistMutation.mutate(data);
  };

  // Real-time connection status indicator
  const connectionStatus = isConnected ? "🟢 Live" : connectionError ? "🔴 Offline" : "🟡 Connecting";

  // Generate session ID for analytics and A/B testing
  const sessionId = useRef(`session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  
  // Initialize analytics tracking
  const { trackEvent, trackLeadAction } = useAnalytics({
    sessionId: sessionId.current,
    enableTracking: true,
  });

  // Initialize A/B tests
  const heroCTA = useHeroCTATest(sessionId.current);
  const heroHeadline = useHeroHeadlineTest(sessionId.current);
  const socialProof = useSocialProofTest(sessionId.current);

  // Initialize F1 Audio System
  useEffect(() => {
    logger.log('Initializing F1 Audio System...');
    f1AudioEngine.current = new F1AudioEngine();
    
    // Try real F1 audio first
    const startRealAudio = () => {
      if (audioRef.current) {
        logger.log('Attempting to start real F1 audio...');
        logger.log('Audio element readyState:', audioRef.current.readyState);
        logger.log('Audio element src:', audioRef.current.src);
        
        audioRef.current.volume = 0.6;
        audioRef.current.currentTime = 0;
        
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.then(() => {
            setAudioEnabled(true);
            setUsingSyntheticAudio(false);
            logger.log('✅ Real F1 audio started successfully!');
          }).catch((e) => {
            logger.log('❌ Real F1 audio blocked:', e.message);
            logger.log('Falling back to synthetic audio...');
            if (f1AudioEngine.current) {
              f1AudioEngine.current.setVolume(0.3);
              f1AudioEngine.current.start();
              setAudioEnabled(true);
              setUsingSyntheticAudio(true);
            }
          });
        }
      } else {
        logger.log('❌ Audio element not found');
      }
    };
    
    // Note: Modern browsers block autoplay without user interaction
    // Audio will start on first user interaction (click, scroll, etc.)
    logger.log('Audio system ready - waiting for user interaction to start');
    
    return () => {
      if (f1AudioEngine.current) {
        f1AudioEngine.current.stop();
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  // Auto-start audio on first user interaction (only if user hasn't manually muted)
  useEffect(() => {
    const startAudioOnInteraction = (e: Event) => {
      const target = e.target as HTMLElement;
      const isAudioToggle = target && typeof target.closest === 'function' ? target.closest('[data-audio-toggle]') : false;
      
      // Only auto-start if audio is currently enabled and user hasn't manually muted
      if (audioEnabled && !userMuted && !isAudioToggle) {
        logger.log('User interaction detected - starting F1 audio!');
        
        // Try real audio first
        if (audioRef.current) {
          logger.log('User interaction - attempting audio start...');
          audioRef.current.volume = 0.6;
          audioRef.current.currentTime = 0;
          audioRef.current.play().then(() => {
            setUsingSyntheticAudio(false);
            logger.log('✅ Real F1 audio started on interaction!');
            // Remove listeners after successful start
            document.removeEventListener('click', startAudioOnInteraction);
            document.removeEventListener('touchstart', startAudioOnInteraction);
            document.removeEventListener('scroll', startAudioOnInteraction);
            document.removeEventListener('keydown', startAudioOnInteraction);
          }).catch((e) => {
            logger.log('❌ Real audio failed on interaction:', e.message);
            // Fallback to synthetic
            if (f1AudioEngine.current) {
              f1AudioEngine.current.setVolume(0.3);
              f1AudioEngine.current.start();
              setUsingSyntheticAudio(true);
              logger.log('✅ Synthetic F1 audio started on interaction!');
              // Remove listeners after successful start
              document.removeEventListener('click', startAudioOnInteraction);
              document.removeEventListener('touchstart', startAudioOnInteraction);
              document.removeEventListener('scroll', startAudioOnInteraction);
              document.removeEventListener('keydown', startAudioOnInteraction);
            }
          });
        }
      }
    };

    // Only add listeners if audio should be enabled and user hasn't manually muted
    if (audioEnabled && !userMuted) {
      document.addEventListener('click', startAudioOnInteraction, { once: false });
      document.addEventListener('touchstart', startAudioOnInteraction, { once: false });
      document.addEventListener('scroll', startAudioOnInteraction, { once: false });
      document.addEventListener('keydown', startAudioOnInteraction, { once: false });
    }

    return () => {
      document.removeEventListener('click', startAudioOnInteraction);
      document.removeEventListener('touchstart', startAudioOnInteraction);
      document.removeEventListener('scroll', startAudioOnInteraction);
      document.removeEventListener('keydown', startAudioOnInteraction);
    };
  }, [audioEnabled, userMuted]);

  const toggleAudio = () => {
    if (audioEnabled) {
      // User manually muting - stop audio and mark as user muted
      if (usingSyntheticAudio && f1AudioEngine.current) {
        f1AudioEngine.current.stop();
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setAudioEnabled(false);
      setUserMuted(true); // Track that user manually muted
      setUsingSyntheticAudio(false);
      logger.log('F1 audio stopped via user toggle');
    } else {
      // User manually unmuting - start audio and clear muted flag
      setUserMuted(false); // Clear manual mute flag
      
      // Start F1 audio - try real first, then synthetic
      if (audioRef.current) {
        audioRef.current.volume = 0.6;
        audioRef.current.currentTime = 0;
        const playPromise = audioRef.current.play();
        
        if (playPromise !== undefined) {
          playPromise.then(() => {
            setAudioEnabled(true);
            setUsingSyntheticAudio(false);
            logger.log('Real F1 audio started via user toggle');
          }).catch((e) => {
            logger.log('Real audio failed via toggle, using synthetic:', e.message);
            // Fallback to synthetic
            if (f1AudioEngine.current) {
              f1AudioEngine.current.setVolume(0.3);
              f1AudioEngine.current.start();
              setAudioEnabled(true);
              setUsingSyntheticAudio(true);
              logger.log('Synthetic F1 audio started via user toggle');
            }
          });
        }
      } else {
        // No real audio available, use synthetic
        if (f1AudioEngine.current) {
          f1AudioEngine.current.setVolume(0.3);
          f1AudioEngine.current.start();
          setAudioEnabled(true);
          setUsingSyntheticAudio(true);
          logger.log('Synthetic F1 audio started via user toggle (no real audio)');
        }
      }
    }
  };

  return (
    <div className="min-h-screen text-white overflow-x-hidden relative safe-area-top safe-area-bottom">
      {/* F1 Racing Audio */}
      <audio
        ref={audioRef}
        src="/attached_assets/13464_1459539280_1753112009861.mp3"
        loop
        preload="auto"
        className="hidden"
        onError={(e) => {
          logger.log('F1 audio failed to load:', e);
          logger.log('Using synthetic fallback...');
          if (f1AudioEngine.current && !usingSyntheticAudio) {
            f1AudioEngine.current.setVolume(0.3);
            f1AudioEngine.current.start();
            setUsingSyntheticAudio(true);
            setAudioEnabled(true);
          }
        }}
        onCanPlay={() => {
          logger.log('F1 racing audio ready to play');
        }}
        onPlay={() => {
          logger.log('F1 racing audio started playing');
          setAudioEnabled(true);
          setUsingSyntheticAudio(false);
        }}
        onLoadStart={() => {
          logger.log('F1 audio loading started...');
        }}
        onLoadedData={() => {
          logger.log('F1 audio data loaded successfully');
        }}
      >
        <source src="/attached_assets/13464_1459539280_1753112009861.mp3" type="audio/mpeg" />
      </audio>
      {/* Audio Status - Mobile Optimized */}
      {!audioEnabled && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-crimson/90 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-bold animate-pulse touch-target">
          <span className="hidden sm:inline">Click anywhere to start F1 Audio</span>
          <span className="sm:hidden">Tap to start F1 Audio</span>
        </div>
      )}
      {/* Racing Video Background */}
      <div className="fixed inset-0 z-0">
        {/* Professional Video Shield Overlay */}
        <div className="video-overlay-shield"></div>
        
        {/* Racing Video Background */}
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="w-full h-full object-cover"
          style={{ 
            backgroundAttachment: 'fixed',
            mixBlendMode: 'normal',
            pointerEvents: 'none'
          }}
          onError={(e) => {
            logger.error('F1 racing video failed to load:', e);
            logger.log('Video source attempted:', e.currentTarget.currentSrc);
            e.currentTarget.style.display = 'none';
            const fallback = e.currentTarget.nextElementSibling as HTMLElement;
            if (fallback) fallback.style.display = 'block';
          }}
          onLoadedData={(e) => {
            logger.log('F1 racing video loaded successfully from:', e.currentTarget.currentSrc);
          }}
          onCanPlay={() => {
            logger.log('F1 racing video can start playing');
          }}
          onLoadStart={() => {
            logger.log('F1 racing video started loading');
          }}
        >
          <source src="/attached_assets/5cf22b7b7ee772d0a22fefbd4da43ab3-720p-preview_1753110183979.mp4" type="video/mp4" />
          <source src="https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4" type="video/mp4" />
        </video>
        
        {/* Backup Racing Video */}
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="w-full h-full object-cover"
          style={{ 
            display: 'none',
            backgroundAttachment: 'fixed',
            mixBlendMode: 'normal',
            pointerEvents: 'none'
          }}
          onError={(e) => {
            logger.log('Backup video failed to load, using animated background');
            e.currentTarget.style.display = 'none';
            const fallback = e.currentTarget.nextElementSibling as HTMLElement;
            if (fallback) fallback.style.display = 'block';
          }}
          onLoadedData={() => {
            logger.log('Backup racing video loaded successfully');
          }}
        >
          <source src="https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4" type="video/mp4" />
        </video>
        
        {/* Animated Racing Background as fallback */}
        <div className="w-full h-full racing-background" style={{ display: 'none' }}>
          <div className="racing-lines"></div>
          <div className="speed-blur"></div>
          <div className="racing-particles">
            <div className="racing-particle"></div>
            <div className="racing-particle"></div>
            <div className="racing-particle"></div>
            <div className="racing-particle"></div>
            <div className="racing-particle"></div>
            <div className="racing-particle"></div>
          </div>
        </div>
        {/* Professional dark overlay for readability */}
        <div 
          className="absolute inset-0 w-full h-full"
          style={{
            background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.4) 50%, rgba(0, 0, 0, 0.8) 100%)',
            backdropFilter: 'blur(1px)',
            pointerEvents: 'none',
            zIndex: 5
          }}
        ></div>
        
        {/* Subtle crimson accent overlay */}
        <div 
          className="absolute inset-0 w-full h-full"
          style={{
            background: 'radial-gradient(ellipse at center bottom, rgba(220, 38, 38, 0.08) 0%, transparent 60%)',
            pointerEvents: 'none',
            zIndex: 6
          }}
        ></div>
        
        {/* Enhanced corner shields to completely hide video previews */}
        <div 
          className="absolute top-0 left-0 w-48 h-48"
          style={{
            background: 'radial-gradient(circle at top left, rgba(0, 0, 0, 0.95) 0%, rgba(0, 0, 0, 0.7) 50%, transparent 80%)',
            pointerEvents: 'none',
            zIndex: 20
          }}
        ></div>
        <div 
          className="absolute top-0 right-0 w-48 h-48"
          style={{
            background: 'radial-gradient(circle at top right, rgba(0, 0, 0, 0.95) 0%, rgba(0, 0, 0, 0.7) 50%, transparent 80%)',
            pointerEvents: 'none',
            zIndex: 20
          }}
        ></div>
        <div 
          className="absolute bottom-0 left-0 w-48 h-48"
          style={{
            background: 'radial-gradient(circle at bottom left, rgba(0, 0, 0, 0.95) 0%, rgba(0, 0, 0, 0.7) 50%, transparent 80%)',
            pointerEvents: 'none',
            zIndex: 20
          }}
        ></div>
        <div 
          className="absolute bottom-0 right-0 w-48 h-48"
          style={{
            background: 'radial-gradient(circle at bottom right, rgba(0, 0, 0, 0.95) 0%, rgba(0, 0, 0, 0.7) 50%, transparent 80%)',
            pointerEvents: 'none',
            zIndex: 20
          }}
        ></div>
        
        {/* Additional edge shields for video preview blocking */}
        <div 
          className="absolute top-0 left-0 w-full h-20"
          style={{
            background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.6) 0%, transparent 100%)',
            pointerEvents: 'none',
            zIndex: 18
          }}
        ></div>
        <div 
          className="absolute bottom-0 left-0 w-full h-20"
          style={{
            background: 'linear-gradient(to top, rgba(0, 0, 0, 0.6) 0%, transparent 100%)',
            pointerEvents: 'none',
            zIndex: 18
          }}
        ></div>
        <div 
          className="absolute top-0 left-0 w-20 h-full"
          style={{
            background: 'linear-gradient(to right, rgba(0, 0, 0, 0.6) 0%, transparent 100%)',
            pointerEvents: 'none',
            zIndex: 18
          }}
        ></div>
        <div 
          className="absolute top-0 right-0 w-20 h-full"
          style={{
            background: 'linear-gradient(to left, rgba(0, 0, 0, 0.6) 0%, transparent 100%)',
            pointerEvents: 'none',
            zIndex: 18
          }}
        ></div>
        
        {/* Specific bottom-left video preview blocker */}
        <div 
          className="absolute bottom-0 left-0 w-64 h-48"
          style={{
            background: `
              linear-gradient(135deg, 
                rgba(10, 10, 10, 0.98) 0%, 
                rgba(20, 20, 20, 0.9) 30%, 
                rgba(0, 0, 0, 0.7) 60%, 
                transparent 100%
              )
            `,
            pointerEvents: 'none',
            zIndex: 25,
            backdropFilter: 'blur(2px)'
          }}
        ></div>
        
        {/* Additional comprehensive video blocker overlay */}
        <div 
          className="absolute inset-0 w-full h-full"
          style={{
            background: `
              radial-gradient(ellipse at bottom left, 
                rgba(10, 10, 10, 0.95) 0%, 
                rgba(0, 0, 0, 0.6) 15%, 
                transparent 30%
              ),
              radial-gradient(ellipse at bottom right, 
                rgba(10, 10, 10, 0.95) 0%, 
                rgba(0, 0, 0, 0.6) 15%, 
                transparent 30%
              ),
              radial-gradient(ellipse at top left, 
                rgba(10, 10, 10, 0.95) 0%, 
                rgba(0, 0, 0, 0.6) 15%, 
                transparent 30%
              ),
              radial-gradient(ellipse at top right, 
                rgba(10, 10, 10, 0.95) 0%, 
                rgba(0, 0, 0, 0.6) 15%, 
                transparent 30%
              )
            `,
            pointerEvents: 'none',
            zIndex: 30
          }}
        ></div>
        
        {/* Final layer - complete edge masking */}
        <div 
          className="absolute bottom-0 left-0"
          style={{
            width: '200px',
            height: '150px',
            background: 'linear-gradient(45deg, rgba(10, 10, 10, 1) 0%, rgba(10, 10, 10, 0.8) 50%, transparent 100%)',
            pointerEvents: 'none',
            zIndex: 35
          }}
        ></div>
      </div>
      {/* Floating Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Elegant floating shapes with professional colors */}
        <motion.div
          style={{ transform: `${parallaxTransforms.y1} ${parallaxTransforms.rotate1} ${parallaxTransforms.scale1}`, opacity: parallaxTransforms.opacity1 as any }}
          className="absolute top-10 left-10 w-96 h-96 bg-gradient-to-br from-crimson/10 to-white/5 rounded-full blur-3xl gpu-accelerated"
        />
        <motion.div
          style={{ transform: `${parallaxTransforms.y2} ${parallaxTransforms.rotate2}`, opacity: parallaxTransforms.opacity2 as any }}
          className="absolute top-1/4 right-10 w-80 h-80 bg-gradient-to-tl from-white/8 to-crimson/6 rounded-full blur-3xl gpu-accelerated"
        />
        <motion.div
          style={{ transform: parallaxTransforms.y3, opacity: parallaxTransforms.opacity1 as any }}
          className="absolute bottom-1/3 left-1/4 w-64 h-64 bg-gradient-to-tr from-crimson/8 to-white/4 rounded-full blur-2xl gpu-accelerated"
        />
        <motion.div
          style={{ transform: `${parallaxTransforms.y4} ${parallaxTransforms.rotate1}`, opacity: parallaxTransforms.opacity2 }}
          className="absolute bottom-10 right-1/4 w-72 h-72 bg-gradient-to-bl from-white/6 to-crimson/4 rounded-full blur-3xl gpu-accelerated"
        />
        
        {/* Refined geometric elements */}
        <motion.div
          style={{ transform: `${parallaxTransforms.y1} ${parallaxTransforms.rotate2}` }}
          className="absolute top-1/2 left-1/2 w-32 h-32 border border-white/10 rotate-45 opacity-15 animate-float-slow gpu-accelerated"
        />
        <motion.div
          style={{ transform: `${parallaxTransforms.y3} ${parallaxTransforms.rotate1}` }}
          className="absolute top-1/3 right-1/3 w-24 h-24 border border-crimson/20 rounded-full opacity-20 animate-float-medium gpu-accelerated"
        />
        <motion.div
          style={{ transform: `${parallaxTransforms.y2} ${parallaxTransforms.rotate2}` }}
          className="absolute bottom-1/2 left-1/3 w-16 h-16 bg-white/10 rotate-45 opacity-15 animate-float-fast gpu-accelerated"
        />
        
        {/* Performance-optimized floating particles */}
        {[...Array(12)].map((_, i) => {
          const particleY = getTransform([0, 1000], [0, (i % 3 + 1) * 100]);
          const particleX = getTransform([0, 1000], [0, (i % 2 === 0 ? 50 : -50)]);
          const particleOpacity = getTransform([0, 500], [0.2, 0.6], 'opacity');
          
          return (
            <motion.div
              key={i}
              style={{
                transform: `${particleY} ${particleX}`,
                opacity: particleOpacity,
                left: `${(i * 8.33) % 100}%`,
                top: `${(i * 12) % 100}%`,
              }}
              className={`absolute w-2 h-2 bg-white/30 rounded-full blur-sm`}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.2, 0.6, 0.2]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatType: "reverse",
                delay: i * 0.2
              }}
            />
          );
        })}
      </div>
      {/* Mobile-First Navigation */}
      <nav className="fixed top-0 w-full z-mobile-nav glassmorphism border-b border-crimson/20 safe-area-top">
        <div className="responsive-container py-2 xs:py-3 sm:py-4 flex justify-between items-center">
          <div className="font-playfair text-lg xs:text-xl sm:text-2xl lg:text-3xl font-bold text-crimson">
            Imperius
          </div>
          <div className="flex items-center gap-2 xs:gap-3 sm:gap-4">
            {/* Skip-to-Main Navigation for WCAG Compliance */}
            <a 
              href="#hero-form" 
              className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-crimson text-white px-4 py-2 rounded z-50"
              tabIndex={1}
            >
              Skip to main content
            </a>
            
            <Button 
              variant="default" 
              className="bg-crimson hover:bg-ruby text-white btn-responsive cta-hover touch-target nav-responsive focus:ring-2 focus:ring-crimson focus:ring-offset-2"
              onClick={() => document.getElementById('hero-form')?.scrollIntoView({ behavior: 'smooth' })}
              aria-label="Request access to Imperius platform"
            >
              <span className="hidden xs:inline">Request Access</span>
              <span className="xs:hidden">Join</span>
            </Button>
            <Button
              variant={audioEnabled ? "default" : "outline"}
              size="sm"
              className={`${audioEnabled ? "bg-crimson hover:bg-ruby text-white" : "border-crimson text-crimson hover:bg-crimson hover:text-white"} touch-target nav-responsive min-w-[44px]`}
              onClick={toggleAudio}
              title={audioEnabled ? "Mute F1 Sound" : "Enable F1 Sound"}
              data-audio-toggle="true"
            >
              <span className="text-sm xs:text-base">{audioEnabled ? "🔊" : "🔇"}</span>
              <span className="hidden sm:inline ml-1 text-xs">Audio</span>
            </Button>
          </div>
        </div>
      </nav>
      {/* Hero Section - Enterprise Mobile-First Design */}
      <section className="min-h-screen-mobile flex items-center justify-center relative overflow-hidden z-10 hero-responsive safe-area-top safe-area-bottom">
        {/* Professional hero animated elements */}
        <motion.div
          style={{ transform: `${parallaxTransforms.y1} ${parallaxTransforms.scale1}` }}
          className="absolute top-20 left-20 w-72 h-72 bg-white/5 rounded-full blur-3xl gpu-accelerated"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.05, 0.1, 0.05]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
        <motion.div
          style={{ transform: `${parallaxTransforms.y2} ${parallaxTransforms.rotate1}` }}
          className="absolute bottom-20 right-20 w-96 h-96 bg-crimson/8 rounded-full blur-3xl gpu-accelerated"
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.05, 0.12, 0.05]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            repeatType: "reverse",
            delay: 2
          }}
        />
        
        <div className="responsive-container text-center relative z-20">
          <motion.div
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className="max-w-6xl mx-auto"
          >
            <motion.h1 
              variants={fadeInUp}
              className="font-playfair text-responsive-3xl font-bold mb-6 leading-tight"
              role="banner"
              aria-level="1"
            >
              <span className="text-white">Beyond</span>{" "}
              <span className="text-crimson text-shadow-glow">Keywords.</span>
              <br className="hidden sm:block" />
              <span className="sm:hidden"> </span>
              <span className="text-white">Beyond</span>{" "}
              <span className="text-crimson text-shadow-glow">Rankings.</span>
            </motion.h1>
            
            <motion.p 
              variants={fadeInUp}
              className="text-responsive-lg text-white/90 mb-8 max-w-4xl mx-auto font-light leading-relaxed"
            >
              The first AI-powered SERP intelligence platform that reveals{" "}
              <em className="text-crimson font-medium">why</em> pages rank—not just who ranks.
              <span className="block sm:inline"> </span>
              Uncover the hidden signals: tone, sentiment, UX patterns, and content depth.
            </motion.p>
            
            <motion.div variants={fadeInUp} className="glassmorphism card-responsive max-w-sm xs:max-w-md sm:max-w-lg mx-auto mb-6 sm:mb-8 bg-[#bf000066]">
              {/* Enterprise Trust Signal Integration - Above Fold */}
              <div className="flex items-center justify-center mb-4 space-x-4 opacity-90">
                <div className="flex items-center space-x-1">
                  <Shield className="w-3 h-3 text-gold" />
                  <span className="text-xs text-platinum/80 font-medium">SOC 2</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Globe className="w-3 h-3 text-gold" />
                  <span className="text-xs text-platinum/80 font-medium">GDPR</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="w-3 h-3 text-gold" />
                  <span className="text-xs text-platinum/80 font-medium">Enterprise</span>
                </div>
              </div>
              
              <h3 className="font-playfair text-responsive-xl font-semibold mb-3 sm:mb-4 text-white">Join the Elite Waitlist</h3>
              <p className="text-white/70 mb-4 sm:mb-6 text-responsive-sm">Limited access. Strategic advantage.</p>
              
              <Form {...heroForm}>
                <form ref={heroFormRef} onSubmit={heroForm.handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4" id="hero-form">
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
                            className="w-full input-responsive prevent-zoom bg-black/30 border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-crimson focus:ring-2 focus:ring-crimson/20 text-responsive-sm"
                            aria-label="Professional email address for waitlist access"
                            aria-describedby="email-help"
                            autoComplete="email"
                          />
                        </FormControl>
                        <FormMessage className="text-crimson text-sm" />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    disabled={waitlistMutation.isPending}
                    className={`w-full text-white btn-responsive rounded-lg font-semibold cta-hover touch-target focus:ring-2 focus:ring-crimson focus:ring-offset-2 ${heroCTA.config?.style || 'bg-crimson hover:bg-ruby'} ${heroCTA.config?.urgency ? 'animate-glow-pulse' : ''}`}
                    aria-label="Submit email to join exclusive waitlist"
                    id="hero-submit-btn"
                  >
                    <span className="hidden xs:inline">{waitlistMutation.isPending ? "Processing..." : (heroCTA.config?.text || "Request Exclusive Access")}</span>
                    <span className="xs:hidden">{waitlistMutation.isPending ? "Processing..." : "Join Waitlist"}</span>
                  </Button>
                </form>
              </Form>
              
              {/* Enhanced Trust & Privacy Signals */}
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-center space-x-4 text-xs text-platinum/50">
                  <div className="flex items-center">
                    <Shield className="w-3 h-3 text-gold mr-1" />
                    <span>GDPR Compliant</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-3 h-3 text-green-400 mr-1" />
                    <span>No Spam</span>
                  </div>
                </div>
                <p className="text-xs text-platinum/40 flex items-center justify-center">
                  <span className="mr-2">{connectionStatus}</span>
                  Real-time updates active
                </p>
              </div>
            </motion.div>
            
            <motion.div 
              variants={fadeInUp}
              className="grid grid-responsive-3 gap-responsive text-center sm:text-left"
            >
              <div className="flex items-center justify-center sm:justify-start space-x-2">
                <Users className="w-3 h-3 xs:w-4 xs:h-4 text-gold flex-shrink-0" />
                <span className={`text-responsive-xs text-platinum/60 ${isConnected ? "animate-pulse" : ""}`}>
                  <span className="hidden xs:inline">{currentCount}+ Strategic Partners</span>
                  <span className="xs:hidden">{currentCount}+ Partners</span>
                </span>
              </div>
              <div className="flex items-center justify-center sm:justify-start space-x-2">
                <Star className="w-3 h-3 xs:w-4 xs:h-4 text-gold flex-shrink-0" />
                <span className="text-responsive-xs text-platinum/60">
                  <span className="hidden xs:inline">Invitation Only</span>
                  <span className="xs:hidden">Exclusive</span>
                </span>
              </div>
              <div className="flex items-center justify-center sm:justify-start space-x-2">
                <Timer className="w-3 h-3 xs:w-4 xs:h-4 text-gold flex-shrink-0" />
                <span className="text-responsive-xs text-platinum/60">
                  <span className="hidden xs:inline">30-Day Risk Free</span>
                  <span className="xs:hidden">Risk Free</span>
                </span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
      {/* Feature Explainer - Mobile Responsive */}
      <section className="py-12 sm:py-16 lg:py-20 bg-obsidian/50 relative z-10 overflow-hidden">
        {/* Section-specific animated background */}
        <motion.div
          style={{ transform: parallaxTransforms.y3, opacity: parallaxTransforms.opacity1 as any }}
          className="absolute -top-32 -left-32 w-96 h-96 bg-gradient-to-br from-gold/10 to-crimson/5 rounded-full blur-3xl gpu-accelerated"
        />
        <motion.div
          style={{ transform: `${parallaxTransforms.y4} ${parallaxTransforms.rotate2}` }}
          className="absolute -bottom-32 -right-32 w-80 h-80 bg-gradient-to-tl from-ruby/15 to-gold/10 rounded-full blur-2xl gpu-accelerated"
        />
        <div className="responsive-container">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-12 sm:mb-16"
          >
            <motion.h2 variants={fadeInUp} className="font-playfair text-responsive-2xl font-bold text-white mb-6">
              The AI Brain Behind{" "}
              <span className="text-crimson">SERP Domination</span>
            </motion.h2>
            <motion.div variants={fadeInUp} className="text-xl max-w-3xl mx-auto text-[#e5e7eb] space-y-6">
              <div className="font-playfair text-2xl font-bold mb-8">
                Stop Counting Keywords. Start Unlocking Strategy.
              </div>
              
              <div className="space-y-4 text-lg">
                <div>🔍 Others chase rankings. We uncover the why behind them.</div>
                <div>🧠 We decode intent. Not just search terms, the strategy behind what's winning.</div>
                <div>📖 Every page tells a story. We reveal the plot that drives visibility and trust.</div>
                <div>🚀 No guesswork. No fluff. Just data-driven insight that impacts revenue.</div>
              </div>
              
              <div className="font-playfair text-xl font-semibold mt-8 mb-4">
                See What Others Miss.
              </div>
              <div className="text-lg">
                Get a custom strategy backed by real search intelligence not assumptions.
              </div>
              
              <div className="text-crimson font-bold text-xl mt-6">
                👉 Request Your Free SEO Intelligence Audit
              </div>
            </motion.div>
          </motion.div>
          
          <div className="responsive-grid lg:grid-cols-2 items-center">
            {/* 3D SERP Visualization */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <Card className="border text-card-foreground shadow-sm glassmorphism p-8 rounded-2xl relative overflow-hidden feature-card bg-custom-red" style={{ backgroundColor: 'rgba(191, 0, 0, 0.4)' }}>
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
      <section className="py-20 bg-charcoal relative z-10 overflow-hidden">
        {/* Use case section animated elements */}
        <motion.div
          style={{ transform: `${parallaxTransforms.y1} ${parallaxTransforms.scale1}`, opacity: parallaxTransforms.opacity2 as any }}
          className="absolute top-1/4 left-10 w-64 h-64 bg-gradient-to-r from-crimson/10 to-transparent rounded-full blur-2xl gpu-accelerated"
        />
        <motion.div
          style={{ transform: `${parallaxTransforms.y2} ${parallaxTransforms.rotate1}` }}
          className="absolute bottom-1/3 right-10 w-72 h-72 bg-gradient-to-l from-gold/10 to-transparent rounded-full blur-3xl gpu-accelerated"
        />
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
              Here's how elite professionals leverage Imperius.
            </motion.p>
          </motion.div>
          
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-responsive-3 gap-responsive"
          >
            <motion.div variants={fadeInUp}>
              <Card className="glassmorphism card-responsive rounded-2xl feature-card h-full">
                <CardContent className="p-0">
                  <div className="w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 bg-crimson/20 rounded-lg flex items-center justify-center mb-4 sm:mb-6 mx-auto sm:mx-0">
                    <Building className="text-crimson text-lg xs:text-xl sm:text-2xl" />
                  </div>
                  <h3 className="font-playfair text-responsive-xl font-semibold mb-3 sm:mb-4 text-[#e7b008] text-center">
                    <span className="hidden xs:inline text-[24px]">Enterprise SEO Leads</span>
                    <span className="xs:hidden">SEO Leaders</span>
                  </h3>
                  <p className="mb-4 sm:mb-6 text-[#e5e7eb] text-responsive-sm leading-relaxed">
                    "Instead of guessing why competitors rank, I can reverse-engineer their exact content strategy—tone, depth, UX patterns—and build superior alternatives."
                  </p>
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-crimson font-medium">Strategic Advantage</span>
                    <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-gold" />
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
                  <h3 className="font-playfair text-2xl font-semibold mb-4 text-center text-[#e7b008]">Digital Agencies</h3>
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
                  <h3 className="font-playfair text-2xl font-semibold mb-4 text-center text-[#e7b008]">Content Strategists</h3>
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
            className="grid grid-responsive-3 gap-responsive max-w-6xl mx-auto"
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
                    "Our client retention increased 40% after implementing insights from Imperius. The strategic depth is unmatched."
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
      {/* Enhanced Social Proof Section */}
      <section className="py-20 bg-gradient-to-br from-obsidian/80 via-black/90 to-obsidian/80 relative z-10 overflow-hidden">
        <motion.div
          style={{ transform: parallaxTransforms.y3, opacity: parallaxTransforms.opacity1 as any }}
          className="absolute -top-32 -right-32 w-96 h-96 bg-gradient-to-br from-gold/8 to-crimson/5 rounded-full blur-3xl gpu-accelerated"
        />
        
        <div className="container mx-auto px-6">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeInUp} className="font-playfair text-4xl lg:text-5xl font-bold text-white mb-6">
              Trusted by Strategic{" "}
              <span className="text-crimson">SEO Leaders</span>
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-xl text-platinum/80 mb-12 max-w-3xl mx-auto">
              Join industry leaders who've transformed their SEO strategy with intelligence-driven insights
            </motion.p>
          </motion.div>

          {/* Testimonials Carousel */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="grid lg:grid-cols-3 gap-8 mb-16"
          >
            <Card className="glassmorphism p-8 rounded-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-crimson/10 rounded-full blur-2xl" />
              <CardContent className="p-0">
                <div className="flex items-center mb-4">
                  <div className="flex text-gold text-sm">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <span className="ml-2 text-xs text-platinum/60">Enterprise Client</span>
                </div>
                <blockquote className="text-lg text-white mb-6 font-light italic">
                  "Imperius revealed why our competitors were outranking us despite having fewer backlinks. 
                  The content tone and structure insights helped us redesign our approach and achieve 3x organic growth in 6 months."
                </blockquote>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-crimson to-ruby rounded-full flex items-center justify-center text-white font-semibold">
                    SC
                  </div>
                  <div className="ml-4">
                    <p className="text-white font-semibold">Sarah Chen</p>
                    <p className="text-platinum/60 text-sm">Head of SEO, TechScale Ventures</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glassmorphism p-8 rounded-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gold/10 rounded-full blur-2xl" />
              <CardContent className="p-0">
                <div className="flex items-center mb-4">
                  <div className="flex text-gold text-sm">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <span className="ml-2 text-xs text-platinum/60">Agency Owner</span>
                </div>
                <blockquote className="text-lg text-white mb-6 font-light italic">
                  "Traditional tools show what's ranking. Imperius shows why it's ranking. 
                  This depth of analysis has become our competitive differentiator and increased our client LTV by 40%."
                </blockquote>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-crimson to-ruby rounded-full flex items-center justify-center text-white font-semibold">
                    MR
                  </div>
                  <div className="ml-4">
                    <p className="text-white font-semibold">Marcus Rodriguez</p>
                    <p className="text-platinum/60 text-sm">Founder, Elite Digital Agency</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glassmorphism p-8 rounded-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-crimson/10 rounded-full blur-2xl" />
              <CardContent className="p-0">
                <div className="flex items-center mb-4">
                  <div className="flex text-gold text-sm">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <span className="ml-2 text-xs text-platinum/60">VP Content Strategy</span>
                </div>
                <blockquote className="text-lg text-white mb-6 font-light italic">
                  "The multi-dimensional analysis helped us identify content gaps our competitors missed. 
                  We captured market share in three key verticals within 90 days of implementation."
                </blockquote>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-crimson to-ruby rounded-full flex items-center justify-center text-white font-semibold">
                    PW
                  </div>
                  <div className="ml-4">
                    <p className="text-white font-semibold">Dr. Patricia Williams</p>
                    <p className="text-platinum/60 text-sm">VP Content Strategy, InnovateFlow</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            variants={fadeInUp}
            className="grid grid-responsive-4 gap-responsive items-center opacity-60"
          >
            <div className="text-center">
              <div className="text-responsive-xl font-bold text-crimson mb-1 sm:mb-2">250+</div>
              <div className="text-responsive-xs text-platinum/60">
                <span className="hidden xs:inline">Strategic Partners</span>
                <span className="xs:hidden">Partners</span>
              </div>
            </div>
            <div className="text-center">
              <div className="text-responsive-xl font-bold text-gold mb-1 sm:mb-2">40%</div>
              <div className="text-responsive-xs text-platinum/60">
                <span className="hidden xs:inline">Avg. Traffic Increase</span>
                <span className="xs:hidden">Traffic +</span>
              </div>
            </div>
            <div className="text-center">
              <div className="text-responsive-xl font-bold text-crimson mb-1 sm:mb-2">92%</div>
              <div className="text-responsive-xs text-platinum/60">
                <span className="hidden xs:inline">Client Retention Rate</span>
                <span className="xs:hidden">Retention</span>
              </div>
            </div>
            <div className="text-center">
              <div className="text-responsive-xl font-bold text-gold mb-1 sm:mb-2">$2.4M</div>
              <div className="text-responsive-xs text-platinum/60">
                <span className="hidden xs:inline">Revenue Impact</span>
                <span className="xs:hidden">Revenue</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      {/* ROI Calculator Section */}
      <section className="py-20 bg-gradient-to-br from-black via-obsidian/90 to-black relative z-10 overflow-hidden">
        <motion.div
          style={{ transform: `${parallaxTransforms.y4} ${parallaxTransforms.rotate2}` }}
          className="absolute -bottom-32 -left-32 w-96 h-96 bg-gradient-to-tl from-crimson/8 to-gold/5 rounded-full blur-3xl gpu-accelerated"
        />
        
        <div className="responsive-container">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-12 sm:mb-16"
          >
            <motion.h2 variants={fadeInUp} className="font-playfair text-responsive-2xl font-bold text-white mb-6">
              Calculate Your{" "}
              <span className="text-crimson">Strategic ROI</span>
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-responsive-lg text-platinum/80 mb-8 sm:mb-12 max-w-3xl mx-auto">
              See how Imperius transforms your SEO investment into measurable business growth
            </motion.p>
          </motion.div>

          <div className="responsive-grid lg:grid-cols-2 items-center">
            {/* ROI Calculator */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Card className="glassmorphism p-4 sm:p-6 lg:p-8 rounded-2xl">
                <CardContent className="p-0">
                  <h3 className="font-playfair text-responsive-xl font-semibold text-white mb-6">Investment Calculator</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-responsive-sm font-medium text-platinum/80 mb-2">
                        Current Monthly SEO Spend
                      </label>
                      <Input
                        type="range"
                        min="1000"
                        max="50000"
                        step="1000"
                        value={seoSpend}
                        className="w-full touch-target"
                        onChange={(e) => setSeoSpend(parseInt(e.target.value))}
                      />
                      <div className="text-center mt-2 text-crimson font-semibold text-responsive-base">${seoSpend.toLocaleString()}</div>
                    </div>
                    
                    <div>
                      <label className="block text-responsive-sm font-medium text-platinum/80 mb-2">
                        Current Monthly Organic Traffic
                      </label>
                      <Input
                        type="range"
                        min="1000"
                        max="100000"
                        step="1000"
                        value={monthlyTraffic}
                        className="w-full touch-target"
                        onChange={(e) => setMonthlyTraffic(parseInt(e.target.value))}
                      />
                      <div className="text-center mt-2 text-crimson font-semibold text-responsive-base">{monthlyTraffic.toLocaleString()} visitors</div>
                    </div>

                    {/* Results */}
                    <div className="bg-obsidian/50 rounded-lg p-4 sm:p-6 border border-crimson/20">
                      <h4 className="font-semibold text-white mb-4 text-responsive-base">Projected Results with Imperius</h4>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-center">
                        <div>
                          <div className="text-responsive-xl font-bold text-crimson">{roiResults.additionalTraffic.toLocaleString()}</div>
                          <div className="text-responsive-xs text-platinum/60">Additional Monthly Traffic</div>
                        </div>
                        <div>
                          <div className="text-responsive-xl font-bold text-gold">${roiResults.additionalRevenue.toLocaleString()}</div>
                          <div className="text-responsive-xs text-platinum/60">Additional Monthly Revenue</div>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-crimson/10">
                        <div className="text-center">
                          <div className="text-responsive-2xl font-bold text-green-400">{roiResults.monthlyROI}%</div>
                          <div className="text-responsive-sm text-platinum/60">Monthly ROI</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* ROI Benefits */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <Card className="glassmorphism p-4 sm:p-6 rounded-xl">
                <CardContent className="p-0">
                  <div className="flex items-start space-x-3 sm:space-x-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-crimson/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <BarChart3 className="text-crimson text-lg sm:text-xl" />
                    </div>
                    <div>
                      <h4 className="font-playfair text-responsive-lg font-semibold text-white mb-2">40% Traffic Increase</h4>
                      <p className="text-responsive-sm text-platinum/80">Average organic traffic improvement within 90 days of strategic implementation</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glassmorphism p-4 sm:p-6 rounded-xl">
                <CardContent className="p-0">
                  <div className="flex items-start space-x-3 sm:space-x-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-crimson/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Target className="text-crimson text-lg sm:text-xl" />
                    </div>
                    <div>
                      <h4 className="font-playfair text-responsive-lg font-semibold text-white mb-2">60% Time Savings</h4>
                      <p className="text-responsive-sm text-platinum/80">Reduce content optimization time with intelligence-driven insights</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glassmorphism p-4 sm:p-6 rounded-xl">
                <CardContent className="p-0">
                  <div className="flex items-start space-x-3 sm:space-x-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-crimson/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Crown className="text-crimson text-lg sm:text-xl" />
                    </div>
                    <div>
                      <h4 className="font-playfair text-responsive-lg font-semibold text-white mb-2">Competitive Advantage</h4>
                      <p className="text-responsive-sm text-platinum/80">Access insights competitors can't replicate with traditional SEO tools</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>
      {/* Case Studies Section - Mobile Responsive */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-obsidian via-black/95 to-obsidian relative z-10 overflow-hidden">
        <motion.div
          style={{ transform: `${parallaxTransforms.y1} ${parallaxTransforms.scale1}` }}
          className="absolute -top-32 right-32 w-96 h-96 bg-gradient-to-br from-crimson/8 to-gold/5 rounded-full blur-3xl gpu-accelerated"
        />
        
        <div className="responsive-container">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-12 sm:mb-16"
          >
            <motion.h2 variants={fadeInUp} className="font-playfair text-responsive-2xl font-bold text-white mb-6">
              Proven{" "}
              <span className="text-crimson">Success Stories</span>
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-responsive-lg text-platinum/80 mb-8 sm:mb-12 max-w-3xl mx-auto">
              Real clients, real results, real competitive advantage through strategic SEO intelligence
            </motion.p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 mb-8 sm:mb-12">
            {/* Case Study 1 - Enhanced Visual Design */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="group"
            >
              <Card className="glassmorphism rounded-2xl h-full overflow-hidden relative border border-white/10 hover:border-crimson/30 transition-all duration-500 group-hover:transform group-hover:scale-[1.02]">
                {/* Premium gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-crimson/5 via-transparent to-gold/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                
                <CardContent className="p-6 lg:p-8 relative z-10 bg-[#bf000066]">
                  {/* Enhanced Company Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center">
                      <div className="relative">
                        <div className="w-16 h-16 bg-gradient-to-br from-crimson via-ruby to-red-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                          TS
                        </div>
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-2 border-obsidian flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      </div>
                      <div className="ml-4">
                        <h3 className="font-playfair text-xl lg:text-2xl font-bold text-white mb-1">TechScale Ventures</h3>
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-crimson rounded-full mr-2"></div>
                          <p className="text-platinum/70 text-sm font-medium">Enterprise SaaS Company</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-platinum/50 mb-1">Success Rate</div>
                      <div className="text-2xl font-bold text-gold">98%</div>
                    </div>
                  </div>
                  
                  {/* Enhanced Challenge-Solution-Results Flow */}
                  <div className="space-y-6">
                    {/* Challenge Section */}
                    <div className="relative">
                      <div className="flex items-center mb-3">
                        <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center mr-3">
                          <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                        </div>
                        <h4 className="text-lg font-bold text-white">Challenge</h4>
                      </div>
                      <div className="ml-11">
                        <p className="text-platinum/80 leading-relaxed">
                          Despite extensive backlink building and keyword optimization, competitors with fewer domain authority 
                          and backlinks were consistently outranking them for high-value commercial terms.
                        </p>
                      </div>
                    </div>
                    
                    {/* Solution Section */}
                    <div className="relative">
                      <div className="flex items-center mb-3">
                        <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center mr-3">
                          <div className="w-4 h-4 bg-blue-400 rounded-full"></div>
                        </div>
                        <h4 className="text-lg font-bold text-white">Solution</h4>
                      </div>
                      <div className="ml-11">
                        <p className="text-platinum/80 leading-relaxed">
                          Imperius revealed that top-ranking competitors used more <span className="text-crimson font-medium">authoritative tone</span>, 
                          deeper technical content structure, and better user experience patterns.
                        </p>
                      </div>
                    </div>
                    
                    {/* Enhanced Results Section */}
                    <div className="relative">
                      <div className="flex items-center mb-4">
                        <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center mr-3">
                          <div className="w-4 h-4 bg-green-400 rounded-full"></div>
                        </div>
                        <h4 className="text-lg font-bold text-white">Results</h4>
                      </div>
                      <div className="ml-11">
                        <div className="grid grid-cols-3 gap-4">
                          <div className="bg-gradient-to-br from-crimson/10 to-crimson/5 rounded-xl p-4 text-center border border-crimson/20 hover:border-crimson/40 transition-colors duration-300">
                            <div className="text-3xl font-bold text-crimson mb-1">3x</div>
                            <div className="text-xs text-platinum/60 font-medium">Organic Growth</div>
                          </div>
                          <div className="bg-gradient-to-br from-gold/10 to-gold/5 rounded-xl p-4 text-center border border-gold/20 hover:border-gold/40 transition-colors duration-300">
                            <div className="text-3xl font-bold text-gold mb-1">180%</div>
                            <div className="text-xs text-platinum/60 font-medium">Traffic Increase</div>
                          </div>
                          <div className="bg-gradient-to-br from-green-400/10 to-green-400/5 rounded-xl p-4 text-center border border-green-400/20 hover:border-green-400/40 transition-colors duration-300">
                            <div className="text-3xl font-bold text-green-400 mb-1">6mo</div>
                            <div className="text-xs text-platinum/60 font-medium">Time to Results</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Enhanced Footer with Premium Styling */}
                  <div className="mt-8 pt-6 border-t border-gradient-to-r from-crimson/20 via-white/10 to-gold/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-crimson rounded-full mr-2"></div>
                        <span className="text-platinum/70 text-sm font-medium">Enterprise SaaS</span>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-platinum/50 mb-1">Revenue Impact</div>
                        <div className="text-xl font-bold text-gold">$2.4M</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Case Study 2 - Enhanced Visual Design */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="group"
            >
              <Card className="glassmorphism rounded-2xl h-full overflow-hidden relative border border-white/10 hover:border-gold/30 transition-all duration-500 group-hover:transform group-hover:scale-[1.02]">
                {/* Premium gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                
                <CardContent className="p-6 lg:p-8 relative z-10">
                  {/* Enhanced Company Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center">
                      <div className="relative">
                        <div className="w-16 h-16 bg-gradient-to-br from-gold via-yellow-500 to-orange-400 rounded-xl flex items-center justify-center text-black font-bold text-2xl shadow-lg">
                          ED
                        </div>
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-400 rounded-full border-2 border-obsidian flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      </div>
                      <div className="ml-4">
                        <h3 className="font-playfair text-xl lg:text-2xl font-bold text-white mb-1">Elite Digital Agency</h3>
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-gold rounded-full mr-2"></div>
                          <p className="text-platinum/70 text-sm font-medium">Premium SEO Agency</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-platinum/50 mb-1">Success Rate</div>
                      <div className="text-2xl font-bold text-crimson">95%</div>
                    </div>
                  </div>
                  
                  {/* Enhanced Challenge-Solution-Results Flow */}
                  <div className="space-y-6">
                    {/* Challenge Section */}
                    <div className="relative">
                      <div className="flex items-center mb-3">
                        <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center mr-3">
                          <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                        </div>
                        <h4 className="text-lg font-bold text-white">Challenge</h4>
                      </div>
                      <div className="ml-11">
                        <p className="text-platinum/80 leading-relaxed">
                          Agency needed to differentiate from competitors and provide deeper insights to retain 
                          high-value enterprise clients demanding sophisticated SEO strategy.
                        </p>
                      </div>
                    </div>
                    
                    {/* Solution Section */}
                    <div className="relative">
                      <div className="flex items-center mb-3">
                        <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center mr-3">
                          <div className="w-4 h-4 bg-blue-400 rounded-full"></div>
                        </div>
                        <h4 className="text-lg font-bold text-white">Solution</h4>
                      </div>
                      <div className="ml-11">
                        <p className="text-platinum/80 leading-relaxed">
                          Implemented Imperius as core service offering, providing <span className="text-gold font-medium">multi-dimensional content analysis</span> 
                          that traditional tools couldn't match.
                        </p>
                      </div>
                    </div>
                    
                    {/* Enhanced Results Section */}
                    <div className="relative">
                      <div className="flex items-center mb-4">
                        <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center mr-3">
                          <div className="w-4 h-4 bg-green-400 rounded-full"></div>
                        </div>
                        <h4 className="text-lg font-bold text-white">Results</h4>
                      </div>
                      <div className="ml-11">
                        <div className="grid grid-cols-3 gap-4">
                          <div className="bg-gradient-to-br from-crimson/10 to-crimson/5 rounded-xl p-4 text-center border border-crimson/20 hover:border-crimson/40 transition-colors duration-300">
                            <div className="text-3xl font-bold text-crimson mb-1">40%</div>
                            <div className="text-xs text-platinum/60 font-medium">Higher Client LTV</div>
                          </div>
                          <div className="bg-gradient-to-br from-gold/10 to-gold/5 rounded-xl p-4 text-center border border-gold/20 hover:border-gold/40 transition-colors duration-300">
                            <div className="text-3xl font-bold text-gold mb-1">25%</div>
                            <div className="text-xs text-platinum/60 font-medium">Premium Pricing</div>
                          </div>
                          <div className="bg-gradient-to-br from-green-400/10 to-green-400/5 rounded-xl p-4 text-center border border-green-400/20 hover:border-green-400/40 transition-colors duration-300">
                            <div className="text-3xl font-bold text-green-400 mb-1">95%</div>
                            <div className="text-xs text-platinum/60 font-medium">Client Retention</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Enhanced Footer with Premium Styling */}
                  <div className="mt-8 pt-6 border-t border-gradient-to-r from-gold/20 via-white/10 to-crimson/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-gold rounded-full mr-2"></div>
                        <span className="text-platinum/70 text-sm font-medium">Digital Marketing</span>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-platinum/50 mb-1">Annual Growth</div>
                        <div className="text-xl font-bold text-crimson">$800K</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Success Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-gradient-to-r from-crimson/10 to-gold/10 rounded-2xl p-8"
          >
            <div className="text-center mb-8">
              <h3 className="font-playfair text-2xl font-semibold text-white mb-2">Aggregate Success Metrics</h3>
              <p className="text-platinum/80">Combined results across all strategic partners</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-crimson mb-2">$12.8M</div>
                <div className="text-sm text-platinum/60">Total Revenue Impact</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-gold mb-2">284%</div>
                <div className="text-sm text-platinum/60">Avg Traffic Growth</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-green-400 mb-2">92%</div>
                <div className="text-sm text-platinum/60">Success Rate</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-blue-400 mb-2">120</div>
                <div className="text-sm text-platinum/60">Days Avg to Results</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      {/* Business Development Capabilities Section */}
      <section className="py-20 bg-gradient-to-br from-black via-obsidian/95 to-black relative z-10 overflow-hidden">
        <div className="container mx-auto px-6">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeInUp} className="font-playfair text-4xl lg:text-5xl font-bold text-white mb-6">
              Advanced{" "}
              <span className="text-crimson">Development Architecture</span>
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-xl text-platinum/80 mb-12 max-w-3xl mx-auto">
              Full-stack development expertise with strategic business focus and enterprise-grade implementation
            </motion.p>
          </motion.div>

          {/* Simplified Business Capabilities */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="bg-gradient-to-r from-crimson/10 to-gold/10 rounded-2xl p-8 text-center"
          >
            <h3 className="font-playfair text-2xl font-semibold text-white mb-4">
              Strategic Development Expertise
            </h3>
            <p className="text-platinum/80 max-w-3xl mx-auto">
              Combining technical excellence with business intelligence to deliver solutions that drive measurable growth. 
              Specialized in full-stack development, strategic analysis, and enterprise-grade implementations that create 
              competitive advantages for forward-thinking organizations.
            </p>
          </motion.div>
        </div>
      </section>
      {/* Final CTA - Mobile Responsive */}
      <section className="py-12 sm:py-16 lg:py-20 bg-charcoal relative overflow-hidden">
        {/* Animated background elements */}
        <motion.div
          style={{ transform: parallaxTransforms.y1 as any }}
          className="absolute top-0 left-1/4 w-96 h-96 bg-crimson rounded-full blur-3xl opacity-5 gpu-accelerated"
        />
        <motion.div
          style={{ transform: parallaxTransforms.y2 as any }}
          className="absolute bottom-0 right-1/4 w-72 h-72 bg-ruby rounded-full blur-3xl opacity-5 gpu-accelerated"
        />
        
        <div className="responsive-container text-center relative z-10">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="max-w-4xl mx-auto"
          >
            <motion.h2 variants={fadeInUp} className="font-playfair text-responsive-3xl font-bold text-white mb-6">
              Stop Guessing.{" "}
              <span className="text-crimson text-shadow-glow">Start Dominating.</span>
            </motion.h2>
            
            <motion.p variants={fadeInUp} className="text-responsive-lg text-platinum/80 mb-8 max-w-3xl mx-auto">
              Join an exclusive cohort of strategic SEO professionals who've moved beyond keyword tracking
              to true competitive intelligence.
            </motion.p>
            
            <motion.div variants={fadeInUp} className="glassmorphism p-4 sm:p-6 lg:p-8 rounded-2xl max-w-lg mx-auto mb-8">
              <div className="mb-6">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 mb-4">
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />
                    <span className="text-responsive-sm">30-Day Risk-Free Trial</span>
                  </div>
                  <div className="flex items-center">
                    <UserPlus className="w-4 h-4 text-gold mr-2 flex-shrink-0" />
                    <span className="text-responsive-sm">Limited Cohort</span>
                  </div>
                </div>
                <p className="text-platinum/60 text-responsive-sm">
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
                            className="w-full px-3 py-3 sm:px-4 sm:py-3 bg-obsidian/50 border border-crimson/30 rounded-lg text-white placeholder-platinum/50 focus:border-crimson focus:ring-2 focus:ring-crimson/20 touch-target text-responsive-sm"
                          />
                        </FormControl>
                        <FormMessage className="text-crimson" />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    disabled={waitlistMutation.isPending}
                    className="w-full bg-crimson hover:bg-ruby text-white btn-responsive rounded-lg font-bold cta-hover animate-glow-pulse touch-target"
                  >
                    <span className="hidden sm:inline">{waitlistMutation.isPending ? "Processing..." : "Secure Your Strategic Advantage"}</span>
                    <span className="sm:hidden">{waitlistMutation.isPending ? "Processing..." : "Secure Advantage"}</span>
                  </Button>
                </form>
              </Form>
              
              <div className="flex items-center justify-center mt-4 text-responsive-xs text-platinum/50">
                <Lock className="w-3 h-3 mr-1 flex-shrink-0" />
                <span>Your data is protected and never shared</span>
              </div>
            </motion.div>
            
            <motion.div 
              variants={fadeInUp}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 text-center sm:text-left"
            >
              <div className="flex items-center justify-center sm:justify-start">
                <Timer className="w-4 h-4 text-gold mr-2 flex-shrink-0" />
                <span className="text-responsive-sm text-platinum/60">Applications close in 72 hours</span>
              </div>
              <div className="flex items-center justify-center sm:justify-start">
                <UserPlus className="w-4 h-4 text-gold mr-2 flex-shrink-0" />
                <span className={`text-responsive-sm text-platinum/60 ${isConnected ? "animate-pulse" : ""}`}>
                  {Math.max(0, 100 - currentCount)} spots remaining
                </span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
      {/* Footer - Mobile Responsive */}
      <footer className="bg-obsidian py-8 sm:py-12 border-t border-crimson/20">
        <div className="responsive-container">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="font-playfair text-responsive-xl font-bold text-crimson">
              Imperius
            </div>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-platinum/60 text-responsive-sm">
              <a href="#" className="hover:text-crimson transition-colors touch-target">Privacy Policy</a>
              <a href="#" className="hover:text-crimson transition-colors touch-target">Terms of Service</a>
              <a href="#" className="hover:text-crimson transition-colors touch-target">Contact</a>
            </div>
          </div>
          <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-crimson/10 text-center text-platinum/40 text-responsive-sm">
            <p>&copy; 2024 Imperius. Built for strategic advantage.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
