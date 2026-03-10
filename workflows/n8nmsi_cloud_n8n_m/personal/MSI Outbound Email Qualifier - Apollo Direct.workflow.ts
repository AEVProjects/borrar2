import { workflow, node, links } from '@n8n-as-code/transformer';

// <workflow-map>
// Workflow : MSI Outbound Email Qualifier - Apollo Direct
// Nodes   : 15  |  Connections: 15
//
// NODE INDEX
// ──────────────────────────────────────────────────────────────────
// Property name                    Node type (short)         Flags
// WebhookTrigger                     webhook
// ReadLeadFromSupabase               postgres                   [creds]
// EnrichMapIndustrySequence          code
// HasEmail                           if
// LogNoEmail                         postgres                   [creds]
// RespondNoEmail                     respondToWebhook
// MatchPersonInApollo                httpRequest
// CheckApolloContact                 code
// ContactInApollo                    if
// CreateContactInApollo              httpRequest
// GetNewContactId                    code
// AddToApolloSequence                httpRequest
// LogToSupabase                      postgres                   [creds]
// InsertOutreachLog                  postgres                   [creds]
// RespondSuccess                     respondToWebhook
//
// ROUTING MAP
// ──────────────────────────────────────────────────────────────────
// WebhookTrigger
//    → ReadLeadFromSupabase
//      → EnrichMapIndustrySequence
//        → HasEmail
//          → LogNoEmail
//            → RespondNoEmail
//         .out(1) → MatchPersonInApollo
//            → CheckApolloContact
//              → ContactInApollo
//                → CreateContactInApollo
//                  → GetNewContactId
//                    → AddToApolloSequence
//                      → LogToSupabase
//                        → RespondSuccess
//                      → InsertOutreachLog
//               .out(1) → AddToApolloSequence (↩ loop)
// </workflow-map>

// =====================================================================
// METADATA DU WORKFLOW
// =====================================================================

@workflow({
    id: '5kPbxlaaLV517SDJ',
    name: 'MSI Outbound Email Qualifier - Apollo Direct',
    active: true,
    settings: { executionOrder: 'v1', availableInMCP: false, callerPolicy: 'workflowsFromSameOwner' },
})
export class MsiOutboundEmailQualifierApolloDirectWorkflow {
    // =====================================================================
    // CONFIGURATION DES NOEUDS
    // =====================================================================

    @node({
        name: 'Webhook Trigger',
        type: 'n8n-nodes-base.webhook',
        version: 2,
        position: [-352, -112],
    })
    WebhookTrigger = {
        httpMethod: 'POST',
        path: 'msi-outbound-email',
        responseMode: 'responseNode',
        options: {},
    };

    @node({
        name: 'Read Lead from Supabase',
        type: 'n8n-nodes-base.postgres',
        version: 2.5,
        position: [-128, -112],
        credentials: { postgres: { id: 'WnTYs2zvPoE7hDJE', name: 'Postgres account' } },
    })
    ReadLeadFromSupabase = {
        operation: 'executeQuery',
        query: "SELECT * FROM {{ $json.body.source_table || 'apollo_leads' }} WHERE id = {{ $json.body.lead_id }}",
        options: {},
    };

