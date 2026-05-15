import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  ArrowLeft, User, Mail, Phone, MapPin, FileText,
  DollarSign, Paperclip, Send, Upload, CheckCircle,
  AlertCircle, Clock, XCircle
} from "lucide-react";

type Reclamo = {
  id: string;
  codigo: string;
  tipo: string;
  nombre: string;
  email: string;
  telefono: string;
  direccion: string;
  bien_servicio: string;
  descripcion: string;
  pedido: string;
  estado: string;
  fecha: string;
  monto?: number;
  archivo_url?: string;
  respuesta?: string;
  fecha_respuesta?: string;
};

const ESTADOS = ["pendiente", "en_proceso", "resuelto", "cerrado"];

const getEstadoBadge = (estado: string) => {
  switch (estado) {
    case "pendiente": return <Badge className="bg-amber-100 text-amber-700 border-0"><AlertCircle className="w-3 h-3 mr-1" />Pendiente</Badge>;
    case "en_proceso": return <Badge className="bg-blue-100 text-blue-700 border-0"><Clock className="w-3 h-3 mr-1" />En proceso</Badge>;
    case "resuelto": return <Badge className="bg-green-100 text-green-700 border-0"><CheckCircle className="w-3 h-3 mr-1" />Resuelto</Badge>;
    case "cerrado": return <Badge className="bg-gray-100 text-gray-500 border-0"><XCircle className="w-3 h-3 mr-1" />Cerrado</Badge>;
    default: return <Badge>{estado}</Badge>;
  }
};

interface Props {
  reclamo: Reclamo;
  onVolver: () => void;
}

