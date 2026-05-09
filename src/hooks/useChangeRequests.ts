import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ChangeRequest {
  id: string;
  property_id: string;
  requested_by_agent_id: string;
  status: 'pending' | 'approved' | 'rejected';
  proposed_title: string | null;
  proposed_description: string | null;
  proposed_property_type: string | null;
  proposed_transaction_type: string | null;
  proposed_price: number | null;
  proposed_currency: string | null;
  proposed_city: string | null;
  proposed_district: string | null;
  proposed_province: string | null;
  proposed_area: number | null;
  proposed_built_area: number | null;
  proposed_bedrooms: number | null;
  proposed_bathrooms: number | null;
  proposed_parking: number | null;
  proposed_age: number | null;
  other_changes: any;
  proposed_images: any;
  proposed_amenities: any;
  original_snapshot: any;
  request_notes: string | null;
  admin_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
  properties?: any;
  agents?: any;
}

// Fetch all change requests (admin)
export const useChangeRequests = (filters?: { status?: string }) => {
  return useQuery({
    queryKey: ['change-requests', filters],
    queryFn: async () => {
      let query = supabase
        .from('property_change_requests')
        .select(`
          *,
          properties (
            property_code,
            title,
            transaction_type
          ),
          agents (
            name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as ChangeRequest[];
    },
  });
};

// Fetch agent's own change requests
export const useAgentChangeRequests = (agentId: string | undefined) => {
  return useQuery({
    queryKey: ['agent-change-requests', agentId],
    queryFn: async () => {
      if (!agentId) return [];

      const { data, error } = await supabase
        .from('property_change_requests')
        .select(`
          *,
          properties (
            property_code,
            title,
            transaction_type
          )
        `)
        .eq('requested_by_agent_id', agentId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ChangeRequest[];
    },
    enabled: !!agentId,
  });
};

// Fetch pending change requests count
export const usePendingChangeRequestsCount = () => {
  return useQuery({
    queryKey: ['pending-change-requests-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('property_change_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      if (error) throw error;
      return count || 0;
    },
  });
};

// Approve change request
export const useApproveChangeRequest = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, adminNotes, applyNow }: { id: string; adminNotes?: string; applyNow?: boolean }) => {
      const { data: user } = await supabase.auth.getUser();
      
      const { error: updateError } = await supabase
        .from('property_change_requests')
        .update({
          status: 'approved',
          admin_notes: adminNotes,
          reviewed_by: user.user?.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (updateError) throw updateError;

      // Si se solicita aplicar cambios inmediatamente
      if (applyNow) {
        const { error: applyError } = await supabase.rpc('apply_approved_property_changes', {
          request_id: id,
        });

        if (applyError) throw applyError;
      }

      return { id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['change-requests'] });
      queryClient.invalidateQueries({ queryKey: ['pending-change-requests-count'] });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      toast({
        title: 'Solicitud aprobada',
        description: 'La solicitud de cambio ha sido aprobada exitosamente.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `No se pudo aprobar la solicitud: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
};

// Reject change request
export const useRejectChangeRequest = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, adminNotes }: { id: string; adminNotes: string }) => {
      const { data: user } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('property_change_requests')
        .update({
          status: 'rejected',
          admin_notes: adminNotes,
          reviewed_by: user.user?.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
      return { id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['change-requests'] });
      queryClient.invalidateQueries({ queryKey: ['pending-change-requests-count'] });
      toast({
        title: 'Solicitud rechazada',
        description: 'La solicitud de cambio ha sido rechazada.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `No se pudo rechazar la solicitud: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
};
