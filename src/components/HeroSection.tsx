import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Search, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import AdvancedFiltersModal from "@/components/AdvancedFiltersModal";
import { LocationCombobox } from "@/components/LocationCombobox";
import { usePropertyTypes } from "@/hooks/usePropertyTypes";
import heroBg from "@/assets/hero-bg.jpg";

interface SearchFormData {
  transactionType: string;
  propertyType: string;
  location: string;
  minPrice: string;
  maxPrice: string;
  currency: string;
}

const HeroSection = () => {
  const navigate = useNavigate();
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const { data: propertyTypes = [], isLoading: propertyTypesLoading } =
    usePropertyTypes();

  const form = useForm<SearchFormData>({
    defaultValues: {
      transactionType: "venta",
      propertyType: "",
      location: "",
      minPrice: "",
      maxPrice: "",
      currency: "PEN",
    },
  });

  const onSubmit = (data: SearchFormData) => {
    const params = new URLSearchParams();
    if (data.transactionType)
      params.set("transactionType", data.transactionType);
    if (data.propertyType && data.propertyType !== "Todos los Inmuebles")
      params.set("propertyType", data.propertyType);
    if (data.location) params.set("location", data.location);
    if (data.minPrice) params.set("minPrice", data.minPrice);
    if (data.maxPrice) params.set("maxPrice", data.maxPrice);
    if (data.currency) params.set("currency", data.currency);
    navigate(`/propiedades?${params.toString()}`);
  };

  return (
    <section
      className="relative min-h-[90vh] flex items-center justify-center overflow-hidden"
      style={{
        backgroundImage: `url(${heroBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Cinematic overlay - subtle and soft */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/40 via-primary/20 to-slate-900/50"></div>
      <div className="absolute inset-0 shadow-[inset_0_0_120px_rgba(0,0,0,0.2)]"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent"></div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
          linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
        `,
          backgroundSize: "50px 50px",
        }}
      ></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Hero Text */}
          <div className="text-left animate-fade-in-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 glass-dark text-white px-4 py-2 rounded-full mb-6">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">
                Innovación • Confianza • Accesibilidad
              </span>
            </div>

            {/* Main Title */}
            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
              Tu próxima{" "}
              <span className="text-gradient-warm">propiedad ideal</span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-white/90 mb-10 font-light leading-relaxed">
              Encuentra casas, departamentos y terrenos con tecnología moderna y
              atención personalizada
            </p>

            {/* Transaction Type Pills */}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <FormField
                  control={form.control}
                  name="transactionType"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="flex flex-wrap gap-3 mb-8">
                          <button
                            type="button"
                            onClick={() => field.onChange("venta")}
                            className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                              field.value === "venta"
                                ? "bg-white text-primary shadow-glow"
                                : "glass-card text-white hover:scale-105"
                            }`}
                          >
                            Venta
                          </button>
                          <button
                            type="button"
                            onClick={() => field.onChange("alquiler")}
                            className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                              field.value === "alquiler"
                                ? "bg-white text-primary shadow-glow"
                                : "glass-card text-white hover:scale-105"
                            }`}
                          >
                            Alquiler
                          </button>
                          <button
                            type="button"
                            onClick={() => field.onChange("anticresis")}
                            className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                              field.value === "anticresis"
                                ? "bg-white text-primary shadow-glow"
                                : "glass-card text-white hover:scale-105"
                            }`}
                          >
                            Anticresis
                          </button>
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
                {/* Stats
                <div className="flex gap-8 text-white">
                  <div>
                    <div className="text-4xl font-bold">1,500+</div>
                    <div className="text-sm text-white/80">Propiedades</div>
                  </div>
                  <div>
                    <div className="text-4xl font-bold">98%</div>
                    <div className="text-sm text-white/80">Satisfacción</div>
                  </div>
                  <div>
                    <div className="text-4xl font-bold">24/7</div>
                    <div className="text-sm text-white/80">Atención</div>
                  </div>
                </div> */}
              </form>
            </Form>
          </div>

          {/* Right Side - Glass Search Form */}
          <div className="animate-fade-in-right">
            <div className="glass-card p-8 rounded-2xl">
              <h2 className="text-2xl font-bold mb-2">Busca tu Propiedad</h2>
              <p className="text-muted-foreground mb-6">
                Filtra por ubicación, tipo y precio
              </p>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  {/* Property Type */}
                  <FormField
                    control={form.control}
                    name="propertyType"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger className="w-full h-12 glass-input border-0">
                              <SelectValue placeholder="Tipo de Inmueble" />
                            </SelectTrigger>
                            <SelectContent className="bg-white z-50">
                              {propertyTypesLoading ? (
                                <SelectItem value="loading" disabled>
                                  <div className="flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Cargando tipos...
                                  </div>
                                </SelectItem>
                              ) : (
                                <>
                                  <SelectItem value="Todos los Inmuebles">
                                    Todos los Inmuebles
                                  </SelectItem>
                                  {propertyTypes.map((type) => (
                                    <SelectItem key={type.id} value={type.name}>
                                      {type.name}
                                    </SelectItem>
                                  ))}
                                </>
                              )}
                            </SelectContent>
                          </Select>
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* Location */}
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <LocationCombobox
                            value={field.value}
                            onValueChange={field.onChange}
                            placeholder="¿Dónde buscas?"
                            className="glass-input border-0"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* Price Range */}
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="minPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Precio mínimo"
                              className="h-12 glass-input border-0"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="maxPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Precio máximo"
                              className="h-12 glass-input border-0"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Currency */}
                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger className="w-full h-12 glass-input border-0">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-white z-50">
                              <SelectItem value="PEN">Soles (PEN)</SelectItem>
                              <SelectItem value="USD">USD</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* Search Button */}
                  <Button
                    type="submit"
                    className="w-full btn-primary h-12 text-lg"
                  >
                    <Search className="w-5 h-5 mr-2" />
                    Buscar Propiedades
                  </Button>

                  {/* Advanced Filters Link */}
                  <button
                    type="button"
                    onClick={() => setShowAdvancedFilters(true)}
                    className="w-full text-primary hover:text-primary/80 transition-colors text-sm font-medium"
                  >
                    Filtros avanzados ↓
                  </button>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Filters Modal */}
      <AdvancedFiltersModal
        open={showAdvancedFilters}
        onOpenChange={setShowAdvancedFilters}
      />
    </section>
  );
};

export default HeroSection;
