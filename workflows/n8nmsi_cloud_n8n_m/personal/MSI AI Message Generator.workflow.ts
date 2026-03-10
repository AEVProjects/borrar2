import { workflow, node, links } from '@n8n-as-code/transformer';

// <workflow-map>
// Workflow : MSI AI Message Generator
// Nodes   : 10  |  Connections: 11
//
// NODE INDEX
// ──────────────────────────────────────────────────────────────────
// Property name                    Node type (short)         Flags
// WebhookTrigger                     webhook
// FetchLeadsBatch                    postgres                   [creds]
// SplitInBatches                     splitInBatches
// BuildAIPrompt                      code
// GeminiGenerateMessage              httpRequest                [creds]
// ParseAIResponse                    code
// SaveMessageToSupabase              postgres                   [creds]
// UpdateBatchProgress                code
// BatchDone                          if
// RespondSuccess                     respondToWebhook
//
// ROUTING MAP
// ──────────────────────────────────────────────────────────────────
// WebhookTrigger
//    → FetchLeadsBatch
//      → SplitInBatches
//        → BuildAIPrompt
//          → GeminiGenerateMessage
//            → ParseAIResponse
//              → SaveMessageToSupabase
//                → SplitInBatches (↩ loop)
//       .out(1) → UpdateBatchProgress
//          → RespondSuccess
// </workflow-map>

// =====================================================================
// METADATA DU WORKFLOW
// =====================================================================

@workflow({
    name: 'MSI AI Message Generator',
    active: true,
    settings: { executionOrder: 'v1', availableInMCP: false, callerPolicy: 'workflowsFromSameOwner' },
})
export class MsiAiMessageGeneratorWorkflow {
    // =====================================================================
    // CONFIGURATION DES NOEUDS
    // =====================================================================

    @node({
        name: 'Webhook Trigger',
        type: 'n8n-nodes-base.webhook',
        version: 2,
        position: [-400, 0],
    })
    WebhookTrigger = {
        httpMethod: 'POST',
        path: 'msi-ai-messages',
        responseMode: 'responseNode',
        options: {},
    };

    // Fetch leads that need AI messages. Supports:
    // - batch_id: process a specific batch
    // - lead_ids: process specific lead IDs (array)
    // - source_table: which table (default: apollo_leads)
    // - limit: max leads to process (default: 50)
    @node({
        name: 'Fetch Leads Batch',
        type: 'n8n-nodes-base.postgres',
        version: 2.5,
        position: [-160, 0],
        credentials: { postgres: { id: 'WnTYs2zvPoE7hDJE', name: 'Postgres account' } },
    })
    FetchLeadsBatch = {
        operation: 'executeQuery',
        query: `=SELECT * FROM {{ $json.body.source_table || 'apollo_leads' }}
WHERE (personalized_message IS NULL OR personalized_message = '')
AND email IS NOT NULL AND email != ''
{{ $json.body.batch_id ? "AND batch_id = " + $json.body.batch_id : "" }}
{{ $json.body.lead_ids ? "AND id IN (" + $json.body.lead_ids.join(",") + ")" : "" }}
ORDER BY id ASC
LIMIT {{ $json.body.limit || 50 }}`,
        options: {},
    };

    @node({
        name: 'Split In Batches',
        type: 'n8n-nodes-base.splitInBatches',
        version: 3,
        position: [80, 0],
    })
    SplitInBatches = {
        batchSize: 1,
        options: {},
    };

