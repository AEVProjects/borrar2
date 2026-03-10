// Seed Apollo Leads TEST table with 3 test records
// Todos con email artki_64@hotmail.com, datos reales de distintas industrias
//
// Uso: node scripts/seed-test-leads.js
// (Crea la tabla automáticamente si no existe)
//
// Muestra la clasificación de sector de cada registro

const { createClient } = require('@supabase/supabase-js');
const { Client } = require('pg');

const SUPABASE_URL = 'https://vahqhxfdropstvklvzej.supabase.co';
const SUPABASE_KEY = 'sb_publishable_xt7qY64rVMowaSris2Zs0Q_2DEbzjpy';
// Supabase direct PostgreSQL connection (port 5432 for direct, 6543 for pooler)
const SUPABASE_DB_HOST = 'db.vahqhxfdropstvklvzej.supabase.co';
const SUPABASE_DB_PASSWORD = process.env.SUPABASE_DB_PASSWORD || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Misma lógica de clasificación que usa el workflow "Outbound Email Qualifier"
const INDUSTRY_SEQUENCE_MAP = {
  'financial':      'SEQ_ID_FINANCIAL',
  'banking':        'SEQ_ID_FINANCIAL',
  'insurance':      'SEQ_ID_FINANCIAL',
  'fintech':        'SEQ_ID_FINANCIAL',
  'healthcare':     'SEQ_ID_HEALTHCARE',
  'medical':        'SEQ_ID_HEALTHCARE',
  'pharma':         'SEQ_ID_HEALTHCARE',
  'biotech':        'SEQ_ID_HEALTHCARE',
  'hospital':       'SEQ_ID_HEALTHCARE',
  'retail':         'SEQ_ID_RETAIL',
  'ecommerce':      'SEQ_ID_RETAIL',
  'e-commerce':     'SEQ_ID_RETAIL',
  'consumer':       'SEQ_ID_RETAIL',
  'manufacturing':  'SEQ_ID_MANUFACTURING',
  'industrial':     'SEQ_ID_MANUFACTURING',
  'automotive':     'SEQ_ID_MANUFACTURING',
  'technology':     'SEQ_ID_TECH',
  'software':       'SEQ_ID_TECH',
  'saas':           'SEQ_ID_TECH',
  'information technology': 'SEQ_ID_TECH',
  'energy':         'SEQ_ID_ENERGY',
  'oil':            'SEQ_ID_ENERGY',
  'utilities':      'SEQ_ID_ENERGY',
  'renewable':      'SEQ_ID_ENERGY',
  'education':      'SEQ_ID_EDUCATION',
  'university':     'SEQ_ID_EDUCATION',
  'school':         'SEQ_ID_EDUCATION',
  'legal':          'SEQ_ID_LEGAL',
  'law':            'SEQ_ID_LEGAL',
  'real estate':    'SEQ_ID_REALESTATE',
  'property':       'SEQ_ID_REALESTATE',
  'construction':   'SEQ_ID_REALESTATE',
  'logistics':      'SEQ_ID_LOGISTICS',
  'transportation': 'SEQ_ID_LOGISTICS',
  'shipping':       'SEQ_ID_LOGISTICS',
  'supply chain':   'SEQ_ID_LOGISTICS',
  'telecom':        'SEQ_ID_TELECOM',
  'telecommunications': 'SEQ_ID_TELECOM'
};

const DEFAULT_SEQUENCE = 'SEQ_ID_GENERAL';

function classifyIndustry(industry) {
  const lower = (industry || '').toLowerCase();
  for (const [keyword, seqId] of Object.entries(INDUSTRY_SEQUENCE_MAP)) {
    if (lower.includes(keyword)) {
      return { sector: keyword.toUpperCase(), sequenceId: seqId };
    }
  }
  return { sector: 'GENERAL', sequenceId: DEFAULT_SEQUENCE };
}

function getCompanySize(numEmployees) {
  const employees = parseInt(numEmployees) || 0;
  if (employees > 1000) return 'enterprise';
  if (employees > 200) return 'mid-market';
  if (employees > 50) return 'growing';
  return 'emerging';
}

