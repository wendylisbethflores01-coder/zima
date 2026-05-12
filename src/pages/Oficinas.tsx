import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const Oficinas = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20 pb-16">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary to-secondary text-white py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Visítanos en Nuestra Oficina
              </h1>
              <p className="text-xl opacity-90">
                Estamos ubicados en el corazón de Miraflores, Lima
              </p>
            </div>
          </div>
        </section>

        {/* Contact Cards */}
        <section className="container mx-auto px-4 -mt-12 mb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="shadow-lg">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Dirección</h3>
                <p className="text-muted-foreground">
                  Calle Porta 107<br />
                  Miraflores, Lima 15064
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Horario de Atención</h3>
                <p className="text-muted-foreground">
                  Lunes - Sábado<br />
                  9:00 AM - 7:00 PM
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Contáctanos</h3>
                <p className="text-muted-foreground">
                  contacto@zimagestioninmobiliaria.com<br />
                  <span className="text-sm">Respuesta en 24h</span>
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Map Section */}
        <section className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold mb-4">Encuéntranos en el Mapa</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Estamos ubicados en una zona céntrica de Miraflores con fácil acceso y estacionamiento cercano.
                Visítanos para una asesoría personalizada sobre tu próxima inversión inmobiliaria.
              </p>
            </div>

            <Card className="overflow-hidden shadow-xl">
              <CardContent className="p-0">
                <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3900.9767947896847!2d-77.0309589!3d-12.122759!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9105c818e4890ef3%3A0xcf800bf2a22df01e!2sCalle%20Porta%20107%2C%20Miraflores%2015074!5e0!3m2!1ses!2spe!4v1234567890!5m2!1ses!2spe"
                    className="absolute top-0 left-0 w-full h-full border-0"
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Ubicación de ZIMA Gestión Inmobiliaria"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Additional Info */}
            <div className="mt-12 bg-muted/50 rounded-lg p-8">
              <h3 className="text-2xl font-bold mb-6 text-center">Cómo Llegar</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-semibold mb-3 flex items-center">
                    <MapPin className="w-5 h-5 mr-2 text-primary" />
                    En Transporte Público
                  </h4>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Líneas de buses que pasan por Av. Arequipa</li>
                    <li>• Metropolitano: Estación Angamos (15 min caminando)</li>
                    <li>• Corredor Azul: Paraderos en Av. Arequipa</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3 flex items-center">
                    <MapPin className="w-5 h-5 mr-2 text-primary" />
                    En Vehículo Particular
                  </h4>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Estacionamiento disponible en la zona</li>
                    <li>• Fácil acceso desde Av. Arequipa y Av. Pardo</li>
                    <li>• A 5 minutos del Parque Kennedy</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Oficinas;
