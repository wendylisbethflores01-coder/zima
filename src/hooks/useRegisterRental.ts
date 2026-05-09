import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";

interface RegisterRentalData {
  propertyId: string;
  agentId: string;
  monthlyRent: number;
  rentCurrency: 'PEN' | 'USD';
  contractStartDate: Date;
  contractEndDate: Date;
  depositAmount?: number;
  depositCurrency?: 'PEN' | 'USD';
  tenantName: string;
  tenantEmail?: string;
  tenantPhone?: string;
  notes?: string;
}

export function useRegisterRental() {
  const [isRegistering, setIsRegistering] = useState(false);
  const queryClient = useQueryClient();

  const registerRental = async (data: RegisterRentalData): Promise<{ success: boolean; error?: any }> => {
    setIsRegistering(true);
    
    try {
      // Insert rental contract
      const { error: rentalError } = await supabase
        .from("rental_contracts")
        .insert({
          property_id: data.propertyId,
          agent_id: data.agentId,
          monthly_rent: data.monthlyRent,
          rent_currency: data.rentCurrency,
          contract_start_date: data.contractStartDate.toISOString().split('T')[0],
          contract_end_date: data.contractEndDate.toISOString().split('T')[0],
          deposit_amount: data.depositAmount,
          deposit_currency: data.depositCurrency,
          tenant_name: data.tenantName,
          tenant_email: data.tenantEmail,
          tenant_phone: data.tenantPhone,
          contract_status: 'active',
          notes: data.notes,
        });

      if (rentalError) throw rentalError;

      // Update property to inactive
      const { error: updateError } = await supabase
        .from("properties")
        .update({ is_active: false })
        .eq("id", data.propertyId);

      if (updateError) throw updateError;

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      queryClient.invalidateQueries({ queryKey: ["agent-properties"] });
      queryClient.invalidateQueries({ queryKey: ["rental-contracts"] });

      toast({
        title: "Contrato registrado exitosamente",
        description: "La propiedad ha sido marcada como alquilada",
      });

      return { success: true };
    } catch (error) {
      console.error("Error registrando contrato:", error);
      toast({
        title: "Error al registrar contrato",
        description: "Hubo un problema al registrar el contrato de alquiler",
        variant: "destructive",
      });
      return { success: false, error };
    } finally {
      setIsRegistering(false);
    }
  };

  return { registerRental, isRegistering };
}
