# MSI Outbound via Apollo Sequences - Guía Completa

## Resumen

Todo el outreach va **100% a través de Apollo**. No se usa SMTP externo, no se envían emails fuera de Apollo. El workflow de n8n simplemente:

1. Lee el lead de Supabase
2. Determina su industria
3. Lo añade a la **secuencia de Apollo correcta** según su industria
4. Apollo se encarga de enviar toda la cadena de emails

---

## Arquitectura

```
┌────────────────────────────────────────────────────────────┐
│                    n8n Workflow                             │
│                                                            │
│  Webhook → Read Lead → Map Industry → Search/Create in     │
│  Apollo → Add to Industry Sequence → Log in Supabase       │
└────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────────────┐
│                Apollo.io Sequences                         │
│                                                            │
│  Email 1: Intro MSI + Research de industria (Día 1)        │
│  Email 2: Caso de éxito relevante (Día 4)                  │
│  Email 3: Valor + caso de uso (Día 8)                      │
│  Email 4: Cierre suave (Día 12)                            │
└────────────────────────────────────────────────────────────┘
```

---

## Paso 1: Ejecutar Migración

```sql
-- En Supabase SQL Editor, ejecuta:
-- migrations/migration-email-sequence.sql
```

## Paso 2: Crear las Secuencias en Apollo.io

Crea **12 secuencias** en Apollo (una por industria + una general). Abajo tienes los templates listos para copiar y pegar en cada secuencia.

### Obtener los IDs de las secuencias:

```bash
curl -X POST https://api.apollo.io/api/v1/emailer_campaigns/search \
  -H "Content-Type: application/json" \
  -d '{"api_key": "TU_APOLLO_MASTER_API_KEY"}'
```

### Actualizar los IDs en el workflow:

Edita el nodo **"Enrich & Map Industry Sequence"** y reemplaza los `SEQ_ID_*` con tus IDs reales.

## Paso 3: Importar Workflow en n8n

1. Import → `Outbound Email Qualifier - Supabase.json`
2. Configurar credencial **PostgreSQL** (Supabase)
3. Reemplazar `YOUR_APOLLO_MASTER_API_KEY` y `YOUR_APOLLO_EMAIL_ACCOUNT_ID` en los nodos HTTP

## Paso 4: Ejecutar

```powershell
# Un lead:
$body = @{ body = @{ lead_id = 42 } } | ConvertTo-Json -Depth 3
Invoke-RestMethod -Uri "https://n8nmsi.app.n8n.cloud/webhook/msi-outbound-email" `
  -Method POST -ContentType "application/json" -Body $body

# Batch: crea un workflow que lea leads pendientes y dispare el webhook por cada uno
```

---

## Templates de Apollo por Industria

> **Variables de Apollo disponibles**: `{{first_name}}`, `{{last_name}}`, `{{company}}`, `{{title}}`, `{{industry}}`, `{{city}}`
>
> Copia cada template en Apollo.io → Sequences → Nueva Secuencia → Pasos de Email

---

### 🏦 SECUENCIA: Financial Services / Banking

**Email 1 — Introducción + Research (Día 1)**

```
Subject: {{first_name}}, a thought on {{company}}'s technology resilience

Hi {{first_name}},

I've been following how the financial services sector is navigating an increasingly complex technology landscape — from real-time fraud detection and open banking APIs to the constant pressure of SOX and PCI-DSS compliance. It's a lot to manage, and the stakes couldn't be higher.

I wanted to introduce MSI Technologies. We're a multinational technology firm with 20+ years of experience, 700+ consultants, and 14 offices across the Americas. We've partnered with financial institutions to strengthen their cybersecurity posture, modernize legacy systems, and provide specialized talent — all while staying fully compliant with industry regulations.

Some of our work in this space includes advanced threat management, risk assessment frameworks, and secure cloud migration that keeps regulators happy.

I'd love to learn more about what {{company}} is prioritizing on the technology front. Would you be open to a brief conversation?

