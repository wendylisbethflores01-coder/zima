import { useState } from "react";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import PropertyCard from "./PropertyCard";
import { useNavigate } from "react-router-dom";
import { useLatestProperties } from "@/hooks/useProperties";

const LatestProperties = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const { properties, loading } = useLatestProperties(8);

  const propertiesPerSlide = 4;
  const totalSlides = Math.ceil(properties.length / propertiesPerSlide);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const getCurrentProperties = () => {
    const startIndex = currentSlide * propertiesPerSlide;
    return properties.slice(startIndex, startIndex + propertiesPerSlide);
  };

  const handlePropertyClick = (property: any) => {
    window.open(`/propiedad/${property.id}`, '_blank');
  };

  return (
    <section id="ultimas-propiedades" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12 animate-fade-in-up">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            ÚLTIMAS PROPIEDADES
          </h2>
          <div className="w-20 h-1 bg-primary mx-auto mb-6"></div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Descubre las propiedades más recientes en nuestro portafolio. 
            Casas, departamentos, terrenos y locales comerciales en las mejores ubicaciones del Perú.
          </p>
        </div>

        {/* Properties Carousel */}
        <div className="relative">
          {/* Navigation Buttons */}
          <div className="absolute top-1/2 -translate-y-1/2 -left-4 z-10">
            <Button
              onClick={prevSlide}
              size="icon"
              className="w-12 h-12 rounded-full bg-white shadow-lg hover:shadow-xl hover:bg-gray-50 text-primary border-2 border-primary/20"
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
          </div>
          
          <div className="absolute top-1/2 -translate-y-1/2 -right-4 z-10">
            <Button
              onClick={nextSlide}
              size="icon"
              className="w-12 h-12 rounded-full bg-white shadow-lg hover:shadow-xl hover:bg-gray-50 text-primary border-2 border-primary/20"
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
          </div>

          {/* Properties Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in-up delay-300">
            {loading ? (
              // Loading skeleton
              Array.from({ length: 4 }, (_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-gray-300 h-64 rounded-lg mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                  </div>
                </div>
              ))
            ) : (
              getCurrentProperties().map((property, index) => (
                <div
                  key={property.id}
                  className="animate-scale-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <PropertyCard
                    {...property}
                    onClick={() => handlePropertyClick(property)}
                  />
                </div>
              ))
            )}
          </div>

          {/* Slide Indicators */}
          <div className="flex justify-center mt-8 space-x-2">
            {Array.from({ length: totalSlides }, (_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? "bg-primary w-8"
                    : "bg-gray-300 hover:bg-gray-400"
                }`}
              />
            ))}
          </div>
        </div>

        {/* View All Properties Button */}
        <div className="text-center mt-12">
          <Button
            onClick={() => navigate('/propiedades')}
            className="btn-hero bg-primary hover:bg-[hsl(var(--primary-hover))] text-white px-8 py-4 text-lg"
          >
            VER TODAS LAS PROPIEDADES
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default LatestProperties;