# Guía Completa de Configuración Apollo + n8n + Supabase

## Flujos que Interactúan en el Pipeline de Apollo

```
┌─────────────────────────────────────────────────────────────────────┐
│                     PIPELINE COMPLETO DE LEADS                      │
│                                                                     │
│  ┌──────────────┐    ┌──────────────────┐    ┌──────────────────┐  │
│  │  Web Platform │───▶│  n8n Workflows   │───▶│   Apollo.io      │  │
│  │  (app.js)     │    │  (3 flujos)      │    │   (sequences)    │  │
│  └──────────────┘    └──────────────────┘    └──────────────────┘  │
│         │                     │                       │             │
│         ▼                     ▼                       ▼             │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                   Supabase (PostgreSQL)                       │  │
│  │   apollo_leads / apollo_leads_test / email_outreach_log      │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

### Los 3 Flujos de n8n

| #   | Nombre del Flujo                                 | ID en n8n          | Webhook                        | Función                                                                                                                                                                                            |
| --- | ------------------------------------------------ | ------------------ | ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **MSI Outbound Email Qualifier - Apollo Direct** | `5kPbxlaaLV517SDJ` | `/webhook/msi-outbound-email`  | Lee lead → `people/match` en Apollo → crea contacto si no existe → añade a secuencia por industria → guarda en Supabase (company_description viene del frontend, 0 créditos extra) |
| 2   | **MSI Outbound Lead Qualifier - Supabase**       | `49V4vqufnswbbBwW` | `/webhook/msi-outbound-call`   | Lee lead → llama por teléfono vía VAPI → espera resultado de la llamada → guarda calificación en Supabase                                                                                          |
| 3   | **MSI VAPI Server URL - Save Call Results**      | `nPyviJu4qpx1GYNu` | `/webhook/msi-vapi-server-url` | Recibe el end-of-call report de VAPI → extrae intención, budget, urgencia, motivación → actualiza Supabase                                                                                         |

### Cómo Interactúan

```
USUARIO en Web Platform (Leads Tab)
    │
    ├─▶ Selecciona leads → Click "Classify + Enrich"
    │       → classifyAndEnrichLeads() en app.js
    │       → Clasifica sector + genera company_description
    │       → Guarda en Supabase (apollo_leads o apollo_leads_test)
    │
    ├─▶ Selecciona leads → Click "Send Email"
    │       → sendPersonalizedEmails() en app.js
    │       → POST a /webhook/msi-outbound-email (Flujo 1)
    │       → n8n busca contacto en Apollo API
    │       → n8n añade contacto a secuencia de Apollo
    │       → Apollo envía la cadena de emails automáticamente
    │       → n8n guarda resultado en Supabase
    │
    ├─▶ Selecciona leads → Click "Call Lead" (futuro)
    │       → POST a /webhook/msi-outbound-call (Flujo 2)
    │       → n8n llama al lead vía VAPI
    │       → VAPI completa la llamada
    │       → VAPI envía report a /webhook/msi-vapi-server-url (Flujo 3)
    │       → n8n guarda calificación en Supabase
    │
    └─▶ Toggle Production / Test
            → Cambia entre apollo_leads y apollo_leads_test
            → source_table se pasa en cada webhook call
            → n8n usa source_table dinámicamente en todos los SQL
