import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Amenity {
  id: string;
  name: string;
  category: string | null;
  icon: string | null;
  is_active: boolean;
}

export const useAmenities = () => {
  return useQuery({
    queryKey: ['amenities'],
    queryFn: async (): Promise<Amenity[]> => {
      const { data, error } = await supabase
        .from('amenities')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching amenities:', error);
        throw error;
      }

      return data || [];
    },
  });
};