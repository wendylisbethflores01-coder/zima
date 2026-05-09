import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

interface UploadAvatarParams {
  agentId: string;
  file: File;
}

export const useAgentAvatar = (userId: string | undefined) => {
  const queryClient = useQueryClient();

  const { mutate: uploadAvatar, isPending: isUploading } = useMutation({
    mutationFn: async ({ agentId, file }: UploadAvatarParams) => {
      // Validar tipo de archivo
      if (!ALLOWED_TYPES.includes(file.type)) {
        throw new Error('Tipo de archivo no permitido. Solo se aceptan JPG, PNG y WEBP.');
      }

      // Validar tamaño
      if (file.size > MAX_FILE_SIZE) {
        throw new Error('El archivo es muy grande. Tamaño máximo: 5MB.');
      }

      // Subir archivo con upsert para reemplazar
      const { error } = await supabase.storage
        .from('agents')
        .upload(`${agentId}/avatar.jpg`, file, {
          cacheControl: '3600',
          upsert: true, // Reemplaza el archivo existente
        });

      if (error) throw error;

      return agentId;
    },
    onSuccess: (agentId) => {
      // Invalidar queries para refrescar datos
      queryClient.invalidateQueries({ queryKey: ['agent', userId] });
      toast.success('Foto de perfil actualizada exitosamente');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al actualizar la foto de perfil');
    },
  });

  return {
    uploadAvatar,
    isUploading,
  };
};