```

---

## Configuración Paso a Paso

### PASO 1: Crear Tabla de Test en Supabase

Abre **Supabase → SQL Editor** y ejecuta el contenido de:

```
migrations/migration-apollo-leads-test.sql
```

Esto crea `apollo_leads_test` con 3 registros de prueba (todos con tu email artki_64@hotmail.com).

Para producción, ejecuta también:

```
migrations/migration-outbound-qualifier.sql
```

Esto añade la columna `company_description` a `apollo_leads`.

---

### PASO 2: Configurar Apollo.io

#### 2.1 Obtener tu API Key ✅ COMPLETADO

Ya tienes tu Apollo Master API Key. Está configurada en `config.js`.

**Endpoints activos que usa el workflow (1-2 créditos por lead):**

| # | Endpoint | Créditos | Función |
|---|---|---|---|
| 1 | `api/v1/people/match` | 1 | Buscar si el contacto ya existe |
| 2 | `api/v1/contacts` (create) | 1 | Crear contacto nuevo (solo si no existe) |
| 3 | `api/v1/emailer_campaigns/{id}/add_contact_ids` | 0 | Añadir a secuencia de emails |

> **Nota:** `company_description` se genera en el frontend con datos locales (CSV/Supabase). No se usa `organizations/enrich` para ahorrar créditos.

#### 2.2 Obtener tu Email Account ID

```bash
curl -X GET "https://api.apollo.io/api/v1/email_accounts" \
  -H "Content-Type: application/json" \
  -H "X-Api-Key: TU_APOLLO_MASTER_API_KEY"
```

De la respuesta, copia el `id` de la cuenta de email que quieras usar para enviar.

#### 2.3 Crear las 12 Secuencias por Industria

En **Apollo.io → Engage → Sequences**, crea una secuencia por cada sector:

| Sector             | Nombre sugerido de secuencia                | Keyword de clasificación                           |
| ------------------ | ------------------------------------------- | -------------------------------------------------- |
| Financial Services | `MSI - Financial Services Outreach`         | financial, banking, insurance, fintech             |
| Healthcare         | `MSI - Healthcare Outreach`                 | healthcare, medical, pharma, biotech, hospital     |
| Retail             | `MSI - Retail & E-commerce Outreach`        | retail, ecommerce, e-commerce, consumer            |
| Manufacturing      | `MSI - Manufacturing Outreach`              | manufacturing, industrial, automotive              |
| Technology         | `MSI - Technology Outreach`                 | technology, software, saas, information technology |
| Energy             | `MSI - Energy & Utilities Outreach`         | energy, oil, utilities, renewable                  |
| Education          | `MSI - Education Outreach`                  | education, university, school                      |
| Legal              | `MSI - Legal Services Outreach`             | legal, law                                         |
| Real Estate        | `MSI - Real Estate & Construction Outreach` | real estate, property, construction                |
| Logistics          | `MSI - Logistics & Transport Outreach`      | logistics, transportation, shipping, supply chain  |
| Telecom            | `MSI - Telecom Outreach`                    | telecom, telecommunications                        |
| **General**        | `MSI - General Outreach`                    | _cualquier industria no clasificada_               |

Cada secuencia debe tener **4 pasos de email** (templates en `docs/EMAIL_OUTREACH_GUIDE.md`):

- **Día 1:** Intro + Research de industria
- **Día 4:** Caso de éxito relevante
- **Día 8:** Valor + caso de uso
- **Día 12:** Cierre suave

#### 2.4 Obtener los Sequence IDs

Una vez creadas las secuencias:

```bash
curl -X POST "https://api.apollo.io/api/v1/emailer_campaigns/search" \
  -H "Content-Type: application/json" \
  -d '{"api_key": "TU_APOLLO_MASTER_API_KEY"}'
```

Esto devuelve un JSON con todas tus secuencias. Copia el `id` de cada una.

#### 2.5 Reemplazar los IDs en el Workflow

En n8n, abre **"MSI Outbound Email Qualifier - Apollo Direct"** → nodo **"Enrich & Map Industry Sequence"** → edita el código JavaScript.

Reemplaza cada `SEQ_ID_*` con el ID real:

```javascript
const INDUSTRY_SEQUENCE_MAP = {
  financial: "abc123def456", // ← tu ID real de Financial
  banking: "abc123def456", // ← mismo ID (mismo sector)
  insurance: "abc123def456",
  healthcare: "ghi789jkl012", // ← tu ID real de Healthcare
  // ... etc para cada keyword
};