Best,
Alex Rodriguez
Business Development | MSI Technologies
alex@msitechnologies.com | +1 (305) 555-0199
www.msitechnologiesinc.com
```

**Email 2 — Caso de éxito relevante (Día 4)**

```
Subject: How a financial institution cut compliance costs by 40%

{{first_name}},

Quick follow-up — I wanted to share something relevant.

One of the challenges we see frequently in financial services is the tension between innovation speed and regulatory compliance. Teams want to move fast, but every change needs to pass through security reviews, compliance checks, and audit trails.

We helped a financial services client implement a cybersecurity framework that not only passed their annual audit with zero findings, but also reduced their compliance overhead by 40% — freeing their internal team to focus on strategic projects instead of checklists.

Given {{company}}'s position in the market, I think there could be a similar opportunity.

Would a 15-minute call be worth your time this week?

Alex
MSI Technologies
```

**Email 3 — Valor adicional (Día 8)**

```
Subject: Quick resource for {{company}}

Hi {{first_name}},

I know you're busy, so I'll keep this brief.

Beyond cybersecurity, MSI also supports financial institutions with:
• Cloud migration with full compliance (SOX, PCI-DSS, GDPR)
• Dedicated nearshore engineering teams (US time zones, 50-70% cost savings)
• Custom software for trading platforms, risk management, and client portals

We work with companies like Red Hat, Amdocs, and Juniper Networks on projects of this caliber.

If any of this resonates with what {{company}} needs, I'm happy to set up a quick intro call with one of our solutions architects.

Alex
```

**Email 4 — Cierre (Día 12)**

```
Subject: Last note, {{first_name}}

{{first_name}},

I don't want to clutter your inbox, so this will be my last message unless you'd like to connect.

If technology challenges come up at {{company}} — whether it's security, cloud infrastructure, or finding the right specialized talent — feel free to reach out anytime.

Wishing you and the team well.

Alex Rodriguez
alex@msitechnologies.com
MSI Technologies | 20+ years | 700+ consultants | 14 offices across the Americas
```

---

### 🏥 SECUENCIA: Healthcare / Pharma

**Email 1 — Introducción + Research (Día 1)**

```
Subject: {{first_name}}, a thought on {{company}}'s digital health strategy

Hi {{first_name}},

Healthcare technology is at a fascinating inflection point. Between HIPAA compliance demands, the shift to cloud-based EHR systems, telehealth infrastructure scaling, and the emergence of AI-assisted diagnostics — there's a lot happening, and the margin for error is essentially zero.

I wanted to introduce MSI Technologies. We're a multinational tech firm with over 20 years of experience, 700+ specialists, and 14 offices across the Americas. We've been helping healthcare organizations navigate secure cloud migrations, strengthen their cybersecurity posture, and build development teams that understand the unique compliance requirements of the health sector.

Our approach combines deep technical expertise with an understanding that in healthcare, security and reliability aren't features — they're non-negotiable.

I'd love to understand what's top of mind for {{company}} on the technology side. Would you be open to a brief conversation?

Best,
Alex Rodriguez
Business Development | MSI Technologies
alex@msitechnologies.com | +1 (305) 555-0199
www.msitechnologiesinc.com
```

**Email 2 — Relevancia (Día 4)**

```
Subject: Secure cloud migration in healthcare — what we're seeing

{{first_name}},

Quick follow-up with something I thought might be relevant.

We've been working with healthcare organizations that needed to migrate their patient data systems to the cloud without any disruption to care delivery — and without a single HIPAA violation. The key was a phased approach with continuous security auditing at every step.

The result: a fully cloud-native infrastructure that actually improved data access speed for clinicians while reducing IT maintenance costs.

Given the pace of change in healthcare tech, I imagine {{company}} might be evaluating similar initiatives. If so, I'd welcome the chance to share what's worked for others in your space.

15 minutes — happy to work around your schedule.

Alex
MSI Technologies
```

**Email 3 — Valor (Día 8)**

```
Subject: Beyond cloud: how MSI supports healthcare orgs

Hi {{first_name}},

Brief update on how we support organizations like {{company}}:

• HIPAA-compliant cloud infrastructure (AWS, Azure, GCP)
• Cybersecurity assessments tailored for healthcare
• Dedicated development teams (nearshore, US time zones)
• Custom software for patient portals, telehealth, and data analytics

We're trusted by companies like Red Hat, Nokia, and Juniper Networks for mission-critical technology projects.

If any of this aligns with what {{company}} is working on, I'd love to connect.

Alex
```

**Email 4 — Cierre (Día 12)**

```
Subject: Last note, {{first_name}}

{{first_name}},

I'll keep your inbox clean — this is my final message unless you'd like to chat.

If {{company}} ever needs support with healthcare IT — security, cloud, talent, or custom development — MSI Technologies is here.

All the best to you and the team.

Alex Rodriguez
alex@msitechnologies.com
MSI Technologies | 20+ years | 700+ consultants | 14 offices
```

---

### 🛒 SECUENCIA: Retail / E-commerce

**Email 1 — Intro + Research (Día 1)**

```
Subject: {{first_name}}, a thought on {{company}}'s tech infrastructure

Hi {{first_name}},

Retail is evolving at an incredible pace. Between omnichannel experiences, real-time inventory analytics, AI-powered personalization, and the pressure of peak seasons that can make or break the year — having the right technology foundation isn't optional anymore.

I wanted to introduce MSI Technologies. We're a multinational tech company with 20+ years of experience, 700+ consultants, and offices across the Americas. We help retail and e-commerce companies build cloud-native architectures that scale on demand, implement AI-driven customer analytics, and staff up fast with specialized engineering talent — all in US time zones.

Companies that invest in this kind of infrastructure are seeing 25-35% improvements in customer retention and operational efficiency.

I'd love to learn what {{company}} is prioritizing. Open to a quick chat?

Best,
Alex Rodriguez
Business Development | MSI Technologies
alex@msitechnologies.com | +1 (305) 555-0199
www.msitechnologiesinc.com
```

**Email 2 (Día 4)**

```
Subject: How a retail company handled 10x traffic spikes seamlessly

{{first_name}},

Quick thought — one of the biggest challenges we see in retail tech is the "peak season panic." Companies scramble to scale infrastructure in Q4, often paying premium rates and cutting corners on security.

We helped a retail client build a cloud-native architecture that auto-scales based on real-time demand — handling 10x normal traffic during their peak season without a single outage. And it actually reduced their annual cloud spend by 20%.

If {{company}} faces similar challenges, I think there's an interesting conversation to be had.

15 minutes?

Alex
MSI Technologies
```

**Email 3 (Día 8)**

```
Subject: Quick resource for {{company}}'s tech team

Hi {{first_name}},

Besides cloud architecture, here's how MSI supports retail/e-commerce:

• AI & data analytics for customer behavior and inventory optimization
• Staff augmentation with e-commerce developers (Shopify, Magento, custom)
• Cybersecurity for payment systems and customer data (PCI-DSS)
• System integration across ERP, CRM, and inventory platforms

Clients like Amdocs, Nokia, and Globant trust us for large-scale tech projects.

Worth a conversation?

Alex
```

**Email 4 — Cierre (Día 12)**

```
Subject: Last note, {{first_name}}

{{first_name}},

This is my final email unless you'd like to connect. If {{company}} ever needs technology support — cloud scaling, AI analytics, talent, or security — MSI Technologies is here.

Wishing you a great quarter ahead.

Alex Rodriguez
alex@msitechnologies.com
MSI Technologies | 20+ years | 14 offices | 700+ specialists
```

---

### 🏭 SECUENCIA: Manufacturing / Industrial

**Email 1 — Intro + Research (Día 1)**

```
Subject: {{first_name}}, a thought on {{company}}'s digital factory strategy

Hi {{first_name}},

Manufacturing is in the middle of a significant technology shift. IoT sensors, predictive maintenance, smart factory platforms, and the convergence of OT and IT environments are creating enormous opportunities — but also real cybersecurity risks that most traditional IT teams aren't equipped to handle.

