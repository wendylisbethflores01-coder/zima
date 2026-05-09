import { useState, useEffect, useRef } from "react";
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Edit, X, Save, Upload } from "lucide-react";
import { toast } from "sonner";
import { useAgents } from "@/hooks/useAgents";
import { useEditProperty, EditPropertyData } from "@/hooks/useEditProperty";
import { usePropertyImageManager } from "@/hooks/usePropertyImageManager";
import { usePropertyAmenities } from "@/hooks/usePropertyAmenities";
import { AmenitiesSelector } from "@/components/AmenitiesSelector";
import { supabase } from "@/integrations/supabase/client";

const propertySchema = z.object({
  title: z
    .string()
    .min(1, "El título es obligatorio")
    .max(200, "El título debe tener menos de 200 caracteres"),
  property_type: z.enum(
    ["Casa", "Departamento", "Terreno", "Oficina", "Local"],
    {
      required_error: "Selecciona un tipo de propiedad",
    }
  ),
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

interface Property {
  id: string;
  propertyCode?: string;
  title: string;
  type: string;
  price: number;
  currency: "PEN" | "USD";
  formattedPrice: string;
  location: string;
  address?: string;
  bedrooms?: number;
  bathrooms?: number;
  parking?: number;
  area: string;
  builtArea?: string;
  description?: string;
  age?: number;
  status: string;
  agent?: {
    id: string;
    name: string;
  };
  tags?: Array<{
    label: string;
    color: string;
    textColor?: string;
  }>;
}

interface EditPropertyModalProps {
  property: Property;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function EditPropertyModal({
  property,
  open: externalOpen,
  onOpenChange: externalOnOpenChange,
}: EditPropertyModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = externalOpen !== undefined;
  const isOpen = isControlled ? externalOpen : internalOpen;
  const setIsOpen = isControlled ? externalOnOpenChange! : setInternalOpen;
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [propertyCode, setPropertyCode] = useState<string | null>(null);
  const [imageEditingEnabled, setImageEditingEnabled] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedImageId, setDraggedImageId] = useState<string | null>(null);
  const [dragOverImageId, setDragOverImageId] = useState<string | null>(null);
  const dragCounterRef = useRef(0);
  const { updateProperty, isSubmitting } = useEditProperty();
  const { data: agents = [], isLoading: agentsLoading } = useAgents();
  const { data: currentAmenities = [] } = usePropertyAmenities(property.id);

  // Fetch property_code from database if not provided
  useEffect(() => {
    if (property.propertyCode) {
      setPropertyCode(property.propertyCode);
      console.log("Using provided property code:", property.propertyCode);
    } else {
      console.log(
        "Fetching property code from database...",
        property.id,
        property.propertyCode
      );
      const fetchPropertyCode = async () => {
        try {
          const { data, error } = await supabase
            .from("properties")
            .select("property_code")
            .eq("id", property.id)
            .single();

          if (error) {
            console.error("Error fetching property code:", error);
            return;
          }

          if (data && data.property_code) {
            console.log("Fetched property code:", data.property_code);
            setPropertyCode(data.property_code);
          } else {
            console.warn("No property_code found for property:", property.id);
          }
        } catch (err) {
          console.error("Exception fetching property code:", err);
        }
      };
      fetchPropertyCode();
    }
  }, [property.id, property.propertyCode]);

  // Initialize imageManager only when we have propertyCode
  const imageManager = usePropertyImageManager(
    imageEditingEnabled && propertyCode ? propertyCode : ""
  );

  const form = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      transaction_type: "venta",
      currency: "PEN",
      bedrooms: "0",
      bathrooms: "0",
      parking: "0",
    },
  });

  // Reset form when property changes
  useEffect(() => {
    if (property && isOpen) {
      // Reset image editing state when modal opens
      setImageEditingEnabled(false);

      // Parse property data to match form schema with all required fields
      const formData: PropertyFormData = {
        title: property.title || "",
        property_type:
          (property.type as
            | "Casa"
            | "Departamento"
            | "Terreno"
            | "Oficina"
            | "Local") || "Casa",
        transaction_type: "venta",
        price: property.price ? property.price.toString() : "",
        currency: property.currency || "PEN",
        city: property.location?.split(",")[1]?.trim() || "",
        district: property.location?.split(",")[0]?.trim() || "",
        province: property.location?.split(",")[2]?.trim(),
        address: property.address ? property.address : "",
        area: String(property.area) || "",
        built_area: String(property.builtArea) || "",
        bedrooms: property.bedrooms ? property.bedrooms.toString() : "0",
        bathrooms: property.bathrooms ? property.bathrooms.toString() : "0",
        parking: property.parking ? property.parking.toString() : "0",
        description: property.description || "",
        agent_id: property.agent?.id || "",
        age: property.age ? property.age.toString() : "",
      };

      form.reset(formData);
    }
  }, [property, isOpen, form]);

  // Load current amenities when modal opens
  useEffect(() => {
    if (isOpen && currentAmenities.length >= 0) {
      setSelectedAmenities(currentAmenities);
    }
  }, [isOpen, currentAmenities]);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!imageEditingEnabled) return;

    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;
    imageManager.addNewImages(files);
    // Clear the input
    event.target.value = "";
  };

  const processFiles = (files: File[]) => {
    if (!imageEditingEnabled) return;
    const imageFiles = files.filter((f) => f.type.startsWith("image/"));
    if (imageFiles.length === 0) return;
    imageManager.addNewImages(imageFiles);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounterRef.current = 0;
    const files = Array.from(e.dataTransfer.files || []);
    processFiles(files);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current += 1;
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current -= 1;
    if (dragCounterRef.current <= 0) {
      dragCounterRef.current = 0;
      setIsDragging(false);
    }
  };

  const handleEnableImageEditing = () => {
    setImageEditingEnabled(true);
  };

  // Drag and drop handlers for images
  const handleImageDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    imageId: string
  ) => {
    setDraggedImageId(imageId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", imageId);
  };

  const handleImageDragEnd = () => {
    setDraggedImageId(null);
    setDragOverImageId(null);
  };

  const handleImageDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
  };

  const handleImageDragEnter = (
    e: React.DragEvent<HTMLDivElement>,
    imageId: string
  ) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedImageId && draggedImageId !== imageId) {
      setDragOverImageId(imageId);
    }
  };

  const handleImageDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    // Only clear dragOver if we're leaving the container, not just moving between child elements
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverImageId(null);
    }
  };

  const handleImageDrop = (
    e: React.DragEvent<HTMLDivElement>,
    targetImageId: string
  ) => {
    e.preventDefault();
    e.stopPropagation();

    if (draggedImageId && draggedImageId !== targetImageId) {
      // Reorder images by finding the indices and moving accordingly
      const allImages = imageManager.getAllImages();
      const draggedIndex = allImages.findIndex(
        (img) => img.id === draggedImageId
      );
      const targetIndex = allImages.findIndex(
        (img) => img.id === targetImageId
      );

      if (draggedIndex !== -1 && targetIndex !== -1) {
        // Determine if we need to move up or down
        if (draggedIndex < targetIndex) {
          // Move down - call moveImageDown multiple times
          for (let i = draggedIndex; i < targetIndex; i++) {
            imageManager.moveImageDown(draggedImageId);
          }
        } else {
          // Move up - call moveImageUp multiple times
          for (let i = draggedIndex; i > targetIndex; i--) {
            imageManager.moveImageUp(draggedImageId);
          }
        }
      }
    }

    setDraggedImageId(null);
    setDragOverImageId(null);
  };

  const onSubmit = async (data: PropertyFormData) => {
    if (!propertyCode) {
      toast.error("Error: No se pudo obtener el código de la propiedad");
      return;
    }

    // Check if image editing is enabled and there are any image changes
    const imageChangesDetected =
      imageEditingEnabled && imageManager.hasImageChanges();

    // Ensure all required fields are properly typed
    const propertyData: EditPropertyData = {
      title: data.title,
      property_type: data.property_type,
      transaction_type: data.transaction_type,
      price: parseFloat(data.price),
      currency: data.currency,
      city: data.city,
      district: data.district,
      province: data.province,
      address: data.address,
      area: parseFloat(data.area),
      built_area: data.built_area ? parseFloat(data.built_area) : undefined,
      bedrooms: data.bedrooms ? parseInt(data.bedrooms, 10) : undefined,
      bathrooms: data.bathrooms ? parseInt(data.bathrooms, 10) : undefined,
      parking: data.parking ? parseInt(data.parking, 10) : undefined,
      description: data.description,
      agent_id: data.agent_id,
      age: data.age ? parseInt(data.age, 10) : undefined,
    };

    const result = await updateProperty(
      propertyCode,
      propertyData,
      imageEditingEnabled ? imageManager.newImages : undefined,
      undefined,
      imageEditingEnabled ? imageManager.deletedImages : undefined,
      imageEditingEnabled
        ? imageManager.currentImages.length + imageManager.deletedImages.length
        : undefined,
      selectedAmenities,
      imageEditingEnabled ? imageManager.imageOrder : undefined,
      imageEditingEnabled ? imageManager.mainImageId : undefined,
      imageEditingEnabled ? imageManager.getAllImages() : undefined,
      imageChangesDetected // Pass the image changes flag
    );

    if (result.success) {
      form.reset();
      setIsOpen(false);
      setImageEditingEnabled(false); // Reset image editing state
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {!isControlled && (
        <DialogTrigger asChild>
          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </DropdownMenuItem>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Propiedad</DialogTitle>
          <DialogDescription>
            Modifica la información de la propiedad "{property.title}". Los
            cambios se guardarán inmediatamente.
          </DialogDescription>
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
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar tipo" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Casa">Casa</SelectItem>
                                <SelectItem value="Departamento">
                                  Departamento
                                </SelectItem>
                                <SelectItem value="Terreno">Terreno</SelectItem>
                                <SelectItem value="Oficina">Oficina</SelectItem>
                                <SelectItem value="Local">
                                  Local Comercial
                                </SelectItem>
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
                              value={field.value}
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
                      />

                      <FormField
                        control={form.control}
                        name="currency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Moneda</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
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
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
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
                              <Input
                                type="number"
                                placeholder="2"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(parseInt(e.target.value) || 0)
                                }
                              />
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
                    <CardTitle className="flex items-center justify-between">
                      Imágenes de la Propiedad
                      {!imageEditingEnabled && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleEnableImageEditing}
                          className="text-sm"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Habilitar Edición de Imágenes
                        </Button>
                      )}
                    </CardTitle>
                    {!imageEditingEnabled && (
                      <p className="text-sm text-muted-foreground">
                        La edición de imágenes está deshabilitada. Haz clic en
                        el botón para habilitar la edición de imágenes.
                      </p>
                    )}
                    {imageEditingEnabled && (
                      <p className="text-sm text-orange-600 bg-orange-50 p-2 rounded-md">
                        ⚠️ Modo de edición de imágenes habilitado. Los cambios
                        en las imágenes se procesarán junto con los datos de la
                        propiedad.
                      </p>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {imageEditingEnabled ? (
                      <>
                        <div
                          className={`border-2 border-dashed rounded-lg p-6 text-center ${
                            isDragging
                              ? "border-blue-400 bg-blue-50"
                              : "border-gray-300"
                          }`}
                          onDrop={handleDrop}
                          onDragOver={handleDragOver}
                          onDragEnter={handleDragEnter}
                          onDragLeave={handleDragLeave}
                        >
                          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600 mb-2">
                            Arrastra las imágenes aquí o haz clic para
                            seleccionar
                          </p>
                          <p className="text-xs text-gray-500 mb-4">
                            Solo se muestran las imágenes numeradas del
                            carrusel. La primera imagen está marcada como
                            principal por defecto. Arrastra y suelta las
                            imágenes para reorganizar el orden.
                          </p>
                          <Input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageSelect}
                            className="hidden"
                            id="image-upload"
                          />
                          <Button variant="outline" asChild>
                            <label
                              htmlFor="image-upload"
                              className="cursor-pointer"
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              Seleccionar Imágenes
                            </label>
                          </Button>
                        </div>

                        {/* Current Images */}
                        {imageManager.loading ? (
                          <div className="text-center py-4">
                            Cargando imágenes...
                          </div>
                        ) : (
                          <>
                            {imageManager.getAllImages().length > 0 && (
                              <div className="space-y-4">
                                <h4 className="font-medium">
                                  Imágenes Actuales (
                                  {imageManager.getAllImages().length})
                                </h4>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                  {imageManager
                                    .getAllImages()
                                    .map((image, index) => (
                                      <div
                                        key={image.id}
                                        draggable
                                        onDragStart={(e) =>
                                          handleImageDragStart(e, image.id)
                                        }
                                        onDragEnd={handleImageDragEnd}
                                        onDragOver={handleImageDragOver}
                                        onDragEnter={(e) =>
                                          handleImageDragEnter(e, image.id)
                                        }
                                        onDragLeave={handleImageDragLeave}
                                        onDrop={(e) =>
                                          handleImageDrop(e, image.id)
                                        }
                                        className={`relative group border-2 rounded-lg overflow-hidden cursor-move transition-all duration-200 ${
                                          image.id === imageManager.mainImageId
                                            ? "border-blue-500 ring-2 ring-blue-200"
                                            : "border-gray-200"
                                        } ${
                                          draggedImageId === image.id
                                            ? "opacity-50 scale-105 rotate-2"
                                            : ""
                                        } ${
                                          dragOverImageId === image.id
                                            ? "border-green-400 bg-green-50"
                                            : ""
                                        }`}
                                      >
                                        <img
                                          src={image.url}
                                          alt={`Imagen ${index + 1}`}
                                          className="w-full h-32 object-cover pointer-events-none"
                                        />
                                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                                          <div className="opacity-0 group-hover:opacity-100 flex space-x-2">
                                            {image.id !==
                                              imageManager.mainImageId && (
                                              <Button
                                                type="button"
                                                size="sm"
                                                variant="secondary"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  imageManager.setAsMainImage(
                                                    image.id
                                                  );
                                                }}
                                              >
                                                Principal
                                              </Button>
                                            )}
                                            <Button
                                              type="button"
                                              size="sm"
                                              variant="destructive"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                if (
                                                  "isNew" in image &&
                                                  image.isNew
                                                ) {
                                                  const newImageIndex =
                                                    parseInt(
                                                      image.id.split("-")[1]
                                                    );
                                                  imageManager.removeNewImage(
                                                    newImageIndex
                                                  );
                                                } else {
                                                  imageManager.removeCurrentImage(
                                                    image.id
                                                  );
                                                }
                                              }}
                                            >
                                              ✕
                                            </Button>
                                          </div>
                                        </div>
                                        {image.id ===
                                          imageManager.mainImageId && (
                                          <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                                            Principal
                                          </div>
                                        )}
                                        <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                                          {index + 1}
                                        </div>
                                        {draggedImageId === image.id && (
                                          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                                            <div className="bg-white rounded-full p-2 shadow-lg">
                                              <svg
                                                className="w-4 h-4 text-gray-600"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                              >
                                                <path d="M10 2L3 8h4v8h6V8h4l-7-6z" />
                                              </svg>
                                            </div>
                                          </div>
                                        )}
                                        {dragOverImageId === image.id && (
                                          <div className="absolute inset-0 flex items-center justify-center bg-green-500 bg-opacity-20">
                                            <div className="bg-green-500 text-white rounded-full p-1 shadow-lg">
                                              <svg
                                                className="w-4 h-4"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                              >
                                                <path
                                                  fillRule="evenodd"
                                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                  clipRule="evenodd"
                                                />
                                              </svg>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Upload className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-lg font-medium mb-2">
                          Edición de Imágenes Deshabilitada
                        </p>
                        <p className="text-sm">
                          Para editar las imágenes de la propiedad, habilita la
                          edición de imágenes usando el botón de arriba.
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          Si no habilitas la edición de imágenes, solo se
                          actualizarán los datos de la propiedad en la base de
                          datos.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end space-x-4 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                <Save className="w-4 h-4 mr-2" />
                {isSubmitting ? "Actualizando..." : "Actualizar Propiedad"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