const TEST_LEADS = [
  {
    first_name: 'Arturo',
    last_name: 'Kinetik',
    title: 'Sr. Director of IT Operations, CISO',
    company_name: 'Swinerton',
    company_name_for_emails: 'Swinerton',
    email: 'artki_64@hotmail.com',
    email_status: 'Verified',
    seniority: 'Director',
    departments: 'C-Suite, Information Technology, Operations',
    contact_owner: 'david.osorio@msiamericas.com',
    corporate_phone: '+1 415-421-2980',
    stage: 'Cold',
    account_owner: 'david.osorio@msiamericas.com',
    num_employees: '4400',
    industry: 'construction',
    keywords: 'leed, designbuild, bim, general contractor, tenant improvements, renewable energy, commercial construction',
    website: 'https://swinerton.com',
    company_linkedin_url: 'http://www.linkedin.com/company/swinerton',
    city: 'Roseville',
    state: 'California',
    country: 'United States',
    company_city: 'Concord',
    company_state: 'California',
    company_country: 'United States',
    technologies: 'Microsoft Office 365, Workday, Slack, Procore, Salesforce CRM Analytics'
  },
  {
    first_name: 'Arturo',
    last_name: 'Kinetik',
    title: 'Chief Information Officer',
    company_name: 'HCA Healthcare',
    company_name_for_emails: 'HCA Healthcare',
    email: 'artki_64@hotmail.com',
    email_status: 'Verified',
    seniority: 'VP',
    departments: 'C-Suite, Information Technology',
    contact_owner: 'david.osorio@msiamericas.com',
    corporate_phone: '+1 615-344-9551',
    stage: 'Cold',
    account_owner: 'david.osorio@msiamericas.com',
    num_employees: '275000',
    industry: 'healthcare',
    keywords: 'hospital, health care, medical devices, patient care, clinical systems, electronic health records, telemedicine',
    website: 'https://hcahealthcare.com',
    company_linkedin_url: 'http://www.linkedin.com/company/hca-healthcare',
    city: 'Nashville',
    state: 'Tennessee',
    country: 'United States',
    company_city: 'Nashville',
    company_state: 'Tennessee',
    company_country: 'United States',
    technologies: 'Microsoft Office 365, Epic Systems, Cerner, Salesforce, AWS, Tableau, ServiceNow'
  },
  {
    first_name: 'Arturo',
    last_name: 'Kinetik',
    title: 'VP of Engineering',
    company_name: 'Northrop Grumman',
    company_name_for_emails: 'Northrop Grumman',
    email: 'artki_64@hotmail.com',
    email_status: 'Verified',
    seniority: 'Director',
    departments: 'C-Suite, Information Technology',
    contact_owner: 'david.osorio@msiamericas.com',
    corporate_phone: '+1 703-280-2900',
    stage: 'Cold',
    account_owner: 'david.osorio@msiamericas.com',
    num_employees: '97000',
    industry: 'information technology',
    keywords: 'software engineering, cybersecurity, artificial intelligence, machine learning, cloud computing, data analytics, digital transformation',
    website: 'https://northropgrumman.com',
    company_linkedin_url: 'http://www.linkedin.com/company/northrop-grumman-corporation',
    city: 'Chantilly',
    state: 'Virginia',
    country: 'United States',
    company_city: 'Falls Church',
    company_state: 'Virginia',
    company_country: 'United States',
    technologies: 'Microsoft Office 365, AWS, Azure, Kubernetes, Docker, Python, TensorFlow, Salesforce'
  }
];

