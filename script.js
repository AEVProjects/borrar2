const fs = require('fs');
const file1 = 'workflows/n8nmsi_cloud_n8n_m/personal/All_implementation.workflow.ts';
let code1 = fs.readFileSync(file1, 'utf8');

const detectCode = // Función para detectar MIME a partir del Base64
function detectMimeType(base64Data) {
  const sigs = {
    png: { prefix: 'iVBORw0KGgo', mime: 'image/png', ext: 'png' },
    jpg: { prefix: '/9j/', mime: 'image/jpeg', ext: 'jpg' },
    webp: { prefix: 'UklGR', mime: 'image/webp', ext: 'webp' },
    gif: { prefix: 'R0lGODlh', mime: 'image/gif', ext: 'gif' }
  };
  const bStart = base64Data.substring(0, 12);
  for (const key in sigs) {
    if (bStart.startsWith(sigs[key].prefix)) return sigs[key];
  }
  return { mime: 'image/png', ext: 'png' };
};

// inject detectMimeType
code1 = code1.replace("const newItems = [];", "const newItems = [];\n\n" + detectCode + "\n");

// replace all hardcoded png types with detection 
code1 = code1.replace(/mimeType: 'image\/png'/g, "mimeType: (typeof b64Data !== 'undefined' ? detectMimeType(b64Data).mime : (typeof base64Data !== 'undefined' ? detectMimeType(base64Data).mime : 'image/png'))");
code1 = code1.replace(/fileName: 'image\.png'/g, "fileName: (typeof b64Data !== 'undefined' ? \image.\\ : (typeof base64Data !== 'undefined' ? \image.\\ : 'image.png'))");
code1 = code1.replace(/mimeType: imageData\.mimeType \|\| 'image\/png'/g, "mimeType: imageData.mimeType || detectMimeType(buffer.toString('base64')).mime");
code1 = code1.replace(/fileName: imageData\.fileName \|\| \image_\$\{i\}\.png\/g, "fileName: imageData.fileName || \image_\.\\");
code1 = code1.replace(/mimeType: imageToProcess\.mimeType \|\| 'image\/png'/g, "mimeType: imageToProcess.mimeType || detectMimeType(buffer.toString('base64')).mime");
code1 = code1.replace(/fileName: imageToProcess\.fileName \|\| 'image\.png'/g, "fileName: imageToProcess.fileName || \image.\\");

fs.writeFileSync(file1, code1);

const file2 = 'workflows/n8nmsi_cloud_n8n_m/personal/MSI Carousel Generator v11 - Low Memory.workflow.ts';
if (fs.existsSync(file2)) {
  let code2 = fs.readFileSync(file2, 'utf8');
  const injectCode2 = ar logo = '';\nvar logoMime = 'image/png';\nvar logoExt = 'png';\n + detectCode + \nif (li.binary) {
  var k = Object.keys(li.binary)[0];
  var buf = await this.helpers.getBinaryDataBuffer(0, k);
  logo = buf.toString('base64');
  var dt = detectMimeType(logo);
  logoMime = dt.mime;
  logoExt = dt.ext;
};
  code2 = code2.replace(/var logo = '';\\nif \(li\.binary\) \{\\n  var k = Object\.keys\(li\.binary\)\[0\];\\n  var buf = await this\.helpers\.getBinaryDataBuffer\(0, k\);\\n  logo = buf\.toString\('base64'\);\\n\}/g, injectCode2.replace(/\n/g, '\\n'));

  code2 = code2.replace(/logo: logo, h1: h1/g, "logo: logo, logoMime: logoMime, logoExt: logoExt, h1: h1");
  code2 = code2.replace(/mime_type: 'image\/png'/g, "mime_type: Parse Input.item.json.logoMime");
  
  fs.writeFileSync(file2, code2);
  console.log("Processed Carousel Gen");
}

console.log("DONE");
