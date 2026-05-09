import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { EditPropertyData } from './useEditProperty';

export const usePropertyChangeRequest = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      propertyId,
      propertyCode,
      agentId,
      data,
      amenities,
      requestNotes,
      originalProperty,
    }: {
      propertyId: string;
      propertyCode: string;
      agentId: string;
      data: EditPropertyData;
      amenities: string[];
      requestNotes: string;
      originalProperty: any;
    }) => {
      // Crear snapshot del estado original
      const originalSnapshot = {
        title: originalProperty.title,
        description: originalProperty.description,
        property_type: originalProperty.property_type,
        transaction_type: originalProperty.transaction_type,
        price: originalProperty.price,
        currency: originalProperty.currency,
        city: originalProperty.city,
        district: originalProperty.district,
        province: originalProperty.province,
        area: originalProperty.area,
        built_area: originalProperty.built_area,
        bedrooms: originalProperty.bedrooms,
        bathrooms: originalProperty.bathrooms,
        parking: originalProperty.parking,
        age: originalProperty.age,
      };

      // Preparar amenidades propuestas
      const proposedAmenities = amenities.map(id => ({ id }));

      // Crear solicitud de cambio
      const { data: changeRequest, error } = await supabase
        .from('property_change_requests')
        .insert({
          property_id: propertyId,
          requested_by_agent_id: agentId,
          proposed_title: data.title !== originalProperty.title ? data.title : null,
          proposed_description: data.description !== originalProperty.description ? data.description : null,
          proposed_property_type: data.property_type !== originalProperty.property_type ? data.property_type : null,
          proposed_transaction_type: data.transaction_type !== originalProperty.transaction_type ? data.transaction_type : null,
          proposed_price: data.price !== originalProperty.price ? data.price : null,
          proposed_currency: data.currency !== originalProperty.currency ? data.currency : null,
          proposed_city: data.city !== originalProperty.city ? data.city : null,
          proposed_district: data.district !== originalProperty.district ? data.district : null,
          proposed_province: data.province !== originalProperty.province ? data.province : null,
          proposed_area: data.area !== originalProperty.area ? data.area : null,
          proposed_built_area: data.built_area !== originalProperty.built_area ? data.built_area : null,
          proposed_bedrooms: data.bedrooms !== originalProperty.bedrooms ? data.bedrooms : null,
          proposed_bathrooms: data.bathrooms !== originalProperty.bathrooms ? data.bathrooms : null,
          proposed_parking: data.parking !== originalProperty.parking ? data.parking : null,
          proposed_age: data.age !== originalProperty.age ? data.age : null,
          proposed_amenities: proposedAmenities,
          original_snapshot: originalSnapshot,
          request_notes: requestNotes,
        })
        .select()
        .single();

      if (error) throw error;

      return changeRequest;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-change-requests'] });
      toast({
        title: 'Solicitud enviada',
        description: 'Tu solicitud de cambio ha sido enviada al administrador para su revisión.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `No se pudo enviar la solicitud: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
};
