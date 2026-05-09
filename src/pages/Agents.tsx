import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Phone,
  Mail,
  MapPin,
  Award,
  TrendingUp,
  Users,
  Home,
  Star,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import Header from "@/components/Header";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useAgents } from "@/hooks/useAgents";
import { InviteAgentModal } from "@/components/InviteAgentModal";
import { CreateAgentUserModal } from "@/components/CreateAgentUserModal";

// Fixed: Removed isAddAgentOpen references and simplified to single button

type EditAgentForm = {
  name: string;
  email: string;
  phone: string;
};

const Agents = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isCreateAgentUserOpen, setIsCreateAgentUserOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [agentToDelete, setAgentToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [agentToEdit, setAgentToEdit] = useState<{
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
  } | null>(null);

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isValid },
  } = useForm<EditAgentForm>({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
    },
  });

  // Fetch agents from database
  const { data: agents = [], isLoading, error } = useAgents();

  // Build avatar URLs from storage
  const agentsWithAvatars = useMemo(() => {
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

  // Calculate stats from agents data
  const stats = [
    {
      title: "Total Agentes",
      value: agentsWithAvatars.length.toString(),
      change: `${agentsWithAvatars.length} agentes registrados`,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Agentes Activos",
      value: agentsWithAvatars.length.toString(),
      change: "Todos disponibles",
      icon: Award,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Con Contacto",
      value: agentsWithAvatars
        .filter((agent) => agent.email || agent.phone)
        .length.toString(),
      change: "Información disponible",
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Con Email",
      value: agentsWithAvatars.filter((agent) => agent.email).length.toString(),
      change: "Contacto directo",
      icon: Home,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
  ];

  const getStatusBadge = () => {
    return <Badge className="bg-green-100 text-green-800">Activo</Badge>;
  };

  const handleDeleteAgent = async (id: string) => {
    const { error } = await supabase.functions.invoke("delete-agent", {
      body: { id },
    });

    if (error) {
      if (error.code === "23503") {
        toast.error(
          "No se puede eliminar el agente porque tiene propiedades asociadas. Por favor, reasigna o elimina esas propiedades primero."
        );
      } else {
        toast.error("Error al eliminar el agente");
      }
      return;
    }

    // Invalidate and refetch agents query to update the UI
    queryClient.invalidateQueries({ queryKey: ["agents"] });
    toast.success("Agente eliminado exitosamente");
  };

  const confirmDeleteAgent = () => {
    if (agentToDelete) {
      handleDeleteAgent(agentToDelete.id);
      setAgentToDelete(null);
    }
  };

  const handleEditAgent = (agent: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
  }) => {
    setAgentToEdit(agent);
    setValue("name", agent.name);
    setValue("email", agent.email || "");
    setValue("phone", agent.phone || "");
  };

  const handleUpdateAgent = async (data: EditAgentForm) => {
    if (!agentToEdit) return;
    console.log("Updating agent:", agentToEdit.id);
    console.log("Updating agent with data:", data);

    const { data: updatedAgent, error } = await supabase
      .from("agents")
      .update({
        name: data.name,
        email: data.email || null,
        phone: data.phone || null,
      })
      .eq("id", agentToEdit.id)
      .select()
      .single();

    if (error) {
      toast.error("Error al actualizar el agente");
      return;
    }

    console.log("Updated agent:", updatedAgent);

    // Invalidate and refetch agents query to update the UI
    queryClient.invalidateQueries({ queryKey: ["agents"] });
    toast.success("Agente actualizado exitosamente");
    setAgentToEdit(null);
    reset();
  };

  const filteredAgents = agentsWithAvatars.filter((agent) => {
    const matchesSearch =
      agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (agent.email &&
        agent.email.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="ml-2">Cargando agentes...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-red-600 mb-2">Error al cargar los agentes</p>
              <p className="text-gray-600">{error.message}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Gestión de Agentes
            </h1>
            <p className="text-gray-600 mt-1">
              Administra tu equipo de asesores inmobiliarios
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate("/admin")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al Dashboard
            </Button>
            <Button
              onClick={() => setIsCreateAgentUserOpen(true)}
              className="btn-hero bg-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Crear Agente
            </Button>
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
                    <p className="text-sm text-green-600 mt-1">{stat.change}</p>
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

        {/* Agents Grid and Table */}
        <div className="space-y-8">
          {/* Agents Grid View */}
          <Card>
            <CardHeader>
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <CardTitle>Equipo de Agentes</CardTitle>

                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Buscar agentes..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>

                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-48">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {/* Agents Table */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Agente</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Teléfono</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAgents.map((agent) => (
                      <TableRow key={agent.id} className="hover:bg-gray-50">
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="w-10 h-10">
                              <AvatarImage
                                src={agent.avatarUrl}
                                alt={agent.name}
                              />
                              <AvatarFallback>
                                {agent.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{agent.name}</div>
                              <div className="text-sm text-gray-500">
                                Agente Inmobiliario
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{agent.email || "No disponible"}</TableCell>
                        <TableCell>{agent.phone || "No disponible"}</TableCell>
                        <TableCell>{getStatusBadge()}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleEditAgent(agent)}
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() =>
                                  setAgentToDelete({
                                    id: agent.id,
                                    name: agent.name,
                                  })
                                }
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Create Agent User Modal */}
      <CreateAgentUserModal
        isOpen={isCreateAgentUserOpen}
        onClose={() => setIsCreateAgentUserOpen(false)}
      />

      {/* Invite Agent Modal */}
      {selectedAgent && (
        <InviteAgentModal
          isOpen={inviteModalOpen}
          onClose={() => {
            setInviteModalOpen(false);
            setSelectedAgent(null);
          }}
          agentId={selectedAgent.id}
          agentName={selectedAgent.name}
        />
      )}

      {/* Edit Agent Dialog */}
      <Dialog open={!!agentToEdit} onOpenChange={() => setAgentToEdit(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Agente</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(handleUpdateAgent)}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Nombre
                </Label>
                <Input
                  id="name"
                  {...register("name", { required: "El nombre es requerido" })}
                  className="col-span-3"
                  placeholder="Nombre del agente"
                />
                {errors.name && (
                  <p className="col-start-2 col-span-3 text-sm text-red-600">
                    {errors.name.message}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email", {
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Email inválido",
                    },
                  })}
                  className="col-span-3"
                  placeholder="email@ejemplo.com"
                />
                {errors.email && (
                  <p className="col-start-2 col-span-3 text-sm text-red-600">
                    {errors.email.message}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">
                  Teléfono
                </Label>
                <Input
                  id="phone"
                  {...register("phone")}
                  className="col-span-3"
                  placeholder="+51 999 999 999"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAgentToEdit(null)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={!watch("name")?.trim()}>
                Guardar Cambios
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!agentToDelete}
        onOpenChange={() => setAgentToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Confirmar eliminación?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas eliminar al agente{" "}
              <strong>{agentToDelete?.name}</strong>? Esta acción no se puede
              deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteAgent}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Agents;
