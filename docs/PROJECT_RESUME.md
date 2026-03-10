# MSI Automation — Project Resume Document

**Fecha:** 9 marzo 2026  
**Propósito:** Documento para retomar el proyecto en una nueva sesión de IA. Contiene TODO lo necesario para continuar sin perder contexto.

---

## 1. Resumen del Proyecto

Plataforma de automatización de marketing y ventas para **MSI Technologies Inc.** que incluye:

- **Plataforma Web** (HTML/JS/CSS vanilla): Gestión de contenido, generación IA, visor de leads, email outreach
- **n8n Cloud** (n8nmsi.app.n8n.cloud): ~10 workflows de automatización  
- **Supabase** (PostgreSQL): Base de datos central
- **Apollo.io**: Plataforma de email outreach con secuencias automatizadas
- **VAPI**: Llamadas outbound con IA

---

## 2. Credenciales y IDs Críticos

### Supabase
- **URL:** `https://vahqhxfdropstvklvzej.supabase.co`
- **Anon Key:** `sb_publishable_xt7qY64rVMowaSris2Zs0Q_2DEbzjpy`

### Apollo.io
- **Master API Key:** `WBreK4EvRiZzu94EZREXEg` (Organization plan — acceso completo)
- **Email Account Principal (nataly):** `69811149b1906a001958f14e` — nataly.riano@msitechnologiesinc.com
- **Otras cuentas email:**
  - ginaldo.pereira: `69974f5c32102f000d273440`
  - christian.cabascango: `69a9f3a210753f001d6d00e1`
  - viviana.zapata: `698cf5b216217d00122df2af`
