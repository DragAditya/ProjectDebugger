import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { ThemeToggle } from "./theme-toggle";
import { Home, MessageSquare, LogOut, User } from "lucide-react";

export function Navbar() {
  const { user, logoutMutation } = useAuth();
  const [location, setLocation] = useLocation();

  const navItems = [
    { path: "/home", label: "Debug", icon: Home },
    { path: "/chat", label: "Chat", icon: MessageSquare },
  ];

  const username = user?.user_metadata?.username || user?.email?.split('@')[0] || 'Developer';

  return (
    <motion.nav 
      className="border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-50"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="container-fluid">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <motion.div 
            className="flex items-center space-x-2 sm:space-x-3"
            whileHover={{ scale: 1.05 }}
          >
            <h1 className="text-xl sm:text-2xl font-bold gradient-text cursor-pointer" onClick={() => setLocation("/")}>
              ALTER
            </h1>
            {user && (
              <div className="hidden sm:flex items-center space-x-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>{username}</span>
              </div>
            )}
          </motion.div>

          {/* Navigation Items */}
          {user && (
            <div className="flex items-center space-x-1">
              {navItems.map((item) => (
                <Button
                  key={item.path}
                  variant={location === item.path ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setLocation(item.path)}
                  className={`transition-all duration-200 touch-target ${
                    location === item.path 
                      ? "bg-primary text-primary-foreground" 
                      : "hover:bg-secondary/80"
                  }`}
                >
                  <item.icon className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Button>
              ))}
            </div>
          )}

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <ThemeToggle />
            
            {user ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
                className="glass border-border/50 hover:border-destructive/50 hover:text-destructive touch-target"
              >
                <LogOut className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            ) : (
              <Button
                onClick={() => setLocation("/auth")}
                className="btn-primary touch-target"
              >
                <span className="hidden sm:inline">Sign In</span>
                <span className="sm:hidden">Login</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
