import { workflow, node, links } from '@n8n-as-code/transformer';

// <workflow-map>
// Workflow : MSI Voice Swap - ElevenLabs (GCS)
// Nodes   : 14  |  Connections: 14
//
// NODE INDEX
// ──────────────────────────────────────────────────────────────────
// Property name                    Node type (short)         Flags
// WebhookVoiceSwap                   webhook
// ValidateInput                      code
// SignVideoUrl                       code
// ExtractAudioReplicate              httpRequest
// WaitExtractAudio                   wait
// GetAudioStatus                     httpRequest
// AudioReady                         if
// WaitRetry                          wait
// DownloadAudio                      httpRequest
// ElevenlabsSpeechToSpeech           httpRequest
// UploadAudioToGcsSign               code
// CombineVideoNewAudio               httpRequest
// BuildResponse                      code
// RespondSuccess                     respondToWebhook
//
// ROUTING MAP
// ──────────────────────────────────────────────────────────────────
// WebhookVoiceSwap
//    → ValidateInput
//      → SignVideoUrl
//        → ExtractAudioReplicate
//          → WaitExtractAudio
//            → GetAudioStatus
//              → AudioReady
//                → DownloadAudio
//                  → ElevenlabsSpeechToSpeech
//                    → UploadAudioToGcsSign
//                      → CombineVideoNewAudio
//                        → BuildResponse
//                          → RespondSuccess
//               .out(1) → WaitRetry
//                  → GetAudioStatus (↩ loop)
// </workflow-map>

// =====================================================================
// METADATA DU WORKFLOW
// =====================================================================

@workflow({
    id: 'R3b2hgxItxffI7b9',
    name: 'MSI Voice Swap - ElevenLabs (GCS)',
    active: false,
    settings: { executionOrder: 'v1' },
})
export class MsiVoiceSwapElevenlabsGcsWorkflow {
    // =====================================================================
    // CONFIGURATION DES NOEUDS
    // =====================================================================

    @node({
        name: 'Webhook - Voice Swap',
        type: 'n8n-nodes-base.webhook',
        version: 2,
        position: [10032, -2120],
    })
    WebhookVoiceSwap = {
        httpMethod: 'POST',
        path: 'msi-voice-swap',
        responseMode: 'responseNode',
        options: {
            allowedOrigins: '*',
            rawBody: false,
        },
    };

    @node({
        name: 'Validate Input',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [10256, -2120],
    })
    ValidateInput = {
        jsCode: "const input = $input.item.json;\nlet data = input.body || input;\nif (typeof data === 'string') {\n  try { data = JSON.parse(data); } catch (e) { }\n}\n\nconst video_gcs_uri = data.video_gcs_uri || '';\nconst voice_id = data.voice_id || '';\nconst post_id = data.post_id || null;\nconst video_part = data.video_part || 'part1';\nconst model_id = data.model_id || 'eleven_english_sts_v2';\n\nif (!video_gcs_uri) throw new Error('video_gcs_uri is required (e.g. gs://msi-veo-videos/...)');\nif (!voice_id) throw new Error('voice_id is required (ElevenLabs voice ID)');\n\nreturn [{ json: { video_gcs_uri, voice_id, post_id, video_part, model_id } }];",
    };

