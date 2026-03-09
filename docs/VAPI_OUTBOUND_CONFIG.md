# VAPI Outbound Lead Qualifier - Configuration Guide

## Overview

This document explains how to configure your VAPI assistant to work with the MSI Outbound Lead Qualifier workflow, so it properly collects and returns qualification data to your Supabase database.

---

## 1. First Message (lo que dice al contestar)

In your VAPI assistant dashboard, set the **First Message** to:

```
Hi, is this {{lead_first_name}}? Hey {{lead_first_name}}, this is Alex from MSI Technologies. I'm reaching out because I noticed your company {{lead_company_name}} has been looking into {{lead_intent_topic}} and I wanted to see if there's anything we could help with on the technology side. Do you have a quick minute?
```

> **Nota:** En VAPI Dashboard → Assistant → **Transcriber** section → campo **"First Message"**. Este es el primer mensaje que el asistente dice en cuanto conecta la llamada. Las variables `{{lead_first_name}}`, `{{lead_company_name}}` y `{{lead_intent_topic}}` se reemplazan automáticamente con los valores que pasa n8n.

**Variante alternativa (más corta):**

```
Hi, may I speak with {{lead_first_name}}? This is Alex calling from MSI Technologies — we specialize in technology and talent solutions. I just wanted to have a quick chat about how things are going at {{lead_company_name}}. Is now a good time?
```

**Variante si no hay intent_topic disponible:**

```
Hi, is this {{lead_first_name}}? Hey, this is Alex from MSI Technologies. We help companies like {{lead_company_name}} in the {{lead_industry}} space with cloud, cybersecurity, and IT talent solutions. I wanted to reach out and see if there's anything we could help you with. Got a minute?
```

---

## 2. System Prompt for VAPI Assistant

Copy this system prompt into your VAPI assistant configuration:

```
You are an AI sales development representative calling on behalf of MSI Technologies. Your goal is to qualify the lead by gathering key information during a natural conversation.

## Context about the lead (provided as variables):
- Name: {{lead_name}}
- Title: {{lead_title}}
- Company: {{lead_company_name}}
- Industry: {{lead_industry}}
- Company Size: {{lead_num_employees}} employees
- Location: {{lead_city}}, {{lead_state}}, {{lead_country}}
- Website: {{lead_website}}
- Annual Revenue: {{lead_annual_revenue}}
- Technologies they use: {{lead_technologies}}
- Intent Topic: {{lead_intent_topic}} (Score: {{lead_intent_score}})

## Your conversation goals (in order of priority):
1. **Confirm identity** - Verify you're speaking with {{lead_first_name}} {{lead_last_name}} (the right person / decision maker)
2. **Gauge interest** - Understand their interest in technology services (Cloud, Cybersecurity, Consulting, Talent/Outsourcing)
3. **Discover motivation** - What's driving their need? (growth, cost reduction, security concerns, compliance, modernization)
4. **Assess urgency** - How soon do they need a solution? (immediately, 1-3 months, 3-6 months, exploring)
5. **Understand budget** - Do they have a budget allocated? What range?
6. **Evaluate intention** - Are they actively evaluating vendors, just researching, or have a specific project?
7. **Past experience** — Have they worked with similar service providers before? What was their experience?

## MSI Technologies Services (for reference):
- **Cloud Computing**: Infrastructure modernization, cloud migration, data management
- **Cybersecurity**: Advanced protection, threat management, compliance training
- **Executive Consulting**: M&A strategy, IT strategy, leadership & governance
- **Talent Management**: Staff augmentation, IT outsourcing, dedicated teams (nearshore)
- **Software Development**: Custom applications, system integration, API development
- **Telecommunications**: Network solutions, VoIP, unified communications

## Conversation guidelines:
- Be professional, warm, and conversational — NOT robotic
- Use the lead's first name naturally
- Reference their company and industry to show you've done your research
- Don't ask all questions at once — have a natural flow
- If they seem disinterested, gracefully wrap up and thank them
- If they're interested, suggest scheduling a follow-up with a human consultant
- Keep the call under 5 minutes unless they're very engaged
- Speak in English unless the lead responds in Spanish (then switch to Spanish)
```

---

## 3. VAPI Structured Outputs Configuration

In your VAPI assistant dashboard, go to **Analysis > Structured Data** and add these extraction fields:

### Field 1: `intention`

- **Name**: `intention`
- **Description**: `The lead's purchase/engagement intention level based on the conversation`
- **Type**: `string`
- **Schema/Prompt**:

```
Classify the lead's intention based on the conversation:
- "high" - Actively looking for a solution, ready to engage
- "medium" - Interested but still evaluating options
- "low" - Mildly curious, no immediate plans
- "none" - Not interested at all
- "unknown" - Could not determine (e.g., wrong person, call too short)
```

