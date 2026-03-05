import { workflow, node, links } from '@n8n-as-code/transformer';

// <workflow-map>
// Workflow : MSI Carousel Unified v12 - Single Flow
// Nodes   : 18  |  Connections: 16
//
// NODE INDEX
// ──────────────────────────────────────────────────────────────────
// Property name                    Node type (short)         Flags
// Webhook                            webhook
// ParseNews                          code
// AiGenerateInputs                   agent                      [AI]
// GeminiInputs                       lmChatGoogleGemini         [creds]
// DownloadLogo                       httpRequest
// PrepareCarousel                    code
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
//
// ROUTING MAP
// ──────────────────────────────────────────────────────────────────
// Webhook
//    → ParseNews
//      → AiGenerateInputs
//        → DownloadLogo
//          → PrepareCarousel
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
//
// AI CONNECTIONS
// GeminiInputs.uses({ ai_languageModel: AiGenerateInputs })
// </workflow-map>

// =====================================================================
// METADATA DU WORKFLOW
// =====================================================================

@workflow({
    id: 'rqFogW4m870AMJzO',
    name: 'MSI Carousel Unified v12 - Single Flow',
    active: false,
    settings: { executionOrder: 'v1' },
})
export class MsiCarouselUnifiedV12SingleFlowWorkflow {
    // =====================================================================
    // CONFIGURATION DES NOEUDS
    // =====================================================================

    @node({
        name: 'Webhook',
        type: 'n8n-nodes-base.webhook',
        version: 2,
        position: [15664, 1168],
    })
    Webhook = {
        httpMethod: 'POST',
        path: 'msi-carousel-gen',
        responseMode: 'responseNode',
        options: {},
    };

    @node({
        name: 'Parse News',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [15888, 1168],
    })
    ParseNews = {
        jsCode: "var wh = $input.first().json;\nvar data = wh;\nif (wh.body) {\n  if (typeof wh.body === 'string') {\n    try { data = JSON.parse(wh.body); } catch(e) { data = wh; }\n  } else { data = wh.body; }\n}\nvar newsItems = data.news_items || [];\nif (newsItems.length === 0 || newsItems.length > 3) {\n  return [{ json: { error: true, message: 'Se requieren entre 1 y 3 noticias' } }];\n}\nvar newsSummary = newsItems.map(function(n, i) {\n  return 'NOTICIA ' + (i+1) + ':\\nTitulo: ' + n.title + '\\nFuente: ' + (n.source || 'Desconocido') + '\\nContenido: ' + (n.content || n.snippet || '').substring(0, 1500);\n}).join('\\n\\n');\nreturn [{ json: { news_items: newsItems, news_count: newsItems.length, news_summary: newsSummary, visual_style: data.visual_style || 'Realistic', request_id: Date.now().toString() } }];",
    };

    @node({
        name: 'AI: Generate Inputs',
        type: '@n8n/n8n-nodes-langchain.agent',
        version: 1.7,
        position: [16112, 1168],
    })
    AiGenerateInputs = {
        promptType: 'define',
        text: '=Generate inputs for MSI Technologies Instagram carousel from {{ $json.news_count }} news:\n\n{{ $json.news_summary }}\n\nRespond ONLY with JSON (no markdown):\n{"topic":"2-3 words","slides":[{"headline":"slide 1"},{"headline":"slide 2"},{"headline":"slide 3"}],"context":"50 words unified context"}',
        options: {
            systemMessage:
                'B2B content strategist for MSI Technologies. Create carousel inputs connecting tech news into unified narrative.\nRULES: NO emojis, headlines 5-8 words max, English only, professional tone.\nRespond ONLY valid JSON.',
        },
    };

    @node({
        name: 'Gemini Inputs',
        type: '@n8n/n8n-nodes-langchain.lmChatGoogleGemini',
        version: 1,
        position: [16192, 1392],
        credentials: { googlePalmApi: { id: 'oF4jKBK0jRbwEPWt', name: 'Google Gemini(PaLM) Api account' } },
    })
    GeminiInputs = {
        options: {},
    };

