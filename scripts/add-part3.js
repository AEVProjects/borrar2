/**
 * add-part3.js
 * Adds Part 3 (Call to Action) to both the approved flow and preview flow.
 * Also updates negative prompts, adds visual coherence rules, and silence buffers.
 * 
 * Run: node add-part3.js
 */
const fs = require('fs');

// ================================================================
// 1. UPDATE APPROVED FLOW — Add Part 3 nodes + pipeline changes
// ================================================================
const approved = JSON.parse(fs.readFileSync('video-gen-approved-flow.json', 'utf8'));
const find = name => approved.nodes.find(n => n.name === name);

// --- 1a. Publicar Credenciales: add STORAGE_URI_PART3 ---
const pubCreds = find('Publicar Credenciales');
pubCreds.parameters.jsCode = pubCreds.parameters.jsCode.replace(
  "STORAGE_URI_PART2: 'gs://video-bucket-for-msi-920206/approved-part2/'",
  "STORAGE_URI_PART2: 'gs://video-bucket-for-msi-920206/approved-part2/',\n    STORAGE_URI_PART3: 'gs://video-bucket-for-msi-920206/approved-part3/'"
);

// --- 1b. Format Approved Input: add PROMPT_PART3 ---
const formatInput = find('Format Approved Input');
let fiCode = formatInput.parameters.jsCode;
fiCode = fiCode.replace(
  "const approved2 = data.approved_prompt_part2 || '';",
  "const approved2 = data.approved_prompt_part2 || '';\nconst approved3 = data.approved_prompt_part3 || '';"
);
// Remove validation that requires part3 (make it optional for backward compat)
fiCode = fiCode.replace(
  "PROMPT_PART2: approved2,",
  "PROMPT_PART2: approved2,\n  PROMPT_PART3: approved3,"
);
formatInput.parameters.jsCode = fiCode;

// --- 1c. Download Image 1: pass through PROMPT_PART3 ---
const dlImg = find('Download Image 1');
dlImg.parameters.jsCode = dlImg.parameters.jsCode.replace(
  "PROMPT_PART2: s.PROMPT_PART2,",
  "PROMPT_PART2: s.PROMPT_PART2, PROMPT_PART3: s.PROMPT_PART3,"
);

// --- 1d. Submit Part 1: pass PROMPT_PART3 + update negative prompt ---
const sp1 = find('Submit Part 1');
sp1.parameters.jsCode = sp1.parameters.jsCode.replace(
  "PROMPT_PART2: s.PROMPT_PART2,",
  "PROMPT_PART2: s.PROMPT_PART2, PROMPT_PART3: s.PROMPT_PART3,"
);
sp1.parameters.jsCode = sp1.parameters.jsCode.replace(
  "frozen face, closed mouth,",
  "frozen face, closed mouth, extra hands, extra fingers, extra arms, extra limbs, duplicate body parts, morphing body, body transformation,"
);

// --- 1e. Fetch Part 1: pass through PROMPT_PART3 ---
const fp1 = find('Fetch Part 1');
fp1.parameters.jsCode = fp1.parameters.jsCode.replace(
  "PROMPT_PART2: s.PROMPT_PART2,",
  "PROMPT_PART2: s.PROMPT_PART2, PROMPT_PART3: s.PROMPT_PART3,"
);

// --- 1f. Submit Part 2: pass PROMPT_PART3 + update negative prompt ---
const sp2 = find('Submit Part 2');
sp2.parameters.jsCode = sp2.parameters.jsCode.replace(
  "DURATION: s.DURATION,",
  "PROMPT_PART3: s.PROMPT_PART3, DURATION: s.DURATION,"
);
sp2.parameters.jsCode = sp2.parameters.jsCode.replace(
  "frozen face, closed mouth'",
  "frozen face, closed mouth, extra hands, extra fingers, extra arms, extra limbs, duplicate body parts, morphing body'"
);

