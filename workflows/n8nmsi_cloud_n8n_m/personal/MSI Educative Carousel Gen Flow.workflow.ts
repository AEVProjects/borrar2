import { workflow, node, links } from '@n8n-as-code/transformer';

// <workflow-map>
// Workflow : MSI Educative Carousel Gen Flow
// Nodes   : 22  |  Connections: 18
//
// NODE INDEX
// ──────────────────────────────────────────────────────────────────
// Property name                    Node type (short)         Flags
// WebhookEducativeCarousel           webhook
// FormatInput                        code
// Agent1StrategyAnalyst              agent                      [AI]
// Agent2Copywriter                   agent                      [AI]
// Agent3VisualDirector               agent                      [AI]
// ParseOutput                        code
// CreatePostRecord                   postgres                   [creds]
// PrepareSlides                      code
// InsertSlides                       postgres                   [creds]
// GetSlide1                          code
// GenSlide1                          code
// GetSlide2                          code
// GenSlide2                          code
// GetSlide3                          code
// GenSlide3                          code
// GetSlide4                          code
// GenSlide4                          code
// GetSlide5                          code
// GenSlide5                          code
// GoogleGeminiChatModel              lmChatGoogleGemini         [creds]
// GoogleGeminiChatModel1             lmChatGoogleGemini         [creds]
// GoogleGeminiChatModel2             lmChatGoogleGemini         [creds]
//
// ROUTING MAP
// ──────────────────────────────────────────────────────────────────
// WebhookEducativeCarousel
//    → FormatInput
//      → Agent1StrategyAnalyst
//        → Agent2Copywriter
//          → Agent3VisualDirector
//            → ParseOutput
//              → CreatePostRecord
//                → PrepareSlides
//                  → InsertSlides
//                    → GetSlide1
//                      → GenSlide1
//                        → GetSlide2
//                          → GenSlide2
//                            → GetSlide3
//                              → GenSlide3
//                                → GetSlide4
//                                  → GenSlide4
//                                    → GetSlide5
//                                      → GenSlide5
//
// AI CONNECTIONS
// GoogleGeminiChatModel.uses({ ai_languageModel: Agent1StrategyAnalyst })
// GoogleGeminiChatModel1.uses({ ai_languageModel: Agent2Copywriter })
// GoogleGeminiChatModel2.uses({ ai_languageModel: Agent3VisualDirector })
// </workflow-map>

// =====================================================================
// METADATA DU WORKFLOW
// =====================================================================

@workflow({
    id: 'Ip7rHUAwC3rGLCrr',
    name: 'MSI Educative Carousel Gen Flow',
    active: true,
    settings: { executionOrder: 'v1', callerPolicy: 'workflowsFromSameOwner', availableInMCP: false },
})
export class MsiEducativeCarouselGenFlowWorkflow {
    // =====================================================================
    // CONFIGURATION DES NOEUDS
    // =====================================================================

    @node({
        name: 'Webhook - Educative Carousel',
        type: 'n8n-nodes-base.webhook',
        version: 2,
        position: [3456, 928],
    })
    WebhookEducativeCarousel = {
        httpMethod: 'POST',
        path: 'msi-educative-carousel',
        options: {
            allowedOrigins: 'https://msi-workflow.vercel.app',
        },
    };

    @node({
        name: 'Format Input',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [3680, 928],
    })
    FormatInput = {
        jsCode: "// Format Input for Educational Content\nconst input = $('Webhook - Educative Carousel').item.json;\nlet data = input.body || input;\nif (typeof data === 'string') {\n  try { data = JSON.parse(data); } catch(e) { data = input; }\n}\n\n// Educational content structure\nconst topic = data.topic || 'Business Process Automation';\nconst pillar = data.pillar || 'Educational Content & Technology Learning';\nconst theme = data.theme || 'Professional Development & Skills';\nconst context = data.context || '';\nconst content_format = data.content_format || 'tips';\nconst tone = data.tone || 'casual';\nconst custom_hook = data.custom_hook || '';\n\n// Map content_format to labels\nconst FORMAT_MAP = {\n  tips: { label: 'Quick Tips', slide_prefix: 'Tip' },\n  smart_moves: { label: 'Smart Moves', slide_prefix: 'Move' },\n  did_you_know: { label: 'Did You Know?', slide_prefix: 'Fact' },\n  mistakes: { label: 'Common Mistakes', slide_prefix: 'Mistake' },\n  myths_vs_facts: { label: 'Myths vs Facts', slide_prefix: 'Myth' },\n  how_it_works: { label: 'How It Works', slide_prefix: 'Step' },\n  before_after: { label: 'Before & After', slide_prefix: 'Change' },\n  checklist: { label: 'Quick Checklist', slide_prefix: 'Check' },\n  comparison: { label: 'Side by Side', slide_prefix: 'Option' },\n  step_by_step: { label: 'Step by Step', slide_prefix: 'Step' }\n};\nconst formatInfo = FORMAT_MAP[content_format] || FORMAT_MAP.tips;\n\n// Map tone\nconst TONE_MAP = {\n  casual: 'Casual and friendly, like a smart friend explaining something',\n  bold: 'Bold and direct, confident statements, punchy language',\n  curious: 'Curious and questioning, sparks wonder, uses questions to engage',\n  storytelling: 'Storytelling style, uses mini narratives and relatable scenarios',\n  data_driven: 'Data-driven, leads with numbers and stats, backs up claims'\n};\nconst toneDescription = TONE_MAP[tone] || TONE_MAP.casual;\n\nreturn [{\n  json: {\n    topic: topic,\n    pillar: pillar,\n    theme: theme,\n    context: context,\n    content_format: content_format,\n    format_label: formatInfo.label,\n    slide_prefix: formatInfo.slide_prefix,\n    tone: tone,\n    tone_description: toneDescription,\n    custom_hook: custom_hook,\n    visual_style: 'Realistic Photography',\n    content_type: 'Educational Carousel',\n    color_primary: data.color_primary || '#207CE5',\n    color_secondary: data.color_secondary || '#004AAD'\n  }\n}];",
    };

