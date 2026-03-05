import { workflow, node, links } from '@n8n-as-code/transformer';

// <workflow-map>
// Workflow : MSI Image Edit Flow
// Nodes   : 11  |  Connections: 10
//
// NODE INDEX
// ──────────────────────────────────────────────────────────────────
// Property name                    Node type (short)         Flags
// WebhookImageEdit                   webhook
// FormatEditInput                    code
// StatusEditingStarted               postgres                   [creds]
// DownloadOriginalImage              httpRequest
// PrepareForEdit                     code
// StatusGeneratingEdit               postgres                   [creds]
// GeminiEditImage                    httpRequest                [creds]
// ExtractEditedImage                 code
// UploadEditedToImgbb                httpRequest                [creds]
// UpdateDbWithEditedImage            postgres                   [creds]
// RespondSuccess                     respondToWebhook
//
// ROUTING MAP
// ──────────────────────────────────────────────────────────────────
// WebhookImageEdit
//    → FormatEditInput
//      → StatusEditingStarted
//        → DownloadOriginalImage
//          → PrepareForEdit
//            → StatusGeneratingEdit
//              → GeminiEditImage
//                → ExtractEditedImage
//                  → UploadEditedToImgbb
//                    → UpdateDbWithEditedImage
//                      → RespondSuccess
// </workflow-map>

// =====================================================================
// METADATA DU WORKFLOW
// =====================================================================

@workflow({
    id: 'W7Jsrb0OevHTDJL2',
    name: 'MSI Image Edit Flow',
    active: true,
    settings: { executionOrder: 'v1' },
})
export class MsiImageEditFlowWorkflow {
    // =====================================================================
    // CONFIGURATION DES NOEUDS
    // =====================================================================

    @node({
        name: 'Webhook - Image Edit',
        type: 'n8n-nodes-base.webhook',
        version: 2,
        position: [4464, 704],
    })
    WebhookImageEdit = {
        httpMethod: 'POST',
        path: 'msi-image-edit',
        responseMode: 'responseNode',
        options: {},
    };

    @node({
        name: 'Format Edit Input',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [4688, 704],
    })
    FormatEditInput = {
        jsCode: "// Extract data from web form\nconst input = $input.item.json;\n\nconsole.log('==== IMAGE EDIT WEBHOOK INPUT ====');\n\n// Parse the body if it's a JSON string\nlet data;\nif (input.body) {\n  if (typeof input.body === 'string') {\n    try {\n      data = JSON.parse(input.body);\n    } catch (e) {\n      data = input;\n    }\n  } else if (typeof input.body === 'object') {\n    data = input.body;\n  } else {\n    data = input;\n  }\n} else if (input.query) {\n  data = input.query;\n} else {\n  data = input;\n}\n\n// Extract variables\nconst image_url = data.image_url || '';\nconst edit_instructions = data.edit_instructions || '';\nconst post_id = data.post_id || null;\n\nconsole.log('Variables:', { image_url, edit_instructions, post_id });\n\nreturn [{\n  json: {\n    image_url,\n    edit_instructions,\n    post_id\n  }\n}];",
    };

    @node({
        name: 'Status: Editing Started',
        type: 'n8n-nodes-base.postgres',
        version: 2.5,
        position: [4912, 704],
        credentials: { postgres: { id: 'WnTYs2zvPoE7hDJE', name: 'Postgres account' } },
    })
    StatusEditingStarted = {
        operation: 'executeQuery',
        query: "=UPDATE social_posts SET status = 'editing_started', updated_at = NOW() WHERE id = '{{ $json.post_id }}'",
        options: {},
    };

    @node({
        name: 'Download Original Image',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.2,
        position: [5136, 704],
    })
    DownloadOriginalImage = {
        url: "={{ $('Format Edit Input').item.json.image_url }}",
        options: {
            response: {
                response: {
                    responseFormat: 'file',
                },
            },
            timeout: 90000,
        },
    };

    @node({
        name: 'Prepare for Edit',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [5360, 704],
    })
    PrepareForEdit = {
        jsCode: "// Prepare original image for Gemini edit\nconst formInput = $('Format Edit Input').item.json;\nconst originalImageItem = $input.item;\n\nconsole.log('==== PREPARE FOR IMAGE EDIT ====');\n\n// Get original image base64\nlet originalImageBase64 = '';\nlet originalMimeType = 'image/png';\n\nif (originalImageItem.binary && Object.keys(originalImageItem.binary).length > 0) {\n  const binaryKey = Object.keys(originalImageItem.binary)[0];\n  const binaryData = originalImageItem.binary[binaryKey];\n  originalMimeType = binaryData.mimeType || 'image/png';\n  \n  try {\n    const buffer = await this.helpers.getBinaryDataBuffer(0, binaryKey);\n    originalImageBase64 = buffer.toString('base64');\n    console.log('Image base64 length:', originalImageBase64.length);\n  } catch (e) {\n    console.error('Failed to get buffer:', e.message);\n    if (binaryData.data && binaryData.data !== 'filesystem-v2') {\n      originalImageBase64 = binaryData.data;\n    }\n  }\n}\n\nif (!originalImageBase64 || originalImageBase64 === 'filesystem-v2') {\n  throw new Error('Failed to extract original image data');\n}\n\nreturn [{\n  json: {\n    edit_instructions: formInput.edit_instructions,\n    post_id: formInput.post_id,\n    original_image_base64: originalImageBase64,\n    original_mime_type: originalMimeType\n  }\n}];",
    };

