import { workflow, node, links } from '@n8n-as-code/transformer';

// <workflow-map>
// Workflow : MSI Slide Image Gen v2
// Nodes   : 7  |  Connections: 6
//
// NODE INDEX
// ──────────────────────────────────────────────────────────────────
// Property name                    Node type (short)         Flags
// WebhookSlideGen                    webhook
// DownloadMsiLogo                    httpRequest
// PrepareGeminiInput                 code
// GenerateImage                      httpRequest                [creds]
// ExtractBinary                      code
// UploadToImgbb                      httpRequest                [creds]
// UpdateSlideDb                      postgres                   [creds]
//
// ROUTING MAP
// ──────────────────────────────────────────────────────────────────
// WebhookSlideGen
//    → DownloadMsiLogo
//      → PrepareGeminiInput
//        → GenerateImage
//          → ExtractBinary
//            → UploadToImgbb
//              → UpdateSlideDb
// </workflow-map>

// =====================================================================
// METADATA DU WORKFLOW
// =====================================================================

@workflow({
    id: 'QtGEvzUrvpfXrC1I',
    name: 'MSI Slide Image Gen v2',
    active: true,
    settings: { executionOrder: 'v1' },
})
export class MsiSlideImageGenV2Workflow {
    // =====================================================================
    // CONFIGURATION DES NOEUDS
    // =====================================================================

    @node({
        name: 'Webhook - Slide Gen',
        type: 'n8n-nodes-base.webhook',
        version: 2,
        position: [52288, 2752],
    })
    WebhookSlideGen = {
        httpMethod: 'POST',
        path: 'msi-slide-gen',
        options: {},
    };

