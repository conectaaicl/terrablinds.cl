---
name: terrablinds-growth-engine
description: Todo el sistema de terrablinds.cl (SPA React + Express + PostgreSQL + nginx + Cloudflare + n8n + OmniFlow) — cómo está armado, cómo desplegar, cómo verificar de verdad, y las trampas que ya mordieron. Úsalo cuando el usuario mencione terrablinds.cl, su admin, su SEO/indexación, sus leads, el bot de WhatsApp de TerraBlinds, el prerender, o pida auditar/arreglar/mejorar cualquier parte del sitio.
---

# TerraBlinds Growth Engine

Sitio comercial de cortinas roller, persianas, toldos y cierres de terraza en Chile (Santiago + La Serena/Coquimbo). Objetivo del sistema: que Google lo indexe, que el tráfico convierta en cotizaciones, y que cada lead dispare notificaciones y seguimiento automático.

**Dueño:** Hector (TerraBlinds / ConectaAI). Email `terrablinds@gmail.com`. Recibe alertas en Telegram chat `8676382169`.

---

## 1. Arquitectura en 30 segundos

```
Usuario ──► Cloudflare ──► nginx (terrablinds_frontend :8080)
                              │
                              ├─ humano  ──► index.html (SPA React 19 + Vite)
                              ├─ bot     ──► rewrite /api/prerender?path=X ──► Express
                              ├─ /api/*  ──► Express (terrablinds_backend :5000)
                              └─ /uploads ──► Express static (volumen Docker)
                                                    │
                                                    ▼
                                            PostgreSQL (terrablinds_db)

Lead (form / cotización / WhatsApp) ──► Express ──► webhook n8n ──► Telegram + MailSaaS + follow-ups
WhatsApp +56943449232 ──► Meta Cloud API ──► OmniFlow (osw.conectaai.cl) ──► n8n bot
```

**Todo vive en el VPS `62.169.17.214`, ruta `/var/www/terrablinds`.** No hay copia local actualizada. Repo git con remote `conectaaicl/terrablinds.cl`.

---

## 2. Acceso y comandos base

```bash
ssh root@62.169.17.214
cd /var/www/terrablinds

# contenedores
docker ps --format "{{.Names}}\t{{.Status}}" | grep terrablinds
# terrablinds_frontend  nginx, expone 127.0.0.1:8080
# terrablinds_backend   Express, puerto 5000 solo en red docker (IP 172.27.0.x)
# terrablinds_db        PostgreSQL

# base de datos  (¡db=terrablinds_db, NO "terrablinds"!)
docker exec -i terrablinds_db psql -U terrablinds -d terrablinds_db << 'SQL'
SELECT ...;
SQL

# logs
docker logs terrablinds_frontend --since 1h    # access log nginx (incluye bots)
docker logs terrablinds_backend  --since 1h    # Express, incl. [GA4], [review-loop], Contact form
```

**Uploads viven en un volumen Docker, no en el filesystem del host:**
`terrablinds_uploads_data → /app/uploads` dentro del backend. Para subir una imagen:
```bash
docker cp archivo.webp terrablinds_backend:/app/uploads/archivo.webp
```
Copiarla a `/var/www/terrablinds/backend/uploads/` **no sirve** (esa carpeta no está montada).

---

## 3. Desplegar

Los builds tardan 1–4 min y **una desconexión SSH deja contenedores a medio recrear** (nombre `<hash>_terrablinds_backend`, estado `Created`). Siempre en background:

```bash
cd /var/www/terrablinds
nohup sh -c "docker compose build backend frontend > /tmp/build.log 2>&1 && \
             docker compose up -d backend frontend >> /tmp/build.log 2>&1; \
             echo DONE >> /tmp/build.log" >/dev/null 2>&1 &
# luego:
grep -q DONE /tmp/build.log && tail -3 /tmp/build.log
```

Si queda un contenedor huérfano: `docker ps -a | grep terrablinds_backend` → el que está `Created` y nunca arrancó se borra con `docker rm <id>`; el que está `Up` es el vivo. Verificar antes de borrar.

**Frontend:** cambios en `frontend/src/` o `frontend/nginx.conf` o `frontend/public/` → `build frontend`.
**Backend:** cambios en `backend/src/` → `build backend`.
**Solo DB/config:** no hace falta build.

---

## 4. Mapa del código