    @node({
        name: 'Sign Video URL',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [10480, -2120],
    })
    SignVideoUrl = {
        jsCode: "// Sign the GCS URI so Replicate can download the video\nconst crypto = require('crypto');\nconst SA_EMAIL = 'vertex-express@gen-lang-client-0521438560.iam.gserviceaccount.com';\nconst SA_KEY = '-----BEGIN PRIVATE KEY-----\\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCc8VpJosYd8D0N\\nmFLmh1b7UOsHgm5ZZBvjSkPUhcFXXoEnOoouhWPD5hEl7ziA+3vWpbHLWb5sm0dv\\nqUhHJWwMMbE5eBxmR7m/Cacpy5ZiOVw+180aZqq6e1AsKlEzRvdz66FSgpCeYtmS\\n2nnc8fGwxfB06qpXsxLVQYnwnKzOlKOv9cfXC/29vrbXoPwez9lkVyySa11iGtYA\\nzMU2LjiPrxvcDTbhb1JYD/050fT/m3z2NgclsV6uCEQxNLXOJriJxNuSKhmZufis\\nsoO/rlj/V+RFTrHEQ8zn3nbm6/W2ZANZt94AOo31t5TR6Idt9PxgjodSHJYLEm+0\\nOXC6bAf3AgMBAAECggEASvGn81Ti9YX0qarNH5+OZkmASmA7EL3Q4Wtj07chmfab\\nhx+Zv9hbyT7yfmJrYZB11Qzfx6Lt35AQ/13fkXXp0DLklfRo32Ct7u+Nn1REVlhc\\n1/eWTl6rdYyQPt7gUrO3U+g3655EsBW1Hz7sBZmVmBwVlMdAm8t8GVEILVmr3aN1\\n5CzVUaLtk9UNQDApUfxgdD2kutWTjqM2j3jsgceST6p98dqV2U8HiOXonpMgt02+\\n3PqApJNu4HQhdMzYwX67vKLuqanlZllLlBp8TWvbP3Roo2p57pD8oamT0BKWDUcX\\nfwT19NJOXqRTim6oalvGklTuwhI9+EJJPlAwN7+rAQKBgQDc+sNzQC4Eph4we6g5\\nBQe5QGIchou/ey1vJ+UGbM8vy6bkuy9dPbDZ/XUZTPOYkTPHKvRu544DTIQzH0qJ\\nfG5NKUIYdOInJm8y+r0JybMrrKl0b04/Nrlueb4RjesASMSq3BTVMK5+6Mb4vx7y\\nLS3mYUc8TF+kBEEaw0H4Fwlu9wKBgQC10JcC0kbtCF/MmHwSq9w0PfgbHT3NoZH7\\nyOWeXPfRLybn+I4MMYW3y5KSL5RM3Gxtve2I/HjJPpprZSUJXfMgRLrVkFRV1iFp\\nA/v1vAxoMlYGk3Oh74rwmmMmU7hhPSNL5HxIDHdXVZb5jrOvqIIBcZ6n2qhaCVXH\\nmtjl3QbvAQKBgBxiUWyiV8bdF4+espLwZHeVH4UOezDTP5jBhRd4LnyzKfLDYGgX\\nnnnBpqLjUX7NV9tDVzZPo9wkne57HHXgd8KNhCHkEZB5zVq8/j8dm1gGy5VbHq/b\\n9aGNHa7fjcnxjuFrd3mS0TcX60bUNcNhrj2jTSUfokFNEpe/cN/PBbUtAoGAaSms\\nnyonciT83Gd6pIYZiXIqluxT+iOxP7SU9AOMJ8ehNl2zM+RVFtk9/yZcHhUE9nj7\\n8tctuiFmyiWnxYI9BXYbpzmjPj7r9kUisKFDf+VVktoo8QqQD9kM7ndQV5Y4W0Ze\\niIIFaVONTu22iyzpfZJNlYNJC0MJBbpQKKyuvQECgYEA2q4N8oL3VJwZAuyIVXOm\\ng9SH9dq4pRunQbXJpxaP2mklGNEbLV1YURVGA0oyQE5oh3/4s/LdMERUFkaYBBnl\\nyrcLRELtnjswAy3b2tEp4ULP/rx5MRY4qjNonUrzoXAs937zDIcyjO6/ekxE28sO\\nXk4daXQsjz4PY3lVvJcnKFA=\\n-----END PRIVATE KEY-----\\n';\n\nfunction signUrl(gsUri) {\n  const m = gsUri.match(/^gs:\\/\\/([^\\/]+)\\/(.+)$/);\n  if (!m) return gsUri;\n  const bucket = m[1], objPath = m[2], host = 'storage.googleapis.com';\n  const d = new Date();\n  const pad = v => String(v).padStart(2, '0');\n  const ds = d.getUTCFullYear() + '' + pad(d.getUTCMonth()+1) + pad(d.getUTCDate());\n  const dt = ds + 'T' + pad(d.getUTCHours()) + pad(d.getUTCMinutes()) + pad(d.getUTCSeconds()) + 'Z';\n  const scope = ds + '/auto/storage/goog4_request';\n  const cred = SA_EMAIL + '/' + scope;\n  const qs = 'X-Goog-Algorithm=GOOG4-RSA-SHA256&X-Goog-Credential=' + encodeURIComponent(cred) + '&X-Goog-Date=' + dt + '&X-Goog-Expires=604800&X-Goog-SignedHeaders=host';\n  const objEnc = objPath.split('/').map(p => encodeURIComponent(p)).join('/');\n  const canon = 'GET\\n/' + bucket + '/' + objEnc + '\\n' + qs + '\\nhost:' + host + '\\n\\nhost\\nUNSIGNED-PAYLOAD';\n  const sts = 'GOOG4-RSA-SHA256\\n' + dt + '\\n' + scope + '\\n' + crypto.createHash('sha256').update(canon).digest('hex');\n  const sg = crypto.createSign('RSA-SHA256');\n  sg.update(sts);\n  return 'https://' + host + '/' + bucket + '/' + objEnc + '?' + qs + '&X-Goog-Signature=' + sg.sign(SA_KEY, 'hex');\n}\n\nconst s = $input.item.json;\nconst video_signed_url = signUrl(s.video_gcs_uri);\n\nreturn [{ json: { video_signed_url, video_gcs_uri: s.video_gcs_uri, voice_id: s.voice_id, post_id: s.post_id, video_part: s.video_part, model_id: s.model_id } }];",
    };

