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
        url: 'YOUR_SUPABASE_URL',        // Ejemplo: https://abcdefgh.supabase.co
        anonKey: 'YOUR_SUPABASE_ANON_KEY' // La clave "anon/public" (es seguro exponerla en frontend)
    },
    
    // n8n Webhook URLs
    // Obtén estos valores activando los workflows en n8n
    n8n: {
        publishWebhook: 'YOUR_N8N_PUBLISH_WEBHOOK_URL',  // Del workflow "On form submission"
        generateWebhook: 'YOUR_N8N_GENERATE_WEBHOOK_URL' // Del workflow "MSI Content Form"
    }
};
