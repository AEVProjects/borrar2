const fs = require('fs');

const fixPrompt = (c) => {
    // 1. Add "hurry" logic to objection handling
    c = c.replace(/- Not interested:.*?"/, `$&\\n- In a hurry / wants a quick pitch: \\"We provide senior LATAM engineers in your timezone at lower cost. Should we book a brief call next week to discuss?\\"`);
    
    // 2. Add rule about backchanneling (mm-hmm)
    c = c.replace(/Listen actively.*?rigid\./, `$&\\nIf the user interrupts with agreement (\\"Mm-hmm\\", \\"yeah\\"), continue your exact thought smoothly. Do not skip stages.`);
    
    // 3. Change interruption_threshold form 150 to 200
    c = c.replace(/interruption_threshold: 150/, 'interruption_threshold: 200');

    return c;
};

// 1. Fix api/calls.js
let api = fs.readFileSync('api/calls.js', 'utf8');
api = fixPrompt(api);
fs.writeFileSync('api/calls.js', api);

// 2. Fix bland_call_node_code.js
let nodeJS = fs.readFileSync('migrations/calls/bland_call_node_code.js', 'utf8');
nodeJS = fixPrompt(nodeJS);
fs.writeFileSync('migrations/calls/bland_call_node_code.js', nodeJS);

// 3. Fix JSON by fixing the string
let jsonRaw = fs.readFileSync('migrations/calls/MSI_Laura_v8_FINAL.json', 'utf8');
let n8nJSON = JSON.parse(jsonRaw);

// Find the Llamar node
let llamarNode = n8nJSON.nodes.find(n => n.name === 'Llamar con Bland.ai');
if (llamarNode && llamarNode.parameters && llamarNode.parameters.jsCode) {
    llamarNode.parameters.jsCode = fixPrompt(llamarNode.parameters.jsCode);
}

fs.writeFileSync('migrations/calls/MSI_Laura_v8_FINAL.json', JSON.stringify(n8nJSON, null, 2));

console.log("Success");
