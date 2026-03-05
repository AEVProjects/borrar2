import { workflow, node, links } from '@n8n-as-code/transformer';

// <workflow-map>
// Workflow : MSI Video Generator Old
// Nodes   : 16  |  Connections: 14
//
// NODE INDEX
// ──────────────────────────────────────────────────────────────────
// Property name                    Node type (short)         Flags
// WebhookVideoGen                    webhook
// FormatVideoInput                   code
// AgentVideoScript                   agent                      [AI]
// GoogleGeminiChatModel              lmChatGoogleGemini         [creds]
// BuildSettings                      code
// DownloadImage1                     code
// SubmitPart1                        code
// WaitPart1                          wait
// FetchPart1                         code
// DownloadImage2                     code
// SubmitPart2                        code
// WaitPart2                          wait
// FetchPart2                         code
// SignUrls                           code
// UpdateDb                           postgres                   [creds]
// RespondSuccess                     respondToWebhook
//
// ROUTING MAP
// ──────────────────────────────────────────────────────────────────
// WebhookVideoGen
//    → FormatVideoInput
//      → AgentVideoScript
//        → BuildSettings
//          → DownloadImage1
//            → DownloadImage2
//              → SubmitPart1
//                → WaitPart1
//                  → FetchPart1
//                    → SubmitPart2
//                      → WaitPart2
//                        → FetchPart2
//                          → SignUrls
//                            → UpdateDb
//                              → RespondSuccess
//
// AI CONNECTIONS
// GoogleGeminiChatModel.uses({ ai_languageModel: AgentVideoScript })
// </workflow-map>

// =====================================================================
// METADATA DU WORKFLOW
// =====================================================================

@workflow({
    id: 'ktyVF3mlB5unAX8z',
    name: 'MSI Video Generator Old',
    active: false,
    settings: { executionOrder: 'v1' },
})
export class MsiVideoGeneratorOldWorkflow {
    // =====================================================================
    // CONFIGURATION DES NOEUDS
    // =====================================================================

    @node({
        name: 'Webhook - Video Gen',
        type: 'n8n-nodes-base.webhook',
        version: 2,
        position: [87040, -1616],
    })
    WebhookVideoGen = {
        httpMethod: 'POST',
        path: 'msi-video-gen',
        responseMode: 'responseNode',
        options: {
            allowedOrigins: '*',
            rawBody: false,
        },
    };

    @node({
        name: 'Format Video Input',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [87264, -1616],
    })
    FormatVideoInput = {
        jsCode: "const input = $input.item.json;\nlet data = input.body || input;\nif (typeof data === 'string') {\n  try { data = JSON.parse(data); } catch (e) { }\n}\n\nconst prompt = data.prompt || data.video_prompt || '';\nconst start_image_url = data.start_image_url || data.imageUrl || null;\nconst second_image_url = data.second_image_url || data.end_image_url || null;\nconst aspect_ratio = data.aspect_ratio || data.aspectRatio || '9:16';\nconst service = data.service || 'company_intro';\nconst post_id = data.post_id || data.postId || null;\nconst topic = data.topic || '';\nconst duration = Math.min(parseInt(data.duration || '8'), 8);\n\nif (!prompt || prompt.length < 3) throw new Error('prompt is required');\nif (!start_image_url) throw new Error('start_image_url is required');\nif (!second_image_url || second_image_url.length < 5) throw new Error('second_image_url is required');\n\nreturn [{ json: { prompt, duration: String(duration), aspect_ratio, service, post_id, topic, start_image_url, second_image_url } }];",
    };

