import { useState, useEffect } from "react";
import {
  MapPin,
  Bed,
  Bath,
  Car,
  Maximize,
  Heart,
  Eye,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface PropertyCardWithHoverProps {
  id: string;
  title: string;
  type: string;
  transaction_type?: string;
  formattedPrice: string;
  location: string;
  images: string[]; // Multiple images for hover effect
  bedrooms?: number;
  bathrooms?: number;
  parking?: number;
  area: string;
  builtArea?: string;
  agent: {
    name: string;
    avatar: string;
  };
  tags?: Array<{
    label: string;
    color: string;
    textColor?: string;
  }>;
  isRecent?: boolean;
  onClick: () => void;
}

const PropertyCardWithHover = ({
  id,
  title,
  type,
  transaction_type,
  formattedPrice,
  location,
  images,
  bedrooms,
  bathrooms,
  parking,
  area,
  builtArea,
  agent,
  tags = [],
  isRecent = false,
  onClick,
}: PropertyCardWithHoverProps) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  // Auto-cycle through images on hover
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isHovering && images.length > 1) {
      interval = setInterval(() => {
        setCurrentImageIndex((prevIndex) =>
          prevIndex === images.length - 1 ? 0 : prevIndex + 1
        );
      }, 1000); // Change image every 1 second
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isHovering, images.length]);

  // Reset image index when not hovering
  useEffect(() => {
    if (!isHovering) {
      setCurrentImageIndex(0);
    }
  }, [isHovering]);

  const getPropertyTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "casa":
        return "bg-green-500";
      case "departamento":
        return "bg-blue-500";
      case "terreno":
        return "bg-yellow-500";
      default:
        return "bg-primary";
    }
  };

  const currentImage = images[currentImageIndex] || images[0];

  return (
    <div
      className="property-card group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl min-h-[574px] flex flex-col"
      onClick={onClick}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Property Image */}
      <div className="relative overflow-hidden h-64 bg-gray-200 rounded-t-lg">
        <img
          src={currentImage}
          alt={title}
          className={`property-image w-full h-full object-cover transition-all duration-500 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setImageLoaded(true)}
        />

        {/* Loading skeleton */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-300 animate-pulse"></div>
        )}

        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute bottom-3 right-3 bg-black/70 text-white px-2 py-1 rounded text-xs font-medium">
            {currentImageIndex + 1} / {images.length}
          </div>
        )}

        {/* Property Type Badge */}
        <div
          className={`absolute top-3 left-3 text-white px-3 py-1 rounded-full text-sm font-semibold ${getPropertyTypeColor(
            type
          )}`}
        >
          {type.toUpperCase()}
        </div>

        {/* Transaction Type Badge */}
        {transaction_type && (
          <div
            className={`absolute top-12 left-3 text-white px-3 py-1 rounded-full text-xs font-semibold ${
              transaction_type.toLowerCase() === "venta"
                ? "bg-purple-500"
                : "bg-orange-500"
            }`}
          >
            {transaction_type.toUpperCase()}
          </div>
        )}

        {/* Property ID Badge - Bottom Left */}
        <div className="absolute bottom-3 left-3 bg-primary text-white px-2 py-1 rounded text-sm font-semibold z-20">
          ID: {id}
        </div>

        {/* Custom Tags */}
        {tags.length > 0 && (
          <div
            className={`absolute ${
              transaction_type ? "top-[5.5rem]" : "top-12"
            } left-3 flex flex-col gap-1`}
          >
            {tags.slice(0, 2).map((tag, index) => (
              <div
                key={index}
                className="px-2 py-1 rounded text-xs font-semibold animate-pulse"
                style={{
                  backgroundColor: tag.color,
                  color: tag.textColor || "#ffffff",
                }}
              >
                {tag.label}
              </div>
            ))}
          </div>
        )}

        {/* Recent Badge */}
        {isRecent && (
          <div className="absolute top-12 right-3 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-semibold animate-pulse">
            RECIENTE
          </div>
        )}

        {/* Enhanced Price Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
          <div className="text-white">
            <div className="text-2xl font-bold drop-shadow-lg">
              {formattedPrice}
            </div>
          </div>
        </div>
      </div>

      {/* Property Details */}
      <div className="p-4 bg-white rounded-b-lg flex-1 flex flex-col">
        {/* Top Content Group */}
        <div>
          {/* Location */}
          <div className="flex items-center text-gray-600 mb-2">
            <MapPin className="w-4 h-4 mr-1" />
            <span className="text-sm">{location}</span>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-lg mb-3 line-clamp-2 text-gray-900">
            {title}
          </h3>
        </div>

        {/* Flexible spacer to push bottom content down */}
        <div className="flex-1"></div>

        {/* Bottom Content Group - Property Details and Agent Info */}
        <div>
          {/* Property Features */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-center text-gray-600">
              <Maximize className="w-4 h-4 mr-2 text-primary" />
              <div>
                <div className="text-sm font-medium">Área Terreno</div>
                <div className="text-xs">{area}</div>
              </div>
            </div>

            {builtArea && (
              <div className="flex items-center text-gray-600">
                <Maximize className="w-4 h-4 mr-2 text-primary" />
                <div>
                  <div className="text-sm font-medium">Área Construida</div>
                  <div className="text-xs">{builtArea}</div>
                </div>
              </div>
            )}
          </div>

          {/* Room Details */}
          {(bedrooms || bathrooms || parking) && (
            <div className="flex items-center justify-between mb-4 text-sm text-gray-600">
              {bedrooms && (
                <div className="flex items-center">
                  <Bed className="w-4 h-4 mr-1 text-primary" />
                  <span>{bedrooms}+</span>
                </div>
              )}
              {bathrooms && (
                <div className="flex items-center">
                  <Bath className="w-4 h-4 mr-1 text-primary" />
                  <span>{bathrooms}+</span>
                </div>
              )}
              {parking && (
                <div className="flex items-center">
                  <Car className="w-4 h-4 mr-1 text-primary" />
                  <span>{parking}+</span>
                </div>
              )}
            </div>
          )}

          {/* Agent Info */}
          <div className="flex items-center pt-3 border-t border-gray-200">
            <img
              src={agent.avatar}
              alt={agent.name}
              className="w-8 h-8 rounded-full mr-3"
            />
            <span className="text-sm font-medium text-gray-700">
              {agent.name}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyCardWithHover;
