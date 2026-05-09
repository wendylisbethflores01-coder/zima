import { useState } from 'react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useTogglePropertyStatus = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const queryClient = useQueryClient();

  const togglePropertyStatus = async (propertyId: string, currentStatus: boolean) => {
    setIsUpdating(true);

    try {
      const { error } = await supabase
        .from('properties')
        .update({ is_active: !currentStatus, updated_at: new Date().toISOString() })
        .eq('property_code', propertyId);

      if (error) {
        console.error('Error updating property status:', error);
        toast.error('Error al actualizar el estado de la propiedad');
        return { success: false, error };
      }

      // Invalidate relevant queries to refresh UI
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['agent-properties'] });
      queryClient.invalidateQueries({ queryKey: ['latest-properties'] });
      queryClient.invalidateQueries({ queryKey: ['property', propertyId] });

      toast.success(
        !currentStatus 
          ? 'Propiedad marcada como activa' 
          : 'Propiedad marcada como inactiva'
      );
      return { success: true };

    } catch (error) {
      console.error('Error in togglePropertyStatus:', error);
      toast.error('Error inesperado al actualizar el estado');
      return { success: false, error };
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    togglePropertyStatus,
    isUpdating
  };
};
