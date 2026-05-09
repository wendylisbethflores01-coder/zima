import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Phone, Mail, User, LogIn, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { useToast } from "@/hooks/use-toast";
import { isProtectedRoute } from "@/lib/utils";
import zimaLogo from "@/assets/zima-logo.png";
const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { role } = useUserRole();
  const { toast } = useToast();
  const isActive = (path: string) => location.pathname === path;

  const handleLoginClick = () => {
    if (user) {
      if (role === "admin") {
        navigate("/admin");
      } else if (role === "agent") {
        navigate("/agent-dashboard");
      } else {
        navigate("/");
      }
    } else {
      navigate("/auth");
    }
  };

  const handleLogoutClick = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Error",
        description: "No se pudo cerrar sesión",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión exitosamente",
      });
      navigate("/");
    }
  };

  // Determine button text and action based on route and user status
  const isOnProtectedRoute = isProtectedRoute(location.pathname);

  const getButtonContent = () => {
    if (isOnProtectedRoute) {
      // On protected route: always show "Cerrar sesión"
      return {
        text: "Cerrar sesión",
        icon: <LogOut className="w-4 h-4 mr-1" />,
        action: handleLogoutClick,
      };
    } else if (user) {
      // Not on protected route but user is logged in: show "Ver mis propiedades"
      return {
        text: "Ver mis propiedades",
        icon: <User className="w-4 h-4 mr-1" />,
        action: handleLoginClick,
      };
    } else {
      // Not on protected route and no user: show "Ingresar"
      return {
        text: "Ingresar",
        icon: <LogIn className="w-4 h-4 mr-1" />,
        action: handleLoginClick,
      };
    }
  };

  const buttonContent = getButtonContent();

  const handleRecentPropertiesClick = () => {
    if (location.pathname === "/") {
      // Si estamos en el index, hacemos scroll
      const section = document.getElementById("ultimas-propiedades");
      if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } else {
      // Si estamos en otra página, navegamos al index
      navigate("/");
      // Esperamos un poco para que la página cargue y luego hacemos scroll
      setTimeout(() => {
        const section = document.getElementById("ultimas-propiedades");
        if (section) {
          section.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    }
  };
  const navigation = [
    {
      name: "INICIO",
      href: "/",
    },
    {
      name: "BUSCAR PROPIEDADES",
      href: "/propiedades",
    },
    {
      name: "UBICACIÓN",
      href: "/oficinas",
    },
    {
      name: "ASESORES",
      href: "/asesores",
    },
  ];
  return (
    <>
      {/* Top Bar */}
      <div className="top-bar text-white py-2 px-4 text-sm">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <span className="flex items-center">
              <Phone className="w-4 h-4 mr-2" />
              Calle Porta 107, Miraflores, Lima 15064
            </span>
            <span className="flex items-center">
              <Mail className="w-4 h-4 mr-2" />
              contacto@zimarealstate.com
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={buttonContent.action}
              className="flex items-center hover:text-white transition-colors"
            >
              {buttonContent.icon}
              {buttonContent.text}
            </button>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="glass-header sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <img
                src={zimaLogo}
                alt="ZIMA Real Estate - Bienes raíces en Lima, Perú"
                className="h-12 w-auto"
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    isActive(item.href)
                      ? "text-primary border-b-2 border-primary pb-1"
                      : "text-gray-700"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* CTA Buttons */}
            <div className="hidden lg:flex items-center space-x-4">
              <Button
                onClick={handleRecentPropertiesClick}
                className="btn-hero"
              >
                PROPIEDADES RECIENTES
              </Button>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 rounded-md text-gray-700 hover:text-primary"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="lg:hidden py-4 border-t animate-fade-in-up">
              <nav className="flex flex-col space-y-4">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`text-sm font-medium transition-colors hover:text-primary ${
                      isActive(item.href) ? "text-primary" : "text-gray-700"
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                <div className="flex flex-col space-y-2 pt-4">
                  <Button variant="outline" size="sm">
                    Franquicias
                  </Button>
                  <Button
                    onClick={handleRecentPropertiesClick}
                    className="btn-hero"
                  >
                    PROPIEDADES RECIENTES
                  </Button>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>
    </>
  );
};
export default Header;
