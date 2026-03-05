import { workflow, node, links } from '@n8n-as-code/transformer';

// <workflow-map>
// Workflow : MSI Carousel Generator v11 - Low Memory
// Nodes   : 20  |  Connections: 17
//
// NODE INDEX
// ──────────────────────────────────────────────────────────────────
// Property name                    Node type (short)         Flags
// Webhook                            webhook
// DownloadLogo                       httpRequest
// ParseInput                         code
// Agent1Strategy                     agent                      [AI]
// GeminiStrategy                     lmChatGoogleGemini         [creds]
// Agent2Copy                         agent                      [AI]
// GeminiCopy                         lmChatGoogleGemini         [creds]
// Gemini1                            httpRequest                [creds]
// Upload1                            httpRequest
// Gemini2                            httpRequest                [creds]
// Upload2                            httpRequest
// Gemini3                            httpRequest                [creds]
// Upload3                            httpRequest
// Gemini4                            httpRequest                [creds]
// Upload4                            httpRequest
// Gemini5                            httpRequest                [creds]
// Upload5                            httpRequest
// FormatFinal                        code
// SaveToDb                           postgres                   [creds]
// Respond                            respondToWebhook
//
// ROUTING MAP
// ──────────────────────────────────────────────────────────────────
// Webhook
//    → DownloadLogo
//      → ParseInput
//        → Agent1Strategy
//          → Agent2Copy
//            → Gemini1
//              → Upload1
//                → Gemini2
//                  → Upload2
//                    → Gemini3
//                      → Upload3
//                        → Gemini4
//                          → Upload4
//                            → Gemini5
//                              → Upload5
//                                → FormatFinal
//                                  → SaveToDb
//                                    → Respond
//
// AI CONNECTIONS
// GeminiStrategy.uses({ ai_languageModel: Agent1Strategy })
// GeminiCopy.uses({ ai_languageModel: Agent2Copy })
// </workflow-map>

// =====================================================================
// METADATA DU WORKFLOW
// =====================================================================

@workflow({
    id: 'SPmfyvnUj23KHgTt',
    name: 'MSI Carousel Generator v11 - Low Memory',
    active: false,
    settings: { executionOrder: 'v1' },
})
export class MsiCarouselGeneratorV11LowMemoryWorkflow {
    // =====================================================================
    // CONFIGURATION DES NOEUDS
    // =====================================================================

    @node({
        name: 'Webhook',
        type: 'n8n-nodes-base.webhook',
        version: 2,
        position: [88848, -256],
    })
    Webhook = {
        httpMethod: 'POST',
        path: 'msi-carousel-gen',
        responseMode: 'responseNode',
        options: {},
    };

    @node({
        name: 'Download Logo',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.2,
        position: [89072, -256],
    })
    DownloadLogo = {
        url: 'https://i.ibb.co/S7mKXdxr/MSI-Technologies-Icon.png',
        options: {
            response: {
                response: {
                    responseFormat: 'file',
                },
            },
        },
    };

    @node({
        name: 'Parse Input',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [89296, -256],
    })
    ParseInput = {
        jsCode: "var wh = $('Webhook').item.json;\nvar li = $input.item;\nvar logo = '';\nif (li.binary) {\n  var k = Object.keys(li.binary)[0];\n  var buf = await this.helpers.getBinaryDataBuffer(0, k);\n  logo = buf.toString('base64');\n}\nvar d = wh.body ? (typeof wh.body === 'string' ? JSON.parse(wh.body) : wh.body) : wh;\nvar sl = d.slides || [];\nvar t = d.topic || 'Technology';\nvar h1 = t;\nvar h2 = sl[0] ? sl[0].headline : 'Tech Update';\nvar h3 = sl[1] ? sl[1].headline : 'Industry News';\nvar h4 = sl[2] ? sl[2].headline : 'Latest Trends';\nvar h5 = 'Stay Informed with MSI';\nreturn [{ json: { topic: t, context: d.context || '', logo: logo, h1: h1, h2: h2, h3: h3, h4: h4, h5: h5 } }];",
    };

    @node({
        name: 'Agent 1: Strategy',
        type: '@n8n/n8n-nodes-langchain.agent',
        version: 1.7,
        position: [89520, -256],
    })
    Agent1Strategy = {
        promptType: 'define',
        text: '=Topic: {{ $json.topic }}\nHeadlines: {{ $json.h1 }}, {{ $json.h2 }}, {{ $json.h3 }}, {{ $json.h4 }}',
        options: {
            systemMessage:
                'Create strategy for 5-SLIDE Instagram carousel for MSI Technologies:\n- SLIDE 1: Topic intro\n- SLIDES 2-4: News stories\n- SLIDE 5: CTA contact@msitechnologiesinc.com\n\nOutput: Theme, Hook, Hashtags, Slide summaries',
        },
    };

