/**
 * Updates the BuildAiPrompt node in the MSI AI Message Generator n8n workflow
 * to use the Discovery Workshop-focused prompt (instead of the old MSI services catalog)
 */
const fs = require('fs');
const path = require('path');

const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2ZGM2M2JkMi03ZDdiLTQxZDUtYWRhYi01ZGRmOTdjZmZjOWUiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzcyNzE3NTkyLCJleHAiOjE3Nzc4NjcyMDB9.FaUCePV9bRneatW9i0UbacMgItQOmV9Dl0Pw4-2xqD4';
const N8N_HOST = 'https://n8nmsi.app.n8n.cloud';
const WORKFLOW_ID = 'vumwUO2IBMjh2dAH';

// ─── NEW DISCOVERY WORKSHOP PROMPT CODE ───
// This replaces the old "MSI Services Catalog" approach with a laser-focused
// AI Discovery Workshop pitch across all 3 emails
const NEW_JS_CODE = `const lead = $input.item.json;
const webhookData = $('Webhook Trigger').item.json.body || {};

const employees = parseInt(lead.num_employees, 10) || 0;
let companySize = 'a company';
let sizeCategory = 'mid';
if (employees > 5000) { companySize = 'a large enterprise (' + employees + '+ employees)'; sizeCategory = 'enterprise'; }
else if (employees > 1000) { companySize = 'a mid-to-large company (' + employees + ' employees)'; sizeCategory = 'enterprise'; }
else if (employees > 200) { companySize = 'a growing company (' + employees + ' employees)'; sizeCategory = 'mid'; }
else if (employees > 50) { companySize = 'a growing company (' + employees + ' employees)'; sizeCategory = 'growth'; }
else if (employees > 10) { companySize = 'a small company (' + employees + ' employees)'; sizeCategory = 'small'; }
else if (employees > 0) { companySize = 'a startup (' + employees + ' employees)'; sizeCategory = 'small'; }

const ctx = {
  name: lead.first_name || '',
  lastName: lead.last_name || '',
  title: lead.title || '',
  seniority: lead.seniority || '',
  company: lead.company_name || '',
  industry: lead.industry || '',
  companySize,
  city: lead.city || '',
  state: lead.state || '',
  country: lead.country || '',
  website: lead.website || '',
  technologies: lead.technologies || '',
  keywords: lead.keywords || '',
  annualRevenue: lead.annual_revenue || '',
  departments: lead.departments || '',
  description: lead.company_description || '',
  intentTopic: lead.primary_intent_topic || '',
  intentScore: lead.primary_intent_score || ''
};

let industryType = 'General';
const ind = (ctx.industry || '').toLowerCase();
if (/financ|bank|insur|fintech|capital|invest/.test(ind)) industryType = 'Financial Services';
else if (/health|medical|pharma|biotech|hospital|clinic/.test(ind)) industryType = 'Healthcare';
else if (/retail|e-commerc|consumer|shop/.test(ind)) industryType = 'Retail';
else if (/manufactur|industrial|auto|factory/.test(ind)) industryType = 'Manufacturing';
else if (/technolog|software|saas|it|comput|cyber|cloud/.test(ind)) industryType = 'Technology';
else if (/energy|oil|utilit|renewable|power|electric/.test(ind)) industryType = 'Energy';
else if (/educ|universit|school|academ/.test(ind)) industryType = 'Education';
else if (/legal|law/.test(ind)) industryType = 'Legal';
else if (/real estate|property|construct|architect/.test(ind)) industryType = 'Real Estate';
else if (/logistic|transport|shipping|freight/.test(ind)) industryType = 'Logistics';
else if (/telecom|carrier|network operator/.test(ind)) industryType = 'Telecommunications';
else if (/defense|government|federal|military/.test(ind)) industryType = 'Defense & Government';

const INDUSTRY_ANGLES = {
  'Financial Services': {
    painPoints: 'SOX/PCI-DSS compliance burden, fraud detection, legacy system modernization, fintech disruption, open banking APIs',
    proofPoint: 'helped a financial services client identify high-value AI use cases, validate feasibility, and quantify the ROI case before committing budget'
  },
  'Healthcare': {
    painPoints: 'HIPAA compliance, EHR system migration, telehealth scaling, patient data security, AI diagnostics integration',
    proofPoint: 'helped a healthcare organization evaluate AI readiness, prioritize use cases, and define a practical roadmap without disrupting compliance'
  },
  'Retail': {
    painPoints: 'omnichannel experience gaps, peak season scaling, real-time inventory, AI personalization, payment security',
    proofPoint: 'helped a retail client clarify where AI could improve customer experience and operations, then quantify the financial upside before a PoC'
  },
  'Manufacturing': {
    painPoints: 'OT/IT convergence gaps, IoT sensor integration, predictive maintenance, SCADA security, Industry 4.0',
    proofPoint: 'helped a manufacturing team translate operational bottlenecks into prioritized AI opportunities with clear feasibility and ROI criteria'
  },
  Technology: {
    painPoints: 'scaling engineering teams fast, technical debt, cloud cost optimization, security posture, talent competition',
    proofPoint: 'helped a SaaS company align AI opportunities to business goals, validate data readiness, and define the right PoC scope quickly'
  },
  Energy: {
    painPoints: 'SCADA/ICS security, grid modernization, renewable integration, compliance (NERC CIP), OT visibility',
    proofPoint: 'helped an energy company assess AI readiness across operational data, quantify impact, and define a business-aligned implementation path'
  },
  Education: {
    painPoints: 'data privacy (FERPA), platform modernization, remote learning infrastructure, tight budgets',
    proofPoint: 'helped an education organization prioritize AI use cases, validate constraints, and build a realistic ROI case before execution'
  },
  Legal: {
    painPoints: 'client data confidentiality, document management, regulatory compliance, digital transformation lagging',
    proofPoint: 'helped a legal team assess feasible AI opportunities while accounting for data sensitivity, workflow fit, and measurable outcomes'
  },
  'Real Estate': {
    painPoints: 'property tech integration, data analytics for deals, cybersecurity for transaction data, platform scalability',
    proofPoint: 'helped a real estate business identify AI opportunities tied to deal velocity and analytics, then define the right next-step scope'
  },
  Logistics: {
    painPoints: 'real-time tracking gaps, supply chain visibility, fleet management modernization, integration complexity',
    proofPoint: 'helped a logistics organization translate supply-chain friction into prioritized AI opportunities with clear ROI hypotheses'
  },
  Telecommunications: {
    painPoints: 'network optimization, 5G rollout, OSS/BSS modernization, customer churn, vendor management',
    proofPoint: 'helped a telecom operator identify where AI could improve operations, validate readiness, and define a practical PoC path'
  },
  'Defense & Government': {
    painPoints: 'classified data handling, FedRAMP/CMMC compliance, legacy modernization, clearance requirements',
    proofPoint: 'helped a government-focused team assess AI opportunities with feasibility, compliance, and business alignment built in upfront'
  },
  General: {
    painPoints: 'digital transformation pressure, cybersecurity threats, talent gaps, cloud migration uncertainty',
    proofPoint: 'helped a growing company gain AI clarity in 4 weeks by prioritizing use cases, validating feasibility, and quantifying ROI'
  }
};
const angle = INDUSTRY_ANGLES[industryType] || INDUSTRY_ANGLES.General;

const leadCountry = (ctx.country || '').toLowerCase();
let regionalPresence = 'Americas (US, Mexico, Colombia, Ecuador, Peru, Bolivia, Chile, Uruguay, Brazil)';
if (/uk|united kingdom|spain|france|germany|italy|netherlands|europe/.test(leadCountry)) regionalPresence = 'Europe (via Talentor International alliance in 20+ countries)';
else if (/saudi|uae|emirates|morocco|south africa|africa|middle east/.test(leadCountry)) regionalPresence = 'Middle East & Africa (Saudi Arabia, UAE, Morocco, South Africa)';
else if (/china|india|singapore|australia|japan|asia/.test(leadCountry)) regionalPresence = 'Asia & Oceania (China, India, Singapore, Australia)';

let sizeValue = '';
if (sizeCategory === 'enterprise') sizeValue = 'For enterprise organizations like ' + ctx.company + ', MSI helps leadership teams de-risk AI initiatives with a structured discovery process and clear decision criteria.';
else if (sizeCategory === 'mid') sizeValue = 'For growing companies like ' + ctx.company + ', MSI provides a practical path to AI ROI without the cost and ambiguity of a large-scale transformation program.';
else if (sizeCategory === 'growth') sizeValue = 'For growing companies like ' + ctx.company + ', MSI gives teams a fast way to validate where AI can help before committing to a full implementation.';
else sizeValue = 'For companies like ' + ctx.company + ', MSI offers a low-risk entry point to evaluate AI opportunities and define the right next step.';

const senLower = (ctx.seniority || '').toLowerCase();
let seniorityGuidance = '';
if (senLower === 'c_suite' || senLower === 'c-suite' || senLower === 'owner' || senLower === 'founder') seniorityGuidance = 'This person is C-suite. Use strategic, business-outcome language focused on ROI, risk reduction, and competitive advantage.';
else if (senLower === 'vp' || senLower === 'vice president') seniorityGuidance = 'This person is a VP. Balance strategic vision with execution details and measurable outcomes.';
else if (senLower === 'director') seniorityGuidance = 'This person is a Director. Mix strategic context with concrete delivery details and team impact.';
else if (senLower === 'manager') seniorityGuidance = 'This person is a Manager. Be practical and specific, focused on feasibility, workflows, and near-term value.';
else seniorityGuidance = 'Adapt to a professional tone focused on practical value and clear outcomes for their role.';

let techContext = '';
if (ctx.technologies) techContext = 'Their tech stack includes: ' + ctx.technologies + '. Reference it when it helps make the workshop feel relevant and realistic.';

const promptLines = [];
promptLines.push('You are Nataly Riano from MSI Technologies Inc. Generate a COMPLETE 3-email cold outreach sequence for this lead.');
promptLines.push('');
promptLines.push('=== LEAD PROFILE ===');
promptLines.push('- Name: ' + [ctx.name, ctx.lastName].filter(Boolean).join(' '));
promptLines.push('- Title: ' + (ctx.title || 'Not specified'));
promptLines.push('- Seniority: ' + (ctx.seniority || 'Not specified'));
promptLines.push('- Company: ' + (ctx.company || 'Not specified'));
promptLines.push('- Industry: ' + (ctx.industry || 'Not specified') + ' (category: ' + industryType + ')');
promptLines.push('- Company Size: ' + ctx.companySize);
promptLines.push('- Location: ' + ([ctx.city, ctx.state, ctx.country].filter(Boolean).join(', ') || 'Not specified'));
promptLines.push('- Website: ' + (ctx.website || 'Not specified'));
promptLines.push('- Technologies: ' + (ctx.technologies || 'Not specified'));
promptLines.push('- Keywords/Focus: ' + (ctx.keywords || 'Not specified'));
promptLines.push('- Annual Revenue: ' + (ctx.annualRevenue || 'Not specified'));
promptLines.push('- Department: ' + (ctx.departments || 'Not specified'));
promptLines.push('- Company Description: ' + (ctx.description || 'Not available'));
if (ctx.intentTopic) promptLines.push('- Active Intent Signal: ' + ctx.intentTopic + ' (score: ' + ctx.intentScore + ') - they are actively researching this topic, so reference it directly.');
promptLines.push('');
promptLines.push('=== ABOUT MSI TECHNOLOGIES ===');
promptLines.push('MSI Technologies is a multinational innovation and technology company with 20+ years of experience, 700+ consultants, 14 offices, and reach across 40+ countries through the Talentor International alliance.');
promptLines.push('Regional presence most relevant to this lead: ' + regionalPresence);
promptLines.push(sizeValue);
promptLines.push('');
promptLines.push('=== INDUSTRY INTELLIGENCE (' + industryType + ') ===');
promptLines.push('- Common pain points in their industry: ' + angle.painPoints);
promptLines.push('- Proof point for email 2: We ' + angle.proofPoint);
if (techContext) {
  promptLines.push('');
  promptLines.push('=== TECHNOLOGY CONTEXT ===');
  promptLines.push(techContext);
}
promptLines.push('');
promptLines.push('=== TONE & SENIORITY ===');
promptLines.push(seniorityGuidance);
promptLines.push('');
promptLines.push('=== AI DISCOVERY WORKSHOP ===');
promptLines.push('- Offer: MSI\\'s AI Discovery Workshop, a structured 4-week engagement that gives leaders clarity on where AI can create measurable ROI without a long-term commitment.');
promptLines.push('- Phase 1 Translate: turn business pain points into AI opportunities.');
promptLines.push('- Phase 2 Validate: assess whether data and systems are AI-ready.');
promptLines.push('- Phase 3 Quantify: build ROI estimates with real dollar projections.');
promptLines.push('- Phase 4 Define: set scope, timeline, and success metrics for the next PoC phase.');
promptLines.push('- Phase 5 Align: connect the AI roadmap to core business objectives.');
promptLines.push('- Deliverables: AI opportunity map, data feasibility report, ROI projections, technical readiness assessment, PoC action plan.');
promptLines.push('');
promptLines.push('=== CRITICAL: DISCOVERY WORKSHOP FOCUS ONLY ===');
promptLines.push('IMPORTANT: ALL 3 emails MUST focus exclusively on the AI Discovery Workshop.');
promptLines.push('- Do NOT mention any other MSI services (Cloud, Cybersecurity, Custom Software, Talent, IT Outsourcing, Telecom, Consulting, etc.).');
promptLines.push('- Every email must position the AI Discovery Workshop as the single offer.');
promptLines.push('- Use the workshop\\'s 4-week structure, 5 phases, deliverables, and ROI-first framing as the core message.');
promptLines.push('- If you reference MSI credibility, keep it brief and only to support the workshop offer.');
promptLines.push('');
promptLines.push('=== APOLLO SEQUENCE STRUCTURE ===');
promptLines.push('This is a 3-step Apollo email sequence designed for maximum reply rates. Emails are sent automatically via Apollo. If the recipient replies at any point, the sequence stops. You are Nataly Riano.');
promptLines.push('');
promptLines.push('CRITICAL FORMAT: Email 1 starts a new thread with a unique subject line. Emails 2 and 3 are replies in the same thread, and Apollo automatically adds Re: to the subject.');
promptLines.push('- Emails 2-3 appear as follow-ups in the recipient\\'s inbox, threaded under Email 1.');
promptLines.push('- Do NOT re-introduce yourself or MSI in emails 2-3.');
promptLines.push('- Emails 2-3 should feel like natural, brief follow-ups from someone they already heard from.');
promptLines.push('- Keep emails 2-3 shorter than Email 1.');
promptLines.push('');
promptLines.push('**Email 1 (Sent immediately) - WORKSHOP INTRO + TIMELINE HOOK:**');
promptLines.push('Goal: Use a "Timeline-Based Hook" specific to CFOs (e.g., Week 1, Week 2, Week 4 metrics). Open with a targeted problem regarding ' + (ctx.company || 'their company') + ' investing in AI without clear returns. Transition fast to the 4-week AI Discovery Workshop sprint. Focus on risk mitigation, capital allocation, and measurable ROI.');
promptLines.push('Tone: Assumptive language. Use "I am looking to share" instead of "I was hoping to". "It makes sense to explore" instead of "Would it make sense". Confident, no passive words.');
promptLines.push('Length: Strictly UNDER 80 words. The shorter the better. Do not write filler intros.');
promptLines.push('Greeting: Hi ' + ctx.name + ',');
promptLines.push('Signature: Full - Nataly Riano\\nMSI Technologies Inc.');
promptLines.push('');
promptLines.push('**Email 2 (Sent +3 days, REPLY in same thread) - NUMBER-BASED HOOK (Anchor Metric):**');
promptLines.push('Goal: They saw Email 1 but did not reply. Lead immediately with a specific anchor metric (e.g., 32% ROI or 32% reduction in operational friction). Explain briefly how the workshop enabled that success by quantifying ROI before a long-term commitment.');
promptLines.push('Tone: Assumptive and concise. Start immediately with the number hook. Ask a low-friction binary question like "Worth a quick look?" or "Open to a brief chat?". NEVER mention specific days of the week like Monday or Tuesday.');
promptLines.push('Length: Limit to 60-70 words maximum. Punchy and metric-driven.');
promptLines.push('Greeting: ' + ctx.name + ',');
promptLines.push('Signature: ALWAYS include - Nataly Riano\\nMSI Technologies Inc.');
promptLines.push('');
promptLines.push('**Email 3 (Sent +3 days after Email 2, REPLY in same thread) - THE BREAKUP (Loss Aversion):**');
promptLines.push('Goal: Acknowledge silence. Use "Loss Aversion" psychology. State that you are assuming AI strategy isn\\'t a current priority, so you will close their file. Provide a single sentence saying the roadmap is there if ROI measurement becomes a priority later.');
promptLines.push('Tone: Respectful, brief, confident breakup. Do not sound desperate.');
promptLines.push('Length: Exactly 2 or 3 short sentences. 55 words maximum.');
promptLines.push('Greeting: ' + ctx.name + ',');
promptLines.push('Signature: ALWAYS include - Nataly Riano\\nMSI Technologies Inc.');
promptLines.push('');
promptLines.push('=== EXPERT ANTI-ROBOT SALES RULES ===');
promptLines.push('1. RESEARCH FIRST: Every email must reference specific data about the lead (company name: ' + (ctx.company || 'their company') + ', industry, title, tech stack, location, or their specific description). Use these naturally, not forced.');
promptLines.push('2. NARRATIVE ARC: Timeline hook -> Number/Metric Hook -> Loss Aversion Breakup. Each email advances a very distinct stage.');
promptLines.push('3. BANNED PHRASES: NEVER use: I noticed, I came across, I hope this finds you well, reaching out, just following up, circling back, touch base, I was hoping to connect, if you have 15 minutes, I\\'d love to hear your thoughts.');
promptLines.push('4. ANTI-ROBOT & ASSUMPTIVE WRITING: Write like an elite top 1% B2B seller from 2026. Keep it conversational. ALWAYS use strong assumptive language: "I am looking to connect", "Let\\'s set 15 minutes", "Let me know your thoughts".');
promptLines.push('5. THE MASTERFUL PITCH: Frame the AI Discovery Workshop as a risk-mitigation tool for CFOs and leaders. NO generic transformations. Use finance psychology: "Probability-Weighted Financial Outcomes" and "Total Cost of AI Ownership".');
promptLines.push('6. SUBJECT LINE: Only subject1 matters. Under 50 chars, deeply personalized, use normal sentence case capitalization (not all lowercase), and no clickbait. Example: "Optio AI Roadmap: Weeks 1-4". subject2 and subject3 MUST be empty strings so Apollo can thread them automatically.');
promptLines.push('7. CTA PROGRESSION: Email 1 = Low-friction binary question. Email 2 = Soft engagement question (e.g. "Open to a brief chat?", "Does this align with your Q3 priorities?", but NO SPECIFIC DAYS). Email 3 = No-pressure file closing.');
promptLines.push('8. DEEP PERSONALIZATION: Masterfully weave ' + (ctx.company || 'their company') + ' into the narrative. Do NOT make it sound like a form letter.');
promptLines.push('9. EXACT EMAIL LENGTH: Email 1 = strictly under 80 words. Email 2 = under 65 words. Email 3 = under 55 words.');
promptLines.push('');
promptLines.push('=== OUTPUT ===');
promptLines.push('JSON only (no markdown, no code blocks, no explanation):');
promptLines.push('{\\"subject1\\":\\"...\\",\\"email1\\":\\"...\\",\\"subject2\\":\\"\\",\\"email2\\":\\"...\\",\\"subject3\\":\\"\\",\\"email3\\":\\"...\\"}');

const prompt = promptLines.join('\\n');

return {
  json: {
    lead_id: lead.id,
    lead_email: lead.email,
    lead_name: ((lead.first_name || '') + ' ' + (lead.last_name || '')).trim(),
    lead_company: lead.company_name || '',
    source_table: webhookData.source_table || 'apollo_leads',
    prompt: prompt,
    batch_id: lead.batch_id || webhookData.batch_id || null,
    industry_type: industryType
  }
};`;

