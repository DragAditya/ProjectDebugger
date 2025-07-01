import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Loader2 } from "lucide-react";
import { useLocation } from "wouter";

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { loginMutation, registerMutation } = useAuth();
  const [, setLocation] = useLocation();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!isLogin && !formData.username) {
      newErrors.username = "Username is required";
    } else if (!isLogin && formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    if (isLogin) {
      loginMutation.mutate({
        email: formData.email,
        password: formData.password,
      });
    } else {
      registerMutation.mutate({
        email: formData.email,
        password: formData.password,
        username: formData.username,
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const isLoading = loginMutation.isPending || registerMutation.isPending;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-background/90" />
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md relative z-10"
      >
        {/* Header */}
        <motion.div className="text-center mb-8" variants={cardVariants}>
          <h1 className="text-3xl font-bold gradient-text mb-2">ALTER</h1>
          <p className="text-muted-foreground">
            {isLogin ? "Welcome back to your AI debugging assistant" : "Join the future of code debugging"}
          </p>
        </motion.div>

        {/* Auth Card */}
        <motion.div variants={cardVariants}>
          <Card className="modern-card border-border/50">
            <CardHeader className="space-y-4">
              <div className="flex justify-center">
                <div className="flex bg-muted/50 rounded-lg p-1">
                  <Button
                    variant={isLogin ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setIsLogin(true)}
                    className={`transition-all duration-200 ${
                      isLogin ? "bg-primary text-primary-foreground shadow-sm" : ""
                    }`}
                  >
                    Sign In
                  </Button>
                  <Button
                    variant={!isLogin ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setIsLogin(false)}
                    className={`transition-all duration-200 ${
                      !isLogin ? "bg-primary text-primary-foreground shadow-sm" : ""
                    }`}
                  >
                    Sign Up
                  </Button>
                </div>
              </div>
              
              <div className="text-center">
                <CardTitle className="text-xl">
                  {isLogin ? "Sign in to your account" : "Create your account"}
                </CardTitle>
                <CardDescription className="mt-2">
                  {isLogin 
                    ? "Enter your credentials to access your dashboard" 
                    : "Get started with AI-powered code debugging"
                  }
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <AnimatePresence mode="wait">
                  {!isLogin && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="space-y-2">
                        <label htmlFor="username" className="text-sm font-medium text-muted-foreground">
                          Username
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="username"
                            type="text"
                            placeholder="Enter your username"
                            value={formData.username}
                            onChange={(e) => handleInputChange("username", e.target.value)}
                            className={`pl-10 modern-input ${errors.username ? "error-state" : ""}`}
                            disabled={isLoading}
                          />
                        </div>
                        {errors.username && (
                          <p className="error-text">{errors.username}</p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-muted-foreground">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className={`pl-10 modern-input ${errors.email ? "error-state" : ""}`}
                      disabled={isLoading}
                    />
                  </div>
                  {errors.email && (
                    <p className="error-text">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-muted-foreground">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      className={`pl-10 pr-10 modern-input ${errors.password ? "error-state" : ""}`}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="error-text">{errors.password}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full btn-primary group"
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      {isLogin ? "Sign In" : "Create Account"}
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 pt-6 border-t border-border/50">
                <div className="text-center space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}
                    <button
                      onClick={() => setIsLogin(!isLogin)}
                      className="ml-1 text-primary hover:text-primary/80 font-medium transition-colors"
                      disabled={isLoading}
                    >
                      {isLogin ? "Sign up" : "Sign in"}
                    </button>
                  </p>
                  
                  <Button
                    variant="outline"
                    onClick={() => setLocation("/")}
                    className="w-full glass border-border/50 hover:border-primary/30"
                    disabled={isLoading}
                  >
                    Back to Home
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Footer */}
        <motion.div 
          className="text-center mt-8 text-sm text-muted-foreground"
          variants={cardVariants}
        >
          <p>Secure authentication powered by Supabase</p>
        </motion.div>
      </motion.div>
    </div>
  );
}