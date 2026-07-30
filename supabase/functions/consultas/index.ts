import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { nombre, email, telefono, asunto, mensaje } = await req.json();

    // 1. Validación
    if (!nombre?.trim() || !email?.trim() || !mensaje?.trim()) {
      return new Response(
        JSON.stringify({ error: "Nombre, email y mensaje son requeridos." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(
        JSON.stringify({ error: "El formato del email no es válido." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // 2. Guardar en Supabase
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { error: dbError } = await supabase.from("consultas").insert({
      nombre: nombre.trim(),
      email: email.trim(),
      telefono: telefono?.trim() || null,
      asunto: asunto?.trim() || null,
      mensaje: mensaje.trim(),
      leido: false,
    });

    if (dbError) {
      console.error("Error guardando consulta:", dbError);
      return new Response(
        JSON.stringify({ error: "No se pudo guardar tu consulta. Intenta de nuevo." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // 3. Enviar email via Resend (no bloquea si falla)
    const resendKey = Deno.env.get("RESEND_API_KEY");
    const notificationEmail = Deno.env.get("NOTIFICATION_EMAIL") ?? "maa.v.p.01@gmail.com";

    if (resendKey) {
      try {
        const emailRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${resendKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Ferretería La Nonna <onboarding@resend.dev>",
            to: [notificationEmail],
            subject: `Nueva consulta de ${nombre}: ${asunto || "Sin asunto"}`,
            html: `
              <h2>Nueva consulta desde el sitio web</h2>
              <table style="border-collapse:collapse;width:100%">
                <tr><td style="padding:8px;font-weight:bold">Nombre</td><td style="padding:8px">${nombre}</td></tr>
                <tr><td style="padding:8px;font-weight:bold">Email</td><td style="padding:8px">${email}</td></tr>
                <tr><td style="padding:8px;font-weight:bold">Teléfono</td><td style="padding:8px">${telefono || "—"}</td></tr>
                <tr><td style="padding:8px;font-weight:bold">Asunto</td><td style="padding:8px">${asunto || "—"}</td></tr>
                <tr><td style="padding:8px;font-weight:bold;vertical-align:top">Mensaje</td><td style="padding:8px">${mensaje}</td></tr>
              </table>
            `,
          }),
        });
        if (!emailRes.ok) {
          console.error("Error enviando email:", await emailRes.text());
        }
      } catch (emailErr) {
        console.error("Excepción enviando email:", emailErr);
      }
    } else {
      console.warn("RESEND_API_KEY no configurada — email no enviado.");
    }

    // 4. Respuesta exitosa
    return new Response(
      JSON.stringify({ success: true, message: "Tu consulta fue enviada correctamente." }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );

  } catch (err) {
    console.error("Error inesperado:", err);
    return new Response(
      JSON.stringify({ error: "Error inesperado. Intenta de nuevo." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
