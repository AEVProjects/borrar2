const fs = require('fs');
let c = fs.readFileSync('workflows/n8nmsi_cloud_n8n_m/personal/All_implementation.workflow.ts', 'utf8');

const targetToReplace = `OBTENER DATOS ORIGINALES DEL WEBHOOK desde 'Check if Image Exists'\\nlet baseData = {};\\nconst checkImageNode = $('Check if Image Exists');\\nif (checkImageNode && checkImageNode.first) {\\n  const firstCheckItem = checkImageNode.first();\\n  if (firstCheckItem && firstCheckItem.json) {\\n    baseData = { ...firstCheckItem.json };\\n    console.log('AGGREGATE - Datos base desde Check if Image Exists');\\n    console.log('AGGREGATE - post_type:', baseData.post_type);\\n    console.log('AGGREGATE - publish_linkedin:', baseData.publish_linkedin);\\n    console.log('AGGREGATE - publish_facebook:', baseData.publish_facebook);\\n  }\\n} else {\\n  console.log('AGGREGATE - WARNING: No se pudo acceder a Check if Image Exists, usando primer item de ImgBB');\\n  baseData = allItems[0]?.json || {};\\n}`;

const replacement = `OBTENER DATOS ORIGINALES DEL WEBHOOK (Robust Fallback)\\nlet baseData = {};\\ntry {\\n  const sepNode = $('Separar Binarios');\\n  if (sepNode && sepNode.first) {\\n    const firstSepItem = sepNode.first();\\n    if (firstSepItem && firstSepItem.json) {\\n      baseData = { ...firstSepItem.json };\\n      console.log('AGGREGATE - Datos base desde Separar Binarios');\\n    }\\n  }\\n  if (!baseData.post_type) {\\n    const whNode = $('Webhook - Publish Post');\\n    if (whNode && whNode.first) {\\n      let whd = whNode.first().json;\\n      if (whd.body && typeof whd.body === "string") whd = JSON.parse(whd.body);\\n      else if (whd.body) whd = whd.body;\\n      baseData = { ...baseData, ...whd };\\n      console.log('AGGREGATE - Fallback a Webhook completado');\\n    }\\n  }\\n} catch(e) {\\n  console.log('AGGREGATE - Error accediendo a nodos previos:', e.message);\\n}\\nif (!baseData || Object.keys(baseData).length === 0) {\\n  baseData = allItems[0]?.json || {};\\n}`;

c = c.replace(targetToReplace, replacement);

c = c.replace("post_type: '={{ $json.post_type }}'", "post_type: '={{ $json.post_type || \"Carousel\" }}'");

fs.writeFileSync('workflows/n8nmsi_cloud_n8n_m/personal/All_implementation.workflow.ts', c);
console.log('done.');