    @node({
        name: 'Agent 1: Strategy Analyst',
        type: '@n8n/n8n-nodes-langchain.agent',
        version: 1.7,
        position: [3904, 928],
    })
    Agent1StrategyAnalyst = {
        promptType: 'define',
        text: '=CONTENT REQUEST FOR MSI TECHNOLOGIES INSTAGRAM:\n\nTOPIC: {{ $json.topic }}\nPILLAR: {{ $json.pillar }}\nTHEME: {{ $json.theme }}\nCONTENT FORMAT: {{ $json.format_label }} (prefix each point with "{{ $json.slide_prefix }}")\nTONE: {{ $json.tone_description }}\nCUSTOM HOOK: {{ $json.custom_hook }}\nADDITIONAL CONTEXT: {{ $json.context }}\n\nTASK:\nCreate a {{ $json.format_label }} carousel strategy about the EXACT topic provided.\nThe content must follow the "{{ $json.format_label }}" format strictly.\nDo NOT redirect the topic. If the user wants to talk about hiring, talk about hiring. If about AI, talk about AI.\n\nFORMAT-SPECIFIC INSTRUCTIONS:\n- If TIPS: 3 actionable tips the reader can apply right away.\n- If SMART MOVES: 3 clever strategies that give a competitive edge.\n- If DID YOU KNOW: 3 surprising or little-known facts.\n- If COMMON MISTAKES: 3 mistakes to avoid, and what to do instead.\n- If MYTHS VS FACTS: 3 common myths debunked with the real truth.\n- If HOW IT WORKS: 3 stages explaining how something works.\n- If BEFORE & AFTER: 3 transformations showing old way vs new way.\n- If QUICK CHECKLIST: 3 must-do items to check off.\n- If SIDE BY SIDE: 3 comparisons between two approaches.\n- If STEP BY STEP: 3 sequential steps to achieve something.\n\nHOOK INSTRUCTIONS:\n- If CUSTOM HOOK is provided, USE IT as the Slide 1 hook exactly as written.\n- If CUSTOM HOOK is empty, create an original, curiosity-sparking hook.\n- The hook must NOT sound generic or corporate.\n\nCONTENT QUALITY RULES:\n- Cover the topic AS GIVEN. Don\'t force a tech angle if the topic isn\'t about tech.\n- Each point must be SPECIFIC and CONCRETE, not vague.\n- Include real numbers, percentages, or examples when possible.\n- Give FRESH angles - avoid the most obvious takes.\n- Make the reader think "I didn\'t know that" or "That\'s actually useful."\n- NEVER repeat ideas across the 3 points - each must be a distinct angle.\n\nOUTPUT:\n- Hook: [Curiosity-sparking hook for Slide 1]\n- {{ $json.slide_prefix }} 1: [First point - specific and concrete]\n- {{ $json.slide_prefix }} 2: [Second point - different angle]\n- {{ $json.slide_prefix }} 3: [Third point - surprising or actionable]\n- CTA: [Call to engage - match the tone]',
        options: {
            systemMessage:
                "# ROLE: Content Strategist for MSI Technologies Instagram\n\nABOUT MSI TECHNOLOGIES:\nMSI Technologies is a multinational innovation and technology company with 20+ years of experience, 700+ consultants worldwide, and 14 offices across the Americas. Part of MSI GROUP, allied with Talentor International (40+ countries).\n\nMSI SERVICES (use as inspiration — NOT as a constraint):\n- Cloud Computing (migration, infrastructure, data management)\n- Cybersecurity (threat protection, compliance, training)\n- AI & Automation\n- Executive Consulting & Strategy (M&A, IT strategy, governance)\n- Talent Management & Staff Augmentation (nearshore teams, IT outsourcing, workforce agility)\n- Telecommunications & IoT (network optimization, 5G, connected devices)\n- Software Development\n- Digital Transformation\n\nClients include Amdocs, Red Hat, Nokia, Juniper Networks, Huawei, Ericsson, Claro, Globant.\n\nCONTENT APPROACH (CRITICAL):\n- The topic does NOT have to be about technology. It can be about business, leadership, hiring, productivity, trends, culture, or anything relevant to MSI's audience.\n- If the topic naturally connects to an MSI service, reference it lightly — but NEVER force a tech angle.\n- The goal is to create INTERESTING, VALUABLE content that MSI's audience (business leaders, tech managers, decision-makers) actually wants to read.\n- Cover the topic the user asked about — don't redirect it to something else.\n\nVARIETY & FRESHNESS:\n- NEVER use the same structure or phrasing twice.\n- Approach each topic from a UNIQUE angle — surprise the reader.\n- Be SPECIFIC — real examples, real numbers, real scenarios.\n- Each point should feel like a mini-revelation, not a textbook summary.\n\nLANGUAGE & TONE:\n- Write in CASUAL, CONVERSATIONAL English.\n- Use SIMPLE, EVERYDAY words. No fancy vocabulary.\n- BANNED WORDS: guesswork, leverage, revolutionize, streamline, empower, harness, spearhead, synergy, paradigm, optimize, unprecedented, cutting-edge, game-changer, seamless, robust, scalable, holistic, actionable, elevate, amplify, delve, utilize.\n- Adapt to the requested TONE.",
        },
    };

