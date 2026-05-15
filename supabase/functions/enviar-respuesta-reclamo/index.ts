import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { to, codigo, nombre, respuesta, estado, archivoUrl } = await req.json();

    const estadoTexto = {
      pendiente: "Pendiente",
      en_proceso: "En Proceso",
      resuelto: "Resuelto",
      cerrado: "Cerrado",
    }[estado] || estado;

    const estadoColor = {
      pendiente: "#F59E0B",
      en_proceso: "#3B82F6",
      resuelto: "#10B981",
      cerrado: "#6B7280",
    }[estado] || "#6B7280";

    const htmlBody = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Respuesta a tu reclamación</title>
</head>
<body style="margin:0; padding:0; background:#f5f5f5; font-family: 'Segoe UI', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:16px; overflow:hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
          
          <!-- Header -->
          <tr>
            <td style="background:#1a1a2e; padding: 32px 40px; text-align:center;">
              <h1 style="color:#FBBF24; margin:0; font-size:22px; font-weight:700; letter-spacing:-0.5px;">ZIMA Gestión Inmobiliaria</h1>
              <p style="color:#9CA3AF; margin:8px 0 0; font-size:13px;">Respuesta a tu reclamación</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="color:#374151; font-size:15px; margin:0 0 8px;">Estimado/a <strong>${nombre}</strong>,</p>
              <p style="color:#6B7280; font-size:14px; margin:0 0 24px;">Nos comunicamos con respecto a tu reclamación registrada en nuestro sistema.</p>

              <!-- Código -->
              <div style="background:#F9FAFB; border-radius:10px; padding:16px; margin-bottom:24px; border:1px solid #E5E7EB;">
                <p style="margin:0; font-size:12px; color:#9CA3AF; text-transform:uppercase; letter-spacing:0.05em;">Número de reclamo</p>
                <p style="margin:4px 0 0; font-size:18px; font-weight:700; color:#1a1a2e; font-family:monospace;">${codigo}</p>
              </div>

              <!-- Estado -->
              <div style="margin-bottom:24px;">
                <p style="margin:0 0 8px; font-size:12px; color:#9CA3AF; text-transform:uppercase; letter-spacing:0.05em;">Estado actual</p>
                <span style="background:${estadoColor}20; color:${estadoColor}; padding:6px 14px; border-radius:20px; font-size:13px; font-weight:600;">${estadoTexto}</span>
              </div>

              <!-- Respuesta -->
              <div style="margin-bottom:24px;">
                <p style="margin:0 0 10px; font-size:12px; color:#9CA3AF; text-transform:uppercase; letter-spacing:0.05em;">Nuestra respuesta</p>
                <div style="background:#F0FDF4; border-left:4px solid #10B981; border-radius:0 10px 10px 0; padding:16px 20px;">
                  <p style="margin:0; color:#374151; font-size:14px; line-height:1.7;">${respuesta.replace(/\n/g, "<br>")}</p>
                </div>
              </div>

              ${archivoUrl ? `
              <!-- Archivo adjunto -->
              <div style="margin-bottom:24px;">
                <p style="margin:0 0 10px; font-size:12px; color:#9CA3AF; text-transform:uppercase; letter-spacing:0.05em;">Documento adjunto</p>
                <a href="${archivoUrl}" style="display:inline-flex; align-items:center; gap:8px; background:#1a1a2e; color:white; padding:10px 20px; border-radius:8px; text-decoration:none; font-size:13px; font-weight:500;">
                  📎 Ver documento adjunto
                </a>
              </div>
              ` : ""}

              <hr style="border:none; border-top:1px solid #E5E7EB; margin:24px 0;">
              
              <p style="color:#9CA3AF; font-size:12px; margin:0; line-height:1.6;">
                Si tienes alguna consulta adicional, puedes responder a este correo o contactarnos en 
                <a href="mailto:contacto@zimagestioninmobiliaria.com" style="color:#1a1a2e;">contacto@zimagestioninmobiliaria.com</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#F9FAFB; padding:20px 40px; text-align:center; border-top:1px solid #E5E7EB;">
              <p style="margin:0; color:#9CA3AF; font-size:12px;">© ${new Date().getFullYear()} ZIMA Gestión Inmobiliaria · Calle Porta 107, Miraflores, Lima</p>
              <p style="margin:4px 0 0; color:#9CA3AF; font-size:11px;">Este correo fue enviado automáticamente, por favor no responda directamente a este mensaje.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "ZIMA Gestión Inmobiliaria <noreply@zimagestioninmobiliaria.com>",
        to: [to],
        subject: `Respuesta a tu reclamación ${codigo} — ZIMA Gestión Inmobiliaria`,
        html: htmlBody,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Error al enviar el correo");
    }

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
