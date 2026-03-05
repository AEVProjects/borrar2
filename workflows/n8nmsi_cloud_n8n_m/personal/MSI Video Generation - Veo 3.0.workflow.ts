import { workflow, node, links } from '@n8n-as-code/transformer';

// <workflow-map>
// Workflow : MSI Video Generation - Veo 3.0
// Nodes   : 15  |  Connections: 17
//
// NODE INDEX
// ──────────────────────────────────────────────────────────────────
// Property name                    Node type (short)         Flags
// SendVeo31Video                     telegram
// TelegramTriggerReceived            telegramTrigger
// DownloadImageFile                  telegram
// ConvertBase64ToVideo               convertToFile
// ProcessingDelay30s                 wait
// VideoReadyValidator                if
// CheckVideoStatus                   httpRequest
// InitiateVeo31VideoGeneration       httpRequest
// ConvertBase64ToImageImageAndText   convertToFile
// ConvertBase64ToImageOnlyImage      convertToFile              [onError→out(1)]
// GenerateEnhancedImage              httpRequest
// PrepareApiPayload                  code
// CombineImageAnalysis               merge
// AiDesignAnalysis                   googleGemini
// ImageToBase64                      extractFromFile
//
// ROUTING MAP
// ──────────────────────────────────────────────────────────────────
// TelegramTriggerReceived
//    → DownloadImageFile
//      → AiDesignAnalysis
//        → CombineImageAnalysis.in(1)
//          → PrepareApiPayload
//            → GenerateEnhancedImage
//              → ConvertBase64ToImageOnlyImage
//                → InitiateVeo31VideoGeneration
//                  → CheckVideoStatus
//                    → VideoReadyValidator
//                      → ConvertBase64ToVideo
//                        → SendVeo31Video
//                     .out(1) → ProcessingDelay30s
//                        → CheckVideoStatus (↩ loop)
//               .out(1) → ConvertBase64ToImageImageAndText
//                  → InitiateVeo31VideoGeneration (↩ loop)
//      → ImageToBase64
//        → CombineImageAnalysis (↩ loop)
// </workflow-map>

// =====================================================================
// METADATA DU WORKFLOW
// =====================================================================

@workflow({
    id: 'TmscI72fQVLlz32a',
    name: 'MSI Video Generation - Veo 3.0',
    active: false,
    settings: { executionOrder: 'v1' },
})
export class MsiVideoGenerationVeo30Workflow {
    // =====================================================================
    // CONFIGURATION DES NOEUDS
    // =====================================================================

    @node({
        name: 'Send veo 3.1 video',
        type: 'n8n-nodes-base.telegram',
        version: 1.2,
        position: [4016, 832],
    })
    SendVeo31Video = {
        operation: 'sendVideo',
        chatId: "={{ $('Telegram Trigger Received').first().json.message.from.id }}",
        binaryData: true,
        additionalFields: {},
    };

    @node({
        name: 'Telegram Trigger Received',
        type: 'n8n-nodes-base.telegramTrigger',
        version: 1.2,
        position: [1072, 864],
    })
    TelegramTriggerReceived = {
        updates: ['message'],
        additionalFields: {},
    };

    @node({
        name: 'Download Image File',
        type: 'n8n-nodes-base.telegram',
        version: 1.2,
        position: [1280, 864],
    })
    DownloadImageFile = {
        resource: 'file',
        fileId: '={{ $json.message.photo[0].file_id }}',
        additionalFields: {},
    };

    @node({
        name: 'Convert Base64 to video',
        type: 'n8n-nodes-base.convertToFile',
        version: 1.1,
        position: [3808, 832],
    })
    ConvertBase64ToVideo = {
        operation: 'toBinary',
        sourceProperty: 'response.videos[0].bytesBase64Encoded',
        options: {},
    };

    @node({
        name: 'Processing Delay (30s)',
        type: 'n8n-nodes-base.wait',
        version: 1.1,
        position: [3728, 1008],
    })
    ProcessingDelay30s = {
        amount: 30,
    };

    @node({
        name: 'Video Ready Validator',
        type: 'n8n-nodes-base.if',
        version: 2.2,
        position: [3536, 848],
    })
    VideoReadyValidator = {
        conditions: {
            options: {
                version: 2,
                leftValue: '',
                caseSensitive: true,
                typeValidation: 'loose',
            },
            combinator: 'and',
            conditions: [
                {
                    id: '547fbae3-5ef7-4d29-94c4-ad0dfbfc5547',
                    operator: {
                        type: 'string',
                        operation: 'exists',
                        singleValue: true,
                    },
                    leftValue: '={{ $json.response.videos[0].bytesBase64Encoded }}',
                    rightValue: '',
                },
            ],
        },
        looseTypeValidation: true,
        options: {},
    };

    @node({
        name: 'Check Video Status',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.2,
        position: [3328, 848],
    })
    CheckVideoStatus = {
        method: 'POST',
        url: 'https://us-central1-aiplatform.googleapis.com/v1/projects/YOUR_GCP_PROJECT_ID/locations/us-central1/publishers/google/models/veo-3.1-generate-preview:fetchPredictOperation',
        authentication: 'predefinedCredentialType',
        nodeCredentialType: 'googleOAuth2Api',
        sendBody: true,
        specifyBody: 'json',
        jsonBody: '={\n  "operationName": "{{ $json.name }}"\n}',
        options: {},
    };

