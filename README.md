# Compagnia Chāndrama — Sito Web

Sito ufficiale della Compagnia Chāndrama, compagnia teatrale transfemminista di Torino.

**URL produzione:** [compagnia-chandrama.vercel.app](https://compagnia-chandrama.vercel.app)  
**Repo GitHub:** [github.com/info145/compagnia-chandrama](https://github.com/info145/compagnia-chandrama)  
**Deploy:** Vercel (auto-deploy ad ogni push su `main`)

---

## Stack tecnico

| Cosa | Tecnologia |
|------|------------|
| Frontend | HTML5 + CSS vanilla + JS vanilla |
| Build | Vite |
| Animazioni | GSAP + ScrollTrigger |
| Datepicker | Flatpickr |
| Form | Formspree |
| Pagamenti | Stripe Checkout |
| Video | Vimeo OTT |
| Serverless | Vercel Functions (`/api/`) |
| Deploy | Vercel |

---

## Struttura cartelle

```
compagnia.chandrama/
├── index.html              ← pagina principale (unica pagina)
├── vercel.json             ← configurazione routing Vercel
├── .env.example            ← template variabili d'ambiente
├── package.json
│
├── src/
│   ├── main.js             ← tutto il JavaScript
│   └── style.css           ← tutto il CSS
│
├── public/
│   ├── watch.html          ← pagina player post-pagamento streaming
│   └── Foto/
│       ├── Logo.png                  ← logo (solo questo nome, case-sensitive su Vercel)
│       ├── Foto Gruppo.png           ← foto di gruppo (hero Chi Siamo)
│       ├── Staff/
│       │   ├── Agnese Zorzi.png      ← foto card attrice
│       │   ├── Agnese Zorzi/         ← cartella con foto modale attrice
│       │   ├── Alice Franceschini.png
│       │   ├── Alice Franceschini/
│       │   ├── Amalia Stagnaro.png
│       │   ├── Amalia Stagnaro/
│       │   ├── Cecilia Andreis.png
│       │   ├── Cecilia Andreis/
│       │   ├── Giulia Donini.png
│       │   ├── Giulia Donini/
│       │   ├── Michelangela Battistella.png
│       │   ├── Michelangela Battistella/
│       │   ├── Penelope Zaccarini.png
│       │   ├── Penelope Zaccarini/
│       │   ├── Rachele Ferraro.png
│       │   ├── Rachele Ferraro/
│       │   ├── Valentina Sandri.png
│       │   └── Valentina Sandri/
│       ├── Locandne/                 ← locandine date passate
│       └── Foto Varie/               ← foto galleria e blog
│
└── api/
    ├── create-checkout.js    ← serverless: crea sessione Stripe
    └── checkout-success.js   ← serverless: verifica pagamento → redirect player
```

---

## Sviluppo locale

```bash
# Installa dipendenze (solo la prima volta)
npm install

# Avvia server di sviluppo su http://localhost:5173
npm run dev

# Build produzione
npm run build
```

---

## Sezioni del sito

| # | ID | Nome |
|---|----|------|
| 01 | `#chi-siamo` | Chi Siamo |
| 02 | `#spettacolo` | Oltre i Muri |
| 03 | `#prenotazioni` | Prenota |
| 04 | `#date-passate` | Date Passate |
| 05 | `#galleria` | Galleria |
| 06 | `#blog` | Riflessioni |
| 07 | `#streaming` | Streaming |
| 08 | `#sostienici` | Sostienici |
| 09 | `#contatti` | Contatti |

---

## Come aggiornare i contenuti

### Cambiare un'immagine
Carica il nuovo file nella stessa cartella con **lo stesso nome esatto** (attenzione alle maiuscole — Vercel è Linux, case-sensitive). Poi:
```bash
git add public/Foto/...
git commit -m "aggiorna foto X"
git push
```
Vercel fa il deploy automaticamente entro ~30 secondi.

### Aggiungere una data passata (locandina)
1. Aggiungi il file PNG nella cartella `public/Foto/Locandne/`
2. In `index.html` cerca la sezione `#date-passate` e aggiungi una card seguendo il pattern esistente

### Aggiungere un articolo al blog
In `index.html` cerca la sezione `#blog` e aggiungi un `.blog-card` seguendo il pattern esistente. Gli articoli devono essere multipli di 3 per il layout.

### Aggiornare le bio delle attrici
In `index.html` cerca `data-bio=` accanto al nome dell'attrice e modifica il testo. I paragrafi si separano con `\n\n`.

### Aggiornare date future (prenotazioni)
In `src/main.js` cerca `initDatePicker` e modifica l'array `enable` con le date disponibili.

### Aggiornare numero WhatsApp / telefono
In `index.html` cerca `wa.me` e `tel:` e sostituisci il numero.

### Aggiornare il form Formspree
In `index.html` cerca `action="https://formspree.io/f/` e inserisci il tuo ID form Formspree.

---

## Streaming a pagamento

### Come funziona

```
Utente clicca "Acquista"
    → fetch POST /api/create-checkout
    → Stripe Checkout (pagina Stripe sicura)
    → Pagamento completato
    → redirect a /api/checkout-success?session_id=xxx
    → verifica pagamento su Stripe
    → redirect a /watch?embed=URL_VIMEO&tok=SESSION_ID
    → player Vimeo embeddato
```

### Costi reali
- **Stripe:** 1.4% + €0.25 per transazione EU. Zero canone mensile.
- **Vimeo OTT:** gratuito. Trattengono il 10% delle vendite.
- **Vercel:** già usato, le serverless functions rientrano nel piano gratuito.
- **Totale fisso mensile: €0**

### Setup (da fare una volta sola)

#### 1. Vimeo OTT
1. Crea account su [vimeo.com/ott](https://vimeo.com/ott) (gratuito)
2. Carica il video dello spettacolo
3. Copia l'URL embed del video (dal pannello "Share/Embed")

#### 2. Stripe
1. Crea account su [stripe.com](https://stripe.com) (gratuito)
2. Vai su Dashboard → Developers → API Keys
3. Copia la **Secret key** (`sk_live_...`)

#### 3. Variabili d'ambiente su Vercel
Dashboard Vercel → Progetto → Settings → Environment Variables:

| Variabile | Valore |
|-----------|--------|
| `STRIPE_SECRET_KEY` | `sk_live_...` (da Stripe) |
| `SITE_URL` | `https://compagnia-chandrama.vercel.app` |
| `VIMEO_VOD_URL` | URL embed Vimeo OTT del VOD |
| `VIMEO_LIVE_URL` | URL embed Vimeo OTT del live (quando disponibile) |

Dopo aver aggiunto le variabili, fai un **Redeploy** dal pannello Vercel.

### Aggiungere un nuovo spettacolo allo streaming
1. In `api/create-checkout.js` aggiungi una voce all'oggetto `PRODUCTS`
2. In `api/checkout-success.js` aggiungi la voce corrispondente a `VIMEO_EMBED_URLS`
3. In `index.html` aggiungi una nuova `.streaming__card` con il `data-product` corretto
4. Aggiungi la variabile Vimeo su Vercel

---

## Contatti e accessi

| Cosa | Info |
|------|------|
| Email compagnia | compagniachandrama@gmail.com |
| Instagram | [@compagnia.chandrama](https://instagram.com/compagnia.chandrama) |
| WhatsApp | +39 340 075 3318 |
| GitHub | [info145](https://github.com/info145) |
| Vercel | account collegato a info@mentor-ripetizioni.com |

---

## Deploy

Il deploy è automatico: ogni `git push` su `main` triggera un nuovo deploy su Vercel.

```bash
git add -A
git commit -m "descrizione della modifica"
git push
```

Per verificare lo stato del deploy: [vercel.com/dashboard](https://vercel.com/dashboard)
