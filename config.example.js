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
        carouselWebhook: 'https://n8nmsi.app.n8n.cloud/webhook/msi-carousel-gen', // Del workflow "MSI Carousel Generation"
        inputGeneratorWebhook: 'https://n8nmsi.app.n8n.cloud/webhook/msi-input-generator', // Del workflow "News Input Generator for Carousel" - NUEVO
        dailyWebhook: 'https://n8nmsi.app.n8n.cloud/webhook/msi-auto-daily', // Del workflow "MSI Auto Daily"
        trendsWebhook: 'https://n8nmsi.app.n8n.cloud/webhook/msi-trends-content' // Del workflow "MSI Trends Content Flow"
    },
    
    // Security token - Este valor NO se puede cambiar desde el frontend
    // Si necesitas rotarlo, cambia este valor y actualiza n8n
    webhookToken: 'msi_2024_secure_e8f4a9c2b1d5',
    
    // App Access Password
    // Contraseña para acceder a la aplicación
    // Comparte esta contraseña solo con usuarios autorizados
    appPassword: 'Msi@2026#SecureApp!x7K'
};