    @node({
        name: 'Gemini Strategy',
        type: '@n8n/n8n-nodes-langchain.lmChatGoogleGemini',
        version: 1,
        position: [89592, -32],
        credentials: { googlePalmApi: { id: 'oF4jKBK0jRbwEPWt', name: 'Google Gemini(PaLM) Api account' } },
    })
    GeminiStrategy = {
        options: {},
    };

    @node({
        name: 'Agent 2: Copy',
        type: '@n8n/n8n-nodes-langchain.agent',
        version: 1.7,
        position: [89872, -256],
    })
    Agent2Copy = {
        promptType: 'define',
        text: "={{ $('Agent 1: Strategy').item.json.output }}\n\nHeadlines: {{ $('Parse Input').item.json.h1 }}, {{ $('Parse Input').item.json.h2 }}, {{ $('Parse Input').item.json.h3 }}, {{ $('Parse Input').item.json.h4 }}",
        options: {
            systemMessage:
                'Write copy for 5-slide carousel:\nSLIDE 1: Hook headline + SWIPE\nSLIDES 2-4: News headlines + source\nSLIDE 5: Stay Ahead + contact@msitechnologiesinc.com\nRules: 8 words max, active voice',
        },
    };

    @node({
        name: 'Gemini Copy',
        type: '@n8n/n8n-nodes-langchain.lmChatGoogleGemini',
        version: 1,
        position: [89944, -32],
        credentials: { googlePalmApi: { id: 'oF4jKBK0jRbwEPWt', name: 'Google Gemini(PaLM) Api account' } },
    })
    GeminiCopy = {
        options: {},
    };

    @node({
        name: 'Gemini 1',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.2,
        position: [90224, -256],
        credentials: { googlePalmApi: { id: 'oF4jKBK0jRbwEPWt', name: 'Google Gemini(PaLM) Api account' } },
    })
    Gemini1 = {
        method: 'POST',
        url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent',
        authentication: 'predefinedCredentialType',
        nodeCredentialType: 'googlePalmApi',
        sendBody: true,
        specifyBody: 'json',
        jsonBody:
            "={{ JSON.stringify({ contents: [{ parts: [{ text: 'Create a 4:5 Instagram carousel SLIDE 1. STYLE: Photorealistic, professional, modern tech company. PHOTO AREA (top 60%): Realistic photograph of diverse business team collaborating in modern glass office, 85mm lens, natural lighting, sharp focus, professional attire. NO surreal elements, NO floating objects, NO dreamlike effects. COLOR SCHEME: MSI Blue #207CE5, White #FFFFFF, Cream #F5F5DC, Dark Gray #333333. LAYOUT: Top 60% realistic photo, bottom 40% solid MSI Blue #207CE5 background. TEXT HIERARCHY ON BLUE AREA: 1) HEADLINE \"' + $('Parse Input').item.json.h1 + '\" - LARGEST TEXT, bold sans-serif, WHITE, centered, takes 50% width of blue area, 2 lines max. 2) SUBHEADLINE \"Your Weekly Tech Digest\" - MEDIUM TEXT, semibold, cream #F5F5DC, below headline, 30% width. BRANDING: DO NOT MODIFY the provided MSI logo - place it EXACTLY as provided in top-left corner, small size about 8% of image width, keep original colors. CAROUSEL ELEMENTS: Page indicator \"1/5\" SMALL TEXT bottom-left white, swipe arrow icon bottom-right white. NO text on photo area. Edge-to-edge design, NO white margins.' }, { inline_data: { mime_type: 'image/png', data: $('Parse Input').item.json.logo } }] }], generationConfig: { responseModalities: ['IMAGE'], imageConfig: { aspectRatio: '4:5' } } }) }}",
        options: {
            timeout: 120000,
        },
    };