    @node({
        name: 'Agent 2: Copywriter',
        type: '@n8n/n8n-nodes-langchain.agent',
        version: 1.7,
        position: [4256, 928],
    })
    Agent2Copywriter = {
        promptType: 'define',
        text: "=STRATEGY INPUT:\n{{ $('Agent 1: Strategy Analyst').item.json.output }}\n\nCONTEXT:\nTopic: {{ $('Format Input').item.json.topic }}\nPillar: {{ $('Format Input').item.json.pillar }}\nTheme: {{ $('Format Input').item.json.theme }}\nContent Format: {{ $('Format Input').item.json.format_label }}\nSlide Prefix: {{ $('Format Input').item.json.slide_prefix }}\nTone: {{ $('Format Input').item.json.tone_description }}\nCustom Hook: {{ $('Format Input').item.json.custom_hook }}\nAdditional Context: {{ $('Format Input').item.json.context }}\n\nTASK:\nCreate a 5-slide Instagram Carousel (4:5 format) using the \"{{ $('Format Input').item.json.format_label }}\" format.\nALL OUTPUT MUST BE IN ENGLISH.\n\n═══════════════════════════════════════\nSLIDE 1 (COVER):\n═══════════════════════════════════════\n- If Custom Hook is provided and not empty, use it EXACTLY as the headline.\n- If Custom Hook is empty, write a CATCHY, CASUAL headline (5-10 words max).\n- The headline must spark curiosity and feel HUMAN — not robotic or corporate.\n- GOOD hooks: 'Most Businesses Get This Wrong', 'AI Can Actually Do This Now', 'Stop Doing This Manually', 'You Won't Believe What Changed', 'This Saved Us 20 Hours a Week'\n- BAD hooks: anything stiff, generic, or using banned words.\n- Subtext: \"{{ $('Format Input').item.json.format_label }}\" — this tells the reader the content type.\n- Body: LEAVE EMPTY.\n\n═══════════════════════════════════════\nSLIDES 2-4 (CONTENT — FORMAT-SPECIFIC):\n═══════════════════════════════════════\nEach slide presents ONE key point. The headline format MUST match the Content Format:\n\n📌 FORMAT TEMPLATES (use the one that matches):\n\n• QUICK TIPS → 'Tip #N - [casual advice title]'\n  Body: What to do + why it matters (2-3 lines, 15-25 words)\n\n• SMART MOVES → 'Move #N - [clever strategy title]'\n  Body: The strategy + the advantage it gives you (2-3 lines, 15-25 words)\n\n• DID YOU KNOW → 'Fact #N - [surprising statement]'\n  Body: The surprising detail + why it's important (2-3 lines, 15-25 words)\n\n• COMMON MISTAKES → 'Mistake #N - [what people do wrong]'\n  Body: What goes wrong + what to do instead (2-3 lines, 15-25 words)\n\n• MYTHS VS FACTS → 'Myth #N - [the myth]'\n  Body: Line 1: ❌ The myth. Line 2: ✅ The truth. (2-3 lines, 15-25 words)\n\n• HOW IT WORKS → 'Step #N - [phase name]'\n  Body: What happens at this stage + why (2-3 lines, 15-25 words)\n\n• BEFORE & AFTER → 'Change #N - [transformation title]'\n  Body: Line 1: Before... Line 2: After... (2-3 lines, 15-25 words)\n\n• QUICK CHECKLIST → 'Check #N - [item to check]'\n  Body: Why this matters + quick how-to (2-3 lines, 15-25 words)\n\n• SIDE BY SIDE → 'Option #N - [comparison title]'\n  Body: Option A vs Option B + which wins and why (2-3 lines, 15-25 words)\n\n• STEP BY STEP → 'Step #N - [action title]'\n  Body: What to do + expected result (2-3 lines, 15-25 words)\n\n═══════════════════════════════════════\nSLIDE 5 (CTA):\n═══════════════════════════════════════\n- Headline: Engaging question that matches the tone. Examples: 'Want More Like This?', 'Ready to Try It?', 'Which One Surprised You?', 'Save This for Later'\n- Subtext: Collaborative invitation. Examples: 'Let's Work Together' / 'Book a Free Call' / 'Let's Transform Your Business'\n- Body: LEAVE EMPTY\n- Contact Info: \"contact@msitechnologiesinc.com | msitechnologiesinc.com\"\n\n═══════════════════════════════════════\nCONTENT QUALITY RULES:\n═══════════════════════════════════════\n- Make each slide INTERESTING — the reader should learn something new or see things differently.\n- Use SIMPLE, EVERYDAY words — write like you're explaining to a friend.\n- Keep body text SHORT: 15-25 words max per slide. Every word must earn its place.\n- Include SPECIFIC numbers, stats, or examples when possible.\n- Each of the 3 content slides must cover a DIFFERENT angle — no overlapping ideas.\n- NO colons, NO semicolons in any text.\n- Match the requested TONE throughout.\n\nOUTPUT JSON ARRAY:\n[\n  {\n    \"slide_number\": 1,\n    \"headline\": \"...\",\n    \"subtext\": \"{{ $('Format Input').item.json.format_label }}\",\n    \"body\": \"\"\n  },\n  {\n    \"slide_number\": 2,\n    \"headline\": \"...\",\n    \"body\": \"...\"\n  },\n  ... (5 slides total)\n]",
        options: {
            systemMessage:
                "# ROLE: Content Writer for MSI Technologies Instagram\nCreate STRUCTURED educational/informational content for Instagram carousels in ENGLISH.\n\nABOUT MSI TECHNOLOGIES:\nMultinational tech & innovation company. 20+ years, 700+ consultants, 14 offices across the Americas. Services include Cloud, Cybersecurity, AI, Automation, Staff Augmentation, Telecom/IoT, Software Development, Consulting, and Digital Transformation. Clients include Nokia, Red Hat, Amdocs, Juniper, Huawei, Ericsson, Claro, Globant.\n\nCONTENT FREEDOM (CRITICAL):\n- The content does NOT have to be about technology. Write about WHATEVER TOPIC the user asked for.\n- If the topic is about leadership, hiring, productivity, business culture, industry trends — write about THAT. Don't force technology in.\n- If the topic naturally connects to an MSI service, you can mention it subtly. But NEVER twist the topic to make it about tech.\n- The audience is business professionals, tech leaders, and decision-makers.\n\nLANGUAGE RULES (CRITICAL):\n- Write in CASUAL, NATURAL English.\n- Use SHORT, SIMPLE, EVERYDAY words. If a 15-year-old wouldn't understand it, don't use it.\n- BANNED WORDS: guesswork, leverage, revolutionize, harness, streamline, empower, spearhead, synergy, paradigm, optimize, unprecedented, cutting-edge, game-changer, seamless, robust, scalable, holistic, actionable, elevate, amplify, delve, utilize.\n- Use NORMAL alternatives: 'use' not 'leverage', 'improve' not 'optimize', 'helpful' not 'actionable'.\n\nCONTENT QUALITY:\n- NEVER produce generic content. Every slide must have a SPECIFIC, CONCRETE point.\n- Vary sentence structure — mix short punchy lines with slightly longer ones.\n- Lead with the most INTERESTING or SURPRISING angle first.\n- Use analogies and relatable comparisons when they help.\n- Include specific numbers when possible (not 'many companies' but '73% of companies').\n- Each carousel must feel FRESH — like the reader hasn't seen this take before.\n- Adapt your style to the requested TONE.\n\nFORMAT RULES:\n- Respect the content format chosen (Tips, Myths, Mistakes, etc.).\n- Each format has its own headline structure — follow it exactly.\n- Body text: (1) The key point in plain words, (2) WHY IT MATTERS.\n- Keep body text 15-25 words. Tight, clear, useful.\n- NO jargon, NO buzzwords, NO marketing fluff.",
        },
    };

