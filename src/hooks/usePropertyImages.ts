import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const usePropertyImages = (propertyCode: string) => {
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchImages = async () => {
      if (!propertyCode) return;

      try {
        setLoading(true);
        setError(null);

        // List all files in the property folder
        const { data: files, error: listError } = await supabase.storage
          .from("properties")
          .list(propertyCode, {
            limit: 20,
            sortBy: { column: "name", order: "asc" },
          });

        if (listError) {
          throw listError;
        }

        if (!files || files.length === 0) {
          // If no files found, set empty array as carousel should only show numbered images
          setImages([]);
          return;
        }

        // Filter out main.jpg and map.png, then sort the remaining files numerically
        const filteredFiles = files
          .filter((file) => {
            const extension = file.name.toLowerCase().split(".").pop();
            const isImageFile = ["jpg", "jpeg", "png", "webp"].includes(
              extension || "",
            );
            const isNotMainImage = file.name !== "main.jpg";
            const isNotMapImage = file.name !== "map.png";
            return isImageFile && isNotMainImage && isNotMapImage;
          })
          .sort((a, b) => {
            // Extract numbers from filenames for proper numerical sorting
            const getNumber = (filename: string) => {
              const match = filename.match(/(\d+)/);
              return match ? parseInt(match[1]) : 0;
            };
            return getNumber(a.name) - getNumber(b.name);
          });

        // Get public URLs for all filtered image files
        const imageUrls = filteredFiles.map((file) => {
          const { data } = supabase.storage
            .from("properties")
            .getPublicUrl(`${propertyCode}/${file.name}`);
          return data.publicUrl;
        });

        setImages(imageUrls);
      } catch (err) {
        console.error("Error fetching property images:", err);
        setError(err instanceof Error ? err.message : "Error loading images");

        // Set empty array on error as carousel should only show numbered images
        setImages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, [propertyCode]);

  return { images, loading, error };
};
