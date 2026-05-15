import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Search, Filter, Eye, Clock, CheckCircle,
  XCircle, AlertCircle, LogOut, FileText,
  ChevronLeft, ChevronRight
} from "lucide-react";
import ReclamacionDetalle from "./ReclamacionDetalle";

type Reclamo = {
  id: string;
  codigo: string;
  tipo: string;
  nombre: string;
  email: string;
  telefono: string;
  bien_servicio: string;
  descripcion: string;
  estado: string;
  fecha: string;
  monto?: number;
  archivo_url?: string;
};

const ESTADOS = [
  { value: "todos", label: "Todos", color: "bg-gray-100 text-gray-700" },
  { value: "pendiente", label: "Pendiente", color: "bg-amber-100 text-amber-700" },
  { value: "en_proceso", label: "En proceso", color: "bg-blue-100 text-blue-700" },
  { value: "resuelto", label: "Resuelto", color: "bg-green-100 text-green-700" },
  { value: "cerrado", label: "Cerrado", color: "bg-gray-100 text-gray-500" },
];

const ITEMS_PER_PAGE = 10;

const getEstadoBadge = (estado: string) => {
  switch (estado) {
    case "pendiente": return <Badge className="bg-amber-100 text-amber-700 border-0"><AlertCircle className="w-3 h-3 mr-1" />Pendiente</Badge>;
    case "en_proceso": return <Badge className="bg-blue-100 text-blue-700 border-0"><Clock className="w-3 h-3 mr-1" />En proceso</Badge>;
    case "resuelto": return <Badge className="bg-green-100 text-green-700 border-0"><CheckCircle className="w-3 h-3 mr-1" />Resuelto</Badge>;
    case "cerrado": return <Badge className="bg-gray-100 text-gray-500 border-0"><XCircle className="w-3 h-3 mr-1" />Cerrado</Badge>;
    default: return <Badge>{estado}</Badge>;
  }
};

const AdminReclamaciones = () => {
  const { user, signOut } = useAuth();
  const { role, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();

  const [reclamos, setReclamos] = useState<Reclamo[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [pagina, setPagina] = useState(1);
  const [totalReclamos, setTotalReclamos] = useState(0);
  const [reclamoSeleccionado, setReclamoSeleccionado] = useState<Reclamo | null>(null);

  // Protección de ruta
  useEffect(() => {
    if (!roleLoading && !user) {
      navigate("/reclamaciones-admin/login");
    }
    if (!roleLoading && user && role !== "admin" && role !== "agent") {
      navigate("/");
    }
  }, [user, role, roleLoading, navigate]);

  const cargarReclamos = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("reclamaciones")
        .select("*", { count: "exact" })
        .order("fecha", { ascending: false });

      if (filtroEstado !== "todos") query = query.eq("estado", filtroEstado);
      if (filtroTipo !== "todos") query = query.eq("tipo", filtroTipo);
      if (busqueda) {
        query = query.or(`nombre.ilike.%${busqueda}%,codigo.ilike.%${busqueda}%,email.ilike.%${busqueda}%`);
      }

      const from = (pagina - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;
      if (error) throw error;
      setReclamos(data || []);
      setTotalReclamos(count || 0);
    } catch (error) {
      toast.error("Error al cargar los reclamos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) cargarReclamos();
  }, [user, filtroEstado, filtroTipo, busqueda, pagina]);

  const totalPaginas = Math.ceil(totalReclamos / ITEMS_PER_PAGE);

  const stats = {
    total: totalReclamos,
    pendiente: reclamos.filter(r => r.estado === "pendiente").length,
    en_proceso: reclamos.filter(r => r.estado === "en_proceso").length,
    resuelto: reclamos.filter(r => r.estado === "resuelto").length,
  };

  if (roleLoading || (!user && !roleLoading)) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1a1a2e]"></div>
      </div>
    );
  }

  if (reclamoSeleccionado) {
    return (
      <ReclamacionDetalle
        reclamo={reclamoSeleccionado}
        onVolver={() => { setReclamoSeleccionado(null); cargarReclamos(); }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#1a1a2e] text-white px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-amber-400" />
            <div>
              <h1 className="text-lg font-semibold">Panel de Reclamaciones</h1>
              <p className="text-xs text-gray-400">ZIMA Gestión Inmobiliaria</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">{user?.email}</span>
            <Button
              size="sm"
              variant="ghost"
              className="text-gray-400 hover:text-white"
              onClick={async () => { await signOut(); navigate("/reclamaciones-admin/login"); }}
            >
              <LogOut className="w-4 h-4 mr-1" />
              Salir
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total", value: totalReclamos, color: "text-gray-900" },
            { label: "Pendientes", value: stats.pendiente, color: "text-amber-600" },
            { label: "En proceso", value: stats.en_proceso, color: "text-blue-600" },
            { label: "Resueltos", value: stats.resuelto, color: "text-green-600" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
              <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar por nombre, código o email..."
                value={busqueda}
                onChange={(e) => { setBusqueda(e.target.value); setPagina(1); }}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              {ESTADOS.map((estado) => (
                <button
                  key={estado.value}
                  onClick={() => { setFiltroEstado(estado.value); setPagina(1); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    filtroEstado === estado.value
                      ? "ring-2 ring-[#1a1a2e] " + estado.color
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {estado.label}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              {["todos", "reclamo", "queja"].map((tipo) => (
                <button
                  key={tipo}
                  onClick={() => { setFiltroTipo(tipo); setPagina(1); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                    filtroTipo === tipo
                      ? "bg-[#1a1a2e] text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {tipo === "todos" ? "Todos los tipos" : tipo}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Código</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Tipo</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Cliente</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Servicio</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Fecha</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Estado</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Acción</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">Cargando...</td></tr>
              ) : reclamos.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">No se encontraron reclamos</td></tr>
              ) : (
                reclamos.map((reclamo) => (
                  <tr key={reclamo.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 text-sm font-mono text-gray-600">{reclamo.codigo}</td>
                    <td className="px-5 py-4">
                      <span className={`text-xs px-2 py-1 rounded-md font-medium capitalize ${
                        reclamo.tipo === "reclamo" ? "bg-red-50 text-red-600" : "bg-orange-50 text-orange-600"
                      }`}>{reclamo.tipo}</span>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-gray-900">{reclamo.nombre}</p>
                      <p className="text-xs text-gray-400">{reclamo.email}</p>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600 max-w-[200px] truncate">{reclamo.bien_servicio}</td>
                    <td className="px-5 py-4 text-sm text-gray-500">
                      {new Date(reclamo.fecha).toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-5 py-4">{getEstadoBadge(reclamo.estado)}</td>
                    <td className="px-5 py-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setReclamoSeleccionado(reclamo)}
                        className="text-xs"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Ver detalle
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Paginación */}
          {totalPaginas > 1 && (
            <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                Mostrando {((pagina - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(pagina * ITEMS_PER_PAGE, totalReclamos)} de {totalReclamos}
              </p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" disabled={pagina === 1} onClick={() => setPagina(p => p - 1)}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm px-3 py-1 bg-gray-100 rounded-md">{pagina} / {totalPaginas}</span>
                <Button size="sm" variant="outline" disabled={pagina === totalPaginas} onClick={() => setPagina(p => p + 1)}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminReclamaciones;
