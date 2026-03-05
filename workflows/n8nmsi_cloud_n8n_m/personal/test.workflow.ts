import { workflow, node, links } from '@n8n-as-code/transformer';

// <workflow-map>
// Workflow : test
// Nodes   : 44  |  Connections: 42
//
// NODE INDEX
// ──────────────────────────────────────────────────────────────────
// Property name                    Node type (short)         Flags
// CheckLinkedin                      if
// CheckFacebook                      if
// TextPostLinkedin                   linkedIn                   [creds]
// LinkedinContentType                switch
// CodeInJavascript                   code
// SeparateImages                     code
// RegisterLoad                       httpRequest                [creds]
// Uploadimage                        httpRequest
// SingleImagePostLinkedin            linkedIn                   [creds]
// MultipleImagePostLinkedin          httpRequest                [creds]
// FacebookContentType                switch
// FacebookSingleImagePost            httpRequest                [creds]
// FbSeparateImages                   code
// FbUploadImageHidden                httpRequest                [creds]
// FbBuildMediaArray                  code
// FbPublishMultipleImages            httpRequest                [creds]
// OnFormSubmission                   formTrigger
// FacebookPagePostV220               httpRequest                [creds]
// SubirAImgbb                        httpRequest                [creds]
// CrearContenedorIg                  facebookGraphApi           [creds]
// SubirCadaImagenAImgbb              httpRequest                [creds]
// VerificarEstadoIg                  httpRequest                [creds]
// Listo                              if
// EsperarProcesamiento1              wait
// PublicarEnInstagram                facebookGraphApi           [creds]
// FacebookContentType1               switch
// CodeInJavascript1                  code
// IgCrearItemDeCarrusel              facebookGraphApi           [creds]
// IgAgruparIdsParaCarrusel           code
// IgCrearContenedorMaestro           facebookGraphApi           [creds]
// CheckInstagram                     if
// MsiContentForm                     formTrigger
// FormatFormInput1                   set
// Agent1StrategyAnalyzer1            agent                      [AI]
// Agent2CopyWriter1                  agent                      [AI]
// Agent3ImagePromptEngineer1         agent                      [AI]
// FormatCombinedOutput1              set
// ValidateAndParseJson1              code
// SaveToDatabase1                    postgres                   [creds]
// ThinkTool1                         toolThink
// SaveToDatabase                     postgres                   [creds]
// OpenaiChatModel                    lmChatOpenAi               [creds]
// GenerateAnImage                    googleGemini               [creds]
// SubirCadaImagenAImgbb1             httpRequest                [creds]
//
// ROUTING MAP
// ──────────────────────────────────────────────────────────────────
// OnFormSubmission
//    → CheckLinkedin
//      → LinkedinContentType
//        → TextPostLinkedin
//       .out(1) → SingleImagePostLinkedin
//       .out(2) → SeparateImages
//          → RegisterLoad
//            → Uploadimage
//              → CodeInJavascript
//                → MultipleImagePostLinkedin
//    → CheckFacebook
//      → FacebookContentType
//        → FacebookPagePostV220
//       .out(1) → FacebookSingleImagePost
//       .out(2) → FbSeparateImages
//          → FbUploadImageHidden
//            → FbBuildMediaArray
//              → FbPublishMultipleImages
//    → CheckInstagram
//      → FacebookContentType1
//        → SubirAImgbb
//          → CrearContenedorIg
//            → EsperarProcesamiento1
//              → VerificarEstadoIg
//                → Listo
//                  → PublicarEnInstagram
//                 .out(1) → EsperarProcesamiento1 (↩ loop)
//       .out(1) → CodeInJavascript1
//          → SubirCadaImagenAImgbb
//            → IgCrearItemDeCarrusel
//              → IgAgruparIdsParaCarrusel
//                → IgCrearContenedorMaestro
//                  → EsperarProcesamiento1 (↩ loop)
// MsiContentForm
//    → FormatFormInput1
//      → Agent1StrategyAnalyzer1
//        → Agent3ImagePromptEngineer1
//          → FormatCombinedOutput1
//            → ValidateAndParseJson1
//              → SaveToDatabase1
//                → GenerateAnImage
//                  → SubirCadaImagenAImgbb1
//      → Agent2CopyWriter1
//        → SaveToDatabase
//
// AI CONNECTIONS
// ThinkTool1.uses({ ai_tool: [ThinkTool1] })
// OpenaiChatModel.uses({ ai_languageModel: Agent1StrategyAnalyzer1, ai_languageModel: Agent2CopyWriter1, ai_languageModel: Agent3ImagePromptEngineer1 })
// </workflow-map>

// =====================================================================
// METADATA DU WORKFLOW
// =====================================================================

@workflow({
    id: 'v77Wc9pJpc9rj9kD',
    name: 'test',
    active: false,
    settings: { executionOrder: 'v1' },
})
export class TestWorkflow {
    // =====================================================================
    // CONFIGURATION DES NOEUDS
    // =====================================================================

    @node({
        name: 'Check LinkedIn',
        type: 'n8n-nodes-base.if',
        version: 2.2,
        position: [-1056, 96],
    })
    CheckLinkedin = {
        conditions: {
            options: {
                caseSensitive: true,
                leftValue: '',
                typeValidation: 'strict',
                version: 2,
            },
            conditions: [
                {
                    id: '18092288-7512-4299-81a1-3091917f8b2d',
                    leftValue: '={{ $json.publish_linkedin }}',
                    rightValue: 'Yes',
                    operator: {
                        type: 'string',
                        operation: 'equals',
                    },
                },
            ],
            combinator: 'and',
        },
        options: {},
    };

    @node({
        name: 'Check Facebook',
        type: 'n8n-nodes-base.if',
        version: 2.2,
        position: [-1056, 672],
    })
    CheckFacebook = {
        conditions: {
            options: {
                caseSensitive: true,
                leftValue: '',
                typeValidation: 'strict',
                version: 2,
            },
            conditions: [
                {
                    id: '50c8e378-687f-449e-b816-433b91349f21',
                    leftValue: '={{ $json.publish_facebook }}',
                    rightValue: 'Yes',
                    operator: {
                        type: 'string',
                        operation: 'equals',
                    },
                },
            ],
            combinator: 'and',
        },
        options: {},
    };

    @node({
        name: 'Text Post Linkedin',
        type: 'n8n-nodes-base.linkedIn',
        version: 1,
        position: [-608, -96],
        credentials: { linkedInCommunityManagementOAuth2Api: { id: 'EM6TxDAmqBcNfWEy', name: 'n8n-post-msi' } },
    })
    TextPostLinkedin = {
        authentication: 'communityManagement',
        postAs: 'organization',
        organization: '105834790',
        text: "={{ $('On form submission').item.json.post_type }}",
        additionalFields: {},
    };

    @node({
        name: 'LinkedIn Content Type',
        type: 'n8n-nodes-base.switch',
        version: 3.3,
        position: [-832, 80],
    })
    LinkedinContentType = {
        rules: {
            values: [
                {
                    conditions: {
                        options: {
                            caseSensitive: true,
                            leftValue: '',
                            typeValidation: 'strict',
                            version: 2,
                        },
                        conditions: [
                            {
                                leftValue: '={{ $json.Image[0].filename }}',
                                rightValue: 0,
                                operator: {
                                    type: 'string',
                                    operation: 'notExists',
                                    singleValue: true,
                                },
                                id: '41da3f81-ba14-4d48-bf39-971a5c91800c',
                            },
                        ],
                        combinator: 'and',
                    },
                    renameOutput: true,
                    outputKey: 'Text Post',
                },
                {
                    conditions: {
                        options: {
                            caseSensitive: true,
                            leftValue: '',
                            typeValidation: 'strict',
                            version: 2,
                        },
                        conditions: [
                            {
                                id: '846b662b-95e3-4d61-8acb-ca77b5ac92ee',
                                leftValue: '={{ $json["Image"].length }}',
                                rightValue: 1,
                                operator: {
                                    type: 'number',
                                    operation: 'equals',
                                },
                            },
                        ],
                        combinator: 'and',
                    },
                    renameOutput: true,
                    outputKey: 'Single image and Text Post',
                },
                {
                    conditions: {
                        options: {
                            caseSensitive: true,
                            leftValue: '',
                            typeValidation: 'strict',
                            version: 2,
                        },
                        conditions: [
                            {
                                id: '8a102074-89e6-4c87-9d9f-76fe9c0bc6d9',
                                leftValue: '={{ $json["Image"].length }}',
                                rightValue: 1,
                                operator: {
                                    type: 'number',
                                    operation: 'gt',
                                },
                            },
                        ],
                        combinator: 'and',
                    },
                    renameOutput: true,
                    outputKey: 'Multiple Image and Text Post',
                },
            ],
        },
        options: {},
    };