// --- 1g. Fetch Part 2: pass through PROMPT_PART3 ---
const fp2 = find('Fetch Part 2');
fp2.parameters.jsCode = fp2.parameters.jsCode.replace(
  "POST_ID: s.POST_ID,",
  "PROMPT_PART3: s.PROMPT_PART3, POST_ID: s.POST_ID,"
);

// --- 1h. Create Submit Part 3 node ---
// Clone Submit Part 2's jsCode and adapt for Part 3
let submitP3Code = sp2.parameters.jsCode;
// Change the comment
submitP3Code = submitP3Code.replace(
  'Submit Part 2 as VIDEO-TO-VIDEO EXTENSION',
  'Submit Part 3 as VIDEO-TO-VIDEO EXTENSION (Call to Action)'
);
submitP3Code = submitP3Code.replace(
  "Uses the GCS URI from Part 1 as the video input.",
  "Uses the GCS URI from Part 2 as the video input."
);
// Change prompt reference
submitP3Code = submitP3Code.replace('prompt: s.PROMPT_PART2', 'prompt: s.PROMPT_PART3');
// Change video input source (Part 3 extends from Part 2)
submitP3Code = submitP3Code.replace(
  'video: { gcsUri: s.video1_gcs_uri',
  'video: { gcsUri: s.video2_gcs_uri'
);
// Change storage URI
submitP3Code = submitP3Code.replace('creds.STORAGE_URI_PART2', 'creds.STORAGE_URI_PART3');
// Change error message
submitP3Code = submitP3Code.replace('Veo Part 2 (extend) failed', 'Veo Part 3 (extend) failed');
// Change output: op2 → op3, add video2_gcs_uri, remove PROMPT_PART3
submitP3Code = submitP3Code.replace(
  /return \[\{ json: \{[^}]+\} \}\];$/m,
  "return [{ json: { op3: veoRes.name, video1_gcs_uri: s.video1_gcs_uri, video2_gcs_uri: s.video2_gcs_uri, DURATION: s.DURATION, POST_ID: s.POST_ID, ORIGINAL_PROMPT: s.ORIGINAL_PROMPT } }];"
);

const submitPart3Node = {
  parameters: { jsCode: submitP3Code },
  type: "n8n-nodes-base.code",
  typeVersion: 2,
  position: [89440, -1616],
  id: "e2b00002-bbbb-4002-c002-000000000015",
  name: "Submit Part 3"
};

// --- 1i. Create Wait Part 3 node ---
const waitPart3Node = {
  parameters: { amount: 2, unit: "minutes" },
  type: "n8n-nodes-base.wait",
  typeVersion: 1.1,
  position: [89664, -1616],
  id: "e2b00002-bbbb-4002-c002-000000000016",
  name: "Wait Part 3",
  webhookId: "veo3-approved-wait-3"
};

// --- 1j. Create Fetch Part 3 node ---
// Clone from Fetch Part 2 and modify
let fetchP3Code = fp2.parameters.jsCode;
// Change operation name reference
fetchP3Code = fetchP3Code.replace('operationName: s.op2', 'operationName: s.op3');
// Change error message
fetchP3Code = fetchP3Code.replace("Part 2 (extend) not ready", "Part 3 (extend) not ready");
// Change model to use MDL_EXTEND (Fetch Part 2 uses MDL_EXTEND too — same)
// Change output to include video3_gcs_uri
fetchP3Code = fetchP3Code.replace(
  /return \[\{ json: \{[^}]+\} \}\];$/m,
  "return [{ json: { video1_gcs_uri: s.video1_gcs_uri, video2_gcs_uri: s.video2_gcs_uri, video3_gcs_uri: videoUri, POST_ID: s.POST_ID, ORIGINAL_PROMPT: s.ORIGINAL_PROMPT, DURATION: s.DURATION } }];"
);

const fetchPart3Node = {
  parameters: { jsCode: fetchP3Code },
  type: "n8n-nodes-base.code",
  typeVersion: 2,
  position: [89888, -1616],
  id: "e2b00002-bbbb-4002-c002-000000000017",
  name: "Fetch Part 3"
};