    @node({
        name: 'Agent: Video Script',
        type: '@n8n/n8n-nodes-langchain.agent',
        version: 1.7,
        position: [87488, -1616],
    })
    AgentVideoScript = {
        promptType: 'define',
        text: '="You write Veo 3.1 image-to-video prompts for MSI Technologies.\\n\\nVideo duration: " + $json.duration + "s per part. Two parts from reference images.\\n\\nSERVICE: " + $json.service + "\\nCONTEXT: " + $json.prompt + "\\nAUDIENCE: " + ($json.topic || \'Business professionals\') + "\\n\\nTHE VIDEO HAS TWO PARTS WITH TWO DIFFERENT PURPOSES:\\n\\nPART 1 — SERVICES: The first person presents MSI Technologies and highlights the company\'s most important services. Reference the SERVICE value above to know which service to emphasize, but always position MSI as a full-service technology company. Key services to reference:\\n- IT Outsourcing: access to global IT talent, managed services, remote teams, scalable tech staffing.\\n- AI Solutions: artificial intelligence, automation, machine learning, data-driven innovation.\\n- Business Process Outsourcing (BPO): outsourcing non-core tasks, back-office operations, process optimization.\\n- IT Management and Cybersecurity: threat detection, security operations, protecting business systems.\\n- Workforce Agility: flexible staffing, adaptive talent solutions, scaling teams.\\n- Executive Consulting: strategic advisory, navigating complexity, driving performance.\\n- Telecom Services: network planning, RF engineering, telecommunications infrastructure.\\nIf SERVICE = company_intro, mention several key services broadly. If SERVICE is specific, lead with that service but frame MSI as a comprehensive solutions provider.\\n\\nPART 2 — WHY CHOOSE MSI: The second person explains why businesses should choose MSI Technologies over competitors. Highlight key differentiators:\\n- 20+ years of industry experience delivering results\\n- Time-zone aligned teams — nearshore advantage for US and global clients\\n- Significant cost reduction (up to 40-60%) without sacrificing quality\\n- Part of the Talentor group, with presence in 40+ countries worldwide\\n- Flexible and tailored strategies adapted to each client\'s unique needs\\n- Nearshore model: proximity, cultural alignment, and real-time collaboration\\n- Proven track record across industries\\nThe tone should be confident and persuasive — closing the sale.\\n\\nCRITICAL SPEECH TIMING (8-second video):\\n- Natural speech = ~2.5 words/second\\n- Max speaking time = 6 seconds (2s silence buffer at end)\\n- MAXIMUM 15 WORDS of dialogue per part\\n- Write EXACT dialogue using colon syntax: The person says: [exact words here]\\n- Count your words carefully - if over 15, rewrite shorter\\n- Both parts must form a COHERENT narrative adapted to the CONTEXT above\\n\\nPROMPT FORMAT (for each part):\\n- Line 1: Brief motion direction (gesture, head movement) - max 10 words\\n- Line 2: EXACT dialogue with colon syntax - max 15 spoken words\\n- NEVER describe person appearance, clothing, background, or setting\\n- NEVER use quotation marks - only colons for speech\\n- Camera stays completely static and locked\\n\\nPART 1 PROMPT RULES:\\n- The person introduces MSI Technologies and presents the key services.\\n- If SERVICE is company_intro, mention multiple services broadly (IT Outsourcing, AI, BPO, Cybersecurity, etc.).\\n- If SERVICE is a specific value, lead with that service but still frame MSI as a comprehensive solutions provider.\\n- Dialogue must be engaging, welcoming, and service-focused.\\n\\nPART 2 PROMPT RULES:\\n- The person starts speaking immediately from frame 1.\\n- The dialogue is about WHY choose MSI — mention differentiators like years of experience, time-zone alignment, cost reduction, global presence through the Talentor network (40+ countries), nearshore advantage, and tailored strategies.\\n- After finishing speech, the person ends with a confident closing gesture (a nod, a subtle smile, or a calm hand gesture) during the last 2 seconds.\\n- The tone is persuasive and confidence-inspiring — like closing a deal.\\n\\nVOICE DESCRIPTION (MANDATORY - include in EVERY prompt):\\n- The person speaks in a clear, confident, professional American English accent (standard US pronunciation).\\n- Warm and articulate tone, like a corporate spokesperson.\\n- Natural conversational pace, not robotic or overly dramatic.\\n- Include this voice direction in each prompt: speaks with a clear American accent, warm professional tone\\n\\nPart 1 presents WHAT MSI offers (services). Part 2 explains WHY choose MSI (differentiators). Together they form a complete persuasive narrative adapted to the CONTEXT provided.\\n\\nOutput format: PART1_PROMPT ||| PART2_PROMPT\\nEach prompt under 280 characters. Max 15 spoken words per part."',
        options: {
            systemMessage:
                "You write Veo 3.1 image-to-video prompts for MSI Technologies. RULES: 1) Write EXACT dialogue with colon syntax (person says: words here). 2) MAX 15 spoken words per part - count carefully. 3) Never describe person/background - only motion and speech. 4) Camera static. No music. 5) PART 1 is about MSI's KEY SERVICES — present what MSI offers. PART 2 is about WHY CHOOSE MSI — differentiators: 20+ years experience, time-zone aligned, cost reduction, Talentor group (40+ countries), nearshore, tailored strategies. 6) Part 2: person speaks from frame 1, ends with a confident closing gesture (nod or smile) in the last 2 seconds. 7) VOICE: ALWAYS specify that the person speaks with a clear American English accent, warm professional tone. Include this voice direction in every prompt. Format: PART1_PROMPT ||| PART2_PROMPT. Under 280 chars each.",
        },
    };

