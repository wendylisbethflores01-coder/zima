import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  ArrowLeft,
  Tag,
} from "lucide-react";
import Header from "@/components/Header";
import { usePropertyTypes } from "@/hooks/usePropertyTypes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

const AdminPropertyTypes = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: propertyTypes = [], isLoading } = usePropertyTypes();

  const handleCreatePropertyType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("El nombre es obligatorio");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("property_types").insert([
        {
          name: formData.name.trim(),
        },
      ]);

      if (error) throw error;

      toast.success("Tipo de propiedad creado exitosamente");
      setFormData({ name: "" });
      setIsCreateDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["property-types"] });
    } catch (error: any) {
      toast.error(`Error al crear tipo de propiedad: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditPropertyType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !editingType) {
      toast.error("El nombre es obligatorio");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("property_types")
        .update({
          name: formData.name.trim(),
        })
        .eq("id", editingType.id);

      if (error) throw error;

      toast.success("Tipo de propiedad actualizado exitosamente");
      setFormData({ name: "" });
      setIsEditDialogOpen(false);
      setEditingType(null);
      queryClient.invalidateQueries({ queryKey: ["property-types"] });
    } catch (error: any) {
      toast.error(`Error al actualizar tipo de propiedad: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePropertyType = async (
    typeId: string,
    typeName: string
  ) => {
    try {
      const { error } = await supabase
        .from("property_types")
        .delete()
        .eq("id", typeId);

      if (error) throw error;

      toast.success(`Tipo de propiedad "${typeName}" eliminado exitosamente`);
      queryClient.invalidateQueries({ queryKey: ["property-types"] });
    } catch (error: any) {
      toast.error(`Error al eliminar tipo de propiedad: ${error.message}`);
    }
  };

  const openEditDialog = (type: any) => {
    setEditingType(type);
    setFormData({
      name: type.name,
    });
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({ name: "" });
    setEditingType(null);
  };

  const filteredPropertyTypes = propertyTypes.filter((type) =>
    type.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Gestión de Tipos de Propiedades
            </h1>
            <p className="text-gray-600 mt-1">
              Administra los tipos de propiedades disponibles en el sistema
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

            <Dialog
              open={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
            >
              <DialogTrigger asChild>
                <Button className="bg-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Tipo
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Crear Nuevo Tipo de Propiedad</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreatePropertyType} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nombre *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="Ej: Departamento, Casa, Terreno..."
                      required
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsCreateDialogOpen(false);
                        resetForm();
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Creando..." : "Crear"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Property Types Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <CardTitle>Tipos de Propiedades Registrados</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar tipos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Cargando tipos de propiedades...</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPropertyTypes.map((type) => (
                      <TableRow key={type.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">
                          {type.name}
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Activo
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(type)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="w-4 h-4 text-red-600" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    ¿Eliminar tipo de propiedad?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Esta acción no se puede deshacer. Se
                                    eliminará permanentemente el tipo "
                                    {type.name}".
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>
                                    Cancelar
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      handleDeletePropertyType(
                                        type.id,
                                        type.name
                                      )
                                    }
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Eliminar
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>

            {!isLoading && filteredPropertyTypes.length === 0 && (
              <div className="text-center py-8">
                <Tag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  {searchTerm
                    ? "No se encontraron tipos de propiedades que coincidan con la búsqueda."
                    : "No hay tipos de propiedades registrados aún."}
                </p>
                {!searchTerm && (
                  <Button
                    className="mt-4"
                    onClick={() => setIsCreateDialogOpen(true)}
                  >
                    Agregar Primer Tipo
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Tipo de Propiedad</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditPropertyType} className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Nombre *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Ej: Departamento, Casa, Terreno..."
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  resetForm();
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPropertyTypes;