async function seedTestLeads() {
  console.log('==============================================');
  console.log('  SEED: Apollo Leads TEST (3 registros)');
  console.log('  Email: artki_64@hotmail.com');
  console.log('==============================================\n');

  // Step 1: Try creating the table via pg if it doesn't exist
  console.log('Verificando si apollo_leads_test existe...');
  const { data: check, error: checkErr } = await supabase
    .from('apollo_leads_test')
    .select('id')
    .limit(1);

  if (checkErr && checkErr.message.includes('Could not find')) {
    console.log('Tabla no existe. Creándola vía SQL...\n');

    if (!SUPABASE_DB_PASSWORD) {
      console.log('============================================================');
      console.log('  La tabla apollo_leads_test NO existe en Supabase.');
      console.log('');
      console.log('  OPCIÓN 1 - Ejecuta la migración manualmente:');
      console.log('    Copia el contenido de migrations/migration-apollo-leads-test.sql');
      console.log('    y pégalo en Supabase SQL Editor:');
      console.log('    https://app.supabase.com/project/vahqhxfdropstvklvzej/sql/new');
      console.log('');
      console.log('  OPCIÓN 2 - Ejecuta con password de la DB:');
      console.log('    set SUPABASE_DB_PASSWORD=tu_password_de_supabase');
      console.log('    node scripts/seed-test-leads.js');
      console.log('============================================================');
      return;
    }

    // Create table via direct pg connection
    const pgClient = new Client({
      host: SUPABASE_DB_HOST,
      port: 5432,
      database: 'postgres',
      user: 'postgres',
      password: SUPABASE_DB_PASSWORD,
      ssl: { rejectUnauthorized: false }
    });

    try {
      await pgClient.connect();
      const fs = require('fs');
      const path = require('path');
      const migrationSQL = fs.readFileSync(
        path.join(__dirname, '..', 'migrations', 'migration-apollo-leads-test.sql'),
        'utf-8'
      );
      await pgClient.query(migrationSQL);
      console.log('Tabla apollo_leads_test creada exitosamente.\n');
    } catch (pgErr) {
      console.error('Error al crear tabla vía pg:', pgErr.message);
      console.log('\nEjecuta la migración manualmente en Supabase SQL Editor.');
      return;
    } finally {
      await pgClient.end();
    }
  } else {
    console.log('Tabla existe. Continuando...\n');
  }

  // Clear existing test data
  console.log('Limpiando tabla apollo_leads_test...');
  const { error: deleteError } = await supabase
    .from('apollo_leads_test')
    .delete()
    .neq('id', 0);
  
  if (deleteError) {
    console.error('Warning al limpiar:', deleteError.message);
    console.log('(Si la tabla no existe, ejecuta primero migration-apollo-leads-test.sql)\n');
  }

  // Insert test leads
  console.log('Insertando 3 registros de prueba...\n');
  const { data, error } = await supabase
    .from('apollo_leads_test')
    .insert(TEST_LEADS)
    .select('*');

  if (error) {
    console.error('ERROR al insertar:', error.message);
    console.log('\n** Asegúrate de haber ejecutado migration-apollo-leads-test.sql primero **');
    return;
  }

  console.log(`Insertados ${data.length} registros.\n`);

  // Show classification results
  console.log('==============================================');
  console.log('  CLASIFICACIÓN POR SECTOR (Industry Map)');
  console.log('==============================================\n');

  data.forEach((lead, i) => {
    const classification = classifyIndustry(lead.industry);
    const size = getCompanySize(lead.num_employees);

    console.log(`── Lead ${i + 1} ──────────────────────────────`);
    console.log(`  Nombre:     ${lead.first_name} ${lead.last_name}`);
    console.log(`  Email:      ${lead.email}`);
    console.log(`  Empresa:    ${lead.company_name}`);
    console.log(`  Industria:  ${lead.industry}`);
    console.log(`  ► SECTOR:   ${classification.sector}`);
    console.log(`  ► Sequence: ${classification.sequenceId}`);
    console.log(`  Tamaño:     ${size} (${lead.num_employees} empleados)`);
    console.log(`  Título:     ${lead.title}`);
    console.log(`  Status:     ${lead.email_outreach_status || 'pending'}`);
    console.log(`  ID:         ${lead.id}`);
    console.log('');
  });

  console.log('==============================================');
  console.log('  LISTO PARA INICIAR SECUENCIA');
  console.log('==============================================');
  console.log('');
  console.log('Para iniciar la secuencia de un lead, llama al webhook:');
  console.log('');
  console.log('  POST https://n8nmsi.app.n8n.cloud/webhook/msi-outbound-email');
  console.log('  Body: { "lead_id": <ID>, "table": "apollo_leads_test" }');
  console.log('');
  console.log('O desde la app, usa la tabla apollo_leads_test en vez de apollo_leads.');
  console.log('');

  // Also fetch and display to confirm
  const { data: verify } = await supabase
    .from('apollo_leads_test')
    .select('id, first_name, email, company_name, industry, email_outreach_status')
    .order('id');

  if (verify) {
    console.log('Verificación rápida de la tabla:');
    console.table(verify);
  }
}

seedTestLeads().catch(console.error);