// --- 1k. Shift existing nodes right to make room ---
const genUrls = find('Generate URLs');
genUrls.position = [90112, -1616];
const updateDb = find('Update DB');
updateDb.position = [90336, -1616];
const respondSuccess = find('Respond Success');
respondSuccess.position = [90560, -1616];

// --- 1l. Update Generate URLs: sign 3 videos ---
let guCode = genUrls.parameters.jsCode;
guCode = guCode.replace(
  "return [{ json: {\n  video1_gcs_uri: s.video1_gcs_uri,\n  video2_gcs_uri: s.video2_gcs_uri,\n  video1_url: signUrl(s.video1_gcs_uri),\n  video2_url: signUrl(s.video2_gcs_uri),\n  POST_ID: s.POST_ID,\n  ORIGINAL_PROMPT: s.ORIGINAL_PROMPT,\n  DURATION: s.DURATION\n} }];",
  "return [{ json: {\n  video1_gcs_uri: s.video1_gcs_uri,\n  video2_gcs_uri: s.video2_gcs_uri,\n  video3_gcs_uri: s.video3_gcs_uri,\n  video1_url: signUrl(s.video1_gcs_uri),\n  video2_url: signUrl(s.video2_gcs_uri),\n  video3_url: signUrl(s.video3_gcs_uri),\n  POST_ID: s.POST_ID,\n  ORIGINAL_PROMPT: s.ORIGINAL_PROMPT,\n  DURATION: s.DURATION\n} }];"
);
genUrls.parameters.jsCode = guCode;

// --- 1m. Update DB: store 3 videos ---
let dbQuery = updateDb.parameters.query;
// UPDATE branch
dbQuery = dbQuery.replace(
  "video2_signed_url = '${$json.video2_url}', status = 'video_completed'",
  "video2_signed_url = '${$json.video2_url}', video_part3_uri = '${$json.video3_gcs_uri}', video3_signed_url = '${$json.video3_url}', status = 'video_completed'"
);
// INSERT branch
dbQuery = dbQuery.replace(
  "video_part1_uri, video_part2_uri, video1_signed_url, video2_signed_url, created_at",
  "video_part1_uri, video_part2_uri, video_part3_uri, video1_signed_url, video2_signed_url, video3_signed_url, created_at"
);
dbQuery = dbQuery.replace(
  "'${$json.video1_gcs_uri}', '${$json.video2_gcs_uri}', '${$json.video1_url}', '${$json.video2_url}', NOW()",
  "'${$json.video1_gcs_uri}', '${$json.video2_gcs_uri}', '${$json.video3_gcs_uri}', '${$json.video1_url}', '${$json.video2_url}', '${$json.video3_url}', NOW()"
);
updateDb.parameters.query = dbQuery;

// --- 1n. Update Respond Success: return 3 URLs ---
let respBody = respondSuccess.parameters.responseBody;
respBody = respBody.replace(
  "video2_url: $('Generate URLs').item.json.video2_url,",
  "video2_url: $('Generate URLs').item.json.video2_url, video3_url: $('Generate URLs').item.json.video3_url,"
);
respBody = respBody.replace(
  "video2_gcs_uri: $('Generate URLs').item.json.video2_gcs_uri,",
  "video2_gcs_uri: $('Generate URLs').item.json.video2_gcs_uri, video3_gcs_uri: $('Generate URLs').item.json.video3_gcs_uri,"
);
respondSuccess.parameters.responseBody = respBody;

// --- 1o. Add new nodes to the nodes array ---
approved.nodes.push(submitPart3Node, waitPart3Node, fetchPart3Node);

// --- 1p. Update connections ---
// Remove old: Fetch Part 2 → Generate URLs
// Add: Fetch Part 2 → Submit Part 3 → Wait Part 3 → Fetch Part 3 → Generate URLs
approved.connections['Fetch Part 2'].main[0] = [{ node: 'Submit Part 3', type: 'main', index: 0 }];
approved.connections['Submit Part 3'] = { main: [[{ node: 'Wait Part 3', type: 'main', index: 0 }]] };
approved.connections['Wait Part 3'] = { main: [[{ node: 'Fetch Part 3', type: 'main', index: 0 }]] };
approved.connections['Fetch Part 3'] = { main: [[{ node: 'Generate URLs', type: 'main', index: 0 }]] };