const ReclamacionDetalle = ({ reclamo, onVolver }: Props) => {
  const [estado, setEstado] = useState(reclamo.estado);
  const [respuesta, setRespuesta] = useState(reclamo.respuesta || "");
  const [archivo, setArchivo] = useState<File | null>(null);
  const [enviando, setEnviando] = useState(false);

  const handleArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setArchivo(e.target.files[0]);
    }
  };

  const subirArchivoRespuesta = async (): Promise<string | null> => {
    if (!archivo) return null;
    const filename = `respuestas/${reclamo.id}/${Date.now()}_${archivo.name}`;
    const { error } = await supabase.storage
      .from("reclamaciones")
      .upload(filename, archivo, { upsert: true });
    if (error) return null;
    const { data } = supabase.storage.from("reclamaciones").getPublicUrl(filename);
    return data.publicUrl;
  };

  const enviarRespuesta = async () => {
    if (!respuesta.trim()) {
      toast.error("Escribe una respuesta antes de enviar");
      return;
    }
    setEnviando(true);

    try {
      // 1. Subir archivo si existe
      const archivoUrl = await subirArchivoRespuesta();

      // 2. Actualizar el reclamo en Supabase
      const { error: updateError } = await supabase
        .from("reclamaciones")
        .update({
          estado,
          respuesta,
          fecha_respuesta: new Date().toISOString(),
        })
        .eq("id", reclamo.id);

      if (updateError) throw updateError;

      // 3. Enviar correo al cliente via Resend (Supabase Edge Function)
      const emailBody = {
        to: reclamo.email,
        codigo: reclamo.codigo,
        nombre: reclamo.nombre,
        respuesta,
        estado,
        archivoUrl,
      };

      const { error: emailError } = await supabase.functions.invoke("enviar-respuesta-reclamo", {
        body: emailBody,
      });

      if (emailError) {
        console.warn("Error al enviar correo:", emailError);
        toast.warning("Reclamo actualizado pero hubo un error al enviar el correo");
      } else {
        toast.success("Respuesta enviada y cliente notificado por correo ✅");
      }

      onVolver();
    } catch (error) {
      toast.error("Error al enviar la respuesta");
    } finally {
      setEnviando(false);
    }
  };

  const soloActualizarEstado = async () => {
    try {
      const { error } = await supabase
        .from("reclamaciones")
        .update({ estado })
        .eq("id", reclamo.id);
      if (error) throw error;
      toast.success("Estado actualizado correctamente");
      onVolver();
    } catch {
      toast.error("Error al actualizar el estado");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#1a1a2e] text-white px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white"
            onClick={onVolver}
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Volver
          </Button>
          <div>
            <h1 className="text-lg font-semibold">Detalle del Reclamo</h1>
            <p className="text-xs text-gray-400 font-mono">{reclamo.codigo}</p>
          </div>
          <div className="ml-auto">{getEstadoBadge(reclamo.estado)}</div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Columna izquierda — Info del reclamo */}
        <div className="space-y-5">

          {/* Datos del consumidor */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Datos del consumidor</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-400">Nombre</p>
                  <p className="text-sm font-medium">{reclamo.nombre}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-400">Correo</p>
                  <p className="text-sm">{reclamo.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-400">Teléfono</p>
                  <p className="text-sm">{reclamo.telefono}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-400">Dirección</p>
                  <p className="text-sm">{reclamo.direccion}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Detalle del reclamo */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Detalle del reclamo</h2>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-400 mb-1">Tipo</p>
                <span className={`text-xs px-2 py-1 rounded-md font-medium capitalize ${
                  reclamo.tipo === "reclamo" ? "bg-red-50 text-red-600" : "bg-orange-50 text-orange-600"
                }`}>{reclamo.tipo}</span>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Bien / Servicio</p>
                <p className="text-sm">{reclamo.bien_servicio}</p>
              </div>
              {reclamo.monto && (
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-400">Monto reclamado</p>
                    <p className="text-sm font-medium">S/ {reclamo.monto.toLocaleString()}</p>
                  </div>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-400 mb-1">Descripción</p>
                <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-lg p-3">{reclamo.descripcion}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Pedido del consumidor</p>
                <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-lg p-3">{reclamo.pedido}</p>
              </div>
              {reclamo.archivo_url && (
                <div>
                  <p className="text-xs text-gray-400 mb-1">Documento adjunto del cliente</p>
                  <a
                    href={reclamo.archivo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 underline"
                  >
                    <Paperclip className="w-4 h-4" />
                    Ver documento adjunto
                  </a>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-400">Fecha de registro</p>
                <p className="text-sm">{new Date(reclamo.fecha).toLocaleDateString("es-PE", {
                  weekday: "long", year: "numeric", month: "long", day: "numeric"
                })}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Columna derecha — Gestión y respuesta */}
        <div className="space-y-5">

          {/* Cambiar estado */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Cambiar estado</h2>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {ESTADOS.map((e) => (
                <button
                  key={e}
                  onClick={() => setEstado(e)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium capitalize transition-all border ${
                    estado === e
                      ? "border-[#1a1a2e] bg-[#1a1a2e] text-white"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {e.replace("_", " ")}
                </button>
              ))}
            </div>
            {estado !== reclamo.estado && (
              <Button
                size="sm"
                variant="outline"
                onClick={soloActualizarEstado}
                className="w-full text-xs"
              >
                Solo actualizar estado
              </Button>
            )}
          </div>

          {/* Respuesta */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">
              {reclamo.respuesta ? "Respuesta enviada" : "Escribir respuesta"}
            </h2>

            {reclamo.respuesta && (
              <div className="bg-green-50 rounded-lg p-3 mb-4">
                <p className="text-xs text-green-600 mb-1 font-medium">Respondido el {new Date(reclamo.fecha_respuesta!).toLocaleDateString("es-PE")}</p>
                <p className="text-sm text-gray-700">{reclamo.respuesta}</p>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">
                  {reclamo.respuesta ? "Nueva respuesta (reemplazará la anterior)" : "Mensaje al cliente *"}
                </label>
                <textarea
                  value={respuesta}
                  onChange={(e) => setRespuesta(e.target.value)}
                  rows={5}
                  placeholder="Escribe aquí la respuesta para el cliente..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]/20 focus:border-[#1a1a2e] resize-none"
                />
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-1 block">Adjuntar documento de respuesta (opcional)</label>
                <label className="cursor-pointer block">
                  <div className={`border-2 border-dashed rounded-xl p-4 text-center transition ${
                    archivo ? "border-[#1a1a2e] bg-[#1a1a2e]/5" : "border-gray-200 hover:border-gray-300"
                  }`}>
                    {archivo ? (
                      <p className="text-sm text-gray-700 flex items-center justify-center gap-2">
                        <Paperclip className="w-4 h-4" />
                        {archivo.name}
                      </p>
                    ) : (
                      <>
                        <Upload className="w-5 h-5 text-gray-300 mx-auto mb-1" />
                        <p className="text-xs text-gray-400">PDF, JPG o PNG — máx. 10 MB</p>
                      </>
                    )}
                  </div>
                  <input type="file" onChange={handleArchivo} accept=".pdf,.jpg,.jpeg,.png" className="hidden" />
                </label>
              </div>

              <Button
                onClick={enviarRespuesta}
                disabled={enviando || !respuesta.trim()}
                className="w-full bg-[#1a1a2e] hover:bg-[#2a2a4e] text-white"
              >
                {enviando ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Enviando...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Send className="w-4 h-4" />
                    Enviar respuesta y notificar cliente
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReclamacionDetalle;