const DEFAULT_SEQUENCE = "xyz_general_id"; // ← tu ID de General
```

---

### PASO 3: Configurar Credenciales en n8n

#### 3.1 Crear credencial PostgreSQL (Supabase)

En **n8n → Credentials → New → PostgreSQL**:

| Campo    | Valor                                                                  |
| -------- | ---------------------------------------------------------------------- |
| Host     | `db.vahqhxfdropstvklvzej.supabase.co`                                  |
| Database | `postgres`                                                             |
| User     | `postgres`                                                             |
| Password | Tu contraseña de Supabase DB (Settings → Database → Connection String) |
| Port     | `5432`                                                                 |
| SSL      | `Allow`                                                                |

**Importante:** Copia el **Credential ID** que n8n genera.

#### 3.2 Actualizar credenciales en los 3 flujos

En cada flujo, los nodos de PostgreSQL tienen:

```json
"credentials": {
  "postgres": {
    "id": "YOUR_SUPABASE_POSTGRES_CREDENTIAL_ID",
    "name": "Supabase PostgreSQL"
  }
}
```

Reemplaza `YOUR_SUPABASE_POSTGRES_CREDENTIAL_ID` con tu credential ID real. Puedes hacerlo desde la UI de n8n (click en cada nodo → Credential → seleccionar).

#### 3.3 Actualizar Apollo API Key en nodos HTTP

En **"MSI Outbound Email Qualifier - Apollo Direct"**, estos nodos usan la API key:

- **"Match Person in Apollo"** → `api_key` en el body JSON (people/match)
- **"Create Contact in Apollo"** → `api_key` en el body
- **"Add to Apollo Sequence"** → `api_key` + `email_account_id` en el body

La API key se puede pasar de 2 formas:

1. **Desde la web** (recomendado): Se envía `apollo_api_key` en el body del webhook
2. **Hardcoded en n8n**: Reemplazar `YOUR_APOLLO_MASTER_API_KEY` directamente en cada nodo

---

### PASO 4: Configurar VAPI (para llamadas)

Solo necesario si vas a usar el Flujo 2 (llamadas telefónicas):

1. Ve a **VAPI.ai** → dashboards
2. Crea/configura un assistant con el system prompt de `docs/VAPI_OUTBOUND_CONFIG.md`
3. Obtén:
   - `VAPI_API_KEY`
   - `VAPI_ASSISTANT_ID`
   - `VAPI_PHONE_NUMBER_ID`
4. En el flujo **"MSI Outbound Lead Qualifier - Supabase"**, actualiza estos valores en los nodos correspondientes
5. En VAPI, configura el **Server URL** apuntando a: `https://n8nmsi.app.n8n.cloud/webhook/msi-vapi-server-url`

---

### PASO 5: Activar los Flujos en n8n

1. Ve a **n8n → Workflows**
2. Abre cada flujo y verifica que el toggle **Active** esté encendido:
   - ✅ MSI Outbound Email Qualifier - Apollo Direct (ya activo)
   - ⬜ MSI Outbound Lead Qualifier - Supabase (activar cuando configures VAPI)
   - ⬜ MSI VAPI Server URL - Save Call Results (activar cuando configures VAPI)

---

### PASO 6: Probar con la Tabla de Test

1. Abre tu web platform
2. Ve al **tab Leads**
3. Haz click en **"Test"** en el toggle de datasource
4. Verás los 3 leads de prueba (Swinerton, HCA Healthcare, Northrop Grumman)
5. Selecciona los 3 → Click **"Classify + Enrich"**
   - Debe asignar sector y generar company_description
6. Selecciona 1 lead → Click **"Send Email"**
   - Esto dispara el webhook a n8n
   - n8n busca/crea el contacto en Apollo con tu email artki_64@hotmail.com
   - Lo añade a la secuencia correcta
   - Recibirás el email de Apollo en tu hotmail

---

## Referencia Rápida de APIs

