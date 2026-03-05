import { workflow, node, links } from '@n8n-as-code/transformer';

// <workflow-map>
// Workflow : MSIvideo
// Nodes   : 16  |  Connections: 15
//
// NODE INDEX
// ──────────────────────────────────────────────────────────────────
// Property name                    Node type (short)         Flags
// WebhookVideoApproved               webhook
// PublicarCredenciales               code
// FormatApprovedInput                code
// DownloadImage1                     code
// SubmitPart1                        code
// WaitPart1                          wait
// FetchPart1                         code
// SubmitPart2                        code
// WaitPart2                          wait
// FetchPart2                         code
// GenerateUrls                       code
// UpdateDb                           postgres                   [creds]
// RespondSuccess                     respondToWebhook
// SubmitPart3                        code
// WaitPart3                          wait
// FetchPart3                         code
//
// ROUTING MAP
// ──────────────────────────────────────────────────────────────────
// WebhookVideoApproved
//    → PublicarCredenciales
//      → FormatApprovedInput
//        → DownloadImage1
//          → SubmitPart1
//            → WaitPart1
//              → FetchPart1
//                → SubmitPart2
//                  → WaitPart2
//                    → FetchPart2
//                      → SubmitPart3
//                        → WaitPart3
//                          → FetchPart3
//                            → GenerateUrls
//                              → UpdateDb
//                                → RespondSuccess
// </workflow-map>

// =====================================================================
// METADATA DU WORKFLOW
// =====================================================================

@workflow({
    id: 'Dr2oNi1apcQkI3ui',
    name: 'MSIvideo',
    active: true,
    settings: { executionOrder: 'v1', callerPolicy: 'workflowsFromSameOwner', availableInMCP: false },
})
export class MsivideoWorkflow {
    // =====================================================================
    // CONFIGURATION DES NOEUDS
    // =====================================================================

    @node({
        name: 'Webhook - Video Approved',
        type: 'n8n-nodes-base.webhook',
        version: 2,
        position: [22448, 7792],
    })
    WebhookVideoApproved = {
        httpMethod: 'POST',
        path: 'msi-video-approved-gen',
        responseMode: 'responseNode',
        options: {
            allowedOrigins: '*',
            rawBody: false,
        },
    };

    @node({
        name: 'Publicar Credenciales',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [22672, 7792],
    })
    PublicarCredenciales = {
        jsCode: "return [{\n  json: {\n    EP: 'us-central1-aiplatform.googleapis.com',\n    PJ: 'video-gen-msi',\n    LOC: 'us-central1',\n    MDL: 'veo-3.1-generate-001',\n    MDL_EXTEND: 'veo-3.1-generate-preview',\n    STORAGE_URI_PART1: 'gs://video-bucket-for-msi-920206/approved-part1/',\n    STORAGE_URI_PART2: 'gs://video-bucket-for-msi-920206/approved-part2/',\n    STORAGE_URI_PART3: 'gs://video-bucket-for-msi-920206/approved-part3/'\n  }\n}];",
    };

    @node({
        name: 'Format Approved Input',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [22896, 7792],
    })
    FormatApprovedInput = {
        jsCode: "// Read approved data from the webhook (not from $input which is Publicar Credenciales)\nconst webhookData = $('Webhook - Video Approved').item.json;\nlet data = webhookData.body || webhookData;\nif (typeof data === 'string') {\n  try { data = JSON.parse(data); } catch (e) { }\n}\n\nlet approved1 = data.approved_prompt_part1 || '';\nlet approved2 = data.approved_prompt_part2 || '';\nconst approved3 = data.approved_prompt_part3 || '';\nconst start_image_url = data.start_image_url || null;\nconst aspect_ratio = data.aspect_ratio || '9:16';\nconst duration = String(Math.min(parseInt(data.duration || '8'), 8));\nconst post_id = data.post_id || null;\nconst prompt = data.prompt || '';\nconst service = data.service || 'company_intro';\n\nif (!approved1 || approved1.length < 10) throw new Error('approved_prompt_part1 is required (min 10 chars)');\nif (!approved2 || approved2.length < 10) throw new Error('approved_prompt_part2 is required (min 10 chars)');\nif (!start_image_url) throw new Error('start_image_url is required');\n// second_image_url is no longer required - last frame of Part 1 video will be used for Part 2\n\nconst part1Continuity = ' Same camera angle and same framing throughout. The person keeps walking naturally while speaking and continues walking in the same direction during the last second. No camera cuts, no zoom, no stop.';\nconst part2Bridge = ' Continuing seamlessly from part 1 with identical camera angle, framing, walking pace, and direction.';\n\nif (!/same camera angle|same framing|no camera cuts|no zoom/i.test(approved1)) {\n  approved1 = (approved1.trim().replace(/[.!?]*$/, '') + '.' + part1Continuity).trim();\n}\n\nif (!/continuing seamlessly from part 1|identical camera angle|same walking pace/i.test(approved2)) {\n  approved2 = (part2Bridge + ' ' + approved2.trim()).trim();\n}\n\nreturn [{ json: {\n  PROMPT_PART1: approved1,\n  PROMPT_PART2: approved2,\n  PROMPT_PART3: approved3,\n  DURATION: duration,\n  ASPECT_RATIO: aspect_ratio,\n  POST_ID: post_id,\n  ORIGINAL_PROMPT: prompt,\n  SERVICE: service,\n  START_IMAGE_URL: start_image_url\n} }];",
    };

    @node({
        name: 'Download Image 1',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [23120, 7792],
    })
    DownloadImage1 = {
        jsCode: "// Download start image and base64 encode it (~15s max)\nconst s = $input.item.json;\nconst imgBuffer = await this.helpers.httpRequest({\n  method: 'GET', url: s.START_IMAGE_URL, encoding: 'arraybuffer', timeout: 15000\n});\nconst b64 = Buffer.from(imgBuffer).toString('base64');\nif (b64.length < 100) throw new Error('Start image download failed');\n\nreturn [{ json: { IMAGE_B64: b64, PROMPT_PART1: s.PROMPT_PART1, PROMPT_PART2: s.PROMPT_PART2, PROMPT_PART3: s.PROMPT_PART3, DURATION: s.DURATION, ASPECT_RATIO: s.ASPECT_RATIO, POST_ID: s.POST_ID, ORIGINAL_PROMPT: s.ORIGINAL_PROMPT, SERVICE: s.SERVICE } }];",
    };