    @node({
        name: 'Google Gemini Chat Model',
        type: '@n8n/n8n-nodes-langchain.lmChatGoogleGemini',
        version: 1,
        position: [87568, -1392],
        credentials: { googlePalmApi: { id: 'oF4jKBK0jRbwEPWt', name: 'Google Gemini(PaLM) Api account' } },
    })
    GoogleGeminiChatModel = {
        options: {},
    };

    @node({
        name: 'Build Settings',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [87840, -1616],
    })
    BuildSettings = {
        jsCode: "const agentOutput = $('Agent: Video Script').item.json.output || '';\nconst f = $('Format Video Input').item.json;\n\nlet p1 = '', p2 = '';\nif (agentOutput.includes('|||')) {\n  const parts = agentOutput.split('|||');\n  p1 = parts[0].trim();\n  p2 = parts[1].trim();\n} else {\n  p1 = agentOutput.substring(0, 300);\n  p2 = agentOutput.substring(0, 300);\n}\n\n// Validate word count in dialogue (extract words after colon)\nfunction countSpokenWords(prompt) {\n  const colonMatch = prompt.match(/says?:\\s*(.+?)(?:\\.|$)/i);\n  if (!colonMatch) return 0;\n  return colonMatch[1].trim().split(/\\s+/).length;\n}\n\nconst w1 = countSpokenWords(p1);\nconst w2 = countSpokenWords(p2);\nif (w1 > 18) { console.log('WARNING: Part 1 has ' + w1 + ' spoken words (max 15)'); }\nif (w2 > 18) { console.log('WARNING: Part 2 has ' + w2 + ' spoken words (max 15)'); }\n\n// Minimal technical suffix - no extra dialogue instructions\nconst suffix1 = ' Clear American English accent, warm professional tone. Present MSI services confidently. Voice only, zero music. Static camera.';\nconst suffix2 = ' Person speaks immediately from first frame with clear American English accent, warm professional tone. Explain why choose MSI — experience, nearshore, cost reduction. Voice only, zero music. Static camera.';\n\nreturn [{\n  json: {\n    PROMPT_PART1: (p1 + suffix1).substring(0, 600),\n    PROMPT_PART2: (p2 + suffix2).substring(0, 600),\n    DURATION: f.duration,\n    ASPECT_RATIO: f.aspect_ratio,\n    POST_ID: f.post_id,\n    ORIGINAL_PROMPT: f.prompt,\n    SERVICE: f.service,\n    START_IMAGE_URL: f.start_image_url,\n    SECOND_IMAGE_URL: f.second_image_url\n  }\n}];",
    };

    @node({
        name: 'Download Image 1',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [88064, -1616],
    })
    DownloadImage1 = {
        jsCode: "// Download start image and base64 encode it (~15s max)\nconst s = $input.item.json;\nconst imgBuffer = await this.helpers.httpRequest({\n  method: 'GET', url: s.START_IMAGE_URL, encoding: 'arraybuffer', timeout: 15000\n});\nconst b64 = Buffer.from(imgBuffer).toString('base64');\nif (b64.length < 100) throw new Error('Start image download failed');\n\nreturn [{ json: { IMAGE_B64: b64, PROMPT_PART1: s.PROMPT_PART1, PROMPT_PART2: s.PROMPT_PART2, DURATION: s.DURATION, ASPECT_RATIO: s.ASPECT_RATIO, POST_ID: s.POST_ID, ORIGINAL_PROMPT: s.ORIGINAL_PROMPT, SERVICE: s.SERVICE, SECOND_IMAGE_URL: s.SECOND_IMAGE_URL } }];",
    };