    @node({
        name: 'Status: Generating Edit',
        type: 'n8n-nodes-base.postgres',
        version: 2.5,
        position: [5584, 704],
        credentials: { postgres: { id: 'WnTYs2zvPoE7hDJE', name: 'Postgres account' } },
    })
    StatusGeneratingEdit = {
        operation: 'executeQuery',
        query: "=UPDATE social_posts SET status = 'generating_edit', updated_at = NOW() WHERE id = '{{ $json.post_id }}'",
        options: {},
    };

    @node({
        name: 'Gemini Edit Image',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.2,
        position: [5808, 704],
        credentials: { googlePalmApi: { id: 'oF4jKBK0jRbwEPWt', name: 'Google Gemini(PaLM) Api account' } },
    })
    GeminiEditImage = {
        method: 'POST',
        url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent',
        authentication: 'predefinedCredentialType',
        nodeCredentialType: 'googlePalmApi',
        sendBody: true,
        specifyBody: 'json',
        jsonBody:
            "={{ JSON.stringify({\n  contents: [{\n    parts: [\n      { text: 'Edit this image with the following instructions: ' + $('Prepare for Edit').item.json.edit_instructions + '. Keep the same 4:5 portrait aspect ratio. Make only the requested changes.' },\n      { inline_data: { mime_type: $('Prepare for Edit').item.json.original_mime_type, data: $('Prepare for Edit').item.json.original_image_base64 } }\n    ]\n  }],\n  generationConfig: {\n    responseModalities: ['IMAGE'],\n    imageConfig: {\n      aspectRatio: '4:5',\n      imageSize: '2K'\n    }\n  }\n}) }}",
        options: {
            response: {
                response: {},
            },
            timeout: 120000,
        },
    };

    @node({
        name: 'Extract Edited Image',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [6032, 704],
    })
    ExtractEditedImage = {
        jsCode: "// Extract edited image binary from Gemini response\nconst item = $input.item;\nconst postId = $('Prepare for Edit').item.json.post_id;\n\nconsole.log('==== CHECK EDITED IMAGE ====');\n\n// Check if response has inline_data (Gemini API structure)\nconst parts = item.json?.candidates?.[0]?.content?.parts?.[0];\nconst inlineData = parts?.inline_data || parts?.inlineData;\n\nif (inlineData) {\n  console.log('Found edited image from Gemini');\n  console.log('Data size:', inlineData.data?.length || 0);\n  \n  return [{\n    json: {\n      post_id: postId\n    },\n    binary: {\n      data: {\n        data: inlineData.data,\n        mimeType: inlineData.mime_type || inlineData.mimeType || 'image/png',\n        fileName: 'edited-image.png'\n      }\n    }\n  }];\n}\n\nthrow new Error('Gemini did not return an edited image.');",
    };

    @node({
        name: 'Upload Edited to ImgBB',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.1,
        position: [6256, 704],
        credentials: { httpHeaderAuth: { id: 'zx6X4T7j4yDMYWKo', name: 'imgbb-api' } },
    })
    UploadEditedToImgbb = {
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

    @node({
        name: 'Update DB with Edited Image',
        type: 'n8n-nodes-base.postgres',
        version: 2.5,
        position: [6480, 704],
        credentials: { postgres: { id: 'WnTYs2zvPoE7hDJE', name: 'Postgres account' } },
    })
    UpdateDbWithEditedImage = {
        operation: 'executeQuery',
        query: "=UPDATE social_posts \nSET image_url = '{{ $json.data.url }}',\n    status = 'completed',\n    updated_at = NOW()\nWHERE id = '{{ $('Extract Edited Image').item.json.post_id }}'\nRETURNING *",
        options: {},
    };

    @node({
        name: 'Respond Success',
        type: 'n8n-nodes-base.respondToWebhook',
        version: 1.1,
        position: [6704, 704],
    })
    RespondSuccess = {
        respondWith: 'json',
        responseBody:
            '={{ { "success": true, "message": "Image edited successfully", "data": { "new_image_url": $json.image_url, "post_id": $json.id } } }}',
        options: {},
    };

    // =====================================================================
    // ROUTAGE ET CONNEXIONS
    // =====================================================================

    @links()
    defineRouting() {
        this.WebhookImageEdit.out(0).to(this.FormatEditInput.in(0));
        this.FormatEditInput.out(0).to(this.StatusEditingStarted.in(0));
        this.StatusEditingStarted.out(0).to(this.DownloadOriginalImage.in(0));
        this.DownloadOriginalImage.out(0).to(this.PrepareForEdit.in(0));
        this.PrepareForEdit.out(0).to(this.StatusGeneratingEdit.in(0));
        this.StatusGeneratingEdit.out(0).to(this.GeminiEditImage.in(0));
        this.GeminiEditImage.out(0).to(this.ExtractEditedImage.in(0));
        this.ExtractEditedImage.out(0).to(this.UploadEditedToImgbb.in(0));
        this.UploadEditedToImgbb.out(0).to(this.UpdateDbWithEditedImage.in(0));
        this.UpdateDbWithEditedImage.out(0).to(this.RespondSuccess.in(0));
    }
}
