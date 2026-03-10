import { workflow, node, links } from '@n8n-as-code/transformer';

// <workflow-map>
// Workflow : MSI Outbound Lead Qualifier - Supabase
// Nodes   : 24  |  Connections: 23
//
// NODE INDEX
// ──────────────────────────────────────────────────────────────────
// Property name                    Node type (short)         Flags
// WebhookTrigger                     webhook
// ReadLeadFromSupabase               postgres                   [creds]
// StandardizeEnrichData              code
// PhoneValid                         if
// HasPhone                           if
// LogIncorrectPhone                  postgres                   [creds]
// LogNoPhone                         postgres                   [creds]
// SetStatusCalling                   postgres                   [creds]
// CallLeadViaVapi                    httpRequest                [creds]
// Wait60s                            wait
// GetCallDetails                     httpRequest                [creds]
// Limit                              limit
// CallEnded                          if
// Polling10s                         wait
// Voicemail                          if
// NoAnswer                           if
// LogVoicemailToSupabase             postgres                   [creds]
// LogNoAnswerToSupabase              postgres                   [creds]
// ExtractCallQualificationData       code
// SaveQualificationToSupabase        postgres                   [creds]
// RespondSuccess                     respondToWebhook
// RespondPhoneError                  respondToWebhook
// SetupGuide                         stickyNote
// CallFlowDiagram                    stickyNote
//
// ROUTING MAP
// ──────────────────────────────────────────────────────────────────
// WebhookTrigger
//    → ReadLeadFromSupabase
//      → StandardizeEnrichData
//        → HasPhone
//          → LogNoPhone
//            → RespondPhoneError
//         .out(1) → PhoneValid
//            → LogIncorrectPhone
//              → RespondPhoneError (↩ loop)
//           .out(1) → SetStatusCalling
//              → CallLeadViaVapi
//                → Wait60s
//                  → GetCallDetails
//                    → Limit
//                      → CallEnded
//                        → Voicemail
//                          → NoAnswer
//                            → LogNoAnswerToSupabase
//                           .out(1) → LogVoicemailToSupabase
//                         .out(1) → ExtractCallQualificationData
//                            → SaveQualificationToSupabase
//                              → RespondSuccess
//                       .out(1) → Polling10s
//                          → GetCallDetails (↩ loop)
// </workflow-map>

// =====================================================================
// METADATA DU WORKFLOW
// =====================================================================

@workflow({
    id: '49V4vqufnswbbBwW',
    name: 'MSI Outbound Lead Qualifier - Supabase',
    active: true,
    settings: { executionOrder: 'v1', availableInMCP: false, callerPolicy: 'workflowsFromSameOwner' },
})
export class MsiOutboundLeadQualifierSupabaseWorkflow {
    // =====================================================================
    // CONFIGURATION DES NOEUDS
    // =====================================================================

    @node({
        name: 'Webhook Trigger',
        type: 'n8n-nodes-base.webhook',
        version: 2,
        position: [-160, 0],
    })
    WebhookTrigger = {
        httpMethod: 'POST',
        path: 'msi-outbound-call',
        responseMode: 'responseNode',
        options: {},
    };

    @node({
        name: 'Read Lead from Supabase',
        type: 'n8n-nodes-base.postgres',
        version: 2.5,
        position: [40, 0],
        credentials: { postgres: { id: 'YOUR_SUPABASE_POSTGRES_CREDENTIAL_ID', name: 'Supabase PostgreSQL' } },
    })
    ReadLeadFromSupabase = {
        operation: 'executeQuery',
        query: '=SELECT * FROM apollo_leads WHERE id = {{ $json.body.lead_id }}',
        options: {},
    };

