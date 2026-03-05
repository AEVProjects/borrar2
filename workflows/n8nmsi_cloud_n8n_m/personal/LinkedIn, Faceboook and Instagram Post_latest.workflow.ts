import { workflow, node, links } from '@n8n-as-code/transformer';

// <workflow-map>
// Workflow : LinkedIn, Faceboook and Instagram Post_latest
// Nodes   : 31  |  Connections: 32
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
// </workflow-map>

// =====================================================================
// METADATA DU WORKFLOW
// =====================================================================

@workflow({
    id: '5FkeWu50kt62yXrI',
    name: 'LinkedIn, Faceboook and Instagram Post_latest',
    active: false,
    settings: { executionOrder: 'v1' },
})
export class LinkedinFaceboookAndInstagramPostLatestWorkflow {
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
        position: [-1280, 672],
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
    }
}
