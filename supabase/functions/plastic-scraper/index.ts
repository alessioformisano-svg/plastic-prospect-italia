declare const Deno: any;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131 Safari/537.36";

const BLOCKED_HOST = /(^|\.)(localhost|127\.0\.0\.1|0\.0\.0\.0|::1)$/i;
const SEARCH_ENGINE_HOST = /(^|\.)(bing\.com|google\.[a-z.]+|duckduckgo\.com)$/i;

const NON_PROSPECT_HOST = /(^|\.)(treccani\.it|dizionari\.corriere\.it|subito\.it|indeed\.[a-z.]+|glassdoor\.[a-z.]+|monster\.[a-z.]+|jooble\.[a-z.]+|linkedin\.com|facebook\.com|instagram\.com|youtube\.com|wikipedia\.org|amazon\.[a-z.]+|repubblica\.it|corriere\.it|ansa\.it|ilsole24ore\.com|obi-italia\.it|leroymerlin\.it|tecnomat\.it|bricoman\.it|manomano\.it|ebay\.[a-z.]+|bricoio\.it|bricocenter\.it|europages\.[a-z.]+|kompass\.[a-z.]+|microsoft\.com|msn\.com)$/i;

const BUSINESS_DIRECTORY_HOST = /(^|\.)(paginegialle\.it|paginebianche\.it|reteimprese\.it|aziende\.it|virgilio\.it|misterimprese\.it|reportaziende\.it|ufficiocamerale\.it|atoka\.io|iglobal\.co|opendi\.it)$/i;