async function updateWorkflow() {
  console.log('Fetching workflow from n8n cloud...');
  
  const fetchRes = await fetch(`${N8N_HOST}/api/v1/workflows/${WORKFLOW_ID}`, {
    headers: { 'X-N8N-API-KEY': API_KEY }
  });
  
  if (!fetchRes.ok) {
    throw new Error(`Failed to fetch workflow: ${fetchRes.status} ${fetchRes.statusText}`);
  }
  
  const workflow = await fetchRes.json();
  console.log(`Got workflow: "${workflow.name}" with ${workflow.nodes.length} nodes`);
  
  // Find BuildAiPrompt node
  const buildNode = workflow.nodes.find(n => n.name === 'Build AI Prompt');
  if (!buildNode) {
    console.error('Available nodes:', workflow.nodes.map(n => n.name));
    throw new Error('Could not find "Build AI Prompt" node');
  }
  
  const oldCodeSnippet = (buildNode.parameters.jsCode || '').substring(0, 100);
  console.log(`\nCurrent BuildAiPrompt starts with:\n  "${oldCodeSnippet}..."\n`);
  
  if (oldCodeSnippet.includes('Discovery Workshop') || oldCodeSnippet.includes('promptLines')) {
    console.log('ℹ️  Workflow already has Discovery Workshop code. Updating anyway to ensure latest version...');
  } else {
    console.log('⚠️  Found OLD code (MSI services catalog). Replacing with Discovery Workshop version...');
  }
  
  // Replace jsCode
  buildNode.parameters.jsCode = NEW_JS_CODE;
  
  // PUT updated workflow — only send allowed properties (active is read-only)
  const payload = {
    name: workflow.name,
    nodes: workflow.nodes,
    connections: workflow.connections,
    settings: workflow.settings,
    staticData: workflow.staticData || null
  };

  console.log('Pushing updated workflow to n8n...');
  const putRes = await fetch(`${N8N_HOST}/api/v1/workflows/${WORKFLOW_ID}`, {
    method: 'PUT',
    headers: {
      'X-N8N-API-KEY': API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  
  if (!putRes.ok) {
    const errText = await putRes.text();
    throw new Error(`Failed to update workflow: ${putRes.status} ${putRes.statusText}\n${errText}`);
  }
  
  const updated = await putRes.json();
  console.log(`\n✅ Workflow updated successfully!`);
  console.log(`   ID: ${updated.id}`);
  console.log(`   Name: ${updated.name}`);
  console.log(`   Active: ${updated.active}`);
  
  // Verify
  const verifyNode = updated.nodes.find(n => n.name === 'Build AI Prompt');
  if (verifyNode) {
    const newSnippet = (verifyNode.parameters.jsCode || '').substring(0, 120);
    console.log(`\nVerification - new code starts with:\n  "${newSnippet}..."`);
  }
}

updateWorkflow().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
