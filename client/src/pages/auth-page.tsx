import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login, register } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!username || !password) {
        toast({
          title: "Error",
          description: "Please fill in all fields",
          variant: "destructive"
        });
        return;
      }

      if (isLogin) {
        await login(username, password);
      } else {
        await register(username, password);
      }
      setLocation("/");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Authentication failed",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="w-full max-w-md p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={isLogin ? "login" : "register"}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <h1 className="text-2xl font-bold text-center mb-6">
                {isLogin ? "Welcome Back" : "Create Account"}
              </h1>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Button type="submit" className="w-full">
                  {isLogin ? "Login" : "Register"}
                </Button>
              </form>
              <p className="text-center mt-4 text-sm text-muted-foreground">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
                <Button
                  variant="link"
                  className="ml-1 p-0"
                  onClick={() => setIsLogin(!isLogin)}
                >
                  {isLogin ? "Register" : "Login"}
                </Button>
              </p>
            </motion.div>
          </AnimatePresence>
        </Card>
      </motion.div>
    </div>
  );
}