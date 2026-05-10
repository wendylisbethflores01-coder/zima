import { useState } from "react";
import {
  Award,
  Users,
  Home,
  Globe,
  TrendingUp,
  Shield,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const CompanyInfo = () => {
  const [activeTab, setActiveTab] = useState("about");

  const stats = [
    { icon: Home, number: "+200", label: "Propiedades Vendidas", color: "text-primary" },
    { icon: Users, number: "+50", label: "Agentes Certificados", color: "text-secondary" },
    { icon: Award, number: "+10", label: "Años de Experiencia", color: "text-green-600" },
    { icon: Globe, number: "24", label: "Departamentos del Perú", color: "text-purple-600" },
  ];

  const achievements = [
    { title: "Líder en Lima", description: "ZIMA Gestión Inmobiliaria es una marca reconocida en Lima, Perú" },
    { title: "Tecnología Avanzada", description: "Utilizamos las herramientas más modernas para la comercialización de propiedades" },
    { title: "Red Global", description: "Conectamos compradores y vendedores en más de 110 países" },
    { title: "Agentes Certificados", description: "Nuestros agentes están altamente capacitados y certificados" },
  ];

  return (
    <section id="nosotros" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            ¿Por qué elegir <span className="text-gradient">ZIMA</span>?
          </h2>
          <div className="w-20 h-1 bg-primary mx-auto mb-6"></div>
          <p className="text-gray-600 max-w-3xl mx-auto text-lg">
            Somos la red inmobiliaria más grande del mundo, con una presencia
            global que nos permite ofrecer el mejor servicio a nuestros clientes.
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <Card
              key={index}
              className="text-center p-6 hover-lift hover-glow transition-all duration-300 animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-0">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4 ${stat.color}`}>
                  <stat.icon className="w-8 h-8" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</h3>
                <p className="text-gray-600">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="animate-fade-in-left">
            {/* Tab Navigation */}
            <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab("about")}
                className={`flex-1 py-3 px-4 rounded-md font-medium transition-all duration-300 ${
                  activeTab === "about" ? "bg-primary text-white shadow-md" : "text-gray-600 hover:text-primary"
                }`}
              >
                Nosotros
              </button>
              <button
                onClick={() => setActiveTab("mission")}
                className={`flex-1 py-3 px-4 rounded-md font-medium transition-all duration-300 ${
                  activeTab === "mission" ? "bg-primary text-white shadow-md" : "text-gray-600 hover:text-primary"
                }`}
              >
                Misión
              </button>
              <button
                onClick={() => setActiveTab("values")}
                className={`flex-1 py-3 px-4 rounded-md font-medium transition-all duration-300 ${
                  activeTab === "values" ? "bg-primary text-white shadow-md" : "text-gray-600 hover:text-primary"
                }`}
              >
                Valores
              </button>
            </div>

            {/* Tab Content */}
            <div className="animate-fade-in-up">
              {activeTab === "about" && (
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    La Red Inmobiliaria Líder en el Mundo
                  </h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    ZIMA Gestión Inmobiliaria es una empresa de bienes raíces especializada en el
                    mercado de Lima, Perú. Contamos con agentes profesionales y
                    las herramientas más avanzadas para ayudarte a encontrar la propiedad perfecta.
                  </p>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    Nuestro compromiso es brindar un servicio excepcional,
                    combinando experiencia local con alcance global para
                    garantizar los mejores resultados en cada transacción.
                  </p>
                </div>
              )}

              {activeTab === "mission" && (
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Nuestra Misión</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    Facilitar el proceso de compra, venta y alquiler de
                    propiedades a través de un servicio profesional,
                    transparente y de alta calidad. Conectamos sueños con realidades inmobiliarias.
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <Shield className="w-5 h-5 text-primary mt-1 mr-3 flex-shrink-0" />
                      <p className="text-gray-600">Garantizar transparencia en cada transacción</p>
                    </div>
                    <div className="flex items-start">
                      <TrendingUp className="w-5 h-5 text-primary mt-1 mr-3 flex-shrink-0" />
                      <p className="text-gray-600">Maximizar el valor de las inversiones inmobiliarias</p>
                    </div>
                    <div className="flex items-start">
                      <Users className="w-5 h-5 text-primary mt-1 mr-3 flex-shrink-0" />
                      <p className="text-gray-600">Brindar asesoría personalizada y profesional</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "values" && (
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Nuestros Valores</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {achievements.map((achievement, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-300">
                        <h4 className="font-semibold text-gray-900 mb-2">{achievement.title}</h4>
                        <p className="text-sm text-gray-600">{achievement.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <Button className="btn-hero bg-primary hover:bg-[hsl(var(--primary-hover))] text-white">
                Conoce Nuestros Servicios
              </Button>
              <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
                <Play className="w-4 h-4 mr-2" />
                Ver Video Corporativo
              </Button>
            </div>
          </div>

          {/* Right Column - Visual */}
          <div className="animate-fade-in-right">
            <div className="relative">
              <div className="bg-gradient-to-br from-primary to-secondary rounded-2xl p-8 text-white">
                <div className="text-center">
                  <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Home className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">ZIMA Gestión Inmobiliaria</h3>
                  <p className="mb-6 opacity-90">Tu socio de confianza en bienes raíces</p>
                  <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                    <p className="text-sm opacity-90">"Compra • Venta • Inversión en Lima, Perú"</p>
                  </div>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
                <Award className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CompanyInfo;