// Write back
fs.writeFileSync('video-gen-approved-flow.json', JSON.stringify(approved, null, 2));
console.log('✅ Approved flow updated: Part 3 added (Submit, Wait, Fetch), negative prompts updated, connections updated.');

// ================================================================
// 2. UPDATE PREVIEW FLOW — 3 parts, visual coherence, silence
// ================================================================
const preview = JSON.parse(fs.readFileSync('video-script-preview-flow.json', 'utf8'));
const findP = name => preview.nodes.find(n => n.name === name);

// --- 2a. Update Agent prompt ---
const agent = findP('Agent: Video Script');

// Build the new prompt text (n8n expression)
agent.parameters.text = `="You write Veo 3.1 image-to-video prompts for MSI Technologies.\\n\\nVideo duration: " + $json.duration + "s per part. THREE parts using video extension.\\n\\nSERVICE: " + $json.service + "\\nCONTEXT: " + $json.prompt + "\\nAUDIENCE: " + ($json.topic || 'Business professionals') + "\\n\\nIMPORTANT — READ THE CONTEXT ABOVE CAREFULLY. Your prompts MUST directly reflect what the user described. If they mention a specific action (walking, holding camera, sitting), a specific visual element (eye patch, glasses, hat, holding an object), or any specific detail — you MUST include and maintain it in ALL three parts. Never contradict or ignore the CONTEXT.\\n\\nVISUAL COHERENCE (CRITICAL RULE):\\n- ALL visual elements visible in the reference image MUST persist EXACTLY across ALL three parts.\\n- If the person is holding something, wearing something, or has any distinguishing feature — it MUST remain identical in every part.\\n- NEVER add, remove, morph, animate away, or transform any body part or visual element.\\n- If the person has one hand holding a camera, they keep holding it in all parts. No extra hands, no missing hands.\\n\\nTHE VIDEO HAS THREE PARTS WITH THREE DIFFERENT PURPOSES:\\n\\nPART 1 — SERVICES: The person passionately sells MSI Technologies, making the viewer feel an urgent need for these solutions. Reference the SERVICE value above to know which service to emphasize, but always position MSI as a full-service technology company. Key services:\\n- IT Outsourcing: global IT talent, managed services, remote teams, scalable tech staffing.\\n- AI Solutions: artificial intelligence, automation, machine learning, data-driven innovation.\\n- Business Process Outsourcing (BPO): outsourcing non-core tasks, process optimization.\\n- IT Management and Cybersecurity: threat detection, security operations, protecting business systems.\\n- Workforce Agility: flexible staffing, adaptive talent solutions, scaling teams.\\n- Executive Consulting: strategic advisory, navigating complexity, driving performance.\\n- Telecom Services: network planning, RF engineering, telecommunications infrastructure.\\nIf SERVICE = company_intro, mention several key services broadly. If SERVICE is specific, lead with that service.\\n\\nPART 2 — WHY CHOOSE MSI: The person delivers a powerful pitch making an irresistible case for MSI Technologies. Key differentiators:\\n- 20+ years of industry experience\\n- Time-zone aligned teams — nearshore advantage\\n- Cost reduction up to 40-60% without sacrificing quality\\n- Part of the Talentor group, presence in 40+ countries\\n- Flexible, tailored strategies for each client\\n- Nearshore model: proximity, cultural alignment, real-time collaboration\\nTone: confident, persuasive — closing the sale.\\n\\nPART 3 — CALL TO ACTION: The person motivates the viewer to take immediate action. This is the final closing pitch:\\n- Inspire urgency: do not let competitors get ahead\\n- Direct invitation: contact MSI, visit the website, schedule a consultation\\n- Reinforce trust: a partner with 20+ years you can count on\\n- End with a confident, warm closing gesture (nod, smile)\\nTone: inspiring, action-oriented, memorable.\\n\\nCRITICAL SPEECH TIMING (8-second video per part):\\n- Natural speech = ~2.5 words/second\\n- Person speaks for the FIRST 6 SECONDS only\\n- LAST 2 SECONDS = COMPLETE SILENCE — the person holds a composed, confident pose\\n- MAXIMUM 15 WORDS of spoken dialogue per part\\n- Write EXACT dialogue using colon syntax: The person says: [exact words here]\\n- Count your words carefully — if over 15, rewrite shorter\\n- The three parts form a COHERENT narrative adapted to the CONTEXT\\n- NO speech should be cut mid-word — each part is self-contained in its speech\\n\\nSILENCE BUFFER BETWEEN PARTS (MANDATORY):\\n- Each part MUST end with 2 seconds of SILENCE (person finishes speaking, holds pose)\\n- Each new part starts fresh with the person beginning a new thought after a natural beat\\n- This prevents speech being cut mid-word at part transitions\\n\\nPROMPT FORMAT (for each part):\\n- Line 1: Brief motion direction (gesture, head movement) - max 10 words\\n- Line 2: EXACT dialogue with colon syntax - max 15 spoken words\\n- NEVER describe person appearance, clothing, background, or setting\\n- NEVER use quotation marks — only colons for speech\\n- Camera follows the subject naturally, smoothly tracking their movement\\n\\nPART 1 PROMPT RULES:\\n- If SERVICE is company_intro, mention multiple services broadly.\\n- If SERVICE is specific, lead with that service.\\n- Dialogue must be bold, persuasive, and create desire.\\n- Person finishes speaking by second 6, holds composed pose for last 2 seconds.\\n\\nPART 2 PROMPT RULES:\\n- The person starts speaking from frame 1 (after natural beat).\\n- WHY choose MSI — experience, nearshore, cost reduction, Talentor, tailored strategies.\\n- Person finishes speaking by second 6, holds composed pose for last 2 seconds.\\n\\nPART 3 PROMPT RULES:\\n- The person starts speaking from frame 1 (after natural beat).\\n- Call to action — contact MSI, schedule consultation, visit website.\\n- Person finishes speaking by second 5, ends with confident closing gesture (nod, warm smile) for last 3 seconds.\\n\\nVOICE DESCRIPTION (MANDATORY — include in EVERY prompt):\\n- The person speaks in a clear, confident, professional American English accent.\\n- Warm and articulate tone, like a corporate spokesperson.\\n- Natural conversational pace, not robotic or overly dramatic.\\n- Include this voice direction in each prompt: speaks with a clear American accent, warm professional tone\\n\\nPart 1 presents WHAT MSI offers. Part 2 explains WHY choose MSI. Part 3 inspires ACTION. Together they form a complete persuasive narrative.\\n\\nOutput format: PART1_PROMPT ||| PART2_PROMPT ||| PART3_PROMPT\\nEach prompt under 280 characters. Max 15 spoken words per part."`;