    @node({
        name: 'Submit Part 1',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [23344, 7792],
    })
    SubmitPart1 = {
        jsCode: "const crypto = require('crypto');\nconst SA_EMAIL = 'vertex-veo@video-gen-msi.iam.gserviceaccount.com';\nconst SA_KEY = '-----BEGIN PRIVATE KEY-----\\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC4iP0eUO4malpt\\nVjv/Gx4s5UUtO6TGngM9RzUFRjo+h+P4BURbOxMwK0XvyMlG9wyES1I/rq1Z5eaP\\n3ADfGWzVucBCGxI5w7mh1FtkXe+Gcfc+jhw+erjvvm1dlEAf8OILEQ7X1kBmNIa0\\nr299nH30vnrtNjPpWPSY6nWeOhq1Q/XUeeXvV/l+zd2Cf0tLi9rVCkdsF2Gqff4r\\nikFmalpFohK0Mli9Hwm4NIgqhp6S1502gUcvat9x3b1wID+CFiE9t9N1758yvL0g\\n4YZl9Rze7WdYGp10jKMfK4mTnyQ2nLu27NusJ7dzCC7YCJqAZ8ZxhdTDGBiWIfQW\\nnH3/OcZLAgMBAAECggEABJY7HG7MjJ3mI4OaOCwXYuxL/OTXoqw4zmQfuELXnchI\\n7VhMK6xbPL5GncAy6JWpdPxeTgDshCiHw5mnV+RM5T8ZvUro+BCaY6BgqS0AkCnz\\nCFYF87OfNy5Xj5ToxyJ4q+e/o7PKo/+4PXOC5O9n3haB/bV0Mt+oLMjfJZCyK0E7\\nXvex3faWvA3Ca6NRyxZm8imFW/ymkLnD6c7mZKBXgOoDL+PJP/yI/DEF2aam5xIs\\n6sm+CXyRiAIsKazpnclqA/Z4tZwwtzYs+PO81SOt6Rc7WQsSzHqMUN6WY+3RLCXl\\nv8T4rRBa9eW4zx8YV3SBQHNEqevql1uODYLXoE60aQKBgQDmxfw+BSlKgfs/ZODz\\naVbWEGxZWNMF/RirEMjKO9edzJcvQu6NRC6CWFfcLTRc5iCOje6+a64U2xKjHNLw\\nBgTZyw6JGLdOo2vZHIMTIENBo14ykxxmN2TZ6mBpvGmxOMZ3LnVf4+1SUb3+su8C\\nW85Y91pjdQYFe6u8W99ptCQRjQKBgQDMtQ+s/1OBJ838WB6rHCpTugOuqdEURXd0\\nLGLUHgrv0jk7dnR9Z19TPjr0zU+ntakSl8+JW3NmFBb660F6by0gQgZgMgTf+eHB\\nbHLp8OjaAvZixY4xBfDQrxKWaLLXGkU7oLZGMBm0Izm7uF25r9wbIwamtOnrnYDW\\n6eaLtHtFNwKBgQCY/8ZecBmSFl83BnDFsJ8ryTOsgOFXZRfHwpb8zXQEYLITWXLD\\nIeMb8+o8RZQjy0bmfF8+zDFcDmpqzh9jlvn8U03Nwx80+c/035xfP9KXX/KB4VrA\\nwhURDPzi3VHNd3DNb3XOH1UmcJ9gj806aReDkGrS6bEWTYnslZSnhhEruQKBgDMy\\nqawD49euo+cUBv+WuMNeB6O8ly0xvpGQtFsG9IdMlcHYe4QNwZqpOseVPfHdDl83\\nFtHszGzgY2r4QdUkTy39NWkDuZJnBd6BiDAYb7Ru/z5u2IRMTxFyZ/y0TN5dlKk4\\nJb5iM1uJX9wiXVaetDcZSIWTQ9oI93tI3r9cMWR7AoGAVDHhXAmsTbRXSjbMYOwL\\nSP7NriO56s2N2l+PZX/bPz6gAcixmNEwtKYCuB50uX8W9YqfRvkhvELphguZ+y4g\\n3n1zq8IwSJT4ozoC/cQdt7CNQfgnF4VCjx23YBC1ankkI3NyUKfOwM/w8NNGKdHU\\nTCrcBjpqoSjnNp1pXh6IMTM=\\n-----END PRIVATE KEY-----\\n';\nconst TOKEN_URI = 'https://oauth2.googleapis.com/token';\nfunction b64url(str) { return Buffer.from(str).toString('base64').replace(/\\+/g,'-').replace(/\\//g,'_').replace(/=/g,''); }\nfunction b64urlBuf(buf) { return buf.toString('base64').replace(/\\+/g,'-').replace(/\\//g,'_').replace(/=/g,''); }\nconst now = Math.floor(Date.now()/1000);\nconst hdr = b64url(JSON.stringify({alg:'RS256',typ:'JWT'}));\nconst pay = b64url(JSON.stringify({iss:SA_EMAIL,sub:SA_EMAIL,aud:TOKEN_URI,iat:now,exp:now+3600,scope:'https://www.googleapis.com/auth/cloud-platform'}));\nconst si = hdr + '.' + pay;\nconst signer = crypto.createSign('RSA-SHA256');\nsigner.update(si);\nconst jwt = si + '.' + b64urlBuf(signer.sign(SA_KEY));\nconst tokenRes = await this.helpers.httpRequest({method:'POST',url:TOKEN_URI,headers:{'Content-Type':'application/x-www-form-urlencoded'},body:'grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion='+jwt, timeout: 10000});\nif (!tokenRes.access_token) throw new Error('Token failed');\nconst TOKEN = tokenRes.access_token;\nconst creds = $('Publicar Credenciales').item.json;\nconst s = $input.item.json;\nconst EP = creds.EP;\nconst PJ = creds.PJ;\nconst LOC = creds.LOC;\nconst MDL = creds.MDL;\nconst veoRes = await this.helpers.httpRequest({\n  method: 'POST',\n  url: 'https://' + EP + '/v1/projects/' + PJ + '/locations/' + LOC + '/publishers/google/models/' + MDL + ':predictLongRunning',\n  headers: { 'Content-Type':'application/json', 'Authorization':'Bearer ' + TOKEN },\n  body: JSON.stringify({\n    instances: [{ prompt: s.PROMPT_PART1, image: { bytesBase64Encoded: s.IMAGE_B64, mimeType: 'image/jpeg' } }],\n    parameters: { aspectRatio: s.ASPECT_RATIO, resolution: '720p', sampleCount: 1, durationSeconds: parseInt(s.DURATION), personGeneration: 'allow_all', addWatermark: false, includeRaiReason: true, generateAudio: true, storageUri: creds.STORAGE_URI_PART1, negativePrompt: 'background music, soundtrack, instrumental music, musical score, ambient music, piano, guitar, drums, orchestra, synthesizer, melody, rhythm, cinematic score, dramatic music, soft music, upbeat music, ambient sounds, ambient noise, room tone, wind sound, traffic noise, nature sounds, transition animation, visual transitions, fade, dissolve, wipe, crossfade, jump cut, abrupt transition, scene change, new background, different setting, camera cut, camera angle change, different camera angle, new camera position, perspective shift, lens change, focal length change, zoom in, zoom out, dolly shot, pan away, camera shake, person stopping, stop walking, standing still, static pose, sudden turn, direction change, blurry, text, letters, words, subtitles, captions, watermark, frozen face, closed mouth, extra hands, extra fingers, extra arms, extra limbs, duplicate body parts, morphing body, body transformation, logo animation, logo zoom, logo glow, logo enlargement, logo movement' }\n  }),\n  timeout: 30000\n});\nif (!veoRes.name) throw new Error('Veo Part 1 failed: ' + JSON.stringify(veoRes).substring(0, 300));\n\nreturn [{ json: { op1: veoRes.name, PROMPT_PART2: s.PROMPT_PART2, PROMPT_PART3: s.PROMPT_PART3, DURATION: s.DURATION, ASPECT_RATIO: s.ASPECT_RATIO, POST_ID: s.POST_ID, ORIGINAL_PROMPT: s.ORIGINAL_PROMPT } }];",
    };

    @node({
        name: 'Wait Part 1',
        type: 'n8n-nodes-base.wait',
        version: 1.1,
        position: [23568, 7792],
    })
    WaitPart1 = {
        amount: 2,
        unit: 'minutes',
    };

