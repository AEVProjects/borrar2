-- ============================================================
-- Fix / Seed: Business Lines & MSI Context (safe upsert)
-- Run this if business lines are not showing in the app.
-- Uses ON CONFLICT DO UPDATE so it is safe to run multiple times.
-- ============================================================

-- Ensure policies don't block (drop + recreate safely)
DO $$ BEGIN
  DROP POLICY IF EXISTS "Allow all access to business_lines" ON public.business_lines;
  DROP POLICY IF EXISTS "Allow all access to msi_contexts" ON public.msi_contexts;
  DROP POLICY IF EXISTS "Allow all access to lead_batches" ON public.lead_batches;
  DROP POLICY IF EXISTS "Allow all access to leads" ON public.leads;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

ALTER TABLE IF EXISTS public.business_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.msi_contexts   ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.lead_batches   ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.leads          ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to business_lines" ON public.business_lines FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to msi_contexts"   ON public.msi_contexts   FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to lead_batches"   ON public.lead_batches   FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to leads"          ON public.leads          FOR ALL USING (true) WITH CHECK (true);

-- ──────────────────────────────────────────────────────────────────
-- Upsert 5 business lines
-- ──────────────────────────────────────────────────────────────────
INSERT INTO public.business_lines (name, slug, description, context_text, color, icon) VALUES

(
  'AI & Smart Business',
  'ai',
  'AI automation, data-driven insights & custom AI solutions for measurable business performance',
  'MSI Technologies AI & Smart Business Practice

SERVICE OVERVIEW
This service focuses on innovating, automating, and elevating business performance. MSI uses AI and automation to optimize processes, drive innovation, and create smarter, more efficient businesses.

KEY OFFERINGS
- Intelligent Automation: Streamlining repetitive processes to free up operational capacity and reduce human error.
- Data-Driven Insights: Leveraging data for better and faster decision-making across all business functions.
- Custom AI Solutions: Tailored artificial intelligence applications designed for specific business needs and challenges.

IDEAL CLIENTS
Companies of any size under pressure to improve operational efficiency, leverage their data more effectively, or build AI-powered capabilities. Decision makers are CTOs, CDOs, VPs of Operations, and C-suite leaders evaluating AI and automation ROI.

VALUE PROPOSITION
MSI combines AI expertise and automation tools to optimize operations, drive innovation, and build smarter businesses — delivering measurable performance improvements without the complexity of large-scale transformation programs.',
  '#8b5cf6',
  '🤖'
),

(
  'Workforce Agility',
  'wfa',
  'Talent optimization, flexible workforce models & employee upskilling for a future-ready organization',
  'MSI Technologies Workforce Agility Practice

SERVICE OVERVIEW
Aimed at helping companies adapt, evolve, and excel in a changing market. This service focuses on building a future-ready workforce by fostering adaptability, innovation, and efficiency.

KEY OFFERINGS
- Talent Optimization: Ensuring the right talent is utilized effectively through strategic workforce planning and competency mapping.
- Flexible Workforce: Creating adaptable staffing models (project-based, contract, hybrid) to meet changing business demands and growth cycles.
- Employee Upskilling: Training and developing current staff to meet future challenges in AI, cloud, cybersecurity, and digital transformation.
- Expert Staff Augmentation: Rapid access to niche technical talent with a hiring satisfaction guarantee. Accelerates project delivery and fills critical skill gaps.
- IT Outsourcing Solutions: Managed IT services and dedicated teams aligned with US time zones. Cost-effective scaling without sacrificing quality or control.

IDEAL CLIENTS
Mid-size to enterprise organizations experiencing rapid growth, talent shortages, high turnover, or digital transformation pressure. HR Directors, CPOs, VPs of Engineering, and COOs responsible for team scaling and workforce strategy.

VALUE PROPOSITION
Traditional hiring takes 3-6 months and locks companies into fixed costs. MSI Workforce Agility provides the right talent, on the right timeline, at the right cost — with the flexibility to scale up or down as business priorities shift.',
  '#10b981',
  '👥'
),

(
  'Network Performance Optimization',
  'npo',
  'Elite network efficiency using cost-effective nearshore LATAM engineering talent aligned to U.S. hours',
  'MSI Technologies Network Performance Optimization Practice

SERVICE OVERVIEW
Provides elite network efficiency enhancement using cost-effective nearshore engineering talent from Latin America (LATAM). Companies save on delivery costs while working in real-time with teams aligned to U.S. business hours.

KEY OFFERINGS
- Root Cause Analysis: Identifying the drivers of network performance issues with precision.
- Optimization Recommendations: Coverage assessments including indoor and outdoor radio frequency (RF) measurements, from single floors to high-rise structures.
- Implementation & Validation Support: Hands-on support to deploy network changes and validate results.
- Multi-vendor Log Processing: Unified processing across multiple vendor technologies and platforms.
- Customized Reporting: Tailored reporting to vendor or operator requirements and formats.
- Thematic Analysis & KPI Correlation: Visual insights linking KPIs to real network performance data.

IDEAL CLIENTS
Telecommunications operators, MVNOs, neutral host providers, tower companies, and enterprises deploying private networks. Decision makers are CTOs, VPs of Network Engineering, and Directors of Network Operations.

VALUE PROPOSITION
Telecom operators face relentless pressure to improve network quality while reducing OPEX. MSI provides elite NPO services at 30-50% lower cost than on-site alternatives, with LATAM engineers delivering in real-time alignment with U.S. business hours.',
  '#3b82f6',
  '📡'
),

