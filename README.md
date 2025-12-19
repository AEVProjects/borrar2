# MSI Social Media Manager

Aplicación web para gestionar publicaciones en redes sociales con integración a n8n y Supabase.

> 📖 **Para configuración detallada paso a paso, lee [SETUP_GUIDE.md](SETUP_GUIDE.md)**

## Características

### Modo Publicar

- Formulario para crear publicaciones manuales
- Soporte para LinkedIn, Facebook e Instagram
- Carga de imágenes y videos (se suben automáticamente a ImgBB vía n8n)
- Las URLs de imágenes se guardan en Supabase
- Visualización de posts guardados con sus imágenes
- Publicación directa usando URLs guardadas en la BD

### Modo Generar Contenido

- Generación automática de copy con IA
- Creación de imágenes con diferentes estilos visuales
- Múltiples opciones de orientación (Square, Vertical, Horizontal, Story)
- Tipos de contenido: Educational, Thought Leadership, Case Study, etc.
- Las imágenes generadas se guardan como URLs en Supabase

## Configuración Rápida

### Opción 1: Usando config.js (Recomendado)

1. **Copia el archivo de configuración:**

```bash
copy config.example.js config.js
```

2. **Edita config.js con tus valores:**

```javascript
window.APP_CONFIG = {
  supabase: {
    url: "https://xxxxx.supabase.co",
    anonKey: "eyJhbGc...",
  },
  n8n: {
    publishWebhook: "https://tu-n8n.app.n8n.cloud/webhook/...",
    generateWebhook: "https://tu-n8n.app.n8n.cloud/webhook/msi-content-form",
  },
};
```

> **⚠️ Importante**: Esta app es frontend puro. **NO uses `.env`** (eso es para backend/Node.js). Usa `config.js` que se carga en el navegador. Lee [IMPORTANT.md](IMPORTANT.md) para entender por qué.

### 📖 Guía Completa

Para instrucciones paso a paso detalladas sobre:

- Configuración de Supabase
- Creación de flujos en n8n
- Configuración de APIs de redes sociales
- Despliegue en Vercel
- Solución de problemas

**Lee [SETUP_GUIDE.md](SETUP_GUIDE.md)**

### 3. Despliegue en Vercel

#### Opción A: Vercel CLI

```bash
npm i -g vercel
vercel login
vercel
```

#### Opción B: GitHub

1. Sube el proyecto a GitHub
2. Conecta tu repositorio en [vercel.com](https://vercel.com)
3. Despliega automáticamente

#### Opción C: Drag & Drop

1. Ve a [vercel.com](https://vercel.com/new)
2. Arrastra la carpeta del proyecto
3. Despliega

## Estructura de Archivos

```
api test/
├── index.html          # Página principal
├── styles.css          # Estilos
├── app.js             # Lógica de la aplicación
├── vercel.json        # Configuración de Vercel
├── README.md          # Este archivo
├── supabase-schema.sql # Schema de la base de datos
└── current-flow.json  # Configuración de n8n
```

## Uso

### Publicar Contenido Manual

1. Ve al modo "Publicar"
2. Escribe el contenido del post
3. Carga una imagen (opcional)
4. Selecciona las plataformas (LinkedIn, Facebook, Instagram)
5. Haz clic en "Publicar en Redes"

### Generar Contenido con IA

1. Ve al modo "Generar Contenido"
2. Completa el formulario:
   - Tema
   - Tipo de post
   - Estilo visual
   - Orientación
   - Titular
   - Datos clave (opcional)
   - Contexto (opcional)
3. Haz clic en "Generar Contenido"
4. Espera a que n8n procese la solicitud
5. El contenido aparecerá en la base de datos

### Publicar Posts Guardados

1. En el modo "Publicar", revisa la lista de posts guardados
2. Selecciona los posts con los checkboxes
3. Haz clic en el botón "Publicar" de cada post
4. Selecciona las plataformas cuando se solicite

## Tecnologías

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Base de Datos**: Supabase (PostgreSQL)
- **Automatización**: n8n
- **Hosting**: Vercel
- **APIs**: Supabase Client Library

## Personalización

### Colores

Edita las variables CSS en `styles.css`:

```css
:root {
  --primary-color: #0066cc;
  --linkedin-color: #0077b5;
  --facebook-color: #1877f2;
  --instagram-color: #e4405f;
  /* ... */
}
```

### Webhooks

Modifica los endpoints en `app.js` según tu configuración de n8n.

## Solución de Problemas

### Los posts no se cargan

- Verifica que Supabase esté configurado correctamente
- Revisa la consola del navegador para errores
- Asegúrate de que el schema SQL se ejecutó correctamente

### Las publicaciones no se envían

- Verifica que los webhooks de n8n estén activos
- Confirma que las URLs sean correctas
- Revisa los logs de n8n

### Error en Vercel

- Asegúrate de que `vercel.json` esté en la raíz
- Verifica que todos los archivos estén presentes
- Revisa los logs de despliegue

## Licencia

MIT

## Soporte

Para preguntas o problemas, crea un issue en el repositorio.
