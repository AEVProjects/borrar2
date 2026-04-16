-- ============================================================
-- Migration: Business Lines Redesign
-- Replaces all apollo_leads_* tables with a unified system:
--   business_lines  → 5 service lines with editable context
--   msi_contexts    → General MSI Technologies context (editable)
--   lead_batches    → One record per CSV upload (linked to a business line)
--   leads           → All contacts (replaces apollo_leads, apollo_leads_leds, etc.)
--
-- Run this in Supabase SQL Editor BEFORE deploying the updated frontend.
-- ============================================================

-- ──────────────────────────────────────────────────────────────────
-- 1. DROP OLD TABLES (clean slate)
-- ──────────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS public.apollo_leads CASCADE;
DROP TABLE IF EXISTS public.apollo_leads_leds CASCADE;
DROP TABLE IF EXISTS public.apollo_leads_fintech CASCADE;
DROP TABLE IF EXISTS public.apollo_leads_test CASCADE;
DROP TABLE IF EXISTS public.lead_batches CASCADE;

-- ──────────────────────────────────────────────────────────────────
-- 2. BUSINESS LINES
-- ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.business_lines (
  id        serial PRIMARY KEY,
  name      text NOT NULL,
  slug      text UNIQUE NOT NULL,   -- 'ai', 'wfa', 'npo', 'ae', 'it'
  description text,
  context_text text,                -- editable from the UI
  color     text DEFAULT '#6366f1',
  icon      text,                   -- emoji or SVG identifier
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.business_lines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to business_lines"
  ON public.business_lines FOR ALL USING (true) WITH CHECK (true);

-- ──────────────────────────────────────────────────────────────────
-- 3. MSI GENERAL CONTEXT
-- ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.msi_contexts (
  id           serial PRIMARY KEY,
  name         text NOT NULL DEFAULT 'MSI Technologies - General Context',
  context_text text,
  updated_at   timestamptz DEFAULT now()
);

ALTER TABLE public.msi_contexts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to msi_contexts"
  ON public.msi_contexts FOR ALL USING (true) WITH CHECK (true);

-- ──────────────────────────────────────────────────────────────────
-- 4. LEAD BATCHES  (one per CSV upload)
-- ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.lead_batches (
  id               bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name             text NOT NULL,
  business_line_id int  REFERENCES public.business_lines(id) ON DELETE SET NULL,
  filename         text,
  lead_count       int DEFAULT 0,
  messages_generated int DEFAULT 0,
  status           text DEFAULT 'uploaded'
    CHECK (status IN ('uploaded','generating','ready','exported','archived')),
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lead_batches_bl ON public.lead_batches(business_line_id);

ALTER TABLE public.lead_batches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to lead_batches"
  ON public.lead_batches FOR ALL USING (true) WITH CHECK (true);

-- ──────────────────────────────────────────────────────────────────
-- 5. LEADS  (unified, replaces all apollo_leads_* tables)
-- ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.leads (
  id               bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  batch_id         bigint REFERENCES public.lead_batches(id) ON DELETE CASCADE,
  business_line_id int    REFERENCES public.business_lines(id) ON DELETE SET NULL,

  -- Contact info
  first_name       text,
  last_name        text,
  title            text,
  company_name     text,
  email            text,
  seniority        text,
  departments      text,

  -- Company info
  industry         text,
  num_employees    text,
  annual_revenue   text,
  total_funding    text,
  technologies     text,
  keywords         text,
  website          text,

  -- Location
  city             text,
  state            text,
  country          text,
  company_city     text,
  company_state    text,
  company_country  text,

  -- Social / Contact URLs
  person_linkedin_url  text,
  company_linkedin_url text,
  phone            text,

  -- AI-generated 3-email sequence
  personalized_subject1  text,
  personalized_message   text,
  personalized_subject2  text,
  personalized_followup  text,
  personalized_subject3  text,
  personalized_email3    text,
  ai_message_status      text DEFAULT 'pending'
    CHECK (ai_message_status IN ('pending','generating','generated','error')),
  ai_message_generated_at timestamptz,

  created_at       timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_leads_batch       ON public.leads(batch_id);
CREATE INDEX IF NOT EXISTS idx_leads_bl          ON public.leads(business_line_id);
CREATE INDEX IF NOT EXISTS idx_leads_email       ON public.leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_ai_status   ON public.leads(ai_message_status);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to leads"
  ON public.leads FOR ALL USING (true) WITH CHECK (true);

-- ──────────────────────────────────────────────────────────────────
-- 6. SEED: 5 BUSINESS LINES
-- ──────────────────────────────────────────────────────────────────
INSERT INTO public.business_lines (name, slug, description, context_text, color, icon) VALUES

(
  'Artificial Intelligence',
  'ai',
  'AI Discovery Workshops & strategic AI consulting for measurable ROI',
  'MSI Technologies AI Practice — AI Discovery Workshop

SERVICE OVERVIEW
The AI Discovery Workshop is a structured 4-week engagement designed to give business leaders clarity on where AI can create measurable ROI without a long-term commitment.

WORKSHOP PHASES
Phase 1 – Translate: Turn business pain points into AI opportunity candidates.
Phase 2 – Validate: Assess whether existing data and systems are AI-ready.
Phase 3 – Quantify: Build ROI estimates with real dollar projections.
Phase 4 – Define: Set scope, timeline, and success metrics for the first PoC.
Phase 5 – Align: Connect the AI roadmap to core business objectives.

DELIVERABLES
- AI Opportunity Map
- Data Feasibility Report
- ROI Projections (probability-weighted financial outcomes)
- Technical Readiness Assessment
- PoC Action Plan

IDEAL CLIENTS
Companies of 50–5000+ employees in any industry that are under pressure to adopt AI but lack a clear, risk-managed path to ROI. Decision makers are CTOs, CDOs, VPs of Technology, and C-suite leaders evaluating AI budget allocation.

VALUE PROPOSITION
Most companies waste 12–18 months on AI experiments that never reach production. The AI Discovery Workshop replaces that ambiguity with a structured 4-week sprint that surfaces the 2–3 highest-value AI opportunities, validates their feasibility against real data, and produces a board-ready business case — so leaders can make a confident next investment decision instead of guessing.',
  '#8b5cf6',
  '🤖'
),

(
  'Workforce Agility',
  'wfa',
  'Talent optimization, staff augmentation, IT outsourcing & employee upskilling',
  'MSI Technologies Workforce Agility Practice

SERVICE OVERVIEW
Workforce Agility helps organizations adapt, evolve, and excel in a rapidly changing market. MSI provides flexible human capital solutions that scale with business needs without the overhead of traditional hiring.

KEY OFFERINGS
- Expert Staff Augmentation: Rapid access to niche technical talent with a hiring satisfaction guarantee. Accelerates project delivery and fills critical skill gaps.
- IT Outsourcing Solutions: Managed IT services and dedicated teams aligned with US time zones. Cost-effective scaling without sacrificing quality or control.
- Talent Optimization: Strategic workforce planning, competency mapping, and performance frameworks to maximize existing team potential.
- Flexible Workforce Models: Project-based, contract, and hybrid models that flex with business cycles and growth phases.
- Employee Upskilling: Training programs to build future-ready capabilities in AI, cloud, cybersecurity, and digital transformation.

IDEAL CLIENTS
Mid-size to enterprise organizations experiencing rapid growth, talent shortages, high turnover, or digital transformation pressure. HR Directors, CPOs, VPs of Engineering, and COOs responsible for team scaling and workforce strategy.

VALUE PROPOSITION
Traditional hiring takes 3–6 months and locks companies into fixed costs. MSI Workforce Agility provides the right talent, on the right timeline, at the right cost — with the flexibility to scale up or down as business priorities shift. Clients gain a competitive edge by building future-ready teams faster than competitors.',
  '#10b981',
  '👥'
),

(
  'Network Planning & Optimization',
  'npo',
  'Telecom RF engineering, IoT solutions & network performance optimization',
  'MSI Technologies Network Planning & Optimization Practice

SERVICE OVERVIEW
MSI provides high-quality, cost-effective network planning, optimization, and specialized engineering services for telecommunications operators and technology infrastructure providers.

KEY OFFERINGS
- Network Optimization & Planning: Indoor and outdoor radiofrequency (RF) signal measurement, drive testing, coverage analysis, and capacity planning to improve network performance and QoE.
- IoT Solutions: Bespoke technology solutions for services involving connected devices, sensor networks, and smart infrastructure deployments.
- Specialized Engineering: Expert design, analysis, and network operation services across 2G/3G/4G/5G, Packet Core, IMS, and carrier-grade IP/MPLS networks.
- Regional Packet Core Services: End-to-end support for core network operations, configuration, and optimization.
- E-Cloud & Data Center: Network infrastructure implementation for cloud-based data center environments.

NOTABLE CLIENTS & PROJECTS
- Amdocs: 3G and 4G telecommunications network optimization
- Nokia: Regional Packet Core Service
- Juniper Networks: Data Center E-Cloud implementation
- Huawei, Ericsson, ZTE: Specialized network engineering
- Claro, Orange: Regional carrier network support

IDEAL CLIENTS
Telecommunications operators, MVNOs, neutral host providers, tower companies, and enterprises deploying private networks. Decision makers are CTOs, VPs of Network Engineering, and Directors of Network Operations.

VALUE PROPOSITION
Telecom operators face relentless pressure to improve network quality while reducing OPEX. MSI's field-proven engineering teams deliver measurable improvements in network KPIs — coverage, capacity, and reliability — faster and more cost-effectively than building internal specialized teams from scratch.',
  '#3b82f6',
  '📡'
),

(
  'Architecture, Engineering & Construction',
  'ae',
  'IT architecture, cloud infrastructure design & construction technology solutions',
  'MSI Technologies Architecture, Engineering & Construction Practice

SERVICE OVERVIEW
MSI provides strategic IT architecture, cloud infrastructure design, and technology consulting for companies in the Architecture, Engineering, and Construction (AEC) sector, as well as technology firms modernizing their own IT infrastructure.

KEY OFFERINGS
- Infrastructure Modernization: Assessment and transformation of legacy IT infrastructure using current best-in-class technologies and frameworks.
- Cloud Architecture & Migration: Design and execution of scalable, secure cloud migrations to AWS, Azure, and GCP with minimal business disruption.
- Data Management & Security: Solutions for enterprise data storage, governance, security, backup, and disaster recovery.
- IT Strategy for AEC Firms: Technology roadmaps for architecture and engineering firms adopting BIM, digital twins, IoT sensors, and AI-driven design tools.
- Executive Consulting: M&A technology due diligence, IT governance frameworks, and CTO advisory services for construction and engineering organizations.
- OpenStack & Hybrid Cloud: Private cloud design and implementation (Red Hat OpenStack, VMware).

NOTABLE CLIENTS & PROJECTS
- Red Hat: OpenStack technology services and cybersecurity
- Juniper Networks: E-Cloud Data Center implementation
- Whale Cloud: Human talent and specialized recruitment

IDEAL CLIENTS
Architecture and engineering firms, construction companies, infrastructure developers, and real estate technology platforms. Decision makers are CTOs, IT Directors, and VPs of Digital Transformation.

VALUE PROPOSITION
AEC firms face a unique convergence of physical and digital complexity. MSI bridges that gap by designing resilient, scalable IT architectures that support the demanding data, collaboration, and compliance requirements of engineering-led organizations — from project inception through operational lifecycle.',
  '#f59e0b',
  '🏗️'
),

(
  'IT Solutions',
  'it',
  'IT services, digital transformation, cloud computing & cybersecurity',
  'MSI Technologies IT Solutions Practice

SERVICE OVERVIEW
MSI''s IT Solutions practice delivers end-to-end technology services across IT infrastructure, digital transformation, cloud computing, and cybersecurity for organizations seeking to modernize operations, reduce risk, and accelerate growth.

KEY OFFERINGS

DIGITAL TRANSFORMATION
- Custom software development and application modernization
- Enterprise system integration (ERP, CRM, legacy platforms)
- API-first architecture and microservices migration
- Process automation and intelligent workflow design

CLOUD COMPUTING
- Cloud Migration: Scalable and secure migration to AWS, Azure, or GCP
- Infrastructure Modernization: Retirement of on-premises legacy systems
- Data Management: Enterprise storage, security, recovery, and backup
- FinOps: Cloud cost optimization and governance frameworks

CYBERSECURITY
- Advanced Threat Protection: Zero-trust architecture, endpoint security, SIEM
- Threat Management: 24/7 monitoring, incident response, compliance audits
- Risk Assessment: Vulnerability management and penetration testing
- Security Training: Awareness programs to build a security-first culture
- Regulatory Compliance: HIPAA, SOX, PCI-DSS, ISO 27001, NIST support

MANAGED IT SERVICES
- Help desk and NOC/SOC support
- IT outsourcing with dedicated teams aligned to US time zones
- Vendor management and technology procurement

NOTABLE CLIENTS
Red Hat (OpenStack + cybersecurity), Juniper Networks (E-Cloud), Globant, Tech Mahindra, Huawei

IDEAL CLIENTS
Mid-market to enterprise organizations across all industries facing digital transformation pressure, cybersecurity threats, or cloud migration complexity. Decision makers are CISOs, CTOs, IT Directors, VPs of Digital, and COOs.

VALUE PROPOSITION
MSI serves as a single accountable partner for the full IT stack — from cloud infrastructure to cybersecurity to custom software. Clients eliminate vendor fragmentation, reduce risk, and accelerate time-to-value by working with a team that has delivered complex IT transformations across 40+ countries.',
  '#ef4444',
  '💻'
);

-- ──────────────────────────────────────────────────────────────────
-- 7. SEED: MSI GENERAL CONTEXT
-- ──────────────────────────────────────────────────────────────────
INSERT INTO public.msi_contexts (name, context_text) VALUES (
  'MSI Technologies - General Context',
  'MSI Technologies — Corporate Profile

EXECUTIVE SUMMARY
MSI Technologies (part of MSI GROUP) is a multinational innovation and technology company focused on combining proactive service, cutting-edge technology, and top-tier talent. With over 20 years of experience, the company specializes in the comprehensive management of human capital, information systems, software, cybersecurity, and telecommunications.

KEY INDICATORS
- Experience: 20+ years leading technology projects
- Global Team: 700+ consultants and employees worldwide
- Infrastructure: 14 offices across the Americas
- Portfolio: 20+ specialized services

GLOBAL PRESENCE
Through its strategic alliance with Talentor International, MSI operates in 40+ countries:
- Americas: United States, Mexico, Colombia, Ecuador, Peru, Bolivia, Chile, Uruguay, Brazil
- Europe: 20+ countries including UK, Spain, France, Germany, Italy, Netherlands
- Middle East & Africa: Saudi Arabia, UAE, Morocco, South Africa
- Asia & Oceania: China, India, Singapore, Australia (Sydney, Melbourne, Brisbane)

BUSINESS LINES
1. Artificial Intelligence — AI Discovery Workshops, AI strategy consulting, ROI-driven PoC design
2. Workforce Agility — Staff Augmentation, IT Outsourcing, Talent Optimization, Upskilling
3. Network Planning & Optimization — Telecom RF engineering, IoT, specialized network ops
4. Architecture, Engineering & Construction — Cloud architecture, infrastructure modernization, IT for AEC firms
5. IT Solutions — Digital Transformation, Cloud Computing, Cybersecurity, Managed IT

COMPETITIVE DIFFERENTIATORS
- Operational Agility: Precision execution that lets clients focus on core strategic objectives
- Regulatory Compliance: Local support in accordance with regional regulations
- Scalable Integration: Dedicated PMs ensure seamless integration of efficient, adaptable teams
- Nearshore Advantage: US time-zone alignment with Latin American talent depth

NOTABLE CLIENTS
Amdocs, Red Hat, Nokia, Juniper Networks, Whale Cloud, iTeam, Huawei, Ericsson, ZTE, Claro, Orange, Globant, Tech Mahindra, YPFB

CONTACT
Website: www.msitechnologiesinc.com
Email: contact@msitechnologiesinc.com'
);