    @node({
        name: 'Submit Part 1',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [88512, -1616],
    })
    SubmitPart1 = {
        jsCode: "const API_KEY = 'AQ.Ab8RN6JWc_0SSVCvMKy1qINejHQnUEmCGuqPP8bB4ML9Iyb76A';\nconst s = $input.item.json;\nconst EP = 'us-central1-aiplatform.googleapis.com';\nconst PJ = 'gen-lang-client-0392979863';\nconst LOC = 'us-central1';\nconst MDL = 'veo-3.1-generate-001';\nconst veoRes = await this.helpers.httpRequest({\n  method: 'POST',\n  url: 'https://' + EP + '/v1/projects/' + PJ + '/locations/' + LOC + '/publishers/google/models/' + MDL + ':predictLongRunning?key=' + API_KEY,\n  headers: { 'Content-Type':'application/json' },\n  body: JSON.stringify({\n    instances: [{ prompt: s.PROMPT_PART1, image: { bytesBase64Encoded: s.IMAGE_B64, mimeType: 'image/jpeg' } }],\n    parameters: { aspectRatio: s.ASPECT_RATIO, resolution: '720p', sampleCount: 1, durationSeconds: parseInt(s.DURATION), personGeneration: 'allow_all', addWatermark: false, includeRaiReason: true, generateAudio: true, storageUri: 'gs://msi-veo-videos/part1/', negativePrompt: 'background music, soundtrack, instrumental music, musical score, ambient music, piano, guitar, drums, orchestra, synthesizer, melody, rhythm, cinematic score, dramatic music, soft music, upbeat music, ambient sounds, ambient noise, room tone, wind sound, traffic noise, nature sounds, transition animation, visual transitions, fade, dissolve, wipe, crossfade, scene change, new background, different setting, camera movement, camera pan, camera zoom, dolly, static, blurry, text, letters, words, subtitles, captions, watermark, frozen face, closed mouth, logo animation, logo zoom, logo glow, logo enlargement, logo movement' }\n  }),\n  timeout: 30000\n});\nif (!veoRes.name) throw new Error('Veo Part 1 failed: ' + JSON.stringify(veoRes).substring(0, 300));\n\nreturn [{ json: { op1: veoRes.name, PROMPT_PART2: s.PROMPT_PART2, DURATION: s.DURATION, ASPECT_RATIO: s.ASPECT_RATIO, POST_ID: s.POST_ID, ORIGINAL_PROMPT: s.ORIGINAL_PROMPT, IMAGE_B64_2: s.IMAGE_B64_2 } }];",
    };

    @node({
        name: 'Wait Part 1',
        type: 'n8n-nodes-base.wait',
        version: 1.1,
        position: [88736, -1616],
    })
    WaitPart1 = {
        amount: 2,
        unit: 'minutes',
    };

    @node({
        name: 'Fetch Part 1',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [88960, -1616],
    })
    FetchPart1 = {
        jsCode: "const API_KEY = 'AQ.Ab8RN6JWc_0SSVCvMKy1qINejHQnUEmCGuqPP8bB4ML9Iyb76A';\nconst s = $input.item.json;\nconst EP = 'us-central1-aiplatform.googleapis.com';\nconst PJ = 'gen-lang-client-0392979863';\nconst LOC = 'us-central1';\nconst MDL = 'veo-3.1-generate-001';\nconst res = await this.helpers.httpRequest({\n  method: 'POST',\n  url: 'https://' + EP + '/v1/projects/' + PJ + '/locations/' + LOC + '/publishers/google/models/' + MDL + ':fetchPredictOperation?key=' + API_KEY,\n  headers: { 'Content-Type':'application/json' },\n  body: JSON.stringify({ operationName: s.op1 }),\n  timeout: 15000\n});\nlet videoUri = res.response?.videos?.[0]?.gcsUri || res.response?.videos?.[0]?.uri || '';\nif (!videoUri) throw new Error('Part 1 not ready: ' + JSON.stringify(res).substring(0, 400));\n\nreturn [{ json: { video1_gcs_uri: videoUri, PROMPT_PART2: s.PROMPT_PART2, DURATION: s.DURATION, ASPECT_RATIO: s.ASPECT_RATIO, POST_ID: s.POST_ID, ORIGINAL_PROMPT: s.ORIGINAL_PROMPT, IMAGE_B64_2: s.IMAGE_B64_2 } }];",
    };