    @node({
        name: 'Extract Audio (Replicate)',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.2,
        position: [10704, -2120],
    })
    ExtractAudioReplicate = {
        method: 'POST',
        url: 'https://api.replicate.com/v1/predictions',
        authentication: 'genericCredentialType',
        genericAuthType: 'httpHeaderAuth',
        sendBody: true,
        specifyBody: 'json',
        jsonBody:
            '={\n  "version": "19711d11c243800f08364ba9ae9078f54874f21363ba445dabdbf082b5d69565",\n  "input": {\n    "input_file": "{{ $json.video_signed_url }}",\n    "task": "extract_video_audio_as_mp3"\n  }\n}',
        options: {},
    };

    @node({
        name: 'Wait Extract Audio',
        type: 'n8n-nodes-base.wait',
        version: 1.1,
        position: [10928, -2120],
    })
    WaitExtractAudio = {
        amount: 45,
    };

    @node({
        name: 'Get Audio Status',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.2,
        position: [11152, -2120],
    })
    GetAudioStatus = {
        url: "={{ $('Extract Audio (Replicate)').item.json.urls.get }}",
        authentication: 'genericCredentialType',
        genericAuthType: 'httpHeaderAuth',
        options: {},
    };

    @node({
        name: 'Audio Ready?',
        type: 'n8n-nodes-base.if',
        version: 2.2,
        position: [11376, -2192],
    })
    AudioReady = {
        conditions: {
            options: {
                caseSensitive: true,
                leftValue: '',
                typeValidation: 'strict',
                version: 2,
            },
            conditions: [
                {
                    id: 'vs-cond-audio-ready',
                    leftValue: '={{ $json.output[0] }}',
                    rightValue: '',
                    operator: {
                        type: 'string',
                        operation: 'exists',
                        singleValue: true,
                    },
                },
            ],
            combinator: 'and',
        },
        options: {},
    };

    @node({
        name: 'Wait Retry',
        type: 'n8n-nodes-base.wait',
        version: 1.1,
        position: [11600, -2024],
    })
    WaitRetry = {
        amount: 30,
    };

    @node({
        name: 'Download Audio',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.2,
        position: [11600, -2240],
    })
    DownloadAudio = {
        url: "={{ $('Get Audio Status').item.json.output[0] }}",
        authentication: 'genericCredentialType',
        genericAuthType: 'httpHeaderAuth',
        options: {
            response: {
                response: {
                    responseFormat: 'file',
                },
            },
        },
    };

    @node({
        name: 'ElevenLabs Speech-to-Speech',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.2,
        position: [11824, -2240],
    })
    ElevenlabsSpeechToSpeech = {
        method: 'POST',
        url: "=https://api.elevenlabs.io/v1/speech-to-speech/{{ $('Validate Input').item.json.voice_id }}",
        authentication: 'genericCredentialType',
        genericAuthType: 'httpHeaderAuth',
        sendQuery: true,
        queryParameters: {
            parameters: [
                {
                    name: 'output_format',
                    value: 'mp3_44100_128',
                },
            ],
        },
        sendBody: true,
        contentType: 'multipart-form-data',
        bodyParameters: {
            parameters: [
                {
                    parameterType: 'formBinaryData',
                    name: 'audio',
                    inputDataFieldName: '=data',
                },
                {
                    name: 'model_id',
                    value: "={{ $('Validate Input').item.json.model_id }}",
                },
            ],
        },
        options: {
            response: {
                response: {
                    responseFormat: 'file',
                },
            },
        },
    };

