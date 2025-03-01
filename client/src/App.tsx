import { QueryClientProvider } from "@tanstack/react-query";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import { ThemeProvider } from "./components/theme-provider";
import { Hero } from "./components/Hero";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import { ProtectedRoute, AuthCallback } from "./lib/protected-route";
import { AuthProvider } from "./hooks/use-auth";
import { AnimatePresence, motion } from "framer-motion";
import { useLocation } from "wouter";

function Router() {
  const [location] = useLocation();

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background pattern with reduced opacity */}
      <div className="fixed inset-0 bg-[radial-gradient(#333_1px,transparent_1px)] [background-size:20px_20px] opacity-25 pointer-events-none" />

      {/* Content wrapper with proper z-index */}
      <div className="relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={location}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <Switch>
              {/* Protected Home route */}
              <ProtectedRoute path="/home" component={HomePage} />

              {/* Auth related routes */}
              <Route path="/auth/callback" component={AuthCallback} />
              <Route path="/auth">
                <div className="min-h-screen bg-background/95 backdrop-blur-sm">
                  <AuthPage />
                </div>
              </Route>

              {/* Landing page */}
              <Route path="/">
                <Hero />
              </Route>

              {/* 404 page */}
              <Route component={NotFound} />
            </Switch>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="ui-theme">
        <AuthProvider>
          <Router />
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;