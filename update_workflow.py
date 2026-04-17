import re

wf_path = r'workflows\n8nmsi_cloud_n8n_m\personal\MSI AI Message Generator.workflow.ts'
with open(wf_path, 'r', encoding='utf-8') as f: text = f.read()

offers = {
    'ai': 'MSI AI Discovery Workshop: 4-week structured engagement. Phases: 1-Translate (pain→AI opportunity), 2-Validate (data readiness), 3-Quantify (ROI projections), 4-Define (PoC scope+timeline), 5-Align (roadmap↔business goals). Deliverables: AI Opportunity Map, Data Feasibility Report, ROI Projections, action plan.',
    'wfa': 'MSI Workforce Agility: Talent Optimization, Flexible Workforce models, Employee Upskilling, Expert Staff Augmentation (hiring satisfaction guarantee), IT Outsourcing with dedicated US-timezone teams.',
    'npo': 'MSI Network Planning & Optimization: indoor/outdoor RF signal measurement, IoT connected device solutions, 2G/3G/4G/5G engineering, Packet Core optimization, E-Cloud data center networking.',
    'ae': 'MSI Architecture, Engineering & Construction IT: infrastructure modernization, cloud architecture & migration (AWS/Azure/GCP), data management, IT strategy for AEC firms, OpenStack/hybrid cloud.',
    'it': 'MSI IT Solutions: Digital Transformation, Cloud Computing (migration/FinOps), Cybersecurity (zero-trust/SIEM/compliance), Managed IT Services. Single accountable partner.'
}

for k, v in offers.items():
    esc_v = v.replace("'", "\\'")
    pattern = r"(\b" + k + r"\b:\s*\{\s*offer:\s*')[^']+(')"
    text = re.sub(pattern, r"\g<1>" + esc_v + r"\g<2>", text)

with open(wf_path, 'w', encoding='utf-8') as f:
    f.write(text)
print("Updated emailInstructions in workflow ts file.")
