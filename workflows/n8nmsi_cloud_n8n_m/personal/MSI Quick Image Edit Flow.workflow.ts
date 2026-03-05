import { workflow, node, links } from '@n8n-as-code/transformer';

// <workflow-map>
// Workflow : MSI Quick Image Edit Flow
// Nodes   : 7  |  Connections: 6
//
// NODE INDEX
// ──────────────────────────────────────────────────────────────────
// Property name                    Node type (short)         Flags
// OnClick                            manualTrigger
// ConfigureInputs                    set
// DownloadImage                      httpRequest
// PrepareGeminiInput                 code
// GeminiImageEdit                    httpRequest                [creds]
// ExtractImage                       code
// UploadToImgbb                      httpRequest                [creds]
//
// ROUTING MAP
// ──────────────────────────────────────────────────────────────────
// OnClick
//    → ConfigureInputs
//      → DownloadImage
//        → PrepareGeminiInput
//          → GeminiImageEdit
//            → ExtractImage
//              → UploadToImgbb
// </workflow-map>

// =====================================================================
// METADATA DU WORKFLOW
// =====================================================================

@workflow({
    id: 'lrpYc6C0r9qDDRn3',
    name: 'MSI Quick Image Edit Flow',
    active: false,
    settings: { executionOrder: 'v1' },
})
export class MsiQuickImageEditFlowWorkflow {
    // =====================================================================
    // CONFIGURATION DES NOEUDS
    // =====================================================================

    @node({
        name: 'On Click',
        type: 'n8n-nodes-base.manualTrigger',
        version: 1,
        position: [11904, 256],
    })
    OnClick = {};

    @node({
        name: 'Configure Inputs',
        type: 'n8n-nodes-base.set',
        version: 2,
        position: [12128, 256],
    })
    ConfigureInputs = {
        values: {
            string: [
                {
                    name: 'image_url',
                    value: 'https://i.ibb.co/hJvsf2Qz/slide-2.jpg',
                },
                {
                    name: 'edit_prompt',
                    value: 'delete the quotation marks in the heading ',
                },
            ],
        },
        options: {},
    };

    @node({
        name: 'Download Image',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.2,
        position: [12352, 256],
    })
    DownloadImage = {
        url: '={{ $json.image_url }}',
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
        position: [12576, 256],
    })
    PrepareGeminiInput = {
        jsCode: "// Prepare Input for Gemini - use getBinaryDataBuffer to get real base64\nconst binaryData = $input.item.binary;\nconst prompt = $('Configure Inputs').item.json.edit_prompt;\n\nconst fileKey = Object.keys(binaryData || {})[0];\nif (!fileKey) {\n  throw new Error('Failed to download image. No binary data found.');\n}\n\nconst imageFile = binaryData[fileKey];\nconst mimeType = imageFile.mimeType || 'image/png';\n\n// Use getBinaryDataBuffer to get real base64 (avoids filesystem-v2 issue)\nlet imageBase64 = '';\ntry {\n  const buffer = await this.helpers.getBinaryDataBuffer(0, fileKey);\n  imageBase64 = buffer.toString('base64');\n} catch (e) {\n  if (imageFile.data && imageFile.data !== 'filesystem-v2') {\n    imageBase64 = imageFile.data;\n  } else {\n    throw new Error('Failed to extract image data: ' + e.message);\n  }\n}\n\nif (!imageBase64) {\n  throw new Error('Image base64 is empty after extraction.');\n}\n\nreturn [{\n  json: {\n    prompt: prompt,\n    mimeType: mimeType,\n    data: imageBase64\n  }\n}];",
    };

    @node({
        name: 'Gemini Image Edit',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.2,
        position: [12800, 256],
        credentials: { googlePalmApi: { id: 'oF4jKBK0jRbwEPWt', name: 'Google Gemini(PaLM) Api account' } },
    })
    GeminiImageEdit = {
        method: 'POST',
        url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent',
        authentication: 'predefinedCredentialType',
        nodeCredentialType: 'googlePalmApi',
        sendBody: true,
        specifyBody: 'json',
        jsonBody:
            '={\n  "contents": [{\n    "parts": [\n      { "text": "{{ $json.prompt }}" },\n      { "inlineData": {\n          "mimeType": "{{ $json.mimeType }}",\n          "data": "{{ $json.data }}"\n        }\n      }\n    ]\n  }],\n  "generationConfig": {\n    "responseModalities": ["IMAGE"]\n  }\n}',
        options: {
            timeout: 120000,
        },
    };

    @node({
        name: 'Extract Image',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [13024, 256],
    })
    ExtractImage = {
        jsCode: "// Extract Generated Image\nconst response = $input.item.json;\nconst candidates = response.candidates || [];\n\nlet imageData = null;\nlet mimeType = 'image/png';\n\nfor (const candidate of candidates) {\n  const parts = candidate?.content?.parts || [];\n  for (const part of parts) {\n    if (part.inlineData && part.inlineData.data) {\n      imageData = part.inlineData.data;\n      mimeType = part.inlineData.mimeType || 'image/png';\n      break;\n    }\n  }\n  if (imageData) break;\n}\n\nif (!imageData) {\n  throw new Error('No image generated by Gemini. ' + JSON.stringify(response));\n}\n\nreturn [{\n  json: { success: true },\n  binary: {\n    data: {\n        data: imageData,\n        mimeType: mimeType,\n        fileName: 'edited_image.png'\n    }\n  }\n}];",
    };

    @node({
        name: 'Upload to ImgBB',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.1,
        position: [13248, 256],
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
                    inputDataFieldName: 'data',
                },
            ],
        },
        options: {},
    };

    // =====================================================================
    // ROUTAGE ET CONNEXIONS
    // =====================================================================

    @links()
    defineRouting() {
        this.OnClick.out(0).to(this.ConfigureInputs.in(0));
        this.ConfigureInputs.out(0).to(this.DownloadImage.in(0));
        this.DownloadImage.out(0).to(this.PrepareGeminiInput.in(0));
        this.PrepareGeminiInput.out(0).to(this.GeminiImageEdit.in(0));
        this.GeminiImageEdit.out(0).to(this.ExtractImage.in(0));
        this.ExtractImage.out(0).to(this.UploadToImgbb.in(0));
    }
}
