import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface AgentInvitation {
  id: string;
  email: string;
  token: string;
  agent_id: string;
  status: 'pending' | 'accepted' | 'expired';
  invited_by: string | null;
  expires_at: string;
  created_at: string;
  updated_at: string;
  agents?: {
    name: string;
  };
}

const fetchAgentInvitations = async (): Promise<AgentInvitation[]> => {
  const { data, error } = await supabase
    .from('agent_invitations')
    .select(`
      *,
      agents(name)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Error fetching agent invitations: ${error.message}`);
  }

  return (data || []) as AgentInvitation[];
};

const createAgentInvitation = async ({ 
  email, 
  agentId 
}: { 
  email: string; 
  agentId: string; 
}) => {
  const token = crypto.randomUUID();
  
  const { data, error } = await supabase
    .from('agent_invitations')
    .insert({
      email,
      token,
      agent_id: agentId,
      invited_by: (await supabase.auth.getUser()).data.user?.id
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Error creating invitation: ${error.message}`);
  }

  return data;
};

const resendInvitation = async (invitationId: string) => {
  const newToken = crypto.randomUUID();
  const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  
  const { data, error } = await supabase
    .from('agent_invitations')
    .update({
      token: newToken,
      expires_at: newExpiresAt,
      status: 'pending'
    })
    .eq('id', invitationId)
    .select()
    .single();

  if (error) {
    throw new Error(`Error resending invitation: ${error.message}`);
  }

  return data;
};

export const useAgentInvitations = () => {
  return useQuery({
    queryKey: ['agent-invitations'],
    queryFn: fetchAgentInvitations,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateAgentInvitation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createAgentInvitation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-invitations'] });
      toast.success('Invitación enviada exitosamente');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useResendInvitation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: resendInvitation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-invitations'] });
      toast.success('Invitación reenviada exitosamente');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};