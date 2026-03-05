import { workflow, node, links } from '@n8n-as-code/transformer';

// <workflow-map>
// Workflow : single-img-gen
// Nodes   : 26  |  Connections: 27
//
// NODE INDEX
// ──────────────────────────────────────────────────────────────────
// Property name                    Node type (short)         Flags
// WebhookGenerateContent             webhook
// FormatFormInput                    code
// Agent1StrategyAnalyzer             agent                      [AI]
// Agent2CopyWriter                   agent                      [AI]
// SavePostToDb                       postgres                   [creds]
// RouteByVisualStyle                 switch
// StyleGlassmorphism                 code
// StyleModern3d                      code
// StyleIsometric                     code
// StyleDataHero                      code
// StyleInfographic                   code
// StyleDefault                       code
// Agent3ImagePrompt                  agent                      [AI]
// UpdateImagePromptInDb              postgres                   [creds]
// DownloadMsiLogo                    httpRequest
// PrepareForImageGen                 code
// StatusGeneratingImage              postgres                   [creds]
// GenerateImage                      httpRequest                [creds]
// CheckAndPrepareBinary              code
// UploadToImgbb                      httpRequest                [creds]
// UpdateDbWithImageUrl               postgres                   [creds]
// FormatSuccessResponse              set
// RespondToWebhookGenerate           respondToWebhook
// GoogleGeminiChatModel              lmChatGoogleGemini         [creds]
// GoogleGeminiChatModel1             lmChatGoogleGemini         [creds]
// GoogleGeminiChatModel2             lmChatGoogleGemini         [creds]
//
// ROUTING MAP
// ──────────────────────────────────────────────────────────────────
// WebhookGenerateContent
//    → FormatFormInput
//      → Agent1StrategyAnalyzer
//        → Agent2CopyWriter
//          → SavePostToDb
//            → RouteByVisualStyle
//              → StyleGlassmorphism
//                → Agent3ImagePrompt
//                  → UpdateImagePromptInDb
//                    → DownloadMsiLogo
//                      → PrepareForImageGen
//                        → StatusGeneratingImage
//                          → GenerateImage
//                            → CheckAndPrepareBinary
//                              → UploadToImgbb
//                                → UpdateDbWithImageUrl
//                                  → FormatSuccessResponse
//                                    → RespondToWebhookGenerate
//             .out(1) → StyleModern3d
//                → Agent3ImagePrompt (↩ loop)
//             .out(2) → StyleIsometric
//                → Agent3ImagePrompt (↩ loop)
//             .out(3) → StyleDataHero
//                → Agent3ImagePrompt (↩ loop)
//             .out(4) → StyleInfographic
//                → Agent3ImagePrompt (↩ loop)
//             .out(5) → StyleDefault
//                → Agent3ImagePrompt (↩ loop)
//
// AI CONNECTIONS
// GoogleGeminiChatModel.uses({ ai_languageModel: Agent1StrategyAnalyzer })
// GoogleGeminiChatModel1.uses({ ai_languageModel: Agent2CopyWriter })
// GoogleGeminiChatModel2.uses({ ai_languageModel: Agent3ImagePrompt })
// </workflow-map>

// =====================================================================
// METADATA DU WORKFLOW
// =====================================================================

@workflow({
    id: 'szfrfIjqN2VuFne9',
    name: 'single-img-gen',
    active: true,
    settings: { executionOrder: 'v1' },
})
export class SingleImgGenWorkflow {
    // =====================================================================
    // CONFIGURATION DES NOEUDS
    // =====================================================================

    @node({
        name: 'Webhook - Generate Content',
        type: 'n8n-nodes-base.webhook',
        version: 2,
        position: [-2624, 1248],
    })
    WebhookGenerateContent = {
        httpMethod: 'POST',
        path: '70738d02-4bd8-4dac-853f-ba4836aafaf5',
        responseMode: 'responseNode',
        options: {
            allowedOrigins: '*',
            rawBody: false,
        },
    };