I wanted to introduce MSI Technologies. We're a multinational technology company with over 20 years of experience, 700+ consultants, and 14 offices across the Americas. We work with manufacturing companies to integrate IoT and data analytics into production environments, secure OT/IT infrastructure, and provide specialized engineering talent for Industry 4.0 initiatives.

Companies that take this approach are seeing 20-30% reductions in downtime and significantly lower risk of operational disruptions.

I'd love to learn what {{company}} is working on. Quick call this week?

Best,
Alex Rodriguez
Business Development | MSI Technologies
alex@msitechnologies.com | +1 (305) 555-0199
www.msitechnologiesinc.com
```

**Email 2 (Día 4)**

```
Subject: OT/IT convergence — the hidden risk in manufacturing

{{first_name}},

One challenge we see across manufacturing: companies invest heavily in IoT and smart factory tech, but leave a gap between their operational technology (OT) and IT security. That gap is where attacks happen.

We helped a manufacturing client achieve full OT/IT convergence with a security framework that reduced unplanned downtime by 30% and eliminated their biggest attack surface — all without disrupting production.

If {{company}} is navigating similar territory, I think there's a valuable conversation to be had.

Alex
MSI Technologies
```

**Email 3 (Día 8)**

```
Subject: How MSI supports manufacturing innovation

Hi {{first_name}},

Quick overview of what we do for manufacturing:

• IoT integration and predictive maintenance platforms
• OT/IT cybersecurity (SCADA, PLC, network segmentation)
• Nearshore engineering teams for custom manufacturing software
• Cloud migration for ERP, MES, and supply chain systems

We work with Ericsson, Nokia, and Huawei on complex technical implementations.

If any of this aligns with {{company}}'s roadmap, I'd welcome the conversation.

Alex
```

**Email 4 — Cierre (Día 12)**

```
Subject: Last note, {{first_name}}

{{first_name}},

Final message from me. If {{company}} ever needs technology support — IoT, security, cloud, or talent — MSI Technologies has 20+ years of manufacturing experience.

Wishing you and the team well.

Alex Rodriguez
alex@msitechnologies.com
```

---

### 💻 SECUENCIA: Technology / SaaS

**Email 1 — Intro + Research (Día 1)**

```
Subject: {{first_name}}, scaling {{company}}'s engineering team?

Hi {{first_name}},

Tech companies scaling rapidly often hit two walls at the same time: infrastructure bottlenecks and talent gaps. With nearshore engineering demand up 300% since 2022, finding specialized developers in your timezone at a reasonable cost has become a real competitive advantage.

I'm reaching out from MSI Technologies — we're a multinational tech firm with 20+ years of experience, 700+ consultants, and 14 offices across the Americas. We specialize in providing dedicated engineering teams (nearshore, US time zones) for software development, DevOps, cloud infrastructure, and cybersecurity.

Unlike typical staffing firms, we're a technology company ourselves. We work with companies like Red Hat on OpenStack services, Nokia on packet core systems, and iTeam on custom software development. Our engineers are embedded in real tech — not just resumes.

I'd love to understand {{company}}'s scaling challenges. Would 15 minutes make sense?

Best,
Alex Rodriguez
Business Development | MSI Technologies
alex@msitechnologies.com | +1 (305) 555-0199
www.msitechnologiesinc.com
```

**Email 2 (Día 4)**

```
Subject: Why tech companies choose MSI over traditional staffing

{{first_name}},

Quick context on why SaaS and tech companies work with us:

Traditional staffing firms send resumes. MSI sends engineers who've worked on telecom packet core systems, cloud infrastructure for enterprise clients, and cybersecurity for financial institutions. There's a meaningful difference.

We provide:
• Dedicated teams (not freelancers) aligned to US time zones
• Full-stack, DevOps, cloud, security, and data specialists
• A hiring satisfaction guarantee
• Project managers who ensure seamless integration with your existing team

If {{company}} is growing and needs to scale engineering without the hiring overhead, I think it's worth a conversation.

Alex
MSI Technologies
```

**Email 3 (Día 8)**

```
Subject: Beyond talent: MSI's full tech stack for {{company}}

