// fix-fetch-retry.js — Add polling retry logic to all 3 Fetch nodes
// Problem: 2-minute wait isn't always enough; Fetch throws "not ready"
// Solution: Each Fetch node retries up to 8 times (30s apart = 4 min extra)
const fs = require('fs');

const FILE = 'video-gen-approved-flow.json';
const flow = JSON.parse(fs.readFileSync(FILE, 'utf8'));

// Helper: Build the SA auth preamble (shared by all Fetch nodes)
const AUTH_BLOCK = `const crypto = require('crypto');
const SA_EMAIL = 'vertex-veo@video-gen-msi.iam.gserviceaccount.com';
const SA_KEY = '-----BEGIN PRIVATE KEY-----\\nMIIEuwIBADANBgkqhkiG9w0BAQEFAASCBKUwggShAgEAAoIBAQDOuH1CtR7QVhT0\\n99yWCCuO2TkACYTjzWQTV8xXnvXNENgLuQjtv+iGXcLuIoFErYRW1aCpim3RwTep\\nCZisBEhCocUWUUdoNSxVoh9e21FRbY1U6ck2f73hLytIz2AtaJHhuy/MKsLjmkT2\\n2RGVnyu4+G6yXfCldVHtD4jHapXTUNkgyooCuQj+saqhtEsdjDbQTODTY4CUqLPI\\noMidS9yqyYRkzctpd2rwF3DtN42TV6dnhMY3ZPoZ5UpgXbseMAT5i9i3e35LQ0MK\\nVVxeSDOu7lCfA2hsdahBGF1nv186e+FsUXRKb+KhcFpxFWSKEKkxOjc/qkdEroY8\\nLjrat0DBAgMBAAECggEACALSyd/CgLDhUYf8eqz44SmOYa+8wGZAg1Zi8x9UJ70I\\nHlYuoCYQgQqHqBpat5pg10uilQdqD5elDE40pi/pS/nAbUe7lHCBFhV5EUA/E8CC\\n2mBP/aZwKZaeHw14TPIxOxX5uXgLwu3Cz+0kFxAKzfmEsrFcxtC32s/ADXhWM5Dr\\n7c/ilSUs3PbH5/wVTxjVkcpwN+hzl0Wv5u4BI65dq1zaMwT2gdTfDjmskNlEnupn\\n6nVxpmlRw1wNn/Z+C04VDOsAZtPJNSnnfQlVOFUgNvirgHudspmaYDqngO5583tr\\nwdBhwIy74NCLmff6uxFK3UB9HOl/rBjTCnrWxEl4kQKBgQDuWxFm8yfPtMO/m0Yt\\n9jRAAYFXQ7rM4fIFDVyUtHi85SiLo6fCxXvuxOgk4/D8MBxTbln3JttGEoLL6U26\\ntLfBIO7Yc9XDHYYKn7lYR3spa7+Y3Y3eqYQXjn4bY55p/9kPJlaNZhq+mFsapifE\\nBGUSVDE5i8iX/mLYk+zGH1OcKQKBgQDeBey0lXnJndQghY/TgMlrfkhMXhMk3vX3\\nN9yAJNlWlSsVPh7zN3YKbzMl+6JluU9acB9IIwMYlNJn4oadOP+s89k4bPSTi5H2\\nhrMSnMavYkPP9PRmCEMJfrbPefzvSUO4XrY6Idh2NKKZxzDJ0bG+rIQadxB4qHKF\\nlbiZSJUS2QJ/cZb0tBss3c9HegiFaWHrhJUzDmM4omsK611ywWtAHsUWjXVwfWGf\\nriood2wpbAWBekEcnqvl037+1i5Y3KFC8MbBDGYneNSZDHcR3QAzsYmnxTHQakxe\\npttBPcw7skg7KP0cQkZmeG4i/JAyYze08wcsbkAvWD/i21OjgsdrEQKBgQDLTI2E\\nheKw1Q5qgSJDvwewoD+/fdz1xBthtgr4Y8WHXKvIlcttVfmGcHBbdWEs2FRrMYPT\\nYAvztEI90dUFni2vxtG+szX47LJJFOpgPqJH8ii6AUjRLPuFdDwdG0yaJ3IVHtSp\\nwlgdVPEW8qggBR1GxV1phmDUuxmybHhOE4I9cQKBgHVGrcoRVdPlmFSRKYAlKrxZ\\nYNWqJP09bu+vSKGPYBo+zhYps58VjBRVjunPoQtSXYdK1aPnBMiMJPj0LVxB46fu\\nYV9mp1crPCpgLZW8EL9MawX0qp3xew6voBSIule4g2DH1yg7VBki+KPavXWDMENi\\n+pSlThxquK71D8u6vXuy\\n-----END PRIVATE KEY-----\\n';
const TOKEN_URI = 'https://oauth2.googleapis.com/token';
function b64url(str) { return Buffer.from(str).toString('base64').replace(/\\+/g,'-').replace(/\\//g,'_').replace(/=/g,''); }
function b64urlBuf(buf) { return buf.toString('base64').replace(/\\+/g,'-').replace(/\\//g,'_').replace(/=/g,''); }
const now = Math.floor(Date.now()/1000);
const hdr = b64url(JSON.stringify({alg:'RS256',typ:'JWT'}));
const pay = b64url(JSON.stringify({iss:SA_EMAIL,sub:SA_EMAIL,aud:TOKEN_URI,iat:now,exp:now+3600,scope:'https://www.googleapis.com/auth/cloud-platform'}));
const si = hdr + '.' + pay;
const signer = crypto.createSign('RSA-SHA256');
signer.update(si);
const jwt = si + '.' + b64urlBuf(signer.sign(SA_KEY));
const tokenRes = await this.helpers.httpRequest({method:'POST',url:TOKEN_URI,headers:{'Content-Type':'application/x-www-form-urlencoded'},body:'grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion='+jwt, timeout: 10000});
if (!tokenRes.access_token) throw new Error('Token failed');
const TOKEN = tokenRes.access_token;
const creds = $('Publicar Credenciales').item.json;
const s = $input.item.json;
const EP = creds.EP;
const PJ = creds.PJ;
const LOC = creds.LOC;`;

