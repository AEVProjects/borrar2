const fs = require('fs');

function fixWorkflow(filePath) {
    let t = fs.readFileSync(filePath, 'utf8');

    const startStr = '// === EMAIL STRUCTURE PER BUSINESS LINE SLUG ===';
    const endStr = "promptLines.push('=== SERVICE OFFER";

    const startIdx = t.indexOf(startStr);
    const endIdx = t.indexOf(endStr);

    if (startIdx !== -1 && endIdx !== -1) {
    const replacement = `// === DYNAMIC EMAIL STRUCTURE ===\n` +
    `const inst = {\n` +
    `  offer: blName + ' solutions. ' + (blContext ? 'Full context provided above.' : ''),\n` +
    `  e1goal: 'Open with a targeted problem at ' + (ctx.company || 'their company') + ' relating to ' + blName + '. Transition to MSI ' + blName + ' solutions that eliminate that friction.',\n` +
    `  e2goal: 'Lead with a specific outcome metric relevant to ' + blName + ' (e.g. cost reduction, faster deployment). Explain how MSI delivered it.',\n` +
    `  e3goal: 'Acknowledge silence. Use Loss Aversion: state you are assuming ' + blName + ' is not a current priority and will close their file.',\n` +
    `  narrative: blName + ' Challenge Hook to Outcome Metric to Loss Aversion Breakup'\n` +
    `};\n\n`;
    
    t = t.substring(0, startIdx) + replacement + t.substring(endIdx);
    fs.writeFileSync(filePath, t);
    console.log('Fixed workflow: ' + filePath);
    } else {
    console.log('Strings not found', startIdx, endIdx);
    }
}

fixWorkflow('workflows/n8nmsi_cloud_n8n_m/personal/MSI AI Message Generator.workflow.ts');
fixWorkflow('workflows/n8nmsi_cloud_n8n_m/personal/MSI AI Message Generator.workflow.fixed.ts');
