import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Property } from './useProperties';

interface SimilarPropertiesParams {
  currentPropertyId?: string;
  district?: string;
  city?: string;
  province?: string;
  transactionType?: string;
  propertyType?: string;
}

const fetchSimilarProperties = async (params: SimilarPropertiesParams): Promise<Property[]> => {
  if (!params.currentPropertyId) {
    return [];
  }

  const { data, error } = await (supabase as any)
    .rpc('get_similar_properties', {
      p_property_code: params.currentPropertyId
    });

  if (error) {
    console.error('Error fetching similar properties:', error);
    throw error;
  }

  if (!data || data.length === 0) {
    return [];
  }

  // Transform the data to match our Property interface
  return data.map((prop: any) => {
    // Get the main image URL from storage
    const { data: imageData } = supabase.storage
      .from('properties')
      .getPublicUrl(`${prop.property_code}/main.jpg`);

    const currencySymbol = prop.currency === 'USD' ? '$' : 'S/';
    const formattedPrice = `${currencySymbol} ${prop.price.toLocaleString(prop.currency === 'USD' ? 'en-US' : 'es-PE', { minimumFractionDigits: 2 })}`;

    return {
      id: prop.property_code,
      title: prop.title,
      type: prop.property_type,
      transaction_type: prop.transaction_type,
      price: prop.price,
      currency: prop.currency,
      formattedPrice,
      location: prop.full_location,
      image: imageData.publicUrl,
      bedrooms: prop.bedrooms,
      bathrooms: prop.bathrooms,
      parking: prop.parking,
      area: `${prop.area} m²`,
      builtArea: prop.built_area ? `${prop.built_area} m²` : undefined,
      description: prop.description,
      age: prop.age,
      created_at: prop.created_at,
      agent: {
        id: '',
        name: 'Agente no disponible',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'
      }
    };
  });
};

export const useSimilarProperties = (params: SimilarPropertiesParams) => {
  return useQuery({
    queryKey: ['similar-properties', params],
    queryFn: () => fetchSimilarProperties(params),
    enabled: !!params.currentPropertyId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};