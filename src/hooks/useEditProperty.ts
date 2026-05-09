import { useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface EditPropertyData {
  title: string;
  property_type: "Casa" | "Departamento" | "Terreno" | "Oficina" | "Local";
  transaction_type: "venta" | "alquiler" | "anticresis";
  price: number;
  currency: "PEN" | "USD";
  city: string;
  district: string;
  province?: string;
  address?: string;
  area: number;
  built_area?: number;
  bedrooms?: number;
  bathrooms?: number;
  parking?: number;
  description?: string;
  agent_id: string;
  age?: number;
}

export const useEditProperty = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  // More efficient image update that only processes changes
  const updateImagesSelectively = async (
    propertyCode: string,
    allImages: Array<{
      id: string;
      url: string;
      name: string;
      file?: File;
      isNew?: boolean;
    }>,
    mainImageId: string,
    deletedImages: string[] = []
  ) => {
    if (allImages.length === 0) {
      throw new Error("Debe mantener al menos una imagen");
    }

    // 1. Delete only the specific deleted images
    if (deletedImages.length > 0) {
      const filesToDelete = deletedImages.map(
        (imageId) => `${propertyCode}/${imageId}`
      );

      try {
        const { error: deleteError } = await supabase.storage
          .from("properties")
          .remove(filesToDelete);

        if (deleteError) {
          console.error("Error deleting specific images:", deleteError);
        }
      } catch (error) {
        console.error("Error in selective deletion:", error);
      }
    }

    // 2. Get current numbered files to determine what needs to be updated
    const { data: existingFiles, error: listError } = await supabase.storage
      .from("properties")
      .list(propertyCode);

    if (listError) {
      console.error("Error listing existing files:", listError);
    }

    const existingNumberedFiles =
      existingFiles?.filter((file) => {
        const isNumbered = /^\d+\.(jpg|jpeg|png|webp)$/i.test(file.name);
        return isNumbered;
      }) || [];

    // 3. Upload new images and renumber all images
    const uploadPromises: Promise<string>[] = [];
    let mainImageIndex = 0;

    for (let i = 0; i < allImages.length; i++) {
      const image = allImages[i];
      const fileName = `${i + 1}.jpg`;
      const filePath = `${propertyCode}/${fileName}`;

      // Track which image is the main one
      if (image.id === mainImageId) {
        mainImageIndex = i;
      }

      let shouldUpload = false;
      let imageFile: File;

      if (image.file) {
        // New image - always upload
        imageFile = image.file;
        shouldUpload = true;
      } else {
        // Existing image - check if it needs to be moved/renamed
        const currentFileName = image.name;
        if (currentFileName !== fileName) {
          // Image position changed, need to re-upload
          const response = await fetch(image.url);
          const blob = await response.blob();
          imageFile = new File([blob], fileName, { type: blob.type });
          shouldUpload = true;
        }
      }

      if (shouldUpload) {
        const uploadPromise = supabase.storage
          .from("properties")
          .upload(filePath, imageFile!, {
            cacheControl: "3600",
            upsert: true,
          })
          .then(({ error }) => {
            if (error) {
              console.error(`Error uploading ${fileName}:`, error);
              throw error;
            }
            return filePath;
          });

        uploadPromises.push(uploadPromise);
      }
    }

    // 4. Update main.jpg if main image changed
    if (mainImageIndex >= 0 && mainImageIndex < allImages.length) {
      const mainImage = allImages[mainImageIndex];
      let mainImageFile: File;

      if (mainImage.file) {
        mainImageFile = mainImage.file;
      } else {
        const response = await fetch(mainImage.url);
        const blob = await response.blob();
        mainImageFile = new File([blob], "main.jpg", { type: blob.type });
      }

      const mainFilePath = `${propertyCode}/main.jpg`;
      const mainUploadPromise = supabase.storage
        .from("properties")
        .upload(mainFilePath, mainImageFile, {
          cacheControl: "3600",
          upsert: true,
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

    // 5. Remove any numbered files that are no longer needed
    const currentNumberedFileCount = allImages.length;
    const extraFiles = existingNumberedFiles.filter((file) => {
      const fileNumber = parseInt(file.name.match(/^(\d+)/)?.[1] || "0");
      return fileNumber > currentNumberedFileCount;
    });

    if (extraFiles.length > 0) {
      const extraFilesToDelete = extraFiles.map(
        (file) => `${propertyCode}/${file.name}`
      );

      try {
        const { error: deleteExtraError } = await supabase.storage
          .from("properties")
          .remove(extraFilesToDelete);

        if (deleteExtraError) {
          console.error(
            "Error deleting extra numbered files:",
            deleteExtraError
          );
        }
      } catch (error) {
        console.error("Error deleting extra files:", error);
      }
    }

    return Promise.all(uploadPromises);
  };

  // Upload images function similar to the one in useCreateProperty
  const uploadImages = async (
    propertyCode: string,
    allImages: Array<{
      id: string;
      url: string;
      name: string;
      file?: File;
      isNew?: boolean;
    }>,
    mainImageId: string
  ) => {
    if (allImages.length === 0) {
      throw new Error("Debe mantener al menos una imagen");
    }

    // 1. Delete all existing images first
    try {
      const { data: existingFiles, error: listError } = await supabase.storage
        .from("properties")
        .list(propertyCode);

      if (listError) {
        console.error("Error listing existing files:", listError);
      } else if (existingFiles) {
        const imageFiles = existingFiles.filter((file) => {
          const extension = file.name.toLowerCase().split(".").pop();
          return ["jpg", "jpeg", "png", "webp"].includes(extension || "");
        });

        if (imageFiles.length > 0) {
          const filesToDelete = imageFiles.map(
            (file) => `${propertyCode}/${file.name}`
          );
          const { error: deleteError } = await supabase.storage
            .from("properties")
            .remove(filesToDelete);

          if (deleteError) {
            console.error("Error deleting existing images:", deleteError);
          }
        }
      }
    } catch (error) {
      console.error("Error in deletion phase:", error);
    }

    // 2. Prepare files for upload
    const imageFiles: File[] = [];
    let mainImageIndex = 0;

    for (let i = 0; i < allImages.length; i++) {
      const image = allImages[i];
      let imageFile: File;

      if (image.file) {
        // New image - use the file directly
        imageFile = image.file;
      } else {
        // Existing image - fetch it first
        const response = await fetch(image.url);
        const blob = await response.blob();
        imageFile = new File([blob], image.name, { type: blob.type });
      }

      imageFiles.push(imageFile);

      // Track which image is the main one
      if (image.id === mainImageId) {
        mainImageIndex = i;
      }
    }

    // 3. Upload all images in order as 1.jpg, 2.jpg, etc.
    const uploadPromises: Promise<string>[] = [];

    imageFiles.forEach((file, index) => {
      const fileName = `${index + 1}.jpg`;
      const filePath = `${propertyCode}/${fileName}`;

      const uploadPromise = supabase.storage
        .from("properties")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true, // Allow overwriting since we deleted all files first
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

    // 4. Additionally upload the main image as main.jpg
    if (mainImageIndex >= 0 && mainImageIndex < imageFiles.length) {
      const mainFile = imageFiles[mainImageIndex];
      const mainFilePath = `${propertyCode}/main.jpg`;

      const mainUploadPromise = supabase.storage
        .from("properties")
        .upload(mainFilePath, mainFile, {
          cacheControl: "3600",
          upsert: true, // Allow overwriting
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

  const updateProperty = async (
    propertyCode: string, // Use property_code instead of database ID
    data: EditPropertyData,
    newImages?: File[], // Deprecated - keeping for backward compatibility
    mainImageIndex?: number, // Deprecated - keeping for backward compatibility
    deletedImages?: string[], // Deprecated - keeping for backward compatibility
    currentImageCount?: number, // Deprecated - keeping for backward compatibility
    amenities: string[] = [],
    imageOrder?: string[], // Deprecated - keeping for backward compatibility
    mainImageId?: string,
    allImages?: Array<{
      id: string;
      url: string;
      name: string;
      file?: File;
      isNew?: boolean;
    }>,
    hasImageChanges?: boolean // New parameter to indicate if images were modified
  ) => {
    setIsSubmitting(true);

    try {
      // Prepare the property data for database
      const propertyData = {
        title: data.title,
        property_type: data.property_type,
        transaction_type: data.transaction_type,
        price: data.price,
        currency: data.currency,
        city: data.city,
        district: data.district,
        province: data.province || null,
        address: data.address || null,
        full_location: `${data.district}, ${data.city}${
          data.province ? `, ${data.province}` : ""
        }`,
        area: data.area,
        built_area: data.built_area || null,
        bedrooms: data.bedrooms || null,
        bathrooms: data.bathrooms || null,
        parking: data.parking || null,
        description: data.description || null,
        agent_id: data.agent_id,
        age: data.age || null,
        updated_at: new Date().toISOString(),
      };

      // Update property in database
      const { data: updatedProperty, error: updateError } = await supabase
        .from("properties")
        .update(propertyData)
        .eq("property_code", propertyCode)
        .select();

      if (updateError) {
        toast.error(`Error al actualizar la propiedad: ${updateError.message}`);
        return { success: false, error: updateError };
      }

      // Handle image uploads only if there are changes
      if (hasImageChanges && allImages && allImages.length > 0 && mainImageId) {
        try {
          await updateImagesSelectively(
            propertyCode,
            allImages,
            mainImageId,
            deletedImages || []
          );
        } catch (uploadError) {
          console.error("Error updating images:", uploadError);
          toast.error(
            "Propiedad actualizada pero hubo un error al actualizar las imágenes"
          );
        }
      }

      // Handle amenities updates
      if (updatedProperty && updatedProperty.length > 0) {
        const propertyId = updatedProperty[0].id;

        // Get current amenities to compare
        const { data: currentAmenities } = await supabase
          .from("property_amenities")
          .select("amenity_id")
          .eq("property_id", propertyId);

        const currentAmenityIds =
          currentAmenities?.map((item) => item.amenity_id) || [];

        // Find amenities to add and remove
        const amenitiesToAdd = amenities.filter(
          (id) => !currentAmenityIds.includes(id)
        );
        const amenitiesToRemove = currentAmenityIds.filter(
          (id) => !amenities.includes(id)
        );

        // Remove amenities that are no longer selected
        if (amenitiesToRemove.length > 0) {
          const { error: deleteError } = await supabase
            .from("property_amenities")
            .delete()
            .eq("property_id", propertyId)
            .in("amenity_id", amenitiesToRemove);

          if (deleteError) {
            console.error("Error removing amenities:", deleteError);
          }
        }

        // Add new amenities
        if (amenitiesToAdd.length > 0) {
          const amenityInserts = amenitiesToAdd.map((amenityId) => ({
            property_id: propertyId,
            amenity_id: amenityId,
          }));

          const { error: insertError } = await supabase
            .from("property_amenities")
            .insert(amenityInserts);

          if (insertError) {
            console.error("Error adding amenities:", insertError);
            toast.error(
              "Propiedad actualizada pero hubo un error al actualizar las comodidades"
            );
          }
        }
      }

      // Invalidate relevant queries to refresh UI automatically
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      queryClient.invalidateQueries({ queryKey: ["latest-properties"] });
      queryClient.invalidateQueries({ queryKey: ["all-properties-for-edit"] });
      queryClient.invalidateQueries({ queryKey: ["property", propertyCode] });

      // Show appropriate success message
      if (hasImageChanges) {
        toast.success("Propiedad e imágenes actualizadas exitosamente");
      } else {
        toast.success("Propiedad actualizada exitosamente");
      }

      return { success: true, data: updatedProperty };
    } catch (error) {
      console.error("Error in updateProperty:", error);
      toast.error("Error inesperado al actualizar la propiedad");
      return { success: false, error };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    updateProperty,
    isSubmitting,
  };
};
