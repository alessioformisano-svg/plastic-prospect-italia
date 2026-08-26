const SUPABASE_FUNCTION_URL = "https://artwylvnenaxyilcatec.supabase.co/functions/v1/plastic-scraper";

export default async (request) => {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204 });
  }
  if (request.method !== "POST") {
    return Response.json({ ok: false, error: "Usa POST" }, { status: 405 });
  }

  try {
    const incoming = await request.json().catch(() => ({}));
    const publishableKey = String(incoming.publishableKey || incoming.apikey || "").trim();
    if (!publishableKey) {
      return Response.json({ ok: false, error: "Publishable key mancante" }, { status: 400 });
    }

    // The key is only transport/auth metadata for Supabase; do not forward duplicate helper fields.
    const body = { ...incoming };
    delete body.publishableKey;
    delete body.apikey;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 28000);
    let upstream;
    try {
      upstream = await fetch(SUPABASE_FUNCTION_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": publishableKey,
          "User-Agent": "Netlify-Function/plastic-scraper-proxy"
        },
        body: JSON.stringify(body),
        signal: controller.signal
      });
    } finally {
      clearTimeout(timer);
    }

    const text = await upstream.text();
    let data;
    try { data = text ? JSON.parse(text) : {}; }
    catch { data = { ok: false, error: text || `Supabase HTTP ${upstream.status}` }; }

    return Response.json(data, {
      status: upstream.status,
      headers: { "Cache-Control": "no-store" }
    });
  } catch (err) {
    const message = err?.name === "AbortError"
      ? "Timeout chiamata Supabase"
      : String(err?.message || err);
    return Response.json({ ok: false, error: message }, { status: 502 });
  }
};