(
  'Architecture & Engineering Solutions',
  'ae',
  'Rapid A&E team scaling with nearshore MEP, BIM, civil & structural talent aligned to U.S. standards',
  'MSI Technologies Architecture & Engineering Solutions Practice

SERVICE OVERVIEW
Enables businesses to rapidly scale their teams with specialized, nearshore A&E talent. This service ensures compliant, high-quality projects are delivered on time, within budget, and aligned to U.S. standards while reducing overhead costs.

KEY CAPABILITIES & PROCESS

Team Deployment
Scaling MEP (Mechanical, Electrical, Plumbing), BIM (Building Information Modeling), civil, and structural support teams with specialized nearshore engineers integrated into existing project workflows.

Phase 1 - Problem Mapping
Business deep dives, needs assessments, opportunity mapping, solution planning, and partnership kickoff to align on project scope, standards, and team expectations.

Phase 2 - Strategy & Action
Developing customized A&E strategies, deploying nearshore engineers integrated with existing teams, managing project delivery, and conducting ongoing review and expansion as needed.

IDEAL CLIENTS
Architecture and engineering firms, construction companies, infrastructure developers, and real estate technology platforms. Decision makers are CTOs, IT Directors, VPs of Engineering, and Project Managers.

VALUE PROPOSITION
AEC firms face persistent challenges in sourcing specialized talent on demand while controlling costs. MSI bridges that gap with nearshore A&E specialists who meet U.S. standards, reduce project overhead by 30-40%, and integrate seamlessly with existing project teams.',
  '#f59e0b',
  '🏗️'
),

(
  'IT Solutions',
  'it',
  'IT outsourcing, cloud computing, cybersecurity & digital strategy — full-stack IT partner',
  'MSI Technologies IT Solutions Practice

SERVICE OVERVIEW
A comprehensive suite of technology services designed to provide scalable infrastructure, robust security, and access to top IT talent. MSI serves as a single accountable partner for the full IT stack.

KEY OFFERINGS

IT OUTSOURCING
Access to top IT talent aligned with U.S. time zones to optimize operations. Includes Managed IT Services, Dedicated IT Teams, and Cost-Effective Scaling with teams that match your business hours and culture.

CLOUD COMPUTING
Scalable, secure, and cost-effective IT infrastructure. Key pillars include Infrastructure Modernization (retiring on-premises legacy systems), Cloud Migration (to AWS, Azure, or GCP), Data Storage & Security, and Recovery & Backup solutions.

CYBERSECURITY SOLUTIONS
Preventing, protecting, and detecting evolving cyber threats. Services include Advanced Threat Detection (zero-trust architecture, endpoint security, SIEM), Compliance and Risk Management (HIPAA, SOX, PCI-DSS, ISO 27001, NIST), and Security Awareness Training to foster a security-first culture.

DIGITAL & STRATEGY
Navigating technological complexity through IT strategy consulting, M&A technology due diligence and guidance, and custom software development and application modernization.

IDEAL CLIENTS
Mid-market to enterprise organizations across all industries facing digital transformation pressure, cybersecurity threats, or cloud migration complexity. Decision makers are CISOs, CTOs, IT Directors, VPs of Digital, and COOs.

VALUE PROPOSITION
MSI serves as a single accountable partner for the full IT stack — from cloud infrastructure to cybersecurity to custom software. Clients eliminate vendor fragmentation, reduce risk, and accelerate time-to-value by working with a team that has delivered complex IT transformations across 40+ countries.',
  '#ef4444',
  '💻'
)

ON CONFLICT (slug) DO UPDATE SET
  name        = EXCLUDED.name,
  description = EXCLUDED.description,
  context_text = EXCLUDED.context_text,
  color       = EXCLUDED.color,
  icon        = EXCLUDED.icon,
  updated_at  = now();

-- ──────────────────────────────────────────────────────────────────
-- Upsert MSI general context
-- ──────────────────────────────────────────────────────────────────
INSERT INTO public.msi_contexts (id, name, context_text) VALUES (
  1,
  'MSI Technologies - General Context',
  'MSI Technologies is a global technology services company headquartered in Miami, FL, with operations across 40+ countries. Founded with the mission to bridge talent and technology gaps for businesses navigating digital transformation, MSI delivers specialized services across five core business lines: AI & Smart Business, Workforce Agility, Network Performance Optimization, Architecture & Engineering Solutions, and IT Solutions.

COMPANY OVERVIEW
MSI Technologies empowers organizations to innovate, scale, and compete by combining elite technical talent, nearshore delivery models, and deep domain expertise. MSI operates at the intersection of people and technology, providing clients with the agility to respond to market demands while reducing operational costs.

CORE DIFFERENTIATORS
- Nearshore LATAM Talent: Cost-effective engineering and technical talent aligned to U.S. business hours, providing real-time collaboration without offshore communication barriers.
- Multi-Domain Expertise: Cross-functional capabilities spanning AI, telecom, A&E, workforce, and full-stack IT — enabling MSI to serve as a single strategic partner.
- Proven Global Delivery: Delivered complex technology transformations across 40+ countries for telecom operators, enterprises, AEC firms, and government agencies.
- Flexible Engagement Models: Project-based, staff augmentation, managed services, and dedicated teams — structured to match client budget cycles and growth stages.

KEY INDUSTRIES SERVED
Telecommunications, Architecture & Engineering, Financial Services, Healthcare, Energy, Government, Real Estate Technology, and General Enterprise.

GEOGRAPHIC REACH
Headquartered in Miami, FL. Delivery centers and talent networks across Latin America (Colombia, Mexico, Brazil, Argentina, Peru), with clients spanning North America, Europe, and Asia-Pacific.'
)
ON CONFLICT (id) DO UPDATE SET
  context_text = EXCLUDED.context_text,
  updated_at   = now();