    @node({
        name: 'Standardize & Enrich Data',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [240, 0],
    })
    StandardizeEnrichData = {
        jsCode: "// Get all input items\nconst items = $input.all();\n\n// Process each item\nreturn items.map(item => {\n  // Try multiple phone fields from apollo_leads\n  const phoneNumber = item.json.work_direct_phone || item.json.mobile_phone || item.json.home_phone || item.json.corporate_phone || item.json.other_phone || item.json.company_phone || '';\n  \n  // Convert to string and remove all non-digit characters\n  let cleanNumber = String(phoneNumber).replace(/\\D/g, '');\n  \n  // Handle different cases\n  let standardizedNumber;\n  \n  if (cleanNumber.length === 10) {\n    // Perfect - just 10 digits (US)\n    standardizedNumber = cleanNumber;\n  } else if (cleanNumber.length === 11 && cleanNumber.startsWith('1')) {\n    // US number with country code +1\n    standardizedNumber = cleanNumber.slice(1);\n  } else if (cleanNumber.length >= 10 && cleanNumber.length <= 15) {\n    // International number - keep as is\n    standardizedNumber = cleanNumber;\n  } else if (cleanNumber.length === 0) {\n    standardizedNumber = 'no_phone';\n  } else {\n    // Wrong format\n    standardizedNumber = 'incorrect format';\n  }\n  \n  // Build lead context for VAPI\n  const leadContext = {\n    lead_id: item.json.id,\n    first_name: item.json.first_name || '',\n    last_name: item.json.last_name || '',\n    full_name: `${item.json.first_name || ''} ${item.json.last_name || ''}`.trim(),\n    title: item.json.title || '',\n    company_name: item.json.company_name || '',\n    email: item.json.email || '',\n    industry: item.json.industry || '',\n    num_employees: item.json.num_employees || '',\n    seniority: item.json.seniority || '',\n    departments: item.json.departments || '',\n    city: item.json.city || '',\n    state: item.json.state || '',\n    country: item.json.country || '',\n    person_linkedin_url: item.json.person_linkedin_url || '',\n    website: item.json.website || '',\n    annual_revenue: item.json.annual_revenue || '',\n    technologies: item.json.technologies || '',\n    keywords: item.json.keywords || '',\n    primary_intent_topic: item.json.primary_intent_topic || '',\n    primary_intent_score: item.json.primary_intent_score || '',\n    phone_number: standardizedNumber,\n    phone_source: item.json.work_direct_phone ? 'work_direct' : (item.json.mobile_phone ? 'mobile' : (item.json.home_phone ? 'home' : (item.json.corporate_phone ? 'corporate' : 'other'))),\n    call_attempts: (item.json.call_attempts || 0) + 1\n  };\n  \n  return {\n    json: leadContext\n  };\n});",
    };

    @node({
        name: 'Phone Valid?',
        type: 'n8n-nodes-base.if',
        version: 2.3,
        position: [440, 0],
    })
    PhoneValid = {
        conditions: {
            options: {
                caseSensitive: true,
                leftValue: '',
                typeValidation: 'strict',
                version: 3,
            },
            conditions: [
                {
                    id: 'phone-check-001',
                    leftValue: '={{ $json.phone_number }}',
                    rightValue: 'incorrect format',
                    operator: {
                        type: 'string',
                        operation: 'equals',
                    },
                },
            ],
            combinator: 'or',
        },
        options: {},
    };

    @node({
        name: 'Has Phone?',
        type: 'n8n-nodes-base.if',
        version: 2.3,
        position: [440, -200],
    })
    HasPhone = {
        conditions: {
            options: {
                caseSensitive: true,
                leftValue: '',
                typeValidation: 'strict',
                version: 3,
            },
            conditions: [
                {
                    id: 'no-phone-check-001',
                    leftValue: '={{ $json.phone_number }}',
                    rightValue: 'no_phone',
                    operator: {
                        type: 'string',
                        operation: 'equals',
                    },
                },
            ],
            combinator: 'or',
        },
        options: {},
    };

