import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export const useUserRole = () => {
  const [role, setRole] = useState<string | null | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    const fetchUserRole = async () => {
      // No ejecutar si auth todavía está cargando
      if (authLoading) {
        console.log("⏳ Auth still loading, waiting...");
        return;
      }

      console.log("🔍 fetchUserRole - user:", user?.id);
      if (!user) {
        console.log("❌ No user found");
        setRole(null);
        setLoading(false);
        return;
      }

      try {
        console.log("🔍 Checking profiles table for user:", user.id);
        // Check if user is in profiles table
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (profileError && profileError.code !== "PGRST116") {
          console.error("❌ Error fetching profile:", profileError);
          // If it's an auth error, clear role and don't retry
          if (
            profileError.message?.includes("API key") ||
            profileError.message?.includes("JWT")
          ) {
            console.error("🚨 Authentication error detected, clearing role");
            setRole(null);
            setLoading(false);
            return;
          }
          setRole(null);
          setLoading(false);
          return;
        }

        if (profile) {
          console.log("✅ Found profile with role:", profile.role);
          setRole(profile.role);
          setLoading(false);
          return;
        }

        console.log("🔍 No profile found, checking agents table");
        // Check if user is an agent
        const { data: agent, error: agentError } = await supabase
          .from("agents")
          .select("user_id")
          .eq("user_id", user.id)
          .single();

        if (agentError && agentError.code !== "PGRST116") {
          console.error("❌ Error fetching agent:", agentError);
          // If it's an auth error, clear role and don't retry
          if (
            agentError.message?.includes("API key") ||
            agentError.message?.includes("JWT")
          ) {
            console.error(
              "🚨 Authentication error detected while checking agents, clearing role"
            );
            setRole(null);
            setLoading(false);
            return;
          }
        }

        const finalRole = agent ? "agent" : null;
        console.log("✅ Final role determined:", finalRole);
        setRole(finalRole);
        setLoading(false);
      } catch (error) {
        console.error("❌ Error fetching user role:", error);
        setRole(null);
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [user, authLoading]);

  return { role, loading };
};