    @node({
        name: 'Initiate veo 3.1 Video Generation',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.2,
        position: [3136, 784],
    })
    InitiateVeo31VideoGeneration = {
        method: 'POST',
        url: 'https://us-central1-aiplatform.googleapis.com/v1/projects/YOUR_GCP_PROJECT_ID/locations/us-central1/publishers/google/models/veo-3.1-generate-preview:predictLongRunning',
        authentication: 'predefinedCredentialType',
        nodeCredentialType: 'googleOAuth2Api',
        sendBody: true,
        specifyBody: 'json',
        jsonBody:
            '={\n  "instances": [\n    {\n      "prompt": "Create a visually appealing 8-second marketing video showcasing this product. Add dynamic motion and suitable background audio.",\n      "image": {\n        "bytesBase64Encoded": "{{ $(\'Generate Enhanced Image\').item.json.candidates[0].content.parts[1].inlineData.data }}",\n        "mimeType": "{{ $json.candidates[0].content.parts[1].inlineData.mimeType }}"\n      }\n    }\n  ],\n  "parameters": {\n    "aspectRatio": "9:16",\n    "sampleCount": 1,\n    "durationSeconds": "8",\n    "personGeneration": "allow_all",\n    "addWatermark": true,\n    "includeRaiReason": true,\n    "generateAudio": true,\n    "resolution": "1080p"\n  }\n}\n',
        options: {},
    };

    @node({
        name: 'Convert Base64 to Image (image and text)',
        type: 'n8n-nodes-base.convertToFile',
        version: 1.1,
        position: [2928, 928],
    })
    ConvertBase64ToImageImageAndText = {
        operation: 'toBinary',
        sourceProperty: 'candidates[0].content.parts[1].inlineData.data',
        options: {},
    };

    @node({
        name: 'Convert Base64 to Image (only image)',
        type: 'n8n-nodes-base.convertToFile',
        version: 1.1,
        position: [2736, 800],
        onError: 'continueErrorOutput',
    })
    ConvertBase64ToImageOnlyImage = {
        operation: 'toBinary',
        sourceProperty: 'candidates[0].content.parts[0].inlineData.data',
        options: {},
    };

    @node({
        name: 'Generate Enhanced Image',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.2,
        position: [2512, 800],
    })
    GenerateEnhancedImage = {
        method: 'POST',
        url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent',
        authentication: 'predefinedCredentialType',
        nodeCredentialType: 'googlePalmApi',
        sendBody: true,
        specifyBody: 'json',
        jsonBody:
            '={\n  "contents": [\n    {\n      "parts": [\n        {\n          "text": {{ JSON.stringify($json.input1[1].content.parts[0].text) }}\n        },\n        {\n          "inlineData": {\n            "mimeType": "image/png",\n            "data": "{{ $json.input1[0].data }}"\n          }\n        }\n      ]\n    }\n  ],\n  "generationConfig": {\n    "responseModalities": ["TEXT", "IMAGE"],\n    "imageConfig": {\n      "aspectRatio": "9:16"\n    }\n  }\n}',
        options: {},
    };

    @node({
        name: 'Prepare API Payload',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [2272, 800],
    })
    PrepareApiPayload = {
        jsCode: '// Collect all items from both inputs\nconst input1 = $items("Combine Image & Analysis").map(i => i.json);\nconst input2 = $items("Combine Image & Analysis").map(i => i.json);\n\n// Return as a single item\nreturn [\n  {\n    json: {\n      input1: input1,\n      input2: input2\n    }\n  }\n];\n',
    };

    @node({
        name: 'Combine Image & Analysis',
        type: 'n8n-nodes-base.merge',
        version: 3.2,
        position: [2064, 800],
    })
    CombineImageAnalysis = {};