    @node({
        name: 'Agent 3: Visual Director',
        type: '@n8n/n8n-nodes-langchain.agent',
        version: 1.7,
        position: [4608, 928],
    })
    Agent3VisualDirector = {
        promptType: 'define',
        text: "=INPUT FROM COPYWRITER AGENT:\n{{ $('Agent 2: Copywriter').item.json.output }}\n\nTOPIC CONTEXT: {{ $('Format Input').item.json.topic }}\nCONTENT FORMAT: {{ $('Format Input').item.json.format_label }}\n\nTASK:\nFor EACH slide in the JSON array, create a detailed 'image_prompt' field that is SPECIFIC to the topic and varies in visual style.\n\nIMPORTANT: \n- Add ONLY the 'image_prompt' field to each existing slide object\n- Do NOT modify existing fields\n- Return the EXACT same JSON structure with added image_prompt fields\n\nVISUAL STYLE:\n- Slide 1 (Cover): NO PHOTO. Solid blue gradient background with a 3D animated element that DIRECTLY REPRESENTS the topic. Match the 3D element to the actual subject (AI→3D brain, Hiring→3D handshake, Cloud→3D server, Security→3D shield, Leadership→3D podium, Productivity→3D clock, etc.)\n- Slide 2: Professional realistic photo related to the point - NO PEOPLE, show relevant objects and environments\n- Slide 3: Different angle or environment realistic photo - NO PEOPLE\n- Slide 4: Realistic scene related to the point - NO PEOPLE\n- Slide 5: Clean professional look for CTA, NO photo, gradient background\n\nFORMAT-SPECIFIC VISUAL GUIDANCE:\n- MYTHS VS FACTS: Use contrasting visuals — one side showing the myth scenario, other showing reality.\n- BEFORE & AFTER: Show transformation visuals — old cluttered way vs clean modern way.\n- COMMON MISTAKES: Show warning or alert-themed visuals — broken processes, red flags.\n- DID YOU KNOW: Show surprising or unusual angles — unexpected perspectives.\n- TIPS / SMART MOVES / CHECKLIST / STEP BY STEP: Show clean, relevant scenes.\n\nCREATE UNIQUE VISUALS:\n- Each slide must be visually DISTINCT and ORIGINAL\n- Images must MATCH the actual topic — don't default to generic tech if the topic is about hiring, culture, or strategy\n- Avoid repetitive concepts or generic stock photo aesthetics\n\nMSI BRAND GUIDELINES:\n- COLORS: MSI Blue (#207CE5), Dark Blue (#004AAD), Cream (#FFFDF1)\n- LAYOUT: Split layout with 55% image top, 45% text bottom\n- CONSISTENCY: Professional, clean, modern aesthetic\n\nReturn valid JSON.",
        options: {
            systemMessage:
                '# ROLE: Visual Designer for MSI Technologies Instagram\nCreate clean, professional visuals for educational/informational carousels.\n\nKEY PRINCIPLES:\n- Slide 1: NO PHOTO. Solid blue gradient + 3D animated TOPIC-SPECIFIC element that represents the subject (AI→3D brain, Hiring→3D handshake, Security→3D shield, Leadership→3D podium, etc.)\n- Slides 2-4: REALISTIC PHOTOGRAPHY related to the topic\n- ABSOLUTELY NO PEOPLE in any slide. Show ONLY objects, environments, devices, tools, workspaces\n- Make visuals MATCH THE TOPIC — if the carousel is about hiring, show offices and desks. If about cloud, show servers and dashboards. If about productivity, show organized workspaces.\n- Each slide MUST have a visually DIFFERENT scene — no two slides should look similar\n\nHEADING COLORS (CRITICAL):\n- On BLUE backgrounds (Slides 1, 3, 5): Headlines WHITE #FFFFFF, body CREAM #FFFDF1\n- On WHITE backgrounds (Slides 2, 4): Headlines BLUE #207CE5, body DARK GRAY #333333\n\nDESIGN STANDARDS:\n- CLEAN, professional aesthetic with MSI brand colors\n- NO TEXT SHADOWS. Modern flat design\n- Each image must be UNIQUE and ORIGINAL\n- Avoid stock photo clichés or repetitive themes\n\nERROR HANDLING:\n- Always expect a JSON array input\n- If input is not valid JSON, return error message\n- If slides are missing required fields, use defaults\n- Always return valid JSON structure',
        },
    };

