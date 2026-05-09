import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Upload,
  X,
  Save,
  Plus,
  Trash2,
  Star,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import { useAgents } from "@/hooks/useAgents";
import { useCreateProperty } from "@/hooks/useCreateProperty";
import { AmenitiesSelector } from "@/components/AmenitiesSelector";
import { usePropertyTypes } from "@/hooks/usePropertyTypes";

const propertySchema = z.object({
  title: z
    .string()
    .min(1, "El título es obligatorio")
    .max(200, "El título debe tener menos de 200 caracteres"),
  property_type: z.string().min(1, "Selecciona un tipo de propiedad"),
  transaction_type: z.enum(["venta", "alquiler", "anticresis"], {
    required_error: "Selecciona un tipo de transacción",
  }),
  price: z.string().min(1, "El precio es obligatorio"),
  currency: z.enum(["PEN", "USD"], {
    required_error: "Selecciona una moneda",
  }),
  city: z.string().min(1, "La ciudad es obligatoria"),
  district: z.string().min(1, "El distrito es obligatorio"),
  province: z.string().optional(),
  address: z.string().optional(),
  area: z.string().min(1, "El área es obligatoria"),
  built_area: z.string().optional(),
  bedrooms: z.string().optional(),
  bathrooms: z.string().optional(),
  parking: z.string().optional(),
  description: z.string().optional(),
  agent_id: z.string().uuid("Selecciona un agente válido"),
  age: z.string().optional(),
});

type PropertyFormData = z.infer<typeof propertySchema>;

interface ImageWithMetadata {
  id: string;
  file: File;
  url: string;
  name: string;
  isMain: boolean;
  order: number;
}

interface CreatePropertyFormProps {
  fixedAgentId?: string;
  fixedAgentName?: string;
}