    @node({
        name: 'Fetch Part 1',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [23792, 7792],
    })
    FetchPart1 = {
        jsCode: "const crypto = require('crypto');\nconst SA_EMAIL = 'vertex-veo@video-gen-msi.iam.gserviceaccount.com';\nconst SA_KEY = '-----BEGIN PRIVATE KEY-----\\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC4iP0eUO4malpt\\nVjv/Gx4s5UUtO6TGngM9RzUFRjo+h+P4BURbOxMwK0XvyMlG9wyES1I/rq1Z5eaP\\n3ADfGWzVucBCGxI5w7mh1FtkXe+Gcfc+jhw+erjvvm1dlEAf8OILEQ7X1kBmNIa0\\nr299nH30vnrtNjPpWPSY6nWeOhq1Q/XUeeXvV/l+zd2Cf0tLi9rVCkdsF2Gqff4r\\nikFmalpFohK0Mli9Hwm4NIgqhp6S1502gUcvat9x3b1wID+CFiE9t9N1758yvL0g\\n4YZl9Rze7WdYGp10jKMfK4mTnyQ2nLu27NusJ7dzCC7YCJqAZ8ZxhdTDGBiWIfQW\\nnH3/OcZLAgMBAAECggEABJY7HG7MjJ3mI4OaOCwXYuxL/OTXoqw4zmQfuELXnchI\\n7VhMK6xbPL5GncAy6JWpdPxeTgDshCiHw5mnV+RM5T8ZvUro+BCaY6BgqS0AkCnz\\nCFYF87OfNy5Xj5ToxyJ4q+e/o7PKo/+4PXOC5O9n3haB/bV0Mt+oLMjfJZCyK0E7\\nXvex3faWvA3Ca6NRyxZm8imFW/ymkLnD6c7mZKBXgOoDL+PJP/yI/DEF2aam5xIs\\n6sm+CXyRiAIsKazpnclqA/Z4tZwwtzYs+PO81SOt6Rc7WQsSzHqMUN6WY+3RLCXl\\nv8T4rRBa9eW4zx8YV3SBQHNEqevql1uODYLXoE60aQKBgQDmxfw+BSlKgfs/ZODz\\naVbWEGxZWNMF/RirEMjKO9edzJcvQu6NRC6CWFfcLTRc5iCOje6+a64U2xKjHNLw\\nBgTZyw6JGLdOo2vZHIMTIENBo14ykxxmN2TZ6mBpvGmxOMZ3LnVf4+1SUb3+su8C\\nW85Y91pjdQYFe6u8W99ptCQRjQKBgQDMtQ+s/1OBJ838WB6rHCpTugOuqdEURXd0\\nLGLUHgrv0jk7dnR9Z19TPjr0zU+ntakSl8+JW3NmFBb660F6by0gQgZgMgTf+eHB\\nbHLp8OjaAvZixY4xBfDQrxKWaLLXGkU7oLZGMBm0Izm7uF25r9wbIwamtOnrnYDW\\n6eaLtHtFNwKBgQCY/8ZecBmSFl83BnDFsJ8ryTOsgOFXZRfHwpb8zXQEYLITWXLD\\nIeMb8+o8RZQjy0bmfF8+zDFcDmpqzh9jlvn8U03Nwx80+c/035xfP9KXX/KB4VrA\\nwhURDPzi3VHNd3DNb3XOH1UmcJ9gj806aReDkGrS6bEWTYnslZSnhhEruQKBgDMy\\nqawD49euo+cUBv+WuMNeB6O8ly0xvpGQtFsG9IdMlcHYe4QNwZqpOseVPfHdDl83\\nFtHszGzgY2r4QdUkTy39NWkDuZJnBd6BiDAYb7Ru/z5u2IRMTxFyZ/y0TN5dlKk4\\nJb5iM1uJX9wiXVaetDcZSIWTQ9oI93tI3r9cMWR7AoGAVDHhXAmsTbRXSjbMYOwL\\nSP7NriO56s2N2l+PZX/bPz6gAcixmNEwtKYCuB50uX8W9YqfRvkhvELphguZ+y4g\\n3n1zq8IwSJT4ozoC/cQdt7CNQfgnF4VCjx23YBC1ankkI3NyUKfOwM/w8NNGKdHU\\nTCrcBjpqoSjnNp1pXh6IMTM=\\n-----END PRIVATE KEY-----\\n';\nconst TOKEN_URI = 'https://oauth2.googleapis.com/token';\nfunction b64url(str) { return Buffer.from(str).toString('base64').replace(/\\+/g,'-').replace(/\\//g,'_').replace(/=/g,''); }\nfunction b64urlBuf(buf) { return buf.toString('base64').replace(/\\+/g,'-').replace(/\\//g,'_').replace(/=/g,''); }\nconst now = Math.floor(Date.now()/1000);\nconst hdr = b64url(JSON.stringify({alg:'RS256',typ:'JWT'}));\nconst pay = b64url(JSON.stringify({iss:SA_EMAIL,sub:SA_EMAIL,aud:TOKEN_URI,iat:now,exp:now+3600,scope:'https://www.googleapis.com/auth/cloud-platform'}));\nconst si = hdr + '.' + pay;\nconst signer = crypto.createSign('RSA-SHA256');\nsigner.update(si);\nconst jwt = si + '.' + b64urlBuf(signer.sign(SA_KEY));\nconst tokenRes = await this.helpers.httpRequest({method:'POST',url:TOKEN_URI,headers:{'Content-Type':'application/x-www-form-urlencoded'},body:'grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion='+jwt, timeout: 10000});\nif (!tokenRes.access_token) throw new Error('Token failed');\nconst TOKEN = tokenRes.access_token;\nconst creds = $('Publicar Credenciales').item.json;\nconst s = $input.item.json;\nconst EP = creds.EP;\nconst PJ = creds.PJ;\nconst LOC = creds.LOC;\nconst MDL = creds.MDL;\nconst MAX_RETRIES = 8;\nconst RETRY_DELAY_MS = 30000; // 30 seconds\n\nlet videoUri = '';\nfor (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {\n  const res = await this.helpers.httpRequest({\n    method: 'POST',\n    url: 'https://' + EP + '/v1/projects/' + PJ + '/locations/' + LOC + '/publishers/google/models/' + MDL + ':fetchPredictOperation',\n    headers: { 'Content-Type':'application/json', 'Authorization':'Bearer ' + TOKEN },\n    body: JSON.stringify({ operationName: s.op1 }),\n    timeout: 15000\n  });\n  videoUri = res.response?.videos?.[0]?.gcsUri || res.response?.videos?.[0]?.uri || '';\n  if (videoUri) break;\n  if (attempt < MAX_RETRIES) {\n    console.log('Part 1 not ready (attempt ' + attempt + '/' + MAX_RETRIES + '). Retrying in 30s...');\n    await new Promise(r => setTimeout(r, RETRY_DELAY_MS));\n  } else {\n    throw new Error('Part 1 not ready after ' + MAX_RETRIES + ' attempts: ' + JSON.stringify(res).substring(0, 400));\n  }\n}\n\nreturn [{ json: { video1_gcs_uri: videoUri, PROMPT_PART2: s.PROMPT_PART2, PROMPT_PART3: s.PROMPT_PART3, DURATION: s.DURATION, ASPECT_RATIO: s.ASPECT_RATIO, POST_ID: s.POST_ID, ORIGINAL_PROMPT: s.ORIGINAL_PROMPT } }];",
    };

