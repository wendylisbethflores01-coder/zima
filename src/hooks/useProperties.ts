import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Amenity {
  id: string;
  name: string;
  icon?: string;
  category?: string;
}

export interface Property {
  id: string;
  title: string;
  type: string;
  transaction_type?: string;
  price: number;
  currency: "PEN" | "USD";
  formattedPrice: string;
  location: string;
  address?: string;
  image: string;
  bedrooms?: number;
  bathrooms?: number;
  parking?: number;
  area: string;
  builtArea?: string;
  description?: string;
  age?: number;
  created_at: string;
  amenities?: Amenity[];
  agent_id?: string;
  is_approved?: boolean;
  is_active?: boolean;
  agent: {
    id: string;
    name: string;
    phone: string;
    avatar: string;
  };
}

export interface PropertyFilters {
  search?: string;
  propertyType?: string;
  transactionType?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bedroomsMin?: number;
  bedroomsMax?: number;
  bathrooms?: number;
  sortBy?: string; // Allow any string value for sortBy
  includeInactive?: boolean; // Allow showing inactive properties
  agentId?: string; // Filter by agent ID
}

const fetchProperties = async (
  filters: PropertyFilters = {},
): Promise<Property[]> => {
  let query = supabase.from("properties").select(`
      *,
      agent:agents(id, name, phone)
    `);

  // Only filter by is_active if not explicitly including inactive properties
  if (!filters.includeInactive) {
    query = query.eq("is_active", true);
  }

  // Apply filters
  if (filters.search) {
    query = query.or(
      `title.ilike.%${filters.search}%,full_location.ilike.%${filters.search}%`,
    );
  }

  if (filters.propertyType && filters.propertyType !== "todos") {
    query = query.eq("property_type", filters.propertyType as any);
  }

  if (filters.transactionType) {
    query = query.eq("transaction_type", filters.transactionType as any);
  }

  if (filters.location) {
    query = query.eq("full_location", filters.location);
  }

  if (filters.minPrice) {
    query = query.gte("price", filters.minPrice);
  }

  if (filters.maxPrice) {
    query = query.lte("price", filters.maxPrice);
  }

  if (filters.bedrooms) {
    query = query.gte("bedrooms", filters.bedrooms);
  }

  if (filters.bedroomsMin) {
    query = query.gte("bedrooms", filters.bedroomsMin);
  }

  if (filters.bedroomsMax) {
    query = query.lte("bedrooms", filters.bedroomsMax);
  }

  if (filters.bathrooms) {
    query = query.gte("bathrooms", filters.bathrooms);
  }

  if (filters.agentId) {
    query = query.eq("agent_id", filters.agentId);
  }

  // Apply sorting
  if (filters.sortBy === "price-low") {
    query = query.order("price", { ascending: true });
  } else if (filters.sortBy === "price-high") {
    query = query.order("price", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const { data, error } = await query;

  if (error) throw error;

  // Transform data to match expected format
  return data.map((prop: any) => {
    const imagePath = `${prop.property_code}/main.jpg`;
    const { data: imageData } = supabase.storage
      .from("properties")
      .getPublicUrl(imagePath);

    const agentAvatarPath = prop.agent?.id ? `${prop.agent.id}/avatar.jpg` : "";
    const { data: avatarData } = supabase.storage
      .from("agents")
      .getPublicUrl(agentAvatarPath);

    const currencySymbol = prop.currency === "USD" ? "$" : "S/";
    const formattedPrice = `${currencySymbol} ${prop.price.toLocaleString(
      prop.currency === "USD" ? "en-US" : "es-PE",
      { minimumFractionDigits: 2 },
    )}`;

    return {
      id: prop.property_code,
      title: prop.title,
      type: prop.property_type,
      transaction_type: prop.transaction_type,
      price: prop.price,
      currency: prop.currency,
      formattedPrice,
      location: prop.full_location,
      image: imageData.publicUrl,
      bedrooms: prop.bedrooms,
      bathrooms: prop.bathrooms,
      parking: prop.parking,
      area: prop.area,
      builtArea: prop.built_area ? prop.built_area : undefined,
      description: prop.description,
      age: prop.age,
      created_at: prop.created_at,
      agent_id: prop.agent_id,
      is_approved: prop.is_approved,
      is_active: prop.is_active,
      agent: {
        id: prop.agent?.id || "",
        name: prop.agent?.name || "Agente no disponible",
        phone: prop.agent?.phone || "N/A",
        avatar: avatarData.publicUrl,
      },
      address: prop.address || null,
    };
  });
};

export const useProperties = (filters: PropertyFilters = {}) => {
  const {
    data: properties = [],
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["properties", filters],
    queryFn: () => fetchProperties(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    properties,
    loading,
    error: error?.message || null,
    refetch,
  };
};

export const useLatestProperties = (limit: number = 6) => {
  const {
    data: properties = [],
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ["latest-properties", limit],
    queryFn: () => fetchProperties({}).then((props) => props.slice(0, limit)),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return { properties, loading, error: error?.message || null };
};

const fetchProperty = async (propertyCode: string): Promise<Property> => {
  const { data, error } = await supabase
    .from("properties")
    .select(
      `
      *,
      agent:agents(id, name, phone),
      property_amenities(
        amenities(
          id,
          name,
          icon,
          category
        )
      )
    `,
    )
    .eq("property_code", propertyCode)
    .eq("is_active", true)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("Propiedad no encontrada");

  const imagePath = `mock/${data.property_code}.jpg`;
  const { data: imageData } = supabase.storage
    .from("properties")
    .getPublicUrl(imagePath);

  const agentAvatarPath = data.agent?.id ? `${data.agent.id}/avatar.jpg` : "";
  const { data: avatarData } = supabase.storage
    .from("agents")
    .getPublicUrl(agentAvatarPath);

  // Extract amenities from the nested structure
  const amenities =
    data.property_amenities?.map((pa: any) => ({
      id: pa.amenities.id,
      name: pa.amenities.name,
      icon: pa.amenities.icon,
      category: pa.amenities.category,
    })) || [];

  const currencySymbol = data.currency === "USD" ? "$" : "S/";
  const formattedPrice = `${currencySymbol} ${data.price.toLocaleString(
    data.currency === "USD" ? "en-US" : "es-PE",
    { minimumFractionDigits: 2 },
  )}`;

  return {
    id: data.property_code,
    title: data.title,
    type: data.property_type,
    transaction_type: data.transaction_type,
    price: data.price,
    currency: data.currency,
    formattedPrice,
    location: data.full_location,
    image: imageData.publicUrl,
    bedrooms: data.bedrooms,
    bathrooms: data.bathrooms,
    parking: data.parking,
    area: `${data.area} m²`,
    builtArea: data.built_area ? `${data.built_area} m²` : undefined,
    description: data.description,
    age: data.age,
    created_at: data.created_at,
    amenities,
    agent_id: data.agent_id,
    is_approved: data.is_approved,
    agent: {
      id: data.agent?.id || "",
      name: data.agent?.name || "Agente no disponible",
      phone: data.agent?.phone || "N/A",
      avatar: avatarData.publicUrl,
    },
    address: data.address || null,
  };
};

export const useProperty = (propertyCode: string) => {
  const {
    data: property,
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ["property", propertyCode],
    queryFn: () => fetchProperty(propertyCode),
    enabled: !!propertyCode,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  return {
    property,
    loading,
    error: error?.message || null,
  };
};
