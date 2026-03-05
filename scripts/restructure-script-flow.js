// restructure-script-flow.js — Restructure the 3-part video script following sales funnel pattern
// Part 1: Hook + Pain Point | Part 2: Offer + Social Proof | Part 3: Why MSI + CTA (combined)
const fs = require('fs');

const PREVIEW_FILE = 'video-script-preview-flow.json';
const APPROVED_FILE = 'video-gen-approved-flow.json';

// =========================================================
// 1. Update Preview Flow (Agent prompt + Build Settings)
// =========================================================
const preview = JSON.parse(fs.readFileSync(PREVIEW_FILE, 'utf8'));

// --- New Agent Prompt ---
const agentPromptText = `="You write Veo 3.1 image-to-video prompts for MSI Technologies.\\n\\nVideo duration: " + $json.duration + "s per part. THREE parts using video extension.\\n\\nSERVICE: " + $json.service + "\\nCONTEXT: " + $json.prompt + "\\nAUDIENCE: " + ($json.topic || 'Business professionals') + "\\n\\nIMPORTANT — READ THE CONTEXT ABOVE CAREFULLY. Your prompts MUST directly reflect what the user described. If they mention a specific action (walking, holding camera, sitting), a specific visual element (eye patch, glasses, hat, holding an object), or any specific detail — you MUST include and maintain it in ALL three parts. Never contradict or ignore the CONTEXT.\\n\\nVISUAL COHERENCE (CRITICAL RULE):\\n- ALL visual elements visible in the reference image MUST persist EXACTLY across ALL three parts.\\n- If the person is holding something, wearing something, or has any distinguishing feature — it MUST remain identical in every part.\\n- NEVER add, remove, morph, animate away, or transform any body part or visual element.\\n- If the person has one hand holding a camera, they keep holding it in all parts. No extra hands, no missing hands.\\n- NEVER add a waving gesture, farewell animation, greeting, or any animated ending. The person stays natural and still.\\n\\nSALES FUNNEL STRUCTURE (follow this pattern like a professional sales video):\\n\\nPART 1 — HOOK + PAIN POINT (Grab Attention):\\nOpen with a bold, attention-grabbing statement that makes the viewer stop scrolling. Present the problem they face and introduce MSI as the solution. Think: opening line of a sales pitch.\\n\\nExamples of the tone and style to follow (adapt to the SERVICE):\\n- workforce_agility: The person says: You could hire skilled remote talent for six to ten dollars an hour instead of sixty thousand a year.\\n- it_outsourcing: The person says: Your IT team is stretched thin and you are bleeding money on contractors who do not deliver.\\n- ai_solutions: The person says: Your competitors are using AI to move twice as fast while you are still doing things manually.\\n- cybersecurity: The person says: One data breach could cost your company millions and most businesses are not prepared.\\n- bpo: The person says: Your team wastes hours on repetitive tasks that a trained professional could handle for a fraction.\\n- consulting: The person says: Navigating digital transformation alone is why most companies fail in the first two years.\\n- telecom: The person says: Poor network infrastructure is silently killing your business productivity every single day.\\n- company_intro: The person says: What if one company could handle your IT, staffing, AI, and cybersecurity all at once.\\n\\nPART 2 — THE OFFER + SOCIAL PROOF (Build Desire):\\nExplain exactly what MSI delivers. Make it concrete and irresistible. Back it up with credibility.\\n\\nKey elements to weave in (pick the most relevant 2-3 for the SERVICE):\\n- We handle everything — completely done for you\\n- 20+ years of industry experience\\n- Hundreds of businesses served successfully\\n- College-educated, pre-vetted, triple-tested talent\\n- Nearshore: same time zone, fluent English, cultural alignment\\n- Cost savings of 40-60% without sacrificing quality\\n- Part of the Talentor group — presence in 40+ countries\\n- No contracts, no middleman markups, no hassle\\n- Flexible strategies tailored to your exact needs\\n\\nExamples of the tone:\\n- The person says: We handle all the vetting, interviews, and testing. Twenty years, hundreds of businesses served.\\n- The person says: Our nearshore teams work in your time zone, fluent English, pre-vetted, saving you up to sixty percent.\\n\\nPART 3 — WHY MSI + CALL TO ACTION (Close + Action):\\nCombine the final persuasive argument with a direct call to action. This is the closing. Make the viewer feel they would be foolish NOT to act now.\\n\\nKey elements:\\n- Final trust-building: guarantee, client results, competitive advantage\\n- Direct CTA: contact MSI, schedule a free consultation, visit the website\\n- Urgency: do not let competitors get ahead\\n- Confidence and warmth in delivery\\n\\nExamples of the tone:\\n- The person says: We guarantee every placement. Contact MSI today and let us transform your business.\\n- The person says: Stop overpaying for talent. Schedule a free consultation with MSI and start saving today.\\n\\nCRITICAL ENDING RULE FOR PART 3 (MANDATORY):\\n- Person finishes speaking and then simply HOLDS A STILL, NATURAL POSE looking at the camera.\\n- ABSOLUTELY NO waving, NO farewell gesture, NO animated greeting, NO hand raising, NO nodding repeatedly.\\n- Just a confident, composed, STILL presence. Like the end of a professional commercial.\\n- The person is DONE TALKING and just looks at you. That is the ending.\\n\\nCRITICAL SPEECH TIMING (8-second video per part):\\n- Natural speech = ~2.5 words/second\\n- Person speaks for the FIRST 6 SECONDS only\\n- LAST 2 SECONDS = COMPLETE SILENCE — the person holds a composed, still pose\\n- MAXIMUM 15 WORDS of spoken dialogue per part\\n- Write EXACT dialogue using colon syntax: The person says: [exact words here]\\n- Count your words carefully — if over 15, rewrite shorter\\n- The three parts form a COHERENT sales narrative adapted to the CONTEXT\\n- NO speech should be cut mid-word — each part is self-contained\\n\\nSILENCE BUFFER BETWEEN PARTS (MANDATORY):\\n- Each part MUST end with 2 seconds of SILENCE (person finishes speaking, holds still pose)\\n- Each new part starts fresh with the person beginning a new thought after a natural beat\\n- This prevents speech being cut mid-word at part transitions\\n\\nPROMPT FORMAT (for each part):\\n- Line 1: Brief motion direction (subtle gesture, head tilt) - max 10 words. Keep it minimal and natural.\\n- Line 2: EXACT dialogue with colon syntax - max 15 spoken words\\n- NEVER describe person appearance, clothing, background, or setting\\n- NEVER use quotation marks — only colons for speech\\n- NEVER include waving, greeting, farewell, or any animated ending gesture\\n- Camera follows the subject naturally, smoothly tracking their movement\\n\\nVOICE DESCRIPTION (MANDATORY — include in EVERY prompt):\\n- Speaks with a clear, confident American English accent, warm professional tone.\\n- Natural conversational pace. Not robotic, not overly dramatic.\\n\\nPart 1 HOOKS the viewer. Part 2 BUILDS DESIRE with the offer. Part 3 CLOSES with why MSI + CTA. Together they form a complete sales funnel like a professional ad.\\n\\nOutput format: PART1_PROMPT ||| PART2_PROMPT ||| PART3_PROMPT\\nEach prompt under 280 characters. Max 15 spoken words per part."`;

