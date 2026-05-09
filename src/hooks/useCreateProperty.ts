import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

interface PropertyData {
  title: string;
  property_type: string;
  transaction_type: "venta" | "alquiler" | "anticresis";
  price: number;
  currency: "PEN" | "USD";
  city: string;
  district: string;
  province?: string | null;
  address?: string | null;
  area: number;
  built_area?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  parking?: number | null;
  description?: string | null;
  agent_id: string;
  age?: number | null;
}

export const useCreateProperty = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const generatePropertyCode = () => {
    return Math.floor(1000000 + Math.random() * 9000000).toString();
  };

  const uploadImages = async (
    propertyCode: string,
    images: File[],
    mainImageIndex: number
  ) => {
    if (images.length === 0) {
      throw new Error("Debe seleccionar al menos una imagen");
    }

    const uploadPromises: Promise<string>[] = [];

    // 1. Upload all images in order as 1.jpg, 2.jpg, etc.
    images.forEach((file, index) => {
      const fileName = `${index + 1}.jpg`;
      const filePath = `${propertyCode}/${fileName}`;

      const uploadPromise = supabase.storage
        .from("properties")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        })
        .then(({ error }) => {
          if (error) {
            console.error(`Error uploading ${fileName}:`, error);
            throw error;
          }
          return filePath;
        });

      uploadPromises.push(uploadPromise);
    });

    // 2. Additionally upload the main image as main.jpg
    if (mainImageIndex >= 0 && mainImageIndex < images.length) {
      const mainFile = images[mainImageIndex];
      const mainFilePath = `${propertyCode}/main.jpg`;

      const mainUploadPromise = supabase.storage
        .from("properties")
        .upload(mainFilePath, mainFile, {
          cacheControl: "3600",
          upsert: false,
        })
        .then(({ error }) => {
          if (error) {
            console.error(`Error uploading main.jpg:`, error);
            throw error;
          }
          return mainFilePath;
        });

      uploadPromises.push(mainUploadPromise);
    }

    return Promise.all(uploadPromises);
  };

  const createProperty = async (
    data: PropertyData,
    images: File[],
    mainImageIndex: number,
    amenities: string[] = []
  ) => {
    if (images.length === 0) {
      toast.error("Debe seleccionar al menos una imagen");
      return { success: false };
    }

    setIsSubmitting(true);

    try {
      const propertyCode = generatePropertyCode();

      // Crear la entrada en la base de datos
      const propertyData = {
        property_code: propertyCode,
        title: data.title,
        property_type: data.property_type,
        transaction_type: data.transaction_type,
        price: data.price,
        currency: data.currency,
        city: data.city,
        district: data.district,
        province: data.province || null,
        full_location: `${data.district}, ${data.city}${
          data.province ? `, ${data.province}` : ""
        }`,
        address: data.address || null,
        area: data.area,
        built_area: data.built_area || null,
        bedrooms: data.bedrooms || null,
        bathrooms: data.bathrooms || null,
        parking: data.parking || null,
        description: data.description || null,
        agent_id: data.agent_id,
        age: data.age || null,
        is_active: true,
        is_approved: true,
        views_count: 0,
      };

      const { data: createdProperty, error: dbError } = await supabase
        .from("properties")
        .insert([
          propertyData as Database["public"]["Tables"]["properties"]["Insert"],
        ])
        .select("id")
        .single();

      console.log("Created property:", createdProperty);

      if (dbError) {
        console.error("Error creating property:", dbError);
        throw dbError;
      }

      // Subir las imágenes
      await uploadImages(propertyCode, images, mainImageIndex);

      // Crear las relaciones con amenities si se seleccionaron
      if (amenities.length > 0 && createdProperty?.id) {
        const amenityInserts = amenities.map((amenityId) => ({
          property_id: createdProperty.id,
          amenity_id: amenityId,
        }));

        const { error: amenityError } = await supabase
          .from("property_amenities")
          .insert(amenityInserts);

        if (amenityError) {
          console.error("Error adding amenities:", amenityError);
          // No lanzamos error aquí para no fallar toda la creación
          toast.error(
            "Propiedad creada pero hubo un error al agregar las comodidades"
          );
        }
      }

      // Invalidar queries para actualizar la UI
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      queryClient.invalidateQueries({ queryKey: ["latest-properties"] });
      queryClient.invalidateQueries({ queryKey: ["agent-properties"] });
      queryClient.invalidateQueries({ queryKey: ["all-properties-for-edit"] });

      toast.success("Propiedad creada exitosamente");
      return { success: true };
    } catch (error: unknown) {
      console.error("Error creating property:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Error al crear la propiedad";
      toast.error(errorMessage);
      return { success: false };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    createProperty,
    isSubmitting,
  };
};
