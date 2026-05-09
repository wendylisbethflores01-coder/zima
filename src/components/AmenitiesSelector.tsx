import { useState } from 'react';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useAmenities } from '@/hooks/useAmenities';

interface AmenitiesSelectorProps {
  selectedAmenities: string[];
  onSelectionChange: (amenities: string[]) => void;
  disabled?: boolean;
}

export function AmenitiesSelector({ selectedAmenities, onSelectionChange, disabled }: AmenitiesSelectorProps) {
  const [open, setOpen] = useState(false);
  const { data: amenities = [], isLoading } = useAmenities();

  const selectedAmenitiesData = amenities.filter(amenity => 
    selectedAmenities.includes(amenity.id)
  );

  const toggleAmenity = (amenityId: string) => {
    const newSelection = selectedAmenities.includes(amenityId)
      ? selectedAmenities.filter(id => id !== amenityId)
      : [...selectedAmenities, amenityId];
    
    onSelectionChange(newSelection);
  };

  const removeAmenity = (amenityId: string) => {
    onSelectionChange(selectedAmenities.filter(id => id !== amenityId));
  };

  // Group amenities by category
  const groupedAmenities = amenities.reduce((groups, amenity) => {
    const category = amenity.category || 'Otros';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(amenity);
    return groups;
  }, {} as Record<string, typeof amenities>);

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={disabled || isLoading}
          >
            {selectedAmenities.length === 0
              ? "Seleccionar comodidades..."
              : `${selectedAmenities.length} comodidad${selectedAmenities.length === 1 ? '' : 'es'} seleccionada${selectedAmenities.length === 1 ? '' : 's'}`
            }
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder="Buscar comodidades..." />
            <CommandList>
              <CommandEmpty>No se encontraron comodidades.</CommandEmpty>
              {Object.entries(groupedAmenities).map(([category, categoryAmenities]) => (
                <CommandGroup key={category} heading={category}>
                  {categoryAmenities.map((amenity) => (
                    <CommandItem
                      key={amenity.id}
                      value={amenity.name}
                      onSelect={() => toggleAmenity(amenity.id)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedAmenities.includes(amenity.id) ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <span className="flex items-center gap-2">
                        {amenity.name}
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Selected amenities display */}
      {selectedAmenitiesData.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedAmenitiesData.map((amenity) => (
            <Badge key={amenity.id} variant="secondary" className="gap-1">
              {amenity.name}
              <X
                className="h-3 w-3 cursor-pointer hover:text-destructive"
                onClick={() => removeAmenity(amenity.id)}
              />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}