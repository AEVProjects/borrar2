const fs = require('fs');
let t = fs.readFileSync('workflows/n8nmsi_cloud_n8n_m/personal/MSI AI Message Generator.workflow.ts', 'utf8');

const startStr = '// === EMAIL STRUCTURE PER BUSINESS LINE SLUG ===';
const endStr = 'promptLines.push(\\'=== SERVICE OFFER';

const startIdx = t.indexOf(startStr);
const endIdx = t.indexOf(endStr);

if (startIdx !== -1 && endIdx !== -1) {
  const replacement = \// === DYNAMIC EMAIL STRUCTURE ===
  const inst = {
    offer: blName + ' solutions. ' + (blContext ? 'See context above.' : ''),
    e1goal: 'Open with a targeted problem at ' + (ctx.company || 'their company') + ' relating to ' + blName + '. Transition to MSI ' + blName + ' solutions that eliminate that friction.',
    e2goal: 'Lead with a specific outcome metric relevant to ' + blName + ' (e.g. cost reduction, faster deployment). Explain how MSI delivered it.',
    e3goal: 'Acknowledge silence. Use Loss Aversion: state you are assuming ' + blName + ' is not a current priority and will close their file.',
    narrative: blName + ' Challenge Hook to Outcome Metric to Loss Aversion Breakup'
  };\\n\\n\;
  
  t = t.substring(0, startIdx) + replacement + t.substring(endIdx);
  fs.writeFileSync('workflows/n8nmsi_cloud_n8n_m/personal/MSI AI Message Generator.workflow.ts', t);
  console.log('Fixed workflow!');
} else {
  console.log('Strings not found', startIdx, endIdx);
}