    @node({
        name: 'Submit Part 2',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [24016, 7792],
    })
    SubmitPart2 = {
        jsCode: "// ============================================================\n// Submit Part 2 as VIDEO-TO-VIDEO EXTENSION (not image-to-video)\n// Uses the GCS URI from Part 1 as the video input.\n// This leverages Veo 3.1's \"last second rule\" - the model samples\n// the last ~24 frames (1 second) of Part 1 to extract latent vectors\n// for voice timbre, visual identity, and motion continuity.\n// ============================================================\nconst crypto = require('crypto');\nconst SA_EMAIL = 'vertex-veo@video-gen-msi.iam.gserviceaccount.com';\nconst SA_KEY = '-----BEGIN PRIVATE KEY-----\\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC4iP0eUO4malpt\\nVjv/Gx4s5UUtO6TGngM9RzUFRjo+h+P4BURbOxMwK0XvyMlG9wyES1I/rq1Z5eaP\\n3ADfGWzVucBCGxI5w7mh1FtkXe+Gcfc+jhw+erjvvm1dlEAf8OILEQ7X1kBmNIa0\\nr299nH30vnrtNjPpWPSY6nWeOhq1Q/XUeeXvV/l+zd2Cf0tLi9rVCkdsF2Gqff4r\\nikFmalpFohK0Mli9Hwm4NIgqhp6S1502gUcvat9x3b1wID+CFiE9t9N1758yvL0g\\n4YZl9Rze7WdYGp10jKMfK4mTnyQ2nLu27NusJ7dzCC7YCJqAZ8ZxhdTDGBiWIfQW\\nnH3/OcZLAgMBAAECggEABJY7HG7MjJ3mI4OaOCwXYuxL/OTXoqw4zmQfuELXnchI\\n7VhMK6xbPL5GncAy6JWpdPxeTgDshCiHw5mnV+RM5T8ZvUro+BCaY6BgqS0AkCnz\\nCFYF87OfNy5Xj5ToxyJ4q+e/o7PKo/+4PXOC5O9n3haB/bV0Mt+oLMjfJZCyK0E7\\nXvex3faWvA3Ca6NRyxZm8imFW/ymkLnD6c7mZKBXgOoDL+PJP/yI/DEF2aam5xIs\\n6sm+CXyRiAIsKazpnclqA/Z4tZwwtzYs+PO81SOt6Rc7WQsSzHqMUN6WY+3RLCXl\\nv8T4rRBa9eW4zx8YV3SBQHNEqevql1uODYLXoE60aQKBgQDmxfw+BSlKgfs/ZODz\\naVbWEGxZWNMF/RirEMjKO9edzJcvQu6NRC6CWFfcLTRc5iCOje6+a64U2xKjHNLw\\nBgTZyw6JGLdOo2vZHIMTIENBo14ykxxmN2TZ6mBpvGmxOMZ3LnVf4+1SUb3+su8C\\nW85Y91pjdQYFe6u8W99ptCQRjQKBgQDMtQ+s/1OBJ838WB6rHCpTugOuqdEURXd0\\nLGLUHgrv0jk7dnR9Z19TPjr0zU+ntakSl8+JW3NmFBb660F6by0gQgZgMgTf+eHB\\nbHLp8OjaAvZixY4xBfDQrxKWaLLXGkU7oLZGMBm0Izm7uF25r9wbIwamtOnrnYDW\\n6eaLtHtFNwKBgQCY/8ZecBmSFl83BnDFsJ8ryTOsgOFXZRfHwpb8zXQEYLITWXLD\\nIeMb8+o8RZQjy0bmfF8+zDFcDmpqzh9jlvn8U03Nwx80+c/035xfP9KXX/KB4VrA\\nwhURDPzi3VHNd3DNb3XOH1UmcJ9gj806aReDkGrS6bEWTYnslZSnhhEruQKBgDMy\\nqawD49euo+cUBv+WuMNeB6O8ly0xvpGQtFsG9IdMlcHYe4QNwZqpOseVPfHdDl83\\nFtHszGzgY2r4QdUkTy39NWkDuZJnBd6BiDAYb7Ru/z5u2IRMTxFyZ/y0TN5dlKk4\\nJb5iM1uJX9wiXVaetDcZSIWTQ9oI93tI3r9cMWR7AoGAVDHhXAmsTbRXSjbMYOwL\\nSP7NriO56s2N2l+PZX/bPz6gAcixmNEwtKYCuB50uX8W9YqfRvkhvELphguZ+y4g\\n3n1zq8IwSJT4ozoC/cQdt7CNQfgnF4VCjx23YBC1ankkI3NyUKfOwM/w8NNGKdHU\\nTCrcBjpqoSjnNp1pXh6IMTM=\\n-----END PRIVATE KEY-----\\n';\nconst TOKEN_URI = 'https://oauth2.googleapis.com/token';\nfunction b64url(str) { return Buffer.from(str).toString('base64').replace(/\\+/g,'-').replace(/\\//g,'_').replace(/=/g,''); }\nfunction b64urlBuf(buf) { return buf.toString('base64').replace(/\\+/g,'-').replace(/\\//g,'_').replace(/=/g,''); }\nconst now = Math.floor(Date.now()/1000);\nconst hdr = b64url(JSON.stringify({alg:'RS256',typ:'JWT'}));\nconst pay = b64url(JSON.stringify({iss:SA_EMAIL,sub:SA_EMAIL,aud:TOKEN_URI,iat:now,exp:now+3600,scope:'https://www.googleapis.com/auth/cloud-platform'}));\nconst si = hdr + '.' + pay;\nconst signer = crypto.createSign('RSA-SHA256');\nsigner.update(si);\nconst jwt = si + '.' + b64urlBuf(signer.sign(SA_KEY));\nconst tokenRes = await this.helpers.httpRequest({method:'POST',url:TOKEN_URI,headers:{'Content-Type':'application/x-www-form-urlencoded'},body:'grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion='+jwt, timeout: 10000});\nif (!tokenRes.access_token) throw new Error('Token failed');\nconst TOKEN = tokenRes.access_token;\nconst creds = $('Publicar Credenciales').item.json;\nconst s = $input.item.json;\nconst EP = creds.EP;\nconst PJ = creds.PJ;\nconst LOC = creds.LOC;\nconst MDL = creds.MDL_EXTEND;\n\n// KEY DIFFERENCE: Use video.gcsUri + mimeType for video extension mode\n// Extension only supported on veo-3.1-generate-preview (NOT -001)\nconst veoRes = await this.helpers.httpRequest({\n  method: 'POST',\n  url: 'https://' + EP + '/v1/projects/' + PJ + '/locations/' + LOC + '/publishers/google/models/' + MDL + ':predictLongRunning',\n  headers: { 'Content-Type':'application/json', 'Authorization':'Bearer ' + TOKEN },\n  body: JSON.stringify({\n    instances: [{ prompt: s.PROMPT_PART2, video: { gcsUri: s.video1_gcs_uri, mimeType: 'video/mp4' } }],\n    parameters: { storageUri: creds.STORAGE_URI_PART2, sampleCount: 1, generateAudio: true, personGeneration: 'allow_all', negativePrompt: 'different voice, voice change, new speaker, different accent, different tone, different pitch, background music, soundtrack, instrumental music, musical score, ambient music, piano, guitar, drums, orchestra, synthesizer, melody, cinematic score, transition animation, fade, dissolve, wipe, crossfade, jump cut, abrupt transition, scene change, new background, different setting, camera cut, camera angle change, different camera angle, new camera position, zoom in, zoom out, dolly shot, pan away, camera shake, person stopping, stop walking, standing still, static pose, blurry, text, subtitles, watermark, frozen face, closed mouth, extra hands, extra fingers, extra arms, extra limbs, duplicate body parts, morphing body, waving hand, farewell gesture, goodbye wave, greeting gesture, animated ending, hand raising, peace sign, thumbs up' }\n  }),\n  timeout: 30000\n});\nif (!veoRes.name) throw new Error('Veo Part 2 (extend) failed: ' + JSON.stringify(veoRes).substring(0, 300));\n\nreturn [{ json: { op2: veoRes.name, video1_gcs_uri: s.video1_gcs_uri, PROMPT_PART3: s.PROMPT_PART3, DURATION: s.DURATION, POST_ID: s.POST_ID, ORIGINAL_PROMPT: s.ORIGINAL_PROMPT } }];",
    };

    @node({
        name: 'Wait Part 2',
        type: 'n8n-nodes-base.wait',
        version: 1.1,
        position: [24240, 7792],
    })
    WaitPart2 = {
        amount: 2,
        unit: 'minutes',
    };

