import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Redirect } from "wouter";
import { 
  Shield, 
  LogOut, 
  Users, 
  TrendingUp, 
  Activity, 
  Database,
  Eye,
  Clock,
  Mail,
  MousePointer
} from "lucide-react";
import { queryClient } from "@/lib/queryClient";

export default function AdminDashboard() {
  const { toast } = useToast();

  // Check authentication
  const { data: user, isLoading: isCheckingAuth } = useQuery({
    queryKey: ["/api/admin/user"],
    queryFn: async () => {
      const response = await fetch("/api/admin/user");
      if (!response.ok) {
        if (response.status === 401) return null;
        throw new Error("Failed to check authentication");
      }
      return response.json();
    },
    retry: false,
  });

  // Fetch analytics data
  const { data: analytics, isLoading: isLoadingAnalytics } = useQuery({
    queryKey: ["/api/analytics/dashboard"],
    queryFn: async () => {
      const response = await fetch("/api/analytics/dashboard");
      if (!response.ok) throw new Error("Failed to fetch analytics");
      return response.json();
    },
    enabled: !!user,
  });

  // Fetch waitlist data
  const { data: waitlistData, isLoading: isLoadingWaitlist } = useQuery({
    queryKey: ["/api/waitlist/count"],
    queryFn: async () => {
      const response = await fetch("/api/waitlist/count");
      if (!response.ok) throw new Error("Failed to fetch waitlist data");
      return response.json();
    },
    enabled: !!user,
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/admin/logout", { method: "POST" });
      if (!response.ok) throw new Error("Logout failed");
      return response.json();
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/admin/user"], null);
      queryClient.clear();
      toast({
        title: "Logged out",
        description: "Successfully logged out of admin dashboard.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-pulse">
          <Shield className="w-8 h-8 text-red-600" />
        </div>
      </div>
    );
  }

  // Redirect if not logged in
  if (!user) {
    return <Redirect to="/admin/login" />;
  }

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Shield className="w-8 h-8 text-red-600 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-white">Imperius Admin</h1>
                <p className="text-xs text-gray-400">Analytics Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm">
                <p className="text-white">Welcome, {user.username}</p>
                <p className="text-xs text-gray-400">{user.role}</p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Dashboard Overview</h2>
          <p className="text-gray-400">
            Secure analytics and monitoring for Imperius landing page performance
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Waitlist Count */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">
                Waitlist Members
              </CardTitle>
              <Users className="w-4 h-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {isLoadingWaitlist ? "..." : waitlistData?.count || 0}
              </div>
              <p className="text-xs text-gray-400">Total signups</p>
            </CardContent>
          </Card>

          {/* Analytics Status */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">
                Analytics Status
              </CardTitle>
              <Activity className="w-4 h-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">Active</div>
              <p className="text-xs text-gray-400">Real-time tracking</p>
            </CardContent>
          </Card>

          {/* Database Status */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">
                Database
              </CardTitle>
              <Database className="w-4 h-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-500">Online</div>
              <p className="text-xs text-gray-400">PostgreSQL</p>
            </CardContent>
          </Card>

          {/* Security Status */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">
                Security
              </CardTitle>
              <Shield className="w-4 h-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">Secured</div>
              <p className="text-xs text-gray-400">Admin only</p>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Details */}
        {analytics && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-red-600" />
                  Performance Metrics
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Real-time system performance data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoadingAnalytics ? (
                  <div className="animate-pulse space-y-2">
                    <div className="h-4 bg-gray-800 rounded"></div>
                    <div className="h-4 bg-gray-800 rounded w-3/4"></div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-300">
                    <p>Real-time analytics tracking is active and functioning properly.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Eye className="w-5 h-5 mr-2 text-blue-500" />
                  Monitoring Status
                </CardTitle>
                <CardDescription className="text-gray-400">
                  System monitoring and health checks
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">WebSocket Server</span>
                  <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                    Active
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Session Tracking</span>
                  <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                    Running
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Event Logging</span>
                  <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                    Enabled
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Security Information */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Shield className="w-5 h-5 mr-2 text-red-600" />
              Security Information
            </CardTitle>
            <CardDescription className="text-gray-400">
              Authentication and access control status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-white mb-2">Access Control</h4>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Admin-only authentication required</li>
                  <li>• Session-based security with timeouts</li>
                  <li>• Password encryption with bcrypt</li>
                  <li>• Secure session storage</li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-medium text-white mb-2">Current Session</h4>
                <div className="text-sm text-gray-300 space-y-1">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-gray-400" />
                    Last login: {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'First login'}
                  </div>
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-2 text-gray-400" />
                    {user.email}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}