import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useRentalContracts = () => {
  return useQuery({
    queryKey: ['rental_contracts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rental_contracts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
};