    @node({
        name: 'Download Image 2',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [88288, -1616],
    })
    DownloadImage2 = {
        jsCode: "// Download second image early (before Veo calls) to avoid post-Wait timeout\nconst s = $input.item.json;\nconst imgBuffer = await this.helpers.httpRequest({\n  method: 'GET', url: s.SECOND_IMAGE_URL, encoding: 'arraybuffer', timeout: 15000\n});\nconst b64 = Buffer.from(imgBuffer).toString('base64');\nif (b64.length < 100) throw new Error('Second image download failed');\n\nreturn [{ json: { IMAGE_B64: s.IMAGE_B64, IMAGE_B64_2: b64, PROMPT_PART1: s.PROMPT_PART1, PROMPT_PART2: s.PROMPT_PART2, DURATION: s.DURATION, ASPECT_RATIO: s.ASPECT_RATIO, POST_ID: s.POST_ID, ORIGINAL_PROMPT: s.ORIGINAL_PROMPT, SERVICE: s.SERVICE } }];",
    };

    @node({
        name: 'Submit Part 2',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [89184, -1616],
    })
    SubmitPart2 = {
        jsCode: "const API_KEY = 'AQ.Ab8RN6JWc_0SSVCvMKy1qINejHQnUEmCGuqPP8bB4ML9Iyb76A';\nconst s = $input.item.json;\nconst EP = 'us-central1-aiplatform.googleapis.com';\nconst PJ = 'gen-lang-client-0392979863';\nconst LOC = 'us-central1';\nconst MDL = 'veo-3.1-generate-001';\nconst veoRes = await this.helpers.httpRequest({\n  method: 'POST',\n  url: 'https://' + EP + '/v1/projects/' + PJ + '/locations/' + LOC + '/publishers/google/models/' + MDL + ':predictLongRunning?key=' + API_KEY,\n  headers: { 'Content-Type':'application/json' },\n  body: JSON.stringify({\n    instances: [{ prompt: s.PROMPT_PART2, image: { bytesBase64Encoded: s.IMAGE_B64_2, mimeType: 'image/jpeg' } }],\n    parameters: { aspectRatio: s.ASPECT_RATIO, resolution: '720p', sampleCount: 1, durationSeconds: parseInt(s.DURATION), personGeneration: 'allow_all', addWatermark: false, includeRaiReason: true, generateAudio: true, storageUri: 'gs://msi-veo-videos/part2/', negativePrompt: 'background music, soundtrack, instrumental music, musical score, ambient music, piano, guitar, drums, orchestra, synthesizer, melody, rhythm, cinematic score, dramatic music, soft music, upbeat music, ambient sounds, ambient noise, room tone, wind sound, traffic noise, nature sounds, transition animation, visual transitions, fade, dissolve, wipe, crossfade, scene change, new background, different setting, camera movement, camera pan, camera zoom, dolly, static, blurry, text, letters, words, subtitles, captions, watermark, frozen face, closed mouth, logo animation, logo zoom, logo glow, logo enlargement, logo movement' }\n  }),\n  timeout: 30000\n});\nif (!veoRes.name) throw new Error('Veo Part 2 failed: ' + JSON.stringify(veoRes).substring(0, 300));\n\nreturn [{ json: { op2: veoRes.name, video1_gcs_uri: s.video1_gcs_uri, DURATION: s.DURATION, POST_ID: s.POST_ID, ORIGINAL_PROMPT: s.ORIGINAL_PROMPT } }];",
    };

