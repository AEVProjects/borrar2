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
        educativeWebhook: 'https://n8nmsi.app.n8n.cloud/webhook/msi-educative-carousel', // Del workflow "MSI Educative Carousel Gen Flow"
        voiceSwapWebhook: 'https://n8nmsi.app.n8n.cloud/webhook/msi-voice-swap', // Del workflow "MSI Voice Swap - ElevenLabs"
        schedulerWebhook: 'https://n8nmsi.app.n8n.cloud/webhook/msi-scheduler-run', // Del workflow "MSI Content Scheduler"
        emailOutreachWebhook: 'https://n8nmsi.app.n8n.cloud/webhook/msi-email-outreach' // Del workflow "MSI Email Outreach"
    },
    
    // Apollo.io Configuration
    // Required for sending emails through Apollo sequences
    // Get your Master API key at: https://app.apollo.io/#/settings/integrations/api
    // You MUST use a Master API key (not regular) for sequence operations
    apollo: {
        apiKey: 'YOUR_APOLLO_MASTER_API_KEY',
        // Email account ID: run GET https://api.apollo.io/api/v1/email_accounts to find it
        emailAccountId: 'YOUR_APOLLO_EMAIL_ACCOUNT_ID',
        // Map each MSI service to an Apollo Sequence ID
        // Create sequences in Apollo UI first, then find IDs via API:
        // POST https://api.apollo.io/api/v1/emailer_campaigns/search
        sequenceMap: {
            'Cybersecurity': 'SEQUENCE_ID_HERE',
            'Cloud Migration': 'SEQUENCE_ID_HERE',
            'AI Integration': 'SEQUENCE_ID_HERE',
            'IT Infrastructure Modernization': 'SEQUENCE_ID_HERE',
            'Managed IT Services': 'SEQUENCE_ID_HERE',
            'Data Analytics': 'SEQUENCE_ID_HERE',
            'Network Security': 'SEQUENCE_ID_HERE',
            'Digital Transformation': 'SEQUENCE_ID_HERE'
        }
    },
    
    // Security token - Este valor NO se puede cambiar desde el frontend
    // Si necesitas rotarlo, cambia este valor y actualiza n8n
    webhookToken: 'msi_2024_secure_e8f4a9c2b1d5',
    
    // App Access Password
    // Contraseña para acceder a la aplicación
    // Comparte esta contraseña solo con usuarios autorizados
    appPassword: 'Msi@2026#SecureApp!x7K'
};
