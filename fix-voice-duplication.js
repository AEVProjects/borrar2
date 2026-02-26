// fix-voice-duplication.js — Remove redundant voice instruction from Gemini output
// Problem: Gemini outputs "Speaks with a clear..." inside dialogue, then Build Settings adds MORE suffix
// Fix: Tell Gemini to NEVER include voice/accent description — Build Settings handles it
const fs = require('fs');

const FILE = 'video-script-preview-flow.json';
const flow = JSON.parse(fs.readFileSync(FILE, 'utf8'));

for (const node of flow.nodes) {
  if (node.name === 'Agent: Video Script') {
    let text = node.parameters.text;
    
    // Remove the old voice description block that tells Gemini to include voice in output
    // Replace with instruction to NEVER include voice description
    text = text.replace(
      /\\n\\nVOICE DESCRIPTION \(MANDATORY.*?Natural conversational pace\. Not robotic, not overly dramatic\./s,
      `\\n\\nVOICE DIRECTION (HANDLED AUTOMATICALLY — DO NOT INCLUDE IN YOUR OUTPUT):\\n- Voice and accent instructions are added automatically after your prompts.\\n- NEVER include phrases like "Speaks with a clear American accent" or "warm professional tone" in your output.\\n- NEVER include any voice description, accent description, or tone direction in your prompts.\\n- Your prompts should ONLY contain: motion direction + dialogue (person says: words).\\n- If you include voice/accent text, it will be duplicated and break the word count.`
    );
    
    // Also strengthen word count balance — each part should have 10-15 words, not 3
    text = text.replace(
      /MAXIMUM 15 WORDS of spoken dialogue per part/,
      'MINIMUM 10 WORDS and MAXIMUM 15 WORDS of spoken dialogue per part'
    );
    
    // Add balance instruction
    text = text.replace(
      /Count your words carefully — if over 15, rewrite shorter/,
      'Count your words carefully — if over 15, rewrite shorter. If under 10, expand with more persuasive detail'
    );
    
    node.parameters.text = text;
    
    // Also update system message
    let sys = node.parameters.options.systemMessage;
    sys = sys.replace(
      /10\) VOICE: clear American English accent, warm professional tone in every prompt\./,
      '10) NEVER include voice/accent descriptions in your output — they are added automatically. Your prompts = motion + dialogue ONLY.'
    );
    sys = sys.replace(
      /MAX 15 spoken words per part/,
      'MIN 10, MAX 15 spoken words per part'
    );
    node.parameters.options.systemMessage = sys;
    
    console.log('✅ Agent prompt: removed voice duplication, added min 10 words');
    console.log('✅ System message: updated');
  }
}

fs.writeFileSync(FILE, JSON.stringify(flow, null, 2));

// Validate
const v = JSON.parse(fs.readFileSync(FILE, 'utf8'));
const agent = v.nodes.find(n => n.name === 'Agent: Video Script');
const promptText = agent.parameters.text;
const sysMsg = agent.parameters.options.systemMessage;

const checks = [
  ['No "include voice in each prompt"', !promptText.includes('Include this voice direction in each prompt')],
  ['Has NEVER include voice', promptText.includes('NEVER include')],
  ['Has HANDLED AUTOMATICALLY', promptText.includes('HANDLED AUTOMATICALLY')],
  ['Has MINIMUM 10 WORDS', promptText.includes('MINIMUM 10 WORDS')],
  ['Has expand instruction', promptText.includes('If under 10')],
  ['System msg: no voice in output', sysMsg.includes('NEVER include voice')],
  ['System msg: MIN 10', sysMsg.includes('MIN 10')],
];

console.log('\n--- Validation ---');
let ok = true;
for (const [label, pass] of checks) {
  console.log(`${pass ? '✅' : '❌'} ${label}`);
  if (!pass) ok = false;
}
console.log(ok ? '\n🎉 ALL PASSED' : '\n⚠️ SOME FAILED');
