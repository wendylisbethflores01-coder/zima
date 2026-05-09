import { useState } from 'react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface RegisterSaleData {
  property_id: string;
  agent_id: string;
  sale_price: number;
  currency: 'PEN' | 'USD';
  sale_date: Date;
  buyer_name: string | null;
  buyer_email: string | null;
  buyer_phone: string | null;
  notes: string | null;
}

export const useRegisterSale = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const queryClient = useQueryClient();

  const registerSale = async (data: RegisterSaleData) => {
    setIsRegistering(true);

    try {
      // Insert sale record
      const { error: saleError } = await supabase
        .from('sales')
        .insert({
          property_id: data.property_id,
          agent_id: data.agent_id,
          sale_price: data.sale_price,
          currency: data.currency,
          sale_date: data.sale_date.toISOString().split('T')[0],
          buyer_name: data.buyer_name,
          buyer_email: data.buyer_email,
          buyer_phone: data.buyer_phone,
          notes: data.notes,
        });

      if (saleError) {
        console.error('Error registering sale:', saleError);
        toast.error(`Error al registrar la venta: ${saleError.message}`);
        return { success: false, error: saleError };
      }

      // Mark property as inactive
      const { error: propertyError } = await supabase
        .from('properties')
        .update({ is_active: false })
        .eq('id', data.property_id);

      if (propertyError) {
        console.error('Error deactivating property:', propertyError);
        toast.error(`Error al desactivar la propiedad: ${propertyError.message}`);
        return { success: false, error: propertyError };
      }

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['agent-properties'] });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['latest-properties'] });

      toast.success('Venta registrada exitosamente. La propiedad ha sido desactivada.');
      return { success: true };

    } catch (error) {
      console.error('Error in registerSale:', error);
      toast.error('Error inesperado al registrar la venta');
      return { success: false, error };
    } finally {
      setIsRegistering(false);
    }
  };

  return {
    registerSale,
    isRegistering,
  };
};
