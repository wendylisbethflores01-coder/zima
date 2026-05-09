import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PropertyImage {
  id: string;
  url: string;
  name: string;
  isMain: boolean;
}

export const usePropertyImageManager = (propertyCode: string) => {
  const [currentImages, setCurrentImages] = useState<PropertyImage[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [deletedImages, setDeletedImages] = useState<string[]>([]);
  const [mainImageId, setMainImageId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [imageOrder, setImageOrder] = useState<string[]>([]);

  // Store initial state for comparison
  const [initialState, setInitialState] = useState<{
    originalImages: string[];
    originalMainImageId: string;
    originalOrder: string[];
  }>({
    originalImages: [],
    originalMainImageId: "",
    originalOrder: [],
  });

  // Fetch current images
  useEffect(() => {
    const fetchImages = async () => {
      if (!propertyCode) {
        setLoading(false); // Don't keep loading if no propertyCode
        return;
      }

      try {
        setLoading(true);

        const { data: files, error } = await supabase.storage
          .from("properties")
          .list(propertyCode, {
            limit: 20,
            sortBy: { column: "name", order: "asc" },
          });

        if (error) throw error;

        if (files && files.length > 0) {
          // Filter out main.jpg and map.png, only include numbered images
          const imageFiles = files.filter((file) => {
            const extension = file.name.toLowerCase().split(".").pop();
            const isImageFile = ["jpg", "jpeg", "png", "webp"].includes(
              extension || "",
            );
            const isNotMainImage = file.name !== "main.jpg";
            const isNotMapImage = file.name !== "map.png";
            return isImageFile && isNotMainImage && isNotMapImage;
          });

          const images: PropertyImage[] = imageFiles.map((file) => {
            const { data } = supabase.storage
              .from("properties")
              .getPublicUrl(`${propertyCode}/${file.name}`);

            return {
              id: file.name,
              url: data.publicUrl,
              name: file.name,
              isMain: false, // Will be set below
            };
          });

          // Sort images numerically by filename
          images.sort((a, b) => {
            const getNumber = (filename: string) => {
              const match = filename.match(/(\d+)/);
              return match ? parseInt(match[1]) : 0;
            };
            return getNumber(a.name) - getNumber(b.name);
          });

          // Set the first image as main by default
          if (images.length > 0) {
            images[0].isMain = true;
          }

          setCurrentImages(images);

          // Initialize image order on first load
          const imageIds = images.map((img) => img.id);
          setImageOrder(imageIds);

          // Set main image to the first one
          const firstImageId = images.length > 0 ? images[0].id : "";
          setMainImageId(firstImageId);

          // Store initial state for change detection
          setInitialState({
            originalImages: imageIds,
            originalMainImageId: firstImageId,
            originalOrder: imageIds,
          });
        }
      } catch (error) {
        console.error("Error fetching images:", error);
        toast.error("Error al cargar las imágenes");
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, [propertyCode]);

  const addNewImages = (files: File[]) => {
    // Validate file types
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const invalidFiles = files.filter(
      (file) => !validTypes.includes(file.type),
    );

    if (invalidFiles.length > 0) {
      toast.error("Solo se permiten archivos de imagen (JPG, PNG, WEBP)");
      return;
    }

    // Validate file size (max 5MB)
    const largeFiles = files.filter((file) => file.size > 5 * 1024 * 1024);
    if (largeFiles.length > 0) {
      toast.error("Las imágenes deben ser menores a 5MB");
      return;
    }

    // Check total image limit
    const totalImages =
      currentImages.length -
      deletedImages.length +
      newImages.length +
      files.length;
    if (totalImages > 10) {
      toast.error("Máximo 10 imágenes permitidas");
      return;
    }

    setNewImages((prev) => [...prev, ...files]);

    // Add new image IDs to the order
    const newImageIds = files.map(
      (_, index) => `new-${newImages.length + index}`,
    );
    setImageOrder((prev) => [...prev, ...newImageIds]);
  };

  const removeCurrentImage = (imageId: string) => {
    const imageToRemove = currentImages.find((img) => img.id === imageId);
    if (!imageToRemove) return;

    // Don't allow removing all images
    const remainingCurrentImages = currentImages.filter(
      (img) => !deletedImages.includes(img.id) && img.id !== imageId,
    );
    if (remainingCurrentImages.length === 0 && newImages.length === 0) {
      toast.error("Debe mantener al menos una imagen");
      return;
    }

    setDeletedImages((prev) => [...prev, imageId]);

    // Remove from order
    setImageOrder((prev) => prev.filter((id) => id !== imageId));

    // If removing main image, set a new main image
    if (imageToRemove.isMain) {
      const nextImage = remainingCurrentImages[0];
      if (nextImage) {
        setMainImageId(nextImage.id);
      } else if (newImages.length > 0) {
        setMainImageId("new-0"); // Will use first new image as main
      }
    }
  };

  const removeNewImage = (index: number) => {
    const imageIdToRemove = `new-${index}`;
    setNewImages((prev) => prev.filter((_, i) => i !== index));

    // Remove from order and adjust subsequent new image IDs
    setImageOrder((prev) => {
      const newOrder = prev.filter((id) => id !== imageIdToRemove);
      // Adjust IDs for images that come after the removed one
      return newOrder.map((id) => {
        if (id.startsWith("new-")) {
          const idIndex = parseInt(id.split("-")[1]);
          if (idIndex > index) {
            return `new-${idIndex - 1}`;
          }
        }
        return id;
      });
    });

    // If removing main image from new images, adjust main image ID
    if (mainImageId === imageIdToRemove) {
      const remainingCurrentImages = currentImages.filter(
        (img) => !deletedImages.includes(img.id),
      );
      if (remainingCurrentImages.length > 0) {
        setMainImageId(remainingCurrentImages[0].id);
      } else if (newImages.length > 1) {
        setMainImageId("new-0");
      }
    } else if (mainImageId.startsWith("new-")) {
      // Adjust main image ID if it's a new image that comes after the removed one
      const mainIndex = parseInt(mainImageId.split("-")[1]);
      if (mainIndex > index) {
        setMainImageId(`new-${mainIndex - 1}`);
      }
    }
  };

  const setAsMainImage = (imageId: string) => {
    setMainImageId(imageId);
  };

  const moveImageUp = (imageId: string) => {
    setImageOrder((prev) => {
      const currentIndex = prev.indexOf(imageId);
      if (currentIndex <= 0) return prev; // Already at the top or not found

      const newOrder = [...prev];
      [newOrder[currentIndex], newOrder[currentIndex - 1]] = [
        newOrder[currentIndex - 1],
        newOrder[currentIndex],
      ];
      return newOrder;
    });
  };

  const moveImageDown = (imageId: string) => {
    setImageOrder((prev) => {
      const currentIndex = prev.indexOf(imageId);
      if (currentIndex === -1 || currentIndex >= prev.length - 1) return prev; // Not found or already at the bottom

      const newOrder = [...prev];
      [newOrder[currentIndex], newOrder[currentIndex + 1]] = [
        newOrder[currentIndex + 1],
        newOrder[currentIndex],
      ];
      return newOrder;
    });
  };

  const getAllImages = () => {
    const activeCurrentImages = currentImages.filter(
      (img) => !deletedImages.includes(img.id),
    );
    const newImageItems = newImages.map((file, index) => ({
      id: `new-${index}`,
      url: URL.createObjectURL(file),
      name: file.name,
      isNew: true,
      file,
    }));

    const allImages = [...activeCurrentImages, ...newImageItems];

    // Sort according to the defined order
    allImages.sort((a, b) => {
      const indexA = imageOrder.indexOf(a.id);
      const indexB = imageOrder.indexOf(b.id);

      // If both images are in the order array, sort by their position
      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }

      // If only one is in the order array, prioritize it
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;

      // If neither is in the order array, maintain original order
      return 0;
    });

    return allImages;
  };

  const getMainImageIndex = () => {
    const allImages = getAllImages();
    return allImages.findIndex((img) => img.id === mainImageId);
  };

  // Check if there are any changes to images
  const hasImageChanges = () => {
    // Check if there are new images added
    if (newImages.length > 0) {
      return true;
    }

    // Check if there are images deleted
    if (deletedImages.length > 0) {
      return true;
    }

    // Check if the order has changed from the original
    const currentOrder = imageOrder.filter(
      (id) => !id.startsWith("new-") && !deletedImages.includes(id),
    );

    if (initialState.originalOrder.length !== currentOrder.length) {
      return true;
    }

    // Check if the order is different
    const orderChanged = initialState.originalOrder.some(
      (id, index) => id !== currentOrder[index],
    );
    if (orderChanged) {
      return true;
    }

    // Check if main image has changed
    if (
      mainImageId !== initialState.originalMainImageId &&
      !mainImageId.startsWith("new-")
    ) {
      return true;
    }

    return false;
  };

  // Get initial state for comparison
  const getInitialState = () => {
    return initialState;
  };

  return {
    currentImages: currentImages.filter(
      (img) => !deletedImages.includes(img.id),
    ),
    newImages,
    deletedImages,
    mainImageId,
    loading,
    imageOrder,
    addNewImages,
    removeCurrentImage,
    removeNewImage,
    setAsMainImage,
    moveImageUp,
    moveImageDown,
    getAllImages,
    getMainImageIndex: Math.max(0, getMainImageIndex()), // Ensure it's never negative
    hasImageChanges,
    getInitialState,
  };
};
