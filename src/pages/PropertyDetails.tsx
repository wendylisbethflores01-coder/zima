import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProperty } from "@/hooks/useProperties";
import { usePropertyImages } from "@/hooks/usePropertyImages";
import { useSimilarProperties } from "@/hooks/useSimilarProperties";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { getAmenityIcon } from "@/lib/iconUtils";
import SimpleMapEmbed from "@/components/SimpleMapEmbed";
import {
  ArrowLeft,
  Heart,
  Share2,
  Phone,
  Mail,
  MapPin,
  Bed,
  Bath,
  Car,
  Maximize,
  Calendar,
  Eye,
  Camera,
  Map,
  Building,
  Ruler,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Home,
  ShoppingCart,
  GraduationCap,
  Cross,
  Zap,
  Trees,
  Utensils,
  Fuel,
  CreditCard,
  Pill,
  Bus,
  Train,
  Car as CarIcon,
  Bike,
  FileText,
  Download,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

const PropertyDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const { user } = useAuth();
  const { property, loading, error } = useProperty(id || "");
  const { images, loading: imagesLoading } = usePropertyImages(id || "");

  // Reset image index when images change or are empty
  useEffect(() => {
    if (images.length === 0 || currentImageIndex >= images.length) {
      setCurrentImageIndex(0);
    }
  }, [images.length, currentImageIndex]);

  // Extract location components for similar properties search
  const locationParts = property?.location?.split(", ") || [];
  const district = locationParts[2] || "";
  const city = locationParts[1] || "";
  const province = locationParts[0] || "";

  const { data: similarProperties, isLoading: similarLoading } =
    useSimilarProperties({
      currentPropertyId: property?.id,
      district,
      city,
      province,
      transactionType: property?.transaction_type,
      propertyType: property?.type,
    });

  if (loading || imagesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Cargando propiedad...</h2>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Propiedad no encontrada</h2>
          <p className="text-gray-600 mb-4">
            {error || "La propiedad que buscas no existe o no está disponible."}
          </p>
          <Button onClick={() => navigate("/propiedades")}>
            Volver a propiedades
          </Button>
        </div>
      </div>
    );
  }

  // Images are now loaded from the custom hook

  // Format property age display
  const formatPropertyAge = () => {
    if (!property.age) {
      return "N/A";
    }

    if (property.age === 0) {
      return "Nuevo";
    } else if (property.age === 1) {
      return "1 año";
    } else {
      return `${property.age} años`;
    }
  };

  const features = [
    { icon: Bed, label: "Dormitorios", value: property.bedrooms || "N/A" },
    { icon: Bath, label: "Baños", value: property.bathrooms || "N/A" },
    { icon: Car, label: "Estacionamientos", value: property.parking || "0" },
    { icon: Maximize, label: "Área Total", value: property.area },
    {
      icon: Building,
      label: "Área Construida",
      value: property.builtArea || "N/A",
    },
    { icon: Calendar, label: "Antigüedad", value: formatPropertyAge() },
  ];

  const nearbyPlaces = [
    { icon: ShoppingCart, name: "Centro Comercial", distance: "500m" },
    { icon: ShoppingCart, name: "Supermercado", distance: "300m" },
    { icon: GraduationCap, name: "Colegio", distance: "800m" },
    { icon: Cross, name: "Hospital", distance: "1.2km" },
    { icon: Train, name: "Estación de Metro", distance: "1.5km" },
    { icon: Trees, name: "Parque", distance: "200m" },
    { icon: Utensils, name: "Restaurantes", distance: "400m" },
    { icon: Fuel, name: "Estación de Servicio", distance: "600m" },
    { icon: CreditCard, name: "Banco", distance: "350m" },
    { icon: Pill, name: "Farmacia", distance: "250m" },
  ];

  const handleDownloadReport = async (
    orientation: "vertical" | "horizontal",
  ) => {
    if (!id) return;

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
            propertyId: id,
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
      a.download = `propiedad-${id}-${orientation}.pdf`;
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button variant="outline" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver a la búsqueda
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <Card className="overflow-hidden">
              <div className="relative">
                <img
                  src={
                    images.length > 0
                      ? images[currentImageIndex]
                      : property.image
                  }
                  alt={property.title}
                  className="w-full h-96 object-cover transition-all duration-500 ease-in-out"
                />

                {/* Property Type Badge */}
                <Badge className="absolute top-4 left-4 bg-primary text-white">
                  {property.type.toUpperCase()}
                </Badge>

                {/* Property ID */}
                <Badge className="absolute top-4 right-4 bg-black/70 text-white">
                  ID: {property.id}
                </Badge>

                {/* Navigation Arrows - Only show if there are multiple images */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setCurrentImageIndex(
                          currentImageIndex === 0
                            ? images.length - 1
                            : currentImageIndex - 1,
                        )
                      }
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-200"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() =>
                        setCurrentImageIndex(
                          currentImageIndex === images.length - 1
                            ? 0
                            : currentImageIndex + 1,
                        )
                      }
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-200"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                {/* Image Navigation Dots - Only show if there are multiple images */}
                {images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-3 h-3 rounded-full transition-all duration-200 ${
                          index === currentImageIndex
                            ? "bg-white scale-110"
                            : "bg-white/50 hover:bg-white/70"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </Card>

            {/* Property Information */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl text-gray-900 mb-2">
                      {property.title}
                    </CardTitle>
                    <div className="flex items-center text-gray-600 mb-4">
                      <MapPin className="w-4 h-4 mr-2" />
                      {property.location}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {user && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setReportDialogOpen(true)}
                      >
                        <FileText className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsFavorite(!isFavorite)}
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          isFavorite ? "fill-red-500 text-red-500" : ""
                        }`}
                      />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Price */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-3xl font-bold text-primary mb-1">
                    {property.formattedPrice}
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <Tabs defaultValue="details" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="details">Detalles</TabsTrigger>
                    <TabsTrigger value="amenities">Comodidades</TabsTrigger>
                    <TabsTrigger value="location">Ubicación</TabsTrigger>
                  </TabsList>

                  <TabsContent value="details" className="space-y-6">
                    {/* Features Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {features.map((feature, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <feature.icon className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <div className="text-sm text-gray-600">
                              {feature.label}
                            </div>
                            <div className="font-semibold">{feature.value}</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Separator />

                    {/* Description */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3">
                        Descripción
                      </h3>
                      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                        <p
                          className="text-gray-700 leading-relaxed whitespace-pre-line text-justify"
                          style={{
                            lineHeight: "1.5",
                            wordSpacing: "0.05em",
                          }}
                        >
                          {property.description ||
                            "Sin descripción disponible."}
                        </p>
                      </div>
                    </div>

                    <Separator />

                    {/* Additional Details */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3">
                        Información Adicional
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-gray-600">
                            Código de Propiedad
                          </div>
                          <div className="font-semibold">{property.id}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Estado</div>
                          <div className="font-semibold text-green-600">
                            Disponible
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">
                            Tipo de Negocio
                          </div>
                          <div className="font-semibold capitalize">
                            {property.transaction_type}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">
                            Fecha de Publicación
                          </div>
                          <div className="font-semibold">
                            {new Date(property.created_at).toLocaleDateString(
                              "es-ES",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              },
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="amenities" className="space-y-4">
                    <h3 className="text-lg font-semibold">
                      Comodidades y Servicios
                    </h3>
                    {property.amenities && property.amenities.length > 0 ? (
                      <div className="grid grid-cols-2 gap-3">
                        {property.amenities.map((amenity) => {
                          const IconComponent = getAmenityIcon(amenity.icon);
                          return (
                            <div
                              key={amenity.id}
                              className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm">
                                <IconComponent className="w-4 h-4 text-primary" />
                              </div>
                              <span className="text-gray-700 font-medium">
                                {amenity.name}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-8">
                        No hay comodidades registradas para esta propiedad.
                      </p>
                    )}
                  </TabsContent>

                  <TabsContent value="location" className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <Map className="w-5 h-5 mr-2 text-primary" />
                        Ubicación de la Propiedad
                      </h3>

                      <div className="space-y-4">
                        <div className="flex items-start space-x-2 text-gray-600 bg-gray-50 p-3 rounded-lg">
                          <MapPin className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                          <div className="flex-1">
                            <span className="text-sm">{property.location}</span>
                            {property.address &&
                              property.address !== property.location && (
                                <div className="text-xs text-gray-500 mt-1">
                                  <strong>Dirección:</strong> {property.address}
                                </div>
                              )}
                          </div>
                        </div>

                        <SimpleMapEmbed
                          address={property.address || property.location}
                          propertyTitle={property.title}
                          height="350px"
                        />
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Agent Contact Card */}
            <Card>
              <CardHeader>
                <CardTitle>Contactar Agente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 mb-6">
                  <img
                    src={property.agent.avatar}
                    alt={property.agent.name}
                    className="w-16 h-16 rounded-full"
                  />
                  <div>
                    <h3 className="font-semibold text-lg">
                      {property.agent.name}
                    </h3>
                    <p className="text-gray-600">Agente Inmobiliario</p>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <Eye className="w-4 h-4 mr-1" />
                      Especialista en {property.location.split(",")[0]}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button className="w-full btn-hero bg-primary hover:bg-primary/90">
                    <Phone className="w-4 h-4 mr-2" />
                    Llamar Ahora
                  </Button>
                  <Button
                    className="w-full bg-green-500 hover:bg-green-600 text-white"
                    onClick={() =>
                      window.open(
                        `https://wa.me/${property.agent.phone.replace(/[\s+]/g, "")}?text=Hola, estoy interesado en la propiedad ID: ${property.id} - ${property.title}`,
                        "_blank",
                      )
                    }
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Contactar por WhatsApp
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Mail className="w-4 h-4 mr-2" />
                    Enviar Email
                  </Button>
                </div>

                {/* <Separator className="my-4" />

                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">¿Necesitas financiamiento?</p>
                  <Button variant="outline" size="sm" className="w-full">
                    Simular Crédito Hipotecario
                  </Button>
                </div> */}
              </CardContent>
            </Card>

            {/* Similar Properties */}
            <Card>
              <CardHeader>
                <CardTitle>Propiedades Similares</CardTitle>
              </CardHeader>
              <CardContent>
                {similarLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((item) => (
                      <div key={item} className="flex space-x-3 animate-pulse">
                        <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : similarProperties && similarProperties.length > 0 ? (
                  <div className="space-y-4">
                    {similarProperties.map((similarProperty) => (
                      <div
                        key={similarProperty.id}
                        className="flex space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                        onClick={() =>
                          navigate(`/propiedad/${similarProperty.id}`)
                        }
                      >
                        <img
                          src={similarProperty.image}
                          alt={similarProperty.title}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-sm line-clamp-2">
                            {similarProperty.title}
                          </h4>
                          <p className="text-primary font-semibold text-sm">
                            {similarProperty.formattedPrice}
                          </p>
                          <p className="text-gray-500 text-xs">
                            {similarProperty.bedrooms || 0} hab •{" "}
                            {similarProperty.bathrooms || 0} baños
                          </p>
                        </div>
                      </div>
                    ))}
                    {similarProperties.length > 0 && (
                      <Button
                        variant="outline"
                        className="w-full mt-4"
                        onClick={() =>
                          navigate(
                            `/propiedades?location=${encodeURIComponent(
                              city || province,
                            )}`,
                          )
                        }
                      >
                        Ver Más en {city || province}
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 text-sm">
                      No se encontraron propiedades similares
                    </p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => navigate("/propiedades")}
                    >
                      Ver Todas las Propiedades
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />

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

export default PropertyDetails;
