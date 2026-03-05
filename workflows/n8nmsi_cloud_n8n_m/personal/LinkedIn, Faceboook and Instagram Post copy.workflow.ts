import { workflow, node, links } from '@n8n-as-code/transformer';

// <workflow-map>
// Workflow : LinkedIn, Faceboook and Instagram Post copy
// Nodes   : 31  |  Connections: 33
//
// NODE INDEX
// ──────────────────────────────────────────────────────────────────
// Property name                    Node type (short)         Flags
// CheckLinkedin                      if
// CheckFacebook                      if
// TextPostLinkedin                   linkedIn
// LinkedinContentType                switch
// CodeInPythonBeta                   code
// CodeInJavascript                   code
// SeparateImages                     code
// RegisterLoad                       httpRequest
// Uploadimage                        httpRequest
// SingleImagePostLinkedin            linkedIn
// MultipleImagePostLinkedin          httpRequest
// FacebookContentType                switch
// FacebookTextPost                   httpRequest
// FacebookSingleImagePost            httpRequest
// FbSeparateImages                   code
// FbUploadImageHidden                httpRequest
// FbBuildMediaArray                  code
// FbPublishMultipleImages            httpRequest
// PublicarEnIg                       if
// ClasificarContenido                code
// RouterDeContenido                  switch
// ContainerImage                     httpRequest
// ContainerReels                     httpRequest
// EsperarProcesamiento               wait
// VerificarEstado                    httpRequest
// EstaListo                          if
// PublicarEnInstagram                httpRequest
// ContainerItemCarrusel              httpRequest
// AgruparIds                         code
// ContainerMasterCarrusel            httpRequest
// FormularioInstagram                formTrigger
//
// ROUTING MAP
// ──────────────────────────────────────────────────────────────────
// FormularioInstagram
//    → PublicarEnIg
//      → ClasificarContenido
//        → RouterDeContenido
//          → ContainerImage
//            → EsperarProcesamiento
//              → VerificarEstado
//                → EstaListo
//                  → PublicarEnInstagram
//                 .out(1) → EsperarProcesamiento (↩ loop)
//         .out(1) → ContainerReels
//            → EsperarProcesamiento (↩ loop)
//         .out(2) → ContainerItemCarrusel
//            → AgruparIds
//              → ContainerMasterCarrusel
//                → EsperarProcesamiento (↩ loop)
//    → CheckLinkedin
//      → LinkedinContentType
//        → TextPostLinkedin
//       .out(1) → CodeInPythonBeta
//          → SingleImagePostLinkedin
//       .out(2) → SeparateImages
//          → RegisterLoad
//            → Uploadimage
//              → CodeInJavascript
//                → MultipleImagePostLinkedin
//    → CheckFacebook
//      → FacebookContentType
//        → FacebookTextPost
//       .out(1) → FacebookSingleImagePost
//       .out(2) → FbSeparateImages
//          → FbUploadImageHidden
//            → FbBuildMediaArray
//              → FbPublishMultipleImages
// </workflow-map>

// =====================================================================
// METADATA DU WORKFLOW
// =====================================================================

@workflow({
    id: 'fvwbwthhSpkm9TLv',
    name: 'LinkedIn, Faceboook and Instagram Post copy',
    active: false,
    settings: { executionOrder: 'v1' },
})
export class LinkedinFaceboookAndInstagramPostCopyWorkflow {
    // =====================================================================
    // CONFIGURATION DES NOEUDS
    // =====================================================================

    @node({
        name: 'Check LinkedIn',
        type: 'n8n-nodes-base.if',
        version: 2.2,
        position: [-544, 176],
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
        position: [-544, 752],
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
        position: [-96, -16],
    })
    TextPostLinkedin = {
        person: '=qzFSAdsw0m',
        text: "={{ $('On form submission').item.json.post_type }}",
        additionalFields: {},
    };