### Frontend (`frontend/`)
| Archivo | Qué es |
|---|---|
| `src/App.jsx` | Rutas. Todo lazy (`React.lazy` + wrapper `GE`) salvo `Home`. 26 admin + 25 públicas. |
| `src/main.jsx` | Registra SW como `/sw.js?v=N`. **Subir N al cambiar sw.js.** |
| `public/sw.js` | Service worker network-first, cache `tb-vN`, shells `/` y `/admin`, tope 40 páginas. |
| `public/robots.txt` | Servido por nginx con `location =` para que el bot map no lo secuestre. |
| `nginx.conf` | Bot map, CSP, cache de estáticos, proxy /api y /uploads, prerender. **Ver §5.** |
| `src/components/Layout.jsx` | Header/footer, WhatsApp FAB, BotWidget, ChatWidget, **tracking de visitas por ruta** (POST `/api/stats/visit` con `sessionStorage` por path). |
| `src/components/FeaturedProducts.jsx` | 6 destacados del home. Busca productos por `match` de texto en el nombre — si el producto se renombra, el match se rompe. |
| `src/components/ProductCard.jsx` | Tarjeta de catálogo. Placeholder de marca (no icono) cuando no hay foto. |
| `src/pages/Catalog.jsx` | Búsqueda + categoría + subcategoría + orden, **todo en URL** (`?category=&sub=&q=&sort=`). |
| `src/pages/ComunaPage.jsx` | Landing por comuna. Lee `data/comunas.js`. Galería de 6 fotos reales (etiquetadas por producto, no por comuna). |
| `src/pages/LaSerena.jsx` | Landing La Serena/Coquimbo, 13 fotos en `/assets/la-serena/`. |
| `src/pages/BlogPost.jsx` | Enlaza primera mención de cada comuna con `TreeWalker`; chips "Instalamos en tu comuna" al pie. |
| `src/data/comunas.js` | **Copia ESM de `backend/src/data/comunas.js`. Mantener iguales.** |

### Backend (`backend/src/`)
| Archivo | Qué es |
|---|---|
| `routes/seo.routes.js` | **Corazón del SEO.** `STATIC_PAGES`, sitemap dinámico, `/api/prerender`, caché en memoria, JSON-LD. Ver §5. |
| `data/comunas.js` | 11 comunas con `intro`, `contexto` (único por comuna), `destacados`. `findComunas(text)` para enlazado. |
| `controllers/config.controller.js` | `PUBLIC_KEYS`: lista blanca de qué configs ve el frontend. **Si agregas una clave nueva y no aparece en el sitio, es esto.** |
| `controllers/contact.controller.js` | Guarda en `contacts`, dispara `webhook_url` (n8n), envía email por MailSaaS. |
| `controllers/quote.controller.js` | Cotizaciones. `status → completed` dispara review loop (`fireReviewRequest`). |
| `controllers/analytics.controller.js` | GA4 Data API (JWT RS256). Necesita `GA4_PROPERTY_ID` + `GA4_SERVICE_ACCOUNT_JSON`; sin ellos devuelve `{configured:false}`. **No activado** (org policy de Google Cloud bloqueó la service account). |
| `routes/stats.routes.js` | `POST /visit {page}` y `GET /visits`. Tabla `page_visits`. "Hoy/ayer" se calcula con `(NOW() AT TIME ZONE 'America/Santiago')::date`; el `catch` devuelve `degraded:true` y loguea — si el admin muestra ceros con total >0, revisar `docker logs terrablinds_backend \| grep '[stats]'`. |
| `services/email.service.js` | **Solo MailSaaS** (`https://mail.conectaai.cl/api/send`, Bearer `MAILSAAS_API_KEY`). Nunca Resend, nunca SMTP Gmail. |

### Base de datos (tablas que importan)
`products` (images es `varchar[]`), `configs` (key/value — ver §7), `contacts`, `quotes`, `leads` (vacía; el form escribe en `contacts`), `projects`, `blogs`, `faqs`, `page_visits`, `ge_outbox`.

---

## 5. Dynamic rendering — cómo Google ve el sitio

**El problema que resuelve:** una SPA entrega `<div id="root"></div>`; Google vería páginas vacías.

**Cómo funciona:** `nginx.conf` tiene un `map $http_user_agent $is_bot` con regex `~*`. Si es bot → `rewrite ^(.*)$ /api/prerender?path=$1` → Express arma HTML con contenido real desde PostgreSQL. Si es humano → SPA.

