import { workflow, node, links } from '@n8n-as-code/transformer';

// <workflow-map>
// Workflow : video-content
// Nodes   : 8  |  Connections: 6
//
// NODE INDEX
// ──────────────────────────────────────────────────────────────────
// Property name                    Node type (short)         Flags
// WebhookVideoPreview                webhook
// FormatVideoInput                   code
// FilterForAgent                     code
// AgentVideoScript                   agent                      [AI]
// GoogleGeminiChatModel              lmChatGoogleGemini         [creds]
// BuildSettings                      code
// SavePreview                        postgres                   [creds]
// RespondPreview                     respondToWebhook
//
// ROUTING MAP
// ──────────────────────────────────────────────────────────────────
// WebhookVideoPreview
//    → FormatVideoInput
//      → FilterForAgent
//        → AgentVideoScript
//          → BuildSettings
//            → SavePreview
//              → RespondPreview
//
// AI CONNECTIONS
// GoogleGeminiChatModel.uses({ ai_languageModel: AgentVideoScript })
// </workflow-map>

// =====================================================================
// METADATA DU WORKFLOW
// =====================================================================

@workflow({
    id: 'NxnTzAoSKnZKOE71',
    name: 'video-content',
    active: true,
    settings: { executionOrder: 'v1' },
})
export class VideoContentWorkflow {
    // =====================================================================
    // CONFIGURATION DES NOEUDS
    // =====================================================================