    @node({
        name: 'Build AI Prompt',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [320, 0],
    })
    BuildAIPrompt = {
        jsCode: `// Build a highly contextual prompt for Gemini to generate personalized sales messages
const lead = $input.first().json;
const webhookData = $('Webhook Trigger').item.json.body || {};

// Determine company size category
const employees = parseInt(lead.num_employees) || 0;
let companySize = 'a company';
if (employees > 5000) companySize = 'a large enterprise (' + employees + '+ employees)';
else if (employees > 1000) companySize = 'a mid-to-large company (' + employees + ' employees)';
else if (employees > 200) companySize = 'a mid-market company (' + employees + ' employees)';
else if (employees > 50) companySize = 'a growing company (' + employees + ' employees)';
else if (employees > 10) companySize = 'a small company (' + employees + ' employees)';
else if (employees > 0) companySize = 'a startup (' + employees + ' employees)';

// Build rich context from ALL available fields
const context = {
  name: lead.first_name || '',
  lastName: lead.last_name || '',
  title: lead.title || '',
  seniority: lead.seniority || '',
  company: lead.company_name || '',
  industry: lead.industry || '',
  companySize: companySize,
  city: lead.city || '',
  state: lead.state || '',
  country: lead.country || '',
  website: lead.website || '',
  technologies: lead.technologies || '',
  keywords: lead.keywords || '',
  annualRevenue: lead.annual_revenue || '',
  departments: lead.departments || '',
  intentTopic: lead.primary_intent_topic || '',
  intentScore: lead.primary_intent_score || ''
};

// MSI services relevant to different profiles
const MSI_CONTEXT = \`MSI Technologies Inc. is a multinational technology firm with 20+ years of experience, 700+ consultants, and 14 offices across the Americas. Core services:
- Cybersecurity & Risk Management (SOC, penetration testing, threat management, compliance)
- Cloud Infrastructure & Migration (AWS, Azure, GCP, hybrid cloud)
- Custom Software Development & Modernization (enterprise apps, API integration, legacy modernization)
- Nearshore IT Staffing & Augmentation (US-timezone developers, 50-70% cost savings vs onshore)
- Data & AI Solutions (analytics, machine learning, data engineering)
- Managed IT Services (24/7 NOC/SOC, infrastructure management)\`;

const prompt = \`You are a B2B sales copywriter for MSI Technologies. Generate TWO personalized cold email messages for this lead.

LEAD DATA:
- Name: \${context.name} \${context.lastName}
- Title: \${context.title}
- Seniority: \${context.seniority}
- Company: \${context.company}
- Industry: \${context.industry}
- Company Size: \${context.companySize}
- Location: \${[context.city, context.state, context.country].filter(Boolean).join(', ')}
- Website: \${context.website}
- Technologies they use: \${context.technologies || 'Not specified'}
- Keywords/Focus areas: \${context.keywords || 'Not specified'}
- Annual Revenue: \${context.annualRevenue || 'Not specified'}
- Department: \${context.departments || 'Not specified'}
\${context.intentTopic ? '- Intent Signal: ' + context.intentTopic + ' (score: ' + context.intentScore + ')' : ''}

MSI TECHNOLOGIES:
\${MSI_CONTEXT}

INSTRUCTIONS:
Generate exactly 2 messages in JSON format:

1. **personalized_message** (for Email 1 - First contact):
   - 2-3 sentences maximum
   - Reference something SPECIFIC about their company, industry, or role
   - Connect a SPECIFIC MSI service to a likely pain point for their industry/title
   - If they use specific technologies, reference how MSI can complement or improve their stack
   - Tone: professional, peer-to-peer, consultative (NOT salesy or generic)
   - Do NOT include greetings, signatures, or subject lines
   - Must feel like it was written by a human who researched them

2. **personalized_followup** (for Email 2 - Follow-up):
   - 2-3 sentences maximum
   - Reference a relevant proof point, case study concept, or metric
   - Connect to the same industry/pain point from message 1 but from a results angle
   - Tone: value-driven, specific, zero-pressure
   - Do NOT include greetings, signatures, or subject lines

QUALITY RULES:
- NEVER use filler phrases like "I noticed that" or "I came across your profile"
- NEVER be generic — every sentence must reference specific context from the lead data
- If the industry is technology/software, focus on nearshore augmentation or cybersecurity
- If the industry is financial, focus on compliance + security
- If healthcare, focus on HIPAA compliance + secure infrastructure
- If manufacturing/logistics, focus on digital transformation + managed IT
- Adapt the MSI service pitch to what makes sense for this SPECIFIC person's role and company
- Write at a senior professional level — assume the reader is busy and smart

RESPOND ONLY WITH VALID JSON:
{
  "personalized_message": "...",
  "personalized_followup": "..."
}\`;

return [{
  json: {
    lead_id: lead.id,
    lead_email: lead.email,
    lead_name: \`\${lead.first_name || ''} \${lead.last_name || ''}\`.trim(),
    lead_company: lead.company_name || '',
    source_table: webhookData.source_table || 'apollo_leads',
    prompt: prompt,
    batch_id: lead.batch_id || webhookData.batch_id || null
  }
}];`,
    };

    @node({
        name: 'Gemini Generate Message',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.3,
        position: [560, 0],
        credentials: { googlePalmApi: { id: 'oF4jKBK0jRbwEPWt', name: 'Google Gemini(PaLM) Api account' } },
    })
    GeminiGenerateMessage = {
        method: 'POST',
        url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
        authentication: 'predefinedCredentialType',
        nodeCredentialType: 'googlePalmApi',
        sendBody: true,
        specifyBody: 'json',
        jsonBody: `={
  "contents": [{"role": "user", "parts": [{"text": {{ JSON.stringify($json.prompt) }} }]}],
  "generationConfig": {
    "temperature": 0.7,
    "topP": 0.9,
    "maxOutputTokens": 1024,
    "responseMimeType": "application/json"
  }
}`,
        options: {
            timeout: 30000,
        },
    };

