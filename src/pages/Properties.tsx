import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  Grid3X3,
  List,
  MapPin,
  ArrowUpDown,
  SlidersHorizontal,
  Loader2,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useProperties } from "@/hooks/useProperties";
import { usePropertyTypes } from "@/hooks/usePropertyTypes";
import { LocationCombobox } from "@/components/LocationCombobox";

const Properties = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const propertiesPerPage = 12;

  // Mapping between URL params and property type names
  const urlToPropertyTypeMap = useMemo(
    () => ({
      casa: "Casa",
      departamento: "Departamento",
      terreno: "Terreno",
      comercial: "Local Comercial",
      industrial: "Local Industrial",
    }),
    []
  );

  const propertyTypeToUrlMap = useMemo(
    () => ({
      Casa: "casa",
      Departamento: "departamento",
      Terreno: "terreno",
      "Local Comercial": "comercial",
      "Local Industrial": "industrial",
    }),
    []
  );

  const [filters, setFilters] = useState({
    search: "",
    propertyType: "todos",
    transactionType: "",
    location: "",
    minPrice: "",
    maxPrice: "",
    currency: "PEN",
    bedrooms: "cualquiera",
    bathrooms: "cualquiera",
    minArea: "",
    maxArea: "",
    propertyCode: "",
    maxAge: "",
    floors: "todos",
    halfBathrooms: "cualquiera",
    parking: "cualquiera",
    garageType: "todos",
    sortBy: "recent",
  });

  // Convert filter state to useProperties format
  const propertyFilters = {
    search: filters.search || undefined,
    propertyType:
      filters.propertyType !== "todos" ? filters.propertyType : undefined,
    transactionType: filters.transactionType || undefined,
    location: filters.location || undefined,
    minPrice: filters.minPrice ? parseFloat(filters.minPrice) : undefined,
    maxPrice: filters.maxPrice ? parseFloat(filters.maxPrice) : undefined,
    bedrooms:
      filters.bedrooms !== "cualquiera"
        ? parseInt(filters.bedrooms)
        : undefined,
    bedroomsMin: searchParams.get("habitacionesMin")
      ? parseInt(searchParams.get("habitacionesMin")!)
      : undefined,
    bedroomsMax: searchParams.get("habitacionesMax")
      ? parseInt(searchParams.get("habitacionesMax")!)
      : undefined,
    bathrooms:
      filters.bathrooms !== "cualquiera"
        ? parseInt(filters.bathrooms)
        : undefined,
    sortBy: filters.sortBy,
    agentId: searchParams.get("agentId") || undefined,
  };

  // Initialize filters from URL params on component mount
  useEffect(() => {
    const urlTypeParam =
      searchParams.get("tipo") ||
      searchParams.get("propertyType") ||
      searchParams.get("type");
    const mappedPropertyType = urlTypeParam
      ? urlToPropertyTypeMap[urlTypeParam] || urlTypeParam
      : "todos";

    // Auto-apply "venta" transaction type for specific property types
    const shouldApplyVentaFilter =
      urlTypeParam &&
      ["casa", "departamento", "terreno"].includes(urlTypeParam);

    const initialFilters = {
      search: searchParams.get("search") || "",
      propertyType: mappedPropertyType,
      transactionType: shouldApplyVentaFilter
        ? "venta"
        : searchParams.get("transaccion") ||
          searchParams.get("transactionType") ||
          "",
      location:
        searchParams.get("ubicacion") || searchParams.get("location") || "",
      minPrice:
        searchParams.get("precioMin") || searchParams.get("minPrice") || "",
      maxPrice:
        searchParams.get("precioMax") || searchParams.get("maxPrice") || "",
      currency:
        searchParams.get("moneda") || searchParams.get("currency") || "PEN",
      bedrooms:
        searchParams.get("habitacionesMin") ||
        searchParams.get("bedrooms") ||
        "cualquiera",
      bathrooms:
        searchParams.get("banos") ||
        searchParams.get("bathrooms") ||
        "cualquiera",
      minArea: searchParams.get("minArea") || "",
      maxArea: searchParams.get("maxArea") || "",
      propertyCode: searchParams.get("codigo") || "",
      maxAge: searchParams.get("antiguedad") || "",
      floors: searchParams.get("pisos") || "todos",
      halfBathrooms: searchParams.get("mediosBanos") || "cualquiera",
      parking: searchParams.get("cocheras") || "cualquiera",
      garageType: searchParams.get("tipoCochera") || "todos",
      sortBy: searchParams.get("sortBy") || "recent",
    };
    setFilters(initialFilters);
  }, [searchParams, urlToPropertyTypeMap]);

  // Sync URL params and log property type filter
  useEffect(() => {
    const urlTypeParam =
      searchParams.get("type") ||
      searchParams.get("tipo") ||
      searchParams.get("propertyType");
    const mappedPropertyType = urlTypeParam
      ? urlToPropertyTypeMap[urlTypeParam] || urlTypeParam
      : null;

    if (mappedPropertyType && mappedPropertyType !== "todos") {
      console.log("Filtro de tipo de propiedad activo:", mappedPropertyType);

      // Check if venta filter was auto-applied
      if (
        urlTypeParam &&
        ["casa", "departamento", "terreno"].includes(urlTypeParam)
      ) {
        console.log("Filtro de tipo de negocio auto-aplicado: venta");
      }
    } else {
      console.log("Sin filtro de tipo de propiedad aplicado");
    }
  }, [searchParams, urlToPropertyTypeMap]);

  const {
    properties: filteredProperties,
    loading,
    error,
  } = useProperties(propertyFilters);

  const { data: propertyTypes = [], isLoading: propertyTypesLoading } =
    usePropertyTypes();

  // Calculate pagination
  const totalPages = Math.ceil(filteredProperties.length / propertiesPerPage);
  const startIndex = (currentPage - 1) * propertiesPerPage;
  const endIndex = startIndex + propertiesPerPage;
  const currentProperties = filteredProperties.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    filters.search,
    filters.propertyType,
    filters.transactionType,
    filters.location,
    filters.minPrice,
    filters.maxPrice,
    filters.bedrooms,
    filters.bathrooms,
  ]);

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show pages with ellipsis
      if (currentPage <= 3) {
        // Near the beginning
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Near the end
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // In the middle
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const handlePropertyClick = (property: { id: string }) => {
    window.open(`/propiedad/${property.id}`, "_blank");
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));

    // Update URL params when property type filter changes
    if (key === "propertyType") {
      const newSearchParams = new URLSearchParams(searchParams);
      if (value !== "todos" && propertyTypeToUrlMap[value]) {
        newSearchParams.set("type", propertyTypeToUrlMap[value]);
      } else {
        newSearchParams.delete("type");
        newSearchParams.delete("tipo");
        newSearchParams.delete("propertyType");
      }
      setSearchParams(newSearchParams);
    }
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      propertyType: "todos",
      transactionType: "",
      location: "",
      minPrice: "",
      maxPrice: "",
      currency: "PEN",
      bedrooms: "cualquiera",
      bathrooms: "cualquiera",
      minArea: "",
      maxArea: "",
      propertyCode: "",
      maxAge: "",
      floors: "todos",
      halfBathrooms: "cualquiera",
      parking: "cualquiera",
      garageType: "todos",
      sortBy: "recent",
    });

    // Clear URL parameters
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Page Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Buscar Propiedades
              </h1>
              <p className="text-gray-600 mt-1">
                Encontramos {filteredProperties.length} propiedades disponibles
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Label>Ver como:</Label>
                <div className="flex border rounded-lg">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="rounded-r-none"
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="rounded-l-none"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden"
              >
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Filtros
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div
            className={`lg:w-80 ${showFilters ? "block" : "hidden lg:block"}`}
          >
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Filtros de Búsqueda
                  <Button variant="outline" size="sm" onClick={clearFilters}>
                    Limpiar
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Search Input */}
                <div>
                  <Label>Búsqueda por palabra clave</Label>
                  <div className="relative mt-1">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Buscar por título o ubicación..."
                      value={filters.search}
                      onChange={(e) =>
                        handleFilterChange("search", e.target.value)
                      }
                      className="pl-10"
                    />
                  </div>
                </div>

                {error && (
                  <div className="text-red-600 text-sm p-2 bg-red-50 rounded">
                    {error}
                  </div>
                )}

                {/* Property Type */}
                <div>
                  <Label>Tipo de Propiedad</Label>
                  <Select
                    value={filters.propertyType}
                    onValueChange={(value) =>
                      handleFilterChange("propertyType", value)
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Todos los tipos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos los tipos</SelectItem>
                      {propertyTypesLoading ? (
                        <SelectItem value="loading" disabled>
                          <div className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Cargando tipos...
                          </div>
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
                </div>

                {/* Transaction Type */}
                <div>
                  <Label>Tipo de Negocio</Label>
                  <div className="flex gap-2 mt-1">
                    <Button
                      variant={
                        filters.transactionType === "venta"
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={() =>
                        handleFilterChange(
                          "transactionType",
                          filters.transactionType === "venta" ? "" : "venta"
                        )
                      }
                      className="flex-1"
                    >
                      Venta
                    </Button>
                    <Button
                      variant={
                        filters.transactionType === "alquiler"
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={() =>
                        handleFilterChange(
                          "transactionType",
                          filters.transactionType === "alquiler"
                            ? ""
                            : "alquiler"
                        )
                      }
                      className="flex-1"
                    >
                      Alquiler
                    </Button>
                    <Button
                      variant={
                        filters.transactionType === "anticresis"
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={() =>
                        handleFilterChange(
                          "transactionType",
                          filters.transactionType === "anticresis"
                            ? ""
                            : "anticresis"
                        )
                      }
                      className="flex-1"
                    >
                      Anticresis
                    </Button>
                  </div>
                </div>

                {/* Location */}
                <div>
                  <Label>Ubicación</Label>
                  <div className="mt-1">
                    <LocationCombobox
                      value={filters.location}
                      onValueChange={(value) =>
                        handleFilterChange("location", value)
                      }
                      placeholder="Ciudad, distrito..."
                      className="h-10 rounded-lg"
                    />
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <Label>Rango de Precio</Label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <Input
                      placeholder="Mínimo"
                      value={filters.minPrice}
                      onChange={(e) =>
                        handleFilterChange("minPrice", e.target.value)
                      }
                    />
                    <Input
                      placeholder="Máximo"
                      value={filters.maxPrice}
                      onChange={(e) =>
                        handleFilterChange("maxPrice", e.target.value)
                      }
                    />
                  </div>
                  <Select
                    value={filters.currency}
                    onValueChange={(value) =>
                      handleFilterChange("currency", value)
                    }
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PEN">Soles (S/)</SelectItem>
                      <SelectItem value="USD">Dólares (USD)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Bedrooms/Bathrooms */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Dormitorios</Label>
                    <Select
                      value={filters.bedrooms}
                      onValueChange={(value) =>
                        handleFilterChange("bedrooms", value)
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Cualquiera" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cualquiera">Cualquiera</SelectItem>
                        <SelectItem value="1">1+</SelectItem>
                        <SelectItem value="2">2+</SelectItem>
                        <SelectItem value="3">3+</SelectItem>
                        <SelectItem value="4">4+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Baños</Label>
                    <Select
                      value={filters.bathrooms}
                      onValueChange={(value) =>
                        handleFilterChange("bathrooms", value)
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Cualquiera" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cualquiera">Cualquiera</SelectItem>
                        <SelectItem value="1">1+</SelectItem>
                        <SelectItem value="2">2+</SelectItem>
                        <SelectItem value="3">3+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Property Code */}
                <div>
                  <Label>Código de Propiedad</Label>
                  <Input
                    placeholder="Ej: 1145054"
                    value={filters.propertyCode}
                    onChange={(e) =>
                      handleFilterChange("propertyCode", e.target.value)
                    }
                    className="mt-1"
                  />
                </div>

                {/* Area Range */}
                <div>
                  <Label>Área (m²)</Label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <Input
                      placeholder="Mínimo"
                      value={filters.minArea}
                      onChange={(e) =>
                        handleFilterChange("minArea", e.target.value)
                      }
                    />
                    <Input
                      placeholder="Máximo"
                      value={filters.maxArea}
                      onChange={(e) =>
                        handleFilterChange("maxArea", e.target.value)
                      }
                    />
                  </div>
                </div>

                {/* Advanced Filters Section */}

                {/* Apply Filters Button */}
                <Button
                  onClick={clearFilters}
                  variant="outline"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? "Buscando..." : "Limpiar Filtros"}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Properties Grid/List */}
          <div className="flex-1">
            {/* Sort and Results Info */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
              <p className="text-gray-600">
                {loading
                  ? "Cargando propiedades..."
                  : `Mostrando ${startIndex + 1}-${Math.min(
                      endIndex,
                      filteredProperties.length
                    )} de ${filteredProperties.length} propiedades`}
              </p>

              <div className="flex items-center gap-2">
                <Label>Ordenar por:</Label>
                <Select
                  value={filters.sortBy}
                  onValueChange={(value) => handleFilterChange("sortBy", value)}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Más Recientes</SelectItem>
                    <SelectItem value="price-low">
                      Precio: Menor a Mayor
                    </SelectItem>
                    <SelectItem value="price-high">
                      Precio: Mayor a Menor
                    </SelectItem>
                    <SelectItem value="area-large">
                      Área: Mayor a Menor
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }, (_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-lg overflow-hidden animate-pulse"
                  >
                    <div className="h-64 bg-gray-200"></div>
                    <div className="p-4">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-6 bg-gray-200 rounded mb-3"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Properties Grid */}
            {!loading && currentProperties.length > 0 && (
              <div
                className={`grid gap-6 ${
                  viewMode === "grid"
                    ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                    : "grid-cols-1"
                }`}
              >
                {currentProperties.map((property, index) => (
                  <div
                    key={property.id}
                    className="animate-fade-in-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <PropertyCard
                      {...property}
                      onClick={() => handlePropertyClick(property)}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* No Results */}
            {!loading && filteredProperties.length === 0 && (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No se encontraron propiedades
                </h3>
                <p className="text-gray-600 mb-6">
                  Intenta ajustar tus filtros de búsqueda para obtener más
                  resultados.
                </p>
                <Button onClick={clearFilters} variant="outline">
                  Limpiar todos los filtros
                </Button>
              </div>
            )}

            {/* Pagination */}
            {!loading && filteredProperties.length > 0 && totalPages > 1 && (
              <div className="flex justify-center mt-12">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                  >
                    Anterior
                  </Button>

                  {getPageNumbers().map((page, index) => {
                    if (page === "...") {
                      return (
                        <span
                          key={`ellipsis-${index}`}
                          className="px-2 text-gray-500"
                        >
                          ...
                        </span>
                      );
                    }

                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => goToPage(page as number)}
                      >
                        {page}
                      </Button>
                    );
                  })}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Properties;
