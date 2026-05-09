import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CreateAgentUserRequest {
  name: string;
  email: string;
  phone?: string;
}

interface CreateAgentUserResponse {
  success: boolean;
  agent: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    user_id: string;
  };
  credentials: {
    email: string;
    password: string;
  };
  message: string;
}

const createAgentUser = async (
  data: CreateAgentUserRequest
): Promise<CreateAgentUserResponse> => {
  const { data: response, error } = await supabase.functions.invoke(
    "create-agent",
    {
      body: data,
    }
  );

  if (error) {
    throw new Error(`Error llamando a la función: ${error.message}`);
  }

  if (response.error) {
    throw new Error(response.error);
  }

  return response;
};

export const useCreateAgentUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAgentUser,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      toast.success(data.message || "Agente creado exitosamente");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al crear el agente");
    },
  });
};