- **Sequence "n8n":** `69b079b6b9abc50011ba97e3` (3 steps, active)
- **Sequence en config.js:** `69ab30527082df0019ff9a64` (Nataly's Outbound AI Sequence 1)

### n8n Cloud
- **URL:** `https://n8nmsi.app.n8n.cloud`
- **Credenciales JWT:** `C:/Users/artki/AppData/Roaming/n8nac-nodejs/Config/credentials.json`
  - Key es `hosts["https://n8nmsi.app.n8n.cloud"]`
- **API de n8n:** Usa método **PUT** (no PATCH) para actualizar workflows
- **Workflow Email Outreach ID:** `5kPbxlaaLV517SDJ`

### GitHub
- **Repo:** `AEVProjects/borrar2`, branch `main`
- **Último commit:** `bc3ce1f`

---

## 3. Arquitectura del Flujo de Email Outreach (ACTUAL)

### Estrategia: CSV Import + Apollo Sequences

Se abandonó la idea de enviar emails vía API directamente. El flujo actual es:

```
1. Leads en Supabase (tabla apollo_leads o apollo_leads_test)
   ↓
2. Web UI muestra leads con clasificación de sector + descripción de empresa
   ↓
3. Usuario selecciona leads → click "Download CSV" 
   ↓
4. CSV con 17 columnas se descarga (incluye Personalized Message + Personalized Followup)
   ↓
5. Usuario importa CSV en Apollo.io web → agrega a secuencia "n8n"
   ↓
6. Apollo envía secuencia de 3 emails automáticamente usando los custom variables
```

### Secuencia "n8n" — 3 Pasos (Expert Sales Framework)

| Step | Tipo | Timing | Asunto | Framework |
|------|------|--------|--------|-----------|
| 1 | new_thread | Inmediato | "quick question, {{first_name}}" | Pain→Insight: usa `{{personalized_message}}` |
| 2 | reply_to_thread | +3 días | (reply) | Proof→Value: usa `{{personalized_followup}}` |
| 3 | reply_to_thread | +3 días | (reply) | Breakup: ultra-corto, zero pressure |

**Touch IDs:**
- Step 1: `69b079b6b9abc50011ba97e6` (template: `69b079b6b9abc50011ba97e5`)
- Step 2: `69b079b6b9abc50011ba97e9` (template: `69b079b6b9abc50011ba97e8`)
- Step 3: `69b079b6b9abc50011ba97ec` (template: `69b079b6b9abc50011ba97eb`)

**Custom Variables en Apollo:**
- `{{personalized_message}}` — Mensaje personalizado generado por IA (primer email)
- `{{personalized_followup}}` — Followup personalizado (segundo email)

### Templates Actuales (resumido)

**Step 1 — Pain→Insight:**
> Hi {{first_name}},
> {{personalized_message}}
> We've been helping {{industry}} companies solve exactly this—typically cutting implementation time by 40% and reducing security incidents significantly.
> Worth a quick look? I can send over a relevant example.
> Best, Nataly

**Step 2 — Proof→Value:**
> {{first_name}},
> {{personalized_followup}}
> Happy to share the details if it's relevant to what you're working on at {{company}}.
> — Nataly

**Step 3 — Breakup:**
> {{first_name}} — totally understand if the timing isn't right.
> If tech infrastructure or security ever moves up the priority list at {{company}}, feel free to reply to this thread. I'll be here.
> All the best, Nataly

---

## 4. Archivos Clave y Su Estado

### config.js
- Configuración central del frontend (window.APP_CONFIG)
- Contiene: Supabase URL/key, todos los webhooks n8n, Apollo API key + sequence ID + email account ID, Google project ID
- **Estado:** ✅ Actualizado con master key y IDs correctos

### app.js (Módulo de Leads: ~líneas 6060-6730)
- Funciones principales:
  - `downloadApolloCSV()` — Exporta leads seleccionados a CSV con 17 columnas
  - `classifyAndEnrichLeads()` — Clasifica sector y genera descripción via webhook n8n
  - `buildCompanyDescription()` — Genera descripción de empresa desde campos del lead
  - `classifySector(industry)` — Mapeo industria → sector MSI
- **Lo que se ELIMINÓ:** `openEmailModal()` y `sendPersonalizedEmails()` (~168 líneas)
- **Estado:** ✅ Actualizado, CSV download funcional

### index.html
- Botón "Download CSV" (ícono download) reemplazó botón "Apollo Sequence"
- El modal de email sigue en el HTML pero ya no está conectado a JS
- **Estado:** ✅ Funcional, pendiente limpieza del modal HTML sobrante

### Outbound Email Qualifier - Supabase.json
- Workflow n8n para agregar leads a secuencia Apollo via API (alternativa al CSV)
- **16 nodos:** Webhook → Read Lead → Map Lead Data → Has Email? → Match Person → Check Contact → Contact in Apollo? → Create Contact → Get Contact ID → Add to Sequence → Log to Supabase + Insert Outreach Log → Respond Success/Error
- **Pendiente:** Tiene `YOUR_SUPABASE_POSTGRES_CREDENTIAL_ID` en 4 nodos Postgres
- **Pendiente:** Tiene `YOUR_APOLLO_MASTER_API_KEY` en nodos HTTP (se puede pasar por webhook body)
- **Estado:** ⚠️ Funcional en estructura pero necesita credential IDs reales

---

## 5. Tablas de Base de Datos Relevantes

### apollo_leads (principal)
- Tabla principal de leads importados desde CSV de Apollo
- ~4798 leads actuales
- Columnas clave: first_name, last_name, email, title, company_name, industry, sector, company_description, personalized_message, personalized_followup, email_outreach_status, apollo_contact_id, etc.

### apollo_leads_test (testing)
- 3 filas de prueba creadas para testing
- Misma estructura que apollo_leads

### email_outreach_log
- Log de todos los outreach enviados
- Columnas: lead_id, to_email, to_name, company, service, subject, body, status, source_table

### Migraciones pendientes (posiblemente necesarias):
```sql
-- Si las columnas no existen aún en la tabla:
ALTER TABLE apollo_leads ADD COLUMN IF NOT EXISTS personalized_message TEXT;
ALTER TABLE apollo_leads ADD COLUMN IF NOT EXISTS personalized_followup TEXT;
ALTER TABLE apollo_leads_test ADD COLUMN IF NOT EXISTS personalized_message TEXT;
ALTER TABLE apollo_leads_test ADD COLUMN IF NOT EXISTS personalized_followup TEXT;
```

---

## 6. Webhooks n8n (del config.js)

| Webhook | URL Path | Propósito |
|---------|----------|-----------|
| emailOutreachWebhook | /webhook/msi-outbound-email | Email outreach via n8n (alternativa a CSV) |
| linkedinToApolloWebhook | /webhook/msi-linkedin-to-apollo | LinkedIn → Apollo pipeline |
| linkedinSearchWebhook | /webhook/msi-linkedin-search | Búsqueda LinkedIn (Google CSE gratis) |
| profileScraperWebhook | /webhook/msi-profile-scraper | Scraping de perfiles |
| generateWebhook | /webhook/70738d02... | Generación de contenido |
| carouselWebhook | /webhook/msi-carousel-v12 | Carouseles |
| videoWebhook | /webhook/msi-video-gen | Videos |
| publishWebhook | /webhook/025d6de3... | Publicación multi-plataforma |
| dailyWebhook | /webhook/msi-auto-daily | Auto Daily Generator |

---

## 7. Qué Está COMPLETADO ✅

1. ✅ Apollo Master API Key configurada y validada (Organization plan, acceso completo)
2. ✅ Simplificación a una sola secuencia (no por industria)
3. ✅ Templates de email de la secuencia "n8n" actualizados (3 pasos, framework de ventas experto)
4. ✅ Custom variables: `{{personalized_message}}` y `{{personalized_followup}}` 
5. ✅ Función `downloadApolloCSV()` con 17 columnas incluyendo personalized_message y personalized_followup
6. ✅ Eliminación del modal de email y función sendPersonalizedEmails
7. ✅ Workflow n8n actualizado (16 nodos, secuencia única, "Map Lead Data")
8. ✅ Push a GitHub (commit bc3ce1f) y a n8n Cloud
9. ✅ 4 cuentas de email activas verificadas en Apollo
10. ✅ Toda la plataforma de contenido (posts, carouseles, videos, scheduling) funcional
11. ✅ VAPI outbound caller configurado
12. ✅ LinkedIn lead search via Google CSE (gratis)

---

## 8. Qué Está PENDIENTE ⏳

### Prioridad Alta
1. **Supabase Postgres Credential en n8n:** 4 nodos del workflow "Outbound Email Qualifier" tienen `YOUR_SUPABASE_POSTGRES_CREDENTIAL_ID`. Hay que crear el credential en n8n Cloud y actualizar los IDs.
2. **Columnas DB:** Verificar/crear columnas `personalized_message` y `personalized_followup` en tablas `apollo_leads` y `apollo_leads_test`.
3. **Generación de mensajes personalizados:** Falta implementar la lógica que genera `personalized_message` y `personalized_followup` para cada lead (probablemente un workflow n8n con GPT-4o que analice el lead y genere el mensaje).

### Prioridad Media
4. **Test end-to-end:** Probar con los 3 leads de `apollo_leads_test` el flujo completo (CSV download → import a Apollo → verificar que los custom variables llegan).
5. **Limpiar modal HTML:** Eliminar el HTML del modal de email sobrante en index.html.
6. **Actualizar docs:** EMAIL_OUTREACH_GUIDE.md está DESACTUALIZADO (aún tiene las 12 secuencias por industria). Actualizar para reflejar la arquitectura actual de secuencia única + CSV.
7. **Apollo API Key en workflow:** Los nodos HTTP del workflow tienen `YOUR_APOLLO_MASTER_API_KEY` — actualmente se pasa por webhook body pero podría hardcodearse.

### Prioridad Baja
8. **Rotación de sender:** Actualmente solo envía desde nataly. Configurar rotación entre las 4 cuentas de email.
9. **Métricas de outreach:** Dashboard para ver tasas de apertura/respuesta de las secuencias.
10. **Automatización completa:** Workflow que tome leads → genere mensajes IA → exporte CSV → (opcionalmente) agregue a secuencia via API sin intervención manual.

---

## 9. Estructura del Proyecto

```
borrar2/
├── app.js              ← Frontend JS principal (~7000 líneas)
├── config.js           ← Credenciales y webhooks (NO se sube a Git)
├── config.example.js   ← Template de config (sin secrets)
├── index.html          ← UI principal
├── styles.css          ← Estilos
├── package.json        ← Dependencias (mínimas, es frontend)
├── vercel.json         ← Config deploy Vercel
├── api/
│   └── health.js       ← Health check API
├── data/
│   ├── Apollo List.csv ← CSV de leads Apollo importados
│   └── seguidores.json
├── docs/               ← Documentación (14 archivos)
│   ├── APOLLO_SETUP_GUIDE.md    ← Guía completa Apollo
│   ├── EMAIL_OUTREACH_GUIDE.md  ← ⚠️ DESACTUALIZADO (12 secuencias)
│   ├── FLOW_ARCHITECTURE.md     ← Arquitectura de flujos
│   ├── HITOS.md                 ← Timeline del proyecto
│   ├── PROJECT_RESUME.md        ← ESTE ARCHIVO
│   └── ... (9 docs más)
├── migrations/         ← SQL migrations para Supabase
├── scripts/            ← Scripts utilitarios
└── workflows/          ← Workflows n8n exportados (TypeScript)
```

---

## 10. Comandos Útiles

### Verificar API key de Apollo
```bash
node -e "fetch('https://api.apollo.io/api/v1/email_accounts',{headers:{'X-Api-Key':'WBreK4EvRiZzu94EZREXEg'}}).then(r=>r.json()).then(d=>console.log(d.email_accounts?.map(a=>a.email)))"
```

### Ver secuencia "n8n" en Apollo
```bash
node -e "fetch('https://api.apollo.io/api/v1/emailer_campaigns/69b079b6b9abc50011ba97e3',{headers:{'X-Api-Key':'WBreK4EvRiZzu94EZREXEg'}}).then(r=>r.json()).then(d=>console.log(JSON.stringify(d.emailer_campaign,null,2)))"
```

### Push workflow a n8n Cloud
```javascript
// Leer JWT de credentials
const creds = JSON.parse(fs.readFileSync('C:/Users/artki/AppData/Roaming/n8nac-nodejs/Config/credentials.json'));
const jwt = creds.hosts['https://n8nmsi.app.n8n.cloud'];
// PUT (no PATCH)
fetch('https://n8nmsi.app.n8n.cloud/api/v1/workflows/5kPbxlaaLV517SDJ', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${jwt}` },
  body: JSON.stringify(workflowData)
});
```

### Push a GitHub
```bash
cd C:\Users\artki\borrar2
git add -A; git commit -m "mensaje"; git push origin main
```

---

## 11. Notas Importantes para la Próxima Sesión

1. **PowerShell en Windows:** El alias `curl` en PowerShell NO es curl real. Usar `node -e "..."` con fetch() para llamadas API.
2. **n8n API:** Usa PUT (no PATCH) para actualizar workflows. PATCH devuelve 405.
3. **Apollo API vieja key:** `KkD52w22vM2g979cPcOaXA` era Basic tier — NO usar. Solo usar `WBreK4EvRiZzu94EZREXEg`.
4. **Config.js NO se sube a Git** (está en .gitignore). El template es config.example.js.
5. **EMAIL_OUTREACH_GUIDE.md está DESACTUALIZADO.** Usar este documento como referencia actual.
6. **El workflow n8n también puede agregar leads a secuencias via API** (no solo CSV). El webhook es `/webhook/msi-outbound-email`. Pero la estrategia principal actual es CSV import manual.
7. **Secuencia en config.js** (`69ab30527082df0019ff9a64`) es diferente a la secuencia "n8n" (`69b079b6b9abc50011ba97e3`). Verificar cuál es la activa antes de seguir.

---

*Documento generado el 9 de marzo de 2026 para continuidad del proyecto MSI Automation.*