const BAD_TITLE = /\b(significato|etimologia|vocabolario|dizionario|definizione|offerte? di lavoro|annunci di lavoro|lavora con noi|stipendio|wikipedia|news|notizie|forum|login|property records|public records|people search|people finder|phone number|address & phone|email address|office locations?|campus|matches|assessor|county|acquista|compra|shopping|che cos['’]è|cos['’]è|guida(?: completa)?|fai da te)\b/i;
const IMAGE_PLACEHOLDER_TITLE = /^!?\s*\[?\s*(?:image|immagine|img|thumbnail|logo|foto|picture)\b/i;
const GENERIC_COMPANY_TITLE = /^(?:aziende?|imprese?|ditte?)\s+(?:di|che|per|del|della|dei|delle)\b|^(?:elenco|lista|directory|catalogo)\s+(?:di\s+)?(?:aziende|imprese|ditte|fornitori|produttori)\b/i;

function isGenericCompanyTitle(raw = "") {
  const title = cleanSearchTitle(String(raw || "")).trim();
  if (!title) return true;

  // Titoli di categoria/portale, non ragioni sociali.
  if (GENERIC_COMPANY_TITLE.test(title)) return true;
  if (/^(?:aziende?|imprese?|ditte?|fornitori|produttori|fabbricazione|produzione|lavorazione|lavorazioni|servizi)\s*$/i.test(title)) return true;

  const hasLegalForm = /\b(?:s\.?\s*r\.?\s*l\.?|srls|s\.?\s*p\.?\s*a\.?|s\.?\s*n\.?\s*c\.?|snc|s\.?\s*a\.?\s*s\.?|sas)\b/i.test(title);
  const parts = title.split(/\s+[|–—-]\s+/).map((x) => x.trim()).filter(Boolean);

  // Frasi puramente descrittive senza un brand/ragione sociale riconoscibile.
  if (parts.length === 1 && !hasLegalForm && /^(?:fabbricazione|produzione|lavorazione|lavorazioni|fornitura|servizi)\s+(?:di|dei|delle|per)\s+.{3,}$/i.test(title)) {
    return true;
  }

  // Esempio valido da NON scartare: "Lavorazione Materie Plastiche CNC | Tecno-Plast".
  // Se dopo il separatore esiste un brand plausibile, il risultato può restare.
  return false;
}


const STRONG_TARGET = /\b(plexiglas|plexiglass|pmma|acrilico|acrilici|metacrilato|policarbonato|petg|pvc(?: espanso)?|forex|pom|delrin|ptfe|peek|pvdf|polietilene|pehd|pe-hd|polipropilene|nylon|tecnopolimer|polimeri? termoplastici|semilavorati plastici|materie plastiche|abs|polistirolo|hips|lastre plastiche|barre plastiche|tondi plastici|pannelli plastici|supporti rigidi plastici|termoform|carpenteria plastica|fresatura cnc.*plastic|taglio laser.*(?:plex|acril|plastic)|protezioni macchina.*policarbonato|vasche in pvc|vasche in pp)\b/i;

const FORMAT_OR_PROCESS = /\b(lastre|barre|tondi|pannelli|supporti rigidi|fresatura|tornitura|cnc|taglio laser|taglio cnc|incisione|incisioni|pantografo|termoformatura|piegatura|incollaggio|lucidatura|saldatura plastica|carpenteria|lavorazione|lavorazioni|su misura|componenti|particolari|stampa digitale|serigrafia)\b/i;

const VISUAL_PLASTIC_BUYER_SIGNAL = /\b(incisioni?|incisoria|targhe|targhette|segnaletica|serigrafia|stampa digitale|stampa uv|stampa diretta|supporti rigidi|insegne|lettere scatolate|comunicazione visiva|espositori|display|visual merchandising|allestimenti|pannellistica|cartellonistica|decorazione|plexiglas|plexiglass|acrilico|metacrilato)\b/i;

const END_USER_SIGNAL = /\b(packaging|confezionamento|automazione|macchine automatiche|costruttori? di macchine|macchine industriali|nastri trasportatori|conveyor|material handling|nautica|marine|trattamento acque|galvanica|chimica|farmaceutica|medicale|alimentare|imbottigliamento|insegne|comunicazione visiva|espositori|display|visual merchandising|allestimenti|protezione macchina|protezioni macchina|carter|guide|pattini|stelle|incisioni?|targhe|targhette|segnaletica|serigrafia|stampa digitale|stampa uv|supporti rigidi|pannellistica|cartellonistica)\b/i;

const PURE_SUPPLIER_SIGNAL = /\b(vendita|distribuzione|distributore|rivenditore|fornitura|fornitore|semilavorati plastici|catalogo prodotti|stock lastre|stock barre|magazzino lastre|e-commerce|shop online|acquista|ordina online)\b/i;

const ACTIVE_PROCESS_SIGNAL = /\b(fresatura|tornitura|cnc|taglio laser|taglio cnc|incisione|incisioni|pantografo|termoformatura|piegatura|incollaggio|lucidatura|saldatura plastica|carpenteria plastica|lavorazione|lavorazioni|su misura|produzione componenti|produzione particolari|realizzazione protezioni|realizzazione carter|costruzione vasche|costruzione espositori|produzione targhe|realizzazione targhe|stampa digitale|stampa uv|serigrafia)\b/i;

const COMPANY_SIGNAL = /\b(s\.?\s*r\.?\s*l\.?|srls|s\.?\s*p\.?\s*a\.?|s\.?\s*n\.?\s*c\.?|sas|group|italia|plast|plex|acril|tecnoplast|technoplast|polymer|polimer|engineering|automation|meccanica|incisioni|grafica|pubblicit[aà]|visual|sign)\b/i;

function validPublishableKeyValue(value: unknown) {
  const supplied = String(value || "").trim();
  if (!supplied) return false;

  try {
    const raw = Deno.env.get("SUPABASE_PUBLISHABLE_KEYS") || "";
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Object.values(parsed).map(String).includes(supplied)) return true;
    }
  } catch {}

  const legacy = String(Deno.env.get("SUPABASE_ANON_KEY") || "").trim();
  return !!legacy && supplied === legacy;
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...CORS,
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

