import { workflow, node, links } from '@n8n-as-code/transformer';

// <workflow-map>
// Workflow : LinkedIn Post
// Nodes   : 11  |  Connections: 10
//
// NODE INDEX
// ──────────────────────────────────────────────────────────────────
// Property name                    Node type (short)         Flags
// TextPostLinkedin                   linkedIn
// OnFormSubmission                   formTrigger
// SmartContentRouter                 switch
// Switch_                            switch
// CodeInPythonBeta                   code
// CodeInJavascript                   code
// SeparateImages                     code
// RegisterLoad                       httpRequest
// Uploadimage                        httpRequest
// SingleImagePostLinkedin            linkedIn
// MultipleImagePostLinkedin          httpRequest
//
// ROUTING MAP
// ──────────────────────────────────────────────────────────────────
// OnFormSubmission
//    → SmartContentRouter
//      → Switch_
//        → TextPostLinkedin
//       .out(1) → CodeInPythonBeta
//          → SingleImagePostLinkedin
//       .out(2) → SeparateImages
//          → RegisterLoad
//            → Uploadimage
//              → CodeInJavascript
//                → MultipleImagePostLinkedin
// </workflow-map>

// =====================================================================
// METADATA DU WORKFLOW
// =====================================================================

@workflow({
    id: 'jpOs3lTehtr8cEJv',
    name: 'LinkedIn Post',
    active: false,
    settings: { executionOrder: 'v1' },
})
export class LinkedinPostWorkflow {
    // =====================================================================
    // CONFIGURATION DES NOEUDS
    // =====================================================================

    @node({
        name: 'Text Post Linkedin',
        type: 'n8n-nodes-base.linkedIn',
        version: 1,
        position: [-176, 80],
    })
    TextPostLinkedin = {
        person: '=qzFSAdsw0m',
        text: "={{ $('Smart Content Router').item.json.post_type }}",
        additionalFields: {},
    };

    @node({
        name: 'On form submission',
        type: 'n8n-nodes-base.formTrigger',
        version: 2.3,
        position: [-848, 464],
    })
    OnFormSubmission = {
        formTitle: 'Post on LinkedIn',
        formDescription: 'Fill the following fields in order to create a Post',
        formFields: {
            values: [
                {
                    fieldLabel: 'post_type',
                },
                {
                    fieldLabel: 'node_type',
                    fieldType: 'dropdown',
                    fieldOptions: {
                        values: [
                            {
                                option: 'LinkedIn Post',
                            },
                        ],
                    },
                    requiredField: true,
                },
                {
                    fieldLabel: 'Image',
                    fieldType: 'file',
                    acceptFileTypes: '.jpg, .png',
                },
            ],
        },
        options: {},
    };

    @node({
        name: 'Smart Content Router',
        type: 'n8n-nodes-base.switch',
        version: 3.2,
        position: [-624, 464],
    })
    SmartContentRouter = {
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
                                leftValue: '={{ $json.node_type }}',
                                rightValue: 'LinkedIn Post',
                                operator: {
                                    type: 'string',
                                    operation: 'equals',
                                },
                                id: 'ab388a77-1660-4a64-ba58-bc405444dbd5',
                            },
                        ],
                        combinator: 'and',
                    },
                    renameOutput: true,
                    outputKey: 'Text',
                },
            ],
        },
        options: {},
    };

    @node({
        name: 'Switch',
        type: 'n8n-nodes-base.switch',
        version: 3.3,
        position: [-400, 448],
    })
    Switch_ = {
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
        position: [-176, 272],
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
        position: [496, 464],
    })
    CodeInJavascript = {
        jsCode: '// Obtenemos todos los ítems del nodo de registro\nconst itemsRegistro = $(\'Register Load\').all();\n\nconst mediaItems = [];\n\n// Recorremos cada respuesta de LinkedIn\nfor (const item of itemsRegistro) {\n    // Obtenemos el URN (el identificador de la imagen)\n    const urn = item.json.value.image;\n    \n    if (urn) {\n        // CORRECCIÓN: LinkedIn exige que la llave se llame "id", no "media"\n        mediaItems.push({\n            "id": urn\n        });\n    }\n}\n\n// Devolvemos la lista limpia y correcta\nreturn [{\n    json: {\n        contentEntities: mediaItems\n    }\n}];',
    };

    @node({
        name: 'Separate Images',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-176, 464],
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
        position: [48, 464],
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
        position: [272, 464],
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
        position: [48, 272],
    })
    SingleImagePostLinkedin = {
        person: 'qzFSAdsw0m',
        text: "={{ $('Smart Content Router').item.json.post_type }}",
        shareMediaCategory: 'IMAGE',
        additionalFields: {},
    };

    @node({
        name: 'Multiple Image Post LinkedIn',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.3,
        position: [720, 464],
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

    // =====================================================================
    // ROUTAGE ET CONNEXIONS
    // =====================================================================

    @links()
    defineRouting() {
        this.OnFormSubmission.out(0).to(this.SmartContentRouter.in(0));
        this.SmartContentRouter.out(0).to(this.Switch_.in(0));
        this.Switch_.out(0).to(this.TextPostLinkedin.in(0));
        this.Switch_.out(1).to(this.CodeInPythonBeta.in(0));
        this.Switch_.out(2).to(this.SeparateImages.in(0));
        this.CodeInPythonBeta.out(0).to(this.SingleImagePostLinkedin.in(0));
        this.CodeInJavascript.out(0).to(this.MultipleImagePostLinkedin.in(0));
        this.SeparateImages.out(0).to(this.RegisterLoad.in(0));
        this.RegisterLoad.out(0).to(this.Uploadimage.in(0));
        this.Uploadimage.out(0).to(this.CodeInJavascript.in(0));
    }
}