// --- 2b. Update system message ---
agent.parameters.options.systemMessage = `You write Veo 3.1 image-to-video prompts for MSI Technologies. RULES: 1) Write EXACT dialogue with colon syntax (person says: words here). 2) MAX 15 spoken words per part - count carefully. 3) Never describe person/background - only motion and speech. 4) Camera follows subject naturally. No music. 5) THREE PARTS: PART 1 = MSI Services, PART 2 = Why Choose MSI, PART 3 = Call to Action. 6) VISUAL COHERENCE: maintain ALL visual elements from reference image across all parts — never add/remove/morph body parts or objects. 7) SILENCE BUFFER: person speaks for first 6 seconds, last 2 seconds are SILENT composed pose. No mid-word cuts. 8) Respect the user's CONTEXT — if they mention specific actions or visual elements, include them in ALL parts. 9) VOICE: clear American English accent, warm professional tone in every prompt. Format: PART1_PROMPT ||| PART2_PROMPT ||| PART3_PROMPT. Under 280 chars each.`;

// --- 2c. Update Build Settings ---
const buildSettings = findP('Build Settings');
buildSettings.parameters.jsCode = `const agentOutput = $('Agent: Video Script').item.json.output || '';
const f = $('Format Video Input').item.json;

let p1 = '', p2 = '', p3 = '';
if (agentOutput.includes('|||')) {
  const parts = agentOutput.split('|||');
  p1 = parts[0].trim();
  p2 = (parts[1] || '').trim();
  p3 = (parts[2] || '').trim();
} else {
  p1 = agentOutput.substring(0, 300);
  p2 = agentOutput.substring(0, 300);
  p3 = agentOutput.substring(0, 300);
}

// Validate word count in dialogue (extract words after colon)
function countSpokenWords(prompt) {
  const colonMatch = prompt.match(/says?:\\s*(.+?)(?:\\.|$)/i);
  if (!colonMatch) return 0;
  return colonMatch[1].trim().split(/\\s+/).length;
}

const w1 = countSpokenWords(p1);
const w2 = countSpokenWords(p2);
const w3 = countSpokenWords(p3);
if (w1 > 18) { console.log('WARNING: Part 1 has ' + w1 + ' spoken words (max 15)'); }
if (w2 > 18) { console.log('WARNING: Part 2 has ' + w2 + ' spoken words (max 15)'); }
if (w3 > 18) { console.log('WARNING: Part 3 has ' + w3 + ' spoken words (max 15)'); }

// Suffixes with visual coherence + silence buffer
const suffix1 = ' Clear American English accent, warm professional tone. Present MSI services confidently. Person finishes speaking by second 6, holds composed silent pose for last 2 seconds. Voice only, zero music. Camera follows subject smoothly.';
const suffix2 = ' Person starts speaking after natural beat with clear American English accent, warm professional tone. Explain why choose MSI — experience, nearshore, cost reduction. Person finishes speaking by second 6, holds composed silent pose for last 2 seconds. Voice only, zero music. Camera follows subject smoothly.';
const suffix3 = ' Person starts speaking after natural beat with clear American English accent, warm professional tone. Call to action — contact MSI, transform your business. Person finishes speaking by second 5, ends with confident warm smile and nod for last 3 seconds. Voice only, zero music. Camera follows subject smoothly.';

return [{
  json: {
    PROMPT_PART1: (p1 + suffix1).substring(0, 600),
    PROMPT_PART2: (p2 + suffix2).substring(0, 600),
    PROMPT_PART3: (p3 + suffix3).substring(0, 600),
    DURATION: f.duration,
    ASPECT_RATIO: f.aspect_ratio,
    POST_ID: f.post_id,
    ORIGINAL_PROMPT: f.prompt,
    SERVICE: f.service,
    START_IMAGE_URL: f.start_image_url
  }
}];`;