    @node({
        name: 'Log Incorrect Phone',
        type: 'n8n-nodes-base.postgres',
        version: 2.5,
        position: [660, -100],
        credentials: { postgres: { id: 'YOUR_SUPABASE_POSTGRES_CREDENTIAL_ID', name: 'Supabase PostgreSQL' } },
    })
    LogIncorrectPhone = {
        operation: 'executeQuery',
        query: "=UPDATE apollo_leads SET call_status = 'incorrect_phone', call_attempts = {{ $json.call_attempts }}, updated_at = NOW() WHERE id = {{ $json.lead_id }}",
        options: {},
    };

    @node({
        name: 'Log No Phone',
        type: 'n8n-nodes-base.postgres',
        version: 2.5,
        position: [660, -300],
        credentials: { postgres: { id: 'YOUR_SUPABASE_POSTGRES_CREDENTIAL_ID', name: 'Supabase PostgreSQL' } },
    })
    LogNoPhone = {
        operation: 'executeQuery',
        query: "=UPDATE apollo_leads SET call_status = 'failed', call_summary = 'No phone number available in any field', updated_at = NOW() WHERE id = {{ $json.lead_id }}",
        options: {},
    };

    @node({
        name: 'Set Status: Calling',
        type: 'n8n-nodes-base.postgres',
        version: 2.5,
        position: [660, 100],
        credentials: { postgres: { id: 'YOUR_SUPABASE_POSTGRES_CREDENTIAL_ID', name: 'Supabase PostgreSQL' } },
    })
    SetStatusCalling = {
        operation: 'executeQuery',
        query: "=UPDATE apollo_leads SET call_status = 'calling', call_attempts = {{ $json.call_attempts }}, call_date = NOW(), updated_at = NOW() WHERE id = {{ $json.lead_id }}",
        options: {},
    };

    @node({
        name: 'Call Lead via VAPI',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.3,
        position: [860, 100],
        credentials: { httpBearerAuth: { id: 'YOUR_VAPI_BEARER_CREDENTIAL_ID', name: 'Vapi' } },
    })
    CallLeadViaVapi = {
        method: 'POST',
        url: 'https://api.vapi.ai/call',
        authentication: 'genericCredentialType',
        genericAuthType: 'httpBearerAuth',
        sendBody: true,
        specifyBody: 'json',
        jsonBody:
            '={\n  "assistantId": "YOUR_VAPI_ASSISTANT_ID",\n  "phoneNumberId": "YOUR_VAPI_PHONE_NUMBER_ID",\n  "customers": [\n    {\n      "number": "+1{{ $(\'Standardize & Enrich Data\').item.json.phone_number }}"\n    }\n  ],\n  "assistantOverrides": {\n    "variableValues": {\n      "lead_id": "{{ $(\'Standardize & Enrich Data\').item.json.lead_id }}",\n      "lead_name": "{{ $(\'Standardize & Enrich Data\').item.json.full_name }}",\n      "lead_first_name": "{{ $(\'Standardize & Enrich Data\').item.json.first_name }}",\n      "lead_last_name": "{{ $(\'Standardize & Enrich Data\').item.json.last_name }}",\n      "lead_title": "{{ $(\'Standardize & Enrich Data\').item.json.title }}",\n      "lead_company_name": "{{ $(\'Standardize & Enrich Data\').item.json.company_name }}",\n      "lead_email": "{{ $(\'Standardize & Enrich Data\').item.json.email }}",\n      "lead_industry": "{{ $(\'Standardize & Enrich Data\').item.json.industry }}",\n      "lead_num_employees": "{{ $(\'Standardize & Enrich Data\').item.json.num_employees }}",\n      "lead_seniority": "{{ $(\'Standardize & Enrich Data\').item.json.seniority }}",\n      "lead_city": "{{ $(\'Standardize & Enrich Data\').item.json.city }}",\n      "lead_state": "{{ $(\'Standardize & Enrich Data\').item.json.state }}",\n      "lead_country": "{{ $(\'Standardize & Enrich Data\').item.json.country }}",\n      "lead_website": "{{ $(\'Standardize & Enrich Data\').item.json.website }}",\n      "lead_annual_revenue": "{{ $(\'Standardize & Enrich Data\').item.json.annual_revenue }}",\n      "lead_technologies": "{{ $(\'Standardize & Enrich Data\').item.json.technologies }}",\n      "lead_intent_topic": "{{ $(\'Standardize & Enrich Data\').item.json.primary_intent_topic }}",\n      "lead_intent_score": "{{ $(\'Standardize & Enrich Data\').item.json.primary_intent_score }}"\n    }\n  }\n}\n',
        options: {},
    };

