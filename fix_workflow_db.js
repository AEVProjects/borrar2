const fs = require('fs');
let c = fs.readFileSync('workflows/n8nmsi_cloud_n8n_m/personal/All_implementation.workflow.ts', 'utf8');

c = c.replace(/OBTENER DATOS ORIGINALES DEL WEBHOOK desde 'Check if Image Exists'[\\s\\S]*?baseData = allItems\[0\]\?\.json \|\| \{\};\\n\}/m, OBTENER DATOS ORIGINALES DEL WEBHOOK desde Separar Binarios
let baseData = {};
try {
  const sepNode = \\Separar Binarios;
  if (sepNode && sepNode.first) {
    const firstSepItem = sepNode.first();
    if (firstSepItem && firstSepItem.json) {
      baseData = { ...firstSepItem.json };
      console.log('AGGREGATE - Datos base desde Separar Binarios');
    }
  }
  if (!baseData.post_type) {
    const whNode = \\Webhook - Publish Post;
    if (whNode && whNode.first) {
      let whd = whNode.first().json;
      if (whd.body && typeof whd.body === 'string') whd = JSON.parse(whd.body);
      else if (whd.body) whd = whd.body;
      baseData = { ...baseData, ...whd };
      console.log('AGGREGATE - Fallback a Webhook completado');
    }
  }
} catch(e) {
  console.log('AGGREGATE - Error accediendo a nodos previos:', e.message);
}
if (!baseData || Object.keys(baseData).length === 0) {
  baseData = allItems[0]?.json || {};
});

c = c.replace(/post_type: '=\{\{ \\\.post_type \}\}'/, post_type: '={{ \\.post_type || \"Carousel\" }}');

fs.writeFileSync('workflows/n8nmsi_cloud_n8n_m/personal/All_implementation.workflow.ts', c);
console.log('Updated workflow.');