    @node({
        name: 'Upload 1',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.2,
        position: [90448, -256],
    })
    Upload1 = {
        method: 'POST',
        url: 'https://api.imgbb.com/1/upload',
        sendBody: true,
        contentType: 'multipart-form-data',
        bodyParameters: {
            parameters: [
                {
                    name: 'key',
                    value: 'd5e3ee3c8c2fa1a29f6d6dc3c2c79447',
                },
                {
                    name: 'image',
                    value: "={{ $json.candidates && $json.candidates[0] && $json.candidates[0].content && $json.candidates[0].content.parts && $json.candidates[0].content.parts[0] && $json.candidates[0].content.parts[0].inline_data ? $json.candidates[0].content.parts[0].inline_data.data : ($json.candidates && $json.candidates[0] && $json.candidates[0].content && $json.candidates[0].content.parts && $json.candidates[0].content.parts[0] && $json.candidates[0].content.parts[0].inlineData ? $json.candidates[0].content.parts[0].inlineData.data : '') }}",
                },
            ],
        },
        options: {},
    };

    @node({
        name: 'Gemini 2',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.2,
        position: [90672, -256],
        credentials: { googlePalmApi: { id: 'oF4jKBK0jRbwEPWt', name: 'Google Gemini(PaLM) Api account' } },
    })
    Gemini2 = {
        method: 'POST',
        url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent',
        authentication: 'predefinedCredentialType',
        nodeCredentialType: 'googlePalmApi',
        sendBody: true,
        specifyBody: 'json',
        jsonBody:
            "={{ JSON.stringify({ contents: [{ parts: [{ text: 'Create a 4:5 Instagram carousel SLIDE 2. STYLE: Photorealistic, professional tech news photography. PHOTO AREA (top 60%): Generate a REALISTIC photograph that MATCHES this news headline: \"' + $('Parse Input').item.json.h2 + '\". CONTEXTUAL IMAGE RULES: If headline mentions AI/artificial intelligence = realistic robotics lab or AI researchers with screens. If cloud/servers = modern data center with blue LED lighting. If cybersecurity = security operations center. If software = developers coding. If hardware = tech manufacturing. Use 85mm lens, natural lighting. NO surreal elements, NO floating objects. COLOR SCHEME: MSI Blue #207CE5, White #FFFFFF, Cream #F5F5DC. LAYOUT: Top 60% contextual photo, bottom 40% solid MSI Blue #207CE5. TEXT ON BLUE AREA: HEADLINE \"' + $('Parse Input').item.json.h2 + '\" - LARGE TEXT, bold sans-serif, WHITE, centered, takes 60% width, max 2 lines, easy to read. BRANDING: DO NOT MODIFY the MSI logo - place EXACTLY as provided top-left, small size 6% of image width. CAROUSEL: Page \"2/5\" SMALL white bottom-left, swipe arrow bottom-right. Edge-to-edge.' }, { inline_data: { mime_type: 'image/png', data: $('Parse Input').item.json.logo } }] }], generationConfig: { responseModalities: ['IMAGE'], imageConfig: { aspectRatio: '4:5' } } }) }}",
        options: {
            timeout: 120000,
        },
    };

    @node({
        name: 'Upload 2',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.2,
        position: [90896, -256],
    })
    Upload2 = {
        method: 'POST',
        url: 'https://api.imgbb.com/1/upload',
        sendBody: true,
        contentType: 'multipart-form-data',
        bodyParameters: {
            parameters: [
                {
                    name: 'key',
                    value: 'd5e3ee3c8c2fa1a29f6d6dc3c2c79447',
                },
                {
                    name: 'image',
                    value: "={{ $json.candidates && $json.candidates[0] && $json.candidates[0].content && $json.candidates[0].content.parts && $json.candidates[0].content.parts[0] && $json.candidates[0].content.parts[0].inline_data ? $json.candidates[0].content.parts[0].inline_data.data : ($json.candidates && $json.candidates[0] && $json.candidates[0].content && $json.candidates[0].content.parts && $json.candidates[0].content.parts[0] && $json.candidates[0].content.parts[0].inlineData ? $json.candidates[0].content.parts[0].inlineData.data : '') }}",
                },
            ],
        },
        options: {},
    };