    @node({
        name: 'Webhook - Video Preview',
        type: 'n8n-nodes-base.webhook',
        version: 2,
        position: [40048, 13760],
    })
    WebhookVideoPreview = {
        httpMethod: 'POST',
        path: 'msi-video-preview',
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
        position: [40272, 13760],
    })
    FormatVideoInput = {
        jsCode: "const input = $input.item.json;\nlet data = input.body || input;\nif (typeof data === 'string') {\n  try { data = JSON.parse(data); } catch (e) { }\n}\n\nconst prompt = data.prompt || data.video_prompt || '';\nconst start_image_url = data.start_image_url || data.imageUrl || null;\nconst aspect_ratio = data.aspect_ratio || data.aspectRatio || '9:16';\nconst service = data.service || 'company_intro';\nconst post_id = data.post_id || data.postId || null;\nconst topic = data.topic || '';\nconst duration = Math.min(parseInt(data.duration || '8'), 8);\n\nif (!prompt || prompt.length < 3) throw new Error('prompt is required');\nif (!start_image_url) throw new Error('start_image_url is required');\n\nconst SERVICE_CATALOG = {\n  workforce_agility: {\n    name: 'Workforce Agility',\n    tagline: 'Adapt, Evolve and Excel in a Changing Market',\n    pillars: 'Talent Optimization, Flexible Workforce, Employee Upskilling',\n    value: 'We help you build a future-ready workforce by fostering adaptability, innovation, and efficiency.',\n    pain_points: 'rigid teams that cannot scale, skills gaps slowing growth, inability to adapt to market shifts',\n    keywords: 'agile workforce, upskilling, talent optimization, adaptability, future-ready, flexible teams',\n    hook: 'Your workforce cannot keep up with a market that changes every single day.',\n    offer: 'MSI builds agile teams with upskilling and talent optimization for lasting adaptability.',\n    cta: 'Build a future-ready workforce today. Contact MSI for a free consultation now.'\n  },\n  it_outsourcing: {\n    name: 'IT Outsourcing Solutions',\n    tagline: 'Expert IT Teams Without the Overhead',\n    pillars: 'Managed IT Services, Dedicated Development Teams, Infrastructure Management',\n    value: 'Access top-tier IT talent and managed services at a fraction of in-house costs, with full accountability.',\n    pain_points: 'overloaded internal IT teams, expensive contractors who underdeliver, technology debt piling up',\n    keywords: 'managed IT, dedicated teams, infrastructure, cost-effective technology, IT support',\n    hook: 'Your IT team is overwhelmed and expensive contractors are not delivering real results.',\n    offer: 'MSI provides dedicated IT teams fully managed and accountable saving you up to sixty percent.',\n    cta: 'Stop overspending on IT. Let MSI manage it. Schedule your free consultation today.'\n  },\n  ai_solutions: {\n    name: 'AI and Smart Business Solutions',\n    tagline: 'Accelerate Your Business with Intelligent Automation',\n    pillars: 'AI Strategy, Process Automation, Predictive Analytics, AI Integration',\n    value: 'We implement practical AI solutions that automate workflows, unlock insights, and give you a competitive edge.',\n    pain_points: 'competitors moving faster with AI, manual processes wasting time, missed data-driven opportunities',\n    keywords: 'artificial intelligence, automation, predictive analytics, AI integration, intelligent workflows',\n    hook: 'Your competitors use AI to move twice as fast while you still do things manually.',\n    offer: 'MSI implements AI automation and predictive analytics tailored to your exact business needs.',\n    cta: 'Do not fall behind on AI. Contact MSI and accelerate your business starting today.'\n  },\n  cybersecurity: {\n    name: 'Cybersecurity',\n    tagline: 'Protect Your Business from Every Digital Threat',\n    pillars: 'Threat Detection, Compliance, Security Audits, Incident Response',\n    value: 'Comprehensive cybersecurity that shields your data, ensures compliance, and gives you peace of mind.',\n    pain_points: 'data breaches costing millions, compliance failures, lack of internal security expertise',\n    keywords: 'cybersecurity, threat detection, compliance, data protection, security audits, incident response',\n    hook: 'One data breach could cost your company millions and most businesses are unprepared.',\n    offer: 'MSI provides threat detection compliance audits and incident response to protect your business.',\n    cta: 'Do not wait for a breach. Secure your business with MSI. Get a free audit today.'\n  },\n  it_cybersecurity: {\n    name: 'IT Management and Cybersecurity',\n    tagline: 'Protect Your Business from Every Digital Threat',\n    pillars: 'Threat Detection, Compliance, Security Audits, Incident Response, IT Management',\n    value: 'Comprehensive cybersecurity and IT management that shields your data, ensures compliance, and gives you peace of mind.',\n    pain_points: 'data breaches costing millions, compliance failures, lack of internal security expertise',\n    keywords: 'cybersecurity, IT management, threat detection, compliance, data protection, security audits',\n    hook: 'One data breach could cost your company millions and most businesses are unprepared.',\n    offer: 'MSI provides threat detection compliance audits and incident response to protect your business.',\n    cta: 'Do not wait for a breach. Secure your business with MSI. Get a free audit today.'\n  },\n  data_security: {\n    name: 'Data Security and Cloud Computing',\n    tagline: 'Secure Cloud Solutions for Modern Business',\n    pillars: 'Cloud Security, Data Protection, Cloud Migration, Infrastructure Security',\n    value: 'End-to-end data security and cloud computing solutions that protect your assets and enable digital growth.',\n    pain_points: 'vulnerable cloud environments, data loss risks, insecure digital infrastructure',\n    keywords: 'data security, cloud computing, cloud security, data protection, secure infrastructure',\n    hook: 'Your data is only as safe as your weakest cloud security link and most have gaps.',\n    offer: 'MSI delivers end-to-end cloud security and data protection built for modern business.',\n    cta: 'Secure your cloud infrastructure with MSI. Schedule a free security assessment today.'\n  },\n  bpo: {\n    name: 'Business Process Outsourcing',\n    tagline: 'Streamline Operations, Focus on What Matters',\n    pillars: 'Back-Office Support, Customer Service, Data Processing, Administrative Excellence',\n    value: 'Outsource repetitive operations to trained professionals so your team focuses on growth and strategy.',\n    pain_points: 'teams buried in repetitive tasks, high operational costs, losing focus on core business',\n    keywords: 'business process outsourcing, back-office, customer service, operational efficiency, cost reduction',\n    hook: 'Your team wastes hours on repetitive tasks that trained professionals could handle better.',\n    offer: 'MSI handles back-office and customer service with pre-vetted professionals saving you forty percent.',\n    cta: 'Free your team to focus on growth. Contact MSI for streamlined operations today.'\n  },\n  consulting: {\n    name: 'Executive Consulting',\n    tagline: 'Navigate Digital Transformation with Confidence',\n    pillars: 'Digital Strategy, Technology Roadmaps, Change Management, Process Optimization',\n    value: 'Expert consulting that guides your digital transformation with proven strategies and measurable results.',\n    pain_points: 'failed digital transformations, no clear technology roadmap, resistance to change within teams',\n    keywords: 'digital transformation, consulting, technology strategy, change management, process optimization',\n    hook: 'Navigating digital transformation alone is why most companies fail in the first two years.',\n    offer: 'MSI delivers proven digital strategies and change management with twenty years of experience.',\n    cta: 'Transform with confidence. Let MSI guide your digital journey. Book a consultation today.'\n  },\n  executive_consulting: {\n    name: 'Executive Consulting',\n    tagline: 'Navigate Digital Transformation with Confidence',\n    pillars: 'Digital Strategy, Technology Roadmaps, Change Management, Process Optimization',\n    value: 'Expert consulting that guides your digital transformation with proven strategies and measurable results.',\n    pain_points: 'failed digital transformations, no clear technology roadmap, resistance to change within teams',\n    keywords: 'digital transformation, consulting, technology strategy, change management, process optimization',\n    hook: 'Navigating digital transformation alone is why most companies fail in the first two years.',\n    offer: 'MSI delivers proven digital strategies and change management with twenty years of experience.',\n    cta: 'Transform with confidence. Let MSI guide your digital journey. Book a consultation today.'\n  },\n  telecom: {\n    name: 'Telecom Services',\n    tagline: 'Reliable Connectivity That Powers Your Business',\n    pillars: 'Network Infrastructure, Unified Communications, Cloud Connectivity, Telecom Management',\n    value: 'End-to-end telecom solutions that ensure seamless connectivity, reduce downtime, and optimize costs.',\n    pain_points: 'poor network reliability killing productivity, outdated telecom infrastructure, high connectivity costs',\n    keywords: 'telecom, network infrastructure, unified communications, cloud connectivity, reliable network',\n    hook: 'Poor network infrastructure is silently killing your business productivity every single day.',\n    offer: 'MSI delivers end-to-end telecom solutions with reliable connectivity and optimized costs.',\n    cta: 'Upgrade your network infrastructure with MSI. Contact us for a free assessment today.'\n  },\n  company_intro: {\n    name: 'MSI Technologies - Company Introduction',\n    tagline: 'One Partner for IT, Staffing, AI, and Cybersecurity',\n    pillars: 'Full-Service Technology, Nearshore Talent, AI Solutions, Security',\n    value: 'MSI Technologies is your single partner for IT, staffing, AI, cybersecurity, and digital transformation - 20+ years, 40+ countries.',\n    pain_points: 'managing multiple vendors, fragmented technology strategy, no single trusted partner',\n    keywords: 'MSI Technologies, full-service, one partner, nearshore, IT staffing AI cybersecurity',\n    hook: 'What if one company could handle your IT staffing AI and cybersecurity all at once.',\n    offer: 'MSI has served hundreds of businesses across forty countries for over twenty years.',\n    cta: 'Simplify everything with one partner. Contact MSI Technologies for a free consultation.'\n  },\n  staffing: {\n    name: 'Nearshore Staffing',\n    tagline: 'Top Talent, Your Time Zone, Half the Cost',\n    pillars: 'Nearshore Staffing, Pre-Vetted Talent, Same Time Zone, Cultural Alignment',\n    value: 'College-educated, triple-tested, fluent English professionals working in your time zone at 40-60% savings.',\n    pain_points: 'high cost of US-based hires, remote talent quality concerns, time zone and communication gaps',\n    keywords: 'nearshore staffing, pre-vetted talent, same time zone, fluent English, cost savings, cultural fit',\n    hook: 'You could hire skilled pre-vetted talent at half the cost in your same time zone.',\n    offer: 'MSI provides college-educated fluent English professionals triple-tested and saving you sixty percent.',\n    cta: 'Stop overpaying for talent. Get MSI nearshore staffing. Schedule a free call today.'\n  },\n  nearshore_staffing: {\n    name: 'Nearshore Staffing',\n    tagline: 'Top Talent, Your Time Zone, Half the Cost',\n    pillars: 'Nearshore Staffing, Pre-Vetted Talent, Same Time Zone, Cultural Alignment',\n    value: 'College-educated, triple-tested, fluent English professionals working in your time zone at 40-60% savings.',\n    pain_points: 'high cost of US-based hires, remote talent quality concerns, time zone and communication gaps',\n    keywords: 'nearshore staffing, pre-vetted talent, same time zone, fluent English, cost savings, cultural fit',\n    hook: 'You could hire skilled pre-vetted talent at half the cost in your same time zone.',\n    offer: 'MSI provides college-educated fluent English professionals triple-tested and saving you sixty percent.',\n    cta: 'Stop overpaying for talent. Get MSI nearshore staffing. Schedule a free call today.'\n  }\n};\n\nconst svc = SERVICE_CATALOG[service] || SERVICE_CATALOG['company_intro'];\nconst serviceContext = 'SERVICE NAME: ' + svc.name + '\\nTAGLINE: ' + svc.tagline + '\\nPILLARS: ' + svc.pillars + '\\nVALUE PROPOSITION: ' + svc.value + '\\nPAIN POINTS TO ADDRESS: ' + svc.pain_points + '\\nKEYWORDS TO USE: ' + svc.keywords + '\\nHOOK EXAMPLE: The person says: ' + svc.hook + '\\nOFFER EXAMPLE: The person says: ' + svc.offer + '\\nCTA EXAMPLE: The person says: ' + svc.cta;\nconst serviceExample = svc.hook + ' ||| ' + svc.offer + ' ||| ' + svc.cta;\nconst serviceName = svc.name;\nconst companyContext = 'WHY MSI CONTEXT: Global nearshore presence in 40+ countries across five continents through Talentor International. 20+ years of multinational experience. 700 global employees. Deep expertise in human capital, information systems, software, cybersecurity, telecom, cloud, and engineering services.';\n\nreturn [{ json: { _videoScene: prompt, duration: String(duration), aspect_ratio, service, post_id, topic, start_image_url, serviceContext, serviceExample, serviceName, companyContext } }];",
    };

    @node({
        name: 'Filter for Agent',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [40496, 13760],
    })
    FilterForAgent = {
        jsCode: "// FILTER: Only pass service-related fields to the AI Agent.\n// This prevents the LLM from seeing video description, URLs, or other data that could confuse it.\nconst f = $('Format Video Input').item.json;\nreturn [{ json: { serviceContext: f.serviceContext, serviceName: f.serviceName, serviceExample: f.serviceExample, companyContext: f.companyContext, topic: f.topic || '' } }];",
    };

    @node({
        name: 'Agent: Video Script',
        type: '@n8n/n8n-nodes-langchain.agent',
        version: 1.7,
        position: [40720, 13760],
    })
    AgentVideoScript = {
        promptType: 'define',
        text: '="You generate ONLY the spoken dialogue for a 3-part MSI Technologies sales video.\\n\\nYour job is SIMPLE: write THREE dialogue lines (what the person SAYS). Nothing else. No scene description, no actions, no emotions, no camera directions. The scene is handled separately.\\n\\nIMPORTANT - You are writing dialogue EXCLUSIVELY for this service:\\n" + $json.serviceContext + "\\n\\nWHY MSI FACTS (use for proof in line 2 ending):\\n" + ($json.companyContext || \'\') + "\\n\\nAUDIENCE: " + ($json.topic || \'Business professionals\') + "\\n\\nWRITE THREE DIALOGUE LINES following this sales funnel:\\n\\nLINE 1 - HOOK (Pain Point): A bold opening line using the PAIN POINTS and KEYWORDS above. Make the viewer stop scrolling. Directly address their problem related to " + $json.serviceName + ".\\n\\nLINE 2 - OFFER (Value + Proof + Why MSI): Explain what MSI delivers using the PILLARS and VALUE PROPOSITION of " + $json.serviceName + " above. End LINE 2 with a short Why MSI proof clause, choosing ONE fact from WHY MSI FACTS (40+ countries, five continents/Talentor alliance, 20+ years, 700 global employees, multinational expertise).\\n\\nLINE 3 - CTA + Why MSI (Close): A strong closing call to action for " + $json.serviceName + ". Add a short why choose MSI proof phrase (different from line 2) using one WHY MSI fact, then close with urgency.\\n\\nRULES:\\n- Character length per line: MINIMUM 110, MAXIMUM 140 characters.\\n- Use ONLY vocabulary from " + $json.serviceName + " above for service claims. Use the KEYWORDS, PILLARS, and PAIN POINTS provided. NEVER use vocabulary from a different MSI service.\\n- The three lines form a coherent sales narrative about " + $json.serviceName + ".\\n- Do NOT add any scene description, action, emotion, camera direction, voice description, or accent instruction. ONLY dialogue.\\n\\nOUTPUT FORMAT (exactly this, nothing else):\\nLINE1_DIALOGUE ||| LINE2_DIALOGUE ||| LINE3_DIALOGUE\\n\\nExample output for " + $json.serviceName + ":\\n" + $json.serviceExample',
        options: {
            systemMessage:
                '="You are a dialogue-only writer for MSI Technologies sales videos. You MUST write dialogue ONLY about " + $json.serviceName + ". You receive SERVICE details plus WHY MSI proof facts. Your ONLY job is to output THREE dialogue lines separated by |||. LINE 1 = Hook using the service pain points provided. LINE 2 = Offer using service pillars/value and end with one Why MSI proof fact. LINE 3 = CTA close with an additional Why MSI proof phrase different from line 2. CRITICAL RULES: 1) Each line 110-140 characters. 2) Use ONLY the vocabulary, keywords, and pillars from " + $json.serviceName + " for service claims - NEVER invent terms or use vocabulary from other services. 3) Output ONLY dialogue text. No scene, action, camera, voice, or emotion descriptions. 4) Format: LINE1 ||| LINE2 ||| LINE3. Nothing else."',
        },
    };

    @node({
        name: 'Google Gemini Chat Model',
        type: '@n8n/n8n-nodes-langchain.lmChatGoogleGemini',
        version: 1,
        position: [40792, 13984],
        credentials: { googlePalmApi: { id: 'oF4jKBK0jRbwEPWt', name: 'Google Gemini(PaLM) Api account' } },
    })
    GoogleGeminiChatModel = {
        options: {
            temperature: 0,
        },
    };

    @node({
        name: 'Build Settings',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [41072, 13760],
    })
    BuildSettings = {
        jsCode: "const agentOutput = $('Agent: Video Script').item.json.output || '';\nconst f = $('Format Video Input').item.json;\n\n// The agent now outputs ONLY dialogue lines: LINE1 ||| LINE2 ||| LINE3\nlet d1 = '', d2 = '', d3 = '';\nif (agentOutput.includes('|||')) {\n  const parts = agentOutput.split('|||');\n  d1 = parts[0].trim();\n  d2 = (parts[1] || '').trim();\n  d3 = (parts[2] || '').trim();\n} else {\n  d1 = agentOutput.substring(0, 220).trim();\n  d2 = agentOutput.substring(0, 220).trim();\n  d3 = agentOutput.substring(0, 220).trim();\n}\n\n// Clean up: remove any 'person says:' prefix the AI might have added\nfunction cleanDialogue(text) {\n  return text.replace(/^.*?\\bsays?:\\s*/i, '').replace(/^[\\-\\u2013\\u2014\\u2022]\\s*/, '').trim();\n}\nd1 = cleanDialogue(d1);\nd2 = cleanDialogue(d2);\nd3 = cleanDialogue(d3);\n\n// VALIDATION: Check if AI output actually matches the requested service\n// If the AI hallucinated (talked about wrong service), fall back to catalog examples\nconst serviceKeywords = (f.serviceContext || '').toLowerCase();\nconst keywordsLine = serviceKeywords.split('keywords to use:')[1] || '';\nconst kwList = keywordsLine.split('hook example:')[0].split(',').map(k => k.trim().split(' ')[0]).filter(k => k.length > 3);\nconst allDialogue = (d1 + ' ' + d2 + ' ' + d3).toLowerCase();\nconst matchCount = kwList.filter(kw => allDialogue.includes(kw)).length;\n\n// If fewer than 2 keywords match, AI hallucinated - use catalog examples as fallback\nif (matchCount < 2 && f.serviceExample) {\n  console.log('WARNING: AI hallucinated (only ' + matchCount + '/' + kwList.length + ' keywords matched). Using catalog fallback.');\n  const fallback = f.serviceExample.split('|||');\n  d1 = (fallback[0] || d1).trim();\n  d2 = (fallback[1] || d2).trim();\n  d3 = (fallback[2] || d3).trim();\n}\n\n// Character length validation (more robust than word count for variable word sizes)\nfunction charCount(text) { return text ? text.length : 0; }\nif (charCount(d1) < 110 || charCount(d1) > 140) console.log('WARNING: Line 1 has ' + charCount(d1) + ' chars (target 110-140)');\nif (charCount(d2) < 110 || charCount(d2) > 140) console.log('WARNING: Line 2 has ' + charCount(d2) + ' chars (target 110-140)');\nif (charCount(d3) < 110 || charCount(d3) > 140) console.log('WARNING: Line 3 has ' + charCount(d3) + ' chars (target 110-140)');\n\n// Ensure line 2 closes with a Why MSI proof clause\nconst whyMsiPool = [\n  'with global nearshore reach across 40+ countries and five continents.',\n  'backed by 20+ years of multinational delivery experience.',\n  'powered by 700 global employees and cross-functional experts.',\n  'through our Talentor alliance with global operational proximity.'\n];\nconst hasWhyMsi = /40\\+ countries|five continents|20\\+ years|700 global employees|Talentor/i.test(d2);\nif (!hasWhyMsi) {\n  const reason = whyMsiPool[Math.floor(Math.random() * whyMsiPool.length)];\n  d2 = (d2.replace(/[.!?]*$/, '') + ' because MSI brings ' + reason).trim();\n}\n\nconst hasWhyMsiLine3 = /40\\+ countries|five continents|20\\+ years|700 global employees|Talentor/i.test(d3);\nif (!hasWhyMsiLine3) {\n  const reason3 = whyMsiPool[Math.floor(Math.random() * whyMsiPool.length)];\n  d3 = (d3.replace(/[.!?]*$/, '') + ' choose MSI because ' + reason3).trim();\n}\n\nconst svcMatch = (f.serviceContext || '').match(/SERVICE NAME:\\s*([^\\n]+)/i);\nconst svcName = svcMatch ? svcMatch[1].trim() : 'this service';\n\n\nfunction normalizeSpeechText(text) {\n  return (text || '')\n    .replace(/\\s+/g, ' ')\n    .replace(/\\s+([,.;!?])/g, '$1')\n    .replace(/\\s*[-–—:]\\s*/g, ' ')\n    .replace(/\\s{2,}/g, ' ')\n    .trim();\n}\nfunction ensureCharRange(text, minChars, maxChars, fillers) {\n  let output = (text || '').trim();\n  let i = 0;\n  while (output.length < minChars && i < fillers.length * 2) {\n    output = (output.replace(/[.!?]*$/, '') + ' ' + fillers[i % fillers.length]).trim();\n    i++;\n  }\n  if (output.length > maxChars) {\n    let clipped = output.slice(0, maxChars + 1);\n    const lastSpace = clipped.lastIndexOf(' ');\n    clipped = lastSpace > Math.floor(maxChars * 0.7) ? clipped.slice(0, lastSpace) : clipped.slice(0, maxChars);\n    output = clipped.replace(/[\\s,;:-]+$/, '').trim();\n  }\n  return output;\n}\n\nconst fillers1 = [\n  'This ' + svcName + ' gap keeps draining productivity and delaying business growth.',\n  'Ignoring this issue increases costs, slows delivery, and weakens competitive performance.'\n];\nconst fillers2 = [\n  'MSI delivers measurable outcomes with accountable execution tailored to your operations.',\n  'You gain reliable delivery speed, quality, and control without adding internal overhead.'\n];\nconst fillers3 = [\n  'Book your MSI consultation now and activate a faster, safer implementation path.',\n  'Start with MSI today to reduce risk and accelerate results with proven experts.'\n];\n\nd1 = ensureCharRange(d1, 110, 140, fillers1);\nd2 = ensureCharRange(d2, 110, 140, fillers2);\nd3 = ensureCharRange(d3, 110, 140, fillers3);\n\nd1 = normalizeSpeechText(d1);\nd2 = normalizeSpeechText(d2);\nd3 = normalizeSpeechText(d3);\n// Hard fallback: Part 3 must never remain short\nif (charCount(d3) < 110) {\n  d3 = ensureCharRange('Choose MSI now for ' + svcName + ' results backed by 20+ years and 40+ countries with reliable global delivery.', 110, 140, fillers3);\n}\n\n// === BUILD FINAL VEO PROMPTS ===\n// Scene comes from _videoScene (isolated from AI agent input)\nconst scene = f._videoScene;\n\n// Compact voice instruction (shared)\nconst voice = ' Clear American accent, professional tone. Voice only, no music.';\n\n// PART 1: Full scene establishes the visual\nconst p1 = scene + ' The person says: ' + d1 + '.' + voice + ' Person finishes speaking by second 7, holds still pose for last 1 second. No waving. Camera follows smoothly.';\n\n// PART 2: Continuation - maintain exact same camera angle, walking motion, and scene from part 1\nconst p2 = 'Continuing seamlessly from the previous scene. Same camera angle, same walking pace, same direction, no camera changes. ' + scene + ' The person says: ' + d2 + '.' + voice + ' The person keeps walking naturally while speaking. Person finishes speaking by second 7, then keeps walking in same direction for last 1 second. No waving, no stopping. Same camera angle throughout.';\n\n// PART 3: Final continuation - maintain same camera and walking, ends with still pose\nconst p3 = 'Continuing seamlessly from the previous scene. Same camera angle, same walking pace, same direction, no camera changes. ' + scene + ' The person says: ' + d3 + '.' + voice + ' The person keeps walking naturally while speaking. Person finishes speaking by second 6, then slows to a stop and holds COMPLETELY STILL looking at camera for last 2 seconds. No waving, no farewell. Same camera angle throughout.';\n\nreturn [{\n  json: {\n    PROMPT_PART1: p1,\n    PROMPT_PART2: p2,\n    PROMPT_PART3: p3,\n    DIALOGUE_1: d1,\n    DIALOGUE_2: d2,\n    DIALOGUE_3: d3,\n    DURATION: f.duration,\n    ASPECT_RATIO: f.aspect_ratio,\n    POST_ID: f.post_id,\n    ORIGINAL_PROMPT: f._videoScene,\n    SERVICE: f.service,\n    START_IMAGE_URL: f.start_image_url\n  }\n}];",
    };

    @node({
        name: 'Save Preview',
        type: 'n8n-nodes-base.postgres',
        version: 2.5,
        position: [41296, 13760],
        credentials: { postgres: { id: 'WnTYs2zvPoE7hDJE', name: 'Postgres account' } },
    })
    SavePreview = {
        operation: 'executeQuery',
        query: "{{ `INSERT INTO social_posts (post_type, status, strategy_analysis, image_prompt, post_copy, image_url, headline, created_at, updated_at) VALUES ('Video Preview', 'pending', '${($json.PROMPT_PART1 || '').replace(/'/g, \"''\")}', '${($json.PROMPT_PART2 || '').replace(/'/g, \"''\")}', '${JSON.stringify({original_prompt: $json.ORIGINAL_PROMPT || '', service: $json.SERVICE || 'company_intro', duration: $json.DURATION || '8', aspect_ratio: $json.ASPECT_RATIO || '9:16', start_image_url: $json.START_IMAGE_URL || '', prompt_part3: $json.PROMPT_PART3 || ''}).replace(/'/g, \"''\")}', '${($json.START_IMAGE_URL || '').replace(/'/g, \"''\")}', '${($json.ORIGINAL_PROMPT || '').substring(0, 120).replace(/'/g, \"''\")}', NOW(), NOW()) RETURNING *` }}",
        options: {},
    };

    @node({
        name: 'Respond Preview',
        type: 'n8n-nodes-base.respondToWebhook',
        version: 1.1,
        position: [41520, 13760],
    })
    RespondPreview = {
        respondWith: 'json',
        responseBody:
            "={{ JSON.stringify({ success: true, message: 'Script preview generated', data: { post_id: $json.id || '', prompt: $('Build Settings').item.json.ORIGINAL_PROMPT || '', service: $('Build Settings').item.json.SERVICE || '', duration: $('Build Settings').item.json.DURATION || '8', aspect_ratio: $('Build Settings').item.json.ASPECT_RATIO || '9:16', start_image_url: $('Build Settings').item.json.START_IMAGE_URL || '', prompt_part1: $('Build Settings').item.json.PROMPT_PART1 || '', prompt_part2: $('Build Settings').item.json.PROMPT_PART2 || '', prompt_part3: $('Build Settings').item.json.PROMPT_PART3 || '' } }) }}",
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
        this.WebhookVideoPreview.out(0).to(this.FormatVideoInput.in(0));
        this.FormatVideoInput.out(0).to(this.FilterForAgent.in(0));
        this.FilterForAgent.out(0).to(this.AgentVideoScript.in(0));
        this.AgentVideoScript.out(0).to(this.BuildSettings.in(0));
        this.BuildSettings.out(0).to(this.SavePreview.in(0));
        this.SavePreview.out(0).to(this.RespondPreview.in(0));

        this.AgentVideoScript.uses({
            ai_languageModel: this.GoogleGeminiChatModel.output,
        });
    }
}
