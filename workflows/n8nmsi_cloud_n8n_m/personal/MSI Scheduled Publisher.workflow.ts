import { workflow, node, links } from '@n8n-as-code/transformer';

// <workflow-map>
// Workflow : MSI Scheduled Publisher
// Nodes   : 11  |  Connections: 10
//
// NODE INDEX
// ──────────────────────────────────────────────────────────────────
// Property name                    Node type (short)         Flags
// EveryMinute                        scheduleTrigger
// GetScheduledPosts                  postgres                   [creds]
// HasPosts                           if
// MarkAsPublishing                   postgres                   [creds]
// PreparePublishData                 code
// CallPublishWebhook                 httpRequest
// CheckResult                        code
// WasSuccessful                      if
// MarkCompleted                      postgres                   [creds]
// MarkFailed                         postgres                   [creds]
// NoPostsToPublish                   noOp
//
// ROUTING MAP
// ──────────────────────────────────────────────────────────────────
// EveryMinute
//    → GetScheduledPosts
//      → HasPosts
//        → MarkAsPublishing
//          → PreparePublishData
//            → CallPublishWebhook
//              → CheckResult
//                → WasSuccessful
//                  → MarkCompleted
//                 .out(1) → MarkFailed
//       .out(1) → NoPostsToPublish
// </workflow-map>

// =====================================================================
// METADATA DU WORKFLOW
// =====================================================================

@workflow({
    id: 'wngTLrIKBYIKgMd6',
    name: 'MSI Scheduled Publisher',
    active: false,
    settings: { executionOrder: 'v1' },
})
export class MsiScheduledPublisherWorkflow {
    // =====================================================================
    // CONFIGURATION DES NOEUDS
    // =====================================================================

    @node({
        name: 'Every Minute',
        type: 'n8n-nodes-base.scheduleTrigger',
        version: 1.2,
        position: [-1392, 288],
    })
    EveryMinute = {
        rule: {
            interval: [
                {
                    field: 'minutes',
                    minutesInterval: 1,
                },
            ],
        },
    };

    @node({
        name: 'Get Scheduled Posts',
        type: 'n8n-nodes-base.postgres',
        version: 2.5,
        position: [-1168, 288],
        credentials: { postgres: { id: 'WnTYs2zvPoE7hDJE', name: 'Postgres account' } },
    })
    GetScheduledPosts = {
        operation: 'executeQuery',
        query: "SELECT * FROM social_posts \nWHERE status = 'scheduled' \nAND scheduled_publish_at IS NOT NULL \nAND scheduled_publish_at <= NOW()\nORDER BY scheduled_publish_at ASC\nLIMIT 5",
        options: {},
    };

    @node({
        name: 'Has Posts?',
        type: 'n8n-nodes-base.if',
        version: 2.2,
        position: [-944, 288],
    })
    HasPosts = {
        conditions: {
            options: {
                caseSensitive: true,
                leftValue: '',
                typeValidation: 'strict',
                version: 2,
            },
            conditions: [
                {
                    id: 'has-posts',
                    leftValue: '={{ $json.id !== undefined && $json.id !== null }}',
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
        name: 'Mark as Publishing',
        type: 'n8n-nodes-base.postgres',
        version: 2.5,
        position: [-720, 192],
        credentials: { postgres: { id: 'WnTYs2zvPoE7hDJE', name: 'Postgres account' } },
    })
    MarkAsPublishing = {
        operation: 'executeQuery',
        query: "=UPDATE social_posts SET status = 'publishing', updated_at = NOW() WHERE id = '{{ $json.id }}'",
        options: {},
    };

    @node({
        name: 'Prepare Publish Data',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-496, 192],
    })
    PreparePublishData = {
        jsCode: "// Prepare post data for publishing\nconst post = $('Get Scheduled Posts').item.json;\n\nconsole.log('==== PUBLISHING SCHEDULED POST ====');\nconsole.log('Post ID:', post.id);\nconsole.log('Topic:', post.topic);\nconsole.log('Scheduled for:', post.scheduled_publish_at);\n\n// Determine which platforms to publish to\nconst platforms = {\n  linkedin: post.publish_linkedin === 'Scheduled' || post.publish_linkedin === 'Yes',\n  facebook: post.publish_facebook === 'Scheduled' || post.publish_facebook === 'Yes',\n  instagram: post.publish_instagram === 'Scheduled' || post.publish_instagram === 'Yes'\n};\n\n// Parse image URLs\nlet imageUrls = [];\nif (post.image_url) {\n  if (post.image_url.startsWith('[')) {\n    try {\n      const parsed = JSON.parse(post.image_url);\n      imageUrls = Array.isArray(parsed) ? parsed : [post.image_url];\n    } catch (e) {\n      imageUrls = [post.image_url];\n    }\n  } else if (post.image_url.includes(',')) {\n    imageUrls = post.image_url.split(',').map(url => url.trim());\n  } else {\n    imageUrls = [post.image_url];\n  }\n}\n\nconsole.log('Platforms:', platforms);\nconsole.log('Images:', imageUrls.length);\n\nreturn [{\n  json: {\n    post_id: post.id,\n    post_type: post.post_type || '',\n    topic: post.topic,\n    headline: post.headline,\n    publish_linkedin: platforms.linkedin ? 'Yes' : 'No',\n    publish_facebook: platforms.facebook ? 'Yes' : 'No',\n    publish_instagram: platforms.instagram ? 'Yes' : 'No',\n    image_urls: imageUrls,\n    image_url: post.image_url\n  }\n}];",
    };

    @node({
        name: 'Call Publish Webhook',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.2,
        position: [-272, 192],
    })
    CallPublishWebhook = {
        method: 'POST',
        url: 'https://n8nmsi.app.n8n.cloud/webhook/msi-publish',
        sendBody: true,
        specifyBody: 'json',
        jsonBody: '={{ JSON.stringify($json) }}',
        options: {},
    };

    @node({
        name: 'Check Result',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-48, 192],
    })
    CheckResult = {
        jsCode: "// Check publish result\nconst response = $input.item.json;\nconst postId = $('Prepare Publish Data').item.json.post_id;\n\nconsole.log('==== PUBLISH RESULT ====');\nconsole.log('Response:', JSON.stringify(response));\n\nconst success = response.success || response.status === 'success' || response.linkedin_success || response.facebook_success;\n\nreturn [{\n  json: {\n    post_id: postId,\n    success: success,\n    response: response\n  }\n}];",
    };

