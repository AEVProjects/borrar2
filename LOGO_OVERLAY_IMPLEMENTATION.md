# Logo Overlay Implementation

## Problema Resuelto
El logo MSI Americas se estaba modificando/regenerando cuando Gemini intentaba usarlo como referencia. La solución es:
1. Decirle a Gemini que NO genere ningún logo
2. Superponer el logo real después de la generación usando código

## Arquitectura de la Solución

### Flujo Actualizado
```
Generate Image (Gemini)
  ↓
Check and Prepare Binary
  ↓
**[NUEVO] Overlay Logo on Image** ← Usa sharp para superponer logo
  ↓
Upload to ImgBB
```

### Nodo Nuevo: "Overlay Logo on Image"
Este nodo:
- Recibe la imagen generada por Gemini (sin logo)
- Obtiene el logo descargado de ImgBB
- Redimensiona el logo al 10% de la altura de la imagen
- Lo posiciona en el centro inferior con 5% de margen
- Genera la imagen final compuesta

## Dependencias Requeridas

### Sharp (Librería de Manipulación de Imágenes)
```bash
# En tu instalación de n8n, ejecuta:
npm install sharp
```

**IMPORTANTE**: Si usas n8n en Docker o n8n Cloud, `sharp` podría no estar disponible. En ese caso, alternativas:

### Alternativa 1: Jimp (JavaScript puro, más lento pero sin compilación nativa)
```bash
npm install jimp
```

### Alternativa 2: Servicio externo (si n8n no permite instalar paquetes)
Usar un servicio como:
- ImageMagick API
- Cloudinary transformations
- AWS Lambda con sharp

## Código del Nodo

El nodo "Overlay Logo on Image" usa `sharp`:
```javascript
const sharp = require('sharp');

// 1. Obtiene imagen generada de Gemini
const generatedImageBuffer = await this.helpers.getBinaryDataBuffer(0, 'generated_image');

// 2. Obtiene logo descargado
const logoBuffer = await this.helpers.getBinaryDataBuffer(logoItem.json.index || 0, logoBinaryKey);

// 3. Redimensiona logo (10% altura de imagen)
const resizedLogo = await sharp(logoBuffer)
  .resize({ height: logoHeight, fit: 'contain' })
  .toBuffer();

// 4. Calcula posición (centro inferior, 5% margen)
const left = Math.round((imageWidth - logoWidth) / 2);
const top = Math.round(imageHeight - logoHeight - (imageHeight * 0.05));

// 5. Superpone logo
const finalImageBuffer = await sharp(generatedImageBuffer)
  .composite([{
    input: resizedLogo,
    top: top,
    left: left
  }])
  .png()
  .toBuffer();
```

## Configuración en Prompts

### Agent 3: Image Prompt Engineer
Ahora instruye a Gemini:
```
## LOGO AND BRANDING (CRITICAL - DO NOT GENERATE LOGO)
- DO NOT generate, draw, recreate, or render any logo
- Leave clear space at bottom center (~15% of image height)
- Logo will be overlaid as separate layer after generation
- Include 'msitechnologiesinc.com' in small white text
```

## Ventajas de Este Enfoque

✅ **Logo siempre idéntico**: Se usa el PNG original sin interpretación de AI
✅ **Posicionamiento preciso**: Control total de tamaño y posición
✅ **Rápido**: El overlay es instantáneo
✅ **Escalable**: Funciona con cualquier resolución de imagen
✅ **Predecible**: No hay variabilidad en el resultado

## Testing

Para probar:
1. Genera un post desde la interfaz web
2. Verifica que la imagen final tenga:
   - Fondo oscuro (Deep Blue #004AAD)
   - Contenido visual generado por Gemini
   - Logo MSI en centro inferior (sin modificaciones)
   - Website URL visible

## Troubleshooting

### Error: "Cannot find module 'sharp'"
```bash
cd [tu-directorio-n8n]
npm install sharp
# Reinicia n8n
```

### Error: "sharp installation failed"
En sistemas donde sharp no compila (Alpine Linux, etc.):
```bash
npm install --platform=linux --arch=x64 sharp
```

### Si sharp no funciona en tu entorno
Reemplaza el código del nodo con Jimp:
```javascript
const Jimp = require('jimp');

const generatedImage = await Jimp.read(generatedImageBuffer);
const logo = await Jimp.read(logoBuffer);

// Redimensionar logo
logo.resize(logoWidth, Jimp.AUTO);

// Superponer
generatedImage.composite(logo, left, top);

// Exportar
const finalBuffer = await generatedImage.getBufferAsync(Jimp.MIME_PNG);
```

## Referencias
- [Sharp Documentation](https://sharp.pixelplumbing.com/)
- [n8n Code Node](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.code/)
- [n8n Binary Data](https://docs.n8n.io/data/binary-data/)
