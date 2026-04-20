const fs = require('fs'); 
let c = fs.readFileSync('migrations/calls/MSI_Laura_v8_FINAL.json', 'utf8'); 

c = c.replace(/=== STAGE 4: QUALIFY ===.*?\\nQ3: \\"Are you leading this decision, or is someone else involved\?\\"/, `=== STAGE 4: QUALIFY ===\\nBe conversational and adapt to the user. If they change their mind (e.g., \\"Wait, I can talk to my boss\\"), acknowledge it naturally (e.g., \\"That makes sense. Should I send you an email so you can share it with him, or should we schedule a call together?\\").\\nAsk these naturally, one at a time, ONLY if it fits the flow:\\nQ1: \\"What roles or technologies are most critical right now?\\"\\nQ2: \\"Are you leading this decision, or is someone else involved?\\"`);

c = c.replace(/=== RULES ===/, `=== RULES ===\\nListen actively. If the user adds context, respond empathetically to what they EXACTLY said before asking another question. DO NOT be rigid.`);

fs.writeFileSync('migrations/calls/MSI_Laura_v8_FINAL.json', c);
