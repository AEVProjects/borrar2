import { workflow, node, links } from '@n8n-as-code/transformer';

// <workflow-map>
// Workflow : All_working
// Nodes   : 44  |  Connections: 43
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
// FormatFormInput                    set
// Agent1StrategyAnalyzer             agent                      [AI]
// Agent2CopyWriter                   agent                      [AI]
// SavePostToDb                       postgres                   [creds]
// Agent3ImagePromptEngineer          agent                      [AI]
// UpdateImagePromptInDb              postgres                   [creds]
// PrepareForImageGen                 set
// GenerateImage                      googleGemini               [creds]
// UploadToImgbb                      httpRequest                [creds]
// UpdateDbWithImageUrl               postgres                   [creds]
// FormatSuccessResponse              set
// OpenaiChatModel                    lmChatOpenAi               [creds]
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
//    → FormatFormInput
//      → Agent1StrategyAnalyzer
//        → Agent2CopyWriter
//          → SavePostToDb
//            → Agent3ImagePromptEngineer
//              → UpdateImagePromptInDb
//                → PrepareForImageGen
//                  → GenerateImage
//                    → UploadToImgbb
//                      → UpdateDbWithImageUrl
//                        → FormatSuccessResponse
//
// AI CONNECTIONS
// OpenaiChatModel.uses({ ai_languageModel: Agent1StrategyAnalyzer, ai_languageModel: Agent2CopyWriter, ai_languageModel: Agent3ImagePromptEngineer })
// </workflow-map>

// =====================================================================
// METADATA DU WORKFLOW
// =====================================================================

@workflow({
    id: 'UJXv37zf9YItMKTW',
    name: 'All_working',
    active: false,
    settings: { executionOrder: 'v1' },
})
export class AllWorkingWorkflow {
    // =====================================================================
    // CONFIGURATION DES NOEUDS
    // =====================================================================

    @node({
        name: 'Check LinkedIn',
        type: 'n8n-nodes-base.if',
        version: 2.2,
        position: [-3920, 96],
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
        position: [-3920, 672],
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
        position: [-3472, -96],
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
        position: [-3696, 80],
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
        position: [-2800, 288],
    })
    CodeInJavascript = {
        jsCode: '// Obtenemos todos los ítems del nodo de registro\nconst itemsRegistro = $(\'Register Load\').all();\n\nconst mediaItems = [];\n\n// Recorremos cada respuesta de LinkedIn\nfor (const item of itemsRegistro) {\n    // Obtenemos el URN (el identificador de la imagen)\n    const urn = item.json.value.image;\n    \n    if (urn) {\n        // CORRECCIÓN: LinkedIn exige que la llave se llame "id", no "media"\n        mediaItems.push({\n            "id": urn\n        });\n    }\n}\n\n// Devolvemos la lista limpia y correcta\nreturn [{\n    json: {\n        contentEntities: mediaItems\n    }\n}];',
    };

