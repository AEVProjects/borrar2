import { workflow, node, links } from '@n8n-as-code/transformer';

// <workflow-map>
// Workflow : MSI Content Scheduler - Auto Generate
// Nodes   : 14  |  Connections: 15
//
// NODE INDEX
// ──────────────────────────────────────────────────────────────────
// Property name                    Node type (short)         Flags
// DailyTrigger750Am                  scheduleTrigger
// ManualTriggerWebhook               webhook
// PrepareQuery                       code
// GetTodaySSchedule                  postgres                   [creds]
// HasItems                           if
// LoopOverItems                      splitInBatches
// PrepareWebhookCall                 code
// SetStatusGenerating                postgres                   [creds]
// CallContentWebhook                 httpRequest                [onError→regular]
// CheckResult                        code
// Success                            if
// SetStatusGenerated                 postgres                   [creds]
// SetStatusFailed                    postgres                   [creds]
// NoItemsResponse                    code
//
// ROUTING MAP
// ──────────────────────────────────────────────────────────────────
// DailyTrigger750Am
//    → PrepareQuery
//      → GetTodaySSchedule
//        → HasItems
//          → LoopOverItems
//           .out(1) → PrepareWebhookCall
//              → SetStatusGenerating
//                → CallContentWebhook
//                  → CheckResult
//                    → Success
//                      → SetStatusGenerated
//                        → LoopOverItems (↩ loop)
//                     .out(1) → SetStatusFailed
//                        → LoopOverItems (↩ loop)
//         .out(1) → NoItemsResponse
// ManualTriggerWebhook
//    → PrepareQuery (↩ loop)
// </workflow-map>

// =====================================================================
// METADATA DU WORKFLOW
// =====================================================================

@workflow({
    id: 'SWfcloyRrke5KqjH',
    name: 'MSI Content Scheduler - Auto Generate',
    active: false,
    settings: { executionOrder: 'v1' },
})
export class MsiContentSchedulerAutoGenerateWorkflow {
    // =====================================================================
    // CONFIGURATION DES NOEUDS
    // =====================================================================

    @node({
        name: 'Daily Trigger (7:50 AM)',
        type: 'n8n-nodes-base.scheduleTrigger',
        version: 1.2,
        position: [-2320, 160],
    })
    DailyTrigger750Am = {
        rule: {
            interval: [
                {
                    triggerAtHour: 7,
                    triggerAtMinute: 50,
                },
            ],
        },
    };

    @node({
        name: 'Manual Trigger Webhook',
        type: 'n8n-nodes-base.webhook',
        version: 2,
        position: [-2320, 352],
    })
    ManualTriggerWebhook = {
        httpMethod: 'POST',
        path: 'msi-scheduler-run',
        responseMode: 'lastNode',
        options: {
            allowedOrigins: '*',
        },
    };