**Qué genera el prerender por tipo de ruta:**
- `/` y `/catalog`: 18 productos con descripción + servicios + contacto
- `/cortinas/:slug` (11 comunas): intro + contexto único + destacados + 12 productos + galería 6 fotos + guías del blog de esa comuna + 4 FAQ locales + enlaces a las otras 10 comunas + JSON-LD `LocalBusiness` con `areaServed` + `BreadcrumbList`
- `/blog/:slug`: texto del post (3000 chars) con **primera mención de cada comuna enlazada**, bloque de comunas al pie, JSON-LD `Article`
- `/product/:id`: descripción completa, JSON-LD `Product`
- `/faq`: las 10 preguntas
- `/la-serena`: copy propio + productos
- **Cualquier otra ruta → `404` + `<meta name="robots" content="noindex">`** (slugs de comuna desconocidos incluidos)

**Caché:** `Map` en memoria, TTL 10 min, tope 500 entradas, **nunca cachea 404**. Header `X-Prerender-Cache: HIT|MISS`. TTFB ~75 ms en HIT. Cloudflare no cachea este HTML (`cf-cache-status: DYNAMIC`).

### ⚠️ La trampa que costó 7 días de invisibilidad
Search Console **no inspecciona con `Googlebot`**; usa **`Google-InspectionTool`**. Si el map no lo incluye, cada "Probar URL" y "Solicitar indexación" recibe la SPA vacía y Google descarta la página — silenciosamente. Mientras tanto `curl -A Googlebot` da prerender perfecto y nadie ve el problema.

El map hoy incluye: `Googlebot|Google-InspectionTool|GoogleOther|AdsBot-Google|Storebot-Google|Mediapartners-Google|APIs-Google|FeedFetcher-Google|Google-Read-Aloud|Google-Site-Verification|bingbot|BingPreview|…`

**Para probar dynamic rendering, SIEMPRE con los UAs reales:**
```bash
for ua in "Mozilla/5.0 (compatible; Google-InspectionTool/1.0;)" \
          "AdsBot-Google (+http://www.google.com/adsbot.html)" \
          "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"; do
  curl -s -A "$ua" https://terrablinds.cl/cortinas/las-condes | grep -c "<h1"   # 1 = prerender, 0 = shell
done
```

### Archivos que el bot map NO debe secuestrar
`robots.txt`, `sw.js`, `sitemap.xml` tienen `location =` propios en nginx (exact match gana sobre `location /`). Si agregas otro archivo de texto en `public/` que un bot pueda pedir, dale su `location =`.

### Ver si Google vino de verdad
```bash
docker logs terrablinds_frontend --since 24h 2>&1 | grep -E "66\.249\." | grep -oE '"(GET|HEAD) [^ ]+|Googlebot|Google-InspectionTool' | paste - -
```
**Filtrar por IP `66.249.*`.** Las pruebas propias con `-A Googlebot` desde el VPS también salen como "Googlebot" y confunden. `Google-Lens` con IP de Google es alguien usando Lens, no indexación.

---

## 6. Flujos de lead y automatizaciones

### Números de WhatsApp
- **+56943449232** — bot (Meta Cloud API, phone_id `1106691139187373`, tenant `osw` en OmniFlow). Lo usa el BotWidget "💬 Chat con el bot".
- **+56998101891** — humano / cotizaciones. Lo usan el FAB, "Cotizar por WhatsApp", y "👤 Hablar con una persona".

### n8n (`n8n.conectaai.cl`, API interna `http://127.0.0.1:5678`)
```bash
KEY=$(grep N8N_API_KEY /var/www/omniflow/.env | cut -d= -f2 | head -1)
curl -s "http://127.0.0.1:5678/api/v1/executions?workflowId=<ID>&limit=5" -H "X-N8N-API-KEY: $KEY"
```
| ID | Workflow | Disparador | Hace |
|---|---|---|---|
| `B0lrKmhPFZbBjOhD` | ConectaAI — Nuevo Lead Terrablinds | `webhook_url` config (`/webhook/nuevo-lead`) | Telegram + email por MailSaaS |
| `xnT0iuwwu5ap7YNR` | Follow-up WhatsApp TerraBlinds | OmniFlow al crear contacto | WA a 10min/2h/1d/3d vía `send-followup` |
| `n8WMvyVqVj2Q9Ya0` | WhatsApp Bot Cotización | OmniFlow `whatsapp_bot_url` | Responde con IA, cotiza |
| `nILQGMEXg6feblFx` | Solicitud de Reseña Google | `review_webhook_url` config | Espera 24h, WA con `google_review_url` |
| `mNgZBuYwjH8ypTxU` | Reporte diario rastreo Google | timer systemd 09:00 CL | Telegram con visitas de `66.249.*` |

**Regla de oro:** un webhook que responde `200` **no** significa que el workflow funcionó — n8n responde al recibir y ejecuta después. Revisar `executions?status=error`. El workflow de leads falló 15/15 durante 4 días sin que nadie lo notara.

