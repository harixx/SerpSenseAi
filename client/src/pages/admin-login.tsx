import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { loginAdminSchema } from "@shared/schema";
import { z } from "zod";
import { Redirect } from "wouter";
import { Shield, Lock, Eye, EyeOff } from "lucide-react";
import { queryClient } from "@/lib/queryClient";

type LoginForm = z.infer<typeof loginAdminSchema>;

export default function AdminLogin() {
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);

  // Check if already logged in
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

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginAdminSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginForm) => {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/admin/user"], data.user);
      toast({
        title: "Welcome back!",
        description: "Successfully logged in to admin dashboard.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
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

  // Redirect if already logged in
  if (user) {
    return <Redirect to="/admin/dashboard" />;
  }

  const onSubmit = (values: LoginForm) => {
    loginMutation.mutate(values);
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600/10 rounded-full mb-4">
            <Shield className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-white">Admin Access</h1>
          <p className="text-gray-400 mt-2">
            Secure authentication required for Imperius analytics dashboard
          </p>
        </div>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="text-center">
            <CardTitle className="text-white">Administrator Login</CardTitle>
            <CardDescription className="text-gray-400">
              Enter your admin credentials to access the analytics dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Username</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter username"
                          className="bg-black border-gray-700 text-white placeholder-gray-500 focus:border-red-600"
                          disabled={loginMutation.isPending}
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter password"
                            className="bg-black border-gray-700 text-white placeholder-gray-500 focus:border-red-600 pr-10"
                            disabled={loginMutation.isPending}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full bg-red-600 hover:bg-red-700 text-white"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Authenticating...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      Access Dashboard
                    </>
                  )}
                </Button>
              </form>
            </Form>

            {/* Security notice */}
            <div className="mt-6 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <p className="text-xs text-yellow-400">
                <Lock className="w-3 h-3 inline mr-1" />
                This is a secure administrative interface. All access is logged and monitored.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Development info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg text-center">
            <p className="text-xs text-blue-400 mb-2">Development Environment</p>
            <p className="text-xs text-gray-400">
              Default credentials: <code className="text-blue-300">admin / admin123</code>
            </p>
            <p className="text-xs text-yellow-400 mt-1">
              Change password after first login!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}