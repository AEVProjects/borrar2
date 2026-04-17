#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Fix MSI AI Message Generator workflow:
1. Update emailInstructions with new service descriptions (5 BLs)
2. Remove dead code block (if false + else with legacy workshop/wfa instructions)
"""
import sys

FNAME = (
    r'c:\Users\artki\borrar2\workflows'
    r'\n8nmsi_cloud_n8n_m\personal'
    r'\MSI AI Message Generator.workflow.ts'
)

with open(FNAME, 'r', encoding='utf-8') as f:
    content = f.read()

orig_len = len(content)
print(f'Read {orig_len} chars')

# ==============================================================
# STEP 1 - Update emailInstructions
# The jsCode is stored as a JS string: newlines are \n (two chars)
# In Python: '\\n' == the two chars \ and n == what is in the file
# ==============================================================

EI_START = "\\nconst emailInstructions = {\\n  ai: {"
EI_END   = "\\nconst inst = emailInstructions[blSlug] || emailInstructions['it'];"

si = content.find(EI_START)
ei = content.find(EI_END, si) if si != -1 else -1
print(f'emailInstructions block: start={si}, end={ei}')
if si == -1 or ei == -1:
    print('ERROR: emailInstructions block not found')
    sys.exit(1)

# New emailInstructions - Python triple-quoted string (real newlines),
# then converted to \\n two-char sequences for the file format.
NEW_EI = """
const emailInstructions = {
  ai: {
    offer: 'MSI AI & Smart Business: Intelligent Automation (streamlining repetitive processes to free up capacity), Data-Driven Insights (leveraging data for smarter and faster decision-making), Custom AI Solutions (tailored AI applications built for specific business challenges). MSI uses AI and automation to optimize operations, drive innovation, and create smarter more efficient businesses.',
    e1goal: 'Open with a targeted problem at ' + (ctx.company || 'their company') + ' around operational inefficiency, manual processes, slow decisions, or untapped data. Transition to MSI Intelligent Automation and Custom AI Solutions that eliminate that friction.',
    e2goal: 'Lead with a specific AI outcome metric (e.g., 45% reduction in manual processing time, 3x faster decision cycles). Explain how MSI Data-Driven Insights enabled that outcome.',
    e3goal: 'Acknowledge silence. Use Loss Aversion: state you are assuming AI-driven automation is not a current priority and will close their file.',
    narrative: 'Business Friction Hook to AI Outcome Metric to Loss Aversion Breakup'
  },
  wfa: {
    offer: 'MSI Workforce Agility: Talent Optimization (ensuring the right talent is deployed effectively), Flexible Workforce models (adaptable staffing that scales with changing demands), Employee Upskilling (training current staff for future challenges in AI, cloud, and digital transformation). Helps organizations adapt, evolve, and excel in a rapidly changing market.',
    e1goal: 'Open with a targeted challenge at ' + (ctx.company || 'their company') + ' around talent gaps, slow hiring cycles, high turnover, or the cost of misaligned workforce. Transition to MSI Workforce Agility and Flexible Workforce models that adapt to business demands.',
    e2goal: 'Shift focus to workforce innovation, retention, and operational efficiency through Workforce Agility. Lead with a proof point (e.g., 60% faster team deployment, 40% reduction in hiring overhead). Ask a low-friction binary question.',
    e3goal: 'Acknowledge silence. State you are assuming workforce evolution is not a current priority and will close their file.',
    narrative: 'Talent Challenge Hook to Workforce Innovation Proof to Loss Aversion Breakup'
  },
  npo: {
    offer: 'MSI Network Performance Optimization: elite network efficiency using cost-effective nearshore LATAM engineering talent aligned to U.S. business hours. Services include Root Cause Analysis (identifying drivers of network performance issues), Optimization Recommendations (indoor and outdoor RF coverage assessments from single floors to high-rise structures), Implementation and Validation Support, Multi-vendor Log Processing, Customized Reporting, and Thematic Analysis and KPI Correlation.',
    e1goal: 'Open with a challenge at ' + (ctx.company || 'their company') + ' around network performance gaps, rising optimization costs, coverage issues, or slow root cause resolution. Transition to MSI nearshore LATAM NPO team delivering elite results at 30-50% lower cost while working aligned to U.S. hours.',
    e2goal: 'Lead with a measurable network KPI improvement (e.g., 40% faster root cause resolution, 25% improvement in coverage scores). Explain how MSI nearshore team delivered it more cost-effectively than on-site consultants.',
    e3goal: 'Acknowledge silence. State you are assuming network performance optimization is not a current priority and will close their file.',
    narrative: 'Network Performance Challenge to KPI Proof to Loss Aversion Breakup'
  },
  ae: {
    offer: 'MSI Architecture and Engineering Solutions: rapid team scaling with specialized nearshore A&E talent including MEP (Mechanical Electrical Plumbing), BIM (Building Information Modeling), civil, and structural teams. Phase 1 Problem Mapping covers business deep dives, needs assessments, opportunity mapping, solution planning, and partnership kickoff. Phase 2 Strategy and Action covers customized strategies, deploying nearshore engineers integrated with existing teams, project delivery, and ongoing review and expansion. Delivers compliant high-quality projects on time within budget aligned to U.S. standards.',
    e1goal: 'Open with a challenge at ' + (ctx.company || 'their company') + ' around scaling A&E teams quickly, high project delivery costs, or sourcing specialized MEP or BIM or structural talent on demand. Transition to MSI nearshore A&E model that reduces overhead while meeting U.S. standards.',
    e2goal: 'Lead with a concrete A&E outcome metric (e.g., 40% reduction in team deployment time, 30% project cost savings vs. domestic hiring). Explain how MSI Phase 1 to Phase 2 process delivered it.',
    e3goal: 'Acknowledge silence. State you are assuming A&E team scaling is not a current priority and will close their file.',
    narrative: 'A&E Scaling Challenge to Outcome Metric to Loss Aversion Breakup'
  },
  it: {
    offer: 'MSI IT Outsourcing plus Digital plus Cloud plus Cybersecurity: IT Outsourcing (Managed IT Services, Dedicated IT Teams, Cost-Effective Scaling aligned to U.S. time zones), Cloud Computing (Infrastructure Modernization, Cloud Migration to AWS Azure or GCP, Data Storage and Security, Recovery and Backup), Cybersecurity Solutions (Advanced Threat Detection, Compliance and Risk Management, Security Awareness Training fostering a security-first culture), Digital and Strategy (IT strategy consulting, M&A technology guidance, custom software development).',
    e1goal: 'Open with a targeted IT challenge at ' + (ctx.company || 'their company') + ' around cloud migration complexity, cybersecurity gaps, IT talent costs, or legacy modernization pressure. Transition to MSI as a single accountable IT partner across cloud, security, and digital.',
    e2goal: 'Lead with a specific outcome metric (e.g., 60% reduction in security incidents, 35% cloud cost savings, 3x faster deployment cycles). Explain how MSI full-stack IT approach delivered it.',
    e3goal: 'Acknowledge silence. State you are assuming IT modernization is not a current priority and will close their file.',
    narrative: 'IT Challenge Hook to Full-Stack Outcome Metric to Loss Aversion Breakup'
  }
};"""

# Convert real newlines to \\n two-char sequences for the TS string format
new_ei_file = NEW_EI.replace('\n', '\\n')

# Replace old emailInstructions block with new one, keep const inst line
content = content[:si] + new_ei_file + EI_END + content[ei + len(EI_END):]
print('emailInstructions updated')

# ==============================================================
# STEP 2 - Remove dead code block
# if (false) { ... } else { if (serviceType) { ... } else { ... } }
# Located between rule #5 and rule #6 in the prompt builder
# ==============================================================

DEAD_START = "\\n\\nif (false) { promptLines.push('=== WORKFORCE AGILITY ===')"
RULE6      = "promptLines.push('6. SUBJECT LINE:"

sd  = content.find(DEAD_START)
er6 = content.find(RULE6, sd) if sd != -1 else -1
print(f'Dead code block: start={sd}, end={er6}')
if sd == -1 or er6 == -1:
    print('Dead code block not found — already removed, skipping')
else:
    # Remove dead code; keep one \\n separator before rule 6
    content = content[:sd] + '\\n' + content[er6:]
    print('Dead code block removed')

# ==============================================================
# Write back
# ==============================================================
with open(FNAME, 'w', encoding='utf-8') as f:
    f.write(content)

delta = len(content) - orig_len
print(f'Done!  {orig_len} -> {len(content)} chars  (delta: {delta:+d})')
