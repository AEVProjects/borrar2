# LED Batch Management - Web Integration Guide

## Overview

Los datos del batch "Workshop Leds" (40 contactos importados) ahora son completamente accesibles desde la página web con:

- ✅ Interfaz dedicada para ver todos los LEDs
- ✅ Visualización mejorada de mensajes de AI
- ✅ Exportación a CSV
- ✅ Generación de mensajes de AI desde la web
- ✅ Estadísticas en tiempo real

## Características

### 📊 Dashboard de LEDs

- **Stage exclusivo**: `stage = 'leds'` (separado de producción y test)
- **Batch**: `Workshop Leds` (Batch ID: 1)
- **Total de contactos**: 40
- **Acceso desde la web**: Sí, con interfaz mejorada

### 📧 Mensajes de AI Mejorados

Los mensajes de AI se muestran en un modal mejorado con:

- Información del contacto
- 3 emails personalizados (Introducción, Follow-up, Final)
- Asuntos y cuerpos de email formateados
- Botones de copiar individuales y grupal

## Instalación en app.js

### Paso 1: Incluir el script del LED Manager

Agrega esto en `index.html` antes de cerrar el `</body>`:

```html
<!-- LED Batch Manager -->
<script src="js/led-batch-manager.js"></script>

<!-- AI Messages Modal Enhancement -->
<link rel="stylesheet" href="ai-messages-modal.html" />
<script>
  // Initialize LED view cuando se necesite
</script>
```

### Paso 2: Agregar botón en la interfaz de navegación

En `index.html`, agrega un nuevo tab en la navegación:

```html
<button class="tab-btn" data-mode="leds">
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
  >
    <circle cx="12" cy="12" r="10"></circle>
    <path d="M12 6v6l4 2"></path>
  </svg>
  LED Batch
</button>
```

### Paso 3: Agregar handler en app.js

En la sección de tab navigation, agrega:

```javascript
else if (mode === 'leds') {
    ledsMode?.classList.add('active');
    initLEDBatchView();
}
```

## API Endpoints

Si utilizas un backend Node.js, puedes usar estos endpoint:

### GET /api/leds

Obtiene todos los LEDs del stage 'leds'

```bash
curl https://tu-api.com/api/leds
```

Response:

```json
{
  "success": true,
  "count": 40,
  "data": [
    {
      "id": 1,
      "first_name": "Graham",
      "last_name": "Cross",
      "email": "graham.cross@ct.me",
      "company_name": "CT: Accountants Advisers",
      "title": "CFO",
      "stage": "leds",
      "batch_name": "Workshop Leds",
      "ai_message_status": "pending",
      "personalized_message": null
    }
  ]
}
```

### GET /api/leds/messages

Obtiene solo LEDs con mensajes de AI generados

```bash
curl https://tu-api.com/api/leds/messages
```

### GET /api/leds/:id

Obtiene detalles de un LED específico con sus mensajes

```bash
curl https://tu-api.com/api/leds/1
```