Hi {{first_name}},

Besides talent, here's the full picture:

• Custom software development & API integration
• Cloud infrastructure (AWS, Azure, GCP) — architecture, migration, optimization
• Cybersecurity (penetration testing, compliance, SOC)
• Telecommunications & network engineering

Trusted by: Red Hat, Nokia, Juniper Networks, Huawei, Amdocs, Globant.

If {{company}} needs any of this, I'm here to connect you with the right team.

Alex
```

**Email 4 — Cierre (Día 12)**

```
Subject: Last note, {{first_name}}

{{first_name}},

Last email from me. If {{company}} ever needs engineering talent, cloud infrastructure, or cybersecurity support — MSI Technologies has been doing this for 20+ years across 14 offices.

Best of luck with everything you're building.

Alex Rodriguez
alex@msitechnologies.com
```

---

### ⚡ SECUENCIA: Energy / Utilities

**Email 1 — Intro + Research (Día 1)**

```
Subject: {{first_name}}, a thought on critical infrastructure security at {{company}}

Hi {{first_name}},

The energy sector is facing a unique technology challenge: modernizing infrastructure that runs on legacy systems while protecting it from increasingly sophisticated cyber threats. After the high-profile attacks on energy infrastructure in recent years, SCADA security and smart grid resilience have become board-level priorities.

I wanted to introduce MSI Technologies. We're a multinational technology firm with 20+ years of experience, 700+ consultants, and offices across the Americas. We specialize in cybersecurity for critical infrastructure, network engineering, and cloud solutions tailored for energy and utilities companies.

Our telecommunications heritage means we deeply understand operational networks — not just IT networks — which is where most security vendors fall short.

I'd love to hear what's on {{company}}'s technology agenda. Quick call?

Best,
Alex Rodriguez
Business Development | MSI Technologies
alex@msitechnologies.com | +1 (305) 555-0199
www.msitechnologiesinc.com
```

**Email 2 (Día 4)**

```
Subject: SCADA security — what energy companies are getting wrong

{{first_name}},

One pattern we see: energy companies invest in IT cybersecurity (firewalls, endpoint protection) but leave their OT environment — SCADA, PLCs, RTUs — with minimal protection. Attackers know this.

We helped an energy client implement network segmentation between IT and OT, deploy continuous SCADA monitoring, and train operational staff on security protocols. The result: full visibility into their critical infrastructure with zero disruption to operations.

If {{company}} is evaluating its OT security posture, I think there's a conversation worth having.

Alex
MSI Technologies
```

**Email 3 (Día 8)** / **Email 4 — Cierre (Día 12)**: mismo patrón que las anteriores, adaptando servicios a energy utilities.

---

### 🏫 SECUENCIA: Education

**Email 1 — Intro + Research (Día 1)**

```
Subject: {{first_name}}, modernizing {{company}}'s tech infrastructure?

Hi {{first_name}},

Educational institutions are navigating a challenging balance: digital transformation on tight budgets. Between cloud-based learning platforms, hybrid classroom infrastructure, student data protection regulations, and the constant need to do more with less — technology decisions have never been more important.

I wanted to introduce MSI Technologies. We're a multinational tech company with 20+ years of experience and 700+ consultants. We help educational institutions migrate to the cloud securely, protect student data, and access specialized IT talent at nearshore rates that fit education budgets.

We believe every institution deserves enterprise-grade technology without enterprise-grade pricing.

Would you be open to a brief conversation about {{company}}'s technology priorities?

Best,
Alex Rodriguez
Business Development | MSI Technologies
alex@msitechnologies.com | +1 (305) 555-0199
www.msitechnologiesinc.com
```

(Emails 2-4: Follow-up con LMS cloud migration, student data security, nearshore development teams para portales educativos, cierre.)

---

### ⚖️ SECUENCIA: Legal

**Email 1 — Intro + Research (Día 1)**

```
Subject: {{first_name}}, technology and confidentiality at {{company}}

Hi {{first_name}},