    @node({
        name: 'Download Logo',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.2,
        position: [16464, 1168],
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
        name: 'Prepare Carousel',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [16688, 1168],
    })
    PrepareCarousel = {
        jsCode: "var aiOut = $('AI: Generate Inputs').first().json.output;\nvar newsData = $('Parse News').first().json;\nvar logoItem = $input.item;\nvar logo = '';\nif (logoItem.binary) {\n  var k = Object.keys(logoItem.binary)[0];\n  var buf = await this.helpers.getBinaryDataBuffer(0, k);\n  logo = buf.toString('base64');\n}\nvar parsed;\ntry {\n  var clean = aiOut.replace(/```json\\n?/g, '').replace(/```\\n?/g, '').trim();\n  var match = clean.match(/\\{[\\s\\S]*\\}/);\n  if (match) clean = match[0];\n  parsed = JSON.parse(clean);\n} catch(e) {\n  parsed = { topic: 'Technology Update', slides: newsData.news_items.map(function(n) { return { headline: n.title.substring(0, 40) }; }), context: '' };\n}\nvar removeEmoji = function(s) { return s ? s.replace(/[\\u{1F600}-\\u{1F64F}\\u{1F300}-\\u{1F5FF}\\u{1F680}-\\u{1F6FF}\\u{2600}-\\u{26FF}]/gu, '').trim() : ''; };\nvar t = removeEmoji(parsed.topic || 'Technology');\nvar sl = parsed.slides || [];\nvar h1 = t;\nvar h2 = sl[0] ? removeEmoji(sl[0].headline) : 'Tech Update';\nvar h3 = sl[1] ? removeEmoji(sl[1].headline) : 'Industry News';\nvar h4 = sl[2] ? removeEmoji(sl[2].headline) : 'Latest Trends';\nvar h5 = 'Stay Informed with MSI';\nvar ctx = removeEmoji(parsed.context || '');\nreturn [{ json: { topic: t, context: ctx, logo: logo, h1: h1, h2: h2, h3: h3, h4: h4, h5: h5, request_id: newsData.request_id } }];",
    };

