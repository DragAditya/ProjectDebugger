import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Icons } from "@/components/ui/icons";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, CheckCircle, XCircle } from "lucide-react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null);
  const [, setLocation] = useLocation();

  const { updatePasswordMutation } = useAuth();

  useEffect(() => {
    // Check if we have a valid session for password reset
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error || !session) {
          setIsValidSession(false);
          return;
        }
        setIsValidSession(true);
      } catch (error) {
        setIsValidSession(false);
      }
    };

    checkSession();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      return;
    }

    updatePasswordMutation.mutate({ password });
  };

  const passwordsMatch = password === confirmPassword;
  const isValidPassword = password.length >= 8;
  const canSubmit = isValidPassword && passwordsMatch && password.trim() !== "";

  if (isValidSession === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <Icons.spinner className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Verifying reset link...</p>
        </div>
      </div>
    );
  }

  if (isValidSession === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
        <Card className="card-mobile max-w-md mx-auto">
          <CardHeader className="text-center">
            <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <CardTitle className="text-destructive">Invalid Reset Link</CardTitle>
            <CardDescription>
              This password reset link is invalid or has expired. Please request a new one.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => setLocation("/auth")}
              className="btn btn-primary btn-md w-full"
            >
              Back to Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
        <Card className="card-mobile shadow-xl border-border/50">
          <CardHeader className="text-center">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
              className="mb-4"
            >
              <CheckCircle className="h-12 w-12 text-primary mx-auto mb-4" />
            </motion.div>
            <CardTitle className="text-heading">Reset Your Password</CardTitle>
            <CardDescription>
              Enter your new password below. Make sure it's strong and secure.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* New Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  New Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-mobile pl-10 pr-10"
                    required
                    autoComplete="new-password"
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
                {/* Password strength indicator */}
                <div className="space-y-1">
                  <div className={`text-xs ${isValidPassword ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>
                    {isValidPassword ? '✓' : '•'} At least 8 characters
                  </div>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">
                  Confirm New Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input-mobile pl-10 pr-10"
                    required
                    autoComplete="new-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 touch-target"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                {/* Password match indicator */}
                {confirmPassword && (
                  <div className={`text-xs ${passwordsMatch ? 'text-green-600 dark:text-green-400' : 'text-destructive'}`}>
                    {passwordsMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="btn btn-primary btn-lg w-full"
                disabled={!canSubmit || updatePasswordMutation.isPending}
              >
                {updatePasswordMutation.isPending && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                Update Password
              </Button>
            </form>

            {/* Security note */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-6 p-3 bg-muted/30 rounded-lg border border-border/50"
            >
              <p className="text-xs text-muted-foreground text-center">
                🔒 Your password will be encrypted and stored securely. 
                Choose a strong password you haven't used elsewhere.
              </p>
            </motion.div>
          </CardContent>
        </Card>

        {/* Back to sign in */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center mt-6"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/auth")}
            className="text-muted-foreground hover:text-foreground"
          >
            Back to Sign In
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}