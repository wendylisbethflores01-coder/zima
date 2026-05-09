import { useState } from "react";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

type FormData = {
  tipo: "reclamo" | "queja" | "";
  nombre: string;
  dni: string;
  telefono: string;
  email: string;
  direccion: string;
  bien_servicio: string;
  monto: string;
  descripcion: string;
  pedido: string;
  acepta: boolean;
};

const initialForm: FormData = {
  tipo: "",
  nombre: "",
  dni: "",
  telefono: "",
  email: "",
  direccion: "",
  bien_servicio: "",
  monto: "",
  descripcion: "",
  pedido: "",
  acepta: false,
};

export default function LibroReclamaciones() {
  const [form, setForm] = useState<FormData>(initialForm);
  const [archivo, setArchivo] = useState<File | null>(null);
  const [estado, setEstado] = useState<"idle" | "enviando" | "ok" | "error">("idle");
  const [numeroReclamo, setNumeroReclamo] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setArchivo(e.target.files[0]);
    }
  };

  const subirArchivo = async (): Promise<string | null> => {
    if (!archivo) return null;
    const filename = `${Date.now()}_${archivo.name}`;
    const res = await fetch(`${SUPABASE_URL}/storage/v1/object/reclamaciones/${filename}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": archivo.type,
      },
      body: archivo,
    });
    if (!res.ok) return null;
    return `${SUPABASE_URL}/storage/v1/object/public/reclamaciones/${filename}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.acepta) return;
    setEstado("enviando");

    try {
      const archivoUrl = await subirArchivo();
      const codigo = `ZGI-${Date.now().toString().slice(-8)}`;

      const payload = {
        codigo,
        tipo: form.tipo,
        nombre: form.nombre,
        dni: form.dni,
        telefono: form.telefono,
        email: form.email,
        direccion: form.direccion,
        bien_servicio: form.bien_servicio,
        monto: form.monto ? parseFloat(form.monto) : null,
        descripcion: form.descripcion,
        pedido: form.pedido,
        archivo_url: archivoUrl,
        fecha: new Date().toISOString(),
      };

      const res = await fetch(`${SUPABASE_URL}/rest/v1/reclamaciones`, {
        method: "POST",
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Error al guardar");

      setNumeroReclamo(codigo);
      setEstado("ok");
      setForm(initialForm);
      setArchivo(null);
    } catch {
      setEstado("error");
    }
  };

  if (estado === "ok") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Reclamación registrada</h2>
          <p className="text-gray-500 mb-4">Tu reclamación ha sido recibida correctamente.</p>
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <p className="text-sm text-gray-500 mb-1">Número de reclamo</p>
            <p className="text-xl font-bold text-[#1a1a2e]">{numeroReclamo}</p>
          </div>
          <p className="text-sm text-gray-500 mb-6">
            Recibirás una respuesta en tu correo electrónico en un plazo máximo de <strong>30 días hábiles</strong>.
          </p>
          <button
            onClick={() => setEstado("idle")}
            className="w-full bg-[#1a1a2e] text-white py-3 rounded-xl font-medium hover:bg-[#2a2a4e] transition"
          >
            Registrar otro reclamo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#1a1a2e] text-white py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <svg className="w-8 h-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-amber-400 font-medium text-sm uppercase tracking-widest">Libro de Reclamaciones</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Zima Gestión Inmobiliaria</h1>
          <p className="text-gray-300 text-sm max-w-xl">
            De acuerdo al Código de Protección y Defensa del Consumidor (Ley N° 29571), ponemos a tu disposición nuestro Libro de Reclamaciones virtual.
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-3xl mx-auto px-4 py-10">
        <form onSubmit={handleSubmit} className="space-y-8">

          {/* Tipo de reclamación */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Tipo de reclamación</h2>
            <div className="grid grid-cols-2 gap-4">
              {(["reclamo", "queja"] as const).map((t) => (
                <label
                  key={t}
                  className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col gap-1 transition ${
                    form.tipo === t ? "border-[#1a1a2e] bg-[#1a1a2e]/5" : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input type="radio" name="tipo" value={t} checked={form.tipo === t} onChange={handleChange} className="hidden" required />
                  <span className="font-semibold text-gray-900 capitalize">{t}</span>
                  <span className="text-xs text-gray-500">
                    {t === "reclamo"
                      ? "Disconformidad con un bien o servicio adquirido"
                      : "Malestar o descontento sin perjuicio económico"}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Datos del consumidor */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Datos del consumidor</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo *</label>
                <input type="text" name="nombre" value={form.nombre} onChange={handleChange} required placeholder="Ingresa tu nombre completo"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]/20 focus:border-[#1a1a2e]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">DNI / RUC *</label>
                <input type="text" name="dni" value={form.dni} onChange={handleChange} required placeholder="00000000"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]/20 focus:border-[#1a1a2e]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono *</label>
                <input type="tel" name="telefono" value={form.telefono} onChange={handleChange} required placeholder="+51 999 999 999"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]/20 focus:border-[#1a1a2e]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico *</label>
                <input type="email" name="email" value={form.email} onChange={handleChange} required placeholder="correo@ejemplo.com"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]/20 focus:border-[#1a1a2e]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección *</label>
                <input type="text" name="direccion" value={form.direccion} onChange={handleChange} required placeholder="Calle, número, distrito"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]/20 focus:border-[#1a1a2e]" />
              </div>
            </div>
          </div>

          {/* Detalle de la reclamación */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Detalle de la reclamación</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bien contratado / Servicio *</label>
                  <input type="text" name="bien_servicio" value={form.bien_servicio} onChange={handleChange} required placeholder="Ej: Asesoría de compraventa"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]/20 focus:border-[#1a1a2e]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Monto reclamado (S/) <span className="text-gray-400 font-normal">opcional</span></label>
                  <input type="number" name="monto" value={form.monto} onChange={handleChange} placeholder="0.00" min="0" step="0.01"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]/20 focus:border-[#1a1a2e]" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción del reclamo *</label>
                <textarea name="descripcion" value={form.descripcion} onChange={handleChange} required rows={4}
                  placeholder="Describe detalladamente el motivo de tu reclamo o queja..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]/20 focus:border-[#1a1a2e] resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pedido del consumidor *</label>
                <textarea name="pedido" value={form.pedido} onChange={handleChange} required rows={3}
                  placeholder="¿Qué solución o compensación solicitas?"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]/20 focus:border-[#1a1a2e] resize-none" />
              </div>
            </div>
          </div>

          {/* Archivos de sustento */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Documentos de sustento</h2>
            <p className="text-sm text-gray-500 mb-4">Adjunta imágenes, contratos, comprobantes u otros documentos relevantes. <span className="text-gray-400">(opcional)</span></p>
            <label className="cursor-pointer block">
              <div className={`border-2 border-dashed rounded-xl p-6 text-center transition ${archivo ? "border-[#1a1a2e] bg-[#1a1a2e]/5" : "border-gray-200 hover:border-gray-300"}`}>
                {archivo ? (
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-700">
                    <svg className="w-5 h-5 text-[#1a1a2e]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="font-medium">{archivo.name}</span>
                    <span className="text-gray-400">({(archivo.size / 1024).toFixed(0)} KB)</span>
                  </div>
                ) : (
                  <>
                    <svg className="w-8 h-8 text-gray-300 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    <p className="text-sm text-gray-500">Haz clic para seleccionar un archivo</p>
                    <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG — máx. 10 MB</p>
                  </>
                )}
              </div>
              <input type="file" onChange={handleFile} accept=".pdf,.jpg,.jpeg,.png" className="hidden" />
            </label>
          </div>

          {/* Declaración y envío */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" name="acepta" checked={form.acepta} onChange={handleChange} required
                className="mt-0.5 w-5 h-5 rounded border-gray-300 text-[#1a1a2e] focus:ring-[#1a1a2e]" />
              <span className="text-sm text-gray-600">
                Declaro que la información proporcionada es verídica y que autorizo el tratamiento de mis datos personales conforme a la Ley N° 29733 — Ley de Protección de Datos Personales.
              </span>
            </label>

            <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-100 text-xs text-amber-800">
              La empresa tiene un plazo máximo de <strong>30 días hábiles</strong> para dar respuesta a tu reclamo, de acuerdo al Código de Protección y Defensa del Consumidor.
            </div>

            {estado === "error" && (
              <div className="mt-4 p-4 bg-red-50 rounded-xl border border-red-100 text-sm text-red-700">
                Ocurrió un error al enviar tu reclamo. Por favor intenta nuevamente.
              </div>
            )}

            <button
              type="submit"
              disabled={!form.acepta || estado === "enviando"}
              className="mt-6 w-full bg-[#1a1a2e] text-white py-4 rounded-xl font-semibold text-sm hover:bg-[#2a2a4e] disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
            >
              {estado === "enviando" ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Enviando...
                </>
              ) : (
                "Enviar reclamación"
              )}
            </button>
          </div>

          <p className="text-center text-xs text-gray-400 pb-4">
            Fecha del registro: {new Date().toLocaleDateString("es-PE", { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </form>
      </div>
    </div>
  );
}
