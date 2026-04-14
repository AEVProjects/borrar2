// Configuration file for MSI Social Media Manager
// 
// IMPORTANTE: Esta es una aplicación FRONTEND (solo navegador)
// - NO uses archivos .env (esos son para backend/Node.js)
// - Usa este archivo config.js para configuración del cliente
//
// INSTRUCCIONES:
// 1. Copia este archivo: copy config.example.js config.js
// 2. Edita config.js con tus valores reales
// 3. config.js está en .gitignore (no se subirá a Git)
// 4. Para Vercel: los valores se cargan directamente del navegador

window.APP_CONFIG = {
    // Supabase Configuration
    // Obtén estos valores en: https://app.supabase.com/project/[tu-proyecto]/settings/api
    supabase: {
        url: 'https://vahqhxfdropstvklvzej.supabase.co',
        anonKey: 'sb_publishable_xt7qY64rVMowaSris2Zs0Q_2DEbzjpy'
    },
    
    // n8n Webhook URLs
    // Obtén estos valores activando los workflows en n8n
    n8n: {
        publishWebhook: 'https://n8nmsi.app.n8n.cloud/webhook/025d6de3-6b46-41c2-839d-58a8b18b649f',  // Del workflow "On form submission"
        generateWebhook: 'https://n8nmsi.app.n8n.cloud/webhook/70738d02-4bd8-4dac-853f-ba4836aafaf5', // Del workflow "MSI Content Form"
        editWebhook: 'https://n8nmsi.app.n8n.cloud/webhook/msi-image-edit', // Del workflow "MSI Image Edit Flow"
        videoWebhook: 'https://n8nmsi.app.n8n.cloud/webhook/msi-video-gen', // Del workflow "MSI Video Generation - Veo 3"
        videoPreviewWebhook: 'https://n8nmsi.app.n8n.cloud/webhook/msi-video-preview', // Del workflow "Video Script Preview"
        videoApprovedWebhook: 'https://n8nmsi.app.n8n.cloud/webhook/msi-video-approved-gen', // Del workflow "Video Generate Approved"
        carouselWebhook: 'https://n8nmsi.app.n8n.cloud/webhook/msi-carousel-v12', // Del workflow "MSI Carousel v12" - ACTUALIZADO
        inputGeneratorWebhook: 'https://n8nmsi.app.n8n.cloud/webhook/msi-carousel-v12', // Flujo unificado v12 - ACTUALIZADO
        dailyWebhook: 'https://n8nmsi.app.n8n.cloud/webhook/msi-auto-daily', // Del workflow "MSI Auto Daily"
        trendsWebhook: 'https://n8nmsi.app.n8n.cloud/webhook/msi-trends-content', // Del workflow "MSI Trends Content Flow"
        voiceVideoWebhook: 'https://n8nmsi.app.n8n.cloud/webhook/msi-video-extend', // Del workflow "Voice Video Extend" - Image-to-Video + Video Extension
        educativeWebhook: 'https://n8nmsi.app.n8n.cloud/webhook/msi-educative-carousel', // Del workflow "MSI Educative Carousel Gen Flow" (legacy full pipeline)
        educativeContentWebhook: 'https://n8nmsi.app.n8n.cloud/webhook/msi-educative-content-gen', // Del workflow "MSI Educative Content Gen" (solo contenido, sin imágenes)
        educativeSlideImageWebhook: 'https://n8nmsi.app.n8n.cloud/webhook/msi-educative-slide-gen', // Del workflow "MSI Educative Slide Image Gen v2" (genera imagen por slide)
        voiceSwapWebhook: 'https://n8nmsi.app.n8n.cloud/webhook/msi-voice-swap', // Del workflow "MSI Voice Swap - ElevenLabs"
        schedulerWebhook: 'https://n8nmsi.app.n8n.cloud/webhook/msi-scheduler-run', // Del workflow "MSI Content Scheduler"
        emailOutreachWebhook: 'https://n8nmsi.app.n8n.cloud/webhook/msi-outbound-email', // Del workflow "Outbound Email Qualifier - Supabase"
        profileScraperWebhook: 'https://n8nmsi.app.n8n.cloud/webhook/msi-profile-scraper', // Del workflow "MSI Profile Scraper"
        linkedinToApolloWebhook: 'https://n8nmsi.app.n8n.cloud/webhook/msi-linkedin-to-apollo', // Del workflow "LinkedIn to Apollo Outreach"
        linkedinSearchWebhook: 'https://n8nmsi.app.n8n.cloud/webhook/msi-linkedin-search', // Del workflow "MSI LinkedIn Lead Search" (Google CSE - GRATIS)
        aiMessagesWebhook: 'https://n8nmsi.app.n8n.cloud/webhook/msi-ai-messages' // Del workflow "MSI AI Message Generator" - Genera mensajes personalizados con Gemini
    },
    
    // Apollo.io Configuration
    // Required for sending emails through Apollo sequences
    // Get your Master API key at: https://app.apollo.io/#/settings/integrations/api
    // You MUST use a Master API key (not regular) for sequence operations
    apollo: {
        apiKey: 'YOUR_APOLLO_MASTER_API_KEY',
        // Email account ID: run GET https://api.apollo.io/api/v1/email_accounts to find it
        emailAccountId: 'YOUR_APOLLO_EMAIL_ACCOUNT_ID',
        // Map each industry to an Apollo Sequence ID
        // Create sequences in Apollo UI (use templates from docs/EMAIL_OUTREACH_GUIDE.md)
        // Then find IDs via API: POST https://api.apollo.io/api/v1/emailer_campaigns/search
        sequenceMap: {
            'Financial Services': 'SEQ_ID_FINANCIAL',
            'Healthcare': 'SEQ_ID_HEALTHCARE',
            'Retail': 'SEQ_ID_RETAIL',
            'Manufacturing': 'SEQ_ID_MANUFACTURING',
            'Technology': 'SEQ_ID_TECHNOLOGY',
            'Energy': 'SEQ_ID_ENERGY',
            'Education': 'SEQ_ID_EDUCATION',
            'Legal': 'SEQ_ID_LEGAL',
            'Real Estate': 'SEQ_ID_REAL_ESTATE',
            'Logistics': 'SEQ_ID_LOGISTICS',
            'Telecommunications': 'SEQ_ID_TELECOM',
            'General': 'SEQ_ID_GENERAL'
        }
    },
    
    // Google Cloud / Gemini Configuration
    // Used for image generation (Gemini) and video generation (Vertex AI - Veo)
    // Steps to create a new API key:
    //   1. Go to https://console.cloud.google.com/apis/credentials
    //   2. Select your project (or create a new one)
    //   3. Click "+ CREATE CREDENTIALS" → "API key"
    //   4. Enable "Generative Language API" in APIs & Services → Library
    //   5. Copy the key here AND update it in n8n credentials
    // In n8n: Credentials → "Google Gemini(PaLM) Api account" → paste new key
    // This SAME key is used by 10+ workflows for image generation
    google: {
        geminiApiKey: 'YOUR_GOOGLE_GEMINI_API_KEY',
        // Google Cloud Project ID (for Vertex AI / Veo video generation)
        projectId: 'gen-lang-client-0521438560'
    },
    
    // Security token - Este valor NO se puede cambiar desde el frontend
    // Si necesitas rotarlo, cambia este valor y actualiza n8n
    webhookToken: 'msi_2024_secure_e8f4a9c2b1d5',
    
    // App Access Password
    // Contraseña para acceder a la aplicación
    // Comparte esta contraseña solo con usuarios autorizados
    appPassword: 'Msi@2026#SecureApp!x7K'
};
