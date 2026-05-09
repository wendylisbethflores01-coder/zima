import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PropertyLocation {
  location_formatted: string;
  province: string;
  city: string;
  district: string;
  property_count: number;
}

const fetchPropertyLocations = async (search?: string): Promise<PropertyLocation[]> => {
  let query = supabase
    .from('property_locations')
    .select('*')
    .order('property_count', { ascending: false });

  if (search && search.length > 0) {
    query = query.ilike('location_formatted', `%${search}%`);
  }

  const { data, error } = await query.limit(20);

  if (error) throw error;
  return data || [];
};

export const usePropertyLocations = (search?: string) => {
  const {
    data: locations = [],
    isLoading: loading,
    error
  } = useQuery({
    queryKey: ['property-locations', search],
    queryFn: () => fetchPropertyLocations(search),
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: true
  });

  return {
    locations,
    loading,
    error: error ? (error as Error).message : null
  };
};