function decodeEntities(s = "") {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isPublicHttpUrl(raw: string) {
  try {
    const u = new URL(raw);
    if (!/^https?:$/.test(u.protocol)) return false;
    if (BLOCKED_HOST.test(u.hostname)) return false;
    if (/^(10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.)/.test(u.hostname)) return false;
    return true;
  } catch {
    return false;
  }
}

function allowedResultUrl(raw: string) {
  if (!isPublicHttpUrl(raw)) return false;
  try {
    const host = new URL(raw).hostname.toLowerCase();
    return !SEARCH_ENGINE_HOST.test(host) && !NON_PROSPECT_HOST.test(host);
  } catch {
    return false;
  }
}

async function fetchTimeout(url: string, init: RequestInit = {}, ms = 18000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { ...init, signal: ctrl.signal });
  } finally {
    clearTimeout(timer);
  }
}

function cleanSearchTitle(raw = "") {
  return decodeEntities(String(raw || ""))
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, " $1 ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/[`*_#]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeResult(x: any, provider: string) {
  return {
    title: cleanSearchTitle(String(x.title || "")),
    url: String(x.url || "").trim(),
    description: decodeEntities(String(x.description || "")),
    content: "",
    provider,
  };
}

function domainText(raw: string) {
  try {
    return new URL(raw).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "";
  }
}

function candidateScore(x: any, query = "") {
  if (!x?.url || !allowedResultUrl(x.url)) return -999;

  const title = String(x.title || "");
  const description = String(x.description || "");
  const host = domainText(x.url);
  const blob = `${title} ${description} ${host}`;

  if (!title || BAD_TITLE.test(title) || IMAGE_PLACEHOLDER_TITLE.test(title) || isGenericCompanyTitle(title)) return -999;

  const strong = STRONG_TARGET.test(blob);
  const process = ACTIVE_PROCESS_SIGNAL.test(blob);
  const format = FORMAT_OR_PROCESS.test(blob);
  const endUser = END_USER_SIGNAL.test(blob);
  const visualBuyer = VISUAL_PLASTIC_BUYER_SIGNAL.test(blob);
  const supplier = PURE_SUPPLIER_SIGNAL.test(blob);
  const company = COMPANY_SIGNAL.test(title) || COMPANY_SIGNAL.test(host);
  const directory = BUSINESS_DIRECTORY_HOST.test(host);

  const queryDirectPlastic = STRONG_TARGET.test(query) || /\b(plex|plastic|pmma|acril|metacrilato|pom|ptfe|pvc|petg|policarbonato)\b/i.test(query);
  const queryEndUser = END_USER_SIGNAL.test(query) || VISUAL_PLASTIC_BUYER_SIGNAL.test(query);

  // IMPORTANTE:
  // Non scartiamo più subito un'azienda "tipo Morlacchi" solo perché lo snippet
  // non contiene il materiale. Incisioni/grafica/targhe + processo reale sono
  // sufficienti per farla arrivare alla fase di verifica sito.
  if (queryDirectPlastic && !strong && !(company && visualBuyer && (process || format))) return -999;
  if (queryEndUser && !(company && (endUser || visualBuyer || process || strong))) return -999;

  // Un puro venditore/distributore di semilavorati non è il nostro target.
  if (supplier && !process && !endUser && !visualBuyer) return -999;

  let score = 0;
  if (strong) score += 9;
  if (process) score += 10;
  if (endUser) score += 8;
  if (visualBuyer) score += 9;
  if (format) score += 3;
  if (company) score += 5;
  if (/\.(it|ch)$/i.test(host)) score += 2;
  if (directory) score -= 2; // directory ammessa per discovery, ma sotto il sito ufficiale

  // Bonus forte per combinazioni tipiche di utilizzatori di LASTRE.
  if (visualBuyer && process) score += 5;
  if (visualBuyer && strong) score += 6;
  if (/\b(supporti rigidi|pannelli|lastre)\b/i.test(blob) && (visualBuyer || process)) score += 4;

  // Se vende ma anche trasforma può restare, però con priorità più bassa.
  if (supplier) score -= 5;

  if (/^(home|homepage|benvenuti|welcome|index)$/i.test(title.trim())) {
    if (strong || process || endUser || visualBuyer || company) score += 1;
    else score -= 8;
  }

  return score;
}

