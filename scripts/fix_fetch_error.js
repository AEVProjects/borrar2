const fs = require('fs');
const file = 'c:/Users/artki/borrar2/workflows/n8nmsi_cloud_n8n_m/personal/MSIvideo.workflow.ts';
let f = fs.readFileSync(file, 'utf8');

f = f.replace(/if \(videoUri\) break;\\n  if \(attempt < MAX_RETRIES\) \{/g, 
  "if (videoUri) break;\\n  if (res.error) throw new Error('Vertex AI Error: ' + JSON.stringify(res.error));\\n  if (attempt < MAX_RETRIES) {");

fs.writeFileSync(file, f);
console.log('Done!');
