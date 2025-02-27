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

function Router() {
  return (
    <div className="min-h-screen bg-background">
      {/* Wrapper for pages that need the dot pattern */}
      <Switch>
        <Route path="/home">
          {/* Home page without background pattern */}
          <HomePage />
        </Route>

        <Route path="*">
          {/* All other routes with background pattern */}
          <div className="min-h-screen bg-background relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(#333_1px,transparent_1px)] [background-size:20px_20px] opacity-35" />
            <div className="relative z-10">
              <Switch>
                <Route path="/auth/callback" component={AuthCallback} />
                <Route path="/auth">
                  <AuthPage />
                </Route>
                <Route path="/">
                  <Hero />
                </Route>
                <Route component={NotFound} />
              </Switch>
            </div>
          </div>
        </Route>
      </Switch>
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