export default function CreatePropertyForm({
  fixedAgentId,
  fixedAgentName,
}: CreatePropertyFormProps = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState<ImageWithMetadata[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const { createProperty, isSubmitting } = useCreateProperty();
  const { data: agents = [], isLoading: agentsLoading } = useAgents();
  const { data: propertyTypes = [], isLoading: propertyTypesLoading } =
    usePropertyTypes();

  const form = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      transaction_type: "venta",
      currency: "PEN",
      bedrooms: "0",
      bathrooms: "0",
      parking: "0",
      agent_id: fixedAgentId || "",
    },
  });

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    // Validar tipos de archivo
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const invalidFiles = files.filter(
      (file) => !validTypes.includes(file.type)
    );

    if (invalidFiles.length > 0) {
      toast.error("Solo se permiten archivos de imagen (JPG, PNG, WEBP)");
      return;
    }

    // Validar tamaño (máximo 5MB por imagen)
    const largeFiles = files.filter((file) => file.size > 5 * 1024 * 1024);
    if (largeFiles.length > 0) {
      toast.error("Las imágenes deben ser menores a 5MB");
      return;
    }

    if (selectedImages.length + files.length > 10) {
      toast.error("Máximo 10 imágenes permitidas");
      return;
    }

    // Crear objetos ImageWithMetadata
    const newImages: ImageWithMetadata[] = files.map((file, index) => ({
      id: `new-${Date.now()}-${index}`,
      file,
      url: URL.createObjectURL(file),
      name: file.name,
      isMain: selectedImages.length === 0 && index === 0, // Primera imagen como principal si no hay otras
      order: selectedImages.length + index,
    }));

    setSelectedImages((prev) => [...prev, ...newImages]);
  };

  const removeImage = (id: string) => {
    setSelectedImages((prev) => {
      const filtered = prev.filter((img) => img.id !== id);
      // Si eliminamos la imagen principal, hacer la primera como principal
      if (filtered.length > 0 && prev.find((img) => img.id === id)?.isMain) {
        filtered[0].isMain = true;
      }
      // Reordenar índices
      return filtered.map((img, index) => ({ ...img, order: index }));
    });
  };

  const setAsMainImage = (id: string) => {
    setSelectedImages((prev) =>
      prev.map((img) => ({
        ...img,
        isMain: img.id === id,
      }))
    );
  };

  const moveImageUp = (id: string) => {
    setSelectedImages((prev) => {
      const currentIndex = prev.findIndex((img) => img.id === id);
      if (currentIndex <= 0) return prev;

      const newArray = [...prev];
      [newArray[currentIndex - 1], newArray[currentIndex]] = [
        newArray[currentIndex],
        newArray[currentIndex - 1],
      ];

      // Actualizar órdenes
      return newArray.map((img, index) => ({ ...img, order: index }));
    });
  };

  const moveImageDown = (id: string) => {
    setSelectedImages((prev) => {
      const currentIndex = prev.findIndex((img) => img.id === id);
      if (currentIndex >= prev.length - 1) return prev;

      const newArray = [...prev];
      [newArray[currentIndex], newArray[currentIndex + 1]] = [
        newArray[currentIndex + 1],
        newArray[currentIndex],
      ];

      // Actualizar órdenes
      return newArray.map((img, index) => ({ ...img, order: index }));
    });
  };

  const onSubmit = async (data: PropertyFormData) => {
    console.log("SubmittingData...", data);
    // Ensure all required fields are present
    const propertyData = {
      ...data,
      title: data.title || "",
      property_type: data.property_type || "Casa",
      transaction_type: data.transaction_type || "venta",
      price: parseFloat(data.price),
      currency: data.currency || "PEN",
      city: data.city || "",
      district: data.district || "",
      area: parseFloat(data.area),
      built_area: data.built_area ? parseFloat(data.built_area) : null,
      bedrooms: data.bedrooms ? parseInt(data.bedrooms, 10) : null,
      bathrooms: data.bathrooms ? parseInt(data.bathrooms, 10) : null,
      parking: data.parking ? parseInt(data.parking, 10) : null,
      agent_id: data.agent_id || "",
      address: data.address || null,
      age: data.age ? parseInt(data.age, 10) : null,
    };

    // Extraer archivos y encontrar el índice de la imagen principal
    // Las imágenes ya están ordenadas correctamente en el array selectedImages
    const imageFiles = selectedImages.map((img) => img.file);
    const mainImageIndex = selectedImages.findIndex((img) => img.isMain);

    console.log("PropertyData:", propertyData);

    const result = await createProperty(
      propertyData,
      imageFiles,
      mainImageIndex >= 0 ? mainImageIndex : 0,
      selectedAmenities
    );

    if (result.success) {
      // Reset form and images on success
      form.reset();
      setSelectedImages([]);
      setSelectedAmenities([]);
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="btn-hero bg-primary">
          <Plus className="w-4 h-4 mr-2" />
          Nueva Propiedad
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Agregar Nueva Propiedad</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Información Básica</TabsTrigger>
                <TabsTrigger value="details">Detalles</TabsTrigger>
                <TabsTrigger value="images">Imágenes</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Información General</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Título de la Propiedad</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Ej: Casa moderna en Miraflores"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="property_type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipo de Propiedad</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar tipo" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {propertyTypesLoading ? (
                                  <SelectItem value="" disabled>
                                    Cargando...
                                  </SelectItem>
                                ) : (
                                  propertyTypes.map((type) => (
                                    <SelectItem key={type.id} value={type.name}>
                                      {type.name}
                                    </SelectItem>
                                  ))
                                )}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="transaction_type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipo de Transacción</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar transacción" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="venta">Venta</SelectItem>
                                <SelectItem value="alquiler">
                                  Alquiler
                                </SelectItem>
                                <SelectItem value="anticresis">
                                  Anticrésis
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Precio</FormLabel>
                            <FormControl>
                              <Input
                                type="text"
                                placeholder="450000"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />{" "}
                      <FormField
                        control={form.control}
                        name="currency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Moneda</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar moneda" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="PEN">Soles (S/)</SelectItem>
                                <SelectItem value="USD">Dólares ($)</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ciudad</FormLabel>
                            <FormControl>
                              <Input placeholder="Lima" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="district"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Distrito</FormLabel>
                            <FormControl>
                              <Input placeholder="Miraflores" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="province"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Provincia (Opcional)</FormLabel>
                            <FormControl>
                              <Input placeholder="Lima" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Dirección Específica (Para Mapa)
                            <span className="text-xs text-gray-500 font-normal ml-2">
                              - Opcional
                            </span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Ej: Av. Larco 345, Miraflores, Lima"
                              {...field}
                            />
                          </FormControl>
                          <div className="text-xs text-gray-500 mt-1">
                            Si no se especifica, se usará el distrito para el
                            mapa. Para mayor precisión en Google Maps, incluye
                            la dirección completa.
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="agent_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Agente Asignado</FormLabel>
                          {fixedAgentId ? (
                            <FormControl>
                              <Input
                                value={fixedAgentName || "Agente actual"}
                                disabled
                                className="bg-muted"
                              />
                            </FormControl>
                          ) : (
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar agente" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {agents.map((agent) => (
                                  <SelectItem key={agent.id} value={agent.id}>
                                    {agent.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="details" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Detalles de la Propiedad</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="area"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Área Total (m²)</FormLabel>
                            <FormControl>
                              <Input
                                type="text"
                                placeholder="150.00"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="built_area"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Área Construida (m²)</FormLabel>
                            <FormControl>
                              <Input
                                type="text"
                                placeholder="120.00"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="bedrooms"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Dormitorios</FormLabel>
                            <FormControl>
                              <Input type="text" placeholder="3" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="bathrooms"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Baños</FormLabel>
                            <FormControl>
                              <Input type="text" placeholder="2" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="parking"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Estacionamientos</FormLabel>
                            <FormControl>
                              <Input type="text" placeholder="2" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="age"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Antigüedad (años) (Opcional)</FormLabel>
                          <FormControl>
                            <Input type="text" placeholder="5" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descripción</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe las características principales de la propiedad..."
                              rows={4}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Comodidades</label>
                      <AmenitiesSelector
                        selectedAmenities={selectedAmenities}
                        onSelectionChange={setSelectedAmenities}
                        disabled={isSubmitting}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="images" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Imágenes de la Propiedad</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-2">
                        Selecciona las imágenes de la propiedad (máximo 10)
                      </p>
                      <p className="text-xs text-gray-500 mb-4">
                        La primera imagen será marcada como principal
                        automáticamente. Puedes reorganizar el orden y cambiar
                        la imagen principal después.
                        <br />
                        <strong>Nota:</strong> Las imágenes se guardarán como
                        1.jpg, 2.jpg, etc. según el orden mostrado. La imagen
                        principal también se guardará como main.jpg.
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageSelect}
                        className="hidden"
                        id="image-upload"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          document.getElementById("image-upload")?.click()
                        }
                      >
                        Seleccionar Archivos
                      </Button>
                    </div>

                    {selectedImages.length > 0 && (
                      <div className="space-y-4">
                        <h4 className="font-medium">
                          Imágenes de la Propiedad (Orden del Carrusel) -{" "}
                          {selectedImages.length}/10
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {selectedImages.map((image, index) => {
                            const isFirst = index === 0;
                            const isLast = index === selectedImages.length - 1;

                            return (
                              <div key={image.id} className="relative">
                                <img
                                  src={image.url}
                                  alt={image.name}
                                  className="w-full h-32 object-cover rounded-lg"
                                />

                                {/* Delete button */}
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="destructive"
                                  className="absolute top-1 right-1 w-6 h-6 p-0"
                                  onClick={() => removeImage(image.id)}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>

                                {/* Main image indicator */}
                                {image.isMain && (
                                  <div className="absolute top-1 left-1 bg-primary text-primary-foreground text-xs px-2 py-1 rounded flex items-center gap-1">
                                    <Star className="w-3 h-3" />
                                    Principal
                                  </div>
                                )}

                                {/* Set as main button */}
                                {!image.isMain && (
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="secondary"
                                    className="absolute top-1 left-1 h-6 text-xs px-2"
                                    onClick={() => setAsMainImage(image.id)}
                                  >
                                    Hacer principal
                                  </Button>
                                )}

                                {/* Order controls */}
                                <div className="absolute bottom-1 right-1 flex gap-1">
                                  {!isFirst && (
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="outline"
                                      className="w-6 h-6 p-0 bg-white/90 hover:bg-white"
                                      onClick={() => moveImageUp(image.id)}
                                      title="Mover hacia arriba"
                                    >
                                      <ChevronUp className="w-3 h-3" />
                                    </Button>
                                  )}
                                  {!isLast && (
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="outline"
                                      className="w-6 h-6 p-0 bg-white/90 hover:bg-white"
                                      onClick={() => moveImageDown(image.id)}
                                      title="Mover hacia abajo"
                                    >
                                      <ChevronDown className="w-3 h-3" />
                                    </Button>
                                  )}
                                </div>

                                {/* Position indicator */}
                                <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-2 py-1 rounded">
                                  #{index + 1}
                                </div>

                                {/* Image name */}
                                <div className="mt-2">
                                  <span className="text-xs text-gray-500 truncate block">
                                    {image.name}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <div className="flex justify-end space-x-4 mt-6">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-hero bg-primary"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isSubmitting ? "Guardando..." : "Crear Propiedad"}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