    @node({
        name: 'Wait 60s',
        type: 'n8n-nodes-base.wait',
        version: 1.1,
        position: [1060, 100],
    })
    Wait60s = {
        amount: 60,
    };

    @node({
        name: 'Get Call Details',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.3,
        position: [1260, 100],
        credentials: { httpBearerAuth: { id: 'YOUR_VAPI_BEARER_CREDENTIAL_ID', name: 'Vapi' } },
    })
    GetCallDetails = {
        url: "=https://api.vapi.ai/call/{{ $('Call Lead via VAPI').item.json.id }}",
        authentication: 'genericCredentialType',
        genericAuthType: 'httpBearerAuth',
        options: {},
    };

    @node({
        name: 'Limit',
        type: 'n8n-nodes-base.limit',
        version: 1,
        position: [1460, 100],
    })
    Limit = {};

    @node({
        name: 'Call Ended?',
        type: 'n8n-nodes-base.if',
        version: 2.3,
        position: [1660, 100],
    })
    CallEnded = {
        conditions: {
            options: {
                caseSensitive: true,
                leftValue: '',
                typeValidation: 'strict',
                version: 3,
            },
            conditions: [
                {
                    id: 'ended-check-001',
                    leftValue: '={{ $json.status }}',
                    rightValue: 'ended',
                    operator: {
                        type: 'string',
                        operation: 'equals',
                    },
                },
            ],
            combinator: 'and',
        },
        options: {},
    };

    @node({
        name: 'Polling (10s)',
        type: 'n8n-nodes-base.wait',
        version: 1.1,
        position: [1860, 200],
    })
    Polling10s = {
        amount: 10,
    };

    @node({
        name: 'Voicemail?',
        type: 'n8n-nodes-base.if',
        version: 2.3,
        position: [1860, 0],
    })
    Voicemail = {
        conditions: {
            options: {
                caseSensitive: true,
                leftValue: '',
                typeValidation: 'strict',
                version: 3,
            },
            conditions: [
                {
                    id: 'voicemail-check-001',
                    leftValue: '={{ $json.endedReason }}',
                    rightValue: 'voicemail',
                    operator: {
                        type: 'string',
                        operation: 'equals',
                    },
                },
            ],
            combinator: 'and',
        },
        options: {},
    };

    @node({
        name: 'No Answer?',
        type: 'n8n-nodes-base.if',
        version: 2.3,
        position: [2060, -200],
    })
    NoAnswer = {
        conditions: {
            options: {
                caseSensitive: true,
                leftValue: '',
                typeValidation: 'strict',
                version: 3,
            },
            conditions: [
                {
                    id: 'no-answer-check-001',
                    leftValue: '={{ $json.endedReason }}',
                    rightValue: 'customer-did-not-answer',
                    operator: {
                        type: 'string',
                        operation: 'equals',
                    },
                },
            ],
            combinator: 'and',
        },
        options: {},
    };

    @node({
        name: 'Log Voicemail to Supabase',
        type: 'n8n-nodes-base.postgres',
        version: 2.5,
        position: [2260, -100],
        credentials: { postgres: { id: 'YOUR_SUPABASE_POSTGRES_CREDENTIAL_ID', name: 'Supabase PostgreSQL' } },
    })
    LogVoicemailToSupabase = {
        operation: 'executeQuery',
        query: "=UPDATE apollo_leads SET \n  call_status = 'voicemail',\n  call_ended_reason = '{{ $json.endedReason }}',\n  vapi_call_id = '{{ $json.id }}',\n  call_duration_seconds = {{ $json.costBreakdown?.duration || 0 }},\n  updated_at = NOW()\nWHERE id = {{ $('Standardize & Enrich Data').item.json.lead_id }}",
        options: {},
    };

