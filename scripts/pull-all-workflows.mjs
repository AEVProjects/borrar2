// Script to pull all workflows from n8n cloud using n8nac CLI
import { execSync } from 'child_process';
import { readFileSync } from 'fs';

// Read config
const config = JSON.parse(readFileSync('n8nac-config.json', 'utf-8'));
const host = config.host;

// Get API key from global conf store
import Conf from 'file:///C:/Users/artki/AppData/Roaming/npm/node_modules/@n8n-as-code/cli/node_modules/conf/dist/source/index.js';
const globalStore = new Conf({ projectName: 'n8nac', configName: 'credentials' });
const credentials = globalStore.get('hosts') || {};
const apiKey = credentials[new URL(host).origin];

if (!apiKey) {
  console.error('No API key found for', host);
  process.exit(1);
}

// Fetch all workflow IDs from n8n API
const resp = await fetch(`${host}/api/v1/workflows?limit=200`, {
  headers: { 'X-N8N-API-KEY': apiKey }
});
const data = await resp.json();
const workflows = data.data;

console.log(`Found ${workflows.length} workflows in n8n cloud\n`);

// Pull each one using n8nac CLI
let success = 0;
let failed = 0;

for (const wf of workflows) {
  try {
    console.log(`Pulling: ${wf.name} (${wf.id})...`);
    execSync(`n8nac pull --workflowsid ${wf.id}`, { stdio: 'pipe' });
    success++;
    console.log(`  ✓ OK`);
  } catch (err) {
    failed++;
    console.log(`  ✗ FAILED: ${err.message.split('\n')[0]}`);
  }
}

console.log(`\nDone! Pulled: ${success}, Failed: ${failed}, Total: ${workflows.length}`);