    @node({
        name: 'Parse Output',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [4960, 928],
    })
    ParseOutput = {
        jsCode: "// Parse Final JSON Output\nconst rawOutput = $('Agent 3: Visual Director').item.json.output;\nconst cleanedOutput = rawOutput.replace(/```json/g, '').replace(/```/g, '').trim();\nconst generated = JSON.parse(cleanedOutput);\nconst originalInput = $('Format Input').item.json;\n\n// Add metadata to each slide\nconst slides = generated.map(slide => ({\n    ...slide,\n    visual_style: originalInput.visual_style,\n    carousel_id: null\n}));\n\nreturn [{\n    json: {\n        slides: slides,\n        parent_post: {\n            topic: originalInput.topic,\n            pillar: originalInput.pillar,\n            theme: originalInput.theme,\n            headline: slides[0].headline,\n            visual_style: originalInput.visual_style,\n            post_type: 'Educative Carousel',\n            status: 'generating_images'\n        }\n    }\n}];",
    };

    @node({
        name: 'Create Post Record',
        type: 'n8n-nodes-base.postgres',
        version: 2.5,
        position: [5184, 928],
        credentials: { postgres: { id: 'WnTYs2zvPoE7hDJE', name: 'Postgres account' } },
    })
    CreatePostRecord = {
        operation: 'executeQuery',
        query: "=INSERT INTO social_posts (topic, post_type, visual_style, orientation, headline, status, created_at)\nVALUES ('{{ $json.parent_post.topic.replace(/'/g, \"''\") }}', 'Educational', '{{ $json.parent_post.visual_style }}', '4:5', '{{ $json.parent_post.headline.replace(/'/g, \"''\") }}', 'generating', NOW())\nRETURNING id",
        options: {},
    };

    @node({
        name: 'Prepare Slides',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [5408, 928],
    })
    PrepareSlides = {
        jsCode: "// Prepare All Slides Data\nconst postId = $('Create Post Record').item.json.id;\nconst slides = $('Parse Output').item.json.slides;\nconst topic = $('Format Input').item.json.topic || 'Technology';\n\n// Return all slides as individual items for batch insert\n// Embed topic inside visual_style JSON since carousel_slides table doesn't have topic column\nconst slideItems = slides.map(slide => ({\n    json: {\n        carousel_id: postId,\n        slide_number: slide.slide_number,\n        headline: slide.headline,\n        subtext: slide.subtext || '',\n        body_text: slide.body || slide.body_text || '',\n        image_prompt: slide.image_prompt,\n        visual_style: JSON.stringify({ style: slide.visual_style, topic: topic })\n    }\n}));\n\nreturn slideItems;",
    };

