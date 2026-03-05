# 🔒 Configuración de Seguridad para Webhooks n8n

## ⚠️ IMPORTANTE: Protección contra uso no autorizado

Este documento explica cómo asegurar tus webhooks de n8n para evitar que personas no autorizadas los usen.

---

## 🎯 Configuración de Seguridad en n8n

### Opción 1: Validación por Headers (Recomendado) ⭐

Agrega un **nodo Code** inmediatamente después de cada webhook trigger:

#### En el Workflow de Publicación:

1. Abre el workflow con webhook `025d6de3-6b46-41c2-839d-58a8b18b649f`
2. Después del nodo **"On form submission"**, agrega un nodo **Code**
3. Nómbralo: **"Validate Security"**
4. Pega este código:

```javascript
// Validación de seguridad para webhook
const token = $input.item.json.headers["x-webhook-token"];
const origin = $input.item.json.headers["x-app-origin"];
const referer = $input.item.json.headers["referer"];

// Token esperado (debe coincidir con config.example.js)
const EXPECTED_TOKEN = "msi_2024_secure_e8f4a9c2b1d5";

// Validar token
if (token !== EXPECTED_TOKEN) {
  throw new Error("🚫 Acceso denegado: Token inválido");
}

// Validar origen de la app
if (origin !== "MSI-Social-Manager") {
  throw new Error("🚫 Acceso denegado: Origen no autorizado");
}

// Validar que venga de dominio permitido (Vercel)
if (
  referer &&
  !referer.includes("borrar2.vercel.app") &&
  !referer.includes("localhost")
) {
  throw new Error("🚫 Acceso denegado: Dominio no autorizado");
}

// Si todo está bien, pasar los datos originales
return $input.all();
```

5. Conecta este nodo entre el webhook trigger y el siguiente nodo
6. Guarda y activa el workflow

#### En el Workflow de Generación:

1. Abre el workflow con webhook `70738d02-4bd8-4dac-853f-ba4836aafaf5`
2. Después del nodo **"MSI Content Form"**, agrega un nodo **Code**
3. Nómbralo: **"Validate Security"**
4. Pega el **mismo código** de arriba
5. Conecta este nodo entre el webhook trigger y "Format Form Input"
6. Guarda y activa el workflow

---

### Opción 2: CORS (Protección básica)

Si no quieres agregar nodos de código:

1. En cada workflow, haz clic en **⋮ (menú)** → **Settings**
2. En la pestaña **Security**:
   - **Enable CORS**: ✅ Activar
   - **Allowed Origins**:
     ```
     https://borrar2.vercel.app
     ```
3. Guarda los cambios

**⚠️ Nota**: CORS solo protege contra navegadores, no contra herramientas como curl/Postman.

---

### Opción 3: Autenticación HTTP (Más seguro, más complejo)

1. En el nodo Webhook, cambia **Authentication** de "None" a "Header Auth"
2. Configura:
   - **Name**: `X-Webhook-Token`
   - **Value**: `msi_2024_secure_e8f4a9c2b1d5`

**Problema**: Esto requiere cambios en el código frontend y puede ser más complejo de mantener.

---

## 🔄 Actualización del Token

Si necesitas cambiar el token de seguridad:

1. **En GitHub** (archivo `config.example.js`):

   - Cambia el valor de `webhookToken`
   - Commit y push

2. **En n8n** (en cada workflow):

   - Actualiza la constante `EXPECTED_TOKEN` en el nodo "Validate Security"
   - Guarda

3. **En Vercel**:
   - Se actualizará automáticamente con el nuevo deploy

---

## ✅ Cómo Probar que Funciona

### Prueba 1: Con Token Correcto (Debe funcionar)

Tu app de Vercel debería funcionar normalmente.

### Prueba 2: Sin Token (Debe fallar)

Intenta hacer una petición manual:

```bash
curl -X POST https://n8nmsi.app.n8n.cloud/webhook/025d6de3-6b46-41c2-839d-58a8b18b649f \
  -H "Content-Type: application/json" \
  -d '{"post_type": "test"}'
```

**Resultado esperado**: Error 500 con mensaje "Acceso denegado: Token inválido"

### Prueba 3: Con Token Incorrecto (Debe fallar)

```bash
curl -X POST https://n8nmsi.app.n8n.cloud/webhook/025d6de3-6b46-41c2-839d-58a8b18b649f \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Token: token_falso" \
  -d '{"post_type": "test"}'
```

**Resultado esperado**: Error 500 con mensaje "Acceso denegado: Token inválido"

---

## 🛡️ Niveles de Protección

| Método             | Protección              | Complejidad | Recomendado                    |
| ------------------ | ----------------------- | ----------- | ------------------------------ |
| **Solo CORS**      | Baja (solo navegadores) | Muy Baja    | ❌ No                          |
| **Headers + CORS** | Media-Alta              | Baja        | ✅ **Sí**                      |
| **HTTP Auth**      | Alta                    | Media       | ⚠️ Si tienes experiencia       |
| **Backend Proxy**  | Muy Alta                | Alta        | ⚠️ Overkill para este proyecto |

---

## 📝 Resumen de Cambios Realizados

### ✅ En `config.example.js`:

- Agregado `webhookToken: 'msi_2024_secure_e8f4a9c2b1d5'`

### ✅ En `app.js`:

- Todas las llamadas fetch ahora incluyen:
  - `'X-Webhook-Token': CONFIG.webhookToken`
  - `'X-App-Origin': 'MSI-Social-Manager'`
- Removido `mode: 'no-cors'` para permitir headers personalizados

### ⏳ Pendiente en n8n:

- Agregar nodo "Validate Security" en cada workflow (ver arriba)

---

## 🆘 Solución de Problemas

### Error: "Access blocked by CORS policy"

**Solución**: Activa CORS en n8n Settings y agrega tu dominio de Vercel.

### Error: "Acceso denegado: Token inválido"

**Causa**: El token en n8n no coincide con el de `config.example.js`

**Solución**: Verifica que ambos tengan el mismo valor exacto.

### El webhook no recibe nada

**Causa**: Headers personalizados requieren CORS configurado

**Solución**:

1. Activa CORS en n8n
2. Agrega tu dominio a Allowed Origins
3. Verifica que no esté `mode: 'no-cors'` en app.js

---

## 🎯 Próximos Pasos

1. ✅ Código frontend ya está actualizado
2. ⏳ **TÚ debes**: Agregar nodos de validación en n8n (ver arriba)
3. ⏳ **TÚ debes**: Activar CORS en settings de n8n
4. ✅ Los cambios se subirán a GitHub/Vercel automáticamente

---

**Última actualización**: Diciembre 19, 2025
