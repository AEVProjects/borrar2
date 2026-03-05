# Guía: Extender Videos a 16s en Veo 3.1

## Problema Detectado

Google Veo 3.1 solo soporta duraciones de **4, 6, y 8 segundos** para `image_to_video`.
Para videos de 16 segundos, necesitamos:

1. Generar video inicial de 8s
2. Extender el video +8s adicionales usando `extend_video`

## Cambios Implementados en `video-gen.json`

### ✅ 1. Format Video Input - Detecta extensión necesaria

```javascript
const requestedDuration = parseInt(data.duration || "8"); // Cambiar a 8 por defecto
const initialDuration = requestedDuration > 8 ? 8 : requestedDuration;
const needsExtension = requestedDuration > 8;
const extensionSeconds = needsExtension ? requestedDuration - 8 : 0;
```

Campos agregados al output:

- `requested_duration`: Lo que pidió el usuario (16s)
- `needs_extension`: true si >8s
- `extension_seconds`: Segundos adicionales (8s)

### ✅ 2. Process Video Response - Pasa info de extensión

```javascript
const formatInput = $("Format Video Input").item.json;

return [
  {
    json: {
      // ... campos existentes
      needs_extension: formatInput.needs_extension,
      extension_seconds: formatInput.extension_seconds,
      requested_duration: formatInput.requested_duration,
    },
  },
];
```

## Próximos Pasos - Agregar Nodos en n8n

### 🔧 3. Agregar IF Node "Check if Needs Extension"

**Ubicación**: Después de "Process Video Response"

**Configuración**:

- Condition: `{{ $json.needs_extension }}` equals `true`
- TRUE branch → Nodo "Extend Video"
- FALSE branch → "Prepare YouTube Upload" (directo)

### 🔧 4. Agregar Code Node "Extend Video Request"

**Ubicación**: TRUE branch del IF

**Código**:

```javascript
const videoData = $input.item.json;
const settings = $("Generate Access Token").item.json;

return [
  {
    json: {
      ...settings,
      BASE_VIDEO_B64: videoData.video_base64,
      EXTENSION_SECONDS: videoData.extension_seconds,
      OPERATION_TYPE: "extend_video",
      PROMPT_EXTENSION:
        "Continue the professional corporate scene naturally. Maintain MSI branding and end with elegant fade to black.",
    },
  },
];
```

### 🔧 5. Agregar HTTP Request "Vertex AI - Extend Video"

**Ubicación**: Después de "Extend Video Request"

**Configuración**:

- Method: POST
- URL: `https://{{ $json.API_ENDPOINT }}/v1/projects/{{ $json.PROJECT_ID }}/locations/{{ $json.LOCATION }}/publishers/google/models/{{ $json.MODEL_VERSION }}:predictLongRunning`
- Headers:
  - Content-Type: application/json
  - Authorization: Bearer {{ $json.ACCESS_TOKEN }}

**Body**:

```json
{
  "instances": [{
    "prompt": "{{ $json.PROMPT_EXTENSION }}",
    "video": {
      "bytesBase64Encoded": "{{ $json.BASE_VIDEO_B64 }}",
      "mimeType": "video/mp4"
    }
  }],
  "parameters": {
    "aspectRatio": "{{ $json.ASPECT_RATIO }}",
    "sampleCount": 1,
    "durationSeconds": {{ $json.EXTENSION_SECONDS }},
    "addWatermark": false,
    "includeRaiReason": true,
    "generateAudio": true
  }
}
```

### 🔧 6. Agregar Wait Node "Wait for Extension"

- Duration: 2 minutes (igual que el wait actual)

### 🔧 7. Agregar HTTP Request "Fetch Extended Video"

- Igual que "Vertex AI - Fetch Result" pero apuntando a la operación de extend

### 🔧 8. Agregar Code Node "Process Extended Video"

**Código**:

```javascript
const response = $input.item.json;
const settings = $("Extend Video Request").item.json;

// Extraer video extendido (mismo código que Process Video Response)
let videoBase64 = "";
if (response.response?.videos?.[0]?.bytesBase64Encoded) {
  videoBase64 = response.response.videos[0].bytesBase64Encoded;
} else if (
  response.response?.generatedSamples?.[0]?.video?.bytesBase64Encoded
) {
  videoBase64 = response.response.generatedSamples[0].video.bytesBase64Encoded;
}

return [
  {
    json: {
      video_base64: videoBase64,
      mime_type: "video/mp4",
      post_id: settings.POST_ID,
      prompt: settings.TEXT_PROMPT,
      original_prompt: settings.ORIGINAL_PROMPT,
    },
  },
];
```

**Conexión final**: Ambos branches (directo y extendido) → "Prepare YouTube Upload"

## Alternativa Simple - Solo usar 8s por ahora

Para probar inmediatamente sin agregar nodos:

1. **Cambiar default duration a 8**:

   ```javascript
   const requestedDuration = parseInt(data.duration || "8");
   ```

2. **Actualizar HTML** en [index.html](index.html):
   ```html
   <select id="videoLength" class="form-control">
     <option value="4">4 segundos</option>
     <option value="6">6 segundos</option>
     <option value="8" selected>8 segundos</option>
   </select>
   ```

## Documentación API Veo 3.1

### image_to_video

- Soporta: 4, 6, 8 segundos
- Input: imagen + prompt
- Output: video corto

### extend_video

- Soporta: 4, 6, 8 segundos ADICIONALES
- Input: video existente + prompt de continuación
- Output: video extendido

**Ejemplo para 16s total**:

1. `image_to_video` → 8s
2. `extend_video` +8s → 16s total

## Testing

1. **Probar 8s primero** (no necesita extensión)
2. **Agregar nodos de extensión** según guía
3. **Probar 16s** (requiere extensión)

## Notas Importantes

- La extensión toma ~2min adicionales
- El prompt de extensión debe ser coherente con el inicio
- Mantener MSI branding en ambas partes
- Siempre incluir CTA y fade to black al final
