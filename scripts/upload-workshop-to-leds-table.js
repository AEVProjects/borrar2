// Upload Workshop.csv DIRECTLY to apollo_leads_leds (dedicated LED table)
// 1. First run migrations/migration-leads-leds.sql in Supabase SQL Editor
// 2. Then run: node scripts/upload-workshop-to-leds-table.js

const { createClient } = require('@supabase/supabase-js');
const { parse } = require('csv-parse/sync');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://vahqhxfdropstvklvzej.supabase.co';
const SUPABASE_KEY = 'sb_publishable_xt7qY64rVMowaSris2Zs0Q_2DEbzjpy';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const COLUMN_MAP = {
  'First Name': 'first_name',
  'Last Name': 'last_name',
  'Title': 'title',
  'Company Name': 'company_name',
  'Company Name for Emails': 'company_name_for_emails',
  'Email': 'email',
  'Email Status': 'email_status',
  'Primary Email Source': 'primary_email_source',
  'Primary Email Verification Source': 'primary_email_verification_source',
  'Email Confidence': 'email_confidence',
  'Primary Email Catch-all Status': 'primary_email_catch_all_status',
  'Primary Email Last Verified At': 'primary_email_last_verified_at',
  'Seniority': 'seniority',
  'Departments': 'departments',
  'Contact Owner': 'contact_owner',
  'Work Direct Phone': 'work_direct_phone',
  'Home Phone': 'home_phone',
  'Mobile Phone': 'mobile_phone',
  'Corporate Phone': 'corporate_phone',
  'Other Phone': 'other_phone',
  'Stage': 'stage',
  'Lists': 'lists',
  'Last Contacted': 'last_contacted',
  'Account Owner': 'account_owner',
  '# Employees': 'num_employees'
};

async function uploadToLedsTable() {
  // Check table exists
  const { error: checkError } = await supabase.from('apollo_leads_leds').select('id').limit(1);
  if (checkError) {
    console.error('❌ Table apollo_leads_leds does not exist yet.');
    console.error('   Please run this SQL in the Supabase SQL Editor first:');
    console.error('   → migrations/migration-leads-leds.sql');
    process.exit(1);
  }

  // Parse CSV
  const csvPath = path.join(__dirname, '..', 'Workshop.csv');
  let csvContent = fs.readFileSync(csvPath, 'utf-8');
  if (csvContent.charCodeAt(0) === 0xFEFF) csvContent = csvContent.substring(1);

  const records = parse(csvContent, {
    columns: true, skip_empty_lines: true,
    relax_quotes: true, relax_column_count: true, trim: true
  });

  console.log(`📋 Parsed ${records.length} records from Workshop.csv`);

  // Map CSV to DB columns
  const rows = records.map(row => {
    const dbRow = {};
    for (const [csv, col] of Object.entries(COLUMN_MAP)) {
      let val = row[csv] || null;
      if (val && typeof val === 'string') {
        val = val.replace(/^'+/, '').trim();
        if (val === '' || val === 'FALSO') val = null;
        if (val === 'VERDADERO') val = 'true';
      }
      dbRow[col] = val;
    }
    // Set LED batch metadata
    dbRow['batch_name'] = 'Workshop Leds';
    dbRow['stage'] = 'leds';
    return dbRow;
  });

  // Clear existing leds before re-upload
  const { error: delError } = await supabase
    .from('apollo_leads_leds')
    .delete()
    .eq('batch_name', 'Workshop Leds');
  if (delError) {
    console.warn('⚠️  Could not clear existing records:', delError.message);
  } else {
    console.log('🗑️  Cleared previous Workshop Leds records');
  }

  // Insert in batches
  let uploaded = 0, errors = 0;
  for (let i = 0; i < rows.length; i += 50) {
    const batch = rows.slice(i, i + 50);
    const { error } = await supabase.from('apollo_leads_leds').insert(batch);
    if (error) {
      console.error(`❌ Error in batch ${Math.floor(i/50)+1}:`, error.message);
      errors += batch.length;
    } else {
      uploaded += batch.length;
      console.log(`  ✅ ${uploaded}/${rows.length} uploaded`);
    }
  }

  // Also clean up from apollo_leads if they're still there
  if (errors === 0) {
    const { error: cleanupError } = await supabase
      .from('apollo_leads')
      .delete()
      .eq('stage', 'leds');
    if (!cleanupError) {
      console.log('🧹 Cleaned up stage=leds rows from apollo_leads');
    }
  }

  console.log(`
${'═'.repeat(50)}
✨ Upload Complete!
${'═'.repeat(50)}
Table:    apollo_leads_leds
Batch:    Workshop Leds
Stage:    leds
Uploaded: ${uploaded}
Errors:   ${errors}
${'═'.repeat(50)}`);
}

uploadToLedsTable();