    @node({
        name: 'Upload Audio to GCS + Sign',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [12048, -2240],
    })
    UploadAudioToGcsSign = {
        jsCode: "// Upload the ElevenLabs audio to GCS bucket and generate a signed URL\nconst crypto = require('crypto');\nconst SA_EMAIL = 'vertex-express@gen-lang-client-0521438560.iam.gserviceaccount.com';\nconst SA_KEY = '-----BEGIN PRIVATE KEY-----\\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCc8VpJosYd8D0N\\nmFLmh1b7UOsHgm5ZZBvjSkPUhcFXXoEnOoouhWPD5hEl7ziA+3vWpbHLWb5sm0dv\\nqUhHJWwMMbE5eBxmR7m/Cacpy5ZiOVw+180aZqq6e1AsKlEzRvdz66FSgpCeYtmS\\n2nnc8fGwxfB06qpXsxLVQYnwnKzOlKOv9cfXC/29vrbXoPwez9lkVyySa11iGtYA\\nzMU2LjiPrxvcDTbhb1JYD/050fT/m3z2NgclsV6uCEQxNLXOJriJxNuSKhmZufis\\nsoO/rlj/V+RFTrHEQ8zn3nbm6/W2ZANZt94AOo31t5TR6Idt9PxgjodSHJYLEm+0\\nOXC6bAf3AgMBAAECggEASvGn81Ti9YX0qarNH5+OZkmASmA7EL3Q4Wtj07chmfab\\nhx+Zv9hbyT7yfmJrYZB11Qzfx6Lt35AQ/13fkXXp0DLklfRo32Ct7u+Nn1REVlhc\\n1/eWTl6rdYyQPt7gUrO3U+g3655EsBW1Hz7sBZmVmBwVlMdAm8t8GVEILVmr3aN1\\n5CzVUaLtk9UNQDApUfxgdD2kutWTjqM2j3jsgceST6p98dqV2U8HiOXonpMgt02+\\n3PqApJNu4HQhdMzYwX67vKLuqanlZllLlBp8TWvbP3Roo2p57pD8oamT0BKWDUcX\\nfwT19NJOXqRTim6oalvGklTuwhI9+EJJPlAwN7+rAQKBgQDc+sNzQC4Eph4we6g5\\nBQe5QGIchou/ey1vJ+UGbM8vy6bkuy9dPbDZ/XUZTPOYkTPHKvRu544DTIQzH0qJ\\nfG5NKUIYdOInJm8y+r0JybMrrKl0b04/Nrlueb4RjesASMSq3BTVMK5+6Mb4vx7y\\nLS3mYUc8TF+kBEEaw0H4Fwlu9wKBgQC10JcC0kbtCF/MmHwSq9w0PfgbHT3NoZH7\\nyOWeXPfRLybn+I4MMYW3y5KSL5RM3Gxtve2I/HjJPpprZSUJXfMgRLrVkFRV1iFp\\nA/v1vAxoMlYGk3Oh74rwmmMmU7hhPSNL5HxIDHdXVZb5jrOvqIIBcZ6n2qhaCVXH\\nmtjl3QbvAQKBgBxiUWyiV8bdF4+espLwZHeVH4UOezDTP5jBhRd4LnyzKfLDYGgX\\nnnnBpqLjUX7NV9tDVzZPo9wkne57HHXgd8KNhCHkEZB5zVq8/j8dm1gGy5VbHq/b\\n9aGNHa7fjcnxjuFrd3mS0TcX60bUNcNhrj2jTSUfokFNEpe/cN/PBbUtAoGAaSms\\nnyonciT83Gd6pIYZiXIqluxT+iOxP7SU9AOMJ8ehNl2zM+RVFtk9/yZcHhUE9nj7\\n8tctuiFmyiWnxYI9BXYbpzmjPj7r9kUisKFDf+VVktoo8QqQD9kM7ndQV5Y4W0Ze\\niIIFaVONTu22iyzpfZJNlYNJC0MJBbpQKKyuvQECgYEA2q4N8oL3VJwZAuyIVXOm\\ng9SH9dq4pRunQbXJpxaP2mklGNEbLV1YURVGA0oyQE5oh3/4s/LdMERUFkaYBBnl\\nyrcLRELtnjswAy3b2tEp4ULP/rx5MRY4qjNonUrzoXAs937zDIcyjO6/ekxE28sO\\nXk4daXQsjz4PY3lVvJcnKFA=\\n-----END PRIVATE KEY-----\\n';\nconst TOKEN_URI = 'https://oauth2.googleapis.com/token';\nfunction b64url(str) { return Buffer.from(str).toString('base64').replace(/\\+/g,'-').replace(/\\//g,'_').replace(/=/g,''); }\nfunction b64urlBuf(buf) { return buf.toString('base64').replace(/\\+/g,'-').replace(/\\//g,'_').replace(/=/g,''); }\n\n// 1. Get OAuth token\nconst now = Math.floor(Date.now()/1000);\nconst hdr = b64url(JSON.stringify({alg:'RS256',typ:'JWT'}));\nconst pay = b64url(JSON.stringify({iss:SA_EMAIL,sub:SA_EMAIL,aud:TOKEN_URI,iat:now,exp:now+3600,scope:'https://www.googleapis.com/auth/cloud-platform'}));\nconst si = hdr + '.' + pay;\nconst signer = crypto.createSign('RSA-SHA256');\nsigner.update(si);\nconst jwt = si + '.' + b64urlBuf(signer.sign(SA_KEY));\nconst tokenRes = await this.helpers.httpRequest({method:'POST',url:TOKEN_URI,headers:{'Content-Type':'application/x-www-form-urlencoded'},body:'grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion='+jwt, timeout: 10000});\nif (!tokenRes.access_token) throw new Error('GCS auth failed');\nconst TOKEN = tokenRes.access_token;\n\n// 2. Get the binary audio from ElevenLabs output\nconst binaryData = $input.item.binary;\nconst audioKey = Object.keys(binaryData)[0];\nconst audioBuffer = await this.helpers.getBinaryDataBuffer(0, audioKey);\nif (!audioBuffer || audioBuffer.length < 100) throw new Error('ElevenLabs returned empty audio');\n\n// 3. Upload to GCS\nconst bucket = 'msi-veo-videos';\nconst objectName = 'voice-swap-audio/' + Date.now() + '-swapped.mp3';\nawait this.helpers.httpRequest({\n  method: 'POST',\n  url: 'https://storage.googleapis.com/upload/storage/v1/b/' + bucket + '/o?uploadType=media&name=' + encodeURIComponent(objectName),\n  headers: { 'Authorization': 'Bearer ' + TOKEN, 'Content-Type': 'audio/mpeg' },\n  body: audioBuffer,\n  encoding: 'arraybuffer',\n  timeout: 30000\n});\n\n// 4. Sign the GCS URL for the uploaded audio\nconst gcsUri = 'gs://' + bucket + '/' + objectName;\nfunction signUrl(gsUri) {\n  const m2 = gsUri.match(/^gs:\\/\\/([^\\/]+)\\/(.+)$/);\n  if (!m2) return gsUri;\n  const bkt = m2[1], objP = m2[2], host = 'storage.googleapis.com';\n  const d = new Date();\n  const pad = v => String(v).padStart(2, '0');\n  const ds2 = d.getUTCFullYear() + '' + pad(d.getUTCMonth()+1) + pad(d.getUTCDate());\n  const dt2 = ds2 + 'T' + pad(d.getUTCHours()) + pad(d.getUTCMinutes()) + pad(d.getUTCSeconds()) + 'Z';\n  const scope2 = ds2 + '/auto/storage/goog4_request';\n  const cred2 = SA_EMAIL + '/' + scope2;\n  const qs2 = 'X-Goog-Algorithm=GOOG4-RSA-SHA256&X-Goog-Credential=' + encodeURIComponent(cred2) + '&X-Goog-Date=' + dt2 + '&X-Goog-Expires=604800&X-Goog-SignedHeaders=host';\n  const objEnc2 = objP.split('/').map(p => encodeURIComponent(p)).join('/');\n  const canon2 = 'GET\\n/' + bkt + '/' + objEnc2 + '\\n' + qs2 + '\\nhost:' + host + '\\n\\nhost\\nUNSIGNED-PAYLOAD';\n  const sts2 = 'GOOG4-RSA-SHA256\\n' + dt2 + '\\n' + scope2 + '\\n' + crypto.createHash('sha256').update(canon2).digest('hex');\n  const sg2 = crypto.createSign('RSA-SHA256');\n  sg2.update(sts2);\n  return 'https://' + host + '/' + bkt + '/' + objEnc2 + '?' + qs2 + '&X-Goog-Signature=' + sg2.sign(SA_KEY, 'hex');\n}\nconst audioSignedUrl = signUrl(gcsUri);\n\nconst s = $('Validate Input').item.json;\nconst videoSignedUrl = $('Sign Video URL').item.json.video_signed_url;\n\nreturn [{ json: { audio_gcs_uri: gcsUri, audio_signed_url: audioSignedUrl, video_signed_url: videoSignedUrl, video_gcs_uri: s.video_gcs_uri, voice_id: s.voice_id, post_id: s.post_id, video_part: s.video_part } }];",
    };

