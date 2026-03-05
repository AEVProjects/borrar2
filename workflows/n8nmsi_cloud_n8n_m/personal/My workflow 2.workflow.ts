import { workflow, node, links } from '@n8n-as-code/transformer';

// <workflow-map>
// Workflow : My workflow 2
// Nodes   : 7  |  Connections: 5
//
// NODE INDEX
// ──────────────────────────────────────────────────────────────────
// Property name                    Node type (short)         Flags
// WebhookEmailOutreach               webhook
// ParseLeadsInput                    code
// AgentEmailWriter                   agent                      [AI]
// OpenaiForEmailWriter               lmChatOpenAi               [creds]
// ParseEmailOutput                   code
// LogEmailToDb                       postgres                   [creds]
// RespondToWebhook                   respondToWebhook
//
// ROUTING MAP
// ──────────────────────────────────────────────────────────────────
// WebhookEmailOutreach
//    → ParseLeadsInput
//      → AgentEmailWriter
//        → ParseEmailOutput
//          → LogEmailToDb
//            → RespondToWebhook
//
// AI CONNECTIONS
// OpenaiForEmailWriter.uses({ ai_languageModel: AgentEmailWriter })
// </workflow-map>

// =====================================================================
// METADATA DU WORKFLOW
// =====================================================================

@workflow({
    id: 'N24TTjMg0hKRtjzk',
    name: 'My workflow 2',
    active: true,
    settings: { executionOrder: 'v1' },
})
export class MyWorkflow2Workflow {
    // =====================================================================
    // CONFIGURATION DES NOEUDS
    // =====================================================================

    @node({
        name: 'Webhook - Email Outreach',
        type: 'n8n-nodes-base.webhook',
        version: 2,
        position: [48, -160],
    })
    WebhookEmailOutreach = {
        httpMethod: 'POST',
        path: 'msi-email-outreach',
        responseMode: 'responseNode',
        options: {
            allowedOrigins: '*',
            rawBody: false,
        },
    };

    @node({
        name: 'Parse Leads Input',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [272, -160],
    })
    ParseLeadsInput = {
        jsCode: "// Parse incoming leads + service info\nconst input = $input.item.json;\nlet data = input.body || input;\nif (typeof data === 'string') data = JSON.parse(data);\n\nconst leads = data.leads || [];\nconst service = data.service || 'IT Services';\nconst tone = data.tone || 'professional';\nconst additionalContext = data.additional_context || '';\n\nconsole.log(`Processing ${leads.length} leads for ${service} outreach`);\n\n// Output one item per lead so we can process each individually\nconst items = leads.map(lead => ({\n  json: {\n    ...lead,\n    service,\n    tone,\n    additional_context: additionalContext\n  }\n}));\n\nreturn items;",
    };

    @node({
        name: 'Agent: Email Writer',
        type: '@n8n/n8n-nodes-langchain.agent',
        version: 1.7,
        position: [496, -160],
    })
    AgentEmailWriter = {
        promptType: 'define',
        text: "=Write a personalized cold outreach email for this lead:\n\nRECIPIENT INFO:\n- Name: {{ $json.first_name }} {{ $json.last_name }}\n- Title: {{ $json.title }}\n- Company: {{ $json.company_name }}\n- Industry: {{ $json.industry }}\n- Company Size: {{ $json.num_employees }} employees\n- Location: {{ $json.city }}, {{ $json.state }}\n- Technologies they use: {{ ($json.technologies || '').substring(0, 500) }}\n- Keywords: {{ ($json.keywords || '').substring(0, 300) }}\n- Company Website: {{ $json.website }}\n\nMSI SERVICE TO PROMOTE: {{ $json.service }}\nTONE: {{ $json.tone }}\nADDITIONAL CONTEXT: {{ $json.additional_context || 'None' }}",
        options: {
            systemMessage:
                '# ROLE: B2B Email Copywriter for MSI Technologies\n\nYou write highly personalized, short cold outreach emails that feel human and relevant.\n\n## OUTPUT FORMAT (JSON ONLY)\nReturn ONLY valid JSON with these fields:\n```json\n{\n  "subject": "Email subject line",\n  "body": "Full email body with \\n for line breaks"\n}\n```\n\n## PERSONALIZATION RULES\n1. ALWAYS reference the recipient\'s SPECIFIC company, industry, or role\n2. ALWAYS connect MSI\'s service to a REAL pain point in their industry\n3. If you see relevant technologies they use, reference how MSI\'s service complements or improves their stack\n4. Use their first name naturally\n5. Keep it under 150 words\n6. No generic "I hope this finds you well"\n7. No pushy sales language\n\n## EMAIL STRUCTURE\n1. **Opening (1-2 sentences):** Reference something specific about their company, role, or industry that shows you did research\n2. **Value Bridge (2-3 sentences):** Connect their situation to how MSI\'s [SERVICE] solves a real problem. Use ONE specific benefit or data point.\n3. **Soft CTA (1 sentence):** Ask a simple question or suggest a brief call. No pressure.\n4. **Signature:**\n   MSI Technologies\n   contact@msitechnologiesinc.com\n   msitechnologiesinc.com\n\n## TONE GUIDE\n- professional: Formal but warm, executive-level language\n- friendly: Casual, conversational, peer-to-peer\n- consultative: Expert sharing an insight, advisory tone\n\n## NEVER\n- Invent specific stats about MSI\n- Use "revolutionary" or "game-changing"\n- Write more than 150 words\n- Include anything other than valid JSON in your response',
        },
    };

