const SUPABASE_FUNCTION_URL = "https://artwylvnenaxyilcatec.supabase.co/functions/v1/plastic-scraper";

const JSON_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
  "X-Plastic-Proxy": "netlify-proxy-v2"
};

function json(statusCode, data) {
  return {
    statusCode,
    headers: JSON_HEADERS,
    body: JSON.stringify(data)
  };
}

exports.handler = async function(event) {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: JSON_HEADERS, body: "" };
  }

  if (event.httpMethod === "GET") {
    return json(200, { ok: true, proxy: "netlify-proxy-v2", upstream: "configured" });
  }

  if (event.httpMethod !== "POST") {
    return json(405, { ok: false, stage: "netlify-proxy", error: "Usa POST" });
  }

  let incoming = {};
  try {
    incoming = event.body ? JSON.parse(event.body) : {};
  } catch {
    return json(400, { ok: false, stage: "netlify-proxy", error: "JSON richiesta non valido" });
  }

  const publishableKey = String(incoming.publishableKey || incoming.apikey || "").trim();
  if (!publishableKey) {
    return json(400, { ok: false, stage: "netlify-proxy", error: "Publishable key mancante" });
  }

  const body = { ...incoming };
  delete body.publishableKey;
  delete body.apikey;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 28000);

  try {
    const upstream = await fetch(SUPABASE_FUNCTION_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": publishableKey,
        "Accept": "application/json"
      },
      body: JSON.stringify(body),
      signal: controller.signal
    });

    const text = await upstream.text();
    let data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = {
        ok: false,
        stage: "supabase-response",
        error: text || `Supabase HTTP ${upstream.status}`
      };
    }

    if (data && typeof data === "object" && !data.stage) {
      data.stage = upstream.ok ? "ok" : "supabase-edge";
    }

    return json(upstream.status, data);
  } catch (err) {
    const message = err && err.name === "AbortError"
      ? "Timeout chiamata Supabase dopo 28 secondi"
      : String((err && err.message) || err);
    return json(502, { ok: false, stage: "netlify-to-supabase", error: message });
  } finally {
    clearTimeout(timer);
  }
};
