import { useState, useEffect } from "react";
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
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Send } from "lucide-react";
import { usePropertyChangeRequest } from "@/hooks/usePropertyChangeRequest";
import { usePropertyAmenities } from "@/hooks/usePropertyAmenities";
import { AmenitiesSelector } from "@/components/AmenitiesSelector";

const propertySchema = z.object({
  title: z.string().min(1, "El título es obligatorio"),
  property_type: z.enum(["Casa", "Departamento", "Terreno", "Oficina", "Local"]),
  transaction_type: z.enum(["venta", "alquiler", "anticresis"]),
  price: z.number().min(1, "El precio debe ser mayor a 0"),
  currency: z.enum(["PEN", "USD"]),
  city: z.string().min(1, "La ciudad es obligatoria"),
  district: z.string().min(1, "El distrito es obligatorio"),
  province: z.string().optional(),
  area: z.number().min(1, "El área debe ser mayor a 0"),
  built_area: z.number().optional(),
  bedrooms: z.number().min(0).optional(),
  bathrooms: z.number().min(0).optional(),
  parking: z.number().min(0).optional(),
  description: z.string().optional(),
  age: z.number().min(0).optional(),
  request_notes: z.string().min(10, "Por favor describe el motivo de los cambios (mínimo 10 caracteres)"),
});

type PropertyFormData = z.infer<typeof propertySchema>;

interface ProposeChangeModalProps {
  property: any;
  agentId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ProposeChangeModal = ({
  property,
  agentId,
  open,
  onOpenChange,
}: ProposeChangeModalProps) => {
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const { mutate: createChangeRequest, isPending } = usePropertyChangeRequest();
  const { data: currentAmenities = [] } = usePropertyAmenities(property.id);

  const form = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      transaction_type: "venta",
      currency: "PEN",
      bedrooms: 0,
      bathrooms: 0,
      parking: 0,
    },
  });

  useEffect(() => {
    if (property && open) {
      const formData: PropertyFormData = {
        title: property.title || "",
        property_type: property.property_type || property.type as any || "Casa",
        transaction_type: property.transaction_type || "venta",
        price: property.price || 0,
        currency: property.currency || "PEN",
        city: property.city || property.location?.split(",")[1]?.trim() || "",
        district: property.district || property.location?.split(",")[0]?.trim() || "",
        province: property.province || property.location?.split(",")[2]?.trim(),
        area: property.area ? parseFloat(property.area) : 0,
        built_area: property.built_area ? parseFloat(property.built_area) : undefined,
        bedrooms: property.bedrooms || 0,
        bathrooms: property.bathrooms || 0,
        parking: property.parking || 0,
        description: property.description || "",
        age: property.age || undefined,
        request_notes: "",
      };

      form.reset(formData);
    }
  }, [property, open, form]);

  useEffect(() => {
    if (open && currentAmenities.length >= 0) {
      setSelectedAmenities(currentAmenities);
    }
  }, [open, currentAmenities]);

  const onSubmit = async (data: PropertyFormData) => {
    const { request_notes, ...propertyData } = data;

    createChangeRequest(
      {
        propertyId: property.id,
        propertyCode: property.property_code || property.id,
        agentId,
        data: propertyData as any,
        amenities: selectedAmenities,
        requestNotes: request_notes,
        originalProperty: property,
      },
      {
        onSuccess: () => {
          form.reset();
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="w-5 h-5" />
            Proponer Cambios a Propiedad
          </DialogTitle>
        </DialogHeader>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-yellow-800">
            <strong>Nota:</strong> Esta propiedad pertenece a otro agente. Los cambios que propongas
            serán enviados al administrador para su revisión y aprobación.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Información Básica</TabsTrigger>
                <TabsTrigger value="details">Detalles</TabsTrigger>
                <TabsTrigger value="amenities">Comodidades</TabsTrigger>
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
                            <Input placeholder="Ej: Casa moderna en Miraflores" {...field} />
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
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar tipo" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Casa">Casa</SelectItem>
                                <SelectItem value="Departamento">Departamento</SelectItem>
                                <SelectItem value="Terreno">Terreno</SelectItem>
                                <SelectItem value="Oficina">Oficina</SelectItem>
                                <SelectItem value="Local">Local Comercial</SelectItem>
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
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar transacción" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="venta">Venta</SelectItem>
                                <SelectItem value="alquiler">Alquiler</SelectItem>
                                <SelectItem value="anticresis">Anticrésis</SelectItem>
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
                                type="number"
                                placeholder="450000"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
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
                            <Select onValueChange={field.onChange} value={field.value}>
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
                                type="number"
                                placeholder="120"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
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
                            <FormLabel>Área Construida (m²) - Opcional</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="100"
                                {...field}
                                value={field.value || ""}
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value ? parseFloat(e.target.value) : undefined
                                  )
                                }
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
                              <Input
                                type="number"
                                min="0"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              />
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
                              <Input
                                type="number"
                                min="0"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              />
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
                                min="0"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
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
                          <FormLabel>Antigüedad (años) - Opcional</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              placeholder="5"
                              {...field}
                              value={field.value || ""}
                              onChange={(e) =>
                                field.onChange(e.target.value ? parseInt(e.target.value) : undefined)
                              }
                            />
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
                          <FormLabel>Descripción - Opcional</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe las características de la propiedad..."
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="amenities" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Comodidades y Características</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <AmenitiesSelector
                      selectedAmenities={selectedAmenities}
                      onSelectionChange={setSelectedAmenities}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Request Notes - Always visible */}
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="text-base">Motivo de la Solicitud *</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="request_notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Explica por qué propones estos cambios (mínimo 10 caracteres)
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Ejemplo: Actualización de precio según valorización reciente del mercado..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>Enviando...</>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Enviar Solicitud
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