Law firms and legal departments are increasingly adopting cloud-based practice management, AI-powered document review, and case analytics — but client confidentiality and attorney-client privilege create unique requirements that most generic tech solutions don't address.

I wanted to introduce MSI Technologies — a multinational firm with 20+ years of experience, 700+ consultants, and 14 offices across the Americas. We help legal organizations implement secure cloud infrastructure, cybersecurity frameworks tailored for confidential data, and custom software for case management and document automation.

We understand that in legal, a data breach isn't just an IT problem — it's a malpractice risk.

Would you be open to a quick conversation about {{company}}'s technology needs?

Best,
Alex Rodriguez
Business Development | MSI Technologies
alex@msitechnologies.com | +1 (305) 555-0199
www.msitechnologiesinc.com
```

(Emails 2-4: Cloud practice management, document automation, cybersecurity para client data, cierre.)

---

### 🏗️ SECUENCIA: Real Estate / Construction

**Email 1 — Intro + Research (Día 1)**

```
Subject: {{first_name}}, digital transformation at {{company}}

Hi {{first_name}},

The real estate and construction industry is at a turning point. PropTech solutions, BIM, data-driven project management, and smart building systems are creating a massive competitive advantage for companies that embrace digital transformation — in an industry that's traditionally been slower to adopt technology.

I wanted to introduce MSI Technologies. We're a multinational tech firm with 20+ years of experience, 700+ consultants, and 14 offices across the Americas. We help real estate and construction companies digitize operations, integrate project management platforms, and build custom solutions that connect field teams with back-office systems.

I'd love to learn what {{company}} is working on. Quick chat this week?

Best,
Alex Rodriguez
Business Development | MSI Technologies
alex@msitechnologies.com | +1 (305) 555-0199
www.msitechnologiesinc.com
```

(Emails 2-4: BIM integration, project management dashboards, nearshore developers, cierre.)

---

### 🚚 SECUENCIA: Logistics / Transport

**Email 1 — Intro + Research (Día 1)**

```
Subject: {{first_name}}, optimizing {{company}}'s supply chain technology

Hi {{first_name}},

Supply chain and logistics technology is being revolutionized by real-time tracking, AI-powered route optimization, and predictive analytics. Companies investing in integrated technology platforms are reducing delivery times by 15-25% and cutting operational costs significantly.

I wanted to introduce MSI Technologies — a multinational tech firm with 20+ years of experience, 700+ consultants, and operations across the Americas. We help logistics companies build real-time tracking systems, implement AI for route and inventory optimization, and integrate disparate systems (TMS, WMS, ERP) into unified platforms.

Interested in a quick conversation about {{company}}'s tech roadmap?

Best,
Alex Rodriguez
Business Development | MSI Technologies
alex@msitechnologies.com | +1 (305) 555-0199
www.msitechnologiesinc.com
```

(Emails 2-4: supply chain visibility case study, system integration, nearshore development, cierre.)

---

### 📡 SECUENCIA: Telecom

**Email 1 — Intro + Research (Día 1)**

```
Subject: {{first_name}}, MSI's telecom heritage + how we can help {{company}}

Hi {{first_name}},

Telecom is in our DNA. MSI Technologies was born in the telecommunications industry, and we've spent 20+ years working with companies like Nokia, Amdocs, Ericsson, and Huawei on network optimization, packet core services, and infrastructure deployment.

With 700+ consultants and 14 offices across the Americas, we specialize in:
• RF engineering (indoor/outdoor signal measurements)
• Network planning and optimization (3G, 4G, 5G)
• IoT solutions for connected devices
• Cybersecurity for telecom infrastructure

I believe there's natural synergy with what {{company}} is doing. Would you be open to a brief conversation?

Best,
Alex Rodriguez
Business Development | MSI Technologies
alex@msitechnologies.com | +1 (305) 555-0199
www.msitechnologiesinc.com
```

(Emails 2-4: Nokia/Amdocs case studies, 5G readiness, nearshore telecom engineering, cierre.)

---

### 🌐 SECUENCIA: General (Default)

**Email 1 — Intro + Research (Día 1)**

```
Subject: {{first_name}}, a quick introduction from MSI Technologies