    @node({
        name: 'Gemini 3',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.2,
        position: [91120, -256],
        credentials: { googlePalmApi: { id: 'oF4jKBK0jRbwEPWt', name: 'Google Gemini(PaLM) Api account' } },
    })
    Gemini3 = {
        method: 'POST',
        url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent',
        authentication: 'predefinedCredentialType',
        nodeCredentialType: 'googlePalmApi',
        sendBody: true,
        specifyBody: 'json',
        jsonBody:
            "={{ JSON.stringify({ contents: [{ parts: [{ text: 'Create a 4:5 Instagram carousel SLIDE 3. STYLE: Photorealistic, professional tech news. PHOTO AREA (top 60%): Generate a REALISTIC photograph MATCHING this headline: \"' + $('Parse Input').item.json.h3 + '\". CONTEXTUAL IMAGE: If servers/infrastructure = data center with blue LEDs. If software/development = developers in agile workspace. If networking = network operations center. If digital transformation = executives with tablets. If automation = industrial robotics. Use 85mm lens, professional lighting. NO surreal elements. COLOR SCHEME: MSI Blue #207CE5, White #FFFFFF, Cream #F5F5DC. LAYOUT: Top 60% contextual photo, bottom 40% solid MSI Blue #207CE5. TEXT ON BLUE: HEADLINE \"' + $('Parse Input').item.json.h3 + '\" - LARGE TEXT, bold sans-serif, WHITE, centered, 60% width, max 2 lines. BRANDING: DO NOT MODIFY MSI logo - place EXACTLY as provided top-left, small 6% width. CAROUSEL: Page \"3/5\" SMALL white bottom-left, arrow bottom-right. Edge-to-edge.' }, { inline_data: { mime_type: 'image/png', data: $('Parse Input').item.json.logo } }] }], generationConfig: { responseModalities: ['IMAGE'], imageConfig: { aspectRatio: '4:5' } } }) }}",
        options: {
            timeout: 120000,
        },
    };

    @node({
        name: 'Upload 3',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.2,
        position: [91344, -256],
    })
    Upload3 = {
        method: 'POST',
        url: 'https://api.imgbb.com/1/upload',
        sendBody: true,
        contentType: 'multipart-form-data',
        bodyParameters: {
            parameters: [
                {
                    name: 'key',
                    value: 'd5e3ee3c8c2fa1a29f6d6dc3c2c79447',
                },
                {
                    name: 'image',
                    value: "={{ $json.candidates && $json.candidates[0] && $json.candidates[0].content && $json.candidates[0].content.parts && $json.candidates[0].content.parts[0] && $json.candidates[0].content.parts[0].inline_data ? $json.candidates[0].content.parts[0].inline_data.data : ($json.candidates && $json.candidates[0] && $json.candidates[0].content && $json.candidates[0].content.parts && $json.candidates[0].content.parts[0] && $json.candidates[0].content.parts[0].inlineData ? $json.candidates[0].content.parts[0].inlineData.data : '') }}",
                },
            ],
        },
        options: {},
    };

    @node({
        name: 'Gemini 4',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.2,
        position: [91568, -256],
        credentials: { googlePalmApi: { id: 'oF4jKBK0jRbwEPWt', name: 'Google Gemini(PaLM) Api account' } },
    })
    Gemini4 = {
        method: 'POST',
        url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent',
        authentication: 'predefinedCredentialType',
        nodeCredentialType: 'googlePalmApi',
        sendBody: true,
        specifyBody: 'json',
        jsonBody:
            "={{ JSON.stringify({ contents: [{ parts: [{ text: 'Create a 4:5 Instagram carousel SLIDE 4. STYLE: Photorealistic, professional tech news. PHOTO AREA (top 60%): Generate REALISTIC photograph MATCHING headline: \"' + $('Parse Input').item.json.h4 + '\". CONTEXTUAL IMAGE: If innovation = R&D lab. If conferences = professional conference. If enterprise = corporate boardroom. If tech trends = modern tech office. If partnerships = business handshake. Use 85mm lens, sharp focus. NO surreal elements. COLOR SCHEME: MSI Blue #207CE5, White #FFFFFF, Cream #F5F5DC. LAYOUT: Top 60% contextual photo, bottom 40% solid MSI Blue #207CE5. TEXT ON BLUE: HEADLINE \"' + $('Parse Input').item.json.h4 + '\" - LARGE TEXT, bold sans-serif, WHITE, centered, 60% width, max 2 lines. BRANDING: DO NOT MODIFY MSI logo - place EXACTLY as provided top-left, small 6% width. CAROUSEL: Page \"4/5\" SMALL white bottom-left, arrow bottom-right. Edge-to-edge.' }, { inline_data: { mime_type: 'image/png', data: $('Parse Input').item.json.logo } }] }], generationConfig: { responseModalities: ['IMAGE'], imageConfig: { aspectRatio: '4:5' } } }) }}",
        options: {
            timeout: 120000,
        },
    };