    @node({
        name: 'Wait Part 2',
        type: 'n8n-nodes-base.wait',
        version: 1.1,
        position: [89408, -1616],
    })
    WaitPart2 = {
        amount: 2,
        unit: 'minutes',
    };

    @node({
        name: 'Fetch Part 2',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [89632, -1616],
    })
    FetchPart2 = {
        jsCode: "const API_KEY = 'AQ.Ab8RN6JWc_0SSVCvMKy1qINejHQnUEmCGuqPP8bB4ML9Iyb76A';\nconst s = $input.item.json;\nconst EP = 'us-central1-aiplatform.googleapis.com';\nconst PJ = 'gen-lang-client-0392979863';\nconst LOC = 'us-central1';\nconst MDL = 'veo-3.1-generate-001';\nconst res = await this.helpers.httpRequest({\n  method: 'POST',\n  url: 'https://' + EP + '/v1/projects/' + PJ + '/locations/' + LOC + '/publishers/google/models/' + MDL + ':fetchPredictOperation?key=' + API_KEY,\n  headers: { 'Content-Type':'application/json' },\n  body: JSON.stringify({ operationName: s.op2 }),\n  timeout: 15000\n});\nlet videoUri = res.response?.videos?.[0]?.gcsUri || res.response?.videos?.[0]?.uri || '';\nif (!videoUri) throw new Error('Part 2 not ready: ' + JSON.stringify(res).substring(0, 400));\n\nreturn [{ json: { video1_gcs_uri: s.video1_gcs_uri, video2_gcs_uri: videoUri, POST_ID: s.POST_ID, ORIGINAL_PROMPT: s.ORIGINAL_PROMPT, DURATION: s.DURATION } }];",
    };