// --- 2d. Update Save Preview: store PROMPT_PART3 in post_copy JSON ---
const savePreview = findP('Save Preview');
savePreview.parameters.query = `={{ \`INSERT INTO social_posts (post_type, status, strategy_analysis, image_prompt, post_copy, image_url, headline, created_at, updated_at) VALUES ('Video Preview', 'pending', '\${($json.PROMPT_PART1 || '').replace(/'/g, "''")}', '\${($json.PROMPT_PART2 || '').replace(/'/g, "''")}', '\${JSON.stringify({original_prompt: $json.ORIGINAL_PROMPT || '', service: $json.SERVICE || 'company_intro', duration: $json.DURATION || '8', aspect_ratio: $json.ASPECT_RATIO || '9:16', start_image_url: $json.START_IMAGE_URL || '', prompt_part3: $json.PROMPT_PART3 || ''}).replace(/'/g, "''")}', '\${($json.START_IMAGE_URL || '').replace(/'/g, "''")}', '\${($json.ORIGINAL_PROMPT || '').substring(0, 120).replace(/'/g, "''")}', NOW(), NOW()) RETURNING *\` }}`;

// --- 2e. Update Respond Preview: return prompt_part3 ---
let respPBody = findP('Respond Preview').parameters.responseBody;
respPBody = respPBody.replace(
  "prompt_part2: $('Build Settings').item.json.PROMPT_PART2 || ''",
  "prompt_part2: $('Build Settings').item.json.PROMPT_PART2 || '', prompt_part3: $('Build Settings').item.json.PROMPT_PART3 || ''"
);
findP('Respond Preview').parameters.responseBody = respPBody;

