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
    // ⚠️ ACCIÓN REQUERIDA: Obtén tu clave real de Supabase
    // 1. Ve a: https://app.supabase.com/project/vahqhxfdropstvklvzej/settings/api
    // 2. Busca la sección "Project API keys"
    // 3. Copia la clave "anon" "public" (la que es MUY larga, aprox 200+ caracteres)
    // 4. Pégala abajo reemplazando 'TU_ANON_KEY_AQUI'
    supabase: {
        url: 'https://vahqhxfdropstvklvzej.supabase.co',
        anonKey: 'TU_ANON_KEY_AQUI'  // ⚠️ REEMPLAZAR con la clave real de Supabase
    },
    
    // n8n Webhook URLs
    // Obtén estos valores activando los workflows en n8n
    n8n: {
        publishWebhook: 'https://n8nmsi.app.n8n.cloud/webhook/025d6de3-6b46-41c2-839d-58a8b18b649f',  // Del workflow "On form submission"
        generateWebhook: 'https://n8nmsi.app.n8n.cloud/webhook/70738d02-4bd8-4dac-853f-ba4836aafaf5' // Del workflow "MSI Content Form"
    },
    
    // Security token - Este valor NO se puede cambiar desde el frontend
    // Si necesitas rotarlo, cambia este valor y actualiza n8n
    webhookToken: 'msi_2024_secure_e8f4a9c2b1d5'
};
