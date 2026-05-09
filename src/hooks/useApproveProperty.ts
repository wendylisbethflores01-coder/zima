import { useState } from 'react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useApproveProperty = () => {
  const [isApproving, setIsApproving] = useState(false);
  const queryClient = useQueryClient();

  const approveProperty = async (propertyId: string) => {
    setIsApproving(true);

    try {
      const { error } = await supabase
        .from('properties')
        .update({ 
          is_approved: true, 
          is_active: true, 
          updated_at: new Date().toISOString() 
        })
        .eq('property_code', propertyId);

      if (error) {
        console.error('Error approving property:', error);
        toast.error('Error al aprobar la propiedad');
        return { success: false, error };
      }

      // Invalidate relevant queries to refresh UI
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['agent-properties'] });
      queryClient.invalidateQueries({ queryKey: ['latest-properties'] });
      queryClient.invalidateQueries({ queryKey: ['property', propertyId] });

      toast.success('Propiedad aprobada exitosamente');
      return { success: true };

    } catch (error) {
      console.error('Error in approveProperty:', error);
      toast.error('Error inesperado al aprobar la propiedad');
      return { success: false, error };
    } finally {
      setIsApproving(false);
    }
  };

  return {
    approveProperty,
    isApproving
  };
};