    @node({
        name: 'Insert Slides',
        type: 'n8n-nodes-base.postgres',
        version: 2.5,
        position: [5632, 928],
        credentials: { postgres: { id: 'WnTYs2zvPoE7hDJE', name: 'Postgres account' } },
    })
    InsertSlides = {
        schema: {
            __rl: true,
            value: 'public',
            mode: 'list',
            cachedResultName: 'public',
        },
        table: {
            __rl: true,
            value: 'carousel_slides',
            mode: 'list',
            cachedResultName: 'carousel_slides',
        },
        columns: {
            mappingMode: 'autoMapInputData',
            value: {},
            matchingColumns: [],
            schema: [
                {
                    id: 'carousel_id',
                    displayName: 'carousel_id',
                    required: false,
                    defaultMatch: true,
                    display: true,
                    type: 'string',
                    readOnly: false,
                    removed: false,
                },
                {
                    id: 'slide_number',
                    displayName: 'slide_number',
                    required: false,
                    defaultMatch: true,
                    display: true,
                    type: 'integer',
                    readOnly: false,
                    removed: false,
                },
                {
                    id: 'headline',
                    displayName: 'headline',
                    required: false,
                    defaultMatch: true,
                    display: true,
                    type: 'string',
                    readOnly: false,
                    removed: false,
                },
                {
                    id: 'subtext',
                    displayName: 'subtext',
                    required: false,
                    defaultMatch: true,
                    display: true,
                    type: 'string',
                    readOnly: false,
                    removed: false,
                },
                {
                    id: 'body_text',
                    displayName: 'body_text',
                    required: false,
                    defaultMatch: true,
                    display: true,
                    type: 'string',
                    readOnly: false,
                    removed: false,
                },
                {
                    id: 'image_prompt',
                    displayName: 'image_prompt',
                    required: false,
                    defaultMatch: true,
                    display: true,
                    type: 'string',
                    readOnly: false,
                    removed: false,
                },
            ],
        },
        options: {},
    };

    @node({
        name: 'Get Slide 1',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [5856, 928],
    })
    GetSlide1 = {
        jsCode: "// Get all inserted slides and prepare for sequential processing\nconst allInserted = $input.all().map(item => item.json);\n\n// Extract topic from visual_style JSON\nlet topic = 'Technology';\ntry {\n  const vsData = JSON.parse(allInserted[0].visual_style || '{}');\n  topic = vsData.topic || 'Technology';\n} catch(e) {}\n\n// Store all slides data for the chain\nconst s1 = allInserted[0];\nconst s2 = allInserted[1];\nconst s3 = allInserted[2];\nconst s4 = allInserted[3];\nconst s5 = allInserted[4];\n\nreturn [{\n  json: {\n    // Current slide to process\n    id: s1.id,\n    carousel_id: s1.carousel_id,\n    slide_number: s1.slide_number,\n    headline: s1.headline || '',\n    subtext: s1.subtext || '',\n    body_text: s1.body_text || '',\n    image_prompt: s1.image_prompt || '',\n    visual_style: s1.visual_style || '',\n    topic: topic,\n    // All slides for the chain\n    s2_id: s2.id, s2_headline: s2.headline || '', s2_subtext: s2.subtext || '', s2_body: s2.body_text || '', s2_prompt: s2.image_prompt || '', s2_style: s2.visual_style || '',\n    s3_id: s3.id, s3_headline: s3.headline || '', s3_subtext: s3.subtext || '', s3_body: s3.body_text || '', s3_prompt: s3.image_prompt || '', s3_style: s3.visual_style || '',\n    s4_id: s4.id, s4_headline: s4.headline || '', s4_subtext: s4.subtext || '', s4_body: s4.body_text || '', s4_prompt: s4.image_prompt || '', s4_style: s4.visual_style || '',\n    s5_id: s5.id, s5_headline: s5.headline || '', s5_subtext: s5.subtext || '', s5_body: s5.body_text || '', s5_prompt: s5.image_prompt || '', s5_style: s5.visual_style || '',\n    carousel_id_shared: s1.carousel_id\n  }\n}];",
    };

    @node({
        name: 'Gen Slide 1',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [6080, 928],
    })
    GenSlide1 = {
        jsCode: "const input = $input.first().json;\nconst response = await this.helpers.httpRequest({\n  method: 'POST',\n  url: 'https://n8nmsi.app.n8n.cloud/webhook/msi-educative-slide-gen',\n  body: {\n    slide_id: input.id,\n    image_prompt: input.image_prompt,\n    carousel_id: input.carousel_id,\n    slide_number: input.slide_number,\n    headline: input.headline,\n    subtext: input.subtext,\n    body_text: input.body_text,\n    visual_style: input.visual_style,\n    topic: input.topic\n  },\n  json: true\n});\n\n// Pass all slide data to next node\nreturn [{ json: { ...response, ...input } }];",
    };