    @node({
        name: 'Enrich & Map Industry Sequence',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [96, -112],
    })
    EnrichMapIndustrySequence = {
        jsCode: "// Enrich lead and determine the best Apollo sequence by industry\nconst items = $input.all();\nconst webhookBody = $('Webhook Trigger').item.json.body || {};\n\n// ===== REPLACE THESE WITH YOUR ACTUAL APOLLO SEQUENCE IDS =====\nconst INDUSTRY_SEQUENCE_MAP = {\n  'financial':      'SEQ_ID_FINANCIAL',\n  'banking':        'SEQ_ID_FINANCIAL',\n  'insurance':      'SEQ_ID_FINANCIAL',\n  'fintech':        'SEQ_ID_FINANCIAL',\n  'healthcare':     'SEQ_ID_HEALTHCARE',\n  'medical':        'SEQ_ID_HEALTHCARE',\n  'pharma':         'SEQ_ID_HEALTHCARE',\n  'biotech':        'SEQ_ID_HEALTHCARE',\n  'hospital':       'SEQ_ID_HEALTHCARE',\n  'retail':         'SEQ_ID_RETAIL',\n  'ecommerce':      'SEQ_ID_RETAIL',\n  'e-commerce':     'SEQ_ID_RETAIL',\n  'consumer':       'SEQ_ID_RETAIL',\n  'manufacturing':  'SEQ_ID_MANUFACTURING',\n  'industrial':     'SEQ_ID_MANUFACTURING',\n  'automotive':     'SEQ_ID_MANUFACTURING',\n  'technology':     'SEQ_ID_TECH',\n  'software':       'SEQ_ID_TECH',\n  'saas':           'SEQ_ID_TECH',\n  'information technology': 'SEQ_ID_TECH',\n  'energy':         'SEQ_ID_ENERGY',\n  'oil':            'SEQ_ID_ENERGY',\n  'utilities':      'SEQ_ID_ENERGY',\n  'renewable':      'SEQ_ID_ENERGY',\n  'education':      'SEQ_ID_EDUCATION',\n  'university':     'SEQ_ID_EDUCATION',\n  'school':         'SEQ_ID_EDUCATION',\n  'legal':          'SEQ_ID_LEGAL',\n  'law':            'SEQ_ID_LEGAL',\n  'real estate':    'SEQ_ID_REALESTATE',\n  'property':       'SEQ_ID_REALESTATE',\n  'construction':   'SEQ_ID_REALESTATE',\n  'logistics':      'SEQ_ID_LOGISTICS',\n  'transportation': 'SEQ_ID_LOGISTICS',\n  'shipping':       'SEQ_ID_LOGISTICS',\n  'supply chain':   'SEQ_ID_LOGISTICS',\n  'telecom':        'SEQ_ID_TELECOM',\n  'telecommunications': 'SEQ_ID_TELECOM'\n};\n\nconst DEFAULT_SEQUENCE = 'SEQ_ID_GENERAL';\n\nreturn items.map(item => {\n  const d = item.json;\n  const industry = (d.industry || '').toLowerCase();\n  \n  let sequenceId = DEFAULT_SEQUENCE;\n  let matchedIndustry = 'General';\n  for (const [keyword, seqId] of Object.entries(INDUSTRY_SEQUENCE_MAP)) {\n    if (industry.includes(keyword)) {\n      sequenceId = seqId;\n      matchedIndustry = keyword;\n      break;\n    }\n  }\n  \n  const employees = parseInt(d.num_employees) || 0;\n  let companySize = '';\n  if (employees > 1000) companySize = 'enterprise';\n  else if (employees > 200) companySize = 'mid-market';\n  else if (employees > 50) companySize = 'growing';\n  else companySize = 'emerging';\n  \n  // Use company_description from DB or from webhook body (pre-built by frontend)\n  const companyDescription = d.company_description || webhookBody.company_description || '';\n  // Use sector from webhook body or compute it\n  const sector = webhookBody.sector || matchedIndustry;\n  \n  return {\n    json: {\n      lead_id: d.id,\n      first_name: d.first_name || '',\n      last_name: d.last_name || '',\n      full_name: `${d.first_name || ''} ${d.last_name || ''}`.trim(),\n      title: d.title || '',\n      company_name: d.company_name || '',\n      email: d.email || '',\n      email_status: d.email_status || '',\n      industry: d.industry || '',\n      matched_industry: matchedIndustry,\n      sector: sector,\n      company_description: companyDescription,\n      num_employees: d.num_employees || '',\n      seniority: d.seniority || '',\n      city: d.city || '',\n      state: d.state || '',\n      country: d.country || '',\n      person_linkedin_url: d.person_linkedin_url || '',\n      website: d.website || '',\n      annual_revenue: d.annual_revenue || '',\n      technologies: d.technologies || '',\n      keywords: d.keywords || '',\n      primary_intent_topic: d.primary_intent_topic || '',\n      primary_intent_score: d.primary_intent_score || '',\n      company_size_category: companySize,\n      apollo_contact_id: d.apollo_contact_id || '',\n      sequence_id: sequenceId,\n      email_attempts: (d.email_attempts || 0) + 1,\n      source_table: webhookBody.source_table || 'apollo_leads'\n    }\n  };\n});",
    };

