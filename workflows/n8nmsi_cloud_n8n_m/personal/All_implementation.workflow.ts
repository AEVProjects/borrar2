import { workflow, node, links } from '@n8n-as-code/transformer';

// <workflow-map>
// Workflow : All_implementation
// Nodes   : 38  |  Connections: 39
//
// NODE INDEX
// ──────────────────────────────────────────────────────────────────
// Property name                    Node type (short)         Flags
// RespondToWebhookPublish            respondToWebhook
// SepararBinarios                    code
// GenerarUrlImgbb                    httpRequest                [creds]
// CheckIfImageExists                 if
// MergeImgbbResponse                 code
// PrepareDbData                      code
// CheckLinkedin                      if
// CheckFacebook                      if
// CheckInstagram                     if
// PrepUrlLi                          code
// LinkedinContentType                switch
// TextPostLinkedin                   linkedIn                   [creds]
// SingleImagePostLinkedin            linkedIn                   [creds]
// SeparateImagesLi                   code
// RegisterLoad                       httpRequest                [onError→regular] [creds]
// Uploadimage                        httpRequest
// CodeInJavascript                   code
// MultipleImagePostLinkedin          httpRequest                [creds]
// PrepUrlFb                          code
// FacebookContentType                switch
// FacebookPagePostV220               httpRequest                [creds]
// FacebookSingleImageUrl             httpRequest                [creds]
// FbSeparateUrls                     code
// FbUploadUrlHidden                  httpRequest                [creds]
// FbBuildMediaArray                  code
// FbPublishMultipleImages            httpRequest                [creds]
// AgruparDatosImgbb                  code
// RouterInstagram                    switch
// IgCrearSingle                      facebookGraphApi           [creds]
// SepararParaCarrusel                code
// IgCrearItem                        facebookGraphApi           [creds]
// AgruparIds                         code
// IgCrearContenedor                  facebookGraphApi           [creds]
// EsperarProcesamiento               wait
// PublicarEnInstagram                facebookGraphApi           [creds]
// WebhookPublishPost                 webhook
// GuardarEnBaseDeDatos               postgres                   [creds]
// MergeWebhookWithDb                 code
//
// ROUTING MAP
// ──────────────────────────────────────────────────────────────────
// WebhookPublishPost
//    → SepararBinarios
//      → CheckIfImageExists
//        → GenerarUrlImgbb
//          → MergeImgbbResponse
//            → PrepareDbData
//              → GuardarEnBaseDeDatos
//                → MergeWebhookWithDb
//                  → CheckLinkedin
//                    → PrepUrlLi
//                      → LinkedinContentType
//                        → TextPostLinkedin
//                       .out(1) → SingleImagePostLinkedin
//                       .out(2) → SeparateImagesLi
//                          → RegisterLoad
//                            → Uploadimage
//                              → CodeInJavascript
//                                → MultipleImagePostLinkedin
//                  → CheckFacebook
//                    → PrepUrlFb
//                      → FacebookContentType
//                        → FacebookPagePostV220
//                       .out(1) → FacebookSingleImageUrl
//                       .out(2) → FbSeparateUrls
//                          → FbUploadUrlHidden
//                            → FbBuildMediaArray
//                              → FbPublishMultipleImages
//                  → CheckInstagram
//                    → AgruparDatosImgbb
//                      → RouterInstagram
//                        → IgCrearSingle
//                          → EsperarProcesamiento
//                            → PublicarEnInstagram
//                       .out(1) → SepararParaCarrusel
//                          → IgCrearItem
//                            → AgruparIds
//                              → IgCrearContenedor
//                                → EsperarProcesamiento (↩ loop)
//       .out(1) → PrepareDbData (↩ loop)
//    → RespondToWebhookPublish
// </workflow-map>

// =====================================================================
// METADATA DU WORKFLOW
// =====================================================================

@workflow({
    id: 'er4g5m0pGfwHPXbB',
    name: 'All_implementation',
    active: true,
    settings: {
        executionOrder: 'v1',
        timeSavedMode: 'fixed',
        callerPolicy: 'workflowsFromSameOwner',
        availableInMCP: false,
    },
})
export class AllImplementationWorkflow {
    // =====================================================================
    // CONFIGURATION DES NOEUDS
    // =====================================================================

    @node({
        name: 'Respond to Webhook - Publish',
        type: 'n8n-nodes-base.respondToWebhook',
        version: 1.1,
        position: [-51040, 30800],
    })
    RespondToWebhookPublish = {
        respondWith: 'json',
        responseBody: '={{ { "success": true, "message": "Post published successfully" } }}',
        options: {},
    };