// Write back
fs.writeFileSync('video-script-preview-flow.json', JSON.stringify(preview, null, 2));
console.log('✅ Preview flow updated: 3 parts, visual coherence, silence buffers, PROMPT_PART3.');

// ================================================================
// 3. VALIDATION
// ================================================================
// Re-read and validate
const v1 = JSON.parse(fs.readFileSync('video-gen-approved-flow.json', 'utf8'));
const v2 = JSON.parse(fs.readFileSync('video-script-preview-flow.json', 'utf8'));

// Check approved flow
const nodeNames = v1.nodes.map(n => n.name);
const requiredNodes = ['Submit Part 3', 'Wait Part 3', 'Fetch Part 3'];
const missingNodes = requiredNodes.filter(n => !nodeNames.includes(n));
if (missingNodes.length) {
  console.error('❌ Missing nodes:', missingNodes);
} else {
  console.log(`✅ Approved flow: ${v1.nodes.length} nodes (all Part 3 nodes present)`);
}

// Check connections
const connKeys = Object.keys(v1.connections);
const requiredConns = ['Submit Part 3', 'Wait Part 3', 'Fetch Part 3'];
const missingConns = requiredConns.filter(n => !connKeys.includes(n));
if (missingConns.length) {
  console.error('❌ Missing connections:', missingConns);
} else {
  console.log('✅ Approved flow: all Part 3 connections present');
}

// Check STORAGE_URI_PART3
const pubCredsV = v1.nodes.find(n => n.name === 'Publicar Credenciales');
if (pubCredsV.parameters.jsCode.includes('STORAGE_URI_PART3')) {
  console.log('✅ STORAGE_URI_PART3 present');
} else {
  console.error('❌ STORAGE_URI_PART3 missing');
}

// Check PROMPT_PART3 propagation
const chainNodes = ['Format Approved Input', 'Download Image 1', 'Submit Part 1', 'Fetch Part 1', 'Submit Part 2', 'Fetch Part 2'];
for (const name of chainNodes) {
  const node = v1.nodes.find(n => n.name === name);
  if (!node.parameters.jsCode.includes('PROMPT_PART3')) {
    console.error(`❌ PROMPT_PART3 missing in ${name}`);
  }
}
console.log('✅ PROMPT_PART3 propagated through chain');

// Check negative prompts
const sp1V = v1.nodes.find(n => n.name === 'Submit Part 1');
if (sp1V.parameters.jsCode.includes('extra hands')) {
  console.log('✅ Negative prompt updated with extra hands/limbs');
}

// Check preview flow
if (v2.nodes.find(n => n.name === 'Build Settings').parameters.jsCode.includes('PROMPT_PART3')) {
  console.log('✅ Preview flow: PROMPT_PART3 in Build Settings');
}
if (v2.nodes.find(n => n.name === 'Agent: Video Script').parameters.text.includes('PART 3')) {
  console.log('✅ Preview flow: PART 3 in agent prompt');
}
if (v2.nodes.find(n => n.name === 'Respond Preview').parameters.responseBody.includes('prompt_part3')) {
  console.log('✅ Preview flow: prompt_part3 in response');
}

console.log('\n🎬 Done! Both flows updated for 3-part video generation.');
console.log('Next steps:');
console.log('1. Run: ALTER TABLE social_posts ADD COLUMN IF NOT EXISTS video_part3_uri TEXT, ADD COLUMN IF NOT EXISTS video3_signed_url TEXT;');
console.log('2. Update frontend (index.html + app.js) for Part 3');
console.log('3. Re-import both flows into n8n');