    @node({
        name: 'Log No Answer to Supabase',
        type: 'n8n-nodes-base.postgres',
        version: 2.5,
        position: [2260, -300],
        credentials: { postgres: { id: 'YOUR_SUPABASE_POSTGRES_CREDENTIAL_ID', name: 'Supabase PostgreSQL' } },
    })
    LogNoAnswerToSupabase = {
        operation: 'executeQuery',
        query: "=UPDATE apollo_leads SET \n  call_status = 'no_answer',\n  call_ended_reason = '{{ $json.endedReason }}',\n  vapi_call_id = '{{ $json.id }}',\n  updated_at = NOW()\nWHERE id = {{ $('Standardize & Enrich Data').item.json.lead_id }}",
        options: {},
    };

    @node({
        name: 'Extract Call Qualification Data',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [2060, 100],
    })
    ExtractCallQualificationData = {
        jsCode: "// Extract structured outputs from VAPI call\nconst item = $input.first();\nconst json = item.json;\n\n// Get structured outputs from VAPI artifact\nconst structuredOutputs = json.artifact?.structuredOutputs || {};\n\n// Map the VAPI structured output IDs to our fields\n// IMPORTANT: Replace these UUIDs with YOUR actual VAPI structured output IDs\nconst outputs = Object.values(structuredOutputs);\n\n// Try to find outputs by their names/types or use the values directly\nlet intention = '';\nlet budget = '';\nlet urgency = '';\nlet motivation = '';\nlet serviceInterest = '';\nlet rightPerson = false;\nlet pastExperience = '';\nlet callSummary = '';\n\n// If using named structured outputs, map them\nfor (const [key, value] of Object.entries(structuredOutputs)) {\n  const result = value.result || value;\n  const name = (value.name || key).toLowerCase();\n  \n  if (name.includes('intent') || name.includes('intencion') || name.includes('intención')) {\n    intention = result;\n  } else if (name.includes('budget') || name.includes('presupuesto')) {\n    budget = result;\n  } else if (name.includes('urgency') || name.includes('urgencia')) {\n    urgency = result;\n  } else if (name.includes('motivation') || name.includes('motivacion') || name.includes('motivación')) {\n    motivation = result;\n  } else if (name.includes('service') || name.includes('servicio') || name.includes('interest') || name.includes('interés')) {\n    serviceInterest = result;\n  } else if (name.includes('right_person') || name.includes('persona') || name.includes('decision')) {\n    rightPerson = result === 'true' || result === 'yes' || result === 'sí' || result === true;\n  } else if (name.includes('experience') || name.includes('experiencia')) {\n    pastExperience = result;\n  } else if (name.includes('summary') || name.includes('resumen')) {\n    callSummary = result;\n  }\n}\n\n// Get transcript\nconst transcript = json.artifact?.transcript || json.transcript || '';\nconst transcriptText = typeof transcript === 'string' ? transcript : \n  (Array.isArray(transcript) ? transcript.map(t => `${t.role}: ${t.message}`).join('\\n') : JSON.stringify(transcript));\n\n// If no summary from structured outputs, try to get from analysis\nif (!callSummary && json.analysis?.summary) {\n  callSummary = json.analysis.summary;\n}\n\nreturn [{\n  json: {\n    lead_id: $('Standardize & Enrich Data').item.json.lead_id,\n    call_intention: intention,\n    call_budget: budget,\n    call_urgency: urgency,\n    call_motivation: motivation,\n    call_service_interest: serviceInterest,\n    call_right_person: rightPerson,\n    call_past_experience: pastExperience,\n    call_summary: callSummary,\n    call_transcript: transcriptText,\n    vapi_call_id: json.id,\n    call_ended_reason: json.endedReason,\n    call_duration_seconds: json.costBreakdown?.duration || 0,\n    // Keep original VAPI data for reference\n    raw_structured_outputs: JSON.stringify(structuredOutputs),\n    raw_analysis: JSON.stringify(json.analysis || {})\n  }\n}];",
    };

