import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LogOut,
  User,
  Home,
  Mail,
  Phone,
  LayoutGrid,
  List,
  DollarSign,
  TrendingUp,
  Calendar,
  FileCheck,
  Edit,
  Plus,
  Download,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useState, useMemo } from "react";
import { RegisterTransactionModal } from "@/components/RegisterTransactionModal";
import CreatePropertyForm from "@/components/CreatePropertyForm";
import { Switch } from "@/components/ui/switch";
import { useTogglePropertyStatus } from "@/hooks/useTogglePropertyStatus";
import { AgentAvatarUploader } from "@/components/AgentAvatarUploader";
import { EditAgentInfoModal } from "@/components/EditAgentInfoModal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const AgentDashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [saleModalOpen, setSaleModalOpen] = useState(false);
  const [editInfoModalOpen, setEditInfoModalOpen] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [selectedPropertyForReport, setSelectedPropertyForReport] = useState<
    string | null
  >(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const { togglePropertyStatus, isUpdating } = useTogglePropertyStatus();

  // Fetch agent data
  const { data: agent, isLoading: agentLoading } = useQuery({
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

  // Fetch agent's properties (both active and inactive)
  const { data: properties, isLoading: propertiesLoading } = useQuery({
    queryKey: ["agent-properties", agent?.id],
    queryFn: async () => {
      if (!agent) return [];

      const { data, error } = await supabase
        .from("properties")
        .select("*, is_approved")
        .eq("agent_id", agent.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!agent,
  });

  // Fetch agent's pending change requests count for badge
  const { data: changeRequestsCount } = useQuery({
    queryKey: ["agent-change-requests-count", agent?.id],
    queryFn: async () => {
      if (!agent) return 0;
      const { count, error } = await supabase
        .from("property_change_requests")
        .select("*", { count: "exact", head: true })
        .eq("requested_by_agent_id", agent.id)
        .eq("status", "pending");
      if (error) throw error;
      return count || 0;
    },
    enabled: !!agent,
  });

  // Fetch sales data
  const { data: sales } = useQuery({
    queryKey: ["agent-sales", agent?.id],
    queryFn: async () => {
      if (!agent) return [];

      const { data, error } = await supabase
        .from("sales")
        .select("*")
        .eq("agent_id", agent.id)
        .order("sale_date", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!agent,
  });

  // Fetch rental contracts data
  const { data: rentals } = useQuery({
    queryKey: ["agent-rentals", agent?.id],
    queryFn: async () => {
      if (!agent) return [];

      const { data, error } = await supabase
        .from("rental_contracts")
        .select("*")
        .eq("agent_id", agent.id)
        .order("contract_start_date", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!agent,
  });

  // Filter properties by status and transactions
  const availableProperties = useMemo(
    () => properties?.filter((p) => p.is_active) || [],
    [properties],
  );

  // Get property IDs that have been sold or rented
  const soldPropertyIds = useMemo(
    () => new Set(sales?.map((s) => s.property_id) || []),
    [sales],
  );

  const rentedPropertyIds = useMemo(
    () => new Set(rentals?.map((r) => r.property_id) || []),
    [rentals],
  );

  // Properties that are inactive and have transactions
  const soldRentedProperties = useMemo(
    () =>
      properties?.filter(
        (p) =>
          !p.is_active &&
          (soldPropertyIds.has(p.id) || rentedPropertyIds.has(p.id)),
      ) || [],
    [properties, soldPropertyIds, rentedPropertyIds],
  );

  // Properties that are inactive but don't have transactions (manually deactivated)
  const inactiveProperties = useMemo(
    () =>
      properties?.filter(
        (p) =>
          !p.is_active &&
          !soldPropertyIds.has(p.id) &&
          !rentedPropertyIds.has(p.id) &&
          p.is_approved, // Only show approved inactive properties
      ) || [],
    [properties, soldPropertyIds, rentedPropertyIds],
  );

  // Properties that are pending approval (is_approved = false)
  const pendingApprovalProperties = useMemo(
    () => properties?.filter((p) => !p.is_approved) || [],
    [properties],
  );

  const metrics = useMemo(() => {
    const totalSales = sales?.length || 0;
    const activeRentals =
      rentals?.filter((r) => r.contract_status === "active").length || 0;
    const totalProperties = properties?.length || 0;
    const conversionRate =
      totalProperties > 0
        ? (
            ((totalSales + (rentals?.length || 0)) / totalProperties) *
            100
          ).toFixed(1)
        : "0";

    // Get last transaction date
    const lastSaleDate = sales?.[0]?.sale_date;
    const lastRentalDate = rentals?.[0]?.contract_start_date;
    let lastTransactionDate = null;

    if (lastSaleDate && lastRentalDate) {
      lastTransactionDate =
        new Date(lastSaleDate) > new Date(lastRentalDate)
          ? lastSaleDate
          : lastRentalDate;
    } else {
      lastTransactionDate = lastSaleDate || lastRentalDate;
    }

    return {
      totalSales,
      activeRentals,
      conversionRate,
      lastTransactionDate,
    };
  }, [sales, rentals, properties]);

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast.error("Error al cerrar sesión");
    } else {
      toast.success("Sesión cerrada exitosamente");
      navigate("/");
    }
  };

  const handleOpenSaleModal = (property) => {
    setSelectedProperty(property);
    setSaleModalOpen(true);
  };

  const handleDownloadReport = async (
    orientation: "vertical" | "horizontal",
  ) => {
    if (!selectedPropertyForReport) return;

    setIsDownloading(true);
    try {
      // Hacer la petición HTTP directamente para obtener el PDF como blob
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const response = await fetch(
        `https://nuujznowhmawcvcskzcb.supabase.co/functions/v1/download-report`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({
            propertyId: selectedPropertyForReport,
            orientation: orientation,
            userId: user?.id,
          }),
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al generar el reporte");
      }

      // Obtener el PDF como blob
      const blob = await response.blob();

      // Crear URL y descargar
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `propiedad-${selectedPropertyForReport}-${orientation}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(`Reporte ${orientation} descargado exitosamente`);
      setReportDialogOpen(false);
    } catch (error: unknown) {
      console.error("Error downloading report:", error);
      toast.error(
        "Error al generar el reporte: " +
          ((error as Error).message || "Error desconocido"),
      );
    } finally {
      setIsDownloading(false);
    }
  };

  // Get avatar URL from storage
  const avatarUrl = useMemo(() => {
    if (!agent?.id) return null;
    const { data } = supabase.storage
      .from("agents")
      .getPublicUrl(`${agent.id}/avatar.jpg`);
    return data.publicUrl;
  }, [agent?.id]);

  if (agentLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Acceso Denegado</CardTitle>
            <CardDescription>
              No tienes permisos para acceder a este panel.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/")} className="w-full">
              Volver al Inicio
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Panel de Agente</h1>
          <Button
            variant="outline"
            onClick={handleSignOut}
            className="flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Agent Profile */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Mi Perfil
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditInfoModalOpen(true)}
                    className="flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Editar
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <AgentAvatarUploader
                    agentId={agent.id}
                    userId={user?.id || ""}
                    avatarUrl={avatarUrl}
                    agentName={agent.name}
                  />
                  <div>
                    <h3 className="font-semibold text-lg">{agent.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Estado:{" "}
                      {agent.invitation_status === "accepted"
                        ? "Activo"
                        : "Pendiente"}
                    </p>
                  </div>
                </div>

                {agent.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4" />
                    <span>{agent.email}</span>
                  </div>
                )}

                {agent.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4" />
                    <span>{agent.phone}</span>
                  </div>
                )}

                {agent.whatsapp && agent.whatsapp.includes("wa.me/") && (
                  <div className="flex items-center gap-2 text-sm">
                    <FaWhatsapp className="w-4 h-4 text-green-600" />
                    <span>WhatsApp</span>
                    <div className="ml-auto">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Metrics Card */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Métricas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">
                        Ventas Totales
                      </span>
                    </div>
                    <span className="text-lg font-bold">
                      {metrics.totalSales}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">
                        Contratos Activos
                      </span>
                    </div>
                    <span className="text-lg font-bold">
                      {metrics.activeRentals}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">
                        Tasa de Conversión
                      </span>
                    </div>
                    <span className="text-lg font-bold">
                      {metrics.conversionRate}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">
                        Última Transacción
                      </span>
                    </div>
                    <span className="text-sm font-semibold">
                      {metrics.lastTransactionDate
                        ? new Date(
                            metrics.lastTransactionDate,
                          ).toLocaleDateString("es-ES", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "Sin transacciones"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Properties */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Home className="w-5 h-5" />
                      Mis Propiedades ({properties?.length || 0})
                    </CardTitle>
                    <CardDescription>
                      Propiedades asignadas a tu gestión
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      onClick={() => navigate("/agent/edit-properties")}
                      className="flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Editar Propiedades
                      {changeRequestsCount > 0 && (
                        <span className="ml-1 px-2 py-0.5 bg-primary text-primary-foreground text-xs rounded-full">
                          {changeRequestsCount}
                        </span>
                      )}
                    </Button>
                    <CreatePropertyForm
                      fixedAgentId={agent?.id}
                      fixedAgentName={agent?.name}
                    />
                    <div className="flex gap-1 border rounded-md p-1">
                      <Button
                        variant={viewMode === "grid" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("grid")}
                        className="px-3"
                      >
                        <LayoutGrid className="w-4 h-4" />
                      </Button>
                      <Button
                        variant={viewMode === "list" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("list")}
                        className="px-3"
                      >
                        <List className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="available" className="w-full">
                  <TabsList className="grid w-full grid-cols-4 mb-4">
                    <TabsTrigger value="available">
                      Disponibles ({availableProperties.length})
                    </TabsTrigger>
                    <TabsTrigger value="inactive">
                      Inactivas ({inactiveProperties.length})
                    </TabsTrigger>
                    <TabsTrigger value="pending">
                      Pendientes ({pendingApprovalProperties.length})
                    </TabsTrigger>
                    <TabsTrigger value="sold-rented">
                      Vendidas/Alquiladas ({soldRentedProperties.length})
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="available">
                    {propertiesLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    ) : availableProperties.length > 0 ? (
                      viewMode === "grid" ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {availableProperties.map((property) => (
                            <Card
                              key={property.id}
                              className="hover:shadow-lg transition-shadow"
                            >
                              <CardContent className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                  <h3 className="font-semibold text-lg">
                                    {property.title}
                                  </h3>
                                  <Badge variant="outline">
                                    {property.property_type}
                                  </Badge>
                                </div>

                                <p className="text-sm text-muted-foreground mb-2">
                                  {property.city}, {property.district}
                                </p>

                                <div className="flex justify-between items-center mb-3">
                                  <div>
                                    <p className="font-bold text-lg">
                                      {property.currency === "USD" ? "$" : "S/"}{" "}
                                      {property.price?.toLocaleString()}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm">
                                      {property.area}m² total
                                    </p>
                                    {property.built_area && (
                                      <p className="text-sm text-muted-foreground">
                                        {property.built_area}m² construidos
                                      </p>
                                    )}
                                  </div>
                                </div>

                                {(property.bedrooms ||
                                  property.bathrooms ||
                                  property.parking) && (
                                  <div className="flex gap-4 text-sm text-muted-foreground mb-3">
                                    {property.bedrooms && (
                                      <span>
                                        {property.bedrooms} dormitorios
                                      </span>
                                    )}
                                    {property.bathrooms && (
                                      <span>{property.bathrooms} baños</span>
                                    )}
                                    {property.parking && (
                                      <span>
                                        {property.parking} estacionamientos
                                      </span>
                                    )}
                                  </div>
                                )}

                                <div className="flex items-center justify-between mb-3 p-3 rounded-lg bg-muted/30">
                                  <span className="text-sm font-medium">
                                    Estado de la propiedad
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm text-muted-foreground">
                                      {property.is_active
                                        ? "Activa"
                                        : "Inactiva"}
                                    </span>
                                    <Switch
                                      checked={property.is_active}
                                      onCheckedChange={() =>
                                        togglePropertyStatus(
                                          property.property_code,
                                          property.is_active,
                                        )
                                      }
                                      disabled={isUpdating}
                                    />
                                  </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                  <Button
                                    onClick={() =>
                                      handleOpenSaleModal(property)
                                    }
                                    className="w-full"
                                    size="sm"
                                  >
                                    <DollarSign className="w-4 h-4 mr-2" />
                                    {property.transaction_type === "alquiler"
                                      ? "Registrar Alquiler"
                                      : "Registrar Venta"}
                                  </Button>
                                  {/* <Button
                                    onClick={() => {
                                      setSelectedPropertyForReport(property.id);
                                      setReportDialogOpen(true);
                                    }}
                                    variant="outline"
                                    className="w-full"
                                    size="sm"
                                  >
                                    <Download className="w-4 h-4 mr-2" />
                                    Descargar Reporte
                                  </Button> */}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {availableProperties.map((property) => (
                            <Card
                              key={property.id}
                              className="hover:shadow-md transition-shadow"
                            >
                              <CardContent className="p-4">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                  <div className="flex-1">
                                    <div className="flex items-start gap-2 mb-2">
                                      <h3 className="font-semibold text-lg">
                                        {property.title}
                                      </h3>
                                      <Badge variant="outline">
                                        {property.property_type}
                                      </Badge>
                                    </div>

                                    <p className="text-sm text-muted-foreground mb-2">
                                      {property.city}, {property.district}
                                    </p>

                                    {(property.bedrooms ||
                                      property.bathrooms ||
                                      property.parking) && (
                                      <div className="flex gap-4 text-sm text-muted-foreground">
                                        {property.bedrooms && (
                                          <span>
                                            {property.bedrooms} dormitorios
                                          </span>
                                        )}
                                        {property.bathrooms && (
                                          <span>
                                            {property.bathrooms} baños
                                          </span>
                                        )}
                                        {property.parking && (
                                          <span>
                                            {property.parking} estacionamientos
                                          </span>
                                        )}
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-6">
                                    <div>
                                      <p className="text-sm text-muted-foreground">
                                        Área
                                      </p>
                                      <p className="font-semibold">
                                        {property.area}m²
                                      </p>
                                      {property.built_area && (
                                        <p className="text-xs text-muted-foreground">
                                          {property.built_area}m² construidos
                                        </p>
                                      )}
                                    </div>

                                    <div className="text-right">
                                      <p className="font-bold text-lg">
                                        {property.currency === "USD"
                                          ? "$"
                                          : "S/"}{" "}
                                        {property.price?.toLocaleString()}
                                      </p>
                                    </div>

                                    <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                                      <span className="text-sm font-medium">
                                        {property.is_active
                                          ? "Activa"
                                          : "Inactiva"}
                                      </span>
                                      <Switch
                                        checked={property.is_active}
                                        onCheckedChange={() =>
                                          togglePropertyStatus(
                                            property.property_code,
                                            property.is_active,
                                          )
                                        }
                                        disabled={isUpdating}
                                      />
                                    </div>

                                    <div className="flex items-center gap-2">
                                      <Button
                                        onClick={() =>
                                          handleOpenSaleModal(property)
                                        }
                                        size="sm"
                                      >
                                        <DollarSign className="w-4 h-4 mr-2" />
                                        {property.transaction_type ===
                                        "alquiler"
                                          ? "Registrar Alquiler"
                                          : "Registrar Venta"}
                                      </Button>
                                      {/* <Button
                                        onClick={() => {
                                          setSelectedPropertyForReport(
                                            property.id,
                                          );
                                          setReportDialogOpen(true);
                                        }}
                                        variant="outline"
                                        size="sm"
                                      >
                                        <Download className="w-4 h-4 mr-2" />
                                        Reporte
                                      </Button> */}
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )
                    ) : (
                      <div className="text-center py-8">
                        <Home className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          No tienes propiedades disponibles.
                        </p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="inactive">
                    {propertiesLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    ) : inactiveProperties.length > 0 ? (
                      viewMode === "grid" ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {inactiveProperties.map((property) => (
                            <Card
                              key={property.id}
                              className="hover:shadow-lg transition-shadow"
                            >
                              <CardContent className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                  <h3 className="font-semibold text-lg">
                                    {property.title}
                                  </h3>
                                  <Badge variant="secondary">
                                    {property.property_type}
                                  </Badge>
                                </div>

                                <p className="text-sm text-muted-foreground mb-2">
                                  {property.city}, {property.district}
                                </p>

                                <div className="flex justify-between items-center mb-3">
                                  <div>
                                    <p className="font-bold text-lg">
                                      {property.currency === "USD" ? "$" : "S/"}{" "}
                                      {property.price?.toLocaleString()}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm">
                                      {property.area}m² total
                                    </p>
                                    {property.built_area && (
                                      <p className="text-sm text-muted-foreground">
                                        {property.built_area}m² construidos
                                      </p>
                                    )}
                                  </div>
                                </div>

                                {(property.bedrooms ||
                                  property.bathrooms ||
                                  property.parking) && (
                                  <div className="flex gap-4 text-sm text-muted-foreground mb-3">
                                    {property.bedrooms && (
                                      <span>
                                        {property.bedrooms} dormitorios
                                      </span>
                                    )}
                                    {property.bathrooms && (
                                      <span>{property.bathrooms} baños</span>
                                    )}
                                    {property.parking && (
                                      <span>
                                        {property.parking} estacionamientos
                                      </span>
                                    )}
                                  </div>
                                )}

                                <div className="flex flex-col gap-2">
                                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                                    <span className="text-sm font-medium">
                                      Reactivar propiedad
                                    </span>
                                    <Switch
                                      checked={property.is_active}
                                      onCheckedChange={() =>
                                        togglePropertyStatus(
                                          property.property_code,
                                          property.is_active,
                                        )
                                      }
                                      disabled={isUpdating}
                                    />
                                  </div>
                                  {/* <Button
                                    onClick={() => {
                                      setSelectedPropertyForReport(property.id);
                                      setReportDialogOpen(true);
                                    }}
                                    variant="outline"
                                    className="w-full"
                                    size="sm"
                                  >
                                    <Download className="w-4 h-4 mr-2" />
                                    Descargar Reporte
                                  </Button> */}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {inactiveProperties.map((property) => (
                            <Card
                              key={property.id}
                              className="hover:shadow-md transition-shadow"
                            >
                              <CardContent className="p-4">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                  <div className="flex-1">
                                    <div className="flex items-start gap-2 mb-2">
                                      <h3 className="font-semibold text-lg">
                                        {property.title}
                                      </h3>
                                      <Badge variant="secondary">
                                        {property.property_type}
                                      </Badge>
                                    </div>

                                    <p className="text-sm text-muted-foreground mb-2">
                                      {property.city}, {property.district}
                                    </p>

                                    {(property.bedrooms ||
                                      property.bathrooms ||
                                      property.parking) && (
                                      <div className="flex gap-4 text-sm text-muted-foreground">
                                        {property.bedrooms && (
                                          <span>
                                            {property.bedrooms} dormitorios
                                          </span>
                                        )}
                                        {property.bathrooms && (
                                          <span>
                                            {property.bathrooms} baños
                                          </span>
                                        )}
                                        {property.parking && (
                                          <span>
                                            {property.parking} estacionamientos
                                          </span>
                                        )}
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-6">
                                    <div>
                                      <p className="text-sm text-muted-foreground">
                                        Área
                                      </p>
                                      <p className="font-semibold">
                                        {property.area}m²
                                      </p>
                                      {property.built_area && (
                                        <p className="text-xs text-muted-foreground">
                                          {property.built_area}m² construidos
                                        </p>
                                      )}
                                    </div>

                                    <div className="text-right">
                                      <p className="font-bold text-lg">
                                        {property.currency === "USD"
                                          ? "$"
                                          : "S/"}{" "}
                                        {property.price?.toLocaleString()}
                                      </p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                      <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                                        <span className="text-sm font-medium">
                                          Reactivar
                                        </span>
                                        <Switch
                                          checked={property.is_active}
                                          onCheckedChange={() =>
                                            togglePropertyStatus(
                                              property.property_code,
                                              property.is_active,
                                            )
                                          }
                                          disabled={isUpdating}
                                        />
                                      </div>
                                      {/* <Button
                                        onClick={() => {
                                          setSelectedPropertyForReport(
                                            property.id,
                                          );
                                          setReportDialogOpen(true);
                                        }}
                                        variant="outline"
                                        size="sm"
                                      >
                                        <Download className="w-4 h-4 mr-2" />
                                        Reporte
                                      </Button> */}
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )
                    ) : (
                      <div className="text-center py-8">
                        <Home className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          No tienes propiedades inactivas.
                        </p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="pending">
                    {propertiesLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    ) : pendingApprovalProperties.length > 0 ? (
                      viewMode === "grid" ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {pendingApprovalProperties.map((property) => (
                            <Card
                              key={property.id}
                              className="hover:shadow-lg transition-shadow"
                            >
                              <CardContent className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                  <h3 className="font-semibold text-lg">
                                    {property.title}
                                  </h3>
                                  <div className="flex gap-2">
                                    <Badge variant="secondary">
                                      {property.property_type}
                                    </Badge>
                                  </div>
                                </div>

                                <p className="text-sm text-muted-foreground mb-2">
                                  {property.city}, {property.district}
                                </p>

                                <div className="flex justify-between items-center mb-3">
                                  <div>
                                    <p className="font-bold text-lg">
                                      {property.currency === "USD" ? "$" : "S/"}{" "}
                                      {property.price?.toLocaleString()}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm">
                                      {property.area}m² total
                                    </p>
                                    {property.built_area && (
                                      <p className="text-sm text-muted-foreground">
                                        {property.built_area}m² construidos
                                      </p>
                                    )}
                                  </div>
                                </div>

                                {(property.bedrooms ||
                                  property.bathrooms ||
                                  property.parking) && (
                                  <div className="flex gap-4 text-sm text-muted-foreground mb-3">
                                    {property.bedrooms && (
                                      <span>
                                        {property.bedrooms} dormitorios
                                      </span>
                                    )}
                                    {property.bathrooms && (
                                      <span>{property.bathrooms} baños</span>
                                    )}
                                    {property.parking && (
                                      <span>
                                        {property.parking} estacionamientos
                                      </span>
                                    )}
                                  </div>
                                )}

                                <div className="flex flex-col gap-2">
                                  <div className="flex items-center justify-center p-3 rounded-lg bg-yellow-50 text-yellow-700">
                                    <span className="text-sm font-medium">
                                      Esta propiedad está siendo revisada por el
                                      administrador
                                    </span>
                                  </div>
                                  {/* <Button
                                    onClick={() => {
                                      setSelectedPropertyForReport(property.id);
                                      setReportDialogOpen(true);
                                    }}
                                    variant="outline"
                                    className="w-full"
                                    size="sm"
                                  >
                                    <Download className="w-4 h-4 mr-2" />
                                    Descargar Reporte
                                  </Button> */}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {pendingApprovalProperties.map((property) => (
                            <Card
                              key={property.id}
                              className="hover:shadow-md transition-shadow"
                            >
                              <CardContent className="p-4">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                  <div className="flex-1">
                                    <div className="flex items-start gap-2 mb-2">
                                      <h3 className="font-semibold text-lg">
                                        {property.title}
                                      </h3>
                                      <Badge variant="secondary">
                                        {property.property_type}
                                      </Badge>
                                      <Badge
                                        variant="outline"
                                        className="bg-yellow-50 text-yellow-700 border-yellow-200"
                                      >
                                        Pendiente de Aprobación
                                      </Badge>
                                    </div>

                                    <p className="text-sm text-muted-foreground mb-2">
                                      {property.city}, {property.district}
                                    </p>

                                    {(property.bedrooms ||
                                      property.bathrooms ||
                                      property.parking) && (
                                      <div className="flex gap-4 text-sm text-muted-foreground">
                                        {property.bedrooms && (
                                          <span>
                                            {property.bedrooms} dormitorios
                                          </span>
                                        )}
                                        {property.bathrooms && (
                                          <span>
                                            {property.bathrooms} baños
                                          </span>
                                        )}
                                        {property.parking && (
                                          <span>
                                            {property.parking} estacionamientos
                                          </span>
                                        )}
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-6">
                                    <div>
                                      <p className="text-sm text-muted-foreground">
                                        Área
                                      </p>
                                      <p className="font-semibold">
                                        {property.area}m²
                                      </p>
                                      {property.built_area && (
                                        <p className="text-xs text-muted-foreground">
                                          {property.built_area}m² construidos
                                        </p>
                                      )}
                                    </div>

                                    <div className="text-right">
                                      <p className="font-bold text-lg">
                                        {property.currency === "USD"
                                          ? "$"
                                          : "S/"}{" "}
                                        {property.price?.toLocaleString()}
                                      </p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                      <div className="flex items-center p-2 rounded-lg bg-yellow-50 text-yellow-700">
                                        <span className="text-sm font-medium">
                                          En revisión
                                        </span>
                                      </div>
                                      {/* <Button
                                        onClick={() => {
                                          setSelectedPropertyForReport(
                                            property.id,
                                          );
                                          setReportDialogOpen(true);
                                        }}
                                        variant="outline"
                                        size="sm"
                                      >
                                        <Download className="w-4 h-4 mr-2" />
                                        Reporte
                                      </Button> */}
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )
                    ) : (
                      <div className="text-center py-8">
                        <Home className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          No hay propiedades pendientes de aprobación.
                        </p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="sold-rented">
                    {propertiesLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    ) : soldRentedProperties.length > 0 ? (
                      viewMode === "grid" ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {soldRentedProperties.map((property) => (
                            <Card
                              key={property.id}
                              className="hover:shadow-lg transition-shadow opacity-75"
                            >
                              <CardContent className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                  <h3 className="font-semibold text-lg">
                                    {property.title}
                                  </h3>
                                  <Badge variant="secondary">
                                    {property.property_type}
                                  </Badge>
                                </div>

                                <p className="text-sm text-muted-foreground mb-2">
                                  {property.city}, {property.district}
                                </p>

                                <div className="flex justify-between items-center mb-3">
                                  <div>
                                    <p className="font-bold text-lg">
                                      {property.currency === "USD" ? "$" : "S/"}{" "}
                                      {property.price?.toLocaleString()}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm">
                                      {property.area}m² total
                                    </p>
                                    {property.built_area && (
                                      <p className="text-sm text-muted-foreground">
                                        {property.built_area}m² construidos
                                      </p>
                                    )}
                                  </div>
                                </div>

                                {(property.bedrooms ||
                                  property.bathrooms ||
                                  property.parking) && (
                                  <div className="flex gap-4 text-sm text-muted-foreground mb-3">
                                    {property.bedrooms && (
                                      <span>
                                        {property.bedrooms} dormitorios
                                      </span>
                                    )}
                                    {property.bathrooms && (
                                      <span>{property.bathrooms} baños</span>
                                    )}
                                    {property.parking && (
                                      <span>
                                        {property.parking} estacionamientos
                                      </span>
                                    )}
                                  </div>
                                )}

                                <div className="flex flex-col gap-2">
                                  <Badge
                                    className="w-full justify-center"
                                    variant="outline"
                                  >
                                    {property.transaction_type === "alquiler"
                                      ? "Alquilada"
                                      : "Vendida"}
                                  </Badge>
                                  {/* <Button
                                    onClick={() => {
                                      setSelectedPropertyForReport(property.id);
                                      setReportDialogOpen(true);
                                    }}
                                    variant="outline"
                                    className="w-full"
                                    size="sm"
                                  >
                                    <Download className="w-4 h-4 mr-2" />
                                    Descargar Reporte
                                  </Button> */}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {soldRentedProperties.map((property) => (
                            <Card
                              key={property.id}
                              className="hover:shadow-md transition-shadow opacity-75"
                            >
                              <CardContent className="p-4">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                  <div className="flex-1">
                                    <div className="flex items-start gap-2 mb-2">
                                      <h3 className="font-semibold text-lg">
                                        {property.title}
                                      </h3>
                                      <Badge variant="secondary">
                                        {property.property_type}
                                      </Badge>
                                    </div>

                                    <p className="text-sm text-muted-foreground mb-2">
                                      {property.city}, {property.district}
                                    </p>

                                    {(property.bedrooms ||
                                      property.bathrooms ||
                                      property.parking) && (
                                      <div className="flex gap-4 text-sm text-muted-foreground">
                                        {property.bedrooms && (
                                          <span>
                                            {property.bedrooms} dormitorios
                                          </span>
                                        )}
                                        {property.bathrooms && (
                                          <span>
                                            {property.bathrooms} baños
                                          </span>
                                        )}
                                        {property.parking && (
                                          <span>
                                            {property.parking} estacionamientos
                                          </span>
                                        )}
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-6">
                                    <div>
                                      <p className="text-sm text-muted-foreground">
                                        Área
                                      </p>
                                      <p className="font-semibold">
                                        {property.area}m²
                                      </p>
                                      {property.built_area && (
                                        <p className="text-xs text-muted-foreground">
                                          {property.built_area}m² construidos
                                        </p>
                                      )}
                                    </div>

                                    <div className="text-right">
                                      <p className="font-bold text-lg">
                                        {property.currency === "USD"
                                          ? "$"
                                          : "S/"}{" "}
                                        {property.price?.toLocaleString()}
                                      </p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                      <Badge variant="outline">
                                        {property.transaction_type ===
                                        "alquiler"
                                          ? "Alquilada"
                                          : "Vendida"}
                                      </Badge>
                                      {/* <Button
                                        onClick={() => {
                                          setSelectedPropertyForReport(
                                            property.id,
                                          );
                                          setReportDialogOpen(true);
                                        }}
                                        variant="outline"
                                        size="sm"
                                      >
                                        <Download className="w-4 h-4 mr-2" />
                                        Reporte
                                      </Button> */}
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )
                    ) : (
                      <div className="text-center py-8">
                        <Home className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          No hay propiedades vendidas o alquiladas aún.
                        </p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {selectedProperty && agent && (
        <RegisterTransactionModal
          open={saleModalOpen}
          onOpenChange={setSaleModalOpen}
          property={selectedProperty}
          agentId={agent.id}
        />
      )}

      {agent && (
        <EditAgentInfoModal
          isOpen={editInfoModalOpen}
          onClose={() => setEditInfoModalOpen(false)}
          agentId={agent.id}
          currentEmail={agent.email}
          currentPhone={agent.phone}
          currentWhatsapp={agent.whatsapp}
        />
      )}

      {/* Download Report Dialog */}
      <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              Descargar Reporte
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3 py-4">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleDownloadReport("vertical")}
              disabled={isDownloading}
            >
              <Download className="w-4 h-4 mr-2" />
              {isDownloading ? "Generando..." : "Descargar reporte vertical"}
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleDownloadReport("horizontal")}
              disabled={isDownloading}
            >
              <Download className="w-4 h-4 mr-2" />
              {isDownloading ? "Generando..." : "Descargar reporte horizontal"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AgentDashboard;
