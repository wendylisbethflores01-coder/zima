import { useState } from "react";
import { Check, ChevronsUpDown, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { usePropertyLocations } from "@/hooks/usePropertyLocations";

interface LocationComboboxProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function LocationCombobox({
  value,
  onValueChange,
  placeholder = "¿En Dónde la Buscas?",
  className
}: LocationComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  
  const { locations, loading } = usePropertyLocations(search);

  const handleSelect = (selectedValue: string) => {
    onValueChange(selectedValue === value ? "" : selectedValue);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full h-14 justify-between bg-white border-2 border-gray-200 hover:border-primary transition-colors rounded-xl",
            className
          )}
        >
          <div className="flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-gray-500" />
            <span className={cn(
              value ? "text-gray-900" : "text-gray-500"
            )}>
              {value || placeholder}
            </span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 bg-white z-50" align="start">
        <Command>
          <CommandInput 
            placeholder="Buscar ubicación..." 
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>
              {loading ? "Cargando..." : "No se encontraron ubicaciones."}
            </CommandEmpty>
            <CommandGroup>
              {locations.map((location) => (
                <CommandItem
                  key={location.location_formatted}
                  value={location.location_formatted}
                  onSelect={handleSelect}
                  className="flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center">
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === location.location_formatted ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div>
                      <div className="font-medium">{location.location_formatted}</div>
                      <div className="text-sm text-gray-500">
                        {location.property_count} {location.property_count === 1 ? 'propiedad' : 'propiedades'}
                      </div>
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}