    @node({
        name: 'Upload 4',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.2,
        position: [91792, -256],
    })
    Upload4 = {
        method: 'POST',
        url: 'https://api.imgbb.com/1/upload',
        sendBody: true,
        contentType: 'multipart-form-data',
        bodyParameters: {
            parameters: [
                {
                    name: 'key',
                    value: 'd5e3ee3c8c2fa1a29f6d6dc3c2c79447',
                },
                {
                    name: 'image',
                    value: "={{ $json.candidates && $json.candidates[0] && $json.candidates[0].content && $json.candidates[0].content.parts && $json.candidates[0].content.parts[0] && $json.candidates[0].content.parts[0].inline_data ? $json.candidates[0].content.parts[0].inline_data.data : ($json.candidates && $json.candidates[0] && $json.candidates[0].content && $json.candidates[0].content.parts && $json.candidates[0].content.parts[0] && $json.candidates[0].content.parts[0].inlineData ? $json.candidates[0].content.parts[0].inlineData.data : '') }}",
                },
            ],
        },
        options: {},
    };

    @node({
        name: 'Gemini 5',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.2,
        position: [92016, -256],
        credentials: { googlePalmApi: { id: 'oF4jKBK0jRbwEPWt', name: 'Google Gemini(PaLM) Api account' } },
    })
    Gemini5 = {
        method: 'POST',
        url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent',
        authentication: 'predefinedCredentialType',
        nodeCredentialType: 'googlePalmApi',
        sendBody: true,
        specifyBody: 'json',
        jsonBody:
            '={{ JSON.stringify({ contents: [{ parts: [{ text: \'Create a 4:5 Instagram carousel SLIDE 5 - FINAL CTA. STYLE: Photorealistic, warm, professional. PHOTO AREA (top 60%): Realistic photo of friendly professional extending handshake toward camera, warm smile, modern bright office with plants, 85mm portrait lens, soft natural light. NO surreal elements. COLOR SCHEME: MSI Blue #207CE5, White #FFFFFF, Cream #F5F5DC. LAYOUT: Top 60% handshake photo, bottom 40% solid MSI Blue #207CE5. TEXT HIERARCHY ON BLUE: 1) CTA "Stay Informed with MSI" - LARGEST TEXT, bold sans-serif, WHITE, centered, prominent, takes 70% width. 2) Email "contact@msitechnologiesinc.com" - MEDIUM TEXT, cream #F5F5DC, below CTA, with small email icon. 3) Website "msitechnologiesinc.com" - SMALL-MEDIUM TEXT, cream, with globe icon. BRANDING: DO NOT MODIFY MSI logo - place EXACTLY as provided top-left, slightly larger 8% width for final slide. CAROUSEL: Page "5/5" SMALL white bottom-left, NO arrow on final slide. "Follow Us" SMALL cream bottom-right. Edge-to-edge.\' }, { inline_data: { mime_type: \'image/png\', data: $(\'Parse Input\').item.json.logo } }] }], generationConfig: { responseModalities: [\'IMAGE\'], imageConfig: { aspectRatio: \'4:5\' } } }) }}',
        options: {
            timeout: 120000,
        },
    };

    @node({
        name: 'Upload 5',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.2,
        position: [92240, -256],
    })
    Upload5 = {
        method: 'POST',
        url: 'https://api.imgbb.com/1/upload',
        sendBody: true,
        contentType: 'multipart-form-data',
        bodyParameters: {
            parameters: [
                {
                    name: 'key',
                    value: 'd5e3ee3c8c2fa1a29f6d6dc3c2c79447',
                },
                {
                    name: 'image',
                    value: "={{ $json.candidates && $json.candidates[0] && $json.candidates[0].content && $json.candidates[0].content.parts && $json.candidates[0].content.parts[0] && $json.candidates[0].content.parts[0].inline_data ? $json.candidates[0].content.parts[0].inline_data.data : ($json.candidates && $json.candidates[0] && $json.candidates[0].content && $json.candidates[0].content.parts && $json.candidates[0].content.parts[0] && $json.candidates[0].content.parts[0].inlineData ? $json.candidates[0].content.parts[0].inlineData.data : '') }}",
                },
            ],
        },
        options: {},
    };

