import React from "react";
import { ExternalLink } from "lucide-react";

interface SimpleMapEmbedProps {
  address: string;
  propertyTitle?: string;
  height?: string;
}

const SimpleMapEmbed: React.FC<SimpleMapEmbedProps> = ({
  address,
  propertyTitle,
  height = "300px",
}) => {
  const encodedAddress = encodeURIComponent(address);

  // Google Maps search URL for opening in new tab
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;

  // Google Maps embed URL - this works without API key
  const embedUrl = `https://maps.google.com/maps?width=100%25&height=${height}&hl=es&q=${encodedAddress}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="w-full space-y-3">
      <div className="relative rounded-lg overflow-hidden border shadow-sm bg-gray-100">
        <iframe
          width="100%"
          height={height}
          frameBorder="0"
          scrolling="no"
          marginHeight={0}
          marginWidth={0}
          src={embedUrl}
          title={`Ubicación de ${propertyTitle || address}`}
          className="w-full"
        />
      </div>

      {/* Link to open in Google Maps */}
      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-500">
          * Ubicación aproximada por privacidad
        </span>
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center text-primary hover:text-primary/80 font-medium"
        >
          <ExternalLink className="w-4 h-4 mr-1" />
          Ver en Google Maps
        </a>
      </div>
    </div>
  );
};

export default SimpleMapEmbed;
