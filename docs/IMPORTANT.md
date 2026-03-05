# ⚠️ IMPORTANTE: Configuración Frontend vs Backend

## ¿Por qué NO usar .env en esta aplicación?

### Esta es una aplicación FRONTEND (100% navegador)

- ✅ HTML, CSS, JavaScript vanilla
- ✅ Se ejecuta completamente en el navegador del usuario
- ✅ Vercel la sirve como archivos estáticos
- ❌ NO tiene servidor Node.js
- ❌ NO puede leer archivos `.env`

### ¿Qué es .env entonces?

`.env` es para aplicaciones **BACKEND** (Node.js, Python, etc.):

```
Backend (Node.js) → Lee .env → Ejecuta en servidor → Oculta secretos
Frontend (Browser) → Lee config.js → Ejecuta en navegador → Valores públicos
```

## ✅ Configuración CORRECTA para esta app

### Usa config.js

```javascript
// config.js (en el navegador)
window.APP_CONFIG = {
  supabase: {
    url: "https://xxx.supabase.co",
    anonKey: "eyJ...", // Esta key es PÚBLICA (diseñada para frontend)
  },
  n8n: {
    publishWebhook: "https://...",
    generateWebhook: "https://...",
  },
};
```

### ¿Es seguro exponer estas claves?

| Clave             | ¿Seguro? | ¿Por qué?                                  |
| ----------------- | -------- | ------------------------------------------ |
| Supabase URL      | ✅ Sí    | Es pública por diseño                      |
| Supabase anon key | ✅ Sí    | Está limitada por Row Level Security (RLS) |
| n8n Webhooks      | ✅ Sí    | Solo reciben POST, no exponen datos        |

**Importante**: La seguridad de Supabase viene de las **políticas RLS**, no de ocultar la key.

## 🚀 Para Vercel

Vercel sirve tu app como archivos estáticos:

1. Sube los archivos (HTML, CSS, JS, config.js)
2. Vercel los sirve directamente al navegador
3. El navegador carga `config.js` y ejecuta `app.js`
4. Todo funciona ✅

## 🔒 Si necesitaras secrets REALES

Si tuvieras claves que NO deben ser públicas (API keys privadas, passwords):

1. Necesitarías un backend (API Routes de Vercel, Serverless Functions)
2. Ahí sí usarías variables de entorno en Vercel
3. El frontend llamaría a tu API, no directamente a servicios externos

**Pero en esta app NO lo necesitas** porque:

- Supabase anon key es pública por diseño
- n8n webhooks son públicos (solo reciben datos)
- No hay secrets reales que proteger

## 📝 Resumen

```
❌ NO USES .env → No funciona en frontend estático
✅ USA config.js → Perfecto para frontend
✅ Sube config.js a Vercel → Es seguro
✅ Todo funciona en el navegador → Sin servidor Node.js
```

## 🎯 Pasos finales

1. Elimina cualquier archivo `.env` o `.env.example`
2. Copia `config.example.js` → `config.js`
3. Edita `config.js` con tus valores
4. Sube todo a Vercel (incluyendo config.js)
5. ¡Listo! ✨

---

**TL;DR**: Frontend = config.js ✅ | Backend = .env ✅ | Esta app es frontend = usa config.js
