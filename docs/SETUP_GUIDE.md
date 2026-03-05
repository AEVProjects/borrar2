# 🔧 Guía de Configuración - MSI Social Media Manager

## 📋 Índice

1. [Configuración de Supabase](#1-configuración-de-supabase)
2. [Configuración de n8n - Flujo de Publicación](#2-configuración-de-n8n---flujo-de-publicación)
3. [Configuración de n8n - Flujo de Generación](#3-configuración-de-n8n---flujo-de-generación)
4. [Configuración de la Aplicación](#4-configuración-de-la-aplicación)
5. [Despliegue en Vercel](#5-despliegue-en-vercel)
6. [Pruebas](#6-pruebas)

---

## 1. Configuración de Supabase

### Paso 1.1: Crear Proyecto

1. Ve a [https://supabase.com](https://supabase.com)
2. Haz clic en "New Project"
3. Completa:
   - **Name**: MSI Social Media
   - **Database Password**: (guarda esto de forma segura)
   - **Region**: Selecciona la más cercana
4. Espera 2-3 minutos a que el proyecto se cree

### Paso 1.2: Ejecutar el Schema

1. En tu proyecto de Supabase, ve a **SQL Editor**
2. Copia todo el contenido de `supabase-schema.sql`
3. Pégalo en el editor
4. Haz clic en **Run**
5. Verifica que las tablas se crearon:
   - Ve a **Table Editor**
   - Deberías ver: `social_posts`, `generated_images`, `post_versions`

### Paso 1.3: Obtener Credenciales

1. Ve a **Settings** → **API**
2. Copia estos valores:
   ```
   Project URL: https://xxxxx.supabase.co
   anon/public key: eyJhbGc...
   ```
3. Guárdalos para el paso 4

### Paso 1.4: Configurar Storage (Opcional)

Si quieres almacenar imágenes en Supabase:

1. Ve a **Storage**
2. Crea un bucket llamado `post-images`
3. Configura políticas públicas para lectura

---

## 2. Configuración de n8n - Flujo de Publicación

### Paso 2.1: Importar el Flujo

1. Abre n8n ([https://app.n8n.cloud](https://app.n8n.cloud) o tu instancia)
2. Haz clic en el menú **≡** → **Import from File**
3. Selecciona `current-flow.json`
4. El flujo se importará con el nodo "On form submission"

### Paso 2.2: Configurar el Webhook

1. Haz clic en el nodo **"On form submission"**
2. Verás el webhook ID: `24bef026-3fdf-4c61-906e-cecd4c67dc21`
3. Copia la **Production URL**:
   ```
   https://tu-instancia.app.n8n.cloud/webhook/24bef026-3fdf-4c61-906e-cecd4c67dc21
   ```

### Paso 2.3: Agregar Nodos de Publicación

Después del Form Trigger, agrega los siguientes nodos:

#### A) Nodo Switch (Condicional)

```
Nombre: Check Platforms
Mode: Expression
Value: {{ $json.publish_linkedin === 'Yes' || $json.publish_facebook === 'Yes' || $json.publish_instagram === 'Yes' }}
```

#### B) Nodo LinkedIn (Si publish_linkedin = 'Yes')

```
Tipo: HTTP Request
Método: POST
URL: [LinkedIn API URL]
Headers:
  - Authorization: Bearer [tu_token]
Body:
  {
    "author": "urn:li:person:[tu_id]",
    "lifecycleState": "PUBLISHED",
    "specificContent": {
      "com.linkedin.ugc.ShareContent": {
        "shareCommentary": {
          "text": "{{ $json.post_type }}"
        }
      }
    }
  }
```

#### C) Nodo Facebook (Si publish_facebook = 'Yes')

```
Tipo: HTTP Request
Método: POST
URL: https://graph.facebook.com/v18.0/[page_id]/feed
Body:
  {
    "message": "{{ $json.post_type }}",
    "access_token": "[tu_page_token]"
  }
```

#### D) Nodo Instagram (Si publish_instagram = 'Yes')

```
Tipo: HTTP Request
Método: POST
URL: https://graph.facebook.com/v18.0/[instagram_id]/media
Body:
  {
    "caption": "{{ $json.post_type }}",
    "image_url": "{{ $json.Image }}",
    "access_token": "[tu_token]"
  }
```

### Paso 2.4: Activar el Flujo

1. En la esquina superior derecha, cambia **Inactive** a **Active**
2. El webhook ahora está listo para recibir datos

---

## 3. Configuración de n8n - Flujo de Generación

### Paso 3.1: Crear el Flujo de Generación

Este flujo debe:

1. Recibir datos del formulario
2. Llamar a OpenAI/Claude para generar copy
3. Generar imagen con DALL-E/Midjourney/Gemini
4. Guardar en Supabase

### Paso 3.2: Estructura Recomendada

```
[Form Trigger] → [Analizar Estrategia] → [Generar Copy] → [Generar Prompt Imagen] → [Crear Imagen] → [Guardar en Supabase]
```

#### Nodo 1: Form Trigger

Ya está configurado en el segundo JSON que proporcionaste.

- **Path**: `msi-content-form`
- **Webhook URL**: `https://tu-instancia.app.n8n.cloud/webhook/msi-content-form`

#### Nodo 2: Analizar Estrategia (OpenAI/Claude)

```
Nombre: Strategy Analyzer
Tipo: OpenAI
Modelo: gpt-4 o claude-3-sonnet
Prompt:
"""
Analiza esta estrategia de contenido para LinkedIn:

Tema: {{ $json.topic }}
Tipo de Post: {{ $json.post_type }}
Estilo Visual: {{ $json.visual_style }}
Titular: {{ $json.headline }}
Datos Clave: {{ $json.data_points }}
Contexto: {{ $json.context }}

Proporciona un análisis estratégico breve sobre el enfoque del contenido.
"""
```

#### Nodo 3: Generar Copy (OpenAI/Claude)

```
Nombre: Copy Writer
Tipo: OpenAI
Modelo: gpt-4 o claude-3-sonnet
Prompt:
"""
Crea un post profesional para LinkedIn sobre {{ $json.topic }}.

Tipo: {{ $json.post_type }}
Titular: {{ $json.headline }}
Datos: {{ $json.data_points }}

Análisis previo:
{{ $('Strategy Analyzer').item.json.choices[0].message.content }}

Genera un copy atractivo, profesional y optimizado para engagement.
Máximo 1300 caracteres.
"""
```

#### Nodo 4: Generar Prompt de Imagen (OpenAI/Claude)

```
Nombre: Image Prompt Engineer
Tipo: OpenAI
Prompt:
"""
Crea un prompt detallado para generar una imagen profesional:

Tema: {{ $json.topic }}
Estilo: {{ $json.visual_style }}
Orientación: {{ $json.orientation }}
Contexto: {{ $json.context }}

El prompt debe ser específico, técnico y optimizado para DALL-E/Midjourney.
"""
```

#### Nodo 5: Crear Imagen (DALL-E/Gemini)

```
Nombre: Generate Image
Tipo: OpenAI (DALL-E) o HTTP Request (otros)

Para DALL-E:
- Prompt: {{ $('Image Prompt Engineer').item.json.choices[0].message.content }}
- Size: Según {{ $json.orientation }}
  - Square: 1024x1024
  - Vertical: 1024x1792
  - Horizontal: 1792x1024
```

#### Nodo 6: Guardar en Supabase

```
Nombre: Save to Database
Tipo: HTTP Request
Método: POST
URL: https://xxxxx.supabase.co/rest/v1/social_posts
Headers:
  - apikey: [tu_supabase_key]
  - Authorization: Bearer [tu_supabase_key]
  - Content-Type: application/json
  - Prefer: return=representation

Body:
{
  "topic": "{{ $json.topic }}",
  "post_type": "{{ $json.post_type }}",
  "visual_style": "{{ $json.visual_style }}",
  "orientation": "{{ $json.orientation }}",
  "headline": "{{ $json.headline }}",
  "data_points": "{{ $json.data_points }}",
  "context": "{{ $json.context }}",
  "strategy_analysis": "{{ $('Strategy Analyzer').item.json.choices[0].message.content }}",
  "post_copy": "{{ $('Copy Writer').item.json.choices[0].message.content }}",
  "image_prompt": "{{ $('Image Prompt Engineer').item.json.choices[0].message.content }}",
  "image_url": "{{ $('Generate Image').item.json.data[0].url }}",
  "status": "completed"
}
```

### Paso 3.3: Activar el Flujo

1. Guarda todos los nodos
2. Activa el flujo
3. Copia la URL del webhook

---

## 4. Configuración de la Aplicación

### Opción A: Usando config.js (Recomendado)

1. Copia el archivo de ejemplo:

```bash
copy config.example.js config.js
```

2. Edita `config.js`:

```javascript
window.APP_CONFIG = {
  supabase: {
    url: "https://xxxxx.supabase.co",
    anonKey: "eyJhbGc...",
  },
  n8n: {
    publishWebhook:
      "https://tu-n8n.app.n8n.cloud/webhook/24bef026-3fdf-4c61-906e-cecd4c67dc21",
    generateWebhook: "https://tu-n8n.app.n8n.cloud/webhook/msi-content-form",
  },
};
```

3. Actualiza `index.html` para incluir config.js ANTES de app.js:

```html
<script src="config.js"></script>
<script src="app.js"></script>
```

4. Actualiza `app.js` para usar window.APP_CONFIG:

```javascript
const CONFIG = window.APP_CONFIG || {
  supabaseUrl: "YOUR_SUPABASE_URL",
  supabaseKey: "YOUR_SUPABASE_ANON_KEY",
  // ...
};
```

### Opción B: Editar directamente app.js

1. Abre `app.js`
2. Busca la sección CONFIG (líneas 2-9)
3. Reemplaza los valores:

```javascript
const CONFIG = {
  supabaseUrl: "https://xxxxx.supabase.co",
  supabaseKey: "eyJhbGciOiJI...",
  n8nPublishWebhook: "https://tu-n8n.app.n8n.cloud/webhook/24bef026...",
  n8nGenerateWebhook: "https://tu-n8n.app.n8n.cloud/webhook/msi-content-form",
};
```

---

## 5. Despliegue en Vercel

### Paso 5.1: Instalar Vercel CLI

```bash
npm install -g vercel
```

### Paso 5.2: Login

```bash
vercel login
```

### Paso 5.3: Desplegar

```bash
cd "c:\Users\artki\borrar\api test"
vercel
```

Sigue las instrucciones:

- **Set up and deploy?** → Yes
- **Which scope?** → Tu cuenta
- **Link to existing project?** → No
- **Project name?** → msi-social-media
- **Directory?** → ./
- **Override settings?** → No

### Paso 5.4: Producción

```bash
vercel --prod
```

Tu app estará en: `https://msi-social-media.vercel.app`

---

## 6. Pruebas

### Prueba 1: Publicación Manual

1. Ve a tu app desplegada
2. Cambia al modo "Publicar"
3. Escribe un post de prueba
4. Selecciona LinkedIn
5. Haz clic en "Publicar en Redes"
6. Verifica en n8n que el webhook recibió los datos
7. Revisa LinkedIn para la publicación

### Prueba 2: Generación de Contenido

1. Cambia al modo "Generar Contenido"
2. Completa el formulario:
   - Tema: "5G Network Technology"
   - Tipo: "Educational"
   - Estilo: "Modern 3D"
   - Orientación: "Square"
   - Titular: "Future of Connectivity"
3. Haz clic en "Generar Contenido"
4. Espera 30-60 segundos
5. Haz clic en "Actualizar" en la lista de posts
6. Verifica que el nuevo post aparece con copy e imagen

### Prueba 3: Publicar desde DB

1. En la lista de posts guardados
2. Selecciona un post con checkbox
3. Haz clic en "Publicar"
4. Selecciona plataformas
5. Verifica la publicación

---

## 🔍 Solución de Problemas

### Error: "Supabase no está configurado"

- Verifica que config.js existe y tiene los valores correctos
- Asegúrate de que index.html carga config.js antes de app.js
- Revisa la consola del navegador (F12) para errores

### Error: "CORS" en n8n

- En n8n, ve a Settings del workflow
- Activa "CORS"
- Agrega tu dominio de Vercel a allowed origins

### Los posts no aparecen

- Verifica en Supabase Table Editor si hay datos
- Revisa las políticas RLS (Row Level Security)
- En Supabase, puede que necesites desactivar RLS o crear políticas públicas:

```sql
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON social_posts
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access" ON social_posts
  FOR INSERT WITH CHECK (true);
```

### Webhook no responde

- Verifica que el flujo esté **Active** en n8n
- Prueba el webhook directamente con Postman/cURL
- Revisa los logs de ejecución en n8n

---

## 📱 URLs Importantes

Guarda estas URLs para acceso rápido:

```
Supabase Dashboard: https://app.supabase.com/project/[tu-proyecto]
n8n Dashboard: https://app.n8n.cloud
Vercel Dashboard: https://vercel.com/[tu-usuario]/msi-social-media
App en Producción: https://msi-social-media.vercel.app
```

---

## 🎯 Próximos Pasos

1. ✅ Configurar credenciales de redes sociales en n8n
2. ✅ Personalizar los prompts de IA según tu marca
3. ✅ Ajustar estilos CSS según tu branding
4. ✅ Configurar analytics (opcional)
5. ✅ Agregar más tipos de contenido

---

## 📞 Soporte

Si tienes problemas:

1. Revisa los logs en la consola del navegador (F12)
2. Verifica las ejecuciones en n8n
3. Revisa los logs de Vercel
4. Consulta la documentación de cada servicio

¡Listo! Tu aplicación está configurada y lista para usar. 🚀
