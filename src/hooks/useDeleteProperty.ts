import { useState } from 'react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useDeleteProperty = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const queryClient = useQueryClient();

  const deleteProperty = async (propertyId: string, propertyTitle: string) => {
    setIsDeleting(true);

    try {
      // Delete property from database
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('property_code', propertyId);

      if (error) {
        console.error('Error deleting property:', error);
        toast.error(`Error al eliminar la propiedad: ${error.message}`);
        return { success: false, error };
      }

      // Invalidate relevant queries to refresh UI automatically
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['latest-properties'] });
      queryClient.invalidateQueries({ queryKey: ['property', propertyId] });

      toast.success(`Propiedad "${propertyTitle}" eliminada exitosamente`);
      return { success: true };

    } catch (error) {
      console.error('Error in deleteProperty:', error);
      toast.error('Error inesperado al eliminar la propiedad');
      return { success: false, error };
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    deleteProperty,
    isDeleting
  };
};