Hi {{first_name}},

I wanted to take a moment to introduce MSI Technologies. We're a multinational innovation and technology company with over 20 years of experience, 700+ consultants, and 14 offices across the Americas. Through our global alliance with Talentor International, we operate in 40+ countries.

We help companies like {{company}} with a range of technology challenges:

• **Cloud Computing** — Infrastructure modernization, migration, and data management
• **Cybersecurity** — Advanced threat protection, compliance, and risk assessment
• **Talent Management** — Expert staff augmentation, dedicated nearshore teams (US time zones)
• **Software Development** — Custom applications, system integration, API development
• **Telecommunications** — Network optimization, IoT, specialized engineering

Our clients include Nokia, Red Hat, Amdocs, Juniper Networks, Ericsson, and Huawei.

I'd love to understand what's on {{company}}'s technology agenda. Would a brief conversation make sense?

Best,
Alex Rodriguez
Business Development | MSI Technologies
alex@msitechnologies.com | +1 (305) 555-0199
www.msitechnologiesinc.com
```

**Email 2 (Día 4)**

```
Subject: Why companies choose MSI Technologies

{{first_name}},

Quick follow-up with a bit more context on why companies work with us:

• **20+ years** of experience across the Americas
• **700+ consultants** with deep specializations
• **14 offices** — we're not a remote-only agency, we have real local presence
• **Nearshore advantage** — US time zone alignment with significant cost savings
• **Global reach** — through Talentor International, we operate in 40+ countries

Whether it's a cloud migration project, a cybersecurity assessment, or scaling your engineering team — we bring both the expertise and the operational agility to deliver.

Worth 15 minutes to explore if there's a fit?

Alex
MSI Technologies
```

**Email 3 (Día 8)**

```
Subject: A few names you might recognize

Hi {{first_name}},

Just wanted to share some of the companies that trust MSI Technologies:

• Nokia — Regional Packet Core Services
• Red Hat — OpenStack + Cybersecurity
• Amdocs — 3G/4G network optimization
• Juniper Networks — Data Center implementation
• Whale Cloud — Talent services

If {{company}} is evaluating technology partners, I'd love to be part of that conversation.

Alex
```

**Email 4 — Cierre (Día 12)**

```
Subject: Last note, {{first_name}}

{{first_name}},

This is my last email. If technology challenges arise at {{company}} — cloud, security, talent, software, telecom — MSI Technologies is here with 20+ years of experience.

All the best.

Alex Rodriguez
alex@msitechnologies.com | www.msitechnologiesinc.com
```

---

## Monitoreo

```sql
-- Leads en secuencias activas:
SELECT first_name, last_name, company_name, industry, email,
       email_outreach_status, apollo_sequence_status, email_suggested_service,
       apollo_sequence_added_at
FROM apollo_leads
WHERE apollo_sequence_status = 'active'
ORDER BY apollo_sequence_added_at DESC;

-- Resumen por industria:
SELECT email_suggested_service, COUNT(*) as total
FROM apollo_leads
WHERE apollo_sequence_status = 'active'
GROUP BY email_suggested_service
ORDER BY total DESC;
```

---

## Mapeo de Industria → Secuencia

| Industria del Lead                     | Secuencia en Apollo |
| -------------------------------------- | ------------------- |
| Financial, Banking, Insurance, Fintech | Financial Services  |
| Healthcare, Medical, Pharma, Biotech   | Healthcare          |
| Retail, E-commerce, Consumer           | Retail              |
| Manufacturing, Industrial, Automotive  | Manufacturing       |
| Technology, Software, SaaS, IT         | Technology          |
| Energy, Oil, Utilities, Renewable      | Energy              |
| Education, University, School          | Education           |
| Legal, Law                             | Legal               |
| Real Estate, Property, Construction    | Real Estate         |
| Logistics, Transportation, Shipping    | Logistics           |
| Telecom, Telecommunications            | Telecom             |
| Cualquier otra                         | General (default)   |