    @node({
        name: 'Format Form Input',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-2400, 1248],
    })
    FormatFormInput = {
        jsCode: "// Extraer datos del formulario web\nconst input = $input.item.json;\n\nconsole.log('==== WEBHOOK INPUT ====');\nconsole.log('Raw input keys:', Object.keys(input));\nconsole.log('Body type:', typeof input.body);\nconsole.log('Body value:', input.body);\n\n// Parsear el body si es un string JSON\nlet data;\nif (input.body) {\n  if (typeof input.body === 'string') {\n    try {\n      data = JSON.parse(input.body);\n      console.log('Parsed JSON body successfully');\n    } catch (e) {\n      console.error('Failed to parse body as JSON:', e.message);\n      data = input;\n    }\n  } else if (typeof input.body === 'object') {\n    data = input.body;\n    console.log('Body is already an object');\n  } else {\n    data = input;\n  }\n} else if (input.query) {\n  data = input.query;\n  console.log('Using input.query');\n} else {\n  data = input;\n  console.log('Using input directly');\n}\n\nconsole.log('Extracted data:', JSON.stringify(data, null, 2));\n\n// Construir variables (soportar snake_case y camelCase)\nconst topic = data.topic || '';\nconst post_type = data.post_type || data.postType || '';\nconst visual_style = data.visual_style || data.visualStyle || '';\nconst orientation = data.orientation || '';\nconst headline = data.headline || '';\nconst data_points = data.data_points || data.dataPoints || '';\nconst context = data.context || '';\n\n// Color palette - use custom colors if provided, otherwise MSI defaults\nconst use_custom_colors = data.use_custom_colors === true || data.use_custom_colors === 'true';\nconst color_primary = data.color_primary || '#207CE5';\nconst color_secondary = data.color_secondary || '#004AAD';\nconst color_accent = data.color_accent || '#FFFDF1';\nconst color_dark = data.color_dark || '#2B2B2B';\n\nconsole.log('Final variables:', {topic, post_type, visual_style, orientation, headline, data_points, context});\nconsole.log('Color palette:', {use_custom_colors, color_primary, color_secondary, color_accent, color_dark});\nconsole.log('==== END WEBHOOK INPUT ====');\n\nreturn [{\n  json: {\n    topic,\n    post_type,\n    visual_style,\n    orientation,\n    headline,\n    data_points,\n    context,\n    color_primary,\n    color_secondary,\n    color_accent,\n    color_dark,\n    use_custom_colors\n  }\n}];",
    };

    @node({
        name: 'Agent 1: Strategy Analyzer',
        type: '@n8n/n8n-nodes-langchain.agent',
        version: 1.7,
        position: [-2176, 1248],
    })
    Agent1StrategyAnalyzer = {
        promptType: 'define',
        text: "=Create a content strategy for:\n\nTopic: {{ $json.topic }}\nPost Type: {{ $json.post_type }}\nVisual Style: {{ $json.visual_style }}\nHeadline: {{ $json.headline }}\nData Points: {{ $json.data_points || 'None provided' }}\nContext: {{ $json.context || 'None provided' }}\n\nCOLOR PALETTE:\n- Primary: {{ $json.color_primary }}\n- Secondary: {{ $json.color_secondary }}\n- Accent: {{ $json.color_accent }}\n- Dark: {{ $json.color_dark }}\n\nNote: All images will be in 4:5 portrait format.",
        options: {
            systemMessage:
                "=# LANGUAGE REQUIREMENT\nALWAYS respond in English regardless of input language.\n\n# ROLE: Strategic Content Analyst for MSI Technologies\n\n## OUTPUT FORMAT\n---CONTENT STRATEGY---\nHook: [Compelling first line]\nBody: [Main message]\nCTA: [Call to action]\nHashtags: [3-5 hashtags including #MSITechnologies]\n\n---VISUAL STRATEGY---\nUser's Visual Style: [Copy exactly from user input]\nScene Concept: [Brief visualization concept]\nFormat: 4:5 Portrait\nColor Palette: [Use colors provided by user]\n\n---IN-IMAGE TEXT---\n[Copy EXACT headline from user input]\n\n---DATA POINTS---\n[Only if user provided them]\n\n## MSI CONTEXT\nMSI Technologies helps businesses modernize infrastructure and implement innovative technology solutions.\n\n## RULES\n1. NO generic corporate language\n2. NEVER invent statistics\n3. Use the COLOR PALETTE provided by user for backgrounds and accents\n4. Copy headline exactly",
        },
    };

    @node({
        name: 'Agent 2: Copy Writer',
        type: '@n8n/n8n-nodes-langchain.agent',
        version: 1.7,
        position: [-1824, 1248],
    })
    Agent2CopyWriter = {
        promptType: 'define',
        text: "={{ $('Agent 1: Strategy Analyzer').item.json.output }}",
        options: {
            systemMessage:
                '# LANGUAGE REQUIREMENT\nALWAYS respond in English.\n\n# ROLE: LinkedIn Copy Writer for MSI Technologies\n\nOutput ONLY the post text - no labels, no metadata, no dashes or hyphens for formatting.\n\n## STRUCTURE\n- Hook (First 2 lines): Specific stat, question, or concrete statement\n- Body: Include data points, line breaks every 2-3 sentences\n- CTA: Conversational question\n\n## VOICE\n- Senior engineer who\'s solved this 50 times\n- Direct and honest, not salesy\n\n## NEVER USE\n- "In today\'s digital landscape"\n- "Revolutionize/Transform your business"\n- "Cutting-edge/Game-changing"\n- Dashes or hyphens for bullet points or formatting\n- Emojis of any kind - keep strictly professional\n\n## REQUIREMENTS\n- Maximum 60 words (short and punchy)\n- NEVER invent data\n- DO NOT use emojis - maintain professional B2B tone\n- Natural paragraph flow, NO dashes or formatting symbols\n\n## CONTACT INFO (ALWAYS INCLUDE)\nAt the end, BEFORE hashtags:\n───────────────────\nLet\'s talk: contact@msitechnologiesinc.com\nmsitechnologiesinc.com\n\nAlways end with #MSITechnologies + relevant hashtags',
        },
    };

    @node({
        name: 'Save Post to DB',
        type: 'n8n-nodes-base.postgres',
        version: 2.5,
        position: [-1472, 1248],
        credentials: { postgres: { id: 'WnTYs2zvPoE7hDJE', name: 'Postgres account' } },
    })
    SavePostToDb = {
        operation: 'executeQuery',
        query: "INSERT INTO social_posts (topic, post_type, visual_style, orientation, headline, data_points, context, strategy_analysis, status, created_at, updated_at)\nVALUES (\n  '{{ $('Format Form Input').item.json.topic.replace(/'/g, \"''\") }}', '{{ $json.output.replace(/'/g, \"''\") }}', '{{ $('Format Form Input').item.json.visual_style.replace(/'/g, \"''\") }}', '{{ $('Format Form Input').item.json.orientation.replace(/'/g, \"''\") }}', '{{ $('Format Form Input').item.json.headline.replace(/'/g, \"''\") }}', '{{ $('Format Form Input').item.json.data_points.replace(/'/g, \"''\") }}', '{{ $('Format Form Input').item.json.context.replace(/'/g, \"''\") }}', '{{ $('Agent 1: Strategy Analyzer').item.json.output.replace(/'/g, \"''\") }}', 'copy_completed', NOW(), NOW()\n)\nRETURNING *",
        options: {},
    };

    @node({
        name: 'Route by Visual Style',
        type: 'n8n-nodes-base.switch',
        version: 3,
        position: [-1248, 1184],
    })
    RouteByVisualStyle = {
        rules: {
            values: [
                {
                    conditions: {
                        options: {
                            caseSensitive: false,
                            typeValidation: 'loose',
                        },
                        conditions: [
                            {
                                leftValue: '={{ $json.visual_style }}',
                                rightValue: 'Glassmorphism',
                                operator: {
                                    type: 'string',
                                    operation: 'equals',
                                },
                            },
                        ],
                        combinator: 'and',
                    },
                    renameOutput: true,
                    outputKey: 'Glassmorphism',
                },
                {
                    conditions: {
                        options: {
                            caseSensitive: false,
                            typeValidation: 'loose',
                        },
                        conditions: [
                            {
                                leftValue: '={{ $json.visual_style }}',
                                rightValue: 'Modern 3D',
                                operator: {
                                    type: 'string',
                                    operation: 'equals',
                                },
                            },
                        ],
                        combinator: 'and',
                    },
                    renameOutput: true,
                    outputKey: 'Modern3D',
                },
                {
                    conditions: {
                        options: {
                            caseSensitive: false,
                            typeValidation: 'loose',
                        },
                        conditions: [
                            {
                                leftValue: '={{ $json.visual_style }}',
                                rightValue: 'Isometric',
                                operator: {
                                    type: 'string',
                                    operation: 'equals',
                                },
                            },
                        ],
                        combinator: 'and',
                    },
                    renameOutput: true,
                    outputKey: 'Isometric',
                },
                {
                    conditions: {
                        options: {
                            caseSensitive: false,
                            typeValidation: 'loose',
                        },
                        conditions: [
                            {
                                leftValue: '={{ $json.visual_style }}',
                                rightValue: 'Data Hero',
                                operator: {
                                    type: 'string',
                                    operation: 'equals',
                                },
                            },
                        ],
                        combinator: 'and',
                    },
                    renameOutput: true,
                    outputKey: 'DataHero',
                },
                {
                    conditions: {
                        options: {
                            caseSensitive: false,
                            typeValidation: 'loose',
                        },
                        conditions: [
                            {
                                leftValue: '={{ $json.visual_style }}',
                                rightValue: 'Infographic',
                                operator: {
                                    type: 'string',
                                    operation: 'contains',
                                },
                            },
                        ],
                        combinator: 'and',
                    },
                    renameOutput: true,
                    outputKey: 'Infographic',
                },
            ],
        },
        options: {
            fallbackOutput: 'extra',
        },
    };

    @node({
        name: 'Style: Glassmorphism',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-1024, 768],
    })
    StyleGlassmorphism = {
        jsCode: "// GLASSMORPHISM Style Instructions\nconst formInput = $('Save Post to DB').item.json;\nconst strategy = $('Agent 1: Strategy Analyzer').item.json.output;\nconst postId = formInput.id;\nconst colorData = $('Format Form Input').item.json;\n\n// Dynamic colors from form or defaults\nconst primaryColor = colorData.color_primary || '#207CE5';\nconst secondaryColor = colorData.color_secondary || '#004AAD';\nconst accentColor = colorData.color_accent || '#FFFDF1';\nconst darkColor = colorData.color_dark || '#2B2B2B';\n\nconst styleInstructions = `\n## GLASSMORPHISM STYLE\n**SCENE:** SOLID brand color (${primaryColor}) background - NO heavy gradients. THREE translucent glass panels arranged in layered composition with technology icons visible through layers. Semi-transparent hexagonal shapes scattered. MINIMAL blur - keep elements crisp and readable. Connection lines in accent color (${accentColor}).\n\n**COLOR PALETTE:**\n- Primary: ${primaryColor} (use as SOLID or very subtle gradient)\n- Secondary: ${secondaryColor}\n- Accent/Text: ${accentColor}\n- Dark: ${darkColor}\n\n**VISUAL ELEMENTS:**\n1. Three translucent glass panels with SUBTLE transparency (no heavy blur)\n2. Technology icons in white on panels (gears, circuits, data symbols)\n3. Semi-transparent hexagonal shapes (${accentColor} accents)\n4. Connection lines between elements (${accentColor})\n5. Clean edges on panels - minimal blur effects\n6. Professional rim lighting for depth\n\n**MSI BRAND TYPOGRAPHY (STRICT):**\n- Headlines: ITC Avant Garde Bold\n- Subheadlines: Poppins SemiBold\n- Body/Contact: Quicksand Medium\n\n**CONTACT SECTION (BOTTOM - SIMPLE):**\n- NO decorative badges or frames\n- Just clean text: email icon + contact@msitechnologiesinc.com | globe icon + msitechnologiesinc.com\n- Quicksand Medium, small size, horizontal layout near logo\n`;\n\nreturn [{\n  json: {\n    headline: formInput.headline,\n    topic: formInput.topic,\n    visual_style: formInput.visual_style,\n    strategy: strategy,\n    style_instructions: styleInstructions,\n    post_id: postId,\n    color_primary: primaryColor,\n    color_secondary: secondaryColor,\n    color_accent: accentColor,\n    color_dark: darkColor\n  }\n}];",
    };

    @node({
        name: 'Style: Modern 3D',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-1024, 960],
    })
    StyleModern3d = {
        jsCode: "// MODERN 3D Style Instructions\nconst formInput = $('Save Post to DB').item.json;\nconst strategy = $('Agent 1: Strategy Analyzer').item.json.output;\nconst postId = formInput.id;\nconst colorData = $('Format Form Input').item.json;\n\n// Dynamic colors from form or defaults\nconst primaryColor = colorData.color_primary || '#207CE5';\nconst secondaryColor = colorData.color_secondary || '#004AAD';\nconst accentColor = colorData.color_accent || '#FFFDF1';\nconst darkColor = colorData.color_dark || '#2B2B2B';\n\nconst styleInstructions = `\n## MODERN 3D STYLE\n**SCENE:** SOLID brand color (${primaryColor}) background - NO heavy gradients. Floating 3D geometric objects. Glossy spheres, cubes, and abstract tech shapes with realistic reflections and shadows. Dramatic lighting from multiple angles creating depth. Professional, futuristic corporate aesthetic.\n\n**COLOR PALETTE:**\n- Primary: ${primaryColor} (use as SOLID or very subtle variation)\n- Secondary: ${secondaryColor}\n- Accent/Text: ${accentColor}\n- Dark: ${darkColor}\n\n**VISUAL ELEMENTS:**\n1. Floating 3D geometric shapes (spheres, cubes, cylinders)\n2. Glossy metallic surfaces with reflections\n3. Dramatic rim lighting and shadows\n4. Abstract tech objects (servers, nodes, connections)\n5. MINIMAL depth of field - keep main elements sharp\n6. Subtle particle effects or light rays\n\n**MSI BRAND TYPOGRAPHY (STRICT):**\n- Headlines: ITC Avant Garde Bold\n- Subheadlines: Poppins SemiBold\n- Body/Contact: Quicksand Medium\n\n**CONTACT SECTION (BOTTOM - SIMPLE):**\n- NO decorative badges or frames\n- Just clean text: email icon + contact@msitechnologiesinc.com | globe icon + msitechnologiesinc.com\n- Quicksand Medium, small size, horizontal layout near logo\n`;\n\nreturn [{\n  json: {\n    headline: formInput.headline,\n    topic: formInput.topic,\n    visual_style: formInput.visual_style,\n    strategy: strategy,\n    style_instructions: styleInstructions,\n    post_id: postId,\n    color_primary: primaryColor,\n    color_secondary: secondaryColor,\n    color_accent: accentColor,\n    color_dark: darkColor\n  }\n}];",
    };

    @node({
        name: 'Style: Isometric',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-1024, 1152],
    })
    StyleIsometric = {
        jsCode: "// ISOMETRIC Style Instructions\nconst formInput = $('Save Post to DB').item.json;\nconst strategy = $('Agent 1: Strategy Analyzer').item.json.output;\nconst postId = formInput.id;\nconst colorData = $('Format Form Input').item.json;\n\n// Dynamic colors from form or defaults\nconst primaryColor = colorData.color_primary || '#207CE5';\nconst secondaryColor = colorData.color_secondary || '#004AAD';\nconst accentColor = colorData.color_accent || '#FFFDF1';\nconst darkColor = colorData.color_dark || '#2B2B2B';\n\nconst styleInstructions = `\n## ISOMETRIC ARCHITECTURE STYLE\n**SCENE:** Brand color (${primaryColor}) background with isometric 3D architecture. Clean geometric buildings, server rooms, or tech infrastructure in isometric perspective. Flat colors with subtle gradients. Professional technical illustration style.\n\n**COLOR PALETTE:**\n- Primary: ${primaryColor}\n- Secondary: ${secondaryColor}\n- Accent/Text: ${accentColor}\n- Dark: ${darkColor}\n\n**VISUAL ELEMENTS:**\n1. Isometric buildings or server structures\n2. Clean geometric shapes in isometric view\n3. Network connection lines between structures (${accentColor})\n4. Small human figures for scale (optional)\n5. Subtle shadows for depth\n6. Technical grid or blueprint elements\n\n**MSI BRAND TYPOGRAPHY (STRICT):**\n- Headlines: ITC Avant Garde Bold\n- Subheadlines: Poppins SemiBold\n- Body/Contact: Quicksand Medium\n\n**CONTACT SECTION (BOTTOM - SIMPLE):**\n- NO decorative badges or frames\n- Just clean text: email icon + contact@msitechnologiesinc.com | globe icon + msitechnologiesinc.com\n- Quicksand Medium, small size, horizontal layout near logo\n`;\n\nreturn [{\n  json: {\n    headline: formInput.headline,\n    topic: formInput.topic,\n    visual_style: formInput.visual_style,\n    strategy: strategy,\n    style_instructions: styleInstructions,\n    post_id: postId,\n    color_primary: primaryColor,\n    color_secondary: secondaryColor,\n    color_accent: accentColor,\n    color_dark: darkColor\n  }\n}];",
    };

    @node({
        name: 'Style: Data Hero',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-1024, 1344],
    })
    StyleDataHero = {
        jsCode: "// DATA HERO Style Instructions\nconst formInput = $('Save Post to DB').item.json;\nconst strategy = $('Agent 1: Strategy Analyzer').item.json.output;\nconst postId = formInput.id;\nconst colorData = $('Format Form Input').item.json;\n\n// Dynamic colors from form or defaults\nconst primaryColor = colorData.color_primary || '#207CE5';\nconst secondaryColor = colorData.color_secondary || '#004AAD';\nconst accentColor = colorData.color_accent || '#FFFDF1';\nconst darkColor = colorData.color_dark || '#2B2B2B';\n\nconst styleInstructions = `\n## DATA HERO / VISUALIZATION STYLE\n**SCENE:** Brand color (${primaryColor}) background with prominent data visualizations as hero element. Charts, graphs, dashboards, or data flow diagrams as main visual. Clean, modern infographic aesthetic with professional corporate feel.\n\n**COLOR PALETTE:**\n- Primary: ${primaryColor}\n- Secondary: ${secondaryColor}\n- Accent/Text: ${accentColor}\n- Dark: ${darkColor}\n\n**VISUAL ELEMENTS:**\n1. Large chart or graph as hero element (bar, line, pie, or dashboard)\n2. Data points and nodes with connection lines (${accentColor})\n3. Glowing data indicators and metrics\n4. Abstract data flow visualization\n5. Clean grid or axis lines\n6. Subtle animated feel (arrows, flow indicators)\n\n**MSI BRAND TYPOGRAPHY (STRICT):**\n- Headlines: ITC Avant Garde Bold\n- Subheadlines: Poppins SemiBold\n- Body/Contact: Quicksand Medium\n\n**CONTACT SECTION (BOTTOM - SIMPLE):**\n- NO decorative badges or frames\n- Just clean text: email icon + contact@msitechnologiesinc.com | globe icon + msitechnologiesinc.com\n- Quicksand Medium, small size, horizontal layout near logo\n`;\n\nreturn [{\n  json: {\n    headline: formInput.headline,\n    topic: formInput.topic,\n    visual_style: formInput.visual_style,\n    strategy: strategy,\n    style_instructions: styleInstructions,\n    post_id: postId,\n    color_primary: primaryColor,\n    color_secondary: secondaryColor,\n    color_accent: accentColor,\n    color_dark: darkColor\n  }\n}];",
    };

    @node({
        name: 'Style: Infographic',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-1024, 1536],
    })
    StyleInfographic = {
        jsCode: "// INFOGRAPHIC Style Instructions\nconst formInput = $('Save Post to DB').item.json;\nconst strategy = $('Agent 1: Strategy Analyzer').item.json.output;\nconst postId = formInput.id;\nconst colorData = $('Format Form Input').item.json;\n\n// Dynamic colors from form\nconst primaryColor = colorData.color_primary;\nconst secondaryColor = colorData.color_secondary;\nconst accentColor = colorData.color_accent;\nconst darkColor = colorData.color_dark;\n\nconst styleInstructions = `\n## SOCIAL MEDIA INFOGRAPHIC - BOLD & SCROLL-STOPPING\n\n**OBJETIVO:** Imagen llamativa que detenga el scroll. Simple, impactante, fácil de leer en 3 segundos.\n\n**FONDO:**\n- Color SÓLIDO vibrante: ${primaryColor} (NO degradados fuertes)\n- Formas geométricas abstractas sutiles (círculos, líneas) en tonos claros\n- Si hay gradiente, que sea MUY sutil\n\n**COLORES:**\n- Fondo: ${primaryColor} SÓLIDO o gradiente muy leve\n- Texto: Blanco (headlines) / ${accentColor} (acentos)\n- Iconos: Blanco o ${accentColor}\n\n**LAYOUT (SIMPLE):**\n- 70% superior: HEADLINE grande + 1 icono principal\n- 30% inferior: 2-3 puntos clave con iconos pequeños + logo\n\n**TIPOGRAFÍA MSI (ESTRICTO):**\n- Headlines: ITC Avant Garde Bold, 60-80pt, BLANCO, máximo 5-6 palabras\n- Subheadlines: Poppins SemiBold, 24-32pt\n- Puntos clave: Quicksand Medium, cortos y directos\n- Contacto: Quicksand Medium\n- Alto contraste siempre\n\n**ELEMENTOS VISUALES:**\n- 1 icono hero grande relacionado al tema\n- 2-3 iconos pequeños para puntos clave\n- Líneas o flechas simples conectando ideas\n- NO más de 4 elementos visuales en total\n\n**REGLAS CLAVE:**\n- Máximo 20 palabras en toda la imagen\n- Legible en móvil (texto grande)\n- 1 mensaje principal, no varios\n- Espacio negativo generoso\n\n**LOGO:**\n- MSI logo pequeño, esquina inferior derecha\n- Usar EXACTAMENTE como se proporciona\n\n**SECCIÓN DE CONTACTO (SIMPLE - SIN VIÑETAS):**\n- SIN tarjetas decorativas, SIN marcos, SIN badges\n- Solo texto limpio: icono email + contact@msitechnologiesinc.com | icono globo + msitechnologiesinc.com\n- Quicksand Medium, tamaño pequeño, layout horizontal cerca del logo\n\n**EVITAR:**\n- Texto pequeño o denso\n- Más de 3-4 colores\n- Composiciones complejas\n- Gráficos de datos elaborados\n`;\n\nreturn [{\n  json: {\n    headline: formInput.headline,\n    topic: formInput.topic,\n    visual_style: formInput.visual_style,\n    strategy: strategy,\n    style_instructions: styleInstructions,\n    post_id: postId,\n    color_primary: primaryColor,\n    color_secondary: secondaryColor,\n    color_accent: accentColor,\n    color_dark: darkColor\n  }\n}];",
    };

    @node({
        name: 'Style: Default',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-1024, 1728],
    })
    StyleDefault = {
        jsCode: "// DEFAULT Style Instructions (fallback)\nconst formInput = $('Save Post to DB').item.json;\nconst strategy = $('Agent 1: Strategy Analyzer').item.json.output;\nconst postId = formInput.id;\nconst colorData = $('Format Form Input').item.json;\n\n// Dynamic colors from form or defaults\nconst primaryColor = colorData.color_primary || '#207CE5';\nconst secondaryColor = colorData.color_secondary || '#004AAD';\nconst accentColor = colorData.color_accent || '#FFFDF1';\nconst darkColor = colorData.color_dark || '#2B2B2B';\n\nconst styleInstructions = `\n## DEFAULT CORPORATE STYLE\n**SCENE:** Clean brand color (${primaryColor}) gradient background. Professional corporate design with abstract geometric elements. Modern, minimal aesthetic suitable for LinkedIn.\n\n**COLOR PALETTE:**\n- Primary: ${primaryColor}\n- Secondary: ${secondaryColor}\n- Accent/Text: ${accentColor}\n- Dark: ${darkColor}\n\n**VISUAL ELEMENTS:**\n1. Solid brand color background or subtle gradient to secondary\n2. Abstract geometric shapes (hexagons, circles, lines) in accent color\n3. Technology icons relevant to the topic\n4. Clean accent lines or borders (${accentColor})\n5. Professional lighting effects\n6. Subtle depth through shadows or glows\n\n**MSI BRAND TYPOGRAPHY (STRICT):**\n- Headlines: ITC Avant Garde Bold\n- Subheadlines: Poppins SemiBold\n- Body/Contact: Quicksand Medium\n\n**CONTACT SECTION (BOTTOM - SIMPLE):**\n- NO decorative badges or frames\n- Just clean text: email icon + contact@msitechnologiesinc.com | globe icon + msitechnologiesinc.com\n- Quicksand Medium, small size, horizontal layout near logo\n`;\n\nreturn [{\n  json: {\n    headline: formInput.headline,\n    topic: formInput.topic,\n    visual_style: formInput.visual_style || 'Corporate',\n    strategy: strategy,\n    style_instructions: styleInstructions,\n    post_id: postId,\n    color_primary: primaryColor,\n    color_secondary: secondaryColor,\n    color_accent: accentColor,\n    color_dark: darkColor\n  }\n}];",
    };

    @node({
        name: 'Agent 3: Image Prompt',
        type: '@n8n/n8n-nodes-langchain.agent',
        version: 1.7,
        position: [-800, 1248],
    })
    Agent3ImagePrompt = {
        promptType: 'define',
        text: '=STRATEGY:\n{{ $json.strategy }}\n\nHEADLINE (use exactly): {{ $json.headline }}\nTOPIC/SERVICE AREA: {{ $json.topic }}\nVISUAL STYLE: {{ $json.visual_style }}\n\nCOLOR PALETTE TO USE:\n- Primary Color: {{ $json.color_primary }}\n- Secondary Color: {{ $json.color_secondary }}\n- Accent/Text Color: {{ $json.color_accent }}\n- Dark Color: {{ $json.color_dark }}\n\nSTYLE INSTRUCTIONS:\n{{ $json.style_instructions }}',
        options: {
            systemMessage:
                "# ROLE: Image Prompt Engineer for MSI Technologies\n\nCreate a Gemini 3 Pro image generation prompt using the STYLE INSTRUCTIONS and COLOR PALETTE provided.\n\n## CRITICAL LAYOUT RULES\n- EDGE-TO-EDGE design - content must fill the ENTIRE canvas\n- NO white margins, NO borders, NO padding around edges\n- Background color must touch ALL 4 edges of the image\n- 4:5 portrait format, fully utilized\n\n## MSI BRAND TYPOGRAPHY (STRICT - ALWAYS USE)\n- **Headlines**: ITC Avant Garde Bold\n- **Subheadlines**: Poppins SemiBold\n- **Body/Paragraphs**: Quicksand Regular or Medium\n- **Contact info**: Quicksand Medium\n- NEVER use other fonts - this is MSI brand identity\n- All text must be clean, modern, and highly legible\n- Maintain consistent font hierarchy throughout\n\n## PROHIBITED ELEMENTS (NEVER INCLUDE)\n- NO surreal or fantasy elements\n- NO floating objects that defy physics\n- NO dreamlike or abstract distortions\n- NO glowing orbs or magical effects\n- NO unrealistic lighting or impossible shadows\n- Keep everything professional and realistic\n\n## MANDATORY TEXT ELEMENTS (ALL 4 REQUIRED)\nEvery image MUST contain these 4 text elements in order:\n\n1. **HEADLINE** (TOP - LARGEST)\n   - The main headline from input\n   - ITC Avant Garde Bold, 48-64pt, WHITE or accent color\n   - Positioned in upper third of image\n   - Maximum impact, easy to read\n\n2. **VALUE PROPOSITION** (UPPER-MIDDLE)\n   - A short supporting message (10-15 words max)\n   - MUST include the phrase 'with our [TOPIC/SERVICE] services' to connect the image to MSI's offering\n   - Use the TOPIC/SERVICE AREA provided in the input to fill in [TOPIC/SERVICE]\n   - Examples: 'Protect your business with our Cybersecurity services' / 'Scale faster with our Cloud Migration services' / 'Stay ahead with our AI Integration services'\n   - Poppins SemiBold, 24-32pt, white or accent\n   - Below headline, connects the visual topic to MSI's services\n\n3. **DIFERENCIADOR** (LOWER-MIDDLE)\n   - A compelling statement about MSI's value (WITHOUT saying 'Why Choose MSI')\n   - Examples: '15+ years of enterprise expertise' / 'Trusted by Fortune 500 companies' / 'End-to-end tailored solutions'\n   - Quicksand Medium, 20-28pt, professional tone\n   - Placed above the contact section\n   - NO explicit 'Why Choose' or 'Why MSI' labels\n\n4. **CONTACT SECTION** (BOTTOM - MANDATORY - SIMPLE & PROFESSIONAL)\n   - NO fancy badges, NO themed frames, NO decorative elements\n   - Just clean text on a subtle semi-transparent bar or directly on background\n   - Simple layout:\n     * Email icon (small) + 'contact@msitechnologiesinc.com'\n     * Globe icon (small) + 'msitechnologiesinc.com'\n   - Quicksand Medium, 14-18pt, high contrast\n   - Position: bottom left area, horizontal layout\n   - KEEP IT MINIMAL - no boxes, no cards, no vignettes\n\n## LOGO INSTRUCTIONS\n- MSI Technologies logo provided as reference\n- DO NOT modify the logo in ANY way\n- Place EXACTLY as provided in bottom right corner\n- Keep original colors and appearance\n\n## COLOR PALETTE (USE FROM INPUT)\n- Primary color for main backgrounds (EDGE-TO-EDGE)\n- Secondary color for sections and shapes\n- Accent color for text, icons, and highlights\n- Ensure high contrast for all text\n\n## OUTPUT FORMAT\n**SCENE DESCRIPTION:**\n[Apply STYLE INSTRUCTIONS - use PROVIDED COLORS - EDGE-TO-EDGE design - NO surreal elements]\n\n**TYPOGRAPHY:**\n- Headlines: ITC Avant Garde Bold\n- Subheadlines: Poppins SemiBold\n- Body/paragraphs: Quicksand\n\n**TEXT LAYOUT (ALL 4 REQUIRED):**\n- TOP: Headline (ITC Avant Garde Bold, 48-64pt white/accent)\n- UPPER-MIDDLE: Value proposition with 'with our [SERVICE] services' (Poppins SemiBold, 24-32pt)\n- LOWER-MIDDLE: Differentiator statement - NO 'Why Choose' label (Quicksand Medium, 20-28pt)\n- BOTTOM: Creative themed contact badge with email + website icons\n\n**CONTACT SECTION:**\n- Simple text, NO decorative badge\n- Email: contact@msitechnologiesinc.com\n- Web: msitechnologiesinc.com\n- Small icons, clean horizontal layout\n\n**LOGO:**\nMSI logo in bottom right - USE EXACTLY AS PROVIDED\n\n**FORMAT:**\n4:5 portrait, edge-to-edge, no margins, realistic professional aesthetic",
        },
    };

    @node({
        name: 'Update Image Prompt in DB',
        type: 'n8n-nodes-base.postgres',
        version: 2.5,
        position: [-448, 1248],
        credentials: { postgres: { id: 'WnTYs2zvPoE7hDJE', name: 'Postgres account' } },
    })
    UpdateImagePromptInDb = {
        operation: 'executeQuery',
        query: "UPDATE social_posts \nSET image_prompt = '{{ $json.output.replace(/'/g, \"''\") }}',\n    status = 'prompt_completed',\n    updated_at = NOW()\nWHERE id = '{{ $('Save Post to DB').item.json.id }}'\nRETURNING *",
        options: {},
    };

    @node({
        name: 'Download MSI Logo',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.2,
        position: [-224, 1248],
    })
    DownloadMsiLogo = {
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
        name: 'Prepare for Image Gen',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [0, 1248],
    })
    PrepareForImageGen = {
        jsCode: "// Merge prompt data with logo binary for multi-image Gemini API call\nconst promptData = $('Update Image Prompt in DB').item.json;\nconst logoItem = $('Download MSI Logo').item;\n\nconsole.log('==== PREPARE MULTI-IMAGE INPUT ====');\nconsole.log('Prompt data:', {\n  id: promptData.id,\n  image_prompt_length: promptData.image_prompt?.length || 0,\n  orientation: promptData.orientation\n});\nconsole.log('Logo binary keys:', Object.keys(logoItem.binary || {}));\n\n// Get logo binary data and convert to base64\nlet logoBase64 = '';\nif (logoItem.binary && Object.keys(logoItem.binary).length > 0) {\n  const binaryKey = Object.keys(logoItem.binary)[0];\n  const binaryData = logoItem.binary[binaryKey];\n  \n  console.log('Binary data structure:', {\n    hasData: !!binaryData.data,\n    dataType: typeof binaryData.data,\n    dataValue: binaryData.data,\n    mimeType: binaryData.mimeType,\n    id: binaryData.id\n  });\n  \n  // In n8n filesystem mode, we need to use helpers to get the actual data\n  try {\n    // Use $binary helper to get the actual buffer content\n    const buffer = await this.helpers.getBinaryDataBuffer(logoItem.json.index || 0, binaryKey);\n    logoBase64 = buffer.toString('base64');\n    console.log('Logo base64 extracted from buffer, length:', logoBase64.length);\n    console.log('First 50 chars:', logoBase64.substring(0, 50));\n  } catch (e) {\n    console.error('Failed to get binary buffer:', e.message);\n    \n    // Fallback: try direct access\n    if (typeof binaryData.data === 'string' && binaryData.data !== 'filesystem-v2') {\n      logoBase64 = binaryData.data;\n    } else if (Buffer.isBuffer(binaryData.data)) {\n      logoBase64 = binaryData.data.toString('base64');\n    } else if (binaryData.data instanceof Uint8Array) {\n      logoBase64 = Buffer.from(binaryData.data).toString('base64');\n    }\n  }\n} else {\n  console.log('WARNING: No logo binary found');\n}\n\nif (!logoBase64 || logoBase64 === 'filesystem-v2') {\n  throw new Error('Failed to extract logo base64 data. Got: ' + logoBase64);\n}\n\nconsole.log('==== END PREPARE MULTI-IMAGE INPUT ====');\n\nreturn [{\n  json: {\n    image_prompt: promptData.image_prompt,\n    logo_base64: logoBase64,\n    post_id: promptData.id,\n    orientation: promptData.orientation\n  }\n}];",
    };

    @node({
        name: 'Status: Generating Image',
        type: 'n8n-nodes-base.postgres',
        version: 2.5,
        position: [224, 1248],
        credentials: { postgres: { id: 'WnTYs2zvPoE7hDJE', name: 'Postgres account' } },
    })
    StatusGeneratingImage = {
        operation: 'executeQuery',
        query: "UPDATE social_posts SET status = 'prompt_completed', updated_at = NOW() WHERE id = '{{ $json.post_id }}'",
        options: {},
    };

    @node({
        name: 'Generate Image',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.2,
        position: [448, 1248],
        credentials: { googlePalmApi: { id: 'oF4jKBK0jRbwEPWt', name: 'Google Gemini(PaLM) Api account' } },
    })
    GenerateImage = {
        method: 'POST',
        url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent',
        authentication: 'predefinedCredentialType',
        nodeCredentialType: 'googlePalmApi',
        sendBody: true,
        specifyBody: 'json',
        jsonBody:
            "={{ JSON.stringify({\n  contents: [{\n    parts: [\n      { text: $('Prepare for Image Gen').item.json.image_prompt },\n      { inline_data: { mime_type: 'image/png', data: $('Prepare for Image Gen').item.json.logo_base64 } }\n    ]\n  }],\n  generationConfig: {\n    responseModalities: ['IMAGE'],\n    imageConfig: {\n      aspectRatio: '4:5',\n      imageSize: '2K'\n    }\n  }\n}) }}",
        options: {
            response: {
                response: {},
            },
        },
    };

    @node({
        name: 'Check and Prepare Binary',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [672, 1248],
    })
    CheckAndPrepareBinary = {
        jsCode: "// Extract image binary from Gemini REST API response\nconst item = $input.item;\n\nconsole.log('==== CHECK IMAGE BINARY ====');\nconsole.log('Item binary keys:', Object.keys(item.binary || {}));\nconsole.log('Item json keys:', Object.keys(item.json || {}));\n\n// Check if binary data exists (from HTTP Request node)\nif (item.binary && Object.keys(item.binary).length > 0) {\n  const binaryKey = Object.keys(item.binary)[0];\n  console.log('Found binary key:', binaryKey);\n  console.log('Binary data size:', item.binary[binaryKey]?.data?.length || 0);\n  \n  // Rename binary to 'data' for ImgBB\n  return [{\n    json: item.json,\n    binary: {\n      data: item.binary[binaryKey]\n    }\n  }];\n}\n\n// Check if response has inline_data or inlineData (Gemini API structure - support both formats)\nconst parts = item.json?.candidates?.[0]?.content?.parts?.[0];\nconst inlineData = parts?.inline_data || parts?.inlineData;\n\nif (inlineData) {\n  console.log('Found inline image data from Gemini API');\n  console.log('Mime type:', inlineData.mime_type || inlineData.mimeType);\n  console.log('Data size:', inlineData.data?.length || 0);\n  \n  // Convert base64 to binary for ImgBB\n  return [{\n    json: item.json,\n    binary: {\n      data: {\n        data: inlineData.data,\n        mimeType: inlineData.mime_type || inlineData.mimeType || 'image/png',\n        fileName: 'generated-image.png'\n      }\n    }\n  }];\n}\n\nconsole.log('ERROR: No binary data found in Gemini output');\nthrow new Error('No se generó imagen. Verifica que el modelo Gemini esté configurado correctamente.');\n\nconsole.log('==== END CHECK IMAGE BINARY ====');",
    };

    @node({
        name: 'Upload to ImgBB',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.1,
        position: [896, 1248],
        credentials: { httpHeaderAuth: { id: 'zx6X4T7j4yDMYWKo', name: 'imgbb-api' } },
    })
    UploadToImgbb = {
        method: 'POST',
        url: 'https://api.imgbb.com/1/upload',
        authentication: 'genericCredentialType',
        genericAuthType: 'httpHeaderAuth',
        sendBody: true,
        contentType: 'multipart-form-data',
        bodyParameters: {
            parameters: [
                {
                    name: 'key',
                    value: 'd5e3ee3c8c2fa1a29f6d6dc3c2c79447',
                },
                {
                    parameterType: 'formBinaryData',
                    name: 'image',
                    inputDataFieldName: '=data',
                },
            ],
        },
        options: {},
    };

    @node({
        name: 'Update DB with Image URL',
        type: 'n8n-nodes-base.postgres',
        version: 2.5,
        position: [1120, 1248],
        credentials: { postgres: { id: 'WnTYs2zvPoE7hDJE', name: 'Postgres account' } },
    })
    UpdateDbWithImageUrl = {
        operation: 'executeQuery',
        query: "UPDATE social_posts \nSET image_url = '{{ $json.data.url }}', \n    status = 'completed',\n    updated_at = NOW()\nWHERE id = '{{ $('Prepare for Image Gen').item.json.post_id }}'\nRETURNING *",
        options: {},
    };

    @node({
        name: 'Format Success Response',
        type: 'n8n-nodes-base.set',
        version: 3.3,
        position: [1344, 1248],
    })
    FormatSuccessResponse = {
        assignments: {
            assignments: [
                {
                    id: 'success',
                    name: 'success',
                    value: true,
                    type: 'boolean',
                },
                {
                    id: 'message',
                    name: 'message',
                    value: '=✅ Content generated successfully!\n\n📝 Post ID: {{ $json.id }}\n📌 Topic: {{ $json.topic }}\n🎨 Type: {{ $json.post_type }}\n🖼️ Image: {{ $json.image_url }}\n⏰ Created: {{ $json.created_at }}',
                    type: 'string',
                },
                {
                    id: 'post_id',
                    name: 'post_id',
                    value: '={{ $json.id }}',
                    type: 'string',
                },
                {
                    id: 'image_url',
                    name: 'image_url',
                    value: '={{ $json.image_url }}',
                    type: 'string',
                },
                {
                    id: 'post_copy',
                    name: 'post_copy',
                    value: '={{ $json.post_copy }}',
                    type: 'string',
                },
            ],
        },
        options: {},
    };

    @node({
        name: 'Respond to Webhook - Generate',
        type: 'n8n-nodes-base.respondToWebhook',
        version: 1.1,
        position: [1568, 1248],
    })
    RespondToWebhookGenerate = {
        respondWith: 'json',
        responseBody: '={{ { "success": true, "message": "Content generated successfully", "data": $json } }}',
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

    @node({
        name: 'Google Gemini Chat Model',
        type: '@n8n/n8n-nodes-langchain.lmChatGoogleGemini',
        version: 1,
        position: [-2104, 1472],
        credentials: { googlePalmApi: { id: 'oF4jKBK0jRbwEPWt', name: 'Google Gemini(PaLM) Api account' } },
    })
    GoogleGeminiChatModel = {
        options: {},
    };

    @node({
        name: 'Google Gemini Chat Model1',
        type: '@n8n/n8n-nodes-langchain.lmChatGoogleGemini',
        version: 1,
        position: [-1752, 1472],
        credentials: { googlePalmApi: { id: 'oF4jKBK0jRbwEPWt', name: 'Google Gemini(PaLM) Api account' } },
    })
    GoogleGeminiChatModel1 = {
        options: {},
    };

    @node({
        name: 'Google Gemini Chat Model2',
        type: '@n8n/n8n-nodes-langchain.lmChatGoogleGemini',
        version: 1,
        position: [-728, 1472],
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
        this.WebhookGenerateContent.out(0).to(this.FormatFormInput.in(0));
        this.FormatFormInput.out(0).to(this.Agent1StrategyAnalyzer.in(0));
        this.Agent1StrategyAnalyzer.out(0).to(this.Agent2CopyWriter.in(0));
        this.Agent2CopyWriter.out(0).to(this.SavePostToDb.in(0));
        this.SavePostToDb.out(0).to(this.RouteByVisualStyle.in(0));
        this.RouteByVisualStyle.out(0).to(this.StyleGlassmorphism.in(0));
        this.RouteByVisualStyle.out(1).to(this.StyleModern3d.in(0));
        this.RouteByVisualStyle.out(2).to(this.StyleIsometric.in(0));
        this.RouteByVisualStyle.out(3).to(this.StyleDataHero.in(0));
        this.RouteByVisualStyle.out(4).to(this.StyleInfographic.in(0));
        this.RouteByVisualStyle.out(5).to(this.StyleDefault.in(0));
        this.StyleGlassmorphism.out(0).to(this.Agent3ImagePrompt.in(0));
        this.StyleModern3d.out(0).to(this.Agent3ImagePrompt.in(0));
        this.StyleIsometric.out(0).to(this.Agent3ImagePrompt.in(0));
        this.StyleDataHero.out(0).to(this.Agent3ImagePrompt.in(0));
        this.StyleInfographic.out(0).to(this.Agent3ImagePrompt.in(0));
        this.StyleDefault.out(0).to(this.Agent3ImagePrompt.in(0));
        this.Agent3ImagePrompt.out(0).to(this.UpdateImagePromptInDb.in(0));
        this.UpdateImagePromptInDb.out(0).to(this.DownloadMsiLogo.in(0));
        this.DownloadMsiLogo.out(0).to(this.PrepareForImageGen.in(0));
        this.PrepareForImageGen.out(0).to(this.StatusGeneratingImage.in(0));
        this.StatusGeneratingImage.out(0).to(this.GenerateImage.in(0));
        this.GenerateImage.out(0).to(this.CheckAndPrepareBinary.in(0));
        this.CheckAndPrepareBinary.out(0).to(this.UploadToImgbb.in(0));
        this.UploadToImgbb.out(0).to(this.UpdateDbWithImageUrl.in(0));
        this.UpdateDbWithImageUrl.out(0).to(this.FormatSuccessResponse.in(0));
        this.FormatSuccessResponse.out(0).to(this.RespondToWebhookGenerate.in(0));

        this.Agent1StrategyAnalyzer.uses({
            ai_languageModel: this.GoogleGeminiChatModel.output,
        });
        this.Agent2CopyWriter.uses({
            ai_languageModel: this.GoogleGeminiChatModel1.output,
        });
        this.Agent3ImagePrompt.uses({
            ai_languageModel: this.GoogleGeminiChatModel2.output,
        });
    }
}