    @node({
        name: 'Prepare Query',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-2096, 304],
    })
    PrepareQuery = {
        jsCode: "// Prepare date for today's scheduled items query\nconst today = new Date().toISOString().split('T')[0];\nconst now = new Date().toTimeString().substring(0, 8);\n\nlet triggerSource = 'scheduled';\ntry {\n  triggerSource = $input.item.json.body?.trigger || 'scheduled';\n} catch(e) {}\n\nreturn [{ json: { today, current_time: now, trigger_source: triggerSource } }];",
    };

    @node({
        name: "Get Today's Schedule",
        type: 'n8n-nodes-base.postgres',
        version: 2.5,
        position: [-1872, 304],
        credentials: { postgres: { id: 'WnTYs2zvPoE7hDJE', name: 'Postgres account' } },
    })
    GetTodaySSchedule = {
        operation: 'executeQuery',
        query: "SELECT * FROM content_schedule WHERE scheduled_date = '{{ $json.today }}' AND status = 'scheduled' ORDER BY scheduled_time ASC",
        options: {},
    };

    @node({
        name: 'Has Items?',
        type: 'n8n-nodes-base.if',
        version: 2.2,
        position: [-1648, 304],
    })
    HasItems = {
        conditions: {
            options: {
                caseSensitive: true,
                leftValue: '',
                typeValidation: 'strict',
                version: 2,
            },
            conditions: [
                {
                    id: 'cs-cond-has-items',
                    leftValue: '={{ $json.id }}',
                    rightValue: '',
                    operator: {
                        type: 'string',
                        operation: 'exists',
                        singleValue: true,
                    },
                },
            ],
            combinator: 'and',
        },
        options: {},
    };

    @node({
        name: 'Loop Over Items',
        type: 'n8n-nodes-base.splitInBatches',
        version: 3,
        position: [-1424, 160],
    })
    LoopOverItems = {
        options: {},
    };

    @node({
        name: 'Prepare Webhook Call',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-1200, -32],
    })
    PrepareWebhookCall = {
        jsCode: "// Process current scheduled item and prepare webhook call\nconst item = $input.item.json;\nconst webhookData = typeof item.webhook_data === 'string' ? JSON.parse(item.webhook_data) : item.webhook_data;\nconst contentType = item.content_type;\n\n// Map content types to their webhook paths\nconst WEBHOOK_PATHS = {\n  'generate': '/webhook/70738d02-4bd8-4dac-853f-ba4836aafaf5',\n  'carousel': '/webhook/msi-carousel-v12',\n  'educative': '/webhook/msi-educative-carousel',\n  'video': '/webhook/msi-video-gen',\n  'voice_video': '/webhook/msi-video-extend',\n  'trends': '/webhook/msi-trends-content'\n};\n\nconst N8N_BASE = 'https://n8nmsi.app.n8n.cloud';\nconst webhookPath = WEBHOOK_PATHS[contentType];\n\nif (!webhookPath) {\n  return [{ json: {\n    schedule_id: item.id,\n    title: item.title,\n    content_type: contentType,\n    error: true,\n    error_message: 'Unknown content_type: ' + contentType\n  }}];\n}\n\nconst webhookUrl = N8N_BASE + webhookPath;\n\n// For trends, override payload\nlet payload = webhookData;\nif (contentType === 'trends') {\n  payload = { trigger: 'scheduled', timestamp: new Date().toISOString() };\n}\n\nreturn [{ json: {\n  schedule_id: item.id,\n  content_type: contentType,\n  title: item.title,\n  webhook_url: webhookUrl,\n  payload,\n  scheduled_date: item.scheduled_date,\n  error: false\n} }];",
    };

    @node({
        name: 'Set Status: Generating',
        type: 'n8n-nodes-base.postgres',
        version: 2.5,
        position: [-976, -32],
        credentials: { postgres: { id: 'WnTYs2zvPoE7hDJE', name: 'Postgres account' } },
    })
    SetStatusGenerating = {
        operation: 'executeQuery',
        query: "UPDATE content_schedule SET status = 'generating', updated_at = NOW() WHERE id = '{{ $json.schedule_id }}'",
        options: {},
    };

    @node({
        name: 'Call Content Webhook',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.2,
        position: [-752, -32],
        onError: 'continueRegularOutput',
    })
    CallContentWebhook = {
        method: 'POST',
        url: "={{ $('Prepare Webhook Call').item.json.webhook_url }}",
        sendBody: true,
        specifyBody: 'json',
        jsonBody: "={{ JSON.stringify($('Prepare Webhook Call').item.json.payload) }}",
        options: {
            timeout: 480000,
        },
    };

    @node({
        name: 'Check Result',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-528, -32],
    })
    CheckResult = {
        jsCode: "// Check if webhook call succeeded or failed\nconst response = $input.item.json;\nconst scheduleId = $('Prepare Webhook Call').item.json.schedule_id;\nconst title = $('Prepare Webhook Call').item.json.title;\n\n// Check for error indicators from HTTP request\nconst hasError = response?.error || response?.code === 'ERR_NON_2XX_STATUS_CODE' || response?.statusCode >= 400;\n\nif (hasError) {\n  const errorMsg = response?.message || response?.error || JSON.stringify(response).substring(0, 300);\n  return [{ json: {\n    schedule_id: scheduleId,\n    title,\n    success: false,\n    error_message: errorMsg\n  }}];\n}\n\n// Success - extract post_id if available\nlet postId = null;\ntry {\n  postId = response?.data?.post_id || response?.post_id || null;\n} catch(e) {}\n\nreturn [{ json: {\n  schedule_id: scheduleId,\n  title,\n  post_id: postId,\n  success: true\n} }];",
    };

    @node({
        name: 'Success?',
        type: 'n8n-nodes-base.if',
        version: 2.2,
        position: [-304, -32],
    })
    Success = {
        conditions: {
            options: {
                caseSensitive: true,
                leftValue: '',
                typeValidation: 'strict',
                version: 2,
            },
            conditions: [
                {
                    id: 'cs-cond-success',
                    leftValue: '={{ $json.success }}',
                    rightValue: true,
                    operator: {
                        type: 'boolean',
                        operation: 'true',
                        singleValue: true,
                    },
                },
            ],
            combinator: 'and',
        },
        options: {},
    };

    @node({
        name: 'Set Status: Generated',
        type: 'n8n-nodes-base.postgres',
        version: 2.5,
        position: [-80, -32],
        credentials: { postgres: { id: 'WnTYs2zvPoE7hDJE', name: 'Postgres account' } },
    })
    SetStatusGenerated = {
        operation: 'executeQuery',
        query: "={{ 'UPDATE content_schedule SET status = \\'generated\\', generated_at = NOW(), updated_at = NOW()' + ($json.post_id ? ', generated_post_id = \\'' + $json.post_id + '\\'' : '') + ' WHERE id = \\'' + $json.schedule_id + '\\'' }}",
        options: {},
    };

    @node({
        name: 'Set Status: Failed',
        type: 'n8n-nodes-base.postgres',
        version: 2.5,
        position: [-80, 160],
        credentials: { postgres: { id: 'WnTYs2zvPoE7hDJE', name: 'Postgres account' } },
    })
    SetStatusFailed = {
        operation: 'executeQuery',
        query: "UPDATE content_schedule SET status = 'failed', error_message = '{{ $json.error_message.substring(0, 500).replace(/'/g, \"''\") }}', updated_at = NOW() WHERE id = '{{ $json.schedule_id }}'",
        options: {},
    };

    @node({
        name: 'No Items Response',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-1424, 352],
    })
    NoItemsResponse = {
        jsCode: "return [{ json: { success: true, message: 'No items scheduled for today', items_processed: 0 } }];",
    };

    // =====================================================================
    // ROUTAGE ET CONNEXIONS
    // =====================================================================

    @links()
    defineRouting() {
        this.DailyTrigger750Am.out(0).to(this.PrepareQuery.in(0));
        this.ManualTriggerWebhook.out(0).to(this.PrepareQuery.in(0));
        this.PrepareQuery.out(0).to(this.GetTodaySSchedule.in(0));
        this.GetTodaySSchedule.out(0).to(this.HasItems.in(0));
        this.HasItems.out(0).to(this.LoopOverItems.in(0));
        this.HasItems.out(1).to(this.NoItemsResponse.in(0));
        this.LoopOverItems.out(1).to(this.PrepareWebhookCall.in(0));
        this.PrepareWebhookCall.out(0).to(this.SetStatusGenerating.in(0));
        this.SetStatusGenerating.out(0).to(this.CallContentWebhook.in(0));
        this.CallContentWebhook.out(0).to(this.CheckResult.in(0));
        this.CheckResult.out(0).to(this.Success.in(0));
        this.Success.out(0).to(this.SetStatusGenerated.in(0));
        this.Success.out(1).to(this.SetStatusFailed.in(0));
        this.SetStatusGenerated.out(0).to(this.LoopOverItems.in(0));
        this.SetStatusFailed.out(0).to(this.LoopOverItems.in(0));
    }
}
