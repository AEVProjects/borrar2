# Nueva Funcionalidad: Imagen de Inicio para Videos

## ✨ Descripción

Se ha agregado la capacidad de usar una imagen personalizada como punto de partida para la generación de videos con Veo 3.1. Ahora puedes proporcionar:

1. **Logo URL** - El logo que aparecerá en el video (por defecto: logo de MSI)
2. **Start Image URL** - Una imagen que será el punto de partida del video

## 🎯 Cómo Funciona

### En la Interfaz Web ([index.html](index.html))

- **Campo "Logo URL"**: Para especificar el logo de la empresa que aparecerá en el video
- **Campo "Imagen de Inicio del Video"**: Para especificar la imagen desde la cual comenzará la generación del video
- Ambos campos son opcionales y muestran vista previa cuando ingresas una URL válida

### En el Backend ([app.js](app.js))

- Se capturan ambos campos: `logo_url` y `start_image_url`
- Se envían al webhook de n8n para procesamiento

### En el Flujo de n8n ([video-gen.json](video-gen.json))

#### Nuevos Nodos Agregados:

1. **Check if Start Image** - Verifica si se proporcionó una imagen de inicio
2. **Download Start Image** - Descarga la imagen de inicio desde la URL
3. **Start Image to Base64** - Convierte la imagen descargada a Base64
4. **Merge Start Image Data** - Combina los datos de la imagen con la configuración
5. **Use Logo as Base** - Usa el logo como imagen base si no hay imagen de inicio

#### Flujo de Decisión:

```
Settings → Download Logo → Logo to Base64 → Merge Settings with Logo
                                                        ↓
                                              Check if Start Image
                                                   ↙        ↘
                         (SI hay start_image)              (NO hay start_image)
                                 ↓                                ↓
                      Download Start Image                 Use Logo as Base
                                 ↓                                ↓
                      Start Image to Base64                       ↓
                                 ↓                                ↓
                      Merge Start Image Data                      ↓
                                 ↓                                ↓
                                 └────────→ Generate Access Token ←┘
                                                    ↓
                                            Vertex AI - VEO3
```

## 📝 Campos en la Base de Datos

Los nuevos campos que se extraen del webhook son:

- `logo_url` - URL del logo (opcional, default: logo de MSI)
- `start_image_url` - URL de la imagen de inicio (opcional)

## 🔧 Variables Usadas en el Flujo

### En Settings:

- `LOGO_URL` - URL del logo
- `START_IMAGE_URL` - URL de la imagen de inicio
- `HAS_START_IMAGE` - Boolean que indica si hay imagen de inicio

### En Merge Settings with Logo:

- `LOGO_BASE64` - Logo en Base64
- `LOGO_MIME_TYPE` - Tipo MIME del logo

### En los nodos de decisión:

- `FINAL_IMAGE_BASE64` - La imagen final que se usará (puede ser logo o start image)
- `FINAL_IMAGE_MIME_TYPE` - Tipo MIME de la imagen final
- `START_IMAGE_BASE64` - Start image en Base64 (si existe)
- `START_IMAGE_MIME_TYPE` - Tipo MIME de la start image (si existe)

## 🎬 Uso en Veo 3.1

El nodo **Vertex AI - VEO3** ahora usa:

```javascript
{
  instances: [{
    prompt: "...",
    image: {
      bytesBase64Encoded: $json.FINAL_IMAGE_BASE64,  // ← Usa la imagen final
      mimeType: $json.FINAL_IMAGE_MIME_TYPE
    }
  }],
  // ...
}
```

## 📖 Ejemplo de Uso

### Solo con Logo (comportamiento anterior):

```javascript
{
  "prompt": "Modern office with MSI branding",
  "duration": "8",
  "logo_url": null  // Se usa logo de MSI por defecto
}
```

### Con Logo Personalizado:

```javascript
{
  "prompt": "Modern office with MSI branding",
  "duration": "8",
  "logo_url": "https://example.com/custom-logo.png"
}
```

### Con Imagen de Inicio:

```javascript
{
  "prompt": "Modern office with MSI branding",
  "duration": "8",
  "logo_url": "https://i.ibb.co/S7mKXdxr/MSI-Technologies-Icon.png",
  "start_image_url": "https://example.com/office-photo.jpg"  // ← El video comenzará desde esta imagen
}
```

## 🎨 Casos de Uso

1. **Branding Corporativo**: Usa el logo de la empresa como overlay mientras el video comienza desde una imagen específica de producto
2. **Continuidad Visual**: Inicia el video desde una captura de pantalla o imagen existente
3. **Personalización**: Cada cliente puede tener su propia imagen de inicio manteniendo la marca MSI

## ✅ Ventajas

- ✓ Mantiene compatibilidad hacia atrás (si no se provee start_image_url, funciona como antes)
- ✓ Flexibilidad total: puedes elegir logo, imagen de inicio, o ambos
- ✓ Vista previa de imágenes en la interfaz antes de generar
- ✓ Validación automática de URLs

## 🔍 Para Importar en n8n

1. Abre n8n
2. Ve a **Workflows**
3. Click en **Import from File**
4. Selecciona `video-gen.json`
5. El flujo se importará con todos los nuevos nodos y conexiones

---

**Fecha de Implementación**: 22 de Enero, 2026
**Versión**: 2.0