    @node({
        name: 'Fetch Part 2',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [24464, 7792],
    })
    FetchPart2 = {
        jsCode: "const crypto = require('crypto');\nconst SA_EMAIL = 'vertex-veo@video-gen-msi.iam.gserviceaccount.com';\nconst SA_KEY = '-----BEGIN PRIVATE KEY-----\\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC4iP0eUO4malpt\\nVjv/Gx4s5UUtO6TGngM9RzUFRjo+h+P4BURbOxMwK0XvyMlG9wyES1I/rq1Z5eaP\\n3ADfGWzVucBCGxI5w7mh1FtkXe+Gcfc+jhw+erjvvm1dlEAf8OILEQ7X1kBmNIa0\\nr299nH30vnrtNjPpWPSY6nWeOhq1Q/XUeeXvV/l+zd2Cf0tLi9rVCkdsF2Gqff4r\\nikFmalpFohK0Mli9Hwm4NIgqhp6S1502gUcvat9x3b1wID+CFiE9t9N1758yvL0g\\n4YZl9Rze7WdYGp10jKMfK4mTnyQ2nLu27NusJ7dzCC7YCJqAZ8ZxhdTDGBiWIfQW\\nnH3/OcZLAgMBAAECggEABJY7HG7MjJ3mI4OaOCwXYuxL/OTXoqw4zmQfuELXnchI\\n7VhMK6xbPL5GncAy6JWpdPxeTgDshCiHw5mnV+RM5T8ZvUro+BCaY6BgqS0AkCnz\\nCFYF87OfNy5Xj5ToxyJ4q+e/o7PKo/+4PXOC5O9n3haB/bV0Mt+oLMjfJZCyK0E7\\nXvex3faWvA3Ca6NRyxZm8imFW/ymkLnD6c7mZKBXgOoDL+PJP/yI/DEF2aam5xIs\\n6sm+CXyRiAIsKazpnclqA/Z4tZwwtzYs+PO81SOt6Rc7WQsSzHqMUN6WY+3RLCXl\\nv8T4rRBa9eW4zx8YV3SBQHNEqevql1uODYLXoE60aQKBgQDmxfw+BSlKgfs/ZODz\\naVbWEGxZWNMF/RirEMjKO9edzJcvQu6NRC6CWFfcLTRc5iCOje6+a64U2xKjHNLw\\nBgTZyw6JGLdOo2vZHIMTIENBo14ykxxmN2TZ6mBpvGmxOMZ3LnVf4+1SUb3+su8C\\nW85Y91pjdQYFe6u8W99ptCQRjQKBgQDMtQ+s/1OBJ838WB6rHCpTugOuqdEURXd0\\nLGLUHgrv0jk7dnR9Z19TPjr0zU+ntakSl8+JW3NmFBb660F6by0gQgZgMgTf+eHB\\nbHLp8OjaAvZixY4xBfDQrxKWaLLXGkU7oLZGMBm0Izm7uF25r9wbIwamtOnrnYDW\\n6eaLtHtFNwKBgQCY/8ZecBmSFl83BnDFsJ8ryTOsgOFXZRfHwpb8zXQEYLITWXLD\\nIeMb8+o8RZQjy0bmfF8+zDFcDmpqzh9jlvn8U03Nwx80+c/035xfP9KXX/KB4VrA\\nwhURDPzi3VHNd3DNb3XOH1UmcJ9gj806aReDkGrS6bEWTYnslZSnhhEruQKBgDMy\\nqawD49euo+cUBv+WuMNeB6O8ly0xvpGQtFsG9IdMlcHYe4QNwZqpOseVPfHdDl83\\nFtHszGzgY2r4QdUkTy39NWkDuZJnBd6BiDAYb7Ru/z5u2IRMTxFyZ/y0TN5dlKk4\\nJb5iM1uJX9wiXVaetDcZSIWTQ9oI93tI3r9cMWR7AoGAVDHhXAmsTbRXSjbMYOwL\\nSP7NriO56s2N2l+PZX/bPz6gAcixmNEwtKYCuB50uX8W9YqfRvkhvELphguZ+y4g\\n3n1zq8IwSJT4ozoC/cQdt7CNQfgnF4VCjx23YBC1ankkI3NyUKfOwM/w8NNGKdHU\\nTCrcBjpqoSjnNp1pXh6IMTM=\\n-----END PRIVATE KEY-----\\n';\nconst TOKEN_URI = 'https://oauth2.googleapis.com/token';\nfunction b64url(str) { return Buffer.from(str).toString('base64').replace(/\\+/g,'-').replace(/\\//g,'_').replace(/=/g,''); }\nfunction b64urlBuf(buf) { return buf.toString('base64').replace(/\\+/g,'-').replace(/\\//g,'_').replace(/=/g,''); }\nconst now = Math.floor(Date.now()/1000);\nconst hdr = b64url(JSON.stringify({alg:'RS256',typ:'JWT'}));\nconst pay = b64url(JSON.stringify({iss:SA_EMAIL,sub:SA_EMAIL,aud:TOKEN_URI,iat:now,exp:now+3600,scope:'https://www.googleapis.com/auth/cloud-platform'}));\nconst si = hdr + '.' + pay;\nconst signer = crypto.createSign('RSA-SHA256');\nsigner.update(si);\nconst jwt = si + '.' + b64urlBuf(signer.sign(SA_KEY));\nconst tokenRes = await this.helpers.httpRequest({method:'POST',url:TOKEN_URI,headers:{'Content-Type':'application/x-www-form-urlencoded'},body:'grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion='+jwt, timeout: 10000});\nif (!tokenRes.access_token) throw new Error('Token failed');\nconst TOKEN = tokenRes.access_token;\nconst creds = $('Publicar Credenciales').item.json;\nconst s = $input.item.json;\nconst EP = creds.EP;\nconst PJ = creds.PJ;\nconst LOC = creds.LOC;\nconst MDL = creds.MDL_EXTEND;\nconst MAX_RETRIES = 8;\nconst RETRY_DELAY_MS = 30000;\n\nlet videoUri = '';\nfor (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {\n  const res = await this.helpers.httpRequest({\n    method: 'POST',\n    url: 'https://' + EP + '/v1/projects/' + PJ + '/locations/' + LOC + '/publishers/google/models/' + MDL + ':fetchPredictOperation',\n    headers: { 'Content-Type':'application/json', 'Authorization':'Bearer ' + TOKEN },\n    body: JSON.stringify({ operationName: s.op2 }),\n    timeout: 15000\n  });\n  videoUri = res.response?.videos?.[0]?.gcsUri || res.response?.videos?.[0]?.uri || '';\n  if (videoUri) break;\n  if (attempt < MAX_RETRIES) {\n    console.log('Part 2 (extend) not ready (attempt ' + attempt + '/' + MAX_RETRIES + '). Retrying in 30s...');\n    await new Promise(r => setTimeout(r, RETRY_DELAY_MS));\n  } else {\n    throw new Error('Part 2 (extend) not ready after ' + MAX_RETRIES + ' attempts: ' + JSON.stringify(res).substring(0, 400));\n  }\n}\n\nreturn [{ json: { video1_gcs_uri: s.video1_gcs_uri, video2_gcs_uri: videoUri, PROMPT_PART3: s.PROMPT_PART3, POST_ID: s.POST_ID, ORIGINAL_PROMPT: s.ORIGINAL_PROMPT, DURATION: s.DURATION } }];",
    };