### Field 2: `budget`

- **Name**: `budget`
- **Description**: `Budget range or financial capacity mentioned during the call`
- **Type**: `string`
- **Schema/Prompt**:

```
Extract budget information from the conversation. Return one of:
- Specific amount mentioned (e.g., "$50,000-100,000")
- "has_budget" - They confirmed they have budget but didn't specify
- "exploring" - They're exploring but no budget allocated yet
- "no_budget" - Explicitly said no budget
- "not_discussed" - Budget was not discussed
```

### Field 3: `urgency`

- **Name**: `urgency`
- **Description**: `How urgently the lead needs a solution`
- **Type**: `string`
- **Schema/Prompt**:

```
Classify the urgency level:
- "immediate" - Need something within 1 month
- "short_term" - Need within 1-3 months
- "medium_term" - Need within 3-6 months
- "long_term" - More than 6 months out
- "exploring" - Just exploring, no timeline
- "not_discussed" - Urgency was not discussed
```

### Field 4: `motivation`

- **Name**: `motivation`
- **Description**: `The primary motivation or pain point driving the lead's interest`
- **Type**: `string`
- **Schema/Prompt**:

```
Summarize the lead's main motivation or pain point in 1-2 sentences. Common motivations include:
- Business growth / scaling
- Cost reduction / optimization
- Security concerns / compliance requirements
- Digital transformation / modernization
- Talent shortage / staffing needs
- Competitive pressure
If no motivation was discussed, return "not_discussed"
```

### Field 5: `service_interest`

- **Name**: `service_interest`
- **Description**: `The specific MSI Technologies service the lead showed interest in`
- **Type**: `string`
- **Schema/Prompt**:

```
Identify which MSI service(s) the lead showed interest in:
- "cloud" - Cloud computing, migration, infrastructure
- "cybersecurity" - Security, threat management, compliance
- "consulting" - Strategy, M&A, governance
- "talent" - Staff augmentation, outsourcing, dedicated teams
- "software" - Custom development, integration
- "telecom" - Network, VoIP, unified communications
- "multiple" - Interested in more than one area (list them)
- "general" - Interested but didn't specify a service
- "not_interested" - Not interested in any service
```

### Field 6: `right_person`

- **Name**: `right_person`
- **Description**: `Whether the person who answered is the intended contact / decision maker`
- **Type**: `string`
- **Schema/Prompt**:

```
Determine if we spoke with the right person:
- "yes" - Confirmed they are the intended contact and a decision maker
- "yes_not_decision_maker" - Right person but not the final decision maker
- "no" - Wrong person answered (receptionist, assistant, etc.)
- "no_answer" - Nobody answered or went to voicemail
- "unknown" - Could not confirm identity
```

### Field 7: `past_experience`

- **Name**: `past_experience`
- **Description**: `The lead's previous experience with similar technology service providers`
- **Type**: `string`
- **Schema/Prompt**:

```
Summarize the lead's past experience with technology service providers in 1-2 sentences.
Include: provider names mentioned, satisfaction level, what they liked/disliked.
If not discussed, return "not_discussed"
```

### Field 8: `call_summary`

- **Name**: `call_summary`
- **Description**: `A comprehensive summary of the entire call conversation`
- **Type**: `string`
- **Schema/Prompt**:

```
Provide a concise but comprehensive summary of the call (3-5 sentences). Include:
- Who answered and their reaction
- Key topics discussed
- Main objections or concerns raised
- Any next steps agreed upon
- Overall impression of the lead's potential
```

---

## 4. VAPI Analysis Configuration

In addition to structured outputs, enable these in **Analysis**:

### Summary Prompt

```
Provide a brief 2-sentence summary of this sales qualification call.
Focus on the lead's level of interest and any concrete next steps discussed.
```

### Success Evaluation Prompt

```
Evaluate if this call was successful in qualifying the lead.
A successful call means we: 1) spoke to the right person, 2) gauged their interest level,
3) identified at least one service they're interested in, 4) understood their timeline.
Return "true" if at least 3 of 4 criteria were met, "false" otherwise.
```

---

## 5. VAPI Variable Values (passed from n8n)

The workflow passes these variables to VAPI. They're available in your system prompt as `{{variable_name}}`:

| Variable              | Source Column            | Description             |
| --------------------- | ------------------------ | ----------------------- |
| `lead_id`             | `id`                     | Database ID for updates |
| `lead_name`           | `first_name + last_name` | Full name               |
| `lead_first_name`     | `first_name`             | First name              |
| `lead_last_name`      | `last_name`              | Last name               |
| `lead_title`          | `title`                  | Job title               |
| `lead_company_name`   | `company_name`           | Company                 |
| `lead_email`          | `email`                  | Email address           |
| `lead_industry`       | `industry`               | Industry                |
| `lead_num_employees`  | `num_employees`          | Company size            |
| `lead_seniority`      | `seniority`              | Seniority level         |
| `lead_city`           | `city`                   | City                    |
| `lead_state`          | `state`                  | State/Province          |
| `lead_country`        | `country`                | Country                 |
| `lead_website`        | `website`                | Company website         |
| `lead_annual_revenue` | `annual_revenue`         | Annual revenue          |
| `lead_technologies`   | `technologies`           | Tech stack              |
| `lead_intent_topic`   | `primary_intent_topic`   | Apollo intent           |
| `lead_intent_score`   | `primary_intent_score`   | Apollo intent score     |

---

## 6. Phone Number Priority

The workflow tries phone numbers in this order:

1. `work_direct_phone` (best for B2B)
2. `mobile_phone`
3. `home_phone`
4. `corporate_phone`
5. `other_phone`
6. `company_phone`

---

## 7. How to Trigger Calls

### Single Lead

```bash
curl -X POST https://n8nmsi.app.n8n.cloud/webhook/msi-outbound-call \
  -H "Content-Type: application/json" \
  -d '{"lead_id": 42}'
```

### From PowerShell

```powershell
$payload = @{ lead_id = 42 } | ConvertTo-Json
Invoke-RestMethod -Uri "https://n8nmsi.app.n8n.cloud/webhook/msi-outbound-call" `
  -Method POST -ContentType "application/json" -Body $payload
```

### Batch Calling (call multiple leads)

Create a separate n8n workflow that:

1. Queries Supabase: `SELECT id FROM apollo_leads WHERE call_status = 'pending' LIMIT 10`
2. Loops through results
3. For each, triggers this webhook with `{ "lead_id": <id> }`
4. Adds a Wait node between calls (e.g., 2 minutes) to avoid VAPI rate limits

---

## 8. Database Columns Reference

After a call completes, these columns are populated in `apollo_leads`:

| Column                  | Type      | Description                                                                   |
| ----------------------- | --------- | ----------------------------------------------------------------------------- |
| `call_intention`        | text      | high/medium/low/none/unknown                                                  |
| `call_budget`           | text      | Budget range or status                                                        |
| `call_urgency`          | text      | immediate/short_term/medium_term/long_term/exploring                          |
| `call_motivation`       | text      | Main pain point or driver                                                     |
| `call_status`           | text      | pending/calling/completed/voicemail/no_answer/incorrect_phone/callback/failed |
| `call_service_interest` | text      | MSI service they're interested in                                             |
| `call_right_person`     | boolean   | True if decision maker confirmed                                              |
| `call_past_experience`  | text      | Previous vendor experience                                                    |
| `call_summary`          | text      | AI-generated call summary                                                     |
| `call_transcript`       | text      | Full conversation transcript                                                  |
| `vapi_call_id`          | text      | VAPI call reference ID                                                        |
| `call_ended_reason`     | text      | How the call ended                                                            |
| `call_duration_seconds` | integer   | Call length                                                                   |
| `call_attempts`         | integer   | Number of call attempts                                                       |
| `call_date`             | timestamp | When the call was made                                                        |
| `updated_at`            | timestamp | Last update time                                                              |

---

## 9. Querying Qualified Leads

### Hot Leads (high intention + has budget + urgent)

```sql
SELECT first_name, last_name, company_name, email,
       call_intention, call_budget, call_urgency, call_service_interest
FROM apollo_leads
WHERE call_status = 'completed'
  AND call_intention = 'high'
  AND call_urgency IN ('immediate', 'short_term')
  AND call_budget != 'no_budget'
ORDER BY call_date DESC;
```

### Leads to Call Back

```sql
SELECT * FROM apollo_leads
WHERE call_status IN ('voicemail', 'no_answer', 'callback')
  AND call_attempts < 3
ORDER BY call_date ASC;
```

### Leads by Service Interest

```sql
SELECT call_service_interest, COUNT(*) as total,
       COUNT(*) FILTER (WHERE call_intention = 'high') as hot_leads
