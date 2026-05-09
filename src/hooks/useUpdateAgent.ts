import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UpdateAgentData {
  email?: string;
  phone?: string;
  whatsapp?: string;
}

export const useUpdateAgent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ agentId, data }: { agentId: string; data: UpdateAgentData }) => {
      const { data: updatedAgent, error } = await supabase
        .from('agents')
        .update(data)
        .eq('id', agentId)
        .select()
        .single();

      if (error) throw error;
      return updatedAgent;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['agent'] });
      toast.success('Información actualizada exitosamente');
    },
    onError: (error: Error) => {
      toast.error(`Error al actualizar la información: ${error.message}`);
    },
  });
};
