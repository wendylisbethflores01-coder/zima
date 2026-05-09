import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Edit, Eye, Building2, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ProposeChangeModal } from "@/components/ProposeChangeModal";
import { ChangeRequestsList } from "@/components/ChangeRequestsList";
import EditPropertyModal from "@/components/EditPropertyModal";

const AgentEditProperties = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedPropertyForChange, setSelectedPropertyForChange] =
    useState<any>(null);
  const [proposeChangeModalOpen, setProposeChangeModalOpen] = useState(false);
  const [selectedPropertyForEdit, setSelectedPropertyForEdit] =
    useState<any>(null);
  const [editPropertyModalOpen, setEditPropertyModalOpen] = useState(false);

  // Fetch agent data
  const { data: agent } = useQuery({
    queryKey: ["agent", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("agents")
        .select("*")
        .eq("user_id", user.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch ALL properties (own properties first)
  const { data: allProperties, isLoading: allPropertiesLoading } = useQuery({
    queryKey: ["all-properties-for-edit"],
    queryFn: async () => {
      if (!agent) return [];

      const { data, error } = await supabase
        .from("properties")
        .select("*, is_approved, agents(name, id), property_code")
        .eq("is_active", true)
        .eq("is_approved", true)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Sort: own properties first
      return data.sort((a, b) => {
        if (a.agent_id === agent.id && b.agent_id !== agent.id) return -1;
        if (a.agent_id !== agent.id && b.agent_id === agent.id) return 1;
        return 0;
      });
    },
    enabled: !!agent,
  });

  const ownProperties =
    allProperties?.filter((p) => p.agent_id === agent?.id) || [];
  const otherProperties =
    allProperties?.filter((p) => p.agent_id !== agent?.id) || [];

  if (!agent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/agent-dashboard")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al Dashboard
            </Button>
            <h1 className="text-2xl font-bold">Editar Propiedades</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="all-properties" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="all-properties">
              <Building2 className="w-4 h-4 mr-2" />
              Todas las Propiedades
            </TabsTrigger>
            <TabsTrigger value="my-requests">
              <FileText className="w-4 h-4 mr-2" />
              Mis Solicitudes
            </TabsTrigger>
          </TabsList>

          {/* All Properties Tab */}
          <TabsContent value="all-properties" className="space-y-6 mt-6">
            {/* Own Properties Section */}
            <Card>
              <CardHeader>
                <CardTitle>Mis Propiedades ({ownProperties.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {ownProperties.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No tienes propiedades activas
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {ownProperties.map((property) => (
                      <Card
                        key={property.id}
                        className="hover:shadow-lg transition-shadow border-primary"
                      >
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold text-sm line-clamp-1">
                              {property.title}
                            </h3>
                            <Badge variant="default" className="ml-2">
                              Mía
                            </Badge>
                          </div>

                          <p className="text-xs text-muted-foreground mb-2">
                            {property.city}, {property.district}
                          </p>

                          <div className="flex justify-between items-center mb-3">
                            <p className="font-bold text-sm">
                              {property.currency === "USD" ? "$" : "S/"}{" "}
                              {property.price?.toLocaleString()}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {property.area}m²
                            </p>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                navigate(`/propiedad/${property.property_code}`)
                              }
                              className="flex-1"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Ver
                            </Button>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => {
                                setSelectedPropertyForEdit({
                                  id: property.id,
                                  title: property.title,
                                  type: property.property_type,
                                  price: property.price,
                                  currency: property.currency,
                                  location: `${property.district}, ${
                                    property.city
                                  }${
                                    property.province
                                      ? ", " + property.province
                                      : ""
                                  }`,
                                  bedrooms: property.bedrooms,
                                  bathrooms: property.bathrooms,
                                  parking: property.parking,
                                  area: property.area?.toString(),
                                  builtArea: property.built_area?.toString(),
                                  description: property.description,
                                  age: property.age,
                                  agent: property.agents
                                    ? {
                                        id: property.agents.id,
                                        name: property.agents.name,
                                      }
                                    : undefined,
                                  status: property.is_active
                                    ? "active"
                                    : "inactive",
                                });
                                setEditPropertyModalOpen(true);
                              }}
                              className="flex-1"
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Editar
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Other Agents' Properties Section */}
            <Card>
              <CardHeader>
                <CardTitle>
                  Propiedades de Otros Agentes ({otherProperties.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {allPropertiesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : otherProperties.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No hay propiedades de otros agentes disponibles
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {otherProperties.map((property) => (
                      <Card
                        key={property.id}
                        className="hover:shadow-lg transition-shadow"
                      >
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold text-sm line-clamp-1">
                              {property.title}
                            </h3>
                            <Badge variant="secondary" className="ml-2 text-xs">
                              {property.agents?.name}
                            </Badge>
                          </div>

                          <p className="text-xs text-muted-foreground mb-2">
                            {property.city}, {property.district}
                          </p>

                          <div className="flex justify-between items-center mb-3">
                            <p className="font-bold text-sm">
                              {property.currency === "USD" ? "$" : "S/"}{" "}
                              {property.price?.toLocaleString()}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {property.area}m²
                            </p>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                navigate(`/propiedad/${property.property_code}`)
                              }
                              className="flex-1"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Ver
                            </Button>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => {
                                setSelectedPropertyForChange(property);
                                setProposeChangeModalOpen(true);
                              }}
                              className="flex-1"
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Proponer
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* My Requests Tab */}
          <TabsContent value="my-requests" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Mis Solicitudes de Cambio</CardTitle>
              </CardHeader>
              <CardContent>
                {agent?.id ? (
                  <ChangeRequestsList agentId={agent.id} />
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      Cargando solicitudes...
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Propose Change Modal */}
      {selectedPropertyForChange && agent?.id && (
        <ProposeChangeModal
          property={selectedPropertyForChange}
          agentId={agent.id}
          open={proposeChangeModalOpen}
          onOpenChange={setProposeChangeModalOpen}
        />
      )}

      {/* Edit Property Modal */}
      {selectedPropertyForEdit && (
        <EditPropertyModal
          property={selectedPropertyForEdit}
          open={editPropertyModalOpen}
          onOpenChange={setEditPropertyModalOpen}
        />
      )}
    </div>
  );
};

export default AgentEditProperties;
