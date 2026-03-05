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
    settings: { executionOrder: 'v1' },
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
        jsCode: "// Format Input for Educational Content\nconst input = $('Webhook - Educative Carousel').item.json;\nlet data = input.body || input;\nif (typeof data === 'string') {\n  try { data = JSON.parse(data); } catch(e) { data = input; }\n}\n\n// Educational content structure - NO NEWS ELEMENTS\nconst topic = data.topic || 'Business Process Automation';\nconst pillar = data.pillar || 'Educational Content & Technology Learning';\nconst theme = data.theme || 'Professional Development & Skills';\nconst context = data.context || '';\n\nreturn [{\n  json: {\n    topic: topic,\n    pillar: pillar,\n    theme: theme,\n    context: context,\n    visual_style: 'Realistic Photography',\n    content_type: 'Educational Carousel',\n    color_primary: data.color_primary || '#207CE5',\n    color_secondary: data.color_secondary || '#004AAD'\n  }\n}];",
    };

    @node({
        name: 'Agent 1: Strategy Analyst',
        type: '@n8n/n8n-nodes-langchain.agent',
        version: 1.7,
        position: [3904, 928],
    })
    Agent1StrategyAnalyst = {
        promptType: 'define',
        text: '=EDUCATIONAL CONTENT REQUEST:\n\nTOPIC: {{ $json.topic }}\nPILLAR: {{ $json.pillar }}\nTHEME: {{ $json.theme }}\nADDITIONAL CONTEXT: {{ $json.context }}\n\nTASK:\nCreate an educational carousel strategy for MSI Technologies Instagram.\nThe content should EDUCATE the audience about the topic, providing VALUE and INSIGHTS.\n\n1. Create a compelling HOOK for Slide 1 that sparks curiosity.\n2. Identify 3 KEY EDUCATIONAL POINTS about this topic.\n3. Each point should teach something valuable.\n4. Define a CTA that encourages engagement.\n\nFOCUS AREAS (ALWAYS with a TECHNOLOGY angle):\n- How does TECHNOLOGY solve this problem?\n- What TECH TOOLS or SOLUTIONS apply here?\n- How does AI, automation, or digital tools improve this?\n- What can businesses DO with technology to improve?\n- Always connect the topic to a TECHNOLOGICAL SOLUTION or INNOVATION.\n\nOUTPUT:\n- Hook: [Curiosity-sparking question or statement]\n- Point 1: [First educational insight]\n- Point 2: [Second educational insight]\n- Point 3: [Third educational insight]\n- CTA: [Call to engage/learn more]',
        options: {
            systemMessage:
                "# ROLE: Educational Tech Content Strategist\nYou create TECHNOLOGY-FOCUSED educational content for MSI Technologies Instagram.\nEVERY topic must be framed through a TECHNOLOGY lens - AI, automation, cloud, digital tools, software solutions.\nFocus on: AI, Automation, Cloud Technology, Digital Transformation, Business Tech Solutions.\nMake complex TECH topics ACCESSIBLE and VALUABLE for business professionals.\n\nLANGUAGE & TONE (CRITICAL):\n- Write in CASUAL, CONVERSATIONAL English - like a smart friend explaining something useful.\n- Use SIMPLE, EVERYDAY words. Avoid fancy or uncommon vocabulary (no 'guesswork', 'leverage', 'revolutionize', 'streamline', 'empower', 'harness', 'spearhead', 'synergy').\n- Keep it PROFESSIONAL but RELAXED - think LinkedIn post, not academic paper.\n- Write the way real people actually talk in English.\n- Titles and headings should sound NATURAL and ENGAGING, not like a robot wrote them.\n- Tone: Expert but friendly, tech-savvy, easy to read.",
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
        text: "=STRATEGY INPUT:\n{{ $('Agent 1: Strategy Analyst').item.json.output }}\n\nCONTEXT:\nTopic: {{ $('Format Input').item.json.topic }}\nPillar: {{ $('Format Input').item.json.pillar }}\nTheme: {{ $('Format Input').item.json.theme }}\n\nTASK:\nCreate a 5-slide Instagram Carousel structure (4:5 format) for EDUCATIONAL content.\nALL OUTPUT MUST BE IN ENGLISH.\n\nSLIDE 1 (COVER): \n- Headline: A CATCHY, CASUAL, and CURIOSITY-SPARKING title (5-10 words max). It should sound like something a REAL PERSON would say - NOT robotic or overly formal. Examples of GOOD titles:\n  * 'Most Businesses Get This Wrong'\n  * 'AI Can Actually Do This Now'\n  * 'Stop Doing This Manually'\n  * 'You're Probably Wasting Time on This'\n  * 'This Saved Us 20 Hours a Week'\n  * 'Why Smart Teams Are Switching to This'\n  * 'The Easiest Way to Work Smarter'\n- The headline should feel NATURAL and CONVERSATIONAL - like a friend sharing something cool. NOT stiff, NOT corporate.\n- AVOID robotic or uncommon words like: guesswork, leverage, revolutionize, harness, streamline, empower, spearhead, synergy, paradigm, optimize.\n- Use SIMPLE, everyday English that anyone can understand.\n- Subtext: A SHORT label that indicates the TYPE of content. Choose ONE that matches:\n  * 'Quick Tips' / 'Tech Tips' / 'Pro Tips'\n  * 'Good to Know' / 'Things You Should Know'\n  * 'Smart Moves' / 'Simple Strategies'\n  * 'Did You Know?' / 'Fun Facts'\n  * 'Quick Guide' / 'Easy Guide'\n- The subtext tells the reader WHAT KIND of content they will find inside.\n- Body: LEAVE EMPTY.\n\nSLIDE 2-4 (EDUCATIONAL CONTENT - STRUCTURED): \n- Each slide presents ONE key point about the topic.\n- Headline: A SHORT, CASUAL, CLEAR title for the point (5-9 words). Use numbered format:\n  * 'Tip #1 - ...', 'Tip #2 - ...', 'Tip #3 - ...'\n  * Or 'Thing #1 - ...', 'Move #1 - ...', etc.\n  * Match the content type from Slide 1's subtext.\n  * Tip titles should sound NATURAL and EASY TO READ - like advice from a colleague, not a textbook.\n  * GOOD examples: 'Tip #1 - Let AI Handle the Boring Stuff', 'Tip #2 - Keep Your Data in One Place', 'Tip #3 - Check In on Results Weekly'\n  * BAD examples: 'Tip #1 - Leverage Automated Data Pipelines', 'Tip #2 - Harness Cloud Infrastructure', 'Tip #3 - Eliminate Guesswork Through Analytics'\n- Body: TWO PARTS in 2-3 lines total (15-25 words MAX):\n  * LINE 1: The key advice in SIMPLE words (WHAT to do)\n  * LINE 2-3: WHY IT MATTERS - explain the benefit in plain language\n  * GOOD example: 'Let AI sort through your emails and messages. This frees up 10+ hours a week so you can focus on real work.'\n  * BAD example: 'Leverage automated NLP-driven communication pipelines. This optimizes throughput and eliminates operational guesswork.'\n\nSLIDE 5 (CTA): \n- Headline: Engaging question. Examples: 'Ready to Learn More?' / 'Did You Find This Helpful?' / 'Want More Insights Like This?'\n- Subtext: Collaborative invitation. Examples: 'Let's Work Together' / 'Schedule a Free Consultation' / 'Let's Transform Your Business'\n- Body: LEAVE EMPTY\n- Contact Info: \"contact@msitechnologiesinc.com | msitechnologiesinc.com\"\n\nCRITICAL:\n- Headline format for slides 2-4 MUST match the Slide 1 format (Tips, Ways, Insights, Facts, etc.)\n- Body MUST include WHAT + WHY IT MATTERS in 2-3 lines\n- Body = DESCRIPTIVE, PRACTICAL, explains the IMPACT\n- Slide 5 = Question + Collaborative invitation\n- NO colons, NO semicolons anywhere\n\nOUTPUT JSON ARRAY:\n[\n  {\n    \"slide_number\": 1,\n    \"headline\": \"...\",\n    \"subtext\": \"Educational Tips\",\n    \"body\": \"\"\n  },\n  {\n    \"slide_number\": 2,\n    \"headline\": \"...\",\n    \"body\": \"...\"\n  },\n  ... (5 slides total)\n]",
        options: {
            systemMessage:
                "# ROLE: Tech Educational Content Writer for Instagram\nCreate STRUCTURED, TECHNOLOGY-FOCUSED educational content for Instagram carousels in ENGLISH.\n\nLANGUAGE RULES (CRITICAL - FOLLOW STRICTLY):\n- Write in CASUAL, NATURAL English - the way real people actually speak.\n- Use SHORT, SIMPLE, EVERYDAY words. If a 15-year-old wouldn't understand a word, don't use it.\n- BANNED WORDS: guesswork, leverage, revolutionize, harness, streamline, empower, spearhead, synergy, paradigm, optimize, unprecedented, cutting-edge, game-changer, seamless, robust, scalable, holistic, actionable.\n- Instead of fancy words, use NORMAL alternatives: 'use' instead of 'leverage', 'improve' instead of 'optimize', 'helpful' instead of 'actionable', 'works well' instead of 'robust'.\n- Headlines and tip titles should sound like a FRIEND giving advice, not a corporate robot.\n\nCONTENT RULES:\n- Slide 1 headline must be CATCHY and CASUAL - spark curiosity but sound HUMAN.\n- Slide 1 subtext must indicate the content type (e.g. 'Quick Tips', 'Good to Know', 'Smart Moves').\n- VARY the format - alternate between Tips, Things to Know, Facts, Smart Moves, Quick Guide.\n- Each slide 2-4 presents ONE key point with a TECHNOLOGY angle.\n- Body text has TWO parts: (1) The advice in plain words, (2) WHY IT MATTERS - the real-world benefit.\n- Example body: 'Use AI chatbots to answer customer questions faster. This cuts wait times by 60% and saves your team hours every week.'\n- Include DATA and SPECIFICS when possible.\n- NO jargon, NO buzzwords, NO marketing fluff, NO complicated vocabulary.\n- Write like you're texting a smart colleague about something useful - professional but relaxed.\n- Tone: Knowledgeable, friendly, casual but professional, easy to read.",
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
        text: "=INPUT FROM COPYWRITER AGENT:\n{{ $('Agent 2: Copywriter').item.json.output }}\n\nTOPIC CONTEXT: {{ $('Format Input').item.json.topic }}\n\nTASK:\nFor EACH slide in the JSON array, create a detailed 'image_prompt' field that is SPECIFIC to the educational topic and varies in visual style.\n\nIMPORTANT: \n- Add ONLY the 'image_prompt' field to each existing slide object\n- Do NOT modify existing fields\n- Return the EXACT same JSON structure with added image_prompt fields\n\nVISUAL STYLE:\n- Slide 1 (Cover): NO PHOTO. Solid blue gradient background with a 3D animated element that DIRECTLY REPRESENTS the topic (e.g. AI→3D brain, Automation→3D robot arm, Data→3D charts). Must be TOPIC-SPECIFIC, not generic abstract shapes.\n- Slide 2: Professional realistic photo related to the tip - NO PEOPLE, show tech objects and devices\n- Slide 3: Different angle or environment realistic photo - NO PEOPLE, focus on technology\n- Slide 4: Realistic tech scene related to the tip - NO PEOPLE, workspaces or devices\n- Slide 5: Clean professional look for CTA, NO photo, gradient background\n\nCREATE UNIQUE, TECHNOLOGY-FOCUSED VISUALS:\n- Each slide must be visually DISTINCT and ORIGINAL\n- Images MUST show TECHNOLOGY in action - devices, software, digital tools, AI, automation\n- Use specific TECH elements that reinforce the learning points\n- Always frame visuals through a TECHNOLOGY lens\n- Avoid repetitive concepts or generic stock photo aesthetics\n\nMSI BRAND GUIDELINES:\n- COLORS: MSI Blue (#207CE5), Dark Blue (#004AAD), Cream (#FFFDF1)\n- LAYOUT: Split layout with 55% image top, 45% text bottom\n- CONSISTENCY: Professional, clean, modern aesthetic\n\nReturn valid JSON.",
        options: {
            systemMessage:
                '# ROLE: Tech Visual Designer (Instagram Specialist)\nYour goal is TECHNOLOGY-FOCUSED EDUCATION through clean, professional visuals.\n\nKEY PRINCIPLES:\n- Slide 1: NO PHOTO. Solid blue gradient + 3D animated TOPIC-SPECIFIC element (AI→3D brain, Automation→robotic arm, Data→3D charts, etc. Match the topic)\n- Slides 2-4: REALISTIC PHOTOGRAPHY with TECHNOLOGY FOCUS\n- ABSOLUTELY NO PEOPLE in any slide. Show ONLY objects, devices, tools, workspaces, screens\n- Show TECH IN ACTION: laptops, tablets, dashboards, AI tools, automation software\n- Make visuals TECH-DRIVEN - real photos of technology that reinforce the learning points\n\nHEADING COLORS (CRITICAL):\n- On BLUE backgrounds (Slides 1, 3, 5): Headlines WHITE #FFFFFF, body CREAM #FFFDF1\n- On WHITE backgrounds (Slides 2, 4): Headlines BLUE #207CE5, body DARK GRAY #333333\n\nDESIGN STANDARDS:\n- CLEAN, professional aesthetic with MSI brand colors\n- NO TEXT SHADOWS. Modern flat design\n- Each image must be UNIQUE and ORIGINAL\n- Avoid stock photo clichés or repetitive themes\n\nERROR HANDLING:\n- Always expect a JSON array input\n- If input is not valid JSON, return error message\n- If slides are missing required fields, use defaults\n- Always return valid JSON structure',
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