    @node({
        name: 'LinkedIn Content Type',
        type: 'n8n-nodes-base.switch',
        version: 3.3,
        position: [-320, 160],
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
        name: 'Code in Python (Beta)',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-96, 176],
    })
    CodeInPythonBeta = {
        language: 'python',
        pythonCode:
            "# Obtenemos el ítem de entrada (el formulario)\ninput_item = _input.first()\nnew_items = []\n\n# Verificamos si hay archivos binarios\nif input_item.binary:\n    # Recorremos cada archivo recibido (Image_0, Image_1, etc.)\n    for key in input_item.binary:\n        new_items.append({\n            'json': {\n                # Mantenemos los datos de texto (como el post_type) para usarlos después\n                'post_type': input_item.json.get('post_type'),\n                'file_source': key\n            },\n            'binary': {\n                # Estandarizamos el nombre a 'data' para el nodo de LinkedIn\n                'data': input_item.binary[key]\n            }\n        })\n\nreturn new_items",
    };

    @node({
        name: 'Code in JavaScript',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [576, 368],
    })
    CodeInJavascript = {
        jsCode: '// Obtenemos todos los ítems del nodo de registro\nconst itemsRegistro = $(\'Register Load\').all();\n\nconst mediaItems = [];\n\n// Recorremos cada respuesta de LinkedIn\nfor (const item of itemsRegistro) {\n    // Obtenemos el URN (el identificador de la imagen)\n    const urn = item.json.value.image;\n    \n    if (urn) {\n        // CORRECCIÓN: LinkedIn exige que la llave se llame "id", no "media"\n        mediaItems.push({\n            "id": urn\n        });\n    }\n}\n\n// Devolvemos la lista limpia y correcta\nreturn [{\n    json: {\n        contentEntities: mediaItems\n    }\n}];',
    };

    @node({
        name: 'Separate Images',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-96, 368],
    })
    SeparateImages = {
        language: 'python',
        pythonCode:
            "# 1. Obtenemos el ítem de entrada\nitem = _input.first()\nnew_items = []\n\n# 2. Acceso seguro a los datos binarios\nbinary_data = getattr(item, 'binary', {})\n\nif binary_data:\n    # 3. Buscamos archivos que empiecen con \"Image\"\n    for key, file_obj in binary_data.items():\n        if key.startswith(\"Image\") or key == 'data':\n            new_items.append({\n                'json': {\n                    'post_type': item.json.get('post_type'), # Guardamos el texto\n                    'filename': file_obj.fileName\n                },\n                'binary': {\n                    'data': file_obj # ¡Aquí renombramos a 'data'!\n                }\n            })\n\nreturn new_items",
    };

    @node({
        name: 'Register Load',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.3,
        position: [128, 368],
    })
    RegisterLoad = {
        method: 'POST',
        url: 'https://api.linkedin.com/rest/images?action=initializeUpload',
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
        jsonBody: '{\n  "initializeUploadRequest": {\n    "owner": "urn:li:person:qzFSAdsw0m"\n  }\n}',
        options: {},
    };

    @node({
        name: 'UploadImage',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.3,
        position: [352, 368],
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
        position: [128, 176],
    })
    SingleImagePostLinkedin = {
        person: 'qzFSAdsw0m',
        text: "={{ $('On form submission').item.json.post_type }}",
        shareMediaCategory: 'IMAGE',
        additionalFields: {},
    };

    @node({
        name: 'Multiple Image Post LinkedIn',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.3,
        position: [800, 368],
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
            '={{\n{\n  "author": "urn:li:person:qzFSAdsw0m",\n  "commentary": $(\'On form submission\').first().json.post_type,\n  "visibility": "PUBLIC",\n  "distribution": {\n    "feedDistribution": "MAIN_FEED",\n    "targetEntities": [],\n    "thirdPartyDistributionChannels": []\n  },\n  "content": {\n    "multiImage": {\n      "images": $json.contentEntities\n    }\n  },\n  "lifecycleState": "PUBLISHED",\n  "isReshareDisabledByAuthor": false\n}\n}}',
        options: {},
    };

    @node({
        name: 'Facebook Content Type',
        type: 'n8n-nodes-base.switch',
        version: 3.3,
        position: [-320, 736],
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
        name: 'Facebook Text Post',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.2,
        position: [-96, 560],
    })
    FacebookTextPost = {
        method: 'POST',
        url: 'https://graph.facebook.com/v23.0/899802223217953/feed',
        authentication: 'genericCredentialType',
        genericAuthType: 'httpHeaderAuth',
        sendBody: true,
        specifyBody: 'json',
        jsonBody: '={\n   "message":"{{ $(\'On form submission\').item.json.post_type }}"\n}',
        options: {},
    };

    @node({
        name: 'Facebook Single Image Post',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.2,
        position: [-96, 752],
    })
    FacebookSingleImagePost = {
        method: 'POST',
        url: 'https://graph.facebook.com/v23.0/899802223217953/photos',
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
        position: [-96, 944],
    })
    FbSeparateImages = {
        language: 'python',
        pythonCode:
            "# Obtenemos el ítem de entrada\nitem = _input.first()\nnew_items = []\n\n# Acceso seguro a los datos binarios\nbinary_data = getattr(item, 'binary', {})\n\nif binary_data:\n    # Iteramos sobre todos los archivos binarios\n    for key, file_obj in binary_data.items():\n        # Buscamos claves que empiecen por \"Image\" o sean \"data\"\n        if key.startswith(\"Image\") or key == 'data':\n            new_items.append({\n                'json': {\n                    # Pasamos el texto AQUI para asegurarnos que viaja con la imagen\n                    'post_type': item.json.get('post_type'),\n                    'filename': file_obj.fileName\n                },\n                'binary': {\n                    'data': file_obj\n                }\n            })\n\nreturn new_items",
    };

    @node({
        name: 'FB Upload Image (Hidden)',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.2,
        position: [128, 944],
    })
    FbUploadImageHidden = {
        method: 'POST',
        url: 'https://graph.facebook.com/v23.0/899802223217953/photos',
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
        position: [352, 944],
    })
    FbBuildMediaArray = {
        jsCode: "const itemsUploaded = $('FB Upload Image (Hidden)').all();\nconst originalItems = $('FB Separate Images').all();\n\nconst mediaItems = [];\n\n// Recolectamos los IDs que nos devolvió Facebook\nfor (const item of itemsUploaded) {\n    const mediaId = item.json.id;\n    if (mediaId) {\n        mediaItems.push({\n            \"media_fbid\": mediaId\n        });\n    }\n}\n\n// Recuperamos el texto del nodo anterior (FB Separate Images)\n// Usamos el primer elemento porque el texto es igual para todas las fotos del post\nconst postText = originalItems[0].json.post_type;\n\nreturn [{\n    json: {\n        attached_media: mediaItems,\n        post_type: postText\n    }\n}];",
    };

    @node({
        name: 'FB Publish Multiple Images',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.2,
        position: [576, 944],
    })
    FbPublishMultipleImages = {
        method: 'POST',
        url: 'https://graph.facebook.com/v23.0/899802223217953/feed',
        authentication: 'genericCredentialType',
        genericAuthType: 'httpHeaderAuth',
        sendBody: true,
        specifyBody: 'json',
        jsonBody:
            '={\n   "message": "{{ $json.post_type }}",\n   "attached_media": {{ JSON.stringify($json.attached_media) }}\n}',
        options: {},
    };

    @node({
        name: '¿Publicar en IG?',
        type: 'n8n-nodes-base.if',
        version: 2.2,
        position: [-544, 1328],
    })
    PublicarEnIg = {
        conditions: {
            options: {
                caseSensitive: true,
                leftValue: '',
                typeValidation: 'strict',
                version: 2,
            },
            conditions: [
                {
                    id: 'check-ig',
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
        name: 'Clasificar Contenido',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-320, 1328],
    })
    ClasificarContenido = {
        jsCode: "// Analizamos los archivos para decidir si es Reel, Imagen o Carrusel\nconst binaryKeys = Object.keys($input.item.binary || {});\nconst mediaCount = binaryKeys.length;\nlet type = 'image';\n\nif (mediaCount > 0) {\n  const firstFile = $input.item.binary[binaryKeys[0]];\n  \n  if (firstFile.mimeType.includes('video')) {\n    type = 'reel';\n  } else if (mediaCount > 1) {\n    type = 'carousel';\n  } else {\n    type = 'image';\n  }\n}\n\nreturn {\n  json: {\n    ...$input.item.json,\n    detected_type: type,\n    media_count: mediaCount\n  }\n};",
    };

    @node({
        name: 'Router de Contenido',
        type: 'n8n-nodes-base.switch',
        version: 3.2,
        position: [-96, 1312],
    })
    RouterDeContenido = {
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
                                leftValue: '={{ $json.detected_type }}',
                                rightValue: 'image',
                                operator: {
                                    type: 'string',
                                    operation: 'equals',
                                },
                            },
                        ],
                        combinator: 'and',
                    },
                    renameOutput: true,
                    outputKey: 'Single Image',
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
                                leftValue: '={{ $json.detected_type }}',
                                rightValue: 'reel',
                                operator: {
                                    type: 'string',
                                    operation: 'equals',
                                },
                            },
                        ],
                        combinator: 'and',
                    },
                    renameOutput: true,
                    outputKey: 'Reel',
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
                                leftValue: '={{ $json.detected_type }}',
                                rightValue: 'carousel',
                                operator: {
                                    type: 'string',
                                    operation: 'equals',
                                },
                            },
                        ],
                        combinator: 'and',
                    },
                    renameOutput: true,
                    outputKey: 'Carousel',
                },
            ],
        },
        options: {},
    };

    @node({
        name: 'Container Image',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.2,
        position: [576, 1136],
    })
    ContainerImage = {
        method: 'POST',
        url: 'https://graph.facebook.com/v22.0/me/media',
        authentication: 'genericCredentialType',
        genericAuthType: 'httpHeaderAuth',
        sendQuery: true,
        queryParameters: {
            parameters: [
                {
                    name: 'image_url',
                    value: '={{ $json.Media_URL_Publica }}',
                },
                {
                    name: 'caption',
                    value: '={{ $json.caption }}',
                },
            ],
        },
        options: {},
    };

    @node({
        name: 'Container Reels',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.2,
        position: [576, 1328],
    })
    ContainerReels = {
        method: 'POST',
        url: 'https://graph.facebook.com/v22.0/me/media',
        authentication: 'genericCredentialType',
        genericAuthType: 'httpHeaderAuth',
        sendQuery: true,
        queryParameters: {
            parameters: [
                {
                    name: 'media_type',
                    value: 'REELS',
                },
                {
                    name: 'video_url',
                    value: '={{ $json.Media_URL_Publica }}',
                },
                {
                    name: 'caption',
                    value: '={{ $json.caption }}',
                },
            ],
        },
        options: {},
    };

    @node({
        name: 'Esperar Procesamiento',
        type: 'n8n-nodes-base.wait',
        version: 1.1,
        position: [800, 1344],
    })
    EsperarProcesamiento = {
        path: '564cd4d1-fe87-4a32-bf1d-0d524b19d0a8',
    };

    @node({
        name: 'Verificar Estado',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.2,
        position: [1024, 1264],
    })
    VerificarEstado = {
        url: '=https://graph.facebook.com/v22.0/{{ $json.id }}',
        authentication: 'genericCredentialType',
        genericAuthType: 'httpQueryAuth',
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
        name: '¿Está listo?',
        type: 'n8n-nodes-base.if',
        version: 2.2,
        position: [1248, 1344],
    })
    EstaListo = {
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
        name: 'Publicar en Instagram',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.2,
        position: [1472, 1344],
    })
    PublicarEnInstagram = {
        method: 'POST',
        url: '=https://graph.facebook.com/v22.0/me/media_publish',
        authentication: 'genericCredentialType',
        genericAuthType: 'httpHeaderAuth',
        sendQuery: true,
        queryParameters: {
            parameters: [
                {
                    name: 'creation_id',
                    value: '={{ $json.id }}',
                },
            ],
        },
        options: {},
    };

    @node({
        name: 'Container Item Carrusel',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.2,
        position: [128, 1520],
    })
    ContainerItemCarrusel = {
        method: 'POST',
        url: 'https://graph.facebook.com/v22.0/me/media',
        authentication: 'genericCredentialType',
        genericAuthType: 'httpHeaderAuth',
        sendQuery: true,
        queryParameters: {
            parameters: [
                {
                    name: 'image_url',
                    value: '={{ $json.Media_URL_Publica }}',
                },
                {
                    name: 'is_carousel_item',
                    value: 'true',
                },
            ],
        },
        options: {},
    };

    @node({
        name: 'Agrupar IDs',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [352, 1520],
    })
    AgruparIds = {
        jsCode: "// Agregamos lógica simple para unir los IDs generados arriba en un array\n// NOTA: Para un carrusel real dinámico, deberías usar un Loop sobre los binarios.\n// Aquí se asume simplificado que ya tenemos los IDs listos.\n\nreturn {\n  json: {\n    ids: $input.all().map(i => i.json.id),\n    caption: $('Formulario Instagram').item.json.caption\n  }\n}",
    };

    @node({
        name: 'Container Master Carrusel',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.2,
        position: [576, 1520],
    })
    ContainerMasterCarrusel = {
        method: 'POST',
        url: 'https://graph.facebook.com/v22.0/me/media',
        authentication: 'genericCredentialType',
        genericAuthType: 'httpHeaderAuth',
        sendQuery: true,
        queryParameters: {
            parameters: [
                {
                    name: 'children',
                    value: "={{ $json.ids.join(',') }}",
                },
                {
                    name: 'caption',
                    value: '={{ $json.caption }}',
                },
                {
                    name: 'media_type',
                    value: 'CAROUSEL',
                },
            ],
        },
        options: {},
    };

    @node({
        name: 'Formulario Instagram',
        type: 'n8n-nodes-base.formTrigger',
        version: 2.3,
        position: [-768, 752],
    })
    FormularioInstagram = {
        formTitle: 'Publicar en Instagram',
        formDescription: 'Sube imágenes o video para publicar en Instagram (Feed o Reels)',
        formFields: {
            values: [
                {
                    fieldLabel: 'caption',
                    fieldType: 'textarea',
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
                    fieldLabel: 'Media_File',
                    fieldType: 'file',
                    acceptFileTypes: '.jpg, .png, .mp4',
                },
                {
                    fieldLabel: 'Media_URL_Publica',
                },
            ],
        },
        options: {},
        path: '3afddc9a-9819-4011-ae39-0e2f93322e35',
    };

    // =====================================================================
    // ROUTAGE ET CONNEXIONS
    // =====================================================================

    @links()
    defineRouting() {
        this.CheckLinkedin.out(0).to(this.LinkedinContentType.in(0));
        this.CheckFacebook.out(0).to(this.FacebookContentType.in(0));
        this.LinkedinContentType.out(0).to(this.TextPostLinkedin.in(0));
        this.LinkedinContentType.out(1).to(this.CodeInPythonBeta.in(0));
        this.LinkedinContentType.out(2).to(this.SeparateImages.in(0));
        this.CodeInPythonBeta.out(0).to(this.SingleImagePostLinkedin.in(0));
        this.CodeInJavascript.out(0).to(this.MultipleImagePostLinkedin.in(0));
        this.SeparateImages.out(0).to(this.RegisterLoad.in(0));
        this.RegisterLoad.out(0).to(this.Uploadimage.in(0));
        this.Uploadimage.out(0).to(this.CodeInJavascript.in(0));
        this.FacebookContentType.out(0).to(this.FacebookTextPost.in(0));
        this.FacebookContentType.out(1).to(this.FacebookSingleImagePost.in(0));
        this.FacebookContentType.out(2).to(this.FbSeparateImages.in(0));
        this.FbSeparateImages.out(0).to(this.FbUploadImageHidden.in(0));
        this.FbUploadImageHidden.out(0).to(this.FbBuildMediaArray.in(0));
        this.FbBuildMediaArray.out(0).to(this.FbPublishMultipleImages.in(0));
        this.PublicarEnIg.out(0).to(this.ClasificarContenido.in(0));
        this.ClasificarContenido.out(0).to(this.RouterDeContenido.in(0));
        this.RouterDeContenido.out(0).to(this.ContainerImage.in(0));
        this.RouterDeContenido.out(1).to(this.ContainerReels.in(0));
        this.RouterDeContenido.out(2).to(this.ContainerItemCarrusel.in(0));
        this.ContainerImage.out(0).to(this.EsperarProcesamiento.in(0));
        this.ContainerReels.out(0).to(this.EsperarProcesamiento.in(0));
        this.EsperarProcesamiento.out(0).to(this.VerificarEstado.in(0));
        this.VerificarEstado.out(0).to(this.EstaListo.in(0));
        this.EstaListo.out(0).to(this.PublicarEnInstagram.in(0));
        this.EstaListo.out(1).to(this.EsperarProcesamiento.in(0));
        this.ContainerItemCarrusel.out(0).to(this.AgruparIds.in(0));
        this.AgruparIds.out(0).to(this.ContainerMasterCarrusel.in(0));
        this.ContainerMasterCarrusel.out(0).to(this.EsperarProcesamiento.in(0));
        this.FormularioInstagram.out(0).to(this.PublicarEnIg.in(0));
        this.FormularioInstagram.out(0).to(this.CheckLinkedin.in(0));
        this.FormularioInstagram.out(0).to(this.CheckFacebook.in(0));
    }
}
