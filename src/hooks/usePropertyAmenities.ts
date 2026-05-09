import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const usePropertyAmenities = (propertyCode: string) => {
  return useQuery({
    queryKey: ['property-amenities', propertyCode],
    queryFn: async (): Promise<string[]> => {
      if (!propertyCode) return [];

      // First get the property ID from the property code
      const { data: property, error: propertyError } = await supabase
        .from('properties')
        .select('id')
        .eq('property_code', propertyCode)
        .single();

      if (propertyError || !property) {
        console.error('Error fetching property:', propertyError);
        return [];
      }

      // Then get the amenities for this property
      const { data, error } = await supabase
        .from('property_amenities')
        .select('amenity_id')
        .eq('property_id', property.id);

      if (error) {
        console.error('Error fetching property amenities:', error);
        return [];
      }

      return data?.map(item => item.amenity_id) || [];
    },
    enabled: !!propertyCode,
  });
};