const systemMessage = `You write Veo 3.1 image-to-video prompts for MSI Technologies following a sales funnel structure. RULES: 1) Write EXACT dialogue with colon syntax (person says: words here). 2) MAX 15 spoken words per part - count carefully. 3) Never describe person/background - only motion and speech. 4) Camera follows subject naturally. No music. 5) THREE PARTS following a SALES FUNNEL: PART 1 = Hook + Pain Point (grab attention), PART 2 = The Offer + Social Proof (build desire), PART 3 = Why MSI + Call to Action COMBINED (close + action). 6) VISUAL COHERENCE: maintain ALL visual elements from reference image across all parts — never add/remove/morph body parts or objects. 7) SILENCE BUFFER: person speaks for first 6 seconds, last 2 seconds are SILENT still pose. No mid-word cuts. 8) CRITICAL: Part 3 ending = person holds STILL natural pose. ABSOLUTELY NO waving, no farewell gesture, no animated ending, no greeting, no hand raising. Just a confident still look at camera. 9) Respect the user's CONTEXT. 10) VOICE: clear American English accent, warm professional tone in every prompt. Format: PART1_PROMPT ||| PART2_PROMPT ||| PART3_PROMPT. Under 280 chars each.`;

// --- New Build Settings code ---
const buildSettingsCode = `const agentOutput = $('Agent: Video Script').item.json.output || '';
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

// Suffixes aligned with sales funnel structure
const suffix1 = ' Clear American English accent, warm professional tone. Bold opening hook that grabs attention. Person finishes speaking by second 6, holds composed still pose for last 2 seconds. Voice only, zero music. No waving, no animated gestures. Camera follows subject smoothly.';
const suffix2 = ' Person starts speaking after natural beat with clear American English accent, warm professional tone. Present the offer with credibility and social proof. Person finishes speaking by second 6, holds composed still pose for last 2 seconds. Voice only, zero music. No waving, no animated gestures. Camera follows subject smoothly.';
const suffix3 = ' Person starts speaking after natural beat with clear American English accent, warm professional tone. Close with why MSI plus direct call to action. Person finishes speaking by second 5, then holds COMPLETELY STILL natural pose looking directly at camera for last 3 seconds. ABSOLUTELY NO waving, NO farewell gesture, NO hand raising, NO animated ending. Just a confident still presence. Voice only, zero music. Camera follows subject smoothly.';

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

// Apply to preview flow nodes
for (const node of preview.nodes) {
  if (node.name === 'Agent: Video Script') {
    node.parameters.text = agentPromptText;
    node.parameters.options.systemMessage = systemMessage;
    console.log('✅ Agent: Video Script — prompt + system message updated');
  }
  if (node.name === 'Build Settings') {
    node.parameters.jsCode = buildSettingsCode;
    console.log('✅ Build Settings — suffixes updated (no animation, sales funnel)');
  }
}

fs.writeFileSync(PREVIEW_FILE, JSON.stringify(preview, null, 2));
console.log('✅ Preview flow saved\n');

// =========================================================
// 2. Update Approved Flow (negative prompts — add anti-animation)
// =========================================================
const approved = JSON.parse(fs.readFileSync(APPROVED_FILE, 'utf8'));

const antiAnimationNegPrompt = ', waving hand, farewell gesture, goodbye wave, greeting gesture, animated ending, hand raising, peace sign, thumbs up';

let updatedNeg = 0;
for (const node of approved.nodes) {
  if (node.name === 'Submit Part 1' || node.name === 'Submit Part 2' || node.name === 'Submit Part 3') {
    if (node.parameters?.jsCode && node.parameters.jsCode.includes('negativePrompt')) {
      // Only add if not already present
      if (!node.parameters.jsCode.includes('waving hand')) {
        node.parameters.jsCode = node.parameters.jsCode.replace(
          /morphing body'/,
          "morphing body" + antiAnimationNegPrompt + "'"
        );
        updatedNeg++;
        console.log(`✅ ${node.name} — negative prompt updated with anti-animation terms`);
      } else {
        console.log(`⏭️ ${node.name} — already has anti-animation terms`);
      }
    }
  }
}

fs.writeFileSync(APPROVED_FILE, JSON.stringify(approved, null, 2));
console.log(`✅ Approved flow saved (${updatedNeg} negative prompts updated)\n`);

// =========================================================
// 3. Validate
// =========================================================
const v_preview = JSON.parse(fs.readFileSync(PREVIEW_FILE, 'utf8'));
const v_approved = JSON.parse(fs.readFileSync(APPROVED_FILE, 'utf8'));

const agentNode = v_preview.nodes.find(n => n.name === 'Agent: Video Script');
const buildNode = v_preview.nodes.find(n => n.name === 'Build Settings');

// Check agent prompt has new structure keywords
const promptText = agentNode.parameters.text;
const checks = [
  ['HOOK + PAIN POINT', promptText.includes('HOOK')],
  ['THE OFFER + SOCIAL PROOF', promptText.includes('SOCIAL PROOF')],
  ['WHY MSI + CALL TO ACTION', promptText.includes('WHY MSI')],
  ['Sales funnel reference', promptText.includes('sales funnel')],
  ['No waving rule', promptText.includes('NO waving')],
  ['Still pose ending', promptText.includes('STILL')],
  ['workforce_agility example', promptText.includes('workforce_agility')],
  ['Build Settings no animation', buildNode.parameters.jsCode.includes('NO waving')],
  ['Build Settings STILL', buildNode.parameters.jsCode.includes('COMPLETELY STILL')],
];

console.log('--- Validation ---');
let allPassed = true;
for (const [label, ok] of checks) {
  console.log(`${ok ? '✅' : '❌'} ${label}`);
  if (!ok) allPassed = false;
}

// Check negative prompts in approved flow
for (const node of v_approved.nodes) {
  if (node.name === 'Submit Part 3' && node.parameters?.jsCode) {
    const hasAnti = node.parameters.jsCode.includes('waving hand');
    console.log(`${hasAnti ? '✅' : '❌'} Submit Part 3 has anti-animation negative prompt`);
    if (!hasAnti) allPassed = false;
  }
}

console.log(allPassed ? '\n🎉 ALL VALIDATIONS PASSED' : '\n⚠️ SOME VALIDATIONS FAILED');
