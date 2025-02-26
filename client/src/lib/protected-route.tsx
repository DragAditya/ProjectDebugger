import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";
import { supabase } from "./supabase";
import { useEffect, useState } from "react";

export function AuthCallback() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { error } = await supabase.auth.getSession();
        if (error) throw error;
        window.location.href = "/home";
      } catch (err) {
        console.error("Auth callback error:", err);
        setError(err instanceof Error ? err.message : "Authentication failed");
      }
    };
    handleCallback();
  }, []);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-destructive mb-4">{error}</p>
        <a href="/auth" className="text-primary hover:underline">
          Return to login
        </a>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-border" />
        </div>
      </Route>
    );
  }

  if (!user) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  return <Route path={path} component={Component} />;
}