function candidateKind(x: any) {
  const blob = `${String(x?.title || "")} ${String(x?.description || "")} ${domainText(String(x?.url || ""))}`;
  const process = ACTIVE_PROCESS_SIGNAL.test(blob);
  const endUser = END_USER_SIGNAL.test(blob);
  const visualBuyer = VISUAL_PLASTIC_BUYER_SIGNAL.test(blob);
  const supplier = PURE_SUPPLIER_SIGNAL.test(blob);

  if (visualBuyer && process) return "VISUAL_PLASTIC_PROCESSOR";
  if (endUser && process) return "END_USER_PROCESSOR";
  if (visualBuyer) return "VISUAL_PLASTIC_BUYER";
  if (endUser) return "END_USER";
  if (process) return "PROCESSOR";
  if (supplier) return "SUPPLIER";
  return "MATERIAL_RELEVANT";
}

function companyIdentityFromTitle(raw = "") {
  let t = cleanSearchTitle(String(raw || ""));
  if (!t) return "";

  // Identità societaria canonica usata SOLO per deduplica.
  // Le directory aggiungono spesso località, CAP, P.IVA, descrizioni e brand del portale.
  // Per la deduplica teniamo la parte che rappresenta realmente il nome azienda.
  t = t
    .replace(/^\s*[ᐅ•·]+\s*/g, "")
    .replace(/\s*\|.*$/i, "")
    .replace(/\s+[–—-]\s+.*$/i, "")
    .replace(/\s*:\s*(?:Mappa e Contatti|Dati societari|Dati aziendali|Orari Apertura|Address & Phone Number).*$/i, "")
    .replace(/,?\s*(?:Partita IVA|P\.?\s*IVA|Fatturato|bilanci|indici|Orari Apertura|Mappa e Contatti|Address & Phone Number).*$/i, "")
    .trim();

  // Se il titolo contiene una forma legale, tutto ciò che viene dopo è metadato.
  const legalMatch = t.match(/\b(?:S\.?\s*R\.?\s*L\.?|SRLS|S\.?\s*P\.?\s*A\.?|S\.?\s*N\.?\s*C\.?|SNC|S\.?\s*A\.?\s*S\.?|SAS)\b/i);
  if (legalMatch && legalMatch.index != null) {
    t = t.slice(0, legalMatch.index + legalMatch[0].length);
  }

  // Directory: "Nome Azienda a/in Località" -> conserva solo il nome.
  // Gestiamo anche suffissi tipici come "(BG)" e ", Via ..." senza
  // troncare genericamente nomi aziendali che contengono le parole a/in.
  t = t
    .replace(/\s+(?:a|in)\s+[^,|:]{2,80}\s*\([A-Z]{2}\)\s*$/i, "")
    .replace(/\s+(?:a|in)\s+[^,|:]{2,80},\s*(?:via|viale|piazza|corso|strada|loc\.?|localit[aà])\b.*$/i, "")
    .replace(/\s+(?:a|in)\s+[A-ZÀ-Ý][A-Za-zÀ-ÿ'’ .-]{2,80}$/i, "")
    .trim();

  // Per confrontare società equivalenti ignoriamo forma legale e il vecchio "& C.".
  t = t
    .replace(/\s*&\s*C\.?\s*(?=(?:S\.?\s*N\.?\s*C\.?|SNC|S\.?\s*A\.?\s*S\.?|SAS)\b)/i, " ")
    .replace(/\b(?:S\.?\s*R\.?\s*L\.?|SRLS|S\.?\s*P\.?\s*A\.?|S\.?\s*N\.?\s*C\.?|SNC|S\.?\s*A\.?\s*S\.?|SAS)\b/gi, " ")
    .replace(/\b(?:partita\s+iva|p\.?\s*iva)\b.*$/i, " ")
    .replace(/\b\d{5}\b.*$/i, " ")
    .replace(/[^a-z0-9à-ÿ]+/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

  return t.length >= 4 ? t : "";
}

function rankResults(items: any[], query = "") {
  const seenUrls = new Set<string>();
  const candidates: any[] = [];

  for (const x of items) {
    const urlKey = String(x.url || "").toLowerCase().replace(/\/$/, "");
    if (!x.title || !x.url || seenUrls.has(urlKey)) continue;
    seenUrls.add(urlKey);
    if (isGenericCompanyTitle(x.title)) continue;

    const kind = candidateKind(x);
    const score = candidateScore(x, query);
    if (score < 10 || kind === "SUPPLIER") continue;

    candidates.push({
      ...x,
      score,
      kind,
      sourceType: BUSINESS_DIRECTORY_HOST.test(domainText(x.url)) ? "BUSINESS_DIRECTORY" : "DIRECT_WEB",
      companyIdentity: companyIdentityFromTitle(x.title),
    });
  }

  // Prima ordiniamo per qualità: la migliore fonte diventa il rappresentante dell'azienda.
  candidates.sort((a, b) => b.score - a.score || (a.sourceType === "DIRECT_WEB" ? -1 : 1));

  const seenCompanies = new Set<string>();
  const ranked: any[] = [];
  for (const x of candidates) {
    const companyKey = x.companyIdentity || `url:${String(x.url).toLowerCase()}`;
    if (seenCompanies.has(companyKey)) continue;
    seenCompanies.add(companyKey);
    ranked.push(x);
    if (ranked.length >= 30) break;
  }

  return ranked;
}

function queryVariants(q: string) {
  const clean = q.replace(/\s+/g, " ").trim();
  const suffix = "srl azienda -Treccani -dizionario -vocabolario -Subito -offerte -lavoro";
  const variants = new Set<string>();

  variants.add(`${clean} ${suffix}`);

  // Discovery specifica per utilizzatori di lastre nel visual/sign.
  if (VISUAL_PLASTIC_BUYER_SIGNAL.test(clean) || /\b(grafica|pubblicit[aà]|insegne|incisioni|targhe|serigrafia)\b/i.test(clean)) {
    variants.add(`${clean} plexiglass acrilico policarbonato PVC pannelli supporti rigidi ${suffix}`);
    variants.add(`${clean} taglio laser CNC incisione stampa digitale serigrafia ${suffix}`);
  }

  // Se la query è materiale-centrica, aggiunge famiglie che spesso lo usano
  // senza dichiararsi "azienda plastica".
  if (STRONG_TARGET.test(clean) || /\b(plastic|plex|pmma|pvc|petg|policarbonato|acril)\b/i.test(clean)) {
    variants.add(`${clean} incisioni targhe insegne serigrafia stampa digitale supporti rigidi ${suffix}`);
    variants.add(`${clean} espositori allestimenti comunicazione visiva pannelli CNC laser ${suffix}`);
  }

  return [...variants].slice(0, 4);
}

async function bingRss(q: string) {
  const url = `https://www.bing.com/search?format=rss&mkt=it-IT&setlang=it&q=${encodeURIComponent(q)}`;
  const r = await fetchTimeout(url, {
    headers: {
      "User-Agent": UA,
      "Accept-Language": "it-IT,it;q=0.9,en;q=0.6",
    },
  });

  if (!r.ok) throw new Error(`Bing RSS HTTP ${r.status}`);
  const xml = await r.text();
  const out: any[] = [];

  for (const m of xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)) {
    const block = m[1];
    const title = (block.match(/<title>([\s\S]*?)<\/title>/i) || [])[1] || "";
    const link = (block.match(/<link>([\s\S]*?)<\/link>/i) || [])[1] || "";
    const desc = (block.match(/<description>([\s\S]*?)<\/description>/i) || [])[1] || "";
    const item = normalizeResult({ title, url: decodeEntities(link), description: desc }, "Bing RSS");
    if (item.url && allowedResultUrl(item.url)) out.push(item);
    if (out.length >= 18) break;
  }
  return out;
}

function ddgActualUrl(href: string) {
  try {
    const decoded = decodeEntities(href);
    const u = new URL(decoded.startsWith("//") ? `https:${decoded}` : decoded, "https://html.duckduckgo.com/");
    const uddg = u.searchParams.get("uddg");
    return uddg ? decodeURIComponent(uddg) : u.href;
  } catch {
    return href;
  }
}

async function duckDuckGo(q: string) {
  const body = new URLSearchParams({ q, kl: "it-it" });
  const r = await fetchTimeout("https://html.duckduckgo.com/html/", {
    method: "POST",
    headers: {
      "User-Agent": UA,
      "Accept-Language": "it-IT,it;q=0.9,en;q=0.6",
      "Content-Type": "application/x-www-form-urlencoded",
      "Referer": "https://html.duckduckgo.com/",
    },
    body,
  });

  if (!r.ok) throw new Error(`DuckDuckGo HTTP ${r.status}`);
  const html = await r.text();
  const out: any[] = [];
  const rx = /<a[^>]*class="[^"]*result__a[^"]*"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;

  for (const m of html.matchAll(rx)) {
    const item = normalizeResult({ title: m[2], url: ddgActualUrl(m[1]) }, "DuckDuckGo");
    if (item.url && allowedResultUrl(item.url)) out.push(item);
    if (out.length >= 18) break;
  }
  return out;
}

async function bingHtml(q: string) {
  const url = `https://www.bing.com/search?mkt=it-IT&setlang=it&q=${encodeURIComponent(q)}`;
  const r = await fetchTimeout(url, {
    headers: {
      "User-Agent": UA,
      "Accept-Language": "it-IT,it;q=0.9,en;q=0.6",
    },
  });

  if (!r.ok) throw new Error(`Bing HTML HTTP ${r.status}`);
  const html = await r.text();
  const out: any[] = [];
  const rx = /<li[^>]*class="[^"]*b_algo[^"]*"[^>]*>[\s\S]*?<h2[^>]*>\s*<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;

  for (const m of html.matchAll(rx)) {
    const item = normalizeResult({ title: m[2], url: decodeEntities(m[1]) }, "Bing HTML");
    if (item.url && allowedResultUrl(item.url)) out.push(item);
    if (out.length >= 18) break;
  }
  return out;
}

async function search(q: string) {
  const raw: any[] = [];
  const errors: string[] = [];
  const variants = queryVariants(q);

  // Ricerca multi-variante: amplia il discovery, ranking finale unico.
  for (const query of variants) {
    try {
      raw.push(...await bingRss(query));
    } catch (e) {
      errors.push(String((e as Error).message || e));
    }

    await new Promise((r) => setTimeout(r, 180));

    try {
      raw.push(...await duckDuckGo(query));
    } catch (e) {
      errors.push(String((e as Error).message || e));
    }
  }

  let results = rankResults(raw, q);

  if (results.length < 10) {
    for (const query of variants.slice(0, 2)) {
      await new Promise((r) => setTimeout(r, 180));
      try {
        raw.push(...await bingHtml(query));
      } catch (e) {
        errors.push(String((e as Error).message || e));
      }
    }
    results = rankResults(raw, q);
  }

  return {
    results,
    errors,
    rawCount: raw.length,
    filteredCount: Math.max(0, raw.length - results.length),
    queryVariants: variants,
  };
}

async function fetchPage(url: string) {
  if (!isPublicHttpUrl(url)) throw new Error("URL non valido");

  const r = await fetchTimeout(url, {
    redirect: "follow",
    headers: {
      "User-Agent": UA,
      "Accept-Language": "it-IT,it;q=0.9,en;q=0.6",
      "Accept": "text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.5",
    },
  }, 20000);

  if (!r.ok) throw new Error(`FETCH HTTP ${r.status}`);

  const type = r.headers.get("content-type") || "";
  if (!/text|html|xml|json/i.test(type)) throw new Error("Contenuto non testuale");

  const text = await r.text();
  return text.slice(0, 1_500_000);
}

function pageTargetEvidence(text: string) {
  const clean = decodeEntities(text).slice(0, 250000);
  let score = 0;

  const strong = STRONG_TARGET.test(clean);
  const process = ACTIVE_PROCESS_SIGNAL.test(clean);
  const endUser = END_USER_SIGNAL.test(clean);
  const visualBuyer = VISUAL_PLASTIC_BUYER_SIGNAL.test(clean);
  const format = FORMAT_OR_PROCESS.test(clean);

  if (strong) score += 6;
  if (process) score += 8;
  if (endUser) score += 5;
  if (visualBuyer) score += 6;
  if (format) score += 2;
  if (visualBuyer && strong) score += 5;
  if (visualBuyer && process) score += 4;
  if (/\b(telefono|tel\.|contatti|email|@)\b/i.test(clean)) score += 2;

  const pureSupplier =
    PURE_SUPPLIER_SIGNAL.test(clean) &&
    !process &&
    !endUser &&
    !visualBuyer;

  if (pureSupplier) score -= 12;
  return score;
}

async function selftest() {
  const queries = [
    "lavorazione CNC POM PTFE particolari tecnici Lombardia",
    "macchine packaging automazione protezioni policarbonato POM Lombardia",
    "insegne espositori plexiglass lavorazione PMMA Piemonte",
    "incisioni targhe serigrafia acrilico supporti rigidi Lombardia",
    "Incisioni Morlacchi Orio al Serio",
  ];

  let searchResults = 0;
  let rawResults = 0;
  const samples: any[] = [];
  const candidates: any[] = [];

  for (const q of queries) {
    const sr = await search(q);
    searchResults += sr.results.length;
    rawResults += sr.rawCount || 0;
    samples.push(...sr.results.slice(0, 3));
    candidates.push(...sr.results.slice(0, 5));
  }

  let fetchSuccess = 0;
  let targetPages = 0;
  let buyerPages = 0;
  let visualPlasticPages = 0;
  const checked = new Set<string>();

  for (const item of candidates) {
    if (checked.has(item.url)) continue;
    checked.add(item.url);

    try {
      const text = await fetchPage(item.url);
      if (text.length > 300) {
        fetchSuccess++;
        const evidence = pageTargetEvidence(text);
        if (evidence >= 10) targetPages++;
        if (VISUAL_PLASTIC_BUYER_SIGNAL.test(text) && (STRONG_TARGET.test(text) || ACTIVE_PROCESS_SIGNAL.test(text))) {
          visualPlasticPages++;
        }
        if (evidence >= 10 && (ACTIVE_PROCESS_SIGNAL.test(text) || END_USER_SIGNAL.test(text) || VISUAL_PLASTIC_BUYER_SIGNAL.test(text))) {
          buyerPages++;
        }
      }
    } catch {}

    if (checked.size >= 14) break;
  }

  const ok = searchResults >= 3 && fetchSuccess >= 2 && targetPages >= 2 && buyerPages >= 2;

  return {
    ok,
    engine: "supabase-edge-v7-discovery-directories-markdown",
    rawResults,
    searchResults,
    filteredOut: Math.max(0, rawResults - searchResults),
    fetchSuccess,
    targetPages,
    buyerPages,
    visualPlasticPages,
    qualityRatio: fetchSuccess ? Number((buyerPages / fetchSuccess).toFixed(2)) : 0,
    samples: samples.slice(0, 12),
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ ok: false, error: "Usa POST" }, 405);

  try {
    const rawBody = await req.text().catch(() => "");
    let body: any = {};
    try { body = rawBody ? JSON.parse(rawBody) : {}; } catch { body = {}; }

    const suppliedKey = req.headers.get("apikey") || body.publishableKey || body.apikey || "";
    if (!validPublishableKeyValue(suppliedKey)) {
      return json({ ok: false, error: "API key non valida" }, 401);
    }

    const action = String(body.action || "health");

    if (action === "health") {
      return json({ ok: true, engine: "supabase-edge-v7-discovery-directories-markdown" });
    }

    if (action === "search") {
      const q = String(body.q || "").trim();
      if (q.length < 3 || q.length > 300) {
        return json({ ok: false, error: "Query non valida" }, 400);
      }
      const data = await search(q);
      return json({ ok: true, ...data });
    }

    if (action === "fetch") {
      const url = String(body.url || "").trim();
      const text = await fetchPage(url);
      return json({ ok: true, text });
    }

    if (action === "selftest") {
      return json(await selftest());
    }

    return json({ ok: false, error: "Azione non supportata" }, 400);
  } catch (e) {
    return json({ ok: false, error: String((e as Error)?.message || e) }, 500);
  }
});