    @node({
        name: 'Combine Video + New Audio',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.2,
        position: [12272, -2240],
    })
    CombineVideoNewAudio = {
        method: 'POST',
        url: 'https://fal.run/fal-ai/ffmpeg-api/merge-audio-video',
        authentication: 'genericCredentialType',
        genericAuthType: 'httpHeaderAuth',
        sendBody: true,
        specifyBody: 'json',
        jsonBody:
            '={\n  "video_url": "{{ $json.video_signed_url }}",\n  "audio_url": "{{ $json.audio_signed_url }}"\n}',
        options: {},
    };

    @node({
        name: 'Build Response',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [12496, -2240],
    })
    BuildResponse = {
        jsCode: "const s = $('Upload Audio to GCS + Sign').item.json;\nconst combined = $input.item.json;\nconst finalVideoUrl = combined.video?.url || combined.url || '';\n\nif (!finalVideoUrl) throw new Error('Combine step failed - no video URL returned');\n\nreturn [{ json: {\n  success: true,\n  final_video_url: finalVideoUrl,\n  original_video_gcs_uri: s.video_gcs_uri,\n  audio_gcs_uri: s.audio_gcs_uri,\n  voice_id: s.voice_id,\n  post_id: s.post_id,\n  video_part: s.video_part\n} }];",
    };