Response:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "first_name": "Graham",
    "email": "graham.cross@ct.me",
    "ai_message_status": "generated",
    "message_count": 3,
    "messages": {
      "email1": {
        "subject": "Exclusive Financial Systems Opportunity for CFOs",
        "body": "Dear Graham,\n\nAs CFO at CT: Accountants Advisers..."
      },
      "email2": {
        "subject": "Follow-up: Strategic Partnership",
        "body": "Hi Graham,\n\nI wanted to circle back..."
      },
      "email3": {
        "subject": "Final Opportunity Before Close",
        "body": "Graham,\n\nThis is the final message..."
      }
    }
  }
}
```

### GET /api/leds/batch

Obtiene información del batch

```bash
curl https://tu-api.com/api/leds/batch
```

### GET /api/leds/stats

Obtiene estadísticas del batch

```bash
curl https://tu-api.com/api/leds/stats
```

Response:

```json
{
  "success": true,
  "stats": {
    "total_leads": 40,
    "with_ai_messages": 15,
    "generating_messages": 3,
    "pending_messages": 22,
    "seniority_distribution": {
      "C suite": 32,
      "Vp": 5,
      "Entry": 1,
      "Manager": 2
    }
  }
}
```

## Cómo Usar desde la Web

### 1. Ver Dashboard de LEDs

1. Navega a la pestaña "LED Batch" en la interfaz
2. Se cargarán automáticamente los 40 contactos
3. Verás estadísticas en tiempo real:
   - Total de leads
   - AI Messages listos
   - Mensajes en generación
   - Pendientes

### 2. Ver Mensajes de AI

1. Clic en el botón "View Messages" de un contacto
2. Se abre un modal con los 3 emails personalizados
3. Puedes:
   - Ver el asunto y cuerpo de cada email
   - Copiar un email individual
   - Copiar todos los emails juntos

### 3. Generar Mensajes de AI

1. Clic en el botón "Generate AI Messages"
2. Los mensajes se generarán automáticamente
3. El estado se actualiza en tiempo real
4. Los mensajes aparecerán cuando estén listos

### 4. Exportar a CSV

1. Clic en "Export CSV"
2. Se descargará un archivo con todos los LEDs
3. Incluye información de mensajes de AI

## Acceso por Supabase

Si prefieres acceder directamente a Supabase:

### Query para obtener todos los LEDs

```sql
SELECT *
FROM apollo_leads
WHERE stage = 'leds'
ORDER BY id;
```

### Query para obtener LEDs con mensajes

```sql
SELECT *
FROM apollo_leads
WHERE stage = 'leds'
AND ai_message_status = 'generated'
ORDER BY ai_message_generated_at DESC;
```

### Query para estadísticas

```sql
SELECT
  COUNT(*) as total,
  SUM(CASE WHEN ai_message_status='generated' THEN 1 ELSE 0 END) as with_messages,
  SUM(CASE WHEN ai_message_status='generating' THEN 1 ELSE 0 END) as generating,
  SUM(CASE WHEN ai_message_status IS NULL THEN 1 ELSE 0 END) as pending
FROM apollo_leads
WHERE stage = 'leds';
```

## Información Técnica

### Batch Details

- **ID del Batch**: 1
- **Nombre**: "Workshop Leds"
- **Stage**: "leds" (sin stage = "leds" es fácil filtrar de otros stages)
- **Total Leads**: 40
- **Creado**: 12 de Marzo, 2026
- **Acceso**: Público desde web y API

### Database Columns Disponibles

```
- id (BIGINT)
- first_name, last_name (TEXT)
- title (TEXT)
- company_name (TEXT)
- email (TEXT)
- seniority (TEXT)
- city, state, country (TEXT)
- stage = 'leds' (TEXT)
- batch_id = 1 (BIGINT)
- batch_name = 'Workshop Leds' (TEXT)
- ai_message_status (TEXT: pending | generating | generated | error)
- personalized_message (TEXT)
- personalized_subject1 (TEXT)
- personalized_followup (TEXT)
- personalized_subject2 (TEXT)
- personalized_email3 (TEXT)
- personalized_subject3 (TEXT)
- ai_message_generated_at (TIMESTAMP)
```

## Integración con n8n Workflow

Los mensajes se generan usando el workflow "MSI AI Message Generator" en n8n:

1. El workflow obtiene los LEDs del stage 'leds'
2. Usa Gemini AI para generar emails personalizados
3. Actualiza `ai_message_status` a "generated"
4. Los emails aparecen en la web automáticamente

## Troubleshooting

### No se cargan los datos

- Verifica que Supabase esté configurado en app.js
- Confirma que tienes acceso a la base de datos

### No se ven los mensajes de AI

- Los mensajes solo se muestran si `ai_message_status = 'generated'`
- Si está en 'pending', haz clic en "Generate AI Messages"

### Los emails no aparecen después de generar

- Espera unos segundos, el sistema se actualiza cada 30 segundos
- Haz clic en "Refresh Data" para actualizar manualmente

## Próximas mejoras

- [ ] Integración con Apollo.io para envío masivo
- [ ] Seguimiento de apertures de email desde la web
- [ ] Respuestas automáticas de LinkedIn
- [ ] Dashboard de KPIs por lead
- [ ] Bulk editing de mensajes

## Support

Para preguntas o problemas:

1. Revisa logs en Supabase
2. Verifica n8n workflow status
3. Consulta la sección de errores en la web

---

**Última actualización**: 12 de Marzo, 2026
**Estado**: ✅ Producción
