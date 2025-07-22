import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Lock, UserCheck, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminLogin() {
  useEffect(() => {
    // Auto-redirect to login if not already authenticated
    const timer = setTimeout(() => {
      window.location.href = "/api/login";
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-obsidian via-charcoal to-obsidian flex items-center justify-center p-8">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-96 h-96 rounded-full opacity-5 blur-3xl"
            style={{
              background: `radial-gradient(circle, ${i % 2 === 0 ? '#DAA520' : '#DC143C'} 0%, transparent 70%)`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              x: [0, 50, -50, 0],
              y: [0, -30, 30, 0],
              scale: [1, 1.2, 0.8, 1],
            }}
            transition={{
              duration: 15 + i * 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 max-w-lg w-full"
      >
        <Card className="bg-gradient-to-br from-charcoal/90 to-obsidian/90 border border-gold/30 backdrop-blur-xl">
          <CardHeader className="text-center pb-6">
            <motion.div
              animate={{ 
                rotate: [0, 360],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                rotate: { duration: 8, repeat: Infinity, ease: "linear" },
                scale: { duration: 2, repeat: Infinity }
              }}
              className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-gold/20 to-crimson/20 flex items-center justify-center"
            >
              <BarChart3 className="w-12 h-12 text-gold" />
            </motion.div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-gold to-crimson bg-clip-text text-transparent mb-2">
              Imperius Analytics Access
            </CardTitle>
            <CardDescription className="text-platinum/70 text-lg">
              Secure administrative portal for enterprise analytics and intelligence systems
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-platinum/60">
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Shield className="w-5 h-5 text-gold" />
                </motion.div>
                <span>Enterprise-grade security protection</span>
              </div>
              <div className="flex items-center space-x-3 text-platinum/60">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <Lock className="w-5 h-5 text-crimson" />
                </motion.div>
                <span>Advanced analytics dashboard access</span>
              </div>
              <div className="flex items-center space-x-3 text-platinum/60">
                <motion.div
                  animate={{ rotate: [0, 180, 360] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                >
                  <UserCheck className="w-5 h-5 text-gold" />
                </motion.div>
                <span>Real-time intelligence monitoring</span>
              </div>
            </div>
            
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button 
                onClick={() => window.location.href = "/api/login"}
                className="w-full bg-gradient-to-r from-gold via-crimson to-gold hover:from-gold/80 hover:to-gold/80 text-obsidian font-bold py-4 text-lg"
              >
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="flex items-center justify-center"
                >
                  Authenticate & Enter
                  <Shield className="w-5 h-5 ml-2" />
                </motion.div>
              </Button>
            </motion.div>
            
            <div className="text-center">
              <motion.p 
                className="text-xs text-platinum/50"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                Redirecting to secure authentication portal...
              </motion.p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}