    @node({
        name: 'Respond Success',
        type: 'n8n-nodes-base.respondToWebhook',
        version: 1.1,
        position: [12720, -2240],
    })
    RespondSuccess = {
        respondWith: 'json',
        responseBody:
            "={{ JSON.stringify({ success: true, message: 'Voice swap completed successfully', data: { final_video_url: $json.final_video_url, original_video_gcs_uri: $json.original_video_gcs_uri, audio_gcs_uri: $json.audio_gcs_uri, voice_id: $json.voice_id, post_id: $json.post_id, video_part: $json.video_part } }) }}",
        options: {
            responseHeaders: {
                entries: [
                    {
                        name: 'Access-Control-Allow-Origin',
                        value: '*',
                    },
                    {
                        name: 'Access-Control-Allow-Methods',
                        value: 'POST, GET, OPTIONS',
                    },
                    {
                        name: 'Access-Control-Allow-Headers',
                        value: 'Content-Type',
                    },
                ],
            },
        },
    };

    // =====================================================================
    // ROUTAGE ET CONNEXIONS
    // =====================================================================

    @links()
    defineRouting() {
        this.WebhookVoiceSwap.out(0).to(this.ValidateInput.in(0));
        this.ValidateInput.out(0).to(this.SignVideoUrl.in(0));
        this.SignVideoUrl.out(0).to(this.ExtractAudioReplicate.in(0));
        this.ExtractAudioReplicate.out(0).to(this.WaitExtractAudio.in(0));
        this.WaitExtractAudio.out(0).to(this.GetAudioStatus.in(0));
        this.GetAudioStatus.out(0).to(this.AudioReady.in(0));
        this.AudioReady.out(0).to(this.DownloadAudio.in(0));
        this.AudioReady.out(1).to(this.WaitRetry.in(0));
        this.WaitRetry.out(0).to(this.GetAudioStatus.in(0));
        this.DownloadAudio.out(0).to(this.ElevenlabsSpeechToSpeech.in(0));
        this.ElevenlabsSpeechToSpeech.out(0).to(this.UploadAudioToGcsSign.in(0));
        this.UploadAudioToGcsSign.out(0).to(this.CombineVideoNewAudio.in(0));
        this.CombineVideoNewAudio.out(0).to(this.BuildResponse.in(0));
        this.BuildResponse.out(0).to(this.RespondSuccess.in(0));
    }
}
