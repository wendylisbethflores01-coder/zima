import { useState } from "react";
import { getAmenityIcon } from "@/lib/iconUtils";
import {
  Star,
  Waves,
  Dumbbell,
  Car,
  Shield,
  Wifi,
  Zap,
  Home,
  Trees,
  Camera,
  Users,
  Baby,
  Gamepad2,
  Coffee,
  Wind,
  Flame,
  Droplets,
  Sun,
  Moon,
  Music,
  Tv,
  Phone,
  Mail,
  MapPin,
  Clock,
  Calendar,
  Settings,
  Lock,
  Key,
  Eye,
  Heart,
  ThumbsUp,
  Award,
  Trophy,
  Gift,
  ShoppingCart,
  CreditCard,
  Banknote,
  PiggyBank,
  Utensils,
  ChefHat,
  Wine,
  Pizza,
  IceCream2,
  Mountain,
  Flower,
  Leaf,
  CloudRain,
  Snowflake,
  Thermometer,
  Fan,
  Lightbulb,
  Bed,
  Bath,
  Sofa,
  Lamp,
  LampDesk,
  Scissors,
  Shirt,
  Package,
  Truck,
  Plane,
  Train,
  Bike,
  Fuel,
  Building,
  Church,
  School,
  Hospital,
  Store,
  Factory,
  Warehouse,
  Construction,
  Hammer,
  Wrench,
  Drill,
  Paintbrush,
  Palette,
  Video,
  Headphones,
  Smartphone,
  Laptop,
  Monitor,
  Printer,
  Speaker,
  Mic,
  Radio,
  Disc,
  Volume2,
  VolumeX,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Repeat,
  Shuffle,
  Search,
  Filter,
  Download,
  Upload,
  Share,
  Copy,
  Clipboard,
  FileText,
  Folder,
  Archive,
  Trash2,
  Edit,
  Save,
  Plus,
  Minus,
  X,
  Check,
  AlertTriangle,
  Info,
  HelpCircle,
  MessageCircle,
  Send,
  Inbox,
  Bell,
  BellOff,
  Flag,
  Bookmark,
  Link,
  ExternalLink,
  Globe,
  Compass,
  Navigation,
  Route,
  Map,
  Locate,
  Target,
  Crosshair,
  Focus,
  Scan,
  QrCode,
  Wallet,
  Coins,
  DollarSign,
  Euro,
  PoundSterling,
  Bitcoin,
  TrendingUp,
  TrendingDown,
  BarChart,
  PieChart,
  LineChart,
  Activity,
  Stethoscope,
  Pill,
  Syringe,
  Bandage,
  Ambulance,
  Cross,
  LifeBuoy,
  Accessibility,
  Glasses,
  Hand,
  Fingerprint,
  User,
  UserPlus,
  UserMinus,
  UserCheck,
  UserX,
  UsersRound,
  UserCog,
  Crown,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Unlock,
  KeyRound,
  ScanFace,
  EyeOff,
  Image,
  ImageOff,
  ImagePlus,
  ImageMinus,
  Frame,
  Crop,
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  ZoomIn,
  ZoomOut,
  Maximize,
  Minimize,
  Move,
  MousePointer,
  Grab,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// Lista de iconos organizados por categorías
const iconCategories = {
  Recreación: [
    { name: "Waves", icon: Waves, label: "Piscina" },
    { name: "Dumbbell", icon: Dumbbell, label: "Gimnasio" },
    { name: "Gamepad2", icon: Gamepad2, label: "Juegos" },
    { name: "Music", icon: Music, label: "Música" },
    { name: "Tv", icon: Tv, label: "TV" },
    { name: "Coffee", icon: Coffee, label: "Café" },
    { name: "Wine", icon: Wine, label: "Bar" },
    { name: "Pizza", icon: Pizza, label: "Comida" },
    { name: "IceCream2", icon: IceCream2, label: "Helados" },
    { name: "Mountain", icon: Mountain, label: "Montaña" },
    { name: "Waves", icon: Waves, label: "Playa" },
    { name: "Trees", icon: Trees, label: "Jardín" },
    { name: "Flower", icon: Flower, label: "Flores" },
  ],
  Seguridad: [
    { name: "Shield", icon: Shield, label: "Seguridad" },
    { name: "Camera", icon: Camera, label: "Cámaras" },
    { name: "Lock", icon: Lock, label: "Cerraduras" },
    { name: "Key", icon: Key, label: "Llaves" },
    { name: "Eye", icon: Eye, label: "Vigilancia" },
    { name: "ShieldCheck", icon: ShieldCheck, label: "Protegido" },
    { name: "Fingerprint", icon: Fingerprint, label: "Biométrico" },
    { name: "Bell", icon: Bell, label: "Alarma" },
  ],
  Servicios: [
    { name: "Wifi", icon: Wifi, label: "WiFi" },
    { name: "Zap", icon: Zap, label: "Electricidad" },
    { name: "Droplets", icon: Droplets, label: "Agua" },
    { name: "Flame", icon: Flame, label: "Gas" },
    { name: "Wind", icon: Wind, label: "Aire" },
    { name: "Fan", icon: Fan, label: "Ventilador" },
    { name: "Lightbulb", icon: Lightbulb, label: "Iluminación" },
    { name: "Phone", icon: Phone, label: "Teléfono" },
    { name: "Truck", icon: Truck, label: "Delivery" },
    { name: "Package", icon: Package, label: "Paquetería" },
  ],
  Transporte: [
    { name: "Car", icon: Car, label: "Estacionamiento" },
    { name: "Bike", icon: Bike, label: "Bicicletas" },
    { name: "Plane", icon: Plane, label: "Aeropuerto" },
    { name: "Train", icon: Train, label: "Metro/Tren" },
    { name: "Fuel", icon: Fuel, label: "Gasolinera" },
  ],
  Hogar: [
    { name: "Home", icon: Home, label: "Casa" },
    { name: "Bed", icon: Bed, label: "Dormitorio" },
    { name: "Bath", icon: Bath, label: "Baño" },
    { name: "Sofa", icon: Sofa, label: "Sala" },
    { name: "Lamp", icon: Lamp, label: "Lámpara" },
    { name: "LampDesk", icon: LampDesk, label: "Espejo" },
    { name: "Utensils", icon: Utensils, label: "Cocina" },
    { name: "ChefHat", icon: ChefHat, label: "Chef" },
  ],
  Salud: [
    { name: "Heart", icon: Heart, label: "Salud" },
    { name: "Stethoscope", icon: Stethoscope, label: "Médico" },
    { name: "Pill", icon: Pill, label: "Farmacia" },
    { name: "Cross", icon: Cross, label: "Primeros Auxilios" },
    { name: "Accessibility", icon: Accessibility, label: "Accesibilidad" },
  ],
  Lugares: [
    { name: "Building", icon: Building, label: "Edificio" },
    { name: "Church", icon: Church, label: "Iglesia" },
    { name: "School", icon: School, label: "Escuela" },
    { name: "Hospital", icon: Hospital, label: "Hospital" },
    { name: "Store", icon: Store, label: "Tienda" },
    { name: "ShoppingCart", icon: ShoppingCart, label: "Centro Comercial" },
  ],
  General: [
    { name: "Star", icon: Star, label: "Estrella" },
    { name: "Award", icon: Award, label: "Premio" },
    { name: "Trophy", icon: Trophy, label: "Trofeo" },
    { name: "Gift", icon: Gift, label: "Regalo" },
    { name: "ThumbsUp", icon: ThumbsUp, label: "Me Gusta" },
    { name: "Check", icon: Check, label: "Verificado" },
    { name: "Settings", icon: Settings, label: "Configuración" },
  ],
};

interface IconSelectorProps {
  selectedIcon: string;
  onIconSelect: (iconName: string) => void;
  className?: string;
}

const IconSelector: React.FC<IconSelectorProps> = ({
  selectedIcon,
  onIconSelect,
  className,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("General");

  // Obtener el componente del ícono seleccionado usando la función centralizada
  const SelectedIconComponent = getAmenityIcon(selectedIcon);

  // Filtrar iconos por búsqueda
  const filteredIcons = searchQuery
    ? Object.values(iconCategories)
        .flat()
        .filter(
          (icon) =>
            icon.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            icon.label.toLowerCase().includes(searchQuery.toLowerCase())
        )
    : iconCategories[selectedCategory] || [];

  return (
    <div className={cn("space-y-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start h-10 px-3"
            type="button"
          >
            <SelectedIconComponent className="w-4 h-4 mr-2" />
            {selectedIcon || "Seleccionar ícono"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-96 p-0" align="start">
          <div className="p-4 border-b">
            <Input
              placeholder="Buscar íconos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mb-3"
            />

            {!searchQuery && (
              <div className="flex flex-wrap gap-1">
                {Object.keys(iconCategories).map((category) => (
                  <Button
                    key={category}
                    variant={
                      selectedCategory === category ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className="text-xs"
                  >
                    {category}
                  </Button>
                ))}
              </div>
            )}
          </div>

          <ScrollArea className="h-80">
            <div className="grid grid-cols-4 gap-2 p-4">
              {filteredIcons.map((iconItem) => {
                const IconComponent = iconItem.icon;
                return (
                  <Button
                    key={iconItem.name}
                    variant={
                      selectedIcon === iconItem.name ? "default" : "ghost"
                    }
                    className="h-16 flex flex-col items-center justify-center p-2"
                    onClick={() => {
                      onIconSelect(iconItem.name);
                    }}
                    title={iconItem.label}
                  >
                    <IconComponent className="w-5 h-5 mb-1" />
                    <span className="text-xs text-center leading-tight">
                      {iconItem.label}
                    </span>
                  </Button>
                );
              })}
            </div>
          </ScrollArea>

          {filteredIcons.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              <Search className="w-8 h-8 mx-auto mb-2" />
              <p>No se encontraron íconos</p>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default IconSelector;