    @node({
        name: 'OpenAI for Email Writer',
        type: '@n8n/n8n-nodes-langchain.lmChatOpenAi',
        version: 1.3,
        position: [568, 64],
        credentials: { openAiApi: { id: '13Oqly3WdRAzZVXL', name: 'OpenAi account' } },
    })
    OpenaiForEmailWriter = {
        model: {
            __rl: true,
            value: 'chatgpt-4o-latest',
            mode: 'list',
            cachedResultName: 'chatgpt-4o-latest',
        },
        builtInTools: {},
        options: {},
    };

    @node({
        name: 'Parse Email Output',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [848, -160],
    })
    ParseEmailOutput = {
        jsCode: "// Parse the AI output to extract subject and body\nconst output = $json.output;\nconst lead = $('Parse Leads Input').item.json;\n\nlet emailData;\ntry {\n  // Try to parse JSON directly\n  const jsonMatch = output.match(/\\{[\\s\\S]*\\}/);\n  emailData = JSON.parse(jsonMatch ? jsonMatch[0] : output);\n} catch (e) {\n  // Fallback: extract manually\n  emailData = {\n    subject: `${lead.service} for ${lead.company_name}`,\n    body: output\n  };\n}\n\nreturn [{\n  json: {\n    lead_id: lead.id,\n    to_email: lead.email,\n    to_name: `${lead.first_name} ${lead.last_name}`,\n    company: lead.company_name,\n    subject: emailData.subject,\n    body: emailData.body,\n    service: lead.service\n  }\n}];",
    };

    @node({
        name: 'Log Email to DB',
        type: 'n8n-nodes-base.postgres',
        version: 2.5,
        position: [1072, -160],
        credentials: { postgres: { id: 'WnTYs2zvPoE7hDJE', name: 'Postgres account' } },
    })
    LogEmailToDb = {
        operation: 'executeQuery',
        query: "INSERT INTO email_outreach_log (lead_id, to_email, to_name, company, service, subject, body, status, sent_at)\nVALUES (\n  {{ $json.lead_id }},\n  '{{ $json.to_email.replace(/'/g, \"''\") }}',\n  '{{ $json.to_name.replace(/'/g, \"''\") }}',\n  '{{ $json.company.replace(/'/g, \"''\") }}',\n  '{{ $json.service.replace(/'/g, \"''\") }}',\n  '{{ $json.subject.replace(/'/g, \"''\") }}',\n  '{{ $json.body.replace(/'/g, \"''\").replace(/\\n/g, '\\n') }}',\n  'sent',\n  NOW()\n)\nRETURNING *",
        options: {},
    };

    @node({
        name: 'Respond to Webhook',
        type: 'n8n-nodes-base.respondToWebhook',
        version: 1.1,
        position: [1296, -160],
    })
    RespondToWebhook = {
        respondWith: 'json',
        responseBody: '={{ { "success": true, "message": "Emails generated and sent", "count": $items().length } }}',
        options: {
            responseHeaders: {
                entries: [
                    {
                        name: 'Access-Control-Allow-Origin',
                        value: '*',
                    },
                ],
            },
        },
    };

    // =====================================================================
    // ROUTAGE ET CONNEXIONS
    // =====================================================================

    @links()
    defineRouting() {
        this.WebhookEmailOutreach.out(0).to(this.ParseLeadsInput.in(0));
        this.ParseLeadsInput.out(0).to(this.AgentEmailWriter.in(0));
        this.AgentEmailWriter.out(0).to(this.ParseEmailOutput.in(0));
        this.LogEmailToDb.out(0).to(this.RespondToWebhook.in(0));
        this.ParseEmailOutput.out(0).to(this.LogEmailToDb.in(0));

        this.AgentEmailWriter.uses({
            ai_languageModel: this.OpenaiForEmailWriter.output,
        });
    }
}
