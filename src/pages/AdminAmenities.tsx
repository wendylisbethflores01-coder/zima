import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  ArrowLeft,
  Save,
  X,
  Settings,
} from "lucide-react";
import Header from "@/components/Header";
import IconSelector from "@/components/IconSelector";
import { getAmenityIcon } from "@/lib/iconUtils";
import { useAmenities } from "@/hooks/useAmenities";
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

const AdminAmenities = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingAmenity, setEditingAmenity] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    icon: "",
    category: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: amenities = [], isLoading, refetch } = useAmenities();

  const handleCreateAmenity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("El nombre es obligatorio");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("amenities").insert([
        {
          name: formData.name.trim(),
          icon: formData.icon.trim() || "Star",
          category: formData.category.trim() || "General",
        },
      ]);

      if (error) throw error;

      toast.success("Comodidad creada exitosamente");
      setFormData({ name: "", icon: "", category: "" });
      setIsCreateDialogOpen(false);
      refetch();
    } catch (error) {
      toast.error(`Error al crear comodidad: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditAmenity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !editingAmenity) {
      toast.error("El nombre es obligatorio");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("amenities")
        .update({
          name: formData.name.trim(),
          icon: formData.icon.trim() || "Star",
          category: formData.category.trim() || "General",
        })
        .eq("id", editingAmenity.id);

      if (error) throw error;

      toast.success("Comodidad actualizada exitosamente");
      setFormData({ name: "", icon: "", category: "" });
      setIsEditDialogOpen(false);
      setEditingAmenity(null);
      refetch();
    } catch (error) {
      toast.error(`Error al actualizar comodidad: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAmenity = async (
    amenityId: string,
    amenityName: string
  ) => {
    try {
      const { error } = await supabase
        .from("amenities")
        .delete()
        .eq("id", amenityId);

      if (error) throw error;

      toast.success(`Comodidad "${amenityName}" eliminada exitosamente`);
      refetch();
    } catch (error) {
      toast.error(`Error al eliminar comodidad: ${error.message}`);
    }
  };

  const openEditDialog = (amenity) => {
    setEditingAmenity(amenity);
    setFormData({
      name: amenity.name,
      icon: amenity.icon || "",
      category: amenity.category || "",
    });
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({ name: "", icon: "", category: "" });
    setEditingAmenity(null);
  };

  const filteredAmenities = amenities.filter(
    (amenity) =>
      amenity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (amenity.category &&
        amenity.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Gestión de Comodidades
            </h1>
            <p className="text-gray-600 mt-1">
              Administra las comodidades disponibles para las propiedades
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
                  Agregar Comodidad
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Crear Nueva Comodidad</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateAmenity} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nombre *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="Ej: Piscina, Gimnasio, Estacionamiento..."
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="icon">Ícono</Label>
                    <IconSelector
                      selectedIcon={formData.icon}
                      onIconSelect={(iconName) =>
                        setFormData({ ...formData, icon: iconName })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Categoría (opcional)</Label>
                    <Input
                      id="category"
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      placeholder="Ej: Recreación, Seguridad, Servicios..."
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

        {/* Amenities Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <CardTitle>Comodidades Registradas</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar comodidades..."
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
                  <p className="text-gray-500">Cargando comodidades...</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Ícono</TableHead>
                      <TableHead>Categoría</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAmenities.map((amenity) => (
                      <TableRow key={amenity.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">
                          {amenity.name}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center">
                            {(() => {
                              const IconComponent = getAmenityIcon(
                                amenity.icon || "Star"
                              );
                              return (
                                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                  <IconComponent className="w-4 h-4 text-primary" />
                                </div>
                              );
                            })()}
                          </div>
                        </TableCell>
                        <TableCell>{amenity.category || "General"}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(amenity)}
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
                                    ¿Eliminar comodidad?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Esta acción no se puede deshacer. Se
                                    eliminará permanentemente la comodidad "
                                    {amenity.name}".
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>
                                    Cancelar
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      handleDeleteAmenity(
                                        amenity.id,
                                        amenity.name
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

            {!isLoading && filteredAmenities.length === 0 && (
              <div className="text-center py-8">
                <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  {searchTerm
                    ? "No se encontraron comodidades que coincidan con la búsqueda."
                    : "No hay comodidades registradas aún."}
                </p>
                {!searchTerm && (
                  <Button
                    className="mt-4"
                    onClick={() => setIsCreateDialogOpen(true)}
                  >
                    Agregar Primera Comodidad
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
            <DialogTitle>Editar Comodidad</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditAmenity} className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Nombre *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Ej: Piscina, Gimnasio, Estacionamiento..."
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-icon">Ícono</Label>
              <IconSelector
                selectedIcon={formData.icon}
                onIconSelect={(iconName) =>
                  setFormData({ ...formData, icon: iconName })
                }
              />
            </div>
            <div>
              <Label htmlFor="edit-category">Categoría (opcional)</Label>
              <Input
                id="edit-category"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                placeholder="Ej: Recreación, Seguridad, Servicios..."
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

export default AdminAmenities;
