import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Icons } from "@/components/ui/icons";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { useLocation } from "wouter";

type AuthMode = "signin" | "signup" | "reset";

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [, setLocation] = useLocation();

  const { 
    loginMutation, 
    registerMutation, 
    resetPasswordMutation,
    resendConfirmationMutation 
  } = useAuth();

  const isLoading = loginMutation.isPending || registerMutation.isPending || resetPasswordMutation.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === "signin") {
      loginMutation.mutate({ email, password });
    } else if (mode === "signup") {
      registerMutation.mutate({ email, password, username });
    } else if (mode === "reset") {
      resetPasswordMutation.mutate({ email });
    }
  };

  const handleResendConfirmation = () => {
    if (email) {
      resendConfirmationMutation.mutate({ email });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4 safe-top safe-bottom">
      {/* Background decoration */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--primary)_0%,_transparent_50%)] opacity-5" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--primary)_0%,_transparent_50%)] opacity-5" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            className="mb-4"
          >
            <h1 className="text-display gradient-text font-bold">ALTER</h1>
            <p className="text-muted-foreground mt-2">
              AI-powered code analysis platform
            </p>
          </motion.div>

          {/* Back button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/")}
            className="mb-6 touch-target"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>

        {/* Auth Card */}
        <Card className="card-mobile shadow-xl border-border/50">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-heading">
              {mode === "signin" && "Welcome back"}
              {mode === "signup" && "Create account"}
              {mode === "reset" && "Reset password"}
            </CardTitle>
            <CardDescription>
              {mode === "signin" && "Sign in to your account to continue"}
              {mode === "signup" && "Get started with your new account"}
              {mode === "reset" && "We'll send you a link to reset your password"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <AnimatePresence mode="wait">
              <motion.form
                key={mode}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input-mobile pl-10"
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>

                {/* Username Field (only for signup) */}
                {mode === "signup" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="username" className="text-sm font-medium">
                      Username
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="username"
                        type="text"
                        placeholder="Choose a username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="input-mobile pl-10"
                        required
                        autoComplete="username"
                      />
                    </div>
                  </motion.div>
                )}

                {/* Password Field (not for reset) */}
                {mode !== "reset" && (
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder={mode === "signup" ? "Create a password (8+ characters)" : "Enter your password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="input-mobile pl-10 pr-10"
                        required
                        autoComplete={mode === "signup" ? "new-password" : "current-password"}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 touch-target"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="btn btn-primary btn-lg w-full"
                  disabled={isLoading}
                >
                  {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                  {mode === "signin" && "Sign in"}
                  {mode === "signup" && "Create account"}
                  {mode === "reset" && "Send reset link"}
                </Button>
              </motion.form>
            </AnimatePresence>

            {/* Mode Switcher */}
            <div className="space-y-4 pt-4 border-t border-border/50">
              {mode === "signin" && (
                <div className="space-y-3 text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setMode("reset")}
                    className="text-sm text-muted-foreground hover:text-foreground touch-target"
                  >
                    Forgot your password?
                  </Button>
                  <div className="text-sm text-muted-foreground">
                    Don't have an account?{" "}
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => setMode("signup")}
                      className="p-0 h-auto font-medium text-primary hover:text-primary/80"
                    >
                      Sign up
                    </Button>
                  </div>
                </div>
              )}

              {mode === "signup" && (
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => setMode("signin")}
                      className="p-0 h-auto font-medium text-primary hover:text-primary/80"
                    >
                      Sign in
                    </Button>
                  </div>
                </div>
              )}

              {mode === "reset" && (
                <div className="space-y-3 text-center">
                  <div className="text-sm text-muted-foreground">
                    Remember your password?{" "}
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => setMode("signin")}
                      className="p-0 h-auto font-medium text-primary hover:text-primary/80"
                    >
                      Sign in
                    </Button>
                  </div>
                  
                  {email && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleResendConfirmation}
                      disabled={resendConfirmationMutation.isPending}
                      className="w-full touch-target"
                    >
                      {resendConfirmationMutation.isPending && (
                        <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Resend confirmation email
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Additional Features */}
            {mode === "signup" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-xs text-muted-foreground text-center space-y-2"
              >
                <p>
                  By creating an account, you agree to our Terms of Service and Privacy Policy.
                </p>
                <p>
                  🔒 Your data is encrypted and secure. We'll never share your information.
                </p>
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center mt-8 text-sm text-muted-foreground"
        >
          <p>Need help? Contact support</p>
        </motion.div>
      </motion.div>
    </div>
  );
}