// ---- Fetch Part 1 (uses MDL = image-to-video model) ----
const fetchPart1Code = AUTH_BLOCK + `
const MDL = creds.MDL;
const MAX_RETRIES = 8;
const RETRY_DELAY_MS = 30000; // 30 seconds

let videoUri = '';
for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
  const res = await this.helpers.httpRequest({
    method: 'POST',
    url: 'https://' + EP + '/v1/projects/' + PJ + '/locations/' + LOC + '/publishers/google/models/' + MDL + ':fetchPredictOperation',
    headers: { 'Content-Type':'application/json', 'Authorization':'Bearer ' + TOKEN },
    body: JSON.stringify({ operationName: s.op1 }),
    timeout: 15000
  });
  videoUri = res.response?.videos?.[0]?.gcsUri || res.response?.videos?.[0]?.uri || '';
  if (videoUri) break;
  if (attempt < MAX_RETRIES) {
    console.log('Part 1 not ready (attempt ' + attempt + '/' + MAX_RETRIES + '). Retrying in 30s...');
    await new Promise(r => setTimeout(r, RETRY_DELAY_MS));
  } else {
    throw new Error('Part 1 not ready after ' + MAX_RETRIES + ' attempts: ' + JSON.stringify(res).substring(0, 400));
  }
}

return [{ json: { video1_gcs_uri: videoUri, PROMPT_PART2: s.PROMPT_PART2, PROMPT_PART3: s.PROMPT_PART3, DURATION: s.DURATION, ASPECT_RATIO: s.ASPECT_RATIO, POST_ID: s.POST_ID, ORIGINAL_PROMPT: s.ORIGINAL_PROMPT } }];`;

