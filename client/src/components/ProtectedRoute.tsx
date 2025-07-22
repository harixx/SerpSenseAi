import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Lock, UserCheck } from "lucide-react";
import { motion } from "framer-motion";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-obsidian via-charcoal to-obsidian flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-gold/20 border-t-gold rounded-full mx-auto mb-4"
          />
          <p className="text-platinum/70 text-lg">Verifying access credentials...</p>
        </motion.div>
      </div>
    );
  }

  // Show access denied if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-obsidian via-charcoal to-obsidian flex items-center justify-center p-8">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(6)].map((_, i) => (
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
          className="relative z-10 max-w-md w-full"
        >
          <Card className="bg-gradient-to-br from-charcoal/90 to-obsidian/90 border border-crimson/30 backdrop-blur-xl">
            <CardHeader className="text-center pb-6">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-crimson/20 to-gold/20 flex items-center justify-center"
              >
                <Shield className="w-10 h-10 text-crimson" />
              </motion.div>
              <CardTitle className="text-2xl font-bold text-crimson mb-2">Access Restricted</CardTitle>
              <CardDescription className="text-platinum/70 text-lg">
                This area requires administrative access to view sensitive analytics data.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3 text-platinum/60">
                  <Lock className="w-5 h-5 text-gold" />
                  <span>Enterprise-grade security protection</span>
                </div>
                <div className="flex items-center space-x-3 text-platinum/60">
                  <UserCheck className="w-5 h-5 text-gold" />
                  <span>Authentication required for data access</span>
                </div>
              </div>
              
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  onClick={() => window.location.href = "/api/login"}
                  className="w-full bg-gradient-to-r from-crimson to-gold hover:from-crimson/80 hover:to-gold/80 text-white font-semibold py-3 text-lg"
                >
                  Authenticate Access
                </Button>
              </motion.div>
              
              <p className="text-xs text-platinum/50 text-center">
                Secure login powered by enterprise identity management
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // User is authenticated, show the protected content
  return <>{children}</>;
}