    @node({
        name: 'Format Final',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [92464, -256],
    })
    FormatFinal = {
        jsCode: "var p = $('Parse Input').item.json;\nvar u1 = $('Upload 1').item.json.data ? $('Upload 1').item.json.data.url : '';\nvar u2 = $('Upload 2').item.json.data ? $('Upload 2').item.json.data.url : '';\nvar u3 = $('Upload 3').item.json.data ? $('Upload 3').item.json.data.url : '';\nvar u4 = $('Upload 4').item.json.data ? $('Upload 4').item.json.data.url : '';\nvar u5 = $input.item.json.data ? $input.item.json.data.url : '';\nvar slides = [\n  { slide_number: 1, headline: p.h1, image_url: u1 },\n  { slide_number: 2, headline: p.h2, image_url: u2 },\n  { slide_number: 3, headline: p.h3, image_url: u3 },\n  { slide_number: 4, headline: p.h4, image_url: u4 },\n  { slide_number: 5, headline: p.h5, image_url: u5 }\n];\nvar urls = '';\nif (u1) urls += u1;\nif (u2) urls += (urls ? ',' : '') + u2;\nif (u3) urls += (urls ? ',' : '') + u3;\nif (u4) urls += (urls ? ',' : '') + u4;\nif (u5) urls += (urls ? ',' : '') + u5;\nreturn [{ json: { success: true, data: { total_slides: 5, slides: slides }, topic: p.topic, headline: p.h1, context: p.context, post_copy: p.h1 + ' | ' + p.h2 + ' | ' + p.h3 + ' | ' + p.h4 + ' | ' + p.h5, all_image_urls: urls, visual_style: 'Realistic', slide_count: 5 } }];",
    };

    @node({
        name: 'Save to DB',
        type: 'n8n-nodes-base.postgres',
        version: 2.5,
        position: [92688, -256],
        credentials: { postgres: { id: 'WnTYs2zvPoE7hDJE', name: 'Postgres account' } },
    })
    SaveToDb = {
        operation: 'executeQuery',
        query: "=INSERT INTO social_posts (topic, post_type, visual_style, orientation, headline, context, trend_source, strategy_analysis, post_copy, image_prompt, image_url, status, created_at, updated_at)\nVALUES (\n  '{{ $json.topic.replace(/'/g, \"''\") }}',\n  'Carousel',\n  '{{ $json.visual_style }}',\n  '4:5',\n  '{{ $json.headline.replace(/'/g, \"''\") }}',\n  '{{ ($json.context || '').replace(/'/g, \"''\") }}',\n  'Generated carousel',\n  '{{ $json.slide_count }} slides',\n  '{{ $json.post_copy.replace(/'/g, \"''\") }}',\n  'Carousel',\n  '{{ $json.all_image_urls }}',\n  'completed',\n  NOW(),\n  NOW()\n)\nRETURNING *",
        options: {},
    };

    @node({
        name: 'Respond',
        type: 'n8n-nodes-base.respondToWebhook',
        version: 1.1,
        position: [92912, -256],
    })
    Respond = {
        respondWith: 'json',
        responseBody:
            "={{ JSON.stringify({ success: true, message: 'Carousel saved', carousel_id: $json.id, slides: $('Format Final').item.json.data.slides }) }}",
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
        this.Webhook.out(0).to(this.DownloadLogo.in(0));
        this.DownloadLogo.out(0).to(this.ParseInput.in(0));
        this.ParseInput.out(0).to(this.Agent1Strategy.in(0));
        this.Agent1Strategy.out(0).to(this.Agent2Copy.in(0));
        this.Agent2Copy.out(0).to(this.Gemini1.in(0));
        this.Gemini1.out(0).to(this.Upload1.in(0));
        this.Upload1.out(0).to(this.Gemini2.in(0));
        this.Gemini2.out(0).to(this.Upload2.in(0));
        this.Upload2.out(0).to(this.Gemini3.in(0));
        this.Gemini3.out(0).to(this.Upload3.in(0));
        this.Upload3.out(0).to(this.Gemini4.in(0));
        this.Gemini4.out(0).to(this.Upload4.in(0));
        this.Upload4.out(0).to(this.Gemini5.in(0));
        this.Gemini5.out(0).to(this.Upload5.in(0));
        this.Upload5.out(0).to(this.FormatFinal.in(0));
        this.FormatFinal.out(0).to(this.SaveToDb.in(0));
        this.SaveToDb.out(0).to(this.Respond.in(0));

        this.Agent1Strategy.uses({
            ai_languageModel: this.GeminiStrategy.output,
        });
        this.Agent2Copy.uses({
            ai_languageModel: this.GeminiCopy.output,
        });
    }
}