    @node({
        name: 'Download MSI Logo',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.2,
        position: [52512, 2752],
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
        name: 'Prepare Gemini Input',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [52736, 2752],
    })
    PrepareGeminiInput = {
        jsCode: "// Prepare Gemini Input - Build complete slide image prompt\nconst inputData = $('Webhook - Slide Gen').item.json;\nconst input = inputData.body || inputData;\nconst logoItem = $('Download MSI Logo').item;\n\n// Get logo base64\nlet logoBase64 = '';\nif (logoItem.binary && Object.keys(logoItem.binary).length > 0) {\n  const binaryKey = Object.keys(logoItem.binary)[0];\n  const binaryData = logoItem.binary[binaryKey];\n  \n  try {\n    const buffer = await this.helpers.getBinaryDataBuffer(0, binaryKey);\n    logoBase64 = buffer.toString('base64');\n  } catch (e) {\n     if (binaryData.data && binaryData.data !== 'filesystem-v2') {\n         logoBase64 = binaryData.data;\n     }\n  }\n}\n\n// Extract all slide content fields\nconst slideNumber = parseInt(input.slide_number) || 1;\nconst headline = input.headline || '';\nconst subtext = input.subtext || '';\nconst bodyText = input.body_text || '';\nconst topic = input.topic || 'Technology';\n\n// CRITICAL: Get the specific image_prompt from Agent 3 (Visual Director)\n// This contains a detailed, news-specific scene description\nconst agentImagePrompt = input.image_prompt || '';\n\n// Extract source from visual_style JSON\nlet source = '';\ntry {\n  if (input.visual_style) {\n    const vs = typeof input.visual_style === 'string' ? JSON.parse(input.visual_style) : input.visual_style;\n    source = vs.source || '';\n  }\n} catch (e) {\n  source = '';\n}\nif (!source || source.trim() === '') {\n  source = 'Industry Report';\n}\n\n// Generate dynamic tagline for Slide 1 based on topic\nconst topicLower = topic.toLowerCase();\nlet topicTagline = 'Our Latest Tech News';\nif (topicLower.includes('ai') || topicLower.includes('artificial intelligence') || topicLower.includes('machine learning')) {\n  topicTagline = 'Our Latest AI News';\n} else if (topicLower.includes('security') || topicLower.includes('cyber')) {\n  topicTagline = 'Our Latest Security News';\n} else if (topicLower.includes('cloud')) {\n  topicTagline = 'Our Latest Cloud News';\n} else if (topicLower.includes('data')) {\n  topicTagline = 'Our Latest Data News';\n} else if (topicLower.includes('digital') || topicLower.includes('transformation')) {\n  topicTagline = 'Our Latest Digital News';\n} else if (topicLower.includes('bpo') || topicLower.includes('outsourcing')) {\n  topicTagline = 'Our Latest Business News';\n} else if (topicLower.includes('blockchain') || topicLower.includes('crypto')) {\n  topicTagline = 'Our Latest Blockchain News';\n} else if (topicLower.includes('automation') || topicLower.includes('rpa')) {\n  topicTagline = 'Our Latest Automation News';\n}\n\nconst isBlueSlide = (slideNumber === 1 || slideNumber === 3 || slideNumber === 5);\nconst paginationNumber = slideNumber;\n\n// Build a specific photo description from Agent 3's prompt + headline context\n// If Agent 3 provided a specific scene, use it. Otherwise build from headline.\nconst photoScene = agentImagePrompt \n  ? agentImagePrompt \n  : `A realistic editorial photograph that visually represents this specific news: \"${headline}\". ${bodyText ? 'Context: ' + bodyText : ''} The photo must be specific to this story, not generic.`;\n\nlet fullPrompt = '';\n\nif (slideNumber === 1) {\n  fullPrompt = `Create a 4:5 Instagram carousel SLIDE 1 for MSI Technologies.\n\nLOGO (CRITICAL - DO NOT MODIFY):\n- Place the attached MSI logo EXACTLY as provided in TOP-LEFT corner\n- Logo size: approximately 60-80 pixels height, proportional width\n- DO NOT resize, redraw, recreate, or modify the logo in ANY way\n- Use the EXACT logo file provided - no alterations\n\nLAYOUT:\n- ENTIRE SLIDE: Gradient background from MSI Blue #207CE5 to Dark Blue #004AAD\n- MAIN VISUAL: A striking 3D ANIMATED-STYLE element that represents the SPECIFIC topic of this carousel: \"${headline}\"\n- The 3D object must be UNIQUE, CREATIVE, and DIRECTLY connected to what the headline is about. Think: what physical object or concept best symbolizes \"${headline}\"? Create a 3D version of THAT.\n- NOT centered - position creatively (top-right, bottom-left, or asymmetric)\n- VARY THE OBJECT: must be completely different from any standard tech icon. Be creative and unexpected.\n- 3D ELEMENT COLORS: WHITE, CREAM #FFFDF1, or SILVER tones ONLY. Must CONTRAST against blue.\n- Glossy/metallic finish, subtle glow, floating with depth.\n\nFORBIDDEN 3D ELEMENTS (these are overused clichÃ©s):\n- NO servers, NO cloud shapes, NO network lines, NO circuit boards, NO binary code\n- NO globe with connections, NO gears, NO floating screens, NO lock/shield icons\n- NO generic tech symbols. The 3D element must be SPECIFIC to this headline.\n\nTYPOGRAPHY (MANDATORY):\n- HEADINGS: ITC Avant Garde font (bold, geometric sans-serif)\n- BODY/CONTENT: Quicksand font (rounded, friendly sans-serif)\n- ALL text NORMAL proportions - NOT stretched, NOT condensed, NOT elongated\n\nTEXT CONTENT (white color):\n- VERY LARGE bold title in ITC Avant Garde: \"${headline}\" - Position to COMPLEMENT the 3D element\n- Smaller tagline below in Quicksand: \"${topicTagline}\"\n- Bottom-RIGHT corner: \"Swipe >>>\" in Quicksand\n\nFORBIDDEN: Stretched text, condensed fonts, blue 3D elements, gold elements, people, photographs.`;\n\n} else if (slideNumber === 5) {\n  fullPrompt = `Create a 4:5 Instagram carousel SLIDE 5 - CTA for MSI Technologies.\n\nLOGO (CRITICAL - WHITE VERSION):\n- Place the attached MSI logo in TOP-LEFT corner\n- Logo size: approximately 60-80 pixels height, proportional width\n- INVERT the logo colors: every BLUE (#207CE5) pixel becomes WHITE (#FFFFFF) and every WHITE pixel becomes BLUE (#207CE5). This creates a WHITE version of the logo for the blue gradient background.\n- Keep the EXACT same design, shape, proportions and details - ONLY swap the colors.\n- The result should be a crisp WHITE logo visible against the blue gradient.\n\nLAYOUT:\n- ENTIRE SLIDE: Gradient background from MSI Blue #207CE5 to Dark Blue #004AAD\n- NO photo - solid gradient only\n- Content vertically centered\n\nTYPOGRAPHY (MANDATORY):\n- HEADINGS: ITC Avant Garde font (bold, geometric sans-serif)\n- BODY/CONTENT: Quicksand font (rounded, friendly sans-serif)\n- ALL text NORMAL proportions\n\nTEXT CONTENT (white, centered):\n- HEADING 1 (LARGE, bold, ITC Avant Garde): \"${headline}\"\n- HEADING 2 (Medium, below heading 1, Quicksand, REGULAR weight - NOT BOLD): \"${subtext || \"Let's Work Together\"}\"\n\nCONTACT INFO (bottom center, medium-small white Quicksand - elegant, not oversized):\n- Line 1: envelope icon then contact@msitechnologiesinc.com\n- Line 2: globe icon then msitechnologiesinc.com\n\nFORBIDDEN: Stretched text, condensed fonts, @ symbols, pagination, modifying logo, Follow Us text.`;\n\n} else if (slideNumber === 2 || slideNumber === 4) {\n  fullPrompt = `Create a 4:5 Instagram carousel SLIDE ${slideNumber} for MSI Technologies.\n\nLOGO (CRITICAL - DO NOT MODIFY):\n- Place the attached MSI logo (blue version) EXACTLY as provided in TOP-LEFT corner, overlaying the photo\n- Logo size: approximately 60-80 pixels height, proportional width\n- DO NOT resize, redraw, recreate, or modify the logo in ANY way\n\nCRITICAL LAYOUT (MANDATORY - NO EXCEPTIONS):\n- The photo MUST be FULL-BLEED at the top: it starts at pixel y=0, x=0 and spans the FULL WIDTH of the slide.\n- There must be ZERO gap, ZERO margin, ZERO padding, ZERO white space above the photo. The photo literally touches the top edge.\n- Top 55%: SPECIFIC photo described below. Photo touches ALL edges (top, left, right). AVOID PEOPLE.\n- Apply subtle WHITE GRADIENT at bottom edge of photo blending smoothly into the white section below.\n- Bottom 45%: Clean WHITE background for text.\n- TRIPLE CHECK: The very first pixel row of the image must be part of the PHOTO, not white or any solid color.\n\nPHOTO DESCRIPTION (THIS IS THE SPECIFIC SCENE TO SHOW):\n${photoScene}\n\nPHOTO STYLE: High-end editorial photography (think Bloomberg, Harvard Business Review, Wired). Strategic, evocative, cinematic. The photo should visually represent the BUSINESS INSIGHT, not just the news topic.\nFORBIDDEN PHOTOS: NO generic office spaces, NO generic tech imagery, NO servers, NO cloud shapes, NO circuit boards, NO binary code, NO handshakes, NO people pointing at screens, NO stock photo clichÃ©s. The photo MUST visually represent the STRATEGIC ANGLE of the headline: \"${headline}\"\n\nTYPOGRAPHY (MANDATORY):\n- HEADINGS: ITC Avant Garde font (bold, geometric sans-serif)\n- BODY/CONTENT: Quicksand font (rounded, friendly sans-serif)\n- ALL text NORMAL proportions\n\nTEXT (on white section, left-aligned with padding):\n- Headline in ITC Avant Garde BOLD (blue #207CE5, 18-20pt equivalent): \"${headline}\"\n- Body text in Quicksand REGULAR (dark gray #333333, 11-12pt equivalent - SMALL ENOUGH to fit 4-5 lines comfortably): \"${bodyText}\"\n- Source in Quicksand (very small 9pt, light gray #999): \"Source: ${source}\"\n- Bottom-right in Quicksand REGULAR weight (NOT BOLD, small): \"${paginationNumber}/5\"\n\nBODY TEXT SIZING (CRITICAL):\n- The body text is 4-5 short lines (25-35 words). Use 11-12pt font so ALL lines fit comfortably.\n- DO NOT truncate or cut body text. ALL text must be visible.\n- Leave enough vertical space between headline and body, and between body and source.\n\nFORBIDDEN: ANY white bar or gap above the photo (the photo must touch the top edge). Generic photos. Modifying logo. Bold pagination. Truncated body text.`;\n\n} else {\n  fullPrompt = `Create a 4:5 Instagram carousel SLIDE ${slideNumber} for MSI Technologies.\n\nLOGO (CRITICAL - DO NOT MODIFY):\n- Place the attached MSI logo EXACTLY as provided in TOP-LEFT corner\n- Logo size: approximately 60-80 pixels height, proportional width\n- DO NOT resize, redraw, recreate, or modify the logo in ANY way\n\nLAYOUT:\n- Top 55%: SPECIFIC photo described below. AVOID PEOPLE. Apply BLUE GRADIENT overlay at bottom blending into blue section.\n- Bottom 45%: Solid MSI Blue #207CE5\n\nPHOTO DESCRIPTION (THIS IS THE SPECIFIC SCENE TO SHOW):\n${photoScene}\n\nPHOTO STYLE: High-end editorial photography (think Bloomberg, Harvard Business Review, Wired). Strategic, evocative, cinematic. The photo should visually represent the BUSINESS INSIGHT, not just the news topic.\nFORBIDDEN PHOTOS: NO generic office spaces, NO generic tech imagery, NO servers, NO cloud shapes, NO circuit boards, NO binary code, NO handshakes, NO stock photo clichÃ©s. The photo MUST visually represent the STRATEGIC ANGLE of the headline: \"${headline}\"\n\nTYPOGRAPHY (MANDATORY):\n- HEADINGS: ITC Avant Garde font (bold, geometric sans-serif)\n- BODY/CONTENT: Quicksand font (rounded, friendly sans-serif)\n- ALL text NORMAL proportions\n\nTEXT (on blue section, left-aligned with padding):\n- Headline in ITC Avant Garde BOLD (white, 18-20pt equivalent): \"${headline}\"\n- Body text in Quicksand REGULAR (cream #FFFDF1, 11-12pt equivalent - SMALL ENOUGH to fit 4-5 lines comfortably): \"${bodyText}\"\n- Source in Quicksand (very small 9pt, light cream): \"Source: ${source}\"\n- Bottom-right in Quicksand REGULAR weight (NOT BOLD, small): \"${paginationNumber}/5\"\n\nBODY TEXT SIZING (CRITICAL):\n- The body text is 4-5 short lines (25-35 words). Use 11-12pt font so ALL lines fit comfortably.\n- DO NOT truncate or cut body text. ALL text must be visible.\n- Leave enough vertical space between headline and body, and between body and source.\n\nSTYLE: Clean, minimal, professional. AVOID people.`;\n}\n\nreturn [{\n  json: {\n    image_prompt: fullPrompt,\n    slide_id: input.slide_id,\n    carousel_id: input.carousel_id,\n    slide_number: slideNumber,\n    headline: headline,\n    subtext: subtext,\n    body_text: bodyText,\n    source: source,\n    topic: topic,\n    topic_tagline: topicTagline,\n    is_blue_slide: isBlueSlide,\n    logo_base64: logoBase64\n  }\n}];",
    };