    @node({
        name: 'Generate URLs',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [25360, 7792],
    })
    GenerateUrls = {
        jsCode: "// Generate V4 Signed URLs so browser can download videos\nconst crypto = require('crypto');\nconst s = $input.item.json;\nconst SA_EMAIL = 'vertex-veo@video-gen-msi.iam.gserviceaccount.com';\nconst SA_KEY = '-----BEGIN PRIVATE KEY-----\\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC4iP0eUO4malpt\\nVjv/Gx4s5UUtO6TGngM9RzUFRjo+h+P4BURbOxMwK0XvyMlG9wyES1I/rq1Z5eaP\\n3ADfGWzVucBCGxI5w7mh1FtkXe+Gcfc+jhw+erjvvm1dlEAf8OILEQ7X1kBmNIa0\\nr299nH30vnrtNjPpWPSY6nWeOhq1Q/XUeeXvV/l+zd2Cf0tLi9rVCkdsF2Gqff4r\\nikFmalpFohK0Mli9Hwm4NIgqhp6S1502gUcvat9x3b1wID+CFiE9t9N1758yvL0g\\n4YZl9Rze7WdYGp10jKMfK4mTnyQ2nLu27NusJ7dzCC7YCJqAZ8ZxhdTDGBiWIfQW\\nnH3/OcZLAgMBAAECggEABJY7HG7MjJ3mI4OaOCwXYuxL/OTXoqw4zmQfuELXnchI\\n7VhMK6xbPL5GncAy6JWpdPxeTgDshCiHw5mnV+RM5T8ZvUro+BCaY6BgqS0AkCnz\\nCFYF87OfNy5Xj5ToxyJ4q+e/o7PKo/+4PXOC5O9n3haB/bV0Mt+oLMjfJZCyK0E7\\nXvex3faWvA3Ca6NRyxZm8imFW/ymkLnD6c7mZKBXgOoDL+PJP/yI/DEF2aam5xIs\\n6sm+CXyRiAIsKazpnclqA/Z4tZwwtzYs+PO81SOt6Rc7WQsSzHqMUN6WY+3RLCXl\\nv8T4rRBa9eW4zx8YV3SBQHNEqevql1uODYLXoE60aQKBgQDmxfw+BSlKgfs/ZODz\\naVbWEGxZWNMF/RirEMjKO9edzJcvQu6NRC6CWFfcLTRc5iCOje6+a64U2xKjHNLw\\nBgTZyw6JGLdOo2vZHIMTIENBo14ykxxmN2TZ6mBpvGmxOMZ3LnVf4+1SUb3+su8C\\nW85Y91pjdQYFe6u8W99ptCQRjQKBgQDMtQ+s/1OBJ838WB6rHCpTugOuqdEURXd0\\nLGLUHgrv0jk7dnR9Z19TPjr0zU+ntakSl8+JW3NmFBb660F6by0gQgZgMgTf+eHB\\nbHLp8OjaAvZixY4xBfDQrxKWaLLXGkU7oLZGMBm0Izm7uF25r9wbIwamtOnrnYDW\\n6eaLtHtFNwKBgQCY/8ZecBmSFl83BnDFsJ8ryTOsgOFXZRfHwpb8zXQEYLITWXLD\\nIeMb8+o8RZQjy0bmfF8+zDFcDmpqzh9jlvn8U03Nwx80+c/035xfP9KXX/KB4VrA\\nwhURDPzi3VHNd3DNb3XOH1UmcJ9gj806aReDkGrS6bEWTYnslZSnhhEruQKBgDMy\\nqawD49euo+cUBv+WuMNeB6O8ly0xvpGQtFsG9IdMlcHYe4QNwZqpOseVPfHdDl83\\nFtHszGzgY2r4QdUkTy39NWkDuZJnBd6BiDAYb7Ru/z5u2IRMTxFyZ/y0TN5dlKk4\\nJb5iM1uJX9wiXVaetDcZSIWTQ9oI93tI3r9cMWR7AoGAVDHhXAmsTbRXSjbMYOwL\\nSP7NriO56s2N2l+PZX/bPz6gAcixmNEwtKYCuB50uX8W9YqfRvkhvELphguZ+y4g\\n3n1zq8IwSJT4ozoC/cQdt7CNQfgnF4VCjx23YBC1ankkI3NyUKfOwM/w8NNGKdHU\\nTCrcBjpqoSjnNp1pXh6IMTM=\\n-----END PRIVATE KEY-----\\n';\n\nfunction signUrl(gsUri) {\n  const m = gsUri.match(/^gs:\\/\\/([^\\/]+)\\/(.+)$/);\n  if (!m) return gsUri;\n  const bucket = m[1], objPath = m[2], host = 'storage.googleapis.com';\n  const d = new Date();\n  const pad = v => String(v).padStart(2, '0');\n  const ds = d.getUTCFullYear() + '' + pad(d.getUTCMonth()+1) + pad(d.getUTCDate());\n  const dt = ds + 'T' + pad(d.getUTCHours()) + pad(d.getUTCMinutes()) + pad(d.getUTCSeconds()) + 'Z';\n  const scope = ds + '/auto/storage/goog4_request';\n  const cred = SA_EMAIL + '/' + scope;\n  const qs = 'X-Goog-Algorithm=GOOG4-RSA-SHA256&X-Goog-Credential=' + encodeURIComponent(cred) + '&X-Goog-Date=' + dt + '&X-Goog-Expires=604800&X-Goog-SignedHeaders=host';\n  const objEnc = objPath.split('/').map(p => encodeURIComponent(p)).join('/');\n  const canon = 'GET\\n/' + bucket + '/' + objEnc + '\\n' + qs + '\\nhost:' + host + '\\n\\nhost\\nUNSIGNED-PAYLOAD';\n  const sts = 'GOOG4-RSA-SHA256\\n' + dt + '\\n' + scope + '\\n' + crypto.createHash('sha256').update(canon).digest('hex');\n  const sg = crypto.createSign('RSA-SHA256');\n  sg.update(sts);\n  return 'https://' + host + '/' + bucket + '/' + objEnc + '?' + qs + '&X-Goog-Signature=' + sg.sign(SA_KEY, 'hex');\n}\n\nreturn [{ json: {\n  video1_gcs_uri: s.video1_gcs_uri,\n  video2_gcs_uri: s.video2_gcs_uri,\n  video3_gcs_uri: s.video3_gcs_uri,\n  video1_url: signUrl(s.video1_gcs_uri),\n  video2_url: signUrl(s.video2_gcs_uri),\n  video3_url: signUrl(s.video3_gcs_uri),\n  POST_ID: s.POST_ID,\n  ORIGINAL_PROMPT: s.ORIGINAL_PROMPT,\n  DURATION: s.DURATION\n} }];",
    };

    @node({
        name: 'Update DB',
        type: 'n8n-nodes-base.postgres',
        version: 2.5,
        position: [25584, 7792],
        credentials: { postgres: { id: 'WnTYs2zvPoE7hDJE', name: 'Postgres account' } },
    })
    UpdateDb = {
        operation: 'executeQuery',
        query: "{{ $json.POST_ID && $json.POST_ID.length > 10 ? `UPDATE social_posts SET post_type = 'Video', video_part1_uri = '${$json.video1_gcs_uri}', video_part2_uri = '${$json.video2_gcs_uri}', video1_signed_url = '${$json.video1_url}', video2_signed_url = '${$json.video2_url}', video_part3_uri = '${$json.video3_gcs_uri}', video3_signed_url = '${$json.video3_url}', status = 'video_completed', updated_at = NOW() WHERE id = '${$json.POST_ID}' RETURNING *` : `INSERT INTO social_posts (post_type, status, headline, post_copy, image_url, video_part1_uri, video_part2_uri, video_part3_uri, video1_signed_url, video2_signed_url, video3_signed_url, created_at, updated_at) VALUES ('Video', 'video_completed', LEFT('${($json.ORIGINAL_PROMPT || '').replace(/'/g, \"''\")}', 120), '${($json.ORIGINAL_PROMPT || '').replace(/'/g, \"''\")}', '${$json.video1_url}', '${$json.video1_gcs_uri}', '${$json.video2_gcs_uri}', '${$json.video3_gcs_uri}', '${$json.video1_url}', '${$json.video2_url}', '${$json.video3_url}', NOW(), NOW()) RETURNING *` }}",
        options: {},
    };