    @node({
        name: 'Get Slide 2',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [6304, 928],
    })
    GetSlide2 = {
        jsCode: 'const prev = $input.first().json;\n\nreturn [{\n  json: {\n    id: prev.s2_id,\n    carousel_id: prev.carousel_id_shared,\n    slide_number: 2,\n    headline: prev.s2_headline,\n    subtext: prev.s2_subtext,\n    body_text: prev.s2_body,\n    image_prompt: prev.s2_prompt,\n    visual_style: prev.s2_style,\n    topic: prev.topic,\n    // Pass remaining slides\n    s3_id: prev.s3_id, s3_headline: prev.s3_headline, s3_subtext: prev.s3_subtext, s3_body: prev.s3_body, s3_prompt: prev.s3_prompt, s3_style: prev.s3_style,\n    s4_id: prev.s4_id, s4_headline: prev.s4_headline, s4_subtext: prev.s4_subtext, s4_body: prev.s4_body, s4_prompt: prev.s4_prompt, s4_style: prev.s4_style,\n    s5_id: prev.s5_id, s5_headline: prev.s5_headline, s5_subtext: prev.s5_subtext, s5_body: prev.s5_body, s5_prompt: prev.s5_prompt, s5_style: prev.s5_style,\n    carousel_id_shared: prev.carousel_id_shared\n  }\n}];',
    };

    @node({
        name: 'Gen Slide 2',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [6528, 928],
    })
    GenSlide2 = {
        jsCode: "const input = $input.first().json;\nconst response = await this.helpers.httpRequest({\n  method: 'POST',\n  url: 'https://n8nmsi.app.n8n.cloud/webhook/msi-educative-slide-gen',\n  body: {\n    slide_id: input.id,\n    image_prompt: input.image_prompt,\n    carousel_id: input.carousel_id,\n    slide_number: input.slide_number,\n    headline: input.headline,\n    subtext: input.subtext,\n    body_text: input.body_text,\n    visual_style: input.visual_style,\n    topic: input.topic\n  },\n  json: true\n});\n\n// Pass all slide data to next node\nreturn [{ json: { ...response, ...input } }];",
    };

    @node({
        name: 'Get Slide 3',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [6752, 928],
    })
    GetSlide3 = {
        jsCode: 'const prev = $input.first().json;\n\nreturn [{\n  json: {\n    id: prev.s3_id,\n    carousel_id: prev.carousel_id_shared,\n    slide_number: 3,\n    headline: prev.s3_headline,\n    subtext: prev.s3_subtext,\n    body_text: prev.s3_body,\n    image_prompt: prev.s3_prompt,\n    visual_style: prev.s3_style,\n    topic: prev.topic,\n    // Pass remaining slides\n    s4_id: prev.s4_id, s4_headline: prev.s4_headline, s4_subtext: prev.s4_subtext, s4_body: prev.s4_body, s4_prompt: prev.s4_prompt, s4_style: prev.s4_style,\n    s5_id: prev.s5_id, s5_headline: prev.s5_headline, s5_subtext: prev.s5_subtext, s5_body: prev.s5_body, s5_prompt: prev.s5_prompt, s5_style: prev.s5_style,\n    carousel_id_shared: prev.carousel_id_shared\n  }\n}];',
    };

    @node({
        name: 'Gen Slide 3',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [6976, 928],
    })
    GenSlide3 = {
        jsCode: "const input = $input.first().json;\nconst response = await this.helpers.httpRequest({\n  method: 'POST',\n  url: 'https://n8nmsi.app.n8n.cloud/webhook/msi-educative-slide-gen',\n  body: {\n    slide_id: input.id,\n    image_prompt: input.image_prompt,\n    carousel_id: input.carousel_id,\n    slide_number: input.slide_number,\n    headline: input.headline,\n    subtext: input.subtext,\n    body_text: input.body_text,\n    visual_style: input.visual_style,\n    topic: input.topic\n  },\n  json: true\n});\n\n// Pass all slide data to next node\nreturn [{ json: { ...response, ...input } }];",
    };

    @node({
        name: 'Get Slide 4',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [7200, 928],
    })
    GetSlide4 = {
        jsCode: 'const prev = $input.first().json;\n\nreturn [{\n  json: {\n    id: prev.s4_id,\n    carousel_id: prev.carousel_id_shared,\n    slide_number: 4,\n    headline: prev.s4_headline,\n    subtext: prev.s4_subtext,\n    body_text: prev.s4_body,\n    image_prompt: prev.s4_prompt,\n    visual_style: prev.s4_style,\n    topic: prev.topic,\n    // Pass remaining slide\n    s5_id: prev.s5_id, s5_headline: prev.s5_headline, s5_subtext: prev.s5_subtext, s5_body: prev.s5_body, s5_prompt: prev.s5_prompt, s5_style: prev.s5_style,\n    carousel_id_shared: prev.carousel_id_shared\n  }\n}];',
    };

