import { createContext, ReactNode, useContext, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  signIn: (email: string, password: string) => void;
  signUp: (email: string, password: string) => void;
  signOut: () => void;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();

  const {
    data: user,
    error,
    isLoading,
    refetch
  } = useQuery({
    queryKey: ["auth-user"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session?.user ?? null;
    },
  });

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        refetch();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [refetch]);

  const signInMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const { data, error } = await supabase.auth.signInWithPassword(credentials);
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password');
        }
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      refetch();
      toast({
        title: "Welcome back!",
        description: "You've successfully signed in.",
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

  const signUpMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const { data, error } = await supabase.auth.signUp({
        ...credentials,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        if (error.message.includes('User already registered')) {
          throw new Error('An account with this email already exists');
        }
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Account created",
        description: "Please check your email to verify your account.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const signOutMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
    onSuccess: () => {
      refetch();
      toast({
        title: "Signed out successfully",
        description: "Come back soon!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Sign out failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error: error as Error | null,
        signIn: (email: string, password: string) => 
          signInMutation.mutate({ email, password }),
        signUp: (email: string, password: string) => 
          signUpMutation.mutate({ email, password }),
        signOut: () => signOutMutation.mutate()
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}