    @node({
        name: 'Save Qualification to Supabase',
        type: 'n8n-nodes-base.postgres',
        version: 2.5,
        position: [2260, 100],
        credentials: { postgres: { id: 'YOUR_SUPABASE_POSTGRES_CREDENTIAL_ID', name: 'Supabase PostgreSQL' } },
    })
    SaveQualificationToSupabase = {
        operation: 'executeQuery',
        query: "=UPDATE apollo_leads SET \n  call_status = 'completed',\n  call_intention = '{{ $json.call_intention.replace(/'/g, \"''\") }}',\n  call_budget = '{{ $json.call_budget.replace(/'/g, \"''\") }}',\n  call_urgency = '{{ $json.call_urgency.replace(/'/g, \"''\") }}',\n  call_motivation = '{{ $json.call_motivation.replace(/'/g, \"''\") }}',\n  call_service_interest = '{{ $json.call_service_interest.replace(/'/g, \"''\") }}',\n  call_right_person = {{ $json.call_right_person }},\n  call_past_experience = '{{ $json.call_past_experience.replace(/'/g, \"''\") }}',\n  call_summary = '{{ $json.call_summary.replace(/'/g, \"''\") }}',\n  call_transcript = '{{ $json.call_transcript.replace(/'/g, \"''\") }}',\n  vapi_call_id = '{{ $json.vapi_call_id }}',\n  call_ended_reason = '{{ $json.call_ended_reason }}',\n  call_duration_seconds = {{ $json.call_duration_seconds }},\n  updated_at = NOW()\nWHERE id = {{ $json.lead_id }}",
        options: {},
    };

    @node({
        name: 'Respond Success',
        type: 'n8n-nodes-base.respondToWebhook',
        version: 1.1,
        position: [2460, 100],
    })
    RespondSuccess = {
        respondWith: 'json',
        responseBody:
            '={\n  "success": true,\n  "lead_id": {{ $(\'Standardize & Enrich Data\').item.json.lead_id }},\n  "status": "{{ $json.call_status || \'processing\' }}",\n  "message": "Call qualification completed"\n}',
        options: {},
    };

    @node({
        name: 'Respond Phone Error',
        type: 'n8n-nodes-base.respondToWebhook',
        version: 1.1,
        position: [860, -100],
    })
    RespondPhoneError = {
        respondWith: 'json',
        responseBody:
            '={\n  "success": false,\n  "lead_id": {{ $(\'Standardize & Enrich Data\').item.json.lead_id }},\n  "status": "incorrect_phone",\n  "message": "Phone number format is incorrect or missing"\n}',
        options: {},
    };

    @node({
        name: 'Setup Guide',
        type: 'n8n-nodes-base.stickyNote',
        version: 1,
        position: [-1100, -400],
    })
    SetupGuide = {
        content:
            '# 🛠️ MSI Outbound Lead Qualifier - Setup Guide\n**Adapted for Supabase + Apollo Leads**\n\n---\n\n### ✅ Step 1: Run the Migration\n- Go to Supabase SQL Editor\n- Run `migrations/migration-outbound-qualifier.sql`\n- This adds all qualification columns to `apollo_leads`\n\n---\n\n### ✅ Step 2: Configure Supabase PostgreSQL Credential\n- In n8n, create a **PostgreSQL** credential\n- Host: `db.vahqhxfdropstvklvzej.supabase.co`\n- Port: `5432`\n- Database: `postgres`\n- User: `postgres`\n- Password: Your Supabase DB password\n- SSL: Enabled\n\n---\n\n### ✅ Step 3: Add Your VAPI API Key\n- Create a **Generic Credential** using **Bearer Auth**\n- Paste your VAPI API key\n- Update credential in **Call Lead via VAPI** and **Get Call Details**\n\n---\n\n### ✅ Step 4: Configure VAPI Assistant\n- Set your **Assistant ID** in the Call Lead node\n- Set your **Phone Number ID** in the Call Lead node\n- Configure structured outputs (see VAPI_OUTBOUND_CONFIG.md)\n\n---\n\n### ✅ Step 5: Trigger a Call\nPOST to webhook with:\n```json\n{ "lead_id": 123 }\n```\nOr for batch:\n```json\n{ "lead_ids": [1, 2, 3] }\n```\n\n---\n\n### 📊 Qualification Fields Stored:\n- **call_intention**: Purchase intent level\n- **call_budget**: Budget range mentioned\n- **call_urgency**: Timeline urgency\n- **call_motivation**: Main motivation\n- **call_service_interest**: Specific MSI service\n- **call_right_person**: Decision maker confirmed\n- **call_past_experience**: Previous vendor experience\n- **call_summary**: AI-generated summary\n- **call_transcript**: Full conversation\n',
        height: 1200,
        width: 784,
    };

