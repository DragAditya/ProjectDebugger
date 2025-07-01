import { createContext, ReactNode, useContext, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  resetPasswordMutation: ReturnType<typeof useResetPasswordMutation>;
  updatePasswordMutation: ReturnType<typeof useUpdatePasswordMutation>;
  resendConfirmationMutation: ReturnType<typeof useResendConfirmationMutation>;
};

const useLoginMutation = () => {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      if (!email?.trim() || !password?.trim()) {
        throw new Error('Email and password are required');
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        // Enhanced error messages
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password. Please check your credentials and try again.');
        }
        if (error.message.includes('Email not confirmed')) {
          throw new Error('Please confirm your email address before signing in.');
        }
        if (error.message.includes('Too many requests')) {
          throw new Error('Too many login attempts. Please wait a moment and try again.');
        }
        throw new Error(error.message || 'Failed to sign in');
      }

      return data;
    },
    onSuccess: (data) => {
      // Invalidate and refetch user data
      queryClient.invalidateQueries({ queryKey: ["auth-user"] });
      
      const username = data.user?.user_metadata?.username || data.user?.email?.split('@')[0];
      toast({
        title: "✅ Welcome back!",
        description: `Good to see you again, ${username}!`,
      });
      setLocation("/home");
    },
    onError: (error: Error) => {
      toast({
        title: "❌ Login failed",
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
      if (!email?.trim() || !password?.trim() || !username?.trim()) {
        throw new Error('All fields are required');
      }

      if (password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }

      if (username.length < 3) {
        throw new Error('Username must be at least 3 characters long');
      }

      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            username: username.trim(),
            display_name: username.trim(),
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        if (error.message.includes('User already registered')) {
          throw new Error('An account with this email already exists. Try signing in instead.');
        }
        if (error.message.includes('Password should be')) {
          throw new Error('Password should be at least 8 characters long.');
        }
        if (error.message.includes('Invalid email')) {
          throw new Error('Please enter a valid email address.');
        }
        throw new Error(error.message || 'Failed to create account');
      }

      return data;
    },
    onSuccess: (data) => {
      if (data.user && !data.user.email_confirmed_at) {
        toast({
          title: "🎉 Account created!",
          description: "Please check your email and click the confirmation link to complete your registration.",
        });
      } else {
        toast({
          title: "🎉 Welcome to ALTER!",
          description: "Your account has been created successfully.",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "❌ Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

const useResetPasswordMutation = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ email }: { email: string }) => {
      if (!email?.trim()) {
        throw new Error('Email address is required');
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        if (error.message.includes('Invalid email')) {
          throw new Error('Please enter a valid email address.');
        }
        throw new Error(error.message || 'Failed to send reset email');
      }

      return true;
    },
    onSuccess: () => {
      toast({
        title: "📧 Reset email sent!",
        description: "Check your email for a link to reset your password. The link will expire in 1 hour.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "❌ Reset failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

const useUpdatePasswordMutation = () => {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  return useMutation({
    mutationFn: async ({ password }: { password: string }) => {
      if (!password?.trim()) {
        throw new Error('Password is required');
      }

      if (password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }

      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        throw new Error(error.message || 'Failed to update password');
      }

      return true;
    },
    onSuccess: () => {
      toast({
        title: "✅ Password updated!",
        description: "Your password has been successfully updated.",
      });
      setLocation("/home");
    },
    onError: (error: Error) => {
      toast({
        title: "❌ Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

const useResendConfirmationMutation = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ email }: { email: string }) => {
      if (!email?.trim()) {
        throw new Error('Email address is required');
      }

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim().toLowerCase(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to resend confirmation email');
      }

      return true;
    },
    onSuccess: () => {
      toast({
        title: "📧 Confirmation email sent!",
        description: "Please check your email and click the confirmation link.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "❌ Failed to resend",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

const useLogoutMutation = () => {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw new Error(error.message || 'Failed to sign out');
      return true;
    },
    onSuccess: () => {
      // Clear all cached data
      queryClient.clear();
      
      toast({
        title: "👋 Signed out successfully",
        description: "Come back soon!",
      });
      setLocation("/auth");
    },
    onError: (error: Error) => {
      toast({
        title: "❌ Sign out failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

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
        if (error) {
          console.error('Session error:', error);
          return null;
        }
        return session?.user ?? null;
      } catch (error) {
        console.error('Failed to get session:', error);
        return null;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    retry: 1,
  });

  // Enhanced auth state listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[Auth Event]', { event, sessionExists: !!session });
      
      // Handle different auth events
      switch (event) {
        case 'SIGNED_IN':
        case 'TOKEN_REFRESHED':
          queryClient.invalidateQueries({ queryKey: ["auth-user"] });
          break;
        case 'SIGNED_OUT':
          queryClient.clear();
          break;
        case 'PASSWORD_RECOVERY':
          // Handle password recovery
          break;
        case 'USER_UPDATED':
          queryClient.invalidateQueries({ queryKey: ["auth-user"] });
          break;
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient]);

  const loginMutation = useLoginMutation();
  const registerMutation = useRegisterMutation();
  const logoutMutation = useLogoutMutation();
  const resetPasswordMutation = useResetPasswordMutation();
  const updatePasswordMutation = useUpdatePasswordMutation();
  const resendConfirmationMutation = useResendConfirmationMutation();

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error: error as Error | null,
        loginMutation,
        logoutMutation,
        registerMutation,
        resetPasswordMutation,
        updatePasswordMutation,
        resendConfirmationMutation,
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