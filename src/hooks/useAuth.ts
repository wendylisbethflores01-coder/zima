import { useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    console.log("Sign-in data:", data);
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/`;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });
    return { error };
  };

  const signOut = async () => {
    try {
      // Clear local storage before attempting logout to prevent issues
      const supabaseStorageKey = `sb-nuujznowhmawcvcskzcb-auth-token`;
      try {
        localStorage.removeItem(supabaseStorageKey);
      } catch (storageError) {
        console.warn("Error clearing auth storage:", storageError);
      }

      const { error } = await supabase.auth.signOut();

      // Force clear state regardless of API response
      setSession(null);
      setUser(null);

      return { error };
    } catch (error) {
      console.error("SignOut error:", error);
      // Force clear state even if there's an error
      setSession(null);
      setUser(null);
      return {
        error:
          error instanceof Error
            ? error
            : new Error("Unknown error during signout"),
      };
    }
  };

  return {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
  };
};