    @node({
        name: 'Separar Binarios',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-51040, 30608],
    })
    SepararBinarios = {
        jsCode: "// Prepara imágenes para ImgBB\n// Soporta tanto binarios nativos de n8n como base64 desde JSON (una o múltiples)\nconst items = $input.all();\nconst newItems = [];\n\nconsole.log('==== SEPARAR BINARIOS START ====');\nconsole.log('SEPARAR BINARIOS - Total items recibidos:', items.length);\n\nfor (const item of items) {\n  console.log('\\n--- SEPARAR BINARIOS - Procesando item ---');\n  console.log('SEPARAR BINARIOS - Item.json keys:', Object.keys(item.json));\n  console.log('SEPARAR BINARIOS - Tiene binary?:', !!item.binary);\n  if (item.binary) {\n    console.log('SEPARAR BINARIOS - Binary keys:', Object.keys(item.binary));\n  }\n  \n  // IMPORTANTE: Si body es un string JSON, parsearlo\n  let webhookData = {};\n  let parsedData = {};\n  \n  if (item.json.body && typeof item.json.body === 'string') {\n    try {\n      parsedData = JSON.parse(item.json.body);\n      console.log('SEPARAR BINARIOS - Body parseado:', JSON.stringify(parsedData));\n      webhookData = parsedData;\n    } catch (e) {\n      console.log('SEPARAR BINARIOS - Error parseando body:', e.message);\n      webhookData = item.json;\n    }\n  } else {\n    webhookData = item.json;\n  }\n  \n  console.log('SEPARAR BINARIOS - webhookData final:', JSON.stringify(webhookData));\n  \n  // Caso 1: Ya tiene binarios (desde n8n)\n  const binaryData = item.binary;\n  if (binaryData) {\n    for (const key of Object.keys(binaryData)) {\n      if (key.startsWith('Image') || key === 'data') {\n        const resultItem = {\n          json: webhookData,\n          binary: {\n            data: binaryData[key]\n          }\n        };\n        console.log('SEPARAR BINARIOS - Retornando con binario:', JSON.stringify(resultItem.json));\n        newItems.push(resultItem);\n      }\n    }\n    continue;\n  }\n\n  // Caso 2: Múltiples imágenes (Images array)\n  const imagesArray = webhookData.Images;\n  if (imagesArray && Array.isArray(imagesArray) && imagesArray.length > 0) {\n    console.log('SEPARAR BINARIOS - Formato detectado: Images array con', imagesArray.length, 'imágenes');\n    \n    for (let i = 0; i < imagesArray.length; i++) {\n      const imageData = imagesArray[i];\n      try {\n        const base64Data = imageData.data.split(',')[1] || imageData.data;\n        const buffer = Buffer.from(base64Data, 'base64');\n        \n        newItems.push({\n          json: webhookData,\n          binary: {\n            data: {\n              data: buffer.toString('base64'),\n              mimeType: imageData.mimeType || 'image/png',\n              fileName: imageData.fileName || `image_${i}.png`,\n              fileExtension: (imageData.fileName || 'image.png').split('.').pop()\n            }\n          }\n        });\n        console.log('SEPARAR BINARIOS - Imagen', i + 1, 'procesada exitosamente');\n        console.log('SEPARAR BINARIOS - Binary data length:', buffer.length);\n      } catch (error) {\n        console.log('SEPARAR BINARIOS - ERROR procesando imagen', i, ':', error.message);\n        console.log('SEPARAR BINARIOS - imageData:', JSON.stringify(imageData));\n        // NO agregar items sin binario - dejar que falle para detectar el problema\n      }\n    }\n    console.log('SEPARAR BINARIOS - Images array completado. Items creados:', newItems.length);\n    continue;\n  }\n\n  // Caso 3: Una sola imagen (Image objeto)\n  const imageData = webhookData.Image;\n  let hasImage = false;\n  let imageToProcess = null;\n  \n  // Formato 1: Image.data (objeto con data)\n  if (imageData && imageData.data) {\n    console.log('SEPARAR BINARIOS - Formato detectado: Image.data');\n    hasImage = true;\n    imageToProcess = imageData;\n  }\n  // Formato 2: Image es directamente el string base64\n  else if (typeof imageData === 'string' && imageData.length > 100) {\n    console.log('SEPARAR BINARIOS - Formato detectado: Image como string base64');\n    hasImage = true;\n    imageToProcess = {\n      data: imageData,\n      mimeType: 'image/png',\n      fileName: 'image.png'\n    };\n  }\n  // Formato 3: Imagen en otro campo\n  else if (webhookData.image && typeof webhookData.image === 'string' && webhookData.image.length > 100) {\n    console.log('SEPARAR BINARIOS - Formato detectado: campo image (minúscula)');\n    hasImage = true;\n    imageToProcess = {\n      data: webhookData.image,\n      mimeType: 'image/png',\n      fileName: 'image.png'\n    };\n  }\n  \n  if (hasImage && imageToProcess) {\n    try {\n      const base64Data = imageToProcess.data.split(',')[1] || imageToProcess.data;\n      const buffer = Buffer.from(base64Data, 'base64');\n      \n      const resultItem = {\n        json: webhookData,\n        binary: {\n          data: {\n            data: buffer.toString('base64'),\n            mimeType: imageToProcess.mimeType || 'image/png',\n            fileName: imageToProcess.fileName || 'image.png',\n            fileExtension: (imageToProcess.fileName || 'image.png').split('.').pop()\n          }\n        }\n      };\n      console.log('SEPARAR BINARIOS - Retornando con imagen base64');\n      newItems.push(resultItem);\n    } catch (error) {\n      console.log('SEPARAR BINARIOS - Error procesando imagen:', error.message);\n      newItems.push({\n        json: webhookData\n      });\n    }\n  } else {\n    // Caso 4: No hay imagen\n    console.log('SEPARAR BINARIOS - Sin imagen, pasando datos originales');\n    newItems.push({\n      json: webhookData\n    });\n  }\n}\n\nif (newItems.length === 0 && items.length > 0) {\n  console.log('SEPARAR BINARIOS - WARNING: No hay items procesados, devolviendo originales');\n  return items;\n}\n\nconsole.log('==== SEPARAR BINARIOS END ====');\nconsole.log('SEPARAR BINARIOS - Total items devueltos:', newItems.length);\nfor (let i = 0; i < newItems.length; i++) {\n  console.log(`SEPARAR BINARIOS - Item ${i}: tiene binary.data =`, !!newItems[i].binary?.data);\n}\n\nreturn newItems;",
    };

    @node({
        name: 'Generar URL (ImgBB)',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.1,
        position: [-50592, 30544],
        credentials: { httpHeaderAuth: { id: 'zx6X4T7j4yDMYWKo', name: 'imgbb-api' } },
    })
    GenerarUrlImgbb = {
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
        name: 'Check if Image Exists',
        type: 'n8n-nodes-base.if',
        version: 2.2,
        position: [-50816, 30608],
    })
    CheckIfImageExists = {
        conditions: {
            options: {
                caseSensitive: true,
                leftValue: '',
                typeValidation: 'strict',
                version: 2,
            },
            conditions: [
                {
                    id: 'check-has-image-001',
                    leftValue: '={{ $binary.data !== undefined }}',
                    rightValue: true,
                    operator: {
                        type: 'boolean',
                        operation: 'true',
                        singleValue: true,
                    },
                },
            ],
            combinator: 'and',
        },
        options: {},
    };

    @node({
        name: 'Merge ImgBB Response',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-50368, 30544],
    })
    MergeImgbbResponse = {
        jsCode: "// AGRUPA TODOS LOS RESULTADOS DE IMGBB EN UN SOLO ITEM\nconst allItems = $input.all();\n\nconsole.log('==== AGGREGATE IMGBB START ====');\nconsole.log('AGGREGATE - Total items recibidos:', allItems.length);\n\n// OBTENER DATOS ORIGINALES DEL WEBHOOK desde 'Check if Image Exists'\nlet baseData = {};\nconst checkImageNode = $('Check if Image Exists');\nif (checkImageNode && checkImageNode.first) {\n  const firstCheckItem = checkImageNode.first();\n  if (firstCheckItem && firstCheckItem.json) {\n    baseData = { ...firstCheckItem.json };\n    console.log('AGGREGATE - Datos base desde Check if Image Exists');\n    console.log('AGGREGATE - post_type:', baseData.post_type);\n    console.log('AGGREGATE - publish_linkedin:', baseData.publish_linkedin);\n    console.log('AGGREGATE - publish_facebook:', baseData.publish_facebook);\n  }\n} else {\n  console.log('AGGREGATE - WARNING: No se pudo acceder a Check if Image Exists, usando primer item de ImgBB');\n  baseData = allItems[0]?.json || {};\n}\n\n// Crear array con todas las URLs de ImgBB\nconst imageArray = [];\nfor (const item of allItems) {\n  if (item.json.data && item.json.data.url) {\n    imageArray.push({\n      url: item.json.data.url,\n      display_url: item.json.data.display_url || item.json.data.url,\n      delete_url: item.json.data.delete_url,\n      filename: item.json.data.image?.filename || 'image.jpg',\n      type: item.json.data.image?.mime || 'image/jpeg'\n    });\n  }\n}\n\nconsole.log('AGGREGATE - Total imágenes en array:', imageArray.length);\n\n// Resultado: UN solo item con DATOS ORIGINALES DEL WEBHOOK + todas las imágenes\nconst result = {\n  ...baseData,\n  Image: imageArray,\n  image_count: imageArray.length\n};\n\nconsole.log('AGGREGATE - post_type en resultado:', result.post_type);\nconsole.log('AGGREGATE - Array final con', imageArray.length, 'URLs');\nconsole.log('==== AGGREGATE IMGBB END ====');\n\nreturn [{\n  json: result\n}];",
    };

    @node({
        name: 'Prepare DB Data',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-50144, 30608],
    })
    PrepareDbData = {
        jsCode: "// PREPARAR DATOS PARA GUARDAR EN BD\n// Este nodo convierte el array Image[] en un string JSON para el campo image_url\n\nconst item = $input.item.json;\n\nconsole.log('==== PREPARE DB DATA START ====');\nconsole.log('PREPARE DB - Input item.Image type:', Array.isArray(item.Image) ? 'array' : typeof item.Image);\nconsole.log('PREPARE DB - Input item.Image length:', Array.isArray(item.Image) ? item.Image.length : 'N/A');\n\nlet imageUrlString = null;\n\nif (item.Image) {\n  if (Array.isArray(item.Image)) {\n    // Es un array, extraer solo las URLs y convertir a JSON string\n    const urls = item.Image.map(img => img.url);\n    imageUrlString = JSON.stringify(urls);\n    console.log('PREPARE DB - Created URL array:', imageUrlString);\n  } else if (typeof item.Image === 'object' && item.Image.url) {\n    // Es un solo objeto, convertir a array de un elemento\n    imageUrlString = JSON.stringify([item.Image.url]);\n    console.log('PREPARE DB - Created single URL array:', imageUrlString);\n  } else {\n    console.log('PREPARE DB - WARNING: Image tiene formato inesperado:', JSON.stringify(item.Image));\n  }\n} else {\n  console.log('PREPARE DB - No Image field found, image_url will be null');\n}\n\n// Crear resultado con todos los campos del input + image_url_string preparado\nconst result = {\n  ...item,\n  image_url_string: imageUrlString\n};\n\nconsole.log('PREPARE DB - Final image_url_string:', imageUrlString);\nconsole.log('==== PREPARE DB DATA END ====');\n\nreturn [{json: result}];",
    };

    @node({
        name: 'Check LinkedIn',
        type: 'n8n-nodes-base.if',
        version: 2.2,
        position: [-49472, 30032],
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
        position: [-49472, 30608],
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
        name: 'Check Instagram',
        type: 'n8n-nodes-base.if',
        version: 2.2,
        position: [-49472, 30992],
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
        name: 'Prep URL LI',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-49248, 30032],
    })
    PrepUrlLi = {
        jsCode: "// PREPARA LINKEDIN: Descarga imágenes desde URLs de ImgBB (optimizado para Cloud)\nconst currentItem = $input.first();\nconst baseJson = currentItem.json;\n\nconsole.log('==== PREP LI START ====');\nconsole.log('PREP LI - Image array LENGTH:', baseJson.Image ? baseJson.Image.length : 0);\n\n// Función para descargar una imagen (sin reintentos para evitar timeout)\nasync function downloadImage(url, timeoutMs = 30000) {\n  console.log('PREP LI - Descargando:', url);\n  const response = await this.helpers.request({\n    method: 'GET',\n    uri: url,\n    encoding: null,\n    resolveWithFullResponse: false,\n    timeout: timeoutMs\n  });\n  return response;\n}\n\n// Descargar imágenes desde URLs de ImgBB\nif (baseJson.Image && Array.isArray(baseJson.Image) && baseJson.Image.length > 0) {\n  console.log('PREP LI - Descargando', baseJson.Image.length, 'imágenes...');\n  \n  const binaryData = {};\n  const downloadedCount = [];\n  const successfulImages = [];\n  \n  // Limitar a máximo 5 imágenes para evitar timeout\n  const maxImages = Math.min(baseJson.Image.length, 5);\n  \n  for (let i = 0; i < maxImages; i++) {\n    const imgData = baseJson.Image[i];\n    if (!imgData.url) {\n      console.log('PREP LI - ERROR: Imagen', i, 'no tiene URL');\n      continue;\n    }\n    \n    try {\n      const response = await downloadImage.call(this, imgData.url);\n      \n      if (!response || response.length === 0) {\n        console.log('PREP LI - ERROR: Respuesta vacía para imagen', i);\n        continue;\n      }\n      \n      const keyName = downloadedCount.length === 0 ? 'Image' : `Image${downloadedCount.length}`;\n      binaryData[keyName] = {\n        data: Buffer.from(response).toString('base64'),\n        mimeType: imgData.type || 'image/png',\n        fileName: imgData.filename || `image_${i}.png`,\n        fileExtension: (imgData.filename || 'image.png').split('.').pop()\n      };\n      \n      downloadedCount.push(keyName);\n      successfulImages.push(imgData);\n      console.log('PREP LI - OK:', keyName, Math.round(response.length / 1024), 'KB');\n    } catch (error) {\n      console.log('PREP LI - ERROR imagen', i, ':', error.message);\n    }\n  }\n  \n  if (downloadedCount.length > 0) {\n    baseJson.Image = successfulImages;\n    console.log('PREP LI - Total descargadas:', downloadedCount.length);\n    console.log('==== PREP LI END (OK) ====');\n    return [{\n      json: baseJson,\n      binary: binaryData\n    }];\n  } else {\n    console.log('PREP LI - No se pudo descargar ninguna imagen');\n    baseJson.Image = [];\n  }\n}\n\nconsole.log('PREP LI - Sin imágenes - post de texto');\nconsole.log('==== PREP LI END ====');\nreturn [{ json: baseJson }];",
    };

    @node({
        name: 'LinkedIn Content Type',
        type: 'n8n-nodes-base.switch',
        version: 3.3,
        position: [-49024, 30016],
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
                                leftValue: '={{ $json.Image && Array.isArray($json.Image) ? $json.Image.length : 0 }}',
                                rightValue: 0,
                                operator: {
                                    type: 'number',
                                    operation: 'equals',
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
                                leftValue: '={{ $json.Image && Array.isArray($json.Image) ? $json.Image.length : 0 }}',
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
                                leftValue: '={{ $json.Image && Array.isArray($json.Image) ? $json.Image.length : 0 }}',
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
        name: 'Text Post Linkedin',
        type: 'n8n-nodes-base.linkedIn',
        version: 1,
        position: [-48800, 29840],
        credentials: { linkedInCommunityManagementOAuth2Api: { id: 'EM6TxDAmqBcNfWEy', name: 'n8n-post-msi' } },
    })
    TextPostLinkedin = {
        authentication: 'communityManagement',
        postAs: 'organization',
        organization: '105834790',
        text: '={{ $json.post_type }}',
        additionalFields: {},
    };

    @node({
        name: 'Single Image Post Linkedin',
        type: 'n8n-nodes-base.linkedIn',
        version: 1,
        position: [-48800, 30032],
        credentials: { linkedInCommunityManagementOAuth2Api: { id: 'EM6TxDAmqBcNfWEy', name: 'n8n-post-msi' } },
    })
    SingleImagePostLinkedin = {
        authentication: 'communityManagement',
        postAs: 'organization',
        organization: '105834790',
        text: '={{ $json.post_type }}',
        shareMediaCategory: 'IMAGE',
        binaryPropertyName: 'Image',
        additionalFields: {},
    };

    @node({
        name: 'Separate Images LI',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-48800, 30224],
    })
    SeparateImagesLi = {
        jsCode: "// SEPARA MÚLTIPLES IMÁGENES PARA LINKEDIN\nconst allItems = $input.all();\nconst newItems = [];\n\nconsole.log('==== SEPARATE IMAGES LI START ====');\nconsole.log('SEPARATE LI - Total items recibidos:', allItems.length);\n\n// DEBUG: Ver qué binarios vienen en el primer item\nif (allItems.length > 0 && allItems[0].binary) {\n  console.log('SEPARATE LI - Binary keys en item 0:', Object.keys(allItems[0].binary));\n  console.log('SEPARATE LI - Image array en json:', allItems[0].json.Image ? allItems[0].json.Image.length : 0);\n}\n\n// Obtener binarios del item actual (vienen de Prep URL LI)\nfor (let idx = 0; idx < allItems.length; idx++) {\n  const item = allItems[idx];\n  console.log(`\\nSEPARATE LI - Item ${idx}:`);\n  console.log('SEPARATE LI - Tiene binary?:', !!item.binary);\n  \n  const binaryData = item.binary;\n  \n  if (!binaryData) {\n    console.log('SEPARATE LI - ERROR: No hay binarios en el item');\n    console.log('SEPARATE LI - item.json keys:', Object.keys(item.json));\n    continue;\n  }\n  \n  console.log('SEPARATE LI - Binary keys:', Object.keys(binaryData));\n\n  // Recorrer todas las llaves del objeto binario (Image, Image1, Image2, etc.)\n  for (const key of Object.keys(binaryData)) {\n    if (key.startsWith('Image') || key === 'data') {\n      const newItem = {\n        json: {\n          ...item.json,\n          filename: binaryData[key].fileName,\n          mimetype: binaryData[key].mimeType\n        },\n        binary: {\n          data: binaryData[key]\n        }\n      };\n      newItems.push(newItem);\n      console.log('SEPARATE LI - Binario separado:', key, '- tiene data?:', !!newItem.binary.data);\n    }\n  }\n}\n\nconsole.log('\\nSEPARATE LI - Total items devueltos:', newItems.length);\nfor (let i = 0; i < newItems.length; i++) {\n  console.log(`SEPARATE LI - Output item ${i}: tiene binary.data =`, !!newItems[i].binary?.data);\n}\nconsole.log('==== SEPARATE IMAGES LI END ====');\nreturn newItems;",
    };

    @node({
        name: 'Register Load',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.3,
        position: [-48576, 30224],
        credentials: { linkedInCommunityManagementOAuth2Api: { id: 'EM6TxDAmqBcNfWEy', name: 'n8n-post-msi' } },
        onError: 'continueRegularOutput',
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
        position: [-48352, 30224],
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
        inputDataFieldName: "={{ $('Separate Images LI').item.binary.data }}",
        options: {},
    };

    @node({
        name: 'Code in JavaScript',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-48128, 30224],
    })
    CodeInJavascript = {
        jsCode: '// Obtenemos todos los ítems del nodo de registro\nconst itemsRegistro = $(\'Register Load\').all();\n\nconst mediaItems = [];\n\n// Recorremos cada respuesta de LinkedIn\nfor (const item of itemsRegistro) {\n    // Obtenemos el URN (el identificador de la imagen)\n    const urn = item.json.value.image;\n    \n    if (urn) {\n        // CORRECCIÓN: LinkedIn exige que la llave se llame "id", no "media"\n        mediaItems.push({\n            "id": urn\n        });\n    }\n}\n\n// Recuperamos el post_type del nodo Merge Webhook with DB\nconst postText = $(\'Merge Webhook with DB\').first().json.post_type;\n\n// Devolvemos la lista limpia y correcta CON el post_type\nreturn [{\n    json: {\n        contentEntities: mediaItems,\n        post_type: postText\n    }\n}];',
    };

    @node({
        name: 'Multiple Image Post LinkedIn',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.3,
        position: [-47904, 30224],
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
            '={{ {\n  "author": "urn:li:organization:105834790",\n  "commentary": $json.post_type,\n  "visibility": "PUBLIC",\n  "distribution": {\n    "feedDistribution": "MAIN_FEED",\n    "targetEntities": [],\n    "thirdPartyDistributionChannels": []\n  },\n  "content": {\n    "multiImage": {\n      "images": $json.contentEntities\n    }\n  },\n  "lifecycleState": "PUBLISHED",\n  "isReshareDisabledByAuthor": false\n} }}',
        options: {},
    };

    @node({
        name: 'Prep URL FB',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-49248, 30608],
    })
    PrepUrlFb = {
        jsCode: "// PREPARA FB: Asegura que Image array esté disponible\nconst currentItem = $input.first();\nconst baseJson = currentItem.json;\n\nconsole.log('==== PREP FB START ====');\nconsole.log('PREP FB - RECIBIENDO DATOS');\nconsole.log('PREP FB - baseJson.Image exists:', !!baseJson.Image);\nconsole.log('PREP FB - baseJson.Image is array:', Array.isArray(baseJson.Image));\nconsole.log('PREP FB - Image array LENGTH:', baseJson.Image ? baseJson.Image.length : 'UNDEFINED');\nif (baseJson.Image && Array.isArray(baseJson.Image)) {\n  console.log('PREP FB - Image URLs:', baseJson.Image.map(img => img.url));\n}\nconsole.log('PREP FB - image_url de BD:', baseJson.image_url);\n\n// Si ya tiene Image array (desde Merge Webhook with DB), usarlo\nif (baseJson.Image && Array.isArray(baseJson.Image) && baseJson.Image.length > 0) {\n  console.log('PREP FB - Usando Image array existente:', baseJson.Image.length);\n  console.log('PREP FB - ROUTER EVALUARÁ:', baseJson.Image && Array.isArray(baseJson.Image) ? baseJson.Image.length : 0);\n  console.log('==== PREP FB END (con Image[]) ====');\n  return [{\n    json: baseJson\n  }];\n}\n\n// Si no tiene Image array pero tiene image_url, crearlo\nif (baseJson.image_url) {\n  console.log('PREP FB - Creando Image array desde image_url');\n  baseJson.Image = [{\n    url: baseJson.image_url,\n    filename: 'fb_image.jpg'\n  }];\n  console.log('==== PREP FB END (creado desde URL) ====');\n  return [{\n    json: baseJson\n  }];\n}\n\nconsole.log('PREP FB - No hay imágenes');\nconsole.log('==== PREP FB END (texto) ====');\nreturn [{\n  json: baseJson\n}];",
    };

    @node({
        name: 'Facebook Content Type',
        type: 'n8n-nodes-base.switch',
        version: 3.3,
        position: [-49024, 30592],
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
                                leftValue: '={{ $json.Image && Array.isArray($json.Image) ? $json.Image.length : 0 }}',
                                rightValue: 0,
                                operator: {
                                    type: 'number',
                                    operation: 'equals',
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
                                leftValue: '={{ $json.Image && Array.isArray($json.Image) ? $json.Image.length : 0 }}',
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
                                leftValue: '={{ $json.Image && Array.isArray($json.Image) ? $json.Image.length : 0 }}',
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
        name: 'Facebook Page Post (v22.0)',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.2,
        position: [-48800, 30416],
        credentials: { httpHeaderAuth: { id: 'wbVTQWbgdpOAG6rR', name: 'facebook-msi' } },
    })
    FacebookPagePostV220 = {
        method: 'POST',
        url: 'https://graph.facebook.com/v22.0/438514339355830/feed',
        authentication: 'genericCredentialType',
        genericAuthType: 'httpHeaderAuth',
        sendBody: true,
        specifyBody: 'json',
        jsonBody: '={\n   "message": "{{ $json.post_type }}"\n}',
        options: {
            response: {
                response: {
                    responseFormat: 'json',
                },
            },
        },
    };

    @node({
        name: 'Facebook Single Image (URL)',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.2,
        position: [-48800, 30608],
        credentials: { httpHeaderAuth: { id: 'wbVTQWbgdpOAG6rR', name: 'facebook-msi' } },
    })
    FacebookSingleImageUrl = {
        method: 'POST',
        url: 'https://graph.facebook.com/v24.0/438514339355830/photos',
        authentication: 'genericCredentialType',
        genericAuthType: 'httpHeaderAuth',
        sendBody: true,
        contentType: 'multipart-form-data',
        bodyParameters: {
            parameters: [
                {
                    name: 'url',
                    value: '={{ $json.Image[0].url }}',
                },
                {
                    name: 'message',
                    value: '={{ $json.post_type }}',
                },
            ],
        },
        options: {},
    };

    @node({
        name: 'FB Separate URLs',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-48800, 30800],
    })
    FbSeparateUrls = {
        jsCode: '// SEPARA ITEMS PARA FB MULTIPLE (usando URLs)\nconst items = $input.all();\nconst imageArray = items[0].json.Image;\nconst newItems = [];\n\nfor (const img of imageArray) {\n   newItems.push({\n     json: {\n       ...items[0].json,\n       url_to_upload: img.url\n     }\n   });\n}\n\nreturn newItems;',
    };

    @node({
        name: 'FB Upload URL (Hidden)',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.2,
        position: [-48576, 30800],
        credentials: { httpHeaderAuth: { id: 'wbVTQWbgdpOAG6rR', name: 'facebook-msi' } },
    })
    FbUploadUrlHidden = {
        method: 'POST',
        url: 'https://graph.facebook.com/v23.0/438514339355830/photos',
        authentication: 'genericCredentialType',
        genericAuthType: 'httpHeaderAuth',
        sendBody: true,
        contentType: 'multipart-form-data',
        bodyParameters: {
            parameters: [
                {
                    name: 'url',
                    value: '={{ $json.url_to_upload }}',
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
        position: [-48352, 30800],
    })
    FbBuildMediaArray = {
        jsCode: 'const itemsUploaded = $(\'FB Upload URL (Hidden)\').all();\n\n// Obtener post_type del primer item de FB Upload URL (Hidden)\n// que debería tener los datos parseados\nconst originalPost = itemsUploaded[0]?.json?.post_type || $input.first().json.post_type;\n\nconst mediaItems = [];\n\n// Recolectamos los IDs que nos devolvió Facebook\nfor (const item of itemsUploaded) {\n    const mediaId = item.json.id;\n    if (mediaId) {\n        mediaItems.push({\n            "media_fbid": mediaId\n        });\n    }\n}\n\nreturn [{\n    json: {\n        attached_media: mediaItems,\n        post_type: originalPost\n    }\n}];',
    };

    @node({
        name: 'FB Publish Multiple Images',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.2,
        position: [-48128, 30800],
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
        name: 'Agrupar Datos ImgBB',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-49248, 30992],
    })
    AgruparDatosImgbb = {
        jsCode: "// Extrae las URLs del array Image[] para Instagram\nconst items = $input.all();\nconst firstItem = items[0]?.json || {};\n\n// Recuperamos el caption\nconst caption = firstItem.post_type || '';\n\n// Extraemos las URLs del array Image[]\nconst images = [];\nif (firstItem.Image && Array.isArray(firstItem.Image)) {\n  for (const img of firstItem.Image) {\n    if (img.url) {\n      images.push(img.url);\n    }\n  }\n}\n\nconsole.log('AGRUPAR IMGBB - Total imágenes:', images.length);\n\n// Devolvemos UN solo ítem con la lista y el conteo\nreturn [{\n  json: {\n    images_list: images,\n    total_count: images.length,\n    caption: caption\n  }\n}];",
    };

    @node({
        name: 'Router Instagram',
        type: 'n8n-nodes-base.switch',
        version: 3.3,
        position: [-49024, 30992],
    })
    RouterInstagram = {
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
                                id: 'single',
                                leftValue: '={{ $json.total_count }}',
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
                    outputKey: 'Single Post',
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
                                id: 'carousel',
                                leftValue: '={{ $json.total_count }}',
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
                    outputKey: 'Carousel Post',
                },
            ],
        },
        options: {},
    };

    @node({
        name: 'IG Crear (Single)',
        type: 'n8n-nodes-base.facebookGraphApi',
        version: 1,
        position: [-48128, 30992],
        credentials: { facebookGraphApi: { id: 'mbuwwxCuX4JRWLJB', name: 'Instagram' } },
    })
    IgCrearSingle = {
        httpRequestMethod: 'POST',
        graphApiVersion: 'v23.0',
        node: '17841471028584724',
        edge: 'media',
        options: {
            queryParameters: {
                parameter: [
                    {
                        name: 'image_url',
                        value: '={{ $json.images_list[0] }}',
                    },
                    {
                        name: 'caption',
                        value: '={{ $json.caption }}',
                    },
                ],
            },
        },
    };

    @node({
        name: 'Separar para Carrusel',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-48800, 31184],
    })
    SepararParaCarrusel = {
        jsCode: '// Separamos la lista de nuevo para crear los ítems del carrusel uno por uno\nconst images = $input.first().json.images_list;\nconst caption = $input.first().json.caption;\n\nreturn images.map(url => ({\n  json: {\n    url: url,\n    parent_caption: caption\n  }\n}));',
    };

    @node({
        name: 'IG Crear Item',
        type: 'n8n-nodes-base.facebookGraphApi',
        version: 1,
        position: [-48576, 31184],
        credentials: { facebookGraphApi: { id: 'mbuwwxCuX4JRWLJB', name: 'Instagram' } },
    })
    IgCrearItem = {
        httpRequestMethod: 'POST',
        graphApiVersion: 'v23.0',
        node: '17841471028584724',
        edge: 'media',
        options: {
            queryParameters: {
                parameter: [
                    {
                        name: 'image_url',
                        value: '={{ $json.url }}',
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
        name: 'Agrupar IDs',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-48352, 31184],
    })
    AgruparIds = {
        jsCode: "// Agrupamos los IDs generados para crear el contenedor padre\nconst items = $input.all();\nconst ids = items.map(i => i.json.id);\n// El caption viene arrastrado del nodo anterior\nconst caption = items[0].json.parent_caption || items[0].json.caption || '';\n\nreturn [{\n  json: {\n    children_ids: ids,\n    caption: caption\n  }\n}];",
    };

    @node({
        name: 'IG Crear Contenedor',
        type: 'n8n-nodes-base.facebookGraphApi',
        version: 1,
        position: [-48128, 31184],
        credentials: { facebookGraphApi: { id: 'mbuwwxCuX4JRWLJB', name: 'Instagram' } },
    })
    IgCrearContenedor = {
        httpRequestMethod: 'POST',
        graphApiVersion: 'v23.0',
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
                        value: "={{ $json.children_ids.join(',') }}",
                    },
                    {
                        name: 'caption',
                        value: '={{ $json.caption }}',
                    },
                ],
            },
        },
    };

    @node({
        name: 'Esperar Procesamiento',
        type: 'n8n-nodes-base.wait',
        version: 1.1,
        position: [-47904, 30992],
    })
    EsperarProcesamiento = {
        amount: 10,
    };

    @node({
        name: 'Publicar en Instagram',
        type: 'n8n-nodes-base.facebookGraphApi',
        version: 1,
        position: [-47680, 30992],
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
        name: 'Webhook - Publish Post',
        type: 'n8n-nodes-base.webhook',
        version: 2,
        position: [-51264, 30704],
    })
    WebhookPublishPost = {
        httpMethod: 'POST',
        path: '025d6de3-6b46-41c2-839d-58a8b18b649f',
        responseMode: 'responseNode',
        options: {},
    };

    @node({
        name: 'Guardar en Base de Datos',
        type: 'n8n-nodes-base.postgres',
        version: 2.5,
        position: [-49920, 30608],
        credentials: { postgres: { id: 'WnTYs2zvPoE7hDJE', name: 'Postgres account' } },
    })
    GuardarEnBaseDeDatos = {
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
                post_type: '={{ $json.post_type }}',
                image_url: '={{ $json.image_url_string }}',
                status: "={{ $json.Image ? 'completed' : 'pending' }}",
                publish_linkedin: "={{ $json.publish_linkedin || 'No' }}",
                publish_facebook: "={{ $json.publish_facebook || 'No' }}",
                publish_instagram: "={{ $json.publish_instagram || 'No' }}",
            },
            matchingColumns: [],
            schema: [
                {
                    id: 'post_type',
                    displayName: 'post_type',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: false,
                },
                {
                    id: 'image_url',
                    displayName: 'image_url',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: false,
                },
                {
                    id: 'status',
                    displayName: 'status',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: false,
                },
            ],
            attemptToConvertTypes: false,
            convertFieldsToString: false,
        },
        options: {},
    };

    @node({
        name: 'Merge Webhook with DB',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-49696, 30608],
    })
    MergeWebhookWithDb = {
        jsCode: "// Combinar datos del webhook con la respuesta de la BD\n// ESTE NODO PRESERVA EL ARRAY Image[] DESDE Merge ImgBB Response\nconst dbResponse = $input.item.json;\n\nconsole.log('==== MERGE DB START ====');\n\n// Obtener datos COMPLETOS desde Merge ImgBB Response (que ya tiene Image[] agregado)\nconst mergeImgBBNode = $('Merge ImgBB Response');\nlet webhookData = {};\nlet imageArray = [];\n\nif (mergeImgBBNode && mergeImgBBNode.item && mergeImgBBNode.item.json) {\n  // Tomar TODOS los datos de Merge ImgBB Response (que ya tiene Image[] completo)\n  webhookData = { ...mergeImgBBNode.item.json };\n  imageArray = webhookData.Image || [];\n  console.log('MERGE DB - Datos desde Merge ImgBB Response');\n  console.log('MERGE DB - Image array recibido:', Array.isArray(imageArray) ? imageArray.length : 0);\n  if (Array.isArray(imageArray) && imageArray.length > 0) {\n    console.log('MERGE DB - Image[0].url:', imageArray[0].url);\n    if (imageArray.length > 1) {\n      console.log('MERGE DB - Image[1].url:', imageArray[1].url);\n    }\n  }\n} else {\n  console.log('MERGE DB - ERROR: No se encontró Merge ImgBB Response');\n  const checkImageNode = $('Check if Image Exists');\n  if (checkImageNode && checkImageNode.item) {\n    webhookData = checkImageNode.item.json;\n  }\n}\n\n// Validar que el array esté presente\nif (!Array.isArray(imageArray)) {\n  imageArray = [];\n  console.log('MERGE DB - WARNING: Image no es array, inicializando vacío');\n}\n\n// Resultado final - mantener Image[] exactamente como viene de Merge ImgBB Response\nconst result = {\n  ...webhookData,\n  db_record: dbResponse,\n  image_url: dbResponse.image_url,\n  // NO sobrescribir Image[], mantener el array completo de Merge ImgBB Response\n  Image: imageArray\n};\n\nconsole.log('MERGE DB - Image array FINAL LENGTH:', result.Image ? result.Image.length : 0);\nconsole.log('MERGE DB - result.Image content:', JSON.stringify(result.Image));\nconsole.log('==== MERGE DB END ====');\n\nreturn [{\n  json: result\n}];",
    };

    // =====================================================================
    // ROUTAGE ET CONNEXIONS
    // =====================================================================

    @links()
    defineRouting() {
        this.SepararBinarios.out(0).to(this.CheckIfImageExists.in(0));
        this.CheckIfImageExists.out(0).to(this.GenerarUrlImgbb.in(0));
        this.CheckIfImageExists.out(1).to(this.PrepareDbData.in(0));
        this.GenerarUrlImgbb.out(0).to(this.MergeImgbbResponse.in(0));
        this.MergeImgbbResponse.out(0).to(this.PrepareDbData.in(0));
        this.PrepareDbData.out(0).to(this.GuardarEnBaseDeDatos.in(0));
        this.CheckLinkedin.out(0).to(this.PrepUrlLi.in(0));
        this.CheckFacebook.out(0).to(this.PrepUrlFb.in(0));
        this.CheckInstagram.out(0).to(this.AgruparDatosImgbb.in(0));
        this.PrepUrlLi.out(0).to(this.LinkedinContentType.in(0));
        this.LinkedinContentType.out(0).to(this.TextPostLinkedin.in(0));
        this.LinkedinContentType.out(1).to(this.SingleImagePostLinkedin.in(0));
        this.LinkedinContentType.out(2).to(this.SeparateImagesLi.in(0));
        this.SeparateImagesLi.out(0).to(this.RegisterLoad.in(0));
        this.RegisterLoad.out(0).to(this.Uploadimage.in(0));
        this.Uploadimage.out(0).to(this.CodeInJavascript.in(0));
        this.CodeInJavascript.out(0).to(this.MultipleImagePostLinkedin.in(0));
        this.PrepUrlFb.out(0).to(this.FacebookContentType.in(0));
        this.FacebookContentType.out(0).to(this.FacebookPagePostV220.in(0));
        this.FacebookContentType.out(1).to(this.FacebookSingleImageUrl.in(0));
        this.FacebookContentType.out(2).to(this.FbSeparateUrls.in(0));
        this.FbSeparateUrls.out(0).to(this.FbUploadUrlHidden.in(0));
        this.FbUploadUrlHidden.out(0).to(this.FbBuildMediaArray.in(0));
        this.FbBuildMediaArray.out(0).to(this.FbPublishMultipleImages.in(0));
        this.AgruparDatosImgbb.out(0).to(this.RouterInstagram.in(0));
        this.RouterInstagram.out(0).to(this.IgCrearSingle.in(0));
        this.RouterInstagram.out(1).to(this.SepararParaCarrusel.in(0));
        this.IgCrearSingle.out(0).to(this.EsperarProcesamiento.in(0));
        this.SepararParaCarrusel.out(0).to(this.IgCrearItem.in(0));
        this.IgCrearItem.out(0).to(this.AgruparIds.in(0));
        this.AgruparIds.out(0).to(this.IgCrearContenedor.in(0));
        this.IgCrearContenedor.out(0).to(this.EsperarProcesamiento.in(0));
        this.EsperarProcesamiento.out(0).to(this.PublicarEnInstagram.in(0));
        this.WebhookPublishPost.out(0).to(this.SepararBinarios.in(0));
        this.WebhookPublishPost.out(0).to(this.RespondToWebhookPublish.in(0));
        this.GuardarEnBaseDeDatos.out(0).to(this.MergeWebhookWithDb.in(0));
        this.MergeWebhookWithDb.out(0).to(this.CheckLinkedin.in(0));
        this.MergeWebhookWithDb.out(0).to(this.CheckFacebook.in(0));
        this.MergeWebhookWithDb.out(0).to(this.CheckInstagram.in(0));
    }
}