    @node({
        name: 'Generate Image',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.2,
        position: [52960, 2752],
        credentials: { googlePalmApi: { id: 'Y6AAwVtzmfJHpXGy', name: 'Google Gemini(PaLM) Api account 2' } },
    })
    GenerateImage = {
        method: 'POST',
        url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent',
        authentication: 'predefinedCredentialType',
        nodeCredentialType: 'googlePalmApi',
        sendBody: true,
        specifyBody: 'json',
        jsonBody:
            "={{ JSON.stringify({\n  contents: [{\n    parts: [\n      { text: $json.image_prompt },\n      { inline_data: { mime_type: 'image/png', data: $json.logo_base64 } }\n    ]\n  }],\n  generationConfig: {\n    responseModalities: ['TEXT', 'IMAGE']\n  }\n}) }}",
        options: {
            response: {
                response: {},
            },
            timeout: 120000,
        },
    };

    @node({
        name: 'Extract Binary',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [53184, 2752],
    })
    ExtractBinary = {
        jsCode: "// Extract image binary from Gemini response\nconst item = $input.item;\nconst preparedData = $('Prepare Gemini Input').item.json;\nconst candidates = item.json?.candidates || [];\n\nlet imageData = null;\nlet mimeType = 'image/png';\n\n// Search through all parts for image data\nfor (const candidate of candidates) {\n  const parts = candidate?.content?.parts || [];\n  for (const part of parts) {\n    const inlineData = part?.inline_data || part?.inlineData;\n    if (inlineData && inlineData.data) {\n      imageData = inlineData.data;\n      mimeType = inlineData.mime_type || inlineData.mimeType || 'image/png';\n      break;\n    }\n  }\n  if (imageData) break;\n}\n\nif (imageData) {\n  return [{\n    json: {\n      slide_id: preparedData.slide_id,\n      carousel_id: preparedData.carousel_id,\n      slide_number: preparedData.slide_number\n    },\n    binary: {\n      data: {\n        data: imageData,\n        mimeType: mimeType,\n        fileName: `slide_${preparedData.slide_number}.png`\n      }\n    }\n  }];\n}\n\nthrow new Error('No image generated. Response: ' + JSON.stringify(item.json).substring(0, 500));",
    };