    @node({
        name: 'AI Design Analysis',
        type: '@n8n/n8n-nodes-langchain.googleGemini',
        version: 1,
        position: [1552, 1232],
    })
    AiDesignAnalysis = {
        resource: 'image',
        operation: 'analyze',
        modelId: {
            __rl: true,
            mode: 'list',
            value: 'models/gemini-2.5-flash-lite',
            cachedResultName: 'models/gemini-2.5-flash-lite',
        },
        text: '=You are an expert product photographer and advertising creative director. Analyze the uploaded product image and its caption: {{ $(\'Telegram Trigger Received\').item.json.message.caption }}\n\nYour task is to create a detailed image generation prompt that will transform this product photo into a premium, commercial-grade advertisement visual.\n\nANALYSIS REQUIREMENTS:\n1. **Product Identification**: Identify the product type, size, category, material, color scheme, and key features\n2. **Current State Assessment**: Note the current lighting, background, composition, and quality issues\n3. **Target Aesthetic**: Determine the ideal advertising style based on product category (luxury, tech, food, fashion, etc.)\n\nOUTPUT (Strict JSON format):\n{\n  "product_analysis": {\n    "type": "Detailed product category and specific item",\n    "size": "Estimated dimensions or scale",\n    "material": "Primary materials and textures",\n    "color_palette": "Dominant colors in the product",\n    "current_issues": "List any quality problems in original image"\n  },\n  \n  "image_generation_prompt": "Create a hyper-detailed prompt (500+ words) for generating the perfect product advertisement:\n\nPRODUCT PLACEMENT: [Describe exact positioning - centered, rule of thirds, etc. Keep product 100% identical to original]\n\nLIGHTING SETUP: \n- Key light: [direction, intensity, color temperature]\n- Fill light: [softness, position, ratio]\n- Rim/edge lighting: [accent placement]\n- Background light: [separation and depth]\n- Overall mood: [bright/moody/dramatic with specific color temperatures]\n\nBACKGROUND & ENVIRONMENT:\n- Style: [minimalist studio/lifestyle scene/luxury setting]\n- Surface: [marble/concrete/wood/fabric texture]\n- Color scheme: [complementary or analogous to product]\n- Props: [if any, subtle and relevant]\n- Depth: [bokeh, gradient, shadows for dimension]\n\nCOMPOSITION DETAILS:\n- Framing: [16:9 landscape, tight/medium/wide shot]\n- Focal point: [product positioning for visual hierarchy]\n- Negative space: [strategic empty areas]\n- Visual flow: [leading lines, eye movement path]\n\nCOLOR GRADING & POST-PROCESSING:\n- Product color: [enhance vibrancy by X%, specific adjustments]\n- Background treatment: [saturation, tone, contrast]\n- Shadow tint: [cool/warm, specific color]\n- Highlight treatment: [golden hour glow, crisp whites]\n- Overall contrast: [percentage increase]\n- Film style: [if applicable - cinematic, clean, vintage]\n\nVISUAL EFFECTS:\n- Depth of field: [f-stop equivalent blur]\n- Reflections: [surface reflections if relevant]\n- Particles/atmosphere: [dust motes, mist, light rays]\n- Glow/halo: [subtle rim light effect]\n- Shadows: [soft/hard, direction, opacity]\n\nSTYLE REFERENCES:\n- Match the aesthetic of: [Apple, Nike, luxury cosmetics, food photography, etc.]\n- Platform optimization: [Instagram, Pinterest, e-commerce]\n- Commercial quality: [editorial, catalog, hero shot]\n\nTECHNICAL SPECIFICATIONS:\n- Aspect ratio: 16:9 horizontal\n- Resolution: High-res, sharp focus on product\n- Camera angle: [eye-level/slightly above/dramatic low angle]\n- Lens effect: [50mm equivalent, 85mm portrait, macro detail]\n\nCRITICAL RULES:\n- Keep original product EXACTLY as is - no modifications\n- Professional studio photography quality\n- Ensure product is clearly visible and hero element\n- Create scroll-stopping visual appeal\n- Balance artistry with commercial clarity"\n}',
        inputType: 'binary',
        options: {},
    };

    @node({
        name: 'Image to Base64',
        type: 'n8n-nodes-base.extractFromFile',
        version: 1,
        position: [1744, 704],
    })
    ImageToBase64 = {
        operation: 'binaryToPropery',
        options: {},
    };

    // =====================================================================
    // ROUTAGE ET CONNEXIONS
    // =====================================================================

    @links()
    defineRouting() {
        this.TelegramTriggerReceived.out(0).to(this.DownloadImageFile.in(0));
        this.DownloadImageFile.out(0).to(this.AiDesignAnalysis.in(0));
        this.DownloadImageFile.out(0).to(this.ImageToBase64.in(0));
        this.ConvertBase64ToVideo.out(0).to(this.SendVeo31Video.in(0));
        this.ProcessingDelay30s.out(0).to(this.CheckVideoStatus.in(0));
        this.VideoReadyValidator.out(0).to(this.ConvertBase64ToVideo.in(0));
        this.VideoReadyValidator.out(1).to(this.ProcessingDelay30s.in(0));
        this.CheckVideoStatus.out(0).to(this.VideoReadyValidator.in(0));
        this.InitiateVeo31VideoGeneration.out(0).to(this.CheckVideoStatus.in(0));
        this.ConvertBase64ToImageImageAndText.out(0).to(this.InitiateVeo31VideoGeneration.in(0));
        this.ConvertBase64ToImageOnlyImage.out(0).to(this.InitiateVeo31VideoGeneration.in(0));
        this.ConvertBase64ToImageOnlyImage.out(1).to(this.ConvertBase64ToImageImageAndText.in(0));
        this.GenerateEnhancedImage.out(0).to(this.ConvertBase64ToImageOnlyImage.in(0));
        this.PrepareApiPayload.out(0).to(this.GenerateEnhancedImage.in(0));
        this.CombineImageAnalysis.out(0).to(this.PrepareApiPayload.in(0));
        this.AiDesignAnalysis.out(0).to(this.CombineImageAnalysis.in(1));
        this.ImageToBase64.out(0).to(this.CombineImageAnalysis.in(0));
    }
}