// ---- Fetch Part 2 (uses MDL_EXTEND) ----
const fetchPart2Code = AUTH_BLOCK + `
const MDL = creds.MDL_EXTEND;
const MAX_RETRIES = 8;
const RETRY_DELAY_MS = 30000;

let videoUri = '';
for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
  const res = await this.helpers.httpRequest({
    method: 'POST',
    url: 'https://' + EP + '/v1/projects/' + PJ + '/locations/' + LOC + '/publishers/google/models/' + MDL + ':fetchPredictOperation',
    headers: { 'Content-Type':'application/json', 'Authorization':'Bearer ' + TOKEN },
    body: JSON.stringify({ operationName: s.op2 }),
    timeout: 15000
  });
  videoUri = res.response?.videos?.[0]?.gcsUri || res.response?.videos?.[0]?.uri || '';
  if (videoUri) break;
  if (attempt < MAX_RETRIES) {
    console.log('Part 2 (extend) not ready (attempt ' + attempt + '/' + MAX_RETRIES + '). Retrying in 30s...');
    await new Promise(r => setTimeout(r, RETRY_DELAY_MS));
  } else {
    throw new Error('Part 2 (extend) not ready after ' + MAX_RETRIES + ' attempts: ' + JSON.stringify(res).substring(0, 400));
  }
}

return [{ json: { video1_gcs_uri: s.video1_gcs_uri, video2_gcs_uri: videoUri, PROMPT_PART3: s.PROMPT_PART3, POST_ID: s.POST_ID, ORIGINAL_PROMPT: s.ORIGINAL_PROMPT, DURATION: s.DURATION } }];`;

// ---- Fetch Part 3 (uses MDL_EXTEND) ----
const fetchPart3Code = AUTH_BLOCK + `
const MDL = creds.MDL_EXTEND;
const MAX_RETRIES = 8;
const RETRY_DELAY_MS = 30000;

let videoUri = '';
for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
  const res = await this.helpers.httpRequest({
    method: 'POST',
    url: 'https://' + EP + '/v1/projects/' + PJ + '/locations/' + LOC + '/publishers/google/models/' + MDL + ':fetchPredictOperation',
    headers: { 'Content-Type':'application/json', 'Authorization':'Bearer ' + TOKEN },
    body: JSON.stringify({ operationName: s.op3 }),
    timeout: 15000
  });
  videoUri = res.response?.videos?.[0]?.gcsUri || res.response?.videos?.[0]?.uri || '';
  if (videoUri) break;
  if (attempt < MAX_RETRIES) {
    console.log('Part 3 (extend) not ready (attempt ' + attempt + '/' + MAX_RETRIES + '). Retrying in 30s...');
    await new Promise(r => setTimeout(r, RETRY_DELAY_MS));
  } else {
    throw new Error('Part 3 (extend) not ready after ' + MAX_RETRIES + ' attempts: ' + JSON.stringify(res).substring(0, 400));
  }
}

return [{ json: { video1_gcs_uri: s.video1_gcs_uri, video2_gcs_uri: s.video2_gcs_uri, video3_gcs_uri: videoUri, POST_ID: s.POST_ID, ORIGINAL_PROMPT: s.ORIGINAL_PROMPT, DURATION: s.DURATION } }];`;

// Apply changes to the flow nodes
const nodeMap = { 'Fetch Part 1': fetchPart1Code, 'Fetch Part 2': fetchPart2Code, 'Fetch Part 3': fetchPart3Code };
let updated = 0;
for (const node of flow.nodes) {
    if (nodeMap[node.name]) {
        node.parameters.jsCode = nodeMap[node.name];
        updated++;
        console.log(`✅ ${node.name}: Updated with polling retry (8 attempts × 30s)`);
    }
}

// Write updated flow
fs.writeFileSync(FILE, JSON.stringify(flow, null, 2));
console.log(`\nDone — ${updated} Fetch nodes updated.`);
console.log('Total max wait per part: 2 min (Wait node) + 4 min (polling) = 6 min');