    @node({
        name: 'Was Successful?',
        type: 'n8n-nodes-base.if',
        version: 2.2,
        position: [176, 192],
    })
    WasSuccessful = {
        conditions: {
            options: {
                caseSensitive: true,
                leftValue: '',
                typeValidation: 'strict',
                version: 2,
            },
            conditions: [
                {
                    id: 'is-success',
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
        name: 'Mark Completed',
        type: 'n8n-nodes-base.postgres',
        version: 2.5,
        position: [400, 96],
        credentials: { postgres: { id: 'WnTYs2zvPoE7hDJE', name: 'Postgres account' } },
    })
    MarkCompleted = {
        operation: 'executeQuery',
        query: "=UPDATE social_posts \nSET status = 'completed',\n    publish_linkedin = CASE WHEN publish_linkedin = 'Scheduled' THEN 'Yes' ELSE publish_linkedin END,\n    publish_facebook = CASE WHEN publish_facebook = 'Scheduled' THEN 'Yes' ELSE publish_facebook END,\n    publish_instagram = CASE WHEN publish_instagram = 'Scheduled' THEN 'Yes' ELSE publish_instagram END,\n    scheduled_publish_at = NULL,\n    updated_at = NOW()\nWHERE id = '{{ $json.post_id }}'",
        options: {},
    };

    @node({
        name: 'Mark Failed',
        type: 'n8n-nodes-base.postgres',
        version: 2.5,
        position: [400, 288],
        credentials: { postgres: { id: 'WnTYs2zvPoE7hDJE', name: 'Postgres account' } },
    })
    MarkFailed = {
        operation: 'executeQuery',
        query: "=UPDATE social_posts \nSET status = 'failed',\n    updated_at = NOW()\nWHERE id = '{{ $json.post_id }}'",
        options: {},
    };

    @node({
        name: 'No Posts to Publish',
        type: 'n8n-nodes-base.noOp',
        version: 1,
        position: [-720, 384],
    })
    NoPostsToPublish = {};

    // =====================================================================
    // ROUTAGE ET CONNEXIONS
    // =====================================================================

    @links()
    defineRouting() {
        this.EveryMinute.out(0).to(this.GetScheduledPosts.in(0));
        this.GetScheduledPosts.out(0).to(this.HasPosts.in(0));
        this.HasPosts.out(0).to(this.MarkAsPublishing.in(0));
        this.HasPosts.out(1).to(this.NoPostsToPublish.in(0));
        this.MarkAsPublishing.out(0).to(this.PreparePublishData.in(0));
        this.PreparePublishData.out(0).to(this.CallPublishWebhook.in(0));
        this.CallPublishWebhook.out(0).to(this.CheckResult.in(0));
        this.CheckResult.out(0).to(this.WasSuccessful.in(0));
        this.WasSuccessful.out(0).to(this.MarkCompleted.in(0));
        this.WasSuccessful.out(1).to(this.MarkFailed.in(0));
    }
}