    @node({
        name: 'Has Email?',
        type: 'n8n-nodes-base.if',
        version: 2.3,
        position: [320, -112],
    })
    HasEmail = {
        conditions: {
            options: {
                caseSensitive: true,
                leftValue: '',
                typeValidation: 'strict',
                version: 3,
            },
            conditions: [
                {
                    id: 'email-check-001',
                    leftValue: '={{ $json.email }}',
                    rightValue: '',
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
        name: 'Log No Email',
        type: 'n8n-nodes-base.postgres',
        version: 2.5,
        position: [544, -208],
        credentials: { postgres: { id: 'WnTYs2zvPoE7hDJE', name: 'Postgres account' } },
    })
    LogNoEmail = {
        operation: 'executeQuery',
        query: "UPDATE {{ $json.source_table || 'apollo_leads' }} SET email_outreach_status = 'no_email', updated_at = NOW() WHERE id = {{ $json.lead_id }}",
        options: {},
    };

    @node({
        name: 'Respond No Email',
        type: 'n8n-nodes-base.respondToWebhook',
        version: 1.1,
        position: [768, -208],
    })
    RespondNoEmail = {
        respondWith: 'json',
        responseBody:
            '={\n  "success": false,\n  "lead_id": {{ $json.lead_id }},\n  "status": "no_email",\n  "message": "Lead has no email address"\n}',
        options: {},
    };

    @node({
        name: 'Match Person in Apollo',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.3,
        position: [544, -16],
    })
    MatchPersonInApollo = {
        method: 'POST',
        url: 'https://api.apollo.io/api/v1/people/match',
        sendBody: true,
        specifyBody: 'json',
        jsonBody:
            '={\n  "api_key": "{{ $(\'Webhook Trigger\').item.json.body.apollo_api_key || \'YOUR_APOLLO_MASTER_API_KEY\' }}",\n  "email": "{{ $json.email }}",\n  "first_name": "{{ $json.first_name }}",\n  "last_name": "{{ $json.last_name }}",\n  "organization_name": "{{ $json.company_name }}"\n}',
        options: {},
    };

    @node({
        name: 'Check Apollo Contact',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [768, -16],
    })
    CheckApolloContact = {
        jsCode: "// Check if contact already exists in Apollo (people/match returns person directly)\nconst matchResult = $input.first().json;\nconst leadData = $('Enrich & Map Industry Sequence').item.json;\n\nlet apolloContactId = leadData.apollo_contact_id;\nlet contactExists = false;\n\n// people/match returns { person: {...} } or { person: null }\nif (matchResult.person && matchResult.person.id) {\n  apolloContactId = matchResult.person.id;\n  contactExists = true;\n} else if (matchResult.contacts && matchResult.contacts.length > 0) {\n  // Fallback for contacts/search response format\n  apolloContactId = matchResult.contacts[0].id;\n  contactExists = true;\n}\n\nreturn [{\n  json: {\n    ...leadData,\n    apollo_contact_id: apolloContactId,\n    contact_exists: contactExists\n  }\n}];",
    };

    @node({
        name: 'Contact in Apollo?',
        type: 'n8n-nodes-base.if',
        version: 2.3,
        position: [992, -16],
    })
    ContactInApollo = {
        conditions: {
            options: {
                caseSensitive: true,
                leftValue: '',
                typeValidation: 'strict',
                version: 3,
            },
            conditions: [
                {
                    id: 'exists-check-001',
                    leftValue: '={{ $json.contact_exists }}',
                    rightValue: true,
                    operator: {
                        type: 'boolean',
                        operation: 'equals',
                    },
                },
            ],
            combinator: 'and',
        },
        options: {},
    };

    @node({
        name: 'Create Contact in Apollo',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.3,
        position: [1216, -88],
    })
    CreateContactInApollo = {
        method: 'POST',
        url: 'https://api.apollo.io/api/v1/contacts',
        sendBody: true,
        specifyBody: 'json',
        jsonBody:
            '={\n  "api_key": "{{ $(\'Webhook Trigger\').item.json.body.apollo_api_key || \'YOUR_APOLLO_MASTER_API_KEY\' }}",\n  "first_name": "{{ $json.first_name }}",\n  "last_name": "{{ $json.last_name }}",\n  "email": "{{ $json.email }}",\n  "organization_name": "{{ $json.company_name }}",\n  "title": "{{ $json.title }}",\n  "website_url": "{{ $json.website }}"\n}',
        options: {},
    };

    @node({
        name: 'Get New Contact ID',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [1440, -88],
    })
    GetNewContactId = {
        jsCode: "// Extract the new contact ID\nconst created = $input.first().json;\nconst prevData = $('Check Apollo Contact').item.json;\n\nreturn [{\n  json: {\n    ...prevData,\n    apollo_contact_id: created.contact?.id || created.id || prevData.apollo_contact_id\n  }\n}];",
    };

    @node({
        name: 'Add to Apollo Sequence',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.3,
        position: [1664, -16],
    })
    AddToApolloSequence = {
        method: 'POST',
        url: '=https://api.apollo.io/api/v1/emailer_campaigns/{{ $json.sequence_id }}/add_contact_ids',
        sendBody: true,
        specifyBody: 'json',
        jsonBody:
            '={\n  "api_key": "{{ $(\'Webhook Trigger\').item.json.body.apollo_api_key || \'YOUR_APOLLO_MASTER_API_KEY\' }}",\n  "contact_ids": ["{{ $json.apollo_contact_id }}"],\n  "emailer_campaign_id": "{{ $json.sequence_id }}",\n  "send_email_from_email_account_id": "{{ $(\'Webhook Trigger\').item.json.body.email_account_id || \'YOUR_APOLLO_EMAIL_ACCOUNT_ID\' }}"\n}',
        options: {},
    };

    @node({
        name: 'Log to Supabase',
        type: 'n8n-nodes-base.postgres',
        version: 2.5,
        position: [1888, -112],
        credentials: { postgres: { id: 'WnTYs2zvPoE7hDJE', name: 'Postgres account' } },
    })
    LogToSupabase = {
        operation: 'executeQuery',
        query: "UPDATE {{ $json.source_table || 'apollo_leads' }} SET \n  email_outreach_status = 'sequence_active',\n  apollo_sequence_status = 'active',\n  apollo_sequence_id = '{{ $json.sequence_id }}',\n  apollo_sequence_added_at = NOW(),\n  apollo_contact_id = '{{ $json.apollo_contact_id }}',\n  email_suggested_service = '{{ $json.sector || $json.matched_industry }}',\n  company_description = '{{ ($json.company_description || '').replace(/'/g, \"''\") }}',\n  email_attempts = {{ $json.email_attempts }},\n  email_outreach_date = NOW(),\n  updated_at = NOW()\nWHERE id = {{ $json.lead_id }}",
        options: {},
    };

    @node({
        name: 'Insert Outreach Log',
        type: 'n8n-nodes-base.postgres',
        version: 2.5,
        position: [1888, 80],
        credentials: { postgres: { id: 'WnTYs2zvPoE7hDJE', name: 'Postgres account' } },
    })
    InsertOutreachLog = {
        operation: 'executeQuery',
        query: "INSERT INTO email_outreach_log (lead_id, to_email, to_name, company, service, subject, body, status, source_table)\nVALUES (\n  {{ $json.lead_id }},\n  '{{ $json.email }}',\n  '{{ $json.full_name }}',\n  '{{ $json.company_name }}',\n  '{{ $json.sector || $json.matched_industry }}',\n  'Apollo Sequence: {{ $json.sector || $json.matched_industry }}',\n  '{{ ($json.company_description || \"Added to Apollo industry sequence\").replace(/'/g, \"''\") }}',\n  'sequence_active',\n  '{{ $json.source_table || 'apollo_leads' }}'\n)",
        options: {},
    };

    @node({
        name: 'Respond Success',
        type: 'n8n-nodes-base.respondToWebhook',
        version: 1.1,
        position: [2112, -112],
    })
    RespondSuccess = {
        respondWith: 'json',
        responseBody:
            '={\n  "success": true,\n  "lead_id": {{ $json.lead_id }},\n  "status": "sequence_active",\n  "sequence": "{{ $json.matched_industry }}",\n  "apollo_contact_id": "{{ $json.apollo_contact_id }}",\n  "message": "Lead added to Apollo sequence for {{ $json.matched_industry }} industry"\n}',
        options: {},
    };

    // =====================================================================
    // ROUTAGE ET CONNEXIONS
    // =====================================================================

    @links()
    defineRouting() {
        this.WebhookTrigger.out(0).to(this.ReadLeadFromSupabase.in(0));
        this.ReadLeadFromSupabase.out(0).to(this.EnrichMapIndustrySequence.in(0));
        this.EnrichMapIndustrySequence.out(0).to(this.HasEmail.in(0));
        this.HasEmail.out(0).to(this.LogNoEmail.in(0));
        this.HasEmail.out(1).to(this.MatchPersonInApollo.in(0));
        this.LogNoEmail.out(0).to(this.RespondNoEmail.in(0));
        this.MatchPersonInApollo.out(0).to(this.CheckApolloContact.in(0));
        this.CheckApolloContact.out(0).to(this.ContactInApollo.in(0));
        this.ContactInApollo.out(0).to(this.CreateContactInApollo.in(0));
        this.ContactInApollo.out(1).to(this.AddToApolloSequence.in(0));
        this.CreateContactInApollo.out(0).to(this.GetNewContactId.in(0));
        this.GetNewContactId.out(0).to(this.AddToApolloSequence.in(0));
        this.AddToApolloSequence.out(0).to(this.LogToSupabase.in(0));
        this.AddToApolloSequence.out(0).to(this.InsertOutreachLog.in(0));
        this.LogToSupabase.out(0).to(this.RespondSuccess.in(0));
    }
}