    @node({
        name: 'Sign URLs',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [89856, -1616],
    })
    SignUrls = {
        jsCode: "// Generate V4 Signed URLs so browser can download videos (~5s max)\nconst crypto = require('crypto');\nconst s = $input.item.json;\nconst SA_EMAIL = 'vertex-express@gen-lang-client-0521438560.iam.gserviceaccount.com';\nconst SA_KEY = '-----BEGIN PRIVATE KEY-----\\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCc8VpJosYd8D0N\\nmFLmh1b7UOsHgm5ZZBvjSkPUhcFXXoEnOoouhWPD5hEl7ziA+3vWpbHLWb5sm0dv\\nqUhHJWwMMbE5eBxmR7m/Cacpy5ZiOVw+180aZqq6e1AsKlEzRvdz66FSgpCeYtmS\\n2nnc8fGwxfB06qpXsxLVQYnwnKzOlKOv9cfXC/29vrbXoPwez9lkVyySa11iGtYA\\nzMU2LjiPrxvcDTbhb1JYD/050fT/m3z2NgclsV6uCEQxNLXOJriJxNuSKhmZufis\\nsoO/rlj/V+RFTrHEQ8zn3nbm6/W2ZANZt94AOo31t5TR6Idt9PxgjodSHJYLEm+0\\nOXC6bAf3AgMBAAECggEASvGn81Ti9YX0qarNH5+OZkmASmA7EL3Q4Wtj07chmfab\\nhx+Zv9hbyT7yfmJrYZB11Qzfx6Lt35AQ/13fkXXp0DLklfRo32Ct7u+Nn1REVlhc\\n1/eWTl6rdYyQPt7gUrO3U+g3655EsBW1Hz7sBZmVmBwVlMdAm8t8GVEILVmr3aN1\\n5CzVUaLtk9UNQDApUfxgdD2kutWTjqM2j3jsgceST6p98dqV2U8HiOXonpMgt02+\\n3PqApJNu4HQhdMzYwX67vKLuqanlZllLlBp8TWvbP3Roo2p57pD8oamT0BKWDUcX\\nfwT19NJOXqRTim6oalvGklTuwhI9+EJJPlAwN7+rAQKBgQDc+sNzQC4Eph4we6g5\\nBQe5QGIchou/ey1vJ+UGbM8vy6bkuy9dPbDZ/XUZTPOYkTPHKvRu544DTIQzH0qJ\\nfG5NKUIYdOInJm8y+r0JybMrrKl0b04/Nrlueb4RjesASMSq3BTVMK5+6Mb4vx7y\\nLS3mYUc8TF+kBEEaw0H4Fwlu9wKBgQC10JcC0kbtCF/MmHwSq9w0PfgbHT3NoZH7\\nyOWeXPfRLybn+I4MMYW3y5KSL5RM3Gxtve2I/HjJPpprZSUJXfMgRLrVkFRV1iFp\\nA/v1vAxoMlYGk3Oh74rwmmMmU7hhPSNL5HxIDHdXVZb5jrOvqIIBcZ6n2qhaCVXH\\nmtjl3QbvAQKBgBxiUWyiV8bdF4+espLwZHeVH4UOezDTP5jBhRd4LnyzKfLDYGgX\\nnnnBpqLjUX7NV9tDVzZPo9wkne57HHXgd8KNhCHkEZB5zVq8/j8dm1gGy5VbHq/b\\n9aGNHa7fjcnxjuFrd3mS0TcX60bUNcNhrj2jTSUfokFNEpe/cN/PBbUtAoGAaSms\\nnyonciT83Gd6pIYZiXIqluxT+iOxP7SU9AOMJ8ehNl2zM+RVFtk9/yZcHhUE9nj7\\n8tctuiFmyiWnxYI9BXYbpzmjPj7r9kUisKFDf+VVktoo8QqQD9kM7ndQV5Y4W0Ze\\niIIFaVONTu22iyzpfZJNlYNJC0MJBbpQKKyuvQECgYEA2q4N8oL3VJwZAuyIVXOm\\ng9SH9dq4pRunQbXJpxaP2mklGNEbLV1YURVGA0oyQE5oh3/4s/LdMERUFkaYBBnl\\nyrcLRELtnjswAy3b2tEp4ULP/rx5MRY4qjNonUrzoXAs937zDIcyjO6/ekxE28sO\\nXk4daXQsjz4PY3lVvJcnKFA=\\n-----END PRIVATE KEY-----\\n';\n\nfunction signUrl(gsUri) {\n  const m = gsUri.match(/^gs:\\/\\/([^\\/]+)\\/(.+)$/);\n  if (!m) return gsUri;\n  const bucket = m[1], objPath = m[2], host = 'storage.googleapis.com';\n  const d = new Date();\n  const pad = v => String(v).padStart(2, '0');\n  const ds = d.getUTCFullYear() + '' + pad(d.getUTCMonth()+1) + pad(d.getUTCDate());\n  const dt = ds + 'T' + pad(d.getUTCHours()) + pad(d.getUTCMinutes()) + pad(d.getUTCSeconds()) + 'Z';\n  const scope = ds + '/auto/storage/goog4_request';\n  const cred = SA_EMAIL + '/' + scope;\n  const qs = 'X-Goog-Algorithm=GOOG4-RSA-SHA256&X-Goog-Credential=' + encodeURIComponent(cred) + '&X-Goog-Date=' + dt + '&X-Goog-Expires=604800&X-Goog-SignedHeaders=host';\n  const objEnc = objPath.split('/').map(p => encodeURIComponent(p)).join('/');\n  const canon = 'GET\\n/' + bucket + '/' + objEnc + '\\n' + qs + '\\nhost:' + host + '\\n\\nhost\\nUNSIGNED-PAYLOAD';\n  const sts = 'GOOG4-RSA-SHA256\\n' + dt + '\\n' + scope + '\\n' + crypto.createHash('sha256').update(canon).digest('hex');\n  const sg = crypto.createSign('RSA-SHA256');\n  sg.update(sts);\n  return 'https://' + host + '/' + bucket + '/' + objEnc + '?' + qs + '&X-Goog-Signature=' + sg.sign(SA_KEY, 'hex');\n}\n\nreturn [{ json: {\n  video1_gcs_uri: s.video1_gcs_uri,\n  video2_gcs_uri: s.video2_gcs_uri,\n  video1_url: signUrl(s.video1_gcs_uri),\n  video2_url: signUrl(s.video2_gcs_uri),\n  POST_ID: s.POST_ID,\n  ORIGINAL_PROMPT: s.ORIGINAL_PROMPT,\n  DURATION: s.DURATION\n} }];",
    };