**Los nodos de email en n8n deben ser `httpRequest` a MailSaaS**, nunca `emailSend` con SMTP. Un `emailSend` con Gmail fue lo que rompió las notificaciones.

**Los nodos `Send WA *` deben enviar `{subdomain:"osw", phone, content}`** al endpoint `https://osw.conectaai.cl/api/v1/internal/whatsapp/send-followup` con header `x-api-secret`. Body vacío → 422.

### Reporte diario de rastreo
`/root/google-crawl-report.sh` → POST interno a n8n → Telegram. Timer `google-crawl-report.timer` (`OnCalendar=09:00 America/Santiago`; el cron de Ubuntu no soporta `CRON_TZ`). Log en `/var/log/google-crawl-report.log`.
```bash
systemctl status google-crawl-report.timer
systemctl start google-crawl-report.service   # forzar uno ahora
```

---

## 7. Configs (`tabla configs`, key/value)

| Clave | Uso |
|---|---|
| `webhook_url` | n8n nuevo lead |
| `review_webhook_url` | n8n review loop |
| `google_review_url` | Link `g.page/r/...` de Google Business. **Vacío = el review loop registra aviso y no envía.** |
| `logo_url` | `/logoterrablinds.webp` (12 KB; el PNG pesaba 960 KB) |
| `cat1_image`…`cat6_image` | 6 tarjetas "Soluciones" del home. **Deben estar en `PUBLIC_KEYS`** de `config.controller.js`. |
| `social_instagram`, `social_facebook` | Footer. `social_tiktok` vacío = ícono oculto. |
| `whatsapp_number`, `company_phone` | |
| `seo_title_<key>`, `seo_desc_<key>` | Overrides del prerender por página |

GA4: `G-T80KNFRWE7` en `frontend/index.html`. CSP en nginx permite `googletagmanager.com`, `google-analytics.com`, `static.cloudflareinsights.com`.

---

## 8. Cómo verificar de verdad (no la prueba obvia)

| Quiero saber | Comando / dónde | Lo que NO sirve |
|---|---|---|
| Google ve contenido | `curl -A "Google-InspectionTool/1.0"` y buscar `<h1` | `curl -A Googlebot` (pasa aunque InspectionTool falle) |
| Google vino | log nginx filtrando `66\.249\.` | contar "Googlebot" (incluye tus pruebas) |
| Un workflow n8n funciona | `executions?status=error` en la API | que el webhook devuelva 200 |
| Un archivo nuevo se sirve | `?v=$(date +%s)` en la URL | sin query (Cloudflare puede tener cacheado un 404 anterior por horas) |
| Un config llega al frontend | `curl /api/config/public \| grep clave` | verlo en la DB |
| El SW se actualizó | `navigator.serviceWorker.getRegistration()` → `scriptURL` con `?v=N` | ver el archivo en el servidor |
| Cuántas fotos cargan | JS en navegador: `[...document.querySelectorAll('img')].filter(i=>i.complete&&i.naturalWidth===0)` | mirar el screenshot (lazy loading engaña) |

**Cloudflare cachea 404s de estáticos hasta 4h.** Si subes una imagen y la pides antes de que exista, queda envenenada. Solución: nombre nuevo, o purgar en dashboard (no hay credenciales de CF en el VPS).

---

## 9. Reglas del proyecto (del dueño)

- Email **solo** por MailSaaS (`MAILSAAS_API_KEY`, `mail.conectaai.cl`). Nunca Resend, nunca SMTP Gmail. Aplica también a nodos n8n.
- **NO** borrar/recrear DB, **NO** re-ejecutar migraciones, **NO** seeds destructivos, **NO** `sync({force:true})`.
- **NO** migrar `lead.controller.js` ni `chat.controller.js` al outbox.
- Cotizaciones van al **56998101891**, no al bot.
- Hacer backup antes de tocar; los de sesión van a `/root/backups-sesion-<fecha>/` con `chmod 700`, y se borran scripts de scratch que contengan claves.
- No inventar prueba social: fotos etiquetadas por producto (se sabe), no por comuna (no se sabe).

---

## 10. Estado al 2026-09-13 y pendientes

**Hecho y verificado:**
- Google entró por primera vez el 13/09 (antes: 0 visitas en 7 días). 5 URLs probadas + indexación solicitada: `/`, `/la-serena`, `/cortinas/las-condes|vitacura|lo-barnechea`. Googlebot orgánico ya visitó `/product/7`, `/la-serena`, `/lo-barnechea` solo.
- Bundle 1.001 → 483 KB. Logo 960 → 12 KB. Hero La Serena 2.154 → 121 KB.
- 11 comunas con ~4.000 bytes cada una. Blog ↔ comunas enlazado en ambos sentidos.
- Review loop construido y activo.
- OmniFlow: escalación de privilegios cerrada, doble login puenteado, phone_id único, Resend eliminado.