    @node({
        name: 'Call Flow Diagram',
        type: 'n8n-nodes-base.stickyNote',
        version: 1,
        position: [-280, -400],
    })
    CallFlowDiagram = {
        content:
            '# 📞 Call Flow\n\n1. **Webhook** receives lead_id\n2. **Read** lead data from Supabase\n3. **Standardize** phone number\n4. **Check** phone validity\n5. **Call** via VAPI with full lead context\n6. **Wait** → **Poll** until call ends\n7. **Extract** qualification data from structured outputs\n8. **Save** everything back to Supabase\n\n### VAPI Variables Available:\n- lead_name, lead_first_name, lead_last_name\n- lead_title, lead_company_name\n- lead_email, lead_industry\n- lead_num_employees, lead_seniority\n- lead_city, lead_state, lead_country\n- lead_website, lead_annual_revenue\n- lead_technologies\n- lead_intent_topic, lead_intent_score',
        height: 600,
        width: 400,
    };

    // =====================================================================
    // ROUTAGE ET CONNEXIONS
    // =====================================================================

    @links()
    defineRouting() {
        this.WebhookTrigger.out(0).to(this.ReadLeadFromSupabase.in(0));
        this.ReadLeadFromSupabase.out(0).to(this.StandardizeEnrichData.in(0));
        this.StandardizeEnrichData.out(0).to(this.HasPhone.in(0));
        this.HasPhone.out(0).to(this.LogNoPhone.in(0));
        this.HasPhone.out(1).to(this.PhoneValid.in(0));
        this.PhoneValid.out(0).to(this.LogIncorrectPhone.in(0));
        this.PhoneValid.out(1).to(this.SetStatusCalling.in(0));
        this.LogIncorrectPhone.out(0).to(this.RespondPhoneError.in(0));
        this.LogNoPhone.out(0).to(this.RespondPhoneError.in(0));
        this.SetStatusCalling.out(0).to(this.CallLeadViaVapi.in(0));
        this.CallLeadViaVapi.out(0).to(this.Wait60s.in(0));
        this.Wait60s.out(0).to(this.GetCallDetails.in(0));
        this.GetCallDetails.out(0).to(this.Limit.in(0));
        this.Limit.out(0).to(this.CallEnded.in(0));
        this.CallEnded.out(0).to(this.Voicemail.in(0));
        this.CallEnded.out(1).to(this.Polling10s.in(0));
        this.Polling10s.out(0).to(this.GetCallDetails.in(0));
        this.Voicemail.out(0).to(this.NoAnswer.in(0));
        this.Voicemail.out(1).to(this.ExtractCallQualificationData.in(0));
        this.NoAnswer.out(0).to(this.LogNoAnswerToSupabase.in(0));
        this.NoAnswer.out(1).to(this.LogVoicemailToSupabase.in(0));
        this.ExtractCallQualificationData.out(0).to(this.SaveQualificationToSupabase.in(0));
        this.SaveQualificationToSupabase.out(0).to(this.RespondSuccess.in(0));
    }
}
