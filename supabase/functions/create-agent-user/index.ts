import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CreateAgentRequest {
  name: string;
  email: string;
  phone?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, phone }: CreateAgentRequest = await req.json();

    // Validate input
    if (!name?.trim() || !email?.trim()) {
      return new Response(
        JSON.stringify({ error: "Nombre y email son requeridos" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Create admin Supabase client
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Generate random password
    const generatePassword = () => {
      const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
      let password = "";
      for (let i = 0; i < 12; i++) {
        password += charset.charAt(Math.floor(Math.random() * charset.length));
      }
      return password;
    };

    const generatedPassword = generatePassword();
    console.log("Generated password for user:", email);

    // Create user in auth.users
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email.trim(),
      password: generatedPassword,
      email_confirm: true, // Auto-confirm email
    });

    if (authError) {
      console.error("Error creating auth user:", authError);
      return new Response(
        JSON.stringify({ error: `Error creando usuario: ${authError.message}` }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    if (!authUser.user) {
      return new Response(
        JSON.stringify({ error: "No se pudo crear el usuario" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("Auth user created successfully:", authUser.user.id);

    // Create agent record
    const { data: agent, error: agentError } = await supabaseAdmin
      .from('agents')
      .insert({
        name: name.trim(),
        email: email.trim(),
        phone: phone?.trim() || null,
        user_id: authUser.user.id,
        invitation_status: 'accepted'
      })
      .select()
      .single();

    if (agentError) {
      console.error("Error creating agent:", agentError);
      
      // Rollback: delete the auth user
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
      
      return new Response(
        JSON.stringify({ error: `Error creando agente: ${agentError.message}` }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("Agent created successfully:", agent.id);

    // Assign agent role to user
    const { error: roleError } = await supabaseAdmin
      .from('profiles')
      .update({ 
        role: 'agent' 
      })
      .eq('id', authUser.user.id);

    if (roleError) {
      console.error("Error assigning agent role:", roleError);
      // Continue anyway, the role can be assigned later
    } else {
      console.log("Agent role assigned successfully");
    }

    // Return success response with credentials
    return new Response(
      JSON.stringify({
        success: true,
        agent: agent,
        credentials: {
          email: email.trim(),
          password: generatedPassword
        },
        message: "Agente creado exitosamente"
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error in create-agent-user function:", error);
    return new Response(
      JSON.stringify({ error: `Error interno del servidor: ${error.message}` }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);