FROM apollo_leads
WHERE call_status = 'completed'
GROUP BY call_service_interest
ORDER BY hot_leads DESC;
```

---

## 10. Testear desde VAPI Dashboard (conectar a tu BD)

Para probar llamadas desde la web de VAPI y que los resultados se guarden en tu Supabase, necesitas configurar 3 cosas:

### Paso 1: Importar el workflow "MSI VAPI Server URL" en n8n

1. En n8n → Import Workflow → sube `MSI VAPI Server URL.json`
2. Configura la credencial **PostgreSQL** apuntando a tu Supabase:
   - Host: `db.vahqhxfdropstvklvzej.supabase.co`
   - Port: `5432`
   - Database: `postgres`
   - User: `postgres`
   - Password: tu password de Supabase
   - SSL: `true`
3. **Activa el workflow** (debe estar activo para recibir eventos de VAPI)

### Paso 2: Configurar Server URL en VAPI

1. Ve a **VAPI Dashboard** → **Account Settings** (icono de engrane arriba a la derecha)
2. En la sección **"Server URL"** pega:
   ```
   https://n8nmsi.app.n8n.cloud/webhook/msi-vapi-server-url
   ```
3. Guarda los cambios

> Esto hace que VAPI envíe **todos los eventos** (inicio de llamada, fin de llamada, tool calls) a tu n8n, que luego los procesa y guarda en Supabase.

### Paso 3: Configurar Custom Tool "lookupLead" en VAPI

Esto permite que VAPI busque datos del lead en tu BD **durante la llamada**:

1. En VAPI Dashboard → tu Assistant → **Tools** section
2. Click **Add Tool** → Select **Custom Tool (Server)**
3. Configura:

**Name:** `lookupLead`

**Description:**

```
Fetches lead information from the database. Use this at the start of the call to get context about who you're calling. Call this tool with the lead_id that was provided in the conversation variables.
```

**Parameters (JSON Schema):**

```json
{
  "type": "object",
  "properties": {
    "lead_id": {
      "type": "number",
      "description": "The database ID of the lead to look up"
    }
  },
  "required": ["lead_id"]
}
```

> No necesitas configurar URL en el tool — VAPI usa el **Server URL** global que ya configuraste en el Paso 2.

### Paso 4: Configurar Variables de Test

Cuando hagas test desde VAPI Dashboard:

1. Ve a tu **Assistant** → Click **"Test"** (botón de teléfono)
2. Antes de llamar, ve a **Assistant Overrides** o **Variable Values**
3. Agrega las variables con datos reales de un lead de tu BD:

```json
{
  "lead_id": "42",
  "lead_name": "John Smith",
  "lead_first_name": "John",
  "lead_last_name": "Smith",
  "lead_title": "CTO",
  "lead_company_name": "Acme Corp",
  "lead_email": "john@acme.com",
  "lead_industry": "Technology",
  "lead_num_employees": "50",
  "lead_seniority": "C-Suite",
  "lead_city": "Austin",
  "lead_state": "Texas",
  "lead_country": "United States",
  "lead_website": "https://acme.com",
  "lead_annual_revenue": "$5M",
  "lead_technologies": "AWS, Salesforce",
  "lead_intent_topic": "cloud migration",
  "lead_intent_score": "85"
}
```

> **Tip:** Para obtener estos datos de un lead real, ejecuta en Supabase SQL Editor:
>
> ```sql
> SELECT id, first_name, last_name, title, company_name, email,
>        industry, num_employees, seniority, city, state, country,
>        website, annual_revenue, technologies,
>        primary_intent_topic, primary_intent_score
> FROM apollo_leads
> WHERE email IS NOT NULL
> LIMIT 5;
> ```

### Paso 5: Hacer el Test

1. En VAPI Dashboard → Assistant → **Test Call**
2. Habla con el asistente como si fueras el lead
3. Cuando termines la llamada, VAPI envía el **end-of-call-report** a tu n8n
4. n8n extrae los structured outputs y los guarda en `apollo_leads`
5. Verifica en Supabase:
   ```sql
   SELECT id, first_name, last_name, call_status, call_intention,
          call_budget, call_urgency, call_motivation,
          call_service_interest, call_right_person, call_summary
   FROM apollo_leads
   WHERE id = 42;
   ```

### Flujo completo de eventos:

```
[VAPI Dashboard Test Call]
    │
    ├── assistant-request    → n8n: Acknowledge
    ├── tool-calls (lookupLead) → n8n: Fetch lead from Supabase → Return to VAPI
    ├── (conversación...)
    └── end-of-call-report   → n8n: Extract structured data → Save to Supabase
```

### Troubleshooting:

| Problema                  | Solución                                                                                                              |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| VAPI no envía datos       | Verifica que el workflow en n8n esté **activo**                                                                       |
| Structured outputs vacíos | Revisa que configuraste los 8 campos en VAPI → Analysis → Structured Data                                             |
| No se guarda en Supabase  | Revisa que el `lead_id` en las variables de test coincida con un ID real en `apollo_leads`                            |
| Error de SQL              | Revisa los logs de ejecución en n8n → Executions                                                                      |
| Tool call falla           | Verifica la credencial PostgreSQL en n8n y que la tabla `apollo_leads` tenga las columnas nuevas (corre la migración) |
