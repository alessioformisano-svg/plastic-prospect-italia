PLASTIC PROSPECT ITALIA - REPOSITORY GITHUB / NETLIFY

Struttura necessaria:
- index.html
- netlify.toml
- netlify/functions/plastic-scraper-proxy.mjs
- supabase/functions/plastic-scraper/index.ts

Netlify deve essere collegato a questo repository GitHub.
Non usare il drag & drop per questa configurazione: il build Git pubblica la Netlify Function.

Lo scraper Supabase resta quello già validato su Incisioni Morlacchi.
La webapp chiama /.netlify/functions/plastic-scraper-proxy, quindi il browser non chiama direttamente Supabase.
