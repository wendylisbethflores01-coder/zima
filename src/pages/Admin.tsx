import { useState } from "react";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Home,
  Users,
  TrendingUp,
  DollarSign,
  Settings,
  Upload,
  Save,
  X,
  Tag,
  LogOut,
  CheckCircle,
  Download,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import EditPropertyModal from "@/components/EditPropertyModal";
import CreatePropertyForm from "@/components/CreatePropertyForm";
import { useDeleteProperty } from "@/hooks/useDeleteProperty";
import { useApproveProperty } from "@/hooks/useApproveProperty";
import { useAgents } from "@/hooks/useAgents";
import { useProperties } from "@/hooks/useProperties";
import { useSales } from "@/hooks/useSales";
import { useRentalContracts } from "@/hooks/useRentalContracts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { ChangeRequestsInbox } from "@/components/ChangeRequestsInbox";
import { usePendingChangeRequestsCount } from "@/hooks/useChangeRequests";
import { Inbox } from "lucide-react";

const Admin = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterAgent, setFilterAgent] = useState("all");
  const [showChangeRequestsInbox, setShowChangeRequestsInbox] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [selectedPropertyForReport, setSelectedPropertyForReport] = useState<
    string | null
  >(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const { deleteProperty, isDeleting } = useDeleteProperty();
  const { approveProperty, isApproving } = useApproveProperty();
  const { data: pendingCount = 0 } = usePendingChangeRequestsCount();

  // Load agents from database
  const { data: agents = [], isLoading: agentsLoading } = useAgents();

  // Load properties from database (including inactive ones for admin)
  const {
    properties: dbProperties,
    loading: propertiesLoading,
    error: propertiesError,
    refetch: refetchProperties,
  } = useProperties({ includeInactive: true });

  // Load sales from database
  const { data: sales = [] } = useSales();

  // Load rental contracts from database
  const { data: rentalContracts = [] } = useRentalContracts();

  // Transform database properties to match expected format for admin table
  const properties = dbProperties.map((prop) => ({
    id: prop.id, // This is already the property_code from useProperties hook
    propertyCode: prop.id, // Use the same id (which is property_code) for the modal
    title: prop.title,
    type: prop.type,
    price: prop.price,
    currency: prop.currency,
    formattedPrice: prop.formattedPrice,
    location: prop.location,
    status: !prop.is_approved
      ? "pending"
      : prop.is_active
        ? "active"
        : "inactive",
    is_active: prop.is_active,
    views: Math.floor(Math.random() * 2000),
    // Mock views data
    inquiries: Math.floor(Math.random() * 50),
    // Mock inquiries data
    createdAt: new Date(prop.created_at).toISOString().split("T")[0],
    image: prop.image,
    agent: {
      id: prop.agent?.id || "",
      name: prop.agent?.name || "",
    },
    tags: [],
    // Empty for now, can be enhanced later
    bedrooms: prop.bedrooms,
    bathrooms: prop.bathrooms,
    parking: prop.parking,
    area: prop.area,
    builtArea: prop.builtArea,
    description: prop.description, // Include description from database
    age: prop.age, // Include age from database
    is_approved: prop.is_approved, // Include approval status
    address: prop.address ? prop.address : "",
  }));

  // Calculate stats from real data
  const totalProperties = properties.length;
  const activeProperties = properties.filter(
    (p) => p.status === "active",
  ).length;

  // Calculate total sales from database
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const monthlySales = sales.filter((sale) => {
    const saleDate = new Date(sale.sale_date);
    return (
      saleDate.getMonth() === currentMonth &&
      saleDate.getFullYear() === currentYear
    );
  });

  const totalSalesAmount = monthlySales.reduce((sum, sale) => {
    // Convert to PEN for display (assuming 1 USD = 3.8 PEN approximately)
    const amount =
      sale.currency === "USD" ? sale.sale_price * 3.8 : sale.sale_price;
    return sum + Number(amount);
  }, 0);

  const formattedSalesAmount =
    totalSalesAmount > 0
      ? `S/ ${(totalSalesAmount / 1000000).toFixed(1)}M`
      : "S/ 0";

  // Calculate active rental contracts
  const activeRentals = rentalContracts.filter(
    (contract) => contract.contract_status === "active",
  );

  // Admin stats with real data
  const stats = [
    {
      title: "Total Propiedades",
      value: totalProperties.toString(),
      change: "+12%",
      icon: Home,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Propiedades Activas",
      value: activeProperties.toString(),
      change: "+8%",
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Alquileres Activos",
      value: activeRentals.length.toString(),
      change: `${rentalContracts.length} total`,
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Ventas del Mes",
      value: formattedSalesAmount,
      change: `${monthlySales.length} ${
        monthlySales.length === 1 ? "venta" : "ventas"
      }`,
      icon: DollarSign,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Activa</Badge>;
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>
        );
      case "sold":
        return <Badge className="bg-blue-100 text-blue-800">Vendida</Badge>;
      case "inactive":
        return <Badge className="bg-gray-100 text-gray-800">Inactiva</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const handleDeleteProperty = async (
    propertyId: string,
    propertyTitle: string,
  ) => {
    await deleteProperty(propertyId, propertyTitle);
  };

  const handleApproveProperty = async (propertyId: string) => {
    await approveProperty(propertyId);
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

      console.log("Downloading from user", user?.id);

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

  const filteredProperties = properties.filter((property) => {
    const matchesSearch =
      property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || property.status === filterStatus;
    const matchesAgent =
      filterAgent === "all" || property.agent?.name === filterAgent;
    return matchesSearch && matchesStatus && matchesAgent;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Panel de Administración
            </h1>
            <p className="text-gray-600 mt-1">
              Gestiona todas las propiedades de ZIMA
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Bienvenido, {user?.email}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate("/agentes")}>
              <Users className="w-4 h-4 mr-2" />
              Gestionar Agentes
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/admin/amenities")}
            >
              <Settings className="w-4 h-4 mr-2" />
              Gestionar Comodidades
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/admin/property-types")}
            >
              <Tag className="w-4 h-4 mr-2" />
              Gestionar Tipos de Propiedades
            </Button>
            <CreatePropertyForm />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="hover-lift">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                  </div>
                  <div
                    className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}
                  >
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Change Requests Inbox Banner */}
        {pendingCount > 0 && (
          <Card className="mb-8 border-yellow-500/50 bg-yellow-50/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Inbox className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">
                      Bandeja de Solicitudes de Cambio
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Tienes {pendingCount}{" "}
                      {pendingCount === 1
                        ? "solicitud pendiente"
                        : "solicitudes pendientes"}{" "}
                      de revisión
                    </p>
                  </div>
                </div>
                <Button onClick={() => setShowChangeRequestsInbox(true)}>
                  Ver Solicitudes
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Properties Management */}
        <Card>
          <CardHeader>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <CardTitle>Administrar Propiedades</CardTitle>

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Buscar propiedades..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>

                <Select value={filterAgent} onValueChange={setFilterAgent}>
                  <SelectTrigger className="w-48">
                    <Users className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Filtrar por agente" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los agentes</SelectItem>
                    {agents.map((agent) => (
                      <SelectItem key={agent.id} value={agent.name}>
                        {agent.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-48">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="active">Activas</SelectItem>
                    <SelectItem value="pending">Pendientes</SelectItem>
                    <SelectItem value="sold">Vendidas</SelectItem>
                    <SelectItem value="inactive">Inactivas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="overflow-x-auto">
              {propertiesLoading ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Cargando propiedades...</p>
                </div>
              ) : propertiesError ? (
                <div className="text-center py-8">
                  <p className="text-red-500">
                    Error al cargar propiedades: {propertiesError}
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Propiedad</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Precio</TableHead>
                      <TableHead>Ubicación</TableHead>
                      <TableHead>Agente</TableHead>
                      {/* <TableHead>Etiquetas</TableHead> */}
                      <TableHead>Estado</TableHead>
                      {/* <TableHead>Vistas</TableHead>
                      <TableHead>Consultas</TableHead> */}
                      <TableHead>Fecha</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProperties.map((property) => (
                      <TableRow
                        key={property.id}
                        className={`hover:bg-gray-50 ${
                          !property.is_approved ? "bg-yellow-50" : ""
                        }`}
                      >
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <img
                              src={property.image}
                              alt={property.title}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                            <div>
                              <div className="font-medium text-sm">
                                {property.title}
                              </div>
                              <div className="text-xs text-gray-500">
                                ID: {property.id}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{property.type}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {property.price}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {property.location}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{property.agent.name}</div>
                        </TableCell>
                        {/* <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {property.tags.map((tag: any, idx: number) => (
                              <Badge
                                key={idx}
                                style={{
                                  backgroundColor: tag.color,
                                  color: tag.textColor,
                                }}
                              >
                                {tag.label}
                              </Badge>
                            ))}
                          </div>
                        </TableCell> */}
                        <TableCell>{getStatusBadge(property.status)}</TableCell>
                        {/* <TableCell className="text-center">
                          {property.views}
                        </TableCell>
                        <TableCell className="text-center">
                          {property.inquiries}
                        </TableCell> */}
                        <TableCell className="text-sm text-gray-600">
                          {property.createdAt}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-8 h-8 p-0"
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() =>
                                  navigate(`/propiedad/${property.id}`)
                                }
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                Ver Detalles
                              </DropdownMenuItem>
                              {!property.is_approved && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleApproveProperty(property.id)
                                  }
                                  disabled={isApproving}
                                  className="text-green-600"
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Aprobar Propiedad
                                </DropdownMenuItem>
                              )}
                              <EditPropertyModal property={property} />
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedPropertyForReport(property.id);
                                  setReportDialogOpen(true);
                                }}
                              >
                                <Download className="w-4 h-4 mr-2" />
                                Descargar reporte
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem
                                    className="text-red-600"
                                    onSelect={(e) => e.preventDefault()}
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Eliminar
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      ¿Estás seguro?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Esta acción no se puede deshacer. Se
                                      eliminará permanentemente la propiedad "
                                      {property.title}" de la base de datos.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Cancelar
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() =>
                                        handleDeleteProperty(
                                          property.id,
                                          property.title,
                                        )
                                      }
                                      className="bg-red-600 hover:bg-red-700"
                                      disabled={isDeleting}
                                    >
                                      {isDeleting
                                        ? "Eliminando..."
                                        : "Eliminar"}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>

            {!propertiesLoading &&
              !propertiesError &&
              filteredProperties.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    No se encontraron propiedades que coincidan con los filtros.
                  </p>
                </div>
              )}
          </CardContent>
        </Card>
      </div>

      {/* Change Requests Inbox Modal */}
      <Dialog
        open={showChangeRequestsInbox}
        onOpenChange={setShowChangeRequestsInbox}
      >
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Inbox className="w-5 h-5" />
              Bandeja de Solicitudes de Cambio
            </DialogTitle>
          </DialogHeader>
          <ChangeRequestsInbox />
        </DialogContent>
      </Dialog>

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

export default Admin;