    @node({
        name: 'Respond Success',
        type: 'n8n-nodes-base.respondToWebhook',
        version: 1.1,
        position: [25808, 7792],
    })
    RespondSuccess = {
        respondWith: 'json',
        responseBody:
            "={{ JSON.stringify({ success: true, message: 'Video generated and saved to database', data: { video1_url: $('Generate URLs').item.json.video1_url, video2_url: $('Generate URLs').item.json.video2_url, video3_url: $('Generate URLs').item.json.video3_url, video1_gcs_uri: $('Generate URLs').item.json.video1_gcs_uri, video2_gcs_uri: $('Generate URLs').item.json.video2_gcs_uri, video3_gcs_uri: $('Generate URLs').item.json.video3_gcs_uri, post_id: $('Update DB').item.json?.id || $('Generate URLs').item.json.POST_ID, db_saved: true, duration: (parseInt($('Generate URLs').item.json.DURATION) * 2) + 's', prompt: $('Generate URLs').item.json.ORIGINAL_PROMPT, service: $('Format Approved Input').item.json.SERVICE } }) }}",
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

    @node({
        name: 'Submit Part 3',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [24688, 7792],
    })
    SubmitPart3 = {
        jsCode: "// ============================================================\n// Submit Part 3 as VIDEO-TO-VIDEO EXTENSION (Call to Action) (not image-to-video)\n// Uses the GCS URI from Part 2 as the video input.\n// This leverages Veo 3.1's \"last second rule\" - the model samples\n// the last ~24 frames (1 second) of Part 1 to extract latent vectors\n// for voice timbre, visual identity, and motion continuity.\n// ============================================================\nconst crypto = require('crypto');\nconst SA_EMAIL = 'vertex-veo@video-gen-msi.iam.gserviceaccount.com';\nconst SA_KEY = '-----BEGIN PRIVATE KEY-----\\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC4iP0eUO4malpt\\nVjv/Gx4s5UUtO6TGngM9RzUFRjo+h+P4BURbOxMwK0XvyMlG9wyES1I/rq1Z5eaP\\n3ADfGWzVucBCGxI5w7mh1FtkXe+Gcfc+jhw+erjvvm1dlEAf8OILEQ7X1kBmNIa0\\nr299nH30vnrtNjPpWPSY6nWeOhq1Q/XUeeXvV/l+zd2Cf0tLi9rVCkdsF2Gqff4r\\nikFmalpFohK0Mli9Hwm4NIgqhp6S1502gUcvat9x3b1wID+CFiE9t9N1758yvL0g\\n4YZl9Rze7WdYGp10jKMfK4mTnyQ2nLu27NusJ7dzCC7YCJqAZ8ZxhdTDGBiWIfQW\\nnH3/OcZLAgMBAAECggEABJY7HG7MjJ3mI4OaOCwXYuxL/OTXoqw4zmQfuELXnchI\\n7VhMK6xbPL5GncAy6JWpdPxeTgDshCiHw5mnV+RM5T8ZvUro+BCaY6BgqS0AkCnz\\nCFYF87OfNy5Xj5ToxyJ4q+e/o7PKo/+4PXOC5O9n3haB/bV0Mt+oLMjfJZCyK0E7\\nXvex3faWvA3Ca6NRyxZm8imFW/ymkLnD6c7mZKBXgOoDL+PJP/yI/DEF2aam5xIs\\n6sm+CXyRiAIsKazpnclqA/Z4tZwwtzYs+PO81SOt6Rc7WQsSzHqMUN6WY+3RLCXl\\nv8T4rRBa9eW4zx8YV3SBQHNEqevql1uODYLXoE60aQKBgQDmxfw+BSlKgfs/ZODz\\naVbWEGxZWNMF/RirEMjKO9edzJcvQu6NRC6CWFfcLTRc5iCOje6+a64U2xKjHNLw\\nBgTZyw6JGLdOo2vZHIMTIENBo14ykxxmN2TZ6mBpvGmxOMZ3LnVf4+1SUb3+su8C\\nW85Y91pjdQYFe6u8W99ptCQRjQKBgQDMtQ+s/1OBJ838WB6rHCpTugOuqdEURXd0\\nLGLUHgrv0jk7dnR9Z19TPjr0zU+ntakSl8+JW3NmFBb660F6by0gQgZgMgTf+eHB\\nbHLp8OjaAvZixY4xBfDQrxKWaLLXGkU7oLZGMBm0Izm7uF25r9wbIwamtOnrnYDW\\n6eaLtHtFNwKBgQCY/8ZecBmSFl83BnDFsJ8ryTOsgOFXZRfHwpb8zXQEYLITWXLD\\nIeMb8+o8RZQjy0bmfF8+zDFcDmpqzh9jlvn8U03Nwx80+c/035xfP9KXX/KB4VrA\\nwhURDPzi3VHNd3DNb3XOH1UmcJ9gj806aReDkGrS6bEWTYnslZSnhhEruQKBgDMy\\nqawD49euo+cUBv+WuMNeB6O8ly0xvpGQtFsG9IdMlcHYe4QNwZqpOseVPfHdDl83\\nFtHszGzgY2r4QdUkTy39NWkDuZJnBd6BiDAYb7Ru/z5u2IRMTxFyZ/y0TN5dlKk4\\nJb5iM1uJX9wiXVaetDcZSIWTQ9oI93tI3r9cMWR7AoGAVDHhXAmsTbRXSjbMYOwL\\nSP7NriO56s2N2l+PZX/bPz6gAcixmNEwtKYCuB50uX8W9YqfRvkhvELphguZ+y4g\\n3n1zq8IwSJT4ozoC/cQdt7CNQfgnF4VCjx23YBC1ankkI3NyUKfOwM/w8NNGKdHU\\nTCrcBjpqoSjnNp1pXh6IMTM=\\n-----END PRIVATE KEY-----\\n';\nconst TOKEN_URI = 'https://oauth2.googleapis.com/token';\nfunction b64url(str) { return Buffer.from(str).toString('base64').replace(/\\+/g,'-').replace(/\\//g,'_').replace(/=/g,''); }\nfunction b64urlBuf(buf) { return buf.toString('base64').replace(/\\+/g,'-').replace(/\\//g,'_').replace(/=/g,''); }\nconst now = Math.floor(Date.now()/1000);\nconst hdr = b64url(JSON.stringify({alg:'RS256',typ:'JWT'}));\nconst pay = b64url(JSON.stringify({iss:SA_EMAIL,sub:SA_EMAIL,aud:TOKEN_URI,iat:now,exp:now+3600,scope:'https://www.googleapis.com/auth/cloud-platform'}));\nconst si = hdr + '.' + pay;\nconst signer = crypto.createSign('RSA-SHA256');\nsigner.update(si);\nconst jwt = si + '.' + b64urlBuf(signer.sign(SA_KEY));\nconst tokenRes = await this.helpers.httpRequest({method:'POST',url:TOKEN_URI,headers:{'Content-Type':'application/x-www-form-urlencoded'},body:'grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion='+jwt, timeout: 10000});\nif (!tokenRes.access_token) throw new Error('Token failed');\nconst TOKEN = tokenRes.access_token;\nconst creds = $('Publicar Credenciales').item.json;\nconst s = $input.item.json;\nconst EP = creds.EP;\nconst PJ = creds.PJ;\nconst LOC = creds.LOC;\nconst MDL = creds.MDL_EXTEND;\n\n// KEY DIFFERENCE: Use video.gcsUri + mimeType for video extension mode\n// Extension only supported on veo-3.1-generate-preview (NOT -001)\nconst veoRes = await this.helpers.httpRequest({\n  method: 'POST',\n  url: 'https://' + EP + '/v1/projects/' + PJ + '/locations/' + LOC + '/publishers/google/models/' + MDL + ':predictLongRunning',\n  headers: { 'Content-Type':'application/json', 'Authorization':'Bearer ' + TOKEN },\n  body: JSON.stringify({\n    instances: [{ prompt: s.PROMPT_PART3, video: { gcsUri: s.video2_gcs_uri, mimeType: 'video/mp4' } }],\n    parameters: { storageUri: creds.STORAGE_URI_PART3, sampleCount: 1, generateAudio: true, personGeneration: 'allow_all', negativePrompt: 'different voice, voice change, new speaker, different accent, different tone, different pitch, background music, soundtrack, instrumental music, musical score, ambient music, piano, guitar, drums, orchestra, synthesizer, melody, cinematic score, transition animation, fade, dissolve, wipe, crossfade, jump cut, abrupt transition, scene change, new background, different setting, camera cut, camera angle change, different camera angle, new camera position, zoom in, zoom out, dolly shot, pan away, camera shake, person stopping, stop walking, standing still, static pose, blurry, text, subtitles, watermark, frozen face, closed mouth, extra hands, extra fingers, extra arms, extra limbs, duplicate body parts, morphing body, waving hand, farewell gesture, goodbye wave, greeting gesture, animated ending, hand raising, peace sign, thumbs up' }\n  }),\n  timeout: 30000\n});\nif (!veoRes.name) throw new Error('Veo Part 3 (extend) failed: ' + JSON.stringify(veoRes).substring(0, 300));\n\nreturn [{ json: { op3: veoRes.name, video1_gcs_uri: s.video1_gcs_uri, video2_gcs_uri: s.video2_gcs_uri, DURATION: s.DURATION, POST_ID: s.POST_ID, ORIGINAL_PROMPT: s.ORIGINAL_PROMPT } }];",
    };

    @node({
        name: 'Wait Part 3',
        type: 'n8n-nodes-base.wait',
        version: 1.1,
        position: [24912, 7792],
    })
    WaitPart3 = {
        amount: 2,
        unit: 'minutes',
    };

    @node({
        name: 'Fetch Part 3',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [25136, 7792],
    })
    FetchPart3 = {
        jsCode: "const crypto = require('crypto');\nconst SA_EMAIL = 'vertex-veo@video-gen-msi.iam.gserviceaccount.com';\nconst SA_KEY = '-----BEGIN PRIVATE KEY-----\\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC4iP0eUO4malpt\\nVjv/Gx4s5UUtO6TGngM9RzUFRjo+h+P4BURbOxMwK0XvyMlG9wyES1I/rq1Z5eaP\\n3ADfGWzVucBCGxI5w7mh1FtkXe+Gcfc+jhw+erjvvm1dlEAf8OILEQ7X1kBmNIa0\\nr299nH30vnrtNjPpWPSY6nWeOhq1Q/XUeeXvV/l+zd2Cf0tLi9rVCkdsF2Gqff4r\\nikFmalpFohK0Mli9Hwm4NIgqhp6S1502gUcvat9x3b1wID+CFiE9t9N1758yvL0g\\n4YZl9Rze7WdYGp10jKMfK4mTnyQ2nLu27NusJ7dzCC7YCJqAZ8ZxhdTDGBiWIfQW\\nnH3/OcZLAgMBAAECggEABJY7HG7MjJ3mI4OaOCwXYuxL/OTXoqw4zmQfuELXnchI\\n7VhMK6xbPL5GncAy6JWpdPxeTgDshCiHw5mnV+RM5T8ZvUro+BCaY6BgqS0AkCnz\\nCFYF87OfNy5Xj5ToxyJ4q+e/o7PKo/+4PXOC5O9n3haB/bV0Mt+oLMjfJZCyK0E7\\nXvex3faWvA3Ca6NRyxZm8imFW/ymkLnD6c7mZKBXgOoDL+PJP/yI/DEF2aam5xIs\\n6sm+CXyRiAIsKazpnclqA/Z4tZwwtzYs+PO81SOt6Rc7WQsSzHqMUN6WY+3RLCXl\\nv8T4rRBa9eW4zx8YV3SBQHNEqevql1uODYLXoE60aQKBgQDmxfw+BSlKgfs/ZODz\\naVbWEGxZWNMF/RirEMjKO9edzJcvQu6NRC6CWFfcLTRc5iCOje6+a64U2xKjHNLw\\nBgTZyw6JGLdOo2vZHIMTIENBo14ykxxmN2TZ6mBpvGmxOMZ3LnVf4+1SUb3+su8C\\nW85Y91pjdQYFe6u8W99ptCQRjQKBgQDMtQ+s/1OBJ838WB6rHCpTugOuqdEURXd0\\nLGLUHgrv0jk7dnR9Z19TPjr0zU+ntakSl8+JW3NmFBb660F6by0gQgZgMgTf+eHB\\nbHLp8OjaAvZixY4xBfDQrxKWaLLXGkU7oLZGMBm0Izm7uF25r9wbIwamtOnrnYDW\\n6eaLtHtFNwKBgQCY/8ZecBmSFl83BnDFsJ8ryTOsgOFXZRfHwpb8zXQEYLITWXLD\\nIeMb8+o8RZQjy0bmfF8+zDFcDmpqzh9jlvn8U03Nwx80+c/035xfP9KXX/KB4VrA\\nwhURDPzi3VHNd3DNb3XOH1UmcJ9gj806aReDkGrS6bEWTYnslZSnhhEruQKBgDMy\\nqawD49euo+cUBv+WuMNeB6O8ly0xvpGQtFsG9IdMlcHYe4QNwZqpOseVPfHdDl83\\nFtHszGzgY2r4QdUkTy39NWkDuZJnBd6BiDAYb7Ru/z5u2IRMTxFyZ/y0TN5dlKk4\\nJb5iM1uJX9wiXVaetDcZSIWTQ9oI93tI3r9cMWR7AoGAVDHhXAmsTbRXSjbMYOwL\\nSP7NriO56s2N2l+PZX/bPz6gAcixmNEwtKYCuB50uX8W9YqfRvkhvELphguZ+y4g\\n3n1zq8IwSJT4ozoC/cQdt7CNQfgnF4VCjx23YBC1ankkI3NyUKfOwM/w8NNGKdHU\\nTCrcBjpqoSjnNp1pXh6IMTM=\\n-----END PRIVATE KEY-----\\n';\nconst TOKEN_URI = 'https://oauth2.googleapis.com/token';\nfunction b64url(str) { return Buffer.from(str).toString('base64').replace(/\\+/g,'-').replace(/\\//g,'_').replace(/=/g,''); }\nfunction b64urlBuf(buf) { return buf.toString('base64').replace(/\\+/g,'-').replace(/\\//g,'_').replace(/=/g,''); }\nconst now = Math.floor(Date.now()/1000);\nconst hdr = b64url(JSON.stringify({alg:'RS256',typ:'JWT'}));\nconst pay = b64url(JSON.stringify({iss:SA_EMAIL,sub:SA_EMAIL,aud:TOKEN_URI,iat:now,exp:now+3600,scope:'https://www.googleapis.com/auth/cloud-platform'}));\nconst si = hdr + '.' + pay;\nconst signer = crypto.createSign('RSA-SHA256');\nsigner.update(si);\nconst jwt = si + '.' + b64urlBuf(signer.sign(SA_KEY));\nconst tokenRes = await this.helpers.httpRequest({method:'POST',url:TOKEN_URI,headers:{'Content-Type':'application/x-www-form-urlencoded'},body:'grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion='+jwt, timeout: 10000});\nif (!tokenRes.access_token) throw new Error('Token failed');\nconst TOKEN = tokenRes.access_token;\nconst creds = $('Publicar Credenciales').item.json;\nconst s = $input.item.json;\nconst EP = creds.EP;\nconst PJ = creds.PJ;\nconst LOC = creds.LOC;\nconst MDL = creds.MDL_EXTEND;\nconst MAX_RETRIES = 8;\nconst RETRY_DELAY_MS = 30000;\n\nlet videoUri = '';\nfor (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {\n  const res = await this.helpers.httpRequest({\n    method: 'POST',\n    url: 'https://' + EP + '/v1/projects/' + PJ + '/locations/' + LOC + '/publishers/google/models/' + MDL + ':fetchPredictOperation',\n    headers: { 'Content-Type':'application/json', 'Authorization':'Bearer ' + TOKEN },\n    body: JSON.stringify({ operationName: s.op3 }),\n    timeout: 15000\n  });\n  videoUri = res.response?.videos?.[0]?.gcsUri || res.response?.videos?.[0]?.uri || '';\n  if (videoUri) break;\n  if (attempt < MAX_RETRIES) {\n    console.log('Part 3 (extend) not ready (attempt ' + attempt + '/' + MAX_RETRIES + '). Retrying in 30s...');\n    await new Promise(r => setTimeout(r, RETRY_DELAY_MS));\n  } else {\n    throw new Error('Part 3 (extend) not ready after ' + MAX_RETRIES + ' attempts: ' + JSON.stringify(res).substring(0, 400));\n  }\n}\n\nreturn [{ json: { video1_gcs_uri: s.video1_gcs_uri, video2_gcs_uri: s.video2_gcs_uri, video3_gcs_uri: videoUri, POST_ID: s.POST_ID, ORIGINAL_PROMPT: s.ORIGINAL_PROMPT, DURATION: s.DURATION } }];",
    };

    // =====================================================================
    // ROUTAGE ET CONNEXIONS
    // =====================================================================

    @links()
    defineRouting() {
        this.WebhookVideoApproved.out(0).to(this.PublicarCredenciales.in(0));
        this.PublicarCredenciales.out(0).to(this.FormatApprovedInput.in(0));
        this.FormatApprovedInput.out(0).to(this.DownloadImage1.in(0));
        this.DownloadImage1.out(0).to(this.SubmitPart1.in(0));
        this.SubmitPart1.out(0).to(this.WaitPart1.in(0));
        this.WaitPart1.out(0).to(this.FetchPart1.in(0));
        this.FetchPart1.out(0).to(this.SubmitPart2.in(0));
        this.SubmitPart2.out(0).to(this.WaitPart2.in(0));
        this.WaitPart2.out(0).to(this.FetchPart2.in(0));
        this.FetchPart2.out(0).to(this.SubmitPart3.in(0));
        this.GenerateUrls.out(0).to(this.UpdateDb.in(0));
        this.UpdateDb.out(0).to(this.RespondSuccess.in(0));
        this.SubmitPart3.out(0).to(this.WaitPart3.in(0));
        this.WaitPart3.out(0).to(this.FetchPart3.in(0));
        this.FetchPart3.out(0).to(this.GenerateUrls.in(0));
    }
}
