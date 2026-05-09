import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useSales = () => {
  return useQuery({
    queryKey: ['sales'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sales')
        .select('sale_price, currency, sale_date')
        .order('sale_date', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
};
