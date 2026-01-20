# Vertex AI Veo 3.1 - Service Account Setup Guide

## Why Service Account Authentication?

Vertex AI API **requires OAuth2** authentication - API keys are not supported. The workflow now uses **Service Account** authentication which:
- Generates OAuth2 tokens automatically
- No need for n8n credential system
- Works exactly like the Python SDK example you provided

## Step-by-Step Setup

### 1. Create Service Account in Google Cloud

Go to: https://console.cloud.google.com/iam-admin/serviceaccounts?project=gen-lang-client-0521438560

**Create New Service Account:**
- Name: `n8n-vertex-ai`
- Description: "Service account for n8n Vertex AI video generation"
- Click "Create and Continue"

### 2. Grant Vertex AI Permissions

**Add Role:**
- Role: `Vertex AI User`
- Click "Continue" → "Done"

### 3. Generate JSON Key

**Create Key:**
- Click on the newly created Service Account name
- Go to "Keys" tab
- Click "Add Key" → "Create new key"
- Select format: **JSON**
- Click "Create"

A JSON file will be downloaded (e.g., `gen-lang-client-0521438560-abc123.json`)

### 4. Configure n8n Workflow

**Open the downloaded JSON file** - it looks like this:

```json
{
  "type": "service_account",
  "project_id": "gen-lang-client-0521438560",
  "private_key_id": "abc123def456...",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n",
  "client_email": "n8n-vertex-ai@gen-lang-client-0521438560.iam.gserviceaccount.com",
  "client_id": "123456789012345678901",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/n8n-vertex-ai%40gen-lang-client-0521438560.iam.gserviceaccount.com"
}
```

**In n8n:**
1. Import `video-gen.json` into n8n
2. Open the **"Merge with Logo"** Code node
3. Find line ~115 where it says `const SERVICE_ACCOUNT_JSON = {...}`
4. **Replace the entire object** with your actual Service Account JSON (copy-paste ALL fields)

⚠️ **IMPORTANT:** Keep the `private_key` field intact with all `\n` characters for line breaks!

### 5. Test the Workflow

**Trigger the webhook** with:
```bash
curl -X POST https://your-n8n-url/webhook/msi-video-gen \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A serene sunset over calm ocean waters",
    "duration": "8s",
    "style": "cinematic"
  }'
```

## How It Works

The workflow now:

1. **Downloads MSI logo** from URL
2. **Generates OAuth2 token** using Service Account credentials
   - Creates JWT (JSON Web Token)
   - Signs with private key
   - Exchanges JWT for access token
3. **Calls Vertex AI** with proper authentication
   - Endpoint: `https://us-central1-aiplatform.googleapis.com/v1/.../veo-3.1-generate-001:generateVideos`
   - Model: `veo-3.1-generate-001` (same as Python SDK)
   - Authorization: `Bearer {access_token}`
4. **Includes logo** as reference image in base64
5. **Uploads to YouTube** when video is ready

## Request Format

The API request matches the Python SDK structure:

```json
{
  "instances": [{
    "prompt": "your video prompt with MSI logo watermark",
    "referenceImages": [{
      "image": {
        "bytesBase64Encoded": "base64_encoded_logo",
        "mimeType": "image/png"
      },
      "referenceType": "asset"
    }]
  }],
  "parameters": {
    "aspectRatio": "9:16",
    "durationSeconds": 8,
    "sampleCount": 1,
    "generateAudio": true,
    "resolution": "720p"
  }
}
```

## Troubleshooting

### "Authorization failed" Error
- **Check:** Service Account has `Vertex AI User` role
- **Check:** Project ID matches: `gen-lang-client-0521438560`
- **Check:** private_key is complete (including BEGIN/END lines)

### "Invalid JWT" Error
- **Check:** All JSON fields are properly copied (no truncation)
- **Check:** `client_email` format is correct
- **Check:** No extra spaces or line breaks in JSON

### "Model not found" Error
- **Check:** Vertex AI API is enabled in Google Cloud Console
- **Check:** Using correct endpoint: `veo-3.1-generate-001`
- **Check:** Region is `us-central1`

## Security Note

The Service Account JSON contains sensitive credentials. In n8n:
- Keep it in the Code node (not exposed in API logs)
- Don't commit to public Git repositories
- Consider using n8n environment variables in production

Alternatively, for production use, store the JSON in n8n's Settings → Variables (if available in your n8n version).

## Comparison: API Key vs OAuth2

| Authentication | generativelanguage.googleapis.com | Vertex AI |
|----------------|-----------------------------------|-----------|
| API Key        | ✅ Supported                      | ❌ Not supported |
| OAuth2         | ❌ Not required                   | ✅ Required |
| Image Reference| ❌ Limited support                | ✅ Full support |
| Model          | veo-3.0-generate-preview          | veo-3.1-generate-001 |

## Next Steps

Once configured:
1. Test with a simple prompt
2. Verify logo appears in bottom-right corner
3. Check YouTube upload works
4. Integrate with your MSI content generation pipeline