    @node({
        name: 'Upload to ImgBB',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.1,
        position: [53408, 2752],
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
        name: 'Update Slide DB',
        type: 'n8n-nodes-base.postgres',
        version: 2.5,
        position: [53632, 2752],
        credentials: { postgres: { id: 'WnTYs2zvPoE7hDJE', name: 'Postgres account' } },
    })
    UpdateSlideDb = {
        operation: 'executeQuery',
        query: "UPDATE carousel_slides \nSET image_url = '{{ $json.data.url }}', \n    updated_at = NOW()\nWHERE id = '{{ $('Extract Binary').item.json.slide_id }}'\nRETURNING *",
        options: {},
    };

    // =====================================================================
    // ROUTAGE ET CONNEXIONS
    // =====================================================================

    @links()
    defineRouting() {
        this.WebhookSlideGen.out(0).to(this.DownloadMsiLogo.in(0));
        this.DownloadMsiLogo.out(0).to(this.PrepareGeminiInput.in(0));
        this.PrepareGeminiInput.out(0).to(this.GenerateImage.in(0));
        this.GenerateImage.out(0).to(this.ExtractBinary.in(0));
        this.ExtractBinary.out(0).to(this.UploadToImgbb.in(0));
        this.UploadToImgbb.out(0).to(this.UpdateSlideDb.in(0));
    }
}