    @node({
        name: 'Separate Images',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-3472, 288],
    })
    SeparateImages = {
        jsCode: "// 1. Obtenemos todos los ítems de entrada\nconst allItems = $input.all();\nconst newItems = [];\n\n// 2. Iteramos sobre cada ítem (por si llegan varios)\nfor (const item of allItems) {\n  const binaryData = item.binary;\n  \n  // Si no hay archivos binarios, saltamos este ítem\n  if (!binaryData) continue;\n\n  // 3. Recorremos todas las llaves del objeto binario (Image, Image1, etc.)\n  for (const key of Object.keys(binaryData)) {\n    // Filtramos para procesar solo los campos que empiezan con \"Image\" o se llamen \"data\"\n    if (key.startsWith('Image') || key === 'data') {\n      newItems.push({\n        json: {\n          ...item.json, // Mantenemos todos los datos (post_type, etc.)\n          filename: binaryData[key].fileName,\n          mimetype: binaryData[key].mimeType\n        },\n        binary: {\n          data: binaryData[key] // Renombramos a 'data' para el siguiente nodo\n        }\n      });\n    }\n  }\n}\n\n// 4. Devolvemos la lista de ítems (uno por cada imagen)\nreturn newItems;",
    };

    @node({
        name: 'Register Load',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.3,
        position: [-3248, 288],
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
        position: [-3024, 288],
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
        position: [-3472, 96],
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
        position: [-2576, 288],
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
        position: [-3696, 656],
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
        position: [-3472, 672],
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
        position: [-3472, 864],
    })
    FbSeparateImages = {
        jsCode: "// 1. Obtenemos todos los ítems de entrada (del Switch)\nconst allItems = $input.all();\nconst newItems = [];\n\n// 2. Iteramos sobre cada ítem\nfor (const item of allItems) {\n  const binaryData = item.binary;\n  \n  // Si no hay archivos binarios, saltamos este ítem\n  if (!binaryData) continue;\n\n  // 3. Recorremos todas las llaves binarias (Image, Image1, Image2, etc.)\n  for (const key of Object.keys(binaryData)) {\n    // Procesamos solo los campos que empiezan con \"Image\"\n    if (key.startsWith('Image')) {\n      newItems.push({\n        json: {\n          ...item.json, // Mantenemos el post_type y otros datos\n          internal_image_key: key\n        },\n        binary: {\n          data: binaryData[key] // Renombramos a 'data' para el nodo de FB Upload\n        }\n      });\n    }\n  }\n}\n\n// 4. Devolvemos la lista: ahora habrá un ítem por cada imagen\nreturn newItems;",
    };

    @node({
        name: 'FB Upload Image (Hidden)',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.2,
        position: [-3248, 864],
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
        position: [-3024, 864],
    })
    FbBuildMediaArray = {
        jsCode: "const itemsUploaded = $('FB Upload Image (Hidden)').all();\nconst originalItems = $('FB Separate Images').all();\n\nconst mediaItems = [];\n\n// Recolectamos los IDs que nos devolvió Facebook\nfor (const item of itemsUploaded) {\n    const mediaId = item.json.id;\n    if (mediaId) {\n        mediaItems.push({\n            \"media_fbid\": mediaId\n        });\n    }\n}\n\n// Recuperamos el texto del nodo anterior (FB Separate Images)\n// Usamos el primer elemento porque el texto es igual para todas las fotos del post\nconst postText = originalItems[0].json.post_type;\n\nreturn [{\n    json: {\n        attached_media: mediaItems,\n        post_type: postText\n    }\n}];",
    };

    @node({
        name: 'FB Publish Multiple Images',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.2,
        position: [-2800, 864],
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
        position: [-4144, 672],
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
    };

    @node({
        name: 'Facebook Page Post (v22.0)',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.2,
        position: [-3472, 480],
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
        position: [-2800, 1056],
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
        position: [-2576, 1056],
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
        position: [-3248, 1248],
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
        position: [-2128, 1080],
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
        position: [-1904, 1152],
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
        position: [-2352, 1152],
    })
    EsperarProcesamiento1 = {
        amount: 10,
    };

    @node({
        name: 'Publicar en Instagram',
        type: 'n8n-nodes-base.facebookGraphApi',
        version: 1,
        position: [-1680, 1152],
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
        position: [-3696, 1152],
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
        position: [-3472, 1248],
    })
    CodeInJavascript1 = {
        jsCode: "// 1. Obtenemos el ítem que viene del Switch\nconst allItems = $input.all();\nconst newItems = [];\n\nfor (const item of allItems) {\n  const binaryData = item.binary;\n  \n  if (!binaryData) continue;\n\n  // 2. Buscamos todas las propiedades que empiecen con \"Image\"\n  for (const key of Object.keys(binaryData)) {\n    if (key.startsWith('Image')) {\n      newItems.push({\n        json: {\n          ...item.json,\n          original_key: key\n        },\n        binary: {\n          // Renombramos CUALQUIER imagen a 'data' para que el siguiente nodo sea simple\n          data: binaryData[key]\n        }\n      });\n    }\n  }\n}\n\n// 3. Ahora devolvemos una lista de ítems (uno por cada imagen)\nreturn newItems;",
    };

    @node({
        name: 'IG - Crear Item de Carrusel',
        type: 'n8n-nodes-base.facebookGraphApi',
        version: 1,
        position: [-3024, 1248],
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
        position: [-2800, 1248],
    })
    IgAgruparIdsParaCarrusel = {
        jsCode: 'const items = $input.all();\nconst ids = items.map(item => item.json.id);\n// Rescatamos el caption del formulario original\nconst caption = $("On form submission").first().json.post_type;\n\nreturn [{\n  json: {\n    children_ids: ids.join(\',\'),\n    post_caption: caption\n  }\n}];',
    };

    @node({
        name: 'IG - Crear Contenedor Maestro',
        type: 'n8n-nodes-base.facebookGraphApi',
        version: 1,
        position: [-2576, 1248],
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
        position: [-3920, 1152],
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
        position: [-4144, 1576],
    })
    MsiContentForm = {
        path: 'msi-content-form',
        formTitle: 'MSI Content Generator',
        formDescription: 'Generate professional LinkedIn content and images for MSI Americas',
        formFields: {
            values: [
                {
                    fieldLabel: 'topic',
                    requiredField: true,
                },
                {
                    fieldLabel: 'post_type',
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
                    fieldLabel: 'visual_style',
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
                    fieldLabel: 'orientation',
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
                    fieldLabel: 'data_points',
                    placeholder: 'E.g., 75% faster deployment, $2M cost reduction',
                },
                {
                    fieldLabel: 'headline',
                    placeholder: 'Keep it short and bold (3-5 words max)',
                    requiredField: true,
                },
                {
                    fieldLabel: 'context',
                    fieldType: 'textarea',
                    placeholder: 'Any specific requirements or details...',
                },
            ],
        },
        options: {},
    };

    @node({
        name: 'Format Form Input',
        type: 'n8n-nodes-base.set',
        version: 3.3,
        position: [-3920, 1576],
    })
    FormatFormInput = {
        assignments: {
            assignments: [
                {
                    id: 'chatInput',
                    name: 'chatInput',
                    value: "=Topic: {{ $json.topic }}\nPost Type: {{ $json.post_type }}\nVisual Style: {{ $json.visual_style }}\nOrientation: {{ $json.orientation }}\nData Points: {{ $json.data_points || 'None provided' }}\nHeadline: {{ $json.headline }}\nContext: {{ $json.context || 'None provided' }}",
                    type: 'string',
                },
                {
                    id: 'topic',
                    name: 'topic',
                    value: '={{ $json.topic }}',
                    type: 'string',
                },
                {
                    id: 'post_type',
                    name: 'post_type',
                    value: '={{ $json.post_type }}',
                    type: 'string',
                },
                {
                    id: 'visual_style',
                    name: 'visual_style',
                    value: '={{ $json.visual_style }}',
                    type: 'string',
                },
                {
                    id: 'orientation',
                    name: 'orientation',
                    value: '={{ $json.orientation }}',
                    type: 'string',
                },
                {
                    id: 'headline',
                    name: 'headline',
                    value: '={{ $json.headline }}',
                    type: 'string',
                },
                {
                    id: 'data_points',
                    name: 'data_points',
                    value: "={{ $json.data_points || '' }}",
                    type: 'string',
                },
                {
                    id: 'context',
                    name: 'context',
                    value: "={{ $json.context || '' }}",
                    type: 'string',
                },
            ],
        },
        options: {},
    };

    @node({
        name: 'Agent 1: Strategy Analyzer',
        type: '@n8n/n8n-nodes-langchain.agent',
        version: 1.7,
        position: [-3696, 1576],
    })
    Agent1StrategyAnalyzer = {
        promptType: 'define',
        text: '={{ $json.chatInput }}',
        options: {
            systemMessage:
                "=# ROLE: Strategic Content Analyst for MSI Americas\n\n## YOUR TASK\nAnalyze the user's content request and provide strategic guidance for both LinkedIn copy and visual design.\n\n## OUTPUT FORMAT\nYou MUST output your response in this EXACT structure:\n\n---CONTENT STRATEGY---\nHook: [Compelling first line]\nBody: [Main message with examples]\nCTA: [Call to action as question]\nHashtags: [3-5 relevant hashtags including #MSIAmericas]\n\n---VISUAL STRATEGY---\nMain Scene: [Technical visualization description]\nVisual Style: [From user input]\nOrientation: [From user input]\nDimensions: [Extract from orientation]\nComposition: [Layout approach]\n\n---GRAPHIC ELEMENTS---\n1. [Element type and description]\n2. [Element type and description]\n\n---IN-IMAGE TEXT---\n[Use EXACT headline from user input]\n\n---DATA POINTS---\n- [Stat or metric 1]\n- [Stat or metric 2]\n\n---TECHNICAL NOTES---\n[Implementation details from user context]\n\n## MSI CONTEXT\nMSI Americas specializes in:\n- Cloud Solutions & Migration (AWS, Azure, GCP)\n- 5G Infrastructure & IoT Implementation\n- IT Staff Augmentation\n- Sustainability Tech & Diversity Programs\n\n## CONTENT STRATEGY RULES\n1. NO generic corporate language\n2. Use specific data and real examples\n3. Keep hook under 150 characters\n4. Be technical but accessible\n5. Always end with conversational CTA\n\n## VISUAL STRATEGY RULES\n1. Use MSI colors: #004AAD (blue), #67B547 (green), #FFFDF1 (off-white)\n2. Avoid stock photo aesthetics\n3. Focus on abstract data visualizations\n4. Keep compositions clean with negative space\n5. Include 2-3 graphic elements maximum\n\nREMEMBER: Follow the OUTPUT FORMAT exactly. Use the user's provided headline, visual style, and orientation directly.",
        },
    };

    @node({
        name: 'Agent 2: Copy Writer',
        type: '@n8n/n8n-nodes-langchain.agent',
        version: 1.7,
        position: [-3344, 1576],
    })
    Agent2CopyWriter = {
        promptType: 'define',
        text: "={{ $('Agent 1: Strategy Analyzer').item.json.output }}",
        options: {
            systemMessage:
                '# ROLE: LinkedIn Copy Writer for MSI Americas\n\n## CRITICAL OUTPUT REQUIREMENT\n⚠️ YOU MUST OUTPUT ONLY PLAIN TEXT - NO METADATA, NO LABELS, NO FORMATTING MARKERS\n⚠️ Your response will be saved DIRECTLY to a database text field\n⚠️ DO NOT include "CHARACTER COUNT" or "ESTIMATED READING TIME" or any other labels\n⚠️ Output ONLY the LinkedIn post text itself, nothing else\n\n## YOUR TASK\nReceive the CONTENT STRATEGY section and create compelling LinkedIn post copy.\n\n## WRITING GUIDELINES\n\n### Structure\n- Hook (First 2 lines): Specific stat, question, or concrete statement\n- Body: Include data points, use line breaks every 2-3 sentences\n- CTA: Conversational question\n\n### Voice\n- Sound like a senior engineer who\'s fixed this 50 times\n- Direct and honest, not salesy\n- Technical but accessible\n\n### Banned Phrases\nNEVER use:\n- "In today\'s digital landscape"\n- "Revolutionize/Transform your business"\n- "Cutting-edge/Game-changing"\n- "Unlock the power of"\n- "Seamlessly integrate"\n- "Best-in-class"\n\n### Rules\n1. English only\n2. Under 1,300 characters\n3. At least 2 specific numbers/stats\n4. NO emojis\n5. Always end with #MSIAmericas\n\n## EXAMPLE OUTPUT FORMAT\n```\nMost cloud migrations fail because teams focus on lift-and-shift instead of optimization. We\'ve seen 60% of companies overspend by $200K+ annually on unused resources.\n\nThe fix isn\'t more tools. It\'s better architecture planning:\n- Right-size instances before migration\n- Implement auto-scaling from day one\n- Use reserved instances for predictable workloads\n\nWe helped a healthcare client reduce AWS costs by 47% in 90 days without touching a single application. The secret? Proper tagging and governance from the start.\n\nWhat\'s been your biggest challenge with cloud cost optimization?\n\n#MSIAmericas #CloudMigration #AWSOptimization\n```\n\nREMEMBER: Output ONLY the post text. No preamble, no metadata, no character counts. Just the post.',
        },
    };

    @node({
        name: 'Save Post to DB',
        type: 'n8n-nodes-base.postgres',
        version: 2.5,
        position: [-2992, 1576],
        credentials: { postgres: { id: 'WnTYs2zvPoE7hDJE', name: 'Postgres account' } },
    })
    SavePostToDb = {
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
                topic: "={{ $('Format Form Input').item.json.topic }}",
                post_type: "={{ $('Format Form Input').item.json.post_type }}",
                visual_style: "={{ $('Format Form Input').item.json.visual_style }}",
                orientation: "={{ $('Format Form Input').item.json.orientation }}",
                headline: "={{ $('Format Form Input').item.json.headline }}",
                data_points: "={{ $('Format Form Input').item.json.data_points }}",
                context: "={{ $('Format Form Input').item.json.context }}",
                strategy_analysis: "={{ $('Agent 1: Strategy Analyzer').item.json.output }}",
                post_copy: '={{ $json.output }}',
                status: 'copy_completed',
            },
            matchingColumns: [],
            schema: [],
        },
        options: {},
    };

    @node({
        name: 'Agent 3: Image Prompt Engineer',
        type: '@n8n/n8n-nodes-langchain.agent',
        version: 1.7,
        position: [-2768, 1576],
    })
    Agent3ImagePromptEngineer = {
        promptType: 'define',
        text: "={{ $('Agent 1: Strategy Analyzer').item.json.output }}",
        options: {
            systemMessage:
                '# ROLE: AI Image Prompt Engineer for MSI Americas\n\n## CRITICAL OUTPUT REQUIREMENT\n⚠️ YOU MUST OUTPUT ONLY PLAIN TEXT - A SINGLE CONTINUOUS IMAGE GENERATION PROMPT\n⚠️ NO SECTIONS, NO HEADERS, NO LABELS, NO METADATA\n⚠️ Your response will be saved DIRECTLY to a database text field and sent to an image generation API\n⚠️ DO NOT include "MSI IMAGE GENERATION PROMPT" or "TECHNICAL SPECIFICATIONS" or any other section headers\n⚠️ Output ONLY the prompt text itself in a single flowing paragraph\n\n## YOUR TASK\nReceive the VISUAL STRATEGY, GRAPHIC ELEMENTS, IN-IMAGE TEXT, and DATA POINTS sections and create ONE complete image generation prompt as plain text.\n\n## MSI BRAND IDENTITY\n**Colors (MANDATORY):**\n- Deep Blue #004AAD (Primary)\n- Tech Green #67B547 (Accent)\n- Off-White #FFFDF1 (Backgrounds)\n- Light Blue #4A9FFF (Glows/Glass)\n\n**Typography:**\n- Headlines: ITC Avant Garde Gothic Bold\n- Subheadings: Poppins\n- Body: Quicksand Regular/Medium\n- Data/Numbers: Rajdhani Bold\n\n**Style:** Corporate, Secure, Tech-Forward. Clean, functional, engineered look.\n\n## TEXT RENDERING RULES (CRITICAL)\n\n**RULE 1: ONLY ONE TEXT ELEMENT**\n- ONE SINGLE HEADLINE only (3-5 words)\n- NO additional labels, NO small text, NO subtitles\n\n**RULE 2: TEXT MUST BE LARGE**\n- Minimum 100-150pt equivalent\n- Text should occupy 20-30% of image height\n\n**RULE 3: FLAT 2D TEXT ONLY**\nALWAYS specify:\n- "Clean, flat 2D typography"\n- "Bold sans-serif headline, ultra readable"\n- "Maximum legibility, zero effects on text"\n- "Simple flat overlay, no depth, no shadows"\n\nNEVER use:\n- "3D text" or "Extruded letters"\n- "Multiple text elements"\n- "Small labels or annotations"\n\n**RULE 4: HIGH CONTRAST**\n- White text on dark backgrounds (preferred)\n- Clear visual separation from background\n\n## COMPOSITION TEMPLATES\n\n**Data Hero (for stats):**\n- Center: ONE large flat number/headline (100-150pt)\n- Background: Blue to Navy gradient\n- Accent: Tech Green glow\n\n**Tech Close-up (for technical topics):**\n- Foreground: Detailed tech component\n- Background: Blurred tech environment\n- Text: ONE white headline on dark area\n\n**Isometric Architecture (for systems):**\n- Isometric infrastructure view\n- MSI color-coded elements\n- Flow lines with glow effects\n- Text: ONE flat headline in clear space\n\n## WHAT TO AVOID\nNEVER include:\n- Generic office people with laptops\n- Stock photo aesthetics\n- Cluttered compositions\n- 3D text or extruded letters\n- Multiple text elements\n- Small text or tiny labels\n\n## EXAMPLE OUTPUT (THIS IS WHAT YOU SHOULD OUTPUT - PLAIN TEXT ONLY):\n\n```\nCreate a professional LinkedIn post image in 1080x1080 square format featuring an isometric 3D visualization of cloud infrastructure architecture. The scene shows interconnected server nodes rendered in MSI\'s deep blue (#004AAD) floating in space, connected by glowing tech green (#67B547) data streams. In the foreground, display three prominent server clusters arranged in a triangular formation, each with subtle tech green accent lights. The background uses a gradient from deep navy to MSI blue (#004AAD) with subtle circuit pattern texture. The main headline "47% COST REDUCTION" appears in large, bold, flat 2D white typography (ITC Avant Garde Gothic Bold style, 140pt equivalent) positioned in the upper third of the image with maximum contrast against the dark blue background. Add floating geometric UI elements showing abstract data metrics in translucent white frames with tech green highlights. Include subtle depth of field effect to create professional dimension. The overall aesthetic should be clean, corporate, and tech-forward with generous negative space. Ensure the typography is perfectly flat with no 3D effects, shadows, or depth - maximum readability is critical. The composition should avoid any stock photo aesthetics, focusing instead on abstract technical visualization that conveys cloud infrastructure expertise.\n```\n\nREMEMBER: Output ONLY a single flowing paragraph prompt. No sections, no headers, no metadata. Just the complete prompt text that will be sent directly to the image generation API.',
        },
    };

    @node({
        name: 'Update Image Prompt in DB',
        type: 'n8n-nodes-base.postgres',
        version: 2.5,
        position: [-2416, 1576],
        credentials: { postgres: { id: 'WnTYs2zvPoE7hDJE', name: 'Postgres account' } },
    })
    UpdateImagePromptInDb = {
        operation: 'executeQuery',
        query: "=UPDATE social_posts \nSET image_prompt = '{{ $json.output }}',\n    status = 'prompt_completed',\n    updated_at = NOW()\nWHERE id = '{{ $('Save Post to DB').item.json.id }}'\nRETURNING *",
        options: {},
    };

    @node({
        name: 'Prepare for Image Gen',
        type: 'n8n-nodes-base.set',
        version: 3.3,
        position: [-2192, 1576],
    })
    PrepareForImageGen = {
        assignments: {
            assignments: [
                {
                    id: 'image_prompt',
                    name: 'image_prompt',
                    value: '={{ $json.image_prompt }}',
                    type: 'string',
                },
                {
                    id: 'post_id',
                    name: 'post_id',
                    value: '={{ $json.id }}',
                    type: 'string',
                },
                {
                    id: 'orientation',
                    name: 'orientation',
                    value: '={{ $json.orientation }}',
                    type: 'string',
                },
            ],
        },
        options: {},
    };

    @node({
        name: 'Generate Image',
        type: '@n8n/n8n-nodes-langchain.googleGemini',
        version: 1,
        position: [-1968, 1576],
        credentials: { googlePalmApi: { id: 'oF4jKBK0jRbwEPWt', name: 'Google Gemini(PaLM) Api account' } },
    })
    GenerateImage = {
        resource: 'image',
        modelId: {
            __rl: true,
            value: 'models/gemini-3-pro-image-preview',
            mode: 'id',
        },
        prompt: '={{ $json.image_prompt }}',
        options: {},
    };

    @node({
        name: 'Upload to ImgBB',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.1,
        position: [-1744, 1576],
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
        position: [-1520, 1576],
        credentials: { postgres: { id: 'WnTYs2zvPoE7hDJE', name: 'Postgres account' } },
    })
    UpdateDbWithImageUrl = {
        operation: 'executeQuery',
        query: "=UPDATE social_posts \nSET image_url = '{{ $json.data.url }}', \n    status = 'completed',\n    updated_at = NOW()\nWHERE id = '{{ $('Prepare for Image Gen').item.json.post_id }}'\nRETURNING *",
        options: {},
    };

    @node({
        name: 'Format Success Response',
        type: 'n8n-nodes-base.set',
        version: 3.3,
        position: [-1296, 1576],
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
        name: 'OpenAI Chat Model',
        type: '@n8n/n8n-nodes-langchain.lmChatOpenAi',
        version: 1.3,
        position: [-3624, 1800],
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
        this.MsiContentForm.out(0).to(this.FormatFormInput.in(0));
        this.FormatFormInput.out(0).to(this.Agent1StrategyAnalyzer.in(0));
        this.Agent1StrategyAnalyzer.out(0).to(this.Agent2CopyWriter.in(0));
        this.Agent2CopyWriter.out(0).to(this.SavePostToDb.in(0));
        this.SavePostToDb.out(0).to(this.Agent3ImagePromptEngineer.in(0));
        this.Agent3ImagePromptEngineer.out(0).to(this.UpdateImagePromptInDb.in(0));
        this.UpdateImagePromptInDb.out(0).to(this.PrepareForImageGen.in(0));
        this.PrepareForImageGen.out(0).to(this.GenerateImage.in(0));
        this.GenerateImage.out(0).to(this.UploadToImgbb.in(0));
        this.UploadToImgbb.out(0).to(this.UpdateDbWithImageUrl.in(0));
        this.UpdateDbWithImageUrl.out(0).to(this.FormatSuccessResponse.in(0));

        this.Agent1StrategyAnalyzer.uses({
            ai_languageModel: this.OpenaiChatModel.output,
        });
        this.Agent2CopyWriter.uses({
            ai_languageModel: this.OpenaiChatModel.output,
        });
        this.Agent3ImagePromptEngineer.uses({
            ai_languageModel: this.OpenaiChatModel.output,
        });
    }
}