**Pendiente (dueño):**
- Pegar `google_review_url` en Admin → Configuración.
- Cloudflare → Security → Events: confirmar que `66.249.*` no recibe challenge.
- Google Ads: estructura lista; el copy debe decir "5 a 7 días hábiles", no "5 días".

**Pendiente (técnico, sin urgencia):**
- GA4 Data API en el admin: código listo, falta service account desde un proyecto fuera de la org de Workspace.
- Borrar `/root/backups-sesion-2026-09-13/` cuando lleve una semana estable.
- Archivos viejos con pinta de secreto en `/root` (`docvoice_secret.txt`, `reset_passwords.sh`, `quarantine_keys/`) — no son de estas sesiones; preguntar antes de tocar.

---

## 11. Historial de intervenciones

**2026-09-12** — Auditoría inicial. Email de leads roto 4 días (nodo SMTP Gmail → MailSaaS). Soft 404 en toda URL inválida (nginx `try_files` → prerender valida y devuelve 404). Prerender con ~450 bytes → contenido real desde DB. Follow-up WA con body vacío. CSP bloqueaba Cloudflare Insights. SW mandaba visitantes offline a `/admin`; `sw.js` cacheado 1 año en CF → `no-cache` + `?v=3`. OmniFlow: `_require_admin` sin verificar rol (viewer podía crear admins); doble login; login roto por frontend compilado viejo.

**2026-09-14 (noche)** — Páginas de servicio secundario (`/cortinas-metalicas`, `/camaras`, `/control-acceso`, `/automatizacion`, `/paneles-solares`) sacadas del índice: `NOINDEX_PATHS` en seo.routes.js → `noindex, follow` en prerender + excluidas del sitemap (64 URLs). Siguen 200 para humanos. Razón: concentrar autoridad en cortinas (los competidores fuertes tipo Rolzzo se enfocan 100% en cortinas). **AggregateRating / schema de estrellas: NO montar con reseñas falsas o auto-creadas** — la tabla `reviews` está vacía; inventar reseñas = penalización manual de Google (desindex) + suspensión del Google Business Profile. El camino correcto es el review loop (workflow nILQGMEXg6feblFx) juntando reseñas reales; con 5-10 Google pone estrellas en el mapa solo, y ahí sí se puede marcar AggregateRating legítimo. Estudio de competencia (7 sitios): ninguno es SPA, todos WordPress/HTML con 2.600-13.000 palabras por home (TerraBlinds ~450 — gap de contenido es el mayor); Rolzzo (el más fuerte) NO hace páginas por comuna → las 11 landings de TerraBlinds son un diferenciador.

**2026-09-14 (tarde)** — Bug de `/api/stats/visits` (restaba integer a timestamp → ceros). Trailing slash: toda ruta con `/` final daba 404 (Googlebot pidió `/domotica/` → 404); nginx ahora 301 → sin slash. Canibalización: 5 posts de blog "Cortinas Roller [comuna]" competían con las 5 landings `/cortinas/[comuna]`; cross-canonical del post → landing (backend prerender + frontend SEO.jsx `canonical` prop + BlogPost) y excluidos del sitemap. `og:image` faltaba en home/comuna/blog (WhatsApp/FB comparten sin foto porque no ejecutan JS → dependen del prerender); ahora default `assets/la-serena/hero.webp` + og-image en todas. **Pendiente flag:** páginas de servicio secundario (`/cortinas-metalicas`, `/camaras`, `/control-acceso`, `/automatizacion`, `/paneles-solares`) tienen prerender delgado (~700 bytes) — enriquecer requiere decisión de contenido.

**2026-09-14 (mañana)** — Admin mostraba 0 visitas hoy/ayer con total 346: la consulta SQL de `stats.routes.js` restaba un entero a un `timestamp` (inválido), reventaba entera y el `catch` devolvía ceros en silencio. Nunca había funcionado. Skill creada e instalada.

**2026-09-13** — `Google-InspectionTool` fuera del bot map (causa raíz de la invisibilidad). `robots.txt` secuestrado por el bot map. Comunas enriquecidas + Colina. Blog ↔ comunas. Caché prerender. Review loop. Reporte diario. Code splitting. WebP. Catálogo con filtros en URL. `cat4–6_image` fuera de `PUBLIC_KEYS`. Galería de instalaciones en comunas. Limpieza de secretos en `/root`.
