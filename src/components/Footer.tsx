import {
  Facebook,
  Instagram,
  Youtube,
  Twitter,
  MapPin,
  Phone,
  Mail,
  Clock,
} from "lucide-react";
import { Link } from "react-router-dom";
import zimaLogo from "@/assets/zima-logo.png";
import zimaLogoFooter from "@/assets/zima-logo-footer.png";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const handleSmoothScroll = (href: string, e: React.MouseEvent) => {
    if (href.startsWith("/#")) {
      e.preventDefault();
      const targetId = href.substring(2); // Remove "/#" prefix
      const targetElement = document.getElementById(targetId);

      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }
  };

  const footerLinks = {
    propiedades: [
      {
        name: "Casas en Venta",
        href: "/propiedades?type=casa",
      },
      {
        name: "Departamentos en Venta",
        href: "/propiedades?type=departamento",
      },
      {
        name: "Terrenos en Venta",
        href: "/propiedades?type=terreno",
      },
      {
        name: "Propiedades en Alquiler",
        href: "/propiedades?transactionType=alquiler",
      },
      { name: "Locales Comerciales", href: "/propiedades?type=comercial" },
      { name: "Locales Industriales", href: "/propiedades?type=industrial" },
    ],
    empresa: [
      { name: "Nosotros", href: "/#nosotros" },
      { name: "Libro de Reclamaciones", href: "/libro-reclamaciones" },
    ],
    soporte: [
      { name: "Centro de Ayuda", href: "/ayuda" },
      { name: "Preguntas Frecuentes", href: "/faq" },
      { name: "Contacto", href: "/contacto" },
      { name: "Términos y Condiciones", href: "/terminos" },
      { name: "Política de Privacidad", href: "/privacidad" },
    ],
  };

  const socialLinks = [
    {
      name: "Facebook",
      icon: Facebook,
      href: "https://www.zimagestioninmobiliaria.com",
      color: "hover:text-blue-600",
    },
    {
      name: "Instagram",
      icon: Instagram,
      href: "https://www.zimagestioninmobiliaria.com",
      color: "hover:text-pink-600",
    },
    {
      name: "YouTube",
      icon: Youtube,
      href: "https://www.zimagestioninmobiliaria.com",
      color: "hover:text-red-600",
    },
    {
      name: "Twitter",
      icon: Twitter,
      href: "https://www.zimagestioninmobiliaria.com",
      color: "hover:text-blue-400",
    },
  ];

  const offices = [
    {
      city: "Oficina Principal",
      address: "Calle Porta 107, Miraflores, Lima 15064",
      phone: "Compra • Venta • Inversión",
      email: "contacto@zimagestioninmobiliaria.com",
    },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-6">
            <div>
              <img
                src={zimaLogoFooter}
                alt="ZIMA Real Estate"
                className="h-16 w-auto mb-4"
              />
              <p className="text-gray-300 leading-relaxed">
                Bienes raíces en Lima, Perú
                <br />
                Compra • Venta • Inversión
                <br />
                Asesoría personalizada
              </p>
            </div>

            {/* Social Media */}
            <div>
              <h4 className="font-semibold mb-4">Síguenos</h4>
              <div className="flex space-x-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center transition-all duration-300 hover:bg-primary ${social.color}`}
                  >
                    <social.icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Properties Links */}
          <div>
            <h4 className="font-semibold mb-6 text-lg">Propiedades</h4>
            <ul className="space-y-3">
              {footerLinks.propiedades.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-300 hover:text-primary transition-colors duration-300 hover:translate-x-1 inline-block"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-semibold mb-6 text-lg">La Empresa</h4>
            <ul className="space-y-3">
              {footerLinks.empresa.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    onClick={(e) => handleSmoothScroll(link.href, e)}
                    className="text-gray-300 hover:text-primary transition-colors duration-300 hover:translate-x-1 inline-block"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold mb-6 text-lg">Contáctanos</h4>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <p className="text-gray-300">Oficina Principal</p>
                  <p className="text-sm text-gray-400">Calle Porta 107</p>
                  <p className="text-sm text-gray-400">
                    Miraflores, Lima 15064
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                <div>
                  <p className="text-gray-300">Asesoría personalizada</p>
                  <p className="text-sm text-gray-400">
                    Lun - Sáb: 9:00 - 19:00
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-primary flex-shrink-0" />
                <div>
                  <p className="text-gray-300">contacto@zimagestioninmobiliaria.com</p>
                  <p className="text-sm text-gray-400">Respuesta en 24h</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-primary flex-shrink-0" />
                <div>
                  <p className="text-gray-300">Horario de Atención</p>
                  <p className="text-sm text-gray-400">
                    Lun - Sáb: 9:00 - 19:00
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Offices Section */}
        <div className="border-t border-gray-800 mt-12 pt-12">
          <h4 className="font-semibold mb-6 text-lg text-center">
            Nuestra Oficina
          </h4>
          <div className="grid grid-cols-1 gap-6 max-w-md mx-auto">
            {offices.map((office) => (
              <div
                key={office.city}
                className="bg-gray-800 rounded-lg p-6 text-center hover:bg-gray-700 transition-colors duration-300"
              >
                <h5 className="font-semibold text-primary mb-3">
                  {office.city}
                </h5>
                <p className="text-sm text-gray-300 mb-2">{office.address}</p>
                <p className="text-sm text-gray-300 mb-2">{office.phone}</p>
                <p className="text-sm text-gray-400">{office.email}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800 bg-gray-950">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-gray-400">
              © {currentYear} ZIMA Gestión Inmobiliaria. Todos los derechos reservados.
            </div>

            <div className="flex flex-wrap justify-center space-x-6 text-sm text-gray-400">
              <Link
                to="/terminos"
                className="hover:text-primary transition-colors"
              >
                Términos de Uso
              </Link>
              <Link
                to="/privacidad"
                className="hover:text-primary transition-colors"
              >
                Política de Privacidad
              </Link>
              <Link
                to="/cookies"
                className="hover:text-primary transition-colors"
              >
                Política de Cookies
              </Link>
              <Link
                to="/ayuda"
                className="hover:text-primary transition-colors"
              >
                Centro de Ayuda
              </Link>
              <Link
                to="/libro-reclamaciones"
                className="hover:text-primary transition-colors font-medium text-gray-300"
              >
                Libro de Reclamaciones
              </Link>
            </div>

            <div className="text-sm text-gray-400">
              Desarrollado con ❤️ para ZIMA Gestión Inmobiliaria
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
