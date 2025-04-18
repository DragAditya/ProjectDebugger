import { createContext, ReactNode, useContext, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { User, AuthError } from "@supabase/supabase-js";
import { useLocation } from "wouter";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: ReturnType<typeof useLoginMutation>;
  logoutMutation: ReturnType<typeof useLogoutMutation>;
  registerMutation: ReturnType<typeof useRegisterMutation>;
};

const useLoginMutation = () => {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            throw new Error('Invalid email or password');
          }
          throw error;
        }
        return data;
      } catch (error) {
        if (error instanceof AuthError) {
          throw new Error(error.message);
        }
        throw new Error('Failed to sign in');
      }
    },
    onSuccess: () => {
      toast({
        title: "Welcome back!",
        description: "You've successfully signed in.",
      });
      setLocation("/home");
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

const useRegisterMutation = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ email, password, username }: { email: string; password: string; username: string }) => {
      try {
        // First create the user
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username,
            },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (authError) {
          if (authError.message.includes('User already registered')) {
            throw new Error('An account with this email already exists');
          }
          throw authError;
        }

        // Update the user's metadata with username
        if (authData.user) {
          const { error: updateError } = await supabase.auth.updateUser({
            data: { username },
          });
          if (updateError) throw updateError;
        }

        return authData;
      } catch (error) {
        if (error instanceof AuthError) {
          throw new Error(error.message);
        }
        throw new Error('Failed to create account');
      }
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
};

const useLogoutMutation = () => {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  return useMutation({
    mutationFn: async () => {
      try {
        // Clear Supabase auth state first
        const { error } = await supabase.auth.signOut();
        if (error) throw error;

        // Then clear server session
        const response = await fetch('/api/logout', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Server logout failed');
        }

        // Force reload to clear any cached state
        window.location.reload();
      } catch (error) {
        if (error instanceof AuthError) {
          throw new Error(error.message);
        }
        throw new Error('Failed to sign out');
      }
    },
    onSuccess: () => {
      toast({
        title: "Signed out successfully",
        description: "Come back soon!",
      });
      // Force a full page reload to clear all auth state
      window.location.href = "/auth";
    },
    onError: (error: Error) => {
      toast({
        title: "Sign out failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const {
    data: user,
    error,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["auth-user"],
    queryFn: async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        return session?.user ?? null;
      } catch (error) {
        console.error('Failed to get session:', error);
        return null;
      }
    },
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    gcTime: 1000 * 60 * 30, // Keep data in cache for 30 minutes
  });

  // Listen for auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[Auth Event]', { event, sessionExists: !!session });
      refetch();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [refetch]);

  const loginMutation = useLoginMutation();
  const registerMutation = useRegisterMutation();
  const logoutMutation = useLogoutMutation();

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error: error as Error | null,
        loginMutation,
        logoutMutation,
        registerMutation,
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