    @node({
        name: 'Parse AI Response',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [800, 0],
    })
    ParseAIResponse = {
        jsCode: `// Parse Gemini response and extract the two messages
const response = $input.first().json;
const leadData = $('Build AI Prompt').item.json;

let personalizedMessage = '';
let personalizedFollowup = '';
let parseError = null;

try {
  const candidates = response.candidates || [];
  if (candidates.length > 0) {
    const text = candidates[0]?.content?.parts?.[0]?.text || '';
    
    // Try to parse as JSON
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      // Try to extract JSON from markdown code block
      const jsonMatch = text.match(/\\\`\\\`\\\`json?\\s*([\\s\\S]*?)\\\`\\\`\\\`/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[1]);
      } else {
        // Try to find JSON object in text
        const braceMatch = text.match(/\\{[\\s\\S]*\\}/);
        if (braceMatch) {
          parsed = JSON.parse(braceMatch[0]);
        }
      }
    }
    
    if (parsed) {
      personalizedMessage = parsed.personalized_message || '';
      personalizedFollowup = parsed.personalized_followup || '';
    }
  }
} catch (e) {
  parseError = e.message;
}

// Clean up messages - remove any quotes wrapping
personalizedMessage = personalizedMessage.replace(/^["']|["']$/g, '').trim();
personalizedFollowup = personalizedFollowup.replace(/^["']|["']$/g, '').trim();

const status = (personalizedMessage && personalizedFollowup) ? 'generated' : 'error';

return [{
  json: {
    lead_id: leadData.lead_id,
    lead_email: leadData.lead_email,
    lead_name: leadData.lead_name,
    lead_company: leadData.lead_company,
    source_table: leadData.source_table,
    batch_id: leadData.batch_id,
    personalized_message: personalizedMessage,
    personalized_followup: personalizedFollowup,
    ai_message_status: status,
    parse_error: parseError
  }
}];`,
    };

    @node({
        name: 'Save Message to Supabase',
        type: 'n8n-nodes-base.postgres',
        version: 2.5,
        position: [1040, 0],
        credentials: { postgres: { id: 'WnTYs2zvPoE7hDJE', name: 'Postgres account' } },
    })
    SaveMessageToSupabase = {
        operation: 'executeQuery',
        query: `=UPDATE {{ $json.source_table || 'apollo_leads' }} SET
  personalized_message = {{ $json.personalized_message ? "'" + $json.personalized_message.replace(/'/g, "''") + "'" : "NULL" }},
  personalized_followup = {{ $json.personalized_followup ? "'" + $json.personalized_followup.replace(/'/g, "''") + "'" : "NULL" }},
  ai_message_status = '{{ $json.ai_message_status }}',
  ai_message_generated_at = NOW(),
  updated_at = NOW()
WHERE id = {{ $json.lead_id }}`,
        options: {},
    };

    // After all items processed, update batch status
    @node({
        name: 'Update Batch Progress',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [80, 200],
    })
    UpdateBatchProgress = {
        jsCode: `// Summarize results from all processed leads
const allItems = $('Parse AI Response').all();
const webhookData = $('Webhook Trigger').item.json.body || {};

let generated = 0;
let errors = 0;
const results = [];

for (const item of allItems) {
  const d = item.json;
  if (d.ai_message_status === 'generated') generated++;
  else errors++;
  results.push({
    lead_id: d.lead_id,
    name: d.lead_name,
    company: d.lead_company,
    status: d.ai_message_status,
    error: d.parse_error || null
  });
}

return [{
  json: {
    success: true,
    total_processed: allItems.length,
    generated: generated,
    errors: errors,
    batch_id: webhookData.batch_id || null,
    results: results
  }
}];`,
    };

    @node({
        name: 'Respond Success',
        type: 'n8n-nodes-base.respondToWebhook',
        version: 1.1,
        position: [320, 200],
    })
    RespondSuccess = {
        respondWith: 'json',
        responseBody: '={{ JSON.stringify($json) }}',
        options: {},
    };

    // =====================================================================
    // ROUTAGE ET CONNEXIONS
    // =====================================================================

    @links()
    defineRouting() {
        this.WebhookTrigger.out(0).to(this.FetchLeadsBatch.in(0));
        this.FetchLeadsBatch.out(0).to(this.SplitInBatches.in(0));
        // SplitInBatches output 0 = each item, output 1 = done
        this.SplitInBatches.out(0).to(this.BuildAIPrompt.in(0));
        this.BuildAIPrompt.out(0).to(this.GeminiGenerateMessage.in(0));
        this.GeminiGenerateMessage.out(0).to(this.ParseAIResponse.in(0));
        this.ParseAIResponse.out(0).to(this.SaveMessageToSupabase.in(0));
        this.SaveMessageToSupabase.out(0).to(this.SplitInBatches.in(0)); // loop back
        this.SplitInBatches.out(1).to(this.UpdateBatchProgress.in(0)); // done
        this.UpdateBatchProgress.out(0).to(this.RespondSuccess.in(0));
    }
}
