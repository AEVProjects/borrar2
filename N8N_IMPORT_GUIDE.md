# 📥 Instrucciones: Importar Workflow Actualizado con Seguridad

## ✅ Cambios Realizados

El archivo `current-flow.json` ha sido actualizado con **nodos de validación de seguridad** integrados:

### Nodo 1: "Validate Security" (Workflow de Generación)
- Ubicado después de "MSI Content Form"
- Valida token, origen y dominio
- Webhook ID: `70738d02-4bd8-4dac-853f-ba4836aafaf5`

### Nodo 2: "Validate Security Publish" (Workflow de Publicación)
- Ubicado después de "On form submission1"
- Valida token, origen y dominio
- Webhook ID: `025d6de3-6b46-41c2-839d-58a8b18b649f`

---

## 🔄 Pasos para Aplicar los Cambios

### Opción A: Importar el Workflow Completo (Recomendado)

1. **Abre n8n** (https://n8nmsi.app.n8n.cloud)

2. **Exporta tu workflow actual** (por seguridad):
   - Abre el workflow "MSI Content Generator"
   - Menú ⋮ → Download
   - Guarda como backup

3. **Elimina el workflow antiguo** (opcional):
   - Puedes mantenerlo desactivado como respaldo

4. **Importa el nuevo workflow**:
   - Click en el menú ≡ → **Import from File**
   - Selecciona `current-flow.json` actualizado
   - Click **Import**

5. **Verifica las conexiones**:
   - Deberías ver los nodos "Validate Security" y "Validate Security Publish"
   - Verifica que estén conectados correctamente:
     - MSI Content Form → **Validate Security** → Format Form Input
     - On form submission1 → **Validate Security Publish** → Separar Binarios

6. **Configura tus credenciales**:
   - Los nodos que usan APIs externas necesitarán reconectarse
   - Postgres, OpenAI, APIs de redes sociales, etc.

7. **Activa el workflow**:
   - Toggle en la esquina superior derecha

8. **Prueba que funciona**:
   - Desde tu app en Vercel, intenta generar contenido
   - Verifica que funciona correctamente

---

### Opción B: Agregar Nodos Manualmente (Si prefieres no reimportar)

Si no quieres reimportar todo el workflow, sigue las instrucciones en **SECURITY_SETUP.md** sección "Opción 1: Validación por Headers".

---

## 🔐 Configuración de Seguridad

Los nodos de validación verifican:

### 1. **Token de Seguridad**
- Header: `X-Webhook-Token`
- Valor esperado: `msi_2024_secure_e8f4a9c2b1d5`
- Debe coincidir con `config.example.js`

### 2. **Origen de la Aplicación**
- Header: `X-App-Origin`
- Valor esperado: `MSI-Social-Manager`

### 3. **Dominio Permitido**
- Header: `referer` o `origin`
- Dominios válidos:
  - `borrar2.vercel.app`
  - `localhost`
  - `127.0.0.1`

---

## ✅ Cómo Verificar que Funciona

### Prueba 1: Desde tu App (Debe funcionar ✅)

1. Ve a https://borrar2.vercel.app
2. Intenta generar contenido o publicar
3. Debería funcionar normalmente

### Prueba 2: Sin Token (Debe fallar ❌)

```bash
curl -X POST https://n8nmsi.app.n8n.cloud/webhook/70738d02-4bd8-4dac-853f-ba4836aafaf5 \
  -H "Content-Type: application/json" \
  -d '{"topic": "test"}'
```

**Resultado esperado**: Error con mensaje "🚫 Acceso denegado: Token inválido"

### Prueba 3: Con Token Incorrecto (Debe fallar ❌)

```bash
curl -X POST https://n8nmsi.app.n8n.cloud/webhook/70738d02-4bd8-4dac-853f-ba4836aafaf5 \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Token: token_falso" \
  -H "X-App-Origin: MSI-Social-Manager" \
  -d '{"topic": "test"}'
```

**Resultado esperado**: Error con mensaje "🚫 Acceso denegado: Token inválido"

---

## 🔄 Actualizar el Token de Seguridad

Si necesitas cambiar el token en el futuro:

### 1. En GitHub (`config.example.js`):
```javascript
webhookToken: 'TU_NUEVO_TOKEN_AQUI'
```

### 2. En n8n (ambos nodos de validación):
```javascript
const EXPECTED_TOKEN = 'TU_NUEVO_TOKEN_AQUI';
```

### 3. Guarda y reactiva el workflow

---

## 🆘 Solución de Problemas

### Error: "Cannot find module 'code'"
- **Causa**: Nodo Code no está habilitado en n8n
- **Solución**: Usa n8n Cloud o habilita el nodo Code en tu instalación

### Error: "🚫 Acceso denegado: Token inválido"
- **Causa**: El token en app.js no coincide con el de n8n
- **Solución**: Verifica que ambos tengan `msi_2024_secure_e8f4a9c2b1d5`

### El workflow no se ejecuta
- **Causa**: Nodo de validación bloqueando peticiones legítimas
- **Solución**: Revisa los logs de ejecución en n8n para ver el error exacto

### Error: "🚫 Acceso denegado: Dominio no autorizado"
- **Causa**: Tu dominio de Vercel cambió
- **Solución**: Actualiza el array `allowedDomains` en los nodos de validación

---

## 📊 Comparación: Antes vs Después

| Aspecto | Antes | Después |
|---------|-------|---------|
| **Seguridad** | ❌ Cualquiera puede usar los webhooks | ✅ Solo tu app puede usarlos |
| **Token** | ❌ No | ✅ Sí (`X-Webhook-Token`) |
| **Validación de Origen** | ❌ No | ✅ Sí (`X-App-Origin`) |
| **Validación de Dominio** | ❌ No | ✅ Sí (`referer`) |
| **Protección contra Spam** | ❌ No | ✅ Sí |
| **Consumo no autorizado** | ❌ Posible | ✅ Bloqueado |

---

## 📝 Resumen

✅ **Workflow actualizado** con validación de seguridad integrada  
✅ **2 nodos Code** agregados automáticamente  
✅ **Conexiones actualizadas** en el flujo  
✅ **Listo para importar** a n8n  

**Siguiente paso**: Importa `current-flow.json` a n8n y prueba que funcione.

---

**Última actualización**: Diciembre 19, 2025
