import { useState } from "react";
import { X, MapPin, Home, Search, RotateCcw, ChevronDown, ChevronUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface AdvancedFiltersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AdvancedFiltersModal = ({ open, onOpenChange }: AdvancedFiltersModalProps) => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    location: "",
    propertyCode: "",
    propertyType: "",
    businessType: "venta",
    gpsLocation: "",
    minPrice: "",
    maxPrice: "",
    currency: "Soles",
    maxAge: "",
    floors: "Todos",
    bedrooms: { min: "", max: "" },
    bathrooms: "Todos",
    halfBathrooms: "Todos",
    parking: "Todos",
    garageType: "Todos los Tipos"
  });

  const [expandedSections, setExpandedSections] = useState({
    environments: true,
    exactLocation: false,
    characteristics: false
  });

  const propertyTypes = [
    "Todos los Inmuebles",
    "Casa",
    "Departamento",
    "Terreno",
    "Local Comercial",
    "Oficina",
    "Quinta",
    "Loft"
  ];

  const businessTypes = ["Venta", "Alquiler", "Anticresis"];

  const currencies = ["Soles", "USD"];

  const countOptions = ["Todos", "1+", "2+", "3+", "4+", "5+"];

  const garageTypes = [
    "Todos los Tipos",
    "Techado",
    "Sin Techo",
    "Subterráneo",
    "En Línea"
  ];

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const clearFilters = () => {
    setFilters({
      location: "",
      propertyCode: "",
      propertyType: "",
      businessType: "Venta",
      gpsLocation: "",
      minPrice: "",
      maxPrice: "",
      currency: "Soles",
      maxAge: "",
      floors: "Todos",
      bedrooms: { min: "", max: "" },
      bathrooms: "Todos",
      halfBathrooms: "Todos",
      parking: "Todos",
      garageType: "Todos los Tipos"
    });
  };

  const handleSearch = () => {
    // Create URL search parameters from filters
    const searchParams = new URLSearchParams();
    
    // Add filters to search params if they have values
    if (filters.location) searchParams.set('ubicacion', filters.location);
    if (filters.propertyCode) searchParams.set('codigo', filters.propertyCode);
    if (filters.propertyType) searchParams.set('tipo', filters.propertyType);
    if (filters.businessType) searchParams.set('transaccion', filters.businessType);
    if (filters.minPrice) searchParams.set('precioMin', filters.minPrice);
    if (filters.maxPrice) searchParams.set('precioMax', filters.maxPrice);
    if (filters.currency) searchParams.set('moneda', filters.currency);
    if (filters.maxAge) searchParams.set('antiguedad', filters.maxAge);
    if (filters.floors !== 'Todos') searchParams.set('pisos', filters.floors);
    if (filters.bedrooms.min) searchParams.set('habitacionesMin', filters.bedrooms.min);
    if (filters.bedrooms.max) searchParams.set('habitacionesMax', filters.bedrooms.max);
    if (filters.bathrooms !== 'Todos') searchParams.set('banos', filters.bathrooms);
    if (filters.halfBathrooms !== 'Todos') searchParams.set('mediosBanos', filters.halfBathrooms);
    if (filters.parking !== 'Todos') searchParams.set('cocheras', filters.parking);
    if (filters.garageType !== 'Todos los Tipos') searchParams.set('tipoCochera', filters.garageType);
    
    // Navigate to properties page with filters
    navigate(`/propiedades?${searchParams.toString()}`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-background">
        <DialogHeader className="relative pb-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Home className="w-5 h-5 text-muted-foreground" />
            <DialogTitle className="text-lg font-semibold text-foreground">
              PROPIEDAD
            </DialogTitle>
          </div>
          <DialogDescription className="text-sm text-muted-foreground">
            Utiliza los filtros avanzados para encontrar exactamente lo que buscas
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Search Location */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              ¿EN DONDE LA BUSCAS?
            </label>
            <Select value={filters.location} onValueChange={(value) => setFilters({...filters, location: value})}>
              <SelectTrigger className="w-full h-12 bg-background border border-input">
                <SelectValue placeholder="Seleccionar ubicación" />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50">
                <SelectItem value="lima">Lima, Lima</SelectItem>
                <SelectItem value="cusco">Cusco, Cusco</SelectItem>
                <SelectItem value="arequipa">Arequipa, Arequipa</SelectItem>
                <SelectItem value="miraflores">Miraflores, Lima</SelectItem>
                <SelectItem value="san-isidro">San Isidro, Lima</SelectItem>
                <SelectItem value="surco">Surco, Lima</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Property Code, Type, Business Type Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                CÓDIGO DE LA PROPIEDAD
              </label>
              <Input
                placeholder="Código"
                value={filters.propertyCode}
                onChange={(e) => setFilters({...filters, propertyCode: e.target.value})}
                className="h-12 bg-background border border-input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                TIPO DE INMUEBLE
              </label>
              <Select value={filters.propertyType} onValueChange={(value) => setFilters({...filters, propertyType: value})}>
                <SelectTrigger className="w-full h-12 bg-background border border-input">
                  <SelectValue placeholder="Todos los Inmuebles" />
                </SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  {propertyTypes.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                TIPO DE NEGOCIO
              </label>
              <div className="flex gap-2">
                {businessTypes.map((type) => (
                  <Button
                    key={type}
                    variant={filters.businessType === type ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilters({...filters, businessType: type})}
                    className="flex-1 h-12"
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* GPS Location, Price, Age Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                UBICACIÓN GPS
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="GPS Desactivado"
                  value={filters.gpsLocation}
                  onChange={(e) => setFilters({...filters, gpsLocation: e.target.value})}
                  className="h-12 pl-10 bg-background border border-input"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                PRECIO
              </label>
              <div className="flex gap-2">
                <Input
                  placeholder="Mínimo"
                  value={filters.minPrice}
                  onChange={(e) => setFilters({...filters, minPrice: e.target.value})}
                  className="h-12 bg-background border border-input"
                />
                <Input
                  placeholder="Máximo"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
                  className="h-12 bg-background border border-input"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                MONEDA
              </label>
              <Select value={filters.currency} onValueChange={(value) => setFilters({...filters, currency: value})}>
                <SelectTrigger className="w-full h-12 bg-background border border-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  {currencies.map((currency) => (
                    <SelectItem key={currency} value={currency}>{currency}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                ANTIGÜEDAD (AÑOS)
              </label>
              <Select value={filters.maxAge} onValueChange={(value) => setFilters({...filters, maxAge: value})}>
                <SelectTrigger className="w-full h-12 bg-background border border-input">
                  <SelectValue placeholder="Máximo" />
                </SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  <SelectItem value="1">1 año</SelectItem>
                  <SelectItem value="2">2 años</SelectItem>
                  <SelectItem value="5">5 años</SelectItem>
                  <SelectItem value="10">10 años</SelectItem>
                  <SelectItem value="20">20 años</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Environments Section */}
          <Collapsible open={expandedSections.environments} onOpenChange={() => toggleSection('environments')}>
            <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-left">
              <div className="flex items-center gap-2">
                <Home className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium text-foreground">AMBIENTES</span>
              </div>
              {expandedSections.environments ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 mt-4">
              {/* Floors and Bedrooms */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    N° DE PISOS QUE TIENE
                  </label>
                  <div className="flex gap-2">
                    {countOptions.map((option) => (
                      <Button
                        key={option}
                        variant={filters.floors === option ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFilters({...filters, floors: option})}
                        className="flex-1"
                      >
                        {option}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    HABITACIONES
                  </label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Mínimo"
                      value={filters.bedrooms.min}
                      onChange={(e) => setFilters({...filters, bedrooms: {...filters.bedrooms, min: e.target.value}})}
                      className="h-10 bg-background border border-input"
                    />
                    <Input
                      placeholder="Máximo"
                      value={filters.bedrooms.max}
                      onChange={(e) => setFilters({...filters, bedrooms: {...filters.bedrooms, max: e.target.value}})}
                      className="h-10 bg-background border border-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    BAÑOS
                  </label>
                  <div className="flex gap-2">
                    {countOptions.map((option) => (
                      <Button
                        key={option}
                        variant={filters.bathrooms === option ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFilters({...filters, bathrooms: option})}
                        className="flex-1"
                      >
                        {option}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Half bathrooms, Parking, Garage Type */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    MEDIOS BAÑOS
                  </label>
                  <div className="flex gap-2">
                    {countOptions.map((option) => (
                      <Button
                        key={option}
                        variant={filters.halfBathrooms === option ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFilters({...filters, halfBathrooms: option})}
                        className="flex-1"
                      >
                        {option}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    COCHERAS
                  </label>
                  <div className="flex gap-2">
                    {countOptions.map((option) => (
                      <Button
                        key={option}
                        variant={filters.parking === option ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFilters({...filters, parking: option})}
                        className="flex-1"
                      >
                        {option}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    TIPO DE COCHERA
                  </label>
                  <Select value={filters.garageType} onValueChange={(value) => setFilters({...filters, garageType: value})}>
                    <SelectTrigger className="w-full h-12 bg-background border border-input">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover z-50">
                      {garageTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Exact Location Section */}
          <Collapsible open={expandedSections.exactLocation} onOpenChange={() => toggleSection('exactLocation')}>
            <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-left border-t border-border pt-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium text-foreground">UBICACIÓN EXACTA</span>
              </div>
              {expandedSections.exactLocation ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-4">
              <p className="text-sm text-muted-foreground">Funcionalidad próximamente disponible</p>
            </CollapsibleContent>
          </Collapsible>

          {/* Characteristics Section */}
          <Collapsible open={expandedSections.characteristics} onOpenChange={() => toggleSection('characteristics')}>
            <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-left border-t border-border pt-4">
              <div className="flex items-center gap-2">
                <Home className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium text-foreground">CARACTERÍSTICAS</span>
              </div>
              {expandedSections.characteristics ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-4">
              <p className="text-sm text-muted-foreground">Funcionalidad próximamente disponible</p>
            </CollapsibleContent>
          </Collapsible>

          {/* Clear Filters Section */}
          <Collapsible>
            <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-left border-t border-border pt-4">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium text-foreground">LIMPIAR FILTROS</span>
              </div>
              <ChevronDown className="w-4 h-4" />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-4">
              <Button
                variant="outline"
                onClick={clearFilters}
                className="w-full"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Limpiar todos los filtros
              </Button>
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Search Button */}
        <div className="border-t border-border pt-4 mt-6">
          <Button
            onClick={handleSearch}
            className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground text-lg font-semibold"
          >
            <Search className="w-5 h-5 mr-2" />
            BUSCAR PROPIEDADES
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdvancedFiltersModal;