import { useState } from "react";
import {
  MapPin,
  BedDouble,
  Bath,
  Car,
  Maximize,
  Heart,
  Home,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface PropertyCardProps {
  id: string;
  title: string;
  type: string;
  transaction_type?: string;
  formattedPrice: string;
  location: string;
  image: string;
  bedrooms?: number;
  bathrooms?: number;
  parking?: number;
  area: string;
  builtArea?: string;
  agent: {
    name: string;
    avatar: string;
  };
  isRecent?: boolean;
  onClick: () => void;
}

const handleFavoriteClick = (e: React.MouseEvent) => {
  e.stopPropagation();
};

const PropertyCard = ({
  id,
  title,
  type,
  transaction_type,
  formattedPrice,
  location,
  image,
  bedrooms,
  bathrooms,
  parking,
  area,
  builtArea,
  agent,
  isRecent = false,
  onClick,
}: PropertyCardProps) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const getPropertyTypeColor = (property_type: string) => {
    switch (property_type.toLowerCase()) {
      case "casa":
        return "bg-green-500/90 text-white";
      case "departamento":
        return "bg-blue-500/90 text-white";
      case "terreno":
        return "bg-yellow-500/90 text-white";
      case "local comercial":
        return "bg-purple-500/90 text-white";
      default:
        return "bg-primary/90 text-primary-foreground";
    }
  };

  const handleFavoriteClickInternal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  return (
    <div
      onClick={onClick}
      className="group bg-card rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border border-border/50 hover:border-primary/20 min-h-[574px] flex flex-col"
    >
      {/* Image Container */}
      <div className="relative h-56 overflow-hidden">
        <div
          className={`absolute inset-0 bg-gradient-to-br from-muted/20 to-muted/40 transition-opacity duration-300 ${
            imageLoaded ? "opacity-0" : "opacity-100"
          }`}
        />
        <img
          src={image}
          alt={title}
          className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setImageLoaded(true)}
        />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2 z-10">
          <span
            className={`${getPropertyTypeColor(
              type
            )} px-3 py-1 rounded-md text-xs font-semibold shadow-lg backdrop-blur-sm uppercase`}
          >
            {type}
          </span>
          {transaction_type && (
            <span className="bg-accent text-accent-foreground px-3 py-1 rounded-md text-xs font-semibold shadow-lg backdrop-blur-sm uppercase">
              {transaction_type}
            </span>
          )}
        </div>

        {/* ID Badge - Bottom Left */}
        <div className="absolute bottom-3 left-3 z-10">
          <span className="bg-destructive text-destructive-foreground px-3 py-1 rounded-md text-xs font-bold shadow-lg">
            ID: {id}
          </span>
        </div>

        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClickInternal}
          className="absolute bottom-3 right-3 bg-background/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-background transition-all z-10 group/fav"
          aria-label="Add to favorites"
        >
          <Heart
            className={`w-4 h-4 transition-all ${
              isFavorite
                ? "fill-red-500 text-red-500 scale-110"
                : "text-muted-foreground group-hover/fav:text-red-500 group-hover/fav:scale-110"
            }`}
          />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        {/* Top Content Group */}
        <div className="space-y-3">
          {/* Price - Now outside the image */}
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-foreground">
              {formattedPrice}
            </p>
            {isRecent && (
              <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-2 py-0.5 rounded text-xs font-semibold">
                NUEVO
              </span>
            )}
          </div>

          {/* Location */}
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <p className="text-sm text-muted-foreground line-clamp-1">
              {location}
            </p>
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold text-foreground line-clamp-2 min-h-[3rem] leading-snug">
            {title}
          </h3>
        </div>

        {/* Flexible spacer to push bottom content down */}
        <div className="flex-1"></div>

        {/* Bottom Content Group - Property Details and Agent Info */}
        <div className="space-y-3">
          {/* Property Features - Improved Grid Layout */}
          <div className="grid grid-cols-3 gap-3 pt-3 border-t border-border/50">
            {/* Land Area */}
            <div className="flex flex-col items-start gap-1">
              <div className="flex items-center gap-1">
                <Maximize className="w-3.5 h-3.5 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Área Terreno</p>
              </div>
              <p className="text-sm font-semibold text-foreground">{area}</p>
            </div>

            {/* Built Area */}
            {builtArea ? (
              <div className="flex flex-col items-start gap-1">
                <div className="flex items-center gap-1">
                  <Home className="w-3.5 h-3.5 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Área Const.</p>
                </div>
                <p className="text-sm font-semibold text-foreground">
                  {builtArea}
                </p>
              </div>
            ) : (
              <div></div>
            )}

            {/* Bedrooms */}
            {bedrooms !== undefined && bedrooms !== null && (
              <div className="flex flex-col items-start gap-1">
                <div className="flex items-center gap-1">
                  <BedDouble className="w-3.5 h-3.5 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Dorm.</p>
                </div>
                <p className="text-sm font-semibold text-foreground">
                  {bedrooms}+
                </p>
              </div>
            )}

            {/* Bathrooms */}
            {bathrooms !== undefined && bathrooms !== null && (
              <div className="flex flex-col items-start gap-1">
                <div className="flex items-center gap-1">
                  <Bath className="w-3.5 h-3.5 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Baños</p>
                </div>
                <p className="text-sm font-semibold text-foreground">
                  {bathrooms}+
                </p>
              </div>
            )}

            {/* Parking */}
            {parking !== undefined && parking !== null && (
              <div className="flex flex-col items-start gap-1">
                <div className="flex items-center gap-1">
                  <Car className="w-3.5 h-3.5 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Estac.</p>
                </div>
                <p className="text-sm font-semibold text-foreground">
                  {parking}+
                </p>
              </div>
            )}
          </div>

          {/* Agent Info */}
          <div className="flex items-center gap-2.5 pt-3 border-t border-border/50">
            <Avatar className="h-9 w-9 border-2 border-primary/20">
              <AvatarImage src={agent.avatar} alt={agent.name} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                {agent.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground truncate">
                {agent.name}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
