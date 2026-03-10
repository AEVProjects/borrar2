import { workflow, node, links } from '@n8n-as-code/transformer';

// <workflow-map>
// Workflow : MSI VAPI Server URL - Save Call Results
// Nodes   : 13  |  Connections: 11
//
// NODE INDEX
// ──────────────────────────────────────────────────────────────────
// Property name                    Node type (short)         Flags
// VapiServerUrl                      webhook
// IsEndOfCallReport                  if
// IsToolCallLookupLead               if
// ExtractCallDataFromVapi            code
// HasLeadId                          if
// SaveToSupabase                     postgres                   [creds]
// LogOnlyNoLeadId                    code
// ParseToolCallArgs                  code
// FetchLeadFromSupabase              postgres                   [creds]
// FormatVapiToolResponse             code
// IsAssistantRequest                 if
// Acknowledge                        code
// Info                               stickyNote
//
// ROUTING MAP
// ──────────────────────────────────────────────────────────────────
// VapiServerUrl
//    → IsEndOfCallReport
//      → ExtractCallDataFromVapi
//        → HasLeadId
//          → SaveToSupabase
//         .out(1) → LogOnlyNoLeadId
//    → IsToolCallLookupLead
//      → ParseToolCallArgs
//        → FetchLeadFromSupabase
//          → FormatVapiToolResponse
//    → IsAssistantRequest
//      → Acknowledge
// </workflow-map>

// =====================================================================
// METADATA DU WORKFLOW
// =====================================================================

@workflow({
    id: 'nPyviJu4qpx1GYNu',
    name: 'MSI VAPI Server URL - Save Call Results',
    active: false,
    settings: { executionOrder: 'v1', availableInMCP: false, callerPolicy: 'workflowsFromSameOwner' },
})
export class MsiVapiServerUrlSaveCallResultsWorkflow {
    // =====================================================================
    // CONFIGURATION DES NOEUDS
    // =====================================================================

    @node({
        name: 'VAPI Server URL',
        type: 'n8n-nodes-base.webhook',
        version: 2,
        position: [0, 0],
    })
    VapiServerUrl = {
        httpMethod: 'POST',
        path: 'msi-vapi-server-url',
        responseMode: 'lastNode',
        options: {
            responseHeaders: {
                entries: [
                    {
                        name: 'Content-Type',
                        value: 'application/json',
                    },
                ],
            },
        },
    };

    @node({
        name: 'Is End-of-Call Report?',
        type: 'n8n-nodes-base.if',
        version: 2.3,
        position: [220, 0],
    })
    IsEndOfCallReport = {
        conditions: {
            options: {
                caseSensitive: true,
                leftValue: '',
                typeValidation: 'strict',
                version: 3,
            },
            conditions: [
                {
                    id: 'msg-type-eocr',
                    leftValue: '={{ $json.body.message.type }}',
                    rightValue: 'end-of-call-report',
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
        name: 'Is Tool Call (Lookup Lead)?',
        type: 'n8n-nodes-base.if',
        version: 2.3,
        position: [220, 300],
    })
    IsToolCallLookupLead = {
        conditions: {
            options: {
                caseSensitive: true,
                leftValue: '',
                typeValidation: 'strict',
                version: 3,
            },
            conditions: [
                {
                    id: 'msg-type-function',
                    leftValue: '={{ $json.body.message.type }}',
                    rightValue: 'tool-calls',
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
        name: 'Extract Call Data from VAPI',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [480, 0],
    })
    ExtractCallDataFromVapi = {
        jsCode: "// Extract data from VAPI end-of-call-report\nconst body = $input.first().json.body;\nconst msg = body.message;\nconst call = msg.call || {};\nconst artifact = msg.artifact || {};\nconst analysis = msg.analysis || {};\n\n// Get variable values passed to VAPI (contains lead_id)\nconst variables = call.assistantOverrides?.variableValues || {};\nconst leadId = variables.lead_id || null;\n\n// Structured outputs from VAPI\nconst structured = analysis.structuredData || {};\n\n// Transcript\nconst transcriptArr = artifact.transcript || msg.transcript || [];\nlet transcriptText = '';\nif (typeof transcriptArr === 'string') {\n  transcriptText = transcriptArr;\n} else if (Array.isArray(transcriptArr)) {\n  transcriptText = transcriptArr.map(t => `${t.role}: ${t.message}`).join('\\n');\n}\n\n// Call metadata\nconst endedReason = msg.endedReason || call.endedReason || 'unknown';\nconst callId = call.id || msg.callId || '';\nconst duration = msg.durationSeconds || call.costBreakdown?.duration || 0;\n\n// Determine call_status\nlet callStatus = 'completed';\nif (endedReason === 'voicemail') callStatus = 'voicemail';\nelse if (endedReason === 'customer-did-not-answer') callStatus = 'no_answer';\nelse if (endedReason === 'customer-did-not-give-microphone-permission') callStatus = 'failed';\nelse if (endedReason === 'assistant-error') callStatus = 'failed';\n\n// Map structured data\nconst rightPersonRaw = structured.right_person || '';\nconst isRightPerson = ['yes', 'true', 'sí'].includes(rightPersonRaw.toLowerCase());\n\nreturn [{\n  json: {\n    lead_id: leadId,\n    call_status: callStatus,\n    call_intention: structured.intention || 'unknown',\n    call_budget: structured.budget || 'not_discussed',\n    call_urgency: structured.urgency || 'not_discussed',\n    call_motivation: structured.motivation || 'not_discussed',\n    call_service_interest: structured.service_interest || 'not_discussed',\n    call_right_person: isRightPerson,\n    call_past_experience: structured.past_experience || 'not_discussed',\n    call_summary: structured.call_summary || analysis.summary || '',\n    call_transcript: transcriptText,\n    vapi_call_id: callId,\n    call_ended_reason: endedReason,\n    call_duration_seconds: Math.round(duration),\n    // For debugging\n    raw_analysis: JSON.stringify(analysis),\n    raw_structured: JSON.stringify(structured)\n  }\n}];",
    };

    @node({
        name: 'Has Lead ID?',
        type: 'n8n-nodes-base.if',
        version: 2.3,
        position: [700, 0],
    })
    HasLeadId = {
        conditions: {
            options: {
                caseSensitive: true,
                leftValue: '',
                typeValidation: 'strict',
                version: 3,
            },
            conditions: [
                {
                    id: 'has-lead-id',
                    leftValue: '={{ $json.lead_id }}',
                    rightValue: '',
                    operator: {
                        type: 'string',
                        operation: 'notEmpty',
                    },
                },
            ],
            combinator: 'and',
        },
        options: {},
    };

    @node({
        name: 'Save to Supabase',
        type: 'n8n-nodes-base.postgres',
        version: 2.5,
        position: [960, -50],
        credentials: { postgres: { id: 'YOUR_SUPABASE_POSTGRES_CREDENTIAL_ID', name: 'Supabase PostgreSQL' } },
    })
    SaveToSupabase = {
        operation: 'executeQuery',
        query: "=UPDATE apollo_leads SET \n  call_status = '{{ $json.call_status }}',\n  call_intention = ${{ $json.call_intention ? \"'\" + $json.call_intention.replace(/'/g, \"''\") + \"'\" : 'NULL' }},\n  call_budget = ${{ $json.call_budget ? \"'\" + $json.call_budget.replace(/'/g, \"''\") + \"'\" : 'NULL' }},\n  call_urgency = ${{ $json.call_urgency ? \"'\" + $json.call_urgency.replace(/'/g, \"''\") + \"'\" : 'NULL' }},\n  call_motivation = ${{ $json.call_motivation ? \"'\" + $json.call_motivation.replace(/'/g, \"''\") + \"'\" : 'NULL' }},\n  call_service_interest = ${{ $json.call_service_interest ? \"'\" + $json.call_service_interest.replace(/'/g, \"''\") + \"'\" : 'NULL' }},\n  call_right_person = {{ $json.call_right_person }},\n  call_past_experience = ${{ $json.call_past_experience ? \"'\" + $json.call_past_experience.replace(/'/g, \"''\") + \"'\" : 'NULL' }},\n  call_summary = ${{ $json.call_summary ? \"'\" + $json.call_summary.replace(/'/g, \"''\") + \"'\" : 'NULL' }},\n  call_transcript = ${{ $json.call_transcript ? \"'\" + $json.call_transcript.replace(/'/g, \"''\") + \"'\" : 'NULL' }},\n  vapi_call_id = '{{ $json.vapi_call_id }}',\n  call_ended_reason = '{{ $json.call_ended_reason }}',\n  call_duration_seconds = {{ $json.call_duration_seconds }},\n  call_date = NOW(),\n  updated_at = NOW()\nWHERE id = {{ $json.lead_id }}",
        options: {},
    };

    @node({
        name: 'Log Only (No Lead ID)',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [960, 80],
    })
    LogOnlyNoLeadId = {
        jsCode: "// No lead_id - just log the data for debugging\nconst data = $input.first().json;\nconsole.log('VAPI call received without lead_id:', JSON.stringify(data));\n\n// Still return success so VAPI doesn't retry\nreturn [{\n  json: {\n    results: [{\n      toolCallId: 'none',\n      result: JSON.stringify({\n        success: true,\n        message: 'Call data received but no lead_id provided - data logged only',\n        data: data\n      })\n    }]\n  }\n}];",
    };

    @node({
        name: 'Parse Tool Call Args',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [480, 300],
    })
    ParseToolCallArgs = {
        jsCode: "// Handle tool-calls from VAPI (fetch lead data from Supabase)\nconst body = $input.first().json.body;\nconst msg = body.message;\nconst toolCalls = msg.toolCallList || msg.toolCalls || [];\n\n// Get the first tool call\nconst toolCall = toolCalls[0] || {};\nconst functionCall = toolCall.function || {};\nconst args = typeof functionCall.arguments === 'string' \n  ? JSON.parse(functionCall.arguments) \n  : (functionCall.arguments || {});\n\nreturn [{\n  json: {\n    toolCallId: toolCall.id,\n    functionName: functionCall.name,\n    lead_id: args.lead_id || args.leadId || null,\n    lead_email: args.email || null,\n    lead_phone: args.phone || null\n  }\n}];",
    };

    @node({
        name: 'Fetch Lead from Supabase',
        type: 'n8n-nodes-base.postgres',
        version: 2.5,
        position: [700, 300],
        credentials: { postgres: { id: 'YOUR_SUPABASE_POSTGRES_CREDENTIAL_ID', name: 'Supabase PostgreSQL' } },
    })
    FetchLeadFromSupabase = {
        operation: 'executeQuery',
        query: "=SELECT id, first_name, last_name, title, company_name, email, \n  work_direct_phone, mobile_phone, corporate_phone,\n  industry, num_employees, seniority, departments,\n  city, state, country, website, annual_revenue,\n  technologies, keywords, primary_intent_topic, primary_intent_score,\n  person_linkedin_url, company_linkedin_url,\n  call_status, call_attempts\nFROM apollo_leads \nWHERE \n  CASE \n    WHEN {{ $json.lead_id ? 'true' : 'false' }}::boolean THEN id = {{ $json.lead_id || 0 }}\n    WHEN {{ $json.lead_email ? 'true' : 'false' }}::boolean THEN email = '{{ $json.lead_email }}'\n    ELSE false\n  END\nLIMIT 1",
        options: {},
    };

    @node({
        name: 'Format VAPI Tool Response',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [960, 300],
    })
    FormatVapiToolResponse = {
        jsCode: "// Format lead data as VAPI tool response\nconst input = $input.first().json;\nconst toolCallId = $('Parse Tool Call Args').item.json.toolCallId;\n\nconst lead = input;\nconst leadData = {\n  id: lead.id,\n  name: `${lead.first_name || ''} ${lead.last_name || ''}`.trim(),\n  first_name: lead.first_name || '',\n  last_name: lead.last_name || '',\n  title: lead.title || '',\n  company: lead.company_name || '',\n  email: lead.email || '',\n  phone: lead.work_direct_phone || lead.mobile_phone || lead.corporate_phone || '',\n  industry: lead.industry || '',\n  employees: lead.num_employees || '',\n  seniority: lead.seniority || '',\n  city: lead.city || '',\n  state: lead.state || '',\n  country: lead.country || '',\n  website: lead.website || '',\n  revenue: lead.annual_revenue || '',\n  technologies: lead.technologies || '',\n  linkedin: lead.person_linkedin_url || '',\n  intent_topic: lead.primary_intent_topic || '',\n  intent_score: lead.primary_intent_score || '',\n  previous_calls: lead.call_attempts || 0,\n  previous_status: lead.call_status || 'never_called'\n};\n\n// VAPI expects this exact response format for tool calls\nreturn [{\n  json: {\n    results: [{\n      toolCallId: toolCallId,\n      result: JSON.stringify(leadData)\n    }]\n  }\n}];",
    };

    @node({
        name: 'Is Assistant Request?',
        type: 'n8n-nodes-base.if',
        version: 2.3,
        position: [220, -200],
    })
    IsAssistantRequest = {
        conditions: {
            options: {
                caseSensitive: true,
                leftValue: '',
                typeValidation: 'strict',
                version: 3,
            },
            conditions: [
                {
                    id: 'msg-type-assistant-request',
                    leftValue: '={{ $json.body.message.type }}',
                    rightValue: 'assistant-request',
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
        name: 'Acknowledge',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [480, -200],
    })
    Acknowledge = {
        jsCode: '// Respond to assistant-request, status-update, etc.\n// Just acknowledge\nreturn [{ json: {} }];',
    };

    @node({
        name: 'Info',
        type: 'n8n-nodes-base.stickyNote',
        version: 1,
        position: [-560, -300],
    })
    Info = {
        content:
            "# 📞 MSI VAPI Server URL\n**Receives ALL VAPI events and routes them**\n\n---\n\n## How it works:\n1. VAPI sends events to this webhook\n2. Routes by message type:\n   - **end-of-call-report** → Extract data → Save to Supabase\n   - **tool-calls** → Fetch lead from DB → Return to VAPI\n   - **assistant-request** → Acknowledge\n\n## Setup in VAPI:\n1. Go to VAPI Dashboard → Account → Server URL\n2. Set: `https://n8nmsi.app.n8n.cloud/webhook/msi-vapi-server-url`\n\n## For Testing:\n- Set lead_id in VAPI test variables\n- Or add a Custom Tool 'lookupLead' to fetch data mid-call\n\n## Required n8n Credentials:\n- PostgreSQL → Supabase connection",
        height: 580,
        width: 500,
    };

    // =====================================================================
    // ROUTAGE ET CONNEXIONS
    // =====================================================================

    @links()
    defineRouting() {
        this.VapiServerUrl.out(0).to(this.IsEndOfCallReport.in(0));
        this.VapiServerUrl.out(0).to(this.IsToolCallLookupLead.in(0));
        this.VapiServerUrl.out(0).to(this.IsAssistantRequest.in(0));
        this.IsEndOfCallReport.out(0).to(this.ExtractCallDataFromVapi.in(0));
        this.IsToolCallLookupLead.out(0).to(this.ParseToolCallArgs.in(0));
        this.IsAssistantRequest.out(0).to(this.Acknowledge.in(0));
        this.ExtractCallDataFromVapi.out(0).to(this.HasLeadId.in(0));
        this.HasLeadId.out(0).to(this.SaveToSupabase.in(0));
        this.HasLeadId.out(1).to(this.LogOnlyNoLeadId.in(0));
        this.ParseToolCallArgs.out(0).to(this.FetchLeadFromSupabase.in(0));
        this.FetchLeadFromSupabase.out(0).to(this.FormatVapiToolResponse.in(0));
    }
}
