PLASTIC PROSPECT ITALIA — 2000+ DEFINITIVO

OBIETTIVO
CRM commerciale nazionale per aziende italiane potenzialmente utilizzatrici/lavoratrici di
semilavorati plastici in LASTRE o TONDI/BARRE.

DATI INCLUSI NEL FILE
- Aziende precaricate: 989
- Aziende precaricate con telefono pubblico: 874
- Nuovi contatti telefonici aggiunti in questa release: 281
- Nuovi candidati industriali pubblici aggiunti in questa release: 114

RACCOLTA WEB A-Z AUTOMATICA
All'apertura online il programma avvia/riprende una raccolta progressiva da fonti industriali
pubbliche (MECSPE, directory ANIE e SPS Italia), deduplica le ragioni sociali e punta ad almeno
2.500 candidati nel CRM. Lo stato della scansione viene salvato in IndexedDB e riprende dal punto
raggiunto quando il programma viene riaperto.

IMPORTANTE SUI TELEFONI
- Non vengono inventati numeri.
- Le aziende già dotate di numero mostrano il tasto CHIAMA.
- Le aziende raccolte dal web senza telefono mostrano CERCA TELEFONO, che apre una ricerca Google
  già compilata con ragione sociale/località.
- È disponibile il filtro "Solo con telefono".

SETTORI
Plastic machining/CNC, materie plastiche tecniche, plexiglass, insegne e visual communication,
allestimenti/espositori, automazione, meccatronica, conveyor/material handling, macchine industriali,
farmaceutica/medicale, alimentare, imbottigliamento, trattamento acque/chimica, nautica,
coltelleria, arredo tecnico e altri utilizzatori plausibili.

ESCLUSIONI
Granuli/pellet, compound, film flessibile, sacchi/imballaggio flessibile e attività rilevanti
esclusivamente per materie prime da stampaggio/estrusione.

CRM
Operatori/insider, assegnazione, chiamato da, data chiamata, esito, prossimo richiamo, note,
preferiti, KPI, filtri, export CSV, import CSV/XLS/XLSX, backup JSON, IndexedDB locale.

NOTA
Le aziende raccolte automaticamente dalle fiere/directory sono candidati commerciali e possono
richiedere completamento di comune/provincia/telefono. Il programma le distingue operativamente
con il filtro telefono e il pulsante di ricerca Google.


AMPLIAMENTO PROFILO MO.RE PLEX
- Nuove aziende aggiunte: 27
- Totale aziende precaricate: 1016
- Profilo aggiunto: lavorazione diretta PMMA/Plexiglass, taglio laser/fresatura,
  termoformatura, espositori, insegne, pannelli e carpenteria plastica da lastra.


SUPABASE + BRANDING VINK
- Questa versione supporta Supabase come archivio condiviso cloud.
- Compila supabase-config.js con URL e anon key del progetto.
- Esegui supabase-schema.sql nell'editor SQL di Supabase.
- Se Supabase è configurato, aziende, note chiamata, esiti, assegnazioni, operatori e stato crawler vengono salvati sul cloud.
- Se Supabase non è configurato, l'app continua a funzionare in locale con IndexedDB.
- Branding aggiornato con colori Vink Italia e logo SVG incluso (vink-logo.svg).


CONFIGURAZIONE PROGETTO SUPABASE
Project URL già configurato:
https://artwylvnenaxyilcatec.supabase.co

Per attivare la sincronizzazione:
1. Eseguire supabase-schema.sql sul progetto.
2. Inserire nell'app la Publishable Key (sb_publishable_...) nel pannello Supabase.
3. Il programma salva la key nel browser e si riavvia automaticamente in modalità Supabase.

SICUREZZA
Non usare mai service_role o secret key nel frontend.


ACCESSO INSIDER
Quando Supabase è attivo, il CRM richiede login email/password tramite Supabase Auth.
Crea in Supabase soltanto gli utenti autorizzati (insider).
Le policy RLS consentono lettura e scrittura solo al ruolo authenticated.


CONFIGURAZIONE COMPLETATA
- Project URL Supabase inserito.
- Publishable Key inserita nel frontend.
- Non è stata usata alcuna service_role/secret key.
- Per rendere operativo il database, eseguire una sola volta supabase-schema.sql nel SQL Editor del progetto.


AGGIORNAMENTO CONTEGGI E ARRICCHIMENTO DATI
- Corretto caricamento Supabase oltre 1.000 record con paginazione.
- Scritture Supabase eseguite a blocchi per supportare migliaia di aziende.
- Il grafico regionale mostra ora anche "DA GEOLOCALIZZARE".
- Aggiunti KPI sito web, email e record senza regione.
- Aggiunti filtri per completezza dei dati.
- Aggiunti sito ed email in schede, dettagli, tabella e modifica azienda.
- La ricerca Google ora cerca insieme telefono + email + sito.
- Nuova fase "Arricchimento contatti": prova a recuperare telefono, email, sito,
  comune/provincia/regione dalle pagine pubbliche già associate ai record.
- Campi seed sito/email aggiornati in questa release: 19.


LOGO VINK ORIGINALE
- Usati direttamente i file caricati dall'utente:
  Logo Vink Positivo/Logo-Vink-positivo.png
  Logo Vink Nero/Logo-Vink-nero.png
- Nessun logo ridisegnato o ricostruito.

RUOLI ACCESSO
AMMINISTRATORE
- Alias login: AMMINISTRATORE
- Email Supabase associata: admin@vinkitalia.it
- Vede nuova azienda, raccolta web, arricchimento, Supabase, backup/import,
  gestione insider e ripristino database.

USER / INSIDER
- Login con email/password Supabase personale.
- Lavora sulle aziende e registra chiamate/esiti/richiami.
- Non vede gli strumenti amministrativi.

CREAZIONE AMMINISTRATORE
Il bottone "Inizializza amministratore" prova a creare l'account tramite Supabase signUp.
Se Confirm email è attivo, creare/auto-confermare l'utente admin@vinkitalia.it in
Supabase > Authentication > Users.


CREDENZIALI AMMINISTRATORE
Utente: AMMINISTRATORE
Password: VinkItalia2026!


CORREZIONE ACCESSO AMMINISTRATORE
- Rimosso completamente "Inizializza amministratore".
- Utente: AMMINISTRATORE
- Password: VinkItalia2026!
- L'accesso admin è diretto e non viene bloccato dalla mancata creazione
  dell'utente Supabase.
- Quando una sessione Supabase admin valida è disponibile, il CRM usa il cloud.
- In assenza della sessione Supabase admin, l'accesso resta comunque disponibile
  con archivio locale.


CORREZIONE LOGIN
- Rimossa la scelta USER / AMMINISTRATORE.
- Campo unico Utente / Email.
- AMMINISTRATORE viene riconosciuto automaticamente come admin.
- Le email vengono riconosciute automaticamente come USER / INSIDER.
- Eliminato il rischio di inviare "AMMINISTRATORE" a Supabase come email.