    @node({
        name: 'Update DB',
        type: 'n8n-nodes-base.postgres',
        version: 2.5,
        position: [90080, -1616],
        credentials: { postgres: { id: 'WnTYs2zvPoE7hDJE', name: 'Postgres account' } },
    })
    UpdateDb = {
        operation: 'executeQuery',
        query: "={{ $json.POST_ID && $json.POST_ID.length > 10 ? `UPDATE social_posts SET video_part1_uri = '${$json.video1_gcs_uri}', video_part2_uri = '${$json.video2_gcs_uri}', video1_signed_url = '${$json.video1_url}', video2_signed_url = '${$json.video2_url}', status = 'video_completed', updated_at = NOW() WHERE id = '${$json.POST_ID}' RETURNING *` : `INSERT INTO social_posts (post_type, status, headline, post_copy, image_url, video_part1_uri, video_part2_uri, video1_signed_url, video2_signed_url, created_at, updated_at) VALUES ('Video', 'video_completed', LEFT('${($json.ORIGINAL_PROMPT || '').replace(/'/g, \"''\")}', 120), '${($json.ORIGINAL_PROMPT || '').replace(/'/g, \"''\")}', '${$json.video1_url}', '${$json.video1_gcs_uri}', '${$json.video2_gcs_uri}', '${$json.video1_url}', '${$json.video2_url}', NOW(), NOW()) RETURNING *` }}",
        options: {},
    };

    @node({
        name: 'Respond Success',
        type: 'n8n-nodes-base.respondToWebhook',
        version: 1.1,
        position: [90304, -1616],
    })
    RespondSuccess = {
        respondWith: 'json',
        responseBody:
            "={{ JSON.stringify({ success: true, message: 'Video generated and saved to database', data: { video1_url: $('Sign URLs').item.json.video1_url, video2_url: $('Sign URLs').item.json.video2_url, video1_gcs_uri: $('Sign URLs').item.json.video1_gcs_uri, video2_gcs_uri: $('Sign URLs').item.json.video2_gcs_uri, post_id: $('Update DB').item.json?.id || $('Sign URLs').item.json.POST_ID, db_saved: true, duration: (parseInt($('Sign URLs').item.json.DURATION) * 2) + 's', prompt: $('Sign URLs').item.json.ORIGINAL_PROMPT, service: $('Build Settings').item.json.SERVICE } }) }}",
        options: {
            responseHeaders: {
                entries: [
                    {
                        name: 'Access-Control-Allow-Origin',
                        value: '*',
                    },
                    {
                        name: 'Access-Control-Allow-Methods',
                        value: 'POST, GET, OPTIONS',
                    },
                    {
                        name: 'Access-Control-Allow-Headers',
                        value: 'Content-Type',
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
        this.WebhookVideoGen.out(0).to(this.FormatVideoInput.in(0));
        this.FormatVideoInput.out(0).to(this.AgentVideoScript.in(0));
        this.AgentVideoScript.out(0).to(this.BuildSettings.in(0));
        this.BuildSettings.out(0).to(this.DownloadImage1.in(0));
        this.DownloadImage1.out(0).to(this.DownloadImage2.in(0));
        this.SubmitPart1.out(0).to(this.WaitPart1.in(0));
        this.WaitPart1.out(0).to(this.FetchPart1.in(0));
        this.FetchPart1.out(0).to(this.SubmitPart2.in(0));
        this.DownloadImage2.out(0).to(this.SubmitPart1.in(0));
        this.SubmitPart2.out(0).to(this.WaitPart2.in(0));
        this.WaitPart2.out(0).to(this.FetchPart2.in(0));
        this.FetchPart2.out(0).to(this.SignUrls.in(0));
        this.SignUrls.out(0).to(this.UpdateDb.in(0));
        this.UpdateDb.out(0).to(this.RespondSuccess.in(0));

        this.AgentVideoScript.uses({
            ai_languageModel: this.GoogleGeminiChatModel.output,
        });
    }
}
