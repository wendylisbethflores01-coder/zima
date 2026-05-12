import Header from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Phone, Mail, User, Loader2, Eye } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { useAgents } from "@/hooks/useAgents";
import { supabase } from "@/integrations/supabase/client";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

const Asesores = () => {
  const { data: agents, isLoading, error } = useAgents();
  const navigate = useNavigate();

  // Build avatar URLs from storage
  const agentsWithAvatars = useMemo(() => {
    if (!agents) return [];
    return agents.map((agent) => {
      const avatarPath = `${agent.id}/avatar.jpg`;
      const { data: avatarData } = supabase.storage
        .from("agents")
        .getPublicUrl(avatarPath);
      return {
        ...agent,
        avatarUrl: avatarData.publicUrl,
      };
    });
  }, [agents]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-destructive mb-4">
              Error al cargar asesores
            </h1>
            <p className="text-muted-foreground">
              Por favor, intenta nuevamente más tarde.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Nuestros <span className="text-primary">Asesores</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Conoce a nuestro equipo de expertos en bienes raíces. Profesionales
            calificados listos para ayudarte a encontrar la propiedad perfecta o
            vender la tuya.
          </p>
        </div>

        {/* Advisors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {agentsWithAvatars?.map((agent) => (
            <Card key={agent.id} className="hover-lift group overflow-hidden">
              <CardContent className="p-0">
                {/* Top section with background gradient */}
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-8 text-center">
                  <Avatar className="w-24 h-24 mx-auto mb-4 ring-4 ring-white/20">
                    <AvatarImage src={agent.avatarUrl} alt={agent.name} />
                    <AvatarFallback className="text-lg">
                      <User className="w-8 h-8" />
                    </AvatarFallback>
                  </Avatar>

                  <h3 className="text-xl font-bold mb-2">{agent.name}</h3>
                  <p className="text-primary font-medium mb-3">
                    Asesor Inmobiliario
                  </p>
                </div>

                {/* Bottom section with contact info */}
                <div className="p-6">
                  <p className="text-sm text-muted-foreground mb-6">
                    Profesional especializado en bienes raíces, comprometido con
                    brindar el mejor servicio para ayudarte a encontrar la
                    propiedad ideal.
                  </p>

                  {(agent.phone ||
                    agent.email ||
                    (agent.whatsapp && agent.whatsapp.includes("wa.me/"))) && (
                    <div className="flex gap-2 mb-4">
                      {agent.phone && (
                        <Button
                          className="flex-1"
                          onClick={() =>
                            window.open(`tel:${agent.phone}`, "_self")
                          }
                        >
                          <Phone className="w-4 h-4 mr-2" />
                          Llamar
                        </Button>
                      )}
                      {agent.whatsapp && agent.whatsapp.includes("wa.me/") && (
                        <Button
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          onClick={() =>
                            window.open(
                              agent.whatsapp.startsWith("http")
                                ? agent.whatsapp
                                : `https://${agent.whatsapp}`,
                              "_blank"
                            )
                          }
                        >
                          <FaWhatsapp className="w-4 h-4 mr-2" />
                          WhatsApp
                        </Button>
                      )}
                      {agent.email && (
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() =>
                            window.open(`mailto:${agent.email}`, "_self")
                          }
                        >
                          <Mail className="w-4 h-4 mr-2" />
                          Email
                        </Button>
                      )}
                    </div>
                  )}

                  {/* Ver propiedades button */}
                  <div className="mb-4">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() =>
                        navigate(`/propiedades?agentId=${agent.id}`)
                      }
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Ver propiedades
                    </Button>
                  </div>

                  <div className="pt-4 border-t text-center space-y-1">
                    {agent.phone && (
                      <p className="text-sm text-muted-foreground">
                        📞 {agent.phone}
                      </p>
                    )}
                    {agent.whatsapp && agent.whatsapp.includes("wa.me/") && (
                      <p className="text-sm text-muted-foreground">
                        💬 WhatsApp
                      </p>
                    )}
                    {agent.email && (
                      <p className="text-sm text-muted-foreground">
                        ✉️ {agent.email}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contact CTA Section */}
        <div className="mt-16 text-center bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl p-12">
          <h2 className="text-3xl font-bold mb-4">
            ¿Necesitas Ayuda Personalizada?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Nuestros asesores están disponibles para brindarte atención
            personalizada. Contacta directamente al especialista que mejor se
            adapte a tus necesidades.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="btn-hero">
              <Phone className="w-5 h-5 mr-2" />
              Llamar Ahora: +51 1 234-5678
            </Button>
            <Button size="lg" variant="outline">
              <Mail className="w-5 h-5 mr-2" />
              contacto@zimagestioninmobiliaria.com
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Asesores;
