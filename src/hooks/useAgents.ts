import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Agent {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const fetchAgents = async (): Promise<Agent[]> => {
  const { data, error } = await supabase
    .from("agents")
    .select("*")
    .eq("is_active", true)
    .order("name");

  if (error) {
    throw new Error(`Error fetching agents: ${error.message}`);
  }

  return data || [];
};

export const useAgents = () => {
  return useQuery({
    queryKey: ["agents"],
    queryFn: fetchAgents,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