    @node({
        name: 'Code in JavaScript',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [64, 288],
    })
    CodeInJavascript = {
        jsCode: '// Obtenemos todos los ítems del nodo de registro\nconst itemsRegistro = $(\'Register Load\').all();\n\nconst mediaItems = [];\n\n// Recorremos cada respuesta de LinkedIn\nfor (const item of itemsRegistro) {\n    // Obtenemos el URN (el identificador de la imagen)\n    const urn = item.json.value.image;\n    \n    if (urn) {\n        // CORRECCIÓN: LinkedIn exige que la llave se llame "id", no "media"\n        mediaItems.push({\n            "id": urn\n        });\n    }\n}\n\n// Devolvemos la lista limpia y correcta\nreturn [{\n    json: {\n        contentEntities: mediaItems\n    }\n}];',
    };

    @node({
        name: 'Separate Images',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-608, 288],
    })
    SeparateImages = {
        jsCode: "// 1. Obtenemos todos los ítems de entrada\nconst allItems = $input.all();\nconst newItems = [];\n\n// 2. Iteramos sobre cada ítem (por si llegan varios)\nfor (const item of allItems) {\n  const binaryData = item.binary;\n  \n  // Si no hay archivos binarios, saltamos este ítem\n  if (!binaryData) continue;\n\n  // 3. Recorremos todas las llaves del objeto binario (Image, Image1, etc.)\n  for (const key of Object.keys(binaryData)) {\n    // Filtramos para procesar solo los campos que empiezan con \"Image\" o se llamen \"data\"\n    if (key.startsWith('Image') || key === 'data') {\n      newItems.push({\n        json: {\n          ...item.json, // Mantenemos todos los datos (post_type, etc.)\n          filename: binaryData[key].fileName,\n          mimetype: binaryData[key].mimeType\n        },\n        binary: {\n          data: binaryData[key] // Renombramos a 'data' para el siguiente nodo\n        }\n      });\n    }\n  }\n}\n\n// 4. Devolvemos la lista de ítems (uno por cada imagen)\nreturn newItems;",
    };

    @node({
        name: 'Register Load',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.3,
        position: [-384, 288],
        credentials: {
            httpHeaderAuth: { id: 'wbVTQWbgdpOAG6rR', name: 'facebook-msi' },
            linkedInCommunityManagementOAuth2Api: { id: 'EM6TxDAmqBcNfWEy', name: 'n8n-post-msi' },
            linkedInOAuth2Api: { id: 'vBlxeK4NpAtRjb3Z', name: 'LinkedIn account 2' },
        },
    })
    RegisterLoad = {
        method: 'POST',
        url: 'https://api.linkedin.com/rest/images?action=initializeUpload',
        authentication: 'predefinedCredentialType',
        nodeCredentialType: 'linkedInCommunityManagementOAuth2Api',
        sendHeaders: true,
        headerParameters: {
            parameters: [
                {
                    name: 'LinkedIn-Version',
                    value: '202510',
                },
                {
                    name: 'X-Restli-Protocol-Version',
                    value: '2.0.0',
                },
            ],
        },
        sendBody: true,
        specifyBody: 'json',
        jsonBody: '{\n  "initializeUploadRequest": {\n    "owner": "urn:li:organization:105834790"\n  }\n}',
        options: {},
    };

    @node({
        name: 'UploadImage',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.3,
        position: [-160, 288],
    })
    Uploadimage = {
        method: 'PUT',
        url: '={{ $json.value.uploadUrl }}',
        sendHeaders: true,
        headerParameters: {
            parameters: [
                {
                    name: 'Content-Type',
                    value: 'application/octet-stream',
                },
            ],
        },
        sendBody: true,
        contentType: 'binaryData',
        inputDataFieldName: "={{ $('Separate Images').item.binary.data }}",
        options: {},
    };

    @node({
        name: 'Single Image Post Linkedin',
        type: 'n8n-nodes-base.linkedIn',
        version: 1,
        position: [-608, 96],
        credentials: { linkedInCommunityManagementOAuth2Api: { id: 'EM6TxDAmqBcNfWEy', name: 'n8n-post-msi' } },
    })
    SingleImagePostLinkedin = {
        authentication: 'communityManagement',
        postAs: 'organization',
        organization: '105834790',
        text: "={{ $('On form submission').item.json.post_type }}",
        shareMediaCategory: 'IMAGE',
        binaryPropertyName: 'Image',
        additionalFields: {},
    };

    @node({
        name: 'Multiple Image Post LinkedIn',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.3,
        position: [288, 288],
        credentials: { linkedInOAuth2Api: { id: 'vBlxeK4NpAtRjb3Z', name: 'LinkedIn account 2' } },
    })
    MultipleImagePostLinkedin = {
        method: 'POST',
        url: 'https://api.linkedin.com/rest/posts',
        authentication: 'predefinedCredentialType',
        nodeCredentialType: 'linkedInOAuth2Api',
        sendHeaders: true,
        headerParameters: {
            parameters: [
                {
                    name: 'LinkedIn-Version',
                    value: '202510',
                },
                {
                    name: 'X-Restli-Protocol-Version',
                    value: '2.0.0',
                },
            ],
        },
        sendBody: true,
        specifyBody: 'json',
        jsonBody:
            '={{\n{\n  "author": "urn:li:organization:105834790",\n  "commentary": $(\'On form submission\').first().json.post_type,\n  "visibility": "PUBLIC",\n  "distribution": {\n    "feedDistribution": "MAIN_FEED",\n    "targetEntities": [],\n    "thirdPartyDistributionChannels": []\n  },\n  "content": {\n    "multiImage": {\n      "images": $json.contentEntities\n    }\n  },\n  "lifecycleState": "PUBLISHED",\n  "isReshareDisabledByAuthor": false\n}\n}}',
        options: {},
    };

    @node({
        name: 'Facebook Content Type',
        type: 'n8n-nodes-base.switch',
        version: 3.3,
        position: [-832, 656],
    })
    FacebookContentType = {
        rules: {
            values: [
                {
                    conditions: {
                        options: {
                            caseSensitive: true,
                            leftValue: '',
                            typeValidation: 'strict',
                            version: 2,
                        },
                        conditions: [
                            {
                                leftValue: '={{ $json.Image[0].filename }}',
                                rightValue: 0,
                                operator: {
                                    type: 'string',
                                    operation: 'notExists',
                                    singleValue: true,
                                },
                                id: 'fb41da3f81-ba14-4d48-bf39-971a5c91800c',
                            },
                        ],
                        combinator: 'and',
                    },
                    renameOutput: true,
                    outputKey: 'Text Post',
                },
                {
                    conditions: {
                        options: {
                            caseSensitive: true,
                            leftValue: '',
                            typeValidation: 'strict',
                            version: 2,
                        },
                        conditions: [
                            {
                                id: 'fb846b662b-95e3-4d61-8acb-ca77b5ac92ee',
                                leftValue: '={{ $json["Image"].length }}',
                                rightValue: 1,
                                operator: {
                                    type: 'number',
                                    operation: 'equals',
                                },
                            },
                        ],
                        combinator: 'and',
                    },
                    renameOutput: true,
                    outputKey: 'Single Image Post',
                },
                {
                    conditions: {
                        options: {
                            caseSensitive: true,
                            leftValue: '',
                            typeValidation: 'strict',
                            version: 2,
                        },
                        conditions: [
                            {
                                id: 'fb8a102074-89e6-4c87-9d9f-76fe9c0bc6d9',
                                leftValue: '={{ $json["Image"].length }}',
                                rightValue: 1,
                                operator: {
                                    type: 'number',
                                    operation: 'gt',
                                },
                            },
                        ],
                        combinator: 'and',
                    },
                    renameOutput: true,
                    outputKey: 'Multiple Image Post',
                },
            ],
        },
        options: {},
    };

    @node({
        name: 'Facebook Single Image Post',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.2,
        position: [-608, 672],
        credentials: { httpHeaderAuth: { id: 'wbVTQWbgdpOAG6rR', name: 'facebook-msi' } },
    })
    FacebookSingleImagePost = {
        method: 'POST',
        url: 'https://graph.facebook.com/v24.0/438514339355830/photos',
        authentication: 'genericCredentialType',
        genericAuthType: 'httpHeaderAuth',
        sendBody: true,
        contentType: 'multipart-form-data',
        bodyParameters: {
            parameters: [
                {
                    parameterType: 'formBinaryData',
                    name: 'source',
                    inputDataFieldName: 'Image',
                },
                {
                    name: 'message',
                    value: "={{ $('On form submission').item.json.post_type }}",
                },
            ],
        },
        options: {},
    };

    @node({
        name: 'FB Separate Images',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-608, 864],
    })
    FbSeparateImages = {
        jsCode: "// 1. Obtenemos todos los ítems de entrada (del Switch)\nconst allItems = $input.all();\nconst newItems = [];\n\n// 2. Iteramos sobre cada ítem\nfor (const item of allItems) {\n  const binaryData = item.binary;\n  \n  // Si no hay archivos binarios, saltamos este ítem\n  if (!binaryData) continue;\n\n  // 3. Recorremos todas las llaves binarias (Image, Image1, Image2, etc.)\n  for (const key of Object.keys(binaryData)) {\n    // Procesamos solo los campos que empiezan con \"Image\"\n    if (key.startsWith('Image')) {\n      newItems.push({\n        json: {\n          ...item.json, // Mantenemos el post_type y otros datos\n          internal_image_key: key\n        },\n        binary: {\n          data: binaryData[key] // Renombramos a 'data' para el nodo de FB Upload\n        }\n      });\n    }\n  }\n}\n\n// 4. Devolvemos la lista: ahora habrá un ítem por cada imagen\nreturn newItems;",
    };

    @node({
        name: 'FB Upload Image (Hidden)',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.2,
        position: [-384, 864],
        credentials: { httpHeaderAuth: { id: 'wbVTQWbgdpOAG6rR', name: 'facebook-msi' } },
    })
    FbUploadImageHidden = {
        method: 'POST',
        url: 'https://graph.facebook.com/v23.0/438514339355830/photos',
        authentication: 'genericCredentialType',
        genericAuthType: 'httpHeaderAuth',
        sendBody: true,
        contentType: 'multipart-form-data',
        bodyParameters: {
            parameters: [
                {
                    parameterType: 'formBinaryData',
                    name: 'source',
                    inputDataFieldName: 'data',
                },
                {
                    name: 'published',
                    value: 'false',
                },
            ],
        },
        options: {},
    };

    @node({
        name: 'FB Build Media Array',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-160, 864],
    })
    FbBuildMediaArray = {
        jsCode: "const itemsUploaded = $('FB Upload Image (Hidden)').all();\nconst originalItems = $('FB Separate Images').all();\n\nconst mediaItems = [];\n\n// Recolectamos los IDs que nos devolvió Facebook\nfor (const item of itemsUploaded) {\n    const mediaId = item.json.id;\n    if (mediaId) {\n        mediaItems.push({\n            \"media_fbid\": mediaId\n        });\n    }\n}\n\n// Recuperamos el texto del nodo anterior (FB Separate Images)\n// Usamos el primer elemento porque el texto es igual para todas las fotos del post\nconst postText = originalItems[0].json.post_type;\n\nreturn [{\n    json: {\n        attached_media: mediaItems,\n        post_type: postText\n    }\n}];",
    };

    @node({
        name: 'FB Publish Multiple Images',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.2,
        position: [64, 864],
        credentials: { httpHeaderAuth: { id: 'wbVTQWbgdpOAG6rR', name: 'facebook-msi' } },
    })
    FbPublishMultipleImages = {
        method: 'POST',
        url: 'https://graph.facebook.com/v23.0/438514339355830/feed',
        authentication: 'genericCredentialType',
        genericAuthType: 'httpHeaderAuth',
        sendBody: true,
        specifyBody: 'json',
        jsonBody:
            '={\n   "message": "{{ $json.post_type }}",\n   "attached_media": {{ JSON.stringify($json.attached_media) }}\n}',
        options: {},
    };

    @node({
        name: 'On form submission',
        type: 'n8n-nodes-base.formTrigger',
        version: 2.3,
        position: [-1344, 672],
    })
    OnFormSubmission = {
        formTitle: 'Post on Social Media',
        formDescription: 'Fill the following fields to create posts on LinkedIn, Facebook and/or Instagram',
        formFields: {
            values: [
                {
                    fieldLabel: 'post_type',
                    fieldType: 'textarea',
                    requiredField: true,
                },
                {
                    fieldLabel: 'publish_linkedin',
                    fieldType: 'dropdown',
                    fieldOptions: {
                        values: [
                            {
                                option: 'Yes',
                            },
                            {
                                option: 'No',
                            },
                        ],
                    },
                    requiredField: true,
                },
                {
                    fieldLabel: 'publish_facebook',
                    fieldType: 'dropdown',
                    fieldOptions: {
                        values: [
                            {
                                option: 'Yes',
                            },
                            {
                                option: 'No',
                            },
                        ],
                    },
                    requiredField: true,
                },
                {
                    fieldLabel: 'publish_instagram',
                    fieldType: 'dropdown',
                    fieldOptions: {
                        values: [
                            {
                                option: 'Yes',
                            },
                            {
                                option: 'No',
                            },
                        ],
                    },
                    requiredField: true,
                },
                {
                    fieldLabel: 'Image',
                    fieldType: 'file',
                    acceptFileTypes: '.jpg, .png, .mp4',
                },
            ],
        },
        options: {},
        path: '7ee95bf8-0c77-45ef-8d4e-20f78cc0c73b',
    };

    @node({
        name: 'Facebook Page Post (v22.0)',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.2,
        position: [-608, 480],
        credentials: { httpHeaderAuth: { id: 'wbVTQWbgdpOAG6rR', name: 'facebook-msi' } },
    })
    FacebookPagePostV220 = {
        method: 'POST',
        url: 'https://graph.facebook.com/v22.0/438514339355830/feed',
        authentication: 'genericCredentialType',
        genericAuthType: 'httpHeaderAuth',
        sendBody: true,
        specifyBody: 'json',
        jsonBody: '={\n   "message": "{{ $(\'On form submission\').item.json.post_type }}"\n}',
        options: {
            response: {
                response: {
                    responseFormat: 'json',
                },
            },
        },
    };

    @node({
        name: 'Subir a ImgBB',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.1,
        position: [64, 1056],
        credentials: { httpHeaderAuth: { id: 'zx6X4T7j4yDMYWKo', name: 'imgbb-api' } },
    })
    SubirAImgbb = {
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
                    inputDataFieldName: 'Image',
                },
            ],
        },
        options: {},
    };

    @node({
        name: 'Crear Contenedor IG',
        type: 'n8n-nodes-base.facebookGraphApi',
        version: 1,
        position: [288, 1056],
        credentials: { facebookGraphApi: { id: 'mbuwwxCuX4JRWLJB', name: 'Instagram' } },
    })
    CrearContenedorIg = {
        httpRequestMethod: 'POST',
        graphApiVersion: 'v23.0',
        node: '17841471028584724',
        edge: 'media',
        options: {
            queryParameters: {
                parameter: [
                    {
                        name: '=image_url',
                        value: '={{ $json.data.display_url }}',
                    },
                    {
                        name: 'caption',
                        value: "={{ $('On form submission').item.json.post_type }}",
                    },
                    {
                        name: 'media_type',
                        value: '=IMAGE',
                    },
                ],
            },
        },
    };

    @node({
        name: 'Subir cada Imagen a ImgBB',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.1,
        position: [-384, 1248],
        credentials: { httpHeaderAuth: { id: 'zx6X4T7j4yDMYWKo', name: 'imgbb-api' } },
    })
    SubirCadaImagenAImgbb = {
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
        name: 'Verificar Estado IG',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.2,
        position: [736, 1088],
        credentials: {
            httpHeaderAuth: { id: 'wbVTQWbgdpOAG6rR', name: 'facebook-msi' },
            facebookGraphApi: { id: 'mbuwwxCuX4JRWLJB', name: 'Instagram' },
        },
    })
    VerificarEstadoIg = {
        url: '=https://graph.facebook.com/v22.0/{{ $json.id }}',
        authentication: 'predefinedCredentialType',
        nodeCredentialType: 'facebookGraphApi',
        sendQuery: true,
        queryParameters: {
            parameters: [
                {
                    name: 'fields',
                    value: 'status_code',
                },
            ],
        },
        options: {},
    };

    @node({
        name: '¿Listo?',
        type: 'n8n-nodes-base.if',
        version: 2.2,
        position: [960, 1152],
    })
    Listo = {
        conditions: {
            options: {
                caseSensitive: true,
                leftValue: '',
                typeValidation: 'strict',
                version: 2,
            },
            conditions: [
                {
                    id: 'is-finished',
                    leftValue: '={{ $json.status_code }}',
                    rightValue: 'FINISHED',
                    operator: {
                        type: 'string',
                        operation: 'equals',
                    },
                },
            ],
            combinator: 'and',
        },
        options: {},
    };

    @node({
        name: 'Esperar Procesamiento1',
        type: 'n8n-nodes-base.wait',
        version: 1.1,
        position: [512, 1152],
    })
    EsperarProcesamiento1 = {
        amount: 10,
        path: '7ac40974-82f6-45ce-a993-4149d8fec0cc',
    };

    @node({
        name: 'Publicar en Instagram',
        type: 'n8n-nodes-base.facebookGraphApi',
        version: 1,
        position: [1184, 1152],
        credentials: { facebookGraphApi: { id: 'mbuwwxCuX4JRWLJB', name: 'Instagram' } },
    })
    PublicarEnInstagram = {
        httpRequestMethod: 'POST',
        graphApiVersion: 'v23.0',
        node: '17841471028584724',
        edge: 'media_publish',
        options: {
            queryParameters: {
                parameter: [
                    {
                        name: 'creation_id',
                        value: '={{ $json.id }}',
                    },
                ],
            },
        },
    };

    @node({
        name: 'Facebook Content Type1',
        type: 'n8n-nodes-base.switch',
        version: 3.3,
        position: [-832, 1152],
    })
    FacebookContentType1 = {
        rules: {
            values: [
                {
                    conditions: {
                        options: {
                            caseSensitive: true,
                            leftValue: '',
                            typeValidation: 'strict',
                            version: 2,
                        },
                        conditions: [
                            {
                                id: 'fb846b662b-95e3-4d61-8acb-ca77b5ac92ee',
                                leftValue: '={{ $json["Image"].length }}',
                                rightValue: 1,
                                operator: {
                                    type: 'number',
                                    operation: 'equals',
                                },
                            },
                        ],
                        combinator: 'and',
                    },
                    renameOutput: true,
                    outputKey: 'Single Image Post',
                },
                {
                    conditions: {
                        options: {
                            caseSensitive: true,
                            leftValue: '',
                            typeValidation: 'strict',
                            version: 2,
                        },
                        conditions: [
                            {
                                id: 'fb8a102074-89e6-4c87-9d9f-76fe9c0bc6d9',
                                leftValue: '={{ $json["Image"].length }}',
                                rightValue: 1,
                                operator: {
                                    type: 'number',
                                    operation: 'gt',
                                },
                            },
                        ],
                        combinator: 'and',
                    },
                    renameOutput: true,
                    outputKey: 'Multiple Image Post',
                },
            ],
        },
        options: {},
    };

    @node({
        name: 'Code in JavaScript1',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-608, 1248],
    })
    CodeInJavascript1 = {
        jsCode: "// 1. Obtenemos el ítem que viene del Switch\nconst allItems = $input.all();\nconst newItems = [];\n\nfor (const item of allItems) {\n  const binaryData = item.binary;\n  \n  if (!binaryData) continue;\n\n  // 2. Buscamos todas las propiedades que empiecen con \"Image\"\n  for (const key of Object.keys(binaryData)) {\n    if (key.startsWith('Image')) {\n      newItems.push({\n        json: {\n          ...item.json,\n          original_key: key\n        },\n        binary: {\n          // Renombramos CUALQUIER imagen a 'data' para que el siguiente nodo sea simple\n          data: binaryData[key]\n        }\n      });\n    }\n  }\n}\n\n// 3. Ahora devolvemos una lista de ítems (uno por cada imagen)\nreturn newItems;",
    };

    @node({
        name: 'IG - Crear Item de Carrusel',
        type: 'n8n-nodes-base.facebookGraphApi',
        version: 1,
        position: [-160, 1248],
        credentials: { facebookGraphApi: { id: 'mbuwwxCuX4JRWLJB', name: 'Instagram' } },
    })
    IgCrearItemDeCarrusel = {
        httpRequestMethod: 'POST',
        graphApiVersion: 'v22.0',
        node: '17841471028584724',
        edge: 'media',
        options: {
            queryParameters: {
                parameter: [
                    {
                        name: 'image_url',
                        value: '={{ $json.data.display_url }}',
                    },
                    {
                        name: 'is_carousel_item',
                        value: 'true',
                    },
                ],
            },
        },
    };

    @node({
        name: 'IG - Agrupar IDs para Carrusel',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [64, 1248],
    })
    IgAgruparIdsParaCarrusel = {
        jsCode: 'const items = $input.all();\nconst ids = items.map(item => item.json.id);\n// Rescatamos el caption del formulario original\nconst caption = $("On form submission").first().json.post_type;\n\nreturn [{\n  json: {\n    children_ids: ids.join(\',\'),\n    post_caption: caption\n  }\n}];',
    };

    @node({
        name: 'IG - Crear Contenedor Maestro',
        type: 'n8n-nodes-base.facebookGraphApi',
        version: 1,
        position: [288, 1248],
        credentials: { facebookGraphApi: { id: 'mbuwwxCuX4JRWLJB', name: 'Instagram' } },
    })
    IgCrearContenedorMaestro = {
        httpRequestMethod: 'POST',
        graphApiVersion: 'v22.0',
        node: '17841471028584724',
        edge: 'media',
        options: {
            queryParameters: {
                parameter: [
                    {
                        name: 'media_type',
                        value: 'CAROUSEL',
                    },
                    {
                        name: 'children',
                        value: '={{ $json.children_ids }}',
                    },
                    {
                        name: 'caption',
                        value: '={{ $json.post_caption }}',
                    },
                ],
            },
        },
    };

    @node({
        name: 'Check Instagram',
        type: 'n8n-nodes-base.if',
        version: 2.2,
        position: [-1056, 1152],
    })
    CheckInstagram = {
        conditions: {
            options: {
                caseSensitive: true,
                leftValue: '',
                typeValidation: 'strict',
                version: 2,
            },
            conditions: [
                {
                    id: '50c8e378-687f-449e-b816-433b91349f21',
                    leftValue: '={{ $json.publish_instagram }}',
                    rightValue: 'Yes',
                    operator: {
                        type: 'string',
                        operation: 'equals',
                    },
                },
            ],
            combinator: 'and',
        },
        options: {},
    };

    @node({
        name: 'MSI Content Form',
        type: 'n8n-nodes-base.formTrigger',
        version: 2.1,
        position: [-3584, 800],
    })
    MsiContentForm = {
        path: '526a191b-81e1-4bd2-847f-5c2732c41e61',
        formTitle: 'MSI Content Generator',
        formDescription: 'Generate professional LinkedIn content and images for MSI Americas',
        formFields: {
            values: [
                {
                    fieldLabel: 'Content Topic',
                    requiredField: true,
                },
                {
                    fieldLabel: 'Platform',
                    fieldType: 'dropdown',
                    fieldOptions: {
                        values: [
                            {
                                option: 'LinkedIn',
                            },
                            {
                                option: 'Instagram',
                            },
                            {
                                option: 'Multi-platform',
                            },
                        ],
                    },
                    requiredField: true,
                },
                {
                    fieldLabel: 'Post Type',
                    fieldType: 'dropdown',
                    fieldOptions: {
                        values: [
                            {
                                option: 'Educational',
                            },
                            {
                                option: 'Thought Leadership',
                            },
                            {
                                option: 'Case Study/Storytelling',
                            },
                            {
                                option: 'Company News',
                            },
                            {
                                option: 'Standard Infographic',
                            },
                            {
                                option: 'Carousel',
                            },
                        ],
                    },
                    requiredField: true,
                },
                {
                    fieldLabel: 'Visual Style',
                    fieldType: 'dropdown',
                    fieldOptions: {
                        values: [
                            {
                                option: 'Modern 3D',
                            },
                            {
                                option: 'Isometric Architecture',
                            },
                            {
                                option: 'Tech Close-up',
                            },
                            {
                                option: 'Data Hero',
                            },
                            {
                                option: 'Glassmorphism',
                            },
                        ],
                    },
                    requiredField: true,
                },
                {
                    fieldLabel: 'Orientation',
                    fieldType: 'dropdown',
                    fieldOptions: {
                        values: [
                            {
                                option: 'Square (1080x1080)',
                            },
                            {
                                option: 'Vertical (1080x1350)',
                            },
                            {
                                option: 'Horizontal (1200x627)',
                            },
                            {
                                option: 'Story (1080x1920)',
                            },
                        ],
                    },
                    requiredField: true,
                },
                {
                    fieldLabel: 'Include Data Points',
                    placeholder: 'E.g., 75% faster deployment, $2M cost reduction',
                },
                {
                    fieldLabel: 'Main Headline for Image',
                    placeholder: 'Keep it short and bold (3-5 words max)',
                    requiredField: true,
                },
                {
                    fieldLabel: 'Additional Context',
                    fieldType: 'textarea',
                    placeholder: 'Any specific requirements or details...',
                },
            ],
        },
        options: {},
    };

    @node({
        name: 'Format Form Input1',
        type: 'n8n-nodes-base.set',
        version: 3.3,
        position: [-3360, 800],
    })
    FormatFormInput1 = {
        assignments: {
            assignments: [
                {
                    id: 'chatInput',
                    name: 'chatInput',
                    value: "={{ 'Topic: ' + $json.formData.topic + '\\nPlatform: ' + $json.formData.platform + '\\nPost Type: ' + $json.formData.post_type + '\\nVisual Style: ' + $json.formData.visual_style + '\\nOrientation: ' + $json.formData.orientation + '\\nData Points: ' + $json.formData.data_points + '\\nHeadline: ' + $json.formData.headline + '\\nContext: ' + $json.formData.context }}",
                    type: 'string',
                },
            ],
        },
        options: {},
    };

    @node({
        name: 'Agent 1: Strategy Analyzer1',
        type: '@n8n/n8n-nodes-langchain.agent',
        version: 1.7,
        position: [-3136, 800],
    })
    Agent1StrategyAnalyzer1 = {
        promptType: 'define',
        text: '={{ $json.chatInput }}',
        options: {
            systemMessage:
                '# CRITICAL: YOU MUST OUTPUT ONLY VALID JSON - NO OTHER TEXT\n\nYour ENTIRE response must be a single JSON object. Do NOT write explanations, questions, markdown, or any text before or after the JSON.\n\nIf ANY field is missing from user input, use reasonable defaults based on the topic. NEVER ask for more information.\n\n## ROLE: Strategic Content Analyst for MSI Americas\n\n## REAL MSI CONTEXT\n\nMSI Americas is NOT:\n- Generic software vendor\n- Marketing agency  \n- Traditional consultancy\n\nMSI Americas IS:\n- Technical partner for digital transformation\n- Implementation specialists (not just consulting)\n- Team that executes complex projects\n- 15+ years in enterprise infrastructure\n\n**Core Specializations:**\n- Cloud Solutions & Migration (AWS, Azure, GCP)\n- 5G Infrastructure & IoT Implementation\n- IT Staff Augmentation (embedded teams)\n- Sustainability Tech & Diversity Programs\n\n## CONTENT STRATEGY BY INTENT\n\n### 1. EDUCATIONAL (40% of content)\n**When to use:** Tips, guides, best practices, how-tos\n**Tone:** Helpful, direct, no selling\n**Example topics:**\n- "3 signs your cloud is misconfigured"\n- "How to calculate real ROI on 5G"\n- "Common pitfalls in IoT deployments"\n\n### 2. THOUGHT LEADERSHIP (30%)\n**When to use:** Opinions, analysis, predictions, hot takes\n**Tone:** Firm but not arrogant, experience-based\n**Example topics:**\n- "Why most cloud migrations fail (and how to avoid it)"\n- "5G hype vs reality: what enterprises need to know"\n- "The hidden cost of technical debt"\n\n### 3. CASE STUDY / STORYTELLING (20%)\n**When to use:** Real results, client stories, project journeys\n**Tone:** Narrative, focused on the journey and learnings\n**Example topics:**\n- "How we migrated 500TB with zero downtime"\n- "From legacy to cloud-native: 90-day transformation"\n- "IoT at scale: lessons from 1000+ sensor deployment"\n\n### 4. COMPANY NEWS (10%)\n**When to use:** Announcements, milestones, team updates\n**Tone:** Human, not corporate-speak\n**Example topics:**\n- "New tech lead joins IoT team"\n- "MSI hits 200 successful migrations milestone"\n- "Team spotlight: meet our cloud architects"\n\n## POST TYPES (Technical Definition)\n\n1. **standard_infographic** - Data-driven insights, statistics, trends\n2. **storytelling** - Success stories, testimonials, culture, journeys\n3. **educational** - Tips, guides, best practices, tutorials\n4. **thought_leadership** - Opinions, analysis, predictions, commentary\n5. **carousel** - Multi-point content, comparisons, step-by-step\n\n## STRATEGY SELECTION LOGIC\n\n**If user mentions:**\n- Stats, numbers, data → `standard_infographic`\n- Story, client, project → `storytelling`\n- How-to, tips, guide → `educational`\n- Opinion, analysis, why/what → `thought_leadership`\n- Multiple points, comparison → `carousel`\n\n## FORM DATA USAGE - CRITICAL\n\nThe user will provide these fields in their request:\n- **Topic**: The main content subject\n- **Platform**: LinkedIn, Instagram, or Multi-platform\n- **Post Type**: Educational, Thought Leadership, Case Study/Storytelling, Company News, Standard Infographic, or Carousel\n- **Visual Style**: Modern 3D, Isometric Architecture, Tech Close-up, Data Hero, or Glassmorphism\n- **Orientation**: Square (1080x1080), Vertical (1080x1350), Horizontal (1200x627), or Story (1080x1920)\n- **Data Points**: Specific metrics/stats to include (if provided)\n- **Headline**: The exact text for the image (if provided)\n- **Context**: Additional requirements\n\n**YOU MUST USE THESE VALUES EXACTLY AS PROVIDED IN YOUR JSON OUTPUT**\n\n## OUTPUT JSON STRUCTURE\n\nAnalyze the user\'s request and output this EXACT structure, using the form data provided:\n\n{\n  "post_type": "[USE the Post Type from user input - convert to lowercase with underscores]",\n  "content_strategy": {\n    "hook": "Compelling first line about the Topic with specific detail or question",\n    "body": "Main message about the Topic with real examples from the Context and Data Points provided",\n    "cta": "Conversational call-to-action as a question or invitation",\n    "hashtags": ["#CloudNative", "#TechInfrastructure", "#MSIAmericas"]\n  },\n  "visual_strategy": {\n    "main_scene": "Technical visualization based on Topic and Visual Style",\n    "visual_style": "[USE Visual Style from user - convert to lowercase with underscores]",\n    "orientation": "[USE Orientation from user - extract format like \'vertical\' from \'Vertical (1080x1350)\']",\n    "dimensions": "[USE dimensions from Orientation - e.g. \'1080x1350\' from \'Vertical (1080x1350)\']",\n    "composition_type": "dynamic"\n  },\n  "graphic_elements": [\n    {\n      "type": "data_card",\n      "data": "[USE Data Points provided by user if available]",\n      "position": "top_right",\n      "style_notes": "[Match with Visual Style chosen]"\n    },\n    {\n      "type": "technical_diagram",\n      "data": "Visualization related to Topic",\n      "position": "center",\n      "style_notes": "[Match with Visual Style chosen]"\n    }\n  ],\n  "in_image_text": "[USE Headline provided by user EXACTLY - this is critical]",\n  "text_treatment": {\n    "material": "3D matte plastic",\n    "effect": "floating with subtle shadow",\n    "color_scheme": "primary"\n  },\n  "data_points": [\n    "[USE Data Points from user input if provided, otherwise create MSI-relevant stats based on Topic]"\n  ],\n  "technical_notes": "[Incorporate Context provided by user]"\n}\n\n## DIMENSIONS BY PLATFORM\n\n- **Instagram:** 1080x1080 (square) or 1080x1350 (vertical)\n- **LinkedIn:** 1200x627 (standard) or 1080x1350 (vertical)\n- **Story:** 1080x1920 (9:16)\n\n## CRITICAL RULES\n\n1. **YOUR RESPONSE MUST START WITH { AND END WITH }**\n2. Output ONLY the JSON - ABSOLUTELY NO markdown, code blocks, explanations, or questions\n3. If ANY data is missing, make reasonable assumptions - NEVER ask for clarification\n4. Ensure all quotes are properly escaped\n5. All arrays must have at least one item\n6. Use appropriate dimensions based on platform mentioned (default to 1080x1350 for LinkedIn)\n7. Include 2-3 graphic_elements (quality over quantity)\n8. Use MSI colors: #004AAD (blue), #67B547 (green), #FFFDF1 (off-white)\n9. NO generic corporate language in strategy\n10. Include SPECIFIC data points from MSI\'s real experience\n11. Visual strategy must avoid stock photo aesthetics\n\n## BANNED CONTENT STRATEGY PHRASES\n\nNEVER include these in content_strategy fields:\n- "In today\'s digital landscape"\n- "Revolutionize/Transform your business"\n- "Cutting-edge solutions"\n- "Unlock the power of"\n- "Take your business to the next level"\n- "Seamlessly integrate"\n- "Best-in-class"\n\nREMEMBER: \n- Your response MUST be valid JSON starting with { and ending with }\n- NO explanations, NO questions, NO markdown code blocks\n- If you\'re missing ANY information, make intelligent defaults based on the topic\n- EXAMPLE of correct response format: {"post_type":"educational","content_strategy":{...},"visual_strategy":{...}}',
        },
    };

    @node({
        name: 'Agent 2: Copy Writer1',
        type: '@n8n/n8n-nodes-langchain.agent',
        version: 1.7,
        position: [-2784, 528],
    })
    Agent2CopyWriter1 = {
        promptType: 'define',
        text: '={{ $json.output }}',
        options: {
            systemMessage:
                '# ROLE: LinkedIn Copy Writer for MSI Americas\n\n## MISSION\nReceive JSON strategy and create compelling LinkedIn post copy in English that sounds HUMAN, not AI-generated.\n\n## YOUR TASK\nWrite engaging LinkedIn post copy. Output ONLY the post text, nothing else.\n\n## BANNED - AI-GENERIC LANGUAGE\n\n**NEVER use:**\n- "In today\'s digital landscape..."\n- "Revolutionize/Transform your business"\n- "Cutting-edge/Game-changing"\n- "Unlock the power of..."\n- "Take your business to the next level"\n- "Seamlessly integrate"\n- "Empower your team"\n- "Leverage/Harness"\n- "End-to-end solutions"\n- "Best-in-class"\n- "Unprecedented results"\n- "Rapidly evolving"\n- "Next-generation technology"\n\n**Instead use:**\n- Direct statements with specific data\n- "Here\'s what actually works..."\n- "Our clients report..."\n- "The real problem is..."\n- "Three things we learned..."\n\n## MSI VOICE EXAMPLES\n\n### Example: Educational Post\n\nBAD: "In today\'s rapidly evolving digital landscape, cloud migration isn\'t just an option—it\'s a necessity."\n\nGOOD: "Cloud migration looks simple until you hit 15 years of legacy systems. We worked with a retail client who had that exact problem. Three months later: 40% lower costs and zero downtime during Black Friday. The secret isn\'t speed, it\'s the roadmap. Does your team have one?"\n\n## MSI BRAND VOICE\n\n**We sound like:**\n- Senior engineer who\'s fixed this 50 times\n- Tech lead who tells it straight  \n- Consultant who shows data, not slides\n\n**We DON\'T sound like:**\n- Marketing copy trying too hard\n- Generic LinkedIn thought leader\n- Sales pitch in disguise\n\n## WRITING GUIDELINES\n\n### Hook (First 2 Lines)\n- Start with specific stat, question, or concrete statement\n- Use real numbers\n- Under 150 characters for mobile\n- NO vague corporate speak\n\n### Body\n- Include SPECIFIC data points\n- Use line breaks every 2-3 sentences\n- NO emojis\n- Technical but accessible\n\n### CTA\n- Conversational questions, not commands\n- Examples: "What\'s been your experience?" "Is your team facing this?"\n\n## CRITICAL RULES\n\n1. English only\n2. Under 1,300 characters\n3. NO AI-generic phrases\n4. At least 2 specific numbers/stats\n5. Always end with #MSIAmericas\n6. Include character count at end\n7. Output ONLY the post - no JSON, no explanations\n8. ABSOLUTELY NO EMOJIS\n\n## OUTPUT FORMAT\n\n[Your post here]\n\n---\n\n**CHARACTER COUNT**: [X] characters\n**ESTIMATED READING TIME**: [X] seconds',
        },
    };

    @node({
        name: 'Agent 3: Image Prompt Engineer1',
        type: '@n8n/n8n-nodes-langchain.agent',
        version: 1.7,
        position: [-2784, 800],
    })
    Agent3ImagePromptEngineer1 = {
        promptType: 'define',
        text: "={{ $('Agent 1: Strategy Analyzer1').item.json.output }}",
        options: {
            systemMessage:
                'ROLE: AI Image Prompt Engineer\n\n## YOUR TASK\nYou will receive a JSON strategy from Agent 1. Extract the following data and create ONE SINGLE image generation prompt:\n- `in_image_text`: The exact headline to use\n- `visual_strategy.visual_style`: The visual style (modern_3d, isometric_architecture, tech_close_up, data_hero, glassmorphism)\n- `visual_strategy.orientation`: The orientation (square, vertical, horizontal, story)\n- `visual_strategy.dimensions`: The exact dimensions (e.g., 1080x1350)\n- `visual_strategy.main_scene`: Scene description\n- `graphic_elements`: Visual elements to include\n- `data_points`: Stats or metrics to incorporate\n\n**YOU MUST OUTPUT EXACTLY ONE IMAGE PROMPT, NOT MULTIPLE EXAMPLES.**\n\nMSI BRAND IDENTITY & VIBE\nThe brand aesthetic is Corporate, Secure, and Tech-Forward. It rejects loose or organic minimalism in favor of a clean, functional, and engineered look. The visual style must convey stability, precision, and authority (The Sage/Guardian archetype).\n\nKey Concepts: Cyber-security, Cloud Infrastructure, Connectivity, Engineered Precision.\n\nAtmosphere: Cool-toned, high-contrast, structured, and reliable.\n\nMSI BRAND COLORS (MANDATORY)\nDeep Blue #004AAD (Primary - conveys trust and authority)\n\nTech Green #67B547 (Accent - conveys growth and system active status)\n\nOff-White #FFFDF1 (Backgrounds - reduces eye strain)\n\nLight Blue #4A9FFF (Glows/Glass/Connectivity)\n\nMSI TYPOGRAPHY\nHeadlines: ITC Avant Garde Gothic Bold (Geometric, architectural feel)\n\nSubheadings: Poppins (Legible, geometric)\n\nBody: Quicksand Regular/Medium (Approachable, rounded terminals)\n\nData/Numbers: Rajdhani Bold (Technical)\n\n2025 VISUAL TRENDS\nGlassmorphism: Semi-transparent cards with blur\n\n3D Elements: Dimensional objects and environments (NOT text)\n\nGlow Effects: Tech Green glow on data, Blue on interactive elements\n\nIsometric Views: 30 degree angle for architecture/systems\n\nWHAT TO AVOID (CRITICAL)\nNEVER:\n\nGeneric office people with laptops\n\nCorporate handshakes\n\nStock photo aesthetics\n\nGeneric city skylines\n\nCluttered compositions\n\nFlat 2D design\n\nOrganic or rustic textures\n\n3D text or extruded letters\n\nUnreadable or overly stylized text\n\nSmall text or tiny labels\n\nMultiple text elements\n\nComplex typography effects\n\nALWAYS:\n\nAbstract data visualizations (spheres, networks, shields)\n\nIsometric technical scenes\n\nTech close-ups (servers, infrastructure, chips)\n\nClean compositions with negative space\n\nMSI colors prominently featured\n\nFlat, clean, readable typography\n\nHigh contrast text placement\n\nONLY ONE BOLD HEADLINE - NO OTHER TEXT\n\nLarge, prominent text (minimum 80pt equivalent)\n\nCOMPOSITION TEMPLATES\nData Hero (for stats):\n\nCenter: ONE large flat number or headline in bold typography (100-150pt equivalent)\n\nBackground: Blue to Navy gradient\n\nAccent: Tech Green glow\n\nText: ONLY the main headline, clean, flat, ultra high contrast\n\nTech Close-up (for technical topics):\n\nForeground: Detailed tech component (chip, server rack, shield)\n\nMid: Minimal or NO data overlays\n\nBackground: Blurred tech environment\n\nText: ONE white or off-white headline on dark area for maximum readability\n\nIsometric Architecture (for systems):\n\nIsometric infrastructure view\n\nColor-coded MSI colors\n\nFlow lines with glow effects\n\nText: ONE flat headline in dedicated clear space, large and bold\n\nTEXT RENDERING RULES (CRITICAL - MAXIMUM IMPORTANCE)\n\nCRITICAL RULE 1: ONLY ONE TEXT ELEMENT ALLOWED\n- Generate images with ONE SINGLE HEADLINE only\n- NO additional labels, NO small text, NO subtitles\n- NO body copy, NO descriptions, NO captions in the image\n- The headline should be 3-5 words maximum\n\nCRITICAL RULE 2: TEXT MUST BE LARGE AND BOLD\n- Minimum size: 80-100pt equivalent\n- Preferred size: 100-150pt equivalent\n- Text should occupy 20-30% of image height\n- Ultra bold weight, maximum impact\n\nCRITICAL RULE 3: FLAT 2D TEXT ONLY\nALWAYS specify text as:\n\n"Clean, flat 2D typography"\n\n"Bold sans-serif headline, ultra readable"\n\n"Text rendered completely flat against background"\n\n"Maximum legibility, zero effects on text"\n\n"Simple flat overlay, no depth, no shadows, no extrusion"\n\nNEVER use:\n\n"3D text"\n\n"Extruded letters"\n\n"Dimensional typography"\n\n"Physical text objects"\n\n"Text with depth or shadows"\n\n"Multiple text elements"\n\n"Small labels or annotations"\n\nCRITICAL RULE 4: HIGH CONTRAST PLACEMENT\n- White text on dark backgrounds (preferred)\n- Dark text on light backgrounds (alternative)\n- NO mid-tone on mid-tone\n- Clear visual separation from background\n\nEXAMPLE TEXT SPECIFICATIONS:\n\nGOOD:\n"Single bold headline \'CLOUD MIGRATION\' in ITC Avant Garde Gothic Bold, 120pt, white color #FFFFFF, flat 2D rendering, placed on solid dark blue #004AAD background in upper third of image, maximum contrast and readability"\n\nBAD:\n"3D text with perspective, multiple labels showing stats and descriptions, small font annotations, extruded letters with shadows"\n\nOUTPUT FORMAT\n\nGenerate EXACTLY ONE prompt in this format:\n\nMSI IMAGE GENERATION PROMPT\n\n[Complete 250-350 word prompt using: the main_scene from JSON, composition based on visual_style, graphic_elements from JSON, THE EXACT in_image_text as the ONLY headline in flat 2D rendering, MSI colors with HEX codes, lighting setup matching visual_style, atmosphere, and exclusions. Extract dimensions and orientation from JSON.]\n\nTECHNICAL SPECIFICATIONS\n\nDimensions: [Extract from visual_strategy.dimensions]\n\nOrientation: [Extract from visual_strategy.orientation]\n\nPlatform: [LinkedIn/Instagram based on context]\n\nINCLUDED ELEMENTS\n\n[List 2-3 visual elements from graphic_elements in JSON]\n\n[ONE TEXT HEADLINE - Extract exact text from in_image_text - FLAT, LARGE, BOLD]\n\nDESIGN NOTES: [Extract from technical_notes in JSON]\n\nCRITICAL RULES SUMMARY\n1. ONLY ONE TEXT ELEMENT - the main headline\n2. Text must be LARGE (100-150pt equivalent)\n3. Text must be FLAT 2D - no 3D, no extrusion, no depth\n4. Text must have HIGH CONTRAST placement\n5. NO small text, NO labels, NO annotations\n6. Include MSI HEX codes\n7. Mention typography (ITC Avant Garde/Poppins)\n8. Keep under 4 primary visual elements\n9. NO stock photo aesthetics\n10. 250-350 words total\n\nALWAYS emphasize in every prompt: "Generate with ONLY ONE large bold headline, flat 2D rendering, no other text elements, maximum readability and contrast"',
        },
    };

    @node({
        name: 'Format Combined Output1',
        type: 'n8n-nodes-base.set',
        version: 3.3,
        position: [-2480, 800],
    })
    FormatCombinedOutput1 = {
        assignments: {
            assignments: [
                {
                    id: 'post_copy',
                    name: 'post_copy',
                    value: "={{ $('Agent 2: Copy Writer1').item.json.output }}",
                    type: 'string',
                },
                {
                    id: 'image_prompt',
                    name: 'image_prompt',
                    value: "={{ $('Agent 3: Image Prompt Engineer1').item.json.output }}",
                    type: 'string',
                },
                {
                    id: 'strategy_json',
                    name: 'strategy_json',
                    value: "={{ $('Agent 1: Strategy Analyzer1').item.json.output }}",
                    type: 'string',
                },
                {
                    id: 'timestamp',
                    name: 'timestamp',
                    value: '={{ $now.toISO() }}',
                    type: 'string',
                },
                {
                    id: 'topic',
                    name: 'topic',
                    value: "={{ $('MSI Content Form1').item.json.formData.topic }}",
                    type: 'string',
                },
                {
                    id: 'platform',
                    name: 'platform',
                    value: "={{ $('MSI Content Form1').item.json.formData.platform }}",
                    type: 'string',
                },
                {
                    id: 'post_type',
                    name: 'post_type',
                    value: "={{ $('MSI Content Form1').item.json.formData.post_type }}",
                    type: 'string',
                },
                {
                    id: 'status',
                    name: 'status',
                    value: 'pending_review',
                    type: 'string',
                },
            ],
        },
        options: {},
    };

    @node({
        name: 'Validate and Parse JSON1',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-2256, 800],
    })
    ValidateAndParseJson1 = {
        jsCode: "const items = $input.all();\n\nreturn items.map(item => {\n  const data = item.json;\n  let parsedStrategy;\n  \n  try {\n    if (typeof data.strategy_json === 'object') {\n      parsedStrategy = data.strategy_json;\n    } else if (typeof data.strategy_json === 'string') {\n      let cleanJson = data.strategy_json\n        .replace(/```json\\n?/g, '')\n        .replace(/```\\n?/g, '')\n        .trim();\n      parsedStrategy = JSON.parse(cleanJson);\n    } else {\n      throw new Error(`Unexpected type: ${typeof data.strategy_json}`);\n    }\n    \n    return {\n      json: {\n        topic: data.topic,\n        platform: data.platform,\n        post_type: data.post_type,\n        post_copy: data.post_copy,\n        image_prompt: data.image_prompt,\n        strategy_json: parsedStrategy,\n        status: data.status || 'pending_review',\n        timestamp: data.timestamp\n      }\n    };\n  } catch (error) {\n    throw new Error(`Failed to parse strategy_json: ${error.message}`);\n  }\n});",
    };

    @node({
        name: 'Save to Database1',
        type: 'n8n-nodes-base.postgres',
        version: 2.5,
        position: [-2016, 816],
        credentials: { postgres: { id: 'WnTYs2zvPoE7hDJE', name: 'Postgres account' } },
    })
    SaveToDatabase1 = {
        schema: {
            __rl: true,
            mode: 'list',
            value: 'public',
        },
        table: {
            __rl: true,
            mode: 'list',
            value: 'social_posts',
        },
        columns: {
            mappingMode: 'defineBelow',
            value: {
                topic: '={{ $json.topic }}',
                platform: '={{ $json.platform }}',
                post_type: '={{ $json.post_type }}',
                post_copy: '={{ $json.post_copy }}',
                image_prompt: '={{ $json.image_prompt }}',
                strategy_json: '={{ $json.strategy_json }}',
                status: '={{ $json.status }}',
                created_at: '={{ $json.timestamp }}',
            },
        },
        options: {},
    };

    @node({
        name: 'Think Tool1',
        type: '@n8n/n8n-nodes-langchain.toolThink',
        version: 1.1,
        position: [-2864, 1024],
    })
    ThinkTool1 = {};

    @node({
        name: 'Save to Database',
        type: 'n8n-nodes-base.postgres',
        version: 2.5,
        position: [-2192, 544],
        credentials: { postgres: { id: 'WnTYs2zvPoE7hDJE', name: 'Postgres account' } },
    })
    SaveToDatabase = {
        schema: {
            __rl: true,
            mode: 'list',
            value: 'public',
        },
        table: {
            __rl: true,
            mode: 'list',
            value: 'social_posts',
        },
        columns: {
            mappingMode: 'defineBelow',
            value: {
                topic: '={{ $json.topic }}',
                platform: '={{ $json.platform }}',
                post_type: '={{ $json.post_type }}',
                post_copy: '={{ $json.post_copy }}',
                image_prompt: '={{ $json.image_prompt }}',
                strategy_json: '={{ $json.strategy_json }}',
                status: '={{ $json.status }}',
                created_at: '={{ $json.timestamp }}',
            },
        },
        options: {},
    };

    @node({
        name: 'OpenAI Chat Model',
        type: '@n8n/n8n-nodes-langchain.lmChatOpenAi',
        version: 1.3,
        position: [-2848, 688],
        credentials: { openAiApi: { id: '13Oqly3WdRAzZVXL', name: 'OpenAi account' } },
    })
    OpenaiChatModel = {
        model: {
            __rl: true,
            value: 'chatgpt-4o-latest',
            mode: 'list',
            cachedResultName: 'chatgpt-4o-latest',
        },
        builtInTools: {},
        options: {},
    };

    @node({
        name: 'Generate an image',
        type: '@n8n/n8n-nodes-langchain.googleGemini',
        version: 1,
        position: [-1808, 816],
        credentials: { googlePalmApi: { id: 'oF4jKBK0jRbwEPWt', name: 'Google Gemini(PaLM) Api account' } },
    })
    GenerateAnImage = {
        resource: 'image',
        modelId: {
            __rl: true,
            value: 'models/gemini-3-pro-image-preview',
            mode: 'id',
        },
        options: {},
    };

    @node({
        name: 'Subir cada Imagen a ImgBB1',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.1,
        position: [-1568, 864],
        credentials: { httpHeaderAuth: { id: 'zx6X4T7j4yDMYWKo', name: 'imgbb-api' } },
    })
    SubirCadaImagenAImgbb1 = {
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

    // =====================================================================
    // ROUTAGE ET CONNEXIONS
    // =====================================================================

    @links()
    defineRouting() {
        this.CheckLinkedin.out(0).to(this.LinkedinContentType.in(0));
        this.CheckFacebook.out(0).to(this.FacebookContentType.in(0));
        this.LinkedinContentType.out(0).to(this.TextPostLinkedin.in(0));
        this.LinkedinContentType.out(1).to(this.SingleImagePostLinkedin.in(0));
        this.LinkedinContentType.out(2).to(this.SeparateImages.in(0));
        this.CodeInJavascript.out(0).to(this.MultipleImagePostLinkedin.in(0));
        this.SeparateImages.out(0).to(this.RegisterLoad.in(0));
        this.RegisterLoad.out(0).to(this.Uploadimage.in(0));
        this.Uploadimage.out(0).to(this.CodeInJavascript.in(0));
        this.FacebookContentType.out(0).to(this.FacebookPagePostV220.in(0));
        this.FacebookContentType.out(1).to(this.FacebookSingleImagePost.in(0));
        this.FacebookContentType.out(2).to(this.FbSeparateImages.in(0));
        this.FbSeparateImages.out(0).to(this.FbUploadImageHidden.in(0));
        this.FbUploadImageHidden.out(0).to(this.FbBuildMediaArray.in(0));
        this.FbBuildMediaArray.out(0).to(this.FbPublishMultipleImages.in(0));
        this.OnFormSubmission.out(0).to(this.CheckLinkedin.in(0));
        this.OnFormSubmission.out(0).to(this.CheckFacebook.in(0));
        this.OnFormSubmission.out(0).to(this.CheckInstagram.in(0));
        this.SubirAImgbb.out(0).to(this.CrearContenedorIg.in(0));
        this.CrearContenedorIg.out(0).to(this.EsperarProcesamiento1.in(0));
        this.SubirCadaImagenAImgbb.out(0).to(this.IgCrearItemDeCarrusel.in(0));
        this.VerificarEstadoIg.out(0).to(this.Listo.in(0));
        this.Listo.out(0).to(this.PublicarEnInstagram.in(0));
        this.Listo.out(1).to(this.EsperarProcesamiento1.in(0));
        this.EsperarProcesamiento1.out(0).to(this.VerificarEstadoIg.in(0));
        this.FacebookContentType1.out(0).to(this.SubirAImgbb.in(0));
        this.FacebookContentType1.out(1).to(this.CodeInJavascript1.in(0));
        this.CodeInJavascript1.out(0).to(this.SubirCadaImagenAImgbb.in(0));
        this.IgCrearItemDeCarrusel.out(0).to(this.IgAgruparIdsParaCarrusel.in(0));
        this.IgAgruparIdsParaCarrusel.out(0).to(this.IgCrearContenedorMaestro.in(0));
        this.IgCrearContenedorMaestro.out(0).to(this.EsperarProcesamiento1.in(0));
        this.CheckInstagram.out(0).to(this.FacebookContentType1.in(0));
        this.MsiContentForm.out(0).to(this.FormatFormInput1.in(0));
        this.FormatFormInput1.out(0).to(this.Agent1StrategyAnalyzer1.in(0));
        this.FormatFormInput1.out(0).to(this.Agent2CopyWriter1.in(0));
        this.Agent1StrategyAnalyzer1.out(0).to(this.Agent3ImagePromptEngineer1.in(0));
        this.Agent3ImagePromptEngineer1.out(0).to(this.FormatCombinedOutput1.in(0));
        this.FormatCombinedOutput1.out(0).to(this.ValidateAndParseJson1.in(0));
        this.ValidateAndParseJson1.out(0).to(this.SaveToDatabase1.in(0));
        this.Agent2CopyWriter1.out(0).to(this.SaveToDatabase.in(0));
        this.SaveToDatabase1.out(0).to(this.GenerateAnImage.in(0));
        this.GenerateAnImage.out(0).to(this.SubirCadaImagenAImgbb1.in(0));

        this.Agent1StrategyAnalyzer1.uses({
            ai_languageModel: this.OpenaiChatModel.output,
            ai_tool: [this.ThinkTool1.output],
        });
        this.Agent2CopyWriter1.uses({
            ai_languageModel: this.OpenaiChatModel.output,
        });
        this.Agent3ImagePromptEngineer1.uses({
            ai_languageModel: this.OpenaiChatModel.output,
        });
    }
}