    @node({
        name: 'Gemini 1',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.2,
        position: [16912, 1168],
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
            "={{ JSON.stringify({ contents: [{ parts: [{ text: 'Create 4:5 Instagram carousel SLIDE 1. STYLE: Photorealistic, professional. PHOTO (top 60%): Diverse business team in modern glass office, 85mm lens, natural light. NO surreal elements. COLORS: MSI Blue #207CE5, White, Cream #F5F5DC. LAYOUT: Top 60% photo, bottom 40% solid #207CE5. TEXT ON BLUE: 1) HEADLINE \"' + $json.h1 + '\" - LARGEST, bold sans-serif, WHITE, centered, 50% width. 2) SUBHEADLINE \"Your Weekly Tech Digest\" - MEDIUM, cream, below. LOGO: DO NOT MODIFY MSI logo - place EXACTLY as provided top-left, small 8% width. CAROUSEL: \"1/5\" SMALL white bottom-left, arrow bottom-right. Edge-to-edge.' }, { inline_data: { mime_type: 'image/png', data: $json.logo } }] }], generationConfig: { responseModalities: ['IMAGE'], imageConfig: { aspectRatio: '4:5' } } }) }}",
        options: {
            timeout: 120000,
        },
    };

    @node({
        name: 'Upload 1',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.2,
        position: [17136, 1168],
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
                    value: "={{ $json.candidates && $json.candidates[0] && $json.candidates[0].content && $json.candidates[0].content.parts && $json.candidates[0].content.parts[0] && $json.candidates[0].content.parts[0].inline_data ? $json.candidates[0].content.parts[0].inline_data.data : '' }}",
                },
            ],
        },
        options: {},
    };

    @node({
        name: 'Gemini 2',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.2,
        position: [17360, 1168],
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
            "={{ JSON.stringify({ contents: [{ parts: [{ text: 'Create 4:5 Instagram carousel SLIDE 2. STYLE: Photorealistic tech news. PHOTO (top 60%): REALISTIC image MATCHING headline \"' + $('Prepare Carousel').item.json.h2 + '\". CONTEXT: If AI = robotics lab. If cloud = data center blue LEDs. If cybersecurity = security ops center. If software = developers coding. 85mm lens. NO surreal. COLORS: #207CE5, White, #F5F5DC. LAYOUT: Top 60% contextual photo, bottom 40% solid #207CE5. TEXT: HEADLINE \"' + $('Prepare Carousel').item.json.h2 + '\" - LARGE, bold, WHITE, 60% width, max 2 lines. LOGO: MSI logo EXACTLY as provided top-left, 6% width. CAROUSEL: \"2/5\" SMALL bottom-left, arrow bottom-right. Edge-to-edge.' }, { inline_data: { mime_type: 'image/png', data: $('Prepare Carousel').item.json.logo } }] }], generationConfig: { responseModalities: ['IMAGE'], imageConfig: { aspectRatio: '4:5' } } }) }}",
        options: {
            timeout: 120000,
        },
    };

    @node({
        name: 'Upload 2',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.2,
        position: [17584, 1168],
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
                    value: "={{ $json.candidates && $json.candidates[0] && $json.candidates[0].content && $json.candidates[0].content.parts && $json.candidates[0].content.parts[0] && $json.candidates[0].content.parts[0].inline_data ? $json.candidates[0].content.parts[0].inline_data.data : '' }}",
                },
            ],
        },
        options: {},
    };

    @node({
        name: 'Gemini 3',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.2,
        position: [17808, 1168],
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
            "={{ JSON.stringify({ contents: [{ parts: [{ text: 'Create 4:5 Instagram carousel SLIDE 3. STYLE: Photorealistic tech news. PHOTO (top 60%): REALISTIC image MATCHING headline \"' + $('Prepare Carousel').item.json.h3 + '\". CONTEXT: If servers = data center. If software = agile workspace. If networking = NOC. If transformation = executives tablets. 85mm lens. NO surreal. COLORS: #207CE5, White, #F5F5DC. LAYOUT: Top 60% contextual photo, bottom 40% solid #207CE5. TEXT: HEADLINE \"' + $('Prepare Carousel').item.json.h3 + '\" - LARGE, bold, WHITE, 60% width, max 2 lines. LOGO: MSI logo EXACTLY as provided top-left, 6% width. CAROUSEL: \"3/5\" SMALL bottom-left, arrow bottom-right. Edge-to-edge.' }, { inline_data: { mime_type: 'image/png', data: $('Prepare Carousel').item.json.logo } }] }], generationConfig: { responseModalities: ['IMAGE'], imageConfig: { aspectRatio: '4:5' } } }) }}",
        options: {
            timeout: 120000,
        },
    };

    @node({
        name: 'Upload 3',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.2,
        position: [18032, 1168],
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
                    value: "={{ $json.candidates && $json.candidates[0] && $json.candidates[0].content && $json.candidates[0].content.parts && $json.candidates[0].content.parts[0] && $json.candidates[0].content.parts[0].inline_data ? $json.candidates[0].content.parts[0].inline_data.data : '' }}",
                },
            ],
        },
        options: {},
    };

    @node({
        name: 'Gemini 4',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.2,
        position: [18256, 1168],
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
            "={{ JSON.stringify({ contents: [{ parts: [{ text: 'Create 4:5 Instagram carousel SLIDE 4. STYLE: Photorealistic tech news. PHOTO (top 60%): REALISTIC image MATCHING headline \"' + $('Prepare Carousel').item.json.h4 + '\". CONTEXT: If innovation = R&D lab. If conference = professional event. If enterprise = boardroom. If trends = modern office. 85mm lens. NO surreal. COLORS: #207CE5, White, #F5F5DC. LAYOUT: Top 60% contextual photo, bottom 40% solid #207CE5. TEXT: HEADLINE \"' + $('Prepare Carousel').item.json.h4 + '\" - LARGE, bold, WHITE, 60% width, max 2 lines. LOGO: MSI logo EXACTLY as provided top-left, 6% width. CAROUSEL: \"4/5\" SMALL bottom-left, arrow bottom-right. Edge-to-edge.' }, { inline_data: { mime_type: 'image/png', data: $('Prepare Carousel').item.json.logo } }] }], generationConfig: { responseModalities: ['IMAGE'], imageConfig: { aspectRatio: '4:5' } } }) }}",
        options: {
            timeout: 120000,
        },
    };

    @node({
        name: 'Upload 4',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.2,
        position: [18480, 1168],
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
                    value: "={{ $json.candidates && $json.candidates[0] && $json.candidates[0].content && $json.candidates[0].content.parts && $json.candidates[0].content.parts[0] && $json.candidates[0].content.parts[0].inline_data ? $json.candidates[0].content.parts[0].inline_data.data : '' }}",
                },
            ],
        },
        options: {},
    };

    @node({
        name: 'Gemini 5',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.2,
        position: [18704, 1168],
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
            '={{ JSON.stringify({ contents: [{ parts: [{ text: \'Create 4:5 Instagram carousel SLIDE 5 - FINAL CTA. STYLE: Photorealistic, warm. PHOTO (top 60%): Professional extending handshake, warm smile, bright office with plants, 85mm portrait, soft light. NO surreal. COLORS: #207CE5, White, #F5F5DC. LAYOUT: Top 60% handshake photo, bottom 40% solid #207CE5. TEXT HIERARCHY: 1) CTA "Stay Informed with MSI" - LARGEST, bold, WHITE, 70% width. 2) "contact@msitechnologiesinc.com" - MEDIUM, cream, email icon. 3) "msitechnologiesinc.com" - SMALL-MEDIUM, cream, globe icon. LOGO: MSI logo EXACTLY as provided top-left, 8% width. CAROUSEL: "5/5" SMALL bottom-left, NO arrow. "Follow Us" SMALL cream bottom-right. Edge-to-edge.\' }, { inline_data: { mime_type: \'image/png\', data: $(\'Prepare Carousel\').item.json.logo } }] }], generationConfig: { responseModalities: [\'IMAGE\'], imageConfig: { aspectRatio: \'4:5\' } } }) }}',
        options: {
            timeout: 120000,
        },
    };

    @node({
        name: 'Upload 5',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.2,
        position: [18928, 1168],
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
                    value: "={{ $json.candidates && $json.candidates[0] && $json.candidates[0].content && $json.candidates[0].content.parts && $json.candidates[0].content.parts[0] && $json.candidates[0].content.parts[0].inline_data ? $json.candidates[0].content.parts[0].inline_data.data : '' }}",
                },
            ],
        },
        options: {},
    };

    @node({
        name: 'Format Final',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [19152, 1168],
    })
    FormatFinal = {
        jsCode: "var p = $('Prepare Carousel').item.json;\nvar u1 = $('Upload 1').item.json.data ? $('Upload 1').item.json.data.url : '';\nvar u2 = $('Upload 2').item.json.data ? $('Upload 2').item.json.data.url : '';\nvar u3 = $('Upload 3').item.json.data ? $('Upload 3').item.json.data.url : '';\nvar u4 = $('Upload 4').item.json.data ? $('Upload 4').item.json.data.url : '';\nvar u5 = $input.item.json.data ? $input.item.json.data.url : '';\nvar slides = [\n  { slide_number: 1, headline: p.h1, image_url: u1 },\n  { slide_number: 2, headline: p.h2, image_url: u2 },\n  { slide_number: 3, headline: p.h3, image_url: u3 },\n  { slide_number: 4, headline: p.h4, image_url: u4 },\n  { slide_number: 5, headline: p.h5, image_url: u5 }\n];\nvar urls = '';\nif (u1) urls += u1;\nif (u2) urls += (urls ? ',' : '') + u2;\nif (u3) urls += (urls ? ',' : '') + u3;\nif (u4) urls += (urls ? ',' : '') + u4;\nif (u5) urls += (urls ? ',' : '') + u5;\nreturn [{ json: { success: true, data: { total_slides: 5, slides: slides }, topic: p.topic, headline: p.h1, context: p.context, post_copy: p.h1 + ' | ' + p.h2 + ' | ' + p.h3 + ' | ' + p.h4 + ' | ' + p.h5, all_image_urls: urls, visual_style: 'Realistic', slide_count: 5, request_id: p.request_id } }];",
    };

    @node({
        name: 'Save to DB',
        type: 'n8n-nodes-base.postgres',
        version: 2.5,
        position: [19376, 1168],
        credentials: { postgres: { id: 'WnTYs2zvPoE7hDJE', name: 'Postgres account' } },
    })
    SaveToDb = {
        operation: 'executeQuery',
        query: "=INSERT INTO social_posts (topic, post_type, visual_style, orientation, headline, context, trend_source, strategy_analysis, post_copy, image_prompt, image_url, status, created_at, updated_at)\nVALUES (\n  '{{ $json.topic.replace(/'/g, \"''\") }}',\n  'Carousel',\n  '{{ $json.visual_style }}',\n  '4:5',\n  '{{ $json.headline.replace(/'/g, \"''\") }}',\n  '{{ ($json.context || '').replace(/'/g, \"''\") }}',\n  'Generated carousel',\n  '{{ $json.slide_count }} slides',\n  '{{ $json.post_copy.replace(/'/g, \"''\") }}',\n  'Unified carousel',\n  '{{ $json.all_image_urls }}',\n  'completed',\n  NOW(),\n  NOW()\n)\nRETURNING *",
        options: {},
    };

    // =====================================================================
    // ROUTAGE ET CONNEXIONS
    // =====================================================================

    @links()
    defineRouting() {
        this.Webhook.out(0).to(this.ParseNews.in(0));
        this.ParseNews.out(0).to(this.AiGenerateInputs.in(0));
        this.AiGenerateInputs.out(0).to(this.DownloadLogo.in(0));
        this.DownloadLogo.out(0).to(this.PrepareCarousel.in(0));
        this.PrepareCarousel.out(0).to(this.Gemini1.in(0));
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

        this.AiGenerateInputs.uses({
            ai_languageModel: this.GeminiInputs.output,
        });
    }
}