    @node({
        name: 'Gen Slide 4',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [7424, 928],
    })
    GenSlide4 = {
        jsCode: "const input = $input.first().json;\nconst response = await this.helpers.httpRequest({\n  method: 'POST',\n  url: 'https://n8nmsi.app.n8n.cloud/webhook/msi-educative-slide-gen',\n  body: {\n    slide_id: input.id,\n    image_prompt: input.image_prompt,\n    carousel_id: input.carousel_id,\n    slide_number: input.slide_number,\n    headline: input.headline,\n    subtext: input.subtext,\n    body_text: input.body_text,\n    visual_style: input.visual_style,\n    topic: input.topic\n  },\n  json: true\n});\n\n// Pass all slide data to next node\nreturn [{ json: { ...response, ...input } }];",
    };

    @node({
        name: 'Get Slide 5',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [7648, 928],
    })
    GetSlide5 = {
        jsCode: 'const prev = $input.first().json;\n\nreturn [{\n  json: {\n    id: prev.s5_id,\n    carousel_id: prev.carousel_id_shared,\n    slide_number: 5,\n    headline: prev.s5_headline,\n    subtext: prev.s5_subtext,\n    body_text: prev.s5_body,\n    image_prompt: prev.s5_prompt,\n    visual_style: prev.s5_style,\n    topic: prev.topic,\n    carousel_id_shared: prev.carousel_id_shared\n  }\n}];',
    };

    @node({
        name: 'Gen Slide 5',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [7872, 928],
    })
    GenSlide5 = {
        jsCode: "const input = $input.first().json;\nconst response = await this.helpers.httpRequest({\n  method: 'POST',\n  url: 'https://n8nmsi.app.n8n.cloud/webhook/msi-educative-slide-gen',\n  body: {\n    slide_id: input.id,\n    image_prompt: input.image_prompt,\n    carousel_id: input.carousel_id,\n    slide_number: input.slide_number,\n    headline: input.headline,\n    subtext: input.subtext,\n    body_text: input.body_text,\n    visual_style: input.visual_style,\n    topic: input.topic\n  },\n  json: true\n});\n\nreturn [{ json: response }];",
    };

    @node({
        name: 'Google Gemini Chat Model',
        type: '@n8n/n8n-nodes-langchain.lmChatGoogleGemini',
        version: 1,
        position: [3976, 1152],
        credentials: { googlePalmApi: { id: 'oF4jKBK0jRbwEPWt', name: 'Google Gemini(PaLM) Api account' } },
    })
    GoogleGeminiChatModel = {
        options: {},
    };

    @node({
        name: 'Google Gemini Chat Model1',
        type: '@n8n/n8n-nodes-langchain.lmChatGoogleGemini',
        version: 1,
        position: [4328, 1152],
        credentials: { googlePalmApi: { id: 'oF4jKBK0jRbwEPWt', name: 'Google Gemini(PaLM) Api account' } },
    })
    GoogleGeminiChatModel1 = {
        options: {},
    };

    @node({
        name: 'Google Gemini Chat Model2',
        type: '@n8n/n8n-nodes-langchain.lmChatGoogleGemini',
        version: 1,
        position: [4680, 1152],
        credentials: { googlePalmApi: { id: 'oF4jKBK0jRbwEPWt', name: 'Google Gemini(PaLM) Api account' } },
    })
    GoogleGeminiChatModel2 = {
        options: {},
    };

    // =====================================================================
    // ROUTAGE ET CONNEXIONS
    // =====================================================================

    @links()
    defineRouting() {
        this.WebhookEducativeCarousel.out(0).to(this.FormatInput.in(0));
        this.FormatInput.out(0).to(this.Agent1StrategyAnalyst.in(0));
        this.Agent1StrategyAnalyst.out(0).to(this.Agent2Copywriter.in(0));
        this.Agent2Copywriter.out(0).to(this.Agent3VisualDirector.in(0));
        this.Agent3VisualDirector.out(0).to(this.ParseOutput.in(0));
        this.ParseOutput.out(0).to(this.CreatePostRecord.in(0));
        this.CreatePostRecord.out(0).to(this.PrepareSlides.in(0));
        this.PrepareSlides.out(0).to(this.InsertSlides.in(0));
        this.InsertSlides.out(0).to(this.GetSlide1.in(0));
        this.GetSlide1.out(0).to(this.GenSlide1.in(0));
        this.GenSlide1.out(0).to(this.GetSlide2.in(0));
        this.GetSlide2.out(0).to(this.GenSlide2.in(0));
        this.GenSlide2.out(0).to(this.GetSlide3.in(0));
        this.GetSlide3.out(0).to(this.GenSlide3.in(0));
        this.GenSlide3.out(0).to(this.GetSlide4.in(0));
        this.GetSlide4.out(0).to(this.GenSlide4.in(0));
        this.GenSlide4.out(0).to(this.GetSlide5.in(0));
        this.GetSlide5.out(0).to(this.GenSlide5.in(0));

        this.Agent1StrategyAnalyst.uses({
            ai_languageModel: this.GoogleGeminiChatModel.output,
        });
        this.Agent2Copywriter.uses({
            ai_languageModel: this.GoogleGeminiChatModel1.output,
        });
        this.Agent3VisualDirector.uses({
            ai_languageModel: this.GoogleGeminiChatModel2.output,
        });
    }
}