### Apollo API Endpoints

**✅ Activos en el workflow (3 endpoints, 1-2 créditos por lead):**

| Endpoint | Método | Créditos | Función |
|---|---|---|---|
| `api/v1/people/match` | POST | 1 | Buscar persona por email+nombre+empresa |
| `api/v1/contacts` (create) | POST | 1 | Crear contacto nuevo si no existe |
| `api/v1/emailer_campaigns/{id}/add_contact_ids` | POST | 0 | Añadir contacto a secuencia |

**📋 Disponibles en tu API (no usados actualmente):**

| Endpoint | Método | Función | Créditos |
|---|---|---|---|
| `api/v1/contacts/search` | POST | Buscar contactos (fallback) | 1 |
| `api/v1/contacts/update` | POST | Actualizar contacto | 1 |
| `api/v1/contacts/bulk_create` | POST | Crear en lote | 1/contacto |
| `api/v1/contacts/bulk_update` | POST | Actualizar en lote | 1/contacto |
| `api/v1/accounts/search` | POST | Buscar empresas | 1 |
| `api/v1/accounts/bulk_create` | POST | Crear empresas en lote | 1/cuenta |
| `api/v1/people/show` | GET | Ver detalles de persona | 1 |
| `api/v1/people/bulk_match` | POST | Match personas en lote | 1/persona |
| `api/v1/organizations/show` | GET | Ver organización | 1 |
| `api/v1/organizations/enrich` | POST | Enriquecer empresa (NO USADO - ahorra créditos) | 1 |
| `api/v1/organizations/bulk_enrich` | POST | Enriquecer en lote (NO USADO) | 1/org |
| `api/v1/emailer_campaigns/search` | POST | Listar secuencias | 0 |
| `api/v1/fields/create` | POST | Crear campos custom | 0 |

### Flujo actual del workflow:

```
people/match → contacts/create (si no existe) → emailer_campaigns/{id}/add_contact_ids
```

### Enviar lead a secuencia de Apollo (desde código)

```javascript
fetch("https://n8nmsi.app.n8n.cloud/webhook/msi-outbound-email", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    lead_id: 42,
    source_table: "apollo_leads_test", // o 'apollo_leads'
    apollo_api_key: "TU_KEY",
    apollo_email_account_id: "TU_EMAIL_ACCOUNT_ID",
    sector: "Technology",
    company_description: "Northrop Grumman - Enterprise defense contractor...",
  }),
});
```

### Verificar secuencias disponibles en Apollo

```bash
curl -X POST "https://api.apollo.io/api/v1/emailer_campaigns/search" \
  -H "Content-Type: application/json" \
  -d '{"api_key": "TU_KEY", "per_page": 50}'
```

### Verificar contactos añadidos

```bash
curl -X POST "https://api.apollo.io/api/v1/contacts/search" \
  -H "Content-Type: application/json" \
  -d '{"api_key": "TU_KEY", "q_keywords": "artki_64@hotmail.com"}'
```

---

## Checklist Final

- [ ] Tabla `apollo_leads_test` creada en Supabase SQL Editor
- [ ] Columna `company_description` añadida a `apollo_leads` (migration-outbound-qualifier.sql)
- [x] Apollo API Key obtenida y puesta en `config.js`
- [ ] Apollo Email Account ID obtenido y puesto en `config.js`
- [ ] 12 secuencias creadas en Apollo (una por industria + general)
- [ ] Sequence IDs reemplazados en nodo "Enrich & Map Industry Sequence" del flujo n8n
- [ ] Credencial PostgreSQL creada en n8n con datos de Supabase
- [ ] Credential ID actualizado en los 3 flujos de n8n
- [ ] Flujo "MSI Outbound Email Qualifier" activo en n8n
- [ ] Test exitoso: classify + enrich funciona con tabla test
- [ ] Test exitoso: enviar email usando 1 lead de test → llega a tu hotmail vía Apollo
