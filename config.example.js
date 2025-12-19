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
        anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhaHFoeGZkcm9wc3R2a2x2emVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2MjcyMDUsImV4cCI6MjA1MDIwMzIwNX0.sb_publishable_xt7qY64rVMowaSris2Zs0Q_2DEbzjpy' // La clave "anon/public" (es seguro exponerla en frontend)
    },
    
    // n8n Webhook URLs
    // Obtén estos valores activando los workflows en n8n
    n8n: {
        publishWebhook: 'https://n8nmsi.app.n8n.cloud/webhook/025d6de3-6b46-41c2-839d-58a8b18b649f',  // Del workflow "On form submission"
        generateWebhook: 'https://n8nmsi.app.n8n.cloud/webhook/70738d02-4bd8-4dac-853f-ba4836aafaf5' // Del workflow "MSI Content Form"
    }
};
