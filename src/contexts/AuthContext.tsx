import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  credits: number;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  deductCredit: () => Promise<boolean>;
  refetchCredits: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState(0);
  const navigate = useNavigate();

  const fetchCredits = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching credits:', error);
        return;
      }
      
      setCredits(data?.credits ?? 0);
    } catch (error) {
      console.error('Error fetching credits:', error);
    }
  };

  const refetchCredits = async () => {
    if (user) {
      await fetchCredits(user.id);
    }
  };

  const deductCredit = async (): Promise<boolean> => {
    if (!user || credits <= 0) return false;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ credits: credits - 1 })
        .eq('id', user.id);

      if (error) {
        console.error('Error deducting credit:', error);
        return false;
      }

      setCredits(prev => prev - 1);
      return true;
    } catch (error) {
      console.error('Error deducting credit:', error);
      return false;
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Fetch credits when user logs in
        if (session?.user) {
          setTimeout(() => {
            fetchCredits(session.user.id);
          }, 0);
        } else {
          setCredits(0);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (session?.user) {
        fetchCredits(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
        }
      }
    });

    if (!error) {
      toast.success('Account aangemaakt! Controleer je email voor bevestiging.');
    }

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (!error) {
      toast.success('Welkom terug!');
    }

    return { error };
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
      }
    });

    return { error };
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth?mode=reset`,
    });

    if (!error) {
      toast.success('Reset link verzonden! Check je email.');
    }

    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setCredits(0);
    toast.success('Je bent uitgelogd');
    navigate('/');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      loading, 
      credits,
      signUp, 
      signIn, 
      signInWithGoogle, 
      resetPassword, 
      signOut,
      deductCredit,